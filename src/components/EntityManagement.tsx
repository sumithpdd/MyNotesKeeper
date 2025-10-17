'use client';

import { useState } from 'react';
import { 
  Users, 
  Building, 
  Package, 
  ExternalLink, 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Filter,
  ChevronDown,
  ChevronUp,
  Mail,
  Phone,
  Globe,
  User,
  Briefcase,
  Tag,
  Calendar
} from 'lucide-react';
import { CustomerContact, InternalContact, Product, Partner } from '@/types';
import { CustomerContactForm } from './forms/CustomerContactForm';
import { InternalContactForm } from './forms/InternalContactForm';
import { ProductForm } from './forms/ProductForm';
import { PartnerForm } from './forms/PartnerForm';

interface EntityManagementProps {
  customerContacts: CustomerContact[];
  internalContacts: InternalContact[];
  products: Product[];
  partners: Partner[];
  onUpdateCustomerContacts: (contacts: CustomerContact[]) => void;
  onUpdateInternalContacts: (contacts: InternalContact[]) => void;
  onUpdateProducts: (products: Product[]) => void;
  onUpdatePartners: (partners: Partner[]) => void;
}

type EntityType = 'customerContacts' | 'internalContacts' | 'products' | 'partners';

export function EntityManagement({
  customerContacts,
  internalContacts,
  products,
  partners,
  onUpdateCustomerContacts,
  onUpdateInternalContacts,
  onUpdateProducts,
  onUpdatePartners,
}: EntityManagementProps) {
  const [activeTab, setActiveTab] = useState<EntityType>('customerContacts');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'createdAt'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [expandedItem, setExpandedItem] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

  const getCurrentData = () => {
    switch (activeTab) {
      case 'customerContacts':
        return customerContacts;
      case 'internalContacts':
        return internalContacts;
      case 'products':
        return products;
      case 'partners':
        return partners;
      default:
        return [];
    }
  };

  const getUpdateFunction = () => {
    switch (activeTab) {
      case 'customerContacts':
        return onUpdateCustomerContacts;
      case 'internalContacts':
        return onUpdateInternalContacts;
      case 'products':
        return onUpdateProducts;
      case 'partners':
        return onUpdatePartners;
      default:
        return () => {};
    }
  };

  const filteredAndSortedData = getCurrentData()
    .filter((item: any) => 
      item.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a: any, b: any) => {
      let comparison = 0;
      if (sortBy === 'name') {
        comparison = a.name.localeCompare(b.name);
      } else if (sortBy === 'createdAt' && a.createdAt && b.createdAt) {
        comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this item?')) {
      const currentData = getCurrentData();
      const updatedData = currentData.filter((item: any) => item.id !== id);
      getUpdateFunction()(updatedData);
    }
  };

  const handleEdit = (item: any) => {
    setEditingItem(item);
    setShowForm(true);
  };

  const handleAdd = () => {
    setEditingItem(null);
    setShowForm(true);
  };

  const toggleExpanded = (id: string) => {
    setExpandedItem(expandedItem === id ? null : id);
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
    }
  };

  const renderItemDetails = (item: any) => {
    switch (activeTab) {
      case 'customerContacts':
        return (
          <div className="space-y-2">
            {item.email && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Mail className="h-4 w-4" />
                <a href={`mailto:${item.email}`} className="text-blue-600 hover:text-blue-800">
                  {item.email}
                </a>
              </div>
            )}
            {item.phone && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Phone className="h-4 w-4" />
                <a href={`tel:${item.phone}`} className="text-blue-600 hover:text-blue-800">
                  {item.phone}
                </a>
              </div>
            )}
            {item.role && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Briefcase className="h-4 w-4" />
                <span>{item.role}</span>
              </div>
            )}
          </div>
        );
      
      case 'internalContacts':
        return (
          <div className="space-y-2">
            {item.email && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Mail className="h-4 w-4" />
                <a href={`mailto:${item.email}`} className="text-blue-600 hover:text-blue-800">
                  {item.email}
                </a>
              </div>
            )}
            {item.role && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Briefcase className="h-4 w-4" />
                <span>{item.role}</span>
              </div>
            )}
          </div>
        );
      
      case 'products':
        return (
          <div className="space-y-2">
            {item.version && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Tag className="h-4 w-4" />
                <span>Version: {item.version}</span>
              </div>
            )}
            {item.description && (
              <div className="text-sm text-gray-600">
                <span>{item.description}</span>
              </div>
            )}
            {item.status && (
              <div className="flex items-center gap-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  item.status === 'Active' ? 'bg-green-100 text-green-800' :
                  item.status === 'Inactive' ? 'bg-red-100 text-red-800' :
                  item.status === 'Planned' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {item.status}
                </span>
              </div>
            )}
          </div>
        );
      
      case 'partners':
        return (
          <div className="space-y-2">
            {item.type && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Tag className="h-4 w-4" />
                <span>{item.type}</span>
              </div>
            )}
            {item.website && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Globe className="h-4 w-4" />
                <a 
                  href={item.website} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800"
                >
                  {item.website}
                </a>
              </div>
            )}
          </div>
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
          <h1 className="text-3xl font-bold text-gray-900">Entity Management</h1>
          <p className="text-gray-600 mt-1">Manage customer contacts, internal contacts, products, and partners</p>
        </div>
        <button
          onClick={handleAdd}
          className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-xl flex items-center gap-2 transition-all duration-200 shadow-lg hover:shadow-xl"
        >
          <Plus className="h-5 w-5" />
          Add {activeTab === 'customerContacts' ? 'Customer Contact' : 
               activeTab === 'internalContacts' ? 'Internal Contact' :
               activeTab === 'products' ? 'Product' : 'Partner'}
        </button>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="flex border-b border-gray-200">
          {(['customerContacts', 'internalContacts', 'products', 'partners'] as EntityType[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
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
                           activeTab === 'products' ? 'products' : 'partners'}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500"
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
              className="px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
            >
              <Filter className="h-4 w-4" />
              {sortOrder === 'asc' ? '↑' : '↓'}
            </button>
          </div>
        </div>
      </div>

      {/* Entity List */}
      <div className="space-y-4">
        {filteredAndSortedData.length === 0 ? (
          <div className="bg-white p-12 rounded-xl shadow-sm border border-gray-100 text-center">
            <div className="p-4 bg-gray-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              {getTabIcon(activeTab)}
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No items found</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm ? 'Try adjusting your search criteria' : `No ${activeTab === 'customerContacts' ? 'customer contacts' : 
                                                                      activeTab === 'internalContacts' ? 'internal contacts' :
                                                                      activeTab === 'products' ? 'products' : 'partners'} yet`}
            </p>
            <button
              onClick={handleAdd}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Add First Item
            </button>
          </div>
        ) : (
          filteredAndSortedData.map((item: any) => (
            <div
              key={item.id}
              className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
            >
              {/* Item Header */}
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        {getTabIcon(activeTab)}
                      </div>
                      <div>
                        <h2 className="text-xl font-semibold text-gray-900">{item.name}</h2>
                        <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            Created {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'Unknown'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleExpanded(item.id)}
                      className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                      title={expandedItem === item.id ? 'Collapse' : 'Expand'}
                    >
                      {expandedItem === item.id ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </button>
                    <button
                      onClick={() => handleEdit(item)}
                      className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Expanded Details */}
              {expandedItem === item.id && (
                <div className="p-6 bg-gray-50 border-t border-gray-100">
                  {renderItemDetails(item)}
                </div>
              )}
            </div>
          ))
        )}
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
                  activeTab === 'products' ? 'Product' : 'Partner'
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
                  contact={editingItem}
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
                  contact={editingItem}
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
                  product={editingItem}
                  onSave={(product) => {
                    const currentProducts = getCurrentData();
                    const updatedProducts = editingItem 
                      ? currentProducts.map((p: any) => p.id === product.id ? product : p)
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
                  partner={editingItem}
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
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
