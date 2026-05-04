#!/usr/bin/env node
/**
 * Seed May demonstrator schedule + internal / customer-contact links on tasks.
 *
 * Prerequisites: firebase-admin in node_modules; serviceAccountKey.json in project root.
 * Categories: aligns with canonical task kinds in Hub (`DEFAULT_TASK_CATEGORY_SEED` in `src/lib/server/workspaceLoad.ts`).
 * This script calls `ensureCanonicalTaskCategories()` so all ten kinds exist before tasks are inserted.
 *
 * Tasks get `customerContactIds` / `internalContactIds` arrays (Firestore) plus `startDate`/`endDate`
 * aligned with the planning day. Customer contacts are upserted on the matched account where listed.
 *
 * All customer names, emails, and CRM URLs below are **fictional placeholders** (.example / .invalid)
 * — do not put real contacts in source; copy this script locally if you need production-shaped seed data.
 *
 * When a Firestore customer name matches hints **demo healthcare** (see DEMO_HEALTHCARE_OPPORTUNITY_SEED),
 * ensures two CRM reference opportunities if missing (matched by CRM URL or name).
 *
 * For accounts matching **demo charity**, ensures a demo AI opportunity (`DEMO_CHARITY_CRM_URL`),
 * upserts a synthetic catalogue contact, and sets **Demo AE Alpha** as opportunity owner when that internal exists.
 *
 * Usage:
 *   node scripts/seedDemonstratorTasks.js user@yourdomain.com
 *
 * ENV: YEAR=2026 (default)
 */

const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore, Timestamp } = require('firebase-admin/firestore');
const path = require('path');
const fs = require('fs');
const { randomUUID } = require('crypto');

const userEmailArg = process.argv[2];
if (!userEmailArg?.includes('@')) {
  console.error('Usage: node scripts/seedDemonstratorTasks.js you@yourdomain.com');
  process.exit(1);
}

const year = Number(process.env.YEAR || 2026);
if (!Number.isFinite(year)) {
  console.error('Invalid YEAR');
  process.exit(1);
}

/** Fictional internal roster — emails use reserved `.invalid`; leave blank where not needed. */
const DEMO_INTERNAL_TEAM = [
  { name: 'Demo AE Alpha', role: 'Account Executive', email: '' },
  { name: 'Demo AE Beta', role: 'Account Executive', email: '' },
  { name: 'Demo SE Gamma', role: 'Solution Engineer', email: '' },
  { name: 'Demo SE Delta', role: 'Solution Engineer', email: '' },
  { name: 'Demo AM Epsilon', role: 'Account Manager', email: '' },
  { name: 'Demo Liaison Foxtrot', role: 'Partner liaison', email: 'liaison.foxtrot@staff.demo.invalid' },
];

/**
 * Hub `OpportunityStage` values (Salesforce labels differ slightly, e.g. Propose ↔ “Propose & Commit”).
 * @typedef {object} DemoOppSeedRow
 * @property {string} opportunityName
 * @property {string} currentStage  Plan | Prospect | Qualify | Discover | Differentiate | Propose | Close | Delivery and Success | Expand
 * @property {string} crmOpportunityUrl
 */
/** @type {DemoOppSeedRow[]} */
const DEMO_HEALTHCARE_OPPORTUNITY_SEED = [
  {
    opportunityName: 'Demo Healthcare — SAI pilot',
    currentStage: 'Differentiate',
    crmOpportunityUrl: 'https://crm.example.invalid/opportunities/demo-health-sai/view',
  },
  {
    opportunityName: 'Demo Healthcare — services implementation',
    currentStage: 'Propose',
    crmOpportunityUrl: 'https://crm.example.invalid/opportunities/demo-health-impl/view',
  },
];

const DEMO_CHARITY_CRM_URL = 'https://crm.example.invalid/opportunities/demo-charity-ai/view';

const DEMO_CHARITY_OPPORTUNITY_DESCRIPTION = [
  'Primary contact: River Jordan (Head of Digital, river.jordan@partner.demo.invalid).',
  'Account executive: Demo AE Alpha (your org).',
  '',
  'Business context (synthetic): multi-year digital roadmap; marketing stack renewal; evaluating AI-assisted content and personalization.',
  'Objectives (synthetic): single customer view, measurable campaigns, phased CMS modernization.',
  '',
  'Engagement notes: stakeholder workshops; procurement checkpoints; integration planning with incumbent tools.',
].join('\n');

