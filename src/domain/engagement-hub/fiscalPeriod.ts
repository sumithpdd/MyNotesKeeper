/**
 * Fiscal period maths for pipeline reporting.
 *
 * The fiscal year starts **1 July** and is labelled by the calendar year it
 * *ends* in, matching the CRM's `Fiscal Period` grouping:
 *
 * | Quarter | Months          | Example            |
 * |---------|-----------------|--------------------|
 * | Q1      | Jul – Sep       | Sep 2026 → Q1-2027 |
 * | Q2      | Oct – Dec       | Nov 2026 → Q2-2027 |
 * | Q3      | Jan – Mar       | Mar 2027 → Q3-2027 |
 * | Q4      | Apr – Jun       | Apr 2027 → Q4-2027 |
 *
 * Nothing is stored: a period is always derived from a date (normally the
 * opportunity close date), so it can never drift out of sync.
 */

/** Month (1-12) the fiscal year begins on. */
export const FISCAL_YEAR_START_MONTH = 7;

export type FiscalQuarter = 1 | 2 | 3 | 4;

export interface FiscalPeriod {
  /** Calendar year the fiscal year ends in — FY2027 covers Jul 2026 → Jun 2027. */
  fiscalYear: number;
  quarter: FiscalQuarter;
  /** CRM-style label, e.g. `Q1-2027`. */
  label: string;
}

function isValidDate(d: Date): boolean {
  return d instanceof Date && Number.isFinite(d.getTime());
}

/** Derive the fiscal period containing `date`. Returns `null` for invalid input. */
export function fiscalPeriodFor(date: Date | string | null | undefined): FiscalPeriod | null {
  if (date == null) return null;
  const d = date instanceof Date ? date : new Date(date);
  if (!isValidDate(d)) return null;

  const month = d.getMonth() + 1; // 1-12
  const year = d.getFullYear();

  // Months from the start of the fiscal year, 0-11.
  const offset = (month - FISCAL_YEAR_START_MONTH + 12) % 12;
  const quarter = (Math.floor(offset / 3) + 1) as FiscalQuarter;
  // Jul-Dec belong to the fiscal year ending the following calendar year.
  const fiscalYear = month >= FISCAL_YEAR_START_MONTH ? year + 1 : year;

  return { fiscalYear, quarter, label: `Q${quarter}-${fiscalYear}` };
}

/** Convenience: just the CRM label, or `''` when the date is missing/invalid. */
export function fiscalPeriodLabel(date: Date | string | null | undefined): string {
  return fiscalPeriodFor(date)?.label ?? '';
}

/** Inclusive start/end dates of a fiscal quarter. */
export function fiscalQuarterRange(
  fiscalYear: number,
  quarter: FiscalQuarter,
): { start: Date; end: Date } {
  const startMonthIndex = FISCAL_YEAR_START_MONTH - 1 + (quarter - 1) * 3; // 0-based, may exceed 11
  const startYear = fiscalYear - 1 + Math.floor(startMonthIndex / 12);
  const normalizedStart = startMonthIndex % 12;

  const start = new Date(startYear, normalizedStart, 1, 0, 0, 0, 0);
  // Day 0 of the month after the quarter's last month = that month's last day.
  const end = new Date(startYear, normalizedStart + 3, 0, 23, 59, 59, 999);
  return { start, end };
}

/** Sort key so `Q1-2027` orders before `Q2-2027`, and both before `Q1-2028`. */
export function fiscalPeriodSortKey(period: FiscalPeriod): number {
  return period.fiscalYear * 10 + period.quarter;
}

/** Group any dated records into CRM-style fiscal buckets, ordered chronologically. */
export function groupByFiscalPeriod<T>(
  items: readonly T[],
  getDate: (item: T) => Date | string | null | undefined,
): { period: FiscalPeriod; items: T[] }[] {
  const buckets = new Map<string, { period: FiscalPeriod; items: T[] }>();

  for (const item of items) {
    const period = fiscalPeriodFor(getDate(item));
    if (!period) continue;
    const existing = buckets.get(period.label);
    if (existing) existing.items.push(item);
    else buckets.set(period.label, { period, items: [item] });
  }

  return [...buckets.values()].sort(
    (a, b) => fiscalPeriodSortKey(a.period) - fiscalPeriodSortKey(b.period),
  );
}
