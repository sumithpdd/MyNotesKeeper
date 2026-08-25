'use client';

import { useEffect, useMemo, useState } from 'react';
import { LayoutGrid, Calendar as CalendarIcon, Plus, Tags, ClipboardList, FilterX, Sparkles, Target } from 'lucide-react';
import { format, parse } from 'date-fns';
import type {
  EngagementTask,
  Opportunity,
  Customer,
  TaskCategory,
  CreateEngagementTaskData,
  Product,
  TaskKanbanStatus,
  CustomerContact,
  InternalContact,
  TaskPlanningPillar,
} from '@/types';
import { TaskKanbanBoard } from './TaskKanbanBoard';
import { TaskCategoriesManager } from './TaskCategoriesManager';
import { TaskSidebarCalendar } from './TaskSidebarCalendar';
import { TaskCalendarView } from './TaskCalendarView';
import { TaskFormDrawer, type TaskFormValues } from './TaskFormDrawer';
import { TaskFiltersBar } from './TaskFiltersBar';
import { AccountPlanningTaskTimeline, PlanningPillarLegend } from '@/components/planning/AccountPlanningTaskTimeline';
import {
  filterTasksByPlanningPillar,
  resolveTaskPlanningPillar,
  type AccountPlanningPillarId,
} from '@/domain/engagement-hub/accountPlanningPillars';
import { taskTouchesCalendarDay } from '@/lib/taskPlanningRange';
import { formatProductDisplayName } from '@/lib/productDisplay';

interface TasksManagementProps {
  tasks: EngagementTask[];
  taskCategories: TaskCategory[];
  opportunities: Opportunity[];
  customers: Customer[];
  products: Product[];
  customerContacts: CustomerContact[];
  internalContacts: InternalContact[];
  currentUserEmail: string;
  persistKanbanTasks: (previous: EngagementTask[], next: EngagementTask[]) => Promise<void>;
  createTask: (
    data: Omit<CreateEngagementTaskData, 'createdBy' | 'updatedBy'>,
  ) => Promise<EngagementTask>;
  saveTask: (task: EngagementTask) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  /** Opens the hub AI assistant (optional). */
  onOpenAssistant?: () => void;
  getFirebaseIdToken: () => Promise<string | null>;
  /** Reload workspace after managing shared task category definitions. */
  reloadWorkspace: () => Promise<void>;
  /** Jump to Customer Management for this account; optional opportunity opens its detail drawer. */
  onOpenCustomerWorkspace?: (customerId: string, opportunityId?: string | null) => void;
  /** Deep-link from account planning (customer + optional pillar filter). */
  planningFocus?: { customerId?: string; pillar?: AccountPlanningPillarId } | null;
  onPlanningFocusConsumed?: () => void;
  /** Open create drawer with account planning defaults. */
  pendingPlanningTask?: { customerId: string; pillarId: AccountPlanningPillarId } | null;
  onPendingPlanningTaskConsumed?: () => void;
}

