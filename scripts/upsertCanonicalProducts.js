#!/usr/bin/env node
/**
 * Upsert canonical product rows into Firestore `products`.
 * Rows match `dummyProducts` in data/dummyData.ts (base name + version; UI formats e.g. "XP v10.1").
 * When editing the catalogue, update BOTH files.
 *
 * Default: dry run (prints planned creates/updates, no writes).
 * Writes require APPLY=1.
 *
 *   node scripts/upsertCanonicalProducts.js
 *   APPLY=1 node scripts/upsertCanonicalProducts.js
 *
 * Optional: NORMALIZE_MERGED_NAMES=1  — fix docs where `name` contains " … v10.3" / " … Latest"
 *           and bump `version`; run before upsert logic in the same execution.
 *
 * Requires: firebase-admin; serviceAccountKey.json in project root.
 */

const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore, Timestamp } = require('firebase-admin/firestore');
const path = require('path');
const fs = require('fs');

const APPLY = process.env.APPLY === '1' || process.env.APPLY === 'true';
const NORMALIZE_MERGED_NAMES =
  process.env.NORMALIZE_MERGED_NAMES === '1' || process.env.NORMALIZE_MERGED_NAMES === 'true';

/** @type {{ id: string, name: string, version?: string, description?: string, status?: string }[]} */
const CANONICAL_PRODUCTS = [
  { id: 'product-xp-104', name: 'XP', version: '10.4', description: 'Experience Platform - Complete digital experience platform', status: 'Active' },
  { id: 'product-xp-103', name: 'XP', version: '10.3', description: 'Experience Platform - Complete digital experience platform', status: 'Active' },
  { id: 'product-xp-102', name: 'XP', version: '10.2', description: 'Experience Platform - Complete digital experience platform', status: 'Active' },
  { id: 'product-xp-101', name: 'XP', version: '10.1', description: 'Experience Platform - Complete digital experience platform', status: 'Active' },
  { id: 'product-xp-100', name: 'XP', version: '10.0', description: 'Experience Platform - Complete digital experience platform', status: 'Active' },
  { id: 'product-xp-93', name: 'XP', version: '9.3', description: 'Experience Platform - Complete digital experience platform', status: 'Active' },
  { id: 'product-xp-92', name: 'XP', version: '9.2', description: 'Experience Platform - Complete digital experience platform', status: 'Active' },
  { id: 'product-xp-91', name: 'XP', version: '9.1', description: 'Experience Platform - Complete digital experience platform', status: 'Active' },
  { id: 'product-xp-90', name: 'XP', version: '9.0', description: 'Experience Platform - Complete digital experience platform', status: 'Active' },
  { id: 'product-xp-901', name: 'XP', version: '9.0.1', description: 'Experience Platform - Complete digital experience platform', status: 'Active' },
  { id: 'product-xp-82', name: 'XP', version: '8.2', description: 'Experience Platform - Complete digital experience platform', status: 'Active' },
  { id: 'product-xp-81', name: 'XP', version: '8.1', description: 'Experience Platform - Complete digital experience platform', status: 'Active' },
  { id: 'product-xm', name: 'XM', version: '10.3', description: 'Experience Manager - Comprehensive content management and personalization platform', status: 'Active' },
  { id: 'product-xm-cloud', name: 'XM Cloud', version: 'Latest', description: 'Cloud-native headless CMS with modern architecture', status: 'Active' },
  { id: 'product-ordercloud', name: 'OrderCloud', version: '4.0', description: 'Commerce platform for B2B and B2C commerce solutions', status: 'Active' },
  { id: 'product-cdp', name: 'CDP', version: 'Latest', description: 'Customer Data Platform - Unified customer data management', status: 'Active' },
  { id: 'product-personalize', name: 'Personalize', version: 'Latest', description: 'AI-powered personalization engine for customer experiences', status: 'Active' },
  { id: 'product-search', name: 'Search', version: 'Latest', description: 'Enterprise search and discovery platform', status: 'Active' },
  { id: 'product-content-hub', name: 'Content Hub', version: 'Latest', description: 'Headless content management for omnichannel experiences', status: 'Active' },
  { id: 'product-send', name: 'Send', version: 'Latest', description: 'Email marketing and automation platform', status: 'Active' },
  { id: 'product-connect', name: 'Connect', version: 'Latest', description: 'Integration platform for connecting systems and data', status: 'Active' },
  { id: 'product-sitecore-ai', name: 'Sitecore AI', version: 'Latest', description: 'AI-assisted authoring, discovery, and experience optimization across Sitecore composable solutions', status: 'Active' },
  { id: 'product-sitecore-search', name: 'Sitecore Search', version: 'Latest', description: 'Composable enterprise search and relevance for websites, commerce, and knowledge experiences', status: 'Active' },
];

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

