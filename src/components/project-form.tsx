'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { INDUSTRIES, AD_FORMATS, getUpgradeFormat, getFormatDetails } from '@/lib/text-library';
import { Loader2, Sparkles, Globe, Building2, FileText } from 'lucide-react';

interface ProjectFormProps {
  onSubmit: (data: ProjectFormData) => void;
  isLoading?: boolean;
  prefillData?: Partial<ProjectFormData>;
}

export interface ProjectFormData {
  projectId: string;
  companyName: string;
  website: string;
  orderedFormat: string;
  industry: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  specialNotes: string;
}

export function ProjectForm({ onSubmit, isLoading = false, prefillData }: ProjectFormProps) {
  const [formData, setFormData] = useState<ProjectFormData>({
    projectId: '',
    companyName: '',
    website: '',
    orderedFormat: '',
    industry: '',
    contactName: '',
    contactEmail: '',
    contactPhone: '',
    specialNotes: '',
  });

  // Update form when prefillData changes
  useEffect(() => {
    if (prefillData && Object.keys(prefillData).length > 0) {
      setFormData(prev => ({ ...prev, ...prefillData }));
    }
  }, [prefillData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (field: keyof ProjectFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const selectedFormat = formData.orderedFormat ? getFormatDetails(formData.orderedFormat) : null;
  const upgradeKey = formData.orderedFormat ? getUpgradeFormat(formData.orderedFormat) : null;
  const upgradeFormat = upgradeKey ? getFormatDetails(upgradeKey) : null;

  return (
    <Card className="glass border-primary/20">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-xl">
          <FileText className="h-5 w-5 text-primary" />
          Nytt annonseprosjekt
        </CardTitle>
        <CardDescription>
          Fyll inn prosjektdetaljer for å generere annonseforslag
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Row 1: Project ID and Company Name */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="projectId" className="text-sm font-medium">
                Prosjekt-ID (NOC-nummer)
              </Label>
              <Input
                id="projectId"
                placeholder="NOC123456"
                value={formData.projectId}
                onChange={(e) => handleChange('projectId', e.target.value)}
                className="bg-background/50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="companyName" className="text-sm font-medium flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Firmanavn
              </Label>
              <Input
                id="companyName"
                placeholder="Bedrift AS"
                value={formData.companyName}
                onChange={(e) => handleChange('companyName', e.target.value)}
                required
                className="bg-background/50"
              />
            </div>
          </div>

          {/* Row 2: Website */}
          <div className="space-y-2">
            <Label htmlFor="website" className="text-sm font-medium flex items-center gap-2">
              <Globe className="h-4 w-4" />
              Nettside
            </Label>
            <Input
              id="website"
              type="url"
              placeholder="https://www.bedrift.no"
              value={formData.website}
              onChange={(e) => handleChange('website', e.target.value)}
              required
              className="bg-background/50"
            />
          </div>

          {/* Row 3: Format and Industry */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="orderedFormat" className="text-sm font-medium">
                Bestilt format
              </Label>
              <Select
                value={formData.orderedFormat}
                onValueChange={(value) => handleChange('orderedFormat', value)}
              >
                <SelectTrigger className="bg-background/50">
                  <SelectValue placeholder="Velg format" />
                </SelectTrigger>
                <SelectContent>
                  {AD_FORMATS.map((format) => (
                    <SelectItem key={format.value} value={format.value}>
                      {format.label} ({format.dimensions}) – kr {format.price.toLocaleString('nb-NO')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedFormat && upgradeFormat && (
                <p className="text-xs text-muted-foreground mt-1">
                  → Upgrade: <span className="text-primary font-medium">{upgradeFormat.label}</span> ({upgradeFormat.dimensions}) – +kr {(upgradeFormat.price - selectedFormat.price).toLocaleString('nb-NO')}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="industry" className="text-sm font-medium">
                Bransje
              </Label>
              <Select
                value={formData.industry}
                onValueChange={(value) => handleChange('industry', value)}
              >
                <SelectTrigger className="bg-background/50">
                  <SelectValue placeholder="Velg bransje" />
                </SelectTrigger>
                <SelectContent>
                  {INDUSTRIES.map((industry) => (
                    <SelectItem key={industry.value} value={industry.value}>
                      {industry.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Row 4: Contact Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="contactName" className="text-sm font-medium">
                Kontaktperson
              </Label>
              <Input
                id="contactName"
                placeholder="Ola Nordmann"
                value={formData.contactName}
                onChange={(e) => handleChange('contactName', e.target.value)}
                className="bg-background/50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contactEmail" className="text-sm font-medium">
                E-post
              </Label>
              <Input
                id="contactEmail"
                type="email"
                placeholder="ola@bedrift.no"
                value={formData.contactEmail}
                onChange={(e) => handleChange('contactEmail', e.target.value)}
                className="bg-background/50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contactPhone" className="text-sm font-medium">
                Telefon
              </Label>
              <Input
                id="contactPhone"
                placeholder="+47 123 45 678"
                value={formData.contactPhone}
                onChange={(e) => handleChange('contactPhone', e.target.value)}
                className="bg-background/50"
              />
            </div>
          </div>

          {/* Row 5: Special Notes */}
          <div className="space-y-2">
            <Label htmlFor="specialNotes" className="text-sm font-medium">
              Spesielle notater
            </Label>
            <Textarea
              id="specialNotes"
              placeholder="Ekstra informasjon fra prosjektkonsulent, spesielle ønsker fra kunde, etc."
              value={formData.specialNotes}
              onChange={(e) => handleChange('specialNotes', e.target.value)}
              rows={3}
              className="bg-background/50 resize-none"
            />
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isLoading || !formData.companyName || !formData.website || !formData.orderedFormat || !formData.industry}
            className="w-full h-12 text-base font-semibold"
            size="lg"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Analyserer nettside...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-5 w-5" />
                Generer annonseforslag
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

