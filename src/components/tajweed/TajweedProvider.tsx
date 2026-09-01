import React, { createContext, useContext, ReactNode, useMemo } from 'react';

// ============================================================================
// 1. TAJWEED RULE REGISTRY & TYPES
// ============================================================================

export type TajweedRuleId = 'ghunnah' | 'ikhfa' | 'idgham' | 'qalqalah' | 'madd';

export interface TajweedRule {
  id: TajweedRuleId;
  name: string;
  colorClass: string;
  description: string;
  regex: RegExp;
}

export const TAJWEED_RULES: Record<TajweedRuleId, TajweedRule> = {
  ghunnah: {
    id: 'ghunnah',
    name: 'Ghunnah',
    colorClass: 'text-emerald-500', // Green
    description: 'Nasalization of Noon and Meem with Shaddah.',
    regex: /[نم]ّ/g,
  },
  ikhfa: {
    id: 'ikhfa',
    name: 'Ikhfa',
    colorClass: 'text-amber-500', // Orange/Amber
    description: 'Concealment of Noon Sakinah or Tanween.',
    regex: /نْ[تثجدذزسشصضطظفقك]/g,
  },
  idgham: {
    id: 'idgham',
    name: 'Idgham',
    colorClass: 'text-slate-400', // Gray
    description: 'Merging of Noon Sakinah or Tanween.',
    regex: /نْ[يرملون]/g,
  },
  qalqalah: {
    id: 'qalqalah',
    name: 'Qalqalah',
    colorClass: 'text-blue-500', // Blue
    description: 'Echoing sound of specific letters when carrying a Sukoon.',
    regex: /[قطبجد]ْ/g,
  },
  madd: {
    id: 'madd',
    name: 'Madd',
    colorClass: 'text-rose-500', // Red
    description: 'Elongation of the vowel sound.',
    regex: /[اوي]ٓ/g,
  },
};

// ============================================================================
// 2. CONTEXT DEFINITION
// ============================================================================

interface TajweedContextType {
  rules: Record<TajweedRuleId, TajweedRule>;
  annotateText: (text: string) => ReactNode[];
}

const TajweedContext = createContext<TajweedContextType | null>(null);

export const useTajweed = () => {
  const context = useContext(TajweedContext);
  if (!context) {
    throw new Error('useTajweed must be used within a TajweedProvider');
  }
  return context;
};

// ============================================================================
// 3. PARSER ENGINE & PROVIDER
// ============================================================================

interface TajweedProviderProps {
  children: ReactNode;
}

export const TajweedProvider: React.FC<TajweedProviderProps> = ({ children }) => {
  /**
   * Core Parser Engine
   * Non-destructively parses Arabic text and wraps matching Tajweed rules
   * in styled semantic token spans.
   */
  const annotateText = (text: string): ReactNode[] => {
    let elements: Array<{ type: 'text' | TajweedRuleId; content: string }> = [
      { type: 'text', content: text },
    ];

    // Apply each rule sequentially
    Object.values(TAJWEED_RULES).forEach((rule) => {
      const newElements: typeof elements = [];

      elements.forEach((el) => {
        if (el.type !== 'text') {
          newElements.push(el);
          return;
        }

        const parts = el.content.split(rule.regex);
        const matches = el.content.match(rule.regex);

        if (!matches) {
          newElements.push(el);
          return;
        }

        parts.forEach((part, i) => {
          if (part) {
            newElements.push({ type: 'text', content: part });
          }
          if (i < matches.length) {
            newElements.push({ type: rule.id, content: matches[i] });
          }
        });
      });

      elements = newElements;
    });

    return elements.map((el, idx) => {
      if (el.type === 'text') {
        return <React.Fragment key={idx}>{el.content}</React.Fragment>;
      }
      const rule = TAJWEED_RULES[el.type];
      return (
        <span
          key={idx}
          className={`${rule.colorClass} font-bold`}
          title={rule.description}
          aria-label={`Tajweed Rule: ${rule.name}`}
        >
          {el.content}
        </span>
      );
    });
  };

  const value = useMemo(
    () => ({
      rules: TAJWEED_RULES,
      annotateText,
    }),
    []
  );

  return (
    <TajweedContext.Provider value={value}>
      {children}
    </TajweedContext.Provider>
  );
};
