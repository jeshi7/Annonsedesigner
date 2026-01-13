'use client';

import Tesseract from 'tesseract.js';

export interface OCRResult {
  text: string;
  confidence: number;
  extractedData: {
    companyName: string | null;
    phone: string | null;
    email: string | null;
    address: string | null;
    website: string | null;
    contactName: string | null;
    contactPhone: string | null;
    contactMobile: string | null;
    services: string[];
    format: string | null;
    adSize: string | null;
    price: string | null;
    iaaFeatures: string[];
  };
}

// Extract text from an uploaded image using OCR
export async function extractTextFromImage(
  imageFile: File | string,
  onProgress?: (progress: number) => void
): Promise<OCRResult> {
  try {
    console.log('Starting OCR processing...');
    
    const result = await Tesseract.recognize(
      imageFile,
      'nor+eng', // Norwegian and English
      {
        logger: (m) => {
          console.log('Tesseract:', m.status, m.progress);
          if (m.status === 'recognizing text' && onProgress) {
            onProgress(Math.round(m.progress * 100));
          }
        },
      }
    );

    const text = result.data.text;
    const confidence = result.data.confidence;
    
    console.log('OCR Result:', text);
    console.log('Confidence:', confidence);

    // Parse the extracted text
    const extractedData = parseProjectScreenshot(text);
    console.log('Extracted data:', extractedData);

    return {
      text,
      confidence,
      extractedData,
    };
  } catch (error) {
    console.error('OCR Error:', error);
    return {
      text: '',
      confidence: 0,
      extractedData: {
        companyName: null,
        phone: null,
        email: null,
        address: null,
        website: null,
        contactName: null,
        contactPhone: null,
        contactMobile: null,
        services: [],
        format: null,
        adSize: null,
        price: null,
        iaaFeatures: [],
      },
    };
  }
}

