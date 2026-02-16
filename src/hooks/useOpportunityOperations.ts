import { useState, useCallback } from 'react';
import { Opportunity, OpportunityStage } from '@/types';
import { opportunityService } from '@/lib/opportunityService';

interface UseOpportunityOperationsProps {
  userId?: string;
  userEmail?: string;
  onOpportunitiesChange?: (opportunities: Opportunity[]) => void;
}

/**
 * Custom hook to manage opportunity CRUD operations
 * Provides create, update, delete, and stage change functionality
 */
export function useOpportunityOperations({ 
  userId, 
  userEmail,
  onOpportunitiesChange 
}: UseOpportunityOperationsProps) {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);

  const updateOpportunities = useCallback((newOpportunities: Opportunity[]) => {
    setOpportunities(newOpportunities);
    onOpportunitiesChange?.(newOpportunities);
  }, [onOpportunitiesChange]);

  const saveOpportunity = useCallback(async (opportunity: Opportunity) => {
    if (!userId || !userEmail) return;
    
    try {
      const existingOpportunity = opportunities.find(o => o.id === opportunity.id);
      
      if (existingOpportunity) {
        // Update existing
        await opportunityService.updateOpportunity(opportunity);
        updateOpportunities(opportunities.map(o => o.id === opportunity.id ? opportunity : o));
      } else {
        // Create new
        const newOpportunity = await opportunityService.createOpportunity({
          customerId: opportunity.customerId,
          opportunityName: opportunity.opportunityName,
          description: opportunity.description,
          currentStage: opportunity.currentStage,
          estimatedValue: opportunity.estimatedValue,
          currency: opportunity.currency,
          probability: opportunity.probability,
          expectedCloseDate: opportunity.expectedCloseDate,
          products: opportunity.products,
          owner: opportunity.owner,
          priority: opportunity.priority,
          type: opportunity.type,
          competitorInfo: opportunity.competitorInfo,
          nextSteps: opportunity.nextSteps,
          createdBy: userEmail,
          updatedBy: userEmail,
        });
        updateOpportunities([...opportunities, newOpportunity]);
      }
    } catch (error) {
      console.error('Error saving opportunity:', error);
      throw error;
    }
  }, [userId, userEmail, opportunities, updateOpportunities]);

  const deleteOpportunity = useCallback(async (opportunityId: string) => {
    try {
      await opportunityService.deleteOpportunity(opportunityId);
      updateOpportunities(opportunities.filter(o => o.id !== opportunityId));
    } catch (error) {
      console.error('Error deleting opportunity:', error);
      throw error;
    }
  }, [opportunities, updateOpportunities]);

  const changeStage = useCallback(async (
    opportunityId: string, 
    newStage: OpportunityStage, 
    notes?: string
  ) => {
    if (!userEmail) return;
    
    try {
      const opportunity = opportunities.find(o => o.id === opportunityId);
      if (!opportunity) return;

      await opportunityService.changeStage(opportunity, newStage, userEmail, notes);
      
      // Reload opportunities to get updated stage history
      const updatedOpportunities = await opportunityService.getAllOpportunities();
      updateOpportunities(updatedOpportunities);
    } catch (error) {
      console.error('Error changing opportunity stage:', error);
      throw error;
    }
  }, [userEmail, opportunities, updateOpportunities]);

  const deleteOpportunitiesByCustomer = useCallback(async (customerId: string) => {
    try {
      await opportunityService.deleteOpportunitiesByCustomer(customerId);
      updateOpportunities(opportunities.filter(o => o.customerId !== customerId));
    } catch (error) {
      console.error('Error deleting customer opportunities:', error);
      throw error;
    }
  }, [opportunities, updateOpportunities]);

  return {
    opportunities,
    setOpportunities: updateOpportunities,
    saveOpportunity,
    deleteOpportunity,
    changeStage,
    deleteOpportunitiesByCustomer
  };
}
