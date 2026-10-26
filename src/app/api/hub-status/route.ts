import { NextResponse } from 'next/server';
import { isFirebaseAdminConfigured } from '@/lib/server/firebaseAdmin';

export const dynamic = 'force-dynamic';

/** Public sanity check — no secrets. Helps diagnose blank hub after Google sign-in. */
export async function GET() {
  const adminConfigured = isFirebaseAdminConfigured();
  return NextResponse.json({
    success: true,
    adminConfigured,
    message: adminConfigured
      ? 'Hub API ready'
      : 'Hub API unavailable — set FIREBASE_SERVICE_ACCOUNT_JSON on the server and redeploy',
  });
}
