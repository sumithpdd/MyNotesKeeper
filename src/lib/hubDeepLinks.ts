/**
 * Shareable hub URLs for account review (MCP / LLM responses, email, Slack).
 */

export type HubWorkspaceTab = 'notes' | 'tasks' | 'migration' | 'entities';

const DEFAULT_HUB_ORIGIN = 'https://customerengagementhub.vercel.app';

/** Public hub origin (no trailing slash). */
export function hubPublicOrigin(): string {
  const fromEnv =
    process.env.HUB_PUBLIC_BASE_URL?.trim() ||
    process.env.NEXT_PUBLIC_APP_URL?.trim() ||
    process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
  if (fromEnv) {
    const withProto = fromEnv.startsWith('http') ? fromEnv : `https://${fromEnv}`;
    return withProto.replace(/\/$/, '');
  }
  return DEFAULT_HUB_ORIGIN;
}

export function buildAccountReviewUrl(opts: {
  customerId: string;
  opportunityId?: string | null;
  tab?: HubWorkspaceTab;
}): string {
  const origin = hubPublicOrigin();
  const params = new URLSearchParams();
  params.set('customer', opts.customerId);
  if (opts.opportunityId?.trim()) params.set('opportunity', opts.opportunityId.trim());
  if (opts.tab && opts.tab !== 'notes') params.set('tab', opts.tab);
  return `${origin}/?${params.toString()}`;
}

/** Human label for LLM responses — same URL as {@link buildAccountReviewUrl}. */
export function accountReviewLinkLabel(customerName: string): string {
  return `Open ${customerName} in Customer Engagement Hub`;
}
