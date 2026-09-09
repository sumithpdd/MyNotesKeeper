/**
 * AI Chat API - LLM + Tools
 *
 * POST /api/ai-chat
 * Body: { message: string } — tenancy from verified Bearer (`auth.uid`); do not trust a client-supplied userId.
 * Returns: { text?: string, error?: string }
 *
 * Uses processWithTools with server-side tool executors.
 *
 * All Firestore access here goes through the Firebase **Admin** SDK
 * (`loadWorkspaceSnapshot` for reads, `*Admin` helpers for writes). The
 * `src/lib/*Service.ts` helpers must NOT be used from this route: they use the
 * Firebase web SDK, which has no signed-in user on the server, so every
 * `firestore.rules` check fails with `permission-denied`.
 */

import { NextRequest, NextResponse } from 'next/server';
import { processWithTools, type ToolExecutor } from '@/lib/aiToolsService';
import { authorizeApiRequest } from '@/lib/server/authorizeApiRequest';
import { createCustomerAdmin, updateCustomerAdmin } from '@/lib/server/customersAdmin';
import { createNoteAdmin } from '@/lib/server/notesAdmin';
import {
  createInternalContactAdmin,
  createCustomerContactAdmin,
} from '@/lib/server/contactsAdmin';
import { createProductAdmin, createPartnerAdmin } from '@/lib/server/entitiesAdmin';
import { aiService } from '@/lib/ai';
import type { CreateCustomerData } from '@/types';
import { formatProductDisplayName } from '@/lib/productDisplay';
import { loadWorkspaceSnapshot } from '@/lib/server/workspaceLoad';
import { fiscalPeriodLabel } from '@/domain/engagement-hub/fiscalPeriod';
import { seRagLabel, seInvolvementLabel } from '@/domain/engagement-hub/seAssessment';
import { calendarDaysBetween, formatTimeInCurrentStage } from '@/lib/opportunityStages';
import {
  ACCOUNT_PLANNING_PILLARS,
  filterTasksByPlanningPillar,
  normalizePillarId,
  planFieldsFor,
} from '@/domain/engagement-hub/accountPlanningPillars';
import {
  parseDealQualification,
  qualificationGaps,
  qualificationCoverage,
} from '@/domain/engagement-hub/dealQualification';
import { workspaceCompleteness, type EntityKind } from '@/domain/engagement-hub/completeness';

