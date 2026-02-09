'use client';

import { useState } from 'react';
import { 
  X, Target, DollarSign, Calendar, TrendingUp, User, 
  Package, AlertCircle, ArrowRight, History, Edit, CheckCircle 
} from 'lucide-react';
import { Opportunity, OpportunityStage } from '@/types';

interface OpportunityDetailProps {
  opportunity: Opportunity;
  onClose: () => void;
  onEdit: () => void;
  onStageChange: (newStage: OpportunityStage, notes?: string) => void;
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

const STAGE_COLORS: Record<OpportunityStage, string> = {
  'Plan': 'bg-gray-500',
  'Prospect': 'bg-blue-500',
  'Qualify': 'bg-cyan-500',
  'Discover': 'bg-indigo-500',
  'Differentiate': 'bg-purple-500',
  'Propose': 'bg-pink-500',
  'Close': 'bg-orange-500',
  'Delivery and Success': 'bg-green-500',
  'Expand': 'bg-emerald-500',
};

export function OpportunityDetail({
  opportunity,
  onClose,
  onEdit,
  onStageChange
}: OpportunityDetailProps) {
  const [showStageChange, setShowStageChange] = useState(false);
  const [newStage, setNewStage] = useState<OpportunityStage>(opportunity.currentStage);
  const [stageChangeNotes, setStageChangeNotes] = useState('');

  const formatCurrency = (value?: number, currency?: string) => {
    if (!value) return 'Not specified';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatDate = (date?: Date) => {
    if (!date) return 'Not set';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleStageChange = () => {
    if (newStage !== opportunity.currentStage) {
      onStageChange(newStage, stageChangeNotes);
      setShowStageChange(false);
      setStageChangeNotes('');
    }
  };

  const currentStageIndex = STAGES.indexOf(opportunity.currentStage);

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onClose}
      />
      
      {/* Slide-out Panel */}
      <div className="fixed right-0 top-0 h-full w-full max-w-3xl bg-white shadow-xl z-50 overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 z-10">
          {/* Header */}
          <div className="flex items-center justify-between p-6">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 ${STAGE_COLORS[opportunity.currentStage]} rounded-lg flex items-center justify-center`}>
                <Target className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {opportunity.opportunityName}
                </h2>
                <p className="text-sm text-gray-500">
                  {opportunity.type} • Stage: {opportunity.currentStage}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={onEdit}
                className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                title="Edit Opportunity"
              >
                <Edit className="h-5 w-5" />
              </button>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
          </div>

          {/* Stage Progress */}
          <div className="px-6 pb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Sales Stage Progress</span>
              <button
                onClick={() => setShowStageChange(!showStageChange)}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Change Stage
              </button>
            </div>
            <div className="flex items-center gap-2">
              {STAGES.map((stage, index) => (
                <div key={stage} className="flex-1 flex items-center">
                  <div className="flex-1 flex flex-col items-center">
                    <div
                      className={`w-full h-2 rounded-full transition-all ${
                        index <= currentStageIndex
                          ? STAGE_COLORS[stage]
                          : 'bg-gray-200'
                      }`}
                    />
                    <span className={`text-xs mt-1 text-center ${
                      index === currentStageIndex
                        ? 'font-bold text-gray-900'
                        : index < currentStageIndex
                        ? 'text-gray-600'
                        : 'text-gray-400'
                    }`}>
                      {stage}
                    </span>
                  </div>
                  {index < STAGES.length - 1 && (
                    <ArrowRight className={`h-4 w-4 mx-1 ${
                      index < currentStageIndex ? 'text-gray-600' : 'text-gray-300'
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Stage Change Form */}
          {showStageChange && (
            <div className="px-6 pb-4 border-t border-gray-200 pt-4">
              <div className="bg-blue-50 rounded-lg p-4 space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    New Stage
                  </label>
                  <select
                    value={newStage}
                    onChange={(e) => setNewStage(e.target.value as OpportunityStage)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                  >
                    {STAGES.map(stage => (
                      <option key={stage} value={stage}>
                        {stage}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notes (Optional)
                  </label>
                  <textarea
                    value={stageChangeNotes}
                    onChange={(e) => setStageChangeNotes(e.target.value)}
                    rows={2}
                    placeholder="Why is the stage changing?"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleStageChange}
                    disabled={newStage === opportunity.currentStage}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Update Stage
                  </button>
                  <button
                    onClick={() => {
                      setShowStageChange(false);
                      setNewStage(opportunity.currentStage);
                      setStageChangeNotes('');
                    }}
                    className="px-4 py-2 text-gray-700 hover:text-gray-900"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Description */}
          {opportunity.description && (
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Description</h3>
              <p className="text-gray-900">{opportunity.description}</p>
            </div>
          )}

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="h-5 w-5 text-green-600" />
                <span className="text-sm font-medium text-green-900">Estimated Value</span>
              </div>
              <p className="text-2xl font-bold text-green-900">
                {formatCurrency(opportunity.estimatedValue, opportunity.currency)}
              </p>
              {opportunity.probability && (
                <p className="text-sm text-green-700 mt-1">
                  Probability: {opportunity.probability}%
                </p>
              )}
            </div>

            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="h-5 w-5 text-blue-600" />
                <span className="text-sm font-medium text-blue-900">Expected Close</span>
              </div>
              <p className="text-lg font-semibold text-blue-900">
                {formatDate(opportunity.expectedCloseDate)}
              </p>
            </div>

            <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="h-5 w-5 text-purple-600" />
                <span className="text-sm font-medium text-purple-900">Priority</span>
              </div>
              <p className="text-lg font-semibold text-purple-900">
                {opportunity.priority || 'Not set'}
              </p>
            </div>
          </div>

          {/* Products */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
              <Package className="h-5 w-5" />
              Products ({opportunity.products.length})
            </h3>
            {opportunity.products.length > 0 ? (
              <div className="space-y-2">
                {opportunity.products.map((product) => (
                  <div key={product.id} className="bg-gray-50 rounded p-3">
                    <div className="font-medium text-gray-900">
                      {product.name}
                      {product.version && ` v${product.version}`}
                    </div>
                    {product.description && (
                      <p className="text-sm text-gray-600 mt-1">{product.description}</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No products assigned</p>
            )}
          </div>

          {/* Owner */}
          {opportunity.owner && (
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                <User className="h-5 w-5" />
                Opportunity Owner
              </h3>
              <div className="bg-purple-50 rounded p-3">
                <div className="font-medium text-gray-900">{opportunity.owner.name}</div>
                {opportunity.owner.role && (
                  <p className="text-sm text-gray-600 mt-1">{opportunity.owner.role}</p>
                )}
                {opportunity.owner.email && (
                  <a
                    href={`mailto:${opportunity.owner.email}`}
                    className="text-sm text-blue-600 hover:text-blue-700 mt-1 block"
                  >
                    {opportunity.owner.email}
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Additional Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {opportunity.competitorInfo && (
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Competitor Information</h3>
                <p className="text-sm text-gray-900 whitespace-pre-line">{opportunity.competitorInfo}</p>
              </div>
            )}

            {opportunity.nextSteps && (
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Next Steps</h3>
                <p className="text-sm text-gray-900 whitespace-pre-line">{opportunity.nextSteps}</p>
              </div>
            )}
          </div>

          {/* Stage History */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <History className="h-5 w-5" />
              Stage History
            </h3>
            {opportunity.stageHistory.length > 0 ? (
              <div className="space-y-3">
                {opportunity.stageHistory.map((entry, index) => (
                  <div
                    key={entry.id}
                    className="flex items-start gap-3 pb-3 border-b border-gray-100 last:border-0"
                  >
                    <div className={`w-8 h-8 rounded-full ${STAGE_COLORS[entry.toStage]} flex items-center justify-center flex-shrink-0`}>
                      <CheckCircle className="h-4 w-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        {entry.fromStage && (
                          <>
                            <span className="font-medium text-gray-700">{entry.fromStage}</span>
                            <ArrowRight className="h-4 w-4 text-gray-400" />
                          </>
                        )}
                        <span className="font-medium text-gray-900">{entry.toStage}</span>
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        Changed by {entry.changedBy} on {new Date(entry.changedAt).toLocaleString()}
                      </div>
                      {entry.duration !== undefined && entry.duration > 0 && (
                        <div className="text-xs text-gray-500 mt-1">
                          Previous stage duration: {entry.duration} day{entry.duration !== 1 ? 's' : ''}
                        </div>
                      )}
                      {entry.notes && (
                        <div className="text-sm text-gray-700 mt-2 bg-gray-50 rounded p-2">
                          {entry.notes}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No stage history yet</p>
            )}
          </div>

          {/* Metadata */}
          <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-600">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="font-medium">Created By:</span> {opportunity.createdBy}
              </div>
              <div>
                <span className="font-medium">Created:</span> {formatDate(opportunity.createdAt)}
              </div>
              <div>
                <span className="font-medium">Updated By:</span> {opportunity.updatedBy}
              </div>
              <div>
                <span className="font-medium">Updated:</span> {formatDate(opportunity.updatedAt)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}