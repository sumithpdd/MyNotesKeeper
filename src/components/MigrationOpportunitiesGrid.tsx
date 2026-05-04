'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { Download, Filter, Search, Calendar, Edit, User, MoreVertical, Eye, Trash2 } from 'lucide-react';
import { Customer } from '@/types';
import { getAccountExecutiveColor } from '@/lib/accountExecutiveColors';
import { getMartechToolColor } from '@/lib/martechToolColors';
import { formatProductDisplayName } from '@/lib/productDisplay';

interface MigrationOpportunitiesGridProps {
  customers: Customer[];
  onEdit?: (customer: Customer) => void;
  onDelete?: (id: string) => void;
  onSelectCustomer?: (customerId: string) => void;
}

export function MigrationOpportunitiesGrid({ 
  customers, 
  onEdit, 
  onDelete,
  onSelectCustomer,
}: MigrationOpportunitiesGridProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  const [filter, setFilter] = useState<'all' | 'yes' | 'no'>('all');
  const [filterAE, setFilterAE] = useState<string>('all');
  
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
        (customer.products ?? []).some(
          (p) =>
            p.name.toLowerCase().includes(term) ||
            p.version?.toLowerCase().includes(term) ||
            formatProductDisplayName(p).toLowerCase().includes(term)
        ) ||
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

    // Filter by Account Executive (match by name)
    if (filterAE !== 'all') {
      filtered = filtered.filter(customer => {
        const aes = customer.accountExecutives || (customer.accountExecutive ? [customer.accountExecutive] : []) || customer.internalContacts || [];
        return aes.some(c => c?.name === filterAE);
      });
    }
    
    return filtered;
  }, [migrationOpportunities, searchTerm, filter, filterAE]);

  const uniqueAEs = useMemo(() => {
    const set = new Set<string>();
    migrationOpportunities.forEach(c => {
      const aes = c.accountExecutives || (c.accountExecutive ? [c.accountExecutive] : []) || c.internalContacts || [];
      aes.forEach(ae => { if (ae?.name) set.add(ae.name); });
    });
    return Array.from(set).sort();
  }, [migrationOpportunities]);
  
  // Export to CSV
  const handleExportCSV = () => {
    const headers = [
      'Customer Name',
      'Account Executive',
      'Product',
      'Version',
      'Martech Tools',
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
      ...filteredOpportunities.map(customer => {
        const ae = customer.accountExecutive?.name || customer.internalContacts?.[0]?.name;
        const aeLabel = customer.accountExecutive?.role
          ? `${customer.accountExecutive.name} - ${customer.accountExecutive.role}`
          : customer.internalContacts?.[0]?.role
            ? `${customer.internalContacts[0].name} - ${customer.internalContacts[0].role}`
            : ae;
        return [
          customer.customerName,
          aeLabel || '',
          (customer.products ?? []).map((p) => formatProductDisplayName(p)).join('; ') || '',
          (customer.products ?? []).map((p) => p.version || '').join('; ') || '',
          (customer.martechTools || []).map(t => t.name).join(', ') || '',
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
        ];
      }).map(row => row.map(val => `"${(val || '').toString().replace(/"/g, '""')}"`).join(','))
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
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-gray-400" />
          <select
            value={filterAE}
            onChange={(e) => setFilterAE(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Account Executives</option>
            {uniqueAEs.map(ae => (
              <option key={ae} value={ae}>{ae}</option>
            ))}
          </select>
        </div>
      </div>

      {/* AE Color Legend */}
      {uniqueAEs.length > 0 && (
        <div className="flex flex-wrap gap-2 items-center text-xs">
          <span className="text-gray-500 font-medium">By AE:</span>
          {uniqueAEs.map(ae => {
            const c = getAccountExecutiveColor(ae);
            return (
              <span key={ae} className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full ${c.badge}`}>
                <span className={`w-2 h-2 rounded-full ${c.dot}`} />
                {ae}
              </span>
            );
          })}
        </div>
      )}
      
      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto max-h-[75vh] overflow-y-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Account Executive</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Products</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Martech Tools</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">License</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hosting</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Complexity</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Compelling Event</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Notes</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date Analysed</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-16">More</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredOpportunities.map((customer) => {
                const contacts = customer.accountExecutives?.length
                  ? customer.accountExecutives
                  : customer.internalContacts?.length
                    ? customer.internalContacts
                    : customer.accountExecutive
                      ? [customer.accountExecutive]
                      : [];
                const primaryContact = contacts[0];
                const aeName = primaryContact?.name;
                const aeLabel = primaryContact?.role ? `${primaryContact.name} - ${primaryContact.role}` : primaryContact?.name;
                const aeColor = getAccountExecutiveColor(aeName);
                return (
                <tr
                  key={customer.id}
                  className={`hover:opacity-90 transition-all border-l-4 ${aeColor.border} ${aeColor.bg}`}
                >
                  <td className="px-3 py-2 font-medium text-gray-900">{customer.customerName}</td>
                  <td className="px-3 py-2">
                    <code className="text-xs text-gray-500 font-mono" title="customers/{customer.id}">{customer.id}</code>
                  </td>
                  <td className="px-3 py-2">
                    {aeLabel ? (
                      <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${aeColor.badge}`}>
                        <span className={`w-2 h-2 rounded-full ${aeColor.dot}`} />
                        {aeLabel}
                      </span>
                    ) : (
                      <span className="text-gray-400 text-sm">—</span>
                    )}
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex flex-wrap gap-1">
                      {(customer.products ?? []).length > 0 ? (
                        (customer.products ?? []).map((p) => (
                          <span
                            key={p.id}
                            className="inline-flex px-2 py-0.5 rounded text-xs bg-white/80 text-gray-800 border border-gray-200 font-medium"
                          >
                            {formatProductDisplayName(p)}
                          </span>
                        ))
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex flex-wrap gap-1">
                      {(customer.martechTools || []).length > 0 ? (
                        customer.martechTools!.map((t) => {
                          const c = getMartechToolColor(t.name);
                          return (
                            <span
                              key={t.id}
                              className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${c.bg} ${c.text}`}
                              title={t.purpose}
                            >
                              {t.name}
                            </span>
                          );
                        })
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </div>
                  </td>
                  <td className="px-3 py-2 text-gray-900">{customer.perpetualOrSubscription || '-'}</td>
                  <td className="px-3 py-2 text-gray-900">{customer.hostingLocation || '-'}</td>
                  <td className="px-3 py-2">
                    {customer.migrationComplexity ? (
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        customer.migrationComplexity.toLowerCase() === 'high' ? 'bg-red-100 text-red-800' :
                        customer.migrationComplexity.toLowerCase() === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {customer.migrationComplexity}
                      </span>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                  <td className="px-3 py-2 text-gray-900 max-w-xs truncate" title={customer.compellingEvent || ''}>
                    {customer.compellingEvent || '-'}
                  </td>
                  <td className="px-3 py-2 text-gray-900 max-w-xs truncate" title={customer.migrationNotes || customer.mergedNotes || ''}>
                    {customer.migrationNotes || customer.mergedNotes || '-'}
                  </td>
                  <td className="px-3 py-2 text-sm text-gray-600">
                    {customer.dateAnalysed || '—'}
                  </td>
                  <td className="px-3 py-2">
                    <div className="relative" ref={menuRef}>
                      <button
                        onClick={(e) => { e.stopPropagation(); setOpenMenuId(openMenuId === customer.id ? null : customer.id); }}
                        className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                        title="More actions"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </button>
                      {openMenuId === customer.id && (
                        <div className="absolute right-0 top-full mt-1 py-1 bg-white rounded-lg shadow-lg border border-gray-200 z-20 min-w-[140px]">
                          {onSelectCustomer && (
                            <button
                              onClick={() => { onSelectCustomer(customer.id); setOpenMenuId(null); }}
                              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                            >
                              <Eye className="h-4 w-4" />
                              View Details
                            </button>
                          )}
                          {onEdit && (
                            <button
                              onClick={() => { onEdit(customer); setOpenMenuId(null); }}
                              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                            >
                              <Edit className="h-4 w-4" />
                              Edit
                            </button>
                          )}
                          {onDelete && (
                            <button
                              onClick={() => {
                                if (confirm('Delete this customer?')) { onDelete(customer.id); setOpenMenuId(null); }
                              }}
                              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                              Delete
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              );
              })}
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


