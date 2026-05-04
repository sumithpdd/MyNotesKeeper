'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Save, X, Building, Users, ExternalLink, Globe, Link2, GitBranch } from 'lucide-react';
import { Customer, CreateCustomerData, MartechTool } from '@/types';
import { MultiSelect } from './ui/MultiSelect';
import { AIButton } from './ui/AIButton';
import { 
  dummyProducts, 
  dummyCustomerContacts, 
  dummyInternalContacts,
  dummyPartners 
} from '../../data/dummyData';
import { formatProductDisplayName } from '@/lib/productDisplay';
import { customerWebsiteList, parseWebsitesFromFormText } from '@/lib/customerWebsites';

const customerSchema = z.object({
  customerName: z.string().min(1, 'Customer name is required'),
  /** One public site URL per line */
  websitesText: z.string().optional(),
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
    companyName: z.string().optional(),
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
  accountExecutives: z.array(z.object({
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
  martechTools: z.array(z.object({
    id: z.string(),
    name: z.string(),
    purpose: z.string(),
  })).optional(),
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
  products?: { id: string; name: string; version?: string }[];
  partners?: { id: string; name: string; type?: string }[];
  martechTools?: MartechTool[];
  internalContacts?: { id: string; name: string; role?: string; email?: string }[];
  onSave: (customer: Customer) => void;
  onCancel: () => void;
}

export function CustomerForm({ customer, products = [], partners = [], martechTools = [], internalContacts = [], onSave, onCancel }: CustomerFormProps) {
  const [customProducts, setCustomProducts] = useState(dummyProducts);
  const [customCustomerContacts, setCustomCustomerContacts] = useState(dummyCustomerContacts);
  const [customInternalContacts, setCustomInternalContacts] = useState(internalContacts.length > 0 ? internalContacts : dummyInternalContacts);
  const [customPartners, setCustomPartners] = useState(dummyPartners);
  const formProducts = products.length > 0 ? products : customProducts;
  const formPartners = partners.length > 0 ? partners : customPartners;
  const formInternalContacts = internalContacts.length > 0 ? internalContacts : customInternalContacts;

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
      websitesText: customerWebsiteList(customer).join('\n'),
      products: customer.products,
      customerContacts: customer.customerContacts,
      internalContacts: customer.internalContacts,
      accountExecutives: customer.accountExecutives?.length ? customer.accountExecutives : (customer.accountExecutive ? [customer.accountExecutive] : []),
      partners: customer.partners,
      martechTools: customer.martechTools || [],
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
      websitesText: '',
      products: [],
      customerContacts: [],
      internalContacts: [],
      accountExecutives: [],
      partners: [],
      martechTools: [],
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
      
      const products = data.products || [];
      const customerContacts = data.customerContacts || [];
      const internalContacts = data.internalContacts || [];
      const partners = data.partners || [];
      const { websitesText, ...rest } = data;
      const { website, websiteUrls } = parseWebsitesFromFormText(websitesText || '');
      const customerData = {
        ...rest,
        website,
        websiteUrls,
        productIds: products.map((p: { id: string }) => p.id),
        customerContactIds: customerContacts.map((c: { id: string }) => c.id),
        internalContactIds: internalContacts.map((c: { id: string }) => c.id),
        partnerIds: partners.map((p: { id: string }) => p.id),
        martechToolIds: (data.martechTools || []).map((t: { id: string }) => t.id),
      } as CreateCustomerData;

      const savedCustomer: Customer = {
        id: customer?.id || crypto.randomUUID(),
        ...customerData,
        martechTools: data.martechTools,
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
    <div className="p-6 max-w-4xl">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Basic Information */}
        <section className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 mb-5 flex items-center gap-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Building className="h-5 w-5 text-blue-600" />
            </div>
            Customer Information
          </h2>
          {customer?.id && (
            <div className="mb-5 p-3 bg-gray-50 rounded-lg">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Collection ID</label>
              <code className="text-sm font-mono text-gray-700" title="customers/{customer.id}">
                {customer.id}
              </code>
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <Building className="h-4 w-4 text-gray-500" />
                Customer Name *
              </label>
              <input
                {...register('customerName')}
                className="input-field"
                placeholder="Enter customer name"
              />
              {errors.customerName && (
                <p className="mt-1 text-sm text-red-600">{errors.customerName.message}</p>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <Globe className="h-4 w-4 text-blue-600" />
                Website URLs
              </label>
              <textarea
                {...register('websitesText')}
                rows={3}
                className="input-field resize-y min-h-[5rem]"
                placeholder={'https://www.company.com\nhttps://www.company.co.uk'}
              />
              <p className="mt-1 text-xs text-gray-500">Enter one URL per line for accounts with multiple sites.</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <Link2 className="h-4 w-4 text-emerald-600" />
                SharePoint URL
              </label>
              <div className="relative">
                <input
                  {...register('sharePointUrl')}
                  className="input-field pr-10"
                  placeholder="https://company.sharepoint.com/sites/..."
                />
                <ExternalLink className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <ExternalLink className="h-4 w-4 text-amber-600" />
                Salesforce Link
              </label>
              <div className="relative">
                <input
                  {...register('salesforceLink')}
                  className="input-field pr-10"
                  placeholder="https://company.lightning.force.com/..."
                />
                <ExternalLink className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <Link2 className="h-4 w-4 text-violet-600" />
                Additional Link
              </label>
              <div className="relative">
                <input
                  {...register('additionalLink')}
                  className="input-field pr-10"
                  placeholder="https://loop.microsoft.com/... or other document links"
                />
                <ExternalLink className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>
        </section>

        {/* Contacts and Products */}
        <section className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 mb-5 flex items-center gap-2">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <Users className="h-5 w-5 text-indigo-600" />
            </div>
            Contacts & Products
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <MultiSelect
              options={customCustomerContacts}
              selected={watchedValues.customerContacts.map(c => typeof c === 'string' ? c : c.id)}
              onChange={(selected) => {
                const selectedObjects = selected.map(id => 
                  customCustomerContacts.find(c => c.id === id) || { id, name: id, companyName: '', email: '', role: '' }
                );
                setValue('customerContacts', selectedObjects);
              }}
              label="Customer Contacts"
              placeholder="Select customer contacts..."
              allowCustom
              onAddCustom={(value) => {
                const newContact = { id: `custom-${Date.now()}`, name: value, companyName: '', email: '', role: '' };
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
              options={formInternalContacts.map(c => ({ id: c.id, name: `${c.name}${c.role ? ` - ${c.role}` : ''}`, description: c.email }))}
              selected={(watchedValues.accountExecutives || []).map(c => typeof c === 'string' ? c : c.id)}
              onChange={(selected) => {
                const selectedObjects = selected.map(id =>
                  formInternalContacts.find(c => c.id === id) || { id, name: id, role: '', email: '' }
                );
                setValue('accountExecutives', selectedObjects);
              }}
              label="Account Executives"
              placeholder="Select Account Executive(s)..."
              allowCustom={internalContacts.length === 0}
              onAddCustom={internalContacts.length === 0 ? (value) => {
                const newContact = { id: `custom-${Date.now()}`, name: value, role: 'Account Executive', email: '' };
                setCustomInternalContacts(prev => [...prev, newContact]);
                setValue('accountExecutives', [...(watchedValues.accountExecutives || []), newContact]);
              } : undefined}
            />

            <MultiSelect
              options={formProducts.map(p => ({ id: p.id, name: p.name, version: p.version }))}
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
              onAddCustom={products.length > 0 ? undefined : (value) => {
                const newProduct = { id: `custom-${Date.now()}`, name: value, version: '' };
                setCustomProducts([...customProducts, newProduct]);
                setValue('products', [...watchedValues.products, newProduct]);
              }}
            />

            {martechTools.length > 0 && (
              <MultiSelect
                options={martechTools.map(t => ({ id: t.id, name: t.name, description: t.purpose }))}
                selected={(watchedValues.martechTools || []).map((t: { id: string }) => t.id)}
                onChange={(selected) => {
                  const selectedObjects = selected.map(id => martechTools.find(t => t.id === id)).filter(Boolean) as MartechTool[];
                  setValue('martechTools', selectedObjects);
                }}
                label="Martech Tools"
                placeholder="Select martech tools (e.g. Salesforce, DotMailer)..."
              />
            )}

            <MultiSelect
              options={formPartners.map(p => ({ id: p.id, name: p.name, description: p.type }))}
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
              onAddCustom={partners.length > 0 ? undefined : (value) => {
                const newPartner = { id: `custom-${Date.now()}`, name: value, type: '' };
                setCustomPartners([...customPartners, newPartner]);
                setValue('partners', [...watchedValues.partners, newPartner]);
              }}
            />
          </div>
        </section>

        {/* Migration Opportunity Information */}
        <section className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 mb-5 flex items-center gap-2">
            <div className="p-2 bg-amber-100 rounded-lg">
              <GitBranch className="h-5 w-5 text-amber-600" />
            </div>
            Migration Opportunity Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Existing Migration Opp
              </label>
              <select {...register('existingMigrationOpp')} className="select-field">
                <option value="">Not Set</option>
                <option value="yes">Yes</option>
                <option value="no">No</option>
                <option value="YES">YES (Active)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                License Type
              </label>
              <select {...register('perpetualOrSubscription')} className="select-field">
                <option value="">Select...</option>
                <option value="Perpetual">Perpetual</option>
                <option value="Subscription">Subscription</option>
                <option value="Churn">Churn</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Hosting Location
              </label>
              <input
                {...register('hostingLocation')}
                className="input-field"
                placeholder="e.g., Azure, AWS, PaaS"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Front End Tech
              </label>
              <input
                {...register('frontEndTech')}
                className="input-field"
                placeholder="e.g., MVC, mv"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                EXM User
              </label>
              <select {...register('exmUser')} className="select-field">
                <option value="">Not Set</option>
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Marketing Automation User
              </label>
              <select {...register('marketingAutomationUser')} className="select-field">
                <option value="">Not Set</option>
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Integrations
              </label>
              <input
                {...register('integrations')}
                className="input-field"
                placeholder="e.g., Salesforce, Dynamics, CRM"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Heavily Customised CE
              </label>
              <select {...register('heavilyCustomisedCE')} className="select-field">
                <option value="">Not Set</option>
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Migration Complexity
              </label>
              <select {...register('migrationComplexity')} className="select-field">
                <option value="">Select...</option>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Customer Aware of XMC
              </label>
              <select {...register('customerAwareOfXMC')} className="select-field">
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
                  context={`Customer: ${watchedValues.customerName}, Products: ${watchedValues.products.map((p) => formatProductDisplayName(p)).join(', ')}`}
                />
              </div>
              <input
                {...register('compellingEvent')}
                className="input-field"
                placeholder="e.g., 2026 upgrade, cost savings"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Managed Cloud
              </label>
              <select {...register('managedCloud')} className="select-field">
                <option value="">Not Set</option>
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Date Analysed
              </label>
              <input
                type="date"
                {...register('dateAnalysed')}
                className="input-field"
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
                className="input-field"
                placeholder="Add migration-specific notes here..."
              />
            </div>
          </div>
        </section>

        {/* Form Actions */}
        <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={onCancel}
            className="flex items-center gap-2 px-5 py-3 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 font-medium transition-colors"
          >
            <X className="h-4 w-4" />
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-2 px-6 py-3 text-white bg-blue-600 rounded-lg hover:bg-blue-700 font-medium transition-colors disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            {isSubmitting ? 'Saving...' : 'Save Customer'}
          </button>
        </div>
      </form>
    </div>
  );
}
