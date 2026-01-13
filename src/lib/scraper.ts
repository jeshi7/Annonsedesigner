'use server';

import * as cheerio from 'cheerio';

export interface ScrapedData {
  companyName: string | null;
  description: string | null;
  services: string[];
  phone: string | null;
  email: string | null;
  address: string | null;
  openingHours: string | null;
  images: string[];
  socialMedia: {
    facebook: string | null;
    instagram: string | null;
    linkedin: string | null;
  };
  certifications: string[];
  allPageContent: string; // All text from all pages
  pagesScraped: number;
  potentialHeadings: string[]; // Potensielle headings fra nettsiden
  potentialSubheadings: string[]; // Potensielle subheadings fra nettsiden
}

// Scrape multiple pages from a website
export async function scrapeWebsite(url: string, maxPages: number = 20): Promise<ScrapedData> {
  try {
    let fullUrl = url;
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      fullUrl = 'https://' + url;
    }

    const baseUrl = new URL(fullUrl);
    const visitedUrls = new Set<string>();
    const pagesToVisit: string[] = [fullUrl];
    let allContent = '';
    let allServices: string[] = [];
    let allImages: string[] = [];
    let allCertifications: string[] = [];
    let allHeadings: string[] = [];
    let allSubheadings: string[] = [];
    
    // Try to find sitemap and add those URLs
    try {
      const sitemapUrls = [
        `${baseUrl.protocol}//${baseUrl.hostname}/sitemap.xml`,
        `${baseUrl.protocol}//${baseUrl.hostname}/sitemap_index.xml`,
        `${baseUrl.protocol}//${baseUrl.hostname}/sitemap.txt`,
      ];
      
      for (const sitemapUrl of sitemapUrls) {
        try {
          const sitemapResponse = await fetch(sitemapUrl, {
            headers: { 'User-Agent': 'Mozilla/5.0' },
          });
          if (sitemapResponse.ok) {
            const sitemapText = await sitemapResponse.text();
            // Extract URLs from sitemap (simple regex for <loc> tags)
            const urlMatches = sitemapText.match(/<loc>(.*?)<\/loc>/gi);
            if (urlMatches) {
              urlMatches.forEach(match => {
                const url = match.replace(/<\/?loc>/gi, '').trim();
                if (url && url.startsWith('http') && new URL(url).hostname === baseUrl.hostname) {
                  if (!pagesToVisit.includes(url) && !visitedUrls.has(url)) {
                    pagesToVisit.push(url);
                  }
                }
              });
              console.log(`Found ${urlMatches.length} URLs in sitemap`);
              break; // Use first working sitemap
            }
          }
        } catch (e) {
          // Sitemap not found or invalid, continue
        }
      }
    } catch (e) {
      // Ignore sitemap errors
    }
    
    let mainData: Partial<ScrapedData> = {
      companyName: null,
      description: null,
      phone: null,
      email: null,
      address: null,
      openingHours: null,
      socialMedia: { facebook: null, instagram: null, linkedin: null },
    };

    // Crawl pages
    console.log(`Starting to scrape website: ${fullUrl}, max pages: ${maxPages}`);
    while (pagesToVisit.length > 0 && visitedUrls.size < maxPages) {
      const currentUrl = pagesToVisit.shift()!;
      
      if (visitedUrls.has(currentUrl)) continue;
      visitedUrls.add(currentUrl);
      
      console.log(`Scraping page ${visitedUrls.size}/${maxPages}: ${currentUrl}`);

      try {
        const response = await fetch(currentUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'nb-NO,nb;q=0.9,no;q=0.8',
          },
        });

        if (!response.ok) continue;

        const html = await response.text();
        const $ = cheerio.load(html);

        // Remove script and style tags for text extraction
        $('script, style, nav, footer, header').remove();
        
        // Extract page text content
        const pageText = $('body').text().replace(/\s+/g, ' ').trim();
        allContent += ' ' + pageText;

        // Extract data from first page (homepage) - prioritize homepage
        if (visitedUrls.size === 1) {
          mainData.companyName = extractCompanyName($);
          mainData.description = extractDescription($);
          mainData.phone = extractPhone($, html);
          mainData.email = extractEmail($, html);
          mainData.address = extractAddress($);
          mainData.openingHours = extractOpeningHours($);
          mainData.socialMedia = extractSocialMedia($);
        } else {
          // Also try to extract contact info from other pages (in case it's not on homepage)
          if (!mainData.phone) mainData.phone = extractPhone($, html) || mainData.phone;
          if (!mainData.email) mainData.email = extractEmail($, html) || mainData.email;
          if (!mainData.address) mainData.address = extractAddress($) || mainData.address;
          if (!mainData.openingHours) mainData.openingHours = extractOpeningHours($) || mainData.openingHours;
          
          // Merge social media (take first non-null value)
          const pageSocial = extractSocialMedia($);
          if (!mainData.socialMedia.facebook && pageSocial.facebook) mainData.socialMedia.facebook = pageSocial.facebook;
          if (!mainData.socialMedia.instagram && pageSocial.instagram) mainData.socialMedia.instagram = pageSocial.instagram;
          if (!mainData.socialMedia.linkedin && pageSocial.linkedin) mainData.socialMedia.linkedin = pageSocial.linkedin;
          
          // If description is short, try to get better one from other pages
          if (!mainData.description || mainData.description.length < 100) {
            const pageDesc = extractDescription($);
            if (pageDesc && pageDesc.length > mainData.description?.length || 0) {
              mainData.description = pageDesc;
            }
          }
        }

        // Extract services from all pages
        const pageServices = extractServices($);
        allServices.push(...pageServices);

        // Extract images from all pages
        const pageImages = extractImages($, currentUrl);
        allImages.push(...pageImages);

        // Extract certifications
        const pageCerts = extractCertifications($);
        allCertifications.push(...pageCerts);

        // Extract headings and subheadings (especially from first page)
        const pageHeadings = extractHeadings($);
        allHeadings.push(...pageHeadings);
        
        const pageSubheadings = extractSubheadings($);
        allSubheadings.push(...pageSubheadings);

        // Find internal links to crawl - be more aggressive
        $('a[href]').each((_, el) => {
          const href = $(el).attr('href');
          if (href) {
            try {
              // Normalize href (handle relative URLs)
              let normalizedHref = href;
              if (href.startsWith('/')) {
                normalizedHref = `${baseUrl.protocol}//${baseUrl.hostname}${href}`;
              } else if (!href.startsWith('http')) {
                normalizedHref = new URL(href, currentUrl).href;
              }
              
              const linkUrl = new URL(normalizedHref);
              
              // Only follow links on the same domain
              if (linkUrl.hostname === baseUrl.hostname && 
                  !visitedUrls.has(linkUrl.href) &&
                  !pagesToVisit.includes(linkUrl.href) &&
                  !linkUrl.href.includes('#') &&
                  !linkUrl.href.match(/\.(pdf|jpg|jpeg|png|gif|svg|webp|doc|docx|xls|xlsx|zip|rar)$/i) &&
                  !linkUrl.href.match(/(mailto|tel|javascript):/i) &&
                  !linkUrl.href.includes('/wp-admin/') &&
                  !linkUrl.href.includes('/wp-content/') &&
                  !linkUrl.href.includes('/wp-includes/')) {
                pagesToVisit.push(linkUrl.href);
              }
            } catch (e) {
              // Silently ignore invalid URLs
            }
          }
        });
        
        // Also look for common page patterns (om-oss, tjenester, kontakt, etc.)
        const commonPages = ['om-oss', 'tjenester', 'kontakt', 'about', 'services', 'contact', 'produkter', 'products'];
        commonPages.forEach(page => {
          try {
            const pageUrl = `${baseUrl.protocol}//${baseUrl.hostname}/${page}`;
            if (!visitedUrls.has(pageUrl) && !pagesToVisit.includes(pageUrl)) {
              pagesToVisit.push(pageUrl);
            }
          } catch {}
        });

      } catch (error) {
        console.error(`Error scraping ${currentUrl}:`, error);
      }
    }

    console.log(`Finished scraping. Total pages scraped: ${visitedUrls.size}`);
    console.log(`Found ${allServices.length} services, ${allImages.length} images, ${allHeadings.length} headings`);
    
    // Deduplicate
    const uniqueServices = [...new Set(allServices)].slice(0, 20);
    const uniqueImages = [...new Set(allImages)].slice(0, 15);
    const uniqueCerts = [...new Set(allCertifications)].slice(0, 10);
    const uniqueHeadings = [...new Set(allHeadings)].filter(h => h.length > 5 && h.length < 80).slice(0, 15);
    const uniqueSubheadings = [...new Set(allSubheadings)].filter(s => s.length > 10 && s.length < 150).slice(0, 10);

    return {
      companyName: mainData.companyName || null,
      description: mainData.description || null,
      services: uniqueServices,
      phone: mainData.phone || null,
      email: mainData.email || null,
      address: mainData.address || null,
      openingHours: mainData.openingHours || null,
      images: uniqueImages,
      socialMedia: mainData.socialMedia || { facebook: null, instagram: null, linkedin: null },
      certifications: uniqueCerts,
      allPageContent: allContent.slice(0, 50000), // Limit content size
      pagesScraped: visitedUrls.size,
      potentialHeadings: uniqueHeadings,
      potentialSubheadings: uniqueSubheadings,
    };
  } catch (error) {
    console.error('Error scraping website:', error);
    return {
      companyName: null,
      description: null,
      services: [],
      phone: null,
      email: null,
      address: null,
      openingHours: null,
      images: [],
      socialMedia: { facebook: null, instagram: null, linkedin: null },
      certifications: [],
      allPageContent: '',
      pagesScraped: 0,
      potentialHeadings: [],
      potentialSubheadings: [],
    };
  }
}

