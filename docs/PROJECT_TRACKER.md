# Advance Global Logistics — Project Tracker

> **Context:** this platform is **already built and working**. This job rebrands it to **Advance Global Logistics** on
> its own domain: new name, logo, photos, admin password and tracking-ID prefix. The design, colour palette, fonts, layout
> and every feature stay exactly as they are. See `CLAUDE.md §0`.

**Target:** about **1 hour** of working time, excluding waiting on the owner's files and DNS.
**Status legend:** `[ ]` to do · `[~]` in progress · `[x]` done · `[!]` blocked (see Needs owner)

The previous build's full history (tracker, decisions, system notes) is in `docs/archive-sdl/PROJECT_TRACKER.md`.
Its **System notes** section still describes how the code works; read it if you need the architecture.

---

## Phase 0 — Baseline (≈5 min)
- [x] 0.1 `npm install`, `npm run build` (zero TS errors), `npm test`. Record pass/fail below.
- [x] 0.2 Add `/docs/archive-sdl/`, `/screens/`, `/images/` to `.gitignore` first, then `git init` (if needed), branch `agl-rebrand`, commit the baseline.
- [x] 0.3 Move the existing local database out of `data/` (keep a copy outside the project). AGL starts empty. *(Nothing to move: `data/` was already empty, no `*.db` anywhere in the project, `.env` sets no `DB_PATH`.)*

### Baseline
| Check | Result |
|---|---|
| `npm install` | Pass (Node 22.14.0; 243 packages; postinstall build OK; npm audit reports 3 high-severity advisories, not actioned) |
| `npm run build` | Pass, zero TS errors (Vite warns that the main chunk is 699 kB > 500 kB; pre-existing) |
| `npm test` | Pass, 33/33 |

## Phase 1 — Identity strings (≈15 min, REBRAND_MAP §1–2)
- [x] 1.1 `src/config/brand.ts`: name, short name, legal name, email, domain, logo paths, `TRACKING_PREFIX = 'AGL'`.
- [x] 1.2 `index.html` meta/OG/JSON-LD + `Public/site.webmanifest` + `package.json` name (+ lock file).
- [x] 1.3 Server: `DB_FILE`, remove the old-brand migration, service name, `SESSION_COOKIE = 'agl.sid'`, track-route error text.
- [x] 1.4 References (`AGL-SL/TKT/INV`), tracking-ID examples and placeholders, `DocumentBrand`, `PAGE_META`, legal docs, localStorage keys, comments.
- [x] 1.5 Tests updated; `npm test` and `npm run build` pass.

## Phase 2 — CSS prefix sweep (≈10 min, REBRAND_MAP §3)
- [x] 2.1 Scripted `--sdl-`/`sdl-` → `--agl-`/`agl-`; CSS header comments; `tokens.css` header. Visual parity check at 375/1440.

