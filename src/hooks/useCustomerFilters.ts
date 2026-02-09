import { useState, useMemo } from 'react';
import { Customer, Product, Partner, InternalContact } from '@/types';

export interface CustomerFilters {
  year: string;
  products: string[];
  partners: string[];
  accountExecutives: string[];
  dateFilter: 'all' | 'created' | 'updated';
  startDate: string;
  endDate: string;
}

export interface FilterOptions {
  years: number[];
  allProducts: Product[];
  allPartners: Partner[];
  allAccountExecs: InternalContact[];
}

export function useCustomerFilters(customers: Customer[]) {
  // Filter State
  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [selectedPartners, setSelectedPartners] = useState<string[]>([]);
  const [selectedAccountExecs, setSelectedAccountExecs] = useState<string[]>([]);
  const [dateFilter, setDateFilter] = useState<'all' | 'created' | 'updated'>('all');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  // Get unique values for filters
  const filterOptions = useMemo<FilterOptions>(() => {
    const yearsSet = new Set<number>();
    const productsMap = new Map<string, Product>();
    const partnersMap = new Map<string, Partner>();
    const accountExecsMap = new Map<string, InternalContact>();
    
    customers.forEach(customer => {
      // Years
      yearsSet.add(new Date(customer.createdAt).getFullYear());
      yearsSet.add(new Date(customer.updatedAt).getFullYear());
      
      // Products
      customer.products.forEach(p => productsMap.set(p.id, p));
      
      // Partners
      customer.partners.forEach(p => partnersMap.set(p.id, p));
      
      // Account Executives
      if (customer.accountExecutive) {
        accountExecsMap.set(customer.accountExecutive.id, customer.accountExecutive);
      }
    });
    
    return {
      years: Array.from(yearsSet).sort((a, b) => b - a),
      allProducts: Array.from(productsMap.values()).sort((a, b) => a.name.localeCompare(b.name)),
      allPartners: Array.from(partnersMap.values()).sort((a, b) => a.name.localeCompare(b.name)),
      allAccountExecs: Array.from(accountExecsMap.values()).sort((a, b) => a.name.localeCompare(b.name))
    };
  }, [customers]);

  const activeFiltersCount = 
    (selectedYear !== 'all' ? 1 : 0) +
    selectedProducts.length +
    selectedPartners.length +
    selectedAccountExecs.length +
    (startDate && endDate ? 1 : 0);

  const clearAllFilters = () => {
    setSelectedYear('all');
    setSelectedProducts([]);
    setSelectedPartners([]);
    setSelectedAccountExecs([]);
    setDateFilter('all');
    setStartDate('');
    setEndDate('');
  };

  const toggleProductFilter = (productId: string) => {
    setSelectedProducts(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const togglePartnerFilter = (partnerId: string) => {
    setSelectedPartners(prev =>
      prev.includes(partnerId)
        ? prev.filter(id => id !== partnerId)
        : [...prev, partnerId]
    );
  };

  const toggleAccountExecFilter = (execId: string) => {
    setSelectedAccountExecs(prev =>
      prev.includes(execId)
        ? prev.filter(id => id !== execId)
        : [...prev, execId]
    );
  };

  const applyFilters = (customerList: Customer[]): Customer[] => {
    let filtered = customerList;
    
    // Year filter
    if (selectedYear !== 'all') {
      const year = parseInt(selectedYear);
      filtered = filtered.filter(customer => 
        new Date(customer.createdAt).getFullYear() === year ||
        new Date(customer.updatedAt).getFullYear() === year
      );
    }
    
    // Date range filter
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      filtered = filtered.filter(customer => {
        const dateToCheck = dateFilter === 'created' 
          ? new Date(customer.createdAt)
          : dateFilter === 'updated'
          ? new Date(customer.updatedAt)
          : null;
        
        if (dateToCheck) {
          return dateToCheck >= start && dateToCheck <= end;
        }
        return true;
      });
    }
    
    // Products filter
    if (selectedProducts.length > 0) {
      filtered = filtered.filter(customer =>
        customer.products.some(p => selectedProducts.includes(p.id))
      );
    }
    
    // Partners filter
    if (selectedPartners.length > 0) {
      filtered = filtered.filter(customer =>
        customer.partners.some(p => selectedPartners.includes(p.id))
      );
    }
    
    // Account Executive filter
    if (selectedAccountExecs.length > 0) {
      filtered = filtered.filter(customer =>
        customer.accountExecutive && selectedAccountExecs.includes(customer.accountExecutive.id)
      );
    }
    
    return filtered;
  };

  return {
    // State
    selectedYear,
    selectedProducts,
    selectedPartners,
    selectedAccountExecs,
    dateFilter,
    startDate,
    endDate,
    // Setters
    setSelectedYear,
    setSelectedProducts,
    setSelectedPartners,
    setSelectedAccountExecs,
    setDateFilter,
    setStartDate,
    setEndDate,
    // Computed
    filterOptions,
    activeFiltersCount,
    // Actions
    clearAllFilters,
    toggleProductFilter,
    togglePartnerFilter,
    toggleAccountExecFilter,
    applyFilters,
  };
}
