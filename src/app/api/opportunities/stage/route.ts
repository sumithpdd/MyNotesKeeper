import { NextRequest, NextResponse } from 'next/server';
import { opportunityService } from '@/lib/opportunityService';
import { authorizeApiRequest } from '@/lib/server/authorizeApiRequest';
import { OpportunityStage } from '@/types';

/**
 * API Route: /api/opportunities/stage
 * Handles opportunity stage changes with history tracking
 */

export async function POST(request: NextRequest) {
  const auth = await authorizeApiRequest(request);
  if (auth instanceof NextResponse) return auth;
  try {
    const body = await request.json();
    const { opportunityId, newStage, userEmail, notes } = body;

    if (!opportunityId || !newStage || !userEmail) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: opportunityId, newStage, userEmail' },
        { status: 400 }
      );
    }

    // Get the opportunity
    const opportunity = await opportunityService.getOpportunityById(opportunityId);
    
    if (!opportunity) {
      return NextResponse.json(
        { success: false, error: 'Opportunity not found' },
        { status: 404 }
      );
    }

    // Change stage with history tracking
    await opportunityService.changeStage(
      opportunity,
      newStage as OpportunityStage,
      userEmail,
      notes
    );

    // Get updated opportunity
    const updatedOpportunity = await opportunityService.getOpportunityById(opportunityId);

    return NextResponse.json({ success: true, data: updatedOpportunity });
  } catch (error: any) {
    console.error('POST /api/opportunities/stage error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
