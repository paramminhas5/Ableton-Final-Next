/* Which words in a text link to the glossary. Pure. */
import { AUTO_WRAP_KEYS, lookupTerm } from "../content/glossary";

// Short words the glossary filter drops but lessons need.
const SHORT = ["bar", "bpm"];
const KEYS = [...new Set([...AUTO_WRAP_KEYS, ...SHORT])].sort((a, b) => b.length - a.length);
const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const RE = new RegExp(`\\b(${KEYS.map(esc).join("|")})\\b`, "gi");

export function glossParts(text: string): { text: string; term?: string }[] {
  const seen = new Set<string>();
  const out: { text: string; term?: string }[] = [];
  let last = 0;
  for (const m of text.matchAll(RE)) {
    const t = lookupTerm(m[0]);
    if (!t || seen.has(t.term)) continue;
    seen.add(t.term);
    if (m.index! > last) out.push({ text: text.slice(last, m.index) });
    out.push({ text: m[0], term: t.term });
    last = m.index! + m[0].length;
  }
  if (last < text.length) out.push({ text: text.slice(last) });
  return out;
}

