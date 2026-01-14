'use server';

import { scrapeWebsite, ScrapedData } from './scraper';
import {
  getUpgradeFormat,
  getSecondUpgradeFormat,
  calculatePriceDifference,
  getFormatDetails,
  EMAIL_TEMPLATE,
  FORMAT_CONTENT_RULES,
} from './text-library';
import {
  generateHeadingAndSubheadingBatch,
  generateHeadingWithLLM,
  generateSubheadingWithLLM,
  generateDescriptionWithLLM,
  generateServiceDescriptionsWithLLM,
  generateEmailPitchWithLLM,
  generateIconSuggestionsWithLLM,
  isLLMAvailable,
} from './llm-service';

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
  iconSuggestions: string[]; // LLM-generated icon suggestions
  scrapedData: ScrapedData;
  emailDraft: string;
  emailDraftOrdered: string; // E-post for bestilt versjon (hvis kunden ikke vil ha upgrade)
  emailDraftSecondUpgrade: string;
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

// Email template for ordered version (no upgrade)
const EMAIL_TEMPLATE_ORDERED = `Hei, {KUNDENAVN} 😊

Jeg er designeren på dette prosjektet, og har vært heldig å få designe annonsen du har bestilt.

{PERSONLIG_KOMMENTAR}

Annonsen er nå klar! Den er designet som {BESTILT_FORMAT} ({BESTILT_DIMENSJONER}) som du bestilte.

Annonsen er vedlagt så det er bare å komme tilbake til meg hvis du har noen endringer eller spørsmål :)

Ønsker deg en god dag 😊`;

interface EmailDraftParams {
  contactName: string;
  orderedFormat: string;
  orderedDimensions: string;
  upgradeFormat: string;
  upgradeDimensions: string;
  priceDifference: number;
  personalComment: string;
}

