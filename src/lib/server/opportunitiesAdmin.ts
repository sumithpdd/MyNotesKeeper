import 'server-only';
import type { DocumentData } from 'firebase-admin/firestore';
import { randomUUID } from 'crypto';
import { requireAdminFirestore } from '@/lib/server/adminFirestore';
import { toDate, toDateOrUndefined, tsFrom, stripUndefined } from '@/lib/server/adminConvert';
import type {
  Opportunity,
  CreateOpportunityData,
  UpdateOpportunityData,
  OpportunityStage,
} from '@/types';

/**
 * Admin-SDK opportunities. Mirrors `src/lib/opportunityService.ts`, which uses
 * the Firebase **web** SDK and so is denied when called from a route handler.
 *
 * Stage-history semantics are preserved exactly: creating an opportunity seeds
 * one entry, and `changeStageAdmin` appends an entry recording the days spent
 * in the previous stage.
 */

const COLLECTION = 'opportunities';

function toOpportunity(id: string, data: DocumentData): Opportunity {
  return {
    ...data,
    id,
    createdAt: toDate(data.createdAt),
    updatedAt: toDate(data.updatedAt),
    expectedCloseDate: toDateOrUndefined(data.expectedCloseDate),
    actualCloseDate: toDateOrUndefined(data.actualCloseDate),
    stageHistory: (data.stageHistory || []).map((entry: DocumentData) => ({
      ...entry,
      changedAt: toDate(entry.changedAt),
    })),
  } as Opportunity;
}

/** Convert outgoing dates to Admin Timestamps, including nested stage history. */
function toFirestore(data: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = { ...data };
  for (const key of ['createdAt', 'updatedAt', 'expectedCloseDate', 'actualCloseDate']) {
    const v = data[key];
    if (v != null) result[key] = tsFrom(v as Date | string | number);
  }
  if (Array.isArray(data.stageHistory)) {
    result.stageHistory = (data.stageHistory as Record<string, unknown>[]).map((entry) =>
      stripUndefined({ ...entry, changedAt: tsFrom(entry.changedAt as Date | string) }),
    );
  }
  return stripUndefined(result);
}

export async function getAllOpportunitiesAdmin(): Promise<Opportunity[]> {
  const db = requireAdminFirestore();
  const snap = await db.collection(COLLECTION).get();
  const rows = snap.docs.map((d) => toOpportunity(d.id, d.data()));
  rows.sort((a, b) => (b.updatedAt?.getTime() || 0) - (a.updatedAt?.getTime() || 0));
  return rows;
}

export async function getOpportunityByIdAdmin(id: string): Promise<Opportunity | null> {
  const db = requireAdminFirestore();
  const snap = await db.collection(COLLECTION).doc(id).get();
  if (!snap.exists) return null;
  return toOpportunity(snap.id, snap.data() as DocumentData);
}

export async function getOpportunitiesByCustomerAdmin(
  customerId: string,
): Promise<Opportunity[]> {
  const db = requireAdminFirestore();
  const snap = await db.collection(COLLECTION).where('customerId', '==', customerId).get();
  const rows = snap.docs.map((d) => toOpportunity(d.id, d.data()));
  rows.sort((a, b) => (b.updatedAt?.getTime() || 0) - (a.updatedAt?.getTime() || 0));
  return rows;
}

export async function createOpportunityAdmin(
  data: CreateOpportunityData,
): Promise<Opportunity> {
  const db = requireAdminFirestore();
  const now = new Date();
  const opportunityData = {
    ...data,
    stageHistory: [
      {
        id: randomUUID(),
        fromStage: null,
        toStage: data.currentStage,
        changedBy: data.createdBy,
        changedAt: now,
        duration: 0,
      },
    ],
    createdAt: now,
    updatedAt: now,
  };
  const ref = await db.collection(COLLECTION).add(toFirestore(opportunityData));
  return { ...opportunityData, id: ref.id } as Opportunity;
}

export async function updateOpportunityAdmin(data: UpdateOpportunityData): Promise<void> {
  const db = requireAdminFirestore();
  const { id, ...updateData } = data;
  await db
    .collection(COLLECTION)
    .doc(id)
    .update(toFirestore({ ...updateData, updatedAt: new Date() }));
}

export async function changeStageAdmin(
  opportunity: Opportunity,
  newStage: OpportunityStage,
  changedBy: string,
  notes?: string,
): Promise<void> {
  const db = requireAdminFirestore();
  const now = new Date();
  const last = opportunity.stageHistory[opportunity.stageHistory.length - 1];
  const duration = last
    ? Math.floor((now.getTime() - new Date(last.changedAt).getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  const stageHistory = [
    ...opportunity.stageHistory,
    stripUndefined({
      id: randomUUID(),
      fromStage: opportunity.currentStage,
      toStage: newStage,
      changedBy,
      changedAt: now,
      notes,
      duration,
    }),
  ];

  await db.collection(COLLECTION).doc(opportunity.id).update(
    toFirestore({
      currentStage: newStage,
      stageHistory,
      updatedBy: changedBy,
      updatedAt: now,
    }),
  );
}

export async function deleteOpportunityAdmin(id: string): Promise<void> {
  const db = requireAdminFirestore();
  await db.collection(COLLECTION).doc(id).delete();
}

export async function deleteOpportunitiesByCustomerAdmin(customerId: string): Promise<void> {
  const rows = await getOpportunitiesByCustomerAdmin(customerId);
  await Promise.all(rows.map((o) => deleteOpportunityAdmin(o.id)));
}
