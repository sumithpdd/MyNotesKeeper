import { useCallback, type Dispatch, type SetStateAction } from 'react';
import type { CustomerContact, CustomerProfile, InternalContact, Partner, Product } from '@/types';
import { hubAuthFetch, hubAuthJson } from '@/lib/client/hubAuthFetch';

interface Params {
  userId: string | undefined;
  getFirebaseIdToken: () => Promise<string | null>;
  reloadWorkspace: () => Promise<void>;
  setCustomerContacts: Dispatch<SetStateAction<CustomerContact[]>>;
  setInternalContacts: Dispatch<SetStateAction<InternalContact[]>>;
  customerProfiles: CustomerProfile[];
  setCustomerProfiles: Dispatch<SetStateAction<CustomerProfile[]>>;
}

export function useAiPanelEntityActions({
  userId,
  getFirebaseIdToken,
  reloadWorkspace,
  setCustomerContacts,
  setInternalContacts,
  customerProfiles,
  setCustomerProfiles,
}: Params) {
  const onUpdateProfile = useCallback(
    async (profileUpdate: Partial<CustomerProfile> & { customerId: string }) => {
      if (!userId) throw new Error('Not signed in');
      const existingProfile = customerProfiles.find((p) => p.customerId === profileUpdate.customerId);
      if (!existingProfile) return;
      const token = await getFirebaseIdToken();
      if (!token) throw new Error('Sign in required');
      const res = await hubAuthFetch('/api/customer-profiles', token, {
        method: 'PATCH',
        body: JSON.stringify({
          profileId: existingProfile.id,
          userId,
          patch: profileUpdate,
        }),
      });
      if (!res.ok) throw new Error(await res.text());
      const updated = { ...existingProfile, ...profileUpdate };
      setCustomerProfiles((prev) => prev.map((p) => (p.id === existingProfile.id ? updated : p)));
      await reloadWorkspace();
    },
    [userId, getFirebaseIdToken, reloadWorkspace, customerProfiles, setCustomerProfiles],
  );

  const onAddCustomerContact = useCallback(
    async (contact: CustomerContact) => {
      const token = await getFirebaseIdToken();
      if (!token) throw new Error('Sign in required');
      const { id: _ccId, ...rest } = contact;
      void _ccId;
      const created = await hubAuthJson<{ success: boolean; data: CustomerContact & { id: string } }>(
        '/api/contacts',
        token,
        {
          method: 'POST',
          body: JSON.stringify({ contact: rest, type: 'customer' }),
        },
      );
      const saved = created.data as CustomerContact;
      setCustomerContacts((prev) => [...prev, saved]);
      await reloadWorkspace();
      return saved;
    },
    [setCustomerContacts, getFirebaseIdToken, reloadWorkspace],
  );

  const onAddInternalContact = useCallback(
    async (contact: InternalContact) => {
      const token = await getFirebaseIdToken();
      if (!token) throw new Error('Sign in required');
      const { id: _icId, ...rest } = contact;
      void _icId;
      const created = await hubAuthJson<{ success: boolean; data: InternalContact & { id: string } }>(
        '/api/contacts',
        token,
        {
          method: 'POST',
          body: JSON.stringify({ contact: rest, type: 'internal' }),
        },
      );
      const saved = created.data as InternalContact;
      setInternalContacts((prev) => [...prev, saved]);
      await reloadWorkspace();
      return saved;
    },
    [setInternalContacts, getFirebaseIdToken, reloadWorkspace],
  );

  const onAddProduct = useCallback(
    async (product: Omit<Product, 'id'>) => {
      const token = await getFirebaseIdToken();
      if (!token) throw new Error('Sign in required');
      await hubAuthJson('/api/entities', token, {
        method: 'POST',
        body: JSON.stringify({ entity: product, type: 'product' }),
      });
      await reloadWorkspace();
    },
    [getFirebaseIdToken, reloadWorkspace],
  );

  const onAddPartner = useCallback(
    async (partner: Omit<Partner, 'id'>) => {
      const token = await getFirebaseIdToken();
      if (!token) throw new Error('Sign in required');
      await hubAuthJson('/api/entities', token, {
        method: 'POST',
        body: JSON.stringify({ entity: partner, type: 'partner' }),
      });
      await reloadWorkspace();
    },
    [getFirebaseIdToken, reloadWorkspace],
  );

  return {
    onUpdateProfile,
    onAddCustomerContact,
    onAddInternalContact,
    onAddProduct,
    onAddPartner,
  };
}
