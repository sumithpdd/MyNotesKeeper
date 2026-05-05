'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Eye, Building, Users, Calendar, FileText, ArrowLeft, Sparkles, X, CalendarDays, List, ClipboardList } from 'lucide-react';
import { LinkWithCopy } from './ui/LinkWithCopy';
import { useAuth } from '@/lib/auth';
import { hubAuthJson } from '@/lib/client/hubAuthFetch';
import { Customer, CustomerNote, CustomerProfile, Opportunity, OpportunityStage, EngagementTask, Product, Partner, MartechTool, InternalContact } from '@/types';
import { CustomerForm } from './CustomerForm';
import { CustomerEditSlideOut } from './CustomerEditSlideOut';
import { NoteForm } from './NoteForm';
import { CustomerProfileForm } from './CustomerProfileForm';
import { CustomerList } from './CustomerList';
import { SlideOutPanel } from './SlideOutPanel';
import { OpportunityList } from './OpportunityList';
import { OpportunityForm } from './OpportunityForm';
import { OpportunityDetail } from './OpportunityDetail';
import { safeFormatDate } from '@/lib/utils';
import { TypeBadge } from './ui/TypeBadge';
import { getAccountExecutiveColor } from '@/lib/accountExecutiveColors';
import { getMartechToolColor } from '@/lib/martechToolColors';
import { formatProductDisplayName } from '@/lib/productDisplay';
import { customerWebsiteList } from '@/lib/customerWebsites';
import { ActivityCalendar } from './ActivityCalendar';
import { buildActivities } from '@/lib/activityUtils';
import { getLastAccountTaskAction, getTasksForCustomer } from '@/lib/taskAccountActivity';
import { formatTaskPlanningWindow } from '@/lib/taskPlanningRange';

interface CustomerManagementProps {
  customers: Customer[];
  customerProfiles: CustomerProfile[];
  notes: CustomerNote[];
  tasks: EngagementTask[];
  opportunities: Opportunity[];
  products?: Product[];
  partners?: Partner[];
  martechTools?: MartechTool[];
  internalContacts?: InternalContact[];
  selectedCustomer: string | null;
  currentUser: string;
  onSelectCustomer: (customerId: string | null) => void;
  onSaveCustomer: (customer: Customer) => void;
  onDeleteCustomer: (customerId: string) => void;
  onSaveCustomerProfile: (profile: CustomerProfile) => void;
  onUpdateCustomerProfile: (profile: CustomerProfile) => void;
  onSaveNote: (note: CustomerNote) => void;
  onDeleteNote: (noteId: string) => void;
  onSaveOpportunity: (opportunity: Opportunity) => void;
  onDeleteOpportunity: (opportunityId: string) => void;
  onChangeOpportunityStage: (opportunityId: string, newStage: OpportunityStage, notes?: string) => void;
  /** When set together with matching `selectedCustomer`, opens optional opportunity detail (e.g. from Tasks). */
  workspaceFocus?: { customerId: string; opportunityId?: string | null } | null;
  onWorkspaceFocusConsumed?: () => void;
}

