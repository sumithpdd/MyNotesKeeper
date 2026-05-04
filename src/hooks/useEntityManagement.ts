'use client';

import { useState, useMemo } from 'react';
import { toDate } from '@/lib/utils';
import { formatProductDisplayName } from '@/lib/productDisplay';
import type { CustomerContact, InternalContact, Product, Partner, MartechTool } from '@/types';

export type EntityType = 'customerContacts' | 'internalContacts' | 'products' | 'partners' | 'martechTools';

export type EntityItem = CustomerContact | InternalContact | Product | Partner | MartechTool;

function entityCreatedTimestamp(item: EntityItem): number {
  const raw = (item as { createdAt?: unknown }).createdAt;
  if (raw == null) return 0;
  return toDate(raw)?.getTime() ?? 0;
}

export interface EntityManagementData {
  customerContacts: CustomerContact[];
  internalContacts: InternalContact[];
  products: Product[];
  partners: Partner[];
  martechTools: MartechTool[];
}

export interface EntityManagementCallbacks {
  onUpdateCustomerContacts: (contacts: CustomerContact[]) => void;
  onUpdateInternalContacts: (contacts: InternalContact[]) => void;
  onUpdateProducts: (products: Product[]) => void;
  onUpdatePartners: (partners: Partner[]) => void;
  onUpdateMartechTools?: (tools: MartechTool[]) => void;
}

/**
 * Custom hook for Entity Management business logic.
 * Separates data, filtering, sorting, and CRUD from UI.
 * Use with EntityManagement component.
 */
export function useEntityManagement(
  data: EntityManagementData,
  callbacks: EntityManagementCallbacks
) {
  const [activeTab, setActiveTab] = useState<EntityType>('customerContacts');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'createdAt'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [selectedItem, setSelectedItem] = useState<EntityItem | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<EntityItem | null>(null);

  const getCurrentData = () => {
    switch (activeTab) {
      case 'customerContacts':
        return data.customerContacts;
      case 'internalContacts':
        return data.internalContacts;
      case 'products':
        return data.products;
      case 'partners':
        return data.partners;
      case 'martechTools':
        return data.martechTools;
      default:
        return [];
    }
  };

  const getUpdateFunction = () => {
    switch (activeTab) {
      case 'customerContacts':
        return callbacks.onUpdateCustomerContacts;
      case 'internalContacts':
        return callbacks.onUpdateInternalContacts;
      case 'products':
        return callbacks.onUpdateProducts;
      case 'partners':
        return callbacks.onUpdatePartners;
      case 'martechTools':
        return callbacks.onUpdateMartechTools ?? (() => {});
      default:
        return () => {};
    }
  };

  const filteredAndSortedData = useMemo(() => {
    const current = getCurrentData();
    const term = searchTerm.trim().toLowerCase();
    return [...current]
      .filter((item: EntityItem) => {
        if (!term) return true;
        if (activeTab === 'products') {
          const p = item as Product;
          const hay = `${formatProductDisplayName(p)} ${p.name} ${p.version ?? ''} ${p.description ?? ''} ${p.website ?? ''}`.toLowerCase();
          return hay.includes(term);
        }
        return String(item.name ?? '').toLowerCase().includes(term);
      })
      .sort((a: EntityItem, b: EntityItem) => {
        let comparison = 0;
        if (sortBy === 'name') {
          const labelA =
            activeTab === 'products' ? formatProductDisplayName(a as Product) : String(a.name ?? '');
          const labelB =
            activeTab === 'products' ? formatProductDisplayName(b as Product) : String(b.name ?? '');
          comparison = labelA.localeCompare(labelB);
        } else if (sortBy === 'createdAt') {
          comparison = entityCreatedTimestamp(a) - entityCreatedTimestamp(b);
        }
        return sortOrder === 'asc' ? comparison : -comparison;
      });
  }, [
    activeTab,
    data.customerContacts,
    data.internalContacts,
    data.products,
    data.partners,
    data.martechTools,
    searchTerm,
    sortBy,
    sortOrder,
  ]);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return;
    const currentData = getCurrentData();
    if (activeTab === 'martechTools') {
      const updated = (currentData as MartechTool[]).filter((item) => item.id !== id);
      callbacks.onUpdateMartechTools?.(updated);
      return;
    }
    switch (activeTab) {
      case 'customerContacts':
        callbacks.onUpdateCustomerContacts(data.customerContacts.filter((item) => item.id !== id));
        break;
      case 'internalContacts':
        callbacks.onUpdateInternalContacts(data.internalContacts.filter((item) => item.id !== id));
        break;
      case 'products':
        callbacks.onUpdateProducts(data.products.filter((item) => item.id !== id));
        break;
      case 'partners':
        callbacks.onUpdatePartners(data.partners.filter((item) => item.id !== id));
        break;
      default:
        break;
    }
  };

  const handleSelectItem = (item: EntityItem) => {
    setSelectedItem(selectedItem?.id === item.id ? null : item);
  };

  const handleTabChange = (tab: EntityType) => {
    setActiveTab(tab);
    setSelectedItem(null);
  };

  return {
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
  };
}
