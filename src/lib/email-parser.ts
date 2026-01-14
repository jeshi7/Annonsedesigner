// Extract text from customer email - client-side function
export function extractFromEmail(emailText: string): {
  services: string[];
  contactInfo: { name?: string; phone?: string; email?: string; address?: string };
  relevantText: string;
} {
  const lines = emailText.split('\n').map(l => l.trim()).filter(l => l);
  
  // Find contact info
  const phoneRegex = /(?:\+47\s?)?(?:\d{2}\s?\d{2}\s?\d{2}\s?\d{2}|\d{8})/;
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
  
  let contactInfo: { name?: string; phone?: string; email?: string; address?: string } = {};
  
  for (const line of lines) {
    if (!contactInfo.phone) {
      const phoneMatch = line.match(phoneRegex);
      if (phoneMatch) contactInfo.phone = phoneMatch[0];
    }
    if (!contactInfo.email) {
      const emailMatch = line.match(emailRegex);
      if (emailMatch) contactInfo.email = emailMatch[0];
    }
    // Look for name in "Med vennlig hilsen" section
    if (line.toLowerCase().includes('hilsen') || line.toLowerCase().includes('regards')) {
      const nextLineIndex = lines.indexOf(line) + 1;
      if (nextLineIndex < lines.length) {
        contactInfo.name = lines[nextLineIndex];
      }
    }
  }

  // Find service-like items (bullet points or dashes)
  const services: string[] = [];
  for (const line of lines) {
    if ((line.startsWith('-') || line.startsWith('•') || line.startsWith('*')) && line.length < 100) {
      services.push(line.replace(/^[-•*]\s*/, '').trim());
    }
  }

  return {
    services,
    contactInfo,
    relevantText: emailText,
  };
}


