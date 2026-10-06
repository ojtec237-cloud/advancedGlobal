# Advance Global Logistics — Brand Guide

> **Context:** this platform is **already built and working** (public site, tracking engine, Express/SQLite API,
> admin console, documents, quotes). This job rebrands it to **Advance Global Logistics** on its own domain. The design,
> colour palette, fonts, layout and every feature stay exactly as they are. See `CLAUDE.md §0`.

**What changes in this rebrand:** name, logo, photos, admin password, tracking-ID prefix, domain/email.
**What does not change:** colours, fonts, spacing, radii, shadows, layout, components, motion, features.

## 1. Name usage

| Context | Use |
|---|---|
| Legal line, invoices, terms, footer copyright | **Advance Global Logistics Ltd** |
| First mention on a page, titles, meta | **Advance Global Logistics** |
| Repeated mentions, buttons, UI labels | **AGL** |
| Never | "Advanced Global Logistics" (with a *d*), "Advance Logistics", "A.G.L.", "Agl", "Advance Global" on its own |

- Before a vowel sound, write **"an AGL coordinator"** (AGL is read letter by letter, *ay-gee-el*).
- Copyright line: `© {currentYear} Advance Global Logistics Ltd. All rights reserved.` (year computed, not hard-coded).

## 2. Positioning, pillars, voice

Unchanged from the existing site copy in `docs/CONTENT.md`; only the company name differs. The voice is confident,
clear and calm, in International (British) English: *organisation, colour, centre, licence*. Use only real,
verifiable numbers. The public site always says **"tracking ID"**; documents say "Tracking ID / Waybill No.".

**Tagline:** the current tagline in `src/config/brand.ts` (`TAGLINE`) stays **unless the new logo prints a different
one**. If it does, ask the owner and record the answer in CONTENT.md and the tracker's Decisions log.

## 3. Colour: unchanged

The palette in `src/styles/tokens.css` is **kept as is**: graphite Primary, red Accent, Ink deep surfaces,
semantic status colours. Do **not** re-derive the palette from the new logo, even if the logo uses other colours.

- Only the token **prefix** is renamed during the rebrand sweep (`--sdl-*` → `--agl-*`, see REBRAND_MAP §3). Values
  stay byte-for-byte the same.
- Update the comment at the top of `tokens.css` so it describes the palette without naming a company or a logo.
- If the new logo clashes badly with the red Accent, **flag it to the owner**; don't change colours on your own.

## 4. Typography: unchanged

| Use | Font | Weights |
|---|---|---|
| Display / headings | Plus Jakarta Sans | 500–800 |
| Body / UI | Inter | 400–800 |
| Tracking IDs, codes, labels | JetBrains Mono | 500, 600 |

Loaded from Google Fonts in `index.html`. No changes.

## 5. Logo

**Source file: `images/advanced-logo.png`** (supplied 2026-10-03). It's a 2025×777 PNG with a **transparent
background**, a glossy black-and-red "AGL" monogram with a red globe and orbit arrow in the "G", the words
"ADVANCED GLOBAL" below it, and a spaced-out "LOGISTICS" with red speed lines. Its black and red match the existing palette.