function extractCompanyName($: cheerio.CheerioAPI): string | null {
  const selectors = [
    'meta[property="og:site_name"]',
    'meta[name="application-name"]',
    '.logo img',
    '#logo img',
    'header .logo',
    '.site-title',
    'h1',
  ];

  for (const selector of selectors) {
    if (selector.startsWith('meta')) {
      const content = $(selector).attr('content');
      if (content) return content.trim();
    } else if (selector.includes('img')) {
      const alt = $(selector).attr('alt');
      if (alt) return alt.trim();
    } else {
      const text = $(selector).first().text();
      if (text && text.length < 100) return text.trim();
    }
  }

  const title = $('title').text();
  if (title) {
    return title.split('|')[0].split('-')[0].split('–')[0].trim();
  }

  return null;
}

function extractDescription($: cheerio.CheerioAPI): string | null {
  const metaDesc = $('meta[name="description"]').attr('content') ||
                   $('meta[property="og:description"]').attr('content');
  if (metaDesc) return metaDesc.trim();

  const selectors = ['.about-us p', '.om-oss p', '#about p', '.description', 'main p', 'article p'];
  for (const selector of selectors) {
    const text = $(selector).first().text();
    if (text && text.length > 50 && text.length < 500) {
      return text.trim();
    }
  }
  return null;
}

