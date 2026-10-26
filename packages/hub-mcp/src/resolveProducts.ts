import type { Product } from '../../../src/types';
import { formatProductDisplayName } from '../../../src/lib/productDisplay';

/** Resolve catalog ids from ids and/or human labels ("XP 10.3", "Sitecore AI"). */
export function resolveProductIdsFromInput(
  catalog: Product[],
  input: { productIds?: string[]; productLabels?: string[] },
): { ids: string[]; unresolved: string[] } {
  const ids = new Set<string>();
  const unresolved: string[] = [];

  for (const id of input.productIds ?? []) {
    const t = id.trim();
    if (!t) continue;
    if (catalog.some((p) => p.id === t)) ids.add(t);
    else unresolved.push(t);
  }

  for (const label of input.productLabels ?? []) {
    const q = label.trim().toLowerCase();
    if (!q) continue;
    const match = catalog.find((p) => {
      const display = formatProductDisplayName(p).toLowerCase();
      const compact = `${p.name} ${p.version ?? ''}`.trim().toLowerCase();
      return (
        p.id.toLowerCase() === q ||
        display === q ||
        display.includes(q) ||
        compact.includes(q) ||
        q.includes(compact)
      );
    });
    if (match) ids.add(match.id);
    else unresolved.push(label);
  }

  return { ids: [...ids], unresolved };
}
