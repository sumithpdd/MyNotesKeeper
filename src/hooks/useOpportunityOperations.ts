import { useCallback, useState } from 'react';
import type { Opportunity, OpportunityStage } from '@/types';
import { hubAuthFetch } from '@/lib/client/hubAuthFetch';

interface UseOpportunityOperationsProps {
  userId?: string;
  userEmail: string;
  getFirebaseIdToken: () => Promise<string | null>;
  reloadWorkspace: () => Promise<void>;
}

export function useOpportunityOperations({
  userId,
  userEmail,
  getFirebaseIdToken,
  reloadWorkspace,
}: UseOpportunityOperationsProps) {
  const [, setOpportunities] = useState<Opportunity[]>([]);

  const saveOpportunity = useCallback(
    async (opportunity: Opportunity) => {
      if (!userId || !userEmail) return;
      const token = await getFirebaseIdToken();
      if (!token) throw new Error('Sign in required');

      if (opportunity.id) {
        const put = await hubAuthFetch('/api/opportunities', token, {
          method: 'PUT',
          body: JSON.stringify({
            opportunity: {
              ...opportunity,
              updatedBy: userEmail,
            },
          }),
        });
        if (!put.ok) throw new Error(await put.text());
      } else {
        const post = await hubAuthFetch('/api/opportunities', token, {
          method: 'POST',
          body: JSON.stringify({
            opportunity: {
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
              crmOpportunityUrl: opportunity.crmOpportunityUrl,
              createdBy: userEmail,
              updatedBy: userEmail,
            },
          }),
        });
        if (!post.ok) throw new Error(await post.text());
      }

      await reloadWorkspace();
    },
    [userId, userEmail, getFirebaseIdToken, reloadWorkspace],
  );

  const deleteOpportunity = useCallback(
    async (opportunityId: string) => {
      const token = await getFirebaseIdToken();
      if (!token) throw new Error('Sign in required');
      const res = await hubAuthFetch(
        `/api/opportunities?id=${encodeURIComponent(opportunityId)}`,
        token,
        { method: 'DELETE' },
      );
      if (!res.ok) throw new Error(await res.text());
      await reloadWorkspace();
    },
    [getFirebaseIdToken, reloadWorkspace],
  );

  const changeStage = useCallback(
    async (opportunityId: string, newStage: OpportunityStage, notes?: string) => {
      if (!userEmail) return;
      const token = await getFirebaseIdToken();
      if (!token) throw new Error('Sign in required');
      const res = await hubAuthFetch('/api/opportunities/stage', token, {
        method: 'POST',
        body: JSON.stringify({
          opportunityId,
          newStage,
          userEmail,
          notes,
        }),
      });
      if (!res.ok) throw new Error(await res.text());
      await reloadWorkspace();
    },
    [userEmail, getFirebaseIdToken, reloadWorkspace],
  );

  const deleteOpportunitiesByCustomer = useCallback(
    async (customerId: string) => {
      const token = await getFirebaseIdToken();
      if (!token) throw new Error('Sign in required');
      const res = await hubAuthFetch(
        `/api/opportunities?customerId=${encodeURIComponent(customerId)}`,
        token,
        { method: 'DELETE' },
      );
      if (!res.ok) throw new Error(await res.text());
      await reloadWorkspace();
    },
    [getFirebaseIdToken, reloadWorkspace],
  );

  return {
    opportunities: [],
    setOpportunities,
    saveOpportunity,
    deleteOpportunity,
    changeStage,
    deleteOpportunitiesByCustomer,
  };
}
