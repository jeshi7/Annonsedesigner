'use client';

import { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { extractTextFromImage } from '@/lib/ocr';
import { extractFromEmail } from '@/lib/email-parser';
import { 
  Upload, 
  Image as ImageIcon, 
  Mail, 
  Loader2, 
  Check, 
  X, 
  Sparkles,
  Eye,
  EyeOff,
} from 'lucide-react';

export interface ExtractedProjectData {
  advertiser: string | null;
  contactName: string | null;
  contactPhone: string | null;
  contactEmail: string | null;
  website: string | null;
  address: string | null;
  adSize: string | null;
  format: string | null;
  price: string | null;
  services: string[];
  iaaFeatures: string[];
  emailContent: string | null;
}

interface FileUploadProps {
  onDataExtracted: (data: ExtractedProjectData) => void;
}

// Parse structured text (copy/paste from project system)
function parseStructuredText(text: string): Partial<ExtractedProjectData> {
  const result: Partial<ExtractedProjectData> = {};
  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  
  // Field patterns to look for
  const patterns: { patterns: RegExp[]; field: keyof ExtractedProjectData }[] = [
    { patterns: [/advertiser[:\s]+(.+)/i, /annons[øo]r[:\s]+(.+)/i, /firma[:\s]+(.+)/i], field: 'advertiser' },
    { patterns: [/contact\s*name[:\s]+(.+)/i, /kontakt(?:navn)?[:\s]+(.+)/i, /navn[:\s]+(.+)/i], field: 'contactName' },
    { patterns: [/contact\s*phone[:\s]+(.+)/i, /(?:kontakt)?telefon[:\s]+(.+)/i], field: 'contactPhone' },
    { patterns: [/contact\s*mobile[:\s]+(.+)/i, /mobil[:\s]+(.+)/i], field: 'contactPhone' },
    { patterns: [/contact\s*email[:\s]+(.+)/i, /e-?post[:\s]+(.+)/i], field: 'contactEmail' },
    { patterns: [/website[:\s]+(.+)/i, /nettside[:\s]+(.+)/i], field: 'website' },
    { patterns: [/address[:\s]+(.+)/i, /adresse[:\s]+(.+)/i], field: 'address' },
    { patterns: [/ad\s*size[:\s]+(.+)/i, /st[øo]rrelse[:\s]+(.+)/i], field: 'adSize' },
    { patterns: [/format[:\s]+(.+)/i], field: 'format' },
    { patterns: [/price[:\s]+(.+)/i, /pris[:\s]+(.+)/i], field: 'price' },
  ];

  // Check each line against patterns
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const nextLine = lines[i + 1] || '';
    
    for (const { patterns: pats, field } of patterns) {
      for (const pattern of pats) {
        const match = line.match(pattern);
        if (match && match[1]) {
          const value = match[1].trim();
          if (value && !result[field]) {
            (result as Record<string, unknown>)[field] = value;
            break;
          }
        }
        
        // Check if field name is on line and value is on next line
        const fieldNameMatch = line.match(pattern.source.replace('(.+)', '').replace(/[:\s]+$/, ''));
        if (fieldNameMatch && !line.includes(':') && nextLine && !result[field]) {
          (result as Record<string, unknown>)[field] = nextLine;
        }
      }
    }
  }

  // Extract using regex on full text
  const fullText = text;
  
  // Website URL
  if (!result.website) {
    const urlMatch = fullText.match(/https?:\/\/[^\s]+/i);
    if (urlMatch) result.website = urlMatch[0];
  }
  
  // Email
  if (!result.contactEmail) {
    const emailMatch = fullText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
    if (emailMatch) result.contactEmail = emailMatch[0];
  }
  
  // Phone (Norwegian format)
  if (!result.contactPhone) {
    const phoneMatches = fullText.match(/(?:\+47\s?)?(?:\d{2}\s?\d{2}\s?\d{2}\s?\d{2}|\d{8})/g);
    if (phoneMatches) result.contactPhone = phoneMatches[0];
  }
  
  // Ad size (w:186 h:55 format)
  if (!result.adSize) {
    const sizeMatch = fullText.match(/w:\s*(\d+)\s*h:\s*(\d+)/i);
    if (sizeMatch) result.adSize = `${sizeMatch[1]}x${sizeMatch[2]}`;
  }
  
  // Price
  if (!result.price) {
    const priceMatch = fullText.match(/kr\.?\s*([\d\s,.]+)/i);
    if (priceMatch) result.price = 'kr. ' + priceMatch[1].trim();
  }
  
  return result;
}

