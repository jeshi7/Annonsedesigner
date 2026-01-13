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

export function AdLayoutPreview({ content, companyName, formatType }: AdLayoutPreviewProps) {
  // Get the format key and rules
  const formatKey = formatType === 'ordered' 
    ? content.orderedFormatKey 
    : formatType === 'upgrade1' 
    ? content.upgradeFormatKey 
    : content.secondUpgradeFormatKey;

  if (!formatKey) return null;

  const formatDetails = formatType === 'ordered'
    ? content.orderedFormat
    : formatType === 'upgrade1'
    ? content.upgradeFormat
    : content.secondUpgradeFormat;

  if (!formatDetails) return null;

  const rules = formatType === 'ordered'
    ? FORMAT_CONTENT_RULES[content.orderedFormatKey]?.ordered
    : formatType === 'upgrade1'
    ? FORMAT_CONTENT_RULES[content.orderedFormatKey]?.upgrade1
    : FORMAT_CONTENT_RULES[content.orderedFormatKey]?.upgrade2;

  if (!rules) return null;

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

  return (
    <Card className="border-2">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Eye className="h-4 w-4" />
            Layout-forslag: {formatDetails.name}
          </CardTitle>
          <Badge variant="outline" className="text-xs">
            {formatDetails.dimensions}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {/* Visual Layout Preview */}
        <div 
          className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-lg p-4 mb-4"
          style={{ aspectRatio }}
        >
          <div className="h-full flex flex-col gap-2 text-xs">
            {/* Logo Area */}
            {rules.logo && (
              <div className="flex items-center justify-start mb-2">
                <div className="w-16 h-8 bg-slate-300 dark:bg-slate-600 rounded flex items-center justify-center text-slate-500 dark:text-slate-400 text-[10px] font-medium">
                  [LOGO]
                </div>
              </div>
            )}

            {/* Heading */}
            {rules.heading && (
              <div className="font-bold text-base leading-tight text-slate-900 dark:text-slate-100">
                {content.heading}
              </div>
            )}

            {/* Subheading */}
            {showSubheading && (
              <div className="text-sm text-slate-700 dark:text-slate-300 leading-snug">
                {content.subheading}
              </div>
            )}

            {/* Description */}
            {showDescription && (
              <div className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mt-1">
                {formatType === 'upgrade2' && content.description.length > 150
                  ? content.description.substring(0, 150) + '...'
                  : formatType === 'upgrade1' && content.description.length > 80
                  ? content.description.split(/[.!?]/)[0] + '.'
                  : content.description}
              </div>
            )}

            {/* Services */}
            {services.length > 0 && (
              <div className="mt-2 space-y-1">
                <div className="font-semibold text-xs text-slate-800 dark:text-slate-200">
                  TJENESTER:
                </div>
                <ul className="list-disc list-inside space-y-0.5 text-xs text-slate-700 dark:text-slate-300 ml-2">
                  {services.map((service, i) => (
                    <li key={i} className="leading-tight">{service}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Contact Info */}
            {(rules.contactPhone || rules.contactAddress || rules.contactEmail || rules.website) && (
              <div className="mt-auto pt-2 border-t border-slate-300 dark:border-slate-600">
                <div className="font-semibold text-xs text-slate-800 dark:text-slate-200 mb-1">
                  KONTAKT:
                </div>
                <div className="space-y-0.5 text-xs text-slate-600 dark:text-slate-400">
                  {rules.contactPhone && content.phone && (
                    <div>📞 {content.phone}</div>
                  )}
                  {rules.contactAddress && content.address && (
                    <div>📍 {content.address}</div>
                  )}
                  {rules.contactEmail && content.email && (
                    <div>✉️ {content.email}</div>
                  )}
                  {rules.website && (
                    <div>🌐 www.{companyName.toLowerCase().replace(/\s+/g, '')}.no</div>
                  )}
                </div>
              </div>
            )}

            {/* Certifications */}
            {rules.certifications && rules.certifications > 0 && content.certifications.length > 0 && (
              <div className="mt-2 flex gap-1 flex-wrap">
                {content.certifications.slice(0, rules.certifications).map((cert, i) => (
                  <Badge key={i} variant="secondary" className="text-[10px] px-1.5 py-0">
                    {cert}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Layout Guidelines */}
        <div className="text-xs text-muted-foreground space-y-1 bg-slate-50 dark:bg-slate-900/50 p-3 rounded">
          <p className="font-semibold text-slate-700 dark:text-slate-300">Layout-tips:</p>
          <ul className="list-disc list-inside space-y-0.5 ml-2">
            <li>Logo plasseres øverst, venstre eller sentrert</li>
            <li>Heading skal være størst og mest fremtredende</li>
            <li>Subheading og beskrivelse skal være lesbar, men mindre enn heading</li>
            {services.length > 0 && <li>Tjenester kan listes vertikalt eller i kolonner</li>}
            <li>Kontaktinfo plasseres nederst, gjerne i en egen seksjon</li>
            {rules.certifications && rules.certifications > 0 && (
              <li>Sertifiseringer kan plasseres ved logo eller nederst</li>
            )}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

