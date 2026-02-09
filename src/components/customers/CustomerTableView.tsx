'use client';

import { Building, Users, ExternalLink, Link2, User } from 'lucide-react';
import { Customer } from '@/types';

interface CustomerTableViewProps {
  customers: Customer[];
  selectedCustomerId: string | null;
  onSelectCustomer: (customerId: string) => void;
}

export function CustomerTableView({
  customers,
  selectedCustomerId,
  onSelectCustomer,
}: CustomerTableViewProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Account Executive</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Products</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Partners</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contacts</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Updated</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Links</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {customers.map((customer) => (
              <tr
                key={customer.id}
                onClick={() => onSelectCustomer(customer.id)}
                className={`cursor-pointer transition-colors ${
                  selectedCustomerId === customer.id
                    ? 'bg-blue-50'
                    : 'hover:bg-gray-50'
                }`}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <Building className="h-4 w-4 text-gray-400 mr-2" />
                    <div>
                      <div className="text-sm font-medium text-gray-900">{customer.customerName}</div>
                      {customer.website && (
                        <div className="text-xs text-gray-500">{customer.website.replace(/^https?:\/\//, '')}</div>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {customer.accountExecutive ? (
                    <div className="flex items-center">
                      <User className="h-4 w-4 text-purple-500 mr-2" />
                      <span className="text-sm text-gray-900">{customer.accountExecutive.name}</span>
                    </div>
                  ) : (
                    <span className="text-sm text-gray-400">-</span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-wrap gap-1">
                    {customer.products.slice(0, 2).map((p) => (
                      <span
                        key={p.id}
                        className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-blue-100 text-blue-800 font-medium"
                      >
                        {p.name}
                      </span>
                    ))}
                    {customer.products.length > 2 && (
                      <span className="text-xs text-gray-500">+{customer.products.length - 2}</span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {customer.partners.length > 0 ? customer.partners.length : '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {customer.customerContacts.length}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(customer.updatedAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <div className="flex items-center gap-2">
                    {customer.sharePointUrl && (
                      <a
                        href={customer.sharePointUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-green-600 hover:text-green-700"
                        onClick={(e) => e.stopPropagation()}
                        title="SharePoint"
                      >
                        <Link2 className="h-4 w-4" />
                      </a>
                    )}
                    {customer.salesforceLink && (
                      <a
                        href={customer.salesforceLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-orange-600 hover:text-orange-700"
                        onClick={(e) => e.stopPropagation()}
                        title="Salesforce"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
