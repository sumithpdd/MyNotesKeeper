/**
 * AI Tools Service - LLM + Tools pattern (Vercel AI SDK + Google Gemini)
 *
 * The LLM decides which tool to call, the AI SDK executes the tool against
 * the per-request executors, then optionally produces a natural language
 * response. The whole tool loop is handled by `generateText({ tools, stopWhen })`
 * — no manual conversation reconstruction required.
 *
 * Server-only: holds the Gemini key (`GEMINI_API_KEY`). Importing this from a
 * client component triggers a build-time error via the `server-only` package.
 */

import 'server-only';
import { generateText, tool, stepCountIs } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { z } from 'zod';
import { geminiModelId } from '@/lib/aiModel';

const MAX_TOOL_STEPS = 8;

let providerSingleton: ReturnType<typeof createGoogleGenerativeAI> | null = null;

function getProvider() {
  if (!providerSingleton) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not configured');
    }
    providerSingleton = createGoogleGenerativeAI({ apiKey });
  }
  return providerSingleton;
}

export type ToolName =
  | 'lookup_customer'
  | 'customer_summary'
  | 'create_customer'
  | 'update_customer'
  | 'add_note'
  | 'search_customers'
  | 'list_customers'
  | 'list_internal_contacts'
  | 'list_products'
  | 'list_partners'
  | 'lookup_internal_contact'
  | 'create_internal_contact'
  | 'lookup_customer_contact'
  | 'create_customer_contact'
  | 'lookup_product'
  | 'create_product'
  | 'lookup_partner'
  | 'create_partner'
  // Read-only engagement status tools
  | 'account_status'
  | 'list_opportunities'
  | 'list_tasks'
  | 'list_notes'
  | 'pipeline_health'
  // Account planning pillars (whitespace, multi-threading, migration, research)
  | 'account_planning'
  | 'planning_coverage'
  // Industry / vertical positioning
  | 'industry_approach'
  | 'accounts_by_solution'
  // Deal qualification (MEDDPICC / BANT)
  | 'deal_qualification';

export interface ToolExecutor {
  lookup_customer: (args: { customerName: string }) => Promise<object>;
  customer_summary?: (args: { customerName: string }) => Promise<object>;
  create_customer?: (args: Record<string, unknown>) => Promise<object>;
  update_customer?: (args: Record<string, unknown>) => Promise<object>;
  add_note?: (args: Record<string, unknown>) => Promise<object>;
  search_customers?: (args: Record<string, unknown>) => Promise<object>;
  list_customers?: () => Promise<object>;
  list_internal_contacts?: () => Promise<object>;
  list_products?: () => Promise<object>;
  list_partners?: () => Promise<object>;
  lookup_internal_contact?: (args: { name: string }) => Promise<object>;
  create_internal_contact?: (args: { name: string; role?: string; email?: string }) => Promise<object>;
  lookup_customer_contact?: (args: { name: string }) => Promise<object>;
  create_customer_contact?: (args: { name: string; role?: string; email?: string }) => Promise<object>;
  lookup_product?: (args: { name: string }) => Promise<object>;
  create_product?: (args: { name: string; version?: string }) => Promise<object>;
  lookup_partner?: (args: { name: string }) => Promise<object>;
  create_partner?: (args: { name: string; type?: string }) => Promise<object>;

  /** Full engagement snapshot for one account: profile, notes, opportunities, tasks. */
  account_status?: (args: { customerName: string }) => Promise<object>;
  list_opportunities?: (args: {
    customerName?: string;
    stage?: string;
    type?: string;
    owner?: string;
    minAgeDays?: number;
    limit?: number;
  }) => Promise<object>;
  list_tasks?: (args: {
    customerName?: string;
    status?: string;
    limit?: number;
  }) => Promise<object>;
  list_notes?: (args: {
    customerName?: string;
    seConfidence?: string;
    limit?: number;
  }) => Promise<object>;
  pipeline_health?: (args: { staleAfterDays?: number }) => Promise<object>;

