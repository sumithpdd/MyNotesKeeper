'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Save, X, Target, DollarSign, Calendar, TrendingUp } from 'lucide-react';
import { Opportunity, CreateOpportunityData, OpportunityStage } from '@/types';
import { MultiSelect } from './ui/MultiSelect';
import { dummyProducts, dummyInternalContacts } from '../../data/dummyData';

const opportunitySchema = z.object({
  opportunityName: z.string().min(1, 'Opportunity name is required'),
  description: z.string().optional(),
  currentStage: z.enum([
    'Plan',
    'Prospect',
    'Qualify',
    'Discover',
    'Differentiate',
    'Propose',
    'Close',
    'Delivery and Success',
    'Expand'
  ]),
  estimatedValue: z.number().optional(),
  currency: z.string().optional(),
  probability: z.number().min(0).max(100).optional(),
  expectedCloseDate: z.string().optional(),
  products: z.array(z.object({
    id: z.string(),
    name: z.string(),
    version: z.string().optional(),
    description: z.string().optional(),
    status: z.enum(['Active', 'Inactive', 'Planned', 'Deprecated']).optional(),
  })),
  owner: z.object({
    id: z.string(),
    name: z.string(),
    role: z.string().optional(),
    email: z.string().optional(),
  }).optional(),
  priority: z.enum(['Low', 'Medium', 'High', 'Critical']).optional(),
  type: z.enum(['New Business', 'Upsell', 'Cross-sell', 'Renewal', 'Migration']).optional(),
  competitorInfo: z.string().optional(),
  nextSteps: z.string().optional(),
});

type OpportunityFormData = z.infer<typeof opportunitySchema>;

interface OpportunityFormProps {
  opportunity?: Opportunity;
  customerId: string;
  customerName: string;
  currentUser: string;
  onSave: (opportunity: Opportunity) => void;
  onCancel: () => void;
}

const STAGES: OpportunityStage[] = [
  'Plan',
  'Prospect',
  'Qualify',
  'Discover',
  'Differentiate',
  'Propose',
  'Close',
  'Delivery and Success',
  'Expand'
];

const STAGE_DESCRIPTIONS: Record<OpportunityStage, string> = {
  'Plan': 'Initial planning and opportunity identification',
  'Prospect': 'Identifying and researching potential opportunities',
  'Qualify': 'Determining if the opportunity is viable',
  'Discover': 'Understanding customer needs and requirements',
  'Differentiate': 'Highlighting unique value propositions',
  'Propose': 'Presenting formal proposal or solution',
  'Close': 'Finalizing the deal',
  'Delivery and Success': 'Implementing and ensuring customer success',
  'Expand': 'Identifying expansion and growth opportunities'
};

