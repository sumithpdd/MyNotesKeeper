'use client';

import { useState, useEffect } from 'react';
import { FileText, Users, Calendar, TrendingUp, Settings, Target, MessageSquare, BookOpen } from 'lucide-react';
import { CustomerNote, Customer, CustomerContact, InternalContact, Product, Partner, CustomerProfile } from '@/types';
import { generateDummyCustomers, generateDummyNotes, generateDummyCustomerProfiles, dummyCustomerContacts, dummyInternalContacts, dummyProducts, dummyPartners } from '../../data/dummyData';
import { SlideOutPanel } from '@/components/SlideOutPanel';
import { CustomerManagement } from '@/components/CustomerManagement';
import { EntityManagement } from '@/components/EntityManagement';
import { MigrationOpportunitiesGrid } from '@/components/MigrationOpportunitiesGrid';
import { CustomerForm } from '@/components/CustomerForm';
import { UserHeader } from '@/components/UserHeader';
import { ChatbotInterface } from '@/components/ChatbotInterface';
import { PromptLibrary } from '@/components/PromptLibrary';
import { useAuth } from '@/lib/auth';
import { customerService } from '@/lib/customerService';
import { customerNotesService } from '@/lib/customerNotes';
import { customerProfileService } from '@/lib/customerProfileService';

