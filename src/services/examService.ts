/**
 * Silsila — Surah Mastery Exam Service
 * 
 * Handles storing, retrieving, and syncing Surah Mastery Verification Exam records.
 */

export interface ExamResult {
  examId: string;
  surahNumber: number;
  surahName: string;
  score: number;
  passed: boolean;
  date: string;
  correctQuestions: number;
  totalQuestions: number;
  timestamp: number;
}

const EXAM_STORAGE_KEY = 'hafiz_exam_history_v1';

const DEFAULT_EXAMS: ExamResult[] = [
  {
    examId: 'exam_fatihah_default',
    surahNumber: 1,
    surahName: 'Al-Fatihah',
    date: 'Aug 18, 2026',
    score: 100,
    passed: true,
    totalQuestions: 7,
    correctQuestions: 7,
    timestamp: Date.now() - 7 * 24 * 60 * 60 * 1000,
  },
  {
    examId: 'exam_nas_default',
    surahNumber: 114,
    surahName: 'An-Nas',
    date: 'Aug 19, 2026',
    score: 100,
    passed: true,
    totalQuestions: 6,
    correctQuestions: 6,
    timestamp: Date.now() - 6 * 24 * 60 * 60 * 1000,
  },
];

export function getStoredExamResults(): ExamResult[] {
  if (typeof window === 'undefined' || !window.localStorage) {
    return DEFAULT_EXAMS;
  }
  try {
    const raw = localStorage.getItem(EXAM_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Failed to parse exam records', e);
  }
  return DEFAULT_EXAMS;
}

export function saveAllExamResults(exams: ExamResult[]): void {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    localStorage.setItem(EXAM_STORAGE_KEY, JSON.stringify(exams));
    window.dispatchEvent(new CustomEvent('hafiz_exams_updated'));
  } catch (e) {
    console.error('Failed to save exam records', e);
  }
}

export function recordExamResult(result: Omit<ExamResult, 'examId' | 'timestamp'>): ExamResult {
  const existing = getStoredExamResults();
  const newExam: ExamResult = {
    ...result,
    examId: `exam_${result.surahNumber}_${Date.now()}`,
    timestamp: Date.now(),
  };

  // Add new exam at beginning
  const updated = [newExam, ...existing.filter((e) => e.examId !== newExam.examId)];
  saveAllExamResults(updated);

  // Trigger sync if firestore sync service is available
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('silsila_sync_exam', { detail: { exam: newExam } }));
  }

  return newExam;
}
