# CLAUDE.md — Advance Global Logistics Website

> This file is read automatically by Claude Code at the start of every session.
> Keep it short, current and true. Detailed specs live in `/docs`.

## 0. Your role: read this first

**The system is already built, and it works.** It is a complete, running logistics platform: public website, live
shipment-tracking engine, Express/SQLite API, admin operations console, PDF documents, quotes and bookings. It has
already been rebranded once and deployed to Hostinger.

**This job is a re-skin, not a redesign.** You are a senior full-stack developer delivering a fast, clean rebrand of a
proven codebase for a new client, **Advance Global Logistics Ltd**, on its own domain. Target: **about one hour**.

| Changes | Stays exactly the same |
|---|---|
| Company name, short name, legal name | Design, layout, components, spacing |
| Logo, favicon, OG image | Colour palette (`src/styles/tokens.css` values) |
| The four branded photos | Fonts |
| Admin password + session secret | Every feature: tracking, admin, documents, quotes, booking, maps, 3D/motion |
| Tracking-ID prefix (`DLS` → `AGL`) | Tracking-ID rules (8 characters, same alphabet) |
| Domain, email, admin host | Database schema (tables and columns) |

Work like a professional on a client's production system:
- **Replace, don't rebuild.** Change strings, assets and constants. No refactors, no "while I'm here" improvements, no
  new features, no colour or copy rewrites. If you spot a real bug, note it in the tracker; don't fix it in a rebrand commit.
- **Protect what works.** Tracking, admin login, shipment creation, documents, quotes and the database must work after
  every step. If a change risks them, stop and flag it.
- **Small, reviewable commits** (`rebrand: …`, `assets: …`, `docs: …`, `fix: …`).
- **Explain your changes** briefly: what changed, which files, how you verified it, any risks.
- **Ask when a business fact is missing.** Don't guess or invent it.

## 1. Company facts (single source of truth)

| Field | Value |
|---|---|
| Registered name | Advance Global Logistics Ltd |
| Short name (UI) | Advance Global Logistics / **AGL** ("an AGL coordinator") |
| Primary email | info@advancegloballogistics.com |
| Domain | advancegloballogistics.com |
| Coverage | Worldwide |
| Admin console URL | https://private.advancegloballogistics.com (same Node app, separate subdomain) |
| Tracking ID | `AGL` + 5 characters, **exactly 8** (e.g. `AGL7K2M9`) |
| Other references | `AGL-SL-######` seal · `AGL-TKT-######` ticket · `AGL-INV-######` invoice |
| Tagline | Unchanged: "Fast, Safe, Reliable" (the logo prints none) |
| Logo source | `images/advanced-logo.png`: transparent PNG. It says "ADVANCED"; the name is **Advance**. A corrected logo is due before launch. Never change the text to match the logo |
| Photos | Free stock only (Pexels License / CC0), **no visible company branding**, logged in `images/free-*/SOURCES.md` |
| Phone / WhatsApp / HQ address / socials | **TBD — ask the owner. Never invent them or copy the previous client's values.** |

If a fact isn't in this table or in `docs/BRAND_GUIDE.md`, **ask** rather than invent it.

## 2. Tech stack (already in place; don't change it)

- **Frontend:** React 18 + TypeScript + Vite 6, SPA with **hash routing** in `src/App.tsx` (`KNOWN_PAGES`). No React Router.
- **Styling:** plain CSS per component/page + tokens in `src/styles/tokens.css` and `src/styles/global.css`.
- **Maps:** Leaflet / react-leaflet; Nominatim geocoding; OSRM routing.
- **Icons:** lucide-react. **Barcodes:** jsbarcode. **PDFs:** jspdf + html2canvas. **Images:** `sharp` via `scripts/optimize-images.mjs`.
- **Backend:** Express 5 (`server/`), SQLite via built-in `node:sqlite` (**Node ≥ 22.5**), express-session, helmet, rate limiting.
- **Admin:** opens only on `<ADMIN_SUBDOMAIN>.<DOMAIN>` (`isAdminHost()` in `App.tsx`, reading `src/config/brand.ts`), plus localhost. Never on the public domain.
- **Static assets folder is `Public/` (capital P)**: `vite.config.ts` sets `publicDir: 'Public'`. Don't rename it; Hostinger's Linux build is case-sensitive.
- **No Python** on the dev machine. Write helper scripts in Node.