  /** Four-pillar account plan for one account, with the tasks driving each pillar. */
  account_planning?: (args: { customerName: string; pillar?: string }) => Promise<object>;
  /** Which accounts have (or lack) a plan for a given pillar. */
  planning_coverage?: (args: { pillar?: string; missingOnly?: boolean }) => Promise<object>;

  /** Industry/vertical context for an account, or every account in a vertical. */
  industry_approach?: (args: { customerName?: string; vertical?: string }) => Promise<object>;
  /** Accounts grouped by shared product or vertical — for Lunch & Learns and webinars. */
  accounts_by_solution?: (args: { product?: string; vertical?: string }) => Promise<object>;

  /** MEDDPICC / BANT qualification for a deal, with the gaps still to close. */
  deal_qualification?: (args: {
    customerName?: string;
    opportunityName?: string;
    gapsOnly?: boolean;
  }) => Promise<object>;
}

export interface AIToolsContext {
  customerNames: string[];
  internalContactNames?: string[];
  customerContactNames?: string[];
  productNames?: string[];
  partnerNames?: string[];
  toolExecutors: Partial<ToolExecutor>;
}

const SYSTEM_INSTRUCTION = `You are an AI assistant for a Customer Engagement Hub. You help sales teams manage customers, notes, and entities.

CRITICAL: ALWAYS use tools for any data operation. NEVER invent or guess data. Tools perform real lookups and updates.

- Lookup: use lookup_* tools (lookup_customer, lookup_internal_contact, lookup_product, etc.)
- Create: use create_* tools when user wants to add something
- Update: use update_customer, add_note for modifications
- Search: use search_customers for filtering
- Status questions: use the read-only status tools below

STATUS AND REPORTING TOOLS — prefer these for any "how is X doing / what is the status / what is stuck / what is due" question:
- account_status: everything about ONE account (SE confidence, latest note, open tasks, opportunities). Use for "where are we with X", "status of X", "what's happening on X".
- list_opportunities: filter the pipeline by account, stage, type, owner, or age. Use for "which deals are in Discover", "show me licence deals", "what is closing this quarter".
- list_tasks: engagement tasks, optionally by account or status. Use for "what's on my plate", "open tasks for X".
- list_notes: recent notes, optionally by account or SE confidence. Use for "what did we discuss", "which accounts are red".
- pipeline_health: accounts and deals needing attention — stale opportunities and missing SE assessments. Use for "what needs attention", "what is going stale".
- account_planning: the four-pillar plan for ONE account. Use for "what is my plan for X", "whitespace approach for X", "is X a migration candidate".
- planning_coverage: which accounts have or lack a plan per pillar. Use for "which accounts have no whitespace plan", "where am I not multi-threaded".
- industry_approach: vertical context and positioning material for an account or a whole vertical. Use for "what angle should I take with X", "what is our industry approach".
- accounts_by_solution: accounts sharing a product or vertical, for one session covering several accounts. Use for "who could I cover in one Lunch and Learn".
- deal_qualification: MEDDPICC / BANT for a deal and the gaps still open. Use for "how well qualified is X", "what do I still need to find out".

QUALIFICATION — two different numbers, never conflate them:
- signalCount is how often a topic came up in a call (conversation analytics). It measures COVERAGE. A low count means the conversation never went there — a gap in the pursuit, not a verdict on the deal.
- score is a deliberate 0-10 read on how well the element is actually satisfied, set by a person.
Report a low signalCount as "barely discussed / not covered", never as "scored badly". A deal can have overwhelming evidence of pain and still be unqualified because nobody has met the economic buyer.

When asked for an industry approach or point of view, call industry_approach first and build the recommendation on what comes back. Be opinionated and specific to the account's vertical and use cases — but never state a customer fact that no tool returned. If the vertical or use cases are blank, say so and ask for them rather than inventing an industry narrative.

ACCOUNT PLANNING PILLARS — the SC planning model. When advising, suggest activities from the pillar's own options rather than inventing new ones:
1. Whitespace activity — after Vee's whitespace analysis, align with the AE on the approach per account. Options: a customer-specific industry/use-case approach (be opinionated, a thought leader); a Lunch & Learn covering multiple accounts across AEs for one solution; a Webinar focused on a solution, use case/pain point, or vertical.
2. Multi-threading — build rapport with additional stakeholders (Head of Digital, IT, Marketing). Options: 30-minute customer drop-ins on current processes and pain; knowledge workshops; mini demos on one or two use cases; open conversation.
3. Migration — xM and xP customers ONLY. Pathways: migration to Headless, migration to SAI. Decide partner-led, direct, or both. Never propose migration planning for an account that is not on xM or xP.
4. Deeper customer research — vertical and industry trends: new legislation, changes due to AI, economic drivers, disruptive challengers and market pressure.

Reporting conventions:
- The fiscal year starts 1 July and is labelled by the year it ends (Sep 2026 falls in Q1-2027).
- SE involvement "No" means SE support is wanted but missing (a risk); "Not Needed" means deliberately out of scope. Never conflate them.
- An SE confidence of "Not Applicable" is a deliberate answer; blank means nobody has assessed it. Report those differently.

For "if not create": call lookup first. If found, report. If not found, call the create tool with user-provided details.

Your role: (1) Call the right tool(s) to get or update data.
(2) Format tool results into clear, friendly natural language for the user.

Never respond with data you haven't fetched via a tool. Match names flexibly (partial, case-insensitive).`;

