'use client';

import { Grid3x3, List } from 'lucide-react';

type ViewMode = 'grid' | 'list';

interface CustomerListHeaderProps {
  totalCustomers: number;
  filteredCount: number;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
}

export function CustomerListHeader({
  totalCustomers,
  filteredCount,
  viewMode,
  onViewModeChange,
}: CustomerListHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Customer Directory</h2>
        <p className="text-sm text-gray-600">
          {filteredCount} of {totalCustomers} customers
        </p>
      </div>
      
      {/* View Mode Toggle */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => onViewModeChange('grid')}
          className={`p-2 rounded-lg transition-colors ${
            viewMode === 'grid'
              ? 'bg-blue-100 text-blue-600'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
          title="Grid View"
        >
          <Grid3x3 className="h-5 w-5" />
        </button>
        <button
          onClick={() => onViewModeChange('list')}
          className={`p-2 rounded-lg transition-colors ${
            viewMode === 'list'
              ? 'bg-blue-100 text-blue-600'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
          title="List View"
        >
          <List className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
