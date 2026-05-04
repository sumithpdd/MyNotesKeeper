import { NextRequest, NextResponse } from 'next/server';
import { authorizeApiRequest } from '@/lib/server/authorizeApiRequest';
import type { EngagementTask } from '@/types/task';
import type { CreateEngagementTaskData } from '@/types/task';
import { categoryIdsFromTaskFields, type TaskCategoryPayload } from '@/lib/taskCategoryIds';
import {
  createEngagementTaskAdmin,
  deleteEngagementTaskAdmin,
  updateEngagementTaskAdmin,
  updateEngagementTasksBatchAdmin,
} from '@/lib/server/tasksAdmin';

/** POST creates; PUT updates one; PATCH Kanban batch; DELETE ?id= */
export async function POST(request: NextRequest) {
  const auth = await authorizeApiRequest(request);
  if (auth instanceof NextResponse) return auth;
  try {
    const body = (await request.json()) as { task: CreateEngagementTaskData };
    if (!body?.task?.title?.trim()) {
      return NextResponse.json({ success: false, error: 'Missing task.title' }, { status: 400 });
    }
    const payload = body.task as CreateEngagementTaskData & { categoryId?: string };
    const categoryIds = categoryIdsFromTaskFields(payload);
    if (categoryIds.length === 0) {
      return NextResponse.json({ success: false, error: 'Pick at least one category' }, { status: 400 });
    }
    const merged = { ...payload, categoryIds };
    const created = await createEngagementTaskAdmin(merged, auth.uid);
    return NextResponse.json({ success: true, data: created });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Failed to create task';
    console.error('POST /api/tasks', e);
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}

export async function PUT(request: NextRequest) {
  const auth = await authorizeApiRequest(request);
  if (auth instanceof NextResponse) return auth;
  try {
    const body = (await request.json()) as { task: EngagementTask };
    if (!body?.task?.id) {
      return NextResponse.json({ success: false, error: 'Missing task.id' }, { status: 400 });
    }
    const ids = categoryIdsFromTaskFields(body.task as TaskCategoryPayload);
    if (ids.length === 0) {
      return NextResponse.json({ success: false, error: 'Pick at least one category' }, { status: 400 });
    }
    const { categoryId: _omitLegacy, ...rest } = body.task as EngagementTask & { categoryId?: string };
    void _omitLegacy;
    const normalized: EngagementTask = { ...rest, categoryIds: ids };
    await updateEngagementTaskAdmin(normalized, auth.uid, auth.email);
    return NextResponse.json({ success: true, data: normalized });
  } catch (e: unknown) {
    const status = e instanceof Error && e.message === 'Forbidden' ? 403 : 400;
    const message = e instanceof Error ? e.message : 'Failed to update task';
    console.error('PUT /api/tasks', e);
    return NextResponse.json({ success: false, error: message }, { status });
  }
}

export async function PATCH(request: NextRequest) {
  const auth = await authorizeApiRequest(request);
  if (auth instanceof NextResponse) return auth;
  try {
    const body = (await request.json()) as { tasks?: EngagementTask[] };
    const raw = body.tasks;
    if (!Array.isArray(raw)) {
      return NextResponse.json({ success: false, error: 'Expected tasks array' }, { status: 400 });
    }
    const tasks = raw.map((t) => ({
      ...t,
      categoryIds: categoryIdsFromTaskFields(t as TaskCategoryPayload),
    }));
    await updateEngagementTasksBatchAdmin(tasks, auth.uid, auth.email);
    return NextResponse.json({ success: true });
  } catch (e: unknown) {
    const status = e instanceof Error && e.message === 'Forbidden' ? 403 : 400;
    const message = e instanceof Error ? e.message : 'Batch update failed';
    console.error('PATCH /api/tasks', e);
    return NextResponse.json({ success: false, error: message }, { status });
  }
}

export async function DELETE(request: NextRequest) {
  const auth = await authorizeApiRequest(request);
  if (auth instanceof NextResponse) return auth;
  const id = new URL(request.url).searchParams.get('id');
  if (!id) {
    return NextResponse.json({ success: false, error: 'id query required' }, { status: 400 });
  }
  try {
    await deleteEngagementTaskAdmin(id, auth.uid, auth.email);
    return NextResponse.json({ success: true });
  } catch (e: unknown) {
    const status = e instanceof Error && e.message === 'Forbidden' ? 403 : 400;
    const message = e instanceof Error ? e.message : 'Delete failed';
    console.error('DELETE /api/tasks', e);
    return NextResponse.json({ success: false, error: message }, { status });
  }
}
