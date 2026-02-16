import { useState, useEffect } from 'react';
import { Customer, CustomerNote, CustomerProfile, Opportunity, Product, Partner, CustomerContact, InternalContact } from '@/types';
import { customerService } from '@/lib/customerService';
import { customerNotesService } from '@/lib/customerNotes';
import { customerProfileService } from '@/lib/customerProfileService';
import { opportunityService } from '@/lib/opportunityService';
import { productService } from '@/lib/productService';
import { partnerService } from '@/lib/partnerService';
import { customerContactService, internalContactService } from '@/lib/contactService';
import { contactResolver } from '@/lib/contactResolver';
import { generateDummyCustomers, generateDummyNotes, generateDummyCustomerProfiles } from '../../data/dummyData';

interface FirebaseData {
  customers: Customer[];
  notes: CustomerNote[];
  customerProfiles: CustomerProfile[];
  opportunities: Opportunity[];
  products: Product[];
  partners: Partner[];
  customerContacts: CustomerContact[];
  internalContacts: InternalContact[];
  loading: boolean;
}

/**
 * Custom hook to load and manage Firebase data
 * Handles loading all entities from Firebase and enriching customers with resolved references
 * Falls back to dummy data if Firebase fails
 */
export function useFirebaseData(userId?: string) {
  const [data, setData] = useState<FirebaseData>({
    customers: [],
    notes: [],
    customerProfiles: [],
    opportunities: [],
    products: [],
    partners: [],
    customerContacts: [],
    internalContacts: [],
    loading: true
  });

  useEffect(() => {
    if (userId) {
      loadFirebaseData();
    }
  }, [userId]);

  const loadFirebaseData = async () => {
    try {
      setData(prev => ({ ...prev, loading: true }));
      
      // Load all data in parallel
      const [
        customersData, 
        notesData, 
        opportunitiesData,
        productsData,
        partnersData,
        customerContactsData,
        internalContactsData
      ] = await Promise.all([
        customerService.getAllCustomers(),
        customerNotesService.getAllNotes(),
        opportunityService.getAllOpportunities(),
        productService.getAllProducts(),
        partnerService.getAllPartners(),
        customerContactService.getAllCustomerContacts(),
        internalContactService.getAllInternalContacts()
      ]);
      
      // Enrich customers with resolved references (IDs → full objects)
      const enrichedCustomers = await contactResolver.enrichCustomers(customersData);
      
      // Ensure all customers have required fields with default values
      const customersWithDefaults = enrichedCustomers.map(customer => ({
        ...customer,
        products: customer.products || [],
        customerContacts: customer.customerContacts || [],
        internalContacts: customer.internalContacts || [],
        partners: customer.partners || [],
        website: customer.website || '',
        sharePointUrl: customer.sharePointUrl || '',
        salesforceLink: customer.salesforceLink || '',
        additionalLink: customer.additionalLink || '',
        additionalInfo: customer.additionalInfo || '',
        createdAt: customer.createdAt || new Date(),
        updatedAt: customer.updatedAt || new Date()
      }));
      
      // Ensure all notes have required fields with default values
      const notesWithDefaults = notesData.map(note => ({
        ...note,
        createdAt: note.createdAt || new Date(),
        updatedAt: note.updatedAt || new Date(),
        otherFields: note.otherFields || {}
      }));
      
      // Load customer profiles for each customer
      const profiles = await Promise.all(
        customersWithDefaults.map(customer => 
          customerProfileService.getProfileByCustomerId(customer.id)
        )
      );
      
      console.log('✅ All Firebase data loaded:', {
        customers: customersWithDefaults.length,
        notes: notesWithDefaults.length,
        opportunities: opportunitiesData.length,
        products: productsData.length,
        partners: partnersData.length,
        customerContacts: customerContactsData.length,
        internalContacts: internalContactsData.length
      });
      
      setData({
        customers: customersWithDefaults,
        notes: notesWithDefaults,
        customerProfiles: profiles.filter(profile => profile !== null) as CustomerProfile[],
        opportunities: opportunitiesData,
        products: productsData,
        partners: partnersData,
        customerContacts: customerContactsData,
        internalContacts: internalContactsData,
        loading: false
      });
    } catch (error) {
      console.error('Error loading Firebase data:', error);
      // Fallback to dummy data if Firebase fails
      setData({
        customers: generateDummyCustomers(),
        notes: generateDummyNotes(),
        customerProfiles: generateDummyCustomerProfiles(),
        opportunities: [],
        products: [],
        partners: [],
        customerContacts: [],
        internalContacts: [],
        loading: false
      });
    }
  };

  const reloadData = () => {
    if (userId) {
      loadFirebaseData();
    }
  };

  return {
    ...data,
    reloadData
  };
}
