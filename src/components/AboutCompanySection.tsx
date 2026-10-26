'use client';

import { useState } from 'react';
import { Building2, Loader2, Save, Sparkles } from 'lucide-react';
import type { Customer } from '@/types';
import { useAuth } from '@/lib/auth';
import { hubAuthJson } from '@/lib/client/hubAuthFetch';
import { CopyableFieldWithAI } from './ui/CopyableFieldWithAI';
import { safeFormatDate } from '@/lib/utils';

interface AboutCompanySectionProps {
  customer: Customer;
  onSave: (customer: Customer) => void;
}

export function AboutCompanySection({ customer, onSave }: AboutCompanySectionProps) {
  const { getFirebaseIdToken } = useAuth();
  const [draft, setDraft] = useState(customer.aboutCompany ?? '');
  const [editing, setEditing] = useState(!(customer.aboutCompany ?? '').trim());
  const [researching, setResearching] = useState(false);
  const [saving, setSaving] = useState(false);
  const [focus, setFocus] = useState('');

  const persist = async (text: string) => {
    setSaving(true);
    try {
      onSave({
        ...customer,
        aboutCompany: text,
        aboutCompanyLastUpdated: new Date(),
        updatedAt: new Date(),
      });
      setDraft(text);
      setEditing(false);
    } finally {
      setSaving(false);
    }
  };

  const runResearch = async () => {
    setResearching(true);
    try {
      const token = await getFirebaseIdToken();
      if (!token) throw new Error('Sign in required to use AI features.');
      const { research } = await hubAuthJson<{ research: string }>('/api/ai/company-research', token, {
        method: 'POST',
        body: JSON.stringify({
          customerId: customer.id,
          extraFocus: focus.trim() || undefined,
        }),
      });
      setDraft(research);
      setEditing(true);
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Industry research failed');
    } finally {
      setResearching(false);
    }
  };

  const stored = customer.aboutCompany?.trim() ?? '';

  return (
    <div className="border-t border-gray-200 pt-6">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Building2 className="h-5 w-5 text-slate-500" />
            About the company
          </h3>
          <p className="text-xs text-gray-500 mt-1">
            Snapshot, latest trends, and industry context. Research uses this account’s hub profile, notes, and
            opportunities — it does not browse the live web.
          </p>
          {customer.aboutCompanyLastUpdated ? (
            <p className="text-xs text-gray-400 mt-1">Updated {safeFormatDate(customer.aboutCompanyLastUpdated)}</p>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-2 shrink-0">
          <button
            type="button"
            onClick={() => void runResearch()}
            disabled={researching}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-purple-700 bg-purple-50 hover:bg-purple-100 rounded-lg disabled:opacity-60"
          >
            {researching ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
            Industry research
          </button>
          {!editing && stored ? (
            <button
              type="button"
              onClick={() => {
                setDraft(stored);
                setEditing(true);
              }}
              className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg"
            >
              Edit
            </button>
          ) : null}
        </div>
      </div>

      <input
        value={focus}
        onChange={(e) => setFocus(e.target.value)}
        placeholder="Optional research focus (e.g. UK camping market 2026, AI search vs Pitchup)"
        className="w-full mb-3 px-3 py-2 text-sm border border-gray-200 rounded-lg text-gray-900"
      />

      {editing || !stored ? (
        <div className="space-y-2">
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            rows={12}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg text-gray-900 bg-white"
            placeholder="Company background, market position, trends, competitive notes…"
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => void persist(draft)}
              disabled={saving || !draft.trim()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              Save
            </button>
            {stored ? (
              <button
                type="button"
                onClick={() => {
                  setDraft(stored);
                  setEditing(false);
                }}
                className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                Cancel
              </button>
            ) : null}
          </div>
        </div>
      ) : (
        <CopyableFieldWithAI
          label="About the company"
          value={stored}
          aiContext={`About ${customer.customerName} — keep suitable for CRM. Website ${customer.website || ''}.`}
        />
      )}
    </div>
  );
}
