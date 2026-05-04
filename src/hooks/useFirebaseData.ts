import { useCallback, useEffect, useState } from 'react';
import type {
  Customer,
  CustomerNote,
  CustomerProfile,
  Opportunity,
  Product,
  Partner,
  MartechTool,
  CustomerContact,
  InternalContact,
  EngagementTask,
  TaskCategory,
} from '@/types';
import { hubAuthJson } from '@/lib/client/hubAuthFetch';
import { hydrateWorkspacePayload } from '@/lib/client/workspaceHydrate';

interface FirebaseData {
  customers: Customer[];
  notes: CustomerNote[];
  customerProfiles: CustomerProfile[];
  opportunities: Opportunity[];
  products: Product[];
  partners: Partner[];
  martechTools: MartechTool[];
  customerContacts: CustomerContact[];
  internalContacts: InternalContact[];
  tasks: EngagementTask[];
  taskCategories: TaskCategory[];
  loading: boolean;
}

/**
 * Loads the hub workspace strictly through authenticated `/api/workspace` (Admin Firestore on the server).
 */
export function useFirebaseData(opts: {
  hubUserId: string | undefined;
  getFirebaseIdToken: () => Promise<string | null>;
}) {
  const { hubUserId, getFirebaseIdToken } = opts;

  const [data, setData] = useState<FirebaseData>({
    customers: [],
    notes: [],
    customerProfiles: [],
    opportunities: [],
    products: [],
    partners: [],
    martechTools: [],
    customerContacts: [],
    internalContacts: [],
    tasks: [],
    taskCategories: [],
    loading: true,
  });

  const loadFirebaseData = useCallback(async () => {
    if (!hubUserId) {
      setData((prev) => ({ ...prev, loading: false }));
      return;
    }
    try {
      setData((prev) => ({ ...prev, loading: true }));

      const token = await getFirebaseIdToken();
      if (!token) throw new Error('Missing auth token');

      const envelope = await hubAuthJson<{ success: boolean; data: Record<string, unknown> }>(
        '/api/workspace',
        token,
        { method: 'GET' },
      );

      if (!envelope.success || !envelope.data) throw new Error('Invalid workspace payload');

      const hydrated = hydrateWorkspacePayload(envelope.data);

      const customersWithDefaults = hydrated.customers.map((customer) => ({
        ...customer,
        products: customer.products || [],
        customerContacts: customer.customerContacts || [],
        internalContacts: customer.internalContacts || [],
        partners: customer.partners || [],
        martechTools: customer.martechTools || [],
        website: customer.website || '',
        websiteUrls: customer.websiteUrls?.length ? customer.websiteUrls : undefined,
        sharePointUrl: customer.sharePointUrl || '',
        salesforceLink: customer.salesforceLink || '',
        additionalLink: customer.additionalLink || '',
        additionalInfo: customer.additionalInfo || '',
        createdAt: customer.createdAt || new Date(),
        updatedAt: customer.updatedAt || new Date(),
      }));

      const notesWithDefaults = hydrated.notes.map((note) => ({
        ...note,
        createdAt: note.createdAt || new Date(),
        updatedAt: note.updatedAt || new Date(),
        otherFields: note.otherFields || {},
      }));

      setData({
        customers: customersWithDefaults,
        notes: notesWithDefaults,
        customerProfiles: hydrated.customerProfiles,
        opportunities: hydrated.opportunities,
        products: hydrated.products,
        partners: hydrated.partners,
        martechTools: hydrated.martechTools,
        customerContacts: hydrated.customerContacts,
        internalContacts: hydrated.internalContacts,
        tasks: hydrated.tasks,
        taskCategories: hydrated.taskCategories,
        loading: false,
      });
    } catch (error) {
      console.error('Error loading workspace via API:', error);
      setData({
        customers: [],
        notes: [],
        customerProfiles: [],
        opportunities: [],
        products: [],
        partners: [],
        martechTools: [],
        customerContacts: [],
        internalContacts: [],
        tasks: [],
        taskCategories: [],
        loading: false,
      });
    }
  }, [hubUserId, getFirebaseIdToken]);

  const reloadWorkspace = useCallback(async () => {
    await loadFirebaseData();
  }, [loadFirebaseData]);

  useEffect(() => {
    void loadFirebaseData();
  }, [loadFirebaseData]);

  const reloadData = () => {
    void reloadWorkspace();
  };

  const setCustomerContacts = (updater: CustomerContact[] | ((prev: CustomerContact[]) => CustomerContact[])) => {
    setData((prev) => ({
      ...prev,
      customerContacts: typeof updater === 'function' ? updater(prev.customerContacts) : updater,
    }));
  };

  const setInternalContacts = (updater: InternalContact[] | ((prev: InternalContact[]) => InternalContact[])) => {
    setData((prev) => ({
      ...prev,
      internalContacts: typeof updater === 'function' ? updater(prev.internalContacts) : updater,
    }));
  };

  const setProducts = (updater: Product[] | ((prev: Product[]) => Product[])) => {
    setData((prev) => ({
      ...prev,
      products: typeof updater === 'function' ? updater(prev.products) : updater,
    }));
  };

  const setPartners = (updater: Partner[] | ((prev: Partner[]) => Partner[])) => {
    setData((prev) => ({
      ...prev,
      partners: typeof updater === 'function' ? updater(prev.partners) : updater,
    }));
  };

  const setMartechTools = (updater: MartechTool[] | ((prev: MartechTool[]) => MartechTool[])) => {
    setData((prev) => ({
      ...prev,
      martechTools: typeof updater === 'function' ? updater(prev.martechTools) : updater,
    }));
  };

  const setTasks = (updater: EngagementTask[] | ((prev: EngagementTask[]) => EngagementTask[])) => {
    setData((prev) => ({
      ...prev,
      tasks: typeof updater === 'function' ? updater(prev.tasks) : updater,
    }));
  };

  const setTaskCategories = (updater: TaskCategory[] | ((prev: TaskCategory[]) => TaskCategory[])) => {
    setData((prev) => ({
      ...prev,
      taskCategories: typeof updater === 'function' ? updater(prev.taskCategories) : updater,
    }));
  };

  return {
    ...data,
    reloadWorkspace,
    reloadData,
    setCustomerContacts,
    setInternalContacts,
    setProducts,
    setPartners,
    setMartechTools,
    setTasks,
    setTaskCategories,
  };
}
