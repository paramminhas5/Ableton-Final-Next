#!/usr/bin/env node
/**
 * generate-fal-images.mjs
 *
 * Build-time script: reads fal-image-priority.md, calls FAL.ai API,
 * saves results to public/generated/{slug}-{index}.webp
 *
 * Usage:
 *   FAL_API_KEY=xxx node scripts/generate-fal-images.mjs
 *   FAL_API_KEY=xxx node scripts/generate-fal-images.mjs --dry-run
 *   FAL_API_KEY=xxx node scripts/generate-fal-images.mjs --overwrite
 *
 * NEVER run on live page requests. Build-time only.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const OUT_DIR = path.join(ROOT, "public", "generated");
const PRIORITY_FILE = path.join(ROOT, "fal-image-priority.md");

const FAL_API_KEY = process.env.FAL_API_KEY;
const FAL_API_URL = "https://fal.run/fal-ai/flux/dev";

const DRY_RUN = process.argv.includes("--dry-run");
const OVERWRITE = process.argv.includes("--overwrite");

// Parse priority file: lines matching "- missionSlug | screenIndex | prompt text"
function parsePriorityFile(raw) {
  const lines = raw.split("\n");
  const entries = [];
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed.startsWith("- ")) continue;
    const content = trimmed.slice(2);
    const parts = content.split("|").map(p => p.trim());
    if (parts.length < 3) continue;
    const [missionSlug, screenIndex, ...promptParts] = parts;
    const prompt = promptParts.join("|").trim();
    if (missionSlug && screenIndex && prompt) {
      entries.push({ missionSlug, screenIndex: parseInt(screenIndex, 10), prompt });
    }
  }
  return entries;
}

async function generateImage(prompt, outPath) {
  if (!FAL_API_KEY) {
    throw new Error("FAL_API_KEY environment variable is not set. Usage: FAL_API_KEY=xxx node scripts/generate-fal-images.mjs");
  }

  const res = await fetch(FAL_API_URL, {
    method: "POST",
    headers: {
      "Authorization": `Key ${FAL_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      prompt,
      image_size: "landscape_4_3",
      num_inference_steps: 28,
      output_format: "webp",
      enable_safety_checker: true,
    }),
  });

  if (!res.ok) {
    throw new Error(`FAL API error ${res.status}: ${await res.text()}`);
  }

  const data = await res.json();
  const imageUrl = data.images?.[0]?.url;
  if (!imageUrl) {
    throw new Error("No image URL in FAL response: " + JSON.stringify(data));
  }

  // Download image
  const imgRes = await fetch(imageUrl);
  if (!imgRes.ok) {
    throw new Error(`Failed to download image from ${imageUrl}: ${imgRes.status}`);
  }
  const buffer = Buffer.from(await imgRes.arrayBuffer());
  fs.writeFileSync(outPath, buffer);
  console.log(`  ✓ Saved: ${path.basename(outPath)} (${buffer.length} bytes)`);
}

async function main() {
  if (!fs.existsSync(PRIORITY_FILE)) {
    console.error(`Priority file not found: ${PRIORITY_FILE}`);
    process.exit(1);
  }

  const raw = fs.readFileSync(PRIORITY_FILE, "utf8");
  const items = parsePriorityFile(raw);

  if (items.length === 0) {
    console.error("No valid entries found in fal-image-priority.md");
    process.exit(1);
  }

  console.log(`\nFAL Image Generator`);
  console.log(`Mode: ${DRY_RUN ? "DRY RUN" : "LIVE"} | Entries: ${items.length} | Output: ${OUT_DIR}\n`);

  fs.mkdirSync(OUT_DIR, { recursive: true });

  // Create .gitkeep so the directory is tracked
  const gitkeep = path.join(OUT_DIR, ".gitkeep");
  if (!fs.existsSync(gitkeep)) {
    fs.writeFileSync(gitkeep, "");
  }

  let generated = 0;
  let skipped = 0;
  let errors = 0;

  for (const { missionSlug, screenIndex, prompt } of items) {
    const filename = `${missionSlug}-${screenIndex}.webp`;
    const outPath = path.join(OUT_DIR, filename);

    if (fs.existsSync(outPath) && !OVERWRITE) {
      console.log(`  [skip] ${filename} — already exists (use --overwrite to regenerate)`);
      skipped++;
      continue;
    }

    console.log(`  [gen]  ${filename}`);
    console.log(`         ${prompt.slice(0, 80)}...`);

    if (DRY_RUN) {
      console.log(`         (dry run — skipping API call)\n`);
      generated++;
      continue;
    }

    try {
      await generateImage(prompt, outPath);
      generated++;
    } catch (err) {
      console.error(`  [ERR]  ${filename}: ${err.message}`);
      errors++;
    }

    // Small delay between requests to avoid rate limiting
    await new Promise(r => setTimeout(r, 500));
  }

  console.log(`\nDone. Generated: ${generated} | Skipped: ${skipped} | Errors: ${errors}`);

  if (errors > 0) {
    process.exit(1);
  }
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
