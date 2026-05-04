'use client';

import { useMemo, useState, useCallback } from 'react';
import { FileText, Users, Settings, Target, LayoutGrid, Sparkles, ChevronRight } from 'lucide-react';
import type { Customer, CustomerProfile, CustomerNote, Product } from '@/types';
import { CustomerEditSlideOut } from '@/components/CustomerEditSlideOut';
import { CustomerManagement } from '@/components/CustomerManagement';
import { EntityManagement } from '@/components/EntityManagement';
import { MigrationOpportunitiesGrid } from '@/components/MigrationOpportunitiesGrid';
import { UserHeader } from '@/components/UserHeader';
import { AIChatPanel } from '@/components/AIChatPanel';
import { FloatingAIButton } from '@/components/FloatingAIButton';
import { TasksManagement } from '@/components/tasks';
import { HomeTabButton, StatCard } from '@/components/home';
import { useAuth } from '@/lib/auth';
import { hubAuthFetch, hubAuthJson } from '@/lib/client/hubAuthFetch';
import { computeEngagementDashboardStats } from '@/domain/engagement-hub';
import {
  useAiPanelEntityActions,
  useCustomerOperations,
  useEngagementDeletionHandlers,
  useFirebaseData,
  useFirestoreSnapshotSync,
  useNoteOperations,
  useOpportunityOperations,
  useTaskOperations,
} from '@/hooks';

const WORKSPACE_PANEL_ID = 'hub-workspace-panel';

const MAIN_TAB_IDS = {
  notes: 'hub-tab-notes',
  entities: 'hub-tab-entities',
  tasks: 'hub-tab-tasks',
  migration: 'hub-tab-migration',
} as const;

/**
 * Engagement hub shell — composes feature areas; domain rules live under `src/domain`, data in hooks + services.
 */
