'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Save, X, User, Mail, Phone, Briefcase } from 'lucide-react';
import { CustomerContact } from '@/types';

const customerContactSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  phone: z.string().optional(),
  role: z.string().optional(),
});

type CustomerContactFormData = z.infer<typeof customerContactSchema>;

interface CustomerContactFormProps {
  contact?: CustomerContact;
  onSave: (contact: CustomerContact) => void;
  onCancel: () => void;
}

export function CustomerContactForm({ contact, onSave, onCancel }: CustomerContactFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<CustomerContactFormData>({
    resolver: zodResolver(customerContactSchema),
    defaultValues: contact ? {
      name: contact.name,
      email: contact.email || '',
      phone: contact.phone || '',
      role: contact.role || '',
    } : {
      name: '',
      email: '',
      phone: '',
      role: '',
    }
  });

  const onSubmit = async (data: CustomerContactFormData) => {
    try {
      const contactData: CustomerContact = {
        id: contact?.id || `contact-${Date.now()}`,
        name: data.name,
        email: data.email || undefined,
        phone: data.phone || undefined,
        role: data.role || undefined,
      };

      onSave(contactData);
    } catch (error) {
      console.error('Error saving customer contact:', error);
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
          placeholder="Enter customer contact name"
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

      {/* Phone */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <Phone className="h-4 w-4 inline mr-2" />
          Phone
        </label>
        <input
          {...register('phone')}
          type="tel"
          placeholder="Enter phone number"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
        />
      </div>

      {/* Role */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <Briefcase className="h-4 w-4 inline mr-2" />
          Role
        </label>
        <input
          {...register('role')}
          type="text"
          placeholder="Enter role/title"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
        />
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
