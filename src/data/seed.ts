import { Product, CustomerContact, InternalContact, Partner } from '@/types';

/**
 * Scrubbed seed data shipped with the app.
 *
 * Used to populate option lists in `CustomerForm`, `OpportunityForm`, and
 * `forms/ProductForm` when the user has no real data yet. Contains only
 * placeholder names, `@example.com` emails, and `www.example.com` URLs —
 * never real customer PII. Real datasets live in the gitignored
 * `data/dummyData.ts` and `data/realCustomerData.ts`.
 */

export const dummyProducts: Product[] = [
  { id: 'product-xp-104', name: 'XP', version: '10.4', description: 'Experience Platform - Complete digital experience platform', status: 'Active' },
  { id: 'product-xp-103', name: 'XP', version: '10.3', description: 'Experience Platform - Complete digital experience platform', status: 'Active' },
  { id: 'product-xp-102', name: 'XP', version: '10.2', description: 'Experience Platform - Complete digital experience platform', status: 'Active' },
  { id: 'product-xp-101', name: 'XP', version: '10.1', description: 'Experience Platform - Complete digital experience platform', status: 'Active' },
  { id: 'product-xp-100', name: 'XP', version: '10.0', description: 'Experience Platform - Complete digital experience platform', status: 'Active' },
  { id: 'product-xp-93', name: 'XP', version: '9.3', description: 'Experience Platform - Complete digital experience platform', status: 'Active' },
  { id: 'product-xp-92', name: 'XP', version: '9.2', description: 'Experience Platform - Complete digital experience platform', status: 'Active' },
  { id: 'product-xp-91', name: 'XP', version: '9.1', description: 'Experience Platform - Complete digital experience platform', status: 'Active' },
  { id: 'product-xp-90', name: 'XP', version: '9.0', description: 'Experience Platform - Complete digital experience platform', status: 'Active' },
  { id: 'product-xp-901', name: 'XP', version: '9.0.1', description: 'Experience Platform - Complete digital experience platform', status: 'Active' },
  { id: 'product-xp-82', name: 'XP', version: '8.2', description: 'Experience Platform - Complete digital experience platform', status: 'Active' },
  { id: 'product-xp-81', name: 'XP', version: '8.1', description: 'Experience Platform - Complete digital experience platform', status: 'Active' },
  { id: 'product-xm', name: 'XM', version: '10.3', description: 'Experience Manager - Comprehensive content management and personalization platform', status: 'Active' },
  { id: 'product-xm-cloud', name: 'XM Cloud', version: 'Latest', description: 'Cloud-native headless CMS with modern architecture', status: 'Active' },
  { id: 'product-ordercloud', name: 'OrderCloud', version: '4.0', description: 'Commerce platform for B2B and B2C commerce solutions', status: 'Active' },
  { id: 'product-cdp', name: 'CDP', version: 'Latest', description: 'Customer Data Platform - Unified customer data management', status: 'Active' },
  { id: 'product-personalize', name: 'Personalize', version: 'Latest', description: 'AI-powered personalization engine for customer experiences', status: 'Active' },
  { id: 'product-search', name: 'Search', version: 'Latest', description: 'Enterprise search and discovery platform', status: 'Active' },
  { id: 'product-content-hub', name: 'Content Hub', version: 'Latest', description: 'Headless content management for omnichannel experiences', status: 'Active' },
  { id: 'product-send', name: 'Send', version: 'Latest', description: 'Email marketing and automation platform', status: 'Active' },
  { id: 'product-connect', name: 'Connect', version: 'Latest', description: 'Integration platform for connecting systems and data', status: 'Active' },
  { id: 'product-sitecore-ai', name: 'Sitecore AI', version: 'Latest', description: 'AI-assisted authoring, discovery, and experience optimization across Sitecore composable solutions', status: 'Active' },
  { id: 'product-sitecore-search', name: 'Sitecore Search', version: 'Latest', description: 'Composable enterprise search and relevance for websites, commerce, and knowledge experiences', status: 'Active' },
  { id: 'product-scrunch', name: 'Scrunch', version: 'Latest', description: 'Composable analytics and audience insights for digital experience optimization', status: 'Active' },
];

