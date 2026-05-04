import { NextRequest, NextResponse } from 'next/server';
import { Timestamp } from 'firebase-admin/firestore';
import { authorizeApiRequest, forbidUserIdMismatch } from '@/lib/server/authorizeApiRequest';
import { requireAdminFirestore } from '@/lib/server/adminFirestore';

const DATE_FIELDS = new Set(['latestDemoDate', 'seNotesLastUpdated', 'createdAt', 'updatedAt']);

/**
 * PATCH /api/customer-profiles — merges profile fields via Admin SDK.
 */
export async function PATCH(request: NextRequest) {
  const auth = await authorizeApiRequest(request);
  if (auth instanceof NextResponse) return auth;
  try {
    const body = (await request.json()) as {
      profileId?: string;
      userId?: string;
      patch?: Record<string, unknown>;
    };

    const { profileId, userId, patch } = body;
    if (!profileId || !userId || !patch) {
      return NextResponse.json({ success: false, error: 'profileId, userId, patch required' }, { status: 400 });
    }

    const forbidden = forbidUserIdMismatch(auth.uid, userId);
    if (forbidden) return forbidden;

    const db = requireAdminFirestore();
    const prefRef = db.collection('customerProfiles').doc(profileId);
    const prefSnap = await prefRef.get();
    if (!prefSnap.exists) {
      return NextResponse.json({ success: false, error: 'Profile not found' }, { status: 404 });
    }
    const customerId = prefSnap.data()?.customerId as string | undefined;
    if (!customerId) {
      return NextResponse.json({ success: false, error: 'Invalid profile' }, { status: 400 });
    }
    const custSnap = await db.collection('customers').doc(customerId).get();
    if (!custSnap.exists || custSnap.data()?.createdBy !== auth.uid) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    const scrubbed: Record<string, unknown> = { ...patch };
    delete scrubbed.id;
    delete scrubbed.customerId;

    const updateData: Record<string, unknown> = {};
    Object.entries(scrubbed).forEach(([k, v]) => {
      if (v === undefined) return;
      if (DATE_FIELDS.has(k)) {
        if (typeof v === 'string' || typeof v === 'number') updateData[k] = Timestamp.fromDate(new Date(v));
      } else {
        updateData[k] = v;
      }
    });

    updateData.updatedBy = userId;
    updateData.updatedAt = Timestamp.now();

    await prefRef.update(updateData);

    return NextResponse.json({ success: true });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Patch failed';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
