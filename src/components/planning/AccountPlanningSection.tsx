'use client';

import { useMemo, useState } from 'react';
import { Edit, Plus, Target, LayoutList, ExternalLink } from 'lucide-react';
import type { Customer, EngagementTask, TaskCategory, AccountPlanningPlan } from '@/types';
import {
  ACCOUNT_PLANNING_PILLARS,
  emptyAccountPlanningPlan,
  filterTasksByPlanningPillar,
  parseAccountPlanning,
  type AccountPlanningPillarId,
} from '@/domain/engagement-hub/accountPlanningPillars';
import { AccountPlanningEditor } from './AccountPlanningEditor';
import { AccountPlanningTaskTimeline } from './AccountPlanningTaskTimeline';

interface AccountPlanningSectionProps {
  customer: Customer;
  tasks: EngagementTask[];
  taskCategories: TaskCategory[];
  onSavePlanning: (customerId: string, plan: AccountPlanningPlan) => void;
  onAddPlanningTask: (pillarId: AccountPlanningPillarId) => void;
  onOpenPlanningTasks?: (pillarId?: AccountPlanningPillarId) => void;
  onEditTask?: (task: EngagementTask) => void;
}

function pillarPlanFields(plan: AccountPlanningPlan | undefined, pillarId: AccountPlanningPillarId) {
  if (!plan) return null;
  switch (pillarId) {
    case 'whitespace':
      return plan.whitespace;
    case 'multi_threading':
      return plan.multiThreading;
    case 'migration':
      return plan.migration;
    case 'research':
      return plan.research;
    default:
      return null;
  }
}

