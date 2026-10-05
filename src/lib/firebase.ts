import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getAuth, type Auth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || '',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '',
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || '',
};

function getClientApp(): FirebaseApp | null {
  if (getApps().length > 0) return getApps()[0]!;
  const apiKey = firebaseConfig.apiKey?.trim();
  if (!apiKey) return null;
  return initializeApp(firebaseConfig);
}

let cachedDb: Firestore | null | undefined;
let cachedAuth: Auth | null | undefined;

/** Client Firestore — browser only when `NEXT_PUBLIC_FIREBASE_*` is configured. */
export function getClientDb(): Firestore {
  if (cachedDb !== undefined && cachedDb) return cachedDb;
  const app = getClientApp();
  if (!app) {
    throw new Error(
      'Firebase client is not configured. Set NEXT_PUBLIC_FIREBASE_* in the environment.',
    );
  }
  cachedDb = getFirestore(app);
  return cachedDb;
}

export function getClientAuth(): Auth {
  if (cachedAuth !== undefined && cachedAuth) return cachedAuth;
  const app = getClientApp();
  if (!app) {
    throw new Error(
      'Firebase client is not configured. Set NEXT_PUBLIC_FIREBASE_* in the environment.',
    );
  }
  cachedAuth = getAuth(app);
  return cachedAuth;
}

/** @deprecated Prefer getClientDb() — lazy init avoids build-time auth/invalid-api-key when env is missing. */
export const db = new Proxy({} as Firestore, {
  get(_target, prop) {
    return Reflect.get(getClientDb() as object, prop);
  },
});

/** @deprecated Prefer getClientAuth() */
export const auth = new Proxy({} as Auth, {
  get(_target, prop) {
    return Reflect.get(getClientAuth() as object, prop);
  },
});

export default getClientApp;
