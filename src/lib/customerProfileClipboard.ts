import type { CustomerProfile } from '@/types';
import { seRagLabel } from '@/domain/engagement-hub/seAssessment';
import { formatCustomerObjectivesBlock } from '@/domain/engagement-hub/customerObjectives';

/** Plain-text export of profile fields for clipboard / AI context. */
export function formatCustomerProfileForClipboard(profile: CustomerProfile): string {
  const lines: string[] = [];

  const add = (heading: string, body: string | undefined) => {
    const t = body?.trim();
    if (!t) return;
    lines.push(`${heading}\n${t}`);
  };

  add('Business Problem', profile.businessProblem);
  add('Why Us', profile.whyUs);
  add('Why Now', profile.whyNow);
  lines.push(`Tech Select: ${profile.techSelect ? 'Yes' : 'No'}`);
  if (profile.discovery?.trim()) lines.push(`Discovery: ${profile.discovery.trim()}`);

  const seFit = seRagLabel(profile.seProductFitAssessment);
  if (seFit !== '—') lines.push(`SE Product Fit: ${seFit}`);
  if (profile.seConfidence) lines.push(`SE Confidence: ${seRagLabel(profile.seConfidence)}`);

  const seInv = [profile.seInvolvement, profile.seInvolvementDetail].filter(Boolean).join(': ');
  add('SE involvement', seInv || undefined);
  add('SE Notes', profile.seNotes);

  add('Services involvement', profile.servicesInvolvement);
  if (profile.servicesFitAssessment) {
    lines.push(`Services Fit: ${seRagLabel(profile.servicesFitAssessment)}`);
  }
  if (profile.servicesConfidence) {
    lines.push(`Services Confidence: ${seRagLabel(profile.servicesConfidence)}`);
  }
  add('Services notes', profile.servicesNotes);

  const objectivesBlock = formatCustomerObjectivesBlock(profile);
  if (objectivesBlock.trim()) {
    lines.push('Customer Objectives', objectivesBlock);
  }

  return lines.join('\n\n');
}
