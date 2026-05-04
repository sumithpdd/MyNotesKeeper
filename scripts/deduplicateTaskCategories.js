#!/usr/bin/env node
/**
 * Merge duplicate rows in Firestore `taskCategories` by case-insensitive name.
 * Keeps the doc with the lowest `sortOrder`, then earliest `createdAt`, then smallest id.
 * Rewrites `engagementTasks.categoryIds[]` / `categoryId` to point at the kept ids, then deletes extras.
 *
 * Dry run unless APPLY=1.
 *
 *   node scripts/deduplicateTaskCategories.js
 *   APPLY=1 node scripts/deduplicateTaskCategories.js
 *
 * Requires: firebase-admin; serviceAccountKey.json in project root.
 */

const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore, Timestamp } = require('firebase-admin/firestore');
const path = require('path');
const fs = require('fs');

const APPLY = process.env.APPLY === '1' || process.env.APPLY === 'true';

function norm(s) {
  return String(s ?? '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

function initDb() {
  const keyPath = path.join(__dirname, '..', 'serviceAccountKey.json');
  if (!fs.existsSync(keyPath)) {
    console.error('❌ serviceAccountKey.json missing in project root.');
    process.exit(1);
  }
  const app = initializeApp({ credential: cert(require(keyPath)) });
  const db = getFirestore(app);
  db.settings({ ignoreUndefinedProperties: true });
  return db;
}

/** @returns {number} millis or 0 */
function createdMs(ts) {
  if (!ts) return 0;
  if (typeof ts.toMillis === 'function') return ts.toMillis();
  if (ts.seconds != null) return ts.seconds * 1000;
  return 0;
}

/**
 * Map duplicate category id → canonical id (only for ids that lose).
 * @returns {{ redirect: Map<string, string>, toDelete: FirebaseFirestore.DocumentReference[], summary: string[] }}
 */
async function computeDupes(db) {
  const snap = await db.collection('taskCategories').get();
  /** @type {Map<string, { id: string, ref: FirebaseFirestore.DocumentReference, name: string, sortOrder: number, createdMs: number }[]>} */
  const groups = new Map();

  snap.docs.forEach((d) => {
    const x = d.data();
    const key = norm(x.name ?? '');
    if (!key) return;
    const row = {
      id: d.id,
      ref: d.ref,
      name: String(x.name ?? ''),
      sortOrder: typeof x.sortOrder === 'number' ? x.sortOrder : 999999,
      createdMs: createdMs(x.createdAt),
    };
    const list = groups.get(key) || [];
    list.push(row);
    groups.set(key, list);
  });

  /** @type {Map<string, string>} */
  const redirect = new Map();
  /** @type {FirebaseFirestore.DocumentReference[]} */
  const toDelete = [];
  /** @type {string[]} */
  const summary = [];

  for (const [k, docs] of groups) {
    if (docs.length < 2) continue;
    docs.sort((a, b) => {
      if (a.sortOrder !== b.sortOrder) return a.sortOrder - b.sortOrder;
      if (a.createdMs !== b.createdMs) return a.createdMs - b.createdMs;
      return a.id.localeCompare(b.id);
    });
    const keeper = docs[0];
    summary.push(`${keeper.name.trim()} (${k}): keeping ${keeper.id}`);
    for (let i = 1; i < docs.length; i++) {
      summary.push(`  drop ${docs[i].id} → remap to ${keeper.id}`);
      redirect.set(docs[i].id, keeper.id);
      toDelete.push(docs[i].ref);
    }
  }

  return { redirect, toDelete, summary };
}

/** @param {Map<string,string>} redirect */
function remapCategoryRefs(ids, redirect) {
  /** @type {string[]} */
  const out = [];
  const seen = new Set();
  for (let id of ids) {
    if (typeof id !== 'string') continue;
    let t = id.trim();
    if (!t) continue;
    while (redirect.has(t)) {
      const nxt = redirect.get(t);
      if (!nxt || nxt === t) break;
      t = nxt;
    }
    if (!seen.has(t)) {
      seen.add(t);
      out.push(t);
    }
  }
  return out;
}

(async () => {
  console.log(APPLY ? 'APPLY MODE — Firestore writes enabled' : 'DRY RUN — no writes (set APPLY=1 to apply)\n');

  const db = initDb();
  const { redirect, toDelete, summary } = await computeDupes(db);

  if (redirect.size === 0) {
    console.log('No duplicate category names found.');
    process.exit(0);
  }

  console.log(summary.join('\n'));

  const taskSnap = await db.collection('engagementTasks').get();
  /** @type {{ ref: FirebaseFirestore.DocumentReference, patch: Record<string, unknown>}[]} */
  const taskPatches = [];

  taskSnap.docs.forEach((d) => {
    const x = d.data();
    /** @type {string[]} */
    let ids = Array.isArray(x.categoryIds)
      ? x.categoryIds.filter((t) => typeof t === 'string' && t.trim())
      : [];
    if (!ids.length && x.categoryId != null && x.categoryId !== '') ids = [String(x.categoryId)];

    const next = remapCategoryRefs(ids, redirect);
    const nextPrimary = next[0] ?? '';
    const prevPrim = String(x.categoryId ?? '');
    const sameArr = JSON.stringify(ids) === JSON.stringify(next);
    const samePrim = prevPrim === nextPrimary;
    if (sameArr && samePrim) return;

    const patch = {
      categoryIds: next,
      categoryId: nextPrimary,
      updatedAt: Timestamp.now(),
    };
    taskPatches.push({ ref: d.ref, patch });
    console.log(`Task ${d.id}: categories ${JSON.stringify(ids)} → ${JSON.stringify(next)}`);
  });

  console.log('\nSummary:', `${toDelete.length} category doc(s) to delete`, `${taskPatches.length} task(s) to rewrite`);

  if (!APPLY) {
    console.log('\nDry run finished.');
    process.exit(0);
  }

  let batch = db.batch();
  let n = 0;
  for (const { ref, patch } of taskPatches) {
    batch.set(ref, patch, { merge: true });
    n += 1;
    if (n >= 450) {
      await batch.commit();
      batch = db.batch();
      n = 0;
    }
  }
  if (n > 0) await batch.commit();

  batch = db.batch();
  n = 0;
  for (const ref of toDelete) {
    batch.delete(ref);
    n += 1;
    if (n >= 450) {
      await batch.commit();
      batch = db.batch();
      n = 0;
    }
  }
  if (n > 0) await batch.commit();

  console.log('\nDone.');
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
