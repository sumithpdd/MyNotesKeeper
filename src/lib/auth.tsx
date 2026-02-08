'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User as FirebaseUser,
  signInWithPopup, 
  signOut as firebaseSignOut,
  onAuthStateChanged,
  GoogleAuthProvider
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
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

  // Generate initials from name
  const generateInitials = (name: string): string => {
    return name
      .split(' ')
      .map(word => word.charAt(0).toUpperCase())
      .join('')
      .slice(0, 2);
  };

  // Create or update user document in Firestore
  const createUserDocument = async (firebaseUser: FirebaseUser): Promise<User> => {
    const userRef = doc(db, 'users', firebaseUser.uid);
    const userSnap = await getDoc(userRef);

    const userData: User = {
      id: firebaseUser.uid,
      email: firebaseUser.email!,
      name: firebaseUser.displayName || 'Unknown User',
      initials: generateInitials(firebaseUser.displayName || 'Unknown User'),
      photoURL: firebaseUser.photoURL || undefined,
      createdAt: userSnap.exists() ? userSnap.data().createdAt.toDate() : new Date(),
      updatedAt: new Date(),
    };

    if (!userSnap.exists()) {
      // Create new user document
      await setDoc(userRef, {
        ...userData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } else {
      // Update existing user document
      await setDoc(userRef, {
        ...userData,
        updatedAt: serverTimestamp(),
      }, { merge: true });
    }

    return userData;
  };

  const signInWithGoogle = async () => {
    try {
      console.log('Starting Google sign-in...');
      const provider = new GoogleAuthProvider();
      provider.addScope('email');
      provider.addScope('profile');
      
      const result = await signInWithPopup(auth, provider);
      console.log('Google sign-in successful:', result.user.email);
      
      try {
        await createUserDocument(result.user);
        console.log('User document created successfully');
      } catch (error) {
        console.warn('Could not create user document (Firestore permissions issue):', error);
        console.warn('User can still access the app, but data may not be saved');
      }
    } catch (error) {
      console.error('Error signing in with Google:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log('Auth state changed:', firebaseUser ? 'User logged in' : 'No user');
      
      if (firebaseUser) {
        try {
          console.log('Creating/updating user document for:', firebaseUser.email);
          const userData = await createUserDocument(firebaseUser);
          console.log('User document created successfully:', userData);
          setUser(userData);
        } catch (error) {
          console.error('Error creating user document:', error);
          console.error('This is likely a Firestore permissions issue. Check Firebase Console → Firestore → Rules');
          // Set user anyway with basic info so they can see the app
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
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