export default function HomePage() {
  const { user, getFirebaseIdToken } = useAuth();

  const [selectedCustomer, setSelectedCustomer] = useState<string | null>(null);
  /** When opening Customer Management from another tab (e.g. Tasks), optionally focus an opportunity detail. */
  const [workspaceFocus, setWorkspaceFocus] = useState<{
    customerId: string;
    opportunityId?: string | null;
  } | null>(null);

  const [editingMigrationCustomer, setEditingMigrationCustomer] = useState<Customer | null>(null);
  const [showCustomerForm, setShowCustomerForm] = useState(false);
  const [activeTab, setActiveTab] = useState<'notes' | 'entities' | 'migration' | 'tasks'>('tasks');
  const [showAIChat, setShowAIChat] = useState(false);

  const openCustomerWorkspace = useCallback((customerId: string, opportunityId?: string | null) => {
    setActiveTab('notes');
    setSelectedCustomer(customerId);
    setWorkspaceFocus({ customerId, opportunityId: opportunityId ?? null });
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const clearWorkspaceFocus = useCallback(() => setWorkspaceFocus(null), []);

  const [customerProfiles, setCustomerProfiles] = useState<CustomerProfile[]>([]);

  const {
    customers,
    notes: firebaseNotes,
    opportunities: firebaseOpportunities,
    customerProfiles: firebaseProfiles,
    products,
    partners,
    martechTools,
    customerContacts,
    internalContacts,
    loading,
    setCustomerContacts,
    setInternalContacts,
    setProducts,
    setPartners,
    setMartechTools,
    tasks,
    taskCategories,
    setTasks,
    reloadWorkspace,
  } = useFirebaseData({
    hubUserId: user?.id,
    getFirebaseIdToken,
  });

  const { notes, setNotes, saveNote, deleteNote } = useNoteOperations({
    userId: user?.id,
    getFirebaseIdToken,
    reloadWorkspace,
  });

  const { setCustomers, saveCustomer, deleteCustomer } = useCustomerOperations({
    userId: user?.id,
    getFirebaseIdToken,
    reloadWorkspace,
  });

  const {
    createTask,
    saveTask,
    deleteTask,
    persistKanbanTasks,
  } = useTaskOperations({
    setTasks,
    userEmail: user?.email ?? 'unknown',
    getFirebaseIdToken,
    reloadWorkspace,
  });

  const {
    opportunities,
    setOpportunities,
    saveOpportunity,
    deleteOpportunity,
    changeStage,
    deleteOpportunitiesByCustomer,
  } = useOpportunityOperations({
    userId: user?.id,
    userEmail: user?.email ?? '',
    getFirebaseIdToken,
    reloadWorkspace,
  });

  useFirestoreSnapshotSync({
    firebaseNotes,
    firebaseCustomers: customers,
    firebaseOpportunities,
    firebaseProfiles: firebaseProfiles ?? [],
    setNotes,
    setCustomers,
    setOpportunities,
    setCustomerProfiles,
  });

  const { handleDeleteCustomerWithCleanup, handleDeleteOpportunityWithTasks } =
    useEngagementDeletionHandlers({
      tasks,
      opportunities,
      setNotes,
      setTasks,
      deleteCustomer,
      deleteOpportunity,
      deleteOpportunitiesByCustomer,
      getFirebaseIdToken,
      reloadWorkspace,
    });

  const aiEntityActions = useAiPanelEntityActions({
    userId: user?.id,
    getFirebaseIdToken,
    reloadWorkspace,
    setCustomerContacts,
    setInternalContacts,
    customerProfiles,
    setCustomerProfiles,
  });

  const handleSaveNoteWithCustomer = async (noteData: CustomerNote) => {
    await saveNote(noteData, selectedCustomer || noteData.customerId || '');
  };

  const stats = useMemo(
    () =>
      computeEngagementDashboardStats({
        customers,
        notes,
        opportunities,
        tasks,
      }),
    [customers, notes, opportunities, tasks],
  );

  const persistHubProduct = useCallback(
    async (args: {
      action: 'create' | 'update' | 'delete';
      product: Product;
    }): Promise<boolean> => {
      const token = await getFirebaseIdToken();
      if (!token) {
        alert('Sign in required');
        return false;
      }
      try {
        if (args.action === 'delete') {
          await hubAuthFetch(
            `/api/entities?id=${encodeURIComponent(args.product.id)}&type=product`,
            token,
            { method: 'DELETE' },
          );
          await reloadWorkspace();
          return true;
        }
        if (args.action === 'create') {
          const { id: _omitId, ...rest } = args.product;
          void _omitId;
          await hubAuthJson<{ success: boolean }>('/api/entities', token, {
            method: 'POST',
            body: JSON.stringify({ entity: rest, type: 'product' }),
          });
          await reloadWorkspace();
          return true;
        }
        await hubAuthJson('/api/entities', token, {
          method: 'PUT',
          body: JSON.stringify({ entity: args.product, type: 'product' }),
        });
        await reloadWorkspace();
        return true;
      } catch (e) {
        console.error(e);
        alert(e instanceof Error ? e.message : 'Could not save product');
        return false;
      }
    },
    [getFirebaseIdToken, reloadWorkspace],
  );

  const activeWorkspaceTabId = MAIN_TAB_IDS[activeTab];

  const greetingLine = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };
  const firstName =
    (user?.name && user.name.trim().split(/\s+/)[0]) || user?.email?.split('@')[0] || 'there';

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <UserHeader />

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center space-x-2">
            <svg
              className="animate-spin h-5 w-5 text-blue-600"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <span className="text-gray-600">Loading your data...</span>
          </div>
        </div>
      ) : (
        <div className="w-full min-w-0 px-4 sm:px-6 lg:px-8 xl:px-10 py-6 lg:py-8">
          <div className="mb-8">
            <div className="flex flex-col gap-5 mb-6">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">{greetingLine()}</p>
              <div>
                <h1 className="text-3xl sm:text-5xl font-extrabold text-gray-950 tracking-tight leading-[1.1] mb-3">
                  {firstName}&apos;s workspace
                </h1>
                <p className="text-base sm:text-lg text-slate-500 font-medium max-w-3xl leading-relaxed">
                  Customer Engagement Hub — start with Tasks for your runway, then drill into accounts, opportunities, and notes.
                  Field help icons explain what each value is for.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 mb-7 lg:mb-8">
              <StatCard icon={LayoutGrid} label="Open tasks" value={stats.openTasks} color="purple" hint="Excludes Done and Cancelled — your weekly cockpit." />
              <StatCard icon={Users} label="Total Customers" value={customers.length} color="blue" />
              <StatCard icon={FileText} label="Total Notes" value={notes.length} color="green" />
              <StatCard icon={Target} label="Opportunities" value={stats.opportunityCount} color="orange" hint="Stages and time-in-stage visible on each deal." />
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowAIChat(true)}
            className="group w-full text-left rounded-[1.35rem] border border-violet-700/65 bg-gradient-to-br from-violet-600 via-[#7c6ae8] to-[#9381ff] text-white hover:brightness-[1.035] hover:shadow-xl hover:shadow-violet-900/55 transition-all duration-200 mb-6 overflow-hidden outline-none focus-visible:ring-4 focus-visible:ring-[#9381FF]/70"
            aria-haspopup="dialog"
          >
            <div className="flex flex-col sm:flex-row sm:items-center gap-5 px-6 py-4 sm:px-7 relative">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-lg shadow-violet-900/50 ring ring-white shrink-0">
                <Sparkles className="h-7 w-7 text-[#9381ff] shrink-0" aria-hidden strokeWidth={1.6} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs uppercase tracking-[0.15em] text-violet-100 font-semibold">Hub assistant</p>
                <p className="font-bold text-lg mt-2 text-white tracking-tight">Ask Hub AI — add notes &amp; update accounts</p>
                <p className="font-medium text-violet-50/95 text-sm mt-1">Shortcuts for summaries, prompts, and customer updates.</p>
              </div>
              <ChevronRight
                className="h-10 w-10 rounded-full shrink-0 mx-auto bg-white/15 backdrop-blur border border-white/40 p-2.5 opacity-95 group-hover:translate-x-0.5 transition-transform"
                aria-hidden
                strokeWidth={1.75}
              />
            </div>
          </button>

          <div className="mb-6 rounded-[1.5rem] hub-glass px-2 py-3 sm:px-4 overflow-hidden">
            <nav aria-label="Hub sections">
              <div role="tablist" className="flex overflow-x-auto gap-1 py-1">
                <HomeTabButton
                  tabId={MAIN_TAB_IDS.tasks}
                  ariaControls={WORKSPACE_PANEL_ID}
                  icon={LayoutGrid}
                  label="Tasks & Kanban"
                  active={activeTab === 'tasks'}
                  onClick={() => setActiveTab('tasks')}
                />
                <HomeTabButton
                  tabId={MAIN_TAB_IDS.notes}
                  ariaControls={WORKSPACE_PANEL_ID}
                  icon={FileText}
                  label="Customer Management"
                  active={activeTab === 'notes'}
                  onClick={() => setActiveTab('notes')}
                />
                <HomeTabButton
                  tabId={MAIN_TAB_IDS.entities}
                  ariaControls={WORKSPACE_PANEL_ID}
                  icon={Settings}
                  label="Entity Management"
                  active={activeTab === 'entities'}
                  onClick={() => setActiveTab('entities')}
                />
                <HomeTabButton
                  tabId={MAIN_TAB_IDS.migration}
                  ariaControls={WORKSPACE_PANEL_ID}
                  icon={Target}
                  label="Migration Opportunities"
                  active={activeTab === 'migration'}
                  onClick={() => setActiveTab('migration')}
                />
              </div>
            </nav>
          </div>

          <section
            id={WORKSPACE_PANEL_ID}
            role="tabpanel"
            aria-labelledby={activeWorkspaceTabId}
            className="min-w-0 focus-visible:outline-none rounded-[1.5rem]"
          >
          {activeTab === 'tasks' ? (
            <TasksManagement
              tasks={tasks}
              taskCategories={taskCategories}
              opportunities={opportunities}
              customers={customers}
              products={products}
              customerContacts={customerContacts}
              internalContacts={internalContacts}
              currentUserEmail={user?.email ?? 'unknown'}
              persistKanbanTasks={persistKanbanTasks}
              createTask={createTask}
              saveTask={saveTask}
              deleteTask={deleteTask}
              onOpenAssistant={() => setShowAIChat(true)}
              getFirebaseIdToken={getFirebaseIdToken}
              reloadWorkspace={reloadWorkspace}
              onOpenCustomerWorkspace={openCustomerWorkspace}
            />
          ) : activeTab === 'notes' ? (
            <CustomerManagement
              customers={customers}
              customerProfiles={customerProfiles}
              notes={notes}
              tasks={tasks}
              opportunities={opportunities}
              products={products}
              partners={partners}
              martechTools={martechTools}
              internalContacts={internalContacts}
              selectedCustomer={selectedCustomer}
              workspaceFocus={workspaceFocus}
              onWorkspaceFocusConsumed={clearWorkspaceFocus}
              currentUser={user?.email || 'Unknown User'}
              onSelectCustomer={setSelectedCustomer}
              onSaveCustomer={saveCustomer}
              onDeleteCustomer={handleDeleteCustomerWithCleanup}
              onSaveCustomerProfile={(profile) => setCustomerProfiles((prev) => [...prev, profile])}
              onUpdateCustomerProfile={(profile) =>
                setCustomerProfiles((prev) => prev.map((p) => (p.id === profile.id ? profile : p)))
              }
              onSaveNote={handleSaveNoteWithCustomer}
              onDeleteNote={deleteNote}
              onSaveOpportunity={saveOpportunity}
              onDeleteOpportunity={handleDeleteOpportunityWithTasks}
              onChangeOpportunityStage={changeStage}
            />
          ) : activeTab === 'migration' ? (
            <MigrationOpportunitiesGrid
              customers={customers}
              onEdit={(customer) => {
                setEditingMigrationCustomer(customer);
                setShowCustomerForm(true);
              }}
              onSelectCustomer={(id) => {
                setActiveTab('notes');
                setSelectedCustomer(id);
              }}
            />
          ) : (
            <EntityManagement
              customerContacts={customerContacts}
              internalContacts={internalContacts}
              products={products}
              partners={partners}
              martechTools={martechTools}
              customers={customers}
              opportunities={opportunities}
              tasks={tasks}
              persistHubProduct={persistHubProduct}
              onUpdateCustomerContacts={setCustomerContacts}
              onUpdateInternalContacts={setInternalContacts}
              onUpdateProducts={setProducts}
              onUpdatePartners={setPartners}
              onUpdateMartechTools={setMartechTools}
            />
          )}
          </section>

          <CustomerEditSlideOut
            customer={editingMigrationCustomer ?? undefined}
            products={products}
            partners={partners}
            martechTools={martechTools}
            internalContacts={internalContacts}
            isOpen={showCustomerForm && !!editingMigrationCustomer}
            onClose={() => {
              setShowCustomerForm(false);
              setEditingMigrationCustomer(null);
            }}
            onSave={(customer) => {
              void saveCustomer(customer);
              setShowCustomerForm(false);
              setEditingMigrationCustomer(null);
            }}
          />

          <AIChatPanel
            isOpen={showAIChat}
            onClose={() => setShowAIChat(false)}
            customers={customers}
            notes={notes}
            customerProfiles={customerProfiles}
            customerContacts={customerContacts}
            internalContacts={internalContacts}
            products={products}
            partners={partners}
            onSaveNote={handleSaveNoteWithCustomer}
            onSaveCustomer={async (c) => {
              await saveCustomer(c);
            }}
            onUpdateCustomer={async (c) => {
              await saveCustomer(c);
            }}
            {...aiEntityActions}
            currentUser={{ id: user?.id || '', name: user?.name || user?.email || 'User' }}
            getFirebaseIdToken={getFirebaseIdToken}
            reloadWorkspace={reloadWorkspace}
          />

          <FloatingAIButton onClick={() => setShowAIChat(!showAIChat)} isOpen={showAIChat} />
        </div>
      )}
    </div>
  );
}
