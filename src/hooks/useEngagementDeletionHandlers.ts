import { useCallback, type Dispatch, type SetStateAction } from 'react';
import type { EngagementTask } from '@/types';
import type { Opportunity } from '@/types';
import type { CustomerNote } from '@/types';
import {
  engagementTaskIdsForCustomerRemoval,
  engagementTaskIdsForOpportunityRemoval,
} from '@/domain/engagement-hub';
import { hubAuthFetch } from '@/lib/client/hubAuthFetch';

interface UseEngagementDeletionHandlersParams {
  tasks: EngagementTask[];
  opportunities: Opportunity[];
  setNotes: Dispatch<SetStateAction<CustomerNote[]>>;
  setTasks: Dispatch<SetStateAction<EngagementTask[]>>;
  deleteCustomer: (customerId: string) => Promise<void>;
  deleteOpportunity: (opportunityId: string) => Promise<void>;
  deleteOpportunitiesByCustomer: (customerId: string) => Promise<void>;
  getFirebaseIdToken: () => Promise<string | null>;
  reloadWorkspace: () => Promise<void>;
}

async function deleteTasksByIds(
  getFirebaseIdToken: () => Promise<string | null>,
  ids: string[],
) {
  if (!ids.length) return;
  const token = await getFirebaseIdToken();
  if (!token) throw new Error('Sign in required');
  for (const id of ids) {
    const res = await hubAuthFetch(`/api/tasks?id=${encodeURIComponent(id)}`, token, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error(await res.text());
  }
}

export function useEngagementDeletionHandlers({
  tasks,
  opportunities,
  setNotes,
  setTasks,
  deleteCustomer,
  deleteOpportunity,
  deleteOpportunitiesByCustomer,
  getFirebaseIdToken,
  reloadWorkspace,
}: UseEngagementDeletionHandlersParams) {
  const handleDeleteCustomerWithCleanup = useCallback(
    async (customerId: string) => {
      const taskIdsToRemove = engagementTaskIdsForCustomerRemoval(
        tasks,
        opportunities,
        customerId,
      );
      await deleteTasksByIds(getFirebaseIdToken, taskIdsToRemove);
      if (taskIdsToRemove.length) {
        setTasks((prev) => prev.filter((t) => !taskIdsToRemove.includes(t.id)));
      }
      await deleteCustomer(customerId);
      setNotes((prev) => prev.filter((n) => n.customerId !== customerId));
      await deleteOpportunitiesByCustomer(customerId);
      await reloadWorkspace();
    },
    [
      tasks,
      opportunities,
      deleteCustomer,
      deleteOpportunitiesByCustomer,
      setNotes,
      setTasks,
      getFirebaseIdToken,
      reloadWorkspace,
    ],
  );

  const handleDeleteOpportunityWithTasks = useCallback(
    async (opportunityId: string) => {
      const tied = engagementTaskIdsForOpportunityRemoval(tasks, opportunityId);
      await deleteTasksByIds(getFirebaseIdToken, tied);
      if (tied.length) {
        setTasks((prev) => prev.filter((t) => t.opportunityId !== opportunityId));
      }
      await deleteOpportunity(opportunityId);
      await reloadWorkspace();
    },
    [tasks, deleteOpportunity, setTasks, getFirebaseIdToken, reloadWorkspace],
  );

  return { handleDeleteCustomerWithCleanup, handleDeleteOpportunityWithTasks };
}
