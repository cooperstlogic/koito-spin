// Renders the PNG icons from the SVGs. Run inside node:24 with sharp installed.
import sharp from "sharp";
const pub = "/work/public", br = "/work/branding";
const jobs = [
  [`${pub}/favicon.svg`, `${pub}/favicon-96x96.png`, 96],
  [`${pub}/favicon.svg`, `/tmp/ico-16.png`, 16],
  [`${pub}/favicon.svg`, `/tmp/ico-32.png`, 32],
  [`${pub}/favicon.svg`, `/tmp/ico-48.png`, 48],
  [`${br}/app-icon.svg`, `${pub}/apple-touch-icon.png`, 180],
  [`${br}/app-icon.svg`, `${pub}/web-app-manifest-192x192.png`, 192],
  [`${br}/app-icon.svg`, `${pub}/web-app-manifest-512x512.png`, 512],
];
for (const [src, out, size] of jobs) {
  await sharp(src, { density: (72 * size) / 64 * 4 }).resize(size, size).png().toFile(out);
}
// favicon.ico: ICO container holding PNG images (supported by all current browsers)
import { readFileSync, writeFileSync } from "node:fs";
const imgs = [16, 32, 48].map((s) => [s, readFileSync(`/tmp/ico-${s}.png`)]);
const header = Buffer.alloc(6); header.writeUInt16LE(0, 0); header.writeUInt16LE(1, 2); header.writeUInt16LE(imgs.length, 4);
let offset = 6 + 16 * imgs.length;
const dir = [], data = [];
for (const [s, png] of imgs) {
  const e = Buffer.alloc(16);
  e.writeUInt8(s, 0); e.writeUInt8(s, 1); e.writeUInt8(0, 2); e.writeUInt8(0, 3);
  e.writeUInt16LE(1, 4); e.writeUInt16LE(32, 6); e.writeUInt32LE(png.length, 8); e.writeUInt32LE(offset, 12);
  offset += png.length; dir.push(e); data.push(png);
}
writeFileSync(`${pub}/favicon.ico`, Buffer.concat([header, ...dir, ...data]));
console.log("rendered");
