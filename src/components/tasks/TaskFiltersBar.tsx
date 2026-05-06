'use client';

import { FilterX, Search } from 'lucide-react';
import type { Product, TaskCategory, TaskKanbanStatus, Customer } from '@/types';
import { formatProductDisplayName } from '@/lib/productDisplay';

interface TaskFiltersBarProps {
  searchQuery: string;
  onSearchQueryChange: (value: string) => void;
  filterStatus: TaskKanbanStatus | '';
  onFilterStatusChange: (value: TaskKanbanStatus | '') => void;
  filterCategoryId: string;
  onFilterCategoryIdChange: (value: string) => void;
  filterCustomerId: string;
  onFilterCustomerIdChange: (value: string) => void;
  filterProductId: string;
  onFilterProductIdChange: (value: string) => void;
  taskCategories: TaskCategory[];
  customers: Customer[];
  products: Product[];
  hasActiveFilters: boolean;
  onClearFilters: () => void;
  totalCount: number;
  filteredCount: number;
  sidebarCalendarDateActive: boolean;
}

export function TaskFiltersBar({
  searchQuery,
  onSearchQueryChange,
  filterStatus,
  onFilterStatusChange,
  filterCategoryId,
  onFilterCategoryIdChange,
  filterCustomerId,
  onFilterCustomerIdChange,
  filterProductId,
  onFilterProductIdChange,
  taskCategories,
  customers,
  products,
  hasActiveFilters,
  onClearFilters,
  totalCount,
  filteredCount,
  sidebarCalendarDateActive,
}: TaskFiltersBarProps) {
  return (
    <div className="rounded-[1.25rem] hub-glass p-6 ring-1 ring-white/70">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-gray-800">
          <Search className="h-4 w-4 text-slate-500 shrink-0" aria-hidden />
          Search &amp; filters
        </div>
        {hasActiveFilters ? (
          <button
            type="button"
            onClick={onClearFilters}
            className="inline-flex items-center justify-center gap-2 text-sm font-semibold text-violet-800 hover:text-violet-950 px-3 py-1.5 rounded-lg border border-[#9381FF]/35 bg-[#9381FF]/12 hover:bg-[#9381FF]/18 transition-colors w-fit"
          >
            <FilterX className="h-4 w-4 shrink-0" aria-hidden />
            Clear filters
          </button>
        ) : null}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        <input
          type="search"
          value={searchQuery}
          onChange={(e) => onSearchQueryChange(e.target.value)}
          placeholder="Search title, description, account…"
          className="input-field w-full lg:col-span-2"
          aria-label="Search tasks"
        />
        <select
          value={filterStatus}
          onChange={(e) => onFilterStatusChange((e.target.value || '') as TaskKanbanStatus | '')}
          className="select-field w-full"
          aria-label="Filter by status"
        >
          <option value="">All statuses</option>
          <option value="todo">Not started</option>
          <option value="in_progress">In progress</option>
          <option value="done">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <select
          value={filterCategoryId}
          onChange={(e) => onFilterCategoryIdChange(e.target.value)}
          className="select-field w-full"
          aria-label="Filter by category"
        >
          <option value="">All categories</option>
          {taskCategories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <select
          value={filterCustomerId}
          onChange={(e) => onFilterCustomerIdChange(e.target.value)}
          className="select-field w-full"
          aria-label="Filter by account"
        >
          <option value="">All accounts</option>
          {customers
            .slice()
            .sort((a, b) => a.customerName.localeCompare(b.customerName))
            .map((c) => (
              <option key={c.id} value={c.id}>
                {c.customerName}
              </option>
            ))}
        </select>
        <select
          value={filterProductId}
          onChange={(e) => onFilterProductIdChange(e.target.value)}
          className="select-field w-full sm:col-span-2 lg:col-span-1"
          aria-label="Filter by product"
        >
          <option value="">All products</option>
          {products
            .slice()
            .sort((a, b) => formatProductDisplayName(a).localeCompare(formatProductDisplayName(b)))
            .map((p) => (
              <option key={p.id} value={p.id}>
                {formatProductDisplayName(p)}
              </option>
            ))}
        </select>
      </div>
      <p className="text-xs text-gray-600 border-t border-slate-100/80 pt-3 mt-1">
        Showing <span className="font-semibold text-gray-800">{filteredCount}</span> of{' '}
        <span className="font-semibold text-gray-800">{totalCount}</span> tasks
        {filteredCount !== totalCount || sidebarCalendarDateActive
          ? ` — filters narrow what you see; drag-drop still saves to the full list.${sidebarCalendarDateActive ? ' Calendar day filter is on.' : ''}`
          : '.'}
      </p>
    </div>
  );
}

