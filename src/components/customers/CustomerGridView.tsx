'use client';

import { Customer } from '@/types';
import { CustomerGridCard } from './CustomerGridCard';

interface CustomerGridViewProps {
  customers: Customer[];
  selectedCustomerId: string | null;
  onSelectCustomer: (customerId: string) => void;
  onEditCustomer?: (customer: Customer) => void;
}

export function CustomerGridView({
  customers,
  selectedCustomerId,
  onSelectCustomer,
  onEditCustomer,
}: CustomerGridViewProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 w-full min-w-0">
      {customers.map((customer) => (
        <CustomerGridCard
          key={customer.id}
          customer={customer}
          isSelected={selectedCustomerId === customer.id}
          onClick={() => onSelectCustomer(customer.id)}
          onEdit={onEditCustomer ? () => onEditCustomer(customer) : undefined}
        />
      ))}
    </div>
  );
}
