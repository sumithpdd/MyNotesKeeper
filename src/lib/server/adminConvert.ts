import 'server-only';
import { Timestamp } from 'firebase-admin/firestore';

/**
 * Shared Firestore <-> JS conversion for the Admin-SDK data modules.
 *
 * The Admin and web SDKs each ship their own `Timestamp` class. Documents are
 * written by both (the browser still writes some collections directly), so
 * readers must tolerate either representation plus raw dates and ISO strings.
 */

/** Read any stored date representation back to a JS `Date`. */
export function toDate(value: unknown, fallback: Date = new Date()): Date {
  if (value == null) return fallback;
  if (value instanceof Date) return value;
  // Both SDK Timestamp classes expose toDate(); duck-type rather than instanceof.
  if (typeof (value as { toDate?: unknown }).toDate === 'function') {
    return (value as { toDate: () => Date }).toDate();
  }
  const parsed = new Date(value as string | number);
  return Number.isFinite(parsed.getTime()) ? parsed : fallback;
}

/** Same as `toDate` but preserves "absent" rather than defaulting. */
export function toDateOrUndefined(value: unknown): Date | undefined {
  if (value == null) return undefined;
  const d = toDate(value, new Date(NaN));
  return Number.isFinite(d.getTime()) ? d : undefined;
}

/** Convert a date-ish value to an Admin `Timestamp` for writing. */
export function tsFrom(value: Date | string | number): Timestamp {
  return Timestamp.fromDate(value instanceof Date ? value : new Date(value));
}

/** Drop `undefined` values — Firestore rejects them on write. */
export function stripUndefined<T extends Record<string, unknown>>(data: T): T {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(data)) {
    if (v !== undefined) out[k] = v;
  }
  return out as T;
}
