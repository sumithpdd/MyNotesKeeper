'use client';

import { useState, useMemo } from 'react';
import { Target, Plus, Edit, Trash2, Eye, TrendingUp, DollarSign, Calendar, Filter, ArrowUpDown } from 'lucide-react';
import { Opportunity, OpportunityStage } from '@/types';

interface OpportunityListProps {
  opportunities: Opportunity[];
  customerId: string;
  onSelectOpportunity: (opportunityId: string) => void;
  onEditOpportunity: (opportunity: Opportunity) => void;
  onDeleteOpportunity: (opportunityId: string) => void;
  onAddOpportunity: () => void;
}

const STAGE_COLORS: Record<OpportunityStage, string> = {
  'Plan': 'bg-gray-100 text-gray-800 border-gray-300',
  'Prospect': 'bg-blue-100 text-blue-800 border-blue-300',
  'Qualify': 'bg-cyan-100 text-cyan-800 border-cyan-300',
  'Discover': 'bg-indigo-100 text-indigo-800 border-indigo-300',
  'Differentiate': 'bg-purple-100 text-purple-800 border-purple-300',
  'Propose': 'bg-pink-100 text-pink-800 border-pink-300',
  'Close': 'bg-orange-100 text-orange-800 border-orange-300',
  'Delivery and Success': 'bg-green-100 text-green-800 border-green-300',
  'Expand': 'bg-emerald-100 text-emerald-800 border-emerald-300',
};

const PRIORITY_COLORS = {
  'Low': 'bg-gray-100 text-gray-700',
  'Medium': 'bg-blue-100 text-blue-700',
  'High': 'bg-orange-100 text-orange-700',
  'Critical': 'bg-red-100 text-red-700',
};

