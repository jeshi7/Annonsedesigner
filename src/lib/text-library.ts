// ============================================
// JS NORGE ANNONSEDESIGN - TEKSTBIBLIOTEK
// ============================================
// Dette biblioteket inneholder alle ferdige tekster
// organisert etter bransje for rask annonselaging.

export const INDUSTRIES = [
  // Bygg & Håndverk
  { value: 'bygg_anlegg', label: 'Bygg & Anlegg' },
  { value: 'handverk', label: 'Håndverk' },
  { value: 'elektro', label: 'Elektro & Elektriker' },
  { value: 'rorlegger', label: 'Rørlegger & VVS' },
  { value: 'maler_gulv', label: 'Maler & Gulvlegger' },
  { value: 'tak_blikkenslager', label: 'Tak & Blikkenslager' },
  { value: 'isolasjon_bygningsmaterialer', label: 'Isolasjon & Bygningsmaterialer' },
  { value: 'glass_fasade', label: 'Glass & Fasade' },
  { value: 'ventilasjon_klima', label: 'Ventilasjon & Klima' },
  { value: 'brann_sikkerhet', label: 'Brann & Sikkerhet' },
  
  // Transport & Logistikk
  { value: 'transport_logistikk', label: 'Transport & Logistikk' },
  { value: 'flyttebyra', label: 'Flyttebyrå' },
  { value: 'taxi_persontransport', label: 'Taxi & Persontransport' },
  { value: 'shipping_spedisjon', label: 'Shipping & Spedisjon' },
  
  // Bil & Maskin
  { value: 'bil_verksted', label: 'Bil & Verksted' },
  { value: 'bilforhandler', label: 'Bilforhandler' },
  { value: 'maskin_utstyr', label: 'Maskin & Utstyr' },
  { value: 'landbruk', label: 'Landbruk & Skogbruk' },
  { value: 'marine_bat', label: 'Marine & Båt' },
  
  // Mat & Drikke
  { value: 'restaurant_mat', label: 'Restaurant & Café' },
  { value: 'bakeri_konditori', label: 'Bakeri & Konditori' },
  { value: 'catering', label: 'Catering & Selskapsmat' },
  { value: 'dagligvare', label: 'Dagligvare & Butikk' },
  
  // Helse & Velvære
  { value: 'helse_velvære', label: 'Helse & Velvære' },
  { value: 'tannlege', label: 'Tannlege & Tannhelse' },
  { value: 'fysioterapi', label: 'Fysioterapi & Rehabilitering' },
  { value: 'apotek', label: 'Apotek & Helsekost' },
  { value: 'veterinær', label: 'Veterinær & Dyreklinikk' },
  { value: 'optiker', label: 'Optiker & Syn' },
  { value: 'frisør_skjønnhet', label: 'Frisør & Skjønnhet' },
  { value: 'spa_massasje', label: 'Spa & Massasje' },
  
  // Kontor & Rådgivning
  { value: 'regnskap_revisjon', label: 'Regnskap & Revisjon' },
  { value: 'advokat_juridisk', label: 'Advokat & Juridisk' },
  { value: 'konsulent', label: 'Konsulent & Rådgivning' },
  { value: 'hr_rekruttering', label: 'HR & Rekruttering' },
  
  // Finans & Forsikring
  { value: 'bank_finans', label: 'Bank & Finans' },
  { value: 'forsikring', label: 'Forsikring' },
  
  // Eiendom
  { value: 'eiendom_megling', label: 'Eiendom & Megling' },
  { value: 'eiendomsforvaltning', label: 'Eiendomsforvaltning' },
  
  // IT & Media
  { value: 'teknologi_it', label: 'Teknologi & IT' },
  { value: 'webutvikling', label: 'Webutvikling & Design' },
  { value: 'markedsforing', label: 'Markedsføring & Reklame' },
  { value: 'foto_video', label: 'Foto & Video' },
  { value: 'trykk_grafisk', label: 'Trykk & Grafisk' },
  
  // Service
  { value: 'renhold_vaktmester', label: 'Renhold & Vaktmester' },
  { value: 'vakthold', label: 'Vakthold & Sikkerhet' },
  { value: 'avfall_gjenvinning', label: 'Avfall & Gjenvinning' },
  
  // Utdanning & Barn
  { value: 'barnehage', label: 'Barnehage & SFO' },
  { value: 'skole_utdanning', label: 'Skole & Utdanning' },
  { value: 'kurs_opplaering', label: 'Kurs & Opplæring' },
  
  // Fritid & Hobby
  { value: 'sport_fritid', label: 'Sport & Fritid' },
  { value: 'reiseliv_turisme', label: 'Reiseliv & Turisme' },
  { value: 'hotell_overnatting', label: 'Hotell & Overnatting' },
  { value: 'hage_utemiljo', label: 'Hage & Utemiljø' },
  
  // Industri
  { value: 'industri_produksjon', label: 'Industri & Produksjon' },
  { value: 'energi_kraft', label: 'Energi & Kraft' },
  { value: 'olje_gass', label: 'Olje & Gass' },
  { value: 'fiskeri_havbruk', label: 'Fiskeri & Havbruk' },
  
  // Begravelse & Kirke
  { value: 'begravelse', label: 'Begravelsesbyrå' },
  { value: 'kirke_trossamfunn', label: 'Kirke & Trossamfunn' },
  
  // Annet
  { value: 'annet', label: 'Annet' },
] as const;

