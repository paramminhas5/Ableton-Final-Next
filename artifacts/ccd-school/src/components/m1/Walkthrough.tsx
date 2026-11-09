"use client";
/**
 * Point and click walkthroughs (9 Nov). Every main screen has one: three to five stops, a spotlight on a real
 * control and one line on what it does. It runs the first time you open that screen, and again from the "?" key
 * in the screen's header. `?tour=1` in the address opens it too (shots and support links).
 * Stops find their control by selector; a stop whose control isn't on the screen (simple mode, a phone layout)
 * is skipped, so a walkthrough never points at nothing.
 */
import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { GoPill } from "./controls";
import "./lesson.css";

type Stop = { sel: string; title: string; line: string };
export const TOURS: Record<string, Stop[]> = {
  home: [
    { sel: "[data-tour=song]", title: "your song", line: "everything you make goes in here. press play to hear it, tap its name to load another." },
    { sel: ".hm-go", title: "continue", line: "your next lesson, and the part it adds to your song." },
    { sel: ".td-knobs", title: "turn to choose", line: "world, path and lesson. turn a knob to pick any lesson." },
    { sel: ".hm-map", title: "your road", line: "every lesson in this world. +3 means three deeper lessons on that part, when you want more." },
    { sel: ".m1-modebar", title: "the rest of ccd school", line: "practice to get better, the studio to build your song out, the library for every word and sound." },
  ],
  lesson: [
    { sel: ".fl-song", title: "your song, always on top", line: "every lesson adds to it. press play any time to hear where it is." },
    { sel: ".fl-text, .ls-col", title: "one idea per step", line: "read, listen, then do it on the instrument." },
    { sel: ".fl-ways", title: "say it another way", line: "if a step doesn't land, hear it in other words, or simpler." },
    { sel: ".ls-bottom .is-wide, .fl-bottom .is-wide", title: "the go key", line: "the one pink key moves you on. if it can't yet, it says why." },
  ],
  studio: [
    { sel: ".st-slots", title: "your parts", line: "each part of your song. tap one to play it, the plus adds another." },
    { sel: ".st-scr", title: "the screen", line: "shows what you just touched and what it's doing to the sound." },
    { sel: ".st-tray, .st-surface", title: "play it", line: "pads for drums, keys for everything else. press rec and play to record." },
    { sel: ".st-knobs", title: "shape it", line: "the knobs you've learnt. more arrive as lessons teach them." },
    { sel: ".st-transport", title: "play, record, send to live", line: "your song plays only when you press play. to live sends it to Ableton Live." },
  ],
  dj: [
    { sel: ".dj-scr", title: "both tracks, lined up", line: "deck a on top, deck b under it. when the beats line up by eye, they line up by ear." },
    { sel: ".dk-deck.is-a", title: "deck a: your song", line: "the jog wheel nudges it, play and cue start and stop it." },
    { sel: ".dk-tempo, .dk-tempo-h", title: "tempo", line: "slide it until both decks run at the same speed." },
    { sel: ".dk-mixer", title: "the mixer", line: "each deck's channel: its knobs and its fader. bring deck b's fader up to hear it." },
    { sel: ".dk-xf", title: "the crossfader", line: "slide from deck a to deck b, without the music stopping." },
  ],
  practice: [
    { sel: "[data-tour=today]", title: "today's three minutes", line: "a few quick rounds picked from what you learnt. do it daily and it sticks." },
    { sel: "[data-tour=drills]", title: "drills", line: "ear games and match this sound, each at your level." },
    { sel: "[data-tour=review]", title: "review", line: "lessons come back here when they're about to slip." },
  ],
  syllabus: [
    { sel: ".sy-whead", title: "three worlds", line: "basics, producer and dj. open any of them, any time." },
    { sel: ".sy-row:not(.is-small)", title: "song lessons", line: "each adds a part to your song, in order." },
    { sel: ".sy-more", title: "go deeper", line: "+3 means three more lessons on that part. tap to open them." },
  ],
  wiki: [
    { sel: "input[type=search]", title: "search", line: "type a device, a word, or what you want to hear." },
    { sel: ".lb-intents", title: "search by sound", line: "warmer, wider, more space: tap one to see the devices that do it." },
    { sel: ".lb-grid", title: "play with a device", line: "each one opens on a loop. turn its knobs and hear what it does." },
  ],
};
const KEY = (s: string) => `ccd.walk.${s}`;
const visible = (sel: string): Element | null => [...document.querySelectorAll(sel)].find(e => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0; }) ?? null;

