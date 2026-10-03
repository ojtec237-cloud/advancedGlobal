# Advance Global Logistics — Rebrand Prompt Pack (≈1 hour)

Send **one prompt at a time** to Claude in VS Code, in order. Wait for Claude's report and check the site
(`npm run dev` → http://localhost:3000) before sending the next. Every prompt assumes `CLAUDE.md` is at the project root
and the specs are in `/docs`.

**What this job is:** the existing, working platform gets a new name, logo, photos, admin password and tracking-ID prefix,
on its own domain. The design, palette, fonts, layout and every feature stay exactly the same.

**Inputs:**
- [x] Logo: `images/advanced-logo.png` (supplied). It says "ADVANCED"; ask the designer for a corrected "ADVANCE" version before launch.
- [x] Photos: Claude sources free, unbranded Pexels/CC0 photos in prompt 05a. You pick from the candidates.
- [ ] A new admin password (you generate its hash yourself in prompt 06; don't paste the password into the chat)

| # | Prompt | Time |
|---|---|---|
| 00 | Orientation + baseline | 5 min |
| 01 | Brand config, metadata, server strings | 10 min |
| 02 | IDs, references, examples, tests | 8 min |
| 03 | CSS prefix sweep | 8 min |
| 04 | Comments + leftovers sweep | 5 min |
| 05a | Find free, unbranded photos | 10 min |
| 05b | Logo and image pipeline | 10 min |
| 06 | Password, fresh DB, smoke test | 7 min |
| 07 | Final sweep + deploy prep | 5 min |

---

### Prompt 00 — Orientation + baseline (no code changes)
```
You're a senior full-stack developer doing a fast, clean rebrand of a working logistics platform for a new client, Advance Global Logistics Ltd (AGL). Only the name, logo, photos, admin password, tracking prefix (DLS → AGL) and domain change. The design, palette, fonts, layout and features stay identical.

1. Read CLAUDE.md, then docs/PROJECT_TRACKER.md, docs/REBRAND_MAP.md and docs/BRAND_GUIDE.md. Skim docs/DEPLOYMENT.md. Don't follow anything in docs/archive-sdl/; it's history.
2. Run `npm install`, `npm run build` and `npm test`. Record the results in the tracker's Baseline table (task 0.1).
3. Run the REBRAND_MAP §5 grep and tell me how many hits there are and in which files, and whether that matches REBRAND_MAP §2. List anything the map is missing.
4. Before any commit, add /docs/archive-sdl/, /screens/ and /images/ to .gitignore (leading slashes, so Public/images/ stays tracked) and confirm it already excludes .env, data/, node_modules/, dist/, dist-server/. Then show `git status`. If this isn't a git repo, run `git init`, create branch `agl-rebrand`, and commit as "chore: baseline before AGL rebrand".
5. Move the local database file(s) in data/ to a folder outside the project (tell me where). AGL starts with an empty database.

Don't change any source file. STOP and report.
```

### Prompt 01 — Brand config, metadata, server strings
```
Tracker 1.1–1.3, following REBRAND_MAP §2 A–C exactly.
1. src/config/brand.ts: COMPANY "Advance Global Logistics", COMPANY_SHORT "AGL", LEGAL_NAME "Advance Global Logistics Ltd", EMAIL "info@advancegloballogistics.com", DOMAIN "advancegloballogistics.com", LOGO/LOGO_WHITE → /brand/agl-logo.png and /brand/agl-logo-white.png, TRACKING_PREFIX "AGL". Keep ADMIN_SUBDOMAIN 'private'. PHONE, WHATSAPP, HQ_ADDRESS and SOCIAL stay empty.
2. index.html (title, meta, canonical, OG/Twitter, JSON-LD, icon cache-busters ?v=4), Public/site.webmanifest, package.json name (then `npm install` to refresh the lock file), .env.example DB path.
3. Server: DB_FILE 'agl_global.db'; remove the old-brand migration block in server/db.ts (REBRAND_MAP §2 C explains why), keeping every other migration; service name and startup log from COMPANY; SESSION_COOKIE 'agl.sid' (only that string in auth.ts); the track-route error text built from TRACKING_PREFIX.
The logo files don't exist yet, so a broken logo image locally is expected until prompt 05b. Don't touch CSS class names yet.
`npm run build` must pass with zero TS errors. Tick the tasks, add a Decisions log entry for removing the migration, commit "rebrand: AGL brand config, metadata and server strings". STOP and report.
```

### Prompt 02 — IDs, references, examples, tests
```
Tracker 1.4–1.5 (REBRAND_MAP §2 D–E).
1. src/shared/references.ts: AGL-SL-, AGL-TKT-, AGL-INV- and REFERENCE_PATTERN.
2. Every hard-coded tracking-ID example, placeholder and help text: DLS7K2M9 → AGL7K2M9, DLSQ4X8T → AGLQ4X8T, DLS8M4PQ/DLS3J7NK → AGL…, "DLS·····" → "AGL·····", "start with DLS" → "start with AGL". Prefer building the wording from TRACKING_PREFIX where the code already has it in scope; leave static copy as text.
3. PAGE_META in App.tsx, DocumentBrand.tsx (pouch name, footer), src/data/legalDocs.ts (names, cookie agl.sid, storage keys), src/data/helpArticles.ts, and the three localStorage keys (sdl_… → agl_…). Use "an AGL" before the acronym.
4. scripts/trackingId.test.ts and scripts/references.test.ts: update to AGL. Keep the intentionally invalid samples invalid.
`npm test` and `npm run build` must pass. Then track an ID such as "agl 7k2-m9" in the UI and confirm it's accepted as AGL7K2M9 ("not found" is fine; the DB is empty). Commit "rebrand: AGL tracking IDs, references and copy examples". STOP and report.
```

### Prompt 03 — CSS prefix sweep (own commit)
```
Tracker 2.1, following REBRAND_MAP §3 exactly. Use a small Node script (no Python on this machine), and delete it afterwards.
1. Show me the pre-check grep result first.
2. Rename --sdl- → --agl- and the sdl- class prefix → agl- (word-boundary only) across src/**/*.{css,ts,tsx} and index.html. Change no values.
3. Report the number of replacements per file type, then run `npm run build`.
4. Visual parity: open Home, Track, a Track Result (create a quick shipment in admin if needed), and the admin dashboard at 375px and 1440px. Everything must look identical to before. Tell me exactly what you checked.
Commit "rebrand: rename css prefix sdl- to agl-" with nothing else in it. STOP and report.
```

### Prompt 04 — Comments and leftovers
```
Run the REBRAND_MAP §5 grep (first line) and clear every remaining hit except the generated image files (prompt 05b handles those):
- CSS file header comments ("SDL GLOBAL LOGISTICS — …" → "ADVANCE GLOBAL LOGISTICS — …"), and the tokens.css header (describe the palette as graphite + red with no company or logo name; values unchanged).
- Code comments mentioning SDL/DLS. Keep them factual.
- Anything else the grep finds. If a hit is ambiguous, ask me instead of guessing.
Build + test must pass. Commit "rebrand: remove remaining previous-brand references". STOP and report what's left (should be only sdl-named image files, the image manifest and the optimize script).
```

### Prompt 05a — Find free, unbranded photos
```
Tracker 3.2 (sourcing only), following BRAND_GUIDE §7. Use free photos only: Pexels (Pexels License) or Openverse filtered to CC0/public domain. No visible company branding anywhere in the frame: no logos, company names on trucks/planes/containers, branded uniforms or watermarks.
1. For each of the four branded slots in BRAND_GUIDE §7 (wide port hero, portrait mobile hero, unbranded truck, logistics/support person), find 2 candidates that meet the minimum size and don't repeat the stock already on the site.
2. Download them into images/free-pexels/ or images/free-cc0/ with descriptive names (e.g. hero-port-dusk.jpg). Open each one and zoom in on vehicles, containers and clothing to confirm there's no branding.
3. Show me a table: slot · candidate file · size · what it shows · source URL · photographer · licence. Mark your pick for each slot.
4. Also open the kept stock photos (BRAND_GUIDE §7 "Can stay") and the six Unsplash hero URLs in the page CSS, and tell me if any shows company branding. Tell me whether you can confirm a licence for images/site/*.jpg.
Don't change scripts or pages yet. STOP and wait for my picks.
```

### Prompt 05b — Logo and image pipeline
```
Tracker 3.1–3.3, following BRAND_GUIDE §5 and §7. Photo picks: [YOUR PICKS FROM 05a, or "use your picks"].
1. Delete the candidates I didn't pick. Add a SOURCES.md row for every photo kept (file, source URL, photographer, licence).
2. Update scripts/optimize-images.mjs:
   - Logo source images/advanced-logo.png (transparent PNG): skip whiteToAlpha, trim, keep toWhiteVersion, re-measure the MARK crop on the globe + orbit arrow, no redOnly (BRAND_GUIDE §5 items 1–3).
   - Outputs agl-logo.png, agl-logo-white.png, agl-mark.png; photos to Public/images/agl/; manifest src/data/aglImages.ts with AGL_IMAGES / AglImageInfo / AglImageName; header comment brand-neutral.
   - Point the four branded slots (and any replaced stock) at the new files. The OG image comes from the new landscape hero.
   Update ResponsiveImage.tsx and other importers, then run the script (npm install first if sharp is missing).
3. Look at every generated file: logo, white logo on a dark background, mark, the 16 and 32 px favicons, apple-touch icon, OG image. Show me any that look wrong and fix them in the script.
4. Write alt text for the new photos in CONTENT §12 (replace the [NEW PHOTO] markers) and in the pages.
5. Delete Public/brand/sdl-*, Public/images/sdl/, images/brand-img*.PNG, images/logo.jpeg and images/landingimage*.png.
Build passes. Check Home (desktop + mobile hero), Services, About, Contact, a Track Result, the footer logo and the browser tab icon at 375/1440, and tell me whether the header logo is readable at 375px. Remember: the logo says "ADVANCED"; leave it, it's tracked as Needs owner #7. Commit "assets: AGL logo, icons and free stock photos". STOP and report.
```

### Prompt 06 — Admin password, fresh DB, smoke test
```
Tracker 4.1–4.2.
1. Give me the exact two commands from DEPLOYMENT §4 to generate ADMIN_PASSWORD_HASH and SESSION_SECRET. I'll run them myself and paste the output into .env. Don't ask for the password and don't write it anywhere.
   [Wait until I say "done".]
2. With the empty database, run `npm run dev` and do the smoke test: admin login at #/admin → create a shipment (the ID must be AGL + 5 characters) → the public Track page finds it → download the waybill PDF and check it shows only AGL branding → submit a quote on the public site and see it in admin → send the contact form and get an AGL-TKT- reference.
3. Confirm admin Settings shows Advance Global Logistics / info@advancegloballogistics.com by default.
Record pass/fail in the tracker. Then stop the server and delete the local test database in data/. Production gets its own empty database on Hostinger. STOP and report.
```

### Prompt 07 — Final sweep + deploy prep
```
Tracker 5.1–5.2.
1. Run the full REBRAND_MAP §5 sweep (source, then dist/dist-server after `npm run build`, then the Public/ listing). Everything must come back empty.
2. Confirm .gitignore still has /docs/archive-sdl/, /screens/, /images/, .env and data/, and that `git ls-files` lists none of them.
3. Commit "chore: AGL rebrand ready for deployment".
4. Give me a short checklist of exactly what I do next in GitHub and Hostinger (DEPLOYMENT §2–6): new repo, push commands, Node app settings, env vars (with a DB_PATH outside the app folder), domain + private. alias, SSL, mailbox. Then the DEPLOYMENT §7 launch checks I run on the live site.
Update the tracker and list everything still waiting on me under Needs owner. STOP and report.
```

---

## Utility prompts

### Prompt R — Resume in a new chat
```
We're mid-way through the Advance Global Logistics rebrand. Read CLAUDE.md and docs/PROJECT_TRACKER.md, check `git log --oneline -10` and `git status`, then tell me which task is next and whether anything is half-done. Don't change anything yet.
```

### Prompt F1 — Something broke
```
Something broke: [WHAT YOU SEE, WHERE, STEPS TO REPRODUCE, ANY CONSOLE ERROR].
Find the cause before changing anything. Check the last rebrand commit first (git diff HEAD~1); a missed rename is the usual suspect. Fix it with the smallest change, run build + test, commit "fix: …", and tell me the cause in one sentence.
```

### Prompt F2 — Owner info arrived
```
New business facts: [e.g. phone +.., WhatsApp +.., HQ address .., social links ..].
Put them in src/config/brand.ts (and index.html JSON-LD where it applies), confirm the hidden UI now shows them correctly, move the item out of Needs owner in the tracker, and commit "content: add AGL contact details".
```
