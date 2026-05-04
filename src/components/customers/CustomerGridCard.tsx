'use client';

import { ExternalLink, Globe, Link2, Edit } from 'lucide-react';
import { LinkWithCopy } from '@/components/ui/LinkWithCopy';
import { Customer } from '@/types';
import { safeFormatDate } from '@/lib/utils';
import { getAccountExecutiveColor } from '@/lib/accountExecutiveColors';
import { getMartechToolColor } from '@/lib/martechToolColors';
import { formatProductDisplayName } from '@/lib/productDisplay';
import { customerWebsiteList } from '@/lib/customerWebsites';

interface CustomerGridCardProps {
  customer: Customer;
  isSelected: boolean;
  onClick: () => void;
  onEdit?: () => void;
}

function formatContactNameRole(contact: { name: string; role?: string } | undefined): string {
  if (!contact) return '';
  return contact.role ? `${contact.name} - ${contact.role}` : contact.name;
}

export function CustomerGridCard({ customer, isSelected, onClick, onEdit }: CustomerGridCardProps) {
  const products = customer.products || [];
  const primaryAe = (customer.accountExecutives?.[0] || customer.internalContacts?.[0] || customer.accountExecutive);
  const aeColor = getAccountExecutiveColor(primaryAe?.name);
  const initials = customer.customerName?.slice(0, 2).toUpperCase() ?? '??';
  const sites = customerWebsiteList(customer);

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(); } }}
      className={`group relative text-left overflow-hidden rounded-xl transition-all duration-200 w-full min-w-0 cursor-pointer ${
        isSelected
          ? 'ring-2 ring-blue-500 ring-offset-2 shadow-md'
          : 'hover:shadow-md hover:ring-1 hover:ring-gray-200'
      }`}
    >
      <div
        className={`relative p-5 min-w-0 rounded-xl ${
          isSelected
            ? 'bg-white shadow-sm'
            : 'bg-white border border-gray-200/80 hover:border-gray-300'
        }`}
      >
        {/* Header: Avatar + Name + Actions */}
        <div className="flex items-start gap-3 mb-3 min-w-0">
          <div
            className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center text-sm font-semibold ${
              isSelected ? 'bg-blue-500 text-white' : aeColor.badge
            }`}
          >
            {initials}
          </div>
          <div className="min-w-0 flex-1 overflow-hidden">
            <h2 className="font-semibold text-gray-900 truncate text-[15px] leading-tight">
              {customer.customerName}
            </h2>
            {primaryAe && (
              <p className="text-xs text-gray-500 truncate mt-0.5">
                {formatContactNameRole(primaryAe)}
              </p>
            )}
          </div>
          <div className="flex items-center gap-1 shrink-0">
            {onEdit && (
              <button
                onClick={(e) => { e.stopPropagation(); e.preventDefault(); onEdit(); }}
                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                title="Edit customer"
              >
                <Edit className="h-4 w-4" />
              </button>
            )}
            <div
              className={`w-2 h-2 rounded-full shrink-0 ${
                products.length > 0 ? 'bg-emerald-500' : 'bg-gray-300'
              }`}
              title={products.length > 0 ? 'Active' : 'Inactive'}
            />
          </div>
        </div>

        {/* Websites */}
        {sites.length > 0 && (
          <div className="flex flex-col gap-1 mb-3 min-w-0">
            {sites.slice(0, 2).map((url) => (
              <div key={url} className="flex items-center gap-1.5 text-xs text-blue-600 truncate">
                <Globe className="h-3.5 w-3.5 shrink-0 text-blue-500" />
                <span className="truncate">{url.replace(/^https?:\/\//, '')}</span>
              </div>
            ))}
            {sites.length > 2 && (
              <span className="text-[11px] text-gray-500">+{sites.length - 2} more</span>
            )}
          </div>
        )}

        {/* Badges row: Products + Martech */}
        <div className="flex flex-wrap gap-1.5 mb-3 min-w-0">
          {products.slice(0, 2).map((p) => (
            <span
              key={p.id}
              className="inline-flex px-2 py-0.5 rounded-md text-xs font-medium bg-blue-50 text-blue-700"
            >
              {formatProductDisplayName(p)}
            </span>
          ))}
          {(customer.martechTools || []).slice(0, 2).map((t) => {
            const c = getMartechToolColor(t.name);
            return (
              <span
                key={t.id}
                className={`inline-flex px-2 py-0.5 rounded-md text-xs font-medium ${c.bg} ${c.text}`}
                title={t.purpose}
              >
                {t.name}
              </span>
            );
          })}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100 gap-2 min-w-0">
          <div className="flex items-center gap-3 text-xs text-gray-500">
            <span>{customer.customerContacts?.length ?? 0} contacts</span>
            <span>{customer.partners?.length ?? 0} partners</span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs text-gray-400">{safeFormatDate(customer.updatedAt)}</span>
            <div className="flex items-center gap-0.5" onClick={(e) => e.stopPropagation()}>
              {customer.sharePointUrl && (
                <LinkWithCopy
                  url={customer.sharePointUrl}
                  icon={<Link2 className="h-3.5 w-3.5 text-gray-400 hover:text-emerald-600" />}
                  linkClassName="text-emerald-600"
                  iconClassName="h-3.5 w-3.5"
                  onClick={(e) => e.stopPropagation()}
                />
              )}
              {customer.salesforceLink && (
                <LinkWithCopy
                  url={customer.salesforceLink}
                  icon={<ExternalLink className="h-3.5 w-3.5 text-gray-400 hover:text-amber-600" />}
                  linkClassName="text-amber-600"
                  iconClassName="h-3.5 w-3.5"
                  onClick={(e) => e.stopPropagation()}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
