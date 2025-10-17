'use client';

import { Building, Users, Package, ExternalLink, Globe, Link2 } from 'lucide-react';
import { Customer } from '@/types';

interface CustomerListProps {
  customers: Customer[];
  selectedCustomer: string | null;
  onSelectCustomer: (customerId: string | null) => void;
}

export function CustomerList({ 
  customers,
  selectedCustomer, 
  onSelectCustomer
}: CustomerListProps) {
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Customer Directory</h2>
          <p className="text-sm text-gray-600">{customers.length} customers</p>
        </div>
      </div>

      {/* Customer Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {customers.map((customer) => {
          const topProducts = customer.products.slice(0, 2);
          return (
            <button
              key={customer.id}
              onClick={() => onSelectCustomer(customer.id)}
              className={`text-left p-4 rounded-xl transition-all duration-200 border ${
                selectedCustomer === customer.id
                  ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-300 shadow-md'
                  : 'bg-white hover:bg-gray-50 border-gray-200 hover:border-gray-300 hover:shadow-sm'
              }`}
            >
              <div className="space-y-3">
                {/* Customer Name */}
                <div className="flex items-center gap-2">
                  <Building className="h-4 w-4 text-gray-500 flex-shrink-0" />
                  <h3 className="font-semibold text-gray-900 truncate text-sm">
                    {customer.customerName}
                  </h3>
                </div>

                {/* Website */}
                {customer.website && (
                  <div className="flex items-center gap-2 text-xs text-blue-600 truncate">
                    <Globe className="h-3 w-3 flex-shrink-0" />
                    <span className="truncate">
                      {customer.website.replace(/^https?:\/\//, '')}
                    </span>
                  </div>
                )}

                {/* Product badges */}
                {topProducts.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {topProducts.map((p) => (
                      <span
                        key={p.id}
                        className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800 font-medium"
                      >
                        {p.name}
                      </span>
                    ))}
                    {customer.products.length > 2 && (
                      <span className="text-xs text-gray-500 px-1">
                        +{customer.products.length - 2}
                      </span>
                    )}
                  </div>
                )}

                {/* Stats */}
                <div className="flex items-center justify-between text-xs text-gray-600">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      <Users className="h-3 w-3 text-green-500" />
                      <span>{customer.customerContacts.length}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <ExternalLink className="h-3 w-3 text-purple-500" />
                      <span>{customer.partners.length}</span>
                    </div>
                  </div>
                  <div className={`w-2 h-2 rounded-full ${
                    customer.products.length > 0 ? 'bg-green-400' : 'bg-gray-300'
                  }`} title={customer.products.length > 0 ? 'Active' : 'Inactive'} />
                </div>

                {/* Quick Links */}
                <div className="flex items-center gap-2 text-xs">
                  {customer.sharePointUrl && (
                    <a
                      href={customer.sharePointUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-green-600 hover:text-green-700 hover:underline"
                      onClick={(e) => e.stopPropagation()}
                      title="SharePoint"
                    >
                      <Link2 className="h-3 w-3" />
                    </a>
                  )}
                  {customer.salesforceLink && (
                    <a
                      href={customer.salesforceLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-orange-600 hover:text-orange-700 hover:underline"
                      onClick={(e) => e.stopPropagation()}
                      title="Salesforce"
                    >
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {customers.length === 0 && (
        <div className="text-center py-12">
          <Building className="mx-auto h-12 w-12 text-gray-300" />
          <p className="mt-3 text-sm text-gray-500">No customers available</p>
        </div>
      )}
    </div>
  );
}