# Deployment: GitHub → Hostinger

> **Context:** this platform is **already built and working** (public site, tracking engine, Express/SQLite API,
> admin console, documents, quotes). This job rebrands it to **Advance Global Logistics** on its own domain. The design,
> colour palette, fonts, layout and every feature stay exactly as they are. See `CLAUDE.md §0`.

**Note:** this codebase is already proven on Hostinger (see the comment in `vite.config.ts` about the `Public/` folder).
Advance Global Logistics gets its **own** GitHub repo, its **own** Hostinger Node.js app, its **own** domain, its
**own** admin password and session secret, and an **empty database**. Nothing is shared with any previous deployment.

The app is **one Node.js process**: Express serves the API (`/api/*`) and the built React site (`dist/`).
It stores data in a **SQLite file**. That shapes everything below.

---

## 1. Hosting requirements

| Need | Why |
|---|---|
| A Hostinger plan that runs **Node.js web apps** (Business / Cloud web hosting, or a VPS) | Plain static hosting cannot run the Express server, tracking API or admin |
| **Node.js ≥ 22.5** (choose 22.x LTS or newer) | `server/db.ts` uses the built-in `node:sqlite` |
| **Persistent storage** outside the deploy folder | The database must survive every redeploy |
| HTTPS (free SSL in hPanel) | The admin session cookie is `secure` in production |

Hostinger's hPanel screens change from time to time. If a label below doesn't match, look for the equivalent setting.

## 2. Repository setup

1. Before the first commit, add `/docs/archive-sdl/`, `/screens/` and `/images/` (raw photo originals) to `.gitignore`. Keep the leading
   slash: a bare `images/` would also ignore `Public/images/` and the live site would lose its photos.
   That keeps the previous client's history, old screenshots and unoptimised photos off GitHub. The optimised
   copies in `Public/` are what the site serves.
2. Create a **new private GitHub repo** (e.g. `advance-global-logistics`). Push with fresh history:
   ```bash
   git init && git add . && git commit -m "Advance Global Logistics: initial import"
   git branch -M main && git remote add origin https://github.com/<you>/advance-global-logistics.git && git push -u origin main
   ```
3. Confirm `.gitignore` still excludes `node_modules/`, `dist/`, `dist-server/`, `/data/`, `.env`.
4. `package.json` already has `"engines": { "node": ">=22.5" }`; keep it.

## 3. Hostinger app configuration

