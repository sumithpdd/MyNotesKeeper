'use client';

import { useEffect, useMemo, useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Plus, Sparkles, Trash2, X, PanelRightOpen } from 'lucide-react';
import type {
  EngagementTask,
  Opportunity,
  Customer,
  TaskCategory,
  Product,
  TaskChecklistItem,
  TaskSubtask,
  CustomerContact,
  InternalContact,
} from '@/types';
import { hubAuthJson } from '@/lib/client/hubAuthFetch';
import { formatProductDisplayName } from '@/lib/productDisplay';
import { FieldHint } from '@/components/ui/FieldHint';
import { normalizeIncomingTaskLinks } from '@/lib/taskLinks';

const checklistRow = z.object({
  id: z.string(),
  label: z.string(),
  done: z.boolean(),
});

const subtaskRow = z.object({
  id: z.string(),
  title: z.string(),
  done: z.boolean(),
});

const linkRow = z.object({
  id: z.string(),
  label: z.string().optional(),
  url: z.string(),
});

const schema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  categoryIds: z.array(z.string()).min(1, 'Pick at least one category'),
  customerId: z.string().optional(),
  opportunityId: z.string().optional(),
  status: z.enum(['todo', 'in_progress', 'done', 'cancelled']),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  productIds: z.array(z.string()),
  customerContactIds: z.array(z.string()),
  internalContactIds: z.array(z.string()),
  checklist: z.array(checklistRow),
  subtasks: z.array(subtaskRow),
  links: z.array(linkRow),
});

export type TaskFormValues = z.infer<typeof schema>;

interface TaskFormDrawerProps {
  open: boolean;
  task?: EngagementTask | null;
  categories: TaskCategory[];
  opportunities: Opportunity[];
  customers: Customer[];
  products: Product[];
  customerContacts: CustomerContact[];
  internalContacts: InternalContact[];
  defaultCustomerId?: string | null;
  defaultOpportunityId?: string | null;
  getFirebaseIdToken?: () => Promise<string | null>;
  onClose: () => void;
  onSave: (values: TaskFormValues & { mode: 'create' | 'edit'; id?: string }) => Promise<void>;
  /** Open Customer Management for the linked account (and opportunity detail when selected). */
  onOpenCustomerWorkspace?: (customerId: string, opportunityId?: string | null) => void;
}