/** Must match names in `workspaceLoad.ts` DEFAULT_TASK_CATEGORY_SEED (labels users pick as "task type"). */
const TASK_CATEGORY_DEFAULTS = [
  { name: 'Dry Run', color: 'bg-slate-100 text-slate-800' },
  { name: 'Meeting Preparation', color: 'bg-sky-100 text-sky-800' },
  { name: 'Standard Demo', color: 'bg-violet-100 text-violet-800' },
  { name: 'Customized Demo', color: 'bg-purple-100 text-purple-800' },
  { name: 'RFP', color: 'bg-amber-100 text-amber-800' },
  { name: 'Security or Vendor Questionnaire', color: 'bg-orange-100 text-orange-800' },
  { name: 'Workshop', color: 'bg-teal-100 text-teal-800' },
  { name: 'Discovery Session', color: 'bg-emerald-100 text-emerald-800' },
  { name: 'Account / Deal Review', color: 'bg-indigo-100 text-indigo-800' },
  { name: 'Speaking Event / Webinar', color: 'bg-pink-100 text-pink-800' },
];

/**
 * @typedef {object} SeedCustomerContact
 * @property {string} name
 * @property {string} [email]
 * @property {string} [role]
 */

/**
 * @typedef {object} TaskRowDef
 * @property {string} planningDate  YYYY-MM-DD (UTC noon stored)
 * @property {string} title
 * @property {string[]} customerHints
 * @property {string} categoryName  Exact task type label (must match TASK_CATEGORY_DEFAULTS.name)
 * @property {string} description
 * @property {string[]} [productNameSubstrings]
 * @property {string} [crmOpportunityUrl]  Link task to this CRM URL when the account matches
 * @property {string[]} [internalContactNames]  Match internalContacts.name after seed upsert
 * @property {SeedCustomerContact[]} [linkCustomerContacts]  Upsert on resolved customer; IDs go on task
 */

/** @type {TaskRowDef[]} */
const TASK_DEFS = [
  {
    planningDate: `${year}-05-01`,
    title: 'Demo Building Products — AI demo',
    customerHints: ['demo building products', 'building products demo'],
    categoryName: 'Standard Demo',
    description:
      'Demonstrator calendar: AI capability demo. Use customer name containing “demo building products” so the seed can link the Firestore account.',
  },
  {
    planningDate: `${year}-05-05`,
    title: 'Demo Charity — Commercial presentation',
    customerHints: ['demo charity', 'charity demo'],
    categoryName: 'Meeting Preparation',
    crmOpportunityUrl: DEMO_CHARITY_CRM_URL,
    description:
      'Commercial presentation prep linked to DEMO_CHARITY_CRM_URL opportunity. Internal: Demo AE Alpha. Customer contact upsert uses synthetic placeholders.',
    internalContactNames: ['Demo AE Alpha'],
    linkCustomerContacts: [{ name: 'River Jordan', email: 'river.jordan@partner.demo.invalid', role: 'Head of Digital' }],
    productNameSubstrings: ['sitecore', 'ai'],
  },
  {
    planningDate: `${year}-05-05`,
    title: 'Demo Member Org — Renewal / discovery',
    customerHints: ['demo member org', 'member org demo'],
    categoryName: 'Discovery Session',
    description:
      'Renewal-style discovery conversation. Contacts below upsert onto the matched account.',
    linkCustomerContacts: [
      { name: 'Demo AM Epsilon', role: 'Account Manager' },
      { name: 'Casey Member', email: 'casey.member@customer.demo.invalid' },
    ],
  },
  {
    planningDate: `${year}-05-07`,
    title: 'Demo Retail — Planning meeting',
    customerHints: ['demo retail'],
    categoryName: 'Meeting Preparation',
    description: 'Planning touchpoint — internal + customer roster attached as contact relations.',
    internalContactNames: ['Demo AE Alpha'],
    linkCustomerContacts: [
      {
        name: 'Morgan Shopper',
        email: 'morgan.shopper@retail.demo.invalid',
        role: 'Enterprise / Account Manager',
      },
    ],
  },
  {
    planningDate: `${year}-05-14`,
    title: 'Demo Healthcare — AI showcase',
    customerHints: ['demo healthcare'],
    categoryName: 'Customized Demo',
    description:
      'AI showcase tied to DEMO_HEALTHCARE_OPPORTUNITY_SEED rows. AE/SE roster: Demo AE Beta, Demo SE Gamma, Demo SE Delta.',
    internalContactNames: ['Demo AE Beta', 'Demo SE Gamma', 'Demo SE Delta'],
    productNameSubstrings: ['ai', 'sitecore'],
  },
  {
    planningDate: `${year}-05-20`,
    title: 'Demo Hospitality — AI demo',
    customerHints: ['demo hospitality', 'hospitality demo'],
    categoryName: 'Standard Demo',
    description: 'Demonstrator calendar: standard AI-focused demo.',
  },
];