> ⚠️ **Spelling:** the logo says **"ADVANCED"**, but the registered name is **Advance Global Logistics Ltd**. Use
> this file for now; the owner gets a corrected logo from the designer **before launch** (tracker Needs owner #7).
> When it arrives, drop it in at the same path and re-run the script. Never "fix" the name in text to match the logo.

`node scripts/optimize-images.mjs` then generates, in `Public/brand/`:

| File | Use |
|---|---|
| `agl-logo.png` | Full colour, light surfaces (header, documents) |
| `agl-logo-white.png` | Reversed, dark surfaces (footer, dark hero, admin sidebar) |
| `agl-mark.png` | Icon only (JSON-LD `logo`, square uses) |
| `favicon.png` (512), `favicon-32.png`, `favicon-16.png`, `apple-touch-icon.png` (180), `icon-192.png`, `icon-maskable-512.png` | Browser / home-screen icons |
| `og-image.jpg` (1200×630) | Social share preview |

**Script changes this logo needs** (`buildBrand()` and helpers in `scripts/optimize-images.mjs`):
1. **Skip `whiteToAlpha()`.** The PNG already has alpha, and `whiteToAlpha` calls `removeAlpha()`, which would turn the
   transparent background into a solid block. Load the file as is, then `trim()`.
2. **White version (`toWhiteVersion`):** the existing rule (every non-red pixel → white, red stays red) suits this
   logo. Black letters become white and red stays red. Check the glossy highlights and the dark edges around the red
   speed lines by eye on the dark footer; a thin dark fringe means the threshold needs a small tweak.
3. **Square mark (`buildSquareMark`):** the `MARK` crop box was measured on the old 1170×626 logo. Re-measure it on the
   new file. Use the **globe with its orbit arrow** inside the "G" (the globe sits at roughly x 990–1310, y 165–445 on the
   2025×777 original, and the arrow tip reaches about x 1460; confirm on the image and decide whether the tip
   fits a square). **Don't run `redOnly()` on it:** this globe has black continents on a red sea,
   and `redOnly` would delete the continents. Keep the crop in full colour. The tab icons already sit on a white tile,
   so the black stays visible on dark browser tabs.
4. Look at **every** generated file (logo, white logo, mark, 16/32 px favicons, OG image) before wiring them in.
   Change the script, never hand-edit the outputs.

**Small sizes:** at the header's minimum width (96–110 px), the spaced-out "LOGISTICS" line is only a few pixels tall.
Check the header at 375 px. If the logo is unreadable, report it with a screenshot and a suggestion (e.g. a larger
minimum width). Don't change the header layout without the owner's approval.

- Header: full-colour logo on light, white logo over the dark hero. Minimum width 110px desktop, 96px mobile.
- Never stretch, recolour, add shadows, or place on busy photos without an overlay.
- Bump the `?v=` cache-buster on the icon links in `index.html` and `Public/site.webmanifest`, so browsers drop the old favicon.

## 6. Tracking ID and other identifiers

**Tracking ID (8 characters exactly):** `AGL` + 5 characters from the safe alphabet. Same rules as before, new prefix.

```
Format:    AGL + [5 chars]           e.g. AGL7K2M9, AGLQ4X8T
Alphabet:  23456789ABCDEFGHJKLMNPQRSTUVWXYZ   (no 0/O, 1/I)
Regex:     ^AGL[2-9A-HJ-NP-Z]{5}$
Input:     trim, uppercase, strip spaces and dashes ("agl 7k2-m9" → AGL7K2M9)
Pieces:    AGL7K2M9-01, AGL7K2M9-02 (resolve to the parent)
Returns:   a new AGL ID, linked to the original
```

- The prefix lives in **one place**: `TRACKING_PREFIX` in `src/config/brand.ts`. `src/shared/trackingId.ts` builds
  every pattern from it; the server and client both import it. Changing the constant changes the system; the rest is
  hard-coded **examples** in copy, placeholders and comments (REBRAND_MAP §2).
- The server is the authority: it checks uniqueness against the DB and retries on collision.

**Other references** (not tracking IDs; prefix + 6 digits):

| Kind | Format | Example |
|---|---|---|
| Seal | `AGL-SL-######` | AGL-SL-892401 |
| Support ticket / callback | `AGL-TKT-######` | AGL-TKT-418230 |
| Invoice | `AGL-INV-######` | AGL-INV-004091 |
| Quote | `QR-YYYY-#####` (unchanged) | QR-2026-04821 |

These live in `src/shared/references.ts` (`REFERENCE_PREFIXES` and `REFERENCE_PATTERN`).

## 7. Photos: free stock, no company branding

**Owner decision (2026-10-03):** use **free photos**, with **no visible company branding** of any kind: no logos,
liveried trucks, aircraft or containers with readable company names, branded uniforms, or watermarks.

**Process: same slots, new sources.** The `PHOTOS` array in `scripts/optimize-images.mjs` maps every site slot to a
source file under `images/`. Download the new photos into `images/free-pexels/` or `images/free-cc0/`, point the slots
at them, and re-run `node scripts/optimize-images.mjs`. It writes WebP + JPG at every width into `Public/images/agl/`
and regenerates `src/data/aglImages.ts`. No page code changes are needed.

**Allowed sources and licences** (the same two the site already uses):
| Source | Licence | Where to record it |
|---|---|---|
| Pexels (pexels.com) | Pexels License: free commercial use, no attribution required | `images/free-pexels/SOURCES.md` |
| Openverse (api.openverse.org) filtered to **CC0 / public domain**, e.g. rawpixel public-domain photos | CC0 1.0 | `images/free-cc0/SOURCES.md` |

Not allowed: Google Images, photos from other logistics companies' sites, "free" sites without a clear licence,
AI images showing real company names, and anything with a watermark. Add one row per file to the SOURCES table (file,
source page URL, photographer, licence), the same as the existing rows.

**Must be replaced** (the current files show the previous company's branding):

| Current source | Slots it feeds | What to find | Minimum size |
|---|---|---|---|
| `landingimage.png` | `hero-home`, `track-hero`, `callback-banner`, `services-hero`, `about-hero`, `og-image.jpg` | Wide container port / cargo terminal scene, ideally at dusk or golden hour, with cranes, stacked containers, a ship or truck. Calm areas for headline text; works when cropped to 16:9, 2:1, 3:1 and 12:5 | 2400 px wide, landscape |
| `landingimage-mobile.png` | `hero-home-mobile` | Portrait version of the same mood (a container stack, crane or cargo plane). It can be a separate photo | 1080×1920, portrait |
| `brand-img3.PNG` | `track-result-vehicle` | Unbranded freight truck / lorry on a highway | 1024 px on the short side |
| `brand-img5.PNG` | `contact-team` | Logistics or customer-support person at work (warehouse, cargo area or headset). No logos on clothing | 1024 px on the short side |

Pick photos that don't repeat the stock already on the site (the `service-*`, `industry-*` and `about-*` cards).
Square card slots are cropped from the centre, so keep the subject centred.

**Can stay** (unbranded stock with recorded licences): `locations-hero`, the four `service-*` cards, the four
`industry-*` cards, `about-operations`, `about-team`. **Open each one and confirm it shows no logo** before keeping it.
`images/site/*.jpg` (three industry cards) has no SOURCES record: if their licence can't be confirmed, replace
them with Pexels/CC0 photos as well. `brand-img*.PNG` and `logo.jpeg` are unused after the switch; delete them.

**Hotlinked heroes:** six page heroes load photos straight from `images.unsplash.com` in CSS (`ContactPage.css`,
`HelpPage.css`, `LegalPage.css`, `QuotePage.css`, `PublicQuoteResultPage.css`, `ShipPage.css`). Open each URL and confirm
it shows no company branding. Any that do get replaced with a Pexels/CC0 photo through the same pipeline. Moving the
others off Unsplash is optional and outside the one-hour scope; note it in the tracker.

**Alt text:** write it for every new photo in `docs/CONTENT.md §12` (replacing the `[NEW PHOTO]` markers) and in the
pages, describing what the photo actually shows.

**Status 2026-10-06 (tracker 3.2):** all four branded slots, the Freight & Linehaul card (it showed P&O Nedlloyd and
OOCL containers) and the three `images/site/` industry cards (no licence record) now use Pexels photos, recorded in
`images/free-pexels/SOURCES.md`. Hotlinked heroes: Ship (Maersk/SSA) and Quote result (Scania badge, operator
name) moved to the pipeline as `ship-hero` / `quote-result-hero`. Help and Legal are clean; Contact (blurred T-shirt
print) and Quote (small restaurant signage) are minor and stay on Unsplash for now. Kept stock checked by eye: no
logos, except `service-priority-express`, where a fragment of an airline tail logo shows behind the wing (kept: no
unbranded cargo-aircraft photo was found).

## 8. UI details: unchanged

Radius, shadows, buttons (the Track button uses the accent), icons (lucide-react), status chips (semantic colours only).
All stay as implemented.
