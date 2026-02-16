import { NextRequest, NextResponse } from 'next/server';
import { opportunityService } from '@/lib/opportunityService';

/**
 * API Route: /api/opportunities
 * Handles opportunity CRUD operations and stage changes
 */

// GET all opportunities or opportunities for specific customer
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get('customerId');
    const opportunityId = searchParams.get('id');

    if (opportunityId) {
      const opportunity = await opportunityService.getOpportunityById(opportunityId);
      return NextResponse.json({ success: true, data: opportunity });
    } else if (customerId) {
      // Get opportunities for specific customer
      const allOpportunities = await opportunityService.getAllOpportunities();
      const customerOpportunities = allOpportunities.filter(o => o.customerId === customerId);
      return NextResponse.json({ success: true, data: customerOpportunities });
    } else {
      const opportunities = await opportunityService.getAllOpportunities();
      return NextResponse.json({ success: true, data: opportunities });
    }
  } catch (error: any) {
    console.error('GET /api/opportunities error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// POST create new opportunity
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { opportunity } = body;

    if (!opportunity) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const newOpportunity = await opportunityService.createOpportunity(opportunity);
    return NextResponse.json({ success: true, data: newOpportunity });
  } catch (error: any) {
    console.error('POST /api/opportunities error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// PUT update opportunity
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { opportunity } = body;

    if (!opportunity || !opportunity.id) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    await opportunityService.updateOpportunity(opportunity);
    return NextResponse.json({ success: true, data: opportunity });
  } catch (error: any) {
    console.error('PUT /api/opportunities error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// DELETE opportunity
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const opportunityId = searchParams.get('id');
    const customerId = searchParams.get('customerId');

    if (customerId) {
      // Delete all opportunities for a customer
      await opportunityService.deleteOpportunitiesByCustomer(customerId);
      return NextResponse.json({ success: true });
    } else if (opportunityId) {
      await opportunityService.deleteOpportunity(opportunityId);
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json(
        { success: false, error: 'Opportunity ID or Customer ID required' },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error('DELETE /api/opportunities error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
