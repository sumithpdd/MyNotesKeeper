import { NextRequest, NextResponse } from 'next/server';
import { customerService } from '@/lib/customerService';
import { authorizeApiRequest, forbidUserIdMismatch } from '@/lib/server/authorizeApiRequest';
import type { CreateCustomerData } from '@/types';

/**
 * API Route: /api/customers
 * When `FIREBASE_SERVICE_ACCOUNT_JSON` is set, requires `Authorization: Bearer <Firebase ID token>`.
 * For mutations, optional `userId` in body must equal the authenticated uid when auth is enforced.
 */

export async function GET(request: NextRequest) {
  const auth = await authorizeApiRequest(request);
  if (auth instanceof NextResponse) return auth;
  try {
    const customers = await customerService.getAllCustomers();
    return NextResponse.json({ success: true, data: customers });
  } catch (error: unknown) {
    console.error('GET /api/customers error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Server error' },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  const auth = await authorizeApiRequest(request);
  if (auth instanceof NextResponse) return auth;
  try {
    const body = await request.json();
    const { customer, userId }: { customer?: CreateCustomerData; userId?: string } = body;

    if (!customer || !userId) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    const forbidden = forbidUserIdMismatch(auth.uid, userId);
    if (forbidden) return forbidden;

    const customerId = await customerService.createCustomer(customer, userId);
    return NextResponse.json({
      success: true,
      data: { id: customerId, ...customer },
    });
  } catch (error: unknown) {
    console.error('POST /api/customers error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Server error' },
      { status: 500 },
    );
  }
}

export async function PUT(request: NextRequest) {
  const auth = await authorizeApiRequest(request);
  if (auth instanceof NextResponse) return auth;

  let body: { customerId?: string; customer?: Partial<CreateCustomerData>; userId?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid JSON body' }, { status: 400 });
  }

  try {
    const { customerId, customer, userId } = body;

    if (!customerId || !customer || !userId) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    const forbidden = forbidUserIdMismatch(auth.uid, userId);
    if (forbidden) return forbidden;

    await customerService.updateCustomer(customerId, customer, userId);
    return NextResponse.json({ success: true, data: customer });
  } catch (error: unknown) {
    console.error('PUT /api/customers error:', error);

    if (error instanceof Error && error.message?.includes('No document to update')) {
      try {
        const { customer, userId } = body;
        if (!customer || !userId) {
          return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
        }
        const forbidden = forbidUserIdMismatch(auth.uid, userId);
        if (forbidden) return forbidden;
        const newCustomerId = await customerService.createCustomer(customer as CreateCustomerData, userId);
        return NextResponse.json({
          success: true,
          data: { id: newCustomerId, ...customer },
          created: true,
        });
      } catch (createError: unknown) {
        return NextResponse.json(
          { success: false, error: createError instanceof Error ? createError.message : 'Server error' },
          { status: 500 },
        );
      }
    }

    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Server error' },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  const auth = await authorizeApiRequest(request);
  if (auth instanceof NextResponse) return auth;
  try {
    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get('id');

    if (!customerId) {
      return NextResponse.json({ success: false, error: 'Customer ID required' }, { status: 400 });
    }

    await customerService.deleteCustomer(customerId);
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error('DELETE /api/customers error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Server error' },
      { status: 500 },
    );
  }
}
