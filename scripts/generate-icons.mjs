/**
 * Generates the PNG PWA icons from public/icons/icon.svg using sharp.
 * Run with: npm run icons
 *
 * Produces:
 *   - icon-192.png, icon-512.png   (standard "any" icons)
 *   - icon-maskable-512.png        (padded so it survives maskable cropping)
 *   - apple-touch-icon.png         (180x180, on an opaque background for iOS)
 */
import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import sharp from "sharp";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ICONS_DIR = join(__dirname, "..", "public", "icons");
const SRC = join(ICONS_DIR, "icon.svg");
const BG = "#fff3e6";

const svg = await readFile(SRC);

async function render(size, file, { background = null } = {}) {
  let img = sharp(svg, { density: 384 }).resize(size, size, {
    fit: "contain",
    background: background ?? { r: 0, g: 0, b: 0, alpha: 0 },
  });
  if (background) img = img.flatten({ background });
  await img.png().toFile(join(ICONS_DIR, file));
  console.log(`✓ ${file} (${size}x${size})`);
}

// Maskable icon: render the artwork at ~78% inside a full-bleed safe zone.
async function renderMaskable(size, file) {
  const inner = Math.round(size * 0.78);
  const pad = Math.round((size - inner) / 2);
  const art = await sharp(svg, { density: 384 })
    .resize(inner, inner, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();
  await sharp({
    create: { width: size, height: size, channels: 4, background: BG },
  })
    .composite([{ input: art, top: pad, left: pad }])
    .png()
    .toFile(join(ICONS_DIR, file));
  console.log(`✓ ${file} (${size}x${size}, maskable)`);
}

await render(192, "icon-192.png");
await render(512, "icon-512.png");
await render(180, "apple-touch-icon.png", { background: BG });
await renderMaskable(512, "icon-maskable-512.png");

console.log("Done.");