export type IndustryKey = typeof INDUSTRIES[number]['value'];

// ============================================
// HEADINGS PER BRANSJE
// ============================================

// Partial - ikke alle bransjer trenger egne headings, bruker fallback til 'annet'
export const HEADINGS: Partial<Record<IndustryKey, string[]>> = {
  bygg_anlegg: [
    'Fra fundament til ferdig bygg',
    'Solid håndverk – lokale røtter',
    'Vi bygger fremtiden din',
    'Kvalitet i hver detalj',
    'Din lokale byggmester',
    'Pålitelig partner i alle prosjekter',
    'Erfaring du kan stole på',
    'Vi reiser bygg som varer',
    'Totalentreprenør med lokal forankring',
    'Fra idé til nøkkelferdig',
  ],
  transport_logistikk: [
    'Vi flytter mer enn gods',
    'Trygg transport – alltid i rute',
    'Fra A til B – enkelt og effektivt',
    'Logistikk som leverer',
    'Din partner på veien',
    'Helhetlige løsninger for logistikk og trafikk',
    'Vi holder hjulene i gang',
    'Effektiv transport – lokalt og nasjonalt',
    'Når det må frem – ring oss',
    'Pålitelig levering hver gang',
  ],
  handverk: [
    'Fagfolk du kan stole på',
    'Håndverk med tradisjon',
    'Vi fikser det – garantert',
    'Lokale eksperter, rask respons',
    'Kvalitetsarbeid i generasjoner',
    'Din lokale håndverker',
    'Solid arbeid siden {ÅR}',
    'Erfarne hender, varige resultater',
    'Vi tar jobben – du slipper bekymringer',
    'Når det skal gjøres riktig',
  ],
  restaurant_mat: [
    'Smak av {STED}',
    'Mat laget med kjærlighet',
    'Fra vårt kjøkken til ditt bord',
    'Lokale råvarer, unike smaker',
    'Velkommen til bords',
    'Kulinariske opplevelser',
    'Tradisjon møter innovasjon',
    'Her lages maten fra bunnen',
    'Smaksopplevelser du husker',
    'Din lokale matdestinasjon',
  ],
  helse_velvære: [
    'Din helse – vår prioritet',
    'Omsorg i trygge hender',
    'Vi ser hele mennesket',
    'Bedre helse starter her',
    'Personlig oppfølging, varige resultater',
    'Profesjonell behandling med varme',
    'Din vei til bedre helse',
    'Vi tar oss tid til deg',
    'Helhetlig tilnærming til helse',
    'Fagkunnskap du kan stole på',
  ],
  teknologi_it: [
    'Digitale løsninger som virker',
    'Teknologi tilpasset din bedrift',
    'Vi forenkler det komplekse',
    'Sikker IT – trygg fremtid',
    'Innovasjon møter erfaring',
    'Din digitale partner',
    'Fremtidsrettet teknologi',
    'IT-løsninger som vokser med deg',
    'Smart teknologi, enkel hverdag',
    'Vi bygger digital infrastruktur',
  ],
  eiendom_megling: [
    'Vi finner drømmehjemmet ditt',
    'Lokal kunnskap, personlig service',
    'Din boligreise starter her',
    'Trygg handel i {ANTALL} år',
    'Eiendomsmegling med hjerte',
    'Vi kjenner markedet',
    'Personlig oppfølging hele veien',
    'Din lokale eiendomspartner',
    'Vi selger mer enn hus',
    'Erfaring som gir resultater',
  ],
  isolasjon_bygningsmaterialer: [
    'Isolasjon som beskytter og varer',
    'Energieffektivitet for fremtiden',
    'Kvalitetsmaterialer fra grunnen',
    'Bygg smartere, lev bedre',
    'Bærekraftige løsninger',
    'Materialer som holder mål',
    'Vi isolerer fremtiden',
    'Kvalitet i alle ledd',
    'Energismart fra start',
    'Brannsikkert og varig',
  ],
  renhold_vaktmester: [
    'Renhet du kan se',
    'Vi tar vare på bygget ditt',
    'Profesjonelt renhold – hver gang',
    'Din partner for rent miljø',
    'Pålitelig vaktmesterservice',
    'Vi holder orden',
    'Renhold med kvalitet',
    'Trygg drift, rent resultat',
    'Vi tar jobben – du nyter resultatet',
    'Helhetlig eiendomsservice',
  ],
  bil_verksted: [
    'Vi tar vare på bilen din',
    'Verksted du kan stole på',
    'Kvalitetsservice for din bil',
    'Eksperter på alle merker',
    'Din bil i trygge hender',
    'Vi holder deg på veien',
    'Fagfolk med billidenskap',
    'Moderne verksted – tradisjonelle verdier',
    'Rask service, varige løsninger',
    'Alt for bilen – ett sted',
  ],
  bank_finans: [
    'Din økonomiske partner',
    'Trygg økonomi for fremtiden',
    'Vi forstår dine behov',
    'Personlig rådgivning',
    'Lokalkunnskap, global styrke',
    'Finansielle løsninger som passer deg',
    'Vi bygger økonomisk trygghet',
    'Din lokale bankpartner',
    'Sammen om din økonomi',
    'Rådgivning du kan stole på',
  ],
  frisør_skjønnhet: [
    'Din tid for deg selv',
    'Skjønnhet i fokus',
    'Vi får deg til å stråle',
    'Profesjonelt og personlig',
    'Din lokale skjønnhetssalong',
    'Vi skaper din stil',
    'Velfortjent velvære',
    'Eksperter på deg',
    'Stil og kvalitet',
    'Din daglige luksus',
  ],
  landbruk: [
    'Fra jord til bord',
    'Bærekraftig landbruk',
    'Lokale røtter, sterk vekst',
    'Vi dyrker fremtiden',
    'Tradisjon og innovasjon',
    'Kvalitet fra gården',
    'Din lokale produsent',
    'Naturlig kvalitet',
    'Vi leverer fra naturen',
    'Ekte smaker, lokalt produsert',
  ],
  regnskap_revisjon: [
    'Orden i tallene',
    'Din økonomiske rådgiver',
    'Vi tar oss av regnskapet',
    'Profesjonell regnskapsførsel',
    'Trygg økonomi, god oversikt',
    'Regnskap med innsikt',
    'Din partner for økonomi',
    'Vi gir deg kontrollen',
    'Effektiv regnskapsservice',
    'Tall som gir mening',
  ],
  advokat_juridisk: [
    'Juridisk trygghet',
    'Vi står på din side',
    'Erfarne advokater',
    'Rett rådgivning',
    'Din juridiske partner',
    'Vi løser saken',
    'Kompetanse du kan stole på',
    'Personlig oppfølging',
    'Juridisk bistand når du trenger det',
    'Vi kjemper for deg',
  ],
  annet: [
    'Kvalitet i alt vi gjør',
    'Din lokale partner',
    'Service du kan stole på',
    'Erfaring og kompetanse',
    'Vi leverer resultater',
    'Profesjonelt og pålitelig',
    'Her for deg',
    'Lokale røtter, sterke verdier',
    'Alltid til tjeneste',
    'Din foretrukne leverandør',
  ],
};

