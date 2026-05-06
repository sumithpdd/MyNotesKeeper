'use client';

import {
  DndContext,
  type DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
  useDroppable,
} from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  GripVertical,
  Trash2,
  CircleDashed,
  Zap,
  BadgeCheck,
  Ban,
  CalendarDays,
  Building2,
  Paperclip,
  Link2,
  PanelRightOpen,
} from 'lucide-react';
import type {
  EngagementTask,
  TaskKanbanStatus,
  Opportunity,
  Customer,
  TaskCategory,
  Product,
} from '@/types';
import type { LucideIcon } from 'lucide-react';
import { applyKanbanDrag } from '@/lib/kanbanMerge';
import { taskLinkHref } from '@/lib/taskLinks';
import { safeFormatDate } from '@/lib/utils';
import { parse } from 'date-fns';
import { formatTaskPlanningWindow, taskTouchesCalendarDay } from '@/lib/taskPlanningRange';

const COLUMN_META: {
  id: TaskKanbanStatus;
  title: string;
  Icon: LucideIcon;
  headerClass: string;
  badgeClass: string;
  panelClass: string;
  progressTint: string;
}[] = [
  {
    id: 'todo',
    title: 'Not started',
    Icon: CircleDashed,
    headerClass: 'text-slate-700',
    badgeClass: 'bg-slate-200/95 text-slate-800 shadow-inner',
    panelClass:
      'bg-gradient-to-b from-slate-100/90 via-white/70 to-[#fafbfc] border-slate-200/80',
    progressTint: 'bg-slate-400',
  },
  {
    id: 'in_progress',
    title: 'In progress',
    Icon: Zap,
    headerClass: 'text-violet-950',
    badgeClass: 'bg-[#9381FF]/90 text-white shadow-[0_1px_10px_-4px_#9381FF]',
    panelClass:
      'bg-gradient-to-b from-violet-50/95 via-[#faf8ff]/80 to-[#fafbfc] border-[#dcd5ff]',
    progressTint: 'bg-[#9381FF]',
  },
  {
    id: 'done',
    title: 'Completed',
    Icon: BadgeCheck,
    headerClass: 'text-emerald-900',
    badgeClass: 'bg-emerald-400/95 text-emerald-950 shadow-sm',
    panelClass:
      'bg-gradient-to-b from-emerald-50/90 via-emerald-50/30 to-[#fafbfc] border-emerald-200/55',
    progressTint: 'bg-emerald-500',
  },
  {
    id: 'cancelled',
    title: 'Cancelled',
    Icon: Ban,
    headerClass: 'text-rose-900',
    badgeClass: 'bg-rose-200/95 text-rose-950 shadow-inner',
    panelClass:
      'bg-gradient-to-b from-rose-50/80 via-white/65 to-[#fafbfc] border-rose-200/65',
    progressTint: 'bg-rose-300',
  },
];

function workflowProgressPct(status: EngagementTask['status']): number {
  switch (status) {
    case 'todo':
      return 8;
    case 'in_progress':
      return 45;
    case 'done':
      return 100;
    case 'cancelled':
      return 0;
    default:
      return 10;
  }
}

interface TaskKanbanBoardProps {
  tasks: EngagementTask[];
  /** When set (YYYY-MM-DD), only tasks due that day render; dragging is disabled — use full filtered list for correctness */
  calendarDayKey?: string | null;
  categories: TaskCategory[];
  products: Product[];
  opportunities: Opportunity[];
  customers: Customer[];
  onDragCommit: (nextTasks: EngagementTask[]) => Promise<void>;
  onEdit: (task: EngagementTask) => void;
  onDelete: (taskId: string) => Promise<void>;
  onOpenCustomerWorkspace?: (customerId: string, opportunityId?: string | null) => void;
}

