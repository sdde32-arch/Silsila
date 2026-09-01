import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
  User,
  auth,
  signInWithGooglePopup,
  signInAnonymouslyUser,
  signOutUser,
  onAuthStateChanged,
} from '../services/firebase';
import {
  checkUserExistsInFirestore,
  loadAllUserDataFromFirestore,
  initializeNewUserInFirestore,
  setActiveUserUid,
  setupBackgroundSyncListeners,
} from '../services/firestoreSync';
import { MemorizationPlan } from '../types';
import { isOnboardingCompleted, setOnboardingCompleted } from '../components/onboarding/OnboardingFlow';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isNewUser: boolean;
  signInWithGoogle: () => Promise<void>;
  signInAsGuest: () => Promise<void>;
  signOut: () => Promise<void>;
  completeOnboarding: (plan: MemorizationPlan) => Promise<void>;
  refreshUserData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isNewUser, setIsNewUser] = useState<boolean>(false);

  useEffect(() => {
    // Setup background Firestore syncing listeners
    const cleanupSync = setupBackgroundSyncListeners();

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        setActiveUserUid(currentUser.uid);
        try {
          // Check if user already exists in Firestore
          const exists = await checkUserExistsInFirestore(currentUser.uid);
          if (exists) {
            // Load user data from Firestore into local memory & state
            const loaded = await loadAllUserDataFromFirestore(currentUser.uid);
            if (loaded.hasPlan) {
              setOnboardingCompleted();
              setIsNewUser(false);
            } else {
              setIsNewUser(!isOnboardingCompleted());
            }
          } else {
            // New user without a cloud profile yet
            setIsNewUser(true);
          }
        } catch (err) {
          console.error('Error during Firestore auth bootstrap:', err);
          // Fallback to local onboarding check
          setIsNewUser(!isOnboardingCompleted());
        }
      } else {
        setActiveUserUid(null);
        setIsNewUser(false);
      }
      setLoading(false);
    });

    return () => {
      cleanupSync();
      unsubscribe();
    };
  }, []);

  const signInWithGoogle = async () => {
    setLoading(true);
    try {
      const loggedInUser = await signInWithGooglePopup();
      setUser(loggedInUser);
      setActiveUserUid(loggedInUser.uid);
      const exists = await checkUserExistsInFirestore(loggedInUser.uid);
      if (exists) {
        await loadAllUserDataFromFirestore(loggedInUser.uid);
        setOnboardingCompleted();
        setIsNewUser(false);
      } else {
        setIsNewUser(true);
      }
    } catch (err) {
      console.error('Google Sign In Failed:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signInAsGuest = async () => {
    setLoading(true);
    try {
      const guestUser = await signInAnonymouslyUser();
      setUser(guestUser);
      setActiveUserUid(guestUser.uid);
      const exists = await checkUserExistsInFirestore(guestUser.uid);
      if (exists) {
        await loadAllUserDataFromFirestore(guestUser.uid);
        setOnboardingCompleted();
        setIsNewUser(false);
      } else {
        setIsNewUser(true);
      }
    } catch (err) {
      console.error('Guest Sign In Failed:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      await signOutUser();
      setUser(null);
      setActiveUserUid(null);
      setIsNewUser(false);
    } catch (err) {
      console.error('Sign Out Failed:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const completeOnboarding = async (plan: MemorizationPlan) => {
    if (user) {
      await initializeNewUserInFirestore(user, plan);
      setOnboardingCompleted();
      setIsNewUser(false);
    }
  };

  const refreshUserData = async () => {
    if (user) {
      await loadAllUserDataFromFirestore(user.uid);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isNewUser,
        signInWithGoogle,
        signInAsGuest,
        signOut,
        completeOnboarding,
        refreshUserData,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
