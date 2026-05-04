import type { TaskLink } from '@/types/task';

/** Readable href for anchors; prefixes `https://` when no URI scheme is present. */
export function taskLinkHref(raw: string): string {
  const t = String(raw ?? '').trim();
  if (!t) return '';
  return /^[a-z][a-z0-9+.-]*:/i.test(t) ? t : `https://${t}`;
}

export function parseTaskLinks(raw: unknown): TaskLink[] | undefined {
  if (!Array.isArray(raw)) return undefined;
  const out: TaskLink[] = [];
  raw.forEach((item, i) => {
    if (!item || typeof item !== 'object') return;
    const o = item as Record<string, unknown>;
    const url = String(o.url ?? '').trim();
    if (!url) return;
    const labelRaw = typeof o.label === 'string' ? o.label.trim() : '';
    out.push({
      id: typeof o.id === 'string' && o.id ? o.id : `lnk-${i}`,
      url,
      ...(labelRaw ? { label: labelRaw } : {}),
    });
  });
  return out.length ? out : undefined;
}

export function taskLinksFirestorePayload(links: TaskLink[] | undefined): Record<string, string>[] {
  return (links ?? []).map((l) => ({
    id: l.id,
    ...(l.label ? { label: l.label } : {}),
    url: l.url.trim(),
  }));
}

export function normalizeIncomingTaskLinks(
  rows: { id: string; label?: string; url: string }[],
): TaskLink[] {
  return rows
    .map((r) => {
      const url = taskLinkHref(r.url);
      if (!url) return null;
      const label = typeof r.label === 'string' && r.label.trim() ? r.label.trim() : undefined;
      try {
        void new URL(url);
      } catch {
        return null;
      }
      return { id: r.id, url, ...(label ? { label } : {}) };
    })
    .filter((x): x is TaskLink => x != null);
}
