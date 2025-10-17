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
  Timestamp
} from 'firebase/firestore';
import { db } from './firebase';
import { CustomerNote, CreateCustomerNoteData, UpdateCustomerNoteData } from '@/types';

const COLLECTION_NAME = 'customerNotes';

export class CustomerNotesService {
  async getAllNotes(): Promise<CustomerNote[]> {
    try {
      const q = query(collection(db, COLLECTION_NAME), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        noteDate: doc.data().noteDate?.toDate() || new Date(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date(),
      })) as CustomerNote[];
    } catch (error) {
      console.error('Error fetching notes:', error);
      throw new Error('Failed to fetch notes');
    }
  }

  async getNoteById(id: string): Promise<CustomerNote | null> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          ...data,
          noteDate: data.noteDate?.toDate() || new Date(),
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        } as CustomerNote;
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching note:', error);
      throw new Error('Failed to fetch note');
    }
  }

  async createNote(data: CreateCustomerNoteData): Promise<string> {
    try {
      const now = new Date();
      const docData = {
        ...data,
        noteDate: Timestamp.fromDate(data.noteDate),
        createdAt: Timestamp.fromDate(now),
        updatedAt: Timestamp.fromDate(now),
      };

      const docRef = await addDoc(collection(db, COLLECTION_NAME), docData);
      return docRef.id;
    } catch (error) {
      console.error('Error creating note:', error);
      throw new Error('Failed to create note');
    }
  }

  async updateNote(data: UpdateCustomerNoteData): Promise<void> {
    try {
      const { id, ...updateData } = data;
      const docRef = doc(db, COLLECTION_NAME, id);
      
      const docData: any = {
        ...updateData,
        updatedAt: Timestamp.fromDate(new Date()),
      };

      // Convert Date objects to Timestamps
      if (updateData.noteDate) {
        docData.noteDate = Timestamp.fromDate(updateData.noteDate);
      }

      await updateDoc(docRef, docData);
    } catch (error) {
      console.error('Error updating note:', error);
      throw new Error('Failed to update note');
    }
  }

  async deleteNote(id: string): Promise<void> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting note:', error);
      throw new Error('Failed to delete note');
    }
  }

  async searchNotes(searchTerm: string): Promise<CustomerNote[]> {
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
        noteDate: doc.data().noteDate?.toDate() || new Date(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date(),
      })) as CustomerNote[];
    } catch (error) {
      console.error('Error searching notes:', error);
      throw new Error('Failed to search notes');
    }
  }
}

export const customerNotesService = new CustomerNotesService();
