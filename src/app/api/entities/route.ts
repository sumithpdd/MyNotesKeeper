import { NextRequest, NextResponse } from 'next/server';
import { productService } from '@/lib/productService';
import { partnerService } from '@/lib/partnerService';
import { authorizeApiRequest } from '@/lib/server/authorizeApiRequest';

/**
 * API Route: /api/entities
 * Handles products and partners management via Firebase
 */

// GET all entities (products or partners)
export async function GET(request: NextRequest) {
  const auth = await authorizeApiRequest(request);
  if (auth instanceof NextResponse) return auth;
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // 'products' | 'partners'

    if (type === 'products') {
      const data = await productService.getAllProducts();
      return NextResponse.json({ success: true, data });
    }
    if (type === 'partners') {
      const data = await partnerService.getAllPartners();
      return NextResponse.json({ success: true, data });
    }

    return NextResponse.json(
      { success: false, error: 'Type parameter required: products or partners' },
      { status: 400 }
    );
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
  const auth = await authorizeApiRequest(request);
  if (auth instanceof NextResponse) return auth;
  try {
    const body = await request.json();
    const { entity, type } = body; // type: 'product' | 'partner'

    if (!entity || !type) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: entity, type' },
        { status: 400 }
      );
    }

    if (!entity.name) {
      return NextResponse.json(
        { success: false, error: 'Entity must have name' },
        { status: 400 }
      );
    }

    if (type === 'product') {
      const productData = {
        name: entity.name,
        version: entity.version || '',
        description: entity.description || '',
        website: typeof entity.website === 'string' ? entity.website.trim() || '' : '',
        status: entity.status || 'Active',
      };
      const id = await productService.createProduct(productData);
      return NextResponse.json({ success: true, data: { id, ...productData } });
    }
    if (type === 'partner') {
      const partnerData = {
        name: entity.name,
        type: entity.type || '',
        website: entity.website || '',
      };
      const id = await partnerService.createPartner(partnerData);
      return NextResponse.json({ success: true, data: { id, ...partnerData } });
    }

    return NextResponse.json(
      { success: false, error: 'Type must be product or partner' },
      { status: 400 }
    );
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
  const auth = await authorizeApiRequest(request);
  if (auth instanceof NextResponse) return auth;
  try {
    const body = await request.json();
    const { entity, type } = body;

    if (!entity || !entity.id || !type) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: entity.id, type' },
        { status: 400 }
      );
    }

    if (type === 'product') {
      const { id, ...updates } = entity as Record<string, unknown> & { id: string };
      await productService.updateProduct(id, updates);
      return NextResponse.json({ success: true, data: entity });
    }
    if (type === 'partner') {
      await partnerService.updatePartner(entity.id, entity);
      return NextResponse.json({ success: true, data: entity });
    }

    return NextResponse.json(
      { success: false, error: 'Type must be product or partner' },
      { status: 400 }
    );
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
  const auth = await authorizeApiRequest(request);
  if (auth instanceof NextResponse) return auth;
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

    if (type === 'product') {
      await productService.deleteProduct(entityId);
    } else if (type === 'partner') {
      await partnerService.deletePartner(entityId);
    } else {
      return NextResponse.json(
        { success: false, error: 'Type must be product or partner' },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('DELETE /api/entities error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
