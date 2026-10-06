// Prepares brand assets and responsive photos from the untouched originals in images/.
// Run with: node scripts/optimize-images.mjs            (everything)
//           node scripts/optimize-images.mjs --icons    (favicon and app icons only)
// Outputs: Public/brand/* (logos, icons, OG image) and Public/images/agl/* (WebP + JPG per width),
// plus src/data/aglImages.ts (the manifest <ResponsiveImage> reads).
import sharp from 'sharp';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const SRC = path.join(ROOT, 'images');
const BRAND_OUT = path.join(ROOT, 'Public', 'brand');
const PHOTO_OUT = path.join(ROOT, 'Public', 'images', 'agl');
const MANIFEST_OUT = path.join(ROOT, 'src', 'data', 'aglImages.ts');

const STEP_WIDTHS = [640, 1024, 1600, 2400];
// Every card/tile photo is cropped to this exact square so rows line up at the same height.
// 340 px is the card size the layout was built around; smaller sources are never upscaled.
const CARD_SIZE = 340;
// Larger square variants for retina screens, emitted only when the source is big enough.
const CARD_STEP_SIZES = [640, 1024, 1400];
// Landscape hero photo: Home hero, Track, Services, About, callback banner and the OG image.
const HERO_SRC = 'free-pexels/hero-port-cranes-night.jpg';

fs.mkdirSync(BRAND_OUT, { recursive: true });
fs.mkdirSync(PHOTO_OUT, { recursive: true });

// ---------------------------------------------------------------------------------------------
// Logo: the supplied logo is a PNG with a transparent background, so it is used as is.
// ---------------------------------------------------------------------------------------------
const LOGO_SRC = path.join(SRC, 'advanced-logo.png');
const loadLogo = () => sharp(LOGO_SRC).ensureAlpha().png().toBuffer();

// How strongly a pixel reads as the logo's red (0 = neutral grey/black/white).
const redness = (r, g, b) => r - Math.max(g, b);
const RED_MIN = 60;

// Reversed logo for dark surfaces: every non-red pixel becomes white; red stays red.
async function toWhiteVersion(pngBuffer) {
  const { data, info } = await sharp(pngBuffer).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  for (let i = 0; i < data.length; i += 4) {
    if (redness(data[i], data[i + 1], data[i + 2]) < RED_MIN) {
      data[i] = 255; data[i + 1] = 255; data[i + 2] = 255;
    }
  }
  return sharp(data, { raw: { width: info.width, height: info.height, channels: 4 } }).png().toBuffer();
}

