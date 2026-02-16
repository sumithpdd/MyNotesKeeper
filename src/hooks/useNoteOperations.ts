import { useState, useCallback } from 'react';
import { CustomerNote } from '@/types';
import { customerNotesService } from '@/lib/customerNotes';

interface UseNoteOperationsProps {
  userId?: string;
  onNotesChange?: (notes: CustomerNote[]) => void;
}

/**
 * Custom hook to manage note CRUD operations
 * Provides create, update, and delete functionality with error handling
 */
export function useNoteOperations({ userId, onNotesChange }: UseNoteOperationsProps) {
  const [notes, setNotes] = useState<CustomerNote[]>([]);

  const updateNotes = useCallback((newNotes: CustomerNote[]) => {
    setNotes(newNotes);
    onNotesChange?.(newNotes);
  }, [onNotesChange]);

  const saveNote = useCallback(async (noteData: CustomerNote, selectedCustomerId: string) => {
    if (!userId) return;
    
    try {
      if (noteData.id) {
        try {
          // Try to update existing note
          await customerNotesService.updateNote({
            id: noteData.id,
            customerId: noteData.customerId,
            notes: noteData.notes,
            noteDate: noteData.noteDate,
            createdBy: noteData.createdBy,
            updatedBy: userId,
            seConfidence: noteData.seConfidence,
            otherFields: noteData.otherFields,
          }, userId);
          
          updateNotes(notes.map(note => 
            note.id === noteData.id ? { ...note, ...noteData, updatedAt: new Date() } : note
          ));
        } catch (updateError: any) {
          // If the note doesn't exist in Firestore, create it instead
          if (updateError.message?.includes('does not exist')) {
            console.warn(`Note ${noteData.id} doesn't exist in Firestore, creating new note instead`);
            
            const newNoteId = await customerNotesService.createNote({
              customerId: selectedCustomerId,
              notes: noteData.notes,
              noteDate: noteData.noteDate,
              createdBy: userId,
              updatedBy: userId,
              seConfidence: noteData.seConfidence,
              otherFields: noteData.otherFields,
            }, userId);
            
            const newNote: CustomerNote = {
              ...noteData,
              id: newNoteId,
              customerId: selectedCustomerId,
              createdAt: new Date(),
              updatedAt: new Date()
            };
            
            // Remove old note and add new one
            updateNotes([newNote, ...notes.filter(note => note.id !== noteData.id)]);
          } else {
            throw updateError;
          }
        }
      } else {
        // Create new note
        const newNoteId = await customerNotesService.createNote({
          customerId: selectedCustomerId,
          notes: noteData.notes,
          noteDate: noteData.noteDate,
          createdBy: userId,
          updatedBy: userId,
          seConfidence: noteData.seConfidence,
          otherFields: noteData.otherFields,
        }, userId);
        
        const newNote: CustomerNote = {
          ...noteData,
          id: newNoteId,
          customerId: selectedCustomerId,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        updateNotes([newNote, ...notes]);
      }
    } catch (error) {
      console.error('Error saving note:', error);
      throw error;
    }
  }, [userId, notes, updateNotes]);

  const deleteNote = useCallback(async (noteId: string) => {
    try {
      await customerNotesService.deleteNote(noteId);
      updateNotes(notes.filter(note => note.id !== noteId));
    } catch (error) {
      console.error('Error deleting note:', error);
      throw error;
    }
  }, [notes, updateNotes]);

  return {
    notes,
    setNotes: updateNotes,
    saveNote,
    deleteNote
  };
}
