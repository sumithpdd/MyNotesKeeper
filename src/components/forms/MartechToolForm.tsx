'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Save, X, Wrench, FileText } from 'lucide-react';
import { MartechTool } from '@/types';

const martechToolSchema = z.object({
  name: z.string().min(1, 'Tool name is required'),
  purpose: z.string().min(1, 'Purpose is required'),
});

type MartechToolFormData = z.infer<typeof martechToolSchema>;

interface MartechToolFormProps {
  martechTool?: MartechTool;
  onSave: (martechTool: MartechTool) => void;
  onCancel: () => void;
}

export function MartechToolForm({ martechTool, onSave, onCancel }: MartechToolFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<MartechToolFormData>({
    resolver: zodResolver(martechToolSchema),
    defaultValues: martechTool
      ? {
          name: martechTool.name,
          purpose: martechTool.purpose || '',
        }
      : {
          name: '',
          purpose: '',
        },
  });

  const onSubmit = async (data: MartechToolFormData) => {
    const toolData: MartechTool = {
      id: martechTool?.id || `martech-${Date.now()}`,
      name: data.name,
      purpose: data.purpose,
    };
    onSave(toolData);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <Wrench className="h-4 w-4 inline mr-2" />
          Tool Name *
        </label>
        <input
          {...register('name')}
          type="text"
          placeholder="e.g. Salesforce, SEMRush, DotMailer"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <FileText className="h-4 w-4 inline mr-2" />
          Purpose *
        </label>
        <input
          {...register('purpose')}
          type="text"
          placeholder="e.g. CRM, Email Campaign, SEO & Marketing Analytics"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
        />
        {errors.purpose && (
          <p className="mt-1 text-sm text-red-600">{errors.purpose.message}</p>
        )}
      </div>

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
          {isSubmitting ? 'Saving...' : 'Save Martech Tool'}
        </button>
      </div>
    </form>
  );
}
