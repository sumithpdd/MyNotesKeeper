import { db } from './firebase';
import { collection, addDoc, updateDoc, deleteDoc, doc, getDocs, query, where, Timestamp } from 'firebase/firestore';
import { CustomerContact, InternalContact } from '@/types';

/**
 * Service for managing CustomerContacts and InternalContacts in Firebase
 */

// CustomerContacts Collection Operations

export const customerContactService = {
  /**
   * Get all customer contacts
   */
  async getAllCustomerContacts(): Promise<CustomerContact[]> {
    try {
      const querySnapshot = await getDocs(collection(db, 'customerContacts'));
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as CustomerContact[];
    } catch (error) {
      console.error('Error getting customer contacts:', error);
      return [];
    }
  },

  /**
   * Create a new customer contact
   */
  async createCustomerContact(contact: Omit<CustomerContact, 'id'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, 'customerContacts'), {
        ...contact,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });
      console.log('Created customer contact:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('Error creating customer contact:', error);
      throw new Error('Failed to create customer contact');
    }
  },

  /**
   * Update a customer contact
   */
  async updateCustomerContact(contactId: string, contact: Partial<CustomerContact>): Promise<void> {
    try {
      const contactRef = doc(db, 'customerContacts', contactId);
      await updateDoc(contactRef, {
        ...contact,
        updatedAt: Timestamp.now()
      });
      console.log('Updated customer contact:', contactId);
    } catch (error) {
      console.error('Error updating customer contact:', error);
      throw new Error('Failed to update customer contact');
    }
  },

  /**
   * Delete a customer contact
   */
  async deleteCustomerContact(contactId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'customerContacts', contactId));
      console.log('Deleted customer contact:', contactId);
    } catch (error) {
      console.error('Error deleting customer contact:', error);
      throw new Error('Failed to delete customer contact');
    }
  },

  /**
   * Check if contact exists by name and email
   */
  async contactExists(name: string, email?: string): Promise<CustomerContact | null> {
    try {
      const q = email 
        ? query(collection(db, 'customerContacts'), where('name', '==', name), where('email', '==', email))
        : query(collection(db, 'customerContacts'), where('name', '==', name));
      
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        return { id: doc.id, ...doc.data() } as CustomerContact;
      }
      return null;
    } catch (error) {
      console.error('Error checking contact existence:', error);
      return null;
    }
  }
};

// InternalContacts Collection Operations

export const internalContactService = {
  /**
   * Get all internal contacts
   */
  async getAllInternalContacts(): Promise<InternalContact[]> {
    try {
      const querySnapshot = await getDocs(collection(db, 'internalContacts'));
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as InternalContact[];
    } catch (error) {
      console.error('Error getting internal contacts:', error);
      return [];
    }
  },

  /**
   * Create a new internal contact
   */
  async createInternalContact(contact: Omit<InternalContact, 'id'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, 'internalContacts'), {
        ...contact,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });
      console.log('Created internal contact:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('Error creating internal contact:', error);
      throw new Error('Failed to create internal contact');
    }
  },

  /**
   * Update an internal contact
   */
  async updateInternalContact(contactId: string, contact: Partial<InternalContact>): Promise<void> {
    try {
      const contactRef = doc(db, 'internalContacts', contactId);
      await updateDoc(contactRef, {
        ...contact,
        updatedAt: Timestamp.now()
      });
      console.log('Updated internal contact:', contactId);
    } catch (error) {
      console.error('Error updating internal contact:', error);
      throw new Error('Failed to update internal contact');
    }
  },

  /**
   * Delete an internal contact
   */
  async deleteInternalContact(contactId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'internalContacts', contactId));
      console.log('Deleted internal contact:', contactId);
    } catch (error) {
      console.error('Error deleting internal contact:', error);
      throw new Error('Failed to delete internal contact');
    }
  },

  /**
   * Check if internal contact exists by name or email
   */
  async contactExists(name: string, email?: string): Promise<InternalContact | null> {
    try {
      const q = email 
        ? query(collection(db, 'internalContacts'), where('email', '==', email))
        : query(collection(db, 'internalContacts'), where('name', '==', name));
      
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        return { id: doc.id, ...doc.data() } as InternalContact;
      }
      return null;
    } catch (error) {
      console.error('Error checking internal contact existence:', error);
      return null;
    }
  }
};
