'use server';

import OpenAI from 'openai';

// Initialize OpenAI client (will be undefined if API key is not set)
const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })
  : null;

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
export async function generateHeadingWithLLM(params: LLMContentParams): Promise<string | null> {
  if (!openai) {
    console.log('OpenAI API key not set, skipping LLM generation');
    return null;
  }

  try {
    const businessContext = params.scrapedContent.allPageContent.substring(0, 1500);
    const servicesContext = params.scrapedContent.services.length > 0 
      ? `Tjenester de tilbyr: ${params.scrapedContent.services.slice(0, 8).join(', ')}` 
      : '';

    const prompt = `Du er en ekspert på å skrive CATCHY og fengende annonsetekster. Din oppgave er å finne det MEST fengende innholdet fra informasjonen og lage en overskrift som fanger oppmerksomheten.

Selskap: ${params.companyName}

${params.scrapedContent.description ? `Hva selskapet beskriver seg selv som: ${params.scrapedContent.description.substring(0, 500)}` : ''}
${servicesContext ? servicesContext : ''}
${businessContext ? `Innhold fra nettsiden som beskriver hva de gjør: ${businessContext}` : ''}
${params.scrapedContent.potentialHeadings.length > 0 ? `Eksisterende overskrifter fra nettside: ${params.scrapedContent.potentialHeadings.slice(0, 5).join(', ')}` : ''}
${params.previousContent?.heading ? `FORRIGE FORSLAG (ikke bruk dette, lag noe HELT NYTT): ${params.previousContent.heading}` : ''}

OPPGAVE: 
1. Analyser ALL informasjon over og finn det MEST fengende og minneverdige aspektet ved selskapet
2. Identifiser deres unike salgsargument eller hovedfordel
3. Lag en overskrift som umiddelbart fanger oppmerksomheten og gjør folk nysgjerrige

VIKTIG FOR CATCHY INNHOLD:
- Bruk kraftige, konkrete ord som skaper interesse
- Fokuser på fordelar, ikke bare hva de gjør
- Vekk interesse med et løfte eller unikt salgsargument
- Gjør det personlig og relevant for målgruppen
- Bruk ord som skaper følelser eller nysgjerrighet

Krav:
- Maks 8-10 ord
- MÅ være fengende og minneverdig
- Skal fange oppmerksomheten umiddelbart
- Reflekterer hva selskapet faktisk gjør/tilbyr
- Fokuserer på deres unike verdi eller hovedfordel
- Skrevet på norsk
- Ingen emojis eller spesialtegn
- Profesjonell men fengende tone

Generer KUN overskriften, ingen forklaring.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini', // Using cheaper model for cost efficiency
      messages: [
        {
          role: 'system',
          content: 'Du er en ekspert på å skrive CATCHY og fengende annonsetekster på norsk. Du finner alltid det mest fengende aspektet og lager innhold som fanger oppmerksomheten umiddelbart. Du genererer kort, kraftig og minneverdig innhold.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.9, // Higher temperature for more creative and varied catchy content
      max_tokens: 60,
    });

    const heading = completion.choices[0]?.message?.content?.trim();
    if (heading) {
      // Remove quotes if present
      return heading.replace(/^["']|["']$/g, '');
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
  maxLength: number = 200
): Promise<string | null> {
  if (!openai) {
    return null;
  }

  try {
    const contentContext = params.scrapedContent.allPageContent.substring(0, 2500);
    const servicesContext = params.scrapedContent.services.length > 0 
      ? `Tjenester de tilbyr: ${params.scrapedContent.services.slice(0, 12).join(', ')}` 
      : '';

    const prompt = `Du er en ekspert på å skrive CATCHY og fengende annonsetekster. Din oppgave er å finne det MEST fengende innholdet og lage en beskrivelse som fanger oppmerksomheten og overbeviser.

Selskap: ${params.companyName}
${params.scrapedContent.description ? `Hva selskapet beskriver seg selv som: ${params.scrapedContent.description}` : ''}
${servicesContext ? servicesContext : ''}
${contentContext ? `Innhold fra nettsiden som beskriver hva de gjør: ${contentContext}` : ''}
${params.previousContent?.description ? `FORRIGE FORSLAG (ikke bruk dette, lag noe HELT NYTT): ${params.previousContent.description}` : ''}

OPPGAVE:
1. Analyser ALL informasjon og identifiser det MEST fengende og minneverdige aspektet
2. Finn deres unike salgsargument, hovedfordel eller løfte
3. Lag en beskrivelse som umiddelbart fanger oppmerksomheten og gjør folk nysgjerrige

VIKTIG FOR CATCHY INNHOLD:
- Start med det MEST fengende aspektet - hva gjør dem unike?
- Fokuser på fordelar og resultater for kunden, ikke bare hva de gjør
- Bruk konkrete eksempler og tjenester fra nettsiden
- Gjør det personlig og relevant - hva får kunden ut av dette?
- Skap interesse med konkrete løfter eller unike egenskaper
- Tilpass beskrivelsen til målgruppen/kundene

Krav:
- Maks ${maxLength} tegn
- MÅ være fengende og overbevisende
- Starter med det mest fengende aspektet
- Fokuserer på fordelar og verdi for kunden
- Inkluderer konkrete tjenester eller fordelar
- Skrevet på norsk
- Profesjonell men fengende tone
- Ingen emojis

Generer KUN beskrivelsen, ingen forklaring.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'Du er en ekspert på å skrive fengende annonsetekster på norsk. Du skriver kort, kraftig og overbevisende innhold.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.85, // Higher temperature for more creative and varied catchy content
      max_tokens: Math.floor(maxLength / 2), // Rough estimate
    });

    const description = completion.choices[0]?.message?.content?.trim();
    if (description) {
      // Ensure it doesn't exceed max length
      let finalDescription = description.replace(/^["']|["']$/g, '');
      if (finalDescription.length > maxLength) {
        finalDescription = finalDescription.substring(0, maxLength - 3) + '...';
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
 * Check if LLM is available (API key is set)
 */
export async function isLLMAvailable(): Promise<boolean> {
  return openai !== null;
}

