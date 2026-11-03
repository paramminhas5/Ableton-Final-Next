import { beforeEach, describe, expect, it, vi } from "vitest";

function stubBrowser() {
  const store = new Map<string, string>();
  vi.stubGlobal("localStorage", {
    getItem: (k: string) => store.get(k) ?? null,
    setItem: (k: string, v: string) => void store.set(k, v),
    removeItem: (k: string) => void store.delete(k),
  });
  const win = { dispatchEvent: () => true, addEventListener: () => {}, removeEventListener: () => {} };
  vi.stubGlobal("window", win);
  vi.stubGlobal("CustomEvent", class { constructor(public type: string, public init?: unknown) {} });
  return store;
}

describe("songs", () => {
  beforeEach(() => {
    vi.resetModules();
    stubBrowser();
  });

  it("starts with one song and keeps each song's track apart", async () => {
    const songs = await import("../src/lib/songs");
    const t2 = await import("../src/lib/track2");
    expect(songs.readSongs().songs).toHaveLength(1);
    const a = { ...t2.emptyTrackV2(), bpm: 101 };
    t2.writeTrackV2(a);
    const b = songs.newSong("second");
    expect(b.songs.map(s => s.name)).toEqual(["my track", "second"]);
    expect(t2.readTrackV2().bpm).toBe(120); // a fresh song
    t2.writeTrackV2({ ...t2.readTrackV2(), bpm: 99 });
    songs.switchSong(b.songs[0].id);
    expect(t2.readTrackV2().bpm).toBe(101);
    songs.switchSong(b.songs[1].id);
    expect(t2.readTrackV2().bpm).toBe(99);
  });

  it("duplicates, renames and deletes, never the last one", async () => {
    const songs = await import("../src/lib/songs");
    const t2 = await import("../src/lib/track2");
    t2.writeTrackV2({ ...t2.emptyTrackV2(), bpm: 111 });
    let i = songs.duplicateSong();
    expect(i.songs).toHaveLength(2);
    expect(t2.readTrackV2().bpm).toBe(111);
    i = songs.renameSong(i.active, "  jam  ");
    expect(i.songs.find(s => s.id === i.active)?.name).toBe("jam");
    i = songs.deleteSong(i.active);
    expect(i.songs).toHaveLength(1);
    expect(songs.deleteSong(i.active).songs).toHaveLength(1);
  });
});
