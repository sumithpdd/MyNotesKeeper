'use client';

import { useState } from 'react';
import { Plus, Edit, Trash2, Eye, Building, Users, Calendar, FileText, ArrowLeft, Sparkles, X } from 'lucide-react';
import { aiService } from '@/lib/ai';
import { Customer, CustomerNote, CustomerProfile, CreateCustomerData, CreateCustomerNoteData, UpdateCustomerNoteData } from '@/types';
import { CustomerForm } from './CustomerForm';
import { NoteForm } from './NoteForm';
import { CustomerProfileForm } from './CustomerProfileForm';
import { CustomerList } from './CustomerList';
import { SlideOutPanel } from './SlideOutPanel';

interface CustomerManagementProps {
  customers: Customer[];
  customerProfiles: CustomerProfile[];
  notes: CustomerNote[];
  selectedCustomer: string | null;
  onSelectCustomer: (customerId: string | null) => void;
  onSaveCustomer: (customer: Customer) => void;
  onDeleteCustomer: (customerId: string) => void;
  onSaveCustomerProfile: (profile: CustomerProfile) => void;
  onUpdateCustomerProfile: (profile: CustomerProfile) => void;
  onSaveNote: (note: CustomerNote) => void;
  onDeleteNote: (noteId: string) => void;
}

