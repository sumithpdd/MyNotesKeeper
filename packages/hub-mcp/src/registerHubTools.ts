import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { generateText } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { loadWorkspaceSnapshot } from '../../../src/lib/server/workspaceLoad';
import { createNoteAdmin } from '../../../src/lib/server/notesAdmin';
import { createEngagementTaskAdmin } from '../../../src/lib/server/tasksAdmin';
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
