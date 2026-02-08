#!/usr/bin/env node

/**
 * Comprehensive Firebase Seeding Script
 * 
 * This script seeds the Firebase database with all real customer data from CSV files
 */

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc, setDoc, doc } = require('firebase/firestore');

// Firebase configuration - load from environment variables
require('dotenv').config({ path: '.env.local' });

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || '',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '',
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || ''
};

console.log('🔧 Firebase Config Check:');
console.log('API Key:', firebaseConfig.apiKey ? '✅ Present' : '❌ Missing');
console.log('Project ID:', firebaseConfig.projectId ? '✅ Present' : '❌ Missing');

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Real Sitecore products from CSV data
const products = [
  { id: 'product-xp-93', name: 'XP', version: '9.3', description: 'Experience Platform', status: 'Active' },
  { id: 'product-xp-92', name: 'XP', version: '9.2', description: 'Experience Platform', status: 'Active' },
  { id: 'product-xp-901', name: 'XP', version: '9.0.1', description: 'Experience Platform', status: 'Active' },
  { id: 'product-xp-101', name: 'XP', version: '10.1', description: 'Experience Platform', status: 'Active' },
  { id: 'product-xp-102', name: 'XP', version: '10.2', description: 'Experience Platform', status: 'Active' },
  { id: 'product-xp-103', name: 'XP', version: '10.3', description: 'Experience Platform', status: 'Active' },
  { id: 'product-xm', name: 'XM', version: '10.3', description: 'Experience Manager', status: 'Active' },
  { id: 'product-xm-cloud', name: 'XM Cloud', version: 'Latest', description: 'Cloud-native headless CMS', status: 'Active' },
  { id: 'product-ordercloud', name: 'OrderCloud', version: '4.0', description: 'Commerce platform', status: 'Active' },
  { id: 'product-cdp', name: 'CDP', version: 'Latest', description: 'Customer Data Platform', status: 'Active' },
  { id: 'product-personalize', name: 'Personalize', version: 'Latest', description: 'AI-powered personalization', status: 'Active' },
  { id: 'product-search', name: 'Search', version: 'Latest', description: 'Enterprise search platform', status: 'Active' },
  { id: 'product-content-hub', name: 'Content Hub', version: 'Latest', description: 'Headless content management', status: 'Active' },
  { id: 'product-send', name: 'Send', version: 'Latest', description: 'Email marketing platform', status: 'Active' },
  { id: 'product-connect', name: 'Connect', version: 'Latest', description: 'Integration platform', status: 'Active' }
];

// Real internal contacts (Sitecore team)
const internalContacts = [
  { id: 'sc-daniella', name: 'Daniella Militaru', role: 'SE', email: 'daniella.militaru@sitecore.com' },
  { id: 'sc-ibrahim', name: 'Ibrahim Samy', role: 'Account Executive', email: 'ibrahim.samy@sitecore.com' },
  { id: 'sc-steve', name: 'Steve Little', role: 'Director SE UK and I', email: 'steve.little@sitecore.com' },
  { id: 'sc-james', name: 'James Prince', role: 'Account Executive', email: 'james.prince@sitecore.com' },
  { id: 'sc-paul', name: 'Paul Coombs', role: 'Account Executive', email: 'paul.coombs@sitecore.com' },
  { id: 'sc-tim', name: 'Tim Eijpe', role: 'Account Executive - Enterprise', email: 'tim.eijpe@sitecore.com' },
  { id: 'sc-diemen', name: 'Diemen Ysewyn', role: 'Account Executive', email: 'diemen.ysewyn@sitecore.com' }
];

