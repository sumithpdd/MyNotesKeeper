import { NextRequest, NextResponse } from 'next/server';
import { authorizeApiRequest } from '@/lib/server/authorizeApiRequest';
import { createTaskCategoryAdmin } from '@/lib/server/tasksAdmin';

export async function POST(request: NextRequest) {
  const auth = await authorizeApiRequest(request);
  if (auth instanceof NextResponse) return auth;
  try {
    const body = (await request.json()) as { name?: string; color?: string };
    if (!body.name?.trim()) {
      return NextResponse.json({ success: false, error: 'name required' }, { status: 400 });
    }
    const created = await createTaskCategoryAdmin({
      name: body.name.trim(),
      color: body.color,
    });
    return NextResponse.json({ success: true, data: created });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Failed to create category';
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
