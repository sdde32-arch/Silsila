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
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (err: any) {
    if (err.code === 'auth/popup-blocked' || err.code === 'auth/popup-closed-by-user') {
      console.warn('Popup blocked or closed. In iframe environments, please click the "Open in new tab" button at the top of the preview window to sign in with Google.');
    }
    throw err;
  }
}

export async function signInAnonymouslyUser(): Promise<User> {
  try {
    const result = await signInAnonymously(auth);
    return result.user;
  } catch (error: any) {
    console.warn('Firebase Anonymous Auth failed or is disabled in the console. Falling back to Local Guest Mode.', error);
    // Return a mock user object to allow the app to bypass the sign-in screen
    // Local state will work flawlessly, though Firestore sync will quietly fail.
    return {
      uid: 'local-guest-' + Math.random().toString(36).substring(2, 9),
      isAnonymous: true,
      displayName: 'Guest Seeker',
      email: null,
      emailVerified: false,
      phoneNumber: null,
      photoURL: null,
      providerId: 'anonymous',
      tenantId: null,
      providerData: [],
      metadata: {},
      refreshToken: '',
      getIdToken: async () => '',
      getIdTokenResult: async () => ({} as any),
      reload: async () => {},
      delete: async () => {},
      toJSON: () => ({}),
    } as unknown as User;
  }
}

export async function signOutUser(): Promise<void> {
  await signOut(auth);
}

export { onAuthStateChanged };
export type { User };
