'use server';

import OpenAI from 'openai';
import crypto from 'crypto';

// Initialize OpenAI client (will be undefined if API key is not set)
const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })
  : null;

// Simple in-memory cache for LLM responses (cost optimization)
// Key: hash of website URL + content, Value: cached response
const llmCache = new Map<string, { heading?: string; subheading?: string; description?: string; timestamp: number }>();
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

// Generate cache key from website URL and content
function getCacheKey(website: string, content: string): string {
  const hash = crypto.createHash('md5').update(website + content).digest('hex');
  return hash;
}

// Check cache and return if valid
function getCached(key: string, type: 'heading' | 'subheading' | 'description'): string | null {
  const cached = llmCache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached[type] || null;
  }
  return null;
}

// Store in cache
function setCached(key: string, data: { heading?: string; subheading?: string; description?: string }): void {
  llmCache.set(key, { ...data, timestamp: Date.now() });
}

interface LLMContentParams {
  companyName: string;
  scrapedContent: {
    description?: string | null;
    services: string[];
    allPageContent: string;
    potentialHeadings: string[];
    potentialSubheadings: string[];
  };
  previousContent?: {
    heading?: string;
    subheading?: string;
    description?: string;
  };
}

/**
 * Generate a compelling heading for an ad using LLM
 */
export async function generateHeadingWithLLM(params: LLMContentParams, website?: string): Promise<string | null> {
  if (!openai) {
    console.log('OpenAI API key not set, skipping LLM generation');
    return null;
  }

  // Check cache if website provided
  if (website) {
    const cacheKey = getCacheKey(website, params.scrapedContent.allPageContent.substring(0, 500));
    const cached = getCached(cacheKey, 'heading');
    if (cached) {
      console.log('Using cached heading');
      return cached;
    }
  }

  try {
    const businessContext = params.scrapedContent.allPageContent.substring(0, 1200); // Reduced for cost
    const servicesContext = params.scrapedContent.services.length > 0 
      ? `Tjenester: ${params.scrapedContent.services.slice(0, 6).join(', ')}` 
      : '';

    // Optimized prompt - shorter for cost reduction
    const prompt = `Lag fengende overskrift for annonse.

Selskap: ${params.companyName}
${params.scrapedContent.description ? `Beskrivelse: ${params.scrapedContent.description.substring(0, 400)}` : ''}
${servicesContext}
${businessContext ? `Innhold: ${businessContext}` : ''}
${params.previousContent?.heading ? `FORRIGE (ikke bruk): ${params.previousContent.heading}` : ''}

Krav: 8-10 ord, fengende, fokuserer på unik verdi, norsk, ingen emojis.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'Du er ekspert på fengende annonsetekster på norsk. Generer kort, kraftig innhold.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.9,
      max_tokens: 60,
    });

    const heading = completion.choices[0]?.message?.content?.trim();
    if (heading) {
      const cleanHeading = heading.replace(/^["']|["']$/g, '');
      // Cache if website provided
      if (website) {
        const cacheKey = getCacheKey(website, params.scrapedContent.allPageContent.substring(0, 500));
        setCached(cacheKey, { heading: cleanHeading });
      }
      return cleanHeading;
    }
    return null;
  } catch (error) {
    console.error('Error generating heading with LLM:', error);
    return null;
  }
}

/**
 * Generate a compelling subheading for an ad using LLM
 */
export async function generateSubheadingWithLLM(params: LLMContentParams): Promise<string | null> {
  if (!openai) {
    return null;
  }

  try {
    const businessContext = params.scrapedContent.allPageContent.substring(0, 1000);
    const servicesContext = params.scrapedContent.services.length > 0 
      ? `Tjenester: ${params.scrapedContent.services.slice(0, 6).join(', ')}` 
      : '';

    const prompt = `Du er en ekspert på å skrive CATCHY og fengende annonsetekster. Din oppgave er å finne det MEST fengende innholdet og lage en underoverskrift som støtter hovedoverskriften og gjør folk nysgjerrige.

Selskap: ${params.companyName}
${params.scrapedContent.description ? `Hva selskapet beskriver seg selv som: ${params.scrapedContent.description.substring(0, 500)}` : ''}
${servicesContext ? servicesContext : ''}
${businessContext ? `Innhold fra nettsiden: ${businessContext}` : ''}
${params.scrapedContent.potentialSubheadings.length > 0 ? `Eksisterende underoverskrifter: ${params.scrapedContent.potentialSubheadings.slice(0, 5).join(', ')}` : ''}
${params.previousContent?.subheading ? `FORRIGE FORSLAG (ikke bruk dette, lag noe HELT NYTT): ${params.previousContent.subheading}` : ''}

OPPGAVE:
1. Analyser ALL informasjon og finn det MEST fengende aspektet
2. Lag en underoverskrift som utvider på hovedoverskriften med konkrete fordelar
3. Gjør det personlig og relevant - hva får kunden ut av dette?

VIKTIG FOR CATCHY INNHOLD:
- Bruk konkrete fordelar, ikke bare hva de gjør
- Fokuser på resultater og verdi for kunden
- Gjør det relevant og personlig
- Skap interesse med konkrete løfter eller unike egenskaper

Krav:
- 1-2 setninger (maks 20 ord)
- MÅ være fengende og overbevisende
- Utvider på hovedoverskriften med konkrete fordelar
- Fokuserer på hva kunden får ut av det
- Skrevet på norsk
- Ingen emojis
- Profesjonell men fengende tone

Generer KUN underoverskriften, ingen forklaring.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'Du er en ekspert på å skrive CATCHY og fengende annonsetekster på norsk. Du finner alltid det mest fengende aspektet og lager innhold som fanger oppmerksomheten.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.9, // Higher temperature for more creative and varied catchy content
      max_tokens: 90,
    });

    const subheading = completion.choices[0]?.message?.content?.trim();
    if (subheading) {
      return subheading.replace(/^["']|["']$/g, '');
    }
    return null;
  } catch (error) {
    console.error('Error generating subheading with LLM:', error);
    return null;
  }
}

