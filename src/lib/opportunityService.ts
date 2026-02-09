import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDocs, 
  query, 
  where,
  orderBy,
  Timestamp 
} from 'firebase/firestore';
import { db } from './firebase';
import { Opportunity, CreateOpportunityData, UpdateOpportunityData, StageChangeData, OpportunityStage } from '@/types';

const COLLECTION_NAME = 'opportunities';

// Convert Firestore data to Opportunity
const convertToOpportunity = (id: string, data: any): Opportunity => {
  return {
    ...data,
    id,
    createdAt: data.createdAt?.toDate() || new Date(),
    updatedAt: data.updatedAt?.toDate() || new Date(),
    expectedCloseDate: data.expectedCloseDate?.toDate(),
    actualCloseDate: data.actualCloseDate?.toDate(),
    stageHistory: (data.stageHistory || []).map((entry: any) => ({
      ...entry,
      changedAt: entry.changedAt?.toDate() || new Date(),
    })),
  } as Opportunity;
};

// Convert dates to Firestore timestamps
const convertToFirestore = (data: any) => {
  const result: any = { ...data };
  
  if (data.createdAt) result.createdAt = Timestamp.fromDate(new Date(data.createdAt));
  if (data.updatedAt) result.updatedAt = Timestamp.fromDate(new Date(data.updatedAt));
  if (data.expectedCloseDate) result.expectedCloseDate = Timestamp.fromDate(new Date(data.expectedCloseDate));
  if (data.actualCloseDate) result.actualCloseDate = Timestamp.fromDate(new Date(data.actualCloseDate));
  
  if (data.stageHistory) {
    result.stageHistory = data.stageHistory.map((entry: any) => ({
      ...entry,
      changedAt: Timestamp.fromDate(new Date(entry.changedAt)),
    }));
  }
  
  return result;
};

export const opportunityService = {
  // Get all opportunities
  async getAllOpportunities(): Promise<Opportunity[]> {
    try {
      const q = query(collection(db, COLLECTION_NAME), orderBy('updatedAt', 'desc'));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => convertToOpportunity(doc.id, doc.data()));
    } catch (error) {
      console.error('Error getting opportunities:', error);
      return [];
    }
  },

  // Get opportunities for a specific customer
  async getOpportunitiesByCustomer(customerId: string): Promise<Opportunity[]> {
    try {
      const q = query(
        collection(db, COLLECTION_NAME),
        where('customerId', '==', customerId),
        orderBy('updatedAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => convertToOpportunity(doc.id, doc.data()));
    } catch (error) {
      console.error('Error getting opportunities by customer:', error);
      return [];
    }
  },

  // Create a new opportunity
  async createOpportunity(data: CreateOpportunityData): Promise<Opportunity> {
    try {
      const now = new Date();
      const opportunityData = {
        ...data,
        stageHistory: [{
          id: crypto.randomUUID(),
          fromStage: null,
          toStage: data.currentStage,
          changedBy: data.createdBy,
          changedAt: now,
          duration: 0,
        }],
        createdAt: now,
        updatedAt: now,
      };

      const firestoreData = convertToFirestore(opportunityData);
      const docRef = await addDoc(collection(db, COLLECTION_NAME), firestoreData);
      
      return {
        ...opportunityData,
        id: docRef.id,
      } as Opportunity;
    } catch (error) {
      console.error('Error creating opportunity:', error);
      throw error;
    }
  },

  // Update an opportunity
  async updateOpportunity(data: UpdateOpportunityData): Promise<void> {
    try {
      const { id, ...updateData } = data;
      const firestoreData = convertToFirestore({
        ...updateData,
        updatedAt: new Date(),
      });
      
      await updateDoc(doc(db, COLLECTION_NAME, id), firestoreData);
    } catch (error) {
      console.error('Error updating opportunity:', error);
      throw error;
    }
  },

  // Change opportunity stage (with history tracking)
  async changeStage(opportunity: Opportunity, newStage: OpportunityStage, changedBy: string, notes?: string): Promise<void> {
    try {
      const now = new Date();
      const lastHistoryEntry = opportunity.stageHistory[opportunity.stageHistory.length - 1];
      const duration = lastHistoryEntry 
        ? Math.floor((now.getTime() - new Date(lastHistoryEntry.changedAt).getTime()) / (1000 * 60 * 60 * 24))
        : 0;

      const newHistoryEntry = {
        id: crypto.randomUUID(),
        fromStage: opportunity.currentStage,
        toStage: newStage,
        changedBy,
        changedAt: now,
        notes,
        duration,
      };

      const updatedStageHistory = [...opportunity.stageHistory, newHistoryEntry];

      const updateData = {
        currentStage: newStage,
        stageHistory: updatedStageHistory,
        updatedBy: changedBy,
        updatedAt: now,
      };

      const firestoreData = convertToFirestore(updateData);
      await updateDoc(doc(db, COLLECTION_NAME, opportunity.id), firestoreData);
    } catch (error) {
      console.error('Error changing stage:', error);
      throw error;
    }
  },

  // Delete an opportunity
  async deleteOpportunity(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, COLLECTION_NAME, id));
    } catch (error) {
      console.error('Error deleting opportunity:', error);
      throw error;
    }
  },

  // Delete all opportunities for a customer (cascade delete)
  async deleteOpportunitiesByCustomer(customerId: string): Promise<void> {
    try {
      const opportunities = await this.getOpportunitiesByCustomer(customerId);
      await Promise.all(opportunities.map(opp => this.deleteOpportunity(opp.id)));
    } catch (error) {
      console.error('Error deleting opportunities by customer:', error);
      throw error;
    }
  },
};
