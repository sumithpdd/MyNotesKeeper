import { useState, useMemo } from 'react';
import { Customer } from '@/types';

export function useCustomerSearch(customers: Customer[]) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredCustomers = useMemo(() => {
    if (!searchTerm) {
      return customers;
    }

    const term = searchTerm.toLowerCase();
    return customers.filter(customer => 
      customer.customerName.toLowerCase().includes(term) ||
      customer.website?.toLowerCase().includes(term) ||
      customer.products.some(p => p.name.toLowerCase().includes(term)) ||
      customer.internalContacts.some(c => c.name.toLowerCase().includes(term)) ||
      customer.accountExecutive?.name.toLowerCase().includes(term) ||
      customer.partners.some(p => p.name.toLowerCase().includes(term))
    );
  }, [customers, searchTerm]);

  return {
    searchTerm,
    setSearchTerm,
    filteredCustomers,
  };
}
