'use client';

import { useMemo, useCallback } from 'react';
import {
  Users,
  Building,
  Building2,
  Package,
  ExternalLink,
  Plus,
  Edit,
  Trash2,
  Search,
  Filter,
  Mail,
  Phone,
  Globe,
  User,
  Briefcase,
  Target,
  Tag,
  Calendar,
  FileText,
} from 'lucide-react';
import { CustomerContact, InternalContact, Product, Partner, MartechTool, Customer, Opportunity, EngagementTask } from '@/types';
import { safeFormatDate } from '@/lib/utils';
import { TypeBadge, DetailRow, Avatar, TitleBadge } from '@/components/ui';
import { useEntityManagement, type EntityItem } from '@/hooks/useEntityManagement';
import { CustomerContactForm } from './forms/CustomerContactForm';
import { InternalContactForm } from './forms/InternalContactForm';
import { ProductForm } from './forms/ProductForm';
import { PartnerForm } from './forms/PartnerForm';
import { MartechToolForm } from './forms/MartechToolForm';
import { formatProductDisplayName } from '@/lib/productDisplay';
import { buildProductReferenceIndex } from '@/lib/productReferenceIndex';
import { buildMartechReferenceIndex } from '@/lib/martechReferenceIndex';

interface EntityManagementProps {
  customerContacts: CustomerContact[];
  internalContacts: InternalContact[];
  products: Product[];
  partners: Partner[];
  martechTools?: MartechTool[];
  onUpdateCustomerContacts: (contacts: CustomerContact[]) => void;
  onUpdateInternalContacts: (contacts: InternalContact[]) => void;
  onUpdateProducts: (products: Product[]) => void;
  onUpdatePartners: (partners: Partner[]) => void;
  onUpdateMartechTools?: (tools: MartechTool[]) => void;
  /** Wired into reference index (accounts referencing each tool via `martechToolIds`). */
  customers?: Customer[];
  opportunities?: Opportunity[];
  tasks?: EngagementTask[];
  persistHubProduct?: (args: {
    action: 'create' | 'update' | 'delete';
    product: Product;
  }) => Promise<boolean>;
  persistHubMartech?: (args: {
    action: 'create' | 'update' | 'delete';
    tool: MartechTool;
  }) => Promise<boolean>;
}

type EntityType = 'customerContacts' | 'internalContacts' | 'products' | 'partners' | 'martechTools';

