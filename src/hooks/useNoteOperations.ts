import { useCallback, useState } from 'react';
import type { CustomerNote } from '@/types';
import { hubAuthFetch, hubAuthJson } from '@/lib/client/hubAuthFetch';

interface UseNoteOperationsProps {
  userId?: string;
  getFirebaseIdToken: () => Promise<string | null>;
  reloadWorkspace: () => Promise<void>;
}

export function useNoteOperations({
  userId,
  getFirebaseIdToken,
  reloadWorkspace,
}: UseNoteOperationsProps) {
  const [, setNotes] = useState<CustomerNote[]>([]);

  const saveNote = useCallback(
    async (noteData: CustomerNote, selectedCustomerId: string) => {
      if (!userId) return;
      const token = await getFirebaseIdToken();
      if (!token) throw new Error('Sign in required');

      if (noteData.id) {
        const put = await hubAuthFetch('/api/notes', token, {
          method: 'PUT',
          body: JSON.stringify({
            note: {
              id: noteData.id,
              customerId: noteData.customerId,
              notes: noteData.notes,
              noteDate: noteData.noteDate,
              createdBy: noteData.createdBy,
              updatedBy: userId,
              seConfidence: noteData.seConfidence,
              otherFields: noteData.otherFields,
            },
            userId,
          }),
        });
        if (!put.ok) {
          const message = await put.text();
          if (!message.includes('does not exist')) throw new Error(message || `HTTP ${put.status}`);
          await hubAuthJson('/api/notes', token, {
            method: 'POST',
            body: JSON.stringify({
              note: {
                customerId: selectedCustomerId,
                notes: noteData.notes,
                noteDate: noteData.noteDate,
                createdBy: userId,
                updatedBy: userId,
                seConfidence: noteData.seConfidence,
                otherFields: noteData.otherFields,
              },
              userId,
            }),
          });
        }
      } else {
        await hubAuthJson('/api/notes', token, {
          method: 'POST',
          body: JSON.stringify({
            note: {
              customerId: selectedCustomerId,
              notes: noteData.notes,
              noteDate: noteData.noteDate,
              createdBy: userId,
              updatedBy: userId,
              seConfidence: noteData.seConfidence,
              otherFields: noteData.otherFields,
            },
            userId,
          }),
        });
      }

      await reloadWorkspace();
    },
    [userId, getFirebaseIdToken, reloadWorkspace],
  );

  const deleteNote = useCallback(
    async (noteId: string) => {
      const token = await getFirebaseIdToken();
      if (!token) throw new Error('Sign in required');
      const res = await hubAuthFetch(`/api/notes?id=${encodeURIComponent(noteId)}`, token, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error(await res.text());
      await reloadWorkspace();
    },
    [getFirebaseIdToken, reloadWorkspace],
  );

  return {
    notes: [],
    setNotes,
    saveNote,
    deleteNote,
  };
}
