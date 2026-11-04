"use client";
/**
 * The dashboard, pointed out once, straight after onboarding (/dashboard?tour=1): a spotlight moves
 * over each part with one line on what it does, and the last step opens lesson one.
 */
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { GoPill } from "./controls";
import { TOUR_KEY } from "./Welcome";
import { missionBySlug } from "@/content/missions";

const STOPS: { sel: string; title: string; line: string }[] = [
  { sel: ".td-left", title: "your next lesson", line: "always here. press play on it to start." },
  { sel: ".td-knobs", title: "turn to choose", line: "world, path and lesson. click a knob to step it, or drag it." },
  { sel: ".td-all", title: "every lesson, by path", line: "paths are the chapters of a world. tap any lesson to pick it." },
  { sel: ".td-switch", title: "lesson or your song", line: "flip to your track to hear the song your lessons are building." },
  { sel: ".m1-modebar", title: "the rest of ccd school", line: "practice for ear games and reviews, studio to build your song out, library for every word and sound." },
];

export function DashTour() {
  const params = useSearchParams();
  const router = useRouter();
  const [i, setI] = useState(0);
  const [box, setBox] = useState<DOMRect | null>(null);
  const [leaving, setLeaving] = useState<string | null>(null);
  const on = params.get("tour") === "1";
  const stop = STOPS[i];
  useEffect(() => {
    if (!on) return;
    const place = () => { const el = document.querySelector(stop.sel); setBox(el ? el.getBoundingClientRect() : null); };
    const el = document.querySelector(stop.sel);
    el?.scrollIntoView({ block: "nearest", behavior: "smooth" });
    const id = window.setTimeout(place, 250);
    window.addEventListener("resize", place);
    return () => { window.clearTimeout(id); window.removeEventListener("resize", place); };
  }, [on, stop]);
  if (!on) return null;
  const last = i === STOPS.length - 1;
  const end = () => {
    let first = "";
    try { first = sessionStorage.getItem(TOUR_KEY) ?? ""; sessionStorage.removeItem(TOUR_KEY); } catch { /* ignore */ }
    // The tour closes, then lesson one opens on its own screen.
    setLeaving(first ? (missionBySlug(first)?.title ?? "lesson one").toLowerCase() : "");
    window.setTimeout(() => router.replace(first ? `/learn/${first}` : "/dashboard"), 1100);
  };
  if (leaving !== null) return <div className="tr-go" role="status"><span>lesson one</span><b>{leaving}</b></div>;
  const pad = 8;
  const below = box ? box.bottom + 190 < window.innerHeight : true;
  return (
    <div className="tr" role="dialog" aria-label="A quick look around">
      {box && <div className="tr-hole" style={{ top: box.top - pad, left: box.left - pad, width: box.width + pad * 2, height: box.height + pad * 2 }} />}
      <div className="tr-card" style={box ? { top: below ? box.bottom + 16 : Math.max(16, box.top - 196), left: Math.min(Math.max(16, box.left), window.innerWidth - 356) } : { top: "40%", left: "50%", transform: "translateX(-50%)" }} key={i}>
        <div className="tr-n">{i + 1} of {STOPS.length}</div>
        <h2>{stop.title}</h2>
        <p>{stop.line}</p>
        <div className="tr-keys">
          <button type="button" className="ls-chip" onClick={() => router.replace("/dashboard")}>skip</button>
          <div style={{ flex: 1, height: 52 }}><GoPill onClick={() => (last ? end() : setI(i + 1))} style={{ height: 52, width: "100%" }}>{last ? "start lesson one" : "next"}</GoPill></div>
        </div>
      </div>
    </div>
  );
}
