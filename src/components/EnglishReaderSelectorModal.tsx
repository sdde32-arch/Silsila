import React, { useState } from 'react';
import {
  X,
  Volume2,
  Check,
  Headphones,
  Sparkles,
  Mic,
  Languages,
  Square,
} from 'lucide-react';
import {
  ENGLISH_READERS,
  EnglishReaderOption,
  getSelectedEnglishReader,
  setSelectedEnglishReader,
  playEnglishTranslationAudio,
} from '../services/englishAudioService';
import { globalAudioManager } from '../services/globalAudioManager';

interface EnglishReaderSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReaderChanged?: (reader: EnglishReaderOption) => void;
}

export const EnglishReaderSelectorModal: React.FC<EnglishReaderSelectorModalProps> = ({
  isOpen,
  onClose,
  onReaderChanged,
}) => {
  const [selectedReader, setCurrentSelectedReader] = useState<EnglishReaderOption>(() =>
    getSelectedEnglishReader()
  );
  const [previewingId, setPreviewingId] = useState<string | null>(null);
  const [previewStopFn, setPreviewStopFn] = useState<(() => void) | null>(null);

  if (!isOpen) return null;

  const handleStopPreview = () => {
    if (previewStopFn) {
      previewStopFn();
      setPreviewStopFn(null);
    }
    globalAudioManager.stopAll();
    setPreviewingId(null);
  };

  const handlePreview = async (reader: EnglishReaderOption, e: React.MouseEvent) => {
    e.stopPropagation();

    if (previewingId === reader.id) {
      handleStopPreview();
      return;
    }

    handleStopPreview();
    setPreviewingId(reader.id);

    const sampleText = 'In the name of Allah, the Entirely Merciful, the Especially Merciful.';
    // Temporarily save reader so preview uses it
    const original = getSelectedEnglishReader();
    setSelectedEnglishReader(reader.id);

    try {
      const control = await playEnglishTranslationAudio(1, 1, sampleText, {
        playbackSpeed: 1.0,
        onEnded: () => {
          setPreviewingId(null);
          setPreviewStopFn(null);
          setSelectedEnglishReader(selectedReader.id);
        },
        onError: () => {
          setPreviewingId(null);
          setPreviewStopFn(null);
          setSelectedEnglishReader(selectedReader.id);
        },
      });

      setPreviewStopFn(() => control.stop);
    } catch {
      setPreviewingId(null);
      setSelectedEnglishReader(original.id);
    }
  };

  const handleSelect = (reader: EnglishReaderOption) => {
    handleStopPreview();
    setSelectedEnglishReader(reader.id);
    setCurrentSelectedReader(reader);
    onReaderChanged?.(reader);
    onClose();
  };

  return (
    <div
      id="english-reader-selector-backdrop"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/60 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in duration-200"
      onClick={() => {
        handleStopPreview();
        onClose();
      }}
    >
      <div
        id="english-reader-selector-dialog"
        className="w-full sm:max-w-lg bg-white rounded-t-3xl sm:rounded-3xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in slide-in-from-bottom duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-700 shadow-2xs">
              <Headphones className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-900">
                English Translation Reader
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Select your preferred voice for English audio playback
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              handleStopPreview();
              onClose();
            }}
            className="w-8 h-8 rounded-full bg-slate-200/70 hover:bg-slate-200 text-slate-700 flex items-center justify-center cursor-pointer transition-colors"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Reader Options List */}
        <div className="p-4 overflow-y-auto space-y-3">
          {ENGLISH_READERS.map((reader) => {
            const isSelected = selectedReader.id === reader.id;
            const isPreviewing = previewingId === reader.id;

            return (
              <div
                key={reader.id}
                onClick={() => handleSelect(reader)}
                className={`p-3.5 sm:p-4 rounded-2xl border-2 transition-all cursor-pointer relative flex flex-col gap-2 ${
                  isSelected
                    ? 'border-indigo-600 bg-indigo-50/40 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                        reader.readerType === 'studio_human'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {reader.readerType === 'studio_human' ? (
                        <Mic className="w-4.5 h-4.5" />
                      ) : (
                        <Languages className="w-4.5 h-4.5" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-sm text-slate-900">
                          {reader.name}
                        </span>
                        {isSelected && (
                          <span className="w-4 h-4 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px]">
                            <Check className="w-2.5 h-2.5 stroke-[3]" />
                          </span>
                        )}
                      </div>
                      <span className="inline-block px-2 py-0.5 mt-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-bold">
                        {reader.badge}
                      </span>
                    </div>
                  </div>

                  {/* Preview Audio Button */}
                  <button
                    type="button"
                    onClick={(e) => handlePreview(reader, e)}
                    className={`h-8 px-3 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shrink-0 shadow-2xs ${
                      isPreviewing
                        ? 'bg-amber-500 text-black border-amber-600 animate-pulse'
                        : 'bg-white hover:bg-slate-50 border-slate-300 text-slate-800'
                    }`}
                    title={isPreviewing ? 'Stop Sample' : 'Preview Voice'}
                  >
                    {isPreviewing ? (
                      <>
                        <Square className="w-3 h-3 fill-current" />
                        <span>Stop</span>
                      </>
                    ) : (
                      <>
                        <Volume2 className="w-3.5 h-3.5" />
                        <span>Preview</span>
                      </>
                    )}
                  </button>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed pl-12">
                  {reader.description}
                </p>

                {reader.readerType === 'studio_human' && (
                  <div className="mt-1 ml-12 px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-medium flex items-center gap-1.5">
                    <Sparkles className="w-3 h-3 text-emerald-600" />
                    <span>Real studio human audio recorded specifically for Quranic English</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-3.5 sm:p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            Selected: <strong className="text-slate-900">{selectedReader.name}</strong>
          </span>
          <button
            onClick={() => {
              handleStopPreview();
              onClose();
            }}
            className="h-9 px-5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
