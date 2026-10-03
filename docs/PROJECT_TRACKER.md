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
- [ ] 0.1 `npm install`, `npm run build` (zero TS errors), `npm test`. Record pass/fail below.
- [ ] 0.2 Add `/docs/archive-sdl/`, `/screens/`, `/images/` to `.gitignore` first, then `git init` (if needed), branch `agl-rebrand`, commit the baseline.
- [ ] 0.3 Move the existing local database out of `data/` (keep a copy outside the project). AGL starts empty.

### Baseline
| Check | Result |
|---|---|
| `npm run build` | |
| `npm test` | |

## Phase 1 — Identity strings (≈15 min, REBRAND_MAP §1–2)
- [ ] 1.1 `src/config/brand.ts`: name, short name, legal name, email, domain, logo paths, `TRACKING_PREFIX = 'AGL'`.
- [ ] 1.2 `index.html` meta/OG/JSON-LD + `Public/site.webmanifest` + `package.json` name (+ lock file).
- [ ] 1.3 Server: `DB_FILE`, remove the old-brand migration, service name, `SESSION_COOKIE = 'agl.sid'`, track-route error text.
- [ ] 1.4 References (`AGL-SL/TKT/INV`), tracking-ID examples and placeholders, `DocumentBrand`, `PAGE_META`, legal docs, localStorage keys, comments.
- [ ] 1.5 Tests updated; `npm test` and `npm run build` pass.

## Phase 2 — CSS prefix sweep (≈10 min, REBRAND_MAP §3)
- [ ] 2.1 Scripted `--sdl-`/`sdl-` → `--agl-`/`agl-`; CSS header comments; `tokens.css` header. Visual parity check at 375/1440.

## Phase 3 — Logo and photos (≈15 min once the files arrive, BRAND_GUIDE §5, §7)
- [ ] 3.1 Logo `images/advanced-logo.png` → `scripts/optimize-images.mjs` (keep alpha, re-measured globe mark; BRAND_GUIDE §5) → `Public/brand/agl-*` + icons + OG image. Check every output by eye.
- [ ] 3.2 Find free, unbranded Pexels/CC0 photos for the four branded slots (BRAND_GUIDE §7), record them in SOURCES.md, rename outputs to `images/agl/` and `aglImages.ts`, write alt text (CONTENT §12). Check the kept stock and the six Unsplash hotlinked heroes for branding.
- [ ] 3.3 Delete old `Public/brand/sdl-*`, `Public/images/sdl/`, `images/brand-img*`, `images/logo.jpeg`, `images/landingimage*.png`.

## Phase 4 — Password, data, smoke test (≈5 min)
- [!] 4.1 New `ADMIN_PASSWORD_HASH` + `SESSION_SECRET` in local `.env` (owner generates them, DEPLOYMENT §4). *(Needs owner #3)*
- [ ] 4.2 Local smoke test on a fresh DB: admin login → create shipment (gets `AGL` + 5) → public Track finds it → waybill PDF → quote request appears in admin → contact form shows `AGL-TKT-`.

## Phase 5 — Sweep and deploy (≈10 min + DNS time, DEPLOYMENT.md)
- [ ] 5.1 Final sweep (REBRAND_MAP §5) returns nothing; check source, a PDF, the admin login, the tab and favicon by eye.
- [ ] 5.2 `.gitignore` additions, new GitHub repo, push (DEPLOYMENT §2).
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

## Change log
| Date | Task | Summary |
|---|---|---|
| 2026-10-03 | docs | Prompt pack and docs rewritten for the AGL rebrand; previous client's tracker, map and prompts moved to `docs/archive-sdl/`. |
| 2026-10-03 | docs | Logo `images/advanced-logo.png` wired into the docs (pipeline changes in BRAND_GUIDE §5; "ADVANCED" spelling flagged as #7). Photos switched to free unbranded Pexels/CC0; prompt 05 split into 05a (sourcing) and 05b (pipeline). |