export function FileUpload({ onDataExtracted }: FileUploadProps) {
  const [uploadedFiles, setUploadedFiles] = useState<{ file: File; preview: string }[]>([]);
  const [emailText, setEmailText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [extractedData, setExtractedData] = useState<ExtractedProjectData | null>(null);
  const [rawOcrText, setRawOcrText] = useState<string>('');
  const [showRawText, setShowRawText] = useState(false);

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const newFiles = files.map(file => ({
      file,
      preview: URL.createObjectURL(file),
    }));
    setUploadedFiles(prev => [...prev, ...newFiles]);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files).filter(
      f => f.type.startsWith('image/') || f.type === 'application/pdf'
    );
    const newFiles = files.map(file => ({
      file,
      preview: URL.createObjectURL(file),
    }));
    setUploadedFiles(prev => [...prev, ...newFiles]);
  }, []);

  const removeFile = (index: number) => {
    setUploadedFiles(prev => {
      const newFiles = [...prev];
      URL.revokeObjectURL(newFiles[index].preview);
      newFiles.splice(index, 1);
      return newFiles;
    });
  };

  const processFiles = async () => {
    setIsProcessing(true);
    setProgress(0);
    setRawOcrText('');

    let combinedData: ExtractedProjectData = {
      advertiser: null,
      contactName: null,
      contactPhone: null,
      contactEmail: null,
      website: null,
      address: null,
      adSize: null,
      format: null,
      price: null,
      services: [],
      iaaFeatures: [],
      emailContent: emailText || null,
    };

    let allOcrText = '';

    // Process uploaded images with OCR
    for (let i = 0; i < uploadedFiles.length; i++) {
      const { file } = uploadedFiles[i];
      
      if (file.type.startsWith('image/')) {
        try {
          console.log(`Processing file ${i + 1}/${uploadedFiles.length}: ${file.name}`);
          
          const ocrResult = await extractTextFromImage(file, (p) => {
            setProgress(Math.round((i / uploadedFiles.length) * 100 + p / uploadedFiles.length));
          });

          allOcrText += `\n--- ${file.name} ---\n${ocrResult.text}\n`;
          
          // Map OCR extracted data to our format
          const data = ocrResult.extractedData;
          
          if (data.companyName) combinedData.advertiser = data.companyName;
          if (data.contactName) combinedData.contactName = data.contactName;
          if (data.contactPhone) combinedData.contactPhone = data.contactPhone;
          if (data.contactMobile && !combinedData.contactPhone) combinedData.contactPhone = data.contactMobile;
          if (data.email) combinedData.contactEmail = data.email;
          if (data.website) combinedData.website = data.website;
          if (data.address) combinedData.address = data.address;
          if (data.adSize) combinedData.adSize = data.adSize;
          if (data.format) combinedData.format = data.format;
          if (data.price) combinedData.price = data.price;
          if (data.iaaFeatures && data.iaaFeatures.length > 0) {
            combinedData.iaaFeatures.push(...data.iaaFeatures);
          }
          
          console.log('OCR extracted data:', data);
          
        } catch (error) {
          console.error('Error processing image:', error);
          allOcrText += `\n--- ${file.name} (FEIL) ---\n${error}\n`;
        }
      }
    }

    setRawOcrText(allOcrText);

    // Process pasted text (structured or email)
    if (emailText) {
      // Try parsing as structured data first (like copy/paste from system)
      const structuredData = parseStructuredText(emailText);
      
      if (structuredData.advertiser && !combinedData.advertiser) {
        combinedData.advertiser = structuredData.advertiser;
      }
      if (structuredData.contactName && !combinedData.contactName) {
        combinedData.contactName = structuredData.contactName;
      }
      if (structuredData.contactPhone && !combinedData.contactPhone) {
        combinedData.contactPhone = structuredData.contactPhone;
      }
      if (structuredData.contactEmail && !combinedData.contactEmail) {
        combinedData.contactEmail = structuredData.contactEmail;
      }
      if (structuredData.website && !combinedData.website) {
        combinedData.website = structuredData.website;
      }
      if (structuredData.address && !combinedData.address) {
        combinedData.address = structuredData.address;
      }
      if (structuredData.adSize && !combinedData.adSize) {
        combinedData.adSize = structuredData.adSize;
      }
      if (structuredData.format && !combinedData.format) {
        combinedData.format = structuredData.format;
      }
      if (structuredData.price && !combinedData.price) {
        combinedData.price = structuredData.price;
      }
      
      // Also try email parsing as fallback
      const emailData = extractFromEmail(emailText);
      if (emailData.contactInfo.name && !combinedData.contactName) {
        combinedData.contactName = emailData.contactInfo.name;
      }
      if (emailData.contactInfo.phone && !combinedData.contactPhone) {
        combinedData.contactPhone = emailData.contactInfo.phone;
      }
      if (emailData.contactInfo.email && !combinedData.contactEmail) {
        combinedData.contactEmail = emailData.contactInfo.email;
      }
      if (emailData.services.length > 0) {
        combinedData.services.push(...emailData.services);
      }
    }

    // Deduplicate
    combinedData.services = [...new Set(combinedData.services)];
    combinedData.iaaFeatures = [...new Set(combinedData.iaaFeatures)];

    console.log('Final combined data:', combinedData);
    
    setExtractedData(combinedData);
    onDataExtracted(combinedData);
    setIsProcessing(false);
    setProgress(100);
  };

  const hasExtractedData = extractedData && (
    extractedData.advertiser ||
    extractedData.contactName ||
    extractedData.contactPhone ||
    extractedData.contactEmail ||
    extractedData.website ||
    extractedData.adSize ||
    extractedData.format ||
    extractedData.price
  );

  return (
    <Card className="glass border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Upload className="h-5 w-5 text-primary" />
          Last opp filer
        </CardTitle>
        <CardDescription>
          Last opp skjermbilde fra prosjektsystemet eller lim inn kundemail
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* File Drop Zone */}
        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer"
        >
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
            id="file-upload"
          />
          <label htmlFor="file-upload" className="cursor-pointer">
            <ImageIcon className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
            <p className="text-sm font-medium">Dra og slipp bilder her</p>
            <p className="text-xs text-muted-foreground mt-1">
              eller klikk for å velge filer
            </p>
          </label>
        </div>

        {/* Uploaded Files Preview */}
        {uploadedFiles.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium">Opplastede filer ({uploadedFiles.length})</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {uploadedFiles.map((item, index) => (
                <div key={index} className="relative group">
                  <img
                    src={item.preview}
                    alt={`Uploaded ${index + 1}`}
                    className="w-full h-24 object-cover rounded-lg border border-border"
                  />
                  <button
                    onClick={() => removeFile(index)}
                    className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-3 w-3" />
                  </button>
                  <p className="text-xs text-muted-foreground mt-1 truncate">
                    {item.file.name}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Structured Text Input */}
        <div className="space-y-2">
          <label className="text-sm font-medium flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Lim inn tekst fra prosjektsystemet
          </label>
          <Textarea
            placeholder={`Lim inn informasjon direkte her. Eksempel:

Advertiser: Rockwool A/s Avd Moss
Contact Name: Erik Ølstad
Contact Phone: 99265338
Contact Email: erik.oelstad@rockwool.com
Website: https://www.rockwool.com/no/
Ad size: w:186 h:55
Price: kr. 14 800

Eller lim inn kundemail...`}
            value={emailText}
            onChange={(e) => setEmailText(e.target.value)}
            rows={6}
            className="bg-background/50 resize-none font-mono text-sm"
          />
          <p className="text-xs text-muted-foreground">
            Tips: Kopier teksten direkte fra prosjektsystemet (Ctrl+A, Ctrl+C)
          </p>
        </div>

        {/* Process Button */}
        <Button
          onClick={processFiles}
          disabled={isProcessing || (uploadedFiles.length === 0 && !emailText)}
          className="w-full"
        >
          {isProcessing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Behandler... {progress}%
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              Hent ut informasjon
            </>
          )}
        </Button>

        {/* Extracted Data Preview */}
        {extractedData && (
          <div className="space-y-3 p-4 bg-muted/30 rounded-lg">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium flex items-center gap-2">
                {hasExtractedData ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <X className="h-4 w-4 text-red-500" />
                )}
                {hasExtractedData ? 'Hentet informasjon:' : 'Kunne ikke hente ut informasjon automatisk'}
              </p>
              {rawOcrText && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowRawText(!showRawText)}
                  className="text-xs"
                >
                  {showRawText ? <EyeOff className="h-3 w-3 mr-1" /> : <Eye className="h-3 w-3 mr-1" />}
                  {showRawText ? 'Skjul' : 'Vis'} rå tekst
                </Button>
              )}
            </div>
            
            {hasExtractedData ? (
              <div className="grid grid-cols-2 gap-2 text-sm">
                {extractedData.advertiser && (
                  <div>
                    <span className="text-muted-foreground">Firma:</span>{' '}
                    <span className="font-medium">{extractedData.advertiser}</span>
                  </div>
                )}
                {extractedData.contactName && (
                  <div>
                    <span className="text-muted-foreground">Kontakt:</span>{' '}
                    <span className="font-medium">{extractedData.contactName}</span>
                  </div>
                )}
                {extractedData.contactPhone && (
                  <div>
                    <span className="text-muted-foreground">Telefon:</span>{' '}
                    <span className="font-medium">{extractedData.contactPhone}</span>
                  </div>
                )}
                {extractedData.contactEmail && (
                  <div>
                    <span className="text-muted-foreground">E-post:</span>{' '}
                    <span className="font-medium">{extractedData.contactEmail}</span>
                  </div>
                )}
                {extractedData.website && (
                  <div>
                    <span className="text-muted-foreground">Nettside:</span>{' '}
                    <span className="font-medium">{extractedData.website}</span>
                  </div>
                )}
                {extractedData.address && (
                  <div className="col-span-2">
                    <span className="text-muted-foreground">Adresse:</span>{' '}
                    <span className="font-medium">{extractedData.address}</span>
                  </div>
                )}
                {extractedData.adSize && (
                  <div>
                    <span className="text-muted-foreground">Størrelse:</span>{' '}
                    <span className="font-medium">{extractedData.adSize}</span>
                  </div>
                )}
                {extractedData.format && (
                  <div>
                    <span className="text-muted-foreground">Format:</span>{' '}
                    <span className="font-medium">{extractedData.format}</span>
                  </div>
                )}
                {extractedData.price && (
                  <div>
                    <span className="text-muted-foreground">Pris:</span>{' '}
                    <span className="font-medium">{extractedData.price}</span>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Prøv å laste opp et tydeligere bilde, eller fyll inn informasjonen manuelt.
              </p>
            )}
            
            {extractedData.iaaFeatures.length > 0 && (
              <div className="mt-2">
                <span className="text-sm text-muted-foreground">IAA Features:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {extractedData.iaaFeatures.map((f, i) => (
                    <Badge key={i} variant="secondary" className="text-xs">
                      {f}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Raw OCR Text (for debugging) */}
            {showRawText && rawOcrText && (
              <div className="mt-4 p-3 bg-background/50 rounded border">
                <p className="text-xs font-medium text-muted-foreground mb-2">Rå OCR-tekst:</p>
                <pre className="text-xs whitespace-pre-wrap font-mono max-h-48 overflow-y-auto">
                  {rawOcrText}
                </pre>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