/**
 * Generate an engaging description for an ad using LLM
 */
export async function generateDescriptionWithLLM(
  params: LLMContentParams,
  maxLength: number = 200,
  website?: string
): Promise<string | null> {
  if (!openai) {
    return null;
  }

  // Check cache if website provided
  if (website) {
    const cacheKey = getCacheKey(website, params.scrapedContent.allPageContent.substring(0, 500));
    const cached = getCached(cacheKey, 'description');
    if (cached) {
      console.log('Using cached description');
      return cached;
    }
  }

  try {
    const contentContext = params.scrapedContent.allPageContent.substring(0, 2000); // Reduced for cost
    const servicesContext = params.scrapedContent.services.length > 0 
      ? `Tjenester: ${params.scrapedContent.services.slice(0, 8).join(', ')}` 
      : '';

    // Optimized prompt - shorter for cost reduction
    const prompt = `Lag fengende beskrivelse for annonse.

Selskap: ${params.companyName}
${params.scrapedContent.description ? `Beskrivelse: ${params.scrapedContent.description.substring(0, 400)}` : ''}
${servicesContext}
${contentContext ? `Innhold: ${contentContext}` : ''}
${params.previousContent?.description ? `FORRIGE (ikke bruk): ${params.previousContent.description}` : ''}

Krav: Maks ${maxLength} tegn, start med mest fengende aspekt, fokuser på fordelar, norsk, ingen emojis.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'Du er ekspert på fengende annonsetekster på norsk. Skriver kort, kraftig innhold.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.85,
      max_tokens: Math.floor(maxLength / 2),
    });

    const description = completion.choices[0]?.message?.content?.trim();
    if (description) {
      let finalDescription = description.replace(/^["']|["']$/g, '');
      if (finalDescription.length > maxLength) {
        finalDescription = finalDescription.substring(0, maxLength - 3) + '...';
      }
      // Cache if website provided
      if (website) {
        const cacheKey = getCacheKey(website, params.scrapedContent.allPageContent.substring(0, 500));
        setCached(cacheKey, { description: finalDescription });
      }
      return finalDescription;
    }
    return null;
  } catch (error) {
    console.error('Error generating description with LLM:', error);
    return null;
  }
}

/**
 * Generate enhanced service descriptions using LLM
 */
export async function generateServiceDescriptionsWithLLM(
  params: LLMContentParams,
  services: string[]
): Promise<string[]> {
  if (!openai || services.length === 0) {
    return services; // Return original if no LLM or no services
  }

  try {
    // Generate descriptions for up to 8 services at once to save API calls
    const servicesToEnhance = services.slice(0, 8);
    
    const businessContext = params.scrapedContent.allPageContent.substring(0, 1000);

    const prompt = `Du er en ekspert på å skrive CATCHY og fengende annonsetekster. Din oppgave er å gjøre disse tjenestene så fengende og overbevisende som mulig basert på hva selskapet faktisk gjør.

Selskap: ${params.companyName}
${params.scrapedContent.description ? `Hva selskapet beskriver seg selv som: ${params.scrapedContent.description.substring(0, 300)}` : ''}
${businessContext ? `Innhold fra nettsiden: ${businessContext}` : ''}

Tjenester som skal forbedres (fra nettsiden):
${servicesToEnhance.map((s, i) => `${i + 1}. ${s}`).join('\n')}

OPPGAVE:
1. Analyser hva selskapet faktisk tilbyr basert på informasjonen
2. Gjør hver tjeneste mer CATCHY og fengende
3. Fokuser på fordelar og verdi, ikke bare hva det er
4. Bruk kraftige, konkrete ord som skaper interesse

VIKTIG FOR CATCHY TJENESTER:
- Fokuser på hva kunden FÅR, ikke bare hva det er
- Bruk konkrete fordelar eller resultater
- Gjør det personlig og relevant
- Bruk kraftige ord som skaper interesse

Krav:
- Behold samme antall tjenester
- Gjør hver tjeneste mer fengende og konkret
- Maks 4-6 ord per tjeneste
- Skrevet på norsk
- Profesjonell men fengende tone
- Ingen emojis
- Fokuser på kundens verdi og hva de faktisk får

Returner KUN en nummerert liste med forbedrede tjenester, en per linje, i samme rekkefølge. Ingen forklaring.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'Du er en ekspert på å skrive CATCHY og fengende annonsetekster på norsk. Du finner alltid det mest fengende aspektet og lager innhold som fanger oppmerksomheten.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.85, // Higher temperature for more creative and varied catchy content
      max_tokens: 200,
    });

    const response = completion.choices[0]?.message?.content?.trim();
    if (response) {
      // Parse numbered list
      const lines = response
        .split('\n')
        .map(line => line.replace(/^\d+\.\s*/, '').trim())
        .filter(line => line.length > 0);
      
      if (lines.length === servicesToEnhance.length) {
        // Combine with remaining services if any
        return [...lines, ...services.slice(8)];
      }
    }
    
    // Fallback to original if parsing failed
    return services;
  } catch (error) {
    console.error('Error generating service descriptions with LLM:', error);
    return services; // Return original on error
  }
}

