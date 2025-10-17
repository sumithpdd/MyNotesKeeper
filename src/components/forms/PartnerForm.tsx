'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Save, X, ExternalLink, Tag, Globe } from 'lucide-react';
import { Partner } from '@/types';

const partnerSchema = z.object({
  name: z.string().min(1, 'Partner name is required'),
  type: z.string().optional(),
  website: z.string().url('Invalid URL').optional().or(z.literal('')),
});

type PartnerFormData = z.infer<typeof partnerSchema>;

interface PartnerFormProps {
  partner?: Partner;
  onSave: (partner: Partner) => void;
  onCancel: () => void;
}

const partnerTypes = [
  'Implementation Partner',
  'Technology Partner',
  'System Integrator',
  'Consulting Partner',
  'Reseller',
  'Training Partner',
  'Support Partner',
  'Other'
];

export function PartnerForm({ partner, onSave, onCancel }: PartnerFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<PartnerFormData>({
    resolver: zodResolver(partnerSchema),
    defaultValues: partner ? {
      name: partner.name,
      type: partner.type || '',
      website: partner.website || '',
    } : {
      name: '',
      type: '',
      website: '',
    }
  });

  const onSubmit = async (data: PartnerFormData) => {
    try {
      const partnerData: Partner = {
        id: partner?.id || `partner-${Date.now()}`,
        name: data.name,
        type: data.type || undefined,
        website: data.website || undefined,
      };

      onSave(partnerData);
    } catch (error) {
      console.error('Error saving partner:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Partner Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <ExternalLink className="h-4 w-4 inline mr-2" />
          Partner Name *
        </label>
        <input
          {...register('name')}
          type="text"
          placeholder="Enter partner company name"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
        )}
      </div>

      {/* Partner Type */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <Tag className="h-4 w-4 inline mr-2" />
          Partner Type
        </label>
        <select
          {...register('type')}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
        >
          <option value="">Select partner type</option>
          {partnerTypes.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </div>

      {/* Website */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <Globe className="h-4 w-4 inline mr-2" />
          Website
        </label>
        <input
          {...register('website')}
          type="url"
          placeholder="https://www.partner-website.com"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
        />
        {errors.website && (
          <p className="mt-1 text-sm text-red-600">{errors.website.message}</p>
        )}
      </div>

      {/* Partner Type Information */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h4 className="font-medium text-gray-900 mb-2">Partner Types</h4>
        <div className="text-sm text-gray-700 space-y-1">
          <div><strong>Implementation Partner:</strong> Provides implementation and deployment services</div>
          <div><strong>Technology Partner:</strong> Integrates technology solutions</div>
          <div><strong>System Integrator:</strong> Integrates multiple systems and platforms</div>
          <div><strong>Consulting Partner:</strong> Provides strategic consulting and advisory services</div>
          <div><strong>Reseller:</strong> Sells and distributes products</div>
          <div><strong>Training Partner:</strong> Provides training and certification services</div>
          <div><strong>Support Partner:</strong> Provides technical support and maintenance</div>
        </div>
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
          {isSubmitting ? 'Saving...' : 'Save Partner'}
        </button>
      </div>
    </form>
  );
}
