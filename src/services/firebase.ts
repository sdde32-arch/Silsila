/// <reference types="vite/client" />
import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInAnonymously,
  signOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import {
  getFirestore,
  Firestore,
} from 'firebase/firestore';

// Fallback config from provisioned project
const fallbackConfig = {
  projectId: 'gen-lang-client-0176826080',
  appId: '1:185767485760:web:104cbde6798975d269daa5',
  apiKey: 'AIzaSyAXxRlgHoFdCfZw9Vrb7Q56YdiGkbV1tjk',
  authDomain: 'gen-lang-client-0176826080.firebaseapp.com',
  firestoreDatabaseId: 'ai-studio-quranexercisecar-99916b57-68dd-4ef1-9272-18c58223ca74',
  storageBucket: 'gen-lang-client-0176826080.firebasestorage.app',
  messagingSenderId: '185767485760',
};

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || fallbackConfig.apiKey,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || fallbackConfig.authDomain,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || fallbackConfig.projectId,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || fallbackConfig.storageBucket,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || fallbackConfig.messagingSenderId,
  appId: import.meta.env.VITE_FIREBASE_APP_ID || fallbackConfig.appId,
};

// Initialize Firebase
export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Firebase Auth
export const auth = getAuth(app);

// Initialize Firestore with custom database ID if available
const customDbId = import.meta.env.VITE_FIREBASE_FIRESTORE_DATABASE_ID || fallbackConfig.firestoreDatabaseId;

let firestoreInstance: Firestore;
try {
  if (customDbId && customDbId !== '(default)') {
    firestoreInstance = getFirestore(app, customDbId);
  } else {
    firestoreInstance = getFirestore(app);
  }
} catch {
  firestoreInstance = getFirestore(app);
}

export const db = firestoreInstance;

// Google Auth Provider
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account',
});

// Auth helper functions
export async function signInWithGooglePopup(): Promise<User> {
  const result = await signInWithPopup(auth, googleProvider);
  return result.user;
}

export async function signInAnonymouslyUser(): Promise<User> {
  const result = await signInAnonymously(auth);
  return result.user;
}

export async function signOutUser(): Promise<void> {
  await signOut(auth);
}

export { onAuthStateChanged };
export type { User };