// ============================================
// SUBHEADINGS PER BRANSJE
// ============================================

export const SUBHEADINGS: Partial<Record<IndustryKey, string[]>> = {
  bygg_anlegg: [
    'Vi utfører alt fra grunnarbeid til ferdigstillelse – med fokus på kvalitet og tidsfrist.',
    'Totalentreprenør med {ANTALL} års erfaring i {STED}-regionen.',
    'Fra små rehabiliteringsprosjekter til store nybygg.',
    'Sertifisert håndverk med garanti på alle oppdrag.',
  ],
  transport_logistikk: [
    'Vi utfører alt innen graving, strøing, feiing, riving, kranbiltjenester og massetransport.',
    'Helhetlige transportløsninger for næringsliv og privatpersoner.',
    'Pålitelig levering med moderne bilpark og erfarne sjåfører.',
    'Fra maskinflytt til containertjenester – vi har kapasiteten.',
  ],
  handverk: [
    'Sertifiserte fagfolk med dokumentert erfaring og kvalitetsfokus.',
    'Vi tar små og store oppdrag – alltid med samme dedikasjon.',
    'Lokal håndverker med døgnservice når det haster.',
    'Komplett service fra befaring til ferdig resultat.',
  ],
  restaurant_mat: [
    'Ferske råvarer fra lokale produsenter, tilberedt med lidenskap.',
    'Catering, take-away og selskapsmat for alle anledninger.',
    'Vi skaper matopplevelser du vil huske.',
    'Åpent kjøkken der du kan se maten bli til.',
  ],
  helse_velvære: [
    'Erfarne terapeuter med fokus på din individuelle situasjon.',
    'Moderne behandlingsmetoder kombinert med helhetlig tilnærming.',
    'Vi tar oss tid til å lytte og forstå dine behov.',
    'Forebygging og behandling i trygge omgivelser.',
  ],
  teknologi_it: [
    'Skreddersydde IT-løsninger for små og mellomstore bedrifter.',
    'Fra skyløsninger til lokal support – vi er der du trenger oss.',
    'Sikkerhet, effektivitet og brukervennlighet i fokus.',
    'Din digitale partner fra rådgivning til implementering.',
  ],
  eiendom_megling: [
    'Vi kjenner {STED}-markedet og gir deg best mulig pris.',
    'Personlig oppfølging fra første visning til overtakelse.',
    'Profesjonell verdivurdering og markedsføring.',
    'Din lokale megler med nasjonalt nettverk.',
  ],
  isolasjon_bygningsmaterialer: [
    'Brannsikker isolasjon av naturlig stein – tåler over 1000°C.',
    'Energieffektive løsninger som varer hele byggets levetid.',
    'Sertifiserte produkter med dokumentert kvalitet.',
    'Bærekraftige materialer som er 100% resirkulerbare.',
  ],
  renhold_vaktmester: [
    'Profesjonelt renhold for næringsliv og borettslag.',
    'Fast avtale eller enkeltoppdrag – vi tilpasser oss.',
    'Miljøvennlige produkter og effektive metoder.',
    'Helhetlig eiendomsservice – alt på ett sted.',
  ],
  bil_verksted: [
    'Autorisert verksted for alle bilmerker.',
    'EU-kontroll, service og reparasjoner.',
    'Originale og kvalitetsgodkjente deler.',
    'Moderne diagnoseutstyr og erfarne mekanikere.',
  ],
  bank_finans: [
    'Personlig rådgivning tilpasset din livssituasjon.',
    'Konkurransedyktige betingelser på lån og sparing.',
    'Digital bank med lokal tilstedeværelse.',
    'Vi hjelper deg å realisere drømmene dine.',
  ],
  frisør_skjønnhet: [
    'Erfarne stylister som holder seg oppdatert på trender.',
    'Vi bruker kun produkter av høy kvalitet.',
    'Personlig konsultasjon for å finne din stil.',
    'En avslappende opplevelse i hyggelige omgivelser.',
  ],
  landbruk: [
    'Bærekraftig produksjon med respekt for naturen.',
    'Lokale produkter med kort vei fra jord til bord.',
    'Moderne metoder med tradisjonelle verdier.',
    'Kvalitet du kan smake forskjellen på.',
  ],
  regnskap_revisjon: [
    'Vi tar oss av regnskapet så du kan fokusere på kjernevirksomheten.',
    'Digitale løsninger som gir deg oversikt i sanntid.',
    'Autorisert regnskapsfører med bred bransjeerfaring.',
    'Personlig oppfølging og proaktiv rådgivning.',
  ],
  advokat_juridisk: [
    'Bred kompetanse innen privatrett og forretningsjus.',
    'Vi gir deg klare svar og tydelige anbefalinger.',
    'Erfarne advokater som kjemper for dine interesser.',
    'Fast pris eller timeavtale – du velger.',
  ],
  annet: [
    'Vi tilpasser oss dine behov og leverer alltid kvalitet.',
    'Erfaren leverandør med fokus på kundetilfredshet.',
    'Lokalt forankret med landsdekkende kapasitet.',
    'Din partner for profesjonelle løsninger.',
  ],
};