// Real partners from CSV data
const partners = [
  { id: 'partner-coforge', name: 'Coforge', type: 'Technology Services', website: 'https://www.coforge.com' },
  { id: 'partner-hugomrm', name: 'HugoMRM', type: 'Digital Agency', website: 'https://www.hugomrm.com' },
  { id: 'partner-graph', name: 'Graph Digital', type: 'Digital Agency', website: 'https://www.graphdigital.com' },
  { id: 'partner-ratio', name: 'RatioPartners', type: 'Consulting', website: 'https://www.ratiopartners.com' },
  { id: 'partner-adam', name: 'Adam Dennis', type: 'Consultant', website: '' },
  { id: 'partner-dept', name: 'DEPT', type: 'Digital Agency', website: 'https://www.deptagency.com' },
  { id: 'partner-shabbir', name: 'Shabbir Jiwaji', type: 'Consultant', website: '' },
  { id: 'partner-appius', name: 'Appius', type: 'Technology Services', website: 'https://www.appius.com' },
  { id: 'partner-valtech', name: 'Valtech', type: 'Digital Agency', website: 'https://www.valtech.com' },
  { id: 'partner-sagittarius', name: 'Sagittarius', type: 'Digital Agency', website: 'https://www.sagittarius.com' },
  { id: 'partner-igodigital', name: 'iGoDigital', type: 'Digital Agency', website: 'https://www.igodigital.com' },
  { id: 'partner-tec', name: 'TEC Software Solutions', type: 'Technology Services', website: 'https://www.tecsoftware.com' },
  { id: 'partner-ethisys', name: 'Ethisys', type: 'Technology Services', website: 'https://www.ethisys.com' },
  { id: 'partner-vml', name: 'VML', type: 'Marketing Agency', website: 'https://www.vml.com' },
  { id: 'partner-idhl', name: 'IDHL', type: 'Digital Agency', website: 'https://www.idhl.com' },
  { id: 'partner-xcentium', name: 'xCentium', type: 'Technology Services', website: 'https://www.xcentium.com' }
];

// Real customer contacts from CSV data
const customerContacts = [
  { id: 'contact-andrew', name: 'Andrew Davies', email: 'andrew.davies@capco.com', role: 'Project Manager' },
  { id: 'contact-bradley', name: 'Bradley Hemsell', email: 'bradley.hemsell@loma.com', role: 'Technical Lead' },
  { id: 'contact-samantha', name: 'Samantha Neves', email: 'samantha.neves@loma.com', role: 'Project Manager' },
  { id: 'contact-susanne', name: 'Susanne Drechsler', email: 'susanne.drechsler@loma.com', role: 'Product Manager' },
  { id: 'contact-kartika', name: 'Kartika Chandramohan', email: 'kartika@remarkable.com', role: 'Account Manager' },
  { id: 'contact-nick', name: 'Nick Bishenden', email: 'nick.bishenden@jackson.com', role: 'Technical Lead' },
  { id: 'contact-ross', name: 'Ross Breen', email: 'ross.breen@remarkable.com', role: 'Developer' },
  { id: 'contact-lee', name: 'Lee Bejnar', email: 'lee.bejnar@myersbriggs.com', role: 'Project Manager' },
  { id: 'contact-niall', name: 'Niall Berwick', email: 'niall.berwick@rcsi.com', role: 'Technical Lead' },
  { id: 'contact-stuart', name: 'Stuart Heinsworth', email: 'stuart.heinsworth@leicester.ac.uk', role: 'Technical Lead' },
  { id: 'contact-francesca', name: 'Francesca Saamarchi', email: 'francesca.saamarchi@bristan.com', role: 'Product Manager' },
  { id: 'contact-chris', name: 'Chris Low', email: 'chris.low@randa.org', role: 'Project Manager' },
  { id: 'contact-karen', name: 'Karen Lyttle', email: 'karen.lyttle@randa.org', role: 'UX & Design Manager' },
  { id: 'contact-sadeek', name: 'Sadeek Rahman', email: 'sadeek.rahman@macmillan.org.uk', role: 'Sr. Product Manager - Digital services' },
  { id: 'contact-harald', name: 'Harald Greve', email: 'harald.greve@macmillan.org.uk', role: 'Engineering Manager' },
  { id: 'contact-lyndsey', name: 'Lyndsey Miles', email: 'lyndsey.miles@macmillan.org.uk', role: 'Head of Product and Services' },
  { id: 'contact-heather', name: 'Heather Dolan', email: 'heather.dolan@macmillan.org.uk', role: 'Product Manager - Fund Raising' },
  { id: 'contact-dylan', name: 'Dylan Merkett', email: 'dylan.merkett@bupa.com', role: 'Digital Content Performance and Innovation lead' },
  { id: 'contact-gulrez', name: 'Gulrez Shaikh', email: 'gulrez.shaikh@bupa.com', role: 'Platform Owner' },
  { id: 'contact-jas', name: 'Jas Mankoo', email: 'jas.mankoo@bupa.com', role: 'Tech Lead' },
  { id: 'contact-ryan', name: 'Ryan Hargreaves', email: 'ryan.hargreaves@bupa.com', role: 'Tech Lead' },
  { id: 'contact-anuj', name: 'Anuj Batra', email: 'anuj.batra@bupa.com', role: 'Principal Engineer' }
];