export function CustomerManagement({
  customers,
  customerProfiles,
  notes,
  tasks,
  opportunities,
  products = [],
  partners = [],
  martechTools = [],
  internalContacts = [],
  selectedCustomer,
  currentUser,
  onSelectCustomer,
  onSaveCustomer,
  onDeleteCustomer,
  onSaveCustomerProfile,
  onUpdateCustomerProfile,
  onSaveNote,
  onDeleteNote,
  onSaveOpportunity,
  onDeleteOpportunity,
  onChangeOpportunityStage,
  workspaceFocus,
  onWorkspaceFocusConsumed,
}: CustomerManagementProps) {
  const { getFirebaseIdToken } = useAuth();
  const [showCustomerForm, setShowCustomerForm] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | undefined>();
  const [showCustomerProfileForm, setShowCustomerProfileForm] = useState(false);
  const [editingCustomerProfile, setEditingCustomerProfile] = useState<CustomerProfile | undefined>();
  const [showNoteForm, setShowNoteForm] = useState(false);
  const [editingNote, setEditingNote] = useState<CustomerNote | undefined>();
  const [viewingNote, setViewingNote] = useState<CustomerNote | null>(null);
  const [customerSummary, setCustomerSummary] = useState<string | null>(null);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  
  // Opportunity state
  const [showOpportunityForm, setShowOpportunityForm] = useState(false);
  const [editingOpportunity, setEditingOpportunity] = useState<Opportunity | undefined>();
  const [viewingOpportunity, setViewingOpportunity] = useState<Opportunity | null>(null);
  const [listViewMode, setListViewMode] = useState<'list' | 'calendar'>('list');

  const selectedCustomerData = customers.find(c => c.id === selectedCustomer);
  const activities = buildActivities(customers, notes, customerProfiles, opportunities);
  const selectedCustomerProfile = customerProfiles.find(p => p.customerId === selectedCustomer);
  const customerNotes = selectedCustomer ? notes.filter(note => note.customerId === selectedCustomer) : [];

  const accountOppIds = selectedCustomer
    ? new Set(opportunities.filter((o) => o.customerId === selectedCustomer).map((o) => o.id))
    : new Set<string>();
  const lastTaskAction =
    selectedCustomer ? getLastAccountTaskAction(selectedCustomer, tasks, accountOppIds) : null;

  const customerRelatedTasks = selectedCustomer
    ? [...getTasksForCustomer(selectedCustomer, tasks, accountOppIds)].sort(
        (a, b) => b.lastActionedAt.getTime() - a.lastActionedAt.getTime(),
      )
    : [];

  useEffect(() => {
    if (!workspaceFocus || selectedCustomer !== workspaceFocus.customerId) return;
    const oid = workspaceFocus.opportunityId?.trim();
    if (oid) {
      const opp = opportunities.find((o) => o.id === oid && o.customerId === selectedCustomer);
      if (opp) setViewingOpportunity(opp);
      else setViewingOpportunity(null);
    } else {
      setViewingOpportunity(null);
    }
    onWorkspaceFocusConsumed?.();
  }, [workspaceFocus, selectedCustomer, opportunities, onWorkspaceFocusConsumed]);

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
      const token = await getFirebaseIdToken();
      if (!token) throw new Error('Sign in required to use AI features.');
      const { summary } = await hubAuthJson<{ summary: string }>(
        '/api/ai/customer-summary',
        token,
        {
          method: 'POST',
          body: JSON.stringify({
            customerName: selectedCustomerData.customerName,
            products: selectedCustomerData.products,
            migrationComplexity: selectedCustomerData.migrationComplexity,
            perpetualOrSubscription: selectedCustomerData.perpetualOrSubscription,
            hostingLocation: selectedCustomerData.hostingLocation,
            compellingEvent: selectedCustomerData.compellingEvent,
            existingMigrationOpp: selectedCustomerData.existingMigrationOpp,
            migrationNotes: selectedCustomerData.migrationNotes,
            mergedNotes: selectedCustomerData.mergedNotes,
          }),
        },
      );
      setCustomerSummary(summary);
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Failed to generate summary';
      console.error('Error generating summary:', error);
      alert(msg);
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  // Opportunity handlers
  const handleSaveOpportunity = (opportunity: Opportunity) => {
    onSaveOpportunity(opportunity);
    setShowOpportunityForm(false);
    setEditingOpportunity(undefined);
  };

  const handleEditOpportunity = (opportunity: Opportunity) => {
    setEditingOpportunity(opportunity);
    setShowOpportunityForm(true);
  };

  const handleDeleteOpportunity = (opportunityId: string) => {
    onDeleteOpportunity(opportunityId);
  };

  const handleViewOpportunity = (opportunityId: string) => {
    const opportunity = opportunities.find(opp => opp.id === opportunityId);
    if (opportunity) {
      setViewingOpportunity(opportunity);
    }
  };

  const handleOpportunityStageChange = (newStage: OpportunityStage, notes?: string) => {
    if (viewingOpportunity) {
      onChangeOpportunityStage(viewingOpportunity.id, newStage, notes);
      // Update local viewing state
      const updatedOpportunity = opportunities.find(opp => opp.id === viewingOpportunity.id);
      if (updatedOpportunity) {
        setViewingOpportunity(updatedOpportunity);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">Customer Management</h1>
          <p className="text-base text-gray-600 mt-1 leading-relaxed">Manage customers and their notes in one unified interface</p>
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
              {/* Customer Header - Card style with prominent Edit */}
              <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-blue-50 via-indigo-50/80 to-white">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <button
                      onClick={() => onSelectCustomer(null)}
                      className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors shrink-0 mt-0.5"
                      title="Back to Customer Directory"
                    >
                      <ArrowLeft className="h-4 w-4" />
                    </button>
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-lg font-bold shrink-0">
                      {selectedCustomerData?.customerName?.slice(0, 2).toUpperCase() || '?'}
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900 tracking-tight">{selectedCustomerData?.customerName}</h2>
                      <p className="text-sm text-gray-600 mt-0.5 font-medium">Customer Details</p>
                      <code className="text-xs font-mono text-gray-500 mt-1 block" title="Firestore document ID">
                        {selectedCustomerData?.id}
                      </code>
                      <p className="text-xs mt-2 text-gray-600">
                        {lastTaskAction ? (
                          <>
                            <span className="text-gray-500">Last task action on account: </span>
                            <span className="font-semibold text-gray-900">{safeFormatDate(lastTaskAction)}</span>
                          </>
                        ) : (
                          <span className="text-gray-400">No linked tasks touched yet — add tasks from Tasks & Kanban.</span>
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      onClick={() => handleEditCustomer(selectedCustomerData!)}
                      className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm shadow-sm"
                      title="Edit Customer Details"
                    >
                      <Edit className="h-4 w-4" />
                      Edit Customer Details
                    </button>
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

              {/* Key Info - Two Column Layout (like reference) */}
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  {(() => {
                    const sites = selectedCustomerData ? customerWebsiteList(selectedCustomerData) : [];
                    if (sites.length === 0) return null;
                    return (
                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                          Website{sites.length > 1 ? 's' : ''}
                        </p>
                        <div className="space-y-2">
                          {sites.map((url) => (
                            <LinkWithCopy
                              key={url}
                              url={url}
                              label={url.replace(/^https?:\/\//, '')}
                              linkClassName="text-blue-600 hover:text-blue-800 text-sm font-medium"
                            />
                          ))}
                        </div>
                      </div>
                    );
                  })()}
                  {(() => {
                    const contacts = selectedCustomerData?.accountExecutives?.length
                      ? selectedCustomerData.accountExecutives
                      : selectedCustomerData?.internalContacts?.length
                        ? selectedCustomerData.internalContacts
                        : selectedCustomerData?.accountExecutive
                          ? [selectedCustomerData.accountExecutive]
                          : [];
                    const primary = contacts[0];
                    if (!primary) return null;
                    return (
                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Representative</p>
                        <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-100">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-sm font-bold">
                            {primary.name?.slice(0, 2).toUpperCase() || '?'}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{primary.name}</p>
                            <p className="text-xs text-gray-600">{primary.role || 'Account Executive'}</p>
                            {primary.email && (
                              <a href={`mailto:${primary.email}`} className="text-xs text-blue-600 hover:underline">{primary.email}</a>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>

              {/* Customer Details */}
              <div className="px-6 pb-6 space-y-6">
                
                {/* Sitecore Contacts (Name - Role) with color coding */}
                {(() => {
                  const contacts = selectedCustomerData?.accountExecutives?.length
                    ? selectedCustomerData.accountExecutives
                    : selectedCustomerData?.internalContacts?.length
                      ? selectedCustomerData.internalContacts
                      : selectedCustomerData?.accountExecutive
                        ? [selectedCustomerData.accountExecutive]
                        : [];
                  if (contacts.length === 0) return null;
                  return (
                    <div>
                      <h3 className="text-sm font-bold text-gray-800 mb-2">Sitecore Contacts</h3>
                      <div className="flex flex-wrap gap-2">
                        {contacts.map((c) => {
                          const label = c.role ? `${c.name} - ${c.role}` : c.name;
                          const aeColor = getAccountExecutiveColor(c.name);
                          return (
                            <div
                              key={c.id}
                              className={`rounded-lg p-3 border ${aeColor.badge} flex flex-col gap-1`}
                            >
                              <div className="flex items-center gap-2">
                                <span className={`w-2 h-2 rounded-full ${aeColor.dot}`} />
                                <span className="font-medium">{label}</span>
                              </div>
                              {c.email && (
                                <a
                                  href={`mailto:${c.email}`}
                                  className="text-sm hover:underline"
                                >
                                  {c.email}
                                </a>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })()}

                {/* Martech Tools */}
                {(selectedCustomerData?.martechTools?.length ?? 0) > 0 && (
                <div>
                  <h3 className="text-sm font-bold text-gray-800 mb-3">
                    Martech Tools ({selectedCustomerData?.martechTools?.length || 0})
                  </h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedCustomerData!.martechTools!.map((t) => {
                        const c = getMartechToolColor(t.name);
                        return (
                          <span
                            key={t.id}
                            className={`inline-flex px-3 py-1.5 rounded-lg text-sm font-medium ${c.bg} ${c.text}`}
                            title={t.purpose ? `${t.name} — ${t.purpose}` : t.name}
                          >
                            {t.name}
                            {t.purpose && (
                              <span className="ml-1.5 opacity-80 text-xs">— {t.purpose}</span>
                            )}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Products */}
                <div>
                  <h3 className="text-sm font-bold text-gray-800 mb-3">
                    Products ({(selectedCustomerData?.products ?? []).length})
                  </h3>
                  {(selectedCustomerData?.products ?? []).length ? (
                    <div className="space-y-2">
                      {(selectedCustomerData?.products ?? []).map((product) => (
                        <div key={product.id} className="bg-gray-50 rounded-lg p-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="font-medium text-gray-900">{formatProductDisplayName(product)}</span>
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
                  <h3 className="text-sm font-bold text-gray-800 mb-3">
                    Customer Contacts ({(selectedCustomerData?.customerContacts ?? []).length})
                  </h3>
                  {(selectedCustomerData?.customerContacts ?? []).length ? (
                    <div className="space-y-2">
                      {(selectedCustomerData?.customerContacts ?? []).map((contact) => (
                        <div key={contact.id} className="bg-gray-50 rounded-lg p-3">
                          <div className="font-medium text-gray-900">{contact.name}</div>
                          {contact.companyName && (
                            <div className="text-sm text-gray-600 mt-1">{contact.companyName}</div>
                          )}
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


                {/* Partners */}
                <div>
                  <h3 className="text-sm font-bold text-gray-800 mb-3">
                    Partners ({(selectedCustomerData?.partners ?? []).length})
                  </h3>
                  {(selectedCustomerData?.partners ?? []).length ? (
                    <div className="space-y-2">
                      {(selectedCustomerData?.partners ?? []).map((partner) => (
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

                {/* Related engagement tasks */}
                <div className="border-t border-gray-200 pt-4">
                  <h3 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
                    <ClipboardList className="h-4 w-4 text-violet-600" aria-hidden />
                    Related tasks ({customerRelatedTasks.length})
                  </h3>
                  {customerRelatedTasks.length === 0 ? (
                    <p className="text-sm text-gray-500">
                      No tasks linked to this account or its opportunities. Assign an account or opportunity on the task
                      form.
                    </p>
                  ) : (
                    <ul className="space-y-2">
                      {customerRelatedTasks.slice(0, 12).map((t) => {
                        const windowLabel = formatTaskPlanningWindow(t);
                        return (
                          <li key={t.id} className="rounded-lg border border-gray-100 bg-gray-50/90 px-3 py-2">
                            <p className="font-medium text-gray-900 text-sm">{t.title}</p>
                            {windowLabel ? (
                              <p className="text-xs text-violet-800 font-semibold mt-0.5">{windowLabel}</p>
                            ) : null}
                            <p className="text-[11px] text-gray-500 capitalize mt-0.5">
                              {String(t.status).replace(/_/g, ' ')} · last action{' '}
                              {safeFormatDate(t.lastActionedAt)}
                            </p>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                  {customerRelatedTasks.length > 12 ? (
                    <p className="text-xs text-gray-400 mt-2">Showing twelve most recently actioned tasks. View Tasks for full board filters.</p>
                  ) : null}
                </div>

                {/* Quick Links */}
                <div>
                  <h3 className="text-sm font-bold text-gray-800 mb-3">Quick Links</h3>
                  <div className="space-y-2">
                    {selectedCustomerData?.sharePointUrl && (
                      <div className="block">
                        <LinkWithCopy
                          url={selectedCustomerData.sharePointUrl}
                          label="SharePoint"
                          linkClassName="text-green-600 hover:text-green-800 text-sm"
                        />
                      </div>
                    )}
                    {selectedCustomerData?.salesforceLink && (
                      <div className="block">
                        <LinkWithCopy
                          url={selectedCustomerData.salesforceLink}
                          label="Salesforce"
                          linkClassName="text-orange-600 hover:text-orange-800 text-sm"
                        />
                      </div>
                    )}
                    {selectedCustomerData?.additionalLink && (
                      <div className="block">
                        <LinkWithCopy
                          url={selectedCustomerData.additionalLink}
                          label="Additional Link"
                          linkClassName="text-purple-600 hover:text-purple-800 text-sm"
                        />
                      </div>
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

              {/* Notes Table */}
              <div className="p-6">
                {customerNotes.length > 0 ? (
                  <div className="overflow-x-auto rounded-lg border border-gray-200">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gradient-to-r from-green-50 to-emerald-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Date</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Author</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Preview</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">SE Confidence</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Profile Fit</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-28">Action</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-100">
                        {customerNotes.map((note) => (
                          <tr key={note.id} className="hover:bg-green-50/30 transition-colors">
                            <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">
                              {safeFormatDate(note.noteDate)}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-900">
                              {note.createdBy}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600 max-w-xs">
                              <p className="line-clamp-2">{note.notes}</p>
                            </td>
                            <td className="px-4 py-3">
                              {note.seConfidence ? (
                                <TypeBadge
                                  label={note.seConfidence}
                                  variant={note.seConfidence === 'Green' ? 'green' : note.seConfidence === 'Yellow' ? 'amber' : 'red'}
                                />
                              ) : (
                                <span className="text-gray-400 text-sm">—</span>
                              )}
                            </td>
                            <td className="px-4 py-3">
                              {selectedCustomerProfile?.seProductFitAssessment ? (
                                <TypeBadge
                                  label={selectedCustomerProfile.seProductFitAssessment}
                                  variant={
                                    selectedCustomerProfile.seProductFitAssessment === 'Green' ? 'green' :
                                    selectedCustomerProfile.seProductFitAssessment === 'Yellow' ? 'amber' : 'red'
                                  }
                                />
                              ) : (
                                <span className="text-gray-400 text-sm">—</span>
                              )}
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => setViewingNote(note)}
                                  className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                  title="View Note"
                                >
                                  <Eye className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => handleEditNote(note)}
                                  className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-medium bg-green-100 text-green-700 hover:bg-green-200 transition-colors"
                                  title="Edit Note"
                                >
                                  <Edit className="h-3.5 w-3.5" />
                                  Edit
                                </button>
                                <button
                                  onClick={() => handleDeleteNote(note.id)}
                                  className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                  title="Delete Note"
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

            {/* Opportunities Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6">
                <OpportunityList
                  opportunities={opportunities}
                  customerId={selectedCustomer}
                  accountExecutiveName={selectedCustomerData?.accountExecutives?.[0]?.name || selectedCustomerData?.accountExecutive?.name}
                  onSelectOpportunity={handleViewOpportunity}
                  onEditOpportunity={handleEditOpportunity}
                  onDeleteOpportunity={handleDeleteOpportunity}
                  onAddOpportunity={() => {
                    setEditingOpportunity(undefined);
                    setShowOpportunityForm(true);
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4 min-w-0">
          {/* View Toggle: List / Calendar */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setListViewMode('list')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                listViewMode === 'list' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <List className="h-4 w-4" />
              Customer List
            </button>
            <button
              onClick={() => setListViewMode('calendar')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                listViewMode === 'calendar' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <CalendarDays className="h-4 w-4" />
              Activity Calendar
            </button>
          </div>

          {listViewMode === 'list' ? (
            <CustomerList
              customers={customers}
              notes={notes}
              selectedCustomer={selectedCustomer}
              onSelectCustomer={onSelectCustomer}
              onEditCustomer={handleEditCustomer}
              onDeleteCustomer={handleDeleteCustomer}
            />
          ) : (
            <ActivityCalendar
              activities={activities}
              onSelectCustomer={(id) => onSelectCustomer(id)}
            />
          )}
        </div>
      )}

      {/* Customer Edit Slide-Out Panel (Nexus-style - keeps list visible) */}
      <CustomerEditSlideOut
        customer={editingCustomer}
        products={products}
        partners={partners}
        martechTools={martechTools}
        internalContacts={internalContacts}
        isOpen={showCustomerForm}
        onClose={() => {
          setShowCustomerForm(false);
          setEditingCustomer(undefined);
        }}
        onSave={handleSaveCustomer}
      />

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

      {/* Opportunity Modals */}
      {showOpportunityForm && selectedCustomer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 overflow-y-auto">
          <div className="min-h-screen flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <OpportunityForm
                opportunity={editingOpportunity}
                customerId={selectedCustomer}
                customerName={selectedCustomerData?.customerName || 'Unknown Customer'}
                currentUser={currentUser}
                onSave={handleSaveOpportunity}
                onCancel={() => {
                  setShowOpportunityForm(false);
                  setEditingOpportunity(undefined);
                }}
              />
            </div>
          </div>
        </div>
      )}

      {viewingOpportunity && (
        <OpportunityDetail
          opportunity={viewingOpportunity}
          onClose={() => setViewingOpportunity(null)}
          onEdit={() => {
            setEditingOpportunity(viewingOpportunity);
            setViewingOpportunity(null);
            setShowOpportunityForm(true);
          }}
          onStageChange={handleOpportunityStageChange}
        />
      )}
    </div>
  );
}