const seConfidenceSchema = z.enum(['Green', 'Yellow', 'Red', 'Not Applicable']);

/**
 * Tool definitions. Inputs are typed with Zod so the model gets a strict schema
 * and our `execute` callbacks receive correctly-typed arguments.
 *
 * Each `execute` delegates to the per-request executor in `context`. When a
 * caller hasn't supplied an executor for a tool, we surface a clear error to
 * the model so it can fall back to text.
 */
function buildTools(executors: Partial<ToolExecutor>) {
  const safeExec = async <T>(
    name: keyof ToolExecutor,
    args: T,
    runner?: (a: T) => Promise<object>,
  ): Promise<object> => {
    if (typeof runner !== 'function') {
      return { error: `Tool "${name}" is not available` };
    }
    try {
      return await runner(args);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      return { error: message };
    }
  };

  return {
    account_status: tool({
      description:
        'Full engagement status for ONE account: SE involvement and confidence, latest note, open engagement tasks, and opportunities with stage, value and fiscal period. Use for "where are we with X", "status of X", "what is happening on X", "how is X doing".',
      inputSchema: z.object({
        customerName: z.string().describe('The account name, e.g. "Greene King"'),
      }),
      execute: (args) => safeExec('account_status', args, executors.account_status),
    }),
    list_opportunities: tool({
      description:
        'List opportunities, optionally filtered. Use for "which deals are in Discover", "what is closing this quarter", "show licence opportunities", "which deals has nobody touched". Returns stage, amount, age in days and fiscal period.',
      inputSchema: z.object({
        customerName: z.string().optional().describe('Limit to one account'),
        stage: z
          .string()
          .optional()
          .describe('Stage name, e.g. Discover, Qualify, Differentiate, Propose, Close'),
        type: z.string().optional().describe('Opportunity type, e.g. License, Renewal, Services'),
        owner: z.string().optional().describe('Opportunity owner name'),
        minAgeDays: z
          .number()
          .optional()
          .describe('Only opportunities at least this many days old — use for staleness questions'),
        limit: z.number().optional().describe('Max rows to return (default 25)'),
      }),
      execute: (args) => safeExec('list_opportunities', args, executors.list_opportunities),
    }),
    list_tasks: tool({
      description:
        'List engagement tasks (workshops, demos, follow-ups), optionally by account or status. Use for "what is on my plate", "open tasks for X", "what is due".',
      inputSchema: z.object({
        customerName: z.string().optional().describe('Limit to one account'),
        status: z
          .string()
          .optional()
          .describe('todo, in_progress, done, cancelled, or "open" for not done/cancelled'),
        limit: z.number().optional().describe('Max rows to return (default 25)'),
      }),
      execute: (args) => safeExec('list_tasks', args, executors.list_tasks),
    }),
    list_notes: tool({
      description:
        'List recent customer notes, optionally by account or SE confidence. Use for "what did we discuss with X", "which accounts are red", "recent notes".',
      inputSchema: z.object({
        customerName: z.string().optional().describe('Limit to one account'),
        seConfidence: z
          .string()
          .optional()
          .describe('Green, Yellow, Red or Not Applicable'),
        limit: z.number().optional().describe('Max rows to return (default 15)'),
      }),
      execute: (args) => safeExec('list_notes', args, executors.list_notes),
    }),
    pipeline_health: tool({
      description:
        'Accounts and deals needing attention: stale opportunities sitting too long, and opportunities with no SE assessment recorded. Use for "what needs attention", "what is going stale", "where am I missing SE coverage".',
      inputSchema: z.object({
        staleAfterDays: z
          .number()
          .optional()
          .describe('Age in days past which an opportunity counts as stale (default 180)'),
      }),
      execute: (args) => safeExec('pipeline_health', args, executors.pipeline_health),
    }),
    account_planning: tool({
      description:
        'The four-pillar account plan for ONE account — whitespace activity, multi-threading, migration, and deeper customer research — including the approach, status, next actions and the engagement tasks driving each pillar. Use for "what is my plan for X", "whitespace approach for X", "who are we multi-threading into at X", "is X a migration candidate", "what research have we done on X".',
      inputSchema: z.object({
        customerName: z.string().describe('The account name'),
        pillar: z
          .string()
          .optional()
          .describe('Optional single pillar: whitespace, multi_threading, migration, research'),
      }),
      execute: (args) => safeExec('account_planning', args, executors.account_planning),
    }),
    planning_coverage: tool({
      description:
        'Across all accounts, which have an account plan recorded for a pillar and which do not. Use for "which accounts have no whitespace plan", "where am I not multi-threaded", "which accounts still need migration pathways", "what planning is missing".',
      inputSchema: z.object({
        pillar: z
          .string()
          .optional()
          .describe('whitespace, multi_threading, migration, or research; omit for all four'),
        missingOnly: z
          .boolean()
          .optional()
          .describe('When true, return only accounts with nothing recorded for the pillar'),
      }),
      execute: (args) => safeExec('planning_coverage', args, executors.planning_coverage),
    }),
    industry_approach: tool({
      description:
        'Industry and vertical context used to build an opinionated, thought-leadership approach: the account vertical, research topics, business problem, objectives and use cases, products in play, and the recorded whitespace approach. Pass a vertical instead of an account to see every account in it. Use for "what is our industry approach for X", "what angle should I take with X", "what is happening in the higher education vertical".',
      inputSchema: z.object({
        customerName: z.string().optional().describe('Account to build the approach for'),
        vertical: z
          .string()
          .optional()
          .describe('Vertical/industry name, e.g. "higher education", "retail"'),
      }),
      execute: (args) => safeExec('industry_approach', args, executors.industry_approach),
    }),
    accounts_by_solution: tool({
      description:
        'Group accounts that share a product/solution or vertical, so one session can cover several accounts across AEs. Use for "which accounts could I cover in one Lunch and Learn", "who else is on Scrunch", "which accounts share this vertical", "who should I invite to a webinar on SAI".',
      inputSchema: z.object({
        product: z.string().optional().describe('Product/solution name, e.g. "Scrunch", "SitecoreAI"'),
        vertical: z.string().optional().describe('Vertical/industry name'),
      }),
      execute: (args) => safeExec('accounts_by_solution', args, executors.accounts_by_solution),
    }),
    deal_qualification: tool({
      description:
        'MEDDPICC and BANT qualification for a deal, plus the elements still unrecorded or barely discussed. Use for "what is the MEDDPICC on X", "how well qualified is X", "what do I still need to find out", "who is the economic buyer on X", "what are the gaps".',
      inputSchema: z.object({
        customerName: z.string().optional().describe('Account name'),
        opportunityName: z.string().optional().describe('Specific opportunity, if the account has several'),
        gapsOnly: z.boolean().optional().describe('Return only the gaps, not every element'),
      }),
      execute: (args) => safeExec('deal_qualification', args, executors.deal_qualification),
    }),
    lookup_customer: tool({
      description:
        'Look up a customer by name. Returns customer info if found, or indicates not found. Use for: "do I have customer X", "tell me about X", "show me X", "is there a customer X".',
      inputSchema: z.object({
        customerName: z
          .string()
          .describe('The customer name to look up (e.g. "British Heart Foundation")'),
      }),
      execute: (args) => safeExec('lookup_customer', args, executors.lookup_customer),
    }),
    customer_summary: tool({
      description:
        'Get an AI-generated summary of a customer including products, notes, profile, and opportunities. Use when user wants a summary or overview of a customer.',
      inputSchema: z.object({
        customerName: z.string().describe('The customer name for the summary'),
      }),
      execute: (args) => safeExec('customer_summary', args, executors.customer_summary),
    }),
    create_customer: tool({
      description: 'Create a new customer record. Use when user says "create", "add", "new customer".',
      inputSchema: z.object({
        customerName: z.string().describe('Customer/company name'),
        additionalInfo: z.string().optional().describe('Optional extra details'),
      }),
      execute: (args) => safeExec('create_customer', args, executors.create_customer),
    }),
    update_customer: tool({
      description:
        'Update an existing customer. Use when user says "update", "modify", "change", "assign" for a known customer. Supports: mergedNotes, additionalInfo, accountExecutiveId (from lookup_internal_contact), compellingEvent, migrationNotes, etc.',
      inputSchema: z.object({
        customerName: z.string(),
        updates: z
          .record(z.string(), z.any())
          .optional()
          .describe(
            'Fields to update: mergedNotes, additionalInfo, accountExecutiveId (internal contact ID), compellingEvent, migrationNotes, sharePointUrl, salesforceLink',
          ),
      }),
      execute: (args) => safeExec('update_customer', args, executors.update_customer),
    }),
    add_note: tool({
      description: 'Add a note to a customer. Use when user says "add note", "create note", "note for".',
      inputSchema: z.object({
        customerName: z.string(),
        noteContent: z.string(),
        seConfidence: seConfidenceSchema.optional().describe('Green, Yellow, or Red'),
      }),
      execute: (args) => safeExec('add_note', args, executors.add_note),
    }),
    search_customers: tool({
      description:
        'Search/filter customers by product, partner, account executive, or search term. Use accountExecutive for filtering by AE name.',
      inputSchema: z.object({
        searchTerm: z.string().optional(),
        product: z.string().optional(),
        partner: z.string().optional(),
        accountExecutive: z.string().optional().describe('Filter by Account Executive name'),
      }),
      execute: (args) => safeExec('search_customers', args, executors.search_customers),
    }),
    list_customers: tool({
      description: 'List all customers. Use when user asks "list customers", "show all customers", "who are our customers".',
      inputSchema: z.object({}),
      execute: () => safeExec('list_customers', undefined, executors.list_customers),
    }),
    list_internal_contacts: tool({
      description: 'List all internal contacts. Use for "list internal contacts", "show team", "who are our account managers".',
      inputSchema: z.object({}),
      execute: () => safeExec('list_internal_contacts', undefined, executors.list_internal_contacts),
    }),
    list_products: tool({
      description: 'List all products. Use for "list products", "what products do we have".',
      inputSchema: z.object({}),
      execute: () => safeExec('list_products', undefined, executors.list_products),
    }),
    list_partners: tool({
      description: 'List all partners. Use for "list partners", "show partners".',
      inputSchema: z.object({}),
      execute: () => safeExec('list_partners', undefined, executors.list_partners),
    }),
    lookup_internal_contact: tool({
      description: 'Look up an internal contact (team member) by name. Use for: "do I have internal contact X", "is there an account manager named X".',
      inputSchema: z.object({ name: z.string().describe('Contact name') }),
      execute: (args) => safeExec('lookup_internal_contact', args, executors.lookup_internal_contact),
    }),
    create_internal_contact: tool({
      description:
        'Create a new internal contact. Use when user says "add internal contact", "create internal contact", or "if not create" after lookup found nothing. Role examples: Account Executive, Account Manager, SE.',
      inputSchema: z.object({
        name: z.string().describe('Full name'),
        role: z.string().optional().describe('Role e.g. Account Executive, Account Manager'),
        email: z.string().optional().describe('Email address'),
      }),
      execute: (args) => safeExec('create_internal_contact', args, executors.create_internal_contact),
    }),
    lookup_customer_contact: tool({
      description: 'Look up a customer contact (stakeholder) by name.',
      inputSchema: z.object({ name: z.string().describe('Contact name') }),
      execute: (args) => safeExec('lookup_customer_contact', args, executors.lookup_customer_contact),
    }),
    create_customer_contact: tool({
      description: 'Create a new customer contact (stakeholder at a customer).',
      inputSchema: z.object({
        name: z.string(),
        role: z.string().optional(),
        email: z.string().optional(),
      }),
      execute: (args) => safeExec('create_customer_contact', args, executors.create_customer_contact),
    }),
    lookup_product: tool({
      description: 'Look up a product by name. Use for: "do we have product X", "is there product XM Cloud".',
      inputSchema: z.object({ name: z.string().describe('Product name') }),
      execute: (args) => safeExec('lookup_product', args, executors.lookup_product),
    }),
    create_product: tool({
      description: 'Create a new product.',
      inputSchema: z.object({
        name: z.string(),
        version: z.string().optional(),
      }),
      execute: (args) => safeExec('create_product', args, executors.create_product),
    }),
    lookup_partner: tool({
      description: 'Look up a partner by name. Use for: "do we have partner X", "is there partner Acme".',
      inputSchema: z.object({ name: z.string().describe('Partner name') }),
      execute: (args) => safeExec('lookup_partner', args, executors.lookup_partner),
    }),
    create_partner: tool({
      description: 'Create a new partner (implementation partner, etc.).',
      inputSchema: z.object({
        name: z.string(),
        type: z.string().optional().describe('e.g. Implementation, Reseller'),
      }),
      execute: (args) => safeExec('create_partner', args, executors.create_partner),
    }),
  };
}

