"use client";
/**
 * Text with the built-in dictionary (10 Nov): the first time a known word appears in a passage it's marked.
 * Hover it on a laptop, or tap or press and hold it on a phone or iPad, and its meaning opens right there,
 * with what other instruments call it, a link to the full entry and, for the big ones, the lesson that teaches it.
 */
import { Fragment, useEffect, useId, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { lookupTerm, slugTerm } from "@/content/glossary";
import { glossParts } from "@/lib/gloss";
import { elsewhereLine } from "@/lib/controlNames";

const OPEN = "ccd:gloss-open";
const SEEN = "ccd.gloss.seen";

function Term({ term, text }: { term: string; text: string }) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const [up, setUp] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);
  const hover = useRef(0);
  const t = lookupTerm(term);
  useEffect(() => {
    const other = (e: Event) => { if ((e as CustomEvent).detail !== id) setOpen(false); };
    window.addEventListener(OPEN, other);
    return () => window.removeEventListener(OPEN, other);
  }, [id]);
  useEffect(() => {
    if (!open) return;
    try { localStorage.setItem(SEEN, "1"); } catch { /* no storage */ }
    const r = ref.current?.getBoundingClientRect();
    setUp(!!r && r.bottom > window.innerHeight - 220);
    const away = (e: PointerEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false); };
    const esc = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("pointerdown", away);
    document.addEventListener("keydown", esc);
    return () => { document.removeEventListener("pointerdown", away); document.removeEventListener("keydown", esc); };
  }, [open]);
  if (!t) return <>{text}</>;
  const show = () => { window.dispatchEvent(new CustomEvent(OPEN, { detail: id })); setOpen(true); };
  const fine = () => typeof window !== "undefined" && window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  const e = t.ctl ? elsewhereLine(t.ctl, 4) : null;
  return (
    <span ref={ref} className="ls-glw"
      onPointerEnter={() => { if (!fine()) return; window.clearTimeout(hover.current); hover.current = window.setTimeout(show, 140); }}
      onPointerLeave={() => { if (!fine()) return; window.clearTimeout(hover.current); hover.current = window.setTimeout(() => setOpen(false), 220); }}>
      <button type="button" className="ls-gl" aria-expanded={open} aria-controls={id} onClick={ev => { ev.preventDefault(); ev.stopPropagation(); if (open) setOpen(false); else show(); }}
        onContextMenu={ev => ev.preventDefault()}>{text}</button>
      {open ? (
        <span id={id} role="tooltip" className={`ls-glpop ${up ? "is-up" : ""}`}>
          <b>{t.term.split(/\s*\/\s*/)[0]}</b>
          <span>{t.def}</span>
          {e ? <span className="ls-glelse">elsewhere: {e}</span> : null}
          <Link href={`/glossary#${slugTerm(t.term)}`} className="ls-glmore">full entry in the dictionary</Link>
        </span>
      ) : null}
    </span>
  );
}

export function Gloss({ children }: { children: string }) {
  const parts = useMemo(() => glossParts(children), [children]);
  return (
    <>
      {parts.map((p, i) => p.term ? <Term key={i} term={p.term} text={p.text} /> : <Fragment key={i}>{p.text}</Fragment>)}
    </>
  );
}

/** Once, the first time marked words appear: say the dictionary is built in and how to open it. */
export function GlossTip() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    let seen = false;
    try { seen = localStorage.getItem(SEEN) === "1"; } catch { /* no storage */ }
    if (seen) return;
    const id = window.setTimeout(() => setShow(!!document.querySelector(".ls-gl")), 400);
    return () => window.clearTimeout(id);
  }, []);
  if (!show) return null;
  const close = () => { try { localStorage.setItem(SEEN, "1"); } catch { /* none */ } setShow(false); };
  return (
    <div className="ls-gltip" role="note">
      <span className="ls-gltipword">word</span>
      <span>Underlined words are in the built-in dictionary. <b>Hover one</b> on a laptop, or <b>tap it</b> on a phone or iPad, to see what it means.</span>
      <button type="button" className="ls-chip" onClick={close}>got it</button>
    </div>
  );
}