/** The "?" key for a screen's header, and the walkthrough itself. */
export function Walkthrough({ screen, auto = true }: { screen: keyof typeof TOURS | string; auto?: boolean }) {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    let seen = false, forced = false;
    try { seen = !!localStorage.getItem(KEY(screen)); forced = new URLSearchParams(window.location.search).get("tour") === "1"; } catch { /* no storage */ }
    if (forced || (auto && !seen)) { const t = window.setTimeout(() => setOpen(true), 700); return () => window.clearTimeout(t); }
  }, [screen, auto]);
  const close = useCallback(() => { setOpen(false); try { localStorage.setItem(KEY(screen), "1"); } catch { /* ignore */ } }, [screen]);
  return (
    <>
      <button type="button" className="hk is-q" onClick={() => setOpen(true)} aria-label="Show me around this screen">?</button>
      {open && <Tour stops={TOURS[screen] ?? []} onClose={close} />}
    </>
  );
}

function Tour({ stops, onClose }: { stops: Stop[]; onClose: () => void }) {
  const live = stops.filter(s => typeof document !== "undefined" && visible(s.sel));
  const [i, setI] = useState(0);
  const [box, setBox] = useState<DOMRect | null>(null);
  const stop = live[i];
  useEffect(() => {
    if (!stop) return;
    const place = () => { const el = visible(stop.sel); setBox(el ? el.getBoundingClientRect() : null); };
    const el = visible(stop.sel);
    if (el && !el.closest(".m1-modebar")) {
      const r = el.getBoundingClientRect();
      if (r.top < 70 || r.bottom > window.innerHeight - 260) window.scrollTo({ top: Math.max(0, window.scrollY + r.top - 80), behavior: "auto" });
    }
    const t1 = window.setTimeout(place, 60), t2 = window.setTimeout(place, 400);
    window.addEventListener("resize", place);
    return () => { window.clearTimeout(t1); window.clearTimeout(t2); window.removeEventListener("resize", place); };
  }, [stop]);
  useEffect(() => { const h = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); }; window.addEventListener("keydown", h); return () => window.removeEventListener("keydown", h); }, [onClose]);
  if (!stop) return null;
  const last = i === live.length - 1;
  const pad = 8;
  const H = 190;
  const vh = typeof window !== "undefined" ? window.innerHeight : 800;
  const vw = typeof window !== "undefined" ? window.innerWidth : 400;
  const below = box ? box.bottom + 16 + H < vh : true;
  const above = box ? box.top - 16 - H > 0 : false;
  const top = !box ? vh * 0.4 : below ? box.bottom + 16 : above ? box.top - 16 - H : Math.max(16, vh - H - 16);
  const left = !box ? Math.max(16, vw / 2 - 170) : Math.min(Math.max(16, box.left), vw - 356);
  return createPortal(
    <div className="tr" role="dialog" aria-label="A quick look around this screen">
      {box && <div className="tr-hole" style={{ top: Math.max(4, box.top - pad), left: box.left - pad, width: box.width + pad * 2, height: Math.min(box.height + pad * 2, vh - Math.max(4, box.top - pad) - 4) }} />}
      <div className="tr-card" style={{ top, left }} key={i}>
        <div className="tr-n">{i + 1} of {live.length}</div>
        <h2>{stop.title}</h2>
        <p>{stop.line}</p>
        <div className="tr-keys">
          <button type="button" className="ls-chip" onClick={onClose}>{last ? "close" : "skip"}</button>
          <div style={{ flex: 1, height: 52 }}><GoPill onClick={() => (last ? onClose() : setI(i + 1))} style={{ height: 52, width: "100%" }}>{last ? "got it" : "next"}</GoPill></div>
        </div>
      </div>
    </div>,
    document.body,
  );
}

/** One stop, shown once, when a lesson has just put a new control on a screen ("new: decay"). */
export function NewControl({ sel, title, line, id }: { sel: string; title: string; line: string; id: string }) {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    let seen = true;
    try { seen = !!localStorage.getItem(`ccd.new.${id}`); } catch { /* no storage */ }
    if (!seen) { const t = window.setTimeout(() => setOpen(true), 900); return () => window.clearTimeout(t); }
  }, [id]);
  if (!open) return null;
  return <Tour stops={[{ sel, title, line }]} onClose={() => { setOpen(false); try { localStorage.setItem(`ccd.new.${id}`, "1"); } catch { /* ignore */ } }} />;
}
