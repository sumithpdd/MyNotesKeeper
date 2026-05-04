'use client';

import { useMemo, useState } from 'react';
import { Pencil, Trash2, Tags, AlertTriangle } from 'lucide-react';
import type { EngagementTask, TaskCategory } from '@/types';
import { hubAuthJson } from '@/lib/client/hubAuthFetch';

interface TaskCategoriesManagerProps {
  taskCategories: TaskCategory[];
  tasks: EngagementTask[];
  getFirebaseIdToken: () => Promise<string | null>;
  reloadWorkspace: () => Promise<void>;
}

export function TaskCategoriesManager({
  taskCategories,
  tasks,
  getFirebaseIdToken,
  reloadWorkspace,
}: TaskCategoriesManagerProps) {
  const [newCatName, setNewCatName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [busyId, setBusyId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<TaskCategory | null>(null);
  const [mergeIntoId, setMergeIntoId] = useState('');

  const countById = useMemo(() => {
    const m = new Map<string, number>();
    for (const c of taskCategories) m.set(c.id, 0);
    for (const t of tasks) {
      for (const id of t.categoryIds ?? []) {
        m.set(id, (m.get(id) ?? 0) + 1);
      }
    }
    return m;
  }, [tasks, taskCategories]);

  const addCategory = async () => {
    const name = newCatName.trim();
    if (!name) return;
    setBusyId('__add');
    try {
      const token = await getFirebaseIdToken();
      if (!token) throw new Error('Not signed in');
      await hubAuthJson<{ success: boolean }>('/api/task-categories', token, {
        method: 'POST',
        body: JSON.stringify({ name }),
      });
      setNewCatName('');
      await reloadWorkspace();
    } catch (e) {
      console.error('addCategory', e);
    } finally {
      setBusyId(null);
    }
  };

  const startEdit = (c: TaskCategory) => {
    setEditingId(c.id);
    setEditName(c.name);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditName('');
  };

  const saveEdit = async () => {
    if (!editingId) return;
    const name = editName.trim();
    if (!name) return;
    setBusyId(editingId);
    try {
      const token = await getFirebaseIdToken();
      if (!token) throw new Error('Not signed in');
      const path = `/api/task-categories/${editingId}` as `/api/${string}`;
      await hubAuthJson<{ success: boolean }>(path, token, {
        method: 'PATCH',
        body: JSON.stringify({ name }),
      });
      cancelEdit();
      await reloadWorkspace();
    } catch (e) {
      console.error('saveEdit category', e);
    } finally {
      setBusyId(null);
    }
  };

  const openDelete = (c: TaskCategory) => {
    setDeleteTarget(c);
    const others = taskCategories.filter((x) => x.id !== c.id);
    setMergeIntoId(others[0]?.id ?? '');
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    const fromId = deleteTarget.id;
    const useCount = countById.get(fromId) ?? 0;
    if (useCount > 0 && !mergeIntoId) return;
    if (useCount > 0 && mergeIntoId === fromId) return;

    setBusyId(fromId);
    try {
      const token = await getFirebaseIdToken();
      if (!token) throw new Error('Not signed in');
      const path = `/api/task-categories/${fromId}` as `/api/${string}`;
      const body =
        useCount > 0 && mergeIntoId ? JSON.stringify({ mergeIntoCategoryId: mergeIntoId }) : undefined;
      await hubAuthJson<{ success: boolean }>(path, token, {
        method: 'DELETE',
        ...(body != null ? { body } : {}),
      });
      setDeleteTarget(null);
      await reloadWorkspace();
    } catch (e) {
      console.error('delete category', e);
    } finally {
      setBusyId(null);
    }
  };

  const deleteOptions = taskCategories.filter((c) => c.id !== deleteTarget?.id);

  return (
    <div className="rounded-2xl border border-slate-200/90 bg-white/95 shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-100 bg-gradient-to-r from-slate-50/90 to-white">
        <div className="flex items-start gap-3">
          <Tags className="h-5 w-5 text-violet-600 shrink-0 mt-0.5" aria-hidden />
          <div className="min-w-0">
            <h2 className="text-base font-bold text-gray-900">Task types (categories)</h2>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              Rename or merge duplicates so filters and the task form stay clean. Deleting a type that is still used on
              tasks requires choosing another type to merge into — task links are updated automatically.
            </p>
            <p className="text-xs text-slate-500 mt-2">
              Bulk merge in Firestore:{' '}
              <code className="text-violet-800 bg-violet-50 px-1 rounded">
                node scripts/deduplicateTaskCategories.js
              </code>{' '}
              (dry run) then{' '}
              <code className="text-violet-800 bg-violet-50 px-1 rounded">APPLY=1 node scripts/deduplicateTaskCategories.js</code>.
            </p>
          </div>
        </div>
      </div>

      <div className="p-5 space-y-4">
        <div className="flex flex-wrap items-end gap-2">
          <label className="flex-1 min-w-[200px]">
            <span className="sr-only">New category name</span>
            <input
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              placeholder="Add a new task type…"
              className="input-field w-full"
              onKeyDown={(e) => e.key === 'Enter' && void addCategory()}
              disabled={busyId === '__add'}
            />
          </label>
          <button
            type="button"
            onClick={() => void addCategory()}
            disabled={!newCatName.trim() || busyId === '__add'}
            className="px-4 py-2.5 bg-gray-900 text-white rounded-xl text-sm font-semibold disabled:opacity-50"
          >
            Add
          </button>
        </div>

        <ul className="divide-y divide-slate-100 rounded-xl border border-slate-200/90">
          {taskCategories.map((c) => {
            const n = countById.get(c.id) ?? 0;
            const isEditing = editingId === c.id;
            return (
              <li
                key={c.id}
                className="flex flex-col sm:flex-row sm:items-center gap-2 py-3 px-3 first:rounded-t-xl last:rounded-b-xl hover:bg-slate-50/80"
              >
                {isEditing ? (
                  <div className="flex flex-wrap items-center gap-2 flex-1 min-w-0">
                    <input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="input-field flex-1 min-w-[140px]"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') void saveEdit();
                        if (e.key === 'Escape') cancelEdit();
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => void saveEdit()}
                      disabled={!editName.trim() || busyId === c.id}
                      className="text-sm font-semibold text-violet-800 hover:text-violet-950 px-2 py-1"
                    >
                      Save
                    </button>
                    <button type="button" onClick={cancelEdit} className="text-sm text-slate-600 px-2 py-1">
                      Cancel
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      {c.color ? (
                        <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${c.color}`}>
                          {c.name}
                        </span>
                      ) : (
                        <span className="font-medium text-gray-900 truncate">{c.name}</span>
                      )}
                      <span className="text-xs text-slate-500 shrink-0 tabular-nums">
                        {n} task{n === 1 ? '' : 's'}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => startEdit(c)}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm font-medium text-slate-700 hover:bg-white border border-transparent hover:border-slate-200"
                        aria-label={`Rename ${c.name}`}
                      >
                        <Pencil className="h-3.5 w-3.5" aria-hidden />
                        Rename
                      </button>
                      <button
                        type="button"
                        onClick={() => openDelete(c)}
                        disabled={taskCategories.length < 2}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm font-medium text-red-700 hover:bg-red-50 border border-transparent hover:border-red-100 disabled:opacity-40"
                        title={taskCategories.length < 2 ? 'Keep at least one category' : undefined}
                        aria-label={`Delete ${c.name}`}
                      >
                        <Trash2 className="h-3.5 w-3.5" aria-hidden />
                        Delete
                      </button>
                    </div>
                  </>
                )}
              </li>
            );
          })}
        </ul>

        {taskCategories.length < 2 ? (
          <p className="text-xs text-amber-800 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
            You need at least one task type. Add another before removing the last one.
          </p>
        ) : null}
      </div>

      {deleteTarget ? (
        <div
          className="border-t border-slate-200 bg-slate-50/90 px-5 py-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="del-cat-title"
        >
          <div className="flex gap-2 items-start max-w-lg">
            <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" aria-hidden />
            <div className="min-w-0 space-y-3">
              <p id="del-cat-title" className="text-sm font-semibold text-gray-900">
                Delete “{deleteTarget.name}”?
              </p>
              <p className="text-xs text-slate-600">
                {(countById.get(deleteTarget.id) ?? 0) > 0 ?
                  `${countById.get(deleteTarget.id)} task(s) use this type. Pick another type to merge into; those tasks will be updated.`
                : 'No tasks use this type — it will be removed.'}
              </p>
              {(countById.get(deleteTarget.id) ?? 0) > 0 ?
                <label className="block text-xs font-medium text-slate-700">
                  Merge into
                  <select
                    className="select-field w-full mt-1"
                    value={mergeIntoId}
                    onChange={(e) => setMergeIntoId(e.target.value)}
                  >
                    <option value="">Select…</option>
                    {deleteOptions.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </label>
              : null}
              <div className="flex flex-wrap gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => void confirmDelete()}
                  disabled={
                    busyId === deleteTarget.id || ((countById.get(deleteTarget.id) ?? 0) > 0 && !mergeIntoId)
                  }
                  className="px-4 py-2 rounded-xl text-sm font-semibold bg-red-700 text-white hover:bg-red-800 disabled:opacity-50"
                >
                  {(countById.get(deleteTarget.id) ?? 0) > 0 ? 'Merge & delete' : 'Delete'}
                </button>
                <button
                  type="button"
                  onClick={() => setDeleteTarget(null)}
                  disabled={busyId === deleteTarget.id}
                  className="px-4 py-2 rounded-xl text-sm font-medium border border-slate-200 bg-white text-slate-800 hover:bg-slate-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
