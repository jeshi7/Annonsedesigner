'use server';

import { scrapeWebsite, ScrapedData } from './scraper';
import {
  getUpgradeFormat,
  getSecondUpgradeFormat,
  getRandomHeading,
  getRandomSubheading,
  getRandomServices,
  getRandomPersonalComment,
  calculatePriceDifference,
  getFormatDetails,
  EMAIL_TEMPLATE,
  EMAIL_TEMPLATE_ORDERED,
  IndustryKey,
  FORMAT_CONTENT_RULES,
} from './text-library';

export interface ProjectFormData {
  projectId: string;
  companyName: string;
  website: string;
  orderedFormat: string;
  industry: string;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  specialNotes?: string;
}

export interface GeneratedContent {
  heading: string;
  subheading: string;
  description: string;
  services: string[];
  phone: string | null;
  email: string | null;
  address: string | null;
  images: string[];
  certifications: string[];
  scrapedData: ScrapedData;
  emailDraftOrdered: string; // E-post for bestilt versjon
  emailDraft: string; // E-post for upgrade 1
  emailDraftSecondUpgrade: string; // E-post for upgrade 2
  orderedFormatKey: string; // Format key (visittkort, banner, etc.)
  orderedFormat: {
    name: string;
    dimensions: string;
    price: number;
  };
  upgradeFormatKey: string | null; // Format key for upgrade 1
  upgradeFormat: {
    name: string;
    dimensions: string;
    price: number;
  } | null;
  secondUpgradeFormatKey: string | null; // Format key for upgrade 2
  secondUpgradeFormat: {
    name: string;
    dimensions: string;
    price: number;
  } | null;
  priceDifference: number;
  priceDifferenceSecond: number;
  personalComment: string;
}

