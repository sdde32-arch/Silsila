import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User } from '../services/firebase';
import { MemorizationPlan } from '../types';
import { isOnboardingCompleted, setOnboardingCompleted } from '../components/onboarding/OnboardingFlow';
import { setActiveUserUid } from '../services/firestoreSync';

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

const LOCAL_GUEST_USER: User = {
  uid: 'local-guest-user',
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

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isNewUser, setIsNewUser] = useState<boolean>(false);

  useEffect(() => {
    // Force local guest user and bypass Firebase
    setUser(LOCAL_GUEST_USER);
    setActiveUserUid(LOCAL_GUEST_USER.uid);
    setIsNewUser(!isOnboardingCompleted());
    setLoading(false);
  }, []);

  const signInWithGoogle = async () => {};
  const signInAsGuest = async () => {};
  const signOut = async () => {};

  const completeOnboarding = async (plan: MemorizationPlan) => {
    setOnboardingCompleted();
    setIsNewUser(false);
  };

  const refreshUserData = async () => {};

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
