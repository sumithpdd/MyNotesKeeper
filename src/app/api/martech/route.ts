import { NextRequest, NextResponse } from 'next/server';
import { authorizeApiRequest } from '@/lib/server/authorizeApiRequest';
import {
  createMartechToolAdmin,
  deleteMartechToolAdmin,
  listMartechToolsAdmin,
  updateMartechToolAdmin,
} from '@/lib/server/martechToolsAdmin';
import type { MartechTool } from '@/types';

export async function GET(request: NextRequest) {
  const auth = await authorizeApiRequest(request);
  if (auth instanceof NextResponse) return auth;
  try {
    const data = await listMartechToolsAdmin();
    return NextResponse.json({ success: true, data });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Failed to load martech tools';
    console.error('GET /api/martech error:', e);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const auth = await authorizeApiRequest(request);
  if (auth instanceof NextResponse) return auth;
  try {
    const body = (await request.json()) as { tool?: Omit<MartechTool, 'id'> };
    const t = body.tool;
    if (!t?.name?.trim()) {
      return NextResponse.json({ success: false, error: 'name required' }, { status: 400 });
    }
    const created = await createMartechToolAdmin({
      name: t.name.trim(),
      purpose: typeof t.purpose === 'string' ? t.purpose : '',
    });
    return NextResponse.json({ success: true, data: created });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Create failed';
    console.error('POST /api/martech error:', e);
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
    if (!body.id?.trim()) {
      return NextResponse.json({ success: false, error: 'id required' }, { status: 400 });
    }
    await updateMartechToolAdmin(body.id.trim(), body.updates ?? {});
    return NextResponse.json({ success: true });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Update failed';
    const status =
      typeof message === 'string' && message.toLowerCase().includes('not found') ? 404 : 400;
    console.error('PUT /api/martech error:', e);
    return NextResponse.json({ success: false, error: message }, { status });
  }
}

export async function DELETE(request: NextRequest) {
  const auth = await authorizeApiRequest(request);
  if (auth instanceof NextResponse) return auth;
  const id = new URL(request.url).searchParams.get('id');
  if (!id?.trim()) {
    return NextResponse.json({ success: false, error: 'id query required' }, { status: 400 });
  }
  try {
    await deleteMartechToolAdmin(id.trim());
    return NextResponse.json({ success: true });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Delete failed';
    console.error('DELETE /api/martech error:', e);
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
