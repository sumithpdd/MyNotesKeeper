import { NextRequest, NextResponse } from 'next/server';
import { customerService } from '@/lib/customerService';

/**
 * API Route: /api/customers
 * Handles customer CRUD operations
 */

// GET all customers
export async function GET(request: NextRequest) {
  try {
    const customers = await customerService.getAllCustomers();
    return NextResponse.json({ success: true, data: customers });
  } catch (error: any) {
    console.error('GET /api/customers error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// POST create new customer
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { customer, userId } = body;

    if (!customer || !userId) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const customerId = await customerService.createCustomer(customer, userId);
    return NextResponse.json({ 
      success: true, 
      data: { id: customerId, ...customer } 
    });
  } catch (error: any) {
    console.error('POST /api/customers error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// PUT update customer
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { customerId, customer, userId } = body;

    if (!customerId || !customer || !userId) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    await customerService.updateCustomer(customerId, customer, userId);
    return NextResponse.json({ success: true, data: customer });
  } catch (error: any) {
    console.error('PUT /api/customers error:', error);
    
    // Defensive: if document doesn't exist, try creating it
    if (error.message?.includes('No document to update')) {
      try {
        const body = await request.json();
        const { customer, userId } = body;
        const newCustomerId = await customerService.createCustomer(customer, userId);
        return NextResponse.json({ 
          success: true, 
          data: { id: newCustomerId, ...customer },
          created: true 
        });
      } catch (createError: any) {
        return NextResponse.json(
          { success: false, error: createError.message },
          { status: 500 }
        );
      }
    }
    
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// DELETE customer
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get('id');

    if (!customerId) {
      return NextResponse.json(
        { success: false, error: 'Customer ID required' },
        { status: 400 }
      );
    }

    await customerService.deleteCustomer(customerId);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('DELETE /api/customers error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
