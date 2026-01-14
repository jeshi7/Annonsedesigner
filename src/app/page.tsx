'use client';

import { useState } from 'react';
import { ProjectForm, type ProjectFormData } from '@/components/project-form';
import { ContentGenerator } from '@/components/content-generator';
import { FileUpload, type ExtractedProjectData } from '@/components/file-upload';
import { generateContent, type GeneratedContent } from '@/lib/actions';
import { toast } from 'sonner';
import { 
  Sparkles, 
  BarChart3, 
  Zap,
  ArrowLeft,
  Upload,
  FileText,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null);
  const [currentProject, setCurrentProject] = useState<ProjectFormData | null>(null);
  const [prefillData, setPrefillData] = useState<Partial<ProjectFormData>>({});
  const [activeTab, setActiveTab] = useState('manual');

  const handleDataExtracted = (data: ExtractedProjectData) => {
    // Convert extracted data to form data format
    const formPrefill: Partial<ProjectFormData> = {};
    
    if (data.advertiser) formPrefill.companyName = data.advertiser;
    if (data.website) formPrefill.website = data.website;
    if (data.contactName) formPrefill.contactName = data.contactName;
    if (data.contactEmail) formPrefill.contactEmail = data.contactEmail;
    if (data.contactPhone) formPrefill.contactPhone = data.contactPhone;
    
    // Try to determine format from adSize
    if (data.adSize) {
      const size = data.adSize.toLowerCase();
      if (size.includes('186') && size.includes('55')) formPrefill.orderedFormat = 'banner';
      else if (size.includes('90') && size.includes('55')) formPrefill.orderedFormat = 'visittkort';
      else if (size.includes('186') && size.includes('95')) formPrefill.orderedFormat = 'tredjedel';
      else if (size.includes('210') && size.includes('146')) formPrefill.orderedFormat = 'halvside';
      else if (size.includes('210') && size.includes('297')) formPrefill.orderedFormat = 'helside';
      else if (size.includes('420')) formPrefill.orderedFormat = 'spread';
    }

    // Add email content to notes
    if (data.emailContent) {
      formPrefill.specialNotes = `Fra kundemail:\n${data.emailContent.slice(0, 500)}`;
    }

    setPrefillData(formPrefill);
    setActiveTab('manual'); // Switch to manual tab to show prefilled form
    
    toast.success('Informasjon hentet!', {
      description: `Fant ${Object.keys(formPrefill).length} felter automatisk`,
    });
  };

  const handleSubmit = async (data: ProjectFormData) => {
    setIsLoading(true);
    setCurrentProject(data);

    try {
      const content = await generateContent(
        data.website,
        data.orderedFormat,
        data.contactName
      );
      
      setGeneratedContent(content);
      toast.success('Annonseforslag generert!', {
        description: `Scrapet ${content.scrapedData.pagesScraped} sider, fant ${content.images.length} bilder`,
      });
    } catch (error) {
      console.error('Error generating content:', error);
      toast.error('Kunne ikke generere innhold', {
        description: 'Prøv igjen eller sjekk at nettsiden er tilgjengelig',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleContentChange = (updates: Partial<GeneratedContent>) => {
    if (generatedContent) {
      setGeneratedContent({ ...generatedContent, ...updates });
    }
  };

  const handleRegenerateContent = async () => {
    if (!currentProject || !generatedContent) return;
    
    setIsLoading(true);
    try {
      // Send previous content so LLM can generate NEW variants
      const content = await generateContent(
        currentProject.website,
        currentProject.orderedFormat,
        currentProject.contactName,
        {
          heading: generatedContent.heading,
          subheading: generatedContent.subheading,
          description: generatedContent.description,
        }
      );
      
      setGeneratedContent(content);
      toast.success('Nytt fengende innhold generert!', {
        description: 'Nye catchy headings, subheadings og services',
      });
    } catch (error) {
      console.error('Error regenerating content:', error);
      toast.error('Kunne ikke generere nytt innhold', {
        description: 'Prøv igjen',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setGeneratedContent(null);
    setCurrentProject(null);
    setPrefillData({});
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Header */}
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center">
                <Sparkles className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold gradient-text">JS Norge</h1>
                <p className="text-xs text-muted-foreground">Annonsedesign</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground">
                <Zap className="h-4 w-4 text-yellow-500" />
                <span>Mål: 120-150 annonser/mnd</span>
              </div>
              <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground">
                <BarChart3 className="h-4 w-4 text-primary" />
                <span>Upgrade-fokus</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {!generatedContent ? (
          <div className="max-w-3xl mx-auto">
            {/* Hero Section */}
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-2">
                Lag annonser <span className="gradient-text">effektivt</span>
              </h2>
              <p className="text-muted-foreground">
                Last opp skjermbilde, lim inn e-post, eller fyll inn manuelt
              </p>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid w-full grid-cols-2 h-12">
                <TabsTrigger value="upload" className="gap-2">
                  <Upload className="h-4 w-4" />
                  Last opp / E-post
                </TabsTrigger>
                <TabsTrigger value="manual" className="gap-2">
                  <FileText className="h-4 w-4" />
                  Manuell utfylling
                </TabsTrigger>
              </TabsList>

              <TabsContent value="upload">
                <FileUpload onDataExtracted={handleDataExtracted} />
              </TabsContent>

              <TabsContent value="manual">
                <ProjectForm 
                  onSubmit={handleSubmit} 
                  isLoading={isLoading}
                  prefillData={prefillData}
                />
              </TabsContent>
            </Tabs>

            {/* Tips Section */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="glass p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-8 w-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                    <span className="text-lg">1️⃣</span>
                  </div>
                  <span className="font-medium">Last opp</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Skjermbilde fra prosjektsystem eller kundemail
                </p>
              </div>
              <div className="glass p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-8 w-8 rounded-full bg-green-500/20 flex items-center justify-center">
                    <span className="text-lg">2️⃣</span>
                  </div>
                  <span className="font-medium">Generer</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Vi scraper alle sider og lager forslag
                </p>
              </div>
              <div className="glass p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-8 w-8 rounded-full bg-purple-500/20 flex items-center justify-center">
                    <span className="text-lg">3️⃣</span>
                  </div>
                  <span className="font-medium">Kopier</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Kopier tekst og bruk i InDesign
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="max-w-6xl mx-auto">
            {/* Back Button and Project Info */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Button variant="ghost" onClick={handleReset} className="gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Nytt prosjekt
                </Button>
                <Button 
                  variant="outline" 
                  onClick={handleRegenerateContent} 
                  disabled={isLoading}
                  className="gap-2"
                >
                  <Sparkles className="h-4 w-4" />
                  {isLoading ? 'Genererer...' : 'Generer nytt innhold'}
                </Button>
              </div>
              <div className="text-right">
                <p className="font-semibold">{currentProject?.companyName}</p>
                <p className="text-sm text-muted-foreground">{currentProject?.projectId}</p>
              </div>
            </div>

            <ContentGenerator
              content={generatedContent}
              companyName={currentProject?.companyName || ''}
              onContentChange={handleContentChange}
            />
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="border-t border-border/50 mt-auto">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <p>© 2026 JS Norge – Annonsedesign App</p>
            <p>Versjon 1.1</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