export interface ProcessResult {
  text?: string;
  toolCalls?: Array<{ name: string; args: object; result: object }>;
  error?: string;
}

/**
 * Process a user message: LLM decides which tool(s) to call, the SDK executes
 * them via our injected executors, and we return the final text + a flat list
 * of every tool call/result so the API layer can surface them to the UI.
 */
export async function processWithTools(
  userInput: string,
  context: AIToolsContext,
): Promise<ProcessResult> {
  try {
    const provider = getProvider();
    const model = provider(geminiModelId());

    const contextParts: string[] = [];
    if (context.customerNames?.length)
      contextParts.push(`Known customers: ${context.customerNames.slice(0, 50).join(', ')}`);
    if (context.internalContactNames?.length)
      contextParts.push(`Internal contacts: ${context.internalContactNames.slice(0, 30).join(', ')}`);
    if (context.productNames?.length)
      contextParts.push(`Products: ${context.productNames.slice(0, 30).join(', ')}`);
    if (context.partnerNames?.length)
      contextParts.push(`Partners: ${context.partnerNames.slice(0, 30).join(', ')}`);
    const contextPrompt = contextParts.length ? `${contextParts.join('\n')}\n\n` : '';

    const result = await generateText({
      model,
      system: SYSTEM_INSTRUCTION,
      prompt: contextPrompt + userInput,
      tools: buildTools(context.toolExecutors),
      stopWhen: stepCountIs(MAX_TOOL_STEPS),
    });

    const toolCalls = result.toolCalls ?? [];
    const toolResults = result.toolResults ?? [];

    // Pair each call with its matching result by toolCallId so the UI can show both.
    const callsByCallId = new Map<string, { name: string; args: object }>();
    for (const tc of toolCalls) {
      callsByCallId.set(tc.toolCallId, { name: tc.toolName, args: (tc.input as object) ?? {} });
    }
    const flatToolCalls = toolResults.map((tr) => {
      const call = callsByCallId.get(tr.toolCallId);
      return {
        name: tr.toolName,
        args: call?.args ?? {},
        result: (tr.output as object) ?? {},
      };
    });

    return {
      text: result.text || (flatToolCalls.length ? JSON.stringify(flatToolCalls, null, 2) : undefined),
      toolCalls: flatToolCalls,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('processWithTools error:', err);
    return { error: message };
  }
}
