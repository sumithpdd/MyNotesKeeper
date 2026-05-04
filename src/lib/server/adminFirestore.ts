import { getFirestore, type Firestore } from 'firebase-admin/firestore';
import { getFirebaseAdminApp } from '@/lib/server/firebaseAdmin';

/**
 * Throws if Firebase Admin isn’t configured. All persisted reads/writes for Hub data
 * should flow through Next.js routes using this (never the browser Firebase SDK).
 */
export function requireAdminFirestore(): Firestore {
  const app = getFirebaseAdminApp();
  if (!app) {
    throw new Error(
      'FIREBASE_SERVICE_ACCOUNT_JSON must be set to use secure server-side Firestore access.',
    );
  }
  return getFirestore(app);
}
