"use client";
/** Text with glossary links: the first time a known word appears it links to its glossary entry. */
import { Fragment, useMemo } from "react";
import { lookupTerm, slugTerm } from "@/content/glossary";
import { glossParts } from "@/lib/gloss";

export function Gloss({ children }: { children: string }) {
  const parts = useMemo(() => glossParts(children), [children]);
  return (
    <>
      {parts.map((p, i) => p.term ? (
        <a key={i} className="ls-gl" href={`/glossary#${slugTerm(p.term)}`} target="_blank" rel="noopener" title={lookupTerm(p.term)?.def}>{p.text}</a>
      ) : <Fragment key={i}>{p.text}</Fragment>)}
    </>
  );
}