export default function HomePage() {
  const { user } = useAuth();
  const [notes, setNotes] = useState<CustomerNote[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [customerProfiles, setCustomerProfiles] = useState<CustomerProfile[]>([]);
  const [customerContacts, setCustomerContacts] = useState<CustomerContact[]>(dummyCustomerContacts);
  const [internalContacts, setInternalContacts] = useState<InternalContact[]>(dummyInternalContacts);
  const [products, setProducts] = useState<Product[]>(dummyProducts);
  const [partners, setPartners] = useState<Partner[]>(dummyPartners);
  const [selectedCustomer, setSelectedCustomer] = useState<string | null>(null);
  const [viewingNote, setViewingNote] = useState<CustomerNote | null>(null);
  const [editingMigrationCustomer, setEditingMigrationCustomer] = useState<Customer | null>(null);
  const [showCustomerForm, setShowCustomerForm] = useState(false);
  const [activeTab, setActiveTab] = useState<'notes' | 'entities' | 'migration' | 'chatbot' | 'prompts'>('notes');
  const [loading, setLoading] = useState(true);

  // Load data from Firebase when user is authenticated
  useEffect(() => {
    if (user) {
      loadFirebaseData();
    }
  }, [user]);

  const loadFirebaseData = async () => {
    try {
      setLoading(true);
      const [customersData, notesData] = await Promise.all([
        customerService.getAllCustomers(),
        customerNotesService.getAllNotes()
      ]);
      
      // Ensure all customers have required fields with default values
      const customersWithDefaults = customersData.map(customer => ({
        ...customer,
        products: customer.products || [],
        customerContacts: customer.customerContacts || [],
        internalContacts: customer.internalContacts || [],
        partners: customer.partners || [],
        website: customer.website || '',
        sharePointUrl: customer.sharePointUrl || '',
        salesforceLink: customer.salesforceLink || '',
        additionalLink: customer.additionalLink || '',
        additionalInfo: customer.additionalInfo || '',
        createdAt: customer.createdAt || new Date(),
        updatedAt: customer.updatedAt || new Date()
      }));
      
      setCustomers(customersWithDefaults);
      
      // Ensure all notes have required fields with default values
      const notesWithDefaults = notesData.map(note => ({
        ...note,
        createdAt: note.createdAt || new Date(),
        updatedAt: note.updatedAt || new Date(),
        otherFields: note.otherFields || {}
      }));
      
      setNotes(notesWithDefaults);
      
      // Load customer profiles for each customer
      const profiles = await Promise.all(
        customersWithDefaults.map(customer => 
          customerProfileService.getProfileByCustomerId(customer.id)
        )
      );
      setCustomerProfiles(profiles.filter(profile => profile !== null) as CustomerProfile[]);
    } catch (error) {
      console.error('Error loading Firebase data:', error);
      // Fallback to dummy data if Firebase fails
      setCustomers(generateDummyCustomers());
      setNotes(generateDummyNotes());
      setCustomerProfiles(generateDummyCustomerProfiles());
    } finally {
      setLoading(false);
    }
  };


  const handleSaveNote = async (noteData: CustomerNote) => {
    if (!user) return;
    
    try {
      if (noteData.id) {
        try {
          await customerNotesService.updateNote({
            id: noteData.id,
            customerId: noteData.customerId,
            notes: noteData.notes,
            noteDate: noteData.noteDate,
            createdBy: noteData.createdBy,
            updatedBy: user.id,
            seConfidence: noteData.seConfidence,
            otherFields: noteData.otherFields,
          }, user.id);
          
          setNotes(prev => prev.map(note => 
            note.id === noteData.id ? { ...note, ...noteData, updatedAt: new Date() } : note
          ));
        } catch (updateError: any) {
          // If the note doesn't exist in Firestore, create it instead
          if (updateError.message?.includes('does not exist')) {
            console.warn(`Note ${noteData.id} doesn't exist in Firestore, creating new note instead`);
            
            const newNoteId = await customerNotesService.createNote({
              customerId: selectedCustomer!,
              notes: noteData.notes,
              noteDate: noteData.noteDate,
              createdBy: user.id,
              updatedBy: user.id,
              seConfidence: noteData.seConfidence,
              otherFields: noteData.otherFields,
            }, user.id);
            
            // Update local state with new note
            const newNote: CustomerNote = {
              ...noteData,
              id: newNoteId,
              customerId: selectedCustomer!,
              createdAt: new Date(),
              updatedAt: new Date()
            };
            
            // Remove old note and add new one
            setNotes(prev => [newNote, ...prev.filter(note => note.id !== noteData.id)]);
          } else {
            throw updateError;
          }
        }
      } else {
        const newNoteId = await customerNotesService.createNote({
          customerId: selectedCustomer!,
          notes: noteData.notes,
          noteDate: noteData.noteDate,
          createdBy: user.id,
          updatedBy: user.id,
          seConfidence: noteData.seConfidence,
          otherFields: noteData.otherFields,
        }, user.id);
        
        const newNote: CustomerNote = {
          ...noteData,
          id: newNoteId,
          customerId: selectedCustomer!,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        setNotes(prev => [newNote, ...prev]);
      }
    } catch (error) {
      console.error('Error saving note:', error);
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    try {
      await customerNotesService.deleteNote(noteId);
      setNotes(prev => prev.filter(note => note.id !== noteId));
    } catch (error) {
      console.error('Error deleting note:', error);
    }
  };

  const handleSaveCustomerManagement = async (customer: Customer) => {
    if (!user) return;
    
    try {
      const existingIndex = customers.findIndex(c => c.id === customer.id);
      if (existingIndex >= 0) {
        await customerService.updateCustomer(customer.id, customer, user.id);
        setCustomers(prev => prev.map(c => c.id === customer.id ? customer : c));
      } else {
        const newCustomerId = await customerService.createCustomer(customer, user.id);
        const newCustomer = { ...customer, id: newCustomerId };
        setCustomers(prev => [...prev, newCustomer]);
      }
    } catch (error) {
      console.error('Error saving customer:', error);
    }
  };

  const handleDeleteCustomerManagement = async (customerId: string) => {
    try {
      await customerService.deleteCustomer(customerId);
      setCustomers(prev => prev.filter(c => c.id !== customerId));
      // Also remove related notes
      setNotes(prev => prev.filter(n => n.customerId !== customerId));
    } catch (error) {
      console.error('Error deleting customer:', error);
    }
  };

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
            <button
              onClick={() => setActiveTab('migration')}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'migration'
                  ? 'border-blue-500 text-blue-600 bg-blue-50'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4" />
                Migration Opportunities
              </div>
            </button>
            <button
              onClick={() => setActiveTab('chatbot')}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'chatbot'
                  ? 'border-blue-500 text-blue-600 bg-blue-50'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                AI Chatbot
              </div>
            </button>
            <button
              onClick={() => setActiveTab('prompts')}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'prompts'
                  ? 'border-blue-500 text-blue-600 bg-blue-50'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                Prompt Library
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
        ) : activeTab === 'migration' ? (
          <MigrationOpportunitiesGrid
            customers={customers}
            onEdit={(customer) => {
              setEditingMigrationCustomer(customer);
              setShowCustomerForm(true);
            }}
          />
        ) : activeTab === 'chatbot' ? (
          <ChatbotInterface
            customers={customers}
            onSaveNote={handleSaveNote}
            onSaveCustomer={handleSaveCustomerManagement}
            onUpdateCustomer={handleSaveCustomerManagement}
            onUpdateProfile={async (profileUpdate) => {
              const existingProfile = customerProfiles.find(p => p.customerId === profileUpdate.customerId);
              if (existingProfile) {
                const updated = { ...existingProfile, ...profileUpdate };
                await customerProfileService.updateProfile(existingProfile.id, updated, user!.id);
                setCustomerProfiles(prev => prev.map(p => p.id === existingProfile.id ? updated : p));
              }
            }}
            currentUser={{ id: user?.id || '', name: user?.name || 'User' }}
          />
        ) : activeTab === 'prompts' ? (
          <PromptLibrary
            onUsePromptInChatbot={(prompt) => {
              // Switch to chatbot tab when a prompt is selected
              setActiveTab('chatbot');
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

        {/* Customer Form for Migration Opportunities */}
        {showCustomerForm && editingMigrationCustomer && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <CustomerForm
                customer={editingMigrationCustomer}
                onSave={(customer) => {
                  handleSaveCustomerManagement(customer);
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

        </div>
      )}
    </div>
  );
}