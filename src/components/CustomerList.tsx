'use client';

import { useState, useMemo } from 'react';
import { Customer } from '@/types';
import { useCustomerFilters, useCustomerSearch, useCustomerSort } from '@/hooks';
import {
  CustomerListHeader,
  CustomerSearchBar,
  CustomerFilterPanel,
  CustomerGridView,
  CustomerTableView,
  CustomerEmptyState,
} from './customers';

type ViewMode = 'grid' | 'list';

interface CustomerListProps {
  customers: Customer[];
  selectedCustomer: string | null;
  onSelectCustomer: (customerId: string | null) => void;
}

export function CustomerList({ 
  customers,
  selectedCustomer, 
  onSelectCustomer
}: CustomerListProps) {
  // View state
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [showFilters, setShowFilters] = useState(false);
  
  // Custom hooks
  const { searchTerm, setSearchTerm, filteredCustomers: searchFilteredCustomers } = useCustomerSearch(customers);
  const { sortBy, setSortBy, sortCustomers } = useCustomerSort();
  const filters = useCustomerFilters(customers);
  
  // Combined filtering and sorting
  const filteredAndSortedCustomers = useMemo(() => {
    // Apply search filter first
    let result = searchFilteredCustomers;
    
    // Apply additional filters
    result = filters.applyFilters(result);
    
    // Apply sorting
    result = sortCustomers(result);
    
    return result;
  }, [searchFilteredCustomers, filters, sortCustomers]);
  
  return (
    <div className="space-y-4">
      {/* Header */}
      <CustomerListHeader
        totalCustomers={customers.length}
        filteredCount={filteredAndSortedCustomers.length}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />
      
      {/* Search and Filter Bar */}
      <CustomerSearchBar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        sortBy={sortBy}
        onSortChange={setSortBy}
        showFilters={showFilters}
        onToggleFilters={() => setShowFilters(!showFilters)}
        activeFiltersCount={filters.activeFiltersCount}
      />
      
      {/* Filter Panel */}
      {showFilters && (
        <CustomerFilterPanel
          selectedYear={filters.selectedYear}
          selectedProducts={filters.selectedProducts}
          selectedPartners={filters.selectedPartners}
          selectedAccountExecs={filters.selectedAccountExecs}
          dateFilter={filters.dateFilter}
          startDate={filters.startDate}
          endDate={filters.endDate}
          filterOptions={filters.filterOptions}
          onYearChange={filters.setSelectedYear}
          onDateFilterChange={filters.setDateFilter}
          onStartDateChange={filters.setStartDate}
          onEndDateChange={filters.setEndDate}
          onToggleProduct={filters.toggleProductFilter}
          onTogglePartner={filters.togglePartnerFilter}
          onToggleAccountExec={filters.toggleAccountExecFilter}
          onClearAll={filters.clearAllFilters}
          activeFiltersCount={filters.activeFiltersCount}
        />
      )}

      {/* Customer Views */}
      {filteredAndSortedCustomers.length > 0 ? (
        <>
          {viewMode === 'grid' ? (
            <CustomerGridView
              customers={filteredAndSortedCustomers}
              selectedCustomerId={selectedCustomer}
              onSelectCustomer={onSelectCustomer}
            />
          ) : (
            <CustomerTableView
              customers={filteredAndSortedCustomers}
              selectedCustomerId={selectedCustomer}
              onSelectCustomer={onSelectCustomer}
            />
          )}
        </>
      ) : (
        <CustomerEmptyState
          type={customers.length === 0 ? 'no-customers' : 'no-results'}
          onClearFilters={customers.length > 0 ? filters.clearAllFilters : undefined}
        />
      )}
    </div>
  );
}
