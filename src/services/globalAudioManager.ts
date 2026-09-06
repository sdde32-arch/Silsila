/**
 * Global Audio Manager & Singleton Audio Coordinator
 * Ensures strictly ONE audio stream (HTML5 Audio, Web Audio, or SpeechSynthesis)
 * plays at any given time across the entire application.
 */

type AudioEventListener = (event: { action: 'play' | 'stop' | 'pause'; id: string }) => void;

class GlobalAudioManager {
  private activeAudios = new Map<HTMLAudioElement, string>();
  private elementStopCallbacks = new Map<HTMLAudioElement, () => void>();
  private customStopCallbacks = new Map<string, () => void>();
  private listeners = new Set<AudioEventListener>();
  private activeAudioContexts = new Set<AudioContext>();
  private isInterceptionInitialized = false;

  constructor() {
    this.initGlobalInterceptors();
  }

  private initGlobalInterceptors(): void {
    if (typeof window === 'undefined' || this.isInterceptionInitialized) return;
    this.isInterceptionInitialized = true;

    // 1. Capture-phase 'play' event listener on document
    // Any <audio> element that begins playing will immediately stop all other audios
    try {
      document.addEventListener(
        'play',
        (event) => {
          const target = event.target;
          if (target instanceof HTMLMediaElement) {
            this.stopAll(undefined, target as HTMLAudioElement);
            const knownId = this.activeAudios.get(target as HTMLAudioElement) || 'media-player';
            this.notifyListeners({ action: 'play', id: knownId });
          }
        },
        true // capture phase: guaranteed first responder
      );
    } catch (err) {
      console.warn('[GlobalAudioManager] Failed to attach capture play listener:', err);
    }

    // 2. Monkey-patch HTMLMediaElement.prototype.play
    // Guarantees that any audio.play() call immediately stops any existing audio BEFORE playback starts
    try {
      const originalPlay = HTMLMediaElement.prototype.play;
      const manager = this;
      HTMLMediaElement.prototype.play = function (this: HTMLMediaElement, ...args: any[]) {
        try {
          manager.stopAll(undefined, this as HTMLAudioElement);
        } catch (err) {
          console.warn('[GlobalAudioManager] Error in play interception:', err);
        }
        return originalPlay.apply(this, args);
      };
    } catch (err) {
      console.warn('[GlobalAudioManager] Failed to patch HTMLMediaElement.play:', err);
    }
  }

  /**
   * Stop all currently playing audio streams, synthesizers, and SpeechSynthesis across the app.
   * @param exceptId Optional ID of the audio stream that should NOT be stopped.
   * @param exceptAudio Optional HTMLAudioElement that should NOT be stopped.
   */
  public stopAll(exceptId?: string, exceptAudio?: HTMLAudioElement): void {
    // 1. Pause all registered HTMLAudioElements EXCEPT the one initiating playback
    this.activeAudios.forEach((id, audio) => {
      if (audio === exceptAudio) {
        return;
      }
      try {
        if (!audio.paused) {
          audio.pause();
        }
      } catch (err) {
        console.warn('[GlobalAudioManager] Error pausing registered audio element:', err);
      }

      // Invoke element stop callback if registered
      const callback = this.elementStopCallbacks.get(audio);
      if (callback) {
        try {
          callback();
        } catch (cbErr) {
          console.warn('[GlobalAudioManager] Error in element stop callback:', cbErr);
        }
      }
    });

    // 2. Query any other audio elements in the DOM to ensure complete silence
    if (typeof document !== 'undefined') {
      try {
        const domAudios = document.querySelectorAll('audio, video');
        domAudios.forEach((el) => {
          const media = el as HTMLMediaElement;
          if (media !== exceptAudio && !media.paused) {
            try {
              media.pause();
            } catch {}
          }
        });
      } catch {}
    }

    // 3. Execute custom stop callbacks (for non-audio element players, TTS, etc.)
    this.customStopCallbacks.forEach((stopFn, id) => {
      if (id !== exceptId) {
        try {
          stopFn();
        } catch (err) {
          console.warn('[GlobalAudioManager] Error in custom stop callback for id:', id, err);
        }
      }
    });

    // 4. Cancel any active Web Speech API utterance unless initiated by speech synthesis itself
    if (exceptId !== 'speech-synthesis' && typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch (err) {
        console.warn('[GlobalAudioManager] Error canceling speechSynthesis:', err);
      }
    }

    // 5. Suspend any running Web Audio contexts
    this.activeAudioContexts.forEach((ctx) => {
      try {
        if (ctx.state === 'running') {
          ctx.suspend().catch(() => {});
        }
      } catch (err) {
        console.warn('[GlobalAudioManager] Error suspending AudioContext:', err);
      }
    });

    // 6. Notify all registered listeners
    this.notifyListeners({ action: 'stop', id: exceptId || 'all' });
  }

  /**
   * Register an HTMLAudioElement with the global coordinator.
   * Automatically attaches play/pause listeners to prevent conflicts.
   */
  public registerAudioElement(
    audio: HTMLAudioElement,
    id: string,
    onStopCallback?: () => void
  ): () => void {
    this.activeAudios.set(audio, id);

    if (onStopCallback) {
      this.elementStopCallbacks.set(audio, onStopCallback);
    }

    const handlePlay = () => {
      this.stopAll(id, audio);
      this.notifyListeners({ action: 'play', id });
    };

    const handlePauseOrEnded = () => {
      this.notifyListeners({ action: 'pause', id });
    };

    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePauseOrEnded);
    audio.addEventListener('ended', handlePauseOrEnded);

    // Return unregister function for component unmount
    return () => {
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePauseOrEnded);
      audio.removeEventListener('ended', handlePauseOrEnded);
      this.activeAudios.delete(audio);
      this.elementStopCallbacks.delete(audio);
    };
  }

  /**
   * Register a custom stop callback for non-HTMLAudioElement audio (e.g., custom Web Audio / synth / TTS)
   */
  public registerCustomPlayer(id: string, stopCallback: () => void): () => void {
    this.customStopCallbacks.set(id, stopCallback);
    return () => {
      this.customStopCallbacks.delete(id);
    };
  }

  /**
   * Register an AudioContext to ensure it gets suspended if another audio takes over
   */
  public registerAudioContext(ctx: AudioContext): () => void {
    this.activeAudioContexts.add(ctx);
    return () => {
      this.activeAudioContexts.delete(ctx);
    };
  }

  /**
   * Subscribe to global audio events to synchronize UI state (e.g. play/pause icons)
   */
  public subscribe(listener: AudioEventListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  public notifyListeners(event: { action: 'play' | 'stop' | 'pause'; id: string }): void {
    this.listeners.forEach((listener) => {
      try {
        listener(event);
      } catch (err) {
        console.warn('[GlobalAudioManager] Error notifying listener:', err);
      }
    });
  }
}

export const globalAudioManager = new GlobalAudioManager();
