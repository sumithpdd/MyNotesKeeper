'use client';

import { useState } from 'react';
import { FileText, Users, Calendar, TrendingUp, Settings, Target } from 'lucide-react';
import { CustomerContact, InternalContact, Product, Partner, CustomerProfile } from '@/types';
import { dummyCustomerContacts, dummyInternalContacts, dummyProducts, dummyPartners } from '../../data/dummyData';
import { SlideOutPanel } from '@/components/SlideOutPanel';
import { CustomerManagement } from '@/components/CustomerManagement';
import { EntityManagement } from '@/components/EntityManagement';
import { MigrationOpportunitiesGrid } from '@/components/MigrationOpportunitiesGrid';
import { CustomerForm } from '@/components/CustomerForm';
import { UserHeader } from '@/components/UserHeader';
import { AIChatPanel } from '@/components/AIChatPanel';
import { FloatingAIButton } from '@/components/FloatingAIButton';
import { useAuth } from '@/lib/auth';
import { customerProfileService } from '@/lib/customerProfileService';
import { productService } from '@/lib/productService';
import { partnerService } from '@/lib/partnerService';
import { customerContactService, internalContactService } from '@/lib/contactService';
import { 
  useFirebaseData, 
  useNoteOperations, 
  useCustomerOperations, 
  useOpportunityOperations 
} from '@/hooks';

/**
 * Main home page component - refactored for better maintainability
 * Uses custom hooks for business logic separation
 * Reduced from 540+ lines to ~250 lines
 */