// Icon mark: the globe with its orbit arrow inside the "G", in full colour (the globe has black
// continents, so it is not reduced to red). A transparent gap separates the globe, orbit and
// arrow from the letters around them, so the mark is cut out as the opaque regions connected to
// a few seed points inside the crop box, plus a 2 px rim so anti-aliased edges stay soft.
// Box and seeds measured on the 2025x777 original (the arrow tip reaches x 1485).
async function buildSquareMark(logo) {
  const MARK = { left: 900, top: 120, width: 620, height: 360 };
  const SEEDS = [[1157, 250], [1157, 400], [980, 330]]; // upper globe, lower globe, orbit + arrow
  const SOLID = 96; // alpha at or above this joins a region
  const RIM = 2;
  const { data, info } = await sharp(logo).extract(MARK).raw().toBuffer({ resolveWithObject: true });
  const { width: w, height: h } = info;
  const keep = new Uint8Array(w * h);
  for (const [sx, sy] of SEEDS) {
    const stack = [(sy - MARK.top) * w + (sx - MARK.left)];
    while (stack.length) {
      const k = stack.pop();
      if (keep[k] || data[k * 4 + 3] < SOLID) continue;
      keep[k] = 1;
      const x = k % w;
      if (x > 0) stack.push(k - 1);
      if (x < w - 1) stack.push(k + 1);
      if (k >= w) stack.push(k - w);
      if (k < w * (h - 1)) stack.push(k + w);
    }
  }
  for (let pass = 0; pass < RIM; pass++) {
    const grown = keep.slice();
    for (let k = 0; k < w * h; k++) {
      if (keep[k]) continue;
      const x = k % w;
      if ((x > 0 && keep[k - 1]) || (x < w - 1 && keep[k + 1]) || (k >= w && keep[k - w]) || (k < w * (h - 1) && keep[k + w])) grown[k] = 1;
    }
    keep.set(grown);
  }
  for (let k = 0; k < w * h; k++) if (!keep[k]) data[k * 4 + 3] = 0;
  const cut = await sharp(data, { raw: { width: w, height: h, channels: 4 } }).png().toBuffer();
  const mark = await sharp(cut).trim({ threshold: 1 }).png().toBuffer();
  const markMeta = await sharp(mark).metadata();
  const side = Math.max(markMeta.width, markMeta.height);
  return sharp(mark)
    .extend({
      top: Math.floor((side - markMeta.height) / 2), bottom: Math.ceil((side - markMeta.height) / 2),
      left: Math.floor((side - markMeta.width) / 2), right: Math.ceil((side - markMeta.width) / 2),
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png().toBuffer();
}

// Browser, home-screen and PWA icons, all rendered straight from the square mark at their exact
// size (never resized from another icon). `inset` is the share of the canvas the mark may fill.
const CLEAR = { r: 0, g: 0, b: 0, alpha: 0 };
const ICONS = [
  // Tab icons sit on a white rounded tile so the red mark stays visible on dark browser tabs.
  { file: 'favicon-16.png', size: 16, inset: 1, bg: '#ffffff', tile: true },  // browser tab (standard DPI)
  { file: 'favicon-32.png', size: 32, inset: 0.94, bg: '#ffffff', tile: true }, // browser tab (retina), taskbar
  { file: 'icon-192.png', size: 192, inset: 0.92, bg: CLEAR },        // Android home screen, manifest
  { file: 'favicon.png', size: 512, inset: 0.92, bg: CLEAR },         // manifest, install splash
  { file: 'icon-maskable-512.png', size: 512, inset: 0.64, bg: '#ffffff' }, // Android adaptive: fits the 80% safe circle
  { file: 'apple-touch-icon.png', size: 180, inset: 0.76, bg: '#ffffff' },  // iOS fills transparency with black, so white
];

async function buildIcons(squareMark) {
  for (const { file, size, inset, bg, tile } of ICONS) {
    const inner = Math.round(size * inset);
    const edge = size - inner;
    let icon = sharp(squareMark)
      .resize(inner, inner, { fit: 'contain', background: CLEAR, kernel: 'lanczos3' })
      .extend({ top: Math.floor(edge / 2), bottom: Math.ceil(edge / 2), left: Math.floor(edge / 2), right: Math.ceil(edge / 2), background: CLEAR });
    if (tile) {
      const r = Math.round(size * 0.22);
      const card = Buffer.from(`<svg width="${size}" height="${size}"><rect width="${size}" height="${size}" rx="${r}" fill="${bg}"/></svg>`);
      icon = sharp(card).composite([{ input: await icon.png().toBuffer() }]);
    } else if (bg !== CLEAR) {
      icon = sharp(await icon.png().toBuffer()).flatten({ background: bg });
    }
    // Full-colour PNG for the tiny sizes: palette quantising visibly bands 16/32 px edges.
    const png = size <= 32 ? { compressionLevel: 9 } : { palette: true, quality: 95, effort: 10, compressionLevel: 9 };
    await icon.png(png).toFile(path.join(BRAND_OUT, file));
  }
}

async function buildBrand() {
  const logo = await loadLogo();
  const trimmed = await sharp(logo).trim({ threshold: 1 }).png().toBuffer();
  await sharp(trimmed).png({ palette: true, quality: 90, effort: 10, compressionLevel: 9 }).toFile(path.join(BRAND_OUT, 'agl-logo.png'));

  const white = await toWhiteVersion(trimmed);
  await sharp(white).png({ palette: true, quality: 90, effort: 10, compressionLevel: 9 }).toFile(path.join(BRAND_OUT, 'agl-logo-white.png'));

  const squareMark = await buildSquareMark(logo);
  await sharp(squareMark).png({ palette: true, quality: 90, effort: 10, compressionLevel: 9 }).toFile(path.join(BRAND_OUT, 'agl-mark.png'));
  await buildIcons(squareMark);

  // OG image 1200x630 from the landscape hero.
  await sharp(path.join(SRC, HERO_SRC)).resize(1200, 630, { fit: 'cover', position: 'centre' })
    .jpeg({ quality: 82, mozjpeg: true }).toFile(path.join(BRAND_OUT, 'og-image.jpg'));
}

// ---------------------------------------------------------------------------------------------
// Photos
// ---------------------------------------------------------------------------------------------
// kind 'card' = fixed CARD_SIZE square (plus 640 when the source allows it).
// kind 'hero' = keeps the given aspect ratio, widths from STEP_WIDTHS up to the source width.
const PHOTOS = [
  { name: 'hero-home', src: HERO_SRC, kind: 'hero', aspect: 16 / 9 },
  // Separate portrait photo for phones (a 9:16 crop of the landscape hero would look zoomed in).
  { name: 'hero-home-mobile', src: 'free-pexels/hero-mobile-port-sunset-plane.jpg', kind: 'hero', aspect: 9 / 16 },
  { name: 'track-hero', src: HERO_SRC, kind: 'hero', aspect: 2 / 1 },
  { name: 'locations-hero', src: 'free-cc0/locations-hero.webp', kind: 'hero', aspect: 2 / 1 },
  // Wide strip behind the Home callback banner.
  { name: 'callback-banner', src: HERO_SRC, kind: 'hero', aspect: 3 / 1 },
  // Services and About heroes: two different bands of the hero photo until dedicated photos exist.
  // 'bottom' would cut the crane tops off, so About uses the centre band.
  { name: 'services-hero', src: HERO_SRC, kind: 'hero', aspect: 12 / 5, position: 'top' },
  { name: 'about-hero', src: HERO_SRC, kind: 'hero', aspect: 12 / 5, position: 'centre' },
  // CSS background heroes (no srcset): ShipPage.css and PublicQuoteResultPage.css use the 1600 px JPG.
  { name: 'ship-hero', src: 'free-pexels/hero-port-ship-sunset.jpg', kind: 'hero', aspect: 16 / 9 },
  { name: 'quote-result-hero', src: 'free-pexels/truck-white-mountain-road.jpg', kind: 'hero', aspect: 16 / 9 },
  { name: 'service-priority-express', src: 'free-pexels/service-priority-express.jpg', kind: 'card' },
  { name: 'service-freight-linehaul', src: 'free-pexels/freight-dock-worker-sunset.jpg', kind: 'card' },
  { name: 'service-vehicle-transport', src: 'free-cc0/service-vehicle-transport.webp', kind: 'card' },
  { name: 'service-secure-vault', src: 'free-cc0/service-secure-vault.webp', kind: 'card' },
  { name: 'industry-healthcare', src: 'free-pexels/industry-health-vaccine-box.jpg', kind: 'card' },
  { name: 'industry-technology', src: 'free-cc0/industry-technology.webp', kind: 'card' },
  { name: 'industry-automotive', src: 'free-pexels/industry-auto-mechanic-engine.jpg', kind: 'card' },
  { name: 'industry-ecommerce', src: 'free-pexels/industry-ecom-packing-boutique.jpg', kind: 'card' },
  { name: 'track-result-vehicle', src: 'free-pexels/truck-white-motion-blur.jpg', kind: 'card' },
  { name: 'about-operations', src: 'free-pexels/about-operations.jpg', kind: 'card' },
  { name: 'contact-team', src: 'free-pexels/team-couriers-loading-van.jpg', kind: 'card' },
  // Shown as a 72 px thumbnail: crop tight on the face.
  { name: 'about-team', src: 'free-pexels/about-team.jpg', kind: 'card', crop: { left: 950, top: 80, width: 900, height: 900 } },
];

// `position` picks which part of the source a cover crop keeps (sharp: 'centre', 'top', 'bottom', ...).
async function writeVariants(pipelineFactory, name, width, height, position = 'centre') {
  const base = path.join(PHOTO_OUT, `${name}-${width}`);
  await pipelineFactory().resize(width, height, { fit: 'cover', position }).webp({ quality: 78 }).toFile(`${base}.webp`);
  await pipelineFactory().resize(width, height, { fit: 'cover', position }).flatten({ background: '#ffffff' })
    .jpeg({ quality: 80, mozjpeg: true, progressive: true }).toFile(`${base}.jpg`);
}

async function buildPhotos() {
  const manifest = {};
  for (const p of PHOTOS) {
    const srcPath = path.join(SRC, p.src);
    const factory = () => (p.crop ? sharp(srcPath).extract(p.crop) : sharp(srcPath));
    const meta = await factory().metadata();
    const srcW = p.crop ? p.crop.width : meta.width;
    const srcH = p.crop ? p.crop.height : meta.height;
    const variants = [];

    if (p.kind === 'card') {
      const maxSquare = Math.min(srcW, srcH);
      // Never upscale: a source smaller than CARD_SIZE is output at its own size. Every card is
      // still a 1:1 square, so CSS renders them all at the same height.
      const base = Math.min(CARD_SIZE, maxSquare);
      const sizes = [base, ...CARD_STEP_SIZES.filter(s => s <= maxSquare)];
      for (const s of sizes) {
        await writeVariants(factory, p.name, s, s);
        variants.push(s);
      }
      manifest[p.name] = { width: base, height: base, widths: variants };
    } else {
      // Largest crop of the requested aspect that fits the source, then the step widths below it.
      // Capped at the largest step width: bigger files only add download weight.
      const cropW = Math.min(srcW, Math.floor(srcH * p.aspect), STEP_WIDTHS[STEP_WIDTHS.length - 1]);
      const cropH = Math.round(cropW / p.aspect);
      const widths = STEP_WIDTHS.filter(w => w <= cropW);
      if (!widths.includes(cropW) && (widths.length === 0 || cropW - widths[widths.length - 1] > 200)) widths.push(cropW);
      for (const w of widths) {
        await writeVariants(factory, p.name, w, Math.round(w / p.aspect), p.position);
        variants.push(w);
      }
      manifest[p.name] = { width: cropW, height: cropH, widths: variants };
    }
  }
  return manifest;
}

function writeManifest(manifest) {
  const body = Object.entries(manifest)
    .map(([k, v]) => `  '${k}': { width: ${v.width}, height: ${v.height}, widths: [${v.widths.join(', ')}] },`)
    .join('\n');
  const ts = `// Generated by scripts/optimize-images.mjs. Do not edit by hand; re-run the script instead.
// Each entry lists the widths available as /images/agl/<name>-<width>.webp and .jpg.
export interface AglImageInfo {
  width: number;
  height: number;
  widths: number[];
}

export const AGL_IMAGES = {
${body}
} satisfies Record<string, AglImageInfo>;

export type AglImageName = keyof typeof AGL_IMAGES;
`;
  fs.writeFileSync(MANIFEST_OUT, ts);
}

// --icons rebuilds only the icon set, leaving the logos, OG image and photos untouched.
if (process.argv.includes('--icons')) {
  await buildIcons(await buildSquareMark(await loadLogo()));
  console.log('Icons done.');
} else {
  await buildBrand();
  const manifest = await buildPhotos();
  writeManifest(manifest);
  console.log('Done.');
}
