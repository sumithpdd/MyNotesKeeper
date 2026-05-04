/**
 * AI Tools Service - LLM + Tools pattern
 *
 * Uses Gemini's function calling: the LLM decides which tool to call,
 * we execute it, then optionally get a natural language response.
 */

import {
  GoogleGenerativeAI,
  SchemaType,
  FunctionCallingMode,
  type FunctionDeclaration,
  type FunctionDeclarationsTool,
  type FunctionCall,
  type Content,
  type Part,
} from '@google/generative-ai';

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

function getToolDeclarations(): FunctionDeclarationsTool {
  return {
    functionDeclarations: [
      {
        name: 'lookup_customer',
        description: 'Look up a customer by name. Returns customer info if found, or indicates not found. Use for: "do I have customer X", "tell me about X", "show me X", "is there a customer X".',
        parameters: {
          type: SchemaType.OBJECT,
          properties: {
            customerName: {
              type: SchemaType.STRING,
              description: 'The customer name to look up (e.g. "British Heart Foundation")',
            },
          },
          required: ['customerName'],
        },
      },
      {
        name: 'customer_summary',
        description: 'Get an AI-generated summary of a customer including products, notes, profile, and opportunities. Use when user wants a summary or overview of a customer.',
        parameters: {
          type: SchemaType.OBJECT,
          properties: {
            customerName: {
              type: SchemaType.STRING,
              description: 'The customer name for the summary',
            },
          },
          required: ['customerName'],
        },
      },
      {
        name: 'create_customer',
        description: 'Create a new customer record. Use when user says "create", "add", "new customer".',
        parameters: {
          type: SchemaType.OBJECT,
          properties: {
            customerName: { type: SchemaType.STRING, description: 'Customer/company name' },
            additionalInfo: { type: SchemaType.STRING, description: 'Optional extra details' },
          },
          required: ['customerName'],
        },
      },
      {
        name: 'update_customer',
        description: 'Update an existing customer. Use when user says "update", "modify", "change", "assign" for a known customer. Supports: mergedNotes, additionalInfo, accountExecutiveId (from lookup_internal_contact), compellingEvent, migrationNotes, etc.',
        parameters: {
          type: SchemaType.OBJECT,
          properties: {
            customerName: { type: SchemaType.STRING },
            updates: {
              type: SchemaType.OBJECT,
              description: 'Fields to update: mergedNotes, additionalInfo, accountExecutiveId (internal contact ID), compellingEvent, migrationNotes, sharePointUrl, salesforceLink',
            },
          },
          required: ['customerName'],
        },
      },
      {
        name: 'add_note',
        description: 'Add a note to a customer. Use when user says "add note", "create note", "note for".',
        parameters: {
          type: SchemaType.OBJECT,
          properties: {
            customerName: { type: SchemaType.STRING },
            noteContent: { type: SchemaType.STRING },
            seConfidence: {
              type: SchemaType.STRING,
              description: 'Green, Yellow, or Red',
              enum: ['Green', 'Yellow', 'Red'],
            },
          },
          required: ['customerName', 'noteContent'],
        },
      },
      {
        name: 'search_customers',
        description: 'Search/filter customers by product, partner, account executive, or search term. Use accountExecutive for filtering by AE name.',
        parameters: {
          type: SchemaType.OBJECT,
          properties: {
            searchTerm: { type: SchemaType.STRING },
            product: { type: SchemaType.STRING },
            partner: { type: SchemaType.STRING },
            accountExecutive: { type: SchemaType.STRING, description: 'Filter by Account Executive name' },
          },
        },
      },
      {
        name: 'list_customers',
        description: 'List all customers. Use when user asks "list customers", "show all customers", "who are our customers".',
        parameters: { type: SchemaType.OBJECT, properties: {}, required: [] },
      },
      {
        name: 'list_internal_contacts',
        description: 'List all internal contacts. Use for "list internal contacts", "show team", "who are our account managers".',
        parameters: { type: SchemaType.OBJECT, properties: {}, required: [] },
      },
      {
        name: 'list_products',
        description: 'List all products. Use for "list products", "what products do we have".',
        parameters: { type: SchemaType.OBJECT, properties: {}, required: [] },
      },
      {
        name: 'list_partners',
        description: 'List all partners. Use for "list partners", "show partners".',
        parameters: { type: SchemaType.OBJECT, properties: {}, required: [] },
      },
      {
        name: 'lookup_internal_contact',
        description: 'Look up an internal contact (team member) by name. Use for: "do I have internal contact X", "is there an account manager named X".',
        parameters: {
          type: SchemaType.OBJECT,
          properties: {
            name: { type: SchemaType.STRING, description: 'Contact name' },
          },
          required: ['name'],
        },
      },
      {
        name: 'create_internal_contact',
        description: 'Create a new internal contact. Use when user says "add internal contact", "create internal contact", or "if not create" after lookup found nothing. Role examples: Account Executive, Account Manager, SE.',
        parameters: {
          type: SchemaType.OBJECT,
          properties: {
            name: { type: SchemaType.STRING, description: 'Full name' },
            role: { type: SchemaType.STRING, description: 'Role e.g. Account Executive, Account Manager' },
            email: { type: SchemaType.STRING, description: 'Email address' },
          },
          required: ['name'],
        },
      },
      {
        name: 'lookup_customer_contact',
        description: 'Look up a customer contact (stakeholder) by name.',
        parameters: {
          type: SchemaType.OBJECT,
          properties: {
            name: { type: SchemaType.STRING, description: 'Contact name' },
          },
          required: ['name'],
        },
      },
      {
        name: 'create_customer_contact',
        description: 'Create a new customer contact (stakeholder at a customer).',
        parameters: {
          type: SchemaType.OBJECT,
          properties: {
            name: { type: SchemaType.STRING },
            role: { type: SchemaType.STRING },
            email: { type: SchemaType.STRING },
          },
          required: ['name'],
        },
      },
      {
        name: 'lookup_product',
        description: 'Look up a product by name. Use for: "do we have product X", "is there product XM Cloud".',
        parameters: {
          type: SchemaType.OBJECT,
          properties: {
            name: { type: SchemaType.STRING, description: 'Product name' },
          },
          required: ['name'],
        },
      },
      {
        name: 'create_product',
        description: 'Create a new product.',
        parameters: {
          type: SchemaType.OBJECT,
          properties: {
            name: { type: SchemaType.STRING },
            version: { type: SchemaType.STRING },
          },
          required: ['name'],
        },
      },
      {
        name: 'lookup_partner',
        description: 'Look up a partner by name. Use for: "do we have partner X", "is there partner Acme".',
        parameters: {
          type: SchemaType.OBJECT,
          properties: {
            name: { type: SchemaType.STRING, description: 'Partner name' },
          },
          required: ['name'],
        },
      },
      {
        name: 'create_partner',
        description: 'Create a new partner (implementation partner, etc.).',
        parameters: {
          type: SchemaType.OBJECT,
          properties: {
            name: { type: SchemaType.STRING },
            type: { type: SchemaType.STRING, description: 'e.g. Implementation, Reseller' },
          },
          required: ['name'],
        },
      },
    ] as FunctionDeclaration[],
  };
}

