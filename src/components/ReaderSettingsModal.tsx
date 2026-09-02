import React from 'react';
import { X, Type, Eye, Sparkles, Minus, Plus, RotateCcw, Check } from 'lucide-react';
import { useScrollLock } from '../hooks/useScrollLock';

export type ArabicFontSize = 'compact' | 'normal' | 'large' | 'xlarge' | 'jumbo' | 'giant';
export type TranslationFontSize = 'small' | 'normal' | 'large' | 'xlarge';
export type ArabicFontFamily = 'amiri' | 'scheherazade' | 'standard';
export type LineSpacing = 'compact' | 'balanced' | 'relaxed' | 'spacious';

export interface ReaderDisplaySettings {
  arabicFontSize: ArabicFontSize;
  customArabicFontSizePx?: number;
  translationFontSize: TranslationFontSize;
  arabicFontFamily: ArabicFontFamily;
  lineSpacing: LineSpacing;
  showTranslation: boolean;
  showTransliteration: boolean;
  showTajweed?: boolean;
  showWordHints: boolean;
  autoScroll: boolean;
}

export const DEFAULT_READER_SETTINGS: ReaderDisplaySettings = {
  arabicFontSize: 'normal',
  customArabicFontSizePx: 26,
  translationFontSize: 'normal',
  arabicFontFamily: 'amiri',
  lineSpacing: 'balanced',
  showTranslation: true,
  showTransliteration: true,
  showTajweed: true,
  showWordHints: true,
  autoScroll: true,
};

export const ARABIC_SIZE_PRESETS: { id: ArabicFontSize; label: string; px: number; desc: string }[] = [
  { id: 'compact', label: 'Compact', px: 22, desc: '22px • Dense' },
  { id: 'normal', label: 'Default', px: 26, desc: '26px • Standard' },
  { id: 'large', label: 'Medium', px: 30, desc: '30px • Clear' },
  { id: 'xlarge', label: 'Large', px: 36, desc: '36px • Prominent' },
  { id: 'jumbo', label: 'XL', px: 42, desc: '42px • Extra' },
  { id: 'giant', label: 'Giant', px: 50, desc: '50px • Maximum' },
];

export const TRANSLATION_SIZE_PRESETS: { id: TranslationFontSize; label: string; css: string }[] = [
  { id: 'small', label: 'Small', css: 'text-xs leading-relaxed' },
  { id: 'normal', label: 'Default', css: 'text-sm leading-relaxed' },
  { id: 'large', label: 'Large', css: 'text-base leading-relaxed' },
  { id: 'xlarge', label: 'XL', css: 'text-lg leading-relaxed' },
];

export const FONT_FAMILIES: { id: ArabicFontFamily; label: string; fontFamily: string }[] = [
  { id: 'amiri', label: 'Amiri', fontFamily: "'Amiri', serif" },
  { id: 'scheherazade', label: 'Scheherazade', fontFamily: "'Scheherazade New', serif" },
  { id: 'standard', label: 'Quranic Calligraphy', fontFamily: "'Amiri', 'Scheherazade New', serif" },
];

export const LINE_SPACINGS: { id: LineSpacing; label: string; lineHeight: number }[] = [
  { id: 'compact', label: 'Tight', lineHeight: 1.8 },
  { id: 'balanced', label: 'Balanced', lineHeight: 2.2 },
  { id: 'relaxed', label: 'Spacious', lineHeight: 2.6 },
  { id: 'spacious', label: 'Wide', lineHeight: 3.0 },
];

interface ReaderSettingsModalProps {
  settings: ReaderDisplaySettings;
  onUpdateSettings: (newSettings: Partial<ReaderDisplaySettings>) => void;
  onClose: () => void;
}