function initDb() {
  const keyPath = path.join(__dirname, '../serviceAccountKey.json');
  if (!fs.existsSync(keyPath)) {
    console.error('❌ serviceAccountKey.json missing in project root.');
    process.exit(1);
  }
  const app = initializeApp({ credential: cert(require(keyPath)) });
  const db = getFirestore(app);
  db.settings({ ignoreUndefinedProperties: true });
  return db;
}

async function upsertInternalContact(db, doc) {
  const col = db.collection('internalContacts');
  if (doc.email) {
    const q = await col.where('email', '==', doc.email).limit(1).get();
    if (!q.empty) {
      const ref = q.docs[0].ref;
      await ref.set({ ...doc, updatedAt: Timestamp.now() }, { merge: true });
      return q.docs[0].id;
    }
  }
  const qName = await col.where('name', '==', doc.name).limit(1).get();
  if (!qName.empty) {
    const ref = qName.docs[0].ref;
    await ref.set({ ...doc, updatedAt: Timestamp.now() }, { merge: true });
    return qName.docs[0].id;
  }
  const ref = await col.add({
    ...doc,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  });
  return ref.id;
}

async function upsertCustomerContact(db, custId, payload) {
  const col = db.collection('customerContacts');
  if (payload.email) {
    const byEmail = await col.where('email', '==', payload.email).limit(1).get();
    if (!byEmail.empty) {
      await byEmail.docs[0].ref.set(
        { ...payload, customerId: custId, updatedAt: Timestamp.now() },
        { merge: true },
      );
      return byEmail.docs[0].id;
    }
  }
  const byName = await col.where('name', '==', payload.name).limit(20).get();
  const match = byName.docs.find((d) => d.data().customerId === custId);
  if (match) {
    await match.ref.set({ ...payload, customerId: custId, updatedAt: Timestamp.now() }, { merge: true });
    return match.id;
  }
  const ref = await col.add({
    ...payload,
    customerId: custId,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  });
  return ref.id;
}

function norm(s) {
  return String(s || '').toLowerCase().replace(/\s+/g, ' ').trim();
}

/** Match app `formatProductDisplayName` (must stay in sync for seed substring matching). */
function formatProductDisplayName({ name, version }) {
  const rawName = String(name ?? '').trim();
  const verRaw = String(version ?? '').trim();
  if (!verRaw) return rawName;
  const lc = verRaw.toLowerCase();
  if (lc === 'latest') return rawName ? `${rawName} Latest` : 'Latest';
  const noLeadingVs = verRaw.replace(/^v+/i, '');
  const segment = /^[\d.]+\w*$/u.test(noLeadingVs) ? `v${noLeadingVs}` : noLeadingVs;
  return rawName ? `${rawName} ${segment}` : segment;
}

function resolveCustomer(customersSnap, hints) {
  const list = [];
  customersSnap.docs.forEach((d) =>
    list.push({ id: d.id, customerName: d.data().customerName || '', data: d.data() }),
  );
  for (const row of list) {
    const n = norm(row.customerName);
    if (!n) continue;
    for (const h of hints) {
      const hn = norm(h);
      if (n.includes(hn) || hn.includes(n)) return row;
    }
  }
  return null;
}

function resolveCategoryByName(categories, categoryName) {
  const want = norm(categoryName);
  let c = categories.find((x) => norm(x.name) === want);
  if (c) return c;
  c = categories.find((x) => norm(x.name).includes(want) || want.includes(norm(x.name)));
  if (c) return c;
  console.warn(`  ⚠ Category not found "${categoryName}" — using "${categories[0]?.name}".`);
  return categories[0];
}

