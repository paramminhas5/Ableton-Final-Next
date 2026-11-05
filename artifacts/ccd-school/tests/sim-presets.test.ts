import { describe, it, expect } from "vitest";
import { MISSIONS } from "../src/content/missions";
import { DRILL_ALIASES } from "../src/lib/drillAliases";

describe("ear-training presets in lesson content", () => {
  it("every preset mode maps to a real drill", () => {
    const bad: string[] = [];
    for (const m of MISSIONS) for (const s of m.screens ?? []) {
      if (s.kind === "interact" && s.sim === "ear-training") {
        const mode = (s.preset as { mode?: string } | undefined)?.mode;
        if (mode && !DRILL_ALIASES[mode]) bad.push(`${m.slug}: ${mode}`);
      }
    }
    expect(bad).toEqual([]);
  });
});
