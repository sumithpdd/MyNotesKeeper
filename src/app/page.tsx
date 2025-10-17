'use client';

import { useState } from 'react';
import { FileText, Users, Calendar, TrendingUp, Settings } from 'lucide-react';
import { CustomerNote, Customer, CustomerContact, InternalContact, Product, Partner, CustomerProfile } from '@/types';
import { generateDummyCustomers, generateDummyNotes, dummyCustomerContacts, dummyInternalContacts, dummyProducts, dummyPartners } from '../../data/dummyData';
import { SlideOutPanel } from '@/components/SlideOutPanel';
import { CustomerManagement } from '@/components/CustomerManagement';
import { EntityManagement } from '@/components/EntityManagement';

export default function HomePage() {
  const [notes, setNotes] = useState<CustomerNote[]>(generateDummyNotes());
  const [customers, setCustomers] = useState<Customer[]>(generateDummyCustomers());
  const [customerProfiles, setCustomerProfiles] = useState<CustomerProfile[]>([]);
  const [customerContacts, setCustomerContacts] = useState<CustomerContact[]>(dummyCustomerContacts);
  const [internalContacts, setInternalContacts] = useState<InternalContact[]>(dummyInternalContacts);
  const [products, setProducts] = useState<Product[]>(dummyProducts);
  const [partners, setPartners] = useState<Partner[]>(dummyPartners);
  const [selectedCustomer, setSelectedCustomer] = useState<string | null>(null);
  const [viewingNote, setViewingNote] = useState<CustomerNote | null>(null);
  const [activeTab, setActiveTab] = useState<'notes' | 'entities'>('notes');


  const handleSaveNote = (noteData: CustomerNote) => {
    if (noteData.id) {
      setNotes(prev => prev.map(note => 
        note.id === noteData.id ? { ...note, ...noteData, updatedAt: new Date() } : note
      ));
    } else {
      const newNote: CustomerNote = {
        ...noteData,
        id: `note-${Date.now()}`,
        customerId: selectedCustomer!,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      setNotes(prev => [newNote, ...prev]);
    }
  };

  const handleDeleteNote = (noteId: string) => {
    setNotes(prev => prev.filter(note => note.id !== noteId));
  };

  const handleSaveCustomerManagement = (customer: Customer) => {
    console.log('handleSaveCustomerManagement called with:', customer);
    const existingIndex = customers.findIndex(c => c.id === customer.id);
    if (existingIndex >= 0) {
      console.log('Updating existing customer at index:', existingIndex);
      setCustomers(prev => prev.map(c => c.id === customer.id ? customer : c));
    } else {
      console.log('Adding new customer to list');
      setCustomers(prev => [...prev, customer]);
    }
  };

  const handleDeleteCustomerManagement = (customerId: string) => {
    setCustomers(prev => prev.filter(c => c.id !== customerId));
    // Also remove related notes
    setNotes(prev => prev.filter(n => n.customerId !== customerId));
  };

  const getCustomerStats = () => {
    const activeCustomers = customers.filter(c => c.products.length > 0).length;
    const recentNotes = notes.filter(n => {
      const daysSince = (Date.now() - n.createdAt.getTime()) / (1000 * 60 * 60 * 24);
      return daysSince <= 30;
    }).length;
    
    return { activeCustomers, recentNotes };
  };

  const stats = getCustomerStats();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Customer Engagement Hub</h1>
              <p className="text-lg text-gray-600">Manage customer relationships and track engagement progress</p>
            </div>
          </div>
          
          {/* Enhanced Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex items-center">
                <div className="p-3 bg-blue-100 rounded-xl">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Customers</p>
                  <p className="text-2xl font-bold text-gray-900">{customers.length}</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex items-center">
                <div className="p-3 bg-green-100 rounded-xl">
                  <FileText className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Notes</p>
                  <p className="text-2xl font-bold text-gray-900">{notes.length}</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex items-center">
                <div className="p-3 bg-purple-100 rounded-xl">
                  <TrendingUp className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Active Opportunities</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.activeCustomers}</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex items-center">
                <div className="p-3 bg-orange-100 rounded-xl">
                  <Calendar className="h-6 w-6 text-orange-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Recent Notes (30d)</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.recentNotes}</p>
                </div>
              </div>
            </div>
          </div>
        </div>


        {/* Tab Navigation */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('notes')}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'notes'
                  ? 'border-blue-500 text-blue-600 bg-blue-50'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Customer Management
              </div>
            </button>
            <button
              onClick={() => setActiveTab('entities')}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'entities'
                  ? 'border-blue-500 text-blue-600 bg-blue-50'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Entity Management
              </div>
            </button>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'notes' ? (
          <CustomerManagement
            customers={customers}
            customerProfiles={customerProfiles}
            notes={notes}
            selectedCustomer={selectedCustomer}
            onSelectCustomer={setSelectedCustomer}
            onSaveCustomer={handleSaveCustomerManagement}
            onDeleteCustomer={handleDeleteCustomerManagement}
            onSaveCustomerProfile={(profile) => setCustomerProfiles(prev => [...prev, profile])}
            onUpdateCustomerProfile={(profile) => setCustomerProfiles(prev => prev.map(p => p.id === profile.id ? profile : p))}
            onSaveNote={handleSaveNote}
            onDeleteNote={handleDeleteNote}
          />
        ) : (
          <EntityManagement
            customerContacts={customerContacts}
            internalContacts={internalContacts}
            products={products}
            partners={partners}
            onUpdateCustomerContacts={setCustomerContacts}
            onUpdateInternalContacts={setInternalContacts}
            onUpdateProducts={setProducts}
            onUpdatePartners={setPartners}
          />
        )}

        {/* Slide Out Panel */}
        <SlideOutPanel
          note={viewingNote}
          customer={viewingNote ? customers.find(c => c.id === viewingNote.customerId) || null : null}
          customerProfile={viewingNote ? customerProfiles.find(p => p.customerId === viewingNote.customerId) || null : null}
          onClose={() => setViewingNote(null)}
        />

      </div>
    </div>
  );
}