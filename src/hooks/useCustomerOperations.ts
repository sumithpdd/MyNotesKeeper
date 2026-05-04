import { useCallback, useState } from 'react';
import type { Customer } from '@/types';
import { hubAuthFetch } from '@/lib/client/hubAuthFetch';
import { contactResolver } from '@/lib/contactResolver';

interface UseCustomerOperationsProps {
  userId?: string;
  getFirebaseIdToken: () => Promise<string | null>;
  reloadWorkspace: () => Promise<void>;
}

export function useCustomerOperations({
  userId,
  getFirebaseIdToken,
  reloadWorkspace,
}: UseCustomerOperationsProps) {
  /** Retained only so `useFirestoreSnapshotSync` can push workspace customers into memoized component state */
  const [, setCustomers] = useState<Customer[]>([]);

  const saveCustomer = useCallback(
    async (customer: Customer) => {
      if (!userId) return;
      const token = await getFirebaseIdToken();
      if (!token) throw new Error('Sign in required');
      const prepared = contactResolver.prepareCustomerForSave(customer);

      if (customer.id) {
        const put = await hubAuthFetch('/api/customers', token, {
          method: 'PUT',
          body: JSON.stringify({
            customerId: customer.id,
            customer: prepared,
            userId,
          }),
        });
        const text = await put.text();
        if (!put.ok) {
          const lower = text.toLowerCase();
          if (lower.includes('no document to update')) {
            const post = await hubAuthFetch('/api/customers', token, {
              method: 'POST',
              body: JSON.stringify({ customer: prepared, userId }),
            });
            if (!post.ok) throw new Error(await post.text());
          } else {
            throw new Error(text || `Customer update failed (${put.status})`);
          }
        }
      } else {
        const post = await hubAuthFetch('/api/customers', token, {
          method: 'POST',
          body: JSON.stringify({ customer: prepared, userId }),
        });
        if (!post.ok) throw new Error(await post.text());
      }

      await reloadWorkspace();
    },
    [userId, getFirebaseIdToken, reloadWorkspace],
  );

  const deleteCustomer = useCallback(
    async (customerId: string) => {
      const token = await getFirebaseIdToken();
      if (!token) throw new Error('Sign in required');
      const res = await hubAuthFetch(
        `/api/customers?id=${encodeURIComponent(customerId)}`,
        token,
        { method: 'DELETE' },
      );
      if (!res.ok) throw new Error(await res.text());
      await reloadWorkspace();
    },
    [getFirebaseIdToken, reloadWorkspace],
  );

  return {
    customers: [],
    setCustomers,
    saveCustomer,
    deleteCustomer,
  };
}
