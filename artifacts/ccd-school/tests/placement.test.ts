import { beforeEach, describe, expect, it, vi } from "vitest";

function stubBrowser() {
  const store = new Map<string, string>();
  vi.stubGlobal("localStorage", { getItem: (k: string) => store.get(k) ?? null, setItem: (k: string, v: string) => void store.set(k, v), removeItem: (k: string) => void store.delete(k) });
  vi.stubGlobal("sessionStorage", { getItem: () => null, setItem: () => {}, removeItem: () => {} });
  vi.stubGlobal("window", { dispatchEvent: () => true, addEventListener: () => {}, removeEventListener: () => {} });
  vi.stubGlobal("CustomEvent", class { constructor(public type: string, public init?: unknown) {} });
  return store;
}

const strong = { timingMs: 20, copyStars: 3 as const, ears: 4, earsTotal: 4, matchStars: 3 as const };

describe("placement: the level", () => {
  beforeEach(() => { vi.resetModules(); stubBrowser(); });

  it("needs steady time and a copied pattern before skipping anything", async () => {
    const { placeLevel } = await import("../src/lib/placement");
    expect(placeLevel({ ...strong, timingMs: null })).toBe(0);
    expect(placeLevel({ ...strong, timingMs: 80 })).toBe(0);
    expect(placeLevel({ ...strong, copyStars: 1 })).toBe(0);
    expect(placeLevel({ ...strong, matchStars: 0 })).toBe(1);
    expect(placeLevel({ ...strong, ears: 2 })).toBe(1);
    expect(placeLevel({ ...strong, timingMs: 40 })).toBe(2);
    expect(placeLevel(strong)).toBe(3);
  });

  it("lands on a song lesson that exists in each world, with the ones before it skipped", async () => {
    const { placeIn, LEVEL_START } = await import("../src/lib/placement");
    const { worldSteps } = await import("../src/lib/worldOrder");
    for (const w of ["producer", "fundamentals", "dj"] as const) {
      for (const slug of LEVEL_START[w]) expect(worldSteps(w).some(s => s.slug === slug), `${w}: ${slug}`).toBe(true);
      const r = placeIn(w, strong);
      expect(r.slug).toBe(LEVEL_START[w][3]);
      expect(r.skipped).toEqual(worldSteps(w).slice(0, r.index).map(s => s.slug));
      expect(placeIn(w, { ...strong, timingMs: null }).skipped).toEqual([]);
    }
  });

  it("reads timing from beat positions", async () => {
    const { tapOffsets, medianOffset } = await import("../src/lib/placement");
    const off = tapOffsets([1.02, 2, 2.98, 4.05, 5], 120);
    expect(off.map(Math.round)).toEqual([10, 0, -10, 25, 0]);
    expect(medianOffset(off)).toBe(10);
    expect(medianOffset([5, 5])).toBeNull();
  });
});

describe("placement: the song still gets the skipped lessons' parts", () => {
  beforeEach(() => { vi.resetModules(); stubBrowser(); });

  it("producer level 1 gives a kick, a lead, hats and a clap", async () => {
    const { placeIn } = await import("../src/lib/placement");
    const { buildPlacedSong } = await import("../src/lib/placementSong");
    const r = placeIn("producer", { ...strong, matchStars: 0 });
    expect(r.slug).toBe("first-bass");
    const t = buildPlacedSong(r.skipped, "producer");
    expect(t.added).toEqual(expect.arrayContaining(r.skipped));
    const drums = t.layers.find(l => l.type === "drums");
    expect(drums?.events.some(e => e.note === 36)).toBe(true);
    expect(drums?.events.some(e => e.note === 39 || e.note === 38)).toBe(true);
    expect(t.layers.find(l => l.type === "hats")?.events.length).toBeGreaterThan(0);
    expect(t.layers.find(l => l.type === "lead")?.events.length).toBeGreaterThan(0);
  });

  it("producer level 3 adds the bass and chords too, and placing twice changes nothing", async () => {
    const { placeIn } = await import("../src/lib/placement");
    const { buildPlacedSong } = await import("../src/lib/placementSong");
    const t2 = await import("../src/lib/track2");
    const r = placeIn("producer", strong);
    const t = buildPlacedSong(r.skipped, "producer");
    for (const type of ["drums", "hats", "lead", "bass", "chords"] as const) expect(t.layers.find(l => l.type === type)?.events.length ?? 0, type).toBeGreaterThan(0);
    const again = buildPlacedSong(r.skipped, "producer");
    expect(JSON.stringify(again.layers)).toBe(JSON.stringify(t.layers));
    expect(t2.readTrackV2().added).toEqual(expect.arrayContaining(r.skipped));
  });

  it("basics and dj build a song too", async () => {
    const { placeIn } = await import("../src/lib/placement");
    const { buildPlacedSong } = await import("../src/lib/placementSong");
    const b = buildPlacedSong(placeIn("fundamentals", strong).skipped, "fundamentals");
    expect(b.layers.find(l => l.type === "drums")?.events.length).toBeGreaterThan(0);
    expect(b.layers.find(l => l.type === "lead")?.events.length).toBeGreaterThan(0);
    vi.resetModules(); stubBrowser();
    const p2 = { ...(await import("../src/lib/placement")), ...(await import("../src/lib/placementSong")) };
    const d = p2.buildPlacedSong(p2.placeIn("dj", strong).skipped, "dj");
    expect(d.layers.some(l => l.events.length)).toBe(true);
  });
});