export const dummyCustomerContacts: CustomerContact[] = [
  { id: 'contact-1', name: 'Jane Smith', email: 'jane.smith@example.com', role: 'Project Manager' },
  { id: 'contact-2', name: 'Bob Wilson', email: 'bob.wilson@example.com', role: 'Technical Lead' },
  { id: 'contact-3', name: 'Alice Brown', email: 'alice.brown@example.com', role: 'Project Manager' },
  { id: 'contact-4', name: 'Charlie Davis', email: 'charlie.davis@example.com', role: 'Product Manager' },
  { id: 'contact-5', name: 'Dana Lee', email: 'dana.lee@example.com', role: 'Account Manager' },
  { id: 'contact-6', name: 'Evan Taylor', email: 'evan.taylor@example.com', role: 'Technical Lead' },
  { id: 'contact-7', name: 'Fran Garcia', email: 'fran.garcia@example.com', role: 'Developer' },
  { id: 'contact-8', name: 'Grace Kim', email: 'grace.kim@example.com', role: 'Project Manager' },
  { id: 'contact-9', name: 'Henry Moore', email: 'henry.moore@example.com', role: 'Technical Lead' },
  { id: 'contact-10', name: 'Ivy Clark', email: 'ivy.clark@example.com', role: 'Technical Lead' },
  { id: 'contact-11', name: 'Jack White', email: 'jack.white@example.com', role: 'Product Manager' },
  { id: 'contact-12', name: 'Kate Adams', email: 'kate.adams@example.com', role: 'Project Manager' },
  { id: 'contact-13', name: 'Leo Martinez', email: 'leo.martinez@example.com', role: 'UX & Design Manager' },
  { id: 'contact-14', name: 'Mia Johnson', email: 'mia.johnson@example.com', role: 'Product Manager' },
  { id: 'contact-15', name: 'Noah Harris', email: 'noah.harris@example.com', role: 'Engineering Manager' },
  { id: 'contact-16', name: 'Olivia Lewis', email: 'olivia.lewis@example.com', role: 'Head of Product' },
  { id: 'contact-17', name: 'Paul Walker', email: 'paul.walker@example.com', role: 'Product Manager' },
  { id: 'contact-18', name: 'Quinn Hall', email: 'quinn.hall@example.com', role: 'Platform Owner' },
  { id: 'contact-19', name: 'Ryan Young', email: 'ryan.young@example.com', role: 'Tech Lead' },
  { id: 'contact-20', name: 'Sara King', email: 'sara.king@example.com', role: 'Tech Lead' },
  { id: 'contact-21', name: 'Tom Wright', email: 'tom.wright@example.com', role: 'Principal Engineer' },
  { id: 'contact-22', name: 'Uma Scott', email: 'uma.scott@example.com', role: 'CTO' },
  { id: 'contact-23', name: 'Victor Green', email: 'victor.green@example.com', role: 'Marketing Director' },
  { id: 'contact-24', name: 'Wendy Baker', email: 'wendy.baker@example.com', role: 'Developer' },
  { id: 'contact-25', name: 'Xavier Nelson', email: 'xavier.nelson@example.com', role: 'Project Manager' },
  { id: 'contact-26', name: 'Yara Carter', email: 'yara.carter@example.com', role: 'Technical Lead' },
  { id: 'contact-27', name: 'Zach Mitchell', email: 'zach.mitchell@example.com', role: 'Product Manager' },
];

export const dummyInternalContacts: InternalContact[] = [
  { id: 'sc-ae1', name: 'AE One', role: 'SE', email: 'ae1@example.com' },
  { id: 'sc-ae2', name: 'AE Two', role: 'Account Executive', email: 'ae2@example.com' },
  { id: 'sc-ae3', name: 'AE Three', role: 'Director SE', email: 'ae3@example.com' },
  { id: 'sc-ae4', name: 'AE Four', role: 'Account Executive', email: 'ae4@example.com' },
  { id: 'sc-ae5', name: 'AE Five', role: 'Account Executive', email: 'ae5@example.com' },
  { id: 'sc-ae6', name: 'AE Six', role: 'Account Executive - Enterprise', email: 'ae6@example.com' },
  { id: 'sc-ae7', name: 'AE Seven', role: 'Account Executive', email: 'ae7@example.com' },
  { id: 'sc-se1', name: 'SE One', role: 'Solution Engineer', email: 'se1@example.com' },
  { id: 'sc-se2', name: 'SE Two', role: 'Technical Consultant', email: 'se2@example.com' },
  { id: 'sc-csm1', name: 'CSM One', role: 'Customer Success Manager', email: 'csm1@example.com' },
];

export const dummyPartners: Partner[] = [
  { id: 'partner-1', name: 'Partner Alpha', type: 'Technology Services', website: 'https://www.example.com' },
  { id: 'partner-2', name: 'Partner Beta', type: 'Digital Agency', website: 'https://www.example.com' },
  { id: 'partner-3', name: 'Partner Gamma', type: 'Digital Agency', website: 'https://www.example.com' },
  { id: 'partner-4', name: 'Partner Delta', type: 'Consulting', website: 'https://www.example.com' },
  { id: 'partner-5', name: 'Partner Epsilon', type: 'Consultant', website: '' },
  { id: 'partner-6', name: 'Partner Zeta', type: 'Digital Agency', website: 'https://www.example.com' },
  { id: 'partner-7', name: 'Partner Eta', type: 'Consultant', website: '' },
  { id: 'partner-8', name: 'Partner Theta', type: 'Technology Services', website: 'https://www.example.com' },
  { id: 'partner-9', name: 'Partner Iota', type: 'Digital Agency', website: 'https://www.example.com' },
  { id: 'partner-10', name: 'Partner Kappa', type: 'Digital Agency', website: 'https://www.example.com' },
  { id: 'partner-11', name: 'Partner Lambda', type: 'Digital Agency', website: 'https://www.example.com' },
  { id: 'partner-12', name: 'Partner Mu', type: 'Technology Services', website: 'https://www.example.com' },
  { id: 'partner-13', name: 'Partner Nu', type: 'Technology Services', website: 'https://www.example.com' },
  { id: 'partner-14', name: 'Partner Xi', type: 'Marketing Agency', website: 'https://www.example.com' },
  { id: 'partner-15', name: 'Partner Omicron', type: 'Digital Agency', website: 'https://www.example.com' },
  { id: 'partner-16', name: 'Partner Pi', type: 'Technology Services', website: 'https://www.example.com' },
  { id: 'partner-17', name: 'Partner Rho', type: 'Consulting', website: 'https://www.example.com' },
  { id: 'partner-18', name: 'Partner Sigma', type: 'Technology Services', website: 'https://www.example.com' },
  { id: 'partner-19', name: 'Partner Tau', type: 'Consulting', website: 'https://www.example.com' },
  { id: 'partner-20', name: 'Partner Upsilon', type: 'Marketing Agency', website: 'https://www.example.com' },
  { id: 'partner-21', name: 'Partner Phi', type: 'Technology Services', website: 'https://www.example.com' },
];
