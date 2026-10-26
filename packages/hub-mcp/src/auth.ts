import { getAuth } from 'firebase-admin/auth';
import { getFirebaseAdminApp } from '../../../src/lib/server/firebaseAdmin';
import { resolveMcpAccessToken, type McpTokenScope } from '../../../src/lib/mcp/accessTokens';
import { getRequestCaller } from './requestContext';

export type McpCaller = {
  uid: string;
  email: string | null;
  scopes: McpTokenScope[];
};

export function scopesForHubUser(requested: McpTokenScope[]): McpTokenScope[] {
  const set = new Set(requested.filter((s) => s === 'read' || s === 'write'));
  if (set.size === 0) set.add('read');
  if (set.has('write')) set.add('read');
  return [...set];
}

async function callerFromBearer(token: string): Promise<McpCaller> {
  const opaque = await resolveMcpAccessToken(token);
  if (opaque) {
    return {
      uid: opaque.uid,
      email: opaque.email ?? null,
      scopes: scopesForHubUser(opaque.scopes),
    };
  }

  const app = getFirebaseAdminApp();
  if (!app) {
    throw new Error('Hub API unavailable — Firebase Admin not configured');
  }
  const decoded = await getAuth(app).verifyIdToken(token);
  return {
    uid: decoded.uid,
    email: decoded.email ?? null,
    scopes: ['read', 'write'],
  };
}

export async function resolveCallerFromBearer(
  authorizationHeader: string | undefined,
): Promise<McpCaller> {
  const raw = authorizationHeader?.trim() || '';
  const token = raw.startsWith('Bearer ') ? raw.slice(7).trim() : raw;
  if (!token) {
    throw new Error('Missing Authorization: Bearer <hubmcp_… or Firebase ID token>');
  }
  return callerFromBearer(token);
}

export async function resolveCaller(): Promise<McpCaller> {
  const fromRequest = getRequestCaller();
  if (fromRequest) return fromRequest;
  throw new Error('MCP caller context missing');
}

export function requireRead(caller: McpCaller): void {
  if (!caller.uid) throw new Error('Authentication required');
  if (!caller.scopes.includes('read')) {
    throw new Error('MCP read scope required');
  }
}

export function requireWrite(caller: McpCaller): void {
  requireRead(caller);
  if (!caller.scopes.includes('write')) {
    throw new Error('MCP write scope required — mint a token with write access on /mcp');
  }
}