export async function generateContent(
  website: string,
  industry: IndustryKey | string,
  orderedFormat: string,
  contactName?: string
): Promise<GeneratedContent> {
  console.log('Starting content generation for:', website, industry, orderedFormat);
  
  // Scrape website with timeout (max 30 seconds)
  let scrapedData: ScrapedData;
  try {
    const scrapePromise = scrapeWebsite(website, 10); // Reduced to 10 pages for speed
    const timeoutPromise = new Promise<never>((_, reject) => 
      setTimeout(() => reject(new Error('Scraping timeout')), 30000)
    );
    scrapedData = await Promise.race([scrapePromise, timeoutPromise]);
    console.log('Scraping completed. Pages:', scrapedData.pagesScraped);
  } catch (error) {
    console.error('Scraping error:', error);
    // Use empty scraped data on error
    scrapedData = {
      companyName: null,
      description: null,
      services: [],
      phone: null,
      email: null,
      address: null,
      openingHours: null,
      images: [],
      socialMedia: { facebook: null, instagram: null, linkedin: null },
      certifications: [],
      allPageContent: '',
      pagesScraped: 0,
      potentialHeadings: [],
      potentialSubheadings: [],
    };
  }
  
  // Get upgrade formats (two levels)
  const upgradeFormatKey = getUpgradeFormat(orderedFormat);
  const secondUpgradeFormatKey = getSecondUpgradeFormat(orderedFormat);
  console.log('Upgrade format:', upgradeFormatKey, 'Second upgrade:', secondUpgradeFormatKey);
  
  // Generate heading and subheading - PRIORITIZE FROM WEBSITE
  let heading: string;
  let subheading: string;
  
  // Use headings from website first
  if (scrapedData.potentialHeadings && scrapedData.potentialHeadings.length > 0) {
    // Velg en tilfeldig heading fra nettsiden
    heading = scrapedData.potentialHeadings[Math.floor(Math.random() * scrapedData.potentialHeadings.length)];
    console.log('Using heading from website:', heading);
  } else {
    // Fallback til bibliotek
    try {
      heading = getRandomHeading(industry);
    } catch (error) {
      console.error('Error generating heading:', error);
      heading = 'Kvalitet og fagkompetanse';
    }
    console.log('Using heading from library:', heading);
  }
  
  // Use subheadings from website first
  if (scrapedData.potentialSubheadings && scrapedData.potentialSubheadings.length > 0) {
    // Velg en tilfeldig subheading fra nettsiden
    subheading = scrapedData.potentialSubheadings[Math.floor(Math.random() * scrapedData.potentialSubheadings.length)];
    console.log('Using subheading from website:', subheading);
  } else {
    // Fallback til bibliotek
    try {
      subheading = getRandomSubheading(industry);
    } catch (error) {
      console.error('Error generating subheading:', error);
      subheading = 'Din lokale samarbeidspartner';
    }
    console.log('Using subheading from library:', subheading);
  }
  
  // Get content rules for each level
  const orderedRules = FORMAT_CONTENT_RULES[orderedFormat]?.ordered;
  const upgrade1Rules = FORMAT_CONTENT_RULES[orderedFormat]?.upgrade1;
  const upgrade2Rules = FORMAT_CONTENT_RULES[orderedFormat]?.upgrade2;
  
  // Use upgrade1 rules for service count (or upgrade2 if available and larger)
  const serviceCount = upgrade2Rules?.serviceList || upgrade1Rules?.serviceList || 6;
  
  // Get services - ALWAYS prioritize scraped, only use library if absolutely necessary
  let services: string[] = [];
  try {
    if (scrapedData.services.length > 0) {
      // Bruk alle scraped services (opptil serviceCount)
      services = scrapedData.services.slice(0, serviceCount);
      console.log(`Using ${services.length} services from website`);
      
      // Hvis vi trenger flere services og har flere fra nettsiden, ta flere
      if (services.length < serviceCount && scrapedData.services.length > serviceCount) {
        services = scrapedData.services.slice(0, serviceCount);
      }
    }
    
    // Kun bruk bibliotek hvis vi har INGEN services fra nettsiden
    if (services.length === 0) {
      console.log('No services from website, using library');
      services = getRandomServices(industry, serviceCount);
    }
  } catch (error) {
    console.error('Error getting services:', error);
    services = ['Rådgivning', 'Prosjektering', 'Utførelse', 'Service'];
  }
  console.log('Final services count:', services.length);
  
  // Get format details for all three levels
  const orderedDetails = getFormatDetails(orderedFormat);
  const upgradeDetails = upgradeFormatKey ? getFormatDetails(upgradeFormatKey) : null;
  const secondUpgradeDetails = secondUpgradeFormatKey ? getFormatDetails(secondUpgradeFormatKey) : null;
  
  // Calculate price differences
  const priceDifference = upgradeFormatKey 
    ? calculatePriceDifference(orderedFormat, upgradeFormatKey)
    : 0;
  const priceDifferenceSecond = secondUpgradeFormatKey
    ? calculatePriceDifference(orderedFormat, secondUpgradeFormatKey)
    : 0;
  
  // Generate personal comment - basert på hva vi fant på nettsiden
  let personalComment: string;
  const foundItems: string[] = [];
  
  if (scrapedData.pagesScraped > 5) foundItems.push(`${scrapedData.pagesScraped} sider`);
  if (scrapedData.services.length > 5) foundItems.push(`${scrapedData.services.length} tjenester`);
  if (scrapedData.images.length > 3) foundItems.push(`${scrapedData.images.length} bilder`);
  if (scrapedData.certifications.length > 0) foundItems.push(`${scrapedData.certifications.length} sertifiseringer`);
  
  if (foundItems.length > 0) {
    personalComment = `Dere hadde godt materiell på nettsiden! Jeg fant ${foundItems.join(', ')}.`;
    console.log('Generated personal comment from website findings');
  } else {
    try {
      personalComment = getRandomPersonalComment(industry);
    } catch (error) {
      console.error('Error generating personal comment:', error);
      personalComment = 'Dere hadde godt materiell på nettsiden!';
    }
    console.log('Using personal comment from library');
  }
  
  // Generate email draft for ordered version
  const emailDraftOrdered = generateEmailDraftOrdered(
    contactName || 'der',
    orderedDetails?.label || orderedFormat,
    orderedDetails?.dimensions || '',
    personalComment
  );

  // Generate email drafts for both upgrade levels
  const emailDraft = generateEmailDraft({
    contactName: contactName || 'der',
    orderedFormat: orderedDetails?.label || orderedFormat,
    orderedDimensions: orderedDetails?.dimensions || '',
    upgradeFormat: upgradeDetails?.label || '',
    upgradeDimensions: upgradeDetails?.dimensions || '',
    priceDifference,
    personalComment,
  });

  // Generate email draft for second upgrade (if available)
  const emailDraftSecondUpgrade = secondUpgradeDetails
    ? generateEmailDraft({
        contactName: contactName || 'der',
        orderedFormat: orderedDetails?.label || orderedFormat,
        orderedDimensions: orderedDetails?.dimensions || '',
        upgradeFormat: secondUpgradeDetails.label,
        upgradeDimensions: secondUpgradeDetails.dimensions,
        priceDifference: priceDifferenceSecond,
        personalComment,
      })
    : '';

  // Use scraped description - prioritize from website, generate from content if needed
  let description: string;
  if (scrapedData.description) {
    description = scrapedData.description;
    console.log('Using description from website');
  } else if (scrapedData.allPageContent && scrapedData.allPageContent.length > 100) {
    // Generer beskrivelse fra nettsidens innhold
    const sentences = scrapedData.allPageContent
      .split(/[.!?]/)
      .map(s => s.trim())
      .filter(s => s.length > 30 && s.length < 200)
      .slice(0, 3);
    
    if (sentences.length > 0) {
      description = sentences.join('. ') + '.';
      console.log('Generated description from website content');
    } else {
      description = `${scrapedData.companyName || 'Vi'} er din lokale partner for ${industry.replace(/_/g, ' ')}. Med fokus på kvalitet og kundetilfredshet leverer vi profesjonelle tjenester tilpasset dine behov.`;
      console.log('Using fallback description');
    }
  } else {
    description = `${scrapedData.companyName || 'Vi'} er din lokale partner for ${industry.replace(/_/g, ' ')}. Med fokus på kvalitet og kundetilfredshet leverer vi profesjonelle tjenester tilpasset dine behov.`;
    console.log('Using fallback description');
  }

  // Log scraped contact info for debugging
  console.log('Scraped contact info:', {
    phone: scrapedData.phone,
    email: scrapedData.email,
    address: scrapedData.address,
  });

  return {
    heading,
    subheading,
    description,
    services,
    phone: scrapedData.phone || null,
    email: scrapedData.email || null,
    address: scrapedData.address || null,
    images: scrapedData.images,
    certifications: scrapedData.certifications,
    scrapedData,
    emailDraftOrdered,
    emailDraft,
    emailDraftSecondUpgrade,
    orderedFormatKey: orderedFormat,
    orderedFormat: {
      name: orderedDetails?.label || orderedFormat,
      dimensions: orderedDetails?.dimensions || '',
      price: orderedDetails?.price || 0,
    },
    upgradeFormatKey: upgradeFormatKey,
    upgradeFormat: upgradeDetails ? {
      name: upgradeDetails.label,
      dimensions: upgradeDetails.dimensions,
      price: upgradeDetails.price,
    } : null,
    secondUpgradeFormatKey: secondUpgradeFormatKey,
    secondUpgradeFormat: secondUpgradeDetails ? {
      name: secondUpgradeDetails.label,
      dimensions: secondUpgradeDetails.dimensions,
      price: secondUpgradeDetails.price,
    } : null,
    priceDifference,
    priceDifferenceSecond,
    personalComment,
  };
}

