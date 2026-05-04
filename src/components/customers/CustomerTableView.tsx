'use client';

import { useState, useRef, useEffect } from 'react';
import { Building, ExternalLink, Link2, Edit, MoreVertical, Eye, Trash2 } from 'lucide-react';
import { LinkWithCopy } from '@/components/ui/LinkWithCopy';
import { TypeBadge } from '@/components/ui/TypeBadge';
import { Customer, CustomerNote } from '@/types';
import { safeFormatDate, toDate } from '@/lib/utils';
import { getAccountExecutiveColor } from '@/lib/accountExecutiveColors';
import { getMartechToolColor } from '@/lib/martechToolColors';
import { formatProductDisplayName } from '@/lib/productDisplay';
import { customerWebsiteList } from '@/lib/customerWebsites';

interface CustomerTableViewProps {
  customers: Customer[];
  notes?: CustomerNote[];
  selectedCustomerId: string | null;
  onSelectCustomer: (customerId: string) => void;
  onEditCustomer?: (customer: Customer) => void;
  onDeleteCustomer?: (customerId: string) => void;
}

function formatContactNameRole(contact: { name: string; role?: string } | undefined): string {
  if (!contact) return '';
  return contact.role ? `${contact.name} - ${contact.role}` : contact.name;
}

function getLastNoteDate(notes: CustomerNote[], customerId: string): Date | null {
  const customerNotes = notes.filter((n) => n.customerId === customerId);
  if (customerNotes.length === 0) return null;
  const sorted = [...customerNotes].sort((a, b) => {
    const da = toDate(a.noteDate)?.getTime() ?? 0;
    const db = toDate(b.noteDate)?.getTime() ?? 0;
    return db - da;
  });
  return toDate(sorted[0]?.noteDate) ?? null;
}