/**
 * Batch generate heading + subheading together (cost optimization - 1 API call instead of 2)
 */
export async function generateHeadingAndSubheadingBatch(
  params: LLMContentParams,
  website: string
): Promise<{ heading: string | null; subheading: string | null }> {
  if (!openai) {
    return { heading: null, subheading: null };
  }

  // Check cache first
  const cacheKey = getCacheKey(website, params.scrapedContent.allPageContent.substring(0, 500));
  const cachedHeading = getCached(cacheKey, 'heading');
  const cachedSubheading = getCached(cacheKey, 'subheading');
  
  if (cachedHeading && cachedSubheading) {
    console.log('Using cached heading and subheading');
    return { heading: cachedHeading, subheading: cachedSubheading };
  }

  try {
    const businessContext = params.scrapedContent.allPageContent.substring(0, 1200); // Reduced for cost
    const servicesContext = params.scrapedContent.services.length > 0 
      ? `Tjenester: ${params.scrapedContent.services.slice(0, 6).join(', ')}` 
      : '';

    const prompt = `Lag en fengende overskrift og underoverskrift for annonse.

Selskap: ${params.companyName}
${params.scrapedContent.description ? `Beskrivelse: ${params.scrapedContent.description.substring(0, 400)}` : ''}
${servicesContext}
${businessContext ? `Innhold: ${businessContext}` : ''}

Krav:
- Overskrift: 8-10 ord, fengende, fokuserer på unik verdi
- Underoverskrift: 1-2 setninger (maks 20 ord), konkrete fordelar
- Norsk, profesjonell men fengende, ingen emojis

Returner format:
OVERSKRIFT: [tekst]
UNDEROVERSKRIFT: [tekst]`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'Du er ekspert på fengende annonsetekster på norsk. Generer kort, kraftig innhold.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.9,
      max_tokens: 150, // Reduced for cost
    });

    const response = completion.choices[0]?.message?.content?.trim();
    if (response) {
      const headingMatch = response.match(/OVERSKRIFT:\s*(.+?)(?:\n|UNDEROVERSKRIFT)/i);
      const subheadingMatch = response.match(/UNDEROVERSKRIFT:\s*(.+?)(?:\n|$)/i);
      
      const heading = headingMatch?.[1]?.trim().replace(/^["']|["']$/g, '') || null;
      const subheading = subheadingMatch?.[1]?.trim().replace(/^["']|["']$/g, '') || null;
      
      if (heading && subheading) {
        // Cache the results
        setCached(cacheKey, { heading, subheading });
        return { heading, subheading };
      }
    }
    
    return { heading: null, subheading: null };
  } catch (error) {
    console.error('Error in batch generation:', error);
    return { heading: null, subheading: null };
  }
}

/**
 * Generate personalized email pitch with LLM (better than templates)
 */
export async function generateEmailPitchWithLLM(params: {
  companyName: string;
  contactName: string;
  orderedFormat: string;
  orderedDimensions: string;
  upgradeFormat?: string;
  upgradeDimensions?: string;
  priceDifference?: number;
  scrapedContent: {
    description?: string | null;
    services: string[];
    allPageContent: string;
  };
}): Promise<string | null> {
  if (!openai) {
    return null;
  }

  try {
    const businessContext = params.scrapedContent.allPageContent.substring(0, 1000);
    const servicesContext = params.scrapedContent.services.length > 0 
      ? `Tjenester: ${params.scrapedContent.services.slice(0, 6).join(', ')}` 
      : '';

    const upgradeText = params.upgradeFormat 
      ? `Jeg har også laget en ${params.upgradeFormat.toLowerCase()} (${params.upgradeDimensions}) i tillegg til ${params.orderedFormat.toLowerCase()} (${params.orderedDimensions}) du bestilte. Annonsen vil bli mer synlig i brosjyren, noe som er bra for deg. 😊

Vil du heller gå for det uforpliktende tilbudet på den store annonsen er prisen kr. ${params.priceDifference?.toLocaleString('nb-NO')} (ekskl.mva) ekstra.`
      : '';

    const prompt = `Skriv en personlig, vennlig e-post til kunde om ferdig annonse.

Kunde: ${params.contactName}
Selskap: ${params.companyName}
${params.scrapedContent.description ? `Beskrivelse: ${params.scrapedContent.description.substring(0, 300)}` : ''}
${servicesContext}
${businessContext ? `Innhold: ${businessContext}` : ''}

Bestilt: ${params.orderedFormat} (${params.orderedDimensions})
${upgradeText ? `\n${upgradeText}` : ''}

Krav:
- Vennlig, personlig tone
- Nevn at du er designeren
- ${upgradeText ? 'Inkluder upgrade-tilbud' : 'Fokuser på at annonsen er klar'}
- Avslutt med "Begge annonsene er vedlagt" hvis upgrade, ellers "Annonsen er vedlagt"
- Norsk, profesjonell men vennlig
- Bruk 😊 emoji passende`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'Du skriver personlige, vennlige e-poster på norsk til kunder.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.8,
      max_tokens: 300,
    });

    const email = completion.choices[0]?.message?.content?.trim();
    return email || null;
  } catch (error) {
    console.error('Error generating email pitch:', error);
    return null;
  }
}

