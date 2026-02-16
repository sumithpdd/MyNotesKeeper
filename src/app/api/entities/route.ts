import { NextRequest, NextResponse } from 'next/server';
import { Product, Partner } from '@/types';

/**
 * API Route: /api/entities
 * Handles products and partners management
 * Note: Currently uses in-memory state, can be extended to Firebase collections
 */

// GET all entities (products or partners)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // 'products' | 'partners'

    if (!type) {
      return NextResponse.json(
        { success: false, error: 'Type parameter required (products or partners)' },
        { status: 400 }
      );
    }

    // TODO: Implement Firebase queries
    // const entities = await entityService.getAll(type);
    
    return NextResponse.json({ 
      success: true, 
      data: [],
      message: `${type} are currently managed in client state. Firebase integration pending.` 
    });
  } catch (error: any) {
    console.error('GET /api/entities error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// POST create new entity
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { entity, type } = body; // type: 'product' | 'partner'

    if (!entity || !type) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: entity, type' },
        { status: 400 }
      );
    }

    // Validate entity structure
    if (!entity.id || !entity.name) {
      return NextResponse.json(
        { success: false, error: 'Entity must have id and name' },
        { status: 400 }
      );
    }

    // TODO: Implement Firebase collection save
    // const entityId = await entityService.create(entity, type);

    return NextResponse.json({ 
      success: true, 
      data: entity,
      message: `${type} creation will be implemented with Firebase collections` 
    });
  } catch (error: any) {
    console.error('POST /api/entities error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// PUT update entity
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { entity, type } = body;

    if (!entity || !entity.id || !type) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // TODO: Implement Firebase update
    
    return NextResponse.json({ 
      success: true, 
      data: entity,
      message: `${type} update will be implemented with Firebase collections` 
    });
  } catch (error: any) {
    console.error('PUT /api/entities error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// DELETE entity
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const entityId = searchParams.get('id');
    const type = searchParams.get('type');

    if (!entityId || !type) {
      return NextResponse.json(
        { success: false, error: 'Entity ID and type required' },
        { status: 400 }
      );
    }

    // TODO: Implement Firebase delete
    
    return NextResponse.json({ 
      success: true,
      message: `${type} deletion will be implemented with Firebase collections` 
    });
  } catch (error: any) {
    console.error('DELETE /api/entities error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
