import { useState, useCallback } from 'react';
import { Customer } from '@/types';
import { customerService } from '@/lib/customerService';

interface UseCustomerOperationsProps {
  userId?: string;
  onCustomersChange?: (customers: Customer[]) => void;
}

/**
 * Custom hook to manage customer CRUD operations
 * Provides create, update, and delete functionality with defensive error handling
 */
export function useCustomerOperations({ userId, onCustomersChange }: UseCustomerOperationsProps) {
  const [customers, setCustomers] = useState<Customer[]>([]);

  const updateCustomers = useCallback((newCustomers: Customer[]) => {
    setCustomers(newCustomers);
    onCustomersChange?.(newCustomers);
  }, [onCustomersChange]);

  const saveCustomer = useCallback(async (customer: Customer) => {
    if (!userId) return;
    
    try {
      const existingIndex = customers.findIndex(c => c.id === customer.id);
      
      if (existingIndex >= 0 && customer.id) {
        try {
          // Try to update existing customer
          await customerService.updateCustomer(customer.id, customer, userId);
          updateCustomers(customers.map(c => c.id === customer.id ? customer : c));
        } catch (updateError: any) {
          // If update fails (document doesn't exist in Firebase), create new
          console.warn('Update failed, creating new customer instead:', updateError.message);
          const newCustomerId = await customerService.createCustomer(customer, userId);
          const newCustomer = { ...customer, id: newCustomerId };
          // Replace the old entry with the new one
          updateCustomers(customers.map(c => c.id === customer.id ? newCustomer : c));
        }
      } else {
        // Create new customer
        const newCustomerId = await customerService.createCustomer(customer, userId);
        const newCustomer = { ...customer, id: newCustomerId };
        updateCustomers([...customers, newCustomer]);
      }
    } catch (error) {
      console.error('Error saving customer:', error);
      throw error;
    }
  }, [userId, customers, updateCustomers]);

  const deleteCustomer = useCallback(async (customerId: string) => {
    try {
      await customerService.deleteCustomer(customerId);
      updateCustomers(customers.filter(c => c.id !== customerId));
    } catch (error) {
      console.error('Error deleting customer:', error);
      throw error;
    }
  }, [customers, updateCustomers]);

  return {
    customers,
    setCustomers: updateCustomers,
    saveCustomer,
    deleteCustomer
  };
}
