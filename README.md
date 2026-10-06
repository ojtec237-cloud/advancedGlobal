<div align="center">

<img src="Public/brand/agl-logo.png" alt="Advance Global Logistics" width="320" />

# Advance Global Logistics

**Fast, Safe, Reliable**

The public website, live shipment-tracking engine and operations console for **Advance Global Logistics Ltd**.

[![Node](https://img.shields.io/badge/node-%E2%89%A522.5-339933?logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![React](https://img.shields.io/badge/react-18-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/typescript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/vite-6-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Express](https://img.shields.io/badge/express-5-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![SQLite](https://img.shields.io/badge/sqlite-node%3Asqlite-003B57?logo=sqlite&logoColor=white)](https://nodejs.org/api/sqlite.html)
[![License](https://img.shields.io/badge/license-proprietary-lightgrey)](#license)

[Website](https://advancegloballogistics.com) · [Features](#features) · [Quick start](#quick-start) · [Deployment](#deployment) · [Docs](#documentation)

<img src="Public/brand/og-image.jpg" alt="Advance Global Logistics website preview" width="760" />

</div>

---

## Overview

A single Node.js application that serves both the customer-facing site and the internal admin console:

- **Public site** at `advancegloballogistics.com`: services, quotes, bookings and real-time shipment tracking.
- **Operations console** at `private.advancegloballogistics.com`: create and manage shipments, tracking events,
  documents, quotes and customer messages.

Express serves the REST API under `/api/*` and the built React app from `dist/`. Data lives in a single SQLite file.

## Features

### Public website
| | |
|---|---|
| 📦 **Live tracking** | Look up any `AGL` tracking ID and see a timeline, journey map, multi-piece list and shipment passport |
| 🗺️ **Maps & routing** | Leaflet maps with Nominatim geocoding and OSRM road routing; facility network map |
| 💬 **Quotes & booking** | Request a quote, view the quote result, and book a shipment online |
| 🧾 **Documents** | Branded PDF documents with barcodes (jsPDF + html2canvas + JsBarcode) |
| 📱 **Responsive** | Designed and checked from 375px phones to 1440px desktops |
| 🔎 **SEO-ready** | Static meta, Open Graph and JSON-LD, plus server-side SEO routes and a web manifest |

### Operations console
| | |
|---|---|
| 🛰️ **Operations Centre** | Dashboard with live shipment statistics |
| ➕ **Create & edit shipments** | Multi-piece shipments with auto-generated tracking IDs |
| 🕒 **Tracking events** | Add, edit and time-zone-correct events along the route |
| 📄 **Document Center** | Generate and manage shipment documents |
| 💼 **Quote requests & messages** | Review incoming quotes and customer messages |
| 🗑️ **Recently deleted** | Restore shipments removed by mistake |
| 🔐 **Secure by default** | bcrypt password hash, `express-session`, `helmet`, rate limiting, host-locked admin, `noindex` |

### Reference formats
| Reference | Format | Example |
|---|---|---|
| Tracking ID | `AGL` + 5 characters (8 total) | `AGL7K2M9` |
| Seal | `AGL-SL-######` | `AGL-SL-000123` |
| Ticket | `AGL-TKT-######` | `AGL-TKT-000123` |
| Invoice | `AGL-INV-######` | `AGL-INV-000123` |

## Tech stack

| Layer | Tools |
|---|---|
| Frontend | React 18, TypeScript, Vite 6, hash-based routing, plain CSS with design tokens |
| Maps | Leaflet, react-leaflet, Nominatim, OSRM |
| UI | lucide-react icons, JsBarcode, jsPDF, html2canvas |
| Backend | Express 5, express-session, helmet, express-rate-limit, bcryptjs |
| Database | SQLite via the built-in `node:sqlite` module (Node ≥ 22.5) |
| Tooling | tsx, concurrently, sharp (image pipeline), Node's built-in test runner |

## Quick start

**Requirements:** Node.js **22.5 or newer**.

```bash
# 1. Install dependencies (postinstall also runs a full build)
npm install

# 2. Configure environment
cp .env.example .env
#    then set ADMIN_PASSWORD_HASH and SESSION_SECRET (see below)

# 3. Start the API (:5000) and Vite dev server (:3000)
npm run dev
```

| URL | What |
|---|---|
| http://localhost:3000 | Public website |
| http://localhost:3000/#/admin | Operations console (localhost only in development) |
| http://localhost:5000/api/health | API health check |

### Generating secrets

```bash
# Admin password hash
node -e "console.log(require('bcryptjs').hashSync('YOUR-NEW-PASSWORD', 12))"

# Session secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Never commit `.env` or a plain-text password.

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Express API with hot reload + Vite dev server |
| `npm run build` | Type-check and build the frontend (`dist/`) and server (`dist-server/`) |
| `npm start` | Run the production server: `node dist-server/server/index.js` |
| `npm test` | Unit tests for tracking IDs, references, routing, time zones and formatting |
| `npm run preview` | Preview the built frontend with Vite |
| `node scripts/optimize-images.mjs` | Regenerate logos, favicons, OG image and responsive photos from `images/` |

## Environment variables

| Variable | Required | Description |
|---|---|---|
| `PORT` | No | Server port (default `5000`) |
| `NODE_ENV` | Production | Set to `production` on the live server |
| `ADMIN_PASSWORD_HASH` | Yes | bcrypt hash of the admin password |
| `SESSION_SECRET` | Yes | Random 64-character hex string |
| `DB_PATH` | Production | Absolute path to the SQLite file, **outside** the deploy folder so it survives redeploys |
| `SEED_DEMO_DATA` | No | `true` only for a local demo install; leave unset or `false` in production |

See [`.env.example`](.env.example) for full notes.

## Project structure

```
├── Public/               Static assets (capital P; served as-is)
│   ├── brand/            Logo, favicons, app icons, OG image (generated)
│   └── images/           Responsive WebP/JPG photos (generated)
├── src/
│   ├── App.tsx           Hash router and admin host check
│   ├── config/brand.ts   Single source of truth for brand facts
│   ├── pages/            Home, Track, Services, Quote, Ship, About, Help, Contact, Locations, Legal
│   ├── components/       Header, Footer, maps, timeline, documents, barcodes…
│   ├── admin/            Operations console (views + modals)
│   ├── shared/           Tracking-ID and reference rules (shared with the server)
│   └── styles/           Design tokens and global styles
├── server/
│   ├── index.ts          Express app: security, sessions, API, static hosting
│   ├── db.ts             SQLite schema and default settings
│   ├── routes/           auth, shipments, track, quotes, documents, messages, settings, stats
│   └── middleware/       Auth and rate limiting
├── scripts/              Image pipeline and unit tests
└── docs/                 Brand guide, content, deployment, tracker
```

## API at a glance

| Route | Access | Purpose |
|---|---|---|
| `GET /api/health` | Public | Health check |
| `/api/track` | Public | Look up a shipment by tracking ID |
| `/api/quotes` | Public / Admin | Submit and manage quote requests |
| `/api/messages` | Public / Admin | Contact messages |
| `/api/auth` | Public | Admin login / logout / session |
| `/api/shipments` | Public / Admin | Online booking; create, edit, delete and restore shipments |
| `/api/documents` | Public / Admin | Booking documents; document management |
| `/api/settings` | Public read / Admin write | Company display settings |
| `/api/stats` | Admin | Dashboard statistics |

## Deployment

The app runs as **one Node.js process** on any host that supports Node ≥ 22.5 web apps (it is configured for Hostinger).

| Setting | Value |
|---|---|
| Install | `npm install` (builds automatically via `postinstall`) |
| Start | `npm start` |
| Node | 22.x LTS or newer |
| Storage | Set `DB_PATH` to a persistent folder outside the app directory |
| HTTPS | Required: the admin session cookie is `secure` in production |
| Domains | `advancegloballogistics.com` (public) and `private.advancegloballogistics.com` (admin), same app |

Full step-by-step guide, DNS and launch checklist: [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md).

## Documentation

| Document | Contents |
|---|---|
| [`docs/BRAND_GUIDE.md`](docs/BRAND_GUIDE.md) | Name usage, colour, typography, logo, identifiers, photography |
| [`docs/CONTENT.md`](docs/CONTENT.md) | Approved site copy |
| [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md) | Hosting, environment, domains, launch checklist |
| [`docs/MOTION_3D_SPEC.md`](docs/MOTION_3D_SPEC.md) | Motion and 3D specification |
| [`docs/REBRAND_MAP.md`](docs/REBRAND_MAP.md) | Brand change checklist |
| [`docs/PROJECT_TRACKER.md`](docs/PROJECT_TRACKER.md) | Task status, change log and open items |

## Contributing

- Branch from `main`; keep commits small with prefixes such as `rebrand:`, `assets:`, `docs:`, `fix:`.
- Brand strings come from `src/config/brand.ts`; don't hard-code names, emails or domains.
- Before opening a PR: `npm run build` (zero TypeScript errors) and `npm test` must pass.

## Contact

**Advance Global Logistics Ltd** · [info@advancegloballogistics.com](mailto:info@advancegloballogistics.com) ·
[advancegloballogistics.com](https://advancegloballogistics.com)

## License

Proprietary. © Advance Global Logistics Ltd. All rights reserved. Photos are free stock (Pexels License / CC0);
sources are recorded alongside the originals.