export function AccountPlanningSection({
  customer,
  tasks,
  taskCategories,
  onSavePlanning,
  onAddPlanningTask,
  onOpenPlanningTasks,
  onEditTask,
}: AccountPlanningSectionProps) {
  const [activePillar, setActivePillar] = useState<AccountPlanningPillarId>('whitespace');
  const [showEditor, setShowEditor] = useState(false);

  const plan = parseAccountPlanning(customer.accountPlanning) ?? emptyAccountPlanningPlan();
  const planningTasks = useMemo(
    () => tasks.filter((t) => filterTasksByPlanningPillar([t], taskCategories, activePillar).length > 0),
    [tasks, taskCategories, activePillar],
  );
  const allPlanningTasks = useMemo(() => {
    return tasks.filter((t) =>
      ACCOUNT_PLANNING_PILLARS.some(
        (p) => filterTasksByPlanningPillar([t], taskCategories, p.id).length > 0,
      ),
    );
  }, [tasks, taskCategories]);

  const activeDef = ACCOUNT_PLANNING_PILLARS.find((p) => p.id === activePillar)!;
  const activeFields = pillarPlanFields(plan, activePillar);

  return (
    <>
      <div className="border-t border-gray-200 pt-4">
        <div className="flex items-center justify-between mb-3 gap-2">
          <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
            <Target className="h-4 w-4 text-violet-600" aria-hidden />
            Account planning
          </h3>
          <div className="flex gap-2">
            {onOpenPlanningTasks ? (
              <button
                type="button"
                onClick={() => onOpenPlanningTasks()}
                className="inline-flex items-center gap-1 text-xs font-semibold text-violet-800 hover:text-violet-950 px-2 py-1 rounded-md border border-violet-200 bg-violet-50"
              >
                <LayoutList className="h-3.5 w-3.5" />
                Tasks timeline
              </button>
            ) : null}
            <button
              type="button"
              onClick={() => setShowEditor(true)}
              className="p-2 text-gray-500 hover:text-violet-600 hover:bg-violet-50 rounded-lg"
              title="Edit account planning"
            >
              <Edit className="h-4 w-4" />
            </button>
          </div>
        </div>

        {plan.aeAlignment ? (
          <p className="text-xs text-gray-600 bg-violet-50/80 border border-violet-100 rounded-lg p-3 mb-4">
            <span className="font-semibold text-violet-900">AE alignment: </span>
            {plan.aeAlignment}
          </p>
        ) : (
          <p className="text-sm text-gray-500 mb-4">
            Plan whitespace, multi-threading, migration, and research after Vee&apos;s analysis.{' '}
            <button type="button" onClick={() => setShowEditor(true)} className="text-violet-700 font-semibold hover:underline">
              Start planning
            </button>
          </p>
        )}

        <div className="flex flex-wrap gap-1.5 mb-4">
          {ACCOUNT_PLANNING_PILLARS.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setActivePillar(p.id)}
              className={`text-xs font-semibold px-2.5 py-1 rounded-full border transition-colors ${
                activePillar === p.id ? p.color + ' ring-2 ring-violet-400/50' : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
              }`}
            >
              {p.shortLabel}
            </button>
          ))}
        </div>

        <div className={`rounded-xl border p-4 mb-4 ${activeDef.color}`}>
          <h4 className="font-semibold text-gray-900 text-sm mb-1">{activeDef.label}</h4>
          <p className="text-xs text-gray-700 mb-2">{activeDef.summary}</p>
          <ul className="text-[11px] text-gray-600 list-disc ml-4 mb-3 space-y-0.5">
            {activeDef.guidance.map((g) => (
              <li key={g}>{g}</li>
            ))}
          </ul>

          {activeFields?.approach || activeFields?.status || activeFields?.nextActions ? (
            <div className="bg-white/80 rounded-lg p-3 text-xs space-y-2 mb-3">
              {activeFields.approach ? (
                <p>
                  <span className="font-semibold text-gray-800">Approach: </span>
                  {activeFields.approach}
                </p>
              ) : null}
              {activeFields.status ? (
                <p>
                  <span className="font-semibold text-gray-800">Status: </span>
                  {activeFields.status}
                </p>
              ) : null}
              {'targetStakeholders' in activeFields &&
              typeof activeFields.targetStakeholders === 'string' &&
              activeFields.targetStakeholders ? (
                <p>
                  <span className="font-semibold text-gray-800">Stakeholders: </span>
                  {activeFields.targetStakeholders}
                </p>
              ) : null}
              {'vertical' in activeFields &&
              typeof activeFields.vertical === 'string' &&
              activeFields.vertical ? (
                <p>
                  <span className="font-semibold text-gray-800">Vertical: </span>
                  {activeFields.vertical}
                </p>
              ) : null}
              {activeFields.nextActions ? (
                <p>
                  <span className="font-semibold text-gray-800">Next actions: </span>
                  {activeFields.nextActions}
                </p>
              ) : null}
            </div>
          ) : (
            <p className="text-xs text-gray-500 mb-3 italic">No plan captured yet for this pillar.</p>
          )}

          <button
            type="button"
            onClick={() => onAddPlanningTask(activePillar)}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-violet-900 bg-white/90 border border-violet-200 px-3 py-1.5 rounded-lg hover:bg-white"
          >
            <Plus className="h-3.5 w-3.5" />
            Add {activeDef.shortLabel} task
          </button>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-bold uppercase tracking-wide text-gray-600">
              {activeDef.shortLabel} timeline ({planningTasks.length})
            </h4>
            {onOpenPlanningTasks ? (
              <button
                type="button"
                onClick={() => onOpenPlanningTasks(activePillar)}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-violet-700 hover:underline"
              >
                Open in Tasks
                <ExternalLink className="h-3 w-3" />
              </button>
            ) : null}
          </div>
          <AccountPlanningTaskTimeline
            tasks={planningTasks}
            taskCategories={taskCategories}
            pillarFilter={activePillar}
            onTaskClick={onEditTask}
            compact
          />
        </div>

        {allPlanningTasks.length > 0 ? (
          <p className="text-[11px] text-gray-400 mt-3">
            {allPlanningTasks.length} account planning task{allPlanningTasks.length === 1 ? '' : 's'} across all pillars.
          </p>
        ) : null}
      </div>

      {showEditor ? (
        <AccountPlanningEditor
          customerName={customer.customerName}
          plan={plan}
          onSave={(next) => {
            onSavePlanning(customer.id, next);
            setShowEditor(false);
          }}
          onCancel={() => setShowEditor(false)}
        />
      ) : null}
    </>
  );
}