export function CustomerManagement({
  customers,
  customerProfiles,
  notes,
  selectedCustomer,
  onSelectCustomer,
  onSaveCustomer,
  onDeleteCustomer,
  onSaveCustomerProfile,
  onUpdateCustomerProfile,
  onSaveNote,
  onDeleteNote
}: CustomerManagementProps) {
  const [showCustomerForm, setShowCustomerForm] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | undefined>();
  const [showCustomerProfileForm, setShowCustomerProfileForm] = useState(false);
  const [editingCustomerProfile, setEditingCustomerProfile] = useState<CustomerProfile | undefined>();
  const [showNoteForm, setShowNoteForm] = useState(false);
  const [editingNote, setEditingNote] = useState<CustomerNote | undefined>();
  const [viewingNote, setViewingNote] = useState<CustomerNote | null>(null);
  const [customerSummary, setCustomerSummary] = useState<string | null>(null);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);

  const selectedCustomerData = customers.find(c => c.id === selectedCustomer);
  const selectedCustomerProfile = customerProfiles.find(p => p.customerId === selectedCustomer);
  const customerNotes = selectedCustomer ? notes.filter(note => note.customerId === selectedCustomer) : [];

  const handleSaveCustomer = (customer: Customer) => {
    onSaveCustomer(customer);
    setShowCustomerForm(false);
    setEditingCustomer(undefined);
  };

  const handleDeleteCustomer = (customerId: string) => {
    if (confirm('Are you sure you want to delete this customer? This will also delete all associated notes.')) {
      onDeleteCustomer(customerId);
      onSelectCustomer(null);
    }
  };

  const handleSaveNote = (note: CustomerNote) => {
    onSaveNote(note);
    setShowNoteForm(false);
    setEditingNote(undefined);
  };

  const handleDeleteNote = (noteId: string) => {
    if (confirm('Are you sure you want to delete this note?')) {
      onDeleteNote(noteId);
    }
  };

  const handleEditCustomer = (customer: Customer) => {
    console.log('handleEditCustomer called with:', customer);
    setEditingCustomer(customer);
    setShowCustomerForm(true);
  };

  const handleSaveCustomerProfile = (profile: CustomerProfile) => {
    if (profile.id.startsWith('profile-')) {
      onSaveCustomerProfile(profile);
    } else {
      onUpdateCustomerProfile(profile);
    }
    setShowCustomerProfileForm(false);
    setEditingCustomerProfile(undefined);
  };

  const handleCancelCustomerProfile = () => {
    setShowCustomerProfileForm(false);
    setEditingCustomerProfile(undefined);
  };

  const handleEditCustomerProfile = (profile: CustomerProfile) => {
    setEditingCustomerProfile(profile);
    setShowCustomerProfileForm(true);
  };

  const handleCreateCustomerProfile = () => {
    setEditingCustomerProfile(undefined);
    setShowCustomerProfileForm(true);
  };

  const handleEditNote = (note: CustomerNote) => {
    setEditingNote(note);
    setShowNoteForm(true);
  };

  const handleAddNote = () => {
    if (!selectedCustomer) return;
    setEditingNote(undefined);
    setShowNoteForm(true);
  };

  const handleGenerateSummary = async () => {
    if (!selectedCustomerData) return;
    
    setIsGeneratingSummary(true);
    try {
      const summary = await aiService.generateCustomerSummary(selectedCustomerData);
      setCustomerSummary(summary);
    } catch (error: any) {
      console.error('Error generating summary:', error);
      // Use the error message from the AI service which includes helpful details
      alert(error?.message || 'Failed to generate summary. Please check your API key at https://aistudio.google.com/app/apikey');
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Customer Management</h1>
          <p className="text-gray-600">Manage customers and their notes in one unified interface</p>
        </div>
        <button
          onClick={() => {
            setEditingCustomer(undefined);
            setShowCustomerForm(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add Customer
        </button>
      </div>

      {/* Main Content */}
      {selectedCustomer ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Side - Customer Information */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              {/* Customer Header */}
              <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => onSelectCustomer(null)}
                      className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Back to Customer Directory"
                    >
                      <ArrowLeft className="h-4 w-4" />
                    </button>
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Building className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">{selectedCustomerData?.customerName}</h2>
                      <p className="text-sm text-gray-600">Customer Information</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleGenerateSummary}
                      disabled={isGeneratingSummary}
                      className="flex items-center gap-2 px-3 py-2 bg-purple-100 text-purple-700 hover:bg-purple-200 rounded-lg transition-colors disabled:opacity-50"
                      title="Generate AI Summary"
                    >
                      <Sparkles className="h-4 w-4" />
                      <span className="text-sm font-medium">AI Summary</span>
                    </button>
                    <button
                      onClick={() => handleEditCustomer(selectedCustomerData!)}
                      className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Edit Customer"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteCustomer(selectedCustomer)}
                      className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete Customer"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* AI Summary */}
              {customerSummary && (
                <div className="mx-6 mb-6 bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-purple-600" />
                      <h3 className="font-semibold text-purple-900">AI-Generated Customer Summary</h3>
                    </div>
                    <button
                      onClick={() => setCustomerSummary(null)}
                      className="text-purple-600 hover:text-purple-800"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  <p className="text-sm text-gray-700 whitespace-pre-line leading-relaxed">{customerSummary}</p>
                </div>
              )}

              {/* Customer Details */}
              <div className="p-6 space-y-6">
                {/* Website */}
                {selectedCustomerData?.website && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Website</label>
                    <a
                      href={selectedCustomerData.website.startsWith('http') ? selectedCustomerData.website : `https://${selectedCustomerData.website}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 hover:underline text-sm"
                    >
                      {selectedCustomerData.website}
                    </a>
                  </div>
                )}

                {/* Products */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Products ({selectedCustomerData?.products.length || 0})
                  </label>
                  {selectedCustomerData?.products.length ? (
                    <div className="space-y-2">
                      {selectedCustomerData.products.map((product) => (
                        <div key={product.id} className="bg-gray-50 rounded-lg p-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="font-medium text-gray-900">{product.name}{product.version ? ` v${product.version}` : ''}</span>
                            </div>
                            {product.status && (
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                product.status === 'Active' ? 'bg-green-100 text-green-800' :
                                product.status === 'Inactive' ? 'bg-red-100 text-red-800' :
                                product.status === 'Planned' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {product.status}
                              </span>
                            )}
                          </div>
                          {product.description && (
                            <p className="text-sm text-gray-600 mt-1">{product.description}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No products assigned</p>
                  )}
                </div>

                {/* Customer Contacts */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Customer Contacts ({selectedCustomerData?.customerContacts.length || 0})
                  </label>
                  {selectedCustomerData?.customerContacts.length ? (
                    <div className="space-y-2">
                      {selectedCustomerData.customerContacts.map((contact) => (
                        <div key={contact.id} className="bg-gray-50 rounded-lg p-3">
                          <div className="font-medium text-gray-900">{contact.name}</div>
                          {contact.role && (
                            <div className="text-sm text-gray-600 mt-1">{contact.role}</div>
                          )}
                          {contact.email && (
                            <div className="text-sm text-gray-600 mt-1">{contact.email}</div>
                          )}
                          {contact.phone && (
                            <div className="text-sm text-gray-600 mt-1">{contact.phone}</div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No customer contacts</p>
                  )}
                </div>

                {/* Internal Contacts */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Internal Contacts ({selectedCustomerData?.internalContacts.length || 0})
                  </label>
                  {selectedCustomerData?.internalContacts.length ? (
                    <div className="space-y-2">
                      {selectedCustomerData.internalContacts.map((contact) => (
                        <div key={contact.id} className="bg-gray-50 rounded-lg p-3">
                          <div className="font-medium text-gray-900">{contact.name}</div>
                          {contact.role && (
                            <div className="text-sm text-gray-600 mt-1">{contact.role}</div>
                          )}
                          {contact.email && (
                            <div className="text-sm text-gray-600 mt-1">{contact.email}</div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No internal contacts</p>
                  )}
                </div>

                {/* Partners */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Partners ({selectedCustomerData?.partners.length || 0})
                  </label>
                  {selectedCustomerData?.partners.length ? (
                    <div className="space-y-2">
                      {selectedCustomerData.partners.map((partner) => (
                        <div key={partner.id} className="bg-gray-50 rounded-lg p-3">
                          <div className="font-medium text-gray-900">{partner.name}</div>
                          {partner.type && (
                            <div className="text-sm text-gray-600 mt-1">{partner.type}</div>
                          )}
                          {partner.website && (
                            <div className="text-sm text-gray-600 mt-1">{partner.website}</div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No partners</p>
                  )}
                </div>

                {/* Quick Links */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Quick Links</label>
                  <div className="space-y-2">
                    {selectedCustomerData?.sharePointUrl && (
                      <a
                        href={selectedCustomerData.sharePointUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block text-green-600 hover:text-green-800 hover:underline text-sm"
                      >
                        SharePoint
                      </a>
                    )}
                    {selectedCustomerData?.salesforceLink && (
                      <a
                        href={selectedCustomerData.salesforceLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block text-orange-600 hover:text-orange-800 hover:underline text-sm"
                      >
                        Salesforce
                      </a>
                    )}
                    {selectedCustomerData?.additionalLink && (
                      <a
                        href={selectedCustomerData.additionalLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block text-purple-600 hover:text-purple-800 hover:underline text-sm"
                      >
                        Additional Link
                      </a>
                    )}
                  </div>
                </div>

                {/* Migration Opportunity Information */}
                {(selectedCustomerData?.existingMigrationOpp || selectedCustomerData?.migrationNotes || selectedCustomerData?.migrationComplexity) && (
                  <div className="border-t border-gray-200 pt-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Migration Opportunity Information</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {selectedCustomerData.existingMigrationOpp && (
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">Migration Opp</label>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            ['yes', 'YES', 'y', 'Y'].includes(selectedCustomerData.existingMigrationOpp.toLowerCase())
                              ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {selectedCustomerData.existingMigrationOpp}
                          </span>
                        </div>
                      )}
                      {selectedCustomerData.perpetualOrSubscription && (
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">License</label>
                          <p className="text-sm text-gray-900 font-medium">
                            {selectedCustomerData.perpetualOrSubscription}
                          </p>
                        </div>
                      )}
                      {selectedCustomerData.hostingLocation && (
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">Hosting</label>
                          <p className="text-sm text-gray-900 font-medium">
                            {selectedCustomerData.hostingLocation}
                          </p>
                        </div>
                      )}
                      {selectedCustomerData.frontEndTech && (
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">Front End</label>
                          <p className="text-sm text-gray-900 font-medium">
                            {selectedCustomerData.frontEndTech}
                          </p>
                        </div>
                      )}
                      {selectedCustomerData.migrationComplexity && (
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">Complexity</label>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            selectedCustomerData.migrationComplexity.toLowerCase() === 'high' ? 'bg-red-100 text-red-800' :
                            selectedCustomerData.migrationComplexity.toLowerCase() === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {selectedCustomerData.migrationComplexity}
                          </span>
                        </div>
                      )}
                      {selectedCustomerData.compellingEvent && (
                        <div className="md:col-span-2">
                          <label className="block text-xs font-medium text-gray-600 mb-1">Compelling Event</label>
                          <p className="text-sm text-gray-900 font-medium">
                            {selectedCustomerData.compellingEvent}
                          </p>
                        </div>
                      )}
                      {(selectedCustomerData.migrationNotes || selectedCustomerData.mergedNotes) && (
                        <div className="md:col-span-3">
                          <label className="block text-xs font-medium text-gray-600 mb-1">Migration Notes</label>
                          <p className="text-sm text-gray-900 bg-gray-50 rounded-lg p-2">
                            {selectedCustomerData.migrationNotes || selectedCustomerData.mergedNotes}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Customer Profile */}
                <div className="border-t border-gray-200 pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Customer Profile</h3>
                    <div className="flex gap-2">
                      {selectedCustomerProfile ? (
                        <button
                          onClick={() => handleEditCustomerProfile(selectedCustomerProfile)}
                          className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit Customer Profile"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                      ) : (
                        <button
                          onClick={handleCreateCustomerProfile}
                          className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                        >
                          <Plus className="h-4 w-4" />
                          Create Profile
                        </button>
                      )}
                    </div>
                  </div>

                  {selectedCustomerProfile ? (
                    <div className="space-y-4">
                      {/* Business Problem */}
                      {selectedCustomerProfile.businessProblem && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Business Problem</label>
                          <p className="text-sm text-gray-900 bg-gray-50 rounded-lg p-3">
                            {selectedCustomerProfile.businessProblem}
                          </p>
                        </div>
                      )}

                      {/* Why Us */}
                      {selectedCustomerProfile.whyUs && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Why Us</label>
                          <p className="text-sm text-gray-900 bg-gray-50 rounded-lg p-3">
                            {selectedCustomerProfile.whyUs}
                          </p>
                        </div>
                      )}

                      {/* Why Now */}
                      {selectedCustomerProfile.whyNow && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Why Now</label>
                          <p className="text-sm text-gray-900 bg-gray-50 rounded-lg p-3">
                            {selectedCustomerProfile.whyNow}
                          </p>
                        </div>
                      )}

                      {/* Quick Status */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Tech Select</label>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            selectedCustomerProfile.techSelect ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {selectedCustomerProfile.techSelect ? 'Yes' : 'No'}
                          </span>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Discovery</label>
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {selectedCustomerProfile.discovery}
                          </span>
                        </div>
                      </div>

                      {/* SE Assessment */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">SE Product Fit</label>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            selectedCustomerProfile.seProductFitAssessment === 'Green' ? 'bg-green-100 text-green-800' :
                            selectedCustomerProfile.seProductFitAssessment === 'Yellow' ? 'bg-yellow-100 text-yellow-800' :
                            selectedCustomerProfile.seProductFitAssessment === 'Red' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {selectedCustomerProfile.seProductFitAssessment || 'Not Set'}
                          </span>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Total Demos</label>
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                            {selectedCustomerProfile.totalDemos}
                          </span>
                        </div>
                      </div>

                      {/* Customer Objectives */}
                      {(selectedCustomerProfile.customerObjective1 || selectedCustomerProfile.customerObjective2 || selectedCustomerProfile.customerObjective3) && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Customer Objectives</label>
                          <div className="space-y-1">
                            {selectedCustomerProfile.customerObjective1 && (
                              <p className="text-sm text-gray-900 bg-gray-50 rounded-lg p-2">
                                1. {selectedCustomerProfile.customerObjective1}
                              </p>
                            )}
                            {selectedCustomerProfile.customerObjective2 && (
                              <p className="text-sm text-gray-900 bg-gray-50 rounded-lg p-2">
                                2. {selectedCustomerProfile.customerObjective2}
                              </p>
                            )}
                            {selectedCustomerProfile.customerObjective3 && (
                              <p className="text-sm text-gray-900 bg-gray-50 rounded-lg p-2">
                                3. {selectedCustomerProfile.customerObjective3}
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <FileText className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                      <p className="text-sm">No customer profile created yet</p>
                      <p className="text-xs text-gray-400 mt-1">Create a profile to track business details and objectives</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Notes Management */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              {/* Notes Header */}
              <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-green-50 to-emerald-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <FileText className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">Notes Management</h2>
                      <p className="text-sm text-gray-600">{customerNotes.length} notes</p>
                    </div>
                  </div>
                  <button
                    onClick={handleAddNote}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                    Add Note
                  </button>
                </div>
              </div>

              {/* Notes List */}
              <div className="p-6">
                {customerNotes.length > 0 ? (
                  <div className="space-y-4">
                    {customerNotes.map((note) => (
                      <div key={note.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Calendar className="h-4 w-4 text-gray-400" />
                              <span className="text-sm text-gray-600">
                                {new Date(note.noteDate).toLocaleDateString()}
                              </span>
                              <span className="text-sm text-gray-500">•</span>
                              <Users className="h-4 w-4 text-gray-400" />
                              <span className="text-sm text-gray-600">{note.createdBy}</span>
                            </div>
                            <p className="text-sm text-gray-900 line-clamp-3 mb-3">
                              {note.notes}
                            </p>
                            <div className="flex items-center gap-2">
                              {note.seConfidence && (
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  note.seConfidence === 'Green' ? 'bg-green-100 text-green-800' :
                                  note.seConfidence === 'Yellow' ? 'bg-yellow-100 text-yellow-800' :
                                  note.seConfidence === 'Red' ? 'bg-red-100 text-red-800' :
                                  'bg-gray-100 text-gray-800'
                                }`}>
                                  SE: {note.seConfidence}
                                </span>
                              )}
                              {selectedCustomerProfile?.seProductFitAssessment && (
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  selectedCustomerProfile.seProductFitAssessment === 'Green' ? 'bg-green-100 text-green-800' :
                                  selectedCustomerProfile.seProductFitAssessment === 'Yellow' ? 'bg-yellow-100 text-yellow-800' :
                                  selectedCustomerProfile.seProductFitAssessment === 'Red' ? 'bg-red-100 text-red-800' :
                                  'bg-gray-100 text-gray-800'
                                }`}>
                                  Fit: {selectedCustomerProfile.seProductFitAssessment}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-1 ml-4">
                            <button
                              onClick={() => setViewingNote(note)}
                              className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="View Note"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleEditNote(note)}
                              className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                              title="Edit Note"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteNote(note.id)}
                              className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete Note"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <FileText className="mx-auto h-12 w-12 text-gray-300" />
                    <h3 className="text-lg font-semibold text-gray-900 mt-4">No Notes Yet</h3>
                    <p className="text-gray-600 mt-2">
                      Add your first note to start tracking customer interactions
                    </p>
                    <button
                      onClick={handleAddNote}
                      className="mt-4 flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors mx-auto"
                    >
                      <Plus className="h-4 w-4" />
                      Add First Note
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Customer Directory */}
          <CustomerList
            customers={customers}
            selectedCustomer={selectedCustomer}
            onSelectCustomer={onSelectCustomer}
          />
        </div>
      )}

      {/* Modals */}
      {showCustomerForm && (
        <CustomerForm
          customer={editingCustomer}
          onSave={handleSaveCustomer}
          onCancel={() => {
            setShowCustomerForm(false);
            setEditingCustomer(undefined);
          }}
        />
      )}

      {showNoteForm && (
        <NoteForm
          customerId={selectedCustomer || ''}
          note={editingNote}
          onSave={handleSaveNote}
          onCancel={() => {
            setShowNoteForm(false);
            setEditingNote(undefined);
          }}
        />
      )}

      {showCustomerProfileForm && (
        <CustomerProfileForm
          customerProfile={editingCustomerProfile}
          customerName={selectedCustomerData?.customerName || 'Unknown Customer'}
          onSave={handleSaveCustomerProfile}
          onCancel={handleCancelCustomerProfile}
        />
      )}

      {viewingNote && (
        <SlideOutPanel
          note={viewingNote}
          customer={selectedCustomerData || null}
          customerProfile={selectedCustomerProfile || null}
          onClose={() => setViewingNote(null)}
        />
      )}
    </div>
  );
}