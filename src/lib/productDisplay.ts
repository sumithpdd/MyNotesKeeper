import type { Product } from '@/types';

/** Typical XP/XM semver choices (newest first) — used by product forms / seed hints. */
export const PRODUCT_VERSION_PRESETS_DESC = [
  '10.4',
  '10.3',
  '10.2',
  '10.1',
  '10.0',
  '9.3',
  '9.2',
  '9.1',
  '9.0',
  '8.2',
  '8.1',
] as const;

type ProductLike = Pick<Product, 'name'> & Partial<Pick<Product, 'version'>>;

/** Single CRM label: base name plus version (`XP v10.1`; `XM Cloud Latest` when version is Latest). */
export function formatProductDisplayName(product: ProductLike): string {
  const rawName = String(product.name ?? '').trim();
  const verRaw = String(product.version ?? '').trim();
  if (!verRaw) return rawName;
  const lc = verRaw.toLowerCase();
  if (lc === 'latest') return rawName ? `${rawName} Latest` : 'Latest';

  const noLeadingVs = verRaw.replace(/^v+/i, '');
  const segment = /^[\d.]+\w*$/u.test(noLeadingVs) ? `v${noLeadingVs}` : noLeadingVs;
  return rawName ? `${rawName} ${segment}` : segment;
}
