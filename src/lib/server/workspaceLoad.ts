import { Timestamp } from 'firebase-admin/firestore';
import type {
  DocumentData,
  DocumentSnapshot,
  Firestore,
  QuerySnapshot,
} from 'firebase-admin/firestore';
import type {
  Customer,
  CustomerContact,
  CustomerNote,
  CustomerProfile,
  InternalContact,
  MartechTool,
  Opportunity,
  Partner,
  Product,
} from '@/types';
import type { EngagementTask, TaskCategory } from '@/types/task';
import { contactResolver, type ResolverIndexes } from '@/lib/contactResolver';
import { requireAdminFirestore } from '@/lib/server/adminFirestore';
import { engagementTaskFromDoc } from '@/lib/server/tasksAdmin';

function toDate(ts: unknown): Date {
  if (!ts) return new Date();
  if (ts instanceof Date) return ts;
  if (typeof ts === 'object' && ts !== null && 'toDate' in ts && typeof (ts as { toDate: () => Date }).toDate === 'function') {
    try {
      return (ts as { toDate: () => Date }).toDate();
    } catch {
      return new Date();
    }
  }
  return new Date();
}

function chunkArray<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

/** Default task kinds when Firestore `taskCategories` has no docs yet — keep names in sync with `scripts/seedDemonstratorTasks.js` `TASK_CATEGORY_DEFAULTS`. */
const DEFAULT_TASK_CATEGORY_SEED: readonly { name: string; color: string }[] = [
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

async function seedTaskCategoriesIfEmpty(db: Firestore) {
  const snap = await db.collection('taskCategories').limit(1).get();
  if (!snap.empty) return;

  const batch = db.batch();
  const now = Timestamp.now();
  DEFAULT_TASK_CATEGORY_SEED.forEach((c, i) => {
    const ref = db.collection('taskCategories').doc();
    batch.set(ref, {
      name: c.name,
      color: c.color,
      sortOrder: i,
      createdAt: now,
      updatedAt: now,
    });
  });
  await batch.commit();
}

async function seedMartechIfEmpty(db: Firestore) {
  const snap = await db.collection('martechTools').limit(1).get();
  if (!snap.empty) return;

  const defaults: Omit<MartechTool, 'id'>[] = [
    { name: 'Salesforce', purpose: 'CRM' },
    { name: 'SEMRush', purpose: 'SEO & Marketing Analytics' },
    { name: 'Dynamics 365', purpose: 'CRM & ERP' },
    { name: 'iGoDigital', purpose: 'Personalization & Recommendations' },
    { name: 'DotMailer', purpose: 'Email Campaign' },
    { name: 'Google Analytics GA4', purpose: 'Web Analytics' },
    { name: 'HotJar', purpose: 'Heatmaps & Session Recording' },
    { name: 'Facebook Pixel', purpose: 'Advertising Tracking' },
    { name: 'DoubleClick Floodlight', purpose: 'Ad Conversion Tracking' },
  ];

  const batch = db.batch();
  for (const tool of defaults) {
    const ref = db.collection('martechTools').doc();
    batch.set(ref, {
      ...tool,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
  }
  await batch.commit();
}

function taskOwned(t: EngagementTask, uid: string, email: string | null): boolean {
  const ownerUid = t.ownerUid;
  if (ownerUid) return ownerUid === uid;
  const createdBy = t.createdBy ?? '';
  if (email && createdBy === email) return true;
  return createdBy === uid;
}

/**
 * Canonical snapshot loader (Admin Firestore).
 *
 * **Customers:** By default every authenticated user sees **all** customers (`HUB_WORKSPACE_CUSTOMER_SCOPE` unset or `all`)
 * — same as legacy `customerService.getAllCustomers()`.
 * Set **`HUB_WORKSPACE_CUSTOMER_SCOPE=mine`** to restrict rows to `createdBy` matching your **`uid`** or **email**
 * (for multi-tenant / per-creator workspaces).
 *
 * Related rows (notes, opps scoped by customer IDs, referenced contacts, etc.) follow whichever customers load.
 */
export async function loadWorkspaceSnapshot(params: { uid: string; email: string | null }) {
  const db = requireAdminFirestore();
  const { uid, email } = params;

  await seedTaskCategoriesIfEmpty(db);
  await seedMartechIfEmpty(db);

  const customerScopeMine = process.env.HUB_WORKSPACE_CUSTOMER_SCOPE?.trim().toLowerCase() === 'mine';

  /** Merge snapshots by doc id without duplicates */
  function mergeCustDocs(snaps: QuerySnapshot[]): Map<string, DocumentSnapshot> {
    const byId = new Map<string, DocumentSnapshot>();
    for (const snap of snaps) snap.docs.forEach((d) => byId.set(d.id, d));
    return byId;
  }

  let customerDocMap: Map<string, DocumentSnapshot>;
  if (customerScopeMine) {
    const jobs: Promise<QuerySnapshot>[] = [db.collection('customers').where('createdBy', '==', uid).get()];
    if (email) jobs.push(db.collection('customers').where('createdBy', '==', email).get());
    const snaps = await Promise.all(jobs);
    customerDocMap = mergeCustDocs(snaps);
  } else {
    const all = await db.collection('customers').get();
    customerDocMap = mergeCustDocs([all]);
  }

  const customersBare = [...customerDocMap.values()].map((d) => {
    const data = d.data() as Omit<Customer, 'id'>;
    return {
      id: d.id,
      ...data,
      productIds: data.productIds ?? [],
      customerContactIds: data.customerContactIds ?? [],
      internalContactIds: data.internalContactIds ?? [],
      partnerIds: data.partnerIds ?? [],
      martechToolIds: data.martechToolIds ?? [],
      sharePointUrl: data.sharePointUrl ?? '',
      salesforceLink: data.salesforceLink ?? '',
      createdAt: toDate((data as { createdAt?: unknown }).createdAt),
      updatedAt: toDate((data as { updatedAt?: unknown }).updatedAt),
    } as Customer;
  });

  const customerIds = customersBare.map((c) => c.id);

  /** Notes scoped to tenant customers only */
  const notes: CustomerNote[] = [];
  for (const idChunk of chunkArray(customerIds, 30)) {
    if (!idChunk.length) break;
    const nSnap = await db
      .collection('customerNotes')
      .where('customerId', 'in', idChunk)
      .get();
    notes.push(
      ...nSnap.docs.map((d) => {
        const raw = d.data();
        return {
          id: d.id,
          ...raw,
          noteDate: toDate(raw.noteDate),
          createdAt: toDate(raw.createdAt),
          updatedAt: toDate(raw.updatedAt),
        } as CustomerNote;
      }),
    );
  }

  notes.sort((a, b) => (b.createdAt?.getTime() ?? 0) - (a.createdAt?.getTime() ?? 0));

  /** Opportunities scoped to tenant customers OR created directly by uid */
  const opportunities: Opportunity[] = [];
  const oppById = new Set<string>();

  const addOpp = (o: Opportunity) => {
    if (oppById.has(o.id)) return;
    oppById.add(o.id);
    opportunities.push(o);
  };

  const mapOpp = (id: string, data: DocumentData): Opportunity =>
    ({
      ...data,
      id,
      createdAt: toDate(data.createdAt),
      updatedAt: toDate(data.updatedAt),
      expectedCloseDate: data.expectedCloseDate ? toDate(data.expectedCloseDate) : undefined,
      actualCloseDate: data.actualCloseDate ? toDate(data.actualCloseDate) : undefined,
      stageHistory:
        ((data.stageHistory || []) as { changedAt?: unknown }[]).map((entry) => ({
          ...entry,
          changedAt: toDate(entry.changedAt),
        })) ?? [],
    }) as Opportunity;

  for (const idChunk of chunkArray(customerIds, 30)) {
    if (!idChunk.length) break;
    const oSnap = await db
      .collection('opportunities')
      .where('customerId', 'in', idChunk)
      .get();
    oSnap.docs.forEach((doc) => addOpp(mapOpp(doc.id, doc.data())));
  }

  if (customerIds.length > 0) {
    const ownSnap = await db.collection('opportunities').where('createdBy', '==', uid).get();
    ownSnap.docs.forEach((doc) => addOpp(mapOpp(doc.id, doc.data())));
  }

  /** Profiles scoped to tenant customers */
  const customerProfiles: CustomerProfile[] = [];
  for (const idChunk of chunkArray(customerIds, 30)) {
    if (!idChunk.length) break;
    const pSnap = await db
      .collection('customerProfiles')
      .where('customerId', 'in', idChunk)
      .get();
    customerProfiles.push(
      ...pSnap.docs.map((d) => {
        const data = d.data();
        return {
          id: d.id,
          ...data,
          latestDemoDate: toDate(data.latestDemoDate),
          seNotesLastUpdated: toDate(data.seNotesLastUpdated),
          createdAt: toDate(data.createdAt),
          updatedAt: toDate(data.updatedAt),
        } as CustomerProfile;
      }),
    );
  }

  /** Global catalogs (organisation-wide catalogue — normalised FKs on customers/tasks) */
  const [productsSnap, partnersSnap, martechSnap, taskCatSnap] = await Promise.all([
    db.collection('products').orderBy('name').get(),
    db.collection('partners').orderBy('name').get(),
    db.collection('martechTools').orderBy('name').get(),
    db.collection('taskCategories').orderBy('sortOrder', 'asc').get(),
  ]);

  const products: Product[] = productsSnap.docs.map(
    (d) => ({ id: d.id, ...d.data() }) as Product,
  );
  const partners: Partner[] = partnersSnap.docs.map(
    (d) => ({ id: d.id, ...d.data() }) as Partner,
  );

  const martechTools = martechSnap.docs.map((d) => {
    const raw = d.data();
    return {
      id: d.id,
      ...raw,
      createdAt: raw.createdAt ? toDate(raw.createdAt) : undefined,
      updatedAt: raw.updatedAt ? toDate(raw.updatedAt) : undefined,
    } as unknown as MartechTool;
  });

  const taskCategories: TaskCategory[] = taskCatSnap.docs.map((d) => {
    const raw = d.data();
    return {
      id: d.id,
      name: String(raw.name ?? ''),
      color: raw.color ? String(raw.color) : undefined,
      sortOrder: typeof raw.sortOrder === 'number' ? raw.sortOrder : 0,
      createdAt: toDate(raw.createdAt),
      updatedAt: toDate(raw.updatedAt),
    } as TaskCategory;
  });

  const productsById = new Map(products.map((p) => [p.id, p]));
  const partnersById = new Map(partners.map((p) => [p.id, p]));
  const martechById = new Map(martechTools.map((m) => [m.id, m]));

  /** Contacts only if referenced AND owned by tenant customers (normalized IDs on customers only) */
  const contactIds = new Set<string>();
  const internalIds = new Set<string>();
  for (const c of customersBare) {
    (c.customerContactIds || []).forEach((id) => contactIds.add(id));
    (c.internalContactIds || []).forEach((id) => internalIds.add(id));
  }

  async function docsByRefs<T>(
    col: string,
    idsSet: Set<string>,
    mapper: (id: string, data: DocumentData) => T,
  ): Promise<Map<string, T>> {
    const out = new Map<string, T>();
    const uniq = [...idsSet];
    for (const idChunk of chunkArray(uniq, 30)) {
      if (!idChunk.length) continue;
      const refs = idChunk.map((id) => db.collection(col).doc(id));
      const snaps = await db.getAll(...refs);
      snaps.forEach((snap) => {
        if (!snap.exists) return;
        out.set(snap.id, mapper(snap.id, snap.data() as DocumentData));
      });
    }
    return out;
  }

  const customerContactsMap = await docsByRefs<CustomerContact>(
    'customerContacts',
    contactIds,
    (id, raw) =>
      ({
        id,
        ...raw,
      }) as CustomerContact,
  );
  const internalContactsMap = await docsByRefs<InternalContact>('internalContacts', internalIds, (id, raw) => ({
    id,
    ...raw,
  }) as InternalContact);

  const indexes: ResolverIndexes = {
    customerContactsById: customerContactsMap,
    internalContactsById: internalContactsMap,
    productsById,
    partnersById,
    martechById,
  };

  const customersEnriched = contactResolver.enrichCustomersFromIndexes(customersBare, indexes);
  const customerContacts = [...customerContactsMap.values()].sort((a, b) =>
    (a.name || '').localeCompare(b.name || ''),
  );
  const internalContacts = [...internalContactsMap.values()].sort((a, b) =>
    (a.name || '').localeCompare(b.name || ''),
  );

  /** Engagement tasks (tenant-filtered; uses ownerUid once backfilled — legacy compares createdBy/email) */
  const taskSnap = await db.collection('engagementTasks').get();
  const tasks: EngagementTask[] = [];
  taskSnap.docs.forEach((doc) => {
    const parsed = engagementTaskFromDoc(doc.id, doc.data() as DocumentData);
    if (taskOwned(parsed, uid, email)) tasks.push(parsed);
  });
  tasks.sort((a, b) => {
    const sb = (s: EngagementTask) =>
      s.status === 'todo' ? 0 : s.status === 'in_progress' ? 1 : s.status === 'done' ? 2 : 3;
    if (sb(a) !== sb(b)) return sb(a) - sb(b);
    return a.order - b.order;
  });

  return {
    customers: customersEnriched,
    notes,
    customerProfiles,
    opportunities,
    products,
    partners,
    martechTools,
    customerContacts,
    internalContacts,
    tasks,
    taskCategories,
  };
}
