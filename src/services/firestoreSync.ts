/**
 * Silsila — Firestore Synchronization Service
 * 
 * Provides bi-directional synchronization between local memory/storage and Firebase Firestore.
 * Ensures the app runs with zero UI latency while maintaining durable cloud persistence.
 */

import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  getDocs,
  deleteDoc,
  writeBatch,
} from 'firebase/firestore';
import { db, User } from './firebase';
import {
  MemorizationPlan,
  UserProgressionState,
  AyahRetentionRecord,
  getUserPlan,
  saveUserPlan,
  getUserProgression,
  saveUserProgression,
  getRetentionDatabase,
  saveRetentionDatabase,
} from './memorizationEngine';
import {
  NiyyahEntry,
  getNiyyahEntries,
  saveNiyyahEntries,
} from './niyyahService';
import {
  ExamResult,
  getStoredExamResults,
  saveAllExamResults,
} from './examService';
import { getStoredTheme, setAppTheme, AppTheme } from './themeService';

export interface UserDocumentData {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  createdAt: string;
  updatedAt: string;
  plan?: MemorizationPlan;
  progression?: UserProgressionState;
  theme?: AppTheme;
  reciter?: string;
}

let activeUid: string | null = null;
let syncTimeout: any = null;

export function setActiveUserUid(uid: string | null) {
  activeUid = uid;
}

export function getActiveUserUid(): string | null {
  return activeUid;
}

/**
 * Check whether a user document already exists in Firestore.
 */
export async function checkUserExistsInFirestore(uid: string): Promise<boolean> {
  try {
    const userDocRef = doc(db, 'users', uid);
    const snap = await getDoc(userDocRef);
    return snap.exists();
  } catch (error) {
    console.error('Error checking user in Firestore:', error);
    return false;
  }
}

/**
 * Fetch complete user profile, plan, progression, retention records,
 * intentions and exams from Firestore, and hydrate local storage.
 */
export async function loadAllUserDataFromFirestore(uid: string): Promise<{
  hasPlan: boolean;
  plan?: MemorizationPlan;
  progression?: UserProgressionState;
}> {
  try {
    setActiveUserUid(uid);
    const userDocRef = doc(db, 'users', uid);
    const userSnap = await getDoc(userDocRef);

    if (!userSnap.exists()) {
      return { hasPlan: false };
    }

    const userData = userSnap.data() as UserDocumentData;

    // 1. Hydrate User Plan
    if (userData.plan) {
      saveUserPlan(userData.plan);
    }

    // 2. Hydrate User Progression
    if (userData.progression) {
      saveUserProgression(userData.progression);
    }

    // 3. Hydrate Theme
    if (userData.theme) {
      setAppTheme(userData.theme);
    }

    // 4. Fetch Retention Subcollection
    const retentionColRef = collection(db, 'users', uid, 'retention');
    const retentionSnap = await getDocs(retentionColRef);
    if (!retentionSnap.empty) {
      const currentDb = getRetentionDatabase();
      retentionSnap.forEach((docSnap) => {
        const item = docSnap.data() as AyahRetentionRecord;
        const key = `${item.surahNumber}:${item.ayahNumber}`;
        currentDb[key] = item;
      });
      saveRetentionDatabase(currentDb);
    }

    // 5. Fetch Niyyah Subcollection
    const niyyahColRef = collection(db, 'users', uid, 'niyyah');
    const niyyahSnap = await getDocs(niyyahColRef);
    if (!niyyahSnap.empty) {
      const entries: NiyyahEntry[] = [];
      niyyahSnap.forEach((docSnap) => {
        entries.push(docSnap.data() as NiyyahEntry);
      });
      entries.sort((a, b) => b.createdAt - a.createdAt);
      saveNiyyahEntries(entries);
    }

    // 6. Fetch Exam Results Subcollection
    const examColRef = collection(db, 'users', uid, 'examResults');
    const examSnap = await getDocs(examColRef);
    if (!examSnap.empty) {
      const exams: ExamResult[] = [];
      examSnap.forEach((docSnap) => {
        exams.push(docSnap.data() as ExamResult);
      });
      exams.sort((a, b) => b.timestamp - a.timestamp);
      saveAllExamResults(exams);
    }

    return {
      hasPlan: !!userData.plan,
      plan: userData.plan,
      progression: userData.progression,
    };
  } catch (error) {
    console.error('Failed to load user data from Firestore:', error);
    return { hasPlan: false };
  }
}

/**
 * Initialize a brand new user document in Firestore on onboarding completion.
 */
