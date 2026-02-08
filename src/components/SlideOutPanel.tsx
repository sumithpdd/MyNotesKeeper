'use client';

import { useEffect } from 'react';
import { X, ExternalLink, Calendar, User, Building, Tag, AlertCircle, Copy, Check } from 'lucide-react';
import { CustomerNote, Customer, CustomerProfile } from '@/types';
import { formatDateTime } from '@/lib/utils';
import { CopyableField } from './ui/CopyableField';

interface SlideOutPanelProps {
  note: CustomerNote | null;
  customer: Customer | null;
  customerProfile?: CustomerProfile | null;
  onClose: () => void;
}

export function SlideOutPanel({ note, customer, customerProfile, onClose }: SlideOutPanelProps) {
  useEffect(() => {
    if (note) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [note]);

  if (!note) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onClose}
      />
      
      {/* Slide-out Panel */}
      <div className="fixed right-0 top-0 h-full w-full max-w-2xl bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out">
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-orange-500 rounded flex items-center justify-center">
                <Building className="h-4 w-4 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Opportunity {customer?.customerName || 'Unknown Customer'}
                </h2>
                <p className="text-sm text-gray-500">Customer Details</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          
          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-6 space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">Note Date</p>
                    <p className="text-sm text-gray-900">{formatDateTime(note.noteDate)}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <User className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">Created By</p>
                    <p className="text-sm text-gray-900">{note.createdBy}</p>
                  </div>
                </div>
              </div>

              {/* Business Details Section */}
              <div className="border border-gray-200 rounded-lg">
                <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">Business Details</h3>
                </div>
                <div className="p-4 space-y-4">
                  <CopyableField
                    label="What business problem are we solving?"
                    value={customerProfile?.businessProblem || 'Not specified'}
                  />
                  <CopyableField
                    label="Why US?"
                    value={customerProfile?.whyUs || 'Not specified'}
                  />
                  <CopyableField
                    label="Why now?"
                    value={customerProfile?.whyNow || 'Not specified'}
                  />
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-700 mb-1">Tech select (y/n)</p>
                      <p className="text-sm text-gray-900">{customerProfile?.techSelect ? 'Yes' : 'No'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Hit Details Section */}
              <div className="border border-gray-200 rounded-lg">
                <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">Quick Hit Details</h3>
                </div>
                <div className="p-4 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-700 mb-1">Pre-discovery (y/n)</p>
                        <p className="text-sm text-gray-900">{customerProfile?.preDiscovery ? 'Yes' : 'No'}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-700 mb-1">Discovery (y/n)</p>
                        <p className="text-sm text-gray-900">{customerProfile?.discovery || 'Not specified'}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-700 mb-1">Are discovery notes attached (.doc)</p>
                      <p className="text-sm text-gray-900">{customerProfile?.discoveryNotesAttached ? 'Yes' : 'No'}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-700 mb-1">Total number of demos to date</p>
                        <p className="text-sm text-gray-900">{customerProfile?.totalDemos || 0}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-700 mb-1">Latest demo dry run (y/n)</p>
                        <p className="text-sm text-gray-900">{customerProfile?.latestDemoDryRun ? 'Yes' : 'No'}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-700 mb-1">Latest demo date (mm/dd/yy)</p>
                        <p className="text-sm text-gray-900">{customerProfile?.latestDemoDate ? formatDateTime(customerProfile.latestDemoDate) : 'Not specified'}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-700 mb-1">Tech deep dive (y/n)</p>
                        <p className="text-sm text-gray-900">{customerProfile?.techDeepDive || 'Not specified'}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-700 mb-1">InfoSec completed (y/n)</p>
                      <p className="text-sm text-gray-900">{customerProfile?.infoSecCompleted ? 'Yes' : 'No'}</p>
                    </div>
                  </div>
                  
                  <CopyableField
                    label="Known technical risks"
                    value={customerProfile?.knownTechnicalRisks || 'Not specified'}
                  />
                  <CopyableField
                    label="Mitigation plan"
                    value={customerProfile?.mitigationPlan || 'Not specified'}
                  />
                </div>
              </div>

              {/* Links */}
              {(customer?.sharePointUrl || customer?.salesforceLink) && (
                <div className="border border-gray-200 rounded-lg">
                  <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900">Links</h3>
                  </div>
                  <div className="p-4 space-y-2">
                    {customer?.sharePointUrl && (
                      <div className="flex items-center gap-2">
                        <ExternalLink className="h-4 w-4 text-blue-500" />
                        <a 
                          href={customer.sharePointUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 text-sm"
                        >
                          SharePoint Link
                        </a>
                      </div>
                    )}
                    {customer?.salesforceLink && (
                      <div className="flex items-center gap-2">
                        <ExternalLink className="h-4 w-4 text-green-500" />
                        <a 
                          href={customer.salesforceLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-green-600 hover:text-green-800 text-sm"
                        >
                          CRM Opportunity Link
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Solution Engineering Section */}
              <div className="border border-gray-200 rounded-lg">
                <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">Solution Engineering</h3>
                </div>
                <div className="p-4 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-1">SE Involvement</p>
                      <p className="text-sm text-gray-900">{customerProfile?.seInvolvement ? 'Yes' : 'No'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-1">SE Notes Last Updated</p>
                      <p className="text-sm text-gray-900">{customerProfile?.seNotesLastUpdated ? formatDateTime(customerProfile.seNotesLastUpdated) : 'Not specified'}</p>
                    </div>
                  </div>
                  
                  {customerProfile?.seNotes && (
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <p className="text-sm font-medium text-gray-700">SE Notes</p>
                        <AlertCircle className="h-4 w-4 text-red-500" />
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-sm text-gray-900 whitespace-pre-wrap">
                          {customerProfile.seNotes}
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-1">SE Product Fit Assessment</p>
                      {customerProfile?.seProductFitAssessment && (
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            customerProfile.seProductFitAssessment === 'Green' ? 'bg-green-100 text-green-800' :
                            customerProfile.seProductFitAssessment === 'Yellow' ? 'bg-yellow-100 text-yellow-800' :
                            customerProfile.seProductFitAssessment === 'Red' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {customerProfile.seProductFitAssessment}
                        </span>
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-1">SE Confidence</p>
                      {note?.seConfidence && (
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            note.seConfidence === 'Green' ? 'bg-green-100 text-green-800' :
                            note.seConfidence === 'Yellow' ? 'bg-yellow-100 text-yellow-800' :
                            note.seConfidence === 'Red' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {note.seConfidence}
                        </span>
                      )}
                    </div>
                  </div>

                  {customerProfile?.seProductNotGreenReason && (
                    <CopyableField
                      label="Reason for SE Product not Green"
                      value={customerProfile.seProductNotGreenReason}
                    />
                  )}

                  {customerProfile?.seConfidenceNotGreenReason && (
                    <CopyableField
                      label="Reason for SE Confidence not Green"
                      value={customerProfile.seConfidenceNotGreenReason}
                    />
                  )}
                </div>
              </div>

              {/* Success Planning Section */}
              <div className="border border-gray-200 rounded-lg">
                <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">Success Planning</h3>
                </div>
                <div className="p-4 space-y-4">
                  {/* Customer Objectives */}
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Customer Objectives</p>
                    <div className="space-y-2">
                      {customerProfile?.customerObjective1 && (
                        <CopyableField
                          label="Customer Objective 1"
                          value={customerProfile.customerObjective1}
                        />
                      )}
                      {customerProfile?.customerObjective2 && (
                        <CopyableField
                          label="Customer Objective 2"
                          value={customerProfile.customerObjective2}
                        />
                      )}
                      {customerProfile?.customerObjective3 && (
                        <CopyableField
                          label="Customer Objective 3"
                          value={customerProfile.customerObjective3}
                        />
                      )}
                    </div>
                    {customerProfile?.customerObjectivesDetails && (
                      <div className="mt-2">
                        <CopyableField
                          label="Customer Objectives Details"
                          value={customerProfile.customerObjectivesDetails}
                        />
                      </div>
                    )}
                  </div>

                  {/* Customer Use Cases */}
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Customer Use Cases</p>
                    <div className="space-y-2">
                      {customerProfile?.customerUseCase1 && (
                        <CopyableField
                          label="Customer Use Case 1"
                          value={customerProfile.customerUseCase1}
                        />
                      )}
                      {customerProfile?.customerUseCase2 && (
                        <CopyableField
                          label="Customer Use Case 2"
                          value={customerProfile.customerUseCase2}
                        />
                      )}
                      {customerProfile?.customerUseCase3 && (
                        <CopyableField
                          label="Customer Use Case 3"
                          value={customerProfile.customerUseCase3}
                        />
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Notes</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-900 whitespace-pre-wrap">
                    {note.notes}
                  </p>
                </div>
              </div>

              {/* Tags */}
              <div className="space-y-4">
                {customer && customer.partners.length > 0 && (
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-3">Partners</h3>
                    <div className="flex flex-wrap gap-2">
                      {customer.partners.map((partner) => (
                        <span
                          key={partner.id}
                          className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                        >
                          <Tag className="h-3 w-3 mr-1" />
                          {partner.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {customer && customer.customerContacts.length > 0 && (
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-3">Customer Contacts</h3>
                    <div className="flex flex-wrap gap-2">
                      {customer.customerContacts.map((contact) => (
                        <span
                          key={contact.id}
                          className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800"
                        >
                          <User className="h-3 w-3 mr-1" />
                          {contact.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}


                {customer && customer.products.length > 0 && (
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-3">Products</h3>
                    <div className="flex flex-wrap gap-2">
                      {customer.products.map((product) => (
                        <span
                          key={product.id}
                          className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-orange-100 text-orange-800"
                        >
                          <Tag className="h-3 w-3 mr-1" />
                          {product.name}{product.version ? ` v${product.version}` : ''}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Footer */}
          <div className="p-6 border-t border-gray-200 bg-gray-50">
            <div className="flex justify-between items-center text-sm text-gray-500">
              <span>Created: {formatDateTime(note.createdAt)}</span>
              <span>Updated: {formatDateTime(note.updatedAt)} by {note.updatedBy}</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
