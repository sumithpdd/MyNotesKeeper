'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Save, X, Calendar, User } from 'lucide-react';
import { CustomerNote } from '@/types';
import { AIButton } from './ui/AIButton';

const noteSchema = z.object({
  notes: z.string().min(1, 'Notes are required'),
  noteDate: z.date(),
  createdBy: z.string().min(1, 'Created by is required'),
  updatedBy: z.string().min(1, 'Updated by is required'),
  // Dynamic fields that can change per note
  seConfidence: z.enum(['Green', 'Yellow', 'Red', '']),
  otherFields: z.record(z.string(), z.unknown()),
});

type NoteFormData = z.infer<typeof noteSchema>;

interface NoteFormProps {
  customerId: string;
  note?: CustomerNote;
  onSave: (note: CustomerNote) => void;
  onCancel: () => void;
}

export function NoteForm({ customerId, note, onSave, onCancel }: NoteFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting }
  } = useForm<NoteFormData>({
    resolver: zodResolver(noteSchema),
    defaultValues: note ? {
      notes: note.notes,
      noteDate: note.noteDate,
      createdBy: note.createdBy,
      updatedBy: note.updatedBy,
      seConfidence: note.seConfidence,
      otherFields: note.otherFields,
    } : {
      notes: '',
      noteDate: new Date(),
      createdBy: '',
      updatedBy: '',
      seConfidence: '',
      otherFields: {},
    }
  });

  const watchedValues = watch();

  const onSubmit = async (data: NoteFormData) => {
    try {
      const noteData = {
        ...data,
      };

      const savedNote: CustomerNote = {
        id: note?.id || `note-${Date.now()}`,
        customerId: customerId,
        ...noteData,
        createdAt: note?.createdAt || new Date(),
        updatedAt: new Date(),
      };

      onSave(savedNote);
    } catch (error) {
      console.error('Error saving note:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {note ? 'Edit Note' : 'Add Note'}
          </h2>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Note Information */}
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Note Information</h3>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Notes
                  </label>
                  <AIButton 
                    currentText={watchedValues.notes} 
                    onGenerated={(text) => setValue('notes', text)}
                    context={`Customer ID: ${customerId}, Note Date: ${watchedValues.noteDate?.toLocaleDateString() || 'Today'}`}
                  />
                </div>
                <textarea
                  {...register('notes')}
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                  placeholder="Enter your notes here..."
                />
                {errors.notes && (
                  <p className="text-red-500 text-sm mt-1">{errors.notes.message}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Calendar className="h-4 w-4 inline mr-2" />
                    Note Date
                  </label>
                  <input
                    {...register('noteDate', { valueAsDate: true })}
                    type="date"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                  />
                  {errors.noteDate && (
                    <p className="text-red-500 text-sm mt-1">{errors.noteDate.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <User className="h-4 w-4 inline mr-2" />
                    Created By
                  </label>
                  <input
                    {...register('createdBy')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                    placeholder="Enter your initials..."
                  />
                  {errors.createdBy && (
                    <p className="text-red-500 text-sm mt-1">{errors.createdBy.message}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Updated By
                </label>
                <input
                  {...register('updatedBy')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                  placeholder="Enter your initials..."
                />
                {errors.updatedBy && (
                  <p className="text-red-500 text-sm mt-1">{errors.updatedBy.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Dynamic Fields */}
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Dynamic Assessment</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  SE Confidence
                </label>
                <select
                  {...register('seConfidence')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                >
                  <option value="">Select confidence level...</option>
                  <option value="Green">Green</option>
                  <option value="Yellow">Yellow</option>
                  <option value="Red">Red</option>
                </select>
                {errors.seConfidence && (
                  <p className="text-red-500 text-sm mt-1">{errors.seConfidence.message}</p>
                )}
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Additional Notes
                  </label>
                  <AIButton 
                    currentText={watchedValues.otherFields?.additionalNotes as string || ''} 
                    onGenerated={(text) => setValue('otherFields', { ...watchedValues.otherFields, additionalNotes: text })}
                    context={`Main Notes: ${watchedValues.notes}`}
                  />
                </div>
                <textarea
                  {...register('otherFields.additionalNotes')}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                  placeholder="Any additional notes or observations..."
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Next Steps
                  </label>
                  <AIButton 
                    currentText={watchedValues.otherFields?.nextSteps as string || ''} 
                    onGenerated={(text) => setValue('otherFields', { ...watchedValues.otherFields, nextSteps: text })}
                    context={`Notes: ${watchedValues.notes}, SE Confidence: ${watchedValues.seConfidence || 'Not set'}`}
                  />
                </div>
                <textarea
                  {...register('otherFields.nextSteps')}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                  placeholder="What are the next steps?"
                />
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              {isSubmitting ? 'Saving...' : 'Save Note'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}