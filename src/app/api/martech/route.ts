import { NextRequest, NextResponse } from 'next/server';
import { Timestamp } from 'firebase-admin/firestore';
import { authorizeApiRequest } from '@/lib/server/authorizeApiRequest';
import { requireAdminFirestore } from '@/lib/server/adminFirestore';
import type { MartechTool } from '@/types';

export async function POST(request: NextRequest) {
  const auth = await authorizeApiRequest(request);
  if (auth instanceof NextResponse) return auth;
  try {
    const body = (await request.json()) as { tool: Omit<MartechTool, 'id'> };
    const t = body.tool;
    if (!t?.name?.trim()) return NextResponse.json({ success: false, error: 'name required' }, { status: 400 });
    const db = requireAdminFirestore();
    const now = Timestamp.now();
    const ref = await db.collection('martechTools').add({
      name: t.name.trim(),
      purpose: t.purpose?.trim() || '',
      createdAt: now,
      updatedAt: now,
    });
    return NextResponse.json({ success: true, data: { id: ref.id, ...t } });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Create failed';
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}

export async function PUT(request: NextRequest) {
  const auth = await authorizeApiRequest(request);
  if (auth instanceof NextResponse) return auth;
  try {
    const body = (await request.json()) as {
      id?: string;
      updates?: Partial<Omit<MartechTool, 'id'>>;
    };
    if (!body.id) return NextResponse.json({ success: false, error: 'id required' }, { status: 400 });
    const db = requireAdminFirestore();
    await db.collection('martechTools').doc(body.id).update({
      ...body.updates,
      updatedAt: Timestamp.now(),
    });
    return NextResponse.json({ success: true });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Update failed';
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}

export async function DELETE(request: NextRequest) {
  const auth = await authorizeApiRequest(request);
  if (auth instanceof NextResponse) return auth;
  const id = new URL(request.url).searchParams.get('id');
  if (!id) return NextResponse.json({ success: false, error: 'id query required' }, { status: 400 });
  try {
    const db = requireAdminFirestore();
    await db.collection('martechTools').doc(id).delete();
    return NextResponse.json({ success: true });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Delete failed';
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
