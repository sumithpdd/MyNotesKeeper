import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  serverTimestamp
} from 'firebase/firestore';
import { db } from './firebase';
import { CustomerProfile, CreateCustomerProfileData, UpdateCustomerProfileData } from '@/types';

const COLLECTION_NAME = 'customerProfiles';

export class CustomerProfileService {
  async getProfileByCustomerId(customerId: string): Promise<CustomerProfile | null> {
    try {
      const q = query(
        collection(db, COLLECTION_NAME),
        where('customerId', '==', customerId)
      );
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        return null;
      }
      
      const doc = querySnapshot.docs[0];
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        latestDemoDate: data.latestDemoDate?.toDate() || new Date(),
        seNotesLastUpdated: data.seNotesLastUpdated?.toDate() || new Date(),
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      } as CustomerProfile;
    } catch (error) {
      console.error('Error fetching customer profile:', error);
      throw new Error('Failed to fetch customer profile');
    }
  }

  async getProfileById(id: string): Promise<CustomerProfile | null> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          ...data,
          latestDemoDate: data.latestDemoDate?.toDate() || new Date(),
          seNotesLastUpdated: data.seNotesLastUpdated?.toDate() || new Date(),
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        } as CustomerProfile;
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching profile:', error);
      throw new Error('Failed to fetch profile');
    }
  }

  async createProfile(data: CreateCustomerProfileData, userId: string): Promise<string> {
    try {
      const docData = {
        ...data,
        latestDemoDate: data.latestDemoDate ? serverTimestamp() : null,
        seNotesLastUpdated: data.seNotesLastUpdated ? serverTimestamp() : null,
        createdBy: userId,
        updatedBy: userId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      const docRef = await addDoc(collection(db, COLLECTION_NAME), docData);
      return docRef.id;
    } catch (error) {
      console.error('Error creating profile:', error);
      throw new Error('Failed to create profile');
    }
  }

  async updateProfile(data: UpdateCustomerProfileData, userId: string): Promise<void> {
    try {
      const { id, ...updateData } = data;
      const docRef = doc(db, COLLECTION_NAME, id);
      
      const docData: any = {
        ...updateData,
        updatedBy: userId,
        updatedAt: serverTimestamp(),
      };

      // Convert Date objects to Timestamps
      if (updateData.latestDemoDate) {
        docData.latestDemoDate = serverTimestamp();
      }
      if (updateData.seNotesLastUpdated) {
        docData.seNotesLastUpdated = serverTimestamp();
      }

      await updateDoc(docRef, docData);
    } catch (error) {
      console.error('Error updating profile:', error);
      throw new Error('Failed to update profile');
    }
  }

  async deleteProfile(id: string): Promise<void> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting profile:', error);
      throw new Error('Failed to delete profile');
    }
  }
}

export const customerProfileService = new CustomerProfileService();
