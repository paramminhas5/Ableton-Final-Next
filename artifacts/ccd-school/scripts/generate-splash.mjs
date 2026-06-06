/**
 * generate-splash.mjs — iOS PWA splash / launch screens for CCD.SCHOOL
 *
 * iOS Safari requires exact-pixel launch images to show a proper
 * splash instead of a blank white screen when opening from Home Screen.
 *
 * Each image: full device resolution, brand background #FF3C00,
 * centred icon + wordmark.
 *
 * Run: node scripts/generate-splash.mjs
 */
import { writeFileSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { deflateSync } from "zlib";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, "../public/splash");
mkdirSync(OUT, { recursive: true });

// ── Re-use the tiny PNG encoder from generate-icons.mjs ──────────────────────
function crc32(buf) {
  const t = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let j = 0; j < 8; j++) c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
    t[i] = c;
  }
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) crc = t[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}
function chunk(type, data) {
  const lb = Buffer.alloc(4); lb.writeUInt32BE(data.length, 0);
  const tb = Buffer.from(type, "ascii");
  const cb = Buffer.alloc(4); cb.writeUInt32BE(crc32(Buffer.concat([tb, data])), 0);
  return Buffer.concat([lb, tb, data, cb]);
}
function buildPNG(w, h, pixels) {
  const raw = Buffer.alloc(h * (1 + w * 3)); // RGB
  for (let y = 0; y < h; y++) {
    raw[y * (1 + w * 3)] = 0;
    for (let x = 0; x < w; x++) {
      const si = (y * w + x) * 3;
      const di = y * (1 + w * 3) + 1 + x * 3;
      raw[di] = pixels[si]; raw[di+1] = pixels[si+1]; raw[di+2] = pixels[si+2];
    }
  }
  const compressed = deflateSync(raw, { level: 1 }); // fast, file not cached long
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 8; ihdr[9] = 2; // 8-bit RGB
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk("IHDR", ihdr),
    chunk("IDAT", compressed),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

// ── Draw a simple splash screen ───────────────────────────────────────────────
function generateSplash(w, h) {
  const pixels = new Uint8Array(w * h * 3);

  // Fill with brand orange #FF3C00
  for (let i = 0; i < pixels.length; i += 3) {
    pixels[i] = 0xFF; pixels[i+1] = 0x3C; pixels[i+2] = 0x00;
  }

  function set(x, y, r, g, b) {
    if (x < 0 || x >= w || y < 0 || y >= h) return;
    const i = (y * w + x) * 3;
    pixels[i] = r; pixels[i+1] = g; pixels[i+2] = b;
  }

  // Centred icon — white "C" arc
  const cx = Math.round(w / 2);
  const cy = Math.round(h * 0.42);
  const iconSize = Math.min(w, h) * 0.18;
  const outerR = iconSize * 0.85;
  const innerR = iconSize * 0.55;
  const openHalf = 0.32;

  for (let y = Math.round(cy - outerR - 2); y <= Math.round(cy + outerR + 2); y++) {
    for (let x = Math.round(cx - outerR - 2); x <= Math.round(cx + outerR + 2); x++) {
      const dx = x - cx, dy = y - cy;
      const dist2 = dx*dx + dy*dy;
      if (dist2 < innerR*innerR || dist2 > outerR*outerR) continue;
      const angle = Math.atan2(dy, dx);
      const norm = angle < 0 ? angle + 2*Math.PI : angle;
      const inGap = norm < openHalf || norm > 2*Math.PI - openHalf;
      if (!inGap) set(x, y, 0xF5, 0xF0, 0xE8);
    }
  }

  // Acid dot
  const dotR = iconSize * 0.20;
  const dotCx = Math.round(cx + iconSize * 0.52);
  const dotCy = Math.round(cy + iconSize * 0.52);
  for (let y = Math.round(dotCy - dotR - 1); y <= Math.round(dotCy + dotR + 1); y++) {
    for (let x = Math.round(dotCx - dotR - 1); x <= Math.round(dotCx + dotR + 1); x++) {
      const dx = x - dotCx, dy = y - dotCy;
      if (dx*dx + dy*dy <= dotR*dotR) set(x, y, 0xC6, 0xFF, 0x00);
    }
  }

  // "CCD.SCHOOL" text — rendered as white pixels block letters
  // (simple pixel font, 5×7 px per char, scaled)
  const textY = Math.round(cy + iconSize * 1.5);
  const charW = Math.max(2, Math.round(iconSize * 0.12));
  const charH = Math.max(3, Math.round(charW * 1.6));
  const label = "CCD.SCHOOL";
  const totalW = label.length * (charW + 1);
  let tx = Math.round(cx - totalW / 2);

  for (const ch of label) {
    // Draw a solid white rectangle per char (placeholder — real font would use bitmap data)
    for (let dy = 0; dy < charH; dy++) {
      for (let dx = 0; dx < charW; dx++) {
        set(tx + dx, textY + dy, 0xF5, 0xF0, 0xE8);
      }
    }
    tx += charW + 1;
  }

  return buildPNG(w, h, pixels);
}

// ── Device sizes (logical px × scale = physical px) ──────────────────────────
const SIZES = [
  { w: 1290, h: 2796, name: "apple-splash-1290-2796.png" }, // iPhone 15 Pro Max
  { w: 1179, h: 2556, name: "apple-splash-1179-2556.png" }, // iPhone 15 / 14 Pro
  { w: 1170, h: 2532, name: "apple-splash-1170-2532.png" }, // iPhone 14
  { w:  750, h: 1334, name: "apple-splash-750-1334.png"  }, // iPhone SE
  { w: 1536, h: 2048, name: "apple-splash-1536-2048.png" }, // iPad 9.7"
  { w: 2048, h: 2732, name: "apple-splash-2048-2732.png" }, // iPad Pro 12.9"
];

for (const { w, h, name } of SIZES) {
  const buf = generateSplash(w, h);
  writeFileSync(join(OUT, name), buf);
  console.log(`✓ ${name.padEnd(36)} ${w}×${h}  (${(buf.length/1024).toFixed(0)} KB)`);
}
console.log("\n✅  Splash screens written to public/splash/");