/**
 * Generate icon suggestions with LLM (better than text-based)
 */
export async function generateIconSuggestionsWithLLM(params: {
  companyName: string;
  services: string[];
  scrapedContent: {
    description?: string | null;
    allPageContent: string;
  };
}): Promise<string[]> {
  if (!openai || params.services.length === 0) {
    return [];
  }

  try {
    const businessContext = params.scrapedContent.allPageContent.substring(0, 800);

    const prompt = `Foreslå 5-8 relevante ikoner (som tekst) for annonse basert på selskapets tjenester.

Selskap: ${params.companyName}
Tjenester: ${params.services.slice(0, 8).join(', ')}
${params.scrapedContent.description ? `Beskrivelse: ${params.scrapedContent.description.substring(0, 300)}` : ''}
${businessContext ? `Innhold: ${businessContext}` : ''}

Krav:
- 5-8 ikoner som tekst (f.eks. "bygg", "energi", "service")
- Relevante for tjenestene
- Korte, enkle ord (1-2 ord)
- Norsk
- Returner som komma-separert liste`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'Du foreslår relevante ikoner som tekst for annonser.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 80,
    });

    const response = completion.choices[0]?.message?.content?.trim();
    if (response) {
      return response
        .split(',')
        .map(s => s.trim().toLowerCase())
        .filter(s => s.length > 0)
        .slice(0, 8);
    }
    
    return [];
  } catch (error) {
    console.error('Error generating icon suggestions:', error);
    return [];
  }
}

/**
 * Check if LLM is available (API key is set)
 */
export async function isLLMAvailable(): Promise<boolean> {
  return openai !== null;
}