// ============================================
// TJENESTELISTER PER BRANSJE
// ============================================

export const SERVICE_LISTS: Partial<Record<IndustryKey, string[]>> = {
  bygg_anlegg: [
    'Nybygg',
    'Rehabilitering',
    'Tilbygg og påbygg',
    'Grunnarbeid',
    'Betongarbeid',
    'Tømrerarbeid',
    'Fasadearbeider',
    'Baderom og våtrom',
    'Kjøkkenmontering',
    'Takarbeider',
    'Drenering',
    'Muring og flislegging',
  ],
  transport_logistikk: [
    'Gravearbeid',
    'Riving',
    'Massetransport',
    'Maskinflytt',
    'Drenering',
    'Brøyting',
    'Strøing',
    'Kranbiltjenester',
    'Containertjenester',
    'Snørydding',
    'Asfaltering',
    'Varetransport',
  ],
  handverk: [
    'Rørleggerarbeid',
    'Elektrikerarbeid',
    'Snekkerarbeid',
    'Malerarbeid',
    'Flislegging',
    'Taktekking',
    'VVS-service',
    'Akutt service',
    'Vedlikehold',
    'Renovering',
  ],
  restaurant_mat: [
    'Frokost',
    'Lunsj',
    'Middag',
    'Catering',
    'Take-away',
    'Selskapsmat',
    'Kaker og dessert',
    'Lokale råvarer',
    'Vegetar/vegan',
    'Glutenfritt',
  ],
  helse_velvære: [
    'Fysioterapi',
    'Kiropraktikk',
    'Massasje',
    'Akupunktur',
    'Ernæringsveiledning',
    'Treningsveiledning',
    'Mental helse',
    'Rehabilitering',
    'Forebygging',
    'Bedriftshelsetjenester',
  ],
  teknologi_it: [
    'IT-support',
    'Skyløsninger',
    'Nettverk og infrastruktur',
    'Sikkerhet og backup',
    'Webutvikling',
    'Systemintegrasjon',
    'Rådgivning',
    'Drift og vedlikehold',
    'Lisenshåndtering',
    'Opplæring',
  ],
  eiendom_megling: [
    'Boligsalg',
    'Boligkjøp',
    'Verdivurdering',
    'Utleiemegling',
    'Næringseiendom',
    'Nybygg',
    'Fritidsbolig',
    'Arv og skifte',
    'Boligstyling',
    'Foto og markedsføring',
  ],
  isolasjon_bygningsmaterialer: [
    'Takisolasjon',
    'Gulvisolasjon',
    'Veggisolasjon',
    'Teknisk isolering',
    'Brannbeskyttelse',
    'Akustiske løsninger',
    'Rørisolasjon',
    'Fasadeisolering',
    'Energirenovering',
    'Rådgivning',
  ],
  renhold_vaktmester: [
    'Daglig renhold',
    'Hovedrengjøring',
    'Vinduspuss',
    'Gulvpleie',
    'Teppevask',
    'Byggevask',
    'Vaktmestertjenester',
    'Snømåking',
    'Hagestell',
    'Avfallshåndtering',
  ],
  bil_verksted: [
    'EU-kontroll',
    'Service',
    'Reparasjoner',
    'Dekkskift',
    'Dekkhotell',
    'Klimaanlegg',
    'Feilsøking',
    'Lakk og karosseri',
    'Bilglass',
    'Bilrekvisita',
  ],
  bank_finans: [
    'Boliglån',
    'Billån',
    'Forbrukslån',
    'Sparing',
    'Forsikring',
    'Pensjon',
    'Bedriftskonto',
    'Kortløsninger',
    'Nettbank',
    'Rådgivning',
  ],
  frisør_skjønnhet: [
    'Klipp dame',
    'Klipp herre',
    'Farge',
    'Highlights',
    'Permanent',
    'Bryn og vipper',
    'Makeup',
    'Negler',
    'Voksing',
    'Hudpleie',
  ],
  landbruk: [
    'Korn',
    'Grønnsaker',
    'Frukt og bær',
    'Melk',
    'Kjøtt',
    'Egg',
    'Gårdsbutikk',
    'Direktesalg',
    'Sesongvarer',
    'Økologisk',
  ],
  regnskap_revisjon: [
    'Regnskapsførsel',
    'Årsoppgjør',
    'MVA-rapportering',
    'Lønn og HR',
    'Fakturering',
    'Budsjettering',
    'Rådgivning',
    'Skatt',
    'Revisjon',
    'Økonomistyring',
  ],
  advokat_juridisk: [
    'Eiendomsrett',
    'Familierett',
    'Arv og skifte',
    'Arbeidsrett',
    'Kontraktsrett',
    'Selskapsrett',
    'Strafferett',
    'Erstatningsrett',
    'Personskade',
    'Rådgivning',
  ],
  annet: [
    'Konsultasjon',
    'Rådgivning',
    'Prosjektledelse',
    'Leveranse',
    'Support',
    'Vedlikehold',
    'Opplæring',
    'Tilpasning',
  ],
};

