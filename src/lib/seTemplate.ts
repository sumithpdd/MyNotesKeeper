import { SE_NOTES_TEMPLATE } from '../../data/dxpPools';

export const generateSENotesFromFields = (fields: {
  businessProblem?: string;
  whyUs?: string;
  whyNow?: string;
  techSelect: boolean;
  preDiscovery: boolean;
  discovery?: string;
  discoveryNotesAttached: boolean;
  totalDemos?: number;
  latestDemoDryRun: boolean;
  latestDemoDate?: Date;
  techDeepDive?: string;
  infoSecCompleted: boolean;
  knownTechnicalRisks?: string;
  mitigationPlan?: string;
  createdBy?: string;
  noteDate?: Date;
  notes?: string;
}): string => {
  const formatDate = (date: Date | undefined) => {
    if (!date) return '';
    return new Intl.DateTimeFormat('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric',
    }).format(date);
  };

  const formatBoolean = (value: boolean) => value ? 'Yes' : 'No';

  return `Initial Details:
• What business problem are we solving? ${fields.businessProblem || 'Not specified'}
• Why Us? ${fields.whyUs || 'Not specified'}
• Why now? ${fields.whyNow || 'Not specified'}
• Tech select (y/n) ${formatBoolean(fields.techSelect)}

Quick Hit Details:
• Pre-discovery (y/n) ${formatBoolean(fields.preDiscovery)}
• Discovery (y/n) ${fields.discovery || 'Not specified'}
• Are discovery notes attached (.doc) ${formatBoolean(fields.discoveryNotesAttached)}
• Total number of demos to date ${fields.totalDemos || 0}
• Latest demo dry run (y/n) ${formatBoolean(fields.latestDemoDryRun)}
• Latest demo date (mm/dd/yy) ${formatDate(fields.latestDemoDate)}
• Tech deep dive (y/n) ${fields.techDeepDive || 'Not specified'}
• InfoSec completed (y/n) ${formatBoolean(fields.infoSecCompleted)}
• Known technical risks: ${fields.knownTechnicalRisks || 'None identified'}
• Mitigation plan: ${fields.mitigationPlan || 'To be determined'}

Activity Details:
• ${fields.createdBy || 'User'} ${formatDate(fields.noteDate)}: ${fields.notes || 'No activity details provided'}`;
};

// Re-export the template from data folder
export { SE_NOTES_TEMPLATE };
