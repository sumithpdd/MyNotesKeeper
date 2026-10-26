/**
 * POST /api/ai/company-research
 * Body: { customerId: string; extraFocus?: string }
 * Loads hub workspace context server-side, then drafts an About-the-company brief.
 */

import { NextRequest, NextResponse } from 'next/server';
import { authorizeApiRequest } from '@/lib/server/authorizeApiRequest';
import { loadWorkspaceSnapshot } from '@/lib/server/workspaceLoad';
import { aiService } from '@/lib/ai';
import { formatProductDisplayName } from '@/lib/productDisplay';

export async function POST(request: NextRequest) {
  const auth = await authorizeApiRequest(request);
  if (auth instanceof NextResponse) return auth;

  try {
    const body = (await request.json()) as { customerId?: string; extraFocus?: string };
    const customerId = typeof body.customerId === 'string' ? body.customerId.trim() : '';
    if (!customerId) {
      return NextResponse.json({ success: false, error: 'customerId is required' }, { status: 400 });
    }

    const workspace = await loadWorkspaceSnapshot({ uid: auth.uid, email: auth.email });
    const customer = workspace.customers.find((c) => c.id === customerId);
    if (!customer) {
      return NextResponse.json({ success: false, error: 'Customer not found in workspace' }, { status: 404 });
    }

    const profile = workspace.customerProfiles.find((p) => p.customerId === customerId);
    const notes = workspace.notes
      .filter((n) => n.customerId === customerId)
      .slice(0, 6)
      .map((n) => `- ${n.noteDate instanceof Date ? n.noteDate.toISOString().slice(0, 10) : ''}: ${(n.notes || '').slice(0, 280)}`)
      .join('\n');
    const opps = workspace.opportunities
      .filter((o) => o.customerId === customerId)
      .map((o) => `${o.opportunityName} (${o.currentStage})`)
      .join('; ');
    const useCases = [profile?.customerUseCase1, profile?.customerUseCase2, profile?.customerUseCase3]
      .filter((u) => u?.trim())
      .join('; ');

    const research = await aiService.generateCompanyResearch({
      customerName: customer.customerName,
      website: customer.website || customer.websiteUrls?.[0],
      products: (customer.products || []).map((p) => formatProductDisplayName(p)).join(', '),
      hostingLocation: customer.hostingLocation,
      compellingEvent: customer.compellingEvent,
      partners: (customer.partners || []).map((p) => p.name).join(', '),
      aboutCompany: customer.aboutCompany,
      businessProblem: profile?.businessProblem,
      whyUs: profile?.whyUs,
      whyNow: profile?.whyNow,
      useCases,
      recentNotes: notes,
      opportunities: opps,
      extraFocus: typeof body.extraFocus === 'string' ? body.extraFocus.slice(0, 800) : undefined,
    });

    return NextResponse.json({ success: true, research });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Company research failed';
    console.error('POST /api/ai/company-research', e);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
