'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Save, X, Sparkles, BookOpen } from 'lucide-react';
import { CustomerProfile, CreateCustomerProfileData } from '@/types';
import { DXP_OBJECTIVES, DXP_USE_CASES } from '../../data/dxpPools';
import { PromptLibrary } from './PromptLibrary';

const customerProfileSchema = z.object({
  customerId: z.string().min(1, 'Customer ID is required'),
  // Business Details
  businessProblem: z.string().min(1, 'Business problem is required'),
  whyUs: z.string().min(1, 'Why us is required'),
  whyNow: z.string().min(1, 'Why now is required'),
  techSelect: z.boolean(),
  // Quick Hit Details
  preDiscovery: z.boolean(),
  discovery: z.string().min(1, 'Discovery status is required'),
  discoveryNotesAttached: z.boolean(),
  totalDemos: z.number().min(0, 'Total demos must be 0 or greater'),
  latestDemoDryRun: z.boolean(),
  latestDemoDate: z.date(),
  techDeepDive: z.string().min(1, 'Tech deep dive status is required'),
  infoSecCompleted: z.boolean(),
  knownTechnicalRisks: z.string(),
  mitigationPlan: z.string(),
  // Solution Engineering
  seNotes: z.string(),
  seInvolvement: z.boolean(),
  seNotesLastUpdated: z.date(),
  seProductFitAssessment: z.enum(['Green', 'Yellow', 'Red', '']),
  seProductNotGreenReason: z.string(),
  seConfidenceNotGreenReason: z.string(),
  // Success Planning
  customerObjective1: z.string(),
  customerObjective2: z.string(),
  customerObjective3: z.string(),
  customerObjectivesDetails: z.string(),
  customerUseCase1: z.string(),
  customerUseCase2: z.string(),
  customerUseCase3: z.string(),
});

type CustomerProfileFormData = z.infer<typeof customerProfileSchema>;

interface CustomerProfileFormProps {
  customerProfile?: CustomerProfile;
  customerName: string;
  onSave: (profile: CustomerProfile) => void;
  onCancel: () => void;
}

