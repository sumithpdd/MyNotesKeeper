import { SALESFORCE_CUSTOMER_OBJECTIVES } from '../../../data/dxpPools';

const PICKLIST = new Set<string>(SALESFORCE_CUSTOMER_OBJECTIVES);

/** Format objectives for display: picklist label, or legacy free-text if not in SF list. */
export function formatCustomerObjectiveLine(index: number, value: string | undefined): string | null {
  const t = value?.trim();
  if (!t) return null;
  if (PICKLIST.has(t)) return `${index}. ${t}`;
  return `${index}. ${t}`;
}

export function formatCustomerObjectivesBlock(profile: {
  customerObjective1?: string;
  customerObjective2?: string;
  customerObjective3?: string;
  customerObjectivesDetails?: string;
}): string {
  const lines = [1, 2, 3]
    .map((n) =>
      formatCustomerObjectiveLine(
        n,
        n === 1
          ? profile.customerObjective1
          : n === 2
            ? profile.customerObjective2
            : profile.customerObjective3,
      ),
    )
    .filter((l): l is string => Boolean(l));
  const details = profile.customerObjectivesDetails?.trim();
  if (details) {
    if (lines.length) lines.push('');
    lines.push(details);
  }
  return lines.join('\n');
}