export function TaskKanbanBoard({
  tasks,
  calendarDayKey,
  categories,
  products,
  opportunities,
  customers,
  onDragCommit,
  onEdit,
  onDelete,
  onOpenCustomerWorkspace,
}: TaskKanbanBoardProps) {
  const dragDisabled = !!calendarDayKey;
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  function matchesCalendar(t: EngagementTask): boolean {
    if (!calendarDayKey) return true;
    const day = parse(calendarDayKey, 'yyyy-MM-dd', new Date());
    return taskTouchesCalendarDay(t, day);
  }

  const byStatus = COLUMN_META.map(({ id }) =>
    tasks
      .filter((t) => t.status === id && matchesCalendar(t))
      .sort((a, b) => a.order - b.order),
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;
    const next = applyKanbanDrag(tasks, active.id as string, over.id as string);
    const changed =
      tasks.length !== next.length ||
      tasks.some((t) => {
        const n = next.find((x) => x.id === t.id);
        return !n || n.status !== t.status || n.order !== t.order;
      });
    if (changed) await onDragCommit(next);
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCorners} onDragEnd={handleDragEnd}>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 min-h-[420px]">
        {COLUMN_META.map((col, idx) => (
          <KanbanColumn
            key={col.id}
            column={col}
            tasks={byStatus[idx]}
            dragDisabled={dragDisabled}
            categories={categories}
            products={products}
            opportunities={opportunities}
            customers={customers}
            onEdit={onEdit}
            onDelete={onDelete}
            onOpenCustomerWorkspace={onOpenCustomerWorkspace}
          />
        ))}
      </div>
    </DndContext>
  );
}

function KanbanColumn({
  column,
  tasks,
  dragDisabled,
  categories,
  products,
  opportunities,
  customers,
  onEdit,
  onDelete,
  onOpenCustomerWorkspace,
}: {
  column: (typeof COLUMN_META)[number];
  tasks: EngagementTask[];
  dragDisabled: boolean;
  categories: TaskCategory[];
  products: Product[];
  opportunities: Opportunity[];
  customers: Customer[];
  onEdit: (t: EngagementTask) => void;
  onDelete: (id: string) => Promise<void>;
  onOpenCustomerWorkspace?: (customerId: string, opportunityId?: string | null) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: column.id });
  const ids = tasks.map((t) => t.id);
  const ColIcon = column.Icon;

  return (
    <div
      ref={setNodeRef}
      className={`rounded-[1.35rem] border flex flex-col min-h-[320px] hub-soft-shadow transition-all duration-200 ${column.panelClass} ${
        isOver
          ? 'ring-2 ring-[#9381FF]/40 scale-[1.01] shadow-[0_18px_50px_-24px_rgba(147,129,255,0.45)]'
          : ''
      }`}
    >
      <div className="px-4 py-3.5 flex items-center justify-between border-b border-black/[0.04] bg-white/40 backdrop-blur-[2px]">
        <span className={`flex items-center gap-2 text-[0.9375rem] font-bold tracking-tight ${column.headerClass}`}>
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/90 shadow-[0_1px_4px_-1px_rgba(15,23,42,0.12)] ring-1 ring-black/[0.04]">
            <ColIcon className="h-[1.125rem] w-[1.125rem]" aria-hidden strokeWidth={2} />
          </span>
          {column.title}
        </span>
        <span
          className={`tabular-nums min-w-[2rem] text-center text-[0.6875rem] font-bold uppercase tracking-wide rounded-full px-2.5 py-1 ${column.badgeClass}`}
        >
          {tasks.length}
        </span>
      </div>
      <div className="p-3 flex-1 flex flex-col overflow-y-auto max-h-[70vh] min-h-[5rem] gap-2">
        <SortableContext items={ids} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <SortableTaskCard
              key={task.id}
              task={task}
              dragDisabled={dragDisabled}
              column={column}
              categories={categories}
              products={products}
              opportunities={opportunities}
              customers={customers}
              onEdit={onEdit}
              onDelete={onDelete}
              onOpenCustomerWorkspace={onOpenCustomerWorkspace}
            />
          ))}
        </SortableContext>
        {tasks.length === 0 ? (
          <p className="flex-1 flex items-center justify-center text-[0.6875rem] font-medium uppercase tracking-wide text-slate-400 text-center px-4 py-8 border border-dashed border-black/[0.07] rounded-2xl bg-white/55 mx-0.5 mb-1">
            Drop tasks here or add one
          </p>
        ) : null}
      </div>
    </div>
  );
}

