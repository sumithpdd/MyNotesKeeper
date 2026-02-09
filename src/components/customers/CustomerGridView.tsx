'use client';

import { Customer } from '@/types';
import { CustomerGridCard } from './CustomerGridCard';

interface CustomerGridViewProps {
  customers: Customer[];
  selectedCustomerId: string | null;
  onSelectCustomer: (customerId: string) => void;
}

export function CustomerGridView({
  customers,
  selectedCustomerId,
  onSelectCustomer,
}: CustomerGridViewProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {customers.map((customer) => (
        <CustomerGridCard
          key={customer.id}
          customer={customer}
          isSelected={selectedCustomerId === customer.id}
          onClick={() => onSelectCustomer(customer.id)}
        />
      ))}
    </div>
  );
}
