'use client';

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
  useCallback,
} from 'react';
import {
  User as FirebaseUser,
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  GoogleAuthProvider,
} from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { User, AuthContextType } from '@/types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const firebaseUserRef = useRef<FirebaseUser | null>(null);

  const generateInitials = (name: string): string => {
    return name
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase())
      .join('')
      .slice(0, 2);
  };

  const getFirebaseIdToken = useCallback(async (): Promise<string | null> => {
    const u = firebaseUserRef.current;
    if (!u) return null;
    try {
      return await u.getIdToken();
    } catch {
      return null;
    }
  }, []);

  const syncUserBootstrap = async (firebaseUser: FirebaseUser): Promise<User> => {
    const token = await firebaseUser.getIdToken();
    const res = await fetch('/api/auth/bootstrap', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: firebaseUser.displayName || '',
        photoURL: firebaseUser.photoURL || '',
      }),
    });
    const json = (await res.json().catch(() => ({}))) as { error?: string };
    if (!res.ok) throw new Error(json.error || res.statusText);
    return {
      id: firebaseUser.uid,
      email: firebaseUser.email!,
      name: firebaseUser.displayName || 'Unknown User',
      initials: generateInitials(firebaseUser.displayName || 'Unknown User'),
      photoURL: firebaseUser.photoURL || undefined,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  };

  const signInWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      provider.addScope('email');
      provider.addScope('profile');

      const result = await signInWithPopup(auth, provider);
      firebaseUserRef.current = result.user;
      try {
        await syncUserBootstrap(result.user);
      } catch {
        console.warn('[auth] Bootstrap API failed — ensure FIREBASE_SERVICE_ACCOUNT_JSON is set on the server');
      }
    } catch (error) {
      console.error('Error signing in with Google:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      firebaseUserRef.current = null;
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      firebaseUserRef.current = firebaseUser;

      if (firebaseUser) {
        try {
          const userData = await syncUserBootstrap(firebaseUser);
          setUser(userData);
        } catch {
          console.warn('[auth] Using client-only profile fallback (bootstrap/API unavailable)');
          setUser({
            id: firebaseUser.uid,
            email: firebaseUser.email!,
            name: firebaseUser.displayName || 'Unknown User',
            initials: generateInitials(firebaseUser.displayName || 'Unknown User'),
            photoURL: firebaseUser.photoURL || undefined,
            createdAt: new Date(),
            updatedAt: new Date(),
          });
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value: AuthContextType = {
    user,
    loading,
    signInWithGoogle,
    signOut,
    getFirebaseIdToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