function extractServices($: cheerio.CheerioAPI): string[] {
  const services: string[] = [];
  const selectors = [
    '.tjenester li', '.services li', '#tjenester li', '#services li',
    '.service-list li', 'ul.services li', '.offerings li', '.what-we-do li',
    '.produkter li', '.products li', 'main li',
  ];

  for (const selector of selectors) {
    $(selector).each((_, el) => {
      const text = $(el).text().trim();
      if (text && text.length > 2 && text.length < 100 && !services.includes(text)) {
        services.push(text);
      }
    });
  }
  return services;
}

function extractPhone($: cheerio.CheerioAPI, html: string): string | null {
  const phoneRegex = /(?:\+47\s?)?(?:\d{2}\s?\d{2}\s?\d{2}\s?\d{2}|\d{3}\s?\d{2}\s?\d{3}|\d{8})/g;
  
  // Først: sjekk tel: links
  const telLink = $('a[href^="tel:"]').first().attr('href');
  if (telLink) {
    const phone = telLink.replace('tel:', '').trim();
    if (phone) return phone;
  }

  // Sjekk kontakt-seksjoner (utvidet)
  const contactSelectors = [
    '.contact', '.kontakt', 'footer', '#contact', '#kontakt',
    '[class*="contact"]', '[class*="kontakt"]', '[id*="contact"]', '[id*="kontakt"]',
    'address', '.address', '.adresse', '.footer-contact', '.contact-info'
  ];
  
  for (const selector of contactSelectors) {
    const contactText = $(selector).text();
    const phoneMatch = contactText.match(phoneRegex);
    if (phoneMatch && phoneMatch[0]) {
      return phoneMatch[0].trim();
    }
  }

  // Sjekk hele HTML-en, men prioriter lengre numre (8+ siffer)
  const allMatches = html.match(phoneRegex);
  if (allMatches) {
    // Sorter etter lengde (lengre = mer sannsynlig å være riktig)
    const sortedMatches = allMatches
      .map(m => m.trim())
      .filter(m => {
        const cleaned = m.replace(/\s/g, '');
        return cleaned.length >= 8;
      })
      .sort((a, b) => b.replace(/\s/g, '').length - a.replace(/\s/g, '').length);
    
    if (sortedMatches.length > 0) {
      return sortedMatches[0];
    }
  }
  
  return null;
}

