/**
 * Account Executive colors for visual grouping.
 * Uses deterministic hash from palette for consistent colors per AE name.
 */

const AE_COLOR_PALETTE = [
  { bg: 'bg-blue-50', border: 'border-l-blue-500', badge: 'bg-blue-100 text-blue-800', dot: 'bg-blue-500' },
  { bg: 'bg-emerald-50', border: 'border-l-emerald-500', badge: 'bg-emerald-100 text-emerald-800', dot: 'bg-emerald-500' },
  { bg: 'bg-violet-50', border: 'border-l-violet-500', badge: 'bg-violet-100 text-violet-800', dot: 'bg-violet-500' },
  { bg: 'bg-amber-50', border: 'border-l-amber-500', badge: 'bg-amber-100 text-amber-800', dot: 'bg-amber-500' },
  { bg: 'bg-rose-50', border: 'border-l-rose-500', badge: 'bg-rose-100 text-rose-800', dot: 'bg-rose-500' },
  { bg: 'bg-cyan-50', border: 'border-l-cyan-500', badge: 'bg-cyan-100 text-cyan-800', dot: 'bg-cyan-500' },
  { bg: 'bg-fuchsia-50', border: 'border-l-fuchsia-500', badge: 'bg-fuchsia-100 text-fuchsia-800', dot: 'bg-fuchsia-500' },
  { bg: 'bg-teal-50', border: 'border-l-teal-500', badge: 'bg-teal-100 text-teal-800', dot: 'bg-teal-500' },
  { bg: 'bg-orange-50', border: 'border-l-orange-500', badge: 'bg-orange-100 text-orange-800', dot: 'bg-orange-500' },
  { bg: 'bg-indigo-50', border: 'border-l-indigo-500', badge: 'bg-indigo-100 text-indigo-800', dot: 'bg-indigo-500' },
];

const AE_EXPLICIT_COLORS: Record<string, (typeof AE_COLOR_PALETTE)[number]> = {};

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}

export function getAccountExecutiveColor(aeName: string | undefined): (typeof AE_COLOR_PALETTE)[0] {
  const defaultColor = { bg: 'bg-gray-50', border: 'border-l-gray-400', badge: 'bg-gray-100 text-gray-700', dot: 'bg-gray-400' };
  if (!aeName?.trim()) return defaultColor;
  const key = aeName.trim().toLowerCase();
  if (AE_EXPLICIT_COLORS[key]) return AE_EXPLICIT_COLORS[key];
  const index = hashString(key) % AE_COLOR_PALETTE.length;
  return AE_COLOR_PALETTE[index];
}
