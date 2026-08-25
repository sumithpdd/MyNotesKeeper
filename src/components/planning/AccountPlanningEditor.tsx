'use client';

import { useState } from 'react';
import { X, Save } from 'lucide-react';
import type { AccountPlanningPlan } from '@/types';
import { ACCOUNT_PLANNING_PILLARS, emptyAccountPlanningPlan } from '@/domain/engagement-hub/accountPlanningPillars';

interface AccountPlanningEditorProps {
  customerName: string;
  plan: AccountPlanningPlan;
  onSave: (plan: AccountPlanningPlan) => void;
  onCancel: () => void;
}

export function AccountPlanningEditor({
  customerName,
  plan: initialPlan,
  onSave,
  onCancel,
}: AccountPlanningEditorProps) {
  const base = { ...emptyAccountPlanningPlan(), ...initialPlan };
  const [plan, setPlan] = useState<AccountPlanningPlan>(base);

  const updateWhitespace = (patch: Partial<NonNullable<AccountPlanningPlan['whitespace']>>) =>
    setPlan((p) => ({ ...p, whitespace: { ...p.whitespace, ...patch } }));
  const updateMulti = (patch: Partial<NonNullable<AccountPlanningPlan['multiThreading']>>) =>
    setPlan((p) => ({ ...p, multiThreading: { ...p.multiThreading, ...patch } }));
  const updateMigration = (patch: Partial<NonNullable<AccountPlanningPlan['migration']>>) =>
    setPlan((p) => ({ ...p, migration: { ...p.migration, ...patch } }));
  const updateResearch = (patch: Partial<NonNullable<AccountPlanningPlan['research']>>) =>
    setPlan((p) => ({ ...p, research: { ...p.research, ...patch } }));

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Account planning — {customerName}</h2>
          <button type="button" onClick={onCancel} className="text-gray-400 hover:text-gray-600">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">AE alignment (post-Vee whitespace)</label>
            <textarea
              value={plan.aeAlignment ?? ''}
              onChange={(e) => setPlan((p) => ({ ...p, aeAlignment: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
              placeholder="How you and your AE will approach this account after whitespace analysis…"
            />
          </div>

          {ACCOUNT_PLANNING_PILLARS.map((pillar) => {
            const isMigration = pillar.id === 'migration';
            const isResearch = pillar.id === 'research';
            const isMulti = pillar.id === 'multi_threading';

            const fields =
              pillar.id === 'whitespace'
                ? plan.whitespace
                : isMulti
                  ? plan.multiThreading
                  : isMigration
                    ? plan.migration
                    : plan.research;

            const setFields =
              pillar.id === 'whitespace'
                ? updateWhitespace
                : isMulti
                  ? updateMulti
                  : isMigration
                    ? updateMigration
                    : updateResearch;

            return (
              <div key={pillar.id} className={`rounded-xl border p-4 ${pillar.color}`}>
                <h3 className="font-semibold text-gray-900 mb-1">{pillar.label}</h3>
                <p className="text-xs text-gray-700 mb-3">{pillar.summary}</p>
                <ul className="text-xs text-gray-600 list-disc ml-4 mb-4 space-y-1">
                  {pillar.guidance.map((g) => (
                    <li key={g}>{g}</li>
                  ))}
                </ul>

                <div className="space-y-3 bg-white/70 rounded-lg p-3">
                  {isMigration ? (
                    <label className="flex items-center gap-2 text-sm text-gray-800">
                      <input
                        type="checkbox"
                        checked={Boolean(plan.migration?.eligible)}
                        onChange={(e) => updateMigration({ eligible: e.target.checked })}
                      />
                      xM / xP customer — migration eligible
                    </label>
                  ) : null}

                  {isMulti ? (
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Target stakeholders</label>
                      <input
                        value={plan.multiThreading?.targetStakeholders ?? ''}
                        onChange={(e) => updateMulti({ targetStakeholders: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                        placeholder="Head of Digital, IT, Marketing…"
                      />
                    </div>
                  ) : null}

                  {isResearch ? (
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Vertical / industry</label>
                      <input
                        value={plan.research?.vertical ?? ''}
                        onChange={(e) => updateResearch({ vertical: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                        placeholder="e.g. FMCG, public sector…"
                      />
                    </div>
                  ) : null}

                  {isMigration ? (
                    <>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Headless pathway</label>
                        <textarea
                          value={plan.migration?.headlessPath ?? ''}
                          onChange={(e) => updateMigration({ headlessPath: e.target.value })}
                          rows={2}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">SAI pathway</label>
                        <textarea
                          value={plan.migration?.saiPath ?? ''}
                          onChange={(e) => updateMigration({ saiPath: e.target.value })}
                          rows={2}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Partner strategy</label>
                        <select
                          value={plan.migration?.partnerStrategy ?? ''}
                          onChange={(e) =>
                            updateMigration({
                              partnerStrategy: e.target.value as '' | 'partner' | 'direct' | 'both',
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                        >
                          <option value="">Select…</option>
                          <option value="partner">Partner-led</option>
                          <option value="direct">Direct</option>
                          <option value="both">Both</option>
                        </select>
                      </div>
                    </>
                  ) : null}

                  {isResearch ? (
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Research topics</label>
                      <textarea
                        value={plan.research?.topics ?? ''}
                        onChange={(e) => updateResearch({ topics: e.target.value })}
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                        placeholder="Legislation, AI, economic drivers, disruptors…"
                      />
                    </div>
                  ) : null}

                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Approach / plan</label>
                    <textarea
                      value={fields?.approach ?? ''}
                      onChange={(e) => setFields({ approach: e.target.value })}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Status</label>
                    <input
                      value={fields?.status ?? ''}
                      onChange={(e) => setFields({ status: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Next actions</label>
                    <textarea
                      value={fields?.nextActions ?? ''}
                      onChange={(e) => setFields({ nextActions: e.target.value })}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onSave(plan)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700"
          >
            <Save className="h-4 w-4" />
            Save planning
          </button>
        </div>
      </div>
    </div>
  );
}
