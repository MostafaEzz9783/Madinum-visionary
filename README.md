# Madinum — New website (design preview)

Static preview of the redesigned Madinum website, built for review by company management.
Arabic is the default language (`/`), English lives under `/en`.

## Pages

| Arabic | English |
|---|---|
| `/` | `/en` |
| `/about` | `/en/about` |
| `/services` | `/en/services` |
| `/services/property-management` | `/en/services/property-management` |
| `/services/short-term-rental` | `/en/services/short-term-rental` |
| `/services/marketing` | `/en/services/marketing` |
| `/services/investment` | `/en/services/investment` |
| `/contact` | `/en/contact` |
| `/calculator` | `/en/calculator` |

Old PHP links (`index-english.php`, `management_arabic.php`, …) redirect to the new pages (see `vercel.json`).

## What works in this preview

- Full responsive layout (desktop, tablet, phone), RTL and LTR.
- Services tabs, mobile menu, partners carousel, FAQ, hero slideshow.
- **Calculator**: full form with city → district lists and validation. On submit it shows the request summary and a button that sends the details on WhatsApp. It does **not** store leads or show prices — that needs the PHP/MySQL backend on the live server.
- **Contact form**: validates, then opens the visitor's email app addressed to info@madinum.sa.
- Login, sign-up and dashboards are not part of the preview.
- Pages are marked `noindex` so search engines don't index the preview.

## Deploy on Vercel

1. In Vercel: **Add New → Project → Import** this GitHub repository.
2. Framework preset: **Other**. Build command: *none*. Output directory: `.` (root).
3. Deploy. Every push to `main` redeploys automatically.

## Design system

Colors, type and components follow the Blueground × Guesty fusion system adapted to Madinum's palette
(forest green `#3F5543`, action green `#4A7E46`, cream `#F5F0E3`, sand `#E9DDC7`, gold `#B59A5B`).
Styles: `assets/css/site.css` · Scripts: `assets/js/site.js`.
