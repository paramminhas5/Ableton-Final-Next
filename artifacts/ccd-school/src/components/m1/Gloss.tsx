"use client";
/** Text with glossary links: the first time a known word appears it links to its glossary entry. */
import { Fragment, useMemo } from "react";
import { lookupTerm, slugTerm } from "@/content/glossary";
import { glossParts } from "@/lib/gloss";
import { elsewhereLine } from "@/lib/controlNames";

/** The tooltip: the definition, and for a control what other instruments call it. */
const tip = (term: string) => {
  const t = lookupTerm(term);
  if (!t) return undefined;
  const e = t.ctl ? elsewhereLine(t.ctl, 4) : null;
  return e ? `${t.def} Elsewhere: ${e}.` : t.def;
};

export function Gloss({ children }: { children: string }) {
  const parts = useMemo(() => glossParts(children), [children]);
  return (
    <>
      {parts.map((p, i) => p.term ? (
        <a key={i} className="ls-gl" href={`/glossary#${slugTerm(p.term)}`} target="_blank" rel="noopener" title={tip(p.term)}>{p.text}</a>
      ) : <Fragment key={i}>{p.text}</Fragment>)}
    </>
  );
}