/** Create or refresh the ten canonical Hub task categories (ordering + badges). */
async function ensureCanonicalTaskCategories(db) {
  const col = db.collection('taskCategories');
  const now = Timestamp.now();
  console.log('Ensuring canonical task categories (10 kinds)…');
  for (let i = 0; i < TASK_CATEGORY_DEFAULTS.length; i++) {
    const row = TASK_CATEGORY_DEFAULTS[i];
    const q = await col.where('name', '==', row.name).limit(1).get();
    if (q.empty) {
      await col.add({
        name: row.name,
        color: row.color,
        sortOrder: i,
        createdAt: now,
        updatedAt: now,
      });
      console.log('  +', row.name);
    } else {
      await q.docs[0].ref.set({ color: row.color, sortOrder: i, updatedAt: now }, { merge: true });
    }
  }
}

function resolveProducts(productSnap, substrs) {
  if (!substrs?.length) return [];
  const list = [];
  productSnap.docs.forEach((d) => {
    const data = d.data();
    list.push({
      id: d.id,
      display: formatProductDisplayName({
        name: data.name ?? '',
        version: data.version ?? '',
      }),
      nameStr: norm(data.name || ''),
      verStr: norm(data.version || ''),
    });
  });
  return list
    .filter((p) =>
      substrs.every((sub) => {
        const s = norm(sub);
        return (
          norm(p.display).includes(s) ||
          p.nameStr.includes(s) ||
          (p.verStr && p.verStr.includes(s))
        );
      }),
    )
    .map((p) => p.id);
}

/**
 * Resolve internalContacts document IDs by human name (after DEMO_INTERNAL_TEAM upsert).
 */
async function resolveInternalContactIdsByNames(db, names) {
  if (!names?.length) return [];
  const snap = await db.collection('internalContacts').get();
  /** @type {Map<string, string>} */
  const byNormName = new Map();
  snap.docs.forEach((d) => {
    const n = d.data().name;
    if (typeof n === 'string' && n.trim()) byNormName.set(norm(n), d.id);
  });
  const ids = [];
  for (const name of names) {
    const id = byNormName.get(norm(name));
    if (id) ids.push(id);
    else console.warn(`  ⚠ Seed: internal contact not found — "${name}"`);
  }
  return ids;
}

/**
 * Create reference opportunities for the “demo healthcare” account when missing (match by CRM URL or opportunity name).
 */
async function ensureDemoHealthcareOpportunities(db, custSnap, userEmail) {
  const healthcare = resolveCustomer(custSnap, ['demo healthcare', 'healthcare demo']);
  if (!healthcare) {
    console.log(
      '  (skip) No demo healthcare customer matched — use a fictitious account name containing "Demo Healthcare".',
    );
    return;
  }
  const col = db.collection('opportunities');
  const existing = await col.where('customerId', '==', healthcare.id).get();
  /** @type {Set<string>} */
  const seenUrls = new Set();
  /** @type {Set<string>} */
  const seenNames = new Set();
  existing.docs.forEach((d) => {
    const data = d.data();
    const u = data.crmOpportunityUrl;
    if (typeof u === 'string' && u.trim()) seenUrls.add(u.trim());
    const n = data.opportunityName;
    if (typeof n === 'string' && n.trim()) seenNames.add(norm(n.trim()));
  });

  for (const row of DEMO_HEALTHCARE_OPPORTUNITY_SEED) {
    const url = row.crmOpportunityUrl.trim();
    const nameKey = norm(row.opportunityName);
    if (seenUrls.has(url)) {
      console.log('  skip opp (CRM URL exists):', row.opportunityName);
      continue;
    }
    if (seenNames.has(nameKey)) {
      console.log('  skip opp (name exists):', row.opportunityName);
      continue;
    }
    const id = randomUUID();
    const now = Timestamp.now();
    const stageHistory = [
      {
        id: randomUUID(),
        fromStage: null,
        toStage: row.currentStage,
        changedBy: userEmail,
        changedAt: now,
        duration: 0,
      },
    ];
    await col.doc(id).set({
      customerId: healthcare.id,
      opportunityName: row.opportunityName,
      currentStage: row.currentStage,
      stageHistory,
      products: [],
      crmOpportunityUrl: row.crmOpportunityUrl,
      createdBy: userEmail,
      updatedBy: userEmail,
      createdAt: now,
      updatedAt: now,
    });
    seenUrls.add(url);
    seenNames.add(nameKey);
    console.log('  + opportunity:', row.opportunityName, '→', id);
  }
}

