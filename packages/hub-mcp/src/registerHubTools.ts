import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { generateText } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { loadWorkspaceSnapshot } from '../../../src/lib/server/workspaceLoad';
import {
  createNoteAdmin,
  deleteNoteAdmin,
  updateNoteAdmin,
} from '../../../src/lib/server/notesAdmin';
import { updateCustomerAdmin } from '../../../src/lib/server/customersAdmin';
import { createEngagementTaskAdmin } from '../../../src/lib/server/tasksAdmin';
import {
  mergeStakeholderIdsOnCustomer,
  upsertCustomerContactAdmin,
  upsertInternalContactAdmin,
  upsertPartnerAdmin,
} from '../../../src/lib/server/stakeholdersAdmin';
import { aiService } from '../../../src/lib/ai';
import { geminiModelId } from '../../../src/lib/aiModel';
import { formatProductDisplayName } from '../../../src/lib/productDisplay';
import type { Customer } from '../../../src/types';
import { requireRead, requireWrite, resolveCaller } from './auth';
import { errResult, okResult } from './json';

function findCustomerByName(customers: Customer[], search: string) {
  const q = search.trim().toLowerCase();
  if (!q) return undefined;
  return customers.find(
    (c) =>
      (c.customerName || '').toLowerCase().includes(q) ||
      q.includes((c.customerName || '').toLowerCase()),
  );
}

async function loadHubWorkspace() {
  const caller = await resolveCaller();
  requireRead(caller);
  const workspace = await loadWorkspaceSnapshot({ uid: caller.uid, email: caller.email });
  return { caller, workspace };
}

function geminiModel() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('GEMINI_API_KEY is not configured on the server');
  return createGoogleGenerativeAI({ apiKey })(geminiModelId());
}

const stakeholderInputSchema = {
  customerName: z.string().min(1),
  primaryContactName: z
    .string()
    .optional()
    .describe('Sets primaryCustomerContactId on the account after linking'),
  sitecoreInternals: z
    .array(
      z.object({
        name: z.string().min(1),
        email: z.string().optional(),
        role: z.string().optional(),
        isAccountExecutive: z.boolean().optional(),
      }),
    )
    .optional(),
  customerContacts: z
    .array(
      z.object({
        name: z.string().min(1),
        email: z.string().optional(),
        role: z.string().optional(),
        companyName: z.string().optional(),
      }),
    )
    .optional(),
  partners: z
    .array(
      z.object({
        name: z.string().min(1),
        type: z.string().optional(),
        contacts: z
          .array(
            z.object({
              name: z.string().min(1),
              email: z.string().optional(),
              role: z.string().optional(),
            }),
          )
          .optional(),
      }),
    )
    .optional(),
};

type StakeholderInput = z.infer<z.ZodObject<typeof stakeholderInputSchema>>;

function normName(s: string): string {
  return s.trim().toLowerCase();
}

async function linkStakeholdersForAccount(input: StakeholderInput) {
  const { caller, workspace } = await loadHubWorkspace();
  requireWrite(caller);
  const match = findCustomerByName(workspace.customers, input.customerName);
  if (!match) return errResult(`Customer not found: ${input.customerName}`);

  const customerContactIds: string[] = [];
  const internalContactIds: string[] = [];
  const partnerIds: string[] = [];
  const accountExecutiveIds: string[] = [];
  const contactIdByNormName = new Map<string, string>();

  for (const p of input.sitecoreInternals || []) {
    const id = await upsertInternalContactAdmin({
      name: p.name,
      email: p.email,
      role: p.role || 'Sitecore',
    });
    internalContactIds.push(id);
    contactIdByNormName.set(normName(p.name), id);
    if (p.isAccountExecutive) accountExecutiveIds.push(id);
  }

  for (const c of input.customerContacts || []) {
    const id = await upsertCustomerContactAdmin({
      name: c.name,
      email: c.email,
      role: c.role,
      companyName: c.companyName || match.customerName,
      customerId: match.id,
    });
    customerContactIds.push(id);
    contactIdByNormName.set(normName(c.name), id);
  }

  for (const p of input.partners || []) {
    const partnerId = await upsertPartnerAdmin({ name: p.name, type: p.type });
    partnerIds.push(partnerId);
    for (const pc of p.contacts || []) {
      const id = await upsertCustomerContactAdmin({
        name: pc.name,
        email: pc.email,
        role: pc.role || 'Partner',
        companyName: p.name,
        customerId: match.id,
      });
      customerContactIds.push(id);
      contactIdByNormName.set(normName(pc.name), id);
    }
  }

  await mergeStakeholderIdsOnCustomer(
    match.id,
    { customerContactIds, internalContactIds, partnerIds, accountExecutiveIds },
    caller.uid,
  );

  if (input.primaryContactName?.trim()) {
    const pid = contactIdByNormName.get(normName(input.primaryContactName));
    if (pid) {
      await updateCustomerAdmin(match.id, { primaryCustomerContactId: pid }, caller.uid);
    }
  }

  return okResult({
    customerName: match.customerName,
    customerId: match.id,
    linked: {
      customerContacts: customerContactIds.length,
      internalContacts: internalContactIds.length,
      partners: partnerIds.length,
      accountExecutives: accountExecutiveIds.length,
    },
  });
}

