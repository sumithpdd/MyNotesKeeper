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
  Timestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import { MartechTool } from '@/types';

const COLLECTION_NAME = 'martechTools';

export const martechToolService = {
  async getAllMartechTools(): Promise<MartechTool[]> {
    try {
      const ref = collection(db, COLLECTION_NAME);
      const q = query(ref, orderBy('name', 'asc'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      })) as MartechTool[];
    } catch (error) {
      console.error('Error getting martech tools:', error);
      return [];
    }
  },

  async getMartechToolById(id: string): Promise<MartechTool | null> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      const snapshot = await getDoc(docRef);
      if (!snapshot.exists()) return null;
      return { id: snapshot.id, ...snapshot.data() } as MartechTool;
    } catch (error) {
      console.error('Error getting martech tool:', error);
      return null;
    }
  },

  async createMartechTool(data: Omit<MartechTool, 'id'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, COLLECTION_NAME), {
        ...data,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating martech tool:', error);
      throw new Error('Failed to create martech tool');
    }
  },

  async updateMartechTool(id: string, data: Partial<MartechTool>): Promise<void> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      await updateDoc(docRef, {
        ...data,
        updatedAt: Timestamp.now(),
      });
    } catch (error) {
      console.error('Error updating martech tool:', error);
      throw new Error('Failed to update martech tool');
    }
  },

  async deleteMartechTool(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, COLLECTION_NAME, id));
    } catch (error) {
      console.error('Error deleting martech tool:', error);
      throw new Error('Failed to delete martech tool');
    }
  },

  /** Seed initial martech tools if collection is empty */
  async seedIfEmpty(): Promise<void> {
    const existing = await this.getAllMartechTools();
    if (existing.length > 0) return;

    const defaultTools: Omit<MartechTool, 'id'>[] = [
      { name: 'Salesforce', purpose: 'CRM' },
      { name: 'SEMRush', purpose: 'SEO & Marketing Analytics' },
      { name: 'Dynamics 365', purpose: 'CRM & ERP' },
      { name: 'iGoDigital', purpose: 'Personalization & Recommendations' },
      { name: 'DotMailer', purpose: 'Email Campaign' },
      { name: 'Google Analytics GA4', purpose: 'Web Analytics' },
      { name: 'HotJar', purpose: 'Heatmaps & Session Recording' },
      { name: 'Facebook Pixel', purpose: 'Advertising Tracking' },
      { name: 'DoubleClick Floodlight', purpose: 'Ad Conversion Tracking' },
    ];

    for (const tool of defaultTools) {
      await this.createMartechTool(tool);
    }
    console.log('✅ Martech tools seeded');
  },
};
