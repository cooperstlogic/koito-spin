// Renders a branding folder's icons from its SVG sources.
//
//   <brand>/logo.svg      tab icon (any shape; transparent background is fine)
//   <brand>/app-icon.svg  home-screen / app icon (opaque, with padding); optional, defaults to logo.svg
//
// writes <brand>/public/: favicon.svg, favicon.ico, favicon-96x96.png, apple-touch-icon.png,
// web-app-manifest-192x192.png, web-app-manifest-512x512.png
//
// Run with Node and sharp, for example from the repo root:
//   docker run --rm -v "$PWD/branding":/branding -w /tmp node:24 \
//     sh -c 'npm i -s sharp@0.34.4 && cp /branding/render.mjs . && node render.mjs /branding/<brand>'
import sharp from "sharp";
import { copyFileSync, existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const dir = process.argv[2];
if (!dir) {
  console.error("usage: node render.mjs <branding-folder>");
  process.exit(1);
}
const logo = join(dir, "logo.svg");
const appIcon = existsSync(join(dir, "app-icon.svg")) ? join(dir, "app-icon.svg") : logo;
const out = join(dir, "public");
mkdirSync(out, { recursive: true });

const render = (src, size) =>
  sharp(src, { density: 300 })
    .resize(size, size, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();

copyFileSync(logo, join(out, "favicon.svg"));
writeFileSync(join(out, "favicon-96x96.png"), await render(logo, 96));
writeFileSync(join(out, "apple-touch-icon.png"), await render(appIcon, 180));
writeFileSync(join(out, "web-app-manifest-192x192.png"), await render(appIcon, 192));
writeFileSync(join(out, "web-app-manifest-512x512.png"), await render(appIcon, 512));

// favicon.ico: an ICO container holding 16, 32 and 48 px PNGs (supported by all current browsers)
const imgs = await Promise.all([16, 32, 48].map(async (s) => [s, await render(logo, s)]));
const header = Buffer.alloc(6);
header.writeUInt16LE(0, 0);
header.writeUInt16LE(1, 2);
header.writeUInt16LE(imgs.length, 4);
let offset = 6 + 16 * imgs.length;
const entries = [];
for (const [s, png] of imgs) {
  const e = Buffer.alloc(16);
  e.writeUInt8(s, 0);
  e.writeUInt8(s, 1);
  e.writeUInt16LE(1, 4);
  e.writeUInt16LE(32, 6);
  e.writeUInt32LE(png.length, 8);
  e.writeUInt32LE(offset, 12);
  offset += png.length;
  entries.push(e);
}
writeFileSync(join(out, "favicon.ico"), Buffer.concat([header, ...entries, ...imgs.map(([, png]) => png)]));
console.log(`rendered ${out}`);
