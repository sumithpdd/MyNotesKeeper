import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  where,
  Timestamp,
  serverTimestamp
} from 'firebase/firestore';
import { db } from './firebase';
import { Customer, CreateCustomerData } from '@/types';

const COLLECTION_NAME = 'customers';

export class CustomerService {
  async getAllCustomers(): Promise<Customer[]> {
    try {
      const q = query(collection(db, COLLECTION_NAME), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date(),
      })) as Customer[];
    } catch (error) {
      console.error('Error fetching customers:', error);
      throw new Error('Failed to fetch customers');
    }
  }

  async getCustomerById(id: string): Promise<Customer | null> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        } as Customer;
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching customer:', error);
      throw new Error('Failed to fetch customer');
    }
  }

  async createCustomer(data: CreateCustomerData, userId: string): Promise<string> {
    try {
      const docData = {
        ...data,
        createdBy: userId,
        updatedBy: userId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      const docRef = await addDoc(collection(db, COLLECTION_NAME), docData);
      return docRef.id;
    } catch (error) {
      console.error('Error creating customer:', error);
      throw new Error('Failed to create customer');
    }
  }

  async updateCustomer(id: string, data: Partial<CreateCustomerData>, userId: string): Promise<void> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      
      const docData = {
        ...data,
        updatedBy: userId,
        updatedAt: serverTimestamp(),
      };

      await updateDoc(docRef, docData);
    } catch (error) {
      console.error('Error updating customer:', error);
      throw new Error('Failed to update customer');
    }
  }

  async deleteCustomer(id: string): Promise<void> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting customer:', error);
      throw new Error('Failed to delete customer');
    }
  }

  async searchCustomers(searchTerm: string): Promise<Customer[]> {
    try {
      const q = query(
        collection(db, COLLECTION_NAME),
        where('customerName', '>=', searchTerm),
        where('customerName', '<=', searchTerm + '\uf8ff')
      );
      
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date(),
      })) as Customer[];
    } catch (error) {
      console.error('Error searching customers:', error);
      throw new Error('Failed to search customers');
    }
  }
}

export const customerService = new CustomerService();
