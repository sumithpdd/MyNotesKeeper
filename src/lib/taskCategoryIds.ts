/** Normalize task categories from mixed Firestore / API payloads (singular + array migration). */

export type TaskCategoryPayload = {
  categoryIds?: unknown;
  categoryId?: unknown;
};

/** Unique, stable order-preserving IDs for task category assignments. */
export function categoryIdsFromTaskFields(data: TaskCategoryPayload): string[] {
  const rawArr = data.categoryIds;
  if (Array.isArray(rawArr)) {
    const fromArr: string[] = [];
    const seen = new Set<string>();
    for (const x of rawArr) {
      if (typeof x !== 'string') continue;
      const id = x.trim();
      if (!id || seen.has(id)) continue;
      seen.add(id);
      fromArr.push(id);
    }
    if (fromArr.length) return fromArr;
  }
  const single = String(data.categoryId ?? '').trim();
  return single ? [single] : [];
}