function SortableTaskCard({
  task,
  dragDisabled,
  column,
  categories,
  products,
  opportunities,
  customers,
  onEdit,
  onDelete,
  onOpenCustomerWorkspace,
}: {
  task: EngagementTask;
  dragDisabled: boolean;
  column: (typeof COLUMN_META)[number];
  categories: TaskCategory[];
  products: Product[];
  opportunities: Opportunity[];
  customers: Customer[];
  onEdit: (t: EngagementTask) => void;
  onDelete: (id: string) => Promise<void>;
  onOpenCustomerWorkspace?: (customerId: string, opportunityId?: string | null) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
  });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.7 : 1,
  };

  const catChips = (task.categoryIds ?? [])
    .map((id) => categories.find((c) => c.id === id))
    .filter((c): c is TaskCategory => c != null);
  const opp = task.opportunityId ? opportunities.find((o) => o.id === task.opportunityId) : null;
  const cust =
    task.customerId != null
      ? customers.find((c) => c.id === task.customerId)
      : opp
        ? customers.find((c) => c.id === opp.customerId)
        : null;

  const taskProducts = (task.productIds ?? [])
    .map((id) => products.find((p) => p.id === id))
    .filter((p): p is Product => p != null);

  const progress = workflowProgressPct(task.status);
  const initials = cust?.customerName
    ? cust.customerName
        .split(/\s+/)
        .map((w) => w[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : null;

  const cl = task.checklist ?? [];
  const st = task.subtasks ?? [];
  const checklistLine =
    cl.length === 0 && st.length === 0 ? null : (
      <p className="text-[10px] font-semibold text-slate-400 mt-1.5 space-x-2">
        {cl.length > 0 ? (
          <span>
            Checklist {cl.filter((x) => x.done).length}/{cl.length}
          </span>
        ) : null}
        {st.length > 0 ? (
          <span>
            Steps {st.filter((x) => x.done).length}/{st.length}
          </span>
        ) : null}
      </p>
    );

  const planLabel = formatTaskPlanningWindow(task);
  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...(!dragDisabled ? listeners : {})}
      className={`rounded-[1.15rem] bg-white/[0.98] px-3.5 pt-3 pb-2.5 mb-1 border border-black/[0.05] hover:border-black/[0.085] hover:shadow-[0_14px_40px_-24px_rgba(15,23,42,0.18)] hover:-translate-y-0.5 transition-all duration-200 ring-1 ring-transparent hover:ring-white/80 hub-soft-shadow ${
        dragDisabled ? '' : 'cursor-grab active:cursor-grabbing'
      }`}
      aria-label={dragDisabled ? 'Task card (drag unavailable while a calendar day filter is active)' : 'Task card (drag to reorder or move status)'}
    >
      <div className="flex gap-2">
        <button
          type="button"
          aria-label={dragDisabled ? 'Drag unavailable while a calendar day filter is active' : 'Drag'}
          className={`shrink-0 mt-0.5 rounded-lg p-0.5 transition-colors ${
            dragDisabled
              ? 'text-slate-200 cursor-not-allowed'
              : 'text-slate-300 hover:text-slate-500 hover:bg-slate-100/80 cursor-grab active:cursor-grabbing'
          }`}
          aria-disabled={dragDisabled}
          tabIndex={-1}
        >
          <GripVertical className="h-4 w-4" />
        </button>
        <div className="min-w-0 flex-1 relative" onClick={() => onEdit(task)} role="presentation">
          <button
            type="button"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              if (confirm('Delete this task?')) void onDelete(task.id);
            }}
            className="absolute top-0 right-0 inline-flex items-center justify-center h-9 w-9 rounded-xl text-slate-300 hover:text-rose-500 hover:bg-rose-50 transition-colors z-10"
            aria-label="Delete task"
          >
            <Trash2 className="h-4 w-4" strokeWidth={1.85} />
          </button>
          <p className="text-[0.9285rem] font-bold leading-snug text-gray-950 tracking-tight pr-10">{task.title}</p>
          {catChips.length ? (
            <div className="flex flex-wrap gap-1 mt-1">
              {catChips.map((c) => (
                <span
                  key={c.id}
                  className={`inline-block max-w-[10rem] truncate px-2 py-0.5 rounded text-[11px] font-semibold leading-tight ${
                    c.color ?? 'bg-slate-100 text-slate-700'
                  }`}
                  title={c.name}
                >
                  {c.name}
                </span>
              ))}
            </div>
          ) : null}
          {checklistLine}

          {task.links && task.links.length > 0 ? (
            <div
              className="mt-2 flex flex-wrap gap-2"
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => e.stopPropagation()}
              role="presentation"
            >
              {task.links.map((lnk) => {
                const href = taskLinkHref(lnk.url);
                let display = lnk.label?.trim() || '';
                if (!display) {
                  try {
                    display = new URL(href).hostname;
                  } catch {
                    display = href.slice(0, 32);
                  }
                }
                return (
                  <a
                    key={lnk.id}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 max-w-[12rem] truncate rounded-lg bg-violet-50/95 px-2 py-0.5 text-[11px] font-semibold text-violet-800 ring-1 ring-violet-100/90 hover:bg-violet-100"
                    title={href}
                  >
                    <Link2 className="h-3 w-3 shrink-0 opacity-85" aria-hidden />
                    <span className="truncate">{display}</span>
                  </a>
                );
              })}
            </div>
          ) : null}

          <div className="mt-3">
            <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              <span>Progress</span>
              <span>{task.status === 'done' ? '100%' : task.status === 'cancelled' ? '—' : `${progress}%`}</span>
            </div>
            <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden ring-1 ring-black/[0.04]">
              <div
                className={`h-full rounded-full transition-all duration-300 ${column.progressTint}`}
                style={{ width: task.status === 'cancelled' ? '2%' : `${progress}%` }}
              />
            </div>
          </div>

          {planLabel ? (
            <div className="flex items-center gap-1.5 mt-3 text-[0.75rem] text-slate-600 font-semibold">
              <CalendarDays className="h-4 w-4 shrink-0 text-[#9381FF]" aria-hidden strokeWidth={2} />
              <span>Plan: {planLabel}</span>
            </div>
          ) : null}

          {cust || taskProducts.length > 0 ? (
            <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-dashed border-black/[0.06] pt-3">
              {initials ? (
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    title={cust?.customerName}
                    className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-slate-200 to-slate-300 text-[10px] font-bold text-slate-800 ring-2 ring-white shadow-sm shrink-0"
                  >
                    {initials}
                  </span>
                  <span className="text-[11px] font-semibold text-slate-600 truncate max-w-[7rem]" title={cust?.customerName}>
                    {cust?.customerName}
                  </span>
                </div>
              ) : (
                <Building2 className="h-4 w-4 text-slate-300 shrink-0" aria-hidden strokeWidth={1.75} />
              )}
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-400 uppercase tracking-wide">
                <Paperclip className="h-3.5 w-3.5" aria-hidden strokeWidth={2} />
                {taskProducts.length}
              </span>
              {cust?.id && onOpenCustomerWorkspace ? (
                <button
                  type="button"
                  onPointerDown={(e) => e.stopPropagation()}
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenCustomerWorkspace(cust.id, task.opportunityId ?? null);
                  }}
                  className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-bold text-violet-800 bg-violet-50 ring-1 ring-violet-100 hover:bg-violet-100 ml-auto"
                  title="Open this account in Customer Management"
                >
                  <PanelRightOpen className="h-3.5 w-3.5 shrink-0" aria-hidden strokeWidth={2} />
                  Workspace
                </button>
              ) : null}
            </div>
          ) : null}

          {!cust && taskProducts.length === 0 ? (
            <div className="mt-4 flex items-center gap-2 text-[11px] font-semibold text-slate-400 border-t border-dashed border-black/[0.06] pt-3">
              <Building2 className="h-3.5 w-3.5" aria-hidden strokeWidth={1.75} />
              Unlinked
            </div>
          ) : null}

          <p className="text-[10px] font-medium text-slate-400 mt-2">Updated {safeFormatDate(task.updatedAt)}</p>
        </div>
      </div>
    </div>
  );
}
