'use client';

import { Search, Building } from 'lucide-react';

interface CustomerEmptyStateProps {
  type: 'no-results' | 'no-customers';
  onClearFilters?: () => void;
}

export function CustomerEmptyState({ type, onClearFilters }: CustomerEmptyStateProps) {
  if (type === 'no-results') {
    return (
      <div className="text-center py-12">
        <Search className="mx-auto h-12 w-12 text-gray-300" />
        <p className="mt-3 text-sm text-gray-500">No customers found matching your filters</p>
        {onClearFilters && (
          <button
            onClick={onClearFilters}
            className="mt-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            Clear all filters
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="text-center py-12">
      <Building className="mx-auto h-12 w-12 text-gray-300" />
      <p className="mt-3 text-sm text-gray-500">No customers available</p>
    </div>
  );
}
