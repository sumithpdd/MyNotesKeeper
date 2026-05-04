import { readFileSync } from 'fs';
import path from 'path';
import { initializeApp, getApps, cert, type App } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import type { NextRequest } from 'next/server';

let cachedApp: App | null | undefined;

/**
 * Raw service account JSON string: either `FIREBASE_SERVICE_ACCOUNT_JSON` (single line, for Vercel etc.)
 * or file contents from `FIREBASE_SERVICE_ACCOUNT_PATH` (recommended for local dev).
 */
function getServiceAccountJsonString(): string | null {
  const inline = process.env.FIREBASE_SERVICE_ACCOUNT_JSON?.trim();
  if (inline) return inline;

  const filePath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH?.trim();
  if (!filePath || typeof window !== 'undefined') return null;

  try {
    const resolved = path.isAbsolute(filePath) ? filePath : path.join(process.cwd(), filePath);
    return readFileSync(resolved, 'utf8').trim();
  } catch (e) {
    console.error('[firebase-admin] Failed to read FIREBASE_SERVICE_ACCOUNT_PATH:', filePath, e);
    return null;
  }
}

/**
 * Singleton Firebase Admin app for API route handlers (Firestore rules bypass via client SDK routes is separate).
 * Configure with **`FIREBASE_SERVICE_ACCOUNT_JSON`** (inline) or **`FIREBASE_SERVICE_ACCOUNT_PATH`** (path to `.json` file).
 */
export function getFirebaseAdminApp(): App | null {
  if (cachedApp !== undefined) return cachedApp;
  cachedApp = null;

  try {
    if (typeof window !== 'undefined') return null;

    const json = getServiceAccountJsonString();
    if (!json) return null;

    const serviceAccount = JSON.parse(json) as Record<string, string>;

    if (getApps().length > 0) {
      cachedApp = getApps()[0]!;
      return cachedApp;
    }

    cachedApp = initializeApp({
      credential: cert(serviceAccount),
    });
    return cachedApp;
  } catch (e) {
    console.error('[firebase-admin] Failed to initialize:', e);
    cachedApp = null;
    return null;
  }
}

export function isFirebaseAdminConfigured(): boolean {
  return getFirebaseAdminApp() !== null;
}

function extractBearerToken(request: NextRequest): string | null {
  const h = request.headers.get('authorization');
  if (!h?.startsWith('Bearer ')) return null;
  return h.slice(7).trim() || null;
}

export type VerifiedHubUser = {
  uid: string;
  email: string | null;
};

/** Verifies a Firebase ID token when Admin SDK is configured; otherwise returns null. */
export async function verifyFirebaseBearer(
  request: NextRequest,
): Promise<VerifiedHubUser | null> {
  const app = getFirebaseAdminApp();
  const token = extractBearerToken(request);
  if (!app || !token) return null;
  try {
    const decoded = await getAuth(app).verifyIdToken(token);
    return { uid: decoded.uid, email: decoded.email ?? null };
  } catch {
    return null;
  }
}
