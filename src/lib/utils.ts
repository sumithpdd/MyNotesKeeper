import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Convert Firestore Timestamp, Date, or serialized date to Date. Returns null if invalid. */
export function toDate(date: unknown): Date | null {
  if (date == null) return null;
  if (date instanceof Date) return isNaN(date.getTime()) ? null : date;
  if (typeof date === 'object' && date !== null && 'toDate' in date) {
    try {
      const d = (date as { toDate: () => Date }).toDate();
      return isNaN(d.getTime()) ? null : d;
    } catch {
      return null;
    }
  }
  if (typeof date === 'object' && date !== null) {
    const sec = (date as { seconds?: number; _seconds?: number }).seconds ?? (date as { seconds?: number; _seconds?: number })._seconds;
    if (typeof sec === 'number') return new Date(sec * 1000);
  }
  const d = new Date(date as string | number);
  return isNaN(d.getTime()) ? null : d;
}

/** Safely format any date-like value. Returns "—" for invalid/missing. */
export function safeFormatDate(date: unknown): string {
  const d = toDate(date);
  if (!d) return '—';
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(d);
}

/** Safely format any date-like value with time. Returns "—" for invalid/missing. */
export function safeFormatDateTime(date: unknown): string {
  const d = toDate(date);
  if (!d) return '—';
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d);
}

export function formatDate(date: Date | unknown): string {
  return safeFormatDate(date);
}

export function formatDateTime(date: Date | unknown): string {
  return safeFormatDateTime(date);
}
