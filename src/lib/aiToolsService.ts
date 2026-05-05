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

const MODEL_ID = 'gemini-2.0-flash';
const MAX_TOOL_STEPS = 5;

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
  | 'create_partner';

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

For "if not create": call lookup first. If found, report. If not found, call the create tool with user-provided details.

Your role: (1) Call the right tool(s) to get or update data.
(2) Format tool results into clear, friendly natural language for the user.

Never respond with data you haven't fetched via a tool. Match names flexibly (partial, case-insensitive).`;

const seConfidenceSchema = z.enum(['Green', 'Yellow', 'Red']);

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
    const model = provider(MODEL_ID);

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