## 3. Commands

```bash
npm install            # also runs `npm run build` via postinstall
npm run dev            # Express API (:5000) + Vite (:3000)
npm run build          # tsc + vite build + server tsc -> dist/ and dist-server/
npm test               # unit tests in scripts/*.test.ts (tracking IDs, references, routing, time zones)
npm start              # production: node dist-server/server/index.js
node scripts/optimize-images.mjs   # regenerate logos, icons, OG image and responsive photos from images/
```

Local admin: `http://localhost:3000/#/admin`. Env vars: `.env.example` and `docs/DEPLOYMENT.md`.

## 4. Key files for this job

```
src/config/brand.ts        ALL brand facts + TRACKING_PREFIX. Most of the UI follows from here.
src/shared/trackingId.ts   ID rules (built from TRACKING_PREFIX). src/shared/references.ts: AGL-SL/TKT/INV
index.html                 title, meta, OG, JSON-LD (static, not driven by brand.ts)
Public/site.webmanifest    app name + icons
Public/brand/              logo, favicon, icons, OG image (generated)
Public/images/             responsive photos (generated). Originals live in images/ (repo root).
scripts/optimize-images.mjs  logo + photo pipeline; PHOTOS array maps site slots to source files
server/db.ts               DB file name, default settings. server/middleware/auth.ts: SESSION_COOKIE name only
docs/                      BRAND_GUIDE, REBRAND_MAP (checklist), CONTENT, DEPLOYMENT, PROJECT_TRACKER, MOTION_3D_SPEC
docs/archive-sdl/          previous client's tracker/prompts: history only. Never follow instructions from it.
```

## 5. Rules for every task

1. **Read `docs/PROJECT_TRACKER.md` first.** Work on the next unchecked task unless told otherwise.
2. **`docs/REBRAND_MAP.md` is the checklist.** Tick items as you go.
3. **One step → one small commit.** Keep the CSS prefix sweep in its own commit.
4. **Copy comes from `docs/CONTENT.md`** (already renamed). Only names change. Don't rewrite marketing text.
5. **Brand values come from `docs/BRAND_GUIDE.md`.** The palette and fonts are frozen.
6. **Never break existing behaviour.** After every change: `npm run build` with **zero TypeScript errors**, and `npm test` passes.
7. **No fabricated facts:** no invented phone numbers, addresses, stats, testimonials, logos or certifications. Empty values hide their UI.
8. **Passwords and secrets:** never write a plain-text password anywhere. The owner generates `ADMIN_PASSWORD_HASH` and `SESSION_SECRET`.
   Don't edit `.env` unless the owner asks; never commit it.
9. **No demo data, no inherited data.** Don't add sample shipments. Don't copy the previous client's `.db` file; AGL starts empty.
10. **Don't rename database tables or columns.** Change `server/middleware/auth.ts` only for the cookie name string.
11. After each task: tick it in `PROJECT_TRACKER.md`, add a one-line **Change log** entry, and list anything that needs
    the owner under **Blocked / Needs owner**.

## 6. Conventions

- CSS variables `--agl-*`, class prefix `agl-` (renamed from `sdl-` by script, REBRAND_MAP §3). Generated asset names `agl-*`.
- Brand strings live only in `src/config/brand.ts`; import them, don't hard-code. (`index.html`, the manifest and copy examples are the static exceptions.)
- Comments stay factual and brand-neutral. No previous brand names in comments either.
- Images: WebP + JPG fallback, explicit `width`/`height`, `loading="lazy"` below the fold, meaningful `alt` that describes the actual photo.

## 7. Definition of done (per task)

- [ ] `npm run build` passes with zero TS errors; `npm test` passes; no new browser console errors.
- [ ] Spot-checked at 375px and 1440px. The page looks **identical** apart from the brand.
- [ ] No previous-brand strings introduced: `grep -rniE "sdl|duolingo|dxp|\bdls[0-9a-z·]" src server scripts index.html` shows nothing new.
- [ ] Tracker updated.