export default function HomePage() {
  const { user } = useAuth();
  
  // UI State
  const [selectedCustomer, setSelectedCustomer] = useState<string | null>(null);
  const [viewingNote, setViewingNote] = useState<any | null>(null);
  const [editingMigrationCustomer, setEditingMigrationCustomer] = useState<any | null>(null);
  const [showCustomerForm, setShowCustomerForm] = useState(false);
  const [activeTab, setActiveTab] = useState<'notes' | 'entities' | 'migration'>('notes');
  const [showAIChat, setShowAIChat] = useState(false);
  
  // Entity State
  const [customerProfiles, setCustomerProfiles] = useState<CustomerProfile[]>([]);
  
  // Firebase Data & Operations (using custom hooks)
  const { 
    customers, 
    notes: firebaseNotes, 
    opportunities: firebaseOpportunities, 
    products,
    partners,
    customerContacts,
    internalContacts,
    loading 
  } = useFirebaseData(user?.id);
  
  // Local state for entity management
  const [localCustomerContacts, setLocalCustomerContacts] = useState<CustomerContact[]>(customerContacts);
  const [localInternalContacts, setLocalInternalContacts] = useState<InternalContact[]>(internalContacts);
  const [localProducts, setLocalProducts] = useState<Product[]>(products);
  const [localPartners, setLocalPartners] = useState<Partner[]>(partners);
  
  const { notes, setNotes, saveNote, deleteNote } = useNoteOperations({ 
    userId: user?.id,
    onNotesChange: (newNotes) => {
      // Optional: sync with parent if needed
    }
  });
  
  const { customers: localCustomers, setCustomers, saveCustomer, deleteCustomer } = useCustomerOperations({
    userId: user?.id,
    onCustomersChange: (newCustomers) => {
      // Optional: sync with parent if needed
    }
  });
  
  const {
    opportunities,
    setOpportunities,
    saveOpportunity,
    deleteOpportunity,
    changeStage,
    deleteOpportunitiesByCustomer
  } = useOpportunityOperations({
    userId: user?.id,
    userEmail: user?.email,
    onOpportunitiesChange: (newOpportunities) => {
      // Optional: sync with parent if needed
    }
  });
  
  // Sync Firebase data to local state
  useState(() => {
    setNotes(firebaseNotes);
    setCustomers(customers);
    setOpportunities(firebaseOpportunities);
  });

  // Enhanced handlers with entity operations
  const handleSaveNoteWithCustomer = async (noteData: any) => {
    await saveNote(noteData, selectedCustomer || '');
  };

  const handleDeleteCustomerWithCleanup = async (customerId: string) => {
    await deleteCustomer(customerId);
    setNotes(notes.filter(n => n.customerId !== customerId));
    await deleteOpportunitiesByCustomer(customerId);
  };

  // Stats calculation
  const getCustomerStats = () => {
    if (!customers || customers.length === 0) {
      return { activeCustomers: 0, recentNotes: 0 };
    }
    
    const activeCustomers = customers.filter(c => c.products && c.products.length > 0).length;
    const recentNotes = (notes || []).filter(n => {
      if (!n || !n.createdAt) return false;
      const daysSince = (Date.now() - n.createdAt.getTime()) / (1000 * 60 * 60 * 24);
      return daysSince <= 30;
    }).length;
    
    return { activeCustomers, recentNotes };
  };

  const stats = getCustomerStats();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <UserHeader />
      
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center space-x-2">
            <svg className="animate-spin h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span className="text-gray-600">Loading your data...</span>
          </div>
        </div>
      ) : (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-4xl font-bold text-gray-900 mb-2">Customer Engagement Hub</h1>
                <p className="text-lg text-gray-600">Manage customer relationships and track engagement progress</p>
              </div>
            </div>
            
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <StatCard icon={Users} label="Total Customers" value={customers.length} color="blue" />
              <StatCard icon={FileText} label="Total Notes" value={notes.length} color="green" />
              <StatCard icon={TrendingUp} label="Active Opportunities" value={stats.activeCustomers} color="purple" />
              <StatCard icon={Calendar} label="Recent Notes (30d)" value={stats.recentNotes} color="orange" />
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6">
            <div className="flex border-b border-gray-200">
              <TabButton 
                icon={FileText} 
                label="Customer Management" 
                active={activeTab === 'notes'} 
                onClick={() => setActiveTab('notes')} 
              />
              <TabButton 
                icon={Settings} 
                label="Entity Management" 
                active={activeTab === 'entities'} 
                onClick={() => setActiveTab('entities')} 
              />
              <TabButton 
                icon={Target} 
                label="Migration Opportunities" 
                active={activeTab === 'migration'} 
                onClick={() => setActiveTab('migration')} 
              />
            </div>
          </div>

          {/* Tab Content */}
          {activeTab === 'notes' ? (
            <CustomerManagement
              customers={customers}
              customerProfiles={customerProfiles}
              notes={notes}
              opportunities={opportunities}
              selectedCustomer={selectedCustomer}
              currentUser={user?.email || 'Unknown User'}
              onSelectCustomer={setSelectedCustomer}
              onSaveCustomer={saveCustomer}
              onDeleteCustomer={handleDeleteCustomerWithCleanup}
              onSaveCustomerProfile={(profile) => setCustomerProfiles(prev => [...prev, profile])}
              onUpdateCustomerProfile={(profile) => setCustomerProfiles(prev => prev.map(p => p.id === profile.id ? profile : p))}
              onSaveNote={handleSaveNoteWithCustomer}
              onDeleteNote={deleteNote}
              onSaveOpportunity={saveOpportunity}
              onDeleteOpportunity={deleteOpportunity}
              onChangeOpportunityStage={changeStage}
            />
          ) : activeTab === 'migration' ? (
            <MigrationOpportunitiesGrid
              customers={customers}
              onEdit={(customer) => {
                setEditingMigrationCustomer(customer);
                setShowCustomerForm(true);
              }}
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

          {/* Customer Form Modal */}
          {showCustomerForm && editingMigrationCustomer && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                <CustomerForm
                  customer={editingMigrationCustomer}
                  onSave={(customer) => {
                    saveCustomer(customer);
                    setShowCustomerForm(false);
                    setEditingMigrationCustomer(null);
                  }}
                  onCancel={() => {
                    setShowCustomerForm(false);
                    setEditingMigrationCustomer(null);
                  }}
                />
              </div>
            </div>
          )}

          {/* AI Chat Panel */}
          <AIChatPanel
            isOpen={showAIChat}
            onClose={() => setShowAIChat(false)}
            customers={customers}
            customerContacts={customerContacts}
            internalContacts={internalContacts}
            products={products}
            partners={partners}
            onSaveNote={handleSaveNoteWithCustomer}
            onSaveCustomer={saveCustomer}
            onUpdateCustomer={saveCustomer}
            onUpdateProfile={async (profileUpdate) => {
              const existingProfile = customerProfiles.find(p => p.customerId === profileUpdate.customerId);
              if (existingProfile) {
                const updated = { ...existingProfile, ...profileUpdate };
                await customerProfileService.updateProfile(existingProfile.id, updated, user!.id);
                setCustomerProfiles(prev => prev.map(p => p.id === existingProfile.id ? updated : p));
              }
            }}
          onAddCustomerContact={async (contact) => {
            try {
              // Save to Firebase customerContacts collection
              const contactId = await customerContactService.createCustomerContact({
                name: contact.name,
                email: contact.email,
                phone: contact.phone,
                role: contact.role
              });
              // Create contact with Firebase ID
              const savedContact = { ...contact, id: contactId };
              // Update local state
              setCustomerContacts(prev => [...prev, savedContact]);
              console.log('✅ Customer contact saved to Firebase collection:', contact.name, 'ID:', contactId);
              return savedContact; // Return with ID for reference
            } catch (error) {
              console.error('Failed to save customer contact:', error);
              throw error;
            }
          }}
          onAddInternalContact={async (contact) => {
            try {
              // Save to Firebase internalContacts collection
              const contactId = await internalContactService.createInternalContact({
                name: contact.name,
                email: contact.email,
                phone: contact.phone,
                role: contact.role
              });
              // Create contact with Firebase ID
              const savedContact = { ...contact, id: contactId };
              // Update local state
              setInternalContacts(prev => [...prev, savedContact]);
              console.log('✅ Internal contact saved to Firebase collection:', contact.name, 'ID:', contactId);
              return savedContact; // Return with ID for reference
            } catch (error) {
              console.error('Failed to save internal contact:', error);
              throw error;
            }
          }}
            onAddProduct={(product) => setProducts(prev => [...prev, product])}
            onAddPartner={(partner) => setPartners(prev => [...prev, partner])}
            currentUser={{ id: user?.id || '', name: user?.name || user?.email || 'User' }}
          />

          {/* Floating AI Button */}
          <FloatingAIButton
            onClick={() => setShowAIChat(!showAIChat)}
            isOpen={showAIChat}
          />
        </div>
      )}
    </div>
  );
}

// Extracted UI Components
interface StatCardProps {
  icon: any;
  label: string;
  value: number;
  color: 'blue' | 'green' | 'purple' | 'orange';
}

function StatCard({ icon: Icon, label, value, color }: StatCardProps) {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    purple: 'bg-purple-100 text-purple-600',
    orange: 'bg-orange-100 text-orange-600'
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <div className="flex items-center">
        <div className={`p-3 ${colorClasses[color]} rounded-xl`}>
          <Icon className="h-6 w-6" />
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-600">{label}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  );
}

interface TabButtonProps {
  icon: any;
  label: string;
  active: boolean;
  onClick: () => void;
}

function TabButton({ icon: Icon, label, active, onClick }: TabButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
        active
          ? 'border-blue-500 text-blue-600 bg-blue-50'
          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
      }`}
    >
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4" />
        {label}
      </div>
    </button>
  );
}
