'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { UserHeader } from '@/components/UserHeader';

type TokenMeta = {
  id: string;
  scopes: string[];
  label: string;
  createdAt: string;
  expiresAt: string;
  revoked: boolean;
  lastUsedAt?: string;
};

type Minted = {
  token: string;
  tokenId: string;
  scopes: string[];
  expiresAt: string;
  label: string;
  warning?: string;
};

const MCP_HTTP_URL =
  process.env.NEXT_PUBLIC_MCP_HTTP_URL?.trim() ||
  (typeof window !== 'undefined' ? `${window.location.origin}/api/mcp` : '/api/mcp');

export default function McpTokensPage() {
  const { user, getFirebaseIdToken } = useAuth();
  const [tokens, setTokens] = useState<TokenMeta[]>([]);
  const [busy, setBusy] = useState(false);
  const [minted, setMinted] = useState<Minted | null>(null);
  const [label, setLabel] = useState('claude-desktop');
  const [readOnly, setReadOnly] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const authHeader = useCallback(async () => {
    const token = await getFirebaseIdToken();
    if (!token) throw new Error('Sign in required');
    return { Authorization: `Bearer ${token}` };
  }, [getFirebaseIdToken]);

  const load = useCallback(async () => {
    if (!user) return;
    try {
      const headers = await authHeader();
      const res = await fetch('/api/mcp/tokens', { headers });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || 'Failed to load');
      setTokens(json.tokens || []);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load tokens');
    }
  }, [user, authHeader]);

  useEffect(() => {
    void load();
  }, [load]);

  async function mint() {
    setBusy(true);
    setMinted(null);
    setError(null);
    try {
      const headers = await authHeader();
      const scopes = readOnly ? ['read'] : (['read', 'write'] as const);
      const res = await fetch('/api/mcp/tokens', {
        method: 'POST',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({ label, scopes }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || 'Mint failed');
      setMinted(json);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Mint failed');
    } finally {
      setBusy(false);
    }
  }

  async function revoke(id: string) {
    setBusy(true);
    setError(null);
    try {
      const headers = await authHeader();
      const res = await fetch(`/api/mcp/tokens/${id}`, { method: 'DELETE', headers });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || 'Revoke failed');
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Revoke failed');
    } finally {
      setBusy(false);
    }
  }

  async function copy(text: string) {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      /* ignore */
    }
  }

  const connectorJson = minted
    ? JSON.stringify(
        {
          mcpServers: {
            'customer-engagement-hub': {
              url: MCP_HTTP_URL,
              headers: { Authorization: `Bearer ${minted.token}` },
            },
          },
        },
        null,
        2,
      )
    : '';

  return (
    <div className="min-h-screen bg-gray-50">
      <UserHeader />
      <main className="max-w-3xl mx-auto px-4 py-8 space-y-8">
        <div>
          <Link href="/" className="text-sm text-blue-600 hover:underline">
            ← Back to hub
          </Link>
          <h1 className="text-2xl font-semibold text-gray-900 mt-2">Connect an LLM (MCP)</h1>
          <p className="text-gray-600 mt-2 text-sm leading-relaxed">
            Use Claude, ChatGPT, Cursor, or Copilot as a client against this hub. Tokens are scoped to
            your Firebase user — same data rules as the web app. Gemini runs only on the server; never
            put hub or Firebase secrets into the LLM client config.
          </p>
        </div>

        <section className="bg-white border border-gray-200 rounded-lg p-5 space-y-4">
          <h2 className="font-medium text-gray-900">Hosted MCP URL</h2>
          <code className="block text-sm bg-gray-100 p-3 rounded break-all">{MCP_HTTP_URL}</code>
          <p className="text-xs text-gray-500">
            Set <code className="text-gray-700">NEXT_PUBLIC_MCP_HTTP_URL</code> in Vercel if you use a
            custom domain.
          </p>
        </section>

        <section className="bg-white border border-gray-200 rounded-lg p-5 space-y-4">
          <h2 className="font-medium text-gray-900">Mint access token</h2>
          <label className="block text-sm">
            <span className="text-gray-700">Label</span>
            <input
              className="mt-1 w-full border border-gray-300 rounded px-3 py-2 text-sm"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
            />
          </label>
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input type="checkbox" checked={readOnly} onChange={(e) => setReadOnly(e.target.checked)} />
            Read-only token (no add note / create task tools)
          </label>
          <button
            type="button"
            disabled={busy || !user}
            onClick={() => void mint()}
            className="px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {busy ? 'Working…' : 'Create token'}
          </button>
          {error && <p className="text-sm text-red-600">{error}</p>}
          {minted && (
            <div className="space-y-2 border-t pt-4">
              <p className="text-sm text-amber-800 bg-amber-50 p-2 rounded">{minted.warning}</p>
              <p className="text-xs text-gray-500">Token (shown once)</p>
              <code className="block text-xs bg-gray-100 p-2 rounded break-all">{minted.token}</code>
              <button
                type="button"
                className="text-sm text-blue-600"
                onClick={() => void copy(minted.token)}
              >
                Copy token
              </button>
              <p className="text-xs text-gray-500 mt-4">Example connector config</p>
              <pre className="text-xs bg-gray-900 text-green-200 p-3 rounded overflow-x-auto">
                {connectorJson}
              </pre>
              <button
                type="button"
                className="text-sm text-blue-600"
                onClick={() => void copy(connectorJson)}
              >
                Copy JSON
              </button>
            </div>
          )}
        </section>

        <section className="bg-white border border-gray-200 rounded-lg p-5">
          <h2 className="font-medium text-gray-900 mb-3">Your tokens</h2>
          {tokens.length === 0 ? (
            <p className="text-sm text-gray-500">No active tokens.</p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {tokens.map((t) => (
                <li key={t.id} className="py-3 flex justify-between gap-4 text-sm">
                  <div>
                    <p className="font-medium text-gray-900">{t.label}</p>
                    <p className="text-gray-500">
                      {t.scopes.join(', ')} · expires {new Date(t.expiresAt).toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => void revoke(t.id)}
                    className="text-red-600 hover:underline shrink-0"
                  >
                    Revoke
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        <p className="text-xs text-gray-500">
          Guides: <code className="text-gray-700">docs/MCP.md</code>,{' '}
          <code className="text-gray-700">docs/MCP_CLAUDE.md</code> (Claude Desktop + project prompt).
          In-app chat uses <code className="text-gray-700">POST /api/ai-chat</code>.
        </p>
      </main>
    </div>
  );
}
