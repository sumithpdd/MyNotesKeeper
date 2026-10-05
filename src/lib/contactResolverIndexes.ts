import type { Customer, CustomerContact, InternalContact, MartechTool, Partner, Product } from '@/types';

/** Catalog maps for server-side enrichment (no client Firestore). */
export interface ResolverIndexes {
  customerContactsById: Map<string, CustomerContact>;
  internalContactsById: Map<string, InternalContact>;
  productsById: Map<string, Product>;
  partnersById: Map<string, Partner>;
  martechById: Map<string, MartechTool>;
}

function resolveCustomerContactsIndexed(ids: string[], byId: Map<string, CustomerContact>): CustomerContact[] {
  return ids.map((id) => byId.get(id)).filter((c): c is CustomerContact => !!c);
}

function resolveInternalContactsIndexed(ids: string[], byId: Map<string, InternalContact>): InternalContact[] {
  return ids.map((id) => byId.get(id)).filter((c): c is InternalContact => !!c);
}

export function enrichCustomersFromIndexes(customers: Customer[], indexes: ResolverIndexes): Customer[] {
  return customers.map((customer) => {
    const customerContacts = resolveCustomerContactsIndexed(
      customer.customerContactIds || [],
      indexes.customerContactsById,
    );
    const internalContacts = resolveInternalContactsIndexed(
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
      accountExecutives:
        accountExecutives.length > 0 ? accountExecutives : accountExecutive ? [accountExecutive] : [],
      products,
      partners,
      martechTools,
    };
  });
}
