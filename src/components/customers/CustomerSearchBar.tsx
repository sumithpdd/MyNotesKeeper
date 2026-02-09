'use client';

import { Search, Filter } from 'lucide-react';
import { SortBy } from '@/hooks';

interface CustomerSearchBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  sortBy: SortBy;
  onSortChange: (value: SortBy) => void;
  showFilters: boolean;
  onToggleFilters: () => void;
  activeFiltersCount: number;
}

export function CustomerSearchBar({
  searchTerm,
  onSearchChange,
  sortBy,
  onSortChange,
  showFilters,
  onToggleFilters,
  activeFiltersCount,
}: CustomerSearchBarProps) {
  return (
    <div className="flex gap-3">
      {/* Search */}
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search customers by name, products, contacts, partners..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
      
      {/* Filter Toggle */}
      <button
        onClick={onToggleFilters}
        className={`flex items-center gap-2 px-4 py-3 rounded-lg border transition-colors ${
          showFilters || activeFiltersCount > 0
            ? 'bg-blue-50 border-blue-300 text-blue-700'
            : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
        }`}
      >
        <Filter className="h-5 w-5" />
        <span className="font-medium">Filters</span>
        {activeFiltersCount > 0 && (
          <span className="bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full">
            {activeFiltersCount}
          </span>
        )}
      </button>
      
      {/* Sort */}
      <select
        value={sortBy}
        onChange={(e) => onSortChange(e.target.value as SortBy)}
        className="px-4 py-3 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="name">Sort by Name</option>
        <option value="created">Sort by Created Date</option>
        <option value="updated">Sort by Updated Date</option>
        <option value="products">Sort by Products Count</option>
      </select>
    </div>
  );
}
