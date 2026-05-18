// Inline glossary term: dotted underline + hover/tap popover with definition.
// Pure, hydration-safe dedup model:
//   1. Mission page collects every text it will render into a string[].
//   2. <GlossaryScope texts={...}> builds an allow-map (text -> Set<term>)
//      once per slug. First occurrence of each term wins; later instances
//      of the same term get a plain string (no wrapper).
//   3. <Glossarized text /> looks up its allow set and wraps only those
//      terms. Idempotent — re-renders never change output.
import { createContext, useContext, useMemo } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Link } from "@tanstack/react-router";
import {
  lookupTerm,
  slugTerm,
  AUTO_WRAP_KEYS,
  type GlossaryTerm,
} from "@/content/glossary";

// --- Single term wrapper ---------------------------------------------------
export function Term({
  children,
  term,
}: {
  children: React.ReactNode;
  term?: string;
}) {
  const key = term ?? (typeof children === "string" ? children : "");
  const found: GlossaryTerm | undefined = lookupTerm(key);
  if (!found) return <>{children}</>;
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="underline decoration-dotted decoration-2 underline-offset-2 cursor-help bg-acid/30 hover:bg-acid/60 px-0.5 rounded-sm font-semibold transition-colors"
        >
          {children}
        </button>
      </PopoverTrigger>
      <PopoverContent
        side="top"
        align="start"
        className="w-72 brutal-border bg-card p-3 font-mono text-xs space-y-2"
      >
        <div className="flex items-baseline justify-between gap-2">
          <div className="font-display text-base">{found.term}</div>
          <span className="brutal-border bg-volt text-bone px-1.5 py-0.5 text-[9px] uppercase">
            {found.cat}
          </span>
        </div>
        <div className="leading-relaxed">{found.def}</div>
        <Link
          to="/glossary"
          hash={slugTerm(found.term)}
          className="brutal-border bg-acid text-ink px-2 py-1 text-[10px] uppercase brutal-press inline-block"
        >
          → Open in glossary
        </Link>
      </PopoverContent>
    </Popover>
  );
}

// --- Regex source (cached) -------------------------------------------------
const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
let CACHED_SRC: string | null = null;
function getReSrc() {
  if (CACHED_SRC) return CACHED_SRC;
  CACHED_SRC = AUTO_WRAP_KEYS.map(escapeRe).join("|");
  return CACHED_SRC;
}
const makeRe = () => new RegExp(`\\b(${getReSrc()})\\b`, "gi");

// --- Scope context: precomputed allow map ----------------------------------
type AllowMap = Map<string, Set<string>>;
const ScopeCtx = createContext<AllowMap | null>(null);

function buildAllowMap(texts: string[]): AllowMap {
  const map: AllowMap = new Map();
  const globalSeen = new Set<string>();
  for (const t of texts) {
    if (!t || map.has(t)) continue; // duplicate text → no wraps (handled below)
    const allowed = new Set<string>();
    const re = makeRe();
    let m: RegExpExecArray | null;
    while ((m = re.exec(t)) !== null) {
      const lower = m[0].toLowerCase();
      if (!globalSeen.has(lower)) {
        globalSeen.add(lower);
        allowed.add(lower);
      }
    }
    map.set(t, allowed);
  }
  return map;
}

export function GlossaryScope({
  children,
  resetKey,
  texts,
}: {
  children: React.ReactNode;
  resetKey?: string;
  texts: string[];
}) {
  const map = useMemo(
    () => buildAllowMap(texts),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [resetKey, texts.length],
  );
  return <ScopeCtx.Provider value={map}>{children}</ScopeCtx.Provider>;
}

// --- Per-text wrapper ------------------------------------------------------
export function Glossarized({ text }: { text: string }) {
  const map = useContext(ScopeCtx);
  if (!text) return null;

  // No scope → wrap every term (fallback for routes that don't set up scope).
  const allowed = map?.get(text);
  if (!map) {
    return <>{wrapAll(text, null)}</>;
  }
  return <>{wrapAll(text, allowed ?? new Set())}</>;
}

function wrapAll(text: string, allowed: Set<string> | null): React.ReactNode[] {
  const out: React.ReactNode[] = [];
  const re = makeRe();
  let last = 0;
  let m: RegExpExecArray | null;
  let key = 0;
  while ((m = re.exec(text)) !== null) {
    const lower = m[0].toLowerCase();
    const should = allowed === null ? true : allowed.has(lower);
    if (!should) continue;
    if (m.index > last) out.push(text.slice(last, m.index));
    out.push(
      <Term key={`t${key++}`} term={lower}>
        {m[0]}
      </Term>,
    );
    last = m.index + m[0].length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}
