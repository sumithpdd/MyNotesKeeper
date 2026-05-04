/**
 * AI Chat API - LLM + Tools
 *
 * POST /api/ai-chat
 * Body: { message: string } — tenancy from verified Bearer (`auth.uid`); do not trust a client-supplied userId.
 * Returns: { text?: string, error?: string }
 *
 * Uses processWithTools with server-side tool executors backed by Firebase services.
 */

import { NextRequest, NextResponse } from 'next/server';
import { processWithTools, type ToolExecutor } from '@/lib/aiToolsService';
import { authorizeApiRequest } from '@/lib/server/authorizeApiRequest';
import { customerService } from '@/lib/customerService';
import { customerNotesService } from '@/lib/customerNotes';
import { customerProfileService } from '@/lib/customerProfileService';
import { customerContactService, internalContactService } from '@/lib/contactService';
import { productService } from '@/lib/productService';
import { partnerService } from '@/lib/partnerService';
import { aiService } from '@/lib/ai';
import type { CreateCustomerData } from '@/types';
import { formatProductDisplayName } from '@/lib/productDisplay';

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

    // Load all data from Firebase
    const [customers, notes, profiles, customerContacts, internalContacts, products, partners] =
      await Promise.all([
        customerService.getAllCustomers(),
        customerNotesService.getAllNotes(),
        customerProfileService.getAllProfiles().catch(() => []),
        customerContactService.getAllCustomerContacts(),
        internalContactService.getAllInternalContacts(),
        productService.getAllProducts(),
        partnerService.getAllPartners(),
      ]);

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
        const newId = await customerService.createCustomer(createData, uid);
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
        await customerService.updateCustomer(match.id, updateData, uid);
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
        const noteId = await customerNotesService.createNote(
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
        const id = await internalContactService.createInternalContact({
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
        const id = await customerContactService.createCustomerContact({
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
        const id = await productService.createProduct({
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
        const id = await partnerService.createPartner({
          name: name.trim(),
          type: type?.trim() || '',
        });
        return { created: true, partner: { id, name: name.trim(), type: type || '' } };
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
    ],
  });
}
