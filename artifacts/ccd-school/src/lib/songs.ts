/**
 * Several songs. The song you are working on is always the track in "ccd.track.v2", so
 * every screen keeps reading one place. The others sit in "ccd.song.<id>" and swap in when
 * you switch. The list lives in "ccd.songs.v1".
 */
import { clearHistory, emptyTrackV2, readTrackV2, writeTrackV2, type TrackV2 } from "./track2";

/** `seed`: we put this song in, not the learner ("added for you"). It goes the moment a lesson adds their first part. */
export type SongInfo = { id: string; name: string; updatedAt: number; seed?: "starter" };
export type SongIndex = { v: 1; active: string; songs: SongInfo[] };

const INDEX = "ccd.songs.v1";
const slot = (id: string) => `ccd.song.${id}`;
const uid = () => Math.random().toString(36).slice(2, 9);
export const MAX_SONGS = 24;

function load(): SongIndex | null {
  try {
    const raw = localStorage.getItem(INDEX);
    const i = raw ? (JSON.parse(raw) as SongIndex) : null;
    return i && i.v === 1 && Array.isArray(i.songs) && i.songs.length ? i : null;
  } catch {
    return null;
  }
}

function save(i: SongIndex) {
  try {
    localStorage.setItem(INDEX, JSON.stringify(i));
  } catch {
    /* storage full or blocked */
  }
}

/** The list, creating "my track" from what is already there on first use. */
export function readSongs(): SongIndex {
  if (typeof window === "undefined") return { v: 1, active: "main", songs: [{ id: "main", name: "my track", updatedAt: 0 }] };
  const i = load();
  if (i) return i;
  const first: SongIndex = { v: 1, active: uid(), songs: [] };
  first.songs.push({ id: first.active, name: "my track", updatedAt: Date.now() });
  save(first);
  return first;
}

function stash(i: SongIndex) {
  const cur = readTrackV2();
  try {
    localStorage.setItem(slot(i.active), JSON.stringify(cur));
  } catch {
    /* keep going */
  }
  const info = i.songs.find(s => s.id === i.active);
  if (info) info.updatedAt = cur.updatedAt;
}

function open(i: SongIndex, id: string, fallback: TrackV2): SongIndex {
  let t = fallback;
  try {
    const raw = localStorage.getItem(slot(id));
    if (raw) {
      const p = JSON.parse(raw) as TrackV2;
      if (p && p.v === 2) t = p;
    }
  } catch {
    /* use the fallback */
  }
  const next = { ...i, active: id };
  save(next);
  clearHistory();
  writeTrackV2(t);
  return next;
}

export function switchSong(id: string): SongIndex {
  const i = readSongs();
  if (id === i.active || !i.songs.some(s => s.id === id)) return i;
  stash(i);
  return open(i, id, emptyTrackV2());
}

export function newSong(name?: string): SongIndex {
  const i = readSongs();
  if (i.songs.length >= MAX_SONGS) return i;
  stash(i);
  const id = uid();
  const n = name?.trim() || `song ${i.songs.length + 1}`;
  const next: SongIndex = { ...i, songs: [...i.songs, { id, name: n, updatedAt: Date.now() }] };
  return open(next, id, emptyTrackV2());
}

export function duplicateSong(): SongIndex {
  const i = readSongs();
  if (i.songs.length >= MAX_SONGS) return i;
  stash(i);
  const cur = readTrackV2();
  const id = uid();
  const from = i.songs.find(s => s.id === i.active);
  const next: SongIndex = { ...i, songs: [...i.songs, { id, name: `${from?.name ?? "song"} copy`, updatedAt: Date.now() }] };
  try {
    localStorage.setItem(slot(id), JSON.stringify(cur));
  } catch {
    /* keep going */
  }
  return open(next, id, cur);
}

export function renameSong(id: string, name: string): SongIndex {
  const i = readSongs();
  const n = name.trim().slice(0, 24);
  if (!n) return i;
  const next = { ...i, songs: i.songs.map(s => (s.id === id ? { ...s, name: n } : s)) };
  save(next);
  return next;
}