async function addCustomerContactIdToCustomer(db, customerId, contactId) {
  const ref = db.collection('customers').doc(customerId);
  const snap = await ref.get();
  if (!snap.exists) return;
  const cur = snap.data().customerContactIds;
  const arr = Array.isArray(cur) ? [...cur] : [];
  if (arr.includes(contactId)) return;
  await ref.update({
    customerContactIds: [...arr, contactId],
    updatedAt: Timestamp.now(),
  });
}

/**
 * Ensure demo-charity CRM opportunity + synthetic catalogue contact (no real identities).
 */
async function ensureDemoCharityReferenceOpportunities(db, custSnap, userEmail) {
  const charityCust = resolveCustomer(custSnap, ['demo charity', 'charity demo']);
  if (!charityCust) {
    console.log(
      '  (skip) No demo charity customer matched — use “Demo Charity” (or similar) in `customerName`.',
    );
    return;
  }

  const primaryId = await upsertCustomerContact(db, charityCust.id, {
    name: 'River Jordan',
    email: 'river.jordan@partner.demo.invalid',
    role: 'Head of Digital',
  });
  await addCustomerContactIdToCustomer(db, charityCust.id, primaryId);

  const col = db.collection('opportunities');
  const existing = await col.where('customerId', '==', charityCust.id).get();
  const url = DEMO_CHARITY_CRM_URL.trim();
  const match = existing.docs.find((d) => (d.data().crmOpportunityUrl || '').trim() === url);

  const aeSnap = await db.collection('internalContacts').where('name', '==', 'Demo AE Alpha').limit(1).get();
  let owner;
  if (!aeSnap.empty) {
    const d = aeSnap.docs[0];
    const x = d.data();
    owner = {
      id: d.id,
      name: x.name || 'Demo AE Alpha',
      role: x.role || 'Account Executive',
      ...(x.email ? { email: String(x.email) } : {}),
    };
  }

  const now = Timestamp.now();
  const opportunityName = 'SitecoreAI — Demo Charity';
  const currentStage = 'Differentiate';

  const payloadBase = {
    opportunityName,
    currentStage,
    description: DEMO_CHARITY_OPPORTUNITY_DESCRIPTION,
    crmOpportunityUrl: url,
    competitorInfo: 'Placeholder competitors for training data only.',
    nextSteps:
      'Workshop backlog; procurement milestones; architectural review placeholder — tailor in your sandbox.',
    updatedBy: userEmail,
    updatedAt: now,
  };

  if (match) {
    const data = match.data();
    const prevStage = data.currentStage;
    const patch = { ...payloadBase };
    if (owner) patch.owner = owner;
    if (currentStage !== prevStage) {
      const hist = Array.isArray(data.stageHistory) ? [...data.stageHistory] : [];
      hist.push({
        id: randomUUID(),
        fromStage: prevStage,
        toStage: currentStage,
        changedBy: userEmail,
        changedAt: now,
        duration: 0,
      });
      patch.stageHistory = hist;
    }
    await match.ref.set(patch, { merge: true });
    console.log('  ↻ demo charity opportunity updated (CRM URL):', opportunityName, '→', match.id);
    return;
  }

  const id = randomUUID();
  const stageHistory = [
    {
      id: randomUUID(),
      fromStage: null,
      toStage: currentStage,
      changedBy: userEmail,
      changedAt: now,
      duration: 0,
    },
  ];
  await col.doc(id).set({
    customerId: charityCust.id,
    ...payloadBase,
    stageHistory,
    products: [],
    ...(owner ? { owner } : {}),
    createdBy: userEmail,
    createdAt: now,
  });
  console.log('  + demo charity opportunity:', opportunityName, '→', id);
}

async function resolveOpportunityIdByCrmUrl(db, customerId, crmUrl) {
  if (!customerId || !crmUrl?.trim()) return null;
  const want = crmUrl.trim();
  const snap = await db.collection('opportunities').where('customerId', '==', customerId).get();
  const hit = snap.docs.find((d) => (d.data().crmOpportunityUrl || '').trim() === want);
  return hit?.id ?? null;
}

