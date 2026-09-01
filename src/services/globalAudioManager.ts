/**
 * Global Audio Manager & Singleton Audio Coordinator
 * Ensures strictly ONE audio stream (HTML5 Audio, Web Audio, or SpeechSynthesis)
 * plays at any given time across the entire application.
 */

type AudioEventListener = (event: { action: 'play' | 'stop' | 'pause'; id: string }) => void;

class GlobalAudioManager {
  private activeAudios = new Map<HTMLAudioElement, string>();
  private activeStopCallbacks = new Map<string, () => void>();
  private listeners = new Set<AudioEventListener>();
  private activeAudioContexts = new Set<AudioContext>();

  /**
   * Stop all currently playing audio streams, synthesizers, and SpeechSynthesis across the app.
   * @param exceptId Optional ID of the audio stream that should NOT be stopped (the one initiating playback).
   * @param exceptAudio Optional HTMLAudioElement that should NOT be stopped.
   */
  public stopAll(exceptId?: string, exceptAudio?: HTMLAudioElement): void {
    // 1. Pause and reset all registered HTMLAudioElements EXCEPT the one initiating playback
    this.activeAudios.forEach((id, audio) => {
      if (audio === exceptAudio) {
        return;
      }
      if (exceptId && id === exceptId) {
        return;
      }
      try {
        if (!audio.paused) {
          audio.pause();
        }
      } catch (err) {
        console.warn('[GlobalAudioManager] Error pausing audio element:', err);
      }
    });

    // 2. Execute custom stop callbacks
    this.activeStopCallbacks.forEach((stopFn, id) => {
      if (id !== exceptId) {
        try {
          stopFn();
        } catch (err) {
          console.warn('[GlobalAudioManager] Error in stop callback for id:', id, err);
        }
      }
    });

    // 3. Cancel any active Web Speech API utterance
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch (err) {
        console.warn('[GlobalAudioManager] Error canceling speechSynthesis:', err);
      }
    }

    // 4. Suspend any running Web Audio contexts
    this.activeAudioContexts.forEach((ctx) => {
      try {
        if (ctx.state === 'running') {
          ctx.suspend().catch(() => {});
        }
      } catch (err) {
        console.warn('[GlobalAudioManager] Error suspending AudioContext:', err);
      }
    });

    // 5. Notify all registered listeners
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
      this.activeStopCallbacks.set(id, onStopCallback);
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
      this.activeStopCallbacks.delete(id);
    };
  }

  /**
   * Register a custom stop callback for non-HTMLAudioElement audio (e.g., custom Web Audio / synth / TTS)
   */
  public registerCustomPlayer(id: string, stopCallback: () => void): () => void {
    this.activeStopCallbacks.set(id, stopCallback);
    return () => {
      this.activeStopCallbacks.delete(id);
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

  private notifyListeners(event: { action: 'play' | 'stop' | 'pause'; id: string }): void {
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
