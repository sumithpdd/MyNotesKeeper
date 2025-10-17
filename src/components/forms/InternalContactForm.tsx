'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Save, X, User, Mail, Briefcase } from 'lucide-react';
import { InternalContact } from '@/types';

const internalContactSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  role: z.string().optional(),
});

type InternalContactFormData = z.infer<typeof internalContactSchema>;

interface InternalContactFormProps {
  contact?: InternalContact;
  onSave: (contact: InternalContact) => void;
  onCancel: () => void;
}

export function InternalContactForm({ contact, onSave, onCancel }: InternalContactFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<InternalContactFormData>({
    resolver: zodResolver(internalContactSchema),
    defaultValues: contact ? {
      name: contact.name,
      email: contact.email || '',
      role: contact.role || '',
    } : {
      name: '',
      email: '',
      role: '',
    }
  });

  const onSubmit = async (data: InternalContactFormData) => {
    try {
      const contactData: InternalContact = {
        id: contact?.id || `internal-${Date.now()}`,
        name: data.name,
        email: data.email || undefined,
        role: data.role || undefined,
      };

      onSave(contactData);
    } catch (error) {
      console.error('Error saving internal contact:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <User className="h-4 w-4 inline mr-2" />
          Name *
        </label>
        <input
          {...register('name')}
          type="text"
          placeholder="Enter internal contact name"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
        )}
      </div>

      {/* Email */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <Mail className="h-4 w-4 inline mr-2" />
          Email
        </label>
        <input
          {...register('email')}
          type="email"
          placeholder="Enter email address"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
        />
        {errors.email && (
          <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
        )}
      </div>

      {/* Role */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <Briefcase className="h-4 w-4 inline mr-2" />
          Role
        </label>
        <select
          {...register('role')}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
        >
          <option value="">Select a role</option>
          <option value="Account Executive">Account Executive</option>
          <option value="Solution Engineer">Solution Engineer</option>
          <option value="Technical Consultant">Technical Consultant</option>
          <option value="Customer Success Manager">Customer Success Manager</option>
          <option value="Sales Director">Sales Director</option>
          <option value="Marketing Manager">Marketing Manager</option>
          <option value="Project Manager">Project Manager</option>
          <option value="Developer">Developer</option>
          <option value="Other">Other</option>
        </select>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
        >
          <X className="h-4 w-4" />
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save className="h-4 w-4" />
          {isSubmitting ? 'Saving...' : 'Save Contact'}
        </button>
      </div>
    </form>
  );
}
