import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDocs,
  getDoc,
  query,
  orderBy,
  Timestamp 
} from 'firebase/firestore';
import { db } from './firebase';
import { Partner } from '@/types';

/**
 * Partner Service
 * CRUD operations for partners collection
 */

export const partnerService = {
  /**
   * Get all partners
   */
  async getAllPartners(): Promise<Partner[]> {
    try {
      const partnersRef = collection(db, 'partners');
      const q = query(partnersRef, orderBy('name', 'asc'));
      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Partner));
    } catch (error) {
      console.error('Error getting partners:', error);
      throw new Error('Failed to get partners');
    }
  },

  /**
   * Get partner by ID
   */
  async getPartnerById(id: string): Promise<Partner | null> {
    try {
      const partnerRef = doc(db, 'partners', id);
      const snapshot = await getDoc(partnerRef);
      
      if (!snapshot.exists()) {
        return null;
      }
      
      return {
        id: snapshot.id,
        ...snapshot.data()
      } as Partner;
    } catch (error) {
      console.error('Error getting partner:', error);
      throw new Error('Failed to get partner');
    }
  },

  /**
   * Create a new partner
   */
  async createPartner(data: Omit<Partner, 'id'>): Promise<string> {
    try {
      const partnersRef = collection(db, 'partners');
      const docRef = await addDoc(partnersRef, {
        ...data,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });
      
      console.log('✅ Partner created:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('Error creating partner:', error);
      throw new Error('Failed to create partner');
    }
  },

  /**
   * Update an existing partner
   */
  async updatePartner(id: string, data: Partial<Partner>): Promise<void> {
    try {
      const partnerRef = doc(db, 'partners', id);
      await updateDoc(partnerRef, {
        ...data,
        updatedAt: Timestamp.now()
      });
      
      console.log('✅ Partner updated:', id);
    } catch (error) {
      console.error('Error updating partner:', error);
      throw new Error('Failed to update partner');
    }
  },

  /**
   * Delete a partner
   */
  async deletePartner(id: string): Promise<void> {
    try {
      const partnerRef = doc(db, 'partners', id);
      await deleteDoc(partnerRef);
      
      console.log('✅ Partner deleted:', id);
    } catch (error) {
      console.error('Error deleting partner:', error);
      throw new Error('Failed to delete partner');
    }
  }
};
