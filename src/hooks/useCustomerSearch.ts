import { useState, useMemo } from 'react';
import { Customer } from '@/types';

import { formatProductDisplayName } from '@/lib/productDisplay';
import { customerWebsiteList } from '@/lib/customerWebsites';

export function useCustomerSearch(customers: Customer[]) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredCustomers = useMemo(() => {
    if (!searchTerm) {
      return customers;
    }

    const term = searchTerm.toLowerCase();
    return customers.filter(customer => {
      const aes = customer.accountExecutives || (customer.accountExecutive ? [customer.accountExecutive] : []);
      const siteHaystack = customerWebsiteList(customer).join(' ').toLowerCase();
      return customer.customerName.toLowerCase().includes(term) ||
        customer.website?.toLowerCase().includes(term) ||
        siteHaystack.includes(term) ||
        customer.products?.some((p) =>
          formatProductDisplayName(p).toLowerCase().includes(term) ||
          p.name.toLowerCase().includes(term) ||
          (p.version ?? '').toLowerCase().includes(term)
        ) ||
        customer.internalContacts?.some(c => c.name.toLowerCase().includes(term)) ||
        aes.some(ae => ae?.name.toLowerCase().includes(term)) ||
        customer.partners?.some(p => p.name.toLowerCase().includes(term));
    });
  }, [customers, searchTerm]);

  return {
    searchTerm,
    setSearchTerm,
    filteredCustomers,
  };
}
