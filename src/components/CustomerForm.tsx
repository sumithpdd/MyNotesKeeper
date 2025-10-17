'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Save, X, Building, Users, ExternalLink } from 'lucide-react';
import { Customer, CreateCustomerData } from '@/types';
import { MultiSelect } from './ui/MultiSelect';
import { 
  dummyProducts, 
  dummyCustomerContacts, 
  dummyInternalContacts,
  dummyPartners 
} from '../../data/dummyData';

const customerSchema = z.object({
  customerName: z.string().min(1, 'Customer name is required'),
  website: z.string().optional(),
  products: z.array(z.object({
    id: z.string(),
    name: z.string(),
    version: z.string().optional(),
    description: z.string().optional(),
    status: z.enum(['Active', 'Inactive', 'Planned', 'Deprecated']).optional(),
  })),
  customerContacts: z.array(z.object({
    id: z.string(),
    name: z.string(),
    email: z.string().optional(),
    phone: z.string().optional(),
    role: z.string().optional(),
  })),
  internalContacts: z.array(z.object({
    id: z.string(),
    name: z.string(),
    role: z.string().optional(),
    email: z.string().optional(),
  })),
  partners: z.array(z.object({
    id: z.string(),
    name: z.string(),
    type: z.string().optional(),
    website: z.string().optional(),
  })),
  sharePointUrl: z.string(),
  salesforceLink: z.string(),
  additionalLink: z.string().optional(),
  additionalInfo: z.string().optional(),
});

type CustomerFormData = z.infer<typeof customerSchema>;

interface CustomerFormProps {
  customer?: Customer;
  onSave: (customer: Customer) => void;
  onCancel: () => void;
}

