import { useEffect, type Dispatch, type SetStateAction } from 'react';
import type {
  Customer,
  CustomerNote,
  CustomerProfile,
  Opportunity,
} from '@/types';

/** Keeps operation hooks aligned with snapshots loaded from Firebase (Firestore listeners replacement). */
export function useFirestoreSnapshotSync({
  firebaseNotes,
  firebaseCustomers,
  firebaseOpportunities,
  firebaseProfiles,
  setNotes,
  setCustomers,
  setOpportunities,
  setCustomerProfiles,
}: {
  firebaseNotes: CustomerNote[];
  firebaseCustomers: Customer[];
  firebaseOpportunities: Opportunity[];
  firebaseProfiles: CustomerProfile[];
  setNotes: Dispatch<SetStateAction<CustomerNote[]>>;
  setCustomers: Dispatch<SetStateAction<Customer[]>>;
  setOpportunities: Dispatch<SetStateAction<Opportunity[]>>;
  setCustomerProfiles: Dispatch<SetStateAction<CustomerProfile[]>>;
}) {
  useEffect(() => {
    setNotes(firebaseNotes);
    setCustomers(firebaseCustomers);
    setOpportunities(firebaseOpportunities);
    setCustomerProfiles(firebaseProfiles ?? []);
  }, [
    firebaseNotes,
    firebaseCustomers,
    firebaseOpportunities,
    firebaseProfiles,
    setNotes,
    setCustomers,
    setOpportunities,
    setCustomerProfiles,
  ]);
}
