import { useState, useMemo } from 'react';
import { Customer } from '@/types';

export type SortBy = 'name' | 'created' | 'updated' | 'products';

export function useCustomerSort() {
  const [sortBy, setSortBy] = useState<SortBy>('name');

  const sortCustomers = (customers: Customer[]): Customer[] => {
    return [...customers].sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.customerName.localeCompare(b.customerName);
        case 'created':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'updated':
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        case 'products':
          return b.products.length - a.products.length;
        default:
          return 0;
      }
    });
  };

  return {
    sortBy,
    setSortBy,
    sortCustomers,
  };
}