let genAI: GoogleGenerativeAI | null = null;

function getModel() {
  if (!genAI) {
    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('NEXT_PUBLIC_GEMINI_API_KEY is not configured');
    }
    genAI = new GoogleGenerativeAI(apiKey);
  }
  return genAI.getGenerativeModel({
    model: 'gemini-2.0-flash',
    systemInstruction: SYSTEM_INSTRUCTION,
    tools: [getToolDeclarations()],
    toolConfig: {
      functionCallingConfig: {
        mode: FunctionCallingMode.AUTO,
      },
    },
  });
}

async function executeTool(
  name: ToolName,
  args: object,
  executors: Partial<ToolExecutor>
): Promise<object> {
  const executor = executors[name as keyof ToolExecutor];
  if (typeof executor !== 'function') {
    return { error: `Tool "${name}" is not available` };
  }
  try {
    return await (executor as (args: object) => Promise<object>)(args);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return { error: message };
  }
}

export interface ProcessResult {
  text?: string;
  toolCalls?: Array<{ name: string; args: object; result: object }>;
  error?: string;
}

/**
 * Process user message: LLM decides tool(s) to call, we execute, return result.
 */
export async function processWithTools(
  userInput: string,
  context: AIToolsContext
): Promise<ProcessResult> {
  try {
    const model = getModel();

    const contextParts: string[] = [];
    if (context.customerNames?.length) contextParts.push(`Known customers: ${context.customerNames.slice(0, 50).join(', ')}`);
    if (context.internalContactNames?.length) contextParts.push(`Internal contacts: ${context.internalContactNames.slice(0, 30).join(', ')}`);
    if (context.productNames?.length) contextParts.push(`Products: ${context.productNames.slice(0, 30).join(', ')}`);
    if (context.partnerNames?.length) contextParts.push(`Partners: ${context.partnerNames.slice(0, 30).join(', ')}`);
    const contextPrompt = contextParts.length ? `\n${contextParts.join('\n')}\n` : '';

    const result = await model.generateContent({
      contents: [
        {
          role: 'user',
          parts: [{ text: contextPrompt + userInput }],
        },
      ],
    });

    const response = result.response;
    const candidate = response.candidates?.[0];
    if (!candidate?.content?.parts) {
      return { error: 'No response from model' };
    }

    const parts = candidate.content.parts;
    const functionCalls = parts
      .filter((p): p is Part & { functionCall: FunctionCall } => 'functionCall' in p && !!p.functionCall)
      .map((p) => p.functionCall);

    if (functionCalls.length === 0) {
      const textPart = parts.find((p) => 'text' in p && p.text);
      return {
        text: textPart && 'text' in textPart ? textPart.text : undefined,
      };
    }

    let conversation: Content[] = [
      { role: 'user', parts: [{ text: contextPrompt + userInput }] },
      { role: 'model', parts },
    ];
    const toolResults: Array<{ name: string; args: object; result: object }> = [];

    // Loop: execute tools, send results back, repeat until model returns only text
    let currentParts = parts;
    let maxIterations = 5;
    while (maxIterations-- > 0) {
      const functionCallsThisRound = currentParts
        .filter((p): p is Part & { functionCall: FunctionCall } => 'functionCall' in p && !!p.functionCall)
        .map((p) => p.functionCall);

      if (functionCallsThisRound.length === 0) break;

      const functionResponses: Array<{ functionResponse: { name: string; response: object } }> = [];
      for (const fc of functionCallsThisRound) {
        const { name, args } = fc;
        const result = await executeTool(name as ToolName, args || {}, context.toolExecutors);
        toolResults.push({ name, args: args || {}, result });
        functionResponses.push({ functionResponse: { name, response: result } });
      }

      conversation.push({ role: 'user', parts: functionResponses });
      const nextResult = await model.generateContent({ contents: conversation });
      const nextCandidate = nextResult.response.candidates?.[0];
      if (!nextCandidate?.content?.parts) break;

      currentParts = nextCandidate.content.parts;
      conversation.push({ role: 'model', parts: currentParts });

      const hasMoreCalls = currentParts.some((p) => 'functionCall' in p && p.functionCall);
      if (!hasMoreCalls) break;
    }

    const lastModelParts = conversation.filter((c) => c.role === 'model').pop()?.parts || [];
    const finalText = lastModelParts
      .filter((p): p is Part & { text: string } => 'text' in p && !!p.text)
      .map((p) => p.text)
      .join('\n');

    return {
      text: finalText || JSON.stringify(toolResults, null, 2),
      toolCalls: toolResults,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return { error: message };
  }
}
