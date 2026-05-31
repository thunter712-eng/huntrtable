/**
 * Stamps the exported service worker with a unique build id so every deploy is
 * a byte-different sw.js. That's what lets the browser detect a new version and
 * trigger the auto-update/reload flow in PwaRegister.
 *
 * Runs after `next build` (which copies public/sw.js to out/sw.js).
 */
import { readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";

const SW = "out/sw.js";

if (!existsSync(SW)) {
  console.warn(`stamp-sw: ${SW} not found — skipping.`);
  process.exit(0);
}

const buildId = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
const src = await readFile(SW, "utf8");
await writeFile(SW, src.replaceAll("__BUILD_ID__", buildId));
console.log(`stamp-sw: stamped ${SW} with build id ${buildId}`);