export function CustomerProfileForm({ 
  customerProfile, 
  customerName, 
  onSave, 
  onCancel 
}: CustomerProfileFormProps) {
  const [showPromptLibrary, setShowPromptLibrary] = useState(false);
  
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting }
  } = useForm<CustomerProfileFormData>({
    resolver: zodResolver(customerProfileSchema),
    defaultValues: customerProfile ? {
      customerId: customerProfile.customerId,
      businessProblem: customerProfile.businessProblem,
      whyUs: customerProfile.whyUs,
      whyNow: customerProfile.whyNow,
      techSelect: customerProfile.techSelect,
      preDiscovery: customerProfile.preDiscovery,
      discovery: customerProfile.discovery,
      discoveryNotesAttached: customerProfile.discoveryNotesAttached,
      totalDemos: customerProfile.totalDemos,
      latestDemoDryRun: customerProfile.latestDemoDryRun,
      latestDemoDate: customerProfile.latestDemoDate,
      techDeepDive: customerProfile.techDeepDive,
      infoSecCompleted: customerProfile.infoSecCompleted,
      knownTechnicalRisks: customerProfile.knownTechnicalRisks,
      mitigationPlan: customerProfile.mitigationPlan,
      seNotes: customerProfile.seNotes,
      seInvolvement: customerProfile.seInvolvement,
      seNotesLastUpdated: customerProfile.seNotesLastUpdated,
      seProductFitAssessment: customerProfile.seProductFitAssessment,
      seProductNotGreenReason: customerProfile.seProductNotGreenReason || '',
      seConfidenceNotGreenReason: customerProfile.seConfidenceNotGreenReason || '',
      customerObjective1: customerProfile.customerObjective1,
      customerObjective2: customerProfile.customerObjective2,
      customerObjective3: customerProfile.customerObjective3,
      customerObjectivesDetails: customerProfile.customerObjectivesDetails,
      customerUseCase1: customerProfile.customerUseCase1,
      customerUseCase2: customerProfile.customerUseCase2,
      customerUseCase3: customerProfile.customerUseCase3,
    } : {
      customerId: '',
      businessProblem: '',
      whyUs: '',
      whyNow: '',
      techSelect: false,
      preDiscovery: false,
      discovery: '',
      discoveryNotesAttached: false,
      totalDemos: 0,
      latestDemoDryRun: false,
      latestDemoDate: new Date(),
      techDeepDive: '',
      infoSecCompleted: false,
      knownTechnicalRisks: '',
      mitigationPlan: '',
      seNotes: '',
      seInvolvement: false,
      seNotesLastUpdated: new Date(),
      seProductFitAssessment: '',
      seProductNotGreenReason: '',
      seConfidenceNotGreenReason: '',
      customerObjective1: '',
      customerObjective2: '',
      customerObjective3: '',
      customerObjectivesDetails: '',
      customerUseCase1: '',
      customerUseCase2: '',
      customerUseCase3: '',
    }
  });

  const watchedValues = watch();

  const generateSENotesFromFields = () => {
    const formatDate = (date: Date | undefined) => {
      if (!date) return 'Not specified';
      return new Intl.DateTimeFormat('en-US', {
        month: '2-digit',
        day: '2-digit',
        year: '2-digit',
      }).format(date);
    };

    const template = `SFDC SE Notes Template:

Initial Details:
• What business problem are we solving? ${watchedValues.businessProblem || 'Not specified'}
• Why Us? ${watchedValues.whyUs || 'Not specified'}
• Why now? ${watchedValues.whyNow || 'Not specified'}
• Tech select (y/n) ${watchedValues.techSelect ? 'Yes' : 'No'}

Quick Hit Details:
• Pre-discovery (y/n) ${watchedValues.preDiscovery ? 'Yes' : 'No'}
• Discovery (y/n) ${watchedValues.discovery || 'Not specified'}
• Are discovery notes attached (.doc) ${watchedValues.discoveryNotesAttached ? 'Yes' : 'No'}
• Total number of demos to date ${watchedValues.totalDemos || 0}
• Latest demo dry run (y/n) ${watchedValues.latestDemoDryRun ? 'Yes' : 'No'}
• Latest demo date (mm/dd/yy) ${formatDate(watchedValues.latestDemoDate)}
• Tech deep dive (y/n) ${watchedValues.techDeepDive || 'Not specified'}
• InfoSec completed (y/n) ${watchedValues.infoSecCompleted ? 'Yes' : 'No'}
• Known technical risks: ${watchedValues.knownTechnicalRisks || 'None identified'}
• Mitigation plan: ${watchedValues.mitigationPlan || 'To be determined'}${watchedValues.seProductNotGreenReason ? '\n• Reason for SE Product not Green: ' + watchedValues.seProductNotGreenReason : ''}${watchedValues.seConfidenceNotGreenReason ? '\n• Reason for SE Confidence not Green: ' + watchedValues.seConfidenceNotGreenReason : ''}

Activity Details:
• Initials/date/activity description: Generated for ${customerName} on ${new Date().toLocaleDateString()}`;
    
    setValue('seNotes', template);
  };

  const onSubmit = async (data: CustomerProfileFormData) => {
    try {
      const profileData: CreateCustomerProfileData = {
        ...data,
      };

      const savedProfile: CustomerProfile = {
        id: customerProfile?.id || `profile-${Date.now()}`,
        ...profileData,
        createdAt: customerProfile?.createdAt || new Date(),
        updatedAt: new Date(),
      };

      onSave(savedProfile);
    } catch (error) {
      console.error('Error saving customer profile:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {customerProfile ? 'Edit Customer Profile' : 'Create Customer Profile'} - {customerName}
          </h2>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Business Details */}
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Business Details</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  What business problem are we solving?
                </label>
                <textarea
                  {...register('businessProblem')}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                  placeholder="Describe the business problem..."
                />
                {errors.businessProblem && (
                  <p className="text-red-500 text-sm mt-1">{errors.businessProblem.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Why Us?
                </label>
                <textarea
                  {...register('whyUs')}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                  placeholder="Why choose our solution..."
                />
                {errors.whyUs && (
                  <p className="text-red-500 text-sm mt-1">{errors.whyUs.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Why Now?
                </label>
                <textarea
                  {...register('whyNow')}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                  placeholder="Why is timing important..."
                />
                {errors.whyNow && (
                  <p className="text-red-500 text-sm mt-1">{errors.whyNow.message}</p>
                )}
              </div>

              <div className="flex items-center">
                <input
                  {...register('techSelect')}
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-900">
                  Tech Select (y/n)
                </label>
              </div>
            </div>
          </div>

          {/* Quick Hit Details */}
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Hit Details</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center">
                  <input
                    {...register('preDiscovery')}
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-900">
                    Pre-discovery (y/n)
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Discovery (y/n)
                  </label>
                  <select
                    {...register('discovery')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                  >
                    <option value="">Select status...</option>
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                    <option value="In Progress">In Progress</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center">
                <input
                  {...register('discoveryNotesAttached')}
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-900">
                  Are discovery notes attached (.doc)
                </label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Total number of demos to date
                  </label>
                  <input
                    {...register('totalDemos', { valueAsNumber: true })}
                    type="number"
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                  />
                </div>

                <div className="flex items-center">
                  <input
                    {...register('latestDemoDryRun')}
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-900">
                    Latest demo dry run (y/n)
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Latest demo date (mm/dd/yy)
                  </label>
                  <input
                    {...register('latestDemoDate', { valueAsDate: true })}
                    type="date"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tech deep dive (y/n)
                  </label>
                  <select
                    {...register('techDeepDive')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                  >
                    <option value="">Select status...</option>
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                    <option value="Scheduled">Scheduled</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center">
                <input
                  {...register('infoSecCompleted')}
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-900">
                  InfoSec completed (y/n)
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Known technical risks
                </label>
                <textarea
                  {...register('knownTechnicalRisks')}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                  placeholder="List known technical risks..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mitigation plan
                </label>
                <textarea
                  {...register('mitigationPlan')}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                  placeholder="Describe mitigation plan..."
                />
              </div>
            </div>
          </div>

          {/* Solution Engineering */}
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Solution Engineering</h3>
            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  {...register('seInvolvement')}
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-900">
                  SE Involvement
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  SE Notes Last Updated
                </label>
                <input
                  {...register('seNotesLastUpdated', { valueAsDate: true })}
                  type="date"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  SE Product Fit Assessment
                </label>
                <select
                  {...register('seProductFitAssessment')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                >
                  <option value="">Select assessment...</option>
                  <option value="Green">Green</option>
                  <option value="Yellow">Yellow</option>
                  <option value="Red">Red</option>
                </select>
              </div>

              {watchedValues.seProductFitAssessment && watchedValues.seProductFitAssessment !== 'Green' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reason for SE Product not Green <span className="text-gray-500">(if applicable)</span>
                  </label>
                  <textarea
                    {...register('seProductNotGreenReason')}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                    placeholder="Explain why the assessment is not Green..."
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason for SE Confidence not Green <span className="text-gray-500">(if applicable)</span>
                </label>
                <textarea
                  {...register('seConfidenceNotGreenReason')}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                  placeholder="Explain if SE Confidence is not Green..."
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    SE Notes
                  </label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setShowPromptLibrary(!showPromptLibrary)}
                      className="flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-700 rounded-md hover:bg-purple-200 transition-colors text-sm"
                    >
                      <BookOpen className="h-4 w-4" />
                      Prompt Library
                    </button>
                    <button
                      type="button"
                      onClick={generateSENotesFromFields}
                      className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors text-sm"
                    >
                      <Sparkles className="h-4 w-4" />
                      Generate from fields
                    </button>
                  </div>
                </div>
                <textarea
                  {...register('seNotes')}
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                  placeholder="SE Notes will be auto-generated..."
                />
              </div>

              {showPromptLibrary && (
                <div className="mt-4">
                  <PromptLibrary
                    onSelectPrompt={(content) => {
                      setValue('seNotes', content);
                      setShowPromptLibrary(false);
                    }}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Success Planning */}
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Success Planning</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Customer Objective 1
                </label>
                <div className="flex gap-2">
                  <select
                    {...register('customerObjective1')}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                  >
                    <option value="">Select or type custom...</option>
                    {DXP_OBJECTIVES.map((objective) => (
                      <option key={objective} value={objective}>
                        {objective}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => setValue('customerObjective1', DXP_OBJECTIVES[0] || '')}
                    className="px-3 py-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
                    title="Use predefined objective"
                  >
                    <Sparkles className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Customer Objective 2
                </label>
                <div className="flex gap-2">
                  <select
                    {...register('customerObjective2')}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                  >
                    <option value="">Select or type custom...</option>
                    {DXP_OBJECTIVES.map((objective) => (
                      <option key={objective} value={objective}>
                        {objective}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => setValue('customerObjective2', DXP_OBJECTIVES[1] || '')}
                    className="px-3 py-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
                    title="Use predefined objective"
                  >
                    <Sparkles className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Customer Objective 3
                </label>
                <div className="flex gap-2">
                  <select
                    {...register('customerObjective3')}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                  >
                    <option value="">Select or type custom...</option>
                    {DXP_OBJECTIVES.map((objective) => (
                      <option key={objective} value={objective}>
                        {objective}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => setValue('customerObjective3', DXP_OBJECTIVES[2] || '')}
                    className="px-3 py-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
                    title="Use predefined objective"
                  >
                    <Sparkles className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Customer Objectives Details
                </label>
                <textarea
                  {...register('customerObjectivesDetails')}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                  placeholder="Provide details about customer objectives..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Customer Use Case 1
                </label>
                <div className="flex gap-2">
                  <select
                    {...register('customerUseCase1')}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                  >
                    <option value="">Select or type custom...</option>
                    {DXP_USE_CASES.map((useCase) => (
                      <option key={useCase} value={useCase}>
                        {useCase}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => setValue('customerUseCase1', DXP_USE_CASES[0] || '')}
                    className="px-3 py-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
                    title="Use predefined use case"
                  >
                    <Sparkles className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Customer Use Case 2
                </label>
                <div className="flex gap-2">
                  <select
                    {...register('customerUseCase2')}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                  >
                    <option value="">Select or type custom...</option>
                    {DXP_USE_CASES.map((useCase) => (
                      <option key={useCase} value={useCase}>
                        {useCase}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => setValue('customerUseCase2', DXP_USE_CASES[1] || '')}
                    className="px-3 py-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
                    title="Use predefined use case"
                  >
                    <Sparkles className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Customer Use Case 3
                </label>
                <div className="flex gap-2">
                  <select
                    {...register('customerUseCase3')}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                  >
                    <option value="">Select or type custom...</option>
                    {DXP_USE_CASES.map((useCase) => (
                      <option key={useCase} value={useCase}>
                        {useCase}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => setValue('customerUseCase3', DXP_USE_CASES[2] || '')}
                    className="px-3 py-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
                    title="Use predefined use case"
                  >
                    <Sparkles className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              {isSubmitting ? 'Saving...' : 'Save Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
