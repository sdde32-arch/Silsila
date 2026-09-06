import { globalAudioManager } from './globalAudioManager';

export interface EnglishReaderOption {
  id: string;
  name: string;
  readerType: 'studio_human' | 'natural_tts';
  description: string;
  badge: string;
  iconName?: string;
  voiceGender?: 'male' | 'female';
  preferredLang?: string;
  pitch?: number;
  rate?: number;
}

export const ENGLISH_READERS: EnglishReaderOption[] = [
  {
    id: 'ibrahim_walk',
    name: 'Ibrahim Walk',
    readerType: 'studio_human',
    description: 'World standard 192kbps studio narration of the Sahih International Quran translation',
    badge: 'Human Reciter • Studio Quality',
  },
  {
    id: 'deep_male',
    name: 'Deep Reverent Narrator',
    readerType: 'natural_tts',
    description: 'Warm, resonant, contemplative cadence with clear phonetic projection',
    badge: 'Warm Male Voice',
    voiceGender: 'male',
    pitch: 0.90,
    rate: 0.88,
  },
  {
    id: 'articulate_female',
    name: 'Clear Articulate Voice',
    readerType: 'natural_tts',
    description: 'Gentle, measured enunciation ideal for deliberate comprehension & memorization',
    badge: 'Gentle Female Voice',
    voiceGender: 'female',
    pitch: 1.02,
    rate: 0.86,
  },
  {
    id: 'british_narrator',
    name: 'British English Narrator',
    readerType: 'natural_tts',
    description: 'Distinguished British English enunciation with refined phrasing and pauses',
    badge: 'British (UK) Accent',
    preferredLang: 'en-GB',
    pitch: 0.96,
    rate: 0.85,
  },
];

const STORAGE_KEY = 'quran_app_selected_english_reader';

export function getSelectedEnglishReader(): EnglishReaderOption {
  if (typeof window === 'undefined') return ENGLISH_READERS[0];
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const match = ENGLISH_READERS.find((r) => r.id === saved);
      if (match) return match;
    }
  } catch {}
  return ENGLISH_READERS[0];
}

export function setSelectedEnglishReader(readerId: string): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, readerId);
  } catch {}
}

export function getIbrahimWalkAyahAudioUrl(surahNumber: number, ayahNumber: number): string {
  const sPad = String(surahNumber).padStart(3, '0');
  const aPad = String(ayahNumber).padStart(3, '0');
  return `https://everyayah.com/data/English/Sahih_Intnl_Ibrahim_Walk_192kbps/${sPad}${aPad}.mp3`;
}