function extractEmail($: cheerio.CheerioAPI, html: string): string | null {
  // Først: sjekk mailto: links
  const mailtoLink = $('a[href^="mailto:"]').first().attr('href');
  if (mailtoLink) {
    const email = mailtoLink.replace('mailto:', '').split('?')[0].trim();
    if (email) return email;
  }

  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  
  // Sjekk kontakt-seksjoner (utvidet)
  const contactSelectors = [
    '.contact', '.kontakt', 'footer', '#contact', '#kontakt',
    '[class*="contact"]', '[class*="kontakt"]', '[id*="contact"]', '[id*="kontakt"]',
    'address', '.address', '.adresse', '.footer-contact', '.contact-info',
    '[itemprop="email"]', '[type="email"]'
  ];
  
  for (const selector of contactSelectors) {
    const contactText = $(selector).text();
    const emailMatch = contactText.match(emailRegex);
    if (emailMatch && emailMatch[0]) {
      const email = emailMatch[0].trim();
      if (!email.includes('example') && !email.includes('wordpress') && !email.includes('noreply')) {
        return email;
      }
    }
  }

  // Sjekk hele HTML-en, men filtrer ut generiske e-poster
  const allMatches = html.match(emailRegex);
  if (allMatches) {
    for (const match of allMatches) {
      const email = match.trim();
      if (!email.includes('example') && 
          !email.includes('wordpress') && 
          !email.includes('noreply') &&
          !email.includes('no-reply') &&
          !email.includes('donotreply')) {
        return email;
      }
    }
  }
  
  return null;
}

