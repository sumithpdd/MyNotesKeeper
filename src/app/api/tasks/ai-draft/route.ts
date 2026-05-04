import { randomUUID } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { authorizeApiRequest } from '@/lib/server/authorizeApiRequest';
import { aiService } from '@/lib/ai';
import type { TaskChecklistItem, TaskSubtask } from '@/types/task';

/** POST JSON { title; categoryName?; customerName?; opportunityName? } → AI draft with stable ids */
export async function POST(request: NextRequest) {
  const auth = await authorizeApiRequest(request);
  if (auth instanceof NextResponse) return auth;
  try {
    const body = (await request.json()) as {
      title?: string;
      categoryName?: string;
      customerName?: string;
      opportunityName?: string;
    };
    const title = body.title?.trim();
    if (!title) {
      return NextResponse.json({ success: false, error: 'title is required' }, { status: 400 });
    }
    const raw = await aiService.draftEngagementTaskStructured({
      title,
      categoryName: body.categoryName?.trim() || undefined,
      customerName: body.customerName?.trim() || undefined,
      opportunityName: body.opportunityName?.trim() || undefined,
    });

    const checklist: TaskChecklistItem[] = raw.checklist.map((label) => ({
      id: randomUUID(),
      label,
      done: false,
    }));

    const subtasks: TaskSubtask[] = raw.subtasks.map((t) => ({
      id: randomUUID(),
      title: t,
      done: false,
    }));

    return NextResponse.json({
      success: true,
      data: {
        description: raw.description,
        checklist,
        subtasks,
      },
    });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'AI draft failed';
    console.error('POST /api/tasks/ai-draft', e);
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