export function registerHubTools(server: McpServer): void {
  server.registerTool(
    'hub_overview',
    {
      description:
        'High-level counts for the signed-in user workspace (customers, opportunities, tasks, notes). Read-only.',
      inputSchema: {},
      annotations: { readOnlyHint: true },
    },
    async () => {
      try {
        const { workspace } = await loadHubWorkspace();
        return okResult({
          customers: workspace.customers.length,
          opportunities: workspace.opportunities.length,
          tasks: workspace.tasks.length,
          notes: workspace.notes.length,
          internalContacts: workspace.internalContacts.length,
          partners: workspace.partners.length,
        });
      } catch (e) {
        return errResult(e instanceof Error ? e.message : String(e));
      }
    },
  );

  server.registerTool(
    'search_customers',
    {
      description: 'Search customers by partial name. Read-only.',
      inputSchema: {
        query: z.string().min(1),
        limit: z.number().int().min(1).max(50).optional(),
      },
      annotations: { readOnlyHint: true },
    },
    async ({ query, limit }) => {
      try {
        const { workspace } = await loadHubWorkspace();
        const q = query.trim().toLowerCase();
        const max = limit ?? 20;
        const matches = workspace.customers
          .filter((c) => (c.customerName || '').toLowerCase().includes(q))
          .slice(0, max)
          .map((c) => ({
            id: c.id,
            customerName: c.customerName,
            salesforceLink: c.salesforceLink || undefined,
            accountExecutives: (c.accountExecutiveIds || []).length,
          }));
        return okResult({ query, count: matches.length, customers: matches });
      } catch (e) {
        return errResult(e instanceof Error ? e.message : String(e));
      }
    },
  );

  server.registerTool(
    'account_status',
    {
      description:
        'Engagement snapshot for one account: profile fields, open opportunities, recent notes, linked tasks. Read-only.',
      inputSchema: { customerName: z.string().min(1) },
      annotations: { readOnlyHint: true },
    },
    async ({ customerName }) => {
      try {
        const { workspace } = await loadHubWorkspace();
        const match = findCustomerByName(workspace.customers, customerName);
        if (!match) {
          return okResult({ found: false, customerName, message: 'No matching customer' });
        }
        const notes = workspace.notes
          .filter((n) => n.customerId === match.id)
          .slice(0, 15)
          .map((n) => ({
            id: n.id,
            noteDate: n.noteDate,
            preview: (n.notes || '').slice(0, 400),
            seConfidence: n.seConfidence,
          }));
        const opps = workspace.opportunities
          .filter((o) => o.customerId === match.id)
          .map((o) => ({
            id: o.id,
            name: o.opportunityName,
            stage: o.currentStage,
            crmOpportunityUrl: o.crmOpportunityUrl,
            owner: o.owner?.name,
          }));
        const tasks = workspace.tasks
          .filter((t) => t.customerId === match.id)
          .slice(0, 20)
          .map((t) => ({
            id: t.id,
            title: t.title,
            status: t.status,
            dueDate: t.dueDate,
          }));
        const profile = workspace.customerProfiles.find((p) => p.customerId === match.id);
        return okResult({
          found: true,
          customer: {
            id: match.id,
            customerName: match.customerName,
            salesforceLink: match.salesforceLink,
            products: (match.products || []).map((p) => formatProductDisplayName(p)),
            partners: (match.partners || []).map((p) => p.name),
            additionalInfo: match.additionalInfo,
            mergedNotes: match.mergedNotes?.slice(0, 500),
            compellingEvent: match.compellingEvent,
          },
          profile: profile ? { businessProblem: profile.businessProblem?.slice(0, 300) } : null,
          opportunities: opps,
          notes,
          tasks,
        });
      } catch (e) {
        return errResult(e instanceof Error ? e.message : String(e));
      }
    },
  );

  server.registerTool(
    'list_tasks',
    {
      description: 'List engagement tasks, optionally filtered by customer name or Kanban status.',
      inputSchema: {
        customerName: z.string().optional(),
        status: z.enum(['todo', 'in_progress', 'done', 'cancelled']).optional(),
        limit: z.number().int().min(1).max(100).optional(),
      },
      annotations: { readOnlyHint: true },
    },
    async ({ customerName, status, limit }) => {
      try {
        const { workspace } = await loadHubWorkspace();
        let tasks = workspace.tasks;
        if (customerName?.trim()) {
          const c = findCustomerByName(workspace.customers, customerName);
          if (!c) return okResult({ count: 0, tasks: [], message: 'Customer not found' });
          tasks = tasks.filter((t) => t.customerId === c.id);
        }
        if (status) tasks = tasks.filter((t) => t.status === status);
        const max = limit ?? 40;
        const slice = tasks.slice(0, max).map((t) => ({
          id: t.id,
          title: t.title,
          status: t.status,
          dueDate: t.dueDate,
          customerId: t.customerId,
        }));
        return okResult({ count: slice.length, tasks: slice });
      } catch (e) {
        return errResult(e instanceof Error ? e.message : String(e));
      }
    },
  );

  server.registerTool(
    'list_customer_notes',
    {
      description: 'List notes for an account (includes note ids for update/delete). Read-only.',
      inputSchema: {
        customerName: z.string().min(1),
        limit: z.number().int().min(1).max(50).optional(),
      },
      annotations: { readOnlyHint: true },
    },
    async ({ customerName, limit }) => {
      try {
        const { workspace } = await loadHubWorkspace();
        const match = findCustomerByName(workspace.customers, customerName);
        if (!match) return okResult({ found: false, customerName });
        const max = limit ?? 25;
        const notes = workspace.notes
          .filter((n) => n.customerId === match.id)
          .slice(0, max)
          .map((n) => ({
            id: n.id,
            noteDate: n.noteDate,
            seConfidence: n.seConfidence,
            preview: (n.notes || '').slice(0, 280),
          }));
        return okResult({ found: true, customerName: match.customerName, count: notes.length, notes });
      } catch (e) {
        return errResult(e instanceof Error ? e.message : String(e));
      }
    },
  );

  server.registerTool(
    'delete_customer_note',
    {
      description: 'Delete a customer note by id (from list_customer_notes). Requires write scope.',
      inputSchema: {
        noteId: z.string().min(1),
        customerName: z.string().optional().describe('Safety check — must match note customer if provided'),
      },
    },
    async ({ noteId, customerName }) => {
      try {
        const { caller, workspace } = await loadHubWorkspace();
        requireWrite(caller);
        const note = workspace.notes.find((n) => n.id === noteId);
        if (!note) return errResult(`Note not found: ${noteId}`);
        if (customerName?.trim()) {
          const match = findCustomerByName(workspace.customers, customerName);
          if (!match || note.customerId !== match.id) {
            return errResult('Note does not belong to that customer');
          }
        }
        await deleteNoteAdmin(noteId);
        return okResult({ deleted: true, noteId });
      } catch (e) {
        return errResult(e instanceof Error ? e.message : String(e));
      }
    },
  );

  server.registerTool(
    'update_customer_note',
    {
      description: 'Update note text or date by id. Requires write scope.',
      inputSchema: {
        noteId: z.string().min(1),
        notes: z.string().optional(),
        noteDate: z.string().optional(),
        seConfidence: z.enum(['Green', 'Yellow', 'Red', 'Not Applicable']).optional(),
      },
    },
    async ({ noteId, notes, noteDate, seConfidence }) => {
      try {
        const { caller, workspace } = await loadHubWorkspace();
        requireWrite(caller);
        const note = workspace.notes.find((n) => n.id === noteId);
        if (!note) return errResult(`Note not found: ${noteId}`);
        await updateNoteAdmin(
          {
            id: noteId,
            ...(notes !== undefined ? { notes } : {}),
            ...(noteDate ? { noteDate: new Date(noteDate) } : {}),
            ...(seConfidence ? { seConfidence } : {}),
          },
          caller.uid,
        );
        return okResult({ updated: true, noteId, customerId: note.customerId });
      } catch (e) {
        return errResult(e instanceof Error ? e.message : String(e));
      }
    },
  );

  server.registerTool(
    'add_customer_note',
    {
      description:
        'Add a customer note (same as hub UI). Requires MCP write scope. Uses authenticated user as createdBy.',
      inputSchema: {
        customerName: z.string().min(1),
        notes: z.string().min(1),
        noteDate: z.string().optional().describe('ISO date; defaults to today'),
        seConfidence: z.enum(['Green', 'Yellow', 'Red', 'Not Applicable']).optional(),
      },
    },
    async ({ customerName, notes, noteDate, seConfidence }) => {
      try {
        const { caller, workspace } = await loadHubWorkspace();
        requireWrite(caller);
        const match = findCustomerByName(workspace.customers, customerName);
        if (!match) return errResult(`Customer not found: ${customerName}`);
        const when = noteDate ? new Date(noteDate) : new Date();
        const id = await createNoteAdmin(
          {
            customerId: match.id,
            notes: notes.trim(),
            noteDate: when,
            createdBy: caller.uid,
            updatedBy: caller.uid,
            seConfidence: seConfidence ?? 'Yellow',
            otherFields: {},
          },
          caller.uid,
        );
        return okResult({ created: true, noteId: id, customerName: match.customerName });
      } catch (e) {
        return errResult(e instanceof Error ? e.message : String(e));
      }
    },
  );

  server.registerTool(
    'create_engagement_task',
    {
      description:
        'Create a Kanban/calendar task linked to a customer. Requires MCP write scope.',
      inputSchema: {
        title: z.string().min(1),
        customerName: z.string().optional(),
        description: z.string().optional(),
        dueDate: z.string().optional().describe('ISO date'),
        status: z.enum(['todo', 'in_progress', 'done', 'cancelled']).optional(),
        categoryName: z
          .string()
          .optional()
          .describe('Task kind name, e.g. Meeting Preparation; defaults to first category'),
      },
    },
    async ({ title, customerName, description, dueDate, status, categoryName }) => {
      try {
        const { caller, workspace } = await loadHubWorkspace();
        requireWrite(caller);
        let customerId: string | null = null;
        if (customerName?.trim()) {
          const c = findCustomerByName(workspace.customers, customerName);
          if (!c) return errResult(`Customer not found: ${customerName}`);
          customerId = c.id;
        }
        const categories = workspace.taskCategories;
        if (!categories.length) return errResult('No task categories in workspace');
        const cat =
          (categoryName &&
            categories.find(
              (c) => c.name.toLowerCase() === categoryName.trim().toLowerCase(),
            )) ||
          categories.find((c) => c.name === 'Meeting Preparation') ||
          categories[0];
        const task = await createEngagementTaskAdmin(
          {
            title: title.trim(),
            description: description?.trim(),
            categoryIds: [cat.id],
            customerId,
            status: status ?? 'todo',
            dueDate: dueDate ? new Date(dueDate) : null,
            createdBy: caller.uid,
            updatedBy: caller.uid,
          },
          caller.uid,
        );
        return okResult({ created: true, taskId: task.id, title: task.title, category: cat.name });
      } catch (e) {
        return errResult(e instanceof Error ? e.message : String(e));
      }
    },
  );

  const stakeholderDescriptions = {
    set_account_stakeholders:
      'Add or update account stakeholders (customer contacts, partner people, Sitecore AE/SC) on the customer record — use this instead of dumping stakeholders into notes. Requires write scope.',
    link_stakeholders_for_account:
      'Alias of set_account_stakeholders — links customerContactIds, internalContactIds, partnerIds, accountExecutiveIds on the account.',
  };

  for (const [toolName, description] of Object.entries(stakeholderDescriptions)) {
    server.registerTool(
      toolName,
      { description, inputSchema: stakeholderInputSchema },
      async (input) => {
        try {
          return await linkStakeholdersForAccount(input as StakeholderInput);
        } catch (e) {
          return errResult(e instanceof Error ? e.message : String(e));
        }
      },
    );
  }

  server.registerTool(
    'summarize_engagement_text',
    {
      description:
        'Summarize pasted email or meeting notes for SE/AE handoff (server-side Gemini). Does not store unless you also call add_customer_note. Read-only.',
      inputSchema: {
        text: z.string().min(20),
        customerName: z.string().optional(),
        context: z.string().optional().describe('Extra context, e.g. partner names or opp stage'),
      },
      annotations: { readOnlyHint: true },
    },
    async ({ text, customerName, context }) => {
      try {
        await loadHubWorkspace();
        const prompt = [
          'You are a Sales Engineer assistant for Sitecore customer engagement.',
          'Summarize the following for CRM/hub notes: key priorities, dates, stakeholders, desired outcomes, risks, and suggested next steps.',
          'Use concise bullet sections. Do not invent facts not present in the text.',
          customerName ? `Account: ${customerName}` : '',
          context ? `Context: ${context}` : '',
          '---',
          text.trim(),
        ]
          .filter(Boolean)
          .join('\n');
        const { text: summary } = await generateText({ model: geminiModel(), prompt });
        return okResult({ summary });
      } catch (e) {
        return errResult(e instanceof Error ? e.message : String(e));
      }
    },
  );

  server.registerTool(
    'customer_ai_summary',
    {
      description:
        'Generate an AI summary from stored customer profile fields (same as in-app customer summary). Read-only.',
      inputSchema: { customerName: z.string().min(1) },
      annotations: { readOnlyHint: true },
    },
    async ({ customerName }) => {
      try {
        const { workspace } = await loadHubWorkspace();
        const match = findCustomerByName(workspace.customers, customerName);
        if (!match) return okResult({ found: false, customerName });
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
        return okResult({ found: true, customerName: match.customerName, summary });
      } catch (e) {
        return errResult(e instanceof Error ? e.message : String(e));
      }
    },
  );
}