export function EntityManagement({
  customerContacts,
  internalContacts,
  products,
  partners,
  martechTools = [],
  onUpdateCustomerContacts,
  onUpdateInternalContacts,
  onUpdateProducts,
  onUpdatePartners,
  onUpdateMartechTools = () => {},
  customers = [],
  opportunities = [],
  tasks = [],
  persistHubProduct,
  persistHubMartech,
}: EntityManagementProps) {
  const productRefIndex = useMemo(
    () => buildProductReferenceIndex(customers, opportunities, tasks),
    [customers, opportunities, tasks],
  );
  const martechRefIndex = useMemo(() => buildMartechReferenceIndex(customers), [customers]);

  const formatMartechRefsSummary = (toolId: string) => {
    const r = martechRefIndex.get(toolId);
    if (!r) return '—';
    const n = r.accounts.length;
    if (n === 0) return '—';
    return `${n} account${n === 1 ? '' : 's'}`;
  };
  const {
    activeTab,
    setActiveTab,
    searchTerm,
    setSearchTerm,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    selectedItem,
    setSelectedItem,
    showForm,
    setShowForm,
    editingItem,
    setEditingItem,
    filteredAndSortedData,
    getCurrentData,
    getUpdateFunction,
    handleDelete,
    handleSelectItem,
    handleTabChange,
  } = useEntityManagement(
    { customerContacts, internalContacts, products, partners, martechTools },
    {
      onUpdateCustomerContacts,
      onUpdateInternalContacts,
      onUpdateProducts,
      onUpdatePartners,
      onUpdateMartechTools,
    }
  );

  const formatProductRefsSummary = (productId: string) => {
    const r = productRefIndex.get(productId);
    if (!r) return '—';
    const parts: string[] = [];
    if (r.accounts.length) parts.push(`${r.accounts.length} account${r.accounts.length === 1 ? '' : 's'}`);
    if (r.opportunities.length) parts.push(`${r.opportunities.length} opp${r.opportunities.length === 1 ? '' : 's'}`);
    if (r.taskCount) parts.push(`${r.taskCount} task${r.taskCount === 1 ? '' : 's'}`);
    return parts.length ? parts.join(' · ') : '—';
  };

  const handleDeleteClick = useCallback(
    async (item: EntityItem) => {
      if (activeTab === 'martechTools' && persistHubMartech) {
        if (!confirm('Are you sure you want to delete this martech tool?')) return;
        const ok = await persistHubMartech({ action: 'delete', tool: item as MartechTool });
        if (!ok) return;
        onUpdateMartechTools(martechTools.filter((t) => t.id !== item.id));
        if (selectedItem?.id === item.id) setSelectedItem(null);
        return;
      }
      if (activeTab === 'products' && persistHubProduct) {
        if (!confirm('Are you sure you want to delete this product?')) return;
        const ok = await persistHubProduct({ action: 'delete', product: item as Product });
        if (!ok) return;
        onUpdateProducts(products.filter((p) => p.id !== item.id));
        if (selectedItem?.id === item.id) setSelectedItem(null);
        return;
      }
      handleDelete(item.id as string);
    },
    [
      activeTab,
      persistHubProduct,
      persistHubMartech,
      products,
      martechTools,
      onUpdateProducts,
      onUpdateMartechTools,
      selectedItem?.id,
      setSelectedItem,
      handleDelete,
    ],
  );

  const handleEdit = (item: EntityItem) => {
    setEditingItem(item);
    setShowForm(true);
  };

  const handleAdd = () => {
    setEditingItem(null);
    setShowForm(true);
  };

  const renderTypeBadge = (item: EntityItem) => {
    switch (activeTab) {
      case 'customerContacts':
        return <TypeBadge label="Customer" variant="purple" />;
      case 'internalContacts':
        return <TypeBadge label="Internal" variant="blue" />;
      case 'products': {
        const status = ('status' in item ? item.status : undefined) as string | undefined;
        const statusStr = status || 'N/A';
        const variantMap: Record<string, 'green' | 'red' | 'amber' | 'gray'> = {
          Active: 'green',
          Inactive: 'red',
          Planned: 'amber',
          Deprecated: 'gray',
        };
        return <TypeBadge label={statusStr} variant={variantMap[statusStr] ?? 'gray'} />;
      }
      case 'partners':
        return <TypeBadge label={((('type' in item ? item.type : undefined) as string | undefined) || 'Partner')} variant="orange" />;
      case 'martechTools':
        return <TypeBadge label="Martech" variant="teal" />;
      default:
        return null;
    }
  };

  const renderTitleDisplay = (item: EntityItem) => {
    let title = '—';
    if (activeTab === 'products') {
      const p = item as Product;
      const d = (p.description ?? '').trim();
      if (d.length) title = d.length > 56 ? `${d.slice(0, 56)}…` : d;
      else title = (p.version as string | undefined) || ('status' in item ? (item.status as string | undefined) : undefined) || '—';
    }
    else if (activeTab === 'martechTools') title = ('purpose' in item ? item.purpose : undefined) as string || '—';
    else title = ('role' in item ? item.role : undefined) as string || ('type' in item ? item.type : undefined) as string || '—';
    return <TitleBadge>{title}</TitleBadge>;
  };

  const getTabIcon = (tab: EntityType) => {
    switch (tab) {
      case 'customerContacts':
        return <Users className="h-4 w-4" />;
      case 'internalContacts':
        return <User className="h-4 w-4" />;
      case 'products':
        return <Package className="h-4 w-4" />;
      case 'partners':
        return <ExternalLink className="h-4 w-4" />;
      case 'martechTools':
        return <Tag className="h-4 w-4" />;
    }
  };

  const getTabLabel = (tab: EntityType) => {
    switch (tab) {
      case 'customerContacts':
        return `Customer Contacts (${customerContacts.length})`;
      case 'internalContacts':
        return `Internal Contacts (${internalContacts.length})`;
      case 'products':
        return `Products (${products.length})`;
      case 'partners':
        return `Partners (${partners.length})`;
      case 'martechTools':
        return `Martech Tools (${martechTools.length})`;
    }
  };

  const renderItemDetails = (item: EntityItem) => {
    switch (activeTab) {
      case 'customerContacts':
        return (
          <>
            {'companyName' in item && item.companyName && (
              <DetailRow label="Company" value={String(item.companyName)} icon={Building} />
            )}
            {'email' in item && item.email && (
              <DetailRow
                label="Email"
                value={
                  <a href={`mailto:${item.email}`} className="text-blue-600 hover:text-blue-800 hover:underline">
                    {String(item.email)}
                  </a>
                }
                icon={Mail}
              />
            )}
            {'phone' in item && item.phone && (
              <DetailRow
                label="Phone"
                value={
                  <a href={`tel:${item.phone}`} className="text-blue-600 hover:text-blue-800 hover:underline">
                    {String(item.phone)}
                  </a>
                }
                icon={Phone}
              />
            )}
            {'role' in item && item.role && (
              <DetailRow label="Role" value={<TitleBadge>{String(item.role)}</TitleBadge>} icon={Briefcase} />
            )}
          </>
        );
      
      case 'internalContacts':
        return (
          <>
            {'email' in item && item.email && (
              <DetailRow
                label="Email"
                value={
                  <a href={`mailto:${item.email}`} className="text-blue-600 hover:text-blue-800 hover:underline">
                    {String(item.email)}
                  </a>
                }
                icon={Mail}
              />
            )}
            {'role' in item && item.role && (
              <DetailRow label="Role" value={<TitleBadge>{String(item.role)}</TitleBadge>} icon={Briefcase} />
            )}
          </>
        );
      
      case 'products':
        return (
          <>
            {'website' in item && (item as Product).website && (
              <DetailRow
                label="Website"
                value={
                  <a
                    href={(item as Product).website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 hover:underline break-all"
                  >
                    {(item as Product).website}
                  </a>
                }
                icon={Globe}
              />
            )}
            {'version' in item && item.version && (
              <DetailRow label="Version" value={String(item.version)} icon={Tag} />
            )}
            {'status' in item && item.status && (
              <DetailRow label="Status" value={renderTypeBadge(item)} />
            )}
          </>
        );
      
      case 'partners':
        return (
          <>
            {'type' in item && item.type && (
              <DetailRow label="Type" value={String(item.type)} icon={Tag} />
            )}
            {'website' in item && item.website && (
              <DetailRow
                label="Website"
                value={
                  <a
                    href={String(item.website)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 hover:underline"
                  >
                    {String(item.website)}
                  </a>
                }
                icon={Globe}
              />
            )}
          </>
        );
      
      case 'martechTools':
        return (
          <>
            {'purpose' in item && item.purpose && (
              <DetailRow label="Purpose" value={String(item.purpose)} icon={Briefcase} />
            )}
          </>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">Entity Management</h1>
          <p className="text-base text-gray-600 mt-1 leading-relaxed">Manage customer contacts, internal contacts, products, and partners</p>
        </div>
        <button
          onClick={handleAdd}
          className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-xl flex items-center gap-2 transition-all duration-200 shadow-lg hover:shadow-xl"
        >
          <Plus className="h-5 w-5" />
          Add {activeTab === 'customerContacts' ? 'Customer Contact' : 
               activeTab === 'internalContacts' ? 'Internal Contact' :
               activeTab === 'products' ? 'Product' :
               activeTab === 'partners' ? 'Partner' : 'Martech Tool'}
        </button>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="flex border-b border-gray-200">
          {(['customerContacts', 'internalContacts', 'products', 'partners', 'martechTools'] as EntityType[]).map((tab) => (
            <button
              key={tab}
              onClick={() => handleTabChange(tab)}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab
                  ? 'border-blue-500 text-blue-600 bg-blue-50'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                {getTabIcon(tab)}
                {getTabLabel(tab)}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder={`Search ${activeTab === 'customerContacts' ? 'customer contacts' : 
                           activeTab === 'internalContacts' ? 'internal contacts' :
                           activeTab === 'products' ? 'products' :
                           activeTab === 'partners' ? 'partners' : 'martech tools'}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-10"
              />
            </div>
          </div>
          <div className="flex gap-3">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'name' | 'createdAt')}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
            >
              <option value="name">Sort by Name</option>
              <option value="createdAt">Sort by Date</option>
            </select>
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2 font-medium text-gray-700"
            >
              <Filter className="h-4 w-4" />
              {sortOrder === 'asc' ? '↑ Asc' : '↓ Desc'}
            </button>
          </div>
        </div>
      </div>

      {/* Split Layout: List + Detail Card */}
      <div className="flex flex-col xl:flex-row gap-4 min-h-[500px] w-full">
        {/* Left Panel: Compact List */}
        <div className="flex-1 min-w-0 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
          {filteredAndSortedData.length === 0 ? (
            <div className="p-12 text-center flex-1 flex flex-col items-center justify-center">
              <div className="p-4 bg-gray-100 rounded-full w-16 h-16 mb-4 flex items-center justify-center">
                {getTabIcon(activeTab)}
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No items found</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm ? 'Try adjusting your search criteria' : `No ${activeTab === 'customerContacts' ? 'customer contacts' : 
                                                                        activeTab === 'internalContacts' ? 'internal contacts' :
                                                                        activeTab === 'products' ? 'products' :
                                                                        activeTab === 'partners' ? 'partners' : 'martech tools'} yet`}
              </p>
              <button
                onClick={handleAdd}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Add First Item
              </button>
            </div>
          ) : (
            <div className="overflow-auto flex-1">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-sky-50 to-indigo-50 border-b border-gray-200 sticky top-0 z-10">
                  <tr>
                    <th className="text-left text-xs font-semibold text-gray-600 uppercase tracking-wider px-4 py-3">Name</th>
                    <th className="text-left text-xs font-semibold text-gray-600 uppercase tracking-wider px-4 py-3">
                      {activeTab === 'products'
                        ? 'Summary'
                        : activeTab === 'martechTools'
                          ? 'Purpose'
                          : 'Title'}
                    </th>
                    {activeTab === 'customerContacts' && (
                      <th className="text-left text-xs font-semibold text-gray-600 uppercase tracking-wider px-4 py-3">Company</th>
                    )}
                    {(activeTab === 'customerContacts' || activeTab === 'internalContacts') && (
                      <th className="text-left text-xs font-semibold text-gray-600 uppercase tracking-wider px-4 py-3">Email</th>
                    )}
                    {activeTab === 'partners' && (
                      <th className="text-left text-xs font-semibold text-gray-600 uppercase tracking-wider px-4 py-3">Website</th>
                    )}
                    {activeTab === 'products' && (
                      <th className="text-left text-xs font-semibold text-gray-600 uppercase tracking-wider px-4 py-3">Website</th>
                    )}
                    {activeTab === 'products' && (
                      <th className="text-left text-xs font-semibold text-gray-600 uppercase tracking-wider px-4 py-3">Referenced</th>
                    )}
                    {activeTab === 'martechTools' && (
                      <th className="text-left text-xs font-semibold text-gray-600 uppercase tracking-wider px-4 py-3">
                        Referenced
                      </th>
                    )}
                    <th className="text-left text-xs font-semibold text-gray-600 uppercase tracking-wider px-4 py-3">Type</th>
                    <th className="text-left text-xs font-semibold text-gray-600 uppercase tracking-wider px-4 py-3">Created</th>
                    <th className="text-left text-xs font-semibold text-gray-600 uppercase tracking-wider px-4 py-3 w-28">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredAndSortedData.map((item) => (
                    <tr
                      key={item.id as string}
                      onClick={() => handleSelectItem(item)}
                      className={`cursor-pointer transition-colors hover:bg-sky-50/50 ${
                        selectedItem?.id === item.id ? 'bg-sky-50' : ''
                      }`}
                    >
                      <td className="px-4 py-3">
                        <span className="font-medium text-gray-900">
                          {activeTab === 'products' ? formatProductDisplayName(item as Product) : (item.name as string)}
                        </span>
                      </td>
                      <td className="px-4 py-3">{renderTitleDisplay(item)}</td>
                      {activeTab === 'customerContacts' && (
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {'companyName' in item ? String(item.companyName ?? '—') : '—'}
                        </td>
                      )}
                      {(activeTab === 'customerContacts' || activeTab === 'internalContacts') && (
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {'email' in item && item.email ? (
                            <a href={`mailto:${item.email}`} className="text-blue-600 hover:underline truncate block max-w-[140px]">
                              {String(item.email)}
                            </a>
                          ) : (
                            '—'
                          )}
                        </td>
                      )}
                      {activeTab === 'partners' && (
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {'website' in item && item.website ? (
                            <a href={String(item.website)} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline truncate block max-w-[120px]">
                              {String(item.website).replace(/^https?:\/\//, '')}
                            </a>
                          ) : (
                            '—'
                          )}
                        </td>
                      )}
                      {activeTab === 'products' && (
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {(item as Product).website ? (
                            <a
                              href={(item as Product).website}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="text-blue-600 hover:underline truncate block max-w-[120px]"
                            >
                              {(item as Product).website!.replace(/^https?:\/\//, '')}
                            </a>
                          ) : (
                            '—'
                          )}
                        </td>
                      )}
                      {activeTab === 'products' && (
                        <td className="px-4 py-3 text-sm text-gray-600 max-w-[140px]">
                          <span className="truncate block" title={formatProductRefsSummary((item as Product).id)}>
                            {formatProductRefsSummary((item as Product).id)}
                          </span>
                        </td>
                      )}
                      {activeTab === 'martechTools' && (
                        <td className="px-4 py-3 text-sm text-gray-600 max-w-[140px]">
                          <span
                            className="truncate block"
                            title={formatMartechRefsSummary((item as MartechTool).id)}
                          >
                            {formatMartechRefsSummary((item as MartechTool).id)}
                          </span>
                        </td>
                      )}
                      <td className="px-4 py-3">{renderTypeBadge(item)}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {safeFormatDate('createdAt' in item ? item.createdAt : undefined)}
                      </td>
                      <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleEdit(item)}
                            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-sky-100 text-sky-700 hover:bg-sky-200 transition-colors"
                            title="Edit"
                          >
                            <Edit className="h-3.5 w-3.5" />
                            Edit
                          </button>
                          <button
                            onClick={() => void handleDeleteClick(item)}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Right Panel: Detail Card */}
        <div className="xl:w-[55%] xl:min-w-[380px] flex-shrink-0 w-full">
          {selectedItem ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden h-full flex flex-col">
              {/* Card Header with Avatar */}
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-start gap-4">
                  <Avatar
                    name={activeTab === 'products' || activeTab === 'martechTools' ? undefined : (selectedItem.name as string)}
                    fallback={activeTab === 'products' || activeTab === 'martechTools' ? getTabIcon(activeTab) : undefined}
                  />
                  <div className="flex-1 min-w-0">
                    <h2 className="text-xl font-bold text-gray-900 tracking-tight">
                      {activeTab === 'products'
                        ? formatProductDisplayName(selectedItem as Product)
                        : (selectedItem.name as string)}
                    </h2>
                    <p className="text-sm text-gray-600 mt-0.5 font-medium">
                      {activeTab === 'products'
                        ? (('status' in selectedItem ? selectedItem.status : undefined) as string | undefined) || '—'
                        : activeTab === 'martechTools'
                          ? ((((selectedItem as MartechTool).purpose ?? '') as string).trim() || '—')
                          : ('role' in selectedItem ? selectedItem.role : undefined) ||
                              ('type' in selectedItem ? selectedItem.type : undefined) ||
                              ('status' in selectedItem ? selectedItem.status : undefined) ||
                              '—'}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      {renderTypeBadge(selectedItem)}
                    </div>
                  </div>
                  <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => handleEdit(selectedItem)}
                      className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => void handleDeleteClick(selectedItem)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Key Info - Two Column Layout */}
              <div className="p-6 flex-1">
                <div className="grid grid-cols-2 gap-4 mb-6">
                  {renderItemDetails(selectedItem)}
                </div>

                {activeTab === 'products' &&
                  (() => {
                    const refs = productRefIndex.get((selectedItem as Product).id) ?? {
                      accounts: [],
                      opportunities: [],
                      taskCount: 0,
                    };
                    return (
                      <div className="mb-6 rounded-lg border border-gray-200 bg-slate-50/80 p-4">
                        <h3 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                          <Package className="h-4 w-4" />
                          Where this product is referenced
                        </h3>
                        <div className="space-y-3 text-sm">
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1.5 flex items-center gap-1.5">
                              <Building2 className="h-3.5 w-3.5" />
                              Accounts ({refs.accounts.length})
                            </p>
                            {refs.accounts.length ? (
                              <ul className="list-disc pl-5 text-gray-700 space-y-1">
                                {refs.accounts.map((a) => (
                                  <li key={a.id}>{a.name}</li>
                                ))}
                              </ul>
                            ) : (
                              <p className="text-gray-500">No accounts list this product.</p>
                            )}
                          </div>
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1.5 flex items-center gap-1.5">
                              <Target className="h-3.5 w-3.5" />
                              Opportunities ({refs.opportunities.length})
                            </p>
                            {refs.opportunities.length ? (
                              <ul className="space-y-1 text-gray-700">
                                {refs.opportunities.map((o) => (
                                  <li key={o.id}>
                                    <span className="font-medium">{o.opportunityName}</span>
                                    <span className="text-gray-500"> · {o.customerName}</span>
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <p className="text-gray-500">No opportunities include this product.</p>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-gray-600 pt-2 border-t border-gray-200/80">
                            <Briefcase className="h-3.5 w-3.5 shrink-0 text-gray-400" />
                            <span>
                              Tasks referencing this product: <strong>{refs.taskCount}</strong>
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })()}

                {activeTab === 'martechTools' &&
                  (() => {
                    const refs = martechRefIndex.get((selectedItem as MartechTool).id) ?? { accounts: [] };
                    return (
                      <div className="mb-6 rounded-lg border border-gray-200 bg-slate-50/80 p-4">
                        <h3 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                          <Tag className="h-4 w-4" />
                          Where this martech tool is referenced
                        </h3>
                        <div className="space-y-3 text-sm">
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1.5 flex items-center gap-1.5">
                              <Building2 className="h-3.5 w-3.5" />
                              Accounts ({refs.accounts.length})
                            </p>
                            {refs.accounts.length ? (
                              <ul className="list-disc pl-5 text-gray-700 space-y-1">
                                {refs.accounts.map((a) => (
                                  <li key={a.id}>{a.name}</li>
                                ))}
                              </ul>
                            ) : (
                              <p className="text-gray-500">No accounts attach this martech tool yet.</p>
                            )}
                          </div>
                          <p className="text-xs text-gray-500 pt-2 border-t border-gray-200/80">
                            Link tools when editing an account — Martech tools multi-select on the customer form.
                          </p>
                        </div>
                      </div>
                    );
                  })()}

                {/* Summary / Description Section */}
                {(('description' in selectedItem && selectedItem.description) || ('purpose' in selectedItem && selectedItem.purpose) || ('companyName' in selectedItem && selectedItem.companyName)) && (
                  <div className="mb-6">
                    <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Summary
                    </h3>
                    <p className="text-sm text-gray-600 bg-gray-50 rounded-lg p-4">
                      {('description' in selectedItem ? selectedItem.description : undefined) || ('purpose' in selectedItem ? selectedItem.purpose : undefined) ||
                        ('companyName' in selectedItem && selectedItem.companyName ? `Company: ${selectedItem.companyName}` : undefined) || '—'}
                    </p>
                  </div>
                )}

                <div className="text-xs text-gray-500 flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  Created {safeFormatDate('createdAt' in selectedItem ? selectedItem.createdAt : undefined)}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 rounded-xl border-2 border-dashed border-gray-200 h-full flex flex-col items-center justify-center p-8 text-center">
              <div className="p-4 bg-gray-100 rounded-full w-16 h-16 mb-4 flex items-center justify-center text-gray-400">
                {getTabIcon(activeTab)}
              </div>
              <p className="text-gray-500 font-medium">Select an item to view details</p>
              <p className="text-sm text-gray-400 mt-1">
                Click a row in the list to see full information
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                {editingItem ? 'Edit' : 'Add'} {
                  activeTab === 'customerContacts' ? 'Customer Contact' : 
                  activeTab === 'internalContacts' ? 'Internal Contact' :
                  activeTab === 'products' ? 'Product' :
                  activeTab === 'partners' ? 'Partner' : 'Martech Tool'
                }
              </h2>
              <button
                onClick={() => setShowForm(false)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-4">
              {activeTab === 'customerContacts' && (
                <CustomerContactForm
                  contact={editingItem ? (editingItem as CustomerContact) : undefined}
                  onSave={(contact) => {
                    const currentContacts = getCurrentData();
                    const updatedContacts = editingItem 
                      ? currentContacts.map((c: any) => c.id === contact.id ? contact : c)
                      : [...currentContacts, contact];
                    getUpdateFunction()(updatedContacts);
                    setShowForm(false);
                    setEditingItem(null);
                  }}
                  onCancel={() => {
                    setShowForm(false);
                    setEditingItem(null);
                  }}
                />
              )}
              
              {activeTab === 'internalContacts' && (
                <InternalContactForm
                  contact={editingItem ? (editingItem as InternalContact) : undefined}
                  onSave={(contact) => {
                    const currentContacts = getCurrentData();
                    const updatedContacts = editingItem 
                      ? currentContacts.map((c: any) => c.id === contact.id ? contact : c)
                      : [...currentContacts, contact];
                    getUpdateFunction()(updatedContacts);
                    setShowForm(false);
                    setEditingItem(null);
                  }}
                  onCancel={() => {
                    setShowForm(false);
                    setEditingItem(null);
                  }}
                />
              )}
              
              {activeTab === 'products' && (
                <ProductForm
                  product={editingItem ? (editingItem as Product) : undefined}
                  onSave={async (product) => {
                    if (persistHubProduct) {
                      const action = editingItem ? 'update' : 'create';
                      const payload =
                        action === 'update'
                          ? { ...product, id: (editingItem as Product).id }
                          : product;
                      const ok = await persistHubProduct({ action, product: payload });
                      if (!ok) return;
                      setShowForm(false);
                      setEditingItem(null);
                      return;
                    }
                    const currentProducts = getCurrentData();
                    const updatedProducts = editingItem
                      ? currentProducts.map((p: any) => (p.id === product.id ? product : p))
                      : [...currentProducts, product];
                    getUpdateFunction()(updatedProducts);
                    setShowForm(false);
                    setEditingItem(null);
                  }}
                  onCancel={() => {
                    setShowForm(false);
                    setEditingItem(null);
                  }}
                />
              )}
              
              {activeTab === 'partners' && (
                <PartnerForm
                  partner={editingItem ? (editingItem as Partner) : undefined}
                  onSave={(partner) => {
                    const currentPartners = getCurrentData();
                    const updatedPartners = editingItem 
                      ? currentPartners.map((p: any) => p.id === partner.id ? partner : p)
                      : [...currentPartners, partner];
                    getUpdateFunction()(updatedPartners);
                    setShowForm(false);
                    setEditingItem(null);
                  }}
                  onCancel={() => {
                    setShowForm(false);
                    setEditingItem(null);
                  }}
                />
              )}
              
              {activeTab === 'martechTools' && (
                <MartechToolForm
                  martechTool={editingItem ? (editingItem as MartechTool) : undefined}
                  onSave={async (martechTool) => {
                    if (persistHubMartech) {
                      const editing = editingItem as MartechTool | null;
                      const isRealEdit = editing?.id && !String(editing.id).startsWith('martech-');
                      const action = isRealEdit ? 'update' : 'create';
                      const payload: MartechTool =
                        action === 'update' && editing
                          ? {
                              ...martechTool,
                              id: editing.id,
                            }
                          : martechTool;
                      const ok = await persistHubMartech({ action, tool: payload });
                      if (!ok) return;
                      setShowForm(false);
                      setEditingItem(null);
                      return;
                    }
                    const currentTools = getCurrentData() as MartechTool[];
                    const updatedTools = editingItem
                      ? currentTools.map((t) => (t.id === martechTool.id ? martechTool : t))
                      : [...currentTools, martechTool];
                    (getUpdateFunction() as (tools: MartechTool[]) => void)(updatedTools);
                    setShowForm(false);
                    setEditingItem(null);
                  }}
                  onCancel={() => {
                    setShowForm(false);
                    setEditingItem(null);
                  }}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
