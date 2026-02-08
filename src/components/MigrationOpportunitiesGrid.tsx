'use client';

import { useState, useMemo } from 'react';
import { Download, Filter, Search, Calendar, Edit } from 'lucide-react';
import { Customer } from '@/types';

interface MigrationOpportunitiesGridProps {
  customers: Customer[];
  onEdit?: (customer: Customer) => void;
  onDelete?: (id: string) => void;
}

export function MigrationOpportunitiesGrid({ 
  customers, 
  onEdit, 
  onDelete 
}: MigrationOpportunitiesGridProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'yes' | 'no'>('all');
  
  // Filter customers for migration opportunities
  const migrationOpportunities = useMemo(() => {
    return customers.filter(customer => 
      customer.existingMigrationOpp && 
      ['yes', 'YES', 'y', 'Y'].includes(customer.existingMigrationOpp.toLowerCase())
    );
  }, [customers]);
  
  // Filter opportunities
  const filteredOpportunities = useMemo(() => {
    let filtered = migrationOpportunities;
    
    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(customer => 
        customer.customerName.toLowerCase().includes(term) ||
        customer.products.some(p => p.name.toLowerCase().includes(term) || p.version?.toLowerCase().includes(term)) ||
        customer.migrationComplexity?.toLowerCase().includes(term) ||
        customer.mergedNotes?.toLowerCase().includes(term) ||
        customer.hostingLocation?.toLowerCase().includes(term) ||
        customer.compellingEvent?.toLowerCase().includes(term)
      );
    }
    
    // Apply migration opp filter (already filtered by migrationOpportunities above)
    if (filter === 'yes') {
      filtered = filtered.filter(customer => customer.existingMigrationOpp && ['yes', 'YES', 'y', 'Y'].includes(customer.existingMigrationOpp.toLowerCase()));
    } else if (filter === 'no') {
      filtered = filtered.filter(customer => !customer.existingMigrationOpp || customer.existingMigrationOpp.toLowerCase() === 'no' || customer.existingMigrationOpp.toLowerCase() === 'n');
    }
    
    return filtered;
  }, [migrationOpportunities, searchTerm, filter]);
  
  // Export to CSV
  const handleExportCSV = () => {
    const headers = [
      'Customer Name',
      'Product',
      'Version',
      'Perpetual or Subscription',
      'Hosting Location',
      'Front End Tech',
      'EXM User',
      'Marketing Automation User',
      'Integrations',
      'Heavily customised CE',
      'Migration Complexity',
      'Customer aware of XMC',
      'Compelling Event',
      'Managed Cloud',
      'Date Analysed',
      'Existing Migration Opp',
      'Migration Notes'
    ];
    
    const csvRows = [
      headers.join(','),
      ...filteredOpportunities.map(customer => [
        customer.customerName,
        customer.products.map(p => p.name).join(', ') || '',
        customer.products.map(p => p.version || '').join(', ') || '',
        customer.perpetualOrSubscription || '',
        customer.hostingLocation || '',
        customer.frontEndTech || '',
        customer.exmUser || '',
        customer.marketingAutomationUser || '',
        customer.integrations || '',
        customer.heavilyCustomisedCE || '',
        customer.migrationComplexity || '',
        customer.customerAwareOfXMC || '',
        customer.compellingEvent || '',
        customer.managedCloud || '',
        customer.dateAnalysed || '',
        customer.existingMigrationOpp || '',
        customer.migrationNotes || customer.mergedNotes || ''
      ].map(val => `"${(val || '').toString().replace(/"/g, '""')}"`).join(','))
    ];
    
    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `migration-opportunities-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const getMigrationOppBadge = (value: string | undefined) => {
    if (!value) return null;
    const lower = value.toLowerCase();
    if (lower === 'yes' || lower === 'y' || lower === 'YES') {
      return <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">Yes</span>;
    }
    return <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">Active</span>;
  };
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Migration Opportunities</h2>
          <p className="text-gray-600">{filteredOpportunities.length} of {migrationOpportunities.length} opportunities (from {customers.length} total customers)</p>
        </div>
        <button
          onClick={handleExportCSV}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Download className="h-4 w-4" />
          Export CSV
        </button>
      </div>
      
      {/* Filters */}
      <div className="flex items-center gap-4 bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by account name, owner, product, or notes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-400" />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as 'all' | 'yes' | 'no')}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
              <option value="all">All Migration Opportunities</option>
            <option value="yes">With Migration Opp</option>
            <option value="no">Without Migration Opp</option>
          </select>
        </div>
      </div>
      
      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto max-h-[75vh] overflow-y-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">License</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hosting</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Complexity</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Compelling Event</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Notes</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredOpportunities.map((customer) => (
                <tr key={customer.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-3 py-2 font-medium text-gray-900">{customer.customerName}</td>
                  <td className="px-3 py-2 text-gray-900">{customer.products.map(p => `${p.name}${p.version ? ` v${p.version}` : ''}`).join(', ') || '-'}</td>
                  <td className="px-3 py-2 text-gray-900">{customer.perpetualOrSubscription || '-'}</td>
                  <td className="px-3 py-2 text-gray-900">{customer.hostingLocation || '-'}</td>
                  <td className="px-3 py-2">
                    {customer.migrationComplexity && (
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        customer.migrationComplexity.toLowerCase() === 'high' ? 'bg-red-100 text-red-800' :
                        customer.migrationComplexity.toLowerCase() === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {customer.migrationComplexity}
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-2 text-gray-900 max-w-xs truncate" title={customer.compellingEvent || ''}>
                    {customer.compellingEvent || '-'}
                  </td>
                  <td className="px-3 py-2 text-gray-900 max-w-xs truncate" title={customer.migrationNotes || customer.mergedNotes || ''}>
                    {customer.migrationNotes || customer.mergedNotes || '-'}
                  </td>
                  <td className="px-3 py-2">
                    {onEdit && (
                      <button
                        onClick={() => onEdit(customer)}
                        className="inline-flex items-center px-2 py-1 text-xs font-medium text-blue-700 bg-blue-50 rounded hover:bg-blue-100 transition-colors"
                        title="Edit Customer"
                      >
                        <Edit className="h-3 w-3 mr-1" />
                        Edit
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredOpportunities.length === 0 && (
          <div className="text-center py-12">
            <Calendar className="mx-auto h-12 w-12 text-gray-300" />
            <p className="mt-3 text-sm text-gray-500">No migration opportunities found</p>
          </div>
        )}
      </div>
    </div>
  );
}