/** Delete a song. The last one cannot go; deleting the open one opens its neighbour. */
export function deleteSong(id: string): SongIndex {
  const i = readSongs();
  if (i.songs.length <= 1) return i;
  const idx = i.songs.findIndex(s => s.id === id);
  if (idx < 0) return i;
  const songs = i.songs.filter(s => s.id !== id);
  try {
    localStorage.removeItem(slot(id));
  } catch {
    /* ignore */
  }
  if (id !== i.active) {
    const next = { ...i, songs };
    save(next);
    return next;
  }
  return open({ ...i, songs }, songs[Math.min(idx, songs.length - 1)].id, emptyTrackV2());
}

/** Names a song gets the first time a lesson adds a part to it. The learner can rename it any time. */
export const SONG_NAMES = [
  "first light", "night bus", "two am", "soft static", "low tide", "neon cat", "slow burn", "after hours",
  "warm room", "blue hour", "late set", "paper moon", "cat nap", "side street", "small hours", "glow worm",
] as const;
const isPlaceholder = (n: string) => n === "my track" || n === "my song" || n === STARTER_NAME || /^song \d+$/.test(n);

// ── songs we put in for you ──────────────────────────────────────────────────
export const STARTER_NAME = "starter loop";

/** The open song, if we put it in and the learner hasn't added a part of their own yet. */
export function seedOf(): SongInfo["seed"] | null {
  const i = readSongs();
  const info = i.songs.find(s => s.id === i.active);
  if (!info?.seed) return null;
  return readTrackV2().added.length ? null : info.seed;
}

/** Put the starter loop in: into the open song if it is empty, otherwise as a new song. Marked "added for you". */
export function loadStarter(track: TrackV2): SongIndex {
  let i = readSongs();
  const cur = readTrackV2();
  const empty = !cur.layers.some(l => l.events.length);
  if (!empty) {
    if (i.songs.length >= MAX_SONGS) return i;
    stash(i);
    const id = uid();
    i = { ...i, active: id, songs: [...i.songs, { id, name: STARTER_NAME, updatedAt: Date.now(), seed: "starter" }] };
  } else {
    i = { ...i, songs: i.songs.map(s => (s.id === i.active ? { ...s, name: STARTER_NAME, seed: "starter" as const } : s)) };
  }
  save(i);
  clearHistory();
  writeTrackV2({ ...track, updatedAt: Date.now() });
  return i;
}

/**
 * After a lesson adds a part: if the open song was the starter loop, its starter parts go, so the song is
 * only what the learner made, and it gets a name of its own. Returns true when it did that.
 */
export function settleSeed(): boolean {
  const i = readSongs();
  const info = i.songs.find(s => s.id === i.active);
  if (!info?.seed) return false;
  const t = readTrackV2();
  if (!t.added.length) return false;
  writeTrackV2({ ...t, layers: t.layers.filter(l => l.from !== "starter"), updatedAt: Date.now() });
  save({ ...i, songs: i.songs.map(s => (s.id === i.active ? { ...s, seed: undefined } : s)) });
  nameSongIfNew();
  return true;
}

/** How many parts a song in the list has, read from where it is kept. */
export function partsOf(id: string): number {
  const i = readSongs();
  let t: TrackV2 | null = null;
  if (id === i.active) t = readTrackV2();
  else {
    try {
      const raw = localStorage.getItem(slot(id));
      t = raw ? (JSON.parse(raw) as TrackV2) : null;
    } catch {
      t = null;
    }
  }
  return t ? new Set(t.layers.filter(l => l.events.length).map(l => l.type)).size : 0;
}

/** Give the open song a real name if it still has a placeholder one. Returns the name it has now. */
export function nameSongIfNew(): string {
  const i = readSongs();
  const info = i.songs.find(s => s.id === i.active);
  if (!info) return "my song";
  if (!isPlaceholder(info.name)) return info.name;
  const taken = new Set(i.songs.map(s => s.name));
  let h = 0;
  for (const c of info.id) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  const pick = SONG_NAMES.map((_, k) => SONG_NAMES[(h + k) % SONG_NAMES.length]).find(n => !taken.has(n)) ?? `song ${i.songs.length}`;
  renameSong(info.id, pick);
  return pick;
}
