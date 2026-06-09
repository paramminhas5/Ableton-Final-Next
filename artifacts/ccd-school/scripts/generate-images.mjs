/**
 * generate-images.mjs
 *
 * Generates all static AI images for CCD.SCHOOL via fal.ai FLUX.
 * Run: node scripts/generate-images.mjs [batch]
 *
 * Batches:
 *   1  — Landing hero + 3 world banners
 *   2  — 15 chapter headers
 *   3  — Beat Coach avatar + 5 trophy badges
 *   all — everything
 *
 * Images are saved to public/ai-images/ as WebP.
 * The key design brief: photorealistic / editorial / graphic design quality.
 * Must NOT look like AI art — no painterly diffusion, no surreal blending.
 */

import { fal } from "@fal-ai/client";
import { writeFileSync, mkdirSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import https from "https";
import http from "http";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = join(__dirname, "../public/ai-images");

// ── fal client setup ─────────────────────────────────────────────────────────
fal.config({ credentials: process.env.FAL_KEY });

// ── helpers ──────────────────────────────────────────────────────────────────
function fetchBuffer(url) {
  return new Promise((resolve, reject) => {
    const lib = url.startsWith("https") ? https : http;
    lib.get(url, (res) => {
      const chunks = [];
      res.on("data", (c) => chunks.push(c));
      res.on("end", () => resolve(Buffer.concat(chunks)));
      res.on("error", reject);
    }).on("error", reject);
  });
}

async function generate({ slug, prompt, negativePrompt, width = 1440, height = 810 }) {
  const outPath = join(OUT_DIR, `${slug}.webp`);
  if (existsSync(outPath)) {
    console.log(`  ↳ ${slug}.webp already exists, skipping`);
    return outPath;
  }

  console.log(`  ⏳ Generating ${slug}...`);
  const result = await fal.subscribe("fal-ai/flux-pro/v1.1", {
    input: {
      prompt,
      negative_prompt: negativePrompt ?? DEFAULT_NEGATIVE,
      width,
      height,
      num_images: 1,
      safety_tolerance: "5",
      output_format: "jpeg",
    },
    logs: false,
  });

  const imageUrl = result.data?.images?.[0]?.url;
  if (!imageUrl) throw new Error(`No image URL returned for ${slug}`);

  const buf = await fetchBuffer(imageUrl);
  writeFileSync(outPath, buf);
  console.log(`  ✓ ${slug}.webp saved (${Math.round(buf.length / 1024)}KB)`);
  return outPath;
}

// ── shared negative prompt ────────────────────────────────────────────────────
const DEFAULT_NEGATIVE =
  "illustration, painting, cartoon, anime, 3d render, CGI, sketch, watercolor, low quality, blurry, plastic, toy, fake, surreal, dreamlike, distorted, text overlay, watermark, logo, signature, frame, border";

// ── BATCH 1: Landing hero + world banners ────────────────────────────────────
const BATCH_1 = [
  {
    slug: "hero-landing",
    width: 1920,
    height: 1080,
    prompt:
      "Ultra-wide editorial photograph of a professional recording studio control room at night, massive mixing console in foreground with hundreds of faders and knobs, multiple large studio monitors, neon green and electric blue accent lighting reflecting off polished black surfaces, dramatic chiaroscuro lighting, cinematic depth of field, grain texture, shot on Hasselblad medium format, architectural photography, ultra sharp, no people",
  },
  {
    slug: "world-fundamentals",
    width: 1440,
    height: 640,
    prompt:
      "High-contrast editorial close-up photograph of a grand piano keyboard at dramatic oblique angle, black and white keys sharply in focus with electric neon green light raking across the keys from the side, dark studio background, long exposure light trails suggesting sound waves, music sheet paper blurred in background, Leica documentary photography style, grain, deep blacks, ultra sharp keys",
  },
  {
    slug: "world-dj",
    width: 1440,
    height: 640,
    prompt:
      "Professional editorial photograph of two Pioneer CDJ-3000 media players and a DJM mixer on a club DJ booth, shot from low angle looking up, neon purple and electric blue club lighting, laser beams cutting through atmospheric haze in background, bokeh crowd silhouettes visible, highly detailed CDJ screens showing waveforms, dark moody atmosphere, Canon 35mm f1.4 photography, cinematic grain, ultra sharp on equipment",
  },
  {
    slug: "world-producer",
    width: 1440,
    height: 640,
    prompt:
      "Editorial close-up photograph of a laptop screen showing a DAW (digital audio workstation) arrangement view with colorful audio clips, surrounded by studio equipment: audio interface, studio headphones coiled on desk, MIDI keyboard partially visible, warm tungsten desk lamp casting dramatic side light, dark wooden desk, shallow depth of field with sharp screen, editorial tech photography, Fujifilm XT4 aesthetic, cinematic",
  },
];

// ── BATCH 2: Chapter headers (15 images) ─────────────────────────────────────
const BATCH_2 = [
  // Fundamentals — 5 chapters
  {
    slug: "chapter-sound-science",
    width: 1200,
    height: 480,
    prompt:
      "Editorial scientific photograph of an oscilloscope screen showing multiple waveforms (sine, square, sawtooth) in sharp focus, green phosphor glow on dark screen, analogue knobs and dials visible in periphery, laboratory aesthetic, macro lens detail, Kodak Portra grain, cinematic aspect ratio, no people",
  },
  {
    slug: "chapter-rhythm-and-time",
    width: 1200,
    height: 480,
    prompt:
      "Editorial photograph of a mechanical metronome in sharp focus against dark background, pendulum motion blur suggesting swing, warm brass and wood textures, dramatic single-source directional lighting casting hard shadows, shallow depth of field, Leica 50mm aesthetic, percussion mallets blurred in background",
  },
  {
    slug: "chapter-melody-and-pitch",
    width: 1200,
    height: 480,
    prompt:
      "Extreme close-up editorial photograph of violin strings in sharp focus, rosin dust particles caught in shaft of studio light, dramatic side lighting, shallow depth of field with strings receding into blur, dark background, silver and gold string tones, macro photography, classical music editorial style",
  },
  {
    slug: "chapter-harmony-and-chords",
    width: 1200,
    height: 480,
    prompt:
      "Editorial photograph of hands playing a piano chord, dramatic overhead studio lighting, dark background, fingers in sharp focus on ivory keys, reflection of keys in polished piano lid above, music notation pages visible blurred in background, concert hall photography style, grain, high contrast",
  },
  {
    slug: "chapter-music-technology",
    width: 1200,
    height: 480,
    prompt:
      "Editorial tech photograph of a professional audio interface with multiple XLR cable connections, studio headphones, and MIDI cables arranged on a dark surface, top-down flat lay composition, soft studio lighting, product photography aesthetic, sharp detail on connectors and cables, tech journalism style",
  },
  // DJ World — 5 chapters
  {
    slug: "chapter-setup-and-culture",
    width: 1200,
    height: 480,
    prompt:
      "Editorial photograph of a DJ equipment setup: Pioneer CDJ-2000NXS2 and DJM-900NXS2 mixer viewed from above at slight angle, clean black equipment on dark surface, sharp detail on screens and controls, minimal product photography lighting, record crates visible on floor in background, DJ culture editorial style",
  },
  {
    slug: "chapter-the-library",
    width: 1200,
    height: 480,
    prompt:
      "Editorial photograph of hundreds of vinyl records stacked in wooden crates, shot at ground level looking along the rows, extreme depth of field showing record spines receding, warm tungsten light, some record covers visible with abstract artwork, music collection documentary photography, grain, intimate feel",
  },
  {
    slug: "chapter-the-mix-dj",
    width: 1200,
    height: 480,
    prompt:
      "Editorial close-up photograph of DJ hands on a crossfader and EQ knobs of a DJ mixer, motion blur on the hands suggesting movement, sharp focus on the knobs and fader, LED VU meters glowing, dark background, dramatic side lighting, music performance photography, grain",
  },
  {
    slug: "chapter-dj-performance",
    width: 1200,
    height: 480,
    prompt:
      "Editorial concert photograph of a DJ performing at a festival stage, shot from behind the DJ looking out over a massive crowd with hands raised, dramatic stage lighting with colored beams, silhouette of DJ against the light show, atmospheric smoke haze, long exposure crowd energy, festival photography style",
  },
  {
    slug: "chapter-dj-mastery",
    width: 1200,
    height: 480,
    prompt:
      "Editorial photograph of classic Technics SL-1200 turntable with a vinyl record, needle in groove, sharp focus on the stylus touching the record, warm studio lighting, dark felt mat, iconic silhouette, record label partially visible, DJ culture documentary photography, film grain",
  },
  // Producer — 5 chapters
  {
    slug: "chapter-first-contact",
    width: 1200,
    height: 480,
    prompt:
      "Editorial photograph of a laptop screen showing Ableton Live interface with colored tracks, surrounded by a MIDI keyboard controller and studio monitors on a minimal desk, late night blue hour lighting through window, shallow depth of field, tech lifestyle photography, cinematic grain, producer's perspective",
  },
  {
    slug: "chapter-sound-and-midi",
    width: 1200,
    height: 480,
    prompt:
      "Editorial close-up photograph of MIDI keyboard keys and pitch wheel, dramatic raking side light creating strong shadows across the keys, shallow depth of field, dark background, polished plastic and rubber key textures, music gear photography, grain",
  },
  {
    slug: "chapter-the-mix-producer",
    width: 1200,
    height: 480,
    prompt:
      "Editorial photograph of a professional large-format analog mixing console SSL or Neve in studio, dramatic overhead lighting, hundreds of faders and knobs in sharp focus at center with edges falling off, deep blacks and highlights, architectural documentary photography style, wide angle lens distortion minimal",
  },
  {
    slug: "chapter-performance-and-flow",
    width: 1200,
    height: 480,
    prompt:
      "Editorial photograph of Ableton Push controller illuminated with colorful RGB pads glowing in dark studio, dramatic low-key lighting, sharp focus on the pads and encoders, cables connecting to laptop barely visible, dark background, music technology editorial photography",
  },
  {
    slug: "chapter-advanced-producer",
    width: 1200,
    height: 480,
    prompt:
      "Editorial photograph of a modular synthesizer eurorack system, extreme close-up of patch cables connecting modules, hundreds of knobs and connections visible, colorful cable spaghetti, sharp detail in center, documentary photography of electronic music gear, grain, dark background with modules lit from front",
  },
];

// ── BATCH 3: Beat Coach + Trophies ───────────────────────────────────────────
const BATCH_3 = [
  {
    slug: "beat-coach-avatar",
    width: 512,
    height: 512,
    prompt:
      "Editorial character portrait photograph of a stylized robotic music producer, sleek matte black head with a small glowing green speaker grille for a mouth, headphones integrated into the head design, clean studio background, product design photography aesthetic, dramatic studio lighting, sharp and precise, like an Apple product launch photo",
  },
  {
    slug: "trophy-path",
    width: 512,
    height: 512,
    prompt:
      "Product photography of a small metallic bronze medal with a musical note engraved on it, resting on a dark surface, dramatic single-point studio lighting casting sharp shadow, shallow depth of field, jewelry photography style, ultra sharp detail on medal texture",
  },
  {
    slug: "trophy-chapter",
    width: 512,
    height: 512,
    prompt:
      "Product photography of a sleek silver trophy cup with audio waveform engraving, placed on dark reflective surface, single source dramatic studio lighting, minimal background, product launch photography style, ultra sharp metallic detail and reflection",
  },
  {
    slug: "trophy-world",
    width: 512,
    height: 512,
    prompt:
      "Product photography of a gold trophy with a vinyl record and musical note design engraved, dramatic studio lighting with specular highlights on polished gold surface, dark background, luxury product photography, ultra sharp detail",
  },
  {
    slug: "trophy-master",
    width: 512,
    height: 512,
    prompt:
      "Product photography of a large diamond-encrusted black trophy with headphones and speaker design, glowing internal light source, ultra premium product photography, dark background with subtle light rays, sharp detail on crystals and black finish, prestigious award aesthetic",
  },
];

// ── BATCH: Completion art (4 variants by grade) ───────────────────────────────
const BATCH_COMPLETION = [
  {
    slug: "completion-perfect",
    width: 800,
    height: 600,
    prompt:
      "Top-down product flat lay photograph of music production gear: MIDI keyboard, studio headphones, cables, all arranged perfectly on black background with electric green neon accent light, celebration mood, editorial lifestyle photography, sharp and colorful",
  },
  {
    slug: "completion-solid",
    width: 800,
    height: 600,
    prompt:
      "Editorial photograph of studio headphones hanging on a microphone stand, warm studio lighting, bokeh background with blurred equipment, achievement feeling, clean editorial music photography",
  },
];

// ── Runner ────────────────────────────────────────────────────────────────────
async function runBatch(name, items) {
  console.log(`\n🎨 Generating ${name} (${items.length} images)...\n`);
  const results = [];
  for (const item of items) {
    try {
      const path = await generate(item);
      results.push({ slug: item.slug, path, ok: true });
    } catch (err) {
      console.error(`  ✗ Failed ${item.slug}: ${err.message}`);
      results.push({ slug: item.slug, ok: false, error: err.message });
    }
    // Small delay to avoid rate limiting
    await new Promise((r) => setTimeout(r, 500));
  }
  return results;
}

async function main() {
  if (!process.env.FAL_KEY) {
    console.error("ERROR: FAL_KEY environment variable not set");
    process.exit(1);
  }

  mkdirSync(OUT_DIR, { recursive: true });

  const batchArg = process.argv[2] ?? "all";

  const batches = {
    "1": [["Batch 1 — Hero + World Banners", BATCH_1]],
    "2": [["Batch 2 — Chapter Headers", BATCH_2]],
    "3": [["Batch 3 — Beat Coach + Trophies", BATCH_3]],
    "completion": [["Completion Art", BATCH_COMPLETION]],
    "all": [
      ["Batch 1 — Hero + World Banners", BATCH_1],
      ["Batch 2 — Chapter Headers", BATCH_2],
      ["Batch 3 — Beat Coach + Trophies", BATCH_3],
      ["Completion Art", BATCH_COMPLETION],
    ],
  };

  const toRun = batches[batchArg];
  if (!toRun) {
    console.error(`Unknown batch: ${batchArg}. Use: 1, 2, 3, completion, or all`);
    process.exit(1);
  }

  let total = 0, ok = 0;
  for (const [name, items] of toRun) {
    const results = await runBatch(name, items);
    total += results.length;
    ok += results.filter((r) => r.ok).length;
  }

  console.log(`\n✅ Done: ${ok}/${total} images generated → public/ai-images/`);
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
