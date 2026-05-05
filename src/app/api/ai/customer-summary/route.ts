/**
 * AI Customer Summary — server-only Gemini wrapper for the "Generate Summary" UI button.
 *
 * POST /api/ai/customer-summary
 * Body: customer fields used by `aiService.generateCustomerSummary`.
 * Auth: Firebase Bearer ID token. Authorization is required so the billable Gemini key
 * is never exposed to anonymous traffic.
 */

import { NextRequest, NextResponse } from 'next/server';
import { authorizeApiRequest } from '@/lib/server/authorizeApiRequest';
import { aiService } from '@/lib/ai';

type CustomerSummaryInput = {
  customerName?: string;
  products?: Array<{ name: string; version?: string }>;
  migrationComplexity?: string;
  perpetualOrSubscription?: string;
  hostingLocation?: string;
  compellingEvent?: string;
  existingMigrationOpp?: string;
  migrationNotes?: string;
  mergedNotes?: string;
};

export async function POST(request: NextRequest) {
  const auth = await authorizeApiRequest(request);
  if (auth instanceof NextResponse) return auth;

  try {
    const body = (await request.json()) as CustomerSummaryInput;

    const summary = await aiService.generateCustomerSummary({
      customerName: body.customerName,
      products: Array.isArray(body.products) ? body.products : undefined,
      migrationComplexity: body.migrationComplexity,
      perpetualOrSubscription: body.perpetualOrSubscription,
      hostingLocation: body.hostingLocation,
      compellingEvent: body.compellingEvent,
      existingMigrationOpp: body.existingMigrationOpp,
      migrationNotes: body.migrationNotes,
      mergedNotes: body.mergedNotes,
    });

    return NextResponse.json({ success: true, summary });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'AI customer summary failed';
    console.error('POST /api/ai/customer-summary', e);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