// ============================================
// ANNONSEFORMATER OG PRISER
// ============================================

export const AD_FORMATS = [
  { value: 'visittkort', label: 'Visittkort', dimensions: '90×55mm', price: 8000 },
  { value: 'banner', label: 'Banner', dimensions: '186×55mm', price: 14800 },
  { value: 'tredjedel', label: 'Tredjedel', dimensions: '186×95mm', price: 18000 },
  { value: 'halvside', label: 'Halvside', dimensions: '210×146mm', price: 24400 },
  { value: 'helside', label: 'Helside', dimensions: '210×297mm', price: 39400 },
  { value: 'spread', label: 'Spread', dimensions: '420×297mm', price: 58400 },
] as const;

export type AdFormatKey = typeof AD_FORMATS[number]['value'];

// Upgrade-hierarki
export const UPGRADE_MAP: Record<string, string | null> = {
  visittkort: 'banner',
  banner: 'tredjedel',
  tredjedel: 'halvside',
  halvside: 'helside',
  helside: 'spread',
  spread: null, // Ingen upgrade fra spread
};

// ============================================
// INNHOLDSREGLER PER FORMAT
// ============================================

export interface FormatContent {
  logo: boolean;
  heading: boolean;
  subheading: boolean;
  description: boolean;
  serviceList: number; // Antall tjenester
  contactPhone: boolean;
  contactAddress: boolean;
  contactEmail: boolean;
  openingHours: boolean;
  website: boolean;
  certifications: number; // Antall sertifiseringer
  images: number; // Antall bilder
}