// Real customers from CSV data
const customers = [
  {
    id: 'customer-barclays',
    customerName: 'Barclays',
    website: 'https://www.barclays.ae/home/fraud-awareness/',
    sharePointUrl: 'https://company.sharepoint.com/sites/opportunities/barclays',
    salesforceLink: 'https://company.lightning.force.com/lightning/r/Opportunity/1000000000000/view',
    additionalLink: 'https://loop.microsoft.com/loop/workspace/barclays-notes',
    additionalInfo: 'Jus POC - Components and headless approach'
  },
  {
    id: 'customer-marley',
    customerName: 'Marley',
    website: 'https://www.marley.com',
    sharePointUrl: 'https://company.sharepoint.com/sites/opportunities/marley',
    salesforceLink: 'https://company.lightning.force.com/lightning/r/Opportunity/2000000000000/view',
    additionalLink: 'https://loop.microsoft.com/loop/workspace/marley-notes',
    additionalInfo: 'A roofing, cement, solar and concrete company. Bought out by Marshalls who is on Umbraco. Interested in Personalisation, Uses Forms, CRM integration, Lead Gen, Selfservice, Search capability'
  },
  {
    id: 'customer-uk-sports-council',
    customerName: 'Uk Sports Council',
    website: 'https://www.uksport.gov.uk',
    sharePointUrl: 'https://company.sharepoint.com/sites/opportunities/uk-sports-council',
    salesforceLink: 'https://company.lightning.force.com/lightning/r/Opportunity/3000000000000/view',
    additionalLink: 'https://loop.microsoft.com/loop/workspace/uk-sports-council-notes',
    additionalInfo: 'Hosted in house on Azure, built on .net. Transition to Headless CMS approach, Headless CMS should distribute content, XP Demo'
  },
  {
    id: 'customer-capco',
    customerName: 'CAPCO',
    website: 'https://www.capco.com',
    sharePointUrl: 'https://company.sharepoint.com/sites/opportunities/capco',
    salesforceLink: 'https://company.lightning.force.com/lightning/r/Opportunity/4000000000000/view',
    additionalLink: 'https://loop.microsoft.com/loop/workspace/capco-notes',
    additionalInfo: 'Use of personalization, Exploring Search'
  },
  {
    id: 'customer-nhsp',
    customerName: 'NHSP',
    website: 'https://www.nhsprofessionals.nhs.uk',
    sharePointUrl: 'https://company.sharepoint.com/sites/opportunities/nhsp',
    salesforceLink: 'https://company.lightning.force.com/lightning/r/Opportunity/5000000000000/view',
    additionalLink: 'https://loop.microsoft.com/loop/workspace/nhsp-notes',
    additionalInfo: 'Sitecore 10.2 implementation'
  },
  {
    id: 'customer-loma',
    customerName: 'Loma',
    website: 'https://www.loma.com',
    sharePointUrl: 'https://company.sharepoint.com/sites/opportunities/loma',
    salesforceLink: 'https://company.lightning.force.com/lightning/r/Opportunity/6000000000000/view',
    additionalLink: 'https://loop.microsoft.com/loop/workspace/loma-notes',
    additionalInfo: 'Initial engagement'
  },
  {
    id: 'customer-taylor-wimpy',
    customerName: 'Taylor and Wimpy',
    website: 'https://www.taylorwimpey.co.uk',
    sharePointUrl: 'https://company.sharepoint.com/sites/opportunities/taylor-wimpy',
    salesforceLink: 'https://company.lightning.force.com/lightning/r/Opportunity/7000000000000/view',
    additionalLink: 'https://loop.microsoft.com/loop/workspace/taylor-wimpy-notes',
    additionalInfo: 'Sitecore XP 9.2 implementation'
  },
  {
    id: 'customer-jackson-fencing',
    customerName: 'Jackson Fencing',
    website: 'https://www.jacksonfencing.co.uk',
    sharePointUrl: 'https://company.sharepoint.com/sites/opportunities/jackson-fencing',
    salesforceLink: 'https://company.lightning.force.com/lightning/r/Opportunity/8000000000000/view',
    additionalLink: 'https://loop.microsoft.com/loop/workspace/jackson-fencing-notes',
    additionalInfo: 'Discovery call regarding their XP 10.2 setup, exploring UCommerce integration and a possible move to XM Cloud, highlighting a £60k hosting cost saving versus a £60k new XM Cloud licence.'
  },
  {
    id: 'customer-myersbriggs',
    customerName: 'TheMyersBriggs',
    website: 'https://www.myersbriggs.org',
    sharePointUrl: 'https://company.sharepoint.com/sites/opportunities/myersbriggs',
    salesforceLink: 'https://company.lightning.force.com/lightning/r/Opportunity/9000000000000/view',
    additionalLink: 'https://loop.microsoft.com/loop/workspace/myersbriggs-notes',
    additionalInfo: 'Move to next year - no budget'
  },
  {
    id: 'customer-rcsi',
    customerName: 'RCSI',
    website: 'https://www.rcsi.com',
    sharePointUrl: 'https://company.sharepoint.com/sites/opportunities/rcsi',
    salesforceLink: 'https://company.lightning.force.com/lightning/r/Opportunity/10000000000000/view',
    additionalLink: 'https://loop.microsoft.com/loop/workspace/rcsi-notes',
    additionalInfo: 'What is the future for personalisation with regard to EU cookie law and GDPR? Next major version of Sitecore? Confirm this years license cost aligns with what was agreed last year in terms of reduction'
  },
  {
    id: 'customer-university-leicester',
    customerName: 'University of Leicester',
    website: 'https://www.leicester.ac.uk',
    sharePointUrl: 'https://company.sharepoint.com/sites/opportunities/university-leicester',
    salesforceLink: 'https://company.lightning.force.com/lightning/r/Opportunity/11000000000000/view',
    additionalLink: 'https://loop.microsoft.com/loop/workspace/university-leicester-notes',
    additionalInfo: 'Upgrade, stay on XP, Headless. Opps - XMCloud, Search, 360, Connect. XP migration → XMCloud. RFP → TCO'
  },
  {
    id: 'customer-bristan',
    customerName: 'Bristan',
    website: 'https://www.bristan.com',
    sharePointUrl: 'https://company.sharepoint.com/sites/opportunities/bristan',
    salesforceLink: 'https://company.lightning.force.com/lightning/r/Opportunity/12000000000000/view',
    additionalLink: 'https://loop.microsoft.com/loop/workspace/bristan-notes',
    additionalInfo: 'DoubleClick Floodlight, Facebook Pixel, Google Analytics GA4, HotJar, Google Tag Manager, ShareThis'
  },
  {
    id: 'customer-r-a',
    customerName: 'R & A',
    website: 'randa.org',
    sharePointUrl: 'https://company.sharepoint.com/sites/opportunities/r-a',
    salesforceLink: 'https://company.lightning.force.com/lightning/r/Opportunity/13000000000000/view',
    additionalLink: 'https://loop.microsoft.com/loop/workspace/r-a-notes',
    additionalInfo: 'Yes, I think a HL overview would be useful for now, but also a chance for Sumith to ask some questions around usage and plans. DotMailer integration.'
  },
  {
    id: 'customer-macmillan',
    customerName: 'MacMillan',
    website: 'https://www.macmillan.org.uk',
    sharePointUrl: 'https://company.sharepoint.com/sites/opportunities/macmillan',
    salesforceLink: 'https://company.lightning.force.com/lightning/r/Opportunity/14000000000000/view',
    additionalLink: 'https://loop.microsoft.com/loop/workspace/macmillan-notes',
    additionalInfo: 'Initial engagement'
  },
  {
    id: 'customer-bupa',
    customerName: 'BUPA',
    website: 'https://www.bupa.com',
    sharePointUrl: 'https://company.sharepoint.com/sites/opportunities/bupa',
    salesforceLink: 'https://company.lightning.force.com/lightning/r/Opportunity/15000000000000/view',
    additionalLink: 'https://loop.microsoft.com/loop/workspace/bupa-notes',
    additionalInfo: 'Discovery call, with content hub and bupa. Bupa - Content Hub/Stream - Discovery'
  },
  {
    id: 'customer-londons-partners',
    customerName: 'Londons and Partners',
    website: 'https://www.londonandpartners.com',
    sharePointUrl: 'https://company.sharepoint.com/sites/opportunities/londons-partners',
    salesforceLink: 'https://company.lightning.force.com/lightning/r/Opportunity/16000000000000/view',
    additionalLink: 'https://loop.microsoft.com/loop/workspace/londons-partners-notes',
    additionalInfo: 'Initial engagement'
  },
  {
    id: 'customer-asos',
    customerName: 'ASOS',
    website: 'https://www.asos.com',
    sharePointUrl: 'https://company.sharepoint.com/sites/opportunities/asos',
    salesforceLink: 'https://company.lightning.force.com/lightning/r/Opportunity/17000000000000/view',
    additionalLink: 'https://loop.microsoft.com/loop/workspace/asos-notes',
    additionalInfo: 'Initial engagement'
  },
  {
    id: 'customer-dll',
    customerName: 'DLL',
    website: 'https://www.dllgroup.com',
    sharePointUrl: 'https://company.sharepoint.com/sites/opportunities/dll',
    salesforceLink: 'https://company.lightning.force.com/lightning/r/Opportunity/18000000000000/view',
    additionalLink: 'https://loop.microsoft.com/loop/workspace/dll-notes',
    additionalInfo: 'Initial engagement'
  },
  {
    id: 'customer-d-link',
    customerName: 'D-Link',
    website: 'https://www.dlink.com/',
    sharePointUrl: 'https://company.sharepoint.com/sites/opportunities/d-link',
    salesforceLink: 'https://company.lightning.force.com/lightning/r/Opportunity/19000000000000/view',
    additionalLink: 'https://loop.microsoft.com/loop/workspace/d-link-notes',
    additionalInfo: 'XMC Cloud Demo'
  },
  {
    id: 'customer-jre',
    customerName: 'JRE',
    website: 'https://www.jre.com',
    sharePointUrl: 'https://company.sharepoint.com/sites/opportunities/jre',
    salesforceLink: 'https://company.lightning.force.com/lightning/r/Opportunity/20000000000000/view',
    additionalLink: 'https://loop.microsoft.com/loop/workspace/jre-notes',
    additionalInfo: 'JRE Architecture'
  },
  {
    id: 'customer-next',
    customerName: 'Next',
    website: 'https://www.next.co.uk',
    sharePointUrl: 'https://company.sharepoint.com/sites/opportunities/next',
    salesforceLink: 'https://company.lightning.force.com/lightning/r/Opportunity/21000000000000/view',
    additionalLink: 'https://loop.microsoft.com/loop/workspace/next-notes',
    additionalInfo: 'Initial engagement'
  },
  {
    id: 'customer-greene-king',
    customerName: 'Greene King',
    website: 'https://www.greeneking.co.uk',
    sharePointUrl: 'https://company.sharepoint.com/sites/opportunities/greene-king',
    salesforceLink: 'https://company.lightning.force.com/lightning/r/Opportunity/22000000000000/view',
    additionalLink: 'https://loop.microsoft.com/loop/workspace/greene-king-notes',
    additionalInfo: 'Sitecore XP 10.2 implementation'
  },
  {
    id: 'customer-the-fa',
    customerName: 'The FA',
    website: 'https://www.thefa.com',
    sharePointUrl: 'https://company.sharepoint.com/sites/opportunities/the-fa',
    salesforceLink: 'https://company.lightning.force.com/lightning/r/Opportunity/23000000000000/view',
    additionalLink: 'https://loop.microsoft.com/loop/workspace/the-fa-notes',
    additionalInfo: 'New App development'
  },
  {
    id: 'customer-bloor-homes',
    customerName: 'Bloor Homes',
    website: 'https://www.bloorhomes.com',
    sharePointUrl: 'https://company.sharepoint.com/sites/opportunities/bloor-homes',
    salesforceLink: 'https://company.lightning.force.com/lightning/r/Opportunity/24000000000000/view',
    additionalLink: 'https://loop.microsoft.com/loop/workspace/bloor-homes-notes',
    additionalInfo: 'Kentico is 90% preferred due to lower cost (£19,800 pa). Sitecore seen as 3x more expensive. Open to Sitecore if: Stronger commercial offer is made, Clearer long-term value and operational savings are presented. Exploring Cloudinary for DAM, but interested in comparing with Content Hub'
  },
  {
    id: 'customer-fieldfisher',
    customerName: 'FieldFisher',
    website: 'https://www.fieldfisher.com',
    sharePointUrl: 'https://company.sharepoint.com/sites/opportunities/fieldfisher',
    salesforceLink: 'https://company.lightning.force.com/lightning/r/Opportunity/25000000000000/view',
    additionalLink: 'https://loop.microsoft.com/loop/workspace/fieldfisher-notes',
    additionalInfo: 'Salesforce Link: https://sitecore.lightning.force.com/lightning/r/Opportunity/006Uj00000PX1erIAD/view'
  },
  {
    id: 'customer-brother',
    customerName: 'Brother',
    website: 'brother.co.uk',
    sharePointUrl: 'https://company.sharepoint.com/sites/opportunities/brother',
    salesforceLink: 'https://company.lightning.force.com/lightning/r/Opportunity/26000000000000/view',
    additionalLink: 'https://loop.microsoft.com/loop/workspace/brother-notes',
    additionalInfo: 'Sitecore XP 10.1 implementation'
  }
];

