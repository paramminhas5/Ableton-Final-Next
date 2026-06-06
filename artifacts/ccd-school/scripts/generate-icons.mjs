/**
 * generate-icons.mjs — CCD.SCHOOL app icon generator
 * Uses Node built-in zlib.deflateSync for compression (no extra deps).
 * Run: node scripts/generate-icons.mjs
 */
import { writeFileSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { deflateSync } from "zlib";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = join(__dirname, "../public/icons");
mkdirSync(OUT_DIR, { recursive: true });

// ─── PNG helpers ──────────────────────────────────────────────────────────────
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
  const lenBuf = Buffer.alloc(4); lenBuf.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, "ascii");
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
  return Buffer.concat([lenBuf, typeBuf, data, crcBuf]);
}

/**
 * Build a PNG from raw RGBA pixel data (Uint8Array, row-major).
 * Uses zlib.deflateSync so we don't need a manual deflate impl.
 */
function buildPNG(w, h, pixels) {
  // Prepend filter byte 0 (None) to each scanline
  const raw = Buffer.alloc(h * (1 + w * 4));
  for (let y = 0; y < h; y++) {
    raw[y * (1 + w * 4)] = 0;
    for (let x = 0; x < w; x++) {
      const si = (y * w + x) * 4;
      const di = y * (1 + w * 4) + 1 + x * 4;
      raw[di]   = pixels[si];
      raw[di+1] = pixels[si+1];
      raw[di+2] = pixels[si+2];
      raw[di+3] = pixels[si+3];
    }
  }

  const compressed = deflateSync(raw, { level: 6 });
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 8; ihdr[9] = 6; // 8-bit RGBA

  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), // PNG signature
    chunk("IHDR", ihdr),
    chunk("IDAT", compressed),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

// ─── Icon renderer ────────────────────────────────────────────────────────────
// Design: orange (#FF3C00) rounded-rect bg, bone (#F5F0E8) "C" arc, acid (#C6FF00) dot

function generateIcon(size) {
  const w = size, h = size;
  const pixels = new Uint8Array(w * h * 4); // all transparent

  const BG  = [0xFF, 0x3C, 0x00, 0xFF]; // #FF3C00 orange
  const FG  = [0xF5, 0xF0, 0xE8, 0xFF]; // #F5F0E8 bone
  const AC  = [0xC6, 0xFF, 0x00, 0xFF]; // #C6FF00 acid

  function set(x, y, col) {
    if (x < 0 || x >= w || y < 0 || y >= h) return;
    const i = (y * w + x) * 4;
    pixels[i] = col[0]; pixels[i+1] = col[1]; pixels[i+2] = col[2]; pixels[i+3] = col[3];
  }

  const corner = w * 0.20;

  // 1. Rounded-rect background
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const dx = Math.max(corner - x, x - (w - 1 - corner), 0);
      const dy = Math.max(corner - y, y - (h - 1 - corner), 0);
      if (dx * dx + dy * dy <= corner * corner) set(x, y, BG);
    }
  }

  // 2. "C" letterform — thick arc open on the right
  const cx = w * 0.48, cy = h * 0.50;
  const outerR = w * 0.37;
  const innerR = w * 0.24;
  const openHalf = 0.30; // radians — opening gap half-angle

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (pixels[(y * w + x) * 4 + 3] === 0) continue; // outside bg
      const dx = x - cx, dy = y - cy;
      const dist2 = dx * dx + dy * dy;
      if (dist2 < innerR * innerR || dist2 > outerR * outerR) continue;
      const angle = Math.atan2(dy, dx); // -π to π
      const norm = angle < 0 ? angle + 2 * Math.PI : angle; // 0 to 2π
      // Opening faces right: 0 ± openHalf, i.e. near 0 or near 2π
      const inGap = norm < openHalf || norm > (2 * Math.PI - openHalf);
      if (!inGap) set(x, y, FG);
    }
  }

  // 3. Acid (#C6FF00) dot — bottom-right quadrant
  const dotR  = w * 0.09;
  const dotCx = Math.round(w * 0.72);
  const dotCy = Math.round(h * 0.72);
  for (let y = Math.max(0, dotCy - dotR - 2); y < Math.min(h, dotCy + dotR + 2); y++) {
    for (let x = Math.max(0, dotCx - dotR - 2); x < Math.min(w, dotCx + dotR + 2); x++) {
      if (pixels[(y * w + x) * 4 + 3] === 0) continue;
      const dx = x - dotCx, dy = y - dotCy;
      if (dx * dx + dy * dy <= dotR * dotR) set(x, y, AC);
    }
  }

  return buildPNG(w, h, pixels);
}

// ─── Generate all sizes ───────────────────────────────────────────────────────
const SIZES = [
  { size: 512, name: "icon-512.png"              },
  { size: 192, name: "icon-192.png"              },
  { size: 512, name: "icon-512-maskable.png"     },
  { size: 192, name: "icon-192-maskable.png"     },
  { size: 180, name: "apple-touch-icon.png"      },
  { size: 167, name: "apple-touch-icon-167.png"  },
  { size: 152, name: "apple-touch-icon-152.png"  },
  { size: 120, name: "apple-touch-icon-120.png"  },
  { size:  76, name: "apple-touch-icon-76.png"   },
  { size:  32, name: "favicon-32.png"            },
];

for (const { size, name } of SIZES) {
  const buf = generateIcon(size);
  writeFileSync(join(OUT_DIR, name), buf);
  console.log(`✓ ${name.padEnd(32)} ${size}×${size}  (${(buf.length/1024).toFixed(1)} KB)`);
}

// Duplicate apple-touch-icon to public root (iOS default lookup path)
writeFileSync(join(__dirname, "../public/apple-touch-icon.png"), generateIcon(180));
console.log("✓ apple-touch-icon.png → public/ (root, iOS default)");
console.log("\n✅  All icons written to public/icons/");
