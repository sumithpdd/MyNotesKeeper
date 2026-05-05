/**
 * AI Chatbot Parse — server-only wrapper that runs detectIntent + parseInput +
 * generateConfirmation as a single round trip for the natural-language chatbot UI.
 *
 * POST /api/ai/chatbot/parse
 * Body: { input: string; customerNames?: string[] }
 * Auth: Firebase Bearer ID token. Authorization is required so the billable Gemini key
 * is never exposed to anonymous traffic.
 */

import { NextRequest, NextResponse } from 'next/server';
import { authorizeApiRequest } from '@/lib/server/authorizeApiRequest';
import { chatbotAI } from '@/lib/chatbotAI';
import { chatbotPrompts } from '@/lib/chatbotPrompts';

export async function POST(request: NextRequest) {
  const auth = await authorizeApiRequest(request);
  if (auth instanceof NextResponse) return auth;

  try {
    const body = (await request.json()) as {
      input?: string;
      customerNames?: string[];
    };
    const input = typeof body.input === 'string' ? body.input.trim() : '';
    if (!input) {
      return NextResponse.json({ success: false, error: 'input is required' }, { status: 400 });
    }

    const customerNames = Array.isArray(body.customerNames)
      ? body.customerNames.filter((n): n is string => typeof n === 'string')
      : undefined;

    const detectedPrompt = await chatbotAI.detectIntent(input, chatbotPrompts);
    const parsed = await chatbotAI.parseInput(input, detectedPrompt || undefined, customerNames);
    const confirmation = await chatbotAI.generateConfirmation(parsed);

    return NextResponse.json({ success: true, parsed, confirmation });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'AI chatbot parse failed';
    console.error('POST /api/ai/chatbot/parse', e);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
