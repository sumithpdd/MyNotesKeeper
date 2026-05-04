import { NextRequest, NextResponse } from 'next/server';
import { authorizeApiRequest } from '@/lib/server/authorizeApiRequest';
import { deleteTaskCategoryAdmin, updateTaskCategoryAdmin } from '@/lib/server/tasksAdmin';

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const auth = await authorizeApiRequest(request);
  if (auth instanceof NextResponse) return auth;
  const params = await context.params;
  const id = typeof params?.id === 'string' ? params.id.trim() : '';
  if (!id) return NextResponse.json({ success: false, error: 'id required' }, { status: 400 });
  try {
    const body = (await request.json()) as { name?: string; color?: string };
    if (body.name == null && body.color == null) {
      return NextResponse.json({ success: false, error: 'No updates' }, { status: 400 });
    }
    const updated = await updateTaskCategoryAdmin(id, body);
    return NextResponse.json({ success: true, data: updated });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Failed to update category';
    const status = typeof message === 'string' && message.toLowerCase().includes('not found') ? 404 : 400;
    return NextResponse.json({ success: false, error: message }, { status });
  }
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const auth = await authorizeApiRequest(request);
  if (auth instanceof NextResponse) return auth;
  const params = await context.params;
  const id = typeof params?.id === 'string' ? params.id.trim() : '';
  if (!id) return NextResponse.json({ success: false, error: 'id required' }, { status: 400 });
  let mergeIntoCategoryId: string | undefined;
  try {
    const body = (await request.json()) as { mergeIntoCategoryId?: string };
    if (typeof body?.mergeIntoCategoryId === 'string' && body.mergeIntoCategoryId.trim()) {
      mergeIntoCategoryId = body.mergeIntoCategoryId.trim();
    }
  } catch {
    /* empty or non-JSON body */
  }
  try {
    const actor = auth.email?.trim() || auth.uid;
    await deleteTaskCategoryAdmin(id, { mergeIntoCategoryId }, actor);
    return NextResponse.json({ success: true });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Failed to delete category';
    const status = typeof message === 'string' && /not found/i.test(message) ? 404 : 400;
    return NextResponse.json({ success: false, error: message }, { status });
  }
}
