'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { CopyButton } from '@/components/copy-button';
import { 
  HEADINGS, 
  SUBHEADINGS, 
  SERVICE_LISTS,
  IndustryKey,
  getRandomHeading,
  getRandomSubheading,
  getRandomServices,
  FORMAT_CONTENT_RULES,
} from '@/lib/text-library';
import type { GeneratedContent } from '@/lib/actions';
import { 
  RefreshCw, 
  Mail, 
  FileText, 
  Image as ImageIcon, 
  Phone, 
  MapPin, 
  Globe,
  Award,
  Sparkles,
  ArrowUp,
  Check,
  X,
  ExternalLink,
} from 'lucide-react';

interface ContentGeneratorProps {
  content: GeneratedContent;
  industry: IndustryKey;
  companyName: string;
  onContentChange: (content: Partial<GeneratedContent>) => void;
}

export function ContentGenerator({ 
  content, 
  industry,
  companyName,
  onContentChange 
}: ContentGeneratorProps) {
  const [activeTab, setActiveTab] = useState('innhold');
  const [selectedServices, setSelectedServices] = useState<string[]>(content.services);

  const regenerateHeading = () => {
    const newHeading = getRandomHeading(industry);
    onContentChange({ heading: newHeading });
  };

  const regenerateSubheading = () => {
    const newSubheading = getRandomSubheading(industry);
    onContentChange({ subheading: newSubheading });
  };

  const regenerateServices = () => {
    const newServices = getRandomServices(industry, 8);
    setSelectedServices(newServices);
    onContentChange({ services: newServices });
  };

  const toggleService = (service: string) => {
    const updated = selectedServices.includes(service)
      ? selectedServices.filter(s => s !== service)
      : [...selectedServices, service];
    setSelectedServices(updated);
    onContentChange({ services: updated });
  };

  // Funksjon for å foreslå ikoner (som tekst) basert på tjenester og innhold
  const getSuggestedIcons = (): string[] => {
    const iconMap: Record<string, string[]> = {
      // Bygg og anlegg
      'bygg': ['bygg', 'hammer', 'hus', 'verktøy'],
      'anlegg': ['anlegg', 'bygg', 'maskin', 'verktøy'],
      'renovering': ['renovering', 'verktøy', 'oppussing', 'hus'],
      'riving': ['riving', 'bygg', 'anlegg'],
      
      // Isolasjon og materialer
      'isolasjon': ['isolasjon', 'energi', 'materiale', 'hus'],
      'isolering': ['isolasjon', 'energi', 'materiale', 'hus'],
      'energi': ['energi', 'miljø', 'bærekraft', 'effektivitet'],
      'energirenovering': ['energi', 'renovering', 'hus', 'miljø'],
      
      // Rørlegger og elektro
      'rørlegger': ['rørlegger', 'vann', 'bad', 'rør'],
      'elektro': ['elektro', 'strøm', 'lys', 'elektrisk'],
      'elektriker': ['elektro', 'strøm', 'lys', 'elektrisk'],
      
      'maling': ['maling', 'pensel', 'farge', 'dekorasjon'],
      'maler': ['maling', 'pensel', 'farge', 'dekorasjon'],
      'gulv': ['gulv', 'parkett', 'flis', 'belegg'],
      
      // Tak og blikkenslager
      'tak': ['tak', 'regn', 'blikkenslager', 'tekking'],
      'blikkenslager': ['blikkenslager', 'tak', 'rør', 'metall'],
      
      // Transport og logistikk
      'transport': ['transport', 'bil', 'lastebil', 'logistikk'],
      'logistikk': ['logistikk', 'transport', 'lastebil', 'lager'],
      'maskin': ['maskin', 'utstyr', 'verktøy', 'maskineri'],
      
      // Helse og velvære
      'helse': ['helse', 'medisin', 'sykepleie', 'velvære'],
      'velvære': ['velvære', 'massasje', 'behandling', 'helse'],
      'fysioterapi': ['fysioterapi', 'trening', 'rehabilitering', 'helse'],
      
      // Teknologi
      'teknologi': ['teknologi', 'data', 'nettverk', 'IT'],
      'it': ['IT', 'data', 'nettverk', 'teknologi'],
      'nettverk': ['nettverk', 'data', 'IT', 'kommunikasjon'],
      
      // Restaurant og mat
      'restaurant': ['restaurant', 'mat', 'kokk', 'servering'],
      'mat': ['mat', 'restaurant', 'kokk', 'catering'],
      'catering': ['catering', 'mat', 'servering', 'arrangement'],
      
      // Generelt
      'rådgivning': ['rådgivning', 'konsultasjon', 'ekspertise', 'service'],
      'service': ['service', 'vedlikehold', 'support', 'hjelp'],
      'kvalitet': ['kvalitet', 'sertifisert', 'standard', 'ekspertise'],
      'sertifisert': ['sertifisert', 'kvalitet', 'standard', 'godkjent'],
    };

    const suggestedIcons: string[] = [];
    const usedIcons = new Set<string>();

    // Sjekk tjenester
    selectedServices.forEach(service => {
      const lowerService = service.toLowerCase();
      for (const [key, icons] of Object.entries(iconMap)) {
        if (lowerService.includes(key) && icons.length > 0) {
          const icon = icons[0];
          if (!usedIcons.has(icon)) {
            suggestedIcons.push(icon);
            usedIcons.add(icon);
          }
        }
      }
    });

    // Sjekk heading og subheading
    const contentText = `${content.heading} ${content.subheading} ${content.description}`.toLowerCase();
    for (const [key, icons] of Object.entries(iconMap)) {
      if (contentText.includes(key) && icons.length > 0) {
        const icon = icons[0];
        if (!usedIcons.has(icon)) {
          suggestedIcons.push(icon);
          usedIcons.add(icon);
        }
      }
    }

    // Legg til standard ikoner hvis ikke nok
    const standardIcons = ['kvalitet', 'service', 'ekspertise', 'sertifisert', 'profesjonell', 'pålitelig', 'erfaring', 'innovativ'];
    standardIcons.forEach(icon => {
      if (suggestedIcons.length < 10 && !usedIcons.has(icon)) {
        suggestedIcons.push(icon);
        usedIcons.add(icon);
      }
    });

    return suggestedIcons.slice(0, 12); // Returner opp til 12 ikoner
  };

  const allServices = SERVICE_LISTS[industry] || [
    'Rådgivning',
    'Prosjektering',
    'Utførelse',
    'Service og vedlikehold',
    'Oppfølging',
    'Kundetilpassede løsninger',
  ];

  // Get content rules for each format level
  const orderedRules = content.orderedFormatKey ? FORMAT_CONTENT_RULES[content.orderedFormatKey]?.ordered : null;
  const upgrade1Rules = content.upgradeFormatKey ? FORMAT_CONTENT_RULES[content.orderedFormatKey]?.upgrade1 : null;
  const upgrade2Rules = content.secondUpgradeFormatKey ? FORMAT_CONTENT_RULES[content.orderedFormatKey]?.upgrade2 : null;

  // Check if format is larger than tredjedel (halvside, helside, spread)
  const isLargerThanTredjedel = (formatKey: string | null): boolean => {
    if (!formatKey) return false;
    return ['halvside', 'helside', 'spread'].includes(formatKey);
  };

  // Check if format is tredjedel or larger (tredjedel, halvside, helside, spread)
  const isTredjedelOrLarger = (formatKey: string | null): boolean => {
    if (!formatKey) return false;
    return ['tredjedel', 'halvside', 'helside', 'spread'].includes(formatKey);
  };

  // Format content for copy - Bestilt versjon (minimalt)
  const formatOrderedVersion = () => {
    const lines = [`[LOGO]`, ``];
    
    if (orderedRules?.heading) {
      lines.push(content.heading);
    }
    
    if (orderedRules?.subheading && content.subheading) {
      lines.push(content.subheading);
    }
    
    lines.push(``);
    
    if (orderedRules?.website) {
      lines.push(`www.${companyName.toLowerCase().replace(/\s+/g, '')}.no`);
    }
    
    return lines.join('\n');
  };

  // Format Upgrade 1 (moderat innhold)
  const formatUpgrade1Version = () => {
    const rules = upgrade1Rules;
    if (!rules) return formatOrderedVersion();
    
    const lines = [`[LOGO]`, ``];
    
    if (rules.heading) lines.push(content.heading);
    if (rules.subheading && content.subheading) {
      lines.push(content.subheading);
      lines.push(``);
    }
    
    // Upgrade 1: Bruk kortere beskrivelse (første setning eller kort versjon)
    if (rules.description && content.description) {
      // Ta første setning eller første del av beskrivelsen for Upgrade 1
      const firstSentence = content.description.split(/[.!?]/)[0].trim();
      if (firstSentence && firstSentence.length > 20) {
        lines.push(firstSentence + '.');
      } else {
        // Hvis første setning er for kort, ta første del (maks 150 tegn)
        const shortDesc = content.description.length > 150 
          ? content.description.substring(0, 147) + '...'
          : content.description;
        lines.push(shortDesc);
      }
      lines.push(``);
    }
    
    // Services - bruk riktig antall basert på upgrade1 rules
    const serviceCount = rules.serviceList || 0;
    if (serviceCount > 0) {
      lines.push(`TJENESTER:`);
      selectedServices.slice(0, serviceCount).forEach(s => lines.push(`• ${s}`));
      lines.push(``);
    }
    
    // Kontaktinformasjon - alltid inkluder for tredjedel og oppover
    const shouldIncludeContact = isTredjedelOrLarger(content.upgradeFormatKey);
    
    if (shouldIncludeContact || rules.contactPhone || rules.contactAddress || rules.contactEmail || rules.website) {
      lines.push(`KONTAKT:`);
      // Hvis format er tredjedel eller større, inkluder all tilgjengelig kontaktinfo
      if (shouldIncludeContact) {
        if (content.phone) lines.push(`📞 ${content.phone}`);
        if (content.address) lines.push(`📍 ${content.address}`);
        if (content.email) lines.push(`✉️ ${content.email}`);
        if (rules.website || shouldIncludeContact) {
          lines.push(`🌐 www.${companyName.toLowerCase().replace(/\s+/g, '')}.no`);
        }
      } else {
        // Ellers følg reglene
        if (rules.contactPhone && content.phone) lines.push(`📞 ${content.phone}`);
        if (rules.contactAddress && content.address) lines.push(`📍 ${content.address}`);
        if (rules.contactEmail && content.email) lines.push(`✉️ ${content.email}`);
        if (rules.website) {
          lines.push(`🌐 www.${companyName.toLowerCase().replace(/\s+/g, '')}.no`);
        }
      }
    }
    
    // Certifications
    const certCount = rules.certifications || 0;
    if (certCount > 0 && content.certifications.length > 0) {
      lines.push(``, `SERTIFISERINGER:`);
      content.certifications.slice(0, certCount).forEach(c => lines.push(`[${c}]`));
    }
    
    // Sosiale medier-knapper for formater over tredjedel
    if (isLargerThanTredjedel(content.upgradeFormatKey)) {
      const socialLinks: string[] = [];
      if (content.scrapedData.socialMedia.facebook) socialLinks.push(`Facebook: ${content.scrapedData.socialMedia.facebook}`);
      if (content.scrapedData.socialMedia.instagram) socialLinks.push(`Instagram: ${content.scrapedData.socialMedia.instagram}`);
      if (content.scrapedData.socialMedia.linkedin) socialLinks.push(`LinkedIn: ${content.scrapedData.socialMedia.linkedin}`);
      
      if (socialLinks.length > 0) {
        lines.push(``, `SOSIALE MEDIER:`);
        socialLinks.forEach(link => lines.push(link));
      }
    }
    
    return lines.join('\n');
  };

  // Format Upgrade 2 (komplett innhold - 2-3x mer enn Upgrade 1)
  const formatUpgrade2Version = () => {
    const rules = upgrade2Rules;
    if (!rules) return formatUpgrade1Version();
    
    const lines = [`[LOGO]`, ``];
    
    if (rules.heading) lines.push(content.heading);
    if (rules.subheading && content.subheading) {
      lines.push(content.subheading);
      lines.push(``);
    }
    
    // Upgrade 2 skal ha 2-3x lengre beskrivelse enn Upgrade 1
    if (rules.description && content.description) {
      // Bygg en lengre beskrivelse for Upgrade 2
      let extendedDescription = content.description;
      
      // Hvis vi har scraped content, legg til mer informasjon
      if (content.scrapedData.allPageContent && content.scrapedData.allPageContent.length > 100) {
        const sentences = content.scrapedData.allPageContent
          .split(/[.!?]/)
          .map(s => s.trim())
          .filter(s => s.length > 30 && s.length < 200 && !s.toLowerCase().includes('cookie'))
          .slice(0, 4); // Ta opp til 4 ekstra setninger
        
        if (sentences.length > 0) {
          // Kombiner original beskrivelse med ekstra setninger
          extendedDescription = content.description;
          if (!extendedDescription.endsWith('.') && !extendedDescription.endsWith('!') && !extendedDescription.endsWith('?')) {
            extendedDescription += '.';
          }
          extendedDescription += ' ' + sentences.join('. ') + '.';
        }
      } else {
        // Hvis ikke scraped content, utvid beskrivelsen med mer detaljer
        extendedDescription = content.description;
        if (!extendedDescription.endsWith('.') && !extendedDescription.endsWith('!') && !extendedDescription.endsWith('?')) {
          extendedDescription += '.';
        }
        extendedDescription += ` Vi har lang erfaring og er dedikert til å levere løsninger som overgår forventningene. Vårt team består av erfarne fagfolk som setter kundens behov i sentrum.`;
      }
      
      lines.push(extendedDescription);
      lines.push(``);
    }
    
    // Services - bruk riktig antall basert på upgrade2 rules (mer enn upgrade1)
    // Upgrade 2 skal ha mer detaljert tjenesteliste
    const serviceCount = rules.serviceList || 0;
    if (serviceCount > 0) {
      lines.push(`TJENESTER:`);
      const servicesToShow = selectedServices.slice(0, serviceCount);
      servicesToShow.forEach(s => {
        // For Upgrade 2, legg til korte beskrivelser eller mer detaljer
        lines.push(`• ${s}`);
      });
      
      // Hvis vi har flere tjenester enn Upgrade 1, legg til en ekstra linje
      if (serviceCount > (upgrade1Rules?.serviceList || 0)) {
        lines.push(``);
        lines.push(`Vi tilbyr også rådgivning og tilpassede løsninger for alle typer prosjekter. Kontakt oss for en uforpliktende samtale.`);
      }
      lines.push(``);
    }
    
    // Kontaktinformasjon - alltid inkluder for tredjedel og oppover
    const shouldIncludeContact = isTredjedelOrLarger(content.secondUpgradeFormatKey);
    
    if (shouldIncludeContact || rules.contactPhone || rules.contactAddress || rules.contactEmail || rules.website) {
      lines.push(`KONTAKT:`);
      // Hvis format er tredjedel eller større, inkluder all tilgjengelig kontaktinfo
      if (shouldIncludeContact) {
        if (content.phone) lines.push(`📞 ${content.phone}`);
        if (content.address) lines.push(`📍 ${content.address}`);
        if (content.email) lines.push(`✉️ ${content.email}`);
        if (content.scrapedData.openingHours) {
          lines.push(`🕐 Åpningstider: ${content.scrapedData.openingHours}`);
        }
        if (rules.website || shouldIncludeContact) {
          lines.push(`🌐 www.${companyName.toLowerCase().replace(/\s+/g, '')}.no`);
        }
      } else {
        // Ellers følg reglene
        if (rules.contactPhone && content.phone) lines.push(`📞 ${content.phone}`);
        if (rules.contactAddress && content.address) lines.push(`📍 ${content.address}`);
        if (rules.contactEmail && content.email) lines.push(`✉️ ${content.email}`);
        if (rules.openingHours && content.scrapedData.openingHours) {
          lines.push(`🕐 Åpningstider: ${content.scrapedData.openingHours}`);
        }
        if (rules.website) {
          lines.push(`🌐 www.${companyName.toLowerCase().replace(/\s+/g, '')}.no`);
        }
      }
    }
    
    // Upgrade 2: Legg til ekstra informasjon hvis tilgjengelig
    if (content.scrapedData.companyName && content.scrapedData.companyName !== companyName) {
      lines.push(``);
      lines.push(`Om oss: ${content.scrapedData.companyName} er en pålitelig partner med fokus på kvalitet og kundetilfredshet.`);
    }
    
    // Certifications - flere enn upgrade1
    const certCount = rules.certifications || 0;
    if (certCount > 0 && content.certifications.length > 0) {
      lines.push(``, `SERTIFISERINGER:`);
      content.certifications.slice(0, certCount).forEach(c => lines.push(`[${c}]`));
    }
    
    // Images - hvis tillatt
    const imageCount = rules.images || 0;
    if (imageCount > 0 && content.images.length > 0) {
      lines.push(``, `BILDER:`);
      content.images.slice(0, imageCount).forEach((img, i) => {
        lines.push(`[Bilde ${i + 1}]`);
      });
    }
    
    // Sosiale medier-knapper for formater over tredjedel
    if (isLargerThanTredjedel(content.secondUpgradeFormatKey)) {
      const socialLinks: string[] = [];
      if (content.scrapedData.socialMedia.facebook) socialLinks.push(`Facebook: ${content.scrapedData.socialMedia.facebook}`);
      if (content.scrapedData.socialMedia.instagram) socialLinks.push(`Instagram: ${content.scrapedData.socialMedia.instagram}`);
      if (content.scrapedData.socialMedia.linkedin) socialLinks.push(`LinkedIn: ${content.scrapedData.socialMedia.linkedin}`);
      
      if (socialLinks.length > 0) {
        lines.push(``, `SOSIALE MEDIER:`);
        socialLinks.forEach(link => lines.push(link));
      }
    }
    
    return lines.join('\n');
  };

  return (
    <div className="space-y-6">
      {/* Format Overview - All three levels with bonus calculator */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Bestilt versjon */}
        <Card className="border-muted">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Bestilt versjon</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-lg font-semibold">{content.orderedFormat.name}</p>
                <p className="text-sm text-muted-foreground">{content.orderedFormat.dimensions}</p>
              </div>
              <Badge variant="secondary" className="text-base">
                kr {content.orderedFormat.price.toLocaleString('nb-NO')}
              </Badge>
            </div>
            <div className="mt-3 pt-3 border-t border-muted">
              <p className="text-xs text-muted-foreground">Din bonus: kr 0</p>
            </div>
          </CardContent>
        </Card>

        {/* Upgrade 1 */}
        {content.upgradeFormat && (
          <Card className="border-primary/50 bg-primary/5 relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-[10px] px-2 py-0.5 rounded-bl font-medium">
              ANBEFALT
            </div>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-primary flex items-center gap-1">
                <ArrowUp className="h-4 w-4" />
                Upgrade 1
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-lg font-semibold">{content.upgradeFormat.name}</p>
                  <p className="text-sm text-muted-foreground">{content.upgradeFormat.dimensions}</p>
                </div>
                <div className="text-right">
                  <Badge className="text-base">
                    kr {content.upgradeFormat.price.toLocaleString('nb-NO')}
                  </Badge>
                  <p className="text-xs text-primary mt-1">
                    +kr {content.priceDifference.toLocaleString('nb-NO')}
                  </p>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-primary/20">
                <p className="text-xs text-primary font-medium flex items-center gap-1">
                  💰 Din bonus: ~kr {Math.round(content.priceDifference * 0.15).toLocaleString('nb-NO')}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Upgrade 2 */}
        {content.secondUpgradeFormat && (
          <Card className="border-amber-500/50 bg-amber-500/5 relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-amber-500 text-white text-[10px] px-2 py-0.5 rounded-bl font-medium">
              BESTE BONUS
            </div>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-amber-600 dark:text-amber-400 flex items-center gap-1">
                <ArrowUp className="h-4 w-4" />
                <ArrowUp className="h-4 w-4 -ml-2" />
                Upgrade 2
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-lg font-semibold">{content.secondUpgradeFormat.name}</p>
                  <p className="text-sm text-muted-foreground">{content.secondUpgradeFormat.dimensions}</p>
                </div>
                <div className="text-right">
                  <Badge className="bg-amber-500 hover:bg-amber-600 text-base">
                    kr {content.secondUpgradeFormat.price.toLocaleString('nb-NO')}
                  </Badge>
                  <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                    +kr {content.priceDifferenceSecond.toLocaleString('nb-NO')}
                  </p>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-amber-500/20">
                <p className="text-xs text-amber-600 dark:text-amber-400 font-bold flex items-center gap-1">
                  🔥 Din bonus: ~kr {Math.round(content.priceDifferenceSecond * 0.15).toLocaleString('nb-NO')}
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Daily earnings potential */}
      <Card className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-green-500/30">
        <CardContent className="py-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-700 dark:text-green-400">📈 Daglig inntektspotensial</p>
              <p className="text-xs text-muted-foreground">Basert på 5-6 upgrades per dag</p>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-green-600 dark:text-green-400">
                kr {Math.round((content.priceDifference * 0.15 * 5)).toLocaleString('nb-NO')} - {Math.round((content.priceDifferenceSecond * 0.15 * 6)).toLocaleString('nb-NO')}
              </p>
              <p className="text-xs text-muted-foreground">per dag i bonus</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4 h-12">
          <TabsTrigger value="innhold" className="gap-2">
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">Innhold</span>
          </TabsTrigger>
          <TabsTrigger value="bilder" className="gap-2">
            <ImageIcon className="h-4 w-4" />
            <span className="hidden sm:inline">Bilder</span>
          </TabsTrigger>
          <TabsTrigger value="epost" className="gap-2">
            <Mail className="h-4 w-4" />
            <span className="hidden sm:inline">E-post</span>
          </TabsTrigger>
          <TabsTrigger value="eksport" className="gap-2">
            <Sparkles className="h-4 w-4" />
            <span className="hidden sm:inline">Eksport</span>
          </TabsTrigger>
        </TabsList>

        {/* Innhold Tab */}
        <TabsContent value="innhold" className="space-y-6">
          {/* Heading */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Heading</CardTitle>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={regenerateHeading}>
                    <RefreshCw className="h-4 w-4 mr-1" />
                    Ny
                  </Button>
                  <CopyButton text={content.heading} label="Kopier" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Input
                value={content.heading}
                onChange={(e) => onContentChange({ heading: e.target.value })}
                className="text-lg font-semibold bg-background/50"
              />
              <div className="mt-3 flex flex-wrap gap-2">
                {(HEADINGS[industry] || [
                  'Kvalitet og erfaring du kan stole på',
                  'Din lokale samarbeidspartner',
                  'Fagfolk med lang erfaring',
                  'Vi leverer resultater',
                  'Profesjonelle tjenester',
                ]).slice(0, 5).map((h, i) => (
                  <Badge 
                    key={i} 
                    variant="outline" 
                    className="cursor-pointer hover:bg-primary/20"
                    onClick={() => onContentChange({ heading: h })}
                  >
                    {h}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Subheading */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Subheading</CardTitle>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={regenerateSubheading}>
                    <RefreshCw className="h-4 w-4 mr-1" />
                    Ny
                  </Button>
                  <CopyButton text={content.subheading} label="Kopier" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Textarea
                value={content.subheading}
                onChange={(e) => onContentChange({ subheading: e.target.value })}
                rows={2}
                className="bg-background/50 resize-none"
              />
              <div className="mt-3 space-y-2">
                {(SUBHEADINGS[industry] || [
                  'Med fokus på kvalitet og kundetilfredshet leverer vi tjenester tilpasset dine behov.',
                  'Erfarne fagfolk som setter kunden først.',
                  'Vi tar oppdraget ditt på alvor – hver gang.',
                ]).slice(0, 3).map((s, i) => (
                  <p 
                    key={i} 
                    className="text-sm text-muted-foreground cursor-pointer hover:text-foreground p-2 rounded hover:bg-muted/50"
                    onClick={() => onContentChange({ subheading: s })}
                  >
                    {s}
                  </p>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Description */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Beskrivelse</CardTitle>
                <CopyButton text={content.description} label="Kopier" />
              </div>
            </CardHeader>
            <CardContent>
              <Textarea
                value={content.description}
                onChange={(e) => onContentChange({ description: e.target.value })}
                rows={4}
                className="bg-background/50 resize-none"
              />
            </CardContent>
          </Card>

          {/* Services */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Tjenester ({selectedServices.length} valgt)</CardTitle>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={regenerateServices}>
                    <RefreshCw className="h-4 w-4 mr-1" />
                    Nye
                  </Button>
                  <CopyButton text={selectedServices.map(s => `• ${s}`).join('\n')} label="Kopier" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {allServices.map((service, i) => (
                  <Badge
                    key={i}
                    variant={selectedServices.includes(service) ? 'default' : 'outline'}
                    className="cursor-pointer transition-all"
                    onClick={() => toggleService(service)}
                  >
                    {selectedServices.includes(service) && <Check className="h-3 w-3 mr-1" />}
                    {service}
                  </Badge>
                ))}
              </div>
              {content.scrapedData.services.length > 0 && (
                <>
                  <Separator className="my-4" />
                  <p className="text-sm text-muted-foreground mb-2">Fra nettsiden:</p>
                  <div className="flex flex-wrap gap-2">
                    {content.scrapedData.services.map((service, i) => (
                      <Badge
                        key={i}
                        variant={selectedServices.includes(service) ? 'default' : 'secondary'}
                        className="cursor-pointer"
                        onClick={() => toggleService(service)}
                      >
                        {service}
                      </Badge>
                    ))}
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Contact Info */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Kontaktinformasjon</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-muted-foreground" />
                  <Input
                    value={content.phone || ''}
                    onChange={(e) => onContentChange({ phone: e.target.value })}
                    placeholder="Telefon"
                    className="bg-background/50"
                  />
                  {content.phone && <CopyButton text={content.phone} label="" size="icon" />}
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-muted-foreground" />
                  <Input
                    value={content.email || ''}
                    onChange={(e) => onContentChange({ email: e.target.value })}
                    placeholder="E-post"
                    className="bg-background/50"
                  />
                  {content.email && <CopyButton text={content.email} label="" size="icon" />}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-muted-foreground" />
                <Input
                  value={content.address || ''}
                  onChange={(e) => onContentChange({ address: e.target.value })}
                  placeholder="Adresse"
                  className="bg-background/50 flex-1"
                />
                {content.address && <CopyButton text={content.address} label="" size="icon" />}
              </div>
            </CardContent>
          </Card>

          {/* Certifications */}
          {content.certifications.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Sertifiseringer funnet
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {content.certifications.map((cert, i) => (
                    <Badge key={i} variant="secondary">
                      {cert}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Icon Suggestions */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <Sparkles className="h-5 w-5" />
                  Forslag til ikoner (tekst)
                </CardTitle>
                <CopyButton 
                  text={getSuggestedIcons().join(', ')} 
                  label="Kopier alle" 
                  size="sm"
                />
              </div>
              <CardDescription className="text-xs mt-1">
                Ikonnavn basert på tjenester og innhold. Klikk for å kopiere.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {getSuggestedIcons().map((icon, i) => (
                  <Badge
                    key={i}
                    variant="outline"
                    className="cursor-pointer hover:bg-primary/20 hover:border-primary transition-colors"
                    onClick={async () => {
                      try {
                        await navigator.clipboard.writeText(icon);
                      } catch (err) {
                        console.error('Failed to copy:', err);
                      }
                    }}
                    title={`Klikk for å kopiere: ${icon}`}
                  >
                    {icon}
                  </Badge>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-4">
                💡 Tips: Bruk disse ikonnavnene i InDesign for å legge til relevante ikoner i annonsene. 
                Ikoner kan brukes ved tjenester, kontaktinfo eller som dekorative elementer.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Bilder Tab */}
        <TabsContent value="bilder" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="h-5 w-5" />
                Bilder fra nettsiden ({content.images.length})
              </CardTitle>
              <CardDescription>
                Klikk på et bilde for å åpne i ny fane
              </CardDescription>
            </CardHeader>
            <CardContent>
              {content.images.length > 0 ? (
                <div className="image-grid">
                  {content.images.map((img, i) => (
                    <a 
                      key={i} 
                      href={img} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="block relative group"
                    >
                      <img
                        src={img}
                        alt={`Bilde ${i + 1}`}
                        className="w-full h-full object-cover rounded-lg border border-border"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                        <ExternalLink className="h-6 w-6 text-white" />
                      </div>
                    </a>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  Ingen bilder funnet på nettsiden
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* E-post Tab */}
        <TabsContent value="epost" className="space-y-4">
          {/* Email for Upgrade 1 */}
          <Card className="border-primary/50">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2 text-primary">
                    <Mail className="h-5 w-5" />
                    E-post for Upgrade 1 ({content.upgradeFormat?.name})
                  </CardTitle>
                  <CardDescription>
                    +kr {content.priceDifference.toLocaleString('nb-NO')} fra bestilt
                  </CardDescription>
                </div>
                <CopyButton text={content.emailDraft} label="Kopier e-post" />
              </div>
            </CardHeader>
            <CardContent>
              <Textarea
                value={content.emailDraft}
                onChange={(e) => onContentChange({ emailDraft: e.target.value })}
                rows={16}
                className="bg-background/50 font-mono text-sm"
              />
            </CardContent>
          </Card>

          {/* Email for Upgrade 2 */}
          {content.secondUpgradeFormat && content.emailDraftSecondUpgrade && (
            <Card className="border-amber-500/50">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
                      <Mail className="h-5 w-5" />
                      E-post for Upgrade 2 ({content.secondUpgradeFormat.name})
                    </CardTitle>
                    <CardDescription>
                      +kr {content.priceDifferenceSecond.toLocaleString('nb-NO')} fra bestilt
                    </CardDescription>
                  </div>
                  <CopyButton text={content.emailDraftSecondUpgrade} label="Kopier e-post" />
                </div>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={content.emailDraftSecondUpgrade}
                  onChange={(e) => onContentChange({ emailDraftSecondUpgrade: e.target.value })}
                  rows={16}
                  className="bg-background/50 font-mono text-sm"
                />
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Eksport Tab */}
        <TabsContent value="eksport" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Ordered Version */}
            <Card className="border-muted">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Bestilt versjon</CardTitle>
                  <CopyButton text={formatOrderedVersion()} label="Kopier alt" />
                </div>
                <CardDescription>
                  {content.orderedFormat.name} ({content.orderedFormat.dimensions})
                </CardDescription>
              </CardHeader>
              <CardContent>
                <pre className="bg-muted/50 p-4 rounded-lg text-sm whitespace-pre-wrap font-mono">
                  {formatOrderedVersion()}
                </pre>
              </CardContent>
            </Card>

            {/* Upgrade 1 Version */}
            {content.upgradeFormat && (
              <Card className="border-primary/50">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base text-primary">Upgrade 1</CardTitle>
                    <CopyButton text={formatUpgrade1Version()} label="Kopier alt" />
                  </div>
                  <CardDescription>
                    {content.upgradeFormat.name} ({content.upgradeFormat.dimensions})
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <pre className="bg-primary/5 p-4 rounded-lg text-sm whitespace-pre-wrap font-mono border border-primary/20">
                    {formatUpgrade1Version()}
                  </pre>
                </CardContent>
              </Card>
            )}

            {/* Upgrade 2 Version */}
            {content.secondUpgradeFormat && (
              <Card className="border-amber-500/50">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base text-amber-600 dark:text-amber-400">Upgrade 2</CardTitle>
                    <CopyButton text={formatUpgrade2Version()} label="Kopier alt" />
                  </div>
                  <CardDescription>
                    {content.secondUpgradeFormat.name} ({content.secondUpgradeFormat.dimensions})
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <pre className="bg-amber-500/5 p-4 rounded-lg text-sm whitespace-pre-wrap font-mono border border-amber-500/20">
                    {formatUpgrade2Version()}
                  </pre>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

