import 'server-only';
import { Timestamp } from 'firebase-admin/firestore';
import { requireAdminFirestore } from '@/lib/server/adminFirestore';
import type { CreateCustomerProfileData, CustomerProfile } from '@/types';

const COLLECTION = 'customerProfiles';

const DATE_FIELDS = new Set([
  'latestDemoDate',
  'seNotesLastUpdated',
  'servicesNotesLastUpdated',
  'createdAt',
  'updatedAt',
]);

function toDateField(v: unknown): unknown {
  if (v == null) return undefined;
  if (v instanceof Date) return Timestamp.fromDate(v);
  if (typeof v === 'string' || typeof v === 'number') {
    const d = new Date(v);
    if (!Number.isNaN(d.getTime())) return Timestamp.fromDate(d);
  }
  return v;
}

function scrubPatch(patch: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(patch)) {
    if (v === undefined) continue;
    if (k === 'id' || k === 'customerId') continue;
    out[k] = DATE_FIELDS.has(k) ? toDateField(v) : v;
  }
  return out;
}

export async function getCustomerProfileByCustomerIdAdmin(
  customerId: string,
): Promise<CustomerProfile | null> {
  const db = requireAdminFirestore();
  const snap = await db.collection(COLLECTION).where('customerId', '==', customerId).limit(1).get();
  if (snap.empty) return null;
  const d = snap.docs[0];
  const data = d.data();
  return {
    id: d.id,
    ...data,
    latestDemoDate: data.latestDemoDate?.toDate?.() ?? data.latestDemoDate,
    seNotesLastUpdated: data.seNotesLastUpdated?.toDate?.() ?? data.seNotesLastUpdated,
    servicesNotesLastUpdated: data.servicesNotesLastUpdated?.toDate?.() ?? data.servicesNotesLastUpdated,
    createdAt: data.createdAt?.toDate?.() ?? data.createdAt,
    updatedAt: data.updatedAt?.toDate?.() ?? data.updatedAt,
  } as CustomerProfile;
}

/** Merge profile fields; creates a minimal profile if none exists. */
export async function mergeCustomerProfileByCustomerIdAdmin(
  customerId: string,
  patch: Partial<CreateCustomerProfileData> & Record<string, unknown>,
  userId: string,
): Promise<{ profileId: string; created: boolean }> {
  const db = requireAdminFirestore();
  const existing = await db.collection(COLLECTION).where('customerId', '==', customerId).limit(1).get();
  const payload = scrubPatch(patch as Record<string, unknown>);
  payload.updatedAt = Timestamp.now();

  if (!existing.empty) {
    const ref = existing.docs[0].ref;
    await ref.set(payload, { merge: true });
    return { profileId: ref.id, created: false };
  }

  const now = Timestamp.now();
  const seed: Record<string, unknown> = {
    customerId,
    businessProblem: '',
    whyUs: '',
    whyNow: '',
    techSelect: false,
    preDiscovery: false,
    discovery: '',
    discoveryNotesAttached: false,
    totalDemos: 0,
    latestDemoDryRun: false,
    latestDemoDate: now,
    techDeepDive: '',
    infoSecCompleted: false,
    knownTechnicalRisks: '',
    mitigationPlan: '',
    seNotes: '',
    seInvolvement: '',
    seNotesLastUpdated: now,
    seProductFitAssessment: '',
    seProductNotGreenReason: '',
    seConfidenceNotGreenReason: '',
    customerObjective1: '',
    customerObjective2: '',
    customerObjective3: '',
    customerObjectivesDetails: '',
    customerUseCase1: '',
    customerUseCase2: '',
    customerUseCase3: '',
    createdAt: now,
    ...payload,
  };
  const ref = await db.collection(COLLECTION).add(seed);
  return { profileId: ref.id, created: true };
}