function findBestSpeechVoice(option: EnglishReaderOption): SpeechSynthesisVoice | null {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return null;
  const voices = window.speechSynthesis.getVoices();
  if (!voices || voices.length === 0) return null;

  // 1. If preferred language specified (e.g. en-GB)
  if (option.preferredLang) {
    const langMatch = voices.find((v) => v.lang.toLowerCase().startsWith(option.preferredLang!.toLowerCase()));
    if (langMatch) return langMatch;
  }

  // 2. Gender heuristics
  if (option.voiceGender === 'female') {
    const femaleVoice = voices.find((v) => {
      const name = v.name.toLowerCase();
      return (
        v.lang.startsWith('en') &&
        (name.includes('female') ||
          name.includes('samantha') ||
          name.includes('zira') ||
          name.includes('victoria') ||
          name.includes('serena') ||
          name.includes('karen') ||
          name.includes('fiona'))
      );
    });
    if (femaleVoice) return femaleVoice;
  } else if (option.voiceGender === 'male') {
    const maleVoice = voices.find((v) => {
      const name = v.name.toLowerCase();
      return (
        v.lang.startsWith('en') &&
        (name.includes('male') ||
          name.includes('david') ||
          name.includes('daniel') ||
          name.includes('oliver') ||
          name.includes('george') ||
          name.includes('guy') ||
          name.includes('natural'))
      );
    });
    if (maleVoice) return maleVoice;
  }

  // 3. Any high quality English voice (Google, Microsoft, Natural, Siri)
  const premiumEn = voices.find(
    (v) =>
      v.lang.startsWith('en') &&
      (v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Premium'))
  );
  if (premiumEn) return premiumEn;

  // 4. Default English voice
  const defaultEn = voices.find((v) => v.lang.startsWith('en'));
  return defaultEn || null;
}

export interface PlayEnglishOptions {
  playbackSpeed?: number;
  onEnded?: () => void;
  onError?: () => void;
  onTimeUpdate?: (currentTime: number, duration: number) => void;
}

export interface PlaybackControl {
  stop: () => void;
  audioElement?: HTMLAudioElement;
}

/**
 * Plays English translation audio respecting the user's chosen reader (Studio Human or Natural Voice),
 * fully synchronized with GlobalAudioManager so no two audios ever conflict.
 */
export async function playEnglishTranslationAudio(
  surahNumber: number,
  ayahNumber: number,
  englishText: string,
  options: PlayEnglishOptions = {}
): Promise<PlaybackControl> {
  const reader = getSelectedEnglishReader();
  const speed = options.playbackSpeed || 1.0;
  const instanceId = `english-audio-${surahNumber}-${ayahNumber}`;

  // 1. Immediately stop any other audio running across the entire application
  globalAudioManager.stopAll(instanceId);

  // Strategy A: Studio Human Voice (Ibrahim Walk)
  if (reader.id === 'ibrahim_walk') {
    return new Promise((resolve) => {
      const audioUrl = getIbrahimWalkAyahAudioUrl(surahNumber, ayahNumber);
      const audio = new Audio(audioUrl);
      audio.playbackRate = speed;

      let hasCleanedUp = false;
      const cleanup = () => {
        if (hasCleanedUp) return;
        hasCleanedUp = true;
        try {
          if (!audio.paused) audio.pause();
        } catch {}
      };

      const unregister = globalAudioManager.registerAudioElement(audio, instanceId, () => {
        cleanup();
        options.onEnded?.();
      });

      audio.onended = () => {
        unregister();
        options.onEnded?.();
      };

      audio.ontimeupdate = () => {
        if (audio.duration) {
          options.onTimeUpdate?.(audio.currentTime, audio.duration);
        }
      };

      audio.onerror = () => {
        console.warn('[EnglishAudioService] Human studio audio failed, falling back to TTS narrator');
        unregister();
        // Seamless fallback to TTS if network fails
        playEnglishViaTTS(englishText, reader, speed, options, instanceId).then(resolve);
      };

      audio
        .play()
        .then(() => {
          resolve({
            stop: () => {
              unregister();
              cleanup();
            },
            audioElement: audio,
          });
        })
        .catch(() => {
          unregister();
          playEnglishViaTTS(englishText, reader, speed, options, instanceId).then(resolve);
        });
    });
  }

  // Strategy B: Natural TTS Voice with customized acoustic cadence
  return playEnglishViaTTS(englishText, reader, speed, options, instanceId);
}

function playEnglishViaTTS(
  englishText: string,
  reader: EnglishReaderOption,
  speed: number,
  options: PlayEnglishOptions,
  instanceId: string
): Promise<PlaybackControl> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      options.onError?.();
      resolve({ stop: () => {} });
      return;
    }

    try {
      window.speechSynthesis.cancel();
      const cleanText = englishText.replace(/\[.*?\]|\(.*?\)/g, '').trim() || englishText;
      const utterance = new SpeechSynthesisUtterance(cleanText);

      utterance.lang = reader.preferredLang || 'en-US';
      utterance.rate = (reader.rate || 0.9) * speed;
      utterance.pitch = reader.pitch || 1.0;
      utterance.volume = 1.0;

      const voice = findBestSpeechVoice(reader);
      if (voice) {
        utterance.voice = voice;
      }

      let isStopped = false;
      const stopTTS = () => {
        if (isStopped) return;
        isStopped = true;
        try {
          window.speechSynthesis.cancel();
        } catch {}
      };

      const unregisterCustom = globalAudioManager.registerCustomPlayer(instanceId, () => {
        stopTTS();
        options.onEnded?.();
      });

      utterance.onend = () => {
        unregisterCustom();
        options.onEnded?.();
      };

      utterance.onerror = () => {
        unregisterCustom();
        options.onEnded?.();
      };

      window.speechSynthesis.speak(utterance);

      resolve({
        stop: () => {
          unregisterCustom();
          stopTTS();
        },
      });
    } catch (err) {
      console.warn('[EnglishAudioService] TTS failed:', err);
      options.onError?.();
      resolve({ stop: () => {} });
    }
  });
}