// Parse project screenshot - handles the specific format from the project system
export function parseProjectScreenshot(text: string): OCRResult['extractedData'] {
  console.log('Parsing text:', text);
  
  const result: OCRResult['extractedData'] = {
    companyName: null,
    phone: null,
    email: null,
    address: null,
    website: null,
    contactName: null,
    contactPhone: null,
    contactMobile: null,
    services: [],
    format: null,
    adSize: null,
    price: null,
    iaaFeatures: [],
  };

  // Clean and split the text into lines
  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  
  // Create a map of field patterns to look for
  const fieldPatterns: { pattern: RegExp; field: keyof typeof result; type: 'string' | 'array' }[] = [
    { pattern: /advertiser[:\s]+(.+)/i, field: 'companyName', type: 'string' },
    { pattern: /annons[øo]r[:\s]+(.+)/i, field: 'companyName', type: 'string' },
    { pattern: /^phone[:\s]+(.+)/i, field: 'phone', type: 'string' },
    { pattern: /telefon[:\s]+(.+)/i, field: 'phone', type: 'string' },
    { pattern: /address[:\s]+(.+)/i, field: 'address', type: 'string' },
    { pattern: /adresse[:\s]+(.+)/i, field: 'address', type: 'string' },
    { pattern: /contact\s*name[:\s]+(.+)/i, field: 'contactName', type: 'string' },
    { pattern: /kontaktnavn[:\s]+(.+)/i, field: 'contactName', type: 'string' },
    { pattern: /contact\s*phone[:\s]+(.+)/i, field: 'contactPhone', type: 'string' },
    { pattern: /kontakttelefon[:\s]+(.+)/i, field: 'contactPhone', type: 'string' },
    { pattern: /contact\s*mobile[:\s]+(.+)/i, field: 'contactMobile', type: 'string' },
    { pattern: /mobil[:\s]+(.+)/i, field: 'contactMobile', type: 'string' },
    { pattern: /contact\s*email[:\s]+(.+)/i, field: 'email', type: 'string' },
    { pattern: /e-?post[:\s]+(.+)/i, field: 'email', type: 'string' },
    { pattern: /website[:\s]+(.+)/i, field: 'website', type: 'string' },
    { pattern: /nettside[:\s]+(.+)/i, field: 'website', type: 'string' },
    { pattern: /ad\s*size[:\s]+(.+)/i, field: 'adSize', type: 'string' },
    { pattern: /annonsest[øo]rrelse[:\s]+(.+)/i, field: 'adSize', type: 'string' },
    { pattern: /format[:\s]+(.+)/i, field: 'format', type: 'string' },
    { pattern: /price[:\s]+(.+)/i, field: 'price', type: 'string' },
    { pattern: /pris[:\s]+(.+)/i, field: 'price', type: 'string' },
  ];

  // Process each line
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const nextLine = lines[i + 1] || '';
    
    // Check against field patterns
    for (const { pattern, field, type } of fieldPatterns) {
      const match = line.match(pattern);
      if (match && match[1] && type === 'string') {
        const value = match[1].trim();
        if (value && value.length > 0 && !result[field]) {
          (result as Record<string, unknown>)[field] = value;
        }
      }
    }

    // Also check if field name is on one line and value on next
    const lowerLine = line.toLowerCase();
    
    if (lowerLine.includes('advertiser') || lowerLine.includes('annonsør')) {
      if (!result.companyName && nextLine) result.companyName = nextLine;
    }
    if (lowerLine === 'address' || lowerLine === 'adresse') {
      if (!result.address && nextLine) result.address = nextLine;
    }
    if (lowerLine.includes('contact name') || lowerLine.includes('kontaktnavn')) {
      if (!result.contactName && nextLine) result.contactName = nextLine;
    }
    if (lowerLine.includes('contact phone') || lowerLine.includes('kontakttelefon')) {
      if (!result.contactPhone && nextLine) result.contactPhone = nextLine;
    }
    if (lowerLine.includes('contact mobile') || lowerLine.includes('mobil')) {
      if (!result.contactMobile && nextLine) result.contactMobile = nextLine;
    }
    if (lowerLine.includes('contact email') || lowerLine.includes('e-post')) {
      if (!result.email && nextLine) result.email = nextLine;
    }
    if (lowerLine === 'website' || lowerLine === 'nettside') {
      if (!result.website && nextLine) result.website = nextLine;
    }
    if (lowerLine.includes('ad size') || lowerLine.includes('størrelse')) {
      if (!result.adSize && nextLine) result.adSize = nextLine;
    }
    if (lowerLine === 'format') {
      if (!result.format && nextLine) result.format = nextLine;
    }
    if (lowerLine === 'price' || lowerLine === 'pris') {
      if (!result.price && nextLine) result.price = nextLine;
    }
  }

  // Extract using regex patterns on full text
  const fullText = text;
  
  // Phone numbers (Norwegian format)
  if (!result.contactPhone) {
    const phoneMatch = fullText.match(/(?:contact\s*phone|telefon)[:\s]*(\d[\d\s]{6,})/i);
    if (phoneMatch) result.contactPhone = phoneMatch[1].trim();
  }
  
  // Mobile numbers
  if (!result.contactMobile) {
    const mobileMatch = fullText.match(/(?:mobile|mobil)[:\s]*(\+?\d[\d\s]{8,})/i);
    if (mobileMatch) result.contactMobile = mobileMatch[1].trim();
  }

  // Email addresses
  if (!result.email) {
    const emailMatch = fullText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
    if (emailMatch) result.email = emailMatch[0];
  }

  // Websites
  if (!result.website) {
    const websiteMatch = fullText.match(/https?:\/\/[^\s]+/i);
    if (websiteMatch) result.website = websiteMatch[0];
  }
  if (!result.website) {
    const wwwMatch = fullText.match(/www\.[^\s]+/i);
    if (wwwMatch) result.website = 'https://' + wwwMatch[0];
  }

  // Ad size (w:186 h:55 format)
  if (!result.adSize) {
    const sizeMatch = fullText.match(/w:\s*(\d+)\s*h:\s*(\d+)/i);
    if (sizeMatch) result.adSize = `${sizeMatch[1]}x${sizeMatch[2]}`;
  }
  if (!result.adSize) {
    const sizeMatch2 = fullText.match(/(\d{2,3})\s*[x×]\s*(\d{2,3})/);
    if (sizeMatch2) result.adSize = `${sizeMatch2[1]}x${sizeMatch2[2]}`;
  }

  // Price (kr. format)
  if (!result.price) {
    const priceMatch = fullText.match(/kr\.?\s*([\d\s,.]+)/i);
    if (priceMatch) result.price = 'kr. ' + priceMatch[1].trim();
  }

  // Company name fallback - look for text after "Advertiser"
  if (!result.companyName) {
    const advertiserMatch = fullText.match(/advertiser[:\s]*([^\n]+)/i);
    if (advertiserMatch) result.companyName = advertiserMatch[1].trim();
  }

  // Address - look for Norwegian postal code pattern
  if (!result.address) {
    const addressMatch = fullText.match(/([A-Za-zæøåÆØÅ\s]+\d+[,\s]+\d{4}\s+[A-Za-zæøåÆØÅ]+)/);
    if (addressMatch) result.address = addressMatch[1].trim();
  }

  // IAA Features - look for checkmarks
  const featureKeywords = ['Website', 'Hyperlink', 'SoMe', 'Icons', 'Photo', 'Gallery', 'Motion', 'Design', 'Cinema', 'Video'];
  for (const keyword of featureKeywords) {
    if (fullText.toLowerCase().includes(keyword.toLowerCase())) {
      // Check if there's a checkmark nearby
      const checkPattern = new RegExp(`[✓✔v]\\s*${keyword}|${keyword}\\s*[✓✔v]`, 'i');
      if (checkPattern.test(fullText)) {
        result.iaaFeatures.push(keyword);
      }
    }
  }

  console.log('Final parsed result:', result);
  return result;
}
