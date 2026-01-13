'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Eye } from 'lucide-react';
import type { GeneratedContent } from '@/lib/actions';
import { FORMAT_CONTENT_RULES } from '@/lib/text-library';

interface AdLayoutPreviewProps {
  content: GeneratedContent;
  companyName: string;
  formatType: 'ordered' | 'upgrade1' | 'upgrade2';
}

// Layout variants - different visual styles
type LayoutVariant = 'classic' | 'centered' | 'split' | 'minimal' | 'bold';

// Get a consistent layout variant based on company name and format type
function getLayoutVariant(companyName: string, formatType: string): LayoutVariant {
  const variants: LayoutVariant[] = ['classic', 'centered', 'split', 'minimal', 'bold'];
  // Use company name hash to get consistent variant per company
  let hash = 0;
  for (let i = 0; i < companyName.length; i++) {
    hash = ((hash << 5) - hash) + companyName.charCodeAt(i);
    hash = hash & hash;
  }
  const index = Math.abs(hash + formatType.length) % variants.length;
  return variants[index];
}

export function AdLayoutPreview({ content, companyName, formatType }: AdLayoutPreviewProps) {
  // Get the format key and rules
  const formatKey = formatType === 'ordered' 
    ? content.orderedFormatKey 
    : formatType === 'upgrade1' 
    ? content.upgradeFormatKey 
    : content.secondUpgradeFormatKey;

  const formatDetails = formatType === 'ordered'
    ? content.orderedFormat
    : formatType === 'upgrade1'
    ? content.upgradeFormat
    : content.secondUpgradeFormat;

  const rules = formatType === 'ordered'
    ? FORMAT_CONTENT_RULES[content.orderedFormatKey]?.ordered
    : formatType === 'upgrade1'
    ? FORMAT_CONTENT_RULES[content.orderedFormatKey]?.upgrade1
    : FORMAT_CONTENT_RULES[content.orderedFormatKey]?.upgrade2;

  // If we don't have the required data, show a simple visual preview anyway
  if (!formatKey || !formatDetails || !rules) {
    // Use fallback values for preview
    const fallbackFormat = formatType === 'ordered' 
      ? { name: 'Bestilt versjon', dimensions: 'N/A' }
      : formatType === 'upgrade1'
      ? { name: 'Upgrade 1', dimensions: 'N/A' }
      : { name: 'Upgrade 2', dimensions: 'N/A' };
    
    return (
      <Card className="border-2 border-dashed">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Layout-forslag: {fallbackFormat.name}
            </CardTitle>
            <Badge variant="outline" className="text-xs">
              {fallbackFormat.dimensions}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {/* Simple visual preview even without data */}
          <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-lg p-4 mb-4 min-h-[200px] w-full flex items-center justify-center">
            <div className="text-center text-muted-foreground">
              <Eye className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Venter på innhold...</p>
            </div>
          </div>
          <div className="text-xs text-muted-foreground space-y-1 bg-slate-50 dark:bg-slate-900/50 p-3 rounded">
            <p className="font-semibold">Layout-tips:</p>
            <p>Generer innhold først for å se layout-forslag</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Get layout variant for this company/format combination
  const layoutVariant = getLayoutVariant(companyName, formatType);

  // Calculate aspect ratio based on dimensions
  const getAspectRatio = (dimensions: string): string => {
    const match = dimensions.match(/(\d+)×(\d+)/);
    if (match) {
      const width = parseInt(match[1]);
      const height = parseInt(match[2]);
      return `${width} / ${height}`;
    }
    return '16 / 9';
  };

  const aspectRatio = getAspectRatio(formatDetails.dimensions);
  
  // Get content to display
  const services = content.services.slice(0, rules.serviceList || 0);
  const showDescription = rules.description && content.description;
  const showSubheading = rules.subheading && content.subheading;

  // Render different layout variants
  const renderLayout = () => {
    const baseClasses = "bg-white dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-600 rounded-lg p-6 min-h-[300px] w-full shadow-md";
    
    switch (layoutVariant) {
      case 'centered':
        return (
          <div className={baseClasses} style={{ aspectRatio, minHeight: '300px' }}>
            <div className="h-full flex flex-col items-center justify-center gap-3 text-sm text-center">
              {rules.logo && (
                <div className="w-24 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center text-blue-700 dark:text-blue-300 text-xs font-semibold mb-2 border border-blue-300 dark:border-blue-700">
                  [LOGO]
                </div>
              )}
              {rules.heading && (
                <div className="font-bold text-xl leading-tight text-gray-900 dark:text-gray-100">
                  {content.heading}
                </div>
              )}
              {showSubheading && (
                <div className="text-base text-gray-700 dark:text-gray-300 leading-snug max-w-[85%]">
                  {content.subheading}
                </div>
              )}
              {showDescription && (
                <div className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed max-w-[90%]">
                  {formatType === 'upgrade2' && content.description.length > 120
                    ? content.description.substring(0, 120) + '...'
                    : formatType === 'upgrade1' && content.description.length > 60
                    ? content.description.split(/[.!?]/)[0] + '.'
                    : content.description}
                </div>
              )}
              {services.length > 0 && (
                <div className="mt-3 space-y-1 w-full">
                  <div className="font-semibold text-sm text-gray-800 dark:text-gray-200">TJENESTER:</div>
                  <ul className="list-none space-y-1 text-sm text-gray-700 dark:text-gray-300">
                    {services.map((s, i) => (
                      <li key={i} className="leading-tight">• {s}</li>
                    ))}
                  </ul>
                </div>
              )}
              {(rules.contactPhone || rules.contactAddress || rules.contactEmail || rules.website) && (
                <div className="mt-auto pt-3 border-t-2 border-gray-300 dark:border-gray-600 w-full">
                  <div className="font-semibold text-sm text-gray-800 dark:text-gray-200 mb-2">KONTAKT:</div>
                  <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                    {rules.contactPhone && content.phone && <div>📞 {content.phone}</div>}
                    {rules.contactAddress && content.address && <div>📍 {content.address}</div>}
                    {rules.contactEmail && content.email && <div>✉️ {content.email}</div>}
                    {rules.website && <div>🌐 www.{companyName.toLowerCase().replace(/\s+/g, '')}.no</div>}
                  </div>
                </div>
              )}
              {rules.certifications && rules.certifications > 0 && content.certifications.length > 0 && (
                <div className="mt-3 flex gap-2 flex-wrap justify-center">
                  {content.certifications.slice(0, rules.certifications).map((cert, i) => (
                    <Badge key={i} variant="secondary" className="text-xs px-2 py-1">
                      {cert}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>
        );

      case 'split':
        return (
          <div className={baseClasses} style={{ aspectRatio, minHeight: '300px' }}>
            <div className="h-full flex gap-6 text-sm">
              <div className="flex-1 flex flex-col gap-3">
                {rules.logo && (
                  <div className="w-20 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center text-blue-700 dark:text-blue-300 text-xs font-semibold border border-blue-300 dark:border-blue-700">
                    [LOGO]
                  </div>
                )}
                {rules.heading && (
                  <div className="font-bold text-lg leading-tight text-gray-900 dark:text-gray-100">
                    {content.heading}
                  </div>
                )}
                {showSubheading && (
                  <div className="text-base text-gray-700 dark:text-gray-300 leading-snug">
                    {content.subheading}
                  </div>
                )}
                {showDescription && (
                  <div className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                    {formatType === 'upgrade2' && content.description.length > 100
                      ? content.description.substring(0, 100) + '...'
                      : formatType === 'upgrade1' && content.description.length > 60
                      ? content.description.split(/[.!?]/)[0] + '.'
                      : content.description}
                  </div>
                )}
              </div>
              <div className="flex-1 flex flex-col gap-3 border-l-2 border-gray-300 dark:border-gray-600 pl-6">
                {services.length > 0 && (
                  <div className="space-y-2">
                    <div className="font-semibold text-sm text-gray-800 dark:text-gray-200">TJENESTER:</div>
                    <ul className="list-none space-y-1.5 text-sm text-gray-700 dark:text-gray-300">
                      {services.map((s, i) => (
                        <li key={i} className="leading-tight">• {s}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {(rules.contactPhone || rules.contactAddress || rules.contactEmail || rules.website) && (
                  <div className="mt-auto pt-3 border-t-2 border-gray-300 dark:border-gray-600">
                    <div className="font-semibold text-sm text-gray-800 dark:text-gray-200 mb-2">KONTAKT:</div>
                    <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                      {rules.contactPhone && content.phone && <div>📞 {content.phone}</div>}
                      {rules.contactAddress && content.address && <div>📍 {content.address}</div>}
                      {rules.contactEmail && content.email && <div>✉️ {content.email}</div>}
                      {rules.website && <div>🌐 www.{companyName.toLowerCase().replace(/\s+/g, '')}.no</div>}
                    </div>
                  </div>
                )}
                {rules.certifications && rules.certifications > 0 && content.certifications.length > 0 && (
                  <div className="mt-3 flex gap-2 flex-wrap">
                    {content.certifications.slice(0, rules.certifications).map((cert, i) => (
                      <Badge key={i} variant="secondary" className="text-xs px-2 py-1">
                        {cert}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      case 'minimal':
        return (
          <div className={baseClasses} style={{ aspectRatio, minHeight: '300px' }}>
            <div className="h-full flex flex-col gap-3 text-sm">
              <div className="flex items-center justify-between mb-3">
                {rules.logo && (
                  <div className="w-20 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center text-blue-700 dark:text-blue-300 text-xs font-semibold border border-blue-300 dark:border-blue-700">
                    [LOGO]
                  </div>
                )}
                {(rules.contactPhone || rules.contactAddress || rules.contactEmail || rules.website) && (
                  <div className="text-xs text-gray-600 dark:text-gray-400 text-right space-y-1">
                    {rules.contactPhone && content.phone && <div>📞 {content.phone}</div>}
                    {rules.website && <div>🌐 www.{companyName.toLowerCase().replace(/\s+/g, '')}.no</div>}
                  </div>
                )}
              </div>
              {rules.heading && (
                <div className="font-bold text-2xl leading-tight text-gray-900 dark:text-gray-100 mb-2">
                  {content.heading}
                </div>
              )}
              {showSubheading && (
                <div className="text-base text-gray-700 dark:text-gray-300 leading-snug">
                  {content.subheading}
                </div>
              )}
              {services.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {services.map((s, i) => (
                    <span key={i} className="text-xs bg-gray-100 dark:bg-gray-700 px-3 py-1.5 rounded-md text-gray-700 dark:text-gray-300 font-medium">
                      {s}
                    </span>
                  ))}
                </div>
              )}
              {rules.certifications && rules.certifications > 0 && content.certifications.length > 0 && (
                <div className="mt-4 flex gap-2 flex-wrap">
                  {content.certifications.slice(0, rules.certifications).map((cert, i) => (
                    <Badge key={i} variant="secondary" className="text-xs px-2 py-1">
                      {cert}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>
        );

      case 'bold':
        return (
          <div className={baseClasses + " bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 border-blue-300 dark:border-blue-700"} style={{ aspectRatio, minHeight: '300px' }}>
            <div className="h-full flex flex-col gap-4 text-sm">
              {rules.logo && (
                <div className="flex items-center justify-between">
                  <div className="w-24 h-12 bg-blue-200 dark:bg-blue-800 rounded-lg flex items-center justify-center text-blue-800 dark:text-blue-200 text-xs font-bold border-2 border-blue-400 dark:border-blue-600">
                    [LOGO]
                  </div>
                </div>
              )}
              {rules.heading && (
                <div className="font-black text-2xl leading-tight text-gray-900 dark:text-gray-100 uppercase tracking-wide">
                  {content.heading}
                </div>
              )}
              {showSubheading && (
                <div className="text-base font-semibold text-gray-800 dark:text-gray-200 leading-snug">
                  {content.subheading}
                </div>
              )}
              {showDescription && (
                <div className="text-sm text-gray-700 dark:text-gray-400 leading-relaxed font-medium">
                  {formatType === 'upgrade2' && content.description.length > 120
                    ? content.description.substring(0, 120) + '...'
                    : formatType === 'upgrade1' && content.description.length > 70
                    ? content.description.split(/[.!?]/)[0] + '.'
                    : content.description}
                </div>
              )}
              {services.length > 0 && (
                <div className="mt-3 space-y-2">
                  <div className="font-bold text-sm text-gray-900 dark:text-gray-100">TJENESTER:</div>
                  <ul className="list-none space-y-1 text-sm text-gray-700 dark:text-gray-300">
                    {services.map((s, i) => (
                      <li key={i} className="leading-tight font-medium">▶ {s}</li>
                    ))}
                  </ul>
                </div>
              )}
              {(rules.contactPhone || rules.contactAddress || rules.contactEmail || rules.website) && (
                <div className="mt-auto pt-4 border-t-2 border-blue-300 dark:border-blue-600">
                  <div className="font-bold text-sm text-gray-900 dark:text-gray-100 mb-2">KONTAKT:</div>
                  <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400 font-medium">
                    {rules.contactPhone && content.phone && <div>📞 {content.phone}</div>}
                    {rules.contactAddress && content.address && <div>📍 {content.address}</div>}
                    {rules.contactEmail && content.email && <div>✉️ {content.email}</div>}
                    {rules.website && <div>🌐 www.{companyName.toLowerCase().replace(/\s+/g, '')}.no</div>}
                  </div>
                </div>
              )}
              {rules.certifications && rules.certifications > 0 && content.certifications.length > 0 && (
                <div className="mt-3 flex gap-2 flex-wrap">
                  {content.certifications.slice(0, rules.certifications).map((cert, i) => (
                    <Badge key={i} variant="secondary" className="text-xs px-2 py-1 bg-blue-200 text-blue-800">
                      {cert}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>
        );

      default: // 'classic'
        return (
          <div className={baseClasses} style={{ aspectRatio, minHeight: '300px' }}>
            <div className="h-full flex flex-col gap-3 text-sm">
              {rules.logo && (
                <div className="flex items-center justify-start mb-2">
                  <div className="w-20 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center text-blue-700 dark:text-blue-300 text-xs font-semibold border border-blue-300 dark:border-blue-700">
                    [LOGO]
                  </div>
                </div>
              )}
              {rules.heading && (
                <div className="font-bold text-xl leading-tight text-gray-900 dark:text-gray-100">
                  {content.heading}
                </div>
              )}
              {showSubheading && (
                <div className="text-base text-gray-700 dark:text-gray-300 leading-snug">
                  {content.subheading}
                </div>
              )}
              {showDescription && (
                <div className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mt-2">
                  {formatType === 'upgrade2' && content.description.length > 150
                    ? content.description.substring(0, 150) + '...'
                    : formatType === 'upgrade1' && content.description.length > 80
                    ? content.description.split(/[.!?]/)[0] + '.'
                    : content.description}
                </div>
              )}
              {services.length > 0 && (
                <div className="mt-3 space-y-2">
                  <div className="font-semibold text-sm text-gray-800 dark:text-gray-200">TJENESTER:</div>
                  <ul className="list-none space-y-1.5 text-sm text-gray-700 dark:text-gray-300">
                    {services.map((s, i) => (
                      <li key={i} className="leading-tight">• {s}</li>
                    ))}
                  </ul>
                </div>
              )}
              {(rules.contactPhone || rules.contactAddress || rules.contactEmail || rules.website) && (
                <div className="mt-auto pt-4 border-t-2 border-gray-300 dark:border-gray-600">
                  <div className="font-semibold text-sm text-gray-800 dark:text-gray-200 mb-2">KONTAKT:</div>
                  <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                    {rules.contactPhone && content.phone && <div>📞 {content.phone}</div>}
                    {rules.contactAddress && content.address && <div>📍 {content.address}</div>}
                    {rules.contactEmail && content.email && <div>✉️ {content.email}</div>}
                    {rules.website && <div>🌐 www.{companyName.toLowerCase().replace(/\s+/g, '')}.no</div>}
                  </div>
                </div>
              )}
              {rules.certifications && rules.certifications > 0 && content.certifications.length > 0 && (
                <div className="mt-3 flex gap-2 flex-wrap">
                  {content.certifications.slice(0, rules.certifications).map((cert, i) => (
                    <Badge key={i} variant="secondary" className="text-xs px-2 py-1">
                      {cert}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>
        );
    }
  };

  return (
    <Card className="border-2 border-primary/20">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Eye className="h-4 w-4 text-primary" />
            Layout-forslag: {formatDetails.name}
          </CardTitle>
          <Badge variant="outline" className="text-xs">
            {formatDetails.dimensions}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Visual Layout Preview */}
        <div className="w-full mb-4">
          {renderLayout()}
        </div>

        {/* Layout Guidelines - Separate section below preview */}
        <div className="text-xs text-muted-foreground space-y-1 bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <p className="font-semibold text-gray-800 dark:text-gray-200 mb-2">
            Layout-tips ({layoutVariant}):
          </p>
          <ul className="list-disc list-inside space-y-0.5 ml-2">
            {layoutVariant === 'centered' && (
              <>
                <li>Alt innhold er sentrert for balansert utseende</li>
                <li>Logo plasseres øverst, sentrert</li>
                <li>Heading er større og mer fremtredende</li>
                <li>Perfekt for moderne, minimalistiske design</li>
              </>
            )}
            {layoutVariant === 'split' && (
              <>
                <li>Innholdet er delt i to kolonner</li>
                <li>Venstre: Logo, heading, beskrivelse</li>
                <li>Høyre: Tjenester og kontaktinfo</li>
                <li>Gir god plassutnyttelse for større formater</li>
              </>
            )}
            {layoutVariant === 'minimal' && (
              <>
                <li>Kompakt layout med fokus på essensielt</li>
                <li>Logo og kontaktinfo i header</li>
                <li>Tjenester som badges for rask scanning</li>
                <li>Perfekt for mindre formater</li>
              </>
            )}
            {layoutVariant === 'bold' && (
              <>
                <li>Bold, dynamisk layout med sterk visuell hierarki</li>
                <li>Heading er større og uppercase</li>
                <li>Farger og kontraster for å trekke oppmerksomhet</li>
                <li>Perfekt for å stå ut fra konkurrentene</li>
              </>
            )}
            {layoutVariant === 'classic' && (
              <>
                <li>Klassisk vertikal layout</li>
                <li>Logo øverst, deretter heading og innhold</li>
                <li>Tjenester som liste, kontaktinfo nederst</li>
                <li>Trygg og profesjonell stil</li>
              </>
            )}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