function generateEmailDraftOrdered(params: {
  contactName: string;
  orderedFormat: string;
  orderedDimensions: string;
  personalComment: string;
}): string {
  let email = EMAIL_TEMPLATE_ORDERED
    .replace('{KUNDENAVN}', params.contactName)
    .replace('{PERSONLIG_KOMMENTAR}', params.personalComment)
    .replace('{BESTILT_FORMAT}', params.orderedFormat.toLowerCase())
    .replace('{BESTILT_DIMENSJONER}', params.orderedDimensions);
  
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

export async function generateContent(
  website: string,
  orderedFormat: string,
  contactName?: string,
  previousContent?: { heading?: string; subheading?: string; description?: string }
): Promise<GeneratedContent> {
  console.log('Starting content generation for:', website, orderedFormat);
  
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
  
  // Generate heading and subheading - USE BATCHED LLM (1 API call instead of 2)
  let heading: string;
  let subheading: string;
  
  const companyName = scrapedData.companyName || 'Selskapet';
  
  // Try batched LLM generation first (cost optimization - 1 call instead of 2)
  if (await isLLMAvailable()) {
    console.log('Attempting batched LLM generation for heading + subheading...');
    const batchResult = await generateHeadingAndSubheadingBatch({
      companyName,
      scrapedContent: {
        description: scrapedData.description,
        services: scrapedData.services,
        allPageContent: scrapedData.allPageContent,
        potentialHeadings: scrapedData.potentialHeadings,
        potentialSubheadings: scrapedData.potentialSubheadings,
      },
      previousContent: previousContent ? { 
        heading: previousContent.heading,
        subheading: previousContent.subheading 
      } : undefined,
    }, website);
    
    if (batchResult.heading && batchResult.subheading) {
      heading = batchResult.heading;
      subheading = batchResult.subheading;
      console.log('Using batched LLM-generated heading + subheading');
    } else {
      // Fallback to individual calls or website
      if (scrapedData.potentialHeadings && scrapedData.potentialHeadings.length > 0) {
        heading = scrapedData.potentialHeadings[Math.floor(Math.random() * scrapedData.potentialHeadings.length)];
        console.log('Batched LLM failed, using heading from website:', heading);
      } else {
        heading = `${companyName} – Din pålitelige partner`;
        console.log('Using fallback heading');
      }
      
      if (scrapedData.potentialSubheadings && scrapedData.potentialSubheadings.length > 0) {
        subheading = scrapedData.potentialSubheadings[Math.floor(Math.random() * scrapedData.potentialSubheadings.length)];
        console.log('Batched LLM failed, using subheading from website:', subheading);
      } else {
        subheading = 'Profesjonelle løsninger tilpasset dine behov';
        console.log('Using fallback subheading');
      }
    }
  } else {
    // No LLM available, use website first
    if (scrapedData.potentialHeadings && scrapedData.potentialHeadings.length > 0) {
      heading = scrapedData.potentialHeadings[Math.floor(Math.random() * scrapedData.potentialHeadings.length)];
      console.log('Using heading from website:', heading);
    } else {
      heading = `${companyName} – Din pålitelige partner`;
      console.log('Using fallback heading');
    }
    
    if (scrapedData.potentialSubheadings && scrapedData.potentialSubheadings.length > 0) {
      subheading = scrapedData.potentialSubheadings[Math.floor(Math.random() * scrapedData.potentialSubheadings.length)];
      console.log('Using subheading from website:', subheading);
    } else {
      subheading = 'Profesjonelle løsninger tilpasset dine behov';
      console.log('Using fallback subheading');
    }
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
    
    // Kun bruk fallback hvis vi har INGEN services fra nettsiden
    if (services.length === 0) {
      console.log('No services from website, using fallback');
      services = ['Rådgivning', 'Prosjektering', 'Utførelse', 'Service'].slice(0, serviceCount);
    }
    
    // Enhance services with LLM if available
    if (await isLLMAvailable() && services.length > 0) {
      console.log('Enhancing services with LLM...');
      const enhancedServices = await generateServiceDescriptionsWithLLM({
        companyName,
        scrapedContent: {
          description: scrapedData.description,
          services: scrapedData.services,
          allPageContent: scrapedData.allPageContent,
          potentialHeadings: scrapedData.potentialHeadings,
          potentialSubheadings: scrapedData.potentialSubheadings,
        },
      }, services);
      
      if (enhancedServices.length > 0) {
        services = enhancedServices;
        console.log('Services enhanced with LLM');
      }
    }
  } catch (error) {
    console.error('Error getting services:', error);
    services = ['Rådgivning', 'Prosjektering', 'Utførelse', 'Service'];
  }
  console.log('Final services count:', services.length);
  
  // Generate icon suggestions with LLM (better than text-based)
  let iconSuggestions: string[] = [];
  if (await isLLMAvailable() && services.length > 0) {
    console.log('Generating icon suggestions with LLM...');
    iconSuggestions = await generateIconSuggestionsWithLLM({
      companyName,
      services,
      scrapedContent: {
        description: scrapedData.description,
        allPageContent: scrapedData.allPageContent,
      },
    });
    console.log('Icon suggestions generated:', iconSuggestions.length);
  }
  
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
      personalComment = 'Dere hadde godt materiell på nettsiden! Jeg har laget et fengende annonseforslag basert på det jeg fant.';
    } catch (error) {
      console.error('Error generating personal comment:', error);
      personalComment = 'Dere hadde godt materiell på nettsiden!';
    }
    console.log('Using personal comment from library');
  }
  
  // Generate email drafts - try LLM first for better personalization, fallback to templates
  let emailDraftOrdered: string;
  let emailDraft: string;
  let emailDraftSecondUpgrade: string = '';

  if (await isLLMAvailable()) {
    console.log('Generating emails with LLM for better personalization...');
    
    // Try LLM for ordered version
    const llmEmailOrdered = await generateEmailPitchWithLLM({
      companyName,
      contactName: contactName || 'der',
      orderedFormat: orderedDetails?.label || orderedFormat,
      orderedDimensions: orderedDetails?.dimensions || '',
      scrapedContent: {
        description: scrapedData.description,
        services: scrapedData.services,
        allPageContent: scrapedData.allPageContent,
      },
    });
    emailDraftOrdered = llmEmailOrdered || generateEmailDraftOrdered({
      contactName: contactName || 'der',
      orderedFormat: orderedDetails?.label || orderedFormat,
      orderedDimensions: orderedDetails?.dimensions || '',
      personalComment,
    });

    // Try LLM for upgrade 1
    if (upgradeDetails) {
      const llmEmailUpgrade1 = await generateEmailPitchWithLLM({
        companyName,
        contactName: contactName || 'der',
        orderedFormat: orderedDetails?.label || orderedFormat,
        orderedDimensions: orderedDetails?.dimensions || '',
        upgradeFormat: upgradeDetails.label,
        upgradeDimensions: upgradeDetails.dimensions,
        priceDifference,
        scrapedContent: {
          description: scrapedData.description,
          services: scrapedData.services,
          allPageContent: scrapedData.allPageContent,
        },
      });
      emailDraft = llmEmailUpgrade1 || generateEmailDraft({
        contactName: contactName || 'der',
        orderedFormat: orderedDetails?.label || orderedFormat,
        orderedDimensions: orderedDetails?.dimensions || '',
        upgradeFormat: upgradeDetails.label,
        upgradeDimensions: upgradeDetails.dimensions,
        priceDifference,
        personalComment,
      });
    } else {
      emailDraft = generateEmailDraft({
        contactName: contactName || 'der',
        orderedFormat: orderedDetails?.label || orderedFormat,
        orderedDimensions: orderedDetails?.dimensions || '',
        upgradeFormat: '',
        upgradeDimensions: '',
        priceDifference: 0,
        personalComment,
      });
    }

    // Try LLM for upgrade 2
    if (secondUpgradeDetails) {
      const llmEmailUpgrade2 = await generateEmailPitchWithLLM({
        companyName,
        contactName: contactName || 'der',
        orderedFormat: orderedDetails?.label || orderedFormat,
        orderedDimensions: orderedDetails?.dimensions || '',
        upgradeFormat: secondUpgradeDetails.label,
        upgradeDimensions: secondUpgradeDetails.dimensions,
        priceDifference: priceDifferenceSecond,
        scrapedContent: {
          description: scrapedData.description,
          services: scrapedData.services,
          allPageContent: scrapedData.allPageContent,
        },
      });
      emailDraftSecondUpgrade = llmEmailUpgrade2 || generateEmailDraft({
        contactName: contactName || 'der',
        orderedFormat: orderedDetails?.label || orderedFormat,
        orderedDimensions: orderedDetails?.dimensions || '',
        upgradeFormat: secondUpgradeDetails.label,
        upgradeDimensions: secondUpgradeDetails.dimensions,
        priceDifference: priceDifferenceSecond,
        personalComment,
      });
    }
  } else {
    // Fallback to templates if LLM not available
    emailDraftOrdered = generateEmailDraftOrdered({
      contactName: contactName || 'der',
      orderedFormat: orderedDetails?.label || orderedFormat,
      orderedDimensions: orderedDetails?.dimensions || '',
      personalComment,
    });

    emailDraft = generateEmailDraft({
      contactName: contactName || 'der',
      orderedFormat: orderedDetails?.label || orderedFormat,
      orderedDimensions: orderedDetails?.dimensions || '',
      upgradeFormat: upgradeDetails?.label || '',
      upgradeDimensions: upgradeDetails?.dimensions || '',
      priceDifference,
      personalComment,
    });

    emailDraftSecondUpgrade = secondUpgradeDetails
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
  }

  // Use scraped description - TRY LLM FIRST, then prioritize from website, generate from content if needed
  let description: string;
  
  // Determine max description length based on format (upgrade2 gets more space)
  const maxDescLength = upgrade2Rules?.description ? 300 : upgrade1Rules?.description ? 200 : 150;
  
  // Try LLM first if available (with caching)
  if (await isLLMAvailable()) {
    console.log('Attempting to generate description with LLM...');
    const llmDescription = await generateDescriptionWithLLM(
      {
        companyName,
        scrapedContent: {
          description: scrapedData.description,
          services: scrapedData.services,
          allPageContent: scrapedData.allPageContent,
          potentialHeadings: scrapedData.potentialHeadings,
          potentialSubheadings: scrapedData.potentialSubheadings,
        },
        previousContent: previousContent ? { description: previousContent.description } : undefined,
      },
      maxDescLength,
      website // Pass website for caching
    );
    
    if (llmDescription) {
      description = llmDescription;
      console.log('Using LLM-generated description');
    } else {
      // Fallback to scraped or generated
      if (scrapedData.description) {
        description = scrapedData.description;
        console.log('LLM failed, using description from website');
      } else if (scrapedData.allPageContent && scrapedData.allPageContent.length > 100) {
        const sentences = scrapedData.allPageContent
          .split(/[.!?]/)
          .map(s => s.trim())
          .filter(s => s.length > 30 && s.length < 200)
          .slice(0, 3);
        
        if (sentences.length > 0) {
          description = sentences.join('. ') + '.';
          console.log('LLM failed, generated description from website content');
        } else {
          description = `${scrapedData.companyName || 'Vi'} leverer profesjonelle løsninger med fokus på kvalitet og kundetilfredshet.`;
          console.log('LLM failed, using fallback description');
        }
      } else {
        description = `${scrapedData.companyName || 'Vi'} leverer profesjonelle løsninger med fokus på kvalitet og kundetilfredshet.`;
        console.log('LLM failed, using fallback description');
      }
    }
  } else {
    // No LLM available, use scraped or generated
    if (scrapedData.description) {
      description = scrapedData.description;
      console.log('Using description from website');
    } else if (scrapedData.allPageContent && scrapedData.allPageContent.length > 100) {
      const sentences = scrapedData.allPageContent
        .split(/[.!?]/)
        .map(s => s.trim())
        .filter(s => s.length > 30 && s.length < 200)
        .slice(0, 3);
      
      if (sentences.length > 0) {
        description = sentences.join('. ') + '.';
        console.log('Generated description from website content');
      } else {
        description = `${scrapedData.companyName || 'Vi'} leverer profesjonelle løsninger med fokus på kvalitet og kundetilfredshet.`;
        console.log('Using fallback description');
      }
    } else {
      description = `${scrapedData.companyName || 'Vi'} leverer profesjonelle løsninger med fokus på kvalitet og kundetilfredshet.`;
      console.log('Using fallback description');
    }
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
    iconSuggestions,
    scrapedData,
    emailDraft,
    emailDraftOrdered,
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

// Database functions removed for Vercel compatibility
// All content generation is now stateless