## Phase 3 — Logo and photos (≈15 min once the files arrive, BRAND_GUIDE §5, §7)
- [x] 3.1 Logo `images/advanced-logo.png` → `scripts/optimize-images.mjs` (keep alpha, re-measured globe mark; BRAND_GUIDE §5) → `Public/brand/agl-*` + icons + OG image. Check every output by eye.
- [x] 3.2 Find free, unbranded Pexels/CC0 photos for the four branded slots (BRAND_GUIDE §7), record them in SOURCES.md, rename outputs to `images/agl/` and `aglImages.ts`, write alt text (CONTENT §12). Check the kept stock and the six Unsplash hotlinked heroes for branding.
- [~] 3.3 Delete old `Public/brand/sdl-*`, `Public/images/sdl/`, `images/brand-img*`, `images/logo.jpeg`, `images/landingimage*.png`. *(3.2 adds: `images/site/` (no licence record) and `images/free-pexels/service-freight-linehaul.jpg` (branded), both now unused; `Public/images/sdl/` is already gone, renamed to `agl/`. 2026-10-06: `Public/brand/sdl-*` removed (5.1). The `images/` items are untracked, so deleting them can't be undone from git: owner to confirm (Needs owner #11).)*

## Phase 4 — Password, data, smoke test (≈5 min)
- [!] 4.1 New `ADMIN_PASSWORD_HASH` + `SESSION_SECRET` in local `.env` (owner generates them, DEPLOYMENT §4). *(Needs owner #3)*
- [ ] 4.2 Local smoke test on a fresh DB: admin login → create shipment (gets `AGL` + 5) → public Track finds it → waybill PDF → quote request appears in admin → contact form shows `AGL-TKT-`.

## Phase 5 — Sweep and deploy (≈10 min + DNS time, DEPLOYMENT.md)
- [~] 5.1 Final sweep (REBRAND_MAP §5) returns nothing; check source, a PDF, the admin login, the tab and favicon by eye. *(Sweep empty 2026-10-06. By-eye PDF check waits for the password (4.2 / DEPLOYMENT §7).)*
- [!] 5.2 `.gitignore` additions, new GitHub repo, push (DEPLOYMENT §2). *(Repo side done: `.gitignore` checked, nothing ignored is tracked. New repo and push: Needs owner #12.)*
- [!] 5.3 Hostinger Node app + env vars + domain + `private.` alias + SSL + mailbox (DEPLOYMENT §3–6). *(Needs owner #4, #5)*
- [ ] 5.4 Launch checklist (DEPLOYMENT §7) on the live domain; then remove `/api/diag/storage`.

---

## Blocked / Needs owner

**For this rebrand:**
| # | Item | Needed for |
|---|---|---|
| 1 | ~~Logo file~~ **Supplied 2026-10-03:** `images/advanced-logo.png` (2025×777, transparent). | 3.1 |
| 2 | ~~Replacement photos~~ **Resolved 2026-10-03:** owner chose free, unbranded stock (Pexels / CC0), sourced in 3.2. | 3.2 |
| 3 | New admin password: the owner generates the bcrypt hash (DEPLOYMENT §4) and puts it in `.env` and Hostinger | 4.1, 5.3 |
| 4 | `advancegloballogistics.com` registered and pointed at Hostinger; access to hPanel | 5.3 |
| 5 | Mailbox `info@advancegloballogistics.com` created | 5.3 |
| 6 | ~~Tagline on the logo?~~ **Resolved:** the logo prints no tagline, so `TAGLINE` stays "Fast, Safe, Reliable". | 1.1 |
| 7 | **Logo spelling, launch blocker:** the supplied logo reads "ADVANC**ED** GLOBAL LOGISTICS", but the registered name is **Advance** Global Logistics Ltd. Get a corrected logo from the designer before launch, ideally also as SVG. Drop it in at `images/advanced-logo.png` (or update the path) and re-run the script. | 3.1, 5.4 |
| 8 | ~~Stale `SEED_DEMO_DATA` comment~~ **Brand cleared 2026-10-03.** Still noted: no code in `server/` reads `SEED_DEMO_DATA`, so the `.env.example` / DEPLOYMENT text describes a flag that does nothing. Not fixed in the rebrand. | 5.1 |
| 9 | **Logo at small sizes:** in the header (about 110 px desktop, 96–130 px mobile) the "AGL" monogram reads well, but "ADVANCED GLOBAL" is tiny and the spaced "LOGISTICS" line is about 4 px tall and unreadable. The 16 px favicon (globe + orbit arrow, a wide shape) is a red/black smudge; 32 px is fine. Screenshots: `screens/agl-header-375.png`, `agl-header-1440.png`, `agl-favicons.png`. Suggestion: with the corrected logo, ask the designer for a compact horizontal lockup (monogram + one-line name) for the header and a simplified square icon (globe only) for favicons. Layout not changed. | 3.1, 5.4 |
| 10 | **Priority Express card photo:** `service-priority-express.jpg` shows a fragment of a red airline tail logo behind the wing (no name readable). Kept, because every cargo-aircraft photo found on Pexels shows a full livery (DHL, UPS, FedEx, Thai, Air China…). Owner to accept it, or supply/approve another photo. | 3.2 |
| 11 | **Delete local originals (3.3):** `images/brand-img*`, `images/logo.jpeg`, `images/landingimage*.png`, `images/site/`, `images/free-pexels/service-freight-linehaul.jpg`. They are git-ignored, so deletion is permanent and they never reach GitHub or Hostinger. Owner to confirm (or keep a copy outside the project first). | 3.3 |
| 12 | **Create the private GitHub repo and push** with fresh history (DEPLOYMENT §2). The local history's file names include the previous brand (`sdl-*`), so push a single squashed commit, not this branch's history. | 5.2 |
| 13 | **Doc gap:** DEPLOYMENT §7 says "Final old-brand sweep (REBRAND_MAP §7)", but REBRAND_MAP ends at §5. Use §5's grep patterns on the live HTML/JS. Not fixed in the rebrand. | 5.4 |

**Still open from the previous build (they apply to AGL too; details in the archive tracker under the same numbers):**
| Archive # | Item |
|---|---|
| 2, 3, 9 | Phone / WhatsApp, head-office address, social links (UI hides them while empty) |
| 4 | Confirm the global gateway list (`src/data/gateways.ts`) is right for AGL |
| 5, 6, 7, 8 | Real stats, testimonials, partner logos, certifications (none shown until supplied) |
| 11, 37 | **Lawyer review of the legal pages** with AGL's jurisdiction, before launch |
| 14, 21, 30 | No email notification for contact / callback / support messages (needs an email provider) |
| 17, 18 | Exchange rates and real pricing for the automatic estimates |
| 40 | HTTP compression in production |
| 43 | Manual phone checks (iPhone Safari, Android Chrome) |

## Decisions log
| Date | Decision |
|---|---|
| 2026-10-03 | Brand: **Advance Global Logistics Ltd**, short name **AGL**, domain **advancegloballogistics.com**, email **info@advancegloballogistics.com**. Owner confirmed. |
| 2026-10-03 | Tracking ID: **`AGL` + 5 characters** (8 total, e.g. `AGL7K2M9`); same alphabet and rules as before. References `AGL-SL/TKT/INV-######`. Owner confirmed. |
| 2026-10-03 | Admin console on **`private.advancegloballogistics.com`** (`ADMIN_SUBDOMAIN` stays `'private'`). Owner confirmed. |
| 2026-10-03 | Design, palette, fonts, layout, motion and features are **unchanged**. The palette is not re-derived from the new logo. |
| 2026-10-03 | Own repo, own Hostinger app, new admin password/session secret, **empty database**. No data is carried over. |
| 2026-10-03 | Name confirmed as **Advance** Global Logistics Ltd, even though the supplied logo says "Advanced". The logo is used as is until the designer corrects it (Needs owner #7). Text is never changed to match the logo. |
| 2026-10-03 | Photos: free stock only (Pexels License or CC0), no visible company branding, each logged in `images/free-*/SOURCES.md`. |
| 2026-10-03 | CSS/class prefix renamed `sdl-` → `agl-` by script, so no trace of the previous brand remains. |
| 2026-10-03 | Removed the one-time old-brand migration from `server/db.ts` (`OLD_BRAND_SETTINGS`, `OLD_BRAND_TEXT`, `replaceOldBrandText()`, `LEGACY_DB_FILE` and its startup warning). It only rewrote a database inherited from an earlier brand; AGL starts with an empty database, so it was dead code that hard-coded an old brand name. Every other migration is kept (REBRAND_MAP §2 C). |

## Change log
| Date | Task | Summary |
|---|---|---|
| 2026-10-03 | docs | Prompt pack and docs rewritten for the AGL rebrand; previous client's tracker, map and prompts moved to `docs/archive-sdl/`. |
| 2026-10-03 | docs | Logo `images/advanced-logo.png` wired into the docs (pipeline changes in BRAND_GUIDE §5; "ADVANCED" spelling flagged as #7). Photos switched to free unbranded Pexels/CC0; prompt 05 split into 05a (sourcing) and 05b (pipeline). |
| 2026-10-03 | 0.1–0.3 | Baseline green (build clean, 33/33 tests). `.gitignore` gains `/docs/archive-sdl/`, `/screens/`, `/images/`; `git init`, branch `agl-rebrand`, baseline commit. `data/` was already empty. |
| 2026-10-03 | 1.1–1.3 | `brand.ts` set to AGL (prefix `AGL`, logo paths `agl-logo*.png`); `index.html`, manifest (`?v=4`), package name + lock file, `.env.example` DB path; server `DB_FILE` `agl_global.db`, old-brand migration removed, service name/startup log from `COMPANY`, cookie `agl.sid`, track 400 text from `TRACKING_PREFIX`. Build clean; 5 tracking-ID tests fail on hard-coded `DLS` until 1.5. |
| 2026-10-03 | 1.4–1.5 | `AGL-SL/TKT/INV` + `REFERENCE_PATTERN`; every tracking-ID example, placeholder and help text `DLS…` → `AGL…`; `PAGE_META` (default description built from `COMPANY`), `DocumentBrand` pouch + footer, legal docs (`"AGL"`, `agl.sid`, storage keys), help article, localStorage keys `agl_recent_tracking`/`agl_units`/`agl_live_shipment_stream` (+ admin draft key `agl_admin_shipment_draft`); ID/reference comments in src + server; service file headers made brand-neutral. Tests moved to AGL (invalid samples still invalid). 33/33 tests, build clean. API via Vite proxy: "agl 7k2-m9" → 404 for AGL7K2M9 (accepted), "DLS7K2M9" → 400. Photo alt text left for 3.2, CSS headers for 2.1. |
| 2026-10-03 | 2.1 (part) | Remaining previous-brand references cleared: CSS file headers → "ADVANCE GLOBAL LOGISTICS" / "red accent"; `tokens.css` header describes graphite + red with no company or logo name (values unchanged); `SDL` dropped from six photo alts (owner OK, 3.2 rewrites them); `.env.example` demo comment de-branded; test foreign-prefix samples `DXP…` → `XYZ…`. Sweep now hits only the sdl-named image manifest, its imports, `/brand/sdl-mark.png` and `optimize-images.mjs` (3.1–3.3). Build clean, 33/33 tests. Visual parity check at 375/1440 still to do. |
| 2026-10-04 | 2.1 | Parity check done. Sweep commit proven a pure rename: its 2,671 removed lines, with `sdl-`→`agl-` applied, equal its 2,671 added lines; the later CSS edits are comments only; no `sdl-` class names left in `src`. Headless Chrome on the production build at 375 (iframe) and 1440: Home, Track and admin login fully styled, no overflow. Admin dashboard not viewed (needs the new password, 4.1). Header shows the text name until `agl-logo.png` exists (3.1). Build clean, 33/33 tests. |
| 2026-10-04 | 3.1 | `optimize-images.mjs`: logo loaded from `images/advanced-logo.png` as is (alpha kept; `whiteToAlpha` and `redOnly` removed as unused); square mark re-measured on the 2025×777 file: globe + orbit arrow cut out in full colour by flood-filling the opaque regions from three seeds inside a 620×360 box (the transparent gap keeps the G/L letters out), with a 2 px soft rim. Outputs `agl-logo.png`, `agl-logo-white.png`, `agl-mark.png` + the six icons; all checked by eye (white logo on the dark footer has no fringe; its globe continents turn white per the non-red→white rule). Home thermal label → `/brand/agl-mark.png`. Photos and `og-image.jpg` regenerate byte-identical; the OG image changes with the new hero photo in 3.2. Icon `?v=4` already bumped in 1.2 and never deployed, so not bumped again. Small-size legibility flagged as Needs owner #9. Build clean, 33/33 tests. |
| 2026-10-06 | 3.2 | Photos replaced with free, unbranded Pexels photos, each checked at full resolution for logos/names (SOURCES.md): Home/Track/Services/About/callback/OG hero `hero-port-cranes-night.jpg` (About now the centre band; 'bottom' cut the cranes), separate portrait phone hero, truck card, contact card, plus Freight & Linehaul card (old one showed P&O Nedlloyd/OOCL) and the three unlicensed `images/site/` industry cards. Ship and Quote-result heroes moved off Unsplash (Maersk/SSA; Scania + operator name) to new slots `ship-hero` / `quote-result-hero`. Outputs renamed `Public/images/agl/` + `aglImages.ts` (`AGL_IMAGES`, `AglImageName`); hero outputs capped at 2400 px (new sources up to 6000 px). 13 page alts + CONTENT §12 rewritten. Other generated photos regenerate byte-identical. Headless Chrome on the production build at 375 (iframe) and 1440: Home, Services, About, Track, Ship laid out as before. Not changed: Contact and Quote Unsplash heroes (minor: blurred T-shirt print, small restaurant signage), Help/Legal (clean). `contact-team` slot is generated but no page uses it. Build clean, 33/33 tests. |
| 2026-10-06 | 5.1–5.2 | REBRAND_MAP §5 sweep: source and `dist`/`dist-server` clean; the Public listing showed `Public/brand/sdl-logo.png`, `sdl-logo-white.png`, `sdl-mark.png` (unreferenced, but shipped in `dist/brand/`), removed in their own commit. Re-sweep of all three empty, including `dist/`. `.gitignore` still has `/docs/archive-sdl/`, `/screens/`, `/images/`, `.env`, `/data/`; `git ls-files` and the whole history contain none of them; `grep "DEMO DATA"` empty. Build clean, 33/33 tests. Push and Hostinger left to the owner (#12, #3–5). |