interface EmailDraftParams {
  contactName: string;
  orderedFormat: string;
  orderedDimensions: string;
  upgradeFormat: string;
  upgradeDimensions: string;
  priceDifference: number;
  personalComment: string;
}

function generateEmailDraftOrdered(
  contactName: string,
  orderedFormat: string,
  orderedDimensions: string,
  personalComment: string
): string {
  let email = EMAIL_TEMPLATE_ORDERED
    .replace('{KUNDENAVN}', contactName)
    .replace('{PERSONLIG_KOMMENTAR}', personalComment)
    .replace('{BESTILT_FORMAT}', orderedFormat.toLowerCase())
    .replace('{BESTILT_DIMENSJONER}', orderedDimensions);
  
  // Add interactive text if applicable (for formats larger than tredjedel)
  const interaktivTekst = 'På den interaktive annonsen har jeg satt opp noen klikkbare knapper til dine sosiale medier sider.\nHer er link til den interaktive annonsen: [LINK]';
  email = email.replace('{INTERAKTIV_TEKST}', interaktivTekst);
  
  return email;
}

function generateEmailDraft(params: EmailDraftParams): string {
  let email = EMAIL_TEMPLATE
    .replace('{KUNDENAVN}', params.contactName)
    .replace('{PERSONLIG_KOMMENTAR}', params.personalComment)
    .replace('{UPGRADE_FORMAT}', params.upgradeFormat.toLowerCase())
    .replace('{UPGRADE_DIMENSJONER}', params.upgradeDimensions)
    .replace('{BESTILT_FORMAT}', params.orderedFormat.toLowerCase())
    .replace('{BESTILT_DIMENSJONER}', params.orderedDimensions)
    .replace('{PRIS_DIFFERANSE}', params.priceDifference.toLocaleString('nb-NO'));
  
  // Add interactive text if applicable
  const interaktivTekst = 'På den interaktive annonsen har jeg satt opp noen klikkbare knapper til dine sosiale medier sider.\nHer er link til den interaktive annonsen: [LINK]';
  email = email.replace('{INTERAKTIV_TEKST}', interaktivTekst);
  
  return email;
}

// Database functions removed for Vercel compatibility
// All content generation is now stateless