| Setting | Value |
|---|---|
| Source | GitHub → `advance-global-logistics`, branch `main` |
| Node version | 22.x (or newer LTS) |
| Install command | `npm install` (the `postinstall` script already runs `npm run build`) |
| Build command | `npm run build` (only if the panel requires a separate build step; don't build twice if postinstall already did) |
| Start command | `npm start` → `node dist-server/server/index.js` |
| Port | Use the port the platform provides (`PORT` env var). The server reads `process.env.PORT` |

## 4. Environment variables (set in hPanel, never commit)

```ini
NODE_ENV=production
PORT=<provided by Hostinger or 5000>
ADMIN_PASSWORD_HASH=<bcrypt hash — see below>
SESSION_SECRET=<64 hex chars — see below>
SEED_DEMO_DATA=false
DB_PATH=/home/<hostinger-user>/agl-data/agl_global.db   # a folder OUTSIDE the app/deploy directory
```

Generate these locally:
```bash
node -e "console.log(require('bcryptjs').hashSync('YOUR-STRONG-PASSWORD', 12))"
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**New admin password (required):** the owner picks a new password and generates its hash with the command above.
Never reuse a previous deployment's `ADMIN_PASSWORD_HASH` or `SESSION_SECRET`. Put the same two values in the local
`.env` for local testing. Claude never sees or writes the plain-text password.

**Fresh database:** the default file name is `agl_global.db`. Advance Global Logistics starts with an **empty**
database. Never copy another deployment's `.db` file: it holds that company's customers and shipments. On first
start, the admin Settings defaults (company name, email) come from `src/config/brand.ts`.

**Check persistence before launch:** the server has a temporary endpoint, `GET /api/diag/storage`. It is admin-only,
so log in to the admin console first, then open `https://private.advancegloballogistics.com/api/diag/storage` in the same
browser. Redeploy and open it again. If `markerFirstSeen` stays the same, storage persists. **After confirming, remove
this endpoint.**

## 5. Domains & DNS

| Host | Points to | Purpose |
|---|---|---|
| `advancegloballogistics.com` | Node app | Public site |
| `www.advancegloballogistics.com` | Redirect → apex (or the reverse; pick one) | |
| `private.advancegloballogistics.com` | **Same** Node app (add as an alias/additional domain) | Admin console |

- **Admin console: `https://private.advancegloballogistics.com`.** `isAdminHost()` in `src/App.tsx` used to check for the
  `dr.` prefix. It now reads `ADMIN_SUBDOMAIN = 'private'` from `src/config/brand.ts`.
- In hPanel, add `private.advancegloballogistics.com` as an additional domain/alias of the **same** Node app, not a
  separate app, so both hostnames share one API, one session store and one database.
- On the public domain, `#/admin` must fall back to Home. The admin host serves
  `<meta name="robots" content="noindex, nofollow">`. Don't list the subdomain in `robots.txt` or `sitemap.xml`.
- Turn on SSL for all three hostnames, and force HTTPS.

## 6. Email (info@advancegloballogistics.com)

- Create the mailbox (Hostinger Email or Google Workspace).
- DNS: **MX** records from the provider · **SPF** `v=spf1 include:<provider> ~all` · **DKIM** (from the provider) ·
  **DMARC** `v=DMARC1; p=quarantine; rua=mailto:info@advancegloballogistics.com`.
- Send a test to Gmail and check "Show original" → SPF/DKIM/DMARC = PASS.

## 7. Launch checklist (smoke test on the live domain)

- [ ] **Demo data removed (launch blocker, CLAUDE.md rule 10).** No demo shipments, quotes or documents on the public site or in the
  production database; `SEED_DEMO_DATA=false`; `grep -rn "DEMO DATA" src server` returns nothing. Tracking AGL7K2M9 on the
  live site must say "not found".
- [ ] Home loads over HTTPS, and the globe loads (or falls back) with no console errors.
- [ ] `/api/health` returns `ok` with the AGL service name.
- [ ] Admin subdomain → login works with the new password; `#/admin` on the public domain does **not** open admin.
- [ ] Create a shipment in admin → it gets a `AGL` + 5-character ID → the public Track page finds it.
- [ ] Download the waybill / POD PDFs; both show AGL branding only.
- [ ] Quote request → appears in admin → quote link opens publicly.
- [ ] Contact and callback forms submit and show an `AGL-TKT-` reference.
- [ ] Redeploy once, then confirm the shipment above still exists (persistence).
- [ ] View source + `robots.txt` + `sitemap.xml` + OG preview (e.g. paste the link in WhatsApp): all AGL.
- [ ] **OG image is live:** `https://advancegloballogistics.com/brand/og-image.jpg` returns 200 (`image/jpeg`). `index.html` points `og:image`,
  `twitter:image`, `og:url` and `canonical` at that exact domain, so if the site is served on `www.` instead, update all four
  first. Then run the home URL through the Facebook Sharing Debugger and LinkedIn Post Inspector ("Scrape again") so they
  drop any cached preview from before launch.
- [ ] Final old-brand sweep on the live HTML/JS bundle (REBRAND_MAP §7).
- [ ] Lighthouse mobile on Home meets the MOTION_3D_SPEC §2 targets.

## 8. After launch

- **Backups:** copy `agl_global.db` daily to off-server storage (a Hostinger cron job + download, or a VPS cron to cloud
  storage). Test a restore once.
- **Updates:** push to `main` → Hostinger redeploys. Use a `staging` branch/subdomain for bigger changes.
- **Monitoring:** a free uptime monitor on `/api/health` (5-minute interval) with email alerts to info@.
- **Security:** rotate `ADMIN_PASSWORD_HASH` and `SESSION_SECRET` if anyone leaves; keep dependencies updated
  (`npm audit` monthly).