export function CustomerTableView({
  customers,
  notes = [],
  selectedCustomerId,
  onSelectCustomer,
  onEditCustomer,
  onDeleteCustomer,
}: CustomerTableViewProps) {
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

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gradient-to-r from-gray-50 to-slate-50 sticky top-0 z-10">
            <tr>
              <th className="px-3 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Customer</th>
              <th className="px-3 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Website</th>
              <th className="px-3 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Representative</th>
              <th className="px-3 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Products</th>
              <th className="px-3 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Martech</th>
              <th className="px-3 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">License</th>
              <th className="px-3 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Migration</th>
              <th className="px-3 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Last Note</th>
              <th className="px-3 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Partners</th>
              <th className="px-3 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Contacts</th>
              <th className="px-3 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
              <th className="px-3 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Updated</th>
              <th className="px-3 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Links</th>
              <th className="px-3 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-16">More</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {customers.map((customer) => {
              const contacts = customer.accountExecutives?.length
                ? customer.accountExecutives
                : customer.internalContacts?.length
                  ? customer.internalContacts
                  : customer.accountExecutive
                    ? [customer.accountExecutive]
                    : [];
              const primaryContact = contacts[0];
              const sites = customerWebsiteList(customer);
              const hasProducts = (customer.products?.length ?? 0) > 0;
              const lastNote = getLastNoteDate(notes, customer.id);
              const hasMigrationOpp = customer.existingMigrationOpp && ['yes', 'YES', 'y', 'Y'].includes(customer.existingMigrationOpp.toLowerCase());
              const isMenuOpen = openMenuId === customer.id;
              return (
                <tr
                  key={customer.id}
                  onClick={() => onSelectCustomer(customer.id)}
                  className={`cursor-pointer transition-colors ${
                    selectedCustomerId === customer.id
                      ? 'bg-sky-50'
                      : 'hover:bg-sky-50/30'
                  }`}
                >
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center shrink-0">
                        <Building className="h-4 w-4 text-blue-600" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-[15px] font-bold text-gray-900 truncate">{customer.customerName}</div>
                        <code className="text-xs font-mono text-gray-500" title="ID">{customer.id.slice(0, 8)}…</code>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    {sites.length > 0 ? (
                      <div className="flex flex-col gap-0.5 items-start" onClick={(e) => e.stopPropagation()}>
                        <LinkWithCopy
                          url={sites[0]}
                          label={sites[0].replace(/^https?:\/\//, '').slice(0, 18)}
                          linkClassName="text-blue-600 hover:text-blue-800 text-sm"
                        />
                        {sites.length > 1 && (
                          <span className="text-[11px] text-gray-500">+{sites.length - 1}</span>
                        )}
                      </div>
                    ) : (
                      <span className="text-gray-400 text-sm">—</span>
                    )}
                  </td>
                  <td className="px-3 py-3">
                    {primaryContact ? (
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium truncate max-w-[140px] ${getAccountExecutiveColor(primaryContact.name).badge}`}
                        title={primaryContact.email}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${getAccountExecutiveColor(primaryContact.name).dot}`} />
                        <span className="truncate">{formatContactNameRole(primaryContact)}</span>
                      </span>
                    ) : (
                      <span className="text-gray-400 text-sm">—</span>
                    )}
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex flex-wrap gap-1 max-w-[120px]">
                      {(customer.products || []).map((p) => (
                        <span
                          key={p.id}
                          className="inline-flex items-center px-2 py-0.5 rounded-md text-xs bg-blue-100 text-blue-800 font-medium"
                        >
                          {formatProductDisplayName(p)}
                        </span>
                      ))}
                      {(customer.products?.length ?? 0) === 0 && (
                        <span className="text-gray-400 text-sm">—</span>
                      )}
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex flex-wrap gap-1 max-w-[120px]">
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
                        <span className="text-gray-400 text-sm">—</span>
                      )}
                    </div>
                  </td>
                  <td className="px-3 py-3 text-sm text-gray-700">
                    {customer.perpetualOrSubscription || '—'}
                  </td>
                  <td className="px-3 py-3">
                    {hasMigrationOpp ? (
                      <TypeBadge label="Yes" variant="green" />
                    ) : customer.existingMigrationOpp ? (
                      <TypeBadge label="No" variant="gray" />
                    ) : (
                      <span className="text-gray-400 text-sm">—</span>
                    )}
                  </td>
                  <td className="px-3 py-3 text-sm text-gray-600">
                    {lastNote ? safeFormatDate(lastNote) : '—'}
                  </td>
                  <td className="px-3 py-3 text-sm font-medium text-gray-800">
                    {(customer.partners?.length ?? 0) > 0 ? (customer.partners?.length ?? 0) : '—'}
                  </td>
                  <td className="px-3 py-3 text-sm font-medium text-gray-800">
                    {customer.customerContacts?.length ?? 0}
                  </td>
                  <td className="px-3 py-3">
                    {hasProducts ? (
                      <TypeBadge label="Active" variant="green" />
                    ) : (
                      <TypeBadge label="Inactive" variant="gray" />
                    )}
                  </td>
                  <td className="px-3 py-3 text-sm text-gray-500">
                    {safeFormatDate(customer.updatedAt)}
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                      {customer.sharePointUrl && (
                        <LinkWithCopy
                          url={customer.sharePointUrl}
                          icon={<Link2 className="h-3.5 w-3.5 text-emerald-600 hover:text-emerald-700" />}
                          linkClassName="text-emerald-600 hover:text-emerald-700"
                          iconClassName="h-3.5 w-3.5"
                          onClick={(e) => e.stopPropagation()}
                        />
                      )}
                      {customer.salesforceLink && (
                        <LinkWithCopy
                          url={customer.salesforceLink}
                          icon={<ExternalLink className="h-3.5 w-3.5 text-amber-600 hover:text-amber-700" />}
                          linkClassName="text-amber-600 hover:text-amber-700"
                          iconClassName="h-3.5 w-3.5"
                          onClick={(e) => e.stopPropagation()}
                        />
                      )}
                    </div>
                  </td>
                  <td className="px-3 py-3" onClick={(e) => e.stopPropagation()}>
                    <div className="relative" ref={menuRef}>
                      <button
                        onClick={() => setOpenMenuId(isMenuOpen ? null : customer.id)}
                        className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                        title="More actions"
                        aria-expanded={isMenuOpen}
                      >
                        <MoreVertical className="h-4 w-4" />
                      </button>
                      {isMenuOpen && (
                        <div className="absolute right-0 top-full mt-1 py-1 bg-white rounded-lg shadow-lg border border-gray-200 z-20 min-w-[140px]">
                          <button
                            onClick={() => {
                              onSelectCustomer(customer.id);
                              setOpenMenuId(null);
                            }}
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          >
                            <Eye className="h-4 w-4" />
                            View Details
                          </button>
                          {onEditCustomer && (
                            <button
                              onClick={() => {
                                onEditCustomer(customer);
                                setOpenMenuId(null);
                              }}
                              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                            >
                              <Edit className="h-4 w-4" />
                              Edit
                            </button>
                          )}
                          {onDeleteCustomer && (
                            <button
                              onClick={() => {
                                if (confirm('Delete this customer and all associated notes?')) {
                                  onDeleteCustomer(customer.id);
                                  setOpenMenuId(null);
                                }
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
    </div>
  );
}