export function CustomerForm({ customer, onSave, onCancel }: CustomerFormProps) {
  console.log('CustomerForm rendered with customer:', customer);
  
  const [customProducts, setCustomProducts] = useState(dummyProducts);
  const [customCustomerContacts, setCustomCustomerContacts] = useState(dummyCustomerContacts);
  const [customInternalContacts, setCustomInternalContacts] = useState(dummyInternalContacts);
  const [customPartners, setCustomPartners] = useState(dummyPartners);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting }
  } = useForm<CustomerFormData>({
    resolver: zodResolver(customerSchema),
    defaultValues: customer ? {
      customerName: customer.customerName,
      products: customer.products,
      customerContacts: customer.customerContacts,
      internalContacts: customer.internalContacts,
      partners: customer.partners,
      sharePointUrl: customer.sharePointUrl,
      salesforceLink: customer.salesforceLink,
      additionalLink: customer.additionalLink,
      additionalInfo: customer.additionalInfo,
    } : {
      customerName: '',
      products: [],
      customerContacts: [],
      internalContacts: [],
      partners: [],
      sharePointUrl: '',
      salesforceLink: '',
      additionalLink: '',
      additionalInfo: '',
    }
  });

  const watchedValues = watch();

  const onSubmit = async (data: CustomerFormData) => {
    try {
      console.log('Form submitted with data:', data);
      console.log('Is editing existing customer?', !!customer);
      console.log('Customer ID:', customer?.id);
      console.log('Form validation errors:', errors);
      
      const customerData: CreateCustomerData = {
        ...data,
      };

      const savedCustomer: Customer = {
        id: customer?.id || crypto.randomUUID(),
        ...customerData,
        createdAt: customer?.createdAt || new Date(),
        updatedAt: new Date(),
      };

      console.log('Saving customer:', savedCustomer);
      onSave(savedCustomer);
    } catch (error) {
      console.error('Error saving customer:', error);
      alert('Failed to save customer');
    }
  };

  return (
    <div className="max-h-[80vh] overflow-y-auto">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Information */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Building className="h-5 w-5 mr-2" />
            Customer Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Customer Name *
              </label>
              <input
                {...register('customerName')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                placeholder="Enter customer name"
              />
              {errors.customerName && (
                <p className="mt-1 text-sm text-red-600">{errors.customerName.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                SharePoint URL
              </label>
              <div className="relative">
                <input
                  {...register('sharePointUrl')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                  placeholder="https://company.sharepoint.com/sites/..."
                />
                <ExternalLink className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Salesforce Link
              </label>
              <div className="relative">
                <input
                  {...register('salesforceLink')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                  placeholder="https://company.lightning.force.com/..."
                />
                <ExternalLink className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Additional Link
              </label>
              <div className="relative">
                <input
                  {...register('additionalLink')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                  placeholder="https://loop.microsoft.com/... or other document links"
                />
                <ExternalLink className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Contacts and Products */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Users className="h-5 w-5 mr-2" />
            Contacts & Products
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <MultiSelect
              options={customCustomerContacts}
              selected={watchedValues.customerContacts.map(c => typeof c === 'string' ? c : c.id)}
              onChange={(selected) => {
                const selectedObjects = selected.map(id => 
                  customCustomerContacts.find(c => c.id === id) || { id, name: id, email: '', role: '' }
                );
                setValue('customerContacts', selectedObjects);
              }}
              label="Customer Contacts"
              placeholder="Select customer contacts..."
              allowCustom
              onAddCustom={(value) => {
                const newContact = { id: `custom-${Date.now()}`, name: value, email: '', role: '' };
                setCustomCustomerContacts([...customCustomerContacts, newContact]);
                setValue('customerContacts', [...watchedValues.customerContacts, newContact]);
              }}
            />

            <MultiSelect
              options={customInternalContacts}
              selected={watchedValues.internalContacts.map(c => typeof c === 'string' ? c : c.id)}
              onChange={(selected) => {
                const selectedObjects = selected.map(id => 
                  customInternalContacts.find(c => c.id === id) || { id, name: id, role: '', email: '' }
                );
                setValue('internalContacts', selectedObjects);
              }}
              label="Internal Contacts"
              placeholder="Select internal contacts..."
              allowCustom
              onAddCustom={(value) => {
                const newContact = { id: `custom-${Date.now()}`, name: value, role: '', email: '' };
                setCustomInternalContacts([...customInternalContacts, newContact]);
                setValue('internalContacts', [...watchedValues.internalContacts, newContact]);
              }}
            />

            <MultiSelect
              options={customProducts}
              selected={watchedValues.products.map(p => typeof p === 'string' ? p : p.id)}
              onChange={(selected) => {
                const selectedObjects = selected.map(id => 
                  customProducts.find(p => p.id === id) || { id, name: id, version: '' }
                );
                setValue('products', selectedObjects);
              }}
              label="Products"
              placeholder="Select products..."
              allowCustom
              onAddCustom={(value) => {
                const newProduct = { id: `custom-${Date.now()}`, name: value, version: '' };
                setCustomProducts([...customProducts, newProduct]);
                setValue('products', [...watchedValues.products, newProduct]);
              }}
            />

            <MultiSelect
              options={customPartners}
              selected={watchedValues.partners.map(p => typeof p === 'string' ? p : p.id)}
              onChange={(selected) => {
                const selectedObjects = selected.map(id => 
                  customPartners.find(p => p.id === id) || { id, name: id, type: '' }
                );
                setValue('partners', selectedObjects);
              }}
              label="Partners"
              placeholder="Select partners..."
              allowCustom
              onAddCustom={(value) => {
                const newPartner = { id: `custom-${Date.now()}`, name: value, type: '' };
                setCustomPartners([...customPartners, newPartner]);
                setValue('partners', [...watchedValues.partners, newPartner]);
              }}
            />
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            <X className="h-4 w-4 mr-2" />
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          >
            <Save className="h-4 w-4 mr-2" />
            {isSubmitting ? 'Saving...' : 'Save Customer'}
          </button>
        </div>
      </form>
    </div>
  );
}