export function OpportunityForm({
  opportunity,
  customerId,
  customerName,
  currentUser,
  onSave,
  onCancel
}: OpportunityFormProps) {
  const [customProducts, setCustomProducts] = useState(dummyProducts);
  const [customInternalContacts, setCustomInternalContacts] = useState(dummyInternalContacts);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting }
  } = useForm<OpportunityFormData>({
    resolver: zodResolver(opportunitySchema),
    defaultValues: opportunity ? {
      opportunityName: opportunity.opportunityName,
      description: opportunity.description || '',
      currentStage: opportunity.currentStage,
      estimatedValue: opportunity.estimatedValue,
      currency: opportunity.currency || 'USD',
      probability: opportunity.probability,
      expectedCloseDate: opportunity.expectedCloseDate 
        ? new Date(opportunity.expectedCloseDate).toISOString().split('T')[0] 
        : '',
      products: opportunity.products,
      owner: opportunity.owner,
      priority: opportunity.priority,
      type: opportunity.type,
      competitorInfo: opportunity.competitorInfo || '',
      nextSteps: opportunity.nextSteps || '',
    } : {
      opportunityName: '',
      description: '',
      currentStage: 'Plan',
      estimatedValue: undefined,
      currency: 'USD',
      probability: undefined,
      expectedCloseDate: '',
      products: [],
      owner: undefined,
      priority: 'Medium',
      type: 'New Business',
      competitorInfo: '',
      nextSteps: '',
    }
  });

  const watchedValues = watch();

  const onSubmit = async (data: OpportunityFormData) => {
    try {
      const now = new Date();
      
      // Create stage history entry if this is a new opportunity or stage changed
      const stageHistory = opportunity?.stageHistory || [];
      
      if (!opportunity || opportunity.currentStage !== data.currentStage) {
        const newHistoryEntry = {
          id: crypto.randomUUID(),
          fromStage: opportunity?.currentStage || null,
          toStage: data.currentStage,
          changedBy: currentUser,
          changedAt: now,
          duration: opportunity?.stageHistory.length 
            ? Math.floor((now.getTime() - new Date(opportunity.stageHistory[opportunity.stageHistory.length - 1].changedAt).getTime()) / (1000 * 60 * 60 * 24))
            : 0
        };
        stageHistory.push(newHistoryEntry);
      }

      const opportunityData: Opportunity = {
        id: opportunity?.id || crypto.randomUUID(),
        customerId,
        opportunityName: data.opportunityName,
        description: data.description,
        currentStage: data.currentStage,
        stageHistory,
        estimatedValue: data.estimatedValue,
        currency: data.currency,
        probability: data.probability,
        expectedCloseDate: data.expectedCloseDate ? new Date(data.expectedCloseDate) : undefined,
        actualCloseDate: opportunity?.actualCloseDate,
        products: data.products,
        owner: data.owner,
        priority: data.priority,
        type: data.type,
        competitorInfo: data.competitorInfo,
        nextSteps: data.nextSteps,
        createdBy: opportunity?.createdBy || currentUser,
        updatedBy: currentUser,
        createdAt: opportunity?.createdAt || now,
        updatedAt: now,
      };

      onSave(opportunityData);
    } catch (error) {
      console.error('Error saving opportunity:', error);
      alert('Failed to save opportunity');
    }
  };

  return (
    <div className="p-6">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {opportunity ? 'Edit Opportunity' : 'New Opportunity'}
            </h2>
            <p className="text-sm text-gray-600">for {customerName}</p>
          </div>
        </div>

        {/* Basic Information */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Target className="h-5 w-5 mr-2" />
            Opportunity Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Opportunity Name *
              </label>
              <input
                {...register('opportunityName')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                placeholder="e.g., XM Cloud Migration 2026"
              />
              {errors.opportunityName && (
                <p className="mt-1 text-sm text-red-600">{errors.opportunityName.message}</p>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                {...register('description')}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                placeholder="Brief description of the opportunity..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Current Stage *
              </label>
              <select
                {...register('currentStage')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
              >
                {STAGES.map(stage => (
                  <option key={stage} value={stage}>
                    {stage}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-xs text-gray-500">
                {STAGE_DESCRIPTIONS[watchedValues.currentStage]}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type
              </label>
              <select
                {...register('type')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
              >
                <option value="">Select Type...</option>
                <option value="New Business">New Business</option>
                <option value="Upsell">Upsell</option>
                <option value="Cross-sell">Cross-sell</option>
                <option value="Renewal">Renewal</option>
                <option value="Migration">Migration</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Priority
              </label>
              <select
                {...register('priority')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Expected Close Date
              </label>
              <input
                type="date"
                {...register('expectedCloseDate')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
              />
            </div>
          </div>
        </div>

        {/* Financial Information */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <DollarSign className="h-5 w-5 mr-2" />
            Financial Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estimated Value
              </label>
              <input
                type="number"
                {...register('estimatedValue', { valueAsNumber: true })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                placeholder="100000"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Currency
              </label>
              <select
                {...register('currency')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
              >
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
                <option value="AUD">AUD</option>
                <option value="CAD">CAD</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Probability (%)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                {...register('probability', { valueAsNumber: true })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                placeholder="50"
              />
            </div>
          </div>
        </div>

        {/* Products and Owner */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <TrendingUp className="h-5 w-5 mr-2" />
            Products & Ownership
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <MultiSelect
              options={customProducts}
              selected={watchedValues.products.map(p => typeof p === 'string' ? p : p.id)}
              onChange={(selected) => {
                const selectedObjects = selected.map(id => 
                  customProducts.find(p => p.id === id) || { id, name: id, version: '' }
                );
                setValue('products', selectedObjects);
              }}
              label="Products *"
              placeholder="Select products for this opportunity..."
              allowCustom
              onAddCustom={(value) => {
                const newProduct = { id: `custom-${Date.now()}`, name: value, version: '' };
                setCustomProducts([...customProducts, newProduct]);
                setValue('products', [...watchedValues.products, newProduct]);
              }}
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Opportunity Owner
              </label>
              <select
                value={watchedValues.owner?.id || ''}
                onChange={(e) => {
                  const selectedOwner = customInternalContacts.find(c => c.id === e.target.value);
                  setValue('owner', selectedOwner || undefined);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
              >
                <option value="">Select Owner...</option>
                {customInternalContacts.map(contact => (
                  <option key={contact.id} value={contact.id}>
                    {contact.name}{contact.role ? ` - ${contact.role}` : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Additional Information */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Additional Information
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Competitor Information
              </label>
              <textarea
                {...register('competitorInfo')}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                placeholder="Key competitors and their positioning..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Next Steps
              </label>
              <textarea
                {...register('nextSteps')}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                placeholder="Upcoming actions and milestones..."
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-gray-700 hover:text-gray-900 font-medium"
          >
            <X className="h-4 w-4 inline mr-2" />
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            {isSubmitting ? 'Saving...' : 'Save Opportunity'}
          </button>
        </div>
      </form>
    </div>
  );
}