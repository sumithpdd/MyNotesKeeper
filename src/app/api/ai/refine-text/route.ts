/**
 * AI Refine Text — server-only Gemini wrapper for inline text enhancement.
 *
 * POST /api/ai/refine-text
 * Body: { text: string; action: 'expand' | 'refine' | 'elaborate'; context?: string }
 * Auth: Firebase Bearer ID token (workspace user). Authorization is required so the
 * billable Gemini key is never exposed to anonymous traffic.
 */

import { NextRequest, NextResponse } from 'next/server';
import { authorizeApiRequest } from '@/lib/server/authorizeApiRequest';
import { aiService } from '@/lib/ai';

type RefineAction = 'expand' | 'refine' | 'elaborate';

const ALLOWED_ACTIONS: ReadonlySet<RefineAction> = new Set(['expand', 'refine', 'elaborate']);

export async function POST(request: NextRequest) {
  const auth = await authorizeApiRequest(request);
  if (auth instanceof NextResponse) return auth;

  try {
    const body = (await request.json()) as {
      text?: string;
      action?: string;
      context?: string;
    };
    const text = typeof body.text === 'string' ? body.text : '';
    const action = body.action as RefineAction | undefined;
    const context = typeof body.context === 'string' ? body.context : undefined;

    if (!text.trim()) {
      return NextResponse.json({ success: false, error: 'text is required' }, { status: 400 });
    }
    if (!action || !ALLOWED_ACTIONS.has(action)) {
      return NextResponse.json(
        { success: false, error: 'action must be one of: expand, refine, elaborate' },
        { status: 400 },
      );
    }

    const refined = await aiService.refineText(text, action, context);
    return NextResponse.json({ success: true, text: refined });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'AI refine failed';
    console.error('POST /api/ai/refine-text', e);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
