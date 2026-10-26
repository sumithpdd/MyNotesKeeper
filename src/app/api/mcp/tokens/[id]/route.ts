/**
 * DELETE /api/mcp/tokens/[id] — revoke caller's MCP access token
 */

import { NextRequest, NextResponse } from 'next/server';
import { authorizeApiRequest } from '@/lib/server/authorizeApiRequest';
import { revokeMcpAccessToken } from '@/lib/mcp/accessTokens';

export const dynamic = 'force-dynamic';

type Ctx = { params: Promise<{ id: string }> };

export async function DELETE(request: NextRequest, ctx: Ctx) {
  const auth = await authorizeApiRequest(request);
  if (auth instanceof NextResponse) return auth;
  const { id } = await ctx.params;

  try {
    const okRevoke = await revokeMcpAccessToken(id, { uid: auth.uid });
    if (!okRevoke) {
      return NextResponse.json({ success: false, error: 'Token not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, id, revoked: true });
  } catch (e) {
    if (e instanceof Error && e.message === 'Forbidden') {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }
    console.error(`DELETE /api/mcp/tokens/${id}`, e);
    return NextResponse.json({ success: false, error: 'Failed to revoke token' }, { status: 500 });
  }
}