export async function initializeNewUserInFirestore(
  user: User,
  plan: MemorizationPlan
): Promise<void> {
  try {
    setActiveUserUid(user.uid);
    const userDocRef = doc(db, 'users', user.uid);
    const progression = getUserProgression();
    const theme = getStoredTheme();

    const userDocData: UserDocumentData = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName || user.email?.split('@')[0] || 'Seeker of Quran',
      photoURL: user.photoURL,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      plan,
      progression,
      theme,
      reciter: 'Mishary Rashid Alafasy',
    };

    await setDoc(userDocRef, userDocData, { merge: true });

    // Seed initial Niyyah entry in subcollection
    const initialNiyyahList = getNiyyahEntries();
    const batch = writeBatch(db);

    for (const n of initialNiyyahList) {
      const nRef = doc(db, 'users', user.uid, 'niyyah', n.id);
      batch.set(nRef, n);
    }

    // Seed initial default exams if any
    const initialExams = getStoredExamResults();
    for (const ex of initialExams) {
      const exRef = doc(db, 'users', user.uid, 'examResults', ex.examId);
      batch.set(exRef, ex);
    }

    await batch.commit();
  } catch (error) {
    console.error('Failed to initialize user in Firestore:', error);
  }
}

/**
 * Push updated user plan to Firestore
 */
export async function pushUserPlanToFirestore(plan: MemorizationPlan): Promise<void> {
  if (!activeUid) return;
  try {
    const userDocRef = doc(db, 'users', activeUid);
    await updateDoc(userDocRef, {
      plan,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error saving plan to Firestore:', error);
  }
}

/**
 * Push updated progression state to Firestore (debounced)
 */
export function pushUserProgressionToFirestore(progression: UserProgressionState): void {
  if (!activeUid) return;
  if (syncTimeout) clearTimeout(syncTimeout);

  syncTimeout = setTimeout(async () => {
    if (!activeUid) return;
    try {
      const userDocRef = doc(db, 'users', activeUid);
      await updateDoc(userDocRef, {
        progression,
        updatedAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error saving progression to Firestore:', error);
    }
  }, 400);
}

/**
 * Push an updated retention record to Firestore
 */
export async function pushRetentionRecordToFirestore(record: AyahRetentionRecord): Promise<void> {
  if (!activeUid) return;
  try {
    const docKey = `${record.surahNumber}_${record.ayahNumber}`;
    const ref = doc(db, 'users', activeUid, 'retention', docKey);
    await setDoc(ref, record, { merge: true });
  } catch (error) {
    console.error('Error saving retention record to Firestore:', error);
  }
}

/**
 * Push a Niyyah entry to Firestore
 */
export async function pushNiyyahEntryToFirestore(entry: NiyyahEntry): Promise<void> {
  if (!activeUid) return;
  try {
    const ref = doc(db, 'users', activeUid, 'niyyah', entry.id);
    await setDoc(ref, entry, { merge: true });
  } catch (error) {
    console.error('Error saving niyyah entry to Firestore:', error);
  }
}

/**
 * Delete a Niyyah entry from Firestore
 */
export async function deleteNiyyahEntryFromFirestore(entryId: string): Promise<void> {
  if (!activeUid) return;
  try {
    const ref = doc(db, 'users', activeUid, 'niyyah', entryId);
    await deleteDoc(ref);
  } catch (error) {
    console.error('Error deleting niyyah entry from Firestore:', error);
  }
}

/**
 * Push an Exam result to Firestore
 */
export async function pushExamResultToFirestore(exam: ExamResult): Promise<void> {
  if (!activeUid) return;
  try {
    const ref = doc(db, 'users', activeUid, 'examResults', exam.examId);
    await setDoc(ref, exam, { merge: true });
  } catch (error) {
    console.error('Error saving exam result to Firestore:', error);
  }
}

/**
 * Global background sync listener installer
 */
export function setupBackgroundSyncListeners(): () => void {
  if (typeof window === 'undefined') return () => {};

  const handlePlanChange = () => {
    if (activeUid) {
      pushUserPlanToFirestore(getUserPlan());
    }
  };

  const handleProgressionChange = () => {
    if (activeUid) {
      pushUserProgressionToFirestore(getUserProgression());
    }
  };

  const handleNiyyahChange = () => {
    if (activeUid) {
      const entries = getNiyyahEntries();
      if (entries.length > 0) {
        pushNiyyahEntryToFirestore(entries[0]);
      }
    }
  };

  const handleExamSync = (e: any) => {
    if (activeUid && e.detail?.exam) {
      pushExamResultToFirestore(e.detail.exam);
    }
  };

  window.addEventListener('silsila_plan_updated', handlePlanChange);
  window.addEventListener('silsila_progression_updated', handleProgressionChange);
  window.addEventListener('hafiz_progress_updated', handleProgressionChange);
  window.addEventListener('hafiz_niyyah_updated', handleNiyyahChange);
  window.addEventListener('silsila_sync_exam', handleExamSync as EventListener);

  return () => {
    window.removeEventListener('silsila_plan_updated', handlePlanChange);
    window.removeEventListener('silsila_progression_updated', handleProgressionChange);
    window.removeEventListener('hafiz_progress_updated', handleProgressionChange);
    window.removeEventListener('hafiz_niyyah_updated', handleNiyyahChange);
    window.removeEventListener('silsila_sync_exam', handleExamSync as EventListener);
  };
}
