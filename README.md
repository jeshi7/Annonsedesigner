# 🎨 JS Norge Annonsedesign

> Intern app for effektiv generering av annonseforslag med fokus på upgrade-salg.

![Next.js](https://img.shields.io/badge/Next.js-16-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC)

## ✨ Funksjoner

### 📊 Tre upgrade-nivåer
- **Bestilt** → **Upgrade 1** → **Upgrade 2**
- Hver upgrade har 2-3x mer innhold enn nivået under
- Automatisk bonus-kalkulator for hver upgrade

### 🔍 Smart web-scraping
- Scraper kundens nettside for innhold
- Henter bilder, tjenester, kontaktinfo automatisk
- Multi-page scraping (opptil 15 sider)

### 📝 Tekstbibliotek
- 60+ bransjer med spesialtilpassede headings
- Tjenestelister per bransje
- Personlige kommentarer for salgspitch

### 📧 E-postgenerator
- Automatisk personalisert e-post
- Separate maler for Upgrade 1 og Upgrade 2
- Ett-klikks kopiering

### 📁 Fil-opplasting
- OCR fra skjermbilder
- Parsing av prosjektsystem-tekst
- Kundemail-parsing

## 🚀 Kom i gang

```bash
# Installer avhengigheter
npm install

# Start utviklingsserver
npm run dev

# Åpne http://localhost:3000
```

## 📐 Annonseformater

| Format | Dimensjon | Pris |
|--------|-----------|------|
| Visittkort | 90×55mm | kr 8 000 |
| Banner | 186×55mm | kr 14 800 |
| Tredjedel | 186×95mm | kr 18 000 |
| Halvside | 210×146mm | kr 24 400 |
| Helside | 210×297mm | kr 39 400 |
| Spread | 420×297mm | kr 58 400 |

## 🎯 Upgrade-strategi

```
Bestilt (3-5 elementer)
    ↓ 2-3x mer
Upgrade 1 (6-10 elementer)
    ↓ 2-3x mer  
Upgrade 2 (12-20+ elementer)
```

## 💰 Inntektspotensial

Med 5-6 upgrades per dag:
- **Mål:** 120-150 annonser/måned
- **Fokus:** Selg Upgrade 2 for maksimal bonus

## 🛠️ Tech Stack

- **Frontend:** Next.js 16, React, TypeScript
- **Styling:** Tailwind CSS, shadcn/ui
- **Database:** SQLite via Prisma
- **Scraping:** Cheerio
- **OCR:** Tesseract.js

## 📄 Lisens

Intern bruk for JS Norge.

---

Utviklet for JS Norge Annonsedesign-teamet 🇳🇴
