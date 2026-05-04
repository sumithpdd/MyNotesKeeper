import { NextRequest, NextResponse } from 'next/server';
import { authorizeApiRequest } from '@/lib/server/authorizeApiRequest';
import { loadWorkspaceSnapshot } from '@/lib/server/workspaceLoad';

/**
 * Canonical read model for the hub UI — tenants are enforced server-side.
 */
export async function GET(request: NextRequest) {
  const auth = await authorizeApiRequest(request);
  if (auth instanceof NextResponse) return auth;
  try {
    const snapshot = await loadWorkspaceSnapshot({ uid: auth.uid, email: auth.email });
    return NextResponse.json({ success: true, data: snapshot });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Failed to load workspace';
    console.error('GET /api/workspace:', e);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
