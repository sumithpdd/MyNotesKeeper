'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Save, X, Package, Tag, FileText, Activity } from 'lucide-react';
import { Product } from '@/types';
import { dummyProducts } from '../../../data/dummyData';
import { PRODUCT_STATUS_OPTIONS } from '../../../data/dxpPools';

const productSchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  version: z.string().optional(),
  description: z.string().optional(),
  status: z.enum(['Active', 'Inactive', 'Planned', 'Deprecated']).optional(),
});

type ProductFormData = z.infer<typeof productSchema>;

interface ProductFormProps {
  product?: Product;
  onSave: (product: Product) => void;
  onCancel: () => void;
}

// Get product options from dummy data
const productOptions = dummyProducts.map(p => p.name);

export function ProductForm({ product, onSave, onCancel }: ProductFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting }
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: product ? {
      name: product.name,
      version: product.version || '',
      description: product.description || '',
      status: product.status || 'Active',
    } : {
      name: '',
      version: '',
      description: '',
      status: 'Active',
    }
  });

  const watchedName = watch('name');

  const onSubmit = async (data: ProductFormData) => {
    try {
      const productData: Product = {
        id: product?.id || `product-${Date.now()}`,
        name: data.name as any,
        version: data.version || undefined,
        description: data.description || undefined,
        status: data.status || 'Active',
      };

      onSave(productData);
    } catch (error) {
      console.error('Error saving product:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Product Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <Package className="h-4 w-4 inline mr-2" />
          Product Name *
        </label>
        <select
          {...register('name')}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
        >
          <option value="">Select a product</option>
          {productOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        {errors.name && (
          <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
        )}
      </div>

      {/* Version */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <Tag className="h-4 w-4 inline mr-2" />
          Version
        </label>
        <input
          {...register('version')}
          type="text"
          placeholder="e.g., 10.3, 1.0, 2.1.4"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <FileText className="h-4 w-4 inline mr-2" />
          Description
        </label>
        <textarea
          {...register('description')}
          rows={3}
          placeholder="Enter product description"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
        />
      </div>

      {/* Status */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <Activity className="h-4 w-4 inline mr-2" />
          Status
        </label>
        <div className="grid grid-cols-2 gap-3">
          {PRODUCT_STATUS_OPTIONS.map((status) => (
            <label key={status.value} className="flex items-center">
              <input
                {...register('status')}
                type="radio"
                value={status.value}
                className="sr-only"
              />
              <div className={`w-full p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                watch('status') === status.value
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}>
                <div className="flex items-center justify-center">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${status.color}`}>
                    {status.label}
                  </span>
                </div>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Product Info */}
      {watchedName && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-2">Product Information</h4>
          <div className="text-sm text-blue-800">
            {dummyProducts.find(p => p.name === watchedName)?.description || 'Product information not available'}
          </div>
        </div>
      )}

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
          {isSubmitting ? 'Saving...' : 'Save Product'}
        </button>
      </div>
    </form>
  );
}
