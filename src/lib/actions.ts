'use server';

import { getPrisma } from './prisma';
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
  emailDraft: string;
  emailDraftSecondUpgrade: string;
  orderedFormat: {
    name: string;
    dimensions: string;
    price: number;
  };
  upgradeFormat: {
    name: string;
    dimensions: string;
    price: number;
  } | null;
  secondUpgradeFormat: {
    name: string;
    dimensions: string;
    price: number;
  } | null;
  priceDifference: number;
  priceDifferenceSecond: number;
  personalComment: string;
}

export async function createProject(data: ProjectFormData) {
  const prisma = await getPrisma();
  const upgradeFormat = getUpgradeFormat(data.orderedFormat);
  
  const project = await prisma.project.create({
    data: {
      projectId: data.projectId,
      companyName: data.companyName,
      website: data.website,
      orderedFormat: data.orderedFormat,
      upgradeFormat: upgradeFormat || data.orderedFormat,
      industry: data.industry,
      contactName: data.contactName,
      contactEmail: data.contactEmail,
      contactPhone: data.contactPhone,
      specialNotes: data.specialNotes,
    },
  });

  return project;
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
    };
  }
  
  // Get upgrade formats (two levels)
  const upgradeFormatKey = getUpgradeFormat(orderedFormat);
  const secondUpgradeFormatKey = getSecondUpgradeFormat(orderedFormat);
  console.log('Upgrade format:', upgradeFormatKey, 'Second upgrade:', secondUpgradeFormatKey);
  
  // Generate heading and subheading with fallbacks
  let heading: string;
  let subheading: string;
  try {
    heading = getRandomHeading(industry);
    subheading = getRandomSubheading(industry);
  } catch (error) {
    console.error('Error generating heading/subheading:', error);
    heading = 'Kvalitet og fagkompetanse';
    subheading = 'Din lokale samarbeidspartner';
  }
  console.log('Generated heading:', heading);
  
  // Get content rules for each level
  const orderedRules = FORMAT_CONTENT_RULES[orderedFormat]?.ordered;
  const upgrade1Rules = FORMAT_CONTENT_RULES[orderedFormat]?.upgrade1;
  const upgrade2Rules = FORMAT_CONTENT_RULES[orderedFormat]?.upgrade2;
  
  // Use upgrade1 rules for service count (or upgrade2 if available and larger)
  const serviceCount = upgrade2Rules?.serviceList || upgrade1Rules?.serviceList || 6;
  
  // Get services - prioritize scraped, fallback to library
  let services: string[] = [];
  try {
    if (scrapedData.services.length >= 3) {
      services = scrapedData.services.slice(0, serviceCount);
    } else {
      services = getRandomServices(industry, serviceCount);
    }
  } catch (error) {
    console.error('Error getting services:', error);
    services = ['Rådgivning', 'Prosjektering', 'Utførelse', 'Service'];
  }
  console.log('Services:', services.length);
  
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
  
  // Generate personal comment
  let personalComment: string;
  try {
    personalComment = getRandomPersonalComment(industry);
  } catch (error) {
    console.error('Error generating personal comment:', error);
    personalComment = 'Dere hadde godt materiell på nettsiden!';
  }
  console.log('Personal comment generated');
  
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

  // Use scraped description or generate one
  const description = scrapedData.description || 
    `${scrapedData.companyName || 'Vi'} er din lokale partner for ${industry.replace(/_/g, ' ')}. Med fokus på kvalitet og kundetilfredshet leverer vi profesjonelle tjenester tilpasset dine behov.`;

  return {
    heading,
    subheading,
    description,
    services,
    phone: scrapedData.phone,
    email: scrapedData.email,
    address: scrapedData.address,
    images: scrapedData.images,
    certifications: scrapedData.certifications,
    scrapedData,
    emailDraft,
    emailDraftSecondUpgrade,
    orderedFormat: {
      name: orderedDetails?.label || orderedFormat,
      dimensions: orderedDetails?.dimensions || '',
      price: orderedDetails?.price || 0,
    },
    upgradeFormat: upgradeDetails ? {
      name: upgradeDetails.label,
      dimensions: upgradeDetails.dimensions,
      price: upgradeDetails.price,
    } : null,
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

export async function saveGeneratedContent(
  projectId: string,
  content: {
    heading: string;
    subheading: string;
    description: string;
    services: string[];
  }
) {
  const prisma = await getPrisma();
  return await prisma.project.update({
    where: { id: projectId },
    data: {
      heading: content.heading,
      subheading: content.subheading,
      description: content.description,
      serviceList: JSON.stringify(content.services),
    },
  });
}

export async function updateProjectStatus(
  projectId: string,
  status: string,
  upgradeConverted?: boolean
) {
  const prisma = await getPrisma();
  return await prisma.project.update({
    where: { id: projectId },
    data: {
      status,
      ...(upgradeConverted !== undefined && { upgradeConverted }),
    },
  });
}

export async function getProjects() {
  const prisma = await getPrisma();
  return await prisma.project.findMany({
    orderBy: { createdAt: 'desc' },
    take: 50,
  });
}

export async function getProjectStats() {
  const prisma = await getPrisma();
  const total = await prisma.project.count();
  const converted = await prisma.project.count({
    where: { upgradeConverted: true },
  });
  const thisMonth = await prisma.project.count({
    where: {
      createdAt: {
        gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
      },
    },
  });
  
  return {
    total,
    converted,
    conversionRate: total > 0 ? Math.round((converted / total) * 100) : 0,
    thisMonth,
  };
}