export function OpportunityList({
  opportunities,
  customerId,
  onSelectOpportunity,
  onEditOpportunity,
  onDeleteOpportunity,
  onAddOpportunity
}: OpportunityListProps) {
  const [filterStage, setFilterStage] = useState<OpportunityStage | 'All'>('All');
  const [sortBy, setSortBy] = useState<'name' | 'stage' | 'value' | 'date'>('name');

  // Filter opportunities for this customer
  const customerOpportunities = useMemo(() => {
    return opportunities.filter(opp => opp.customerId === customerId);
  }, [opportunities, customerId]);

  // Apply filters and sorting
  const filteredAndSortedOpportunities = useMemo(() => {
    let filtered = customerOpportunities;

    // Stage filter
    if (filterStage !== 'All') {
      filtered = filtered.filter(opp => opp.currentStage === filterStage);
    }

    // Sort
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.opportunityName.localeCompare(b.opportunityName);
        case 'stage':
          return a.currentStage.localeCompare(b.currentStage);
        case 'value':
          return (b.estimatedValue || 0) - (a.estimatedValue || 0);
        case 'date':
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        default:
          return 0;
      }
    });

    return sorted;
  }, [customerOpportunities, filterStage, sortBy]);

  const formatCurrency = (value?: number, currency?: string) => {
    if (!value) return '-';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const getStageProgress = (stage: OpportunityStage): number => {
    const stages: OpportunityStage[] = [
      'Plan', 'Prospect', 'Qualify', 'Discover', 'Differentiate', 
      'Propose', 'Close', 'Delivery and Success', 'Expand'
    ];
    return ((stages.indexOf(stage) + 1) / stages.length) * 100;
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Opportunities</h3>
          <p className="text-sm text-gray-600">
            {filteredAndSortedOpportunities.length} of {customerOpportunities.length} opportunities
          </p>
        </div>
        <button
          onClick={onAddOpportunity}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          New Opportunity
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-500" />
          <select
            value={filterStage}
            onChange={(e) => setFilterStage(e.target.value as OpportunityStage | 'All')}
            className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="All">All Stages</option>
            <option value="Plan">Plan</option>
            <option value="Prospect">Prospect</option>
            <option value="Qualify">Qualify</option>
            <option value="Discover">Discover</option>
            <option value="Differentiate">Differentiate</option>
            <option value="Propose">Propose</option>
            <option value="Close">Close</option>
            <option value="Delivery and Success">Delivery and Success</option>
            <option value="Expand">Expand</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <ArrowUpDown className="h-4 w-4 text-gray-500" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="name">Sort by Name</option>
            <option value="stage">Sort by Stage</option>
            <option value="value">Sort by Value</option>
            <option value="date">Sort by Updated</option>
          </select>
        </div>
      </div>

      {/* Opportunities List */}
      {filteredAndSortedOpportunities.length > 0 ? (
        <div className="space-y-3">
          {filteredAndSortedOpportunities.map((opportunity) => (
            <div
              key={opportunity.id}
              className="bg-white border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:shadow-sm transition-all"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  {/* Header */}
                  <div className="flex items-center gap-3 mb-2">
                    <button
                      onClick={() => onSelectOpportunity(opportunity.id)}
                      className="text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors"
                    >
                      {opportunity.opportunityName}
                    </button>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${STAGE_COLORS[opportunity.currentStage]}`}>
                      {opportunity.currentStage}
                    </span>
                    {opportunity.priority && (
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${PRIORITY_COLORS[opportunity.priority]}`}>
                        {opportunity.priority}
                      </span>
                    )}
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all"
                      style={{ width: `${getStageProgress(opportunity.currentStage)}%` }}
                    />
                  </div>

                  {/* Details */}
                  <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                    {opportunity.estimatedValue && (
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-4 w-4" />
                        <span className="font-medium text-gray-900">
                          {formatCurrency(opportunity.estimatedValue, opportunity.currency)}
                        </span>
                        {opportunity.probability && (
                          <span className="text-gray-500">({opportunity.probability}%)</span>
                        )}
                      </div>
                    )}
                    
                    {opportunity.type && (
                      <div className="flex items-center gap-1">
                        <Target className="h-4 w-4" />
                        <span>{opportunity.type}</span>
                      </div>
                    )}

                    {opportunity.expectedCloseDate && (
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>Close: {new Date(opportunity.expectedCloseDate).toLocaleDateString()}</span>
                      </div>
                    )}

                    {opportunity.owner && (
                      <div className="flex items-center gap-1">
                        <TrendingUp className="h-4 w-4" />
                        <span>{opportunity.owner.name}</span>
                      </div>
                    )}
                  </div>

                  {/* Products */}
                  {opportunity.products.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {opportunity.products.slice(0, 3).map((product) => (
                        <span
                          key={product.id}
                          className="inline-flex items-center px-2 py-1 rounded text-xs bg-gray-100 text-gray-700"
                        >
                          {product.name}
                        </span>
                      ))}
                      {opportunity.products.length > 3 && (
                        <span className="text-xs text-gray-500 px-1">
                          +{opportunity.products.length - 3} more
                        </span>
                      )}
                    </div>
                  )}

                  {/* Description */}
                  {opportunity.description && (
                    <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                      {opportunity.description}
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 ml-4">
                  <button
                    onClick={() => onSelectOpportunity(opportunity.id)}
                    className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="View Details"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => onEditOpportunity(opportunity)}
                    className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Edit"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Are you sure you want to delete "${opportunity.opportunityName}"?`)) {
                        onDeleteOpportunity(opportunity.id);
                      }
                    }}
                    className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <Target className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-3 text-sm font-medium text-gray-900">No opportunities</h3>
          <p className="mt-1 text-sm text-gray-500">
            {filterStage !== 'All' 
              ? `No opportunities in ${filterStage} stage`
              : 'Get started by creating a new opportunity'}
          </p>
          <button
            onClick={onAddOpportunity}
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            New Opportunity
          </button>
        </div>
      )}
    </div>
  );
}