// Innholdsregler med 2-3x progressiv økning per upgrade-nivå
export const FORMAT_CONTENT_RULES: Record<string, { 
  ordered: FormatContent; 
  upgrade1: FormatContent; 
  upgrade2: FormatContent;
}> = {
  visittkort: {
    // Bestilt: Minimalt - kun logo, heading, nettside (3 elementer)
    ordered: {
      logo: true,
      heading: true,
      subheading: false,
      description: false,
      serviceList: 0,
      contactPhone: false,
      contactAddress: false,
      contactEmail: false,
      openingHours: false,
      website: true,
      certifications: 0,
      images: 0,
    },
    // Upgrade 1 (Banner): 2-3x mer - heading, subheading, telefon (6-9 elementer)
    upgrade1: {
      logo: true,
      heading: true,
      subheading: true,
      description: false,
      serviceList: 3,
      contactPhone: true,
      contactAddress: false,
      contactEmail: false,
      openingHours: false,
      website: true,
      certifications: 0,
      images: 0,
    },
    // Upgrade 2 (Tredjedel): 2-3x mer enn upgrade1 (12-18 elementer)
    upgrade2: {
      logo: true,
      heading: true,
      subheading: true,
      description: true,
      serviceList: 6,
      contactPhone: true,
      contactAddress: true,
      contactEmail: false,
      openingHours: false,
      website: true,
      certifications: 2,
      images: 0,
    },
  },
  banner: {
    // Bestilt: Minimalt (4-5 elementer) - inkluder kontaktinfo
    ordered: {
      logo: true,
      heading: true,
      subheading: false,
      description: false,
      serviceList: 0,
      contactPhone: true, // Legg til telefon for banner
      contactAddress: false,
      contactEmail: false,
      openingHours: false,
      website: true,
      certifications: 0,
      images: 0,
    },
    // Upgrade 1 (Tredjedel): 2-3x mer (6-9 elementer)
    upgrade1: {
      logo: true,
      heading: true,
      subheading: true,
      description: true,
      serviceList: 4,
      contactPhone: true,
      contactAddress: false,
      contactEmail: false,
      openingHours: false,
      website: true,
      certifications: 1,
      images: 0,
    },
    // Upgrade 2 (Halvside): 2-3x mer enn upgrade1 (12-18 elementer)
    upgrade2: {
      logo: true,
      heading: true,
      subheading: true,
      description: true,
      serviceList: 8,
      contactPhone: true,
      contactAddress: true,
      contactEmail: true,
      openingHours: true,
      website: true,
      certifications: 3,
      images: 1,
    },
  },
  tredjedel: {
    // Bestilt: Moderat (5-6 elementer) - tredjedel er større enn banner, så bør ha mer innhold
    ordered: {
      logo: true,
      heading: true,
      subheading: true, // Legg til subheading for tredjedel
      description: false,
      serviceList: 3, // Legg til 3 tjenester for tredjedel
      contactPhone: true,
      contactAddress: false,
      contactEmail: false,
      openingHours: false,
      website: true,
      certifications: 0,
      images: 0,
    },
    // Upgrade 1 (Halvside): 2-3x mer (8-12 elementer)
    upgrade1: {
      logo: true,
      heading: true,
      subheading: true,
      description: true,
      serviceList: 5,
      contactPhone: true,
      contactAddress: true,
      contactEmail: false,
      openingHours: false,
      website: true,
      certifications: 2,
      images: 0,
    },
    // Upgrade 2 (Helside): 2-3x mer enn upgrade1 (16-24 elementer)
    upgrade2: {
      logo: true,
      heading: true,
      subheading: true,
      description: true,
      serviceList: 10,
      contactPhone: true,
      contactAddress: true,
      contactEmail: true,
      openingHours: true,
      website: true,
      certifications: 4,
      images: 2,
    },
  },
  halvside: {
    // Bestilt: Moderat (5 elementer)
    ordered: {
      logo: true,
      heading: true,
      subheading: true,
      description: false,
      serviceList: 0,
      contactPhone: true,
      contactAddress: false,
      contactEmail: false,
      openingHours: false,
      website: true,
      certifications: 0,
      images: 0,
    },
    // Upgrade 1 (Helside): 2-3x mer (10-15 elementer)
    upgrade1: {
      logo: true,
      heading: true,
      subheading: true,
      description: true,
      serviceList: 6,
      contactPhone: true,
      contactAddress: true,
      contactEmail: true,
      openingHours: false,
      website: true,
      certifications: 3,
      images: 1,
    },
    // Upgrade 2 (Spread): 2-3x mer enn upgrade1 (20-30 elementer)
    upgrade2: {
      logo: true,
      heading: true,
      subheading: true,
      description: true,
      serviceList: 12,
      contactPhone: true,
      contactAddress: true,
      contactEmail: true,
      openingHours: true,
      website: true,
      certifications: 5,
      images: 3,
    },
  },
  helside: {
    // Bestilt: Mer innhold (7 elementer)
    ordered: {
      logo: true,
      heading: true,
      subheading: true,
      description: false,
      serviceList: 4,
      contactPhone: true,
      contactAddress: false,
      contactEmail: false,
      openingHours: false,
      website: true,
      certifications: 1,
      images: 0,
    },
    // Upgrade 1 (Spread): 2-3x mer (14-21 elementer)
    upgrade1: {
      logo: true,
      heading: true,
      subheading: true,
      description: true,
      serviceList: 10,
      contactPhone: true,
      contactAddress: true,
      contactEmail: true,
      openingHours: true,
      website: true,
      certifications: 4,
      images: 2,
    },
    // Upgrade 2: Ingen (spread er maks)
    upgrade2: {
      logo: true,
      heading: true,
      subheading: true,
      description: true,
      serviceList: 10,
      contactPhone: true,
      contactAddress: true,
      contactEmail: true,
      openingHours: true,
      website: true,
      certifications: 4,
      images: 2,
    },
  },
  spread: {
    // Bestilt: Mye innhold (10 elementer - dette er allerede stort)
    ordered: {
      logo: true,
      heading: true,
      subheading: true,
      description: true,
      serviceList: 6,
      contactPhone: true,
      contactAddress: true,
      contactEmail: false,
      openingHours: false,
      website: true,
      certifications: 2,
      images: 1,
    },
    // Upgrade 1: Ingen høyere nivå
    upgrade1: {
      logo: true,
      heading: true,
      subheading: true,
      description: true,
      serviceList: 6,
      contactPhone: true,
      contactAddress: true,
      contactEmail: false,
      openingHours: false,
      website: true,
      certifications: 2,
      images: 1,
    },
    // Upgrade 2: Ingen høyere nivå
    upgrade2: {
      logo: true,
      heading: true,
      subheading: true,
      description: true,
      serviceList: 6,
      contactPhone: true,
      contactAddress: true,
      contactEmail: false,
      openingHours: false,
      website: true,
      certifications: 2,
      images: 1,
    },
  },
};

