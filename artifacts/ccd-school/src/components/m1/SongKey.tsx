"use client";
/**
 * The song key: shows which song is loaded, and opens the sheet that loads another. It sits on the song
 * strip in every lesson, in the studio header and on home. Loading a song never plays it: your song plays
 * when you press its play key. A song we put in for you says so ("added for you").
 */
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { loadStarter, newSong, partsOf, readSongs, seedOf, switchSong, type SongIndex } from "@/lib/songs";
import { starterTrack } from "@/lib/starter";
import { Icon } from "./controls";
import "./song.css";

export const SONG_EVENT = "ccd:song";
const ago = (t: number) => {
  const m = Math.round((Date.now() - t) / 60000);
  if (!t || m < 1) return "just now";
  if (m < 60) return `${m} min ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h} h ago`;
  const d = Math.round(h / 24);
  return d === 1 ? "yesterday" : `${d} days ago`;
};

/** The open song's name and whether we put it in. Follows song changes from any screen. */
export function useSongName() {
  const [s, setS] = useState<{ name: string; seed: boolean }>({ name: "my song", seed: false });
  useEffect(() => {
    const read = () => { const i = readSongs(); setS({ name: i.songs.find(x => x.id === i.active)?.name ?? "my song", seed: !!seedOf() }); };
    read();
    window.addEventListener(SONG_EVENT, read);
    window.addEventListener("storage", read);
    return () => { window.removeEventListener(SONG_EVENT, read); window.removeEventListener("storage", read); };
  }, []);
  return s;
}

/** The "added for you" mark, and the one line that explains it the first time. */
export function AddedForYou({ line = false, short = false }: { line?: boolean; short?: boolean }) {
  if (line && short) return <p className="sk-why is-short"><span className="sk-tag">added for you</span>a loop to play with. your first lesson replaces it.</p>;
  return line
    ? <p className="sk-why"><span className="sk-tag">added for you</span>you haven&apos;t made a song yet, so we added a starter loop to play with. your first lesson replaces it with parts you make.</p>
    : <span className="sk-tag">added for you</span>;
}

export function SongKey({ onChange, compact }: { onChange?: () => void; compact?: boolean }) {
  const [open, setOpen] = useState(false);
  const { name, seed } = useSongName();
  return (
    <>
      <button type="button" className={`sk-key ${compact ? "is-compact" : ""}`} data-song-key onClick={() => setOpen(true)} aria-haspopup="dialog" aria-label={`Song: ${name}. Load another song`}>
        <b>{name.toLowerCase()}</b>{seed && !compact ? <AddedForYou /> : null}<Icon name="down" small />
      </button>
      {open && <SongSheet onClose={() => setOpen(false)} onChange={onChange} />}
    </>
  );
}

export function SongSheet({ onClose, onChange }: { onClose: () => void; onChange?: () => void }) {
  const [i, setI] = useState<SongIndex | null>(null);
  const [parts, setParts] = useState<Record<string, number>>({});
  useEffect(() => {
    const idx = readSongs();
    setI(idx);
    setParts(Object.fromEntries(idx.songs.map(s => [s.id, partsOf(s.id)])));
  }, []);
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);
  const done = () => { window.dispatchEvent(new Event(SONG_EVENT)); onChange?.(); onClose(); };
  if (!i) return null;
  const seed = seedOf();
  return createPortal(
    <div className="sk-veil" onClick={onClose}>
      <div className="sk-sheet" role="dialog" aria-modal="true" aria-label="Your songs" onClick={e => e.stopPropagation()}>
        <div className="sk-grip" aria-hidden />
        <div className="sk-head"><span>your songs</span><button type="button" className="sk-x" onClick={onClose} aria-label="Close"><Icon name="close" small /></button></div>
        <div className="m1-glass sk-glass">
          <ul className="sk-list">
            {i.songs.map(s => {
              const on = s.id === i.active;
              const ours = on ? !!seed : !!s.seed;
              return (
                <li key={s.id}>
                  <button type="button" className={`sk-row ${on ? "is-on" : ""}`} aria-current={on || undefined} onClick={() => { if (!on) switchSong(s.id); done(); }}>
                    <i className="sk-led" aria-hidden />
                    <span className="sk-name">{s.name.toLowerCase()}<small>{parts[s.id] ? `${parts[s.id]} ${parts[s.id] === 1 ? "part" : "parts"}` : "empty"} · {ago(s.updatedAt)}</small></span>
                    {ours ? <span className="sk-tag">added for you</span> : on ? <span className="sk-now">loaded</span> : null}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
        <div className="sk-keys">
          <button type="button" className="m1-m is-wide sk-k" onClick={() => { newSong(); done(); }}>
            <span className="m1-cap" style={{ width: 40, height: 40, flex: "none" }}><Icon name="plus" small /></span><span>new song<small>start from nothing</small></span>
          </button>
          <button type="button" className="m1-m is-wide sk-k" onClick={() => { loadStarter(starterTrack()); done(); }}>
            <span className="m1-cap" style={{ width: 40, height: 40, flex: "none" }}><Icon name="loop" small /></span><span>starter loop<small>drums and bass to play with</small></span>
          </button>
        </div>
        <p className="sk-foot">loading a song doesn&apos;t play it. press play when you&apos;re ready.</p>
      </div>
    </div>,
    document.body,
  );
}
