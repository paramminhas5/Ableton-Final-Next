import { it } from "vitest";
import { mkdirSync, writeFileSync } from "node:fs";
import { MISSIONS } from "../src/content/missions";

// Feeds scripts/lessons-crawl.mjs: `npm run crawl:dump` writes .tmp/missions.json.
it.skipIf(!process.env.DUMP_MISSIONS)("dump missions for the lesson crawler", () => {
  mkdirSync(".tmp", { recursive: true });
  writeFileSync(".tmp/missions.json", JSON.stringify(MISSIONS.map((m) => ({ slug: m.slug, world: m.world, screens: m.screens ?? [] }))));
});