// ============================================
// SERTIFISERINGER OG LOGOER
// ============================================

export const COMMON_CERTIFICATIONS = [
  'ISO 9001',
  'ISO 14001',
  'ISO 45001',
  'Godkjent lærebedrift',
  'StartBANK',
  'MEF',
  'Mesterbrev',
  'BREEAM',
  'Miljøfyrtårn',
  'Sentral godkjenning',
  'Autorisert forhandler',
  'NHO-medlem',
  'FG-godkjent',
  'NEMKO',
];

// ============================================
// E-POST MAL
// ============================================

export const EMAIL_TEMPLATE = `Hei, {KUNDENAVN} 😊

Jeg er designeren på dette prosjektet, og har vært heldig å få designe annonsen du har bestilt.

{PERSONLIG_KOMMENTAR}

Jeg har også laget en {UPGRADE_FORMAT} ({UPGRADE_DIMENSJONER}) i tillegg til {BESTILT_FORMAT} ({BESTILT_DIMENSJONER}) du bestilte. Annonsen vil bli mer synlig i brosjyren, noe som er bra for deg. 😊

{INTERAKTIV_TEKST}

Vil du heller gå for det uforpliktende tilbudet på den store annonsen er prisen kr. {PRIS_DIFFERANSE} (ekskl.mva) ekstra.

Begge annonsene er vedlagt så det er bare å komme tilbake til meg om hvilken annonse du velger :)

Ønsker deg en god dag 😊`;

export const PERSONAL_COMMENTS: Partial<Record<IndustryKey, string[]>> = {
  bygg_anlegg: [
    'Imponerende prosjekter dere har gjennomført! Det var gøy å få frem bredden i tjenestene deres.',
    'Flotte bilder fra byggeplassene deres – det skinner gjennom i annonsen.',
    'Solid erfaring dere har opparbeidet – det kommer godt frem i annonsen.',
  ],
  transport_logistikk: [
    'Flott bilpark dere har! Det var enkelt å lage en profesjonell annonse.',
    'Imponerende maskinpark – det var gøy å få vist frem bredden i det dere gjør.',
    'Helhetlig tilbud dere har – annonsen viser virkelig alt dere kan levere.',
  ],
  handverk: [
    'Solid håndverk dere leverer! Referansebildene var veldig inspirerende.',
    'Flott at dere har så bred kompetanse – det kommer godt frem i annonsen.',
    'God erfaring og kvalitetsfokus – akkurat det en annonse skal formidle.',
  ],
  restaurant_mat: [
    'Maten så utrolig god ut på bildene! Jeg fikk nesten lyst til å bestille selv.',
    'Flott konsept dere har – det var inspirerende å jobbe med annonsen.',
    'Koselige lokaler og deilig mat – annonsen gjenspeiler stemningen.',
  ],
  helse_velvære: [
    'Det var fint å lese om tilnærmingen deres til behandling – det kommer godt frem.',
    'Profesjonelt og omsorgsfullt inntrykk – akkurat det annonsen formidler.',
    'Bredt tilbud og faglig tyngde – annonsen viser bredden i det dere gjør.',
  ],
  teknologi_it: [
    'Spennende løsninger dere tilbyr! Annonsen fremhever det moderne ved bedriften.',
    'Imponerende tjenester – det var enkelt å lage en profesjonell annonse.',
    'Fremtidsrettet bedrift – det skinner gjennom i designet.',
  ],
  eiendom_megling: [
    'Flotte boliger dere formidler! Bildene gjorde jobben enkel.',
    'Profesjonell fremtoning – annonsen matcher kvaliteten dere leverer.',
    'God lokal tilknytning – det kommer tydelig frem i annonsen.',
  ],
  isolasjon_bygningsmaterialer: [
    'Imponerende produktsortiment! Det var enkelt å fremheve styrkene deres.',
    'Kvalitetsprodukter med dokumentasjon – annonsen formidler trygghet.',
    'Bærekraftig fokus – akkurat det som kommer frem i annonsen.',
  ],
  renhold_vaktmester: [
    'Bredt tjenestetilbud dere har – annonsen viser alt dere kan levere.',
    'Profesjonelt inntrykk – akkurat det kundene deres ser etter.',
    'God struktur på tjenestene – det var enkelt å sette opp annonsen.',
  ],
  bil_verksted: [
    'Komplett verksted dere har! Annonsen viser bredden i tilbudet.',
    'Moderne utstyr og god erfaring – det kommer tydelig frem.',
    'Tillitsvekkende verksted – akkurat det annonsen formidler.',
  ],
  bank_finans: [
    'Bredt tilbud av tjenester – annonsen gir god oversikt.',
    'Lokal forankring og personlig service – det kommer godt frem.',
    'Trygt og profesjonelt – akkurat inntrykket annonsen gir.',
  ],
  frisør_skjønnhet: [
    'Flotte resultater dere viser! Bildene var veldig inspirerende.',
    'Stilrent og profesjonelt – akkurat som annonsen.',
    'Koselig salong med dyktige ansatte – det skinner gjennom.',
  ],
  landbruk: [
    'Flotte produkter fra gården! Det var gøy å jobbe med annonsen.',
    'Ekte kvalitet og lokale verdier – akkurat det annonsen formidler.',
    'Bærekraftig drift – det kommer tydelig frem i annonsen.',
  ],
  regnskap_revisjon: [
    'Bredt tjenestespekter og god kompetanse – annonsen viser helheten.',
    'Profesjonelt og tillitsvekkende – akkurat som annonsen.',
    'Moderne løsninger og personlig service – det kommer godt frem.',
  ],
  advokat_juridisk: [
    'Bred kompetanse og erfaring – det kommer tydelig frem i annonsen.',
    'Profesjonelt og tillitsvekkende – akkurat inntrykket annonsen gir.',
    'God oversikt over fagområder – annonsen formidler tryggheten.',
  ],
  annet: [
    'Interessant bedrift med godt tilbud – det var gøy å lage annonsen.',
    'Profesjonelt inntrykk – annonsen matcher kvaliteten dere leverer.',
    'God informasjon på nettsiden – det gjorde jobben enkel.',
  ],
};

