'use client';

import { Calendar, Package, ExternalLink, User } from 'lucide-react';
import { FilterOptions } from '@/hooks';

interface CustomerFilterPanelProps {
  // Filter Values
  selectedYear: string;
  selectedProducts: string[];
  selectedPartners: string[];
  selectedAccountExecs: string[];
  dateFilter: 'all' | 'created' | 'updated';
  startDate: string;
  endDate: string;
  
  // Filter Options
  filterOptions: FilterOptions;
  
  // Handlers
  onYearChange: (year: string) => void;
  onDateFilterChange: (filter: 'all' | 'created' | 'updated') => void;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
  onToggleProduct: (productId: string) => void;
  onTogglePartner: (partnerId: string) => void;
  onToggleAccountExec: (execId: string) => void;
  onClearAll: () => void;
  
  activeFiltersCount: number;
}

export function CustomerFilterPanel({
  selectedYear,
  selectedProducts,
  selectedPartners,
  selectedAccountExecs,
  dateFilter,
  startDate,
  endDate,
  filterOptions,
  onYearChange,
  onDateFilterChange,
  onStartDateChange,
  onEndDateChange,
  onToggleProduct,
  onTogglePartner,
  onToggleAccountExec,
  onClearAll,
  activeFiltersCount,
}: CustomerFilterPanelProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-900">Filters</h3>
        {activeFiltersCount > 0 && (
          <button
            onClick={onClearAll}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            Clear All
          </button>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Year Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Calendar className="inline h-4 w-4 mr-1" />
            Year
          </label>
          <select
            value={selectedYear}
            onChange={(e) => onYearChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Years</option>
            {filterOptions.years.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>
        
        {/* Date Range Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Calendar className="inline h-4 w-4 mr-1" />
            Date Range
          </label>
          <select
            value={dateFilter}
            onChange={(e) => onDateFilterChange(e.target.value as typeof dateFilter)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
          >
            <option value="all">All Dates</option>
            <option value="created">Created Date</option>
            <option value="updated">Updated Date</option>
          </select>
          {dateFilter !== 'all' && (
            <div className="space-y-2">
              <input
                type="date"
                value={startDate}
                onChange={(e) => onStartDateChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                placeholder="Start Date"
              />
              <input
                type="date"
                value={endDate}
                onChange={(e) => onEndDateChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                placeholder="End Date"
              />
            </div>
          )}
        </div>
        
        {/* Products Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Package className="inline h-4 w-4 mr-1" />
            Products ({selectedProducts.length})
          </label>
          <div className="max-h-40 overflow-y-auto border border-gray-300 rounded-lg p-2 space-y-1">
            {filterOptions.allProducts.map(product => (
              <label key={product.id} className="flex items-center gap-2 p-1 hover:bg-gray-50 rounded cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedProducts.includes(product.id)}
                  onChange={() => onToggleProduct(product.id)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm">{product.name}</span>
              </label>
            ))}
            {filterOptions.allProducts.length === 0 && (
              <p className="text-sm text-gray-500 text-center py-2">No products</p>
            )}
          </div>
        </div>
        
        {/* Partners Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <ExternalLink className="inline h-4 w-4 mr-1" />
            Partners ({selectedPartners.length})
          </label>
          <div className="max-h-40 overflow-y-auto border border-gray-300 rounded-lg p-2 space-y-1">
            {filterOptions.allPartners.map(partner => (
              <label key={partner.id} className="flex items-center gap-2 p-1 hover:bg-gray-50 rounded cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedPartners.includes(partner.id)}
                  onChange={() => onTogglePartner(partner.id)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm">{partner.name}</span>
              </label>
            ))}
            {filterOptions.allPartners.length === 0 && (
              <p className="text-sm text-gray-500 text-center py-2">No partners</p>
            )}
          </div>
        </div>
        
        {/* Account Executive Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <User className="inline h-4 w-4 mr-1" />
            Account Executive ({selectedAccountExecs.length})
          </label>
          <div className="max-h-40 overflow-y-auto border border-gray-300 rounded-lg p-2 space-y-1">
            {filterOptions.allAccountExecs.map(exec => (
              <label key={exec.id} className="flex items-center gap-2 p-1 hover:bg-gray-50 rounded cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedAccountExecs.includes(exec.id)}
                  onChange={() => onToggleAccountExec(exec.id)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm">{exec.name}</span>
              </label>
            ))}
            {filterOptions.allAccountExecs.length === 0 && (
              <p className="text-sm text-gray-500 text-center py-2">No account executives</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