export function TasksManagement({
  tasks,
  taskCategories,
  opportunities,
  customers,
  products,
  customerContacts,
  internalContacts,
  currentUserEmail,
  persistKanbanTasks,
  createTask,
  saveTask,
  deleteTask,
  onOpenAssistant,
  getFirebaseIdToken,
  reloadWorkspace,
  onOpenCustomerWorkspace,
  planningFocus,
  onPlanningFocusConsumed,
  pendingPlanningTask,
  onPendingPlanningTaskConsumed,
}: TasksManagementProps) {
  const [view, setView] = useState<'kanban' | 'calendar' | 'planning'>('kanban');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<EngagementTask | null>(null);
  const [manageCategoriesOpen, setManageCategoriesOpen] = useState(false);

  const [filterStatus, setFilterStatus] = useState<TaskKanbanStatus | ''>('');
  const [filterCategoryId, setFilterCategoryId] = useState('');
  const [filterCustomerId, setFilterCustomerId] = useState('');
  const [filterProductId, setFilterProductId] = useState('');
  const [filterPlanningPillar, setFilterPlanningPillar] = useState<TaskPlanningPillar | ''>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sidebarCalendarDate, setSidebarCalendarDate] = useState<Date | null>(null);
  const [drawerDefaults, setDrawerDefaults] = useState<{
    customerId?: string;
    pillar?: AccountPlanningPillarId;
  }>({});

  useEffect(() => {
    if (!planningFocus) return;
    if (planningFocus.customerId) setFilterCustomerId(planningFocus.customerId);
    if (planningFocus.pillar) {
      setFilterPlanningPillar(planningFocus.pillar);
      setView('planning');
    } else {
      setView('planning');
    }
    onPlanningFocusConsumed?.();
  }, [planningFocus, onPlanningFocusConsumed]);

  useEffect(() => {
    if (!pendingPlanningTask) return;
    setDrawerDefaults({
      customerId: pendingPlanningTask.customerId,
      pillar: pendingPlanningTask.pillarId,
    });
    setEditingTask(null);
    setDrawerOpen(true);
    onPendingPlanningTaskConsumed?.();
  }, [pendingPlanningTask, onPendingPlanningTaskConsumed]);

  const filteredTasks = useMemo(() => {
    const qnorm = searchQuery.trim().toLowerCase();
    return tasks.filter((t) => {
      if (filterStatus && t.status !== filterStatus) return false;
      if (filterCategoryId && !(t.categoryIds ?? []).includes(filterCategoryId)) return false;
      if (filterCustomerId && t.customerId !== filterCustomerId) return false;
      if (filterProductId && !(t.productIds ?? []).includes(filterProductId)) return false;
      if (!qnorm) return true;
      const title = (t.title || '').toLowerCase();
      const desc = (t.description || '').toLowerCase();
      if (title.includes(qnorm) || desc.includes(qnorm)) return true;
      const catNames = (t.categoryIds ?? [])
        .map((id) => taskCategories.find((c) => c.id === id)?.name)
        .filter(Boolean) as string[];
      if (catNames.some((n) => n.toLowerCase().includes(qnorm))) return true;
      const opp = t.opportunityId ? opportunities.find((o) => o.id === t.opportunityId) : undefined;
      const cust =
        t.customerId != null
          ? customers.find((c) => c.id === t.customerId)
          : opp
            ? customers.find((c) => c.id === opp.customerId)
            : null;
      if ((cust?.customerName || '').toLowerCase().includes(qnorm)) return true;
      if (opp?.opportunityName?.toLowerCase().includes(qnorm)) return true;
      for (const pid of t.productIds ?? []) {
        const p = products.find((x) => x.id === pid);
        if (p && formatProductDisplayName(p).toLowerCase().includes(qnorm)) return true;
      }
      return false;
    });
  }, [
    tasks,
    searchQuery,
    filterStatus,
    filterCategoryId,
    filterCustomerId,
    filterProductId,
    taskCategories,
    opportunities,
    customers,
    products,
  ]);

  const displayTasks = useMemo(() => {
    if (filterPlanningPillar) {
      return filterTasksByPlanningPillar(filteredTasks, taskCategories, filterPlanningPillar);
    }
    if (view === 'planning') {
      return filteredTasks.filter((t) => resolveTaskPlanningPillar(t, taskCategories) != null);
    }
    return filteredTasks;
  }, [filteredTasks, taskCategories, filterPlanningPillar, view]);

  const sidebarCalendarDayKey = sidebarCalendarDate ? format(sidebarCalendarDate, 'yyyy-MM-dd') : null;

  const sidebarDayMatchesAnyTask = useMemo(() => {
    if (!sidebarCalendarDayKey) return true;
    const day = parse(sidebarCalendarDayKey, 'yyyy-MM-dd', new Date());
    return filteredTasks.some((t) => taskTouchesCalendarDay(t, day));
  }, [filteredTasks, sidebarCalendarDayKey]);

  const hasActiveFilters =
    Boolean(searchQuery.trim()) ||
    Boolean(filterStatus) ||
    Boolean(filterCategoryId) ||
    Boolean(filterCustomerId) ||
    Boolean(filterProductId) ||
    Boolean(filterPlanningPillar) ||
    Boolean(sidebarCalendarDate);

  const clearFilters = () => {
    setSearchQuery('');
    setFilterStatus('');
    setFilterCategoryId('');
    setFilterCustomerId('');
    setFilterProductId('');
    setFilterPlanningPillar('');
    setSidebarCalendarDate(null);
  };

  const handleSaveForm = async (values: TaskFormValues & { mode: 'create' | 'edit'; id?: string }) => {
    const opp =
      values.opportunityId ?
        opportunities.find((o) => o.id === values.opportunityId)
      : undefined;
    let customerId = values.customerId?.trim() || null;
    if (!customerId && opp) customerId = opp.customerId;

    const parseYmd = (s?: string) => {
      const t = s?.trim();
      if (!t) return null;
      const d = parse(t, 'yyyy-MM-dd', new Date());
      return Number.isNaN(d.getTime()) ? null : d;
    };
    let startDate = parseYmd(values.startDate);
    let endDate = parseYmd(values.endDate);
    if (startDate && !endDate) endDate = startDate;
    if (endDate && !startDate) startDate = endDate;
    const dueDate = endDate ?? startDate ?? null;

    const productIds = values.productIds && values.productIds.length > 0 ? [...values.productIds] : undefined;
    const customerContactIds =
      values.customerContactIds && values.customerContactIds.length > 0 ? [...values.customerContactIds] : undefined;
    const internalContactIds =
      values.internalContactIds && values.internalContactIds.length > 0 ? [...values.internalContactIds] : undefined;
    const checklist = values.checklist?.length ? values.checklist : undefined;
    const subtasks = values.subtasks?.length ? values.subtasks : undefined;
    const links = values.links?.length ? values.links : undefined;

    if (values.mode === 'create') {
      await createTask({
        title: values.title,
        description: values.description || undefined,
        categoryIds: values.categoryIds,
        opportunityId: values.opportunityId?.trim() || null,
        customerId,
        productIds,
        status: values.status,
        startDate: startDate ?? undefined,
        endDate: endDate ?? undefined,
        dueDate: dueDate ?? undefined,
        checklist,
        subtasks,
        links,
        customerContactIds,
        internalContactIds,
        planningPillar: values.planningPillar || null,
      });
    } else if (values.id) {
      const existing = tasks.find((t) => t.id === values.id);
      if (!existing) return;
      const updated: EngagementTask = {
        ...existing,
        title: values.title,
        description: values.description,
        categoryIds: values.categoryIds,
        opportunityId: values.opportunityId?.trim() || null,
        customerId,
        productIds,
        status: values.status,
        startDate: startDate ?? null,
        endDate: endDate ?? null,
        dueDate: dueDate ?? null,
        checklist,
        subtasks,
        links,
        customerContactIds,
        internalContactIds,
        planningPillar: values.planningPillar || null,
        lastActionedAt: new Date(),
        updatedAt: new Date(),
        updatedBy: currentUserEmail,
      };
      await saveTask(updated);
    }
  };

  return (
    <div className="space-y-7">
      <div
        role="note"
        className="rounded-2xl border border-violet-200/90 bg-gradient-to-r from-violet-50 via-white to-indigo-50 px-5 py-4 text-sm text-slate-700 shadow-sm"
      >
        <p className="font-semibold text-violet-950 flex items-center gap-2 mb-1">
          <ClipboardList className="h-4 w-4 text-violet-600 shrink-0" aria-hidden />
          Tasks come first in this hub
        </p>
        <p className="leading-relaxed">
          Capture demos, prep, and follow-ups here. Link an <strong>account</strong> and optionally an <strong>opportunity</strong> so work shows up when you review the customer. Planning dates drive the calendar; status drives the Kanban columns.
          Use filters to focus on one account or product — or open Hub AI when you want help drafting titles.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
        <div className="min-w-0">
          <h1 className="text-3xl font-extrabold text-gray-950 tracking-tight">Tasks board</h1>
          <p className="text-slate-500 mt-2 max-w-xl text-[0.95rem] leading-relaxed font-medium">
            Organise work like a runway — demos, AE support, and renewals stay visible. Link accounts so activity surfaces on
            the customer record.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3 shrink-0">
          <div
            className="inline-flex rounded-full border border-black/[0.06] bg-slate-200/55 p-1.5 shadow-[inset_0_2px_6px_-2px_rgba(15,23,42,0.12)] backdrop-blur-sm"
            role="group"
            aria-label="Tasks view mode"
          >
            <button
              type="button"
              onClick={() => setView('kanban')}
              aria-pressed={view === 'kanban'}
              className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 ${
                view === 'kanban'
                  ? 'bg-white text-violet-950 shadow-[0_2px_14px_-5px_rgba(147,129,255,0.55)] ring-1 ring-[#9381FF]/40'
                  : 'text-slate-600 hover:text-gray-950'
              }`}
            >
              <LayoutGrid className="h-4 w-4" aria-hidden />
              Board
            </button>
            <button
              type="button"
              onClick={() => setView('calendar')}
              aria-pressed={view === 'calendar'}
              className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 ${
                view === 'calendar'
                  ? 'bg-white text-violet-950 shadow-[0_2px_14px_-5px_rgba(147,129,255,0.55)] ring-1 ring-[#9381FF]/40'
                  : 'text-slate-600 hover:text-gray-950'
              }`}
            >
              <CalendarIcon className="h-4 w-4" aria-hidden />
              Calendar
            </button>
            <button
              type="button"
              onClick={() => setView('planning')}
              aria-pressed={view === 'planning'}
              className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 ${
                view === 'planning'
                  ? 'bg-white text-violet-950 shadow-[0_2px_14px_-5px_rgba(147,129,255,0.55)] ring-1 ring-[#9381FF]/40'
                  : 'text-slate-600 hover:text-gray-950'
              }`}
            >
              <Target className="h-4 w-4" aria-hidden />
              Planning
            </button>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {onOpenAssistant ? (
              <button
                type="button"
                onClick={onOpenAssistant}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-full text-sm font-bold text-white bg-gradient-to-r from-violet-500 via-[#9381FF] to-violet-600 shadow-[0_8px_24px_-10px_rgba(147,129,255,0.95)] hover:brightness-[1.05] active:scale-[0.99] transition-all border border-violet-800/35"
              >
                <Sparkles className="h-4 w-4 shrink-0 text-white/95" aria-hidden strokeWidth={2} />
                Ask Hub AI
              </button>
            ) : null}
            <button
              type="button"
              onClick={() => {
                setEditingTask(null);
                setDrawerOpen(true);
              }}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white rounded-full text-sm font-bold hover:bg-gray-950 shadow-[0_6px_20px_-8px_rgba(15,23,42,0.45)] hover:-translate-y-0.5 transition-all"
            >
              <Plus className="h-4 w-4" aria-hidden strokeWidth={2.25} />
              Create task
            </button>
            <button
              type="button"
              onClick={() => setManageCategoriesOpen((o) => !o)}
              aria-expanded={manageCategoriesOpen}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-semibold text-gray-700 border border-black/[0.08] bg-white/90 hover:bg-white shadow-sm"
            >
              <Tags className="h-4 w-4" aria-hidden strokeWidth={1.75} />
              Task types
            </button>
          </div>
        </div>
      </div>

      {manageCategoriesOpen ?
        <TaskCategoriesManager
          taskCategories={taskCategories}
          tasks={tasks}
          getFirebaseIdToken={getFirebaseIdToken}
          reloadWorkspace={reloadWorkspace}
        />
      : null}

      <TaskFiltersBar
        searchQuery={searchQuery}
        onSearchQueryChange={setSearchQuery}
        filterStatus={filterStatus}
        onFilterStatusChange={setFilterStatus}
        filterCategoryId={filterCategoryId}
        onFilterCategoryIdChange={setFilterCategoryId}
        filterCustomerId={filterCustomerId}
        onFilterCustomerIdChange={setFilterCustomerId}
        filterProductId={filterProductId}
        onFilterProductIdChange={setFilterProductId}
        filterPlanningPillar={filterPlanningPillar}
        onFilterPlanningPillarChange={setFilterPlanningPillar}
        taskCategories={taskCategories}
        customers={customers}
        products={products}
        hasActiveFilters={hasActiveFilters}
        onClearFilters={clearFilters}
        totalCount={tasks.length}
        filteredCount={displayTasks.length}
        sidebarCalendarDateActive={Boolean(sidebarCalendarDate)}
      />

      {tasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/40 py-14 px-6 text-center max-w-lg mx-auto">
          <ClipboardList className="h-12 w-12 text-slate-400 mb-4" aria-hidden />
          <h2 className="text-lg font-semibold text-gray-900">Nothing in your queue yet</h2>
          <p className="text-sm text-gray-600 mt-2 max-w-sm">
            Create a task to track demos, renewals, or internal prep. Optionally link an account — it helps activity show
            on the customer workspace.
          </p>
          <button
            type="button"
            onClick={() => {
              setEditingTask(null);
              setDrawerOpen(true);
            }}
            className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 bg-[#9381FF] text-white rounded-xl font-semibold text-sm hover:bg-[#8370ee] shadow-[0_6px_20px_-12px_rgba(147,129,255,0.9)] transition-colors"
          >
            <Plus className="h-4 w-4" aria-hidden />
            Create first task
          </button>
        </div>
      ) : displayTasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-[#9381FF]/35 bg-[#faf8ff]/95 py-12 px-6 text-center ring-1 ring-[#9381FF]/[0.08]">
          <p className="text-sm font-medium text-violet-950">No tasks match the current search or filters.</p>
          <p className="text-xs text-violet-900/85 mt-1 max-w-md">
            Try a different keyword, or clear filters to see all {tasks.length} tasks again.
          </p>
          {hasActiveFilters ? (
            <button
              type="button"
              onClick={clearFilters}
              className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-[#9381FF] hover:text-violet-700 underline-offset-4 hover:underline"
            >
              <FilterX className="h-4 w-4" aria-hidden />
              Reset filters
            </button>
          ) : null}
        </div>
      ) : view === 'planning' ? (
        <div className="rounded-2xl border border-violet-200/80 bg-white/95 p-6 hub-soft-shadow ring-1 ring-violet-100">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Account planning timeline</h2>
              <p className="text-sm text-gray-600 mt-1">
                Whitespace, multi-threading, migration, and research tasks by planning week.
              </p>
            </div>
            <PlanningPillarLegend />
          </div>
          <AccountPlanningTaskTimeline
            tasks={displayTasks}
            taskCategories={taskCategories}
            pillarFilter={filterPlanningPillar}
            onTaskClick={(t) => {
              setEditingTask(t);
              setDrawerOpen(true);
            }}
            emptyMessage="No account planning tasks match your filters. Tag tasks with a planning pillar or use the matching task type."
          />
        </div>
      ) : view === 'kanban' && sidebarCalendarDate && !sidebarDayMatchesAnyTask ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-[#dcd5ff]/90 bg-white/[0.97] py-14 px-6 text-center hub-soft-shadow ring-1 ring-[#9381FF]/[0.08]">
          <p className="text-sm font-semibold text-gray-900">No tasks due on {format(sidebarCalendarDate, 'EEEE, MMM d')}</p>
          <p className="text-xs text-violet-600/90 mt-2 max-w-sm">
            Dates with dots still show from your current filters. Pick another day or clear the calendar selection to see every task again.
          </p>
          <button
            type="button"
            onClick={() => setSidebarCalendarDate(null)}
            className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold text-white bg-[#9381FF] hover:bg-[#8370ee] shadow-[0_6px_20px_-12px_rgba(147,129,255,0.9)] transition-colors"
          >
            Clear calendar day
          </button>
        </div>
      ) : view === 'kanban' ? (
        <div className="flex flex-col gap-8 xl:grid xl:grid-cols-[minmax(0,1fr),minmax(268px,300px)] xl:gap-8 xl:items-start">
          <div className="min-w-0 w-full xl:mr-0">
            <TaskKanbanBoard
              tasks={displayTasks}
              calendarDayKey={sidebarCalendarDayKey ?? undefined}
              categories={taskCategories}
              products={products}
              opportunities={opportunities}
              customers={customers}
              onOpenCustomerWorkspace={onOpenCustomerWorkspace}
              onDragCommit={(nextSubset) => {
                const merged = tasks.map((t) => nextSubset.find((n) => n.id === t.id) ?? t);
                return persistKanbanTasks(tasks, merged);
              }}
              onEdit={(t) => {
                setEditingTask(t);
                setDrawerOpen(true);
              }}
              onDelete={deleteTask}
            />
            {sidebarCalendarDayKey ? (
              <p className="mt-4 text-[11px] font-medium leading-relaxed text-violet-600/90">
                Drag and drop reordering pauses while a calendar day filter is selected. Tap the purple day again in the
                sidebar to clear.
              </p>
            ) : null}
          </div>
          <aside className="shrink-0 w-full xl:max-w-none">
            <TaskSidebarCalendar
              tasks={displayTasks}
              selectedDate={sidebarCalendarDate}
              onSelectDate={setSidebarCalendarDate}
            />
          </aside>
        </div>
      ) : (
        <TaskCalendarView
          tasks={displayTasks}
          categories={taskCategories}
          opportunities={opportunities}
          customers={customers}
          onOpenCustomerWorkspace={onOpenCustomerWorkspace}
          onSelectTask={(t) => {
            setEditingTask(t);
            setDrawerOpen(true);
          }}
        />
      )}

      <TaskFormDrawer
        open={drawerOpen}
        task={editingTask}
        categories={taskCategories}
        opportunities={opportunities}
        customers={customers}
        products={products}
        customerContacts={customerContacts}
        internalContacts={internalContacts}
        onClose={() => {
          setDrawerOpen(false);
          setEditingTask(null);
          setDrawerDefaults({});
        }}
        onSave={handleSaveForm}
        getFirebaseIdToken={getFirebaseIdToken}
        onOpenCustomerWorkspace={onOpenCustomerWorkspace}
        defaultCustomerId={drawerDefaults.customerId ?? null}
        defaultPlanningPillar={drawerDefaults.pillar ?? null}
      />
    </div>
  );
}