// ============================================
// HJELPEFUNKSJONER
// ============================================

export function getUpgradeFormat(orderedFormat: string): string | null {
  return UPGRADE_MAP[orderedFormat] || null;
}

// Hent andre upgrade-nivå (to nivåer opp fra bestilt)
export function getSecondUpgradeFormat(orderedFormat: string): string | null {
  const firstUpgrade = UPGRADE_MAP[orderedFormat];
  if (!firstUpgrade) return null;
  return UPGRADE_MAP[firstUpgrade] || null;
}

export function getFormatDetails(format: string) {
  return AD_FORMATS.find(f => f.value === format);
}

// Fallback til 'annet' hvis bransjen ikke har spesifikt innhold
// Fallback til 'annet' for bransjer uten spesifikke tekster
const DEFAULT_HEADINGS = [
  'Kvalitet og erfaring du kan stole på',
  'Din lokale samarbeidspartner',
  'Fagfolk med lang erfaring',
  'Vi leverer resultater',
  'Profesjonelle tjenester',
];

const DEFAULT_SUBHEADINGS = [
  'Med fokus på kvalitet og kundetilfredshet leverer vi tjenester tilpasset dine behov.',
  'Erfarne fagfolk som setter kunden først.',
  'Vi tar oppdraget ditt på alvor – hver gang.',
];

const DEFAULT_SERVICES = [
  'Rådgivning',
  'Prosjektering', 
  'Utførelse',
  'Service og vedlikehold',
  'Oppfølging',
  'Kundetilpassede løsninger',
];

const DEFAULT_COMMENTS = [
  'Dere hadde godt materiell på nettsiden!',
  'Fin presentasjon av tjenestene deres.',
  'Bra oversikt over det dere tilbyr.',
];

export function getRandomHeading(industry: IndustryKey | string): string {
  const headings = HEADINGS[industry as IndustryKey] || DEFAULT_HEADINGS;
  return headings[Math.floor(Math.random() * headings.length)];
}

export function getRandomSubheading(industry: IndustryKey | string): string {
  const subheadings = SUBHEADINGS[industry as IndustryKey] || DEFAULT_SUBHEADINGS;
  return subheadings[Math.floor(Math.random() * subheadings.length)];
}

export function getRandomServices(industry: IndustryKey | string, count: number): string[] {
  const services = [...(SERVICE_LISTS[industry as IndustryKey] || DEFAULT_SERVICES)];
  const shuffled = services.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

export function getRandomPersonalComment(industry: IndustryKey | string): string {
  const comments = PERSONAL_COMMENTS[industry as IndustryKey] || DEFAULT_COMMENTS;
  return comments[Math.floor(Math.random() * comments.length)];
}

export function calculatePriceDifference(orderedFormat: string, upgradeFormat: string): number {
  const ordered = getFormatDetails(orderedFormat);
  const upgrade = getFormatDetails(upgradeFormat);
  if (!ordered || !upgrade) return 0;
  return upgrade.price - ordered.price;
}

