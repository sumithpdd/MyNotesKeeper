'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Save, X, Building, Users, ExternalLink } from 'lucide-react';
import { Customer, CreateCustomerData } from '@/types';
import { MultiSelect } from './ui/MultiSelect';
import { AIButton } from './ui/AIButton';
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
  accountExecutive: z.object({
    id: z.string(),
    name: z.string(),
    role: z.string().optional(),
    email: z.string().optional(),
  }).optional(),
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
  // Migration fields
  existingMigrationOpp: z.string().optional(),
  perpetualOrSubscription: z.string().optional(),
  hostingLocation: z.string().optional(),
  frontEndTech: z.string().optional(),
  exmUser: z.string().optional(),
  marketingAutomationUser: z.string().optional(),
  integrations: z.string().optional(),
  heavilyCustomisedCE: z.string().optional(),
  migrationComplexity: z.string().optional(),
  customerAwareOfXMC: z.string().optional(),
  compellingEvent: z.string().optional(),
  managedCloud: z.string().optional(),
  dateAnalysed: z.string().optional(),
  migrationNotes: z.string().optional(),
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
      accountExecutive: customer.accountExecutive,
      partners: customer.partners,
      sharePointUrl: customer.sharePointUrl,
      salesforceLink: customer.salesforceLink,
      additionalLink: customer.additionalLink,
      additionalInfo: customer.additionalInfo,
      existingMigrationOpp: customer.existingMigrationOpp || '',
      perpetualOrSubscription: customer.perpetualOrSubscription || '',
      hostingLocation: customer.hostingLocation || '',
      frontEndTech: customer.frontEndTech || '',
      exmUser: customer.exmUser ? String(customer.exmUser) : '',
      marketingAutomationUser: customer.marketingAutomationUser ? String(customer.marketingAutomationUser) : '',
      integrations: customer.integrations || '',
      heavilyCustomisedCE: customer.heavilyCustomisedCE ? String(customer.heavilyCustomisedCE) : '',
      migrationComplexity: customer.migrationComplexity || '',
      customerAwareOfXMC: customer.customerAwareOfXMC ? String(customer.customerAwareOfXMC) : '',
      compellingEvent: customer.compellingEvent || '',
      managedCloud: customer.managedCloud ? String(customer.managedCloud) : '',
      dateAnalysed: customer.dateAnalysed || '',
      migrationNotes: customer.migrationNotes || '',
    } : {
      customerName: '',
      products: [],
      customerContacts: [],
      internalContacts: [],
      accountExecutive: undefined,
      partners: [],
      sharePointUrl: '',
      salesforceLink: '',
      additionalLink: '',
      additionalInfo: '',
      existingMigrationOpp: '',
      perpetualOrSubscription: '',
      hostingLocation: '',
      frontEndTech: '',
      exmUser: '',
      marketingAutomationUser: '',
      integrations: '',
      heavilyCustomisedCE: '',
      migrationComplexity: '',
      customerAwareOfXMC: '',
      compellingEvent: '',
      managedCloud: '',
      dateAnalysed: '',
      migrationNotes: '',
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
    <div className="p-6">
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
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Account Executive
              </label>
              <select
                value={watchedValues.accountExecutive?.id || ''}
                onChange={(e) => {
                  const selectedExec = customInternalContacts.find(c => c.id === e.target.value);
                  setValue('accountExecutive', selectedExec || undefined);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
              >
                <option value="">Select Account Executive...</option>
                {customInternalContacts.map(contact => (
                  <option key={contact.id} value={contact.id}>
                    {contact.name}{contact.role ? ` - ${contact.role}` : ''}
                  </option>
                ))}
              </select>
            </div>

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

        {/* Migration Opportunity Information */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Migration Opportunity Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Existing Migration Opp
              </label>
              <select {...register('existingMigrationOpp')} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white">
                <option value="">Not Set</option>
                <option value="yes">Yes</option>
                <option value="no">No</option>
                <option value="YES">YES (Active)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                License Type
              </label>
              <select {...register('perpetualOrSubscription')} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white">
                <option value="">Select...</option>
                <option value="Perpetual">Perpetual</option>
                <option value="Subscription">Subscription</option>
                <option value="Churn">Churn</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hosting Location
              </label>
              <input
                {...register('hostingLocation')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                placeholder="e.g., Azure, AWS, PaaS"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Front End Tech
              </label>
              <input
                {...register('frontEndTech')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                placeholder="e.g., MVC, mv"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                EXM User
              </label>
              <select {...register('exmUser')} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white">
                <option value="">Not Set</option>
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Marketing Automation User
              </label>
              <select {...register('marketingAutomationUser')} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white">
                <option value="">Not Set</option>
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Integrations
              </label>
              <input
                {...register('integrations')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                placeholder="e.g., Salesforce, Dynamics, CRM"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Heavily Customised CE
              </label>
              <select {...register('heavilyCustomisedCE')} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white">
                <option value="">Not Set</option>
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Migration Complexity
              </label>
              <select {...register('migrationComplexity')} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white">
                <option value="">Select...</option>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Customer Aware of XMC
              </label>
              <select {...register('customerAwareOfXMC')} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white">
                <option value="">Not Set</option>
                <option value="yes">Yes</option>
                <option value="no">No</option>
                <option value="YES">YES</option>
                <option value="Y">Y</option>
                <option value="N">N</option>
              </select>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Compelling Event
                </label>
                <AIButton 
                  currentText={watchedValues.compellingEvent || ''} 
                  onGenerated={(text) => setValue('compellingEvent', text)}
                  context={`Customer: ${watchedValues.customerName}, Products: ${watchedValues.products.map(p => p.name).join(', ')}`}
                />
              </div>
              <input
                {...register('compellingEvent')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                placeholder="e.g., 2026 upgrade, cost savings"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Managed Cloud
              </label>
              <select {...register('managedCloud')} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white">
                <option value="">Not Set</option>
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date Analysed
              </label>
              <input
                type="date"
                {...register('dateAnalysed')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
              />
            </div>


            <div className="md:col-span-3">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Migration Notes
                </label>
                <AIButton 
                  currentText={watchedValues.migrationNotes || ''} 
                  onGenerated={(text) => setValue('migrationNotes', text)}
                  context={`Customer: ${watchedValues.customerName}, Migration Complexity: ${watchedValues.migrationComplexity || 'Not specified'}`}
                />
              </div>
              <textarea
                {...register('migrationNotes')}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                placeholder="Add migration-specific notes here..."
              />
            </div>
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
