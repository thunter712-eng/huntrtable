/**
 * Generates the PWA / home-screen icons from public/icons/source-icon.png.
 * Run with: npm run icons
 *
 * The source is a square, opaque app-tile design, so every size is a simple
 * cover-resize. Produces:
 *   - icon-192.png, icon-512.png   (standard "any" PWA icons)
 *   - icon-maskable-512.png        (full-bleed; the tile fills the safe zone)
 *   - apple-touch-icon.png         (180x180, used by iOS "Add to Home Screen")
 */
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import sharp from "sharp";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ICONS_DIR = join(__dirname, "..", "public", "icons");
const SRC = join(ICONS_DIR, "source-icon.png");

async function render(size, file) {
  await sharp(SRC)
    .resize(size, size, { fit: "cover" })
    .png()
    .toFile(join(ICONS_DIR, file));
  console.log(`✓ ${file} (${size}x${size})`);
}

await render(192, "icon-192.png");
await render(512, "icon-512.png");
await render(180, "apple-touch-icon.png");
await render(512, "icon-maskable-512.png");

console.log("Done.");
