import { useCallback } from 'react';
import type { EngagementTask, CreateEngagementTaskData } from '@/types/task';
import { hubAuthFetch } from '@/lib/client/hubAuthFetch';

interface UseTaskOperationsOptions {
  setTasks: (updater: EngagementTask[] | ((prev: EngagementTask[]) => EngagementTask[])) => void;
  userEmail: string;
  getFirebaseIdToken: () => Promise<string | null>;
  reloadWorkspace: () => Promise<void>;
}

export function useTaskOperations({
  setTasks,
  userEmail,
  getFirebaseIdToken,
  reloadWorkspace,
}: UseTaskOperationsOptions) {
  const refresh = useCallback(async () => {
    await reloadWorkspace();
  }, [reloadWorkspace]);

  const saveTask = useCallback(
    async (task: EngagementTask | (Omit<EngagementTask, 'id'> & { id?: string })) => {
      const token = await getFirebaseIdToken();
      if (!token) throw new Error('Sign in required');
      const now = new Date();

      if (task.id) {
        const full: EngagementTask = {
          ...(task as EngagementTask),
          lastActionedAt: now,
          updatedAt: now,
          updatedBy: userEmail,
        };
        const resPut = await hubAuthFetch('/api/tasks', token, {
          method: 'PUT',
          body: JSON.stringify({ task: full }),
        });
        if (!resPut.ok) throw new Error(await resPut.text());
        setTasks((prev) => prev.map((t) => (t.id === full.id ? full : t)));
      } else {
        const post = await hubAuthFetch('/api/tasks', token, {
          method: 'POST',
          body: JSON.stringify({
            task: {
              title: task.title,
              description: task.description,
              categoryIds: task.categoryIds,
              opportunityId: task.opportunityId,
              customerId: task.customerId,
              productIds: task.productIds,
              status: task.status ?? 'todo',
              startDate: task.startDate ?? undefined,
              endDate: task.endDate ?? undefined,
              dueDate: task.dueDate ?? undefined,
              checklist: task.checklist,
              subtasks: task.subtasks,
              links: task.links,
              customerContactIds: task.customerContactIds,
              internalContactIds: task.internalContactIds,
              createdBy: userEmail,
              updatedBy: userEmail,
            },
          }),
        });
        if (!post.ok) throw new Error(await post.text());
        await refresh();
      }
    },
    [refresh, setTasks, userEmail, getFirebaseIdToken],
  );

  const createTask = useCallback(
    async (data: Omit<CreateEngagementTaskData, 'createdBy' | 'updatedBy'>) => {
      const token = await getFirebaseIdToken();
      if (!token) throw new Error('Sign in required');
      const res = await hubAuthFetch('/api/tasks', token, {
        method: 'POST',
        body: JSON.stringify({
          task: { ...data, createdBy: userEmail, updatedBy: userEmail },
        }),
      });
      if (!res.ok) throw new Error(await res.text());
      const body = (await res.json()) as { data: EngagementTask };
      await refresh();
      return body.data;
    },
    [refresh, userEmail, getFirebaseIdToken],
  );

  const deleteTask = useCallback(
    async (id: string) => {
      const token = await getFirebaseIdToken();
      if (!token) throw new Error('Sign in required');
      const res = await hubAuthFetch(`/api/tasks?id=${encodeURIComponent(id)}`, token, { method: 'DELETE' });
      if (!res.ok) throw new Error(await res.text());
      setTasks((prev) => prev.filter((t) => t.id !== id));
      await reloadWorkspace();
    },
    [setTasks, reloadWorkspace, getFirebaseIdToken],
  );

  /** Persist after Kanban drag: only tasks whose status/order changed get lastActionedAt bump */
  const persistKanbanTasks = useCallback(
    async (previous: EngagementTask[], next: EngagementTask[]) => {
      const changedIds = new Set<string>();
      next.forEach((t) => {
        const o = previous.find((x) => x.id === t.id);
        if (!o || o.status !== t.status || o.order !== t.order) changedIds.add(t.id);
      });
      if (changedIds.size === 0) return;
      const token = await getFirebaseIdToken();
      if (!token) throw new Error('Sign in required');
      const now = new Date();
      const merged = next.map((t) =>
        changedIds.has(t.id)
          ? { ...t, lastActionedAt: now, updatedAt: now, updatedBy: userEmail }
          : t,
      );
      const toSave = merged.filter((t) => changedIds.has(t.id));
      const res = await hubAuthFetch('/api/tasks', token, {
        method: 'PATCH',
        body: JSON.stringify({ tasks: toSave }),
      });
      if (!res.ok) throw new Error(await res.text());
      setTasks(merged);
      await reloadWorkspace();
    },
    [setTasks, reloadWorkspace, userEmail, getFirebaseIdToken],
  );

  return { saveTask, createTask, deleteTask, persistKanbanTasks, refreshTasks: refresh };
}
