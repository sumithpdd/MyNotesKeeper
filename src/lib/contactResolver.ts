import { Customer, CustomerContact, InternalContact, Product, Partner } from '@/types';
import { customerContactService, internalContactService } from './contactService';
import { productService } from './productService';
import { partnerService } from './partnerService';

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
   * Enrich a customer with full contact objects from IDs
   */
  async enrichCustomer(customer: Customer): Promise<Customer> {
    const [customerContacts, internalContacts, accountExecutive, products, partners] = await Promise.all([
      this.resolveCustomerContacts(customer.customerContactIds || []),
      this.resolveInternalContacts(customer.internalContactIds || []),
      this.resolveAccountExecutive(customer.accountExecutiveId),
      this.resolveProducts(customer.productIds || []),
      this.resolvePartners(customer.partnerIds || [])
    ]);

    return {
      ...customer,
      customerContacts, // Add resolved contacts for display
      internalContacts, // Add resolved contacts for display
      accountExecutive, // Add resolved account executive for display
      products,         // Add resolved products for display
      partners          // Add resolved partners for display
    };
  },

  /**
   * Enrich multiple customers with full contact objects
   */
  async enrichCustomers(customers: Customer[]): Promise<Customer[]> {
    return Promise.all(customers.map(c => this.enrichCustomer(c)));
  },

  /**
   * Convert customer with full contacts to customer with only IDs (for saving)
   */
  prepareCustomerForSave(customer: Customer): Customer {
    return {
      ...customer,
      customerContactIds: customer.customerContacts?.map(c => c.id) || customer.customerContactIds || [],
      internalContactIds: customer.internalContacts?.map(c => c.id) || customer.internalContactIds || [],
      accountExecutiveId: customer.accountExecutive?.id || customer.accountExecutiveId,
      productIds: customer.products?.map(p => p.id) || customer.productIds || [],
      partnerIds: customer.partners?.map(p => p.id) || customer.partnerIds || [],
      // Remove full objects before saving
      customerContacts: undefined,
      internalContacts: undefined,
      accountExecutive: undefined,
      products: undefined,
      partners: undefined
    };
  }
};