export async function POST(request: NextRequest) {
  try {
    const auth = await authorizeApiRequest(request);
    if (auth instanceof NextResponse) return auth;

    const body = await request.json();
    const { message } = body;

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Message is required' },
        { status: 400 }
      );
    }

    const uid = auth.uid;

    // Everything is read through the tenant-aware workspace loader, which uses
    // the Firebase **Admin** SDK.
    //
    // The `src/lib/*Service.ts` helpers use the Firebase *web* SDK, which
    // authenticates as the signed-in browser user. Called from a route handler
    // there is no such user, so every rule in `firestore.rules` (all of which
    // require `request.auth != null`) denies the read with `permission-denied`.
    // See `src/lib/server/adminFirestore.ts`.
    const workspace = await loadWorkspaceSnapshot({ uid, email: auth.email });
    const {
      customers,
      notes,
      customerProfiles: profiles,
      customerContacts,
      internalContacts,
      products,
      partners,
      opportunities,
      tasks,
    } = workspace;

    const customerById = new Map(customers.map((c) => [c.id, c]));
    const nameOf = (customerId?: string | null) =>
      (customerId && customerById.get(customerId)?.customerName) || 'Unlinked';

    /** Loose account matcher shared by the status tools. */
    const findCustomer = (search?: string) => {
      const q = search?.trim().toLowerCase();
      if (!q) return undefined;
      return customers.find(
        (c) =>
          (c.customerName || '').toLowerCase().includes(q) ||
          q.includes((c.customerName || '').toLowerCase()),
      );
    };

    const matchName = <T extends { name: string }>(list: T[], search: string): T | undefined =>
      list.find(
        (item) =>
          item.name.toLowerCase().includes(search.toLowerCase()) ||
          search.toLowerCase().includes(item.name.toLowerCase())
      );

    const toolExecutors: Partial<ToolExecutor> = {
      lookup_customer: async (args) => {
        const name = (args as { customerName: string }).customerName?.trim();
        if (!name) return { found: false, error: 'No customer name provided' };
        const match = customers.find(
          (c) =>
            c.customerName?.toLowerCase().includes(name.toLowerCase()) ||
            name.toLowerCase().includes((c.customerName || '').toLowerCase())
        );
        if (!match) {
          return {
            found: false,
            customerName: name,
            message: `No customer found matching "${name}".`,
          };
        }
        const customerNotes = notes.filter((n) => n.customerId === match.id);
        const profile = profiles.find((p) => p.customerId === match.id);
        return {
          found: true,
          customer: {
            id: match.id,
            customerName: match.customerName,
            products:
              (match.products || []).map((p) => formatProductDisplayName(p)).join(', ') || 'None',
            partners: (match.partners || []).map((p) => p.name).join(', ') || 'None',
            contacts: (match.customerContacts || []).length,
            notesCount: customerNotes.length,
            hasProfile: !!profile,
          },
        };
      },
      customer_summary: async (args) => {
        const name = (args as { customerName: string }).customerName?.trim();
        if (!name) return { error: 'No customer name provided' };
        const match = customers.find(
          (c) =>
            c.customerName?.toLowerCase().includes(name.toLowerCase()) ||
            name.toLowerCase().includes((c.customerName || '').toLowerCase())
        );
        if (!match) return { found: false, message: `Customer "${name}" not found` };
        const summary = await aiService.generateCustomerSummary({
          customerName: match.customerName,
          products: match.products,
          migrationComplexity: match.migrationComplexity,
          perpetualOrSubscription: match.perpetualOrSubscription,
          hostingLocation: match.hostingLocation,
          compellingEvent: match.compellingEvent,
          existingMigrationOpp: match.existingMigrationOpp,
          migrationNotes: match.migrationNotes,
          mergedNotes: match.mergedNotes,
        });
        return { found: true, customerName: match.customerName, summary };
      },
      create_customer: async (args) => {
        const { customerName, additionalInfo } = args as { customerName: string; additionalInfo?: string };
        if (!customerName?.trim()) return { error: 'Customer name is required' };
        const existing = customers.find(
          (c) => c.customerName?.toLowerCase() === customerName.trim().toLowerCase()
        );
        if (existing) return { error: `Customer "${customerName}" already exists`, existing: true };
        const createData: CreateCustomerData = {
          customerName: customerName.trim(),
          productIds: [],
          customerContactIds: [],
          internalContactIds: [],
          partnerIds: [],
          sharePointUrl: '',
          salesforceLink: '',
          additionalInfo: additionalInfo?.trim() || '',
        };
        const newId = await createCustomerAdmin(createData, uid);
        return { created: true, customerName: customerName.trim(), id: newId };
      },
      update_customer: async (args) => {
        const { customerName, updates } = args as { customerName: string; updates?: Record<string, unknown> };
        if (!customerName?.trim()) return { error: 'Customer name is required' };
        const match = customers.find(
          (c) =>
            c.customerName?.toLowerCase().includes(customerName.toLowerCase()) ||
            customerName.toLowerCase().includes((c.customerName || '').toLowerCase())
        );
        if (!match) return { found: false, message: `Customer "${customerName}" not found` };
        const updateData = { ...updates } as Record<string, unknown>;
        delete updateData.id;
        const aeId = updateData.accountExecutiveId as string | undefined;
        const aeIds = updateData.accountExecutiveIds as string[] | undefined;
        if (aeId && typeof aeId === 'string') {
          const existingIds = (match.internalContactIds || []).filter(Boolean);
          const newAeIds = match.accountExecutiveIds || (match.accountExecutiveId ? [match.accountExecutiveId] : []);
          if (!newAeIds.includes(aeId)) {
            updateData.accountExecutiveIds = [...newAeIds, aeId];
            updateData.accountExecutiveId = aeId;
            if (!existingIds.includes(aeId)) {
              updateData.internalContactIds = [...existingIds, aeId];
            }
          }
        } else if (Array.isArray(aeIds)) {
          updateData.accountExecutiveIds = aeIds;
          updateData.accountExecutiveId = aeIds[0];
          const existingIds = (match.internalContactIds || []).filter(Boolean);
          updateData.internalContactIds = [...new Set([...existingIds, ...aeIds])];
        }
        await updateCustomerAdmin(match.id, updateData, uid);
        return { updated: true, customerName: match.customerName };
      },
      add_note: async (args) => {
        const { customerName, noteContent, seConfidence } = args as {
          customerName: string;
          noteContent: string;
          seConfidence?: 'Green' | 'Yellow' | 'Red';
        };
        if (!customerName?.trim()) return { error: 'Customer name is required' };
        if (!noteContent?.trim()) return { error: 'Note content is required' };
        const match = customers.find(
          (c) =>
            c.customerName?.toLowerCase().includes(customerName.toLowerCase()) ||
            customerName.toLowerCase().includes((c.customerName || '').toLowerCase())
        );
        if (!match) return { found: false, message: `Customer "${customerName}" not found` };
        const noteId = await createNoteAdmin(
          {
            customerId: match.id,
            notes: noteContent.trim(),
            noteDate: new Date(),
            createdBy: uid,
            updatedBy: uid,
            seConfidence: seConfidence || '',
            otherFields: {},
          },
          uid
        );
        return { added: true, customerName: match.customerName, noteId };
      },
      search_customers: async (args) => {
        const { searchTerm, product, partner, accountExecutive } = args as {
          searchTerm?: string;
          product?: string;
          partner?: string;
          accountExecutive?: string;
        };
        let filtered = [...customers];
        if (searchTerm?.trim()) {
          const term = searchTerm.toLowerCase();
          filtered = filtered.filter(
            (c) =>
              (c.customerName || '').toLowerCase().includes(term) ||
              (c.additionalInfo || '').toLowerCase().includes(term) ||
              (c.mergedNotes || '').toLowerCase().includes(term)
          );
        }
        if (product?.trim()) {
          const p = product.toLowerCase();
          filtered = filtered.filter((c) =>
            (c.products || []).some((pr) => (pr?.name || '').toLowerCase().includes(p))
          );
        }
        if (partner?.trim()) {
          const pa = partner.toLowerCase();
          filtered = filtered.filter((c) =>
            (c.partners || []).some((pr) => (pr?.name || '').toLowerCase().includes(pa))
          );
        }
        if (accountExecutive?.trim()) {
          const ae = accountExecutive.toLowerCase();
          filtered = filtered.filter((c) => {
            const aeIds = c.accountExecutiveIds || (c.accountExecutiveId ? [c.accountExecutiveId] : []);
            const aeNames = aeIds.map(id => internalContacts.find(ic => ic.id === id)?.name).filter(Boolean) as string[];
            const primaryName = c.accountExecutive?.name || aeNames[0];
            const names = [...aeNames, primaryName].filter(Boolean);
            return names.some(n => n.toLowerCase().includes(ae) || ae.includes(n.toLowerCase()));
          });
        }
        const getAEName = (c: { accountExecutiveId?: string; accountExecutiveIds?: string[] }) => {
          const ids = c.accountExecutiveIds || (c.accountExecutiveId ? [c.accountExecutiveId] : []);
          const names = ids.map(id => internalContacts.find(ic => ic.id === id)?.name).filter(Boolean);
          return names.length ? names.join(', ') : '—';
        };
        return {
          count: filtered.length,
          customers: filtered.map((c) => ({
            customerName: c.customerName,
            accountExecutive: getAEName(c),
            products: (c.products || []).map((p) => formatProductDisplayName(p)).join(', ') || 'None',
            partners: (c.partners || []).map((p) => p.name).join(', ') || 'None',
          })),
        };
      },
      list_customers: async () => ({
        count: customers.length,
        customers: customers.map((c) => ({
          customerName: c.customerName,
          products: (c.products || []).map((p) => formatProductDisplayName(p)).join(', ') || 'None',
          partners: (c.partners || []).map((p) => p.name).join(', ') || 'None',
        })),
      }),
      list_internal_contacts: async () => ({
        count: internalContacts.length,
        contacts: internalContacts.map((c) => ({ name: c.name, role: c.role, email: c.email })),
      }),
      list_products: async () => ({
        count: products.length,
        products: products.map((p) => ({
          displayName: formatProductDisplayName(p),
          name: p.name,
          version: p.version,
        })),
      }),
      list_partners: async () => ({
        count: partners.length,
        partners: partners.map((p) => ({ name: p.name, type: p.type })),
      }),
      lookup_internal_contact: async (args) => {
        const name = (args as { name: string }).name?.trim();
        if (!name) return { found: false, error: 'No name provided' };
        const match = matchName(internalContacts, name);
        if (!match) return { found: false, name, message: `No internal contact found matching "${name}".` };
        return { found: true, contact: { id: match.id, name: match.name, role: match.role, email: match.email } };
      },
      create_internal_contact: async (args) => {
        const { name, role, email } = args as { name: string; role?: string; email?: string };
        if (!name?.trim()) return { error: 'Name is required' };
        const id = await createInternalContactAdmin({
          name: name.trim(),
          role: role?.trim() || '',
          email: email?.trim() || '',
        });
        return { created: true, contact: { id, name: name.trim(), role: role || '', email: email || '' } };
      },
      lookup_customer_contact: async (args) => {
        const name = (args as { name: string }).name?.trim();
        if (!name) return { found: false, error: 'No name provided' };
        const match = matchName(customerContacts, name);
        if (!match) return { found: false, name, message: `No customer contact found matching "${name}".` };
        return { found: true, contact: { id: match.id, name: match.name, role: match.role } };
      },
      create_customer_contact: async (args) => {
        const { name, role, email } = args as { name: string; role?: string; email?: string };
        if (!name?.trim()) return { error: 'Name is required' };
        const id = await createCustomerContactAdmin({
          name: name.trim(),
          role: role?.trim() || '',
          email: email?.trim() || '',
        });
        return { created: true, contact: { id, name: name.trim(), role: role || '' } };
      },
      lookup_product: async (args) => {
        const name = (args as { name: string }).name?.trim();
        if (!name) return { found: false, error: 'No name provided' };
        const n = name.toLowerCase();
        const match = products.find((p) => {
          const display = formatProductDisplayName(p).toLowerCase();
          const pname = (p.name || '').toLowerCase();
          const ver = (p.version || '').toLowerCase();
          return (
            display.includes(n) ||
            n.includes(display) ||
            pname.includes(n) ||
            n.includes(pname) ||
            (ver && (ver.includes(n) || n.includes(ver)))
          );
        });
        if (!match)
          return { found: false, name, message: `No product found matching "${name}".` };
        return {
          found: true,
          product: {
            id: match.id,
            name: match.name,
            version: match.version,
            displayName: formatProductDisplayName(match),
          },
        };
      },
      create_product: async (args) => {
        const { name, version } = args as { name: string; version?: string };
        if (!name?.trim()) return { error: 'Name is required' };
        const id = await createProductAdmin({
          name: name.trim(),
          version: version?.trim() || '',
          description: '',
          status: 'Active',
        });
        return { created: true, product: { id, name: name.trim(), version: version || '' } };
      },
      lookup_partner: async (args) => {
        const name = (args as { name: string }).name?.trim();
        if (!name) return { found: false, error: 'No name provided' };
        const match = partners.find(
          (p) =>
            (p.name || '').toLowerCase().includes(name.toLowerCase()) ||
            name.toLowerCase().includes((p.name || '').toLowerCase())
        );
        if (!match) return { found: false, name, message: `No partner found matching "${name}".` };
        return { found: true, partner: { id: match.id, name: match.name, type: match.type } };
      },
      create_partner: async (args) => {
        const { name, type } = args as { name: string; type?: string };
        if (!name?.trim()) return { error: 'Name is required' };
        const id = await createPartnerAdmin({
          name: name.trim(),
          type: type?.trim() || '',
        });
        return { created: true, partner: { id, name: name.trim(), type: type || '' } };
      },

      account_status: async (args) => {
        const { customerName } = args as { customerName: string };
        const match = findCustomer(customerName);
        if (!match) return { found: false, message: `No account matching "${customerName}".` };

        const profile = profiles.find((p) => p.customerId === match.id);
        const accountNotes = notes
          .filter((n) => n.customerId === match.id)
          .sort((a, b) => new Date(b.noteDate).getTime() - new Date(a.noteDate).getTime());
        const accountOpps = opportunities.filter((o) => o.customerId === match.id);
        const accountOppIds = new Set(accountOpps.map((o) => o.id));
        const openTasks = tasks.filter(
          (t) =>
            t.status !== 'done' &&
            t.status !== 'cancelled' &&
            (t.customerId === match.id || (t.opportunityId && accountOppIds.has(t.opportunityId))),
        );

        return {
          found: true,
          account: match.customerName,
          seInvolvement: seInvolvementLabel(profile?.seInvolvement ?? ''),
          seProductFit: seRagLabel(profile?.seProductFitAssessment ?? ''),
          seNotesLastUpdated: profile?.seNotesLastUpdated ?? null,
          latestNote: accountNotes[0]
            ? {
                date: accountNotes[0].noteDate,
                seConfidence: seRagLabel(accountNotes[0].seConfidence),
                excerpt: (accountNotes[0].notes || '').slice(0, 400),
              }
            : null,
          noteCount: accountNotes.length,
          openTaskCount: openTasks.length,
          openTasks: openTasks.slice(0, 10).map((t) => ({
            title: t.title,
            status: t.status,
            start: t.startDate ?? t.dueDate ?? null,
            end: t.endDate ?? t.dueDate ?? null,
          })),
          opportunities: accountOpps.map((o) => ({
            name: o.opportunityName,
            stage: o.currentStage,
            type: o.type ?? null,
            amount: o.estimatedValue ?? null,
            currency: o.currency ?? null,
            closeDate: o.expectedCloseDate ?? null,
            fiscalPeriod: fiscalPeriodLabel(o.expectedCloseDate),
            timeInStage: formatTimeInCurrentStage(o),
          })),
        };
      },

      list_opportunities: async (args) => {
        const { customerName, stage, type, owner, minAgeDays, limit } = args as {
          customerName?: string;
          stage?: string;
          type?: string;
          owner?: string;
          minAgeDays?: number;
          limit?: number;
        };
        const target = customerName ? findCustomer(customerName) : undefined;
        if (customerName && !target) {
          return { found: false, message: `No account matching "${customerName}".` };
        }
        const lc = (v: unknown) => String(v ?? '').toLowerCase();

        const rows = opportunities
          .filter((o) => (target ? o.customerId === target.id : true))
          .filter((o) => (stage ? lc(o.currentStage) === lc(stage) : true))
          .filter((o) => (type ? lc(o.type) === lc(type) : true))
          .filter((o) => (owner ? lc(o.owner?.name).includes(lc(owner)) : true))
          .map((o) => ({
            account: nameOf(o.customerId),
            name: o.opportunityName,
            stage: o.currentStage,
            type: o.type ?? null,
            amount: o.estimatedValue ?? null,
            currency: o.currency ?? null,
            owner: o.owner?.name ?? null,
            ageDays: o.createdAt ? calendarDaysBetween(new Date(o.createdAt)) : null,
            closeDate: o.expectedCloseDate ?? null,
            fiscalPeriod: fiscalPeriodLabel(o.expectedCloseDate),
          }))
          .filter((r) => (minAgeDays ? (r.ageDays ?? 0) >= minAgeDays : true))
          .sort((a, b) => (b.ageDays ?? 0) - (a.ageDays ?? 0));

        return { count: rows.length, opportunities: rows.slice(0, limit ?? 25) };
      },

      list_tasks: async (args) => {
        const { customerName, status, limit } = args as {
          customerName?: string;
          status?: string;
          limit?: number;
        };
        const target = customerName ? findCustomer(customerName) : undefined;
        if (customerName && !target) {
          return { found: false, message: `No account matching "${customerName}".` };
        }
        const wanted = status?.trim().toLowerCase();
        const oppIdsForTarget = new Set(
          target ? opportunities.filter((o) => o.customerId === target.id).map((o) => o.id) : [],
        );

        const rows = tasks
          .filter((t) =>
            target
              ? t.customerId === target.id ||
                (t.opportunityId && oppIdsForTarget.has(t.opportunityId))
              : true,
          )
          .filter((t) => {
            if (!wanted) return true;
            if (wanted === 'open') return t.status !== 'done' && t.status !== 'cancelled';
            return t.status === wanted;
          })
          .map((t) => ({
            title: t.title,
            status: t.status,
            account: nameOf(t.customerId),
            start: t.startDate ?? t.dueDate ?? null,
            end: t.endDate ?? t.dueDate ?? null,
            lastActionedAt: t.lastActionedAt ?? null,
          }));

        return { count: rows.length, tasks: rows.slice(0, limit ?? 25) };
      },

      list_notes: async (args) => {
        const { customerName, seConfidence, limit } = args as {
          customerName?: string;
          seConfidence?: string;
          limit?: number;
        };
        const target = customerName ? findCustomer(customerName) : undefined;
        if (customerName && !target) {
          return { found: false, message: `No account matching "${customerName}".` };
        }
        const wanted = seConfidence?.trim().toLowerCase();

        const rows = notes
          .filter((n) => (target ? n.customerId === target.id : true))
          .filter((n) => (wanted ? String(n.seConfidence ?? '').toLowerCase() === wanted : true))
          .sort((a, b) => new Date(b.noteDate).getTime() - new Date(a.noteDate).getTime())
          .map((n) => ({
            account: nameOf(n.customerId),
            date: n.noteDate,
            seConfidence: seRagLabel(n.seConfidence),
            createdBy: n.createdBy,
            excerpt: (n.notes || '').slice(0, 300),
          }));

        return { count: rows.length, notes: rows.slice(0, limit ?? 15) };
      },

      pipeline_health: async (args) => {
        const { staleAfterDays } = args as { staleAfterDays?: number };
        const threshold = staleAfterDays ?? 180;

        const withAge = opportunities.map((o) => ({
          opp: o,
          ageDays: o.createdAt ? calendarDaysBetween(new Date(o.createdAt)) : 0,
        }));

        const stale = withAge
          .filter(({ ageDays }) => ageDays >= threshold)
          .sort((a, b) => b.ageDays - a.ageDays)
          .slice(0, 20)
          .map(({ opp, ageDays }) => ({
            account: nameOf(opp.customerId),
            name: opp.opportunityName,
            stage: opp.currentStage,
            ageDays,
            timeInStage: formatTimeInCurrentStage(opp),
          }));

        // An account is "unassessed" when no profile RAG has ever been recorded.
        const unassessed = customers
          .filter((c) => {
            const profile = profiles.find((p) => p.customerId === c.id);
            return !profile || profile.seProductFitAssessment === '';
          })
          .filter((c) => opportunities.some((o) => o.customerId === c.id))
          .map((c) => c.customerName)
          .slice(0, 25);

        return {
          staleAfterDays: threshold,
          staleCount: withAge.filter(({ ageDays }) => ageDays >= threshold).length,
          staleOpportunities: stale,
          accountsWithoutSEAssessment: unassessed,
          totalOpportunities: opportunities.length,
        };
      },

      account_planning: async (args) => {
        const { customerName, pillar } = args as { customerName: string; pillar?: string };
        const match = findCustomer(customerName);
        if (!match) return { found: false, message: `No account matching "${customerName}".` };

        const plan = match.accountPlanning;
        const wanted = normalizePillarId(pillar);
        const pillars = wanted
          ? ACCOUNT_PLANNING_PILLARS.filter((p) => p.id === wanted)
          : ACCOUNT_PLANNING_PILLARS;

        const accountOppIds = new Set(
          opportunities.filter((o) => o.customerId === match.id).map((o) => o.id),
        );
        const accountTasks = tasks.filter(
          (t) =>
            t.customerId === match.id ||
            (t.opportunityId && accountOppIds.has(t.opportunityId)),
        );

        return {
          found: true,
          account: match.customerName,
          aeAlignment: plan?.aeAlignment ?? null,
          pillars: pillars.map((def) => {
            const fields = planFieldsFor(plan, def.id);
            const pillarTasks = filterTasksByPlanningPillar(
              accountTasks,
              workspace.taskCategories,
              def.id,
            );
            return {
              pillar: def.id,
              label: def.label,
              summary: def.summary,
              activityOptions: def.activityOptions ?? [],
              approach: fields.approach || null,
              status: fields.status || null,
              nextActions: fields.nextActions || null,
              extras: fields.extras,
              hasPlan: Boolean(fields.approach || fields.status || fields.nextActions),
              taskCount: pillarTasks.length,
              tasks: pillarTasks.slice(0, 8).map((t) => ({
                title: t.title,
                status: t.status,
                start: t.startDate ?? t.dueDate ?? null,
                end: t.endDate ?? t.dueDate ?? null,
              })),
            };
          }),
        };
      },

      planning_coverage: async (args) => {
        const { pillar, missingOnly } = args as { pillar?: string; missingOnly?: boolean };
        const wanted = normalizePillarId(pillar);
        const pillars = wanted
          ? ACCOUNT_PLANNING_PILLARS.filter((p) => p.id === wanted)
          : ACCOUNT_PLANNING_PILLARS;

        return {
          pillars: pillars.map((def) => {
            const withPlan: string[] = [];
            const withoutPlan: string[] = [];
            for (const c of customers) {
              const f = planFieldsFor(c.accountPlanning, def.id);
              const has = Boolean(f.approach || f.status || f.nextActions);
              (has ? withPlan : withoutPlan).push(c.customerName || '(unnamed)');
            }
            return {
              pillar: def.id,
              label: def.label,
              plannedCount: withPlan.length,
              missingCount: withoutPlan.length,
              ...(missingOnly
                ? { accountsMissingPlan: withoutPlan.slice(0, 50) }
                : {
                    accountsWithPlan: withPlan.slice(0, 50),
                    accountsMissingPlan: withoutPlan.slice(0, 50),
                  }),
            };
          }),
          totalAccounts: customers.length,
        };
      },

      industry_approach: async (args) => {
        const { customerName, vertical } = args as { customerName?: string; vertical?: string };

        /** Vertical is recorded on the research pillar of the account plan. */
        const verticalOf = (c: (typeof customers)[number]) =>
          planFieldsFor(c.accountPlanning, 'research').extras.vertical as string | undefined;

        const describe = (c: (typeof customers)[number]) => {
          const profile = profiles.find((p) => p.customerId === c.id);
          const research = planFieldsFor(c.accountPlanning, 'research');
          const whitespace = planFieldsFor(c.accountPlanning, 'whitespace');
          return {
            account: c.customerName,
            vertical: verticalOf(c) ?? null,
            researchTopics: (research.extras.topics as string) ?? null,
            researchApproach: research.approach || null,
            whitespaceApproach: whitespace.approach || null,
            products: (c.products || []).map((p) => formatProductDisplayName(p)),
            businessProblem: profile?.businessProblem || null,
            whyUs: profile?.whyUs || null,
            whyNow: profile?.whyNow || null,
            objectives: [
              profile?.customerObjective1,
              profile?.customerObjective2,
              profile?.customerObjective3,
            ].filter(Boolean),
            useCases: [
              profile?.customerUseCase1,
              profile?.customerUseCase2,
              profile?.customerUseCase3,
            ].filter(Boolean),
          };
        };

        if (customerName) {
          const match = findCustomer(customerName);
          if (!match) return { found: false, message: `No account matching "${customerName}".` };
          const self = describe(match);
          const peers = customers
            .filter(
              (c) =>
                c.id !== match.id &&
                self.vertical &&
                (verticalOf(c) || '').toLowerCase() === self.vertical.toLowerCase(),
            )
            .map((c) => c.customerName);
          return { found: true, ...self, peersInSameVertical: peers };
        }

        if (vertical) {
          const q = vertical.trim().toLowerCase();
          const inVertical = customers.filter((c) =>
            (verticalOf(c) || '').toLowerCase().includes(q),
          );
          return {
            vertical,
            accountCount: inVertical.length,
            accounts: inVertical.slice(0, 30).map(describe),
          };
        }

        // Neither filter supplied — report which verticals are on record.
        const counts = new Map<string, number>();
        for (const c of customers) {
          const v = verticalOf(c);
          if (v) counts.set(v, (counts.get(v) ?? 0) + 1);
        }
        return {
          message: 'No account or vertical given — these verticals are recorded.',
          verticals: [...counts.entries()]
            .sort((a, b) => b[1] - a[1])
            .map(([name, count]) => ({ vertical: name, accountCount: count })),
          accountsWithoutVertical: customers.filter((c) => !verticalOf(c)).length,
        };
      },

      record_completeness: async (args) => {
        const { entity, customerName, limit } = args as {
          entity?: string;
          customerName?: string;
          limit?: number;
        };

        let scope = {
          customers,
          opportunities,
          customerProfiles: profiles,
          notes,
          tasks,
        };

        if (customerName) {
          const match = findCustomer(customerName);
          if (!match) return { found: false, message: `No account matching "${customerName}".` };
          const oppIds = new Set(opportunities.filter((o) => o.customerId === match.id).map((o) => o.id));
          scope = {
            customers: [match],
            opportunities: opportunities.filter((o) => o.customerId === match.id),
            customerProfiles: profiles.filter((p) => p.customerId === match.id),
            notes: notes.filter((n) => n.customerId === match.id),
            tasks: tasks.filter(
              (t) => t.customerId === match.id || (t.opportunityId && oppIds.has(t.opportunityId)),
            ),
          };
        }

        const report = workspaceCompleteness(scope);
        const wanted = entity?.trim().toLowerCase() as EntityKind | undefined;
        const kinds: EntityKind[] = wanted
          ? ([wanted].filter((k) =>
              ['customer', 'opportunity', 'profile', 'note', 'task'].includes(k),
            ) as EntityKind[])
          : ['customer', 'opportunity', 'profile', 'note', 'task'];

        if (kinds.length === 0) {
          return { error: `Unknown entity "${entity}". Use customer, opportunity, profile, note or task.` };
        }

        return {
          overallScore: report.overallScore,
          summaries: report.summaries
            .filter((s) => kinds.includes(s.kind))
            .map((s) => ({
              entity: s.kind,
              records: s.count,
              averageScore: s.averageScore,
              missingSomethingRequired: s.incomplete,
              commonGaps: s.topGaps.slice(0, 6).map((g) => ({
                field: g.label,
                level: g.level,
                affectedRecords: g.count,
                why: g.why,
              })),
            })),
          // Worst records first — this is the worklist.
          records: kinds
            .flatMap((k) => report.byEntity[k])
            .filter((r) => r.requiredMissing.length > 0 || r.recommendedMissing.length > 0)
            .sort((a, b) => a.score - b.score)
            .slice(0, limit ?? 15)
            .map((r) => ({
              entity: r.kind,
              name: r.name,
              score: r.score,
              missingRequired: r.requiredMissing.map((m) => ({ field: m.label, why: m.why })),
              missingRecommended: r.recommendedMissing.map((m) => m.label),
            })),
        };
      },

      deal_qualification: async (args) => {
        const { customerName, opportunityName, gapsOnly } = args as {
          customerName?: string;
          opportunityName?: string;
          gapsOnly?: boolean;
        };

        let candidates = opportunities;
        if (customerName) {
          const match = findCustomer(customerName);
          if (!match) return { found: false, message: `No account matching "${customerName}".` };
          candidates = candidates.filter((o) => o.customerId === match.id);
        }
        if (opportunityName) {
          const q = opportunityName.trim().toLowerCase();
          candidates = candidates.filter((o) => (o.opportunityName || '').toLowerCase().includes(q));
        }
        if (candidates.length === 0) {
          return { found: false, message: 'No matching opportunity.' };
        }

        return {
          found: true,
          count: candidates.length,
          opportunities: candidates.slice(0, 10).map((o) => {
            const q = parseDealQualification(o.dealQualification);
            const gaps = qualificationGaps(q);
            const coverage = qualificationCoverage(q);
            return {
              account: nameOf(o.customerId),
              opportunity: o.opportunityName,
              stage: o.currentStage,
              source: q?.source ?? null,
              coverage: `MEDDPICC ${coverage.meddpicc.recorded}/${coverage.meddpicc.total}, BANT ${coverage.bant.recorded}/${coverage.bant.total}`,
              ...(gapsOnly
                ? {}
                : {
                    meddpicc: q?.meddpicc ?? null,
                    bant: q?.bant ?? null,
                  }),
              gaps: gaps.map((g) => ({
                framework: g.framework,
                element: g.label,
                reason: g.reason,
                signalCount: g.signalCount ?? null,
                askAbout: g.prompt,
              })),
            };
          }),
        };
      },

      accounts_by_solution: async (args) => {
        const { product, vertical } = args as { product?: string; vertical?: string };
        const verticalOf = (c: (typeof customers)[number]) =>
          planFieldsFor(c.accountPlanning, 'research').extras.vertical as string | undefined;

        const matches = customers.filter((c) => {
          const productOk = product
            ? (c.products || []).some((p) =>
                formatProductDisplayName(p).toLowerCase().includes(product.toLowerCase()),
              )
            : true;
          const verticalOk = vertical
            ? (verticalOf(c) || '').toLowerCase().includes(vertical.toLowerCase())
            : true;
          return productOk && verticalOk;
        });

        return {
          product: product ?? null,
          vertical: vertical ?? null,
          accountCount: matches.length,
          accounts: matches.slice(0, 40).map((c) => ({
            account: c.customerName,
            vertical: verticalOf(c) ?? null,
            products: (c.products || []).map((p) => formatProductDisplayName(p)),
            accountExecutives: (c.accountExecutives || c.internalContacts || [])
              .map((ic) => ic.name)
              .slice(0, 3),
          })),
        };
      },
    };

    const result = await processWithTools(message, {
      customerNames: customers.map((c) => c.customerName || ''),
      internalContactNames: internalContacts.map((c) => c.name),
      customerContactNames: customerContacts.map((c) => c.name),
      productNames: products.map((p) => formatProductDisplayName(p)),
      partnerNames: partners.map((p) => p.name),
      toolExecutors,
    });

    if (result.error) {
      return NextResponse.json({ success: false, error: result.error }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      text: result.text,
      toolCalls: result.toolCalls,
    });
  } catch (error: any) {
    console.error('POST /api/ai-chat error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'AI Chat API - LLM + Tools',
    version: '1.0.0',
    usage: 'POST with Authorization: Bearer <ID token>; body { message: string }; actions use authenticated uid',
    tools: [
      'lookup_customer',
      'customer_summary',
      'create_customer',
      'update_customer',
      'add_note',
      'search_customers',
      'list_customers',
      'list_internal_contacts',
      'list_products',
      'list_partners',
      'lookup_internal_contact',
      'create_internal_contact',
      'lookup_customer_contact',
      'create_customer_contact',
      'lookup_product',
      'create_product',
      'lookup_partner',
      'create_partner',
      'account_status',
      'list_opportunities',
      'list_tasks',
      'list_notes',
      'pipeline_health',
      'account_planning',
      'planning_coverage',
      'industry_approach',
      'accounts_by_solution',
      'deal_qualification',
      'record_completeness',
    ],
  });
}