(async () => {
  const db = initDb();

  console.log('Upserting internal contacts…');
  for (const c of DEMO_INTERNAL_TEAM) {
    await upsertInternalContact(db, {
      name: c.name,
      ...(c.role ? { role: c.role } : {}),
      ...(c.email ? { email: c.email } : {}),
    });
  }

  await ensureCanonicalTaskCategories(db);

  const [custSnap, catSnapRaw, prodSnap, tasksSnap] = await Promise.all([
    db.collection('customers').get(),
    db.collection('taskCategories').get(),
    db.collection('products').get(),
    db.collection('engagementTasks').get(),
  ]);

  const categories = catSnapRaw.docs
    .map((d) => ({
      id: d.id,
      name: String(d.data().name || ''),
      sortOrder: typeof d.data().sortOrder === 'number' ? d.data().sortOrder : 0,
    }))
    .sort((a, b) => a.sortOrder - b.sortOrder);
  if (!categories.length) {
    console.error('No task categories in Firestore. Create at least one in the app first.');
    process.exit(1);
  }

  console.log('\nEnsuring demo healthcare CRM reference opportunities…');
  await ensureDemoHealthcareOpportunities(db, custSnap, userEmailArg);

  console.log('\nEnsuring demo charity CRM reference opportunity + contacts…');
  await ensureDemoCharityReferenceOpportunities(db, custSnap, userEmailArg);

  console.log('\nCreating demonstrator tasks (skip if title + planning date duplicate)…');

  /** @type {Set<string>} */
  const signed = new Set();
  tasksSnap.docs.forEach((d) => {
    const x = d.data();
    const day =
      x.startDate?.toDate?.()?.toISOString?.()?.slice(0, 10) ||
      x.dueDate?.toDate?.()?.toISOString?.()?.slice(0, 10) ||
      '';
    signed.add(`${norm(x.title)}|${day}`);
  });

  let maxOrder = 0;
  tasksSnap.docs.forEach((d) => {
    const o = d.data().order;
    if (typeof o === 'number' && o > maxOrder) maxOrder = o;
  });
  let orderCursor = maxOrder;

  for (const def of TASK_DEFS) {
    const cust = resolveCustomer(custSnap, def.customerHints);
    const cat = resolveCategoryByName(categories, def.categoryName);
    const plan = new Date(`${def.planningDate}T12:00:00.000Z`);
    const key = `${norm(def.title)}|${def.planningDate}`;
    if (signed.has(key)) {
      console.log('  skip (already):', def.title);
      continue;
    }
    signed.add(key);

    orderCursor += 1;

    const productIds = resolveProducts(prodSnap, def.productNameSubstrings);
    const internalContactIds = await resolveInternalContactIdsByNames(db, def.internalContactNames || []);

    /** @type {string[]} */
    let customerContactIds = [];
    if (cust?.id && def.linkCustomerContacts?.length) {
      for (const payload of def.linkCustomerContacts) {
        customerContactIds.push(await upsertCustomerContact(db, cust.id, payload));
      }
    }

    if (def.linkCustomerContacts?.length && !cust?.id) {
      console.warn(
        '  ⚠ Task has linkCustomerContacts but no customer matched — skipping contact upserts:',
        def.title,
      );
    }

    let opportunityId = null;
    if (def.crmOpportunityUrl && cust?.id) {
      opportunityId = await resolveOpportunityIdByCrmUrl(db, cust.id, def.crmOpportunityUrl);
      if (!opportunityId) {
        console.warn('  ⚠ No opportunity matched CRM URL:', def.title, def.crmOpportunityUrl);
      }
    }

    /** @type {Record<string, unknown>} */
    const row = {
      title: def.title,
      description:
        def.description +
        (cust ? '' : `\n\n[Seed] No customer matched hints: ${def.customerHints.join(', ')}`),
      categoryIds: [cat.id],
      categoryId: cat.id,
      opportunityId,
      customerId: cust?.id ?? null,
      productIds,
      internalContactIds,
      customerContactIds,
      status: 'todo',
      order: orderCursor,
      dueDate: Timestamp.fromDate(plan),
      startDate: Timestamp.fromDate(plan),
      endDate: Timestamp.fromDate(plan),
      lastActionedAt: Timestamp.now(),
      createdBy: userEmailArg,
      updatedBy: userEmailArg,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    const ref = await db.collection('engagementTasks').add(row);
    console.log('  ✓', def.title, '→', ref.id);
  }

  console.log('\nDone. Refresh Tasks & Kanban in the app.');
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
