import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { isFirebaseAdminConfigured, verifyFirebaseBearer, type VerifiedHubUser } from './firebaseAdmin';

export type AuthorizedHubUser = VerifiedHubUser;

export { type VerifiedHubUser };

/**
 * Requires Firebase Admin SDK + Bearer ID token. Hub data endpoints must not bypass this.
 */
export async function authorizeApiRequest(
  request: NextRequest,
): Promise<AuthorizedHubUser | NextResponse> {
  if (!isFirebaseAdminConfigured()) {
    return NextResponse.json(
      {
        success: false,
        error:
          'Hub API unavailable: set FIREBASE_SERVICE_ACCOUNT_JSON or FIREBASE_SERVICE_ACCOUNT_PATH ' +
          '(Firebase service account) on the server. See docs/SETUP.md.',
      },
      { status: 503 },
    );
  }

  const user = await verifyFirebaseBearer(request);
  if (!user) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized — send Authorization: Bearer <Firebase ID token>' },
      { status: 401 },
    );
  }
  return user;
}

export function forbidUserIdMismatch(jwtUid: string, declaredUserId: string | undefined): NextResponse | null {
  if (!declaredUserId || declaredUserId !== jwtUid) {
    return NextResponse.json({ success: false, error: 'userId must match authenticated user' }, { status: 403 });
  }
  return null;
}