function newId(prefix: string) {
  try {
    if (typeof crypto !== 'undefined' && 'randomUUID' in crypto)
      return (crypto.randomUUID as () => string)();
  } catch {
    /* noop */
  }
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function TaskFormDrawer({
  open,
  task,
  categories,
  opportunities,
  customers,
  products,
  customerContacts,
  internalContacts,
  defaultCustomerId,
  defaultOpportunityId,
  getFirebaseIdToken,
  onClose,
  onSave,
  onOpenCustomerWorkspace,
}: TaskFormDrawerProps) {
  const defaultCat = categories[0]?.id ?? '';
  const [aiBusy, setAiBusy] = useState(false);

  const catsSorted = useMemo(
    () => [...categories].sort((a, b) => a.sortOrder - b.sortOrder),
    [categories],
  );

  const form = useForm<TaskFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: '',
      description: '',
      categoryIds: defaultCat ? [defaultCat] : [],
      customerId: defaultCustomerId || '',
      opportunityId: defaultOpportunityId || '',
      status: 'todo',
      startDate: '',
      endDate: '',
      productIds: [],
      customerContactIds: [],
      internalContactIds: [],
      checklist: [],
      subtasks: [],
      links: [],
    },
  });

  const checklistFA = useFieldArray({ control: form.control, name: 'checklist' });
  const subtasksFA = useFieldArray({ control: form.control, name: 'subtasks' });
  const linksFA = useFieldArray({ control: form.control, name: 'links' });

  useEffect(() => {
    if (!open) return;
    const toIso = (d: Date | undefined | null) =>
      !d ? '' : d instanceof Date ? d.toISOString().slice(0, 10) : new Date(d).toISOString().slice(0, 10);

    if (task) {
      form.reset({
        title: task.title,
        description: task.description ?? '',
        categoryIds:
          task.categoryIds?.length ? [...task.categoryIds] : defaultCat ? [defaultCat] : [],
        customerId: task.customerId ?? '',
        opportunityId: task.opportunityId ?? '',
        status: task.status,
        startDate: toIso(task.startDate ?? task.dueDate ?? null),
        endDate: toIso(task.endDate ?? task.dueDate ?? task.startDate ?? null),
        productIds: [...(task.productIds ?? [])],
        customerContactIds: [...(task.customerContactIds ?? [])],
        internalContactIds: [...(task.internalContactIds ?? [])],
        checklist: task.checklist?.length
          ? task.checklist.map((c) => ({ id: c.id, label: c.label, done: c.done }))
          : [],
        subtasks: task.subtasks?.length
          ? task.subtasks.map((s) => ({ id: s.id, title: s.title, done: s.done }))
          : [],
        links: task.links?.length
          ? task.links.map((l) => ({ id: l.id, label: l.label ?? '', url: l.url }))
          : [],
      });
    } else {
      form.reset({
        title: '',
        description: '',
        categoryIds: defaultCat ? [defaultCat] : [],
        customerId: defaultCustomerId || '',
        opportunityId: defaultOpportunityId || '',
        status: 'todo',
        startDate: '',
        endDate: '',
        productIds: [],
        customerContactIds: [],
        internalContactIds: [],
        checklist: [],
        subtasks: [],
        links: [],
      });
    }
  }, [open, task, defaultCat, defaultCustomerId, defaultOpportunityId, form]);

  const custId = form.watch('customerId');
  const oppIdW = form.watch('opportunityId');
  const productIdsSelected = form.watch('productIds') ?? [];
  const ccSelected = form.watch('customerContactIds') ?? [];
  const icSelected = form.watch('internalContactIds') ?? [];
  const categoryIdsSelected = form.watch('categoryIds') ?? [];
  const oppsFiltered = custId ? opportunities.filter((o) => o.customerId === custId) : opportunities;

  const effectiveAccountId = useMemo(() => {
    const c = String(custId ?? '').trim();
    const o = String(oppIdW ?? '').trim();
    const opp = o ? opportunities.find((x) => x.id === o) : undefined;
    return c || opp?.customerId || '';
  }, [custId, oppIdW, opportunities]);

  const customerContactsForAccount = useMemo(() => {
    if (!effectiveAccountId) return [];
    return customerContacts
      .filter((row) => (row.customerId ?? '') === effectiveAccountId)
      .sort((a, b) => (a.name || '').localeCompare(b.name || ''));
  }, [customerContacts, effectiveAccountId]);

  const internalSorted = useMemo(
    () => [...internalContacts].sort((a, b) => (a.name || '').localeCompare(b.name || '')),
    [internalContacts],
  );

  useEffect(() => {
    if (!open) return;
    if (!effectiveAccountId) {
      const cur = form.getValues('customerContactIds');
      if (cur.length) form.setValue('customerContactIds', [], { shouldDirty: true });
      return;
    }
    const allowed = new Set(customerContactsForAccount.map((x) => x.id));
    const cur = form.getValues('customerContactIds') ?? [];
    const next = cur.filter((id) => allowed.has(id));
    if (next.length !== cur.length) form.setValue('customerContactIds', next, { shouldDirty: true });
  }, [open, effectiveAccountId, customerContactsForAccount, form]);

  const draftWithAi = async () => {
    const title = form.getValues('title').trim();
    if (!title) {
      alert('Enter a title first so AI knows what to plan.');
      return;
    }
    const tokenFn = getFirebaseIdToken;
    if (!tokenFn) {
      alert('Sign in required for AI drafts.');
      return;
    }
    const token = await tokenFn();
    if (!token) {
      alert('Sign in required for AI drafts.');
      return;
    }
    const catIds = form.getValues('categoryIds') ?? [];
    const custIdTrim = String(custId ?? '').trim();
    const categoryName =
      catIds
        .map((id) => categories.find((c) => c.id === id)?.name)
        .filter(Boolean)
        .join(', ') || undefined;
    const customer = custIdTrim ? customers.find((c) => c.id === custIdTrim) : undefined;
    const opp =
      form.getValues('opportunityId')?.trim() ?
        opportunities.find((o) => o.id === form.getValues('opportunityId')?.trim())
      : undefined;
    const customerName =
      customer?.customerName || (opp ? customers.find((x) => x.id === opp.customerId)?.customerName : undefined);

    setAiBusy(true);
    try {
      const json = await hubAuthJson<{
        data: { description: string; checklist: TaskChecklistItem[]; subtasks: TaskSubtask[] };
      }>('/api/tasks/ai-draft', token, {
        method: 'POST',
        body: JSON.stringify({
          title,
          categoryName,
          customerName,
          opportunityName: opp?.opportunityName || undefined,
        }),
      });
      form.setValue('description', json.data.description, {
        shouldDirty: true,
        shouldValidate: true,
      });
      form.setValue('checklist', json.data.checklist, { shouldDirty: true });
      form.setValue('subtasks', json.data.subtasks, { shouldDirty: true });
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      alert(msg.length < 280 ? msg : `${msg.slice(0, 240)}…`);
    } finally {
      setAiBusy(false);
    }
  };

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-[60]" onClick={onClose} aria-hidden />
      <div className="fixed inset-y-0 right-0 w-full max-w-full sm:max-w-2xl lg:max-w-4xl xl:max-w-[min(56rem,calc(100vw-2rem))] bg-white shadow-2xl z-[70] flex flex-col overflow-hidden border-l border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center shrink-0">
          <h2 className="text-lg font-semibold text-gray-900">{task ? 'Edit task' : 'New task'}</h2>
          <button type="button" onClick={onClose} className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg">
            <X className="h-5 w-5" />
          </button>
        </div>
        <form
          className="flex-1 flex flex-col min-h-0"
          onSubmit={form.handleSubmit(async (values) => {
            const linksNorm = normalizeIncomingTaskLinks(values.links ?? []);
            await onSave({
              ...values,
              checklist:
                values.checklist
                  ?.filter((c) => c.label.trim())
                  .map((c) => ({ id: c.id, label: c.label.trim(), done: c.done })) ?? [],
              subtasks:
                values.subtasks
                  ?.filter((s) => s.title.trim())
                  .map((s) => ({ id: s.id, title: s.title.trim(), done: s.done })) ?? [],
              links:
                linksNorm.length ?
                  linksNorm.map((l) => ({
                    id: l.id,
                    url: l.url,
                    ...(l.label ? { label: l.label } : {}),
                  }))
                : [],
              mode: task ? 'edit' : 'create',
              id: task?.id,
            });
            onClose();
          })}
        >
          <div className="flex-1 overflow-y-auto min-h-0">
            <div className="p-6 pb-8 xl:grid xl:grid-cols-2 xl:gap-x-10 xl:items-start space-y-6 xl:space-y-0">
              <div className="space-y-5 min-w-0">
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title
                <FieldHint text="Short, action-oriented name — what you will do or deliver (e.g. “BUPA AI demo dry run”). Appears on the board and calendar." />
              </label>
              <input {...form.register('title')} className="input-field w-full" placeholder="e.g. Demo prep — Bupa" />
              {form.formState.errors.title && (
                <p className="text-red-600 text-xs mt-1">{form.formState.errors.title.message}</p>
              )}
            </div>
            <button
              type="button"
              disabled={aiBusy || !getFirebaseIdToken}
              title={getFirebaseIdToken ? 'Draft description, checklist, and subtasks' : undefined}
              onClick={() => void draftWithAi()}
              className="self-end shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl border border-violet-200 bg-violet-50 text-violet-800 text-xs font-semibold hover:bg-violet-100 disabled:opacity-45"
            >
              {aiBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              AI draft
            </button>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
              <FieldHint text="Context, attendees, links — optional but useful for handoffs and Hub AI." />
            </label>
            <textarea
              {...form.register('description')}
              className="textarea-field w-full min-h-[156px]"
              rows={8}
              placeholder="Details…"
            />
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-700">
                Links
                <FieldHint text="Loops, Salesforce, SharePoint decks, recordings — shown on the task card so you can open them without digging in the description." />
              </label>
              <button
                type="button"
                onClick={() => linksFA.append({ id: newId('lnk'), label: '', url: '' })}
                className="inline-flex items-center gap-1 text-xs font-semibold text-violet-700 hover:text-violet-900"
              >
                <Plus className="h-4 w-4" />
                Add link
              </button>
            </div>
            <div className="space-y-2 rounded-lg border border-gray-200 p-3 bg-gray-50/70 max-h-56 overflow-y-auto">
              {linksFA.fields.length === 0 ? (
                <p className="text-xs text-gray-500">Optional URLs — paste a full link or hostname (https:// added if missing).</p>
              ) : (
                linksFA.fields.map((field, idx) => (
                  <div key={field.id} className="flex flex-col sm:flex-row gap-2 items-stretch">
                    <input
                      {...form.register(`links.${idx}.label`)}
                      className="input-field flex-1 text-sm py-2 min-w-0 sm:max-w-[40%]"
                      placeholder="Label (optional)"
                      aria-label="Link label"
                    />
                    <div className="flex flex-1 gap-1 min-w-0">
                      <input
                        {...form.register(`links.${idx}.url`)}
                        className="input-field flex-1 text-sm py-2 min-w-0"
                        placeholder="https://…"
                        aria-label="URL"
                      />
                      <button
                        type="button"
                        aria-label="Remove link"
                        onClick={() => linksFA.remove(idx)}
                        className="p-2 text-gray-400 hover:text-red-600 shrink-0"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start (plan)
                <FieldHint text="First day this work blocks on your calendar. Leave blank for backlogs with no fixed start." />
              </label>
              <input type="date" {...form.register('startDate')} className="input-field w-full" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End (plan)
                <FieldHint text="Last planning day. If you set only one date, start and end align to that day." />
              </label>
              <input type="date" {...form.register('endDate')} className="input-field w-full" />
            </div>
          </div>
          <p className="text-xs text-gray-500 -mt-1">For a single day, pick the same date in both fields, or leave one empty.</p>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-700">Checklist</label>
              <button
                type="button"
                onClick={() => checklistFA.append({ id: newId('c'), label: '', done: false })}
                className="inline-flex items-center gap-1 text-xs font-semibold text-violet-700 hover:text-violet-900"
              >
                <Plus className="h-4 w-4" />
                Row
              </button>
            </div>
            <div className="space-y-2 rounded-lg border border-gray-200 p-3 bg-gray-50/70 max-h-64 overflow-y-auto">
              {checklistFA.fields.length === 0 ? (
                <p className="text-xs text-gray-500">Optional items to verify before you close out the task.</p>
              ) : (
                checklistFA.fields.map((field, idx) => (
                  <div key={field.id} className="flex gap-2 items-start">
                    <label className="shrink-0 pt-2.5 cursor-pointer">
                      <input type="checkbox" {...form.register(`checklist.${idx}.done`)} className="rounded border-gray-300" />
                      <span className="sr-only">Done</span>
                    </label>
                    <input
                      {...form.register(`checklist.${idx}.label`)}
                      className="input-field flex-1 text-sm py-2"
                      placeholder="Checklist item…"
                    />
                    <button
                      type="button"
                      aria-label="Remove checklist row"
                      onClick={() => checklistFA.remove(idx)}
                      className="p-2 text-gray-400 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-700">Subtasks</label>
              <button
                type="button"
                onClick={() => subtasksFA.append({ id: newId('s'), title: '', done: false })}
                className="inline-flex items-center gap-1 text-xs font-semibold text-violet-700 hover:text-violet-900"
              >
                <Plus className="h-4 w-4" />
                Row
              </button>
            </div>
            <div className="space-y-2 rounded-lg border border-gray-200 p-3 bg-gray-50/70 max-h-64 overflow-y-auto">
              {subtasksFA.fields.length === 0 ? (
                <p className="text-xs text-gray-500">Optional actionable steps tracked under this task.</p>
              ) : (
                subtasksFA.fields.map((field, idx) => (
                  <div key={field.id} className="flex gap-2 items-start">
                    <label className="shrink-0 pt-2.5 cursor-pointer">
                      <input type="checkbox" {...form.register(`subtasks.${idx}.done`)} className="rounded border-gray-300" />
                      <span className="sr-only">Done</span>
                    </label>
                    <input
                      {...form.register(`subtasks.${idx}.title`)}
                      className="input-field flex-1 text-sm py-2"
                      placeholder="Subtask…"
                    />
                    <button
                      type="button"
                      aria-label="Remove subtask row"
                      onClick={() => subtasksFA.remove(idx)}
                      className="p-2 text-gray-400 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

              </div>

              <div className="space-y-5 min-w-0 xl:border-l xl:border-gray-100 xl:pl-8">

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Categories
              <FieldHint text="One or more task types (e.g. Standard Demo, Workshop). Drives filters and colour badges; at least one required." />
            </label>
            <p className="text-xs text-gray-500 mb-2">Pick one or more task types.</p>
            <div className="max-h-52 overflow-y-auto rounded-lg border border-gray-200 divide-y divide-gray-100 bg-gray-50/50">
              {catsSorted.length === 0 ? (
                <p className="text-xs text-gray-500 p-3">Add categories using &quot;Add category&quot; on the Tasks board.</p>
              ) : (
                catsSorted.map((c) => {
                  const checked = categoryIdsSelected.includes(c.id);
                  return (
                    <label
                      key={c.id}
                      className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => {
                          const next = new Set(categoryIdsSelected);
                          if (checked) next.delete(c.id);
                          else next.add(c.id);
                          let arr = [...next];
                          if (arr.length === 0 && defaultCat) arr = [defaultCat];
                          form.setValue('categoryIds', arr, { shouldDirty: true, shouldValidate: true });
                        }}
                      />
                      <span className="text-gray-800 min-w-0 flex items-center gap-2">
                        {c.color ? (
                          <span
                            className={`shrink-0 inline-block px-2 py-0.5 rounded text-[11px] font-semibold ${c.color}`}
                          >
                            {c.name}
                          </span>
                        ) : (
                          <span className="font-medium">{c.name}</span>
                        )}
                      </span>
                    </label>
                  );
                })
              )}
            </div>
            {form.formState.errors.categoryIds ? (
              <p className="mt-1 text-sm text-red-600">{String(form.formState.errors.categoryIds.message)}</p>
            ) : null}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Account (optional)
              <FieldHint text="Links the task to a customer so it appears in Customer Management activity. If you pick an opportunity, the account is filled automatically when you save." />
            </label>
            <select {...form.register('customerId')} className="select-field w-full">
              <option value="">— Not linked —</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.customerName}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Opportunity (optional)
              <FieldHint text="Associate work with a specific deal. Also sets the account unless you override it. Helps with opportunity-centric prep and reviews." />
            </label>
            <select {...form.register('opportunityId')} className="select-field w-full">
              <option value="">— Not linked —</option>
              {oppsFiltered.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.opportunityName}
                </option>
              ))}
            </select>
          </div>
          {onOpenCustomerWorkspace && effectiveAccountId ? (
            <div className="rounded-xl border border-violet-200/80 bg-gradient-to-r from-violet-50/90 to-white px-4 py-3">
              <p className="text-xs text-slate-600 mb-2">
                Jump to <strong className="text-slate-800">Customer Management</strong> to edit the account, notes, and
                deals.
              </p>
              <button
                type="button"
                onClick={() => {
                  const o = String(oppIdW ?? '').trim();
                  onOpenCustomerWorkspace(effectiveAccountId, o || null);
                }}
                className="inline-flex items-center gap-2 w-full justify-center sm:w-auto px-4 py-2.5 rounded-xl text-sm font-bold text-violet-950 bg-white border border-violet-200 shadow-sm hover:bg-violet-50"
              >
                <PanelRightOpen className="h-4 w-4 text-violet-700 shrink-0" aria-hidden strokeWidth={2} />
                Open account
                {oppIdW?.trim() ? ' & opportunity' : ''}
              </button>
            </div>
          ) : null}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
              <FieldHint text="Kanban column: To do, In progress, Done, or Cancelled. “Last actioned” updates when you edit the task." />
            </label>
            <select {...form.register('status')} className="select-field w-full">
              <option value="todo">Not started</option>
              <option value="in_progress">In progress</option>
              <option value="done">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Customer contacts (optional)</label>
            <p className="text-xs text-gray-500 mb-2">
              {effectiveAccountId
                ? 'People at the linked account. Add more under Customer Management → contacts.'
                : 'Link an account or opportunity first to pick customer-side contacts.'}
            </p>
            <div className="max-h-48 overflow-y-auto rounded-lg border border-gray-200 divide-y divide-gray-100 bg-gray-50/50">
              {customerContactsForAccount.length === 0 ? (
                <p className="text-xs text-gray-500 p-3">No customer contacts for this account in the catalogue.</p>
              ) : (
                customerContactsForAccount.map((row) => {
                  const checked = ccSelected.includes(row.id);
                  return (
                    <label
                      key={row.id}
                      className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => {
                          const next = new Set(ccSelected);
                          if (checked) next.delete(row.id);
                          else next.add(row.id);
                          form.setValue('customerContactIds', [...next], { shouldDirty: true, shouldValidate: true });
                        }}
                      />
                      <span className="text-gray-800 min-w-0">
                        <span className="font-medium">{row.name}</span>
                        {row.role ? <span className="text-gray-500"> — {row.role}</span> : null}
                        {row.email ? <span className="block text-xs text-gray-500 truncate">{row.email}</span> : null}
                      </span>
                    </label>
                  );
                })
              )}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Internal contacts (optional)</label>
            <p className="text-xs text-gray-500 mb-2">Team / Sitecore contacts from Entity Management.</p>
            <div className="max-h-48 overflow-y-auto rounded-lg border border-gray-200 divide-y divide-gray-100 bg-gray-50/50">
              {internalSorted.length === 0 ? (
                <p className="text-xs text-gray-500 p-3">Add internal contacts under Entity Management.</p>
              ) : (
                internalSorted.map((row) => {
                  const checked = icSelected.includes(row.id);
                  return (
                    <label
                      key={row.id}
                      className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => {
                          const next = new Set(icSelected);
                          if (checked) next.delete(row.id);
                          else next.add(row.id);
                          form.setValue('internalContactIds', [...next], { shouldDirty: true, shouldValidate: true });
                        }}
                      />
                      <span className="text-gray-800 min-w-0">
                        <span className="font-medium">{row.name}</span>
                        {row.role ? <span className="text-gray-500"> — {row.role}</span> : null}
                      </span>
                    </label>
                  );
                })
              )}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Products (optional)
              <FieldHint text="Tags from the product catalogue — used in filters and connects to entity-level product reference counts." />
            </label>
            <div className="max-h-52 overflow-y-auto rounded-lg border border-gray-200 divide-y divide-gray-100 bg-gray-50/50">
              {products.length === 0 ? (
                <p className="text-xs text-gray-500 p-3">Add products under Entity Management first.</p>
              ) : (
                [...products]
                  .sort((a, b) =>
                    formatProductDisplayName(a).localeCompare(formatProductDisplayName(b))
                  )
                  .map((p) => {
                    const checked = productIdsSelected.includes(p.id);
                    return (
                      <label
                        key={p.id}
                        className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => {
                            const next = new Set(productIdsSelected);
                            if (checked) next.delete(p.id);
                            else next.add(p.id);
                            form.setValue('productIds', [...next], { shouldDirty: true, shouldValidate: true });
                          }}
                        />
                        <span className="text-gray-800">{formatProductDisplayName(p)}</span>
                      </label>
                    );
                  })
              )}
            </div>
          </div>

              </div>
            </div>
          </div>

          <div className="shrink-0 border-t border-gray-200 bg-gray-50/95 backdrop-blur-sm px-6 py-4 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-white"
            >
              Cancel
            </button>
            <button type="submit" className="flex-1 py-3 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700">
              {task ? 'Save' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