function normPart(s) {
  return String(s ?? '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

function productLookupKey(name, version) {
  const v =
    typeof version === 'string' ? version.trim() : version != null ? String(version).trim() : '';
  return `${normPart(name)}|${normPart(v)}`;
}

/**
 * Split legacy combined labels like "XP v10.3" → name + version when version unset.
 */
function trySplitMergedName(name, version) {
  let n = String(name ?? '').trim();
  let v =
    typeof version === 'string' ? version.trim() : version != null ? String(version).trim() : '';
  if (v) return { name: n, version: v };
  if (!n) return { name: n, version: v };

  const semverish = /^(.+?)\s+v([\d.]+\w*)$/i.exec(n);
  if (semverish) {
    return { name: semverish[1].trim(), version: semverish[2] };
  }
  const latest = /^(.+?)\s+Latest$/i.exec(n);
  if (latest) {
    return { name: latest[1].trim(), version: 'Latest' };
  }
  return { name: n, version: v };
}

async function buildProductIndex(db) {
  const snap = await db.collection('products').get();
  /** @type {Map<string, { id: string, ref: import('firebase-admin/firestore').DocumentReference, data: Record<string, unknown> }[]>} */
  const byKey = new Map();
  for (const d of snap.docs) {
    const x = d.data();
    const k = productLookupKey(x.name, x.version);
    const row = { id: d.id, ref: d.ref, data: x };
    const list = byKey.get(k) || [];
    list.push(row);
    byKey.set(k, list);
  }
  return byKey;
}

async function normalizeMergedNames(db) {
  const snap = await db.collection('products').get();
  let changed = 0;
  for (const d of snap.docs) {
    const x = d.data();
    const split = trySplitMergedName(x.name, x.version);
    const prevKey = productLookupKey(x.name, x.version);
    const nextKey = productLookupKey(split.name, split.version);
    if (prevKey === nextKey) continue;
    changed += 1;
    console.log(`  Normalize ${d.id}: "${x.name}" + "${x.version ?? ''}" → "${split.name}" | "${split.version}"`);
    if (APPLY) {
      await d.ref.set(
        {
          name: split.name,
          version: split.version ?? '',
          updatedAt: Timestamp.now(),
        },
        { merge: true },
      );
    }
  }
  console.log(`Merged-name pass: ${changed} document(s) ${APPLY ? 'updated' : 'would update'}`);
}

async function upsertCanonical(db) {
  const byKey = await buildProductIndex(db);

  /** @type {string[]} */
  const warnings = [];

  for (const row of CANONICAL_PRODUCTS) {
    const wantKey = productLookupKey(row.name, row.version);
    const candidates = byKey.get(wantKey) || [];

    const payloadBase = {
      name: row.name,
      version: row.version ?? '',
      description: row.description ?? '',
      status: row.status || 'Active',
      updatedAt: Timestamp.now(),
    };

    if (candidates.length > 1) {
      warnings.push(
        `${wantKey}: ${candidates.length} duplicates (${candidates.map((c) => c.id).join(', ')}) — updating first matched doc only`,
      );
    }

    if (candidates.length > 0) {
      const prefer = candidates.find((c) => c.id === row.id) || candidates[0];

      const current = prefer.data || {};
      const sameDesc = (current.description || '') === (payloadBase.description || '');
      const sameStatus = (current.status || 'Active') === (payloadBase.status || 'Active');
      const sameName = (current.name || '') === payloadBase.name;
      const sameVer = String(current.version ?? '') === String(payloadBase.version ?? '');
      const needsMerge = !(sameDesc && sameStatus && sameName && sameVer);

      if (!needsMerge) {
        console.log(`  ✓ Already aligned: ${row.name} (${row.version || 'no version'}) [${prefer.id}]`);
        continue;
      }

      console.log(
        APPLY ? `  Update` : `  [dry-run] Would update`,
        `[${prefer.id}]`,
        row.name,
        row.version ?? '',
      );
      if (APPLY) {
        await prefer.ref.set(payloadBase, { merge: true });
      }
      continue;
    }

    // No name+version match: create / merge at stable document id (matches seed ids in dummy data).
    console.log(APPLY ? `  Create` : `  [dry-run] Would create`, `[${row.id}]`, row.name, row.version ?? '');
    const createPayload = {
      ...payloadBase,
      createdAt: Timestamp.now(),
    };
    if (APPLY) {
      await db.collection('products').doc(row.id).set(createPayload, { merge: true });
    }
  }

  if (warnings.length) {
    console.log('\nWarnings:');
    for (const w of warnings) console.log(' ', w);
  }
}

(async () => {
  console.log(APPLY ? 'APPLY MODE — writes enabled' : 'DRY RUN — no writes (set APPLY=1 to persist)');
  if (NORMALIZE_MERGED_NAMES) {
    console.log('NORMALIZE_MERGED_NAMES enabled\n');
  } else {
    console.log('');
  }

  const db = initDb();

  if (NORMALIZE_MERGED_NAMES) {
    await normalizeMergedNames(db);
  }

  console.log('\nUpserting canonical catalogue…');
  await upsertCanonical(db);
  console.log('\nDone.');
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