export const ReaderSettingsModal: React.FC<ReaderSettingsModalProps> = ({
  settings,
  onUpdateSettings,
  onClose,
}) => {
  useScrollLock(true);
  const currentPx = settings.customArabicFontSizePx ||
    ARABIC_SIZE_PRESETS.find((p) => p.id === settings.arabicFontSize)?.px ||
    34;

  const currentFontFamily = FONT_FAMILIES.find((f) => f.id === settings.arabicFontFamily)?.fontFamily || "'Amiri', serif";
  const currentLineHeight = LINE_SPACINGS.find((l) => l.id === settings.lineSpacing)?.lineHeight || 2.4;

  const handleStepSize = (delta: number) => {
    const nextPx = Math.min(60, Math.max(20, currentPx + delta));
    // Find closest preset or mark custom
    const matchingPreset = ARABIC_SIZE_PRESETS.find((p) => Math.abs(p.px - nextPx) <= 2);
    onUpdateSettings({
      customArabicFontSizePx: nextPx,
      arabicFontSize: matchingPreset ? matchingPreset.id : 'custom' as any,
    });
  };

  const handleSelectPreset = (preset: typeof ARABIC_SIZE_PRESETS[0]) => {
    onUpdateSettings({
      arabicFontSize: preset.id,
      customArabicFontSizePx: preset.px,
    });
  };

  const handleResetDefaults = () => {
    onUpdateSettings(DEFAULT_READER_SETTINGS);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-white border border-slate-200 text-slate-900 rounded-t-3xl sm:rounded-3xl p-5 sm:p-6 space-y-4 sm:space-y-5 shadow-2xl animate-in slide-in-from-bottom duration-200 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-black shadow-2xs shrink-0">
              <Type className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm sm:text-base text-slate-900">Font & Display Settings</h3>
              <p className="text-[11px] text-slate-500 font-medium">Resize Arabic Quran script, translation & spacing</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handleResetDefaults}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
              title="Reset to default sizes"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline text-[11px]">Reset</span>
            </button>

            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center cursor-pointer transition-all active:scale-95 shrink-0"
              aria-label="Close settings"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 1. ARABIC FONT SIZE CONTROLS */}
        <div className="p-4 sm:p-4.5 rounded-2xl bg-slate-50/80 border border-slate-200/90 shadow-2xs space-y-3.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-black uppercase tracking-wider text-amber-900 bg-amber-100/90 px-2 py-0.5 rounded-md">
                Arabic Quran Font Size
              </span>
            </div>
            <div className="flex items-center gap-1 font-mono text-xs font-black text-slate-800 bg-white px-2.5 py-1 rounded-xl border border-slate-200 shadow-2xs">
              <span>{currentPx}px</span>
            </div>
          </div>

          {/* Quick Stepper Buttons (- and +) */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleStepSize(-2)}
              disabled={currentPx <= 20}
              className="flex-1 py-2.5 px-3 rounded-xl bg-white hover:bg-slate-100 disabled:opacity-40 border border-slate-200 text-slate-800 font-black text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-all active:scale-95 shadow-2xs"
            >
              <Minus className="w-3.5 h-3.5 stroke-[3]" />
              <span>Smaller (A-)</span>
            </button>

            <button
              onClick={() => handleStepSize(2)}
              disabled={currentPx >= 60}
              className="flex-1 py-2.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:opacity-40 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-all active:scale-95 shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
              <span>Larger (A+)</span>
            </button>
          </div>

          {/* Smooth Continuous Slider */}
          <div className="space-y-1 pt-1">
            <div className="flex items-center justify-between text-[10px] font-bold text-slate-400">
              <span>20px (Compact)</span>
              <span>34px (Recommended)</span>
              <span>60px (Giant)</span>
            </div>
            <input
              type="range"
              min={20}
              max={60}
              step={2}
              value={currentPx}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10);
                const matchingPreset = ARABIC_SIZE_PRESETS.find((p) => Math.abs(p.px - val) <= 1);
                onUpdateSettings({
                  customArabicFontSizePx: val,
                  arabicFontSize: matchingPreset ? matchingPreset.id : 'custom' as any,
                });
              }}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-500"
            />
          </div>

          {/* Preset Buttons Grid */}
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5 pt-1">
            {ARABIC_SIZE_PRESETS.map((preset) => {
              const isSelected = Math.abs(currentPx - preset.px) <= 2;
              return (
                <button
                  key={preset.id}
                  onClick={() => handleSelectPreset(preset)}
                  className={`py-2 px-1 rounded-xl text-center transition-all cursor-pointer border ${
                    isSelected
                      ? 'bg-slate-900 text-white font-black border-slate-900 shadow-2xs scale-[1.02]'
                      : 'bg-white hover:bg-slate-100 text-slate-700 font-bold border-slate-200 text-xs'
                  }`}
                >
                  <span className="block text-[11px] leading-tight">{preset.label}</span>
                  <span className="text-[9.5px] opacity-70 block font-mono">{preset.px}px</span>
                </button>
              );
            })}
          </div>

          {/* Live Arabic Typography Preview */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white border border-amber-900/15 shadow-inner text-center space-y-2 overflow-hidden">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
              Live Preview
            </span>
            <p
              className="text-slate-900 transition-all font-bold select-none text-center"
              style={{
                fontSize: `${currentPx}px`,
                fontFamily: currentFontFamily,
                lineHeight: currentLineHeight,
              }}
              dir="rtl"
            >
              بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ ۝١
            </p>
            {settings.showTranslation && (
              <p className={`text-slate-600 italic font-medium pt-2 border-t border-slate-100 ${
                settings.translationFontSize === 'small'
                  ? 'text-xs'
                  : settings.translationFontSize === 'large'
                  ? 'text-base'
                  : settings.translationFontSize === 'xlarge'
                  ? 'text-lg'
                  : 'text-sm'
              }`}>
                "In the name of Allah, the Entirely Merciful, the Especially Merciful."
              </p>
            )}
          </div>
        </div>

        {/* 2. ARABIC SCRIPT & LINE SPACING */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Font Family / Script */}
          <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/90 space-y-2">
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-600 block">
              Arabic Font Style
            </span>
            <div className="space-y-1">
              {FONT_FAMILIES.map((font) => (
                <button
                  key={font.id}
                  onClick={() => onUpdateSettings({ arabicFontFamily: font.id })}
                  className={`w-full py-1.5 px-2.5 rounded-xl text-xs font-bold text-left flex items-center justify-between transition-all cursor-pointer border ${
                    settings.arabicFontFamily === font.id
                      ? 'bg-amber-100/80 text-amber-950 border-amber-300 shadow-2xs font-extrabold'
                      : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
                  }`}
                >
                  <span style={{ fontFamily: font.fontFamily }} className="text-sm">
                    {font.label}
                  </span>
                  {settings.arabicFontFamily === font.id && (
                    <Check className="w-3.5 h-3.5 text-amber-800" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Line Spacing */}
          <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/90 space-y-2">
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-600 block">
              Line Spacing
            </span>
            <div className="grid grid-cols-2 gap-1">
              {LINE_SPACINGS.map((sp) => (
                <button
                  key={sp.id}
                  onClick={() => onUpdateSettings({ lineSpacing: sp.id })}
                  className={`py-2 px-2 rounded-xl text-xs font-bold text-center transition-all cursor-pointer border ${
                    settings.lineSpacing === sp.id
                      ? 'bg-amber-100/80 text-amber-950 border-amber-300 shadow-2xs font-extrabold'
                      : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
                  }`}
                >
                  {sp.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 3. TRANSLATION FONT SIZE */}
        <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/90 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-600">
              English Translation Size
            </span>
            <span className="text-xs font-bold text-slate-700 capitalize">
              {settings.translationFontSize}
            </span>
          </div>

          <div className="grid grid-cols-4 gap-1.5">
            {TRANSLATION_SIZE_PRESETS.map((item) => (
              <button
                key={item.id}
                onClick={() => onUpdateSettings({ translationFontSize: item.id })}
                className={`py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                  settings.translationFontSize === item.id
                    ? 'bg-slate-900 text-white border-slate-900 shadow-2xs font-black'
                    : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* 4. TOGGLES: Translation, Transliteration, Word Hints */}
        <div className="space-y-2">
          

          <label className="flex items-center justify-between p-3 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 shadow-2xs cursor-pointer transition-colors">
            <div>
              <p className="text-xs font-extrabold text-slate-900">Show English Translation</p>
              <p className="text-[11px] text-slate-500 font-medium">Sahih International meaning</p>
            </div>
            <input
              type="checkbox"
              checked={settings.showTranslation}
              onChange={(e) => onUpdateSettings({ showTranslation: e.target.checked })}
              className="w-5 h-5 accent-amber-500 rounded-md cursor-pointer"
            />
          </label>

          <label className="flex items-center justify-between p-3 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 shadow-2xs cursor-pointer transition-colors">
            <div>
              <p className="text-xs font-extrabold text-slate-900">Show Latin Transliteration</p>
              <p className="text-[11px] text-slate-500 font-medium">Phonetic pronunciation text</p>
            </div>
            <input
              type="checkbox"
              checked={settings.showTransliteration}
              onChange={(e) => onUpdateSettings({ showTransliteration: e.target.checked })}
              className="w-5 h-5 accent-amber-500 rounded-md cursor-pointer"
            />
          </label>

          <label className="flex items-center justify-between p-3 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 shadow-2xs cursor-pointer transition-colors">
            <div>
              <p className="text-xs font-extrabold text-slate-900">Interactive Word-by-Word Hints</p>
              <p className="text-[11px] text-slate-500 font-medium">Tap individual words to view vocabulary</p>
            </div>
            <input
              type="checkbox"
              checked={settings.showWordHints}
              onChange={(e) => onUpdateSettings({ showWordHints: e.target.checked })}
              className="w-5 h-5 accent-amber-500 rounded-md cursor-pointer"
            />
          </label>
        </div>

        {/* Done Button */}
        <button
          onClick={onClose}
          className="w-full h-11 sm:h-12 rounded-2xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs sm:text-sm flex items-center justify-center cursor-pointer active:scale-98 transition-all shadow-xs"
        >
          Done
        </button>
      </div>
    </div>
  );
};