// Helper function to add documents to collection
async function addDocumentsToCollection(collectionName, documents) {
  try {
    console.log(`\n📦 Adding ${documents.length} documents to ${collectionName}...`);
    
    for (let i = 0; i < documents.length; i++) {
      const docData = documents[i];
      
      // Clean the document data
      const cleanDocData = {
        ...docData,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      // Use the document's ID if it exists
      if (docData.id) {
        await setDoc(doc(db, collectionName, docData.id), cleanDocData);
        console.log(`   ✅ Added ${docData.name || docData.customerName} (ID: ${docData.id})`);
      } else {
        const docRef = await addDoc(collection(db, collectionName), cleanDocData);
        console.log(`   ✅ Added document with ID: ${docRef.id}`);
      }
      
      // Progress indicator every 5 items
      if ((i + 1) % 5 === 0 || i === documents.length - 1) {
        console.log(`   📊 Progress: ${i + 1}/${documents.length} documents added`);
      }
    }
    
    console.log(`✅ Successfully added ${documents.length} documents to ${collectionName}`);
  } catch (error) {
    console.error(`❌ Error adding documents to ${collectionName}:`, error);
    console.error('Error details:', error.message);
    throw error;
  }
}

// Main seeding function
async function seedDatabase() {
  try {
    console.log('🌱 Starting comprehensive database seeding...');
    
    // 1. Seed Products
    console.log('\n📦 Seeding Products...');
    await addDocumentsToCollection('products', products);
    
    // 2. Seed Internal Contacts
    console.log('\n👥 Seeding Internal Contacts...');
    await addDocumentsToCollection('internalContacts', internalContacts);
    
    // 3. Seed Partners
    console.log('\n🤝 Seeding Partners...');
    await addDocumentsToCollection('partners', partners);
    
    // 4. Seed Customer Contacts
    console.log('\n📞 Seeding Customer Contacts...');
    await addDocumentsToCollection('customerContacts', customerContacts);
    
    // 5. Seed Customers
    console.log('\n🏢 Seeding Customers...');
    await addDocumentsToCollection('customers', customers);
    
    console.log('\n🎉 Comprehensive database seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   Products: ${products.length}`);
    console.log(`   Internal Contacts: ${internalContacts.length}`);
    console.log(`   Partners: ${partners.length}`);
    console.log(`   Customer Contacts: ${customerContacts.length}`);
    console.log(`   Customers: ${customers.length}`);
    console.log('\n🔗 Firebase Console:');
    console.log(`   https://console.firebase.google.com/u/0/project/${firebaseConfig.projectId}/firestore`);
    
  } catch (error) {
    console.error('❌ Database seeding failed:', error);
    throw error;
  }
}

// Main execution
async function main() {
  try {
    await seedDatabase();
    process.exit(0);
  } catch (error) {
    console.error('❌ Script failed:', error);
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = { seedDatabase };
