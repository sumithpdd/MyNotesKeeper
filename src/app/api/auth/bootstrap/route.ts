import { NextRequest, NextResponse } from 'next/server';
import { Timestamp } from 'firebase-admin/firestore';
import { authorizeApiRequest } from '@/lib/server/authorizeApiRequest';
import { requireAdminFirestore } from '@/lib/server/adminFirestore';

/**
 * Creates/merges `/users/{uid}` via Admin SDK so the browser never needs Firestore write access.
 */
export async function POST(request: NextRequest) {
  const auth = await authorizeApiRequest(request);
  if (auth instanceof NextResponse) return auth;
  try {
    let body: { name?: string; photoURL?: string } = {};
    try {
      body = await request.json();
    } catch {
      body = {};
    }
    const db = requireAdminFirestore();
    const ref = db.collection('users').doc(auth.uid);
    const snap = await ref.get();
    const now = Timestamp.now();
    const nameFromBody = typeof body.name === 'string' ? body.name.trim() : '';
    const photoFromBody = typeof body.photoURL === 'string' ? body.photoURL.trim() : '';

    const email = auth.email ?? '';
    const nextName = nameFromBody || (snap.exists ? String(snap.data()?.name ?? '') : '') || 'Unknown User';
    const displayNameInitials = (name: string) =>
      name
        .split(' ')
        .map((w) => w.charAt(0).toUpperCase())
        .join('')
        .slice(0, 2);

    await ref.set(
      {
        id: auth.uid,
        email,
        name: nextName,
        initials: displayNameInitials(nextName),
        ...(photoFromBody ? { photoURL: photoFromBody } : {}),
        updatedAt: now,
        ...(snap.exists ? {} : { createdAt: now }),
      },
      { merge: true },
    );

    return NextResponse.json({ success: true });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Bootstrap failed';
    console.error('POST /api/auth/bootstrap:', e);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
