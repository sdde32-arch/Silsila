const fs = require('fs');

const content = `import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, auth, onAuthStateChanged, signOutUser, signInWithUsername as firebaseSignInWithUsername } from '../services/firebase';
import { MemorizationPlan } from '../types';
import { isOnboardingCompleted, setOnboardingCompleted } from '../components/onboarding/OnboardingFlow';
import { setActiveUserUid } from '../services/firestoreSync';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isNewUser: boolean;
  signInWithUsername: (username: string, password?: string) => Promise<void>;
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
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        setActiveUserUid(firebaseUser.uid);
        setIsNewUser(!isOnboardingCompleted());
      } else {
        setUser(null);
        setActiveUserUid(null);
        setIsNewUser(false);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const signInWithUsername = async (username: string, password?: string) => {
    await firebaseSignInWithUsername(username, password);
  };

  const signOut = async () => {
    await signOutUser();
  };

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
        signInWithUsername,
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
`;

fs.writeFileSync('src/context/AuthContext.tsx', content);
console.log('patched AuthContext.tsx');
