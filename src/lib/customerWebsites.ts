/**
 * Normalize customer URLs: merges legacy `website` with optional `websiteUrls[]`
 * without duplicates (order preserved).
 */
export function customerWebsiteList(customer: {
  website?: string;
  websiteUrls?: string[];
}): string[] {
  const arr = [...(customer.websiteUrls ?? [])].map((s) => String(s).trim()).filter(Boolean);
  const single = customer.website?.trim();
  const ordered =
    arr.length > 0
      ? [...(single && !arr.includes(single) ? [single] : []), ...arr]
      : single
        ? [single]
        : [];
  const seen = new Set<string>();
  return ordered.filter((u) => (seen.has(u) ? false : (seen.add(u), true)));
}

/** One URL per line from the customer form. */
export function parseWebsitesFromFormText(text: string): {
  website: string | undefined;
  websiteUrls: string[];
} {
  const lines = text.split(/[\r\n]+/).map((s) => s.trim()).filter(Boolean);
  const seen = new Set<string>();
  const unique = lines.filter((u) => (seen.has(u) ? false : (seen.add(u), true)));
  return {
    website: unique[0],
    websiteUrls: unique,
  };
}
