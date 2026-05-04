import { NextRequest, NextResponse } from 'next/server';
import { customerContactService, internalContactService } from '@/lib/contactService';
import { authorizeApiRequest } from '@/lib/server/authorizeApiRequest';

/**
 * API Route: /api/contacts
 * Handles customer and internal contact management via Firebase
 */

// GET all contacts (customer or internal)
export async function GET(request: NextRequest) {
  const auth = await authorizeApiRequest(request);
  if (auth instanceof NextResponse) return auth;
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // 'customer' | 'internal'

    if (type === 'customer') {
      const data = await customerContactService.getAllCustomerContacts();
      return NextResponse.json({ success: true, data });
    }
    if (type === 'internal') {
      const data = await internalContactService.getAllInternalContacts();
      return NextResponse.json({ success: true, data });
    }

    return NextResponse.json(
      { success: false, error: 'Type parameter required: customer or internal' },
      { status: 400 }
    );
  } catch (error: any) {
    console.error('GET /api/contacts error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// POST create new contact
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { contact, type } = body; // type: 'customer' | 'internal'

    if (!contact || !type) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: contact, type' },
        { status: 400 }
      );
    }

    if (type === 'customer') {
      const { id, ...rest } = contact;
      const contactId = await customerContactService.createCustomerContact(rest);
      return NextResponse.json({ success: true, data: { id: contactId, ...rest } });
    }
    if (type === 'internal') {
      const { id, ...rest } = contact;
      const contactId = await internalContactService.createInternalContact(rest);
      return NextResponse.json({ success: true, data: { id: contactId, ...rest } });
    }

    return NextResponse.json(
      { success: false, error: 'Type must be customer or internal' },
      { status: 400 }
    );
  } catch (error: any) {
    console.error('POST /api/contacts error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// PUT update contact
export async function PUT(request: NextRequest) {
  const auth = await authorizeApiRequest(request);
  if (auth instanceof NextResponse) return auth;
  try {
    const body = await request.json();
    const { contact, type } = body;

    if (!contact || !contact.id || !type) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: contact.id, type' },
        { status: 400 }
      );
    }

    if (type === 'customer') {
      await customerContactService.updateCustomerContact(contact.id, contact);
      return NextResponse.json({ success: true, data: contact });
    }
    if (type === 'internal') {
      await internalContactService.updateInternalContact(contact.id, contact);
      return NextResponse.json({ success: true, data: contact });
    }

    return NextResponse.json(
      { success: false, error: 'Type must be customer or internal' },
      { status: 400 }
    );
  } catch (error: any) {
    console.error('PUT /api/contacts error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// DELETE contact
export async function DELETE(request: NextRequest) {
  const auth = await authorizeApiRequest(request);
  if (auth instanceof NextResponse) return auth;
  try {
    const { searchParams } = new URL(request.url);
    const contactId = searchParams.get('id');
    const type = searchParams.get('type');

    if (!contactId || !type) {
      return NextResponse.json(
        { success: false, error: 'Contact ID and type required' },
        { status: 400 }
      );
    }

    if (type === 'customer') {
      await customerContactService.deleteCustomerContact(contactId);
    } else if (type === 'internal') {
      await internalContactService.deleteInternalContact(contactId);
    } else {
      return NextResponse.json(
        { success: false, error: 'Type must be customer or internal' },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('DELETE /api/contacts error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
