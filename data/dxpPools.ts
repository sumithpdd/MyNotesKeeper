// DXP (Digital Experience Platform) Objectives Pool
export const DXP_OBJECTIVES = [
  'Operational Cost Savings',
  'Improved Customer Experience',
  'Digital Transformation',
  'Content Management Efficiency',
  'Personalization Capabilities',
  'Multi-language Support',
  'Integration with Existing Systems',
  'Scalability and Performance',
  'Omnichannel Experience',
  'Marketing Automation',
  'Customer Data Platform (CDP)',
  'Headless Architecture',
  'Mobile-First Approach',
  'E-commerce Integration',
  'Analytics and Reporting',
  'Workflow Automation',
  'Content Personalization',
  'A/B Testing Capabilities',
  'SEO Optimization',
  'Accessibility Compliance',
  'Global Content Management',
  'Brand Consistency',
  'Lead Generation',
  'Customer Retention',
  'Revenue Growth',
  'Time-to-Market Reduction',
  'Developer Experience',
  'API-First Architecture',
  'Cloud Migration',
  'Security Enhancement'
];

// DXP Use Cases Pool
export const DXP_USE_CASES = [
  'Currently on XP, Cloud will give them opportunity to save cost',
  'Need for better content personalization and customer segmentation',
  'Migration from legacy CMS to modern platform',
  'Integration with existing e-commerce platform',
  'Multi-site management for different regions',
  'Advanced analytics and reporting capabilities',
  'Headless implementation for mobile applications',
  'Content workflow automation and approval processes',
  'Real-time personalization based on user behavior',
  'Omnichannel content delivery across web, mobile, and IoT',
  'Customer journey mapping and optimization',
  'Marketing campaign management and automation',
  'Product catalog management and syndication',
  'Multi-brand content management',
  'Localization and translation workflows',
  'Content versioning and rollback capabilities',
  'Integration with CRM and marketing tools',
  'Dynamic content based on user preferences',
  'Content recommendation engine',
  'Social media content management',
  'Email marketing integration',
  'Search and discovery optimization',
  'Content governance and compliance',
  'Digital asset management',
  'Form builder and lead capture',
  'Event management and registration',
  'Knowledge base and documentation',
  'Community and forum management',
  'Subscription and membership management',
  'API-driven content delivery'
];

// Business Problem Templates
export const BUSINESS_PROBLEM_TEMPLATES = [
  'Need for better content personalization and analytics',
  'Legacy system reaching end-of-life',
  'Poor customer experience across channels',
  'Manual content management processes',
  'Lack of marketing automation capabilities',
  'Difficulty managing multiple brands/sites',
  'Limited personalization capabilities',
  'Poor mobile experience',
  'Integration challenges with existing systems',
  'Scalability issues with current platform',
  'High maintenance costs',
  'Limited analytics and reporting',
  'Slow time-to-market for content',
  'Compliance and security concerns',
  'Developer productivity issues'
];

// Why Us Templates
export const WHY_Us_TEMPLATES = [
  'Advanced personalization engine and CDP capabilities',
  'Best-in-class content management with headless options',
  'Comprehensive digital experience platform',
  'Strong integration capabilities with existing systems',
  'Scalable cloud-native architecture',
  'Advanced analytics and customer insights',
  'Omnichannel content delivery',
  'Marketing automation and campaign management',
  'Developer-friendly with modern APIs',
  'Enterprise-grade security and compliance',
  'Global content management capabilities',
  'A/B testing and optimization tools',
  'Customer data platform (CDP) integration',
  'E-commerce and commerce capabilities',
  'Multi-language and localization support'
];

// Why Now Templates
export const WHY_NOW_TEMPLATES = [
  'Competitive pressure and customer experience requirements',
  'Digital transformation initiative',
  'Current system contract expiring',
  'New business requirements',
  'Customer experience expectations increasing',
  'Regulatory compliance requirements',
  'Cost optimization initiative',
  'Technology modernization program',
  'Market expansion needs',
  'Performance and scalability issues',
  'Security and compliance updates needed',
  'Mobile-first strategy implementation',
  'Omnichannel experience requirements',
  'Data-driven decision making initiative',
  'Customer retention and growth goals'
];

// SE Confidence Options
export const SE_CONFIDENCE_OPTIONS = [
  { value: 'Green', label: 'Green', color: 'bg-green-100 text-green-800' },
  { value: 'Yellow', label: 'Yellow', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'Red', label: 'Red', color: 'bg-red-100 text-red-800' },
  { value: '', label: 'Not Set', color: 'bg-gray-100 text-gray-800' }
];

// Product Status Options
export const PRODUCT_STATUS_OPTIONS = [
  { value: 'Active', label: 'Active', color: 'bg-green-100 text-green-800' },
  { value: 'Inactive', label: 'Inactive', color: 'bg-red-100 text-red-800' },
  { value: 'Planned', label: 'Planned', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'Deprecated', label: 'Deprecated', color: 'bg-gray-100 text-gray-800' }
];

// SE Notes Template
export const SE_NOTES_TEMPLATE = `Copy and paste the following information into your SE Notes field. Complete as much information as possible.

Initial Details:
• What business problem are we solving? 
• Why Us?
• Why Now?
• Tech select (y/n)

Quick Hit Details:
• Pre-discovery (y/n)
• Discovery (y/n)  
• Are discovery notes attached (.doc)
• Total number of demos to date
• Latest demo dry run (y/n)
• Latest demo date (mm/dd/yy)
• Tech deep dive (y/n)
• InfoSec completed (y/n)
• Known technical risks
• Mitigation plan
• Reason for SE Product not Green (if applicable)
• Reason for SE Confidence not Green (if applicable)

Activity Details:
• Initials/date/activity description/next steps (if possible)`;