function extractAddress($: cheerio.CheerioAPI): string | null {
  const selectors = [
    '.address', '.adresse', '[itemprop="address"]', 'footer address',
    '[class*="address"]', '[class*="adresse"]', '[id*="address"]', '[id*="adresse"]',
    '.contact-address', '.kontakt-adresse', '.location', '.lokasjon',
    'address', '.footer-address', '.company-address'
  ];
  
  for (const selector of selectors) {
    const text = $(selector).first().text().trim();
    if (text && text.length > 5 && text.length < 200) {
      // Filtrer ut generisk tekst
      const lowerText = text.toLowerCase();
      if (!lowerText.includes('cookie') && 
          !lowerText.includes('personvern') && 
          !lowerText.includes('copyright') &&
          !lowerText.includes('all rights reserved')) {
        return text.replace(/\s+/g, ' ').trim();
      }
    }
  }
  
  // Sjekk også i footer for adresse-lignende tekst (gateadresse + postnummer)
  const footerText = $('footer').text();
  const addressPattern = /([A-ZÆØÅ][a-zæøå]+(?:\s+[A-ZÆØÅ][a-zæøå]+)*\s+\d+[A-Z]?)\s*(\d{4}\s+[A-ZÆØÅ][a-zæøå]+)/i;
  const addressMatch = footerText.match(addressPattern);
  if (addressMatch) {
    return addressMatch[0].trim();
  }
  
  return null;
}

function extractOpeningHours($: cheerio.CheerioAPI): string | null {
  const selectors = ['.opening-hours', '.åpningstider', '.hours', '[itemprop="openingHours"]'];
  for (const selector of selectors) {
    const text = $(selector).first().text().trim();
    if (text) return text.replace(/\s+/g, ' ');
  }
  return null;
}

function extractImages($: cheerio.CheerioAPI, baseUrl: string): string[] {
  const images: string[] = [];
  const seenUrls = new Set<string>();
  const selectors = ['.hero img', '.banner img', '.gallery img', 'main img', 'article img'];

  for (const selector of selectors) {
    $(selector).each((_, el) => {
      let src = $(el).attr('src') || $(el).attr('data-src');
      if (src) {
        if (src.startsWith('//')) src = 'https:' + src;
        else if (src.startsWith('/')) src = new URL(src, baseUrl).href;
        else if (!src.startsWith('http')) src = new URL(src, baseUrl).href;

        if (!src.includes('icon') && !src.includes('favicon') && !seenUrls.has(src)) {
          seenUrls.add(src);
          images.push(src);
        }
      }
    });
  }
  return images;
}

function extractSocialMedia($: cheerio.CheerioAPI) {
  const social = { facebook: null as string | null, instagram: null as string | null, linkedin: null as string | null };
  
  $('a[href*="facebook.com"]').each((_, el) => { if (!social.facebook) social.facebook = $(el).attr('href') || null; });
  $('a[href*="instagram.com"]').each((_, el) => { if (!social.instagram) social.instagram = $(el).attr('href') || null; });
  $('a[href*="linkedin.com"]').each((_, el) => { if (!social.linkedin) social.linkedin = $(el).attr('href') || null; });
  
  return social;
}

function extractCertifications($: cheerio.CheerioAPI): string[] {
  const certs: string[] = [];
  const keywords = ['iso', 'sertifiser', 'godkjent', 'startbank', 'mef', 'miljøfyrtårn', 'lærebedrift'];

  $('img').each((_, el) => {
    const alt = $(el).attr('alt')?.toLowerCase() || '';
    for (const keyword of keywords) {
      if (alt.includes(keyword)) {
        certs.push($(el).attr('alt') || keyword.toUpperCase());
        break;
      }
    }
  });

  const pageText = $('body').text().toLowerCase();
  if (pageText.includes('iso 9001')) certs.push('ISO 9001');
  if (pageText.includes('iso 14001')) certs.push('ISO 14001');
  if (pageText.includes('startbank')) certs.push('StartBANK');
  if (pageText.includes('godkjent lærebedrift')) certs.push('Godkjent lærebedrift');
  if (pageText.includes('miljøfyrtårn')) certs.push('Miljøfyrtårn');

  return [...new Set(certs)];
}

function extractHeadings($: cheerio.CheerioAPI): string[] {
  const headings: string[] = [];
  const excludeWords = ['menu', 'kontakt', 'cookie', 'privacy', 'terms', 'vilkaar', 'personvern', 'logg inn', 'login', 'registrer'];
  
  // Hent fra alle overskrifter (h1-h6)
  $('h1, h2, h3, h4, h5, h6').each((_, el) => {
    const text = $(el).text().trim();
    const lowerText = text.toLowerCase();
    if (text && 
        text.length > 5 && 
        text.length < 80 &&
        !excludeWords.some(word => lowerText.includes(word))) {
      headings.push(text);
    }
  });
  
  // Hent fra hero/CTA/seksjoner med viktig innhold
  $('.hero, .heroine, .banner, .cta, .call-to-action, .intro, .lead, [class*="hero"], [class*="banner"]').each((_, el) => {
    const $el = $(el);
    // Hent første setning eller kort tekst
    const text = $el.find('h1, h2, h3, .title, .headline').first().text().trim() || 
                 $el.text().split(/[.!?]/)[0].trim();
    if (text && text.length > 5 && text.length < 80) {
      headings.push(text);
    }
  });
  
  // Hent fra sterke, fengende setninger i paragraf (korte, kraftige setninger)
  $('main p, article p, .content p, .text p').each((_, el) => {
    const text = $(el).text().trim();
    const sentences = text.split(/[.!?]/).map(s => s.trim()).filter(s => s.length > 8 && s.length < 60);
    // Velg setninger som ser ut som headings (korte, kraftige)
    sentences.forEach(sentence => {
      if (!excludeWords.some(word => sentence.toLowerCase().includes(word))) {
        headings.push(sentence);
      }
    });
  });
  
  // Hent fra meta tags
  const ogTitle = $('meta[property="og:title"]').attr('content');
  if (ogTitle && ogTitle.length > 5 && ogTitle.length < 80) {
    headings.push(ogTitle);
  }
  
  return headings;
}

function extractSubheadings($: cheerio.CheerioAPI): string[] {
  const subheadings: string[] = [];
  const excludeWords = ['menu', 'kontakt', 'cookie', 'privacy', 'terms', 'vilkaar', 'personvern', 'logg inn', 'login'];
  
  // Hent fra alle overskrifter som kan fungere som subheadings
  $('h2, h3, h4, h5, h6').each((_, el) => {
    const text = $(el).text().trim();
    const lowerText = text.toLowerCase();
    if (text && 
        text.length > 10 && 
        text.length < 150 &&
        !excludeWords.some(word => lowerText.includes(word))) {
      subheadings.push(text);
    }
  });
  
  // Hent relevante setninger fra hele nettsiden
  $('main p, article p, .content p, .text p, .about-us p, .om-oss p, .description p, .intro p').each((_, el) => {
    const text = $(el).text().trim();
    if (!text || text.length < 20) return;
    
    // Del opp i setninger og velg relevante
    const sentences = text.split(/[.!?]/)
      .map(s => s.trim())
      .filter(s => {
        const lower = s.toLowerCase();
        return s.length > 15 && 
               s.length < 150 &&
               !excludeWords.some(word => lower.includes(word)) &&
               !lower.includes('cookie') &&
               !lower.includes('gdpr');
      });
    
    // Ta første 2-3 setninger fra hver paragraf
    subheadings.push(...sentences.slice(0, 2));
  });
  
  // Hent fra meta description
  const metaDesc = $('meta[name="description"]').attr('content') ||
                   $('meta[property="og:description"]').attr('content');
  if (metaDesc && metaDesc.length > 15 && metaDesc.length < 150) {
    subheadings.push(metaDesc);
  }
  
  // Hent fra list items som kan fungere som subheadings
  $('main li, article li, .content li').each((_, el) => {
    const text = $(el).text().trim();
    if (text && text.length > 15 && text.length < 150) {
      subheadings.push(text);
    }
  });
  
  return subheadings;
}
