import { Customer, CustomerContact, InternalContact, Product, Partner, MartechTool } from '@/types';
import { customerContactService, internalContactService } from './contactService';
import { productService } from './productService';
import { partnerService } from './partnerService';
import { martechToolService } from './martechToolService';

export interface ResolverIndexes {
  customerContactsById: Map<string, CustomerContact>;
  internalContactsById: Map<string, InternalContact>;
  productsById: Map<string, Product>;
  partnersById: Map<string, Partner>;
  martechById: Map<string, MartechTool>;
}

/**
 * Helper service to resolve contact references
 * Converts customer with contact IDs to customer with full contact objects
 */

export const contactResolver = {
  /**
   * Resolve customer contact IDs to full contact objects
   */
  async resolveCustomerContacts(contactIds: string[]): Promise<CustomerContact[]> {
    if (!contactIds || contactIds.length === 0) return [];
    
    try {
      const allContacts = await customerContactService.getAllCustomerContacts();
      return allContacts.filter(contact => contactIds.includes(contact.id));
    } catch (error) {
      console.error('Error resolving customer contacts:', error);
      return [];
    }
  },

  /**
   * Resolve internal contact IDs to full contact objects
   */
  async resolveInternalContacts(contactIds: string[]): Promise<InternalContact[]> {
    if (!contactIds || contactIds.length === 0) return [];
    
    try {
      const allContacts = await internalContactService.getAllInternalContacts();
      return allContacts.filter(contact => contactIds.includes(contact.id));
    } catch (error) {
      console.error('Error resolving internal contacts:', error);
      return [];
    }
  },

  /**
   * Resolve account executive ID to full contact object
   */
  async resolveAccountExecutive(accountExecutiveId?: string): Promise<InternalContact | undefined> {
    if (!accountExecutiveId) return undefined;
    
    try {
      const allContacts = await internalContactService.getAllInternalContacts();
      return allContacts.find(contact => contact.id === accountExecutiveId);
    } catch (error) {
      console.error('Error resolving account executive:', error);
      return undefined;
    }
  },

  /**
   * Resolve multiple account executive IDs to full contact objects
   */
  async resolveAccountExecutives(accountExecutiveIds?: string[]): Promise<InternalContact[]> {
    if (!accountExecutiveIds?.length) return [];
    
    try {
      const allContacts = await internalContactService.getAllInternalContacts();
      return accountExecutiveIds
        .map(id => allContacts.find(c => c.id === id))
        .filter((c): c is InternalContact => !!c);
    } catch (error) {
      console.error('Error resolving account executives:', error);
      return [];
    }
  },

  /**
   * Resolve product IDs to full product objects
   */
  async resolveProducts(productIds: string[]): Promise<Product[]> {
    if (!productIds || productIds.length === 0) return [];
    
    try {
      const allProducts = await productService.getAllProducts();
      return allProducts.filter(product => productIds.includes(product.id));
    } catch (error) {
      console.error('Error resolving products:', error);
      return [];
    }
  },

  /**
   * Resolve partner IDs to full partner objects
   */
  async resolvePartners(partnerIds: string[]): Promise<Partner[]> {
    if (!partnerIds || partnerIds.length === 0) return [];
    
    try {
      const allPartners = await partnerService.getAllPartners();
      return allPartners.filter(partner => partnerIds.includes(partner.id));
    } catch (error) {
      console.error('Error resolving partners:', error);
      return [];
    }
  },

  /**
   * Resolve martech tool IDs to full martech tool objects
   */
  async resolveMartechTools(martechToolIds: string[]): Promise<MartechTool[]> {
    if (!martechToolIds || martechToolIds.length === 0) return [];
    
    try {
      const allTools = await martechToolService.getAllMartechTools();
      return allTools.filter(tool => martechToolIds.includes(tool.id));
    } catch (error) {
      console.error('Error resolving martech tools:', error);
      return [];
    }
  },

  /**
   * Enrich a customer with full contact objects from IDs
   */
  async enrichCustomer(customer: Customer): Promise<Customer> {
    const [customerContacts, internalContacts, accountExecutive, accountExecutives, products, partners, martechTools] = await Promise.all([
      this.resolveCustomerContacts(customer.customerContactIds || []),
      this.resolveInternalContacts(customer.internalContactIds || []),
      this.resolveAccountExecutive(customer.accountExecutiveId),
      this.resolveAccountExecutives(customer.accountExecutiveIds?.length ? customer.accountExecutiveIds : (customer.accountExecutiveId ? [customer.accountExecutiveId] : [])),
      this.resolveProducts(customer.productIds || []),
      this.resolvePartners(customer.partnerIds || []),
      this.resolveMartechTools(customer.martechToolIds || [])
    ]);

    return {
      ...customer,
      customerContacts,
      internalContacts,
      accountExecutive: accountExecutive || accountExecutives[0],
      accountExecutives: accountExecutives.length > 0 ? accountExecutives : (accountExecutive ? [accountExecutive] : []),
      products,
      partners,
      martechTools
    };
  },

  /**
   * Enrich multiple customers with full contact objects
   */
  async enrichCustomers(customers: Customer[]): Promise<Customer[]> {
    return Promise.all(customers.map(c => this.enrichCustomer(c)));
  },

  /**
   * Resolve references using catalog maps loaded on the server (no client Firestore).
   */
  enrichCustomersFromIndexes(customers: Customer[], indexes: ResolverIndexes): Customer[] {
    return customers.map((customer) => {
      const customerContacts = this.resolveCustomerContactsIndexed(
        customer.customerContactIds || [],
        indexes.customerContactsById,
      );
      const internalContacts = this.resolveInternalContactsIndexed(
        customer.internalContactIds || [],
        indexes.internalContactsById,
      );
      const aeIds =
        customer.accountExecutiveIds?.length
          ? customer.accountExecutiveIds
          : customer.accountExecutiveId
            ? [customer.accountExecutiveId]
            : [];
      const accountExecutive = aeIds.length
        ? indexes.internalContactsById.get(customer.accountExecutiveId || aeIds[0])
        : undefined;
      const accountExecutives = aeIds
        .map((id) => indexes.internalContactsById.get(id))
        .filter((c): c is InternalContact => !!c);

      const products = (customer.productIds || [])
        .map((id) => indexes.productsById.get(id))
        .filter((p): p is Product => !!p);
      const partners = (customer.partnerIds || [])
        .map((id) => indexes.partnersById.get(id))
        .filter((p): p is Partner => !!p);
      const martechTools = (customer.martechToolIds || [])
        .map((id) => indexes.martechById.get(id))
        .filter((m): m is MartechTool => !!m);

      return {
        ...customer,
        customerContacts,
        internalContacts,
        accountExecutive: accountExecutive || accountExecutives[0],
        accountExecutives: accountExecutives.length > 0 ? accountExecutives : accountExecutive ? [accountExecutive] : [],
        products,
        partners,
        martechTools,
      };
    });
  },

  resolveCustomerContactsIndexed(ids: string[], byId: Map<string, CustomerContact>): CustomerContact[] {
    return ids.map((id) => byId.get(id)).filter((c): c is CustomerContact => !!c);
  },

  resolveInternalContactsIndexed(ids: string[], byId: Map<string, InternalContact>): InternalContact[] {
    return ids.map((id) => byId.get(id)).filter((c): c is InternalContact => !!c);
  },

  /**
   * Convert customer with full contacts to customer with only IDs (for saving)
   */
  prepareCustomerForSave(customer: Customer): Customer {
    const aeIds = customer.accountExecutives?.length
      ? customer.accountExecutives.map(c => c.id)
      : customer.accountExecutiveIds || (customer.accountExecutive?.id ? [customer.accountExecutive.id] : []);
    const allInternalIds = [...new Set([
      ...(customer.internalContacts?.map(c => c.id) || customer.internalContactIds || []),
      ...aeIds
    ])];
    return {
      ...customer,
      customerContactIds: customer.customerContacts?.map(c => c.id) || customer.customerContactIds || [],
      internalContactIds: allInternalIds,
      accountExecutiveId: aeIds[0] || customer.accountExecutive?.id || customer.accountExecutiveId,
      accountExecutiveIds: aeIds,
      customerContacts: undefined,
      internalContacts: undefined,
      accountExecutive: undefined,
      accountExecutives: undefined,
      products: undefined,
      partners: undefined,
      martechTools: undefined
    };
  }
};
