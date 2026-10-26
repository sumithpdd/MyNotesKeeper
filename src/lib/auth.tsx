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
  signInWithRedirect,
  getRedirectResult,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  GoogleAuthProvider,
} from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { User, AuthContextType } from '@/types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const BOOTSTRAP_TIMEOUT_MS = 12_000;
const POPUP_TIMEOUT_MS = 90_000;

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

function generateInitials(name: string): string {
  return name
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase())
    .join('')
    .slice(0, 2);
}

function hubUserFromFirebase(firebaseUser: FirebaseUser): User {
  const name = firebaseUser.displayName || 'Unknown User';
  return {
    id: firebaseUser.uid,
    email: firebaseUser.email!,
    name,
    initials: generateInitials(name),
    photoURL: firebaseUser.photoURL || undefined,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

function withTimeout<T>(promise: Promise<T>, ms: number, code: string): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      const err = new Error(code);
      (err as Error & { code?: string }).code = code;
      reject(err);
    }, ms);
    promise
      .then((v) => {
        clearTimeout(timer);
        resolve(v);
      })
      .catch((e) => {
        clearTimeout(timer);
        reject(e);
      });
  });
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const firebaseUserRef = useRef<FirebaseUser | null>(null);
  const redirectHandled = useRef(false);

  const getFirebaseIdToken = useCallback(async (): Promise<string | null> => {
    const u = firebaseUserRef.current;
    if (!u) return null;
    try {
      return await u.getIdToken();
    } catch {
      return null;
    }
  }, []);

  const syncUserBootstrap = useCallback(async (firebaseUser: FirebaseUser): Promise<User> => {
    const token = await firebaseUser.getIdToken();
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), BOOTSTRAP_TIMEOUT_MS);
    try {
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
        signal: controller.signal,
      });
      const json = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) throw new Error(json.error || res.statusText);
      return hubUserFromFirebase(firebaseUser);
    } finally {
      clearTimeout(timer);
    }
  }, []);

  const applyFirebaseUser = useCallback(
    (firebaseUser: FirebaseUser | null) => {
      firebaseUserRef.current = firebaseUser;
      if (!firebaseUser) {
        setUser(null);
        setLoading(false);
        return;
      }
      setUser(hubUserFromFirebase(firebaseUser));
      setLoading(false);
      void syncUserBootstrap(firebaseUser)
        .then(setUser)
        .catch(() => {
          console.warn('[auth] Bootstrap API failed — using client profile');
        });
    },
    [syncUserBootstrap],
  );

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    provider.addScope('email');
    provider.addScope('profile');
    provider.setCustomParameters({ prompt: 'select_account' });

    const useRedirect =
      typeof window !== 'undefined' && window.location.hostname !== 'localhost';

    if (useRedirect) {
      await signInWithRedirect(auth, provider);
      return;
    }

    try {
      await withTimeout(
        signInWithPopup(auth, provider),
        POPUP_TIMEOUT_MS,
        'auth/timeout',
      );
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
    let unsubscribe: (() => void) | undefined;

    void (async () => {
      if (!redirectHandled.current) {
        redirectHandled.current = true;
        try {
          await getRedirectResult(auth);
        } catch (e) {
          console.error('[auth] getRedirectResult failed:', e);
        }
      }
    })();

    try {
      unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
        applyFirebaseUser(firebaseUser);
      });
    } catch (e) {
      console.error('[auth] Firebase Auth failed to initialize:', e);
      setLoading(false);
    }

    return () => unsubscribe?.();
  }, [applyFirebaseUser]);

  const value: AuthContextType = {
    user,
    loading,
    signInWithGoogle,
    signOut,
    getFirebaseIdToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
