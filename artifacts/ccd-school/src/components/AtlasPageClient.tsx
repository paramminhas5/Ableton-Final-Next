"use client";
import { useEffect, useMemo, useState } from "react";
import { ATLAS, ATLAS_GROUPS, type AtlasGroup } from "@/content/atlas";

export function AtlasPageClient({ lessons = {} }: { lessons?: Record<string, { slug: string; title: string }[]> }) {
  const [q, setQ] = useState("");
  const [group, setGroup] = useState<AtlasGroup | "all">("all");
  const [hash, setHash] = useState("");

  useEffect(() => {
    const read = () => {
      const h = window.location.hash.slice(1);
      setHash(h);
      if (h) {
        // a link to one device must show it, whatever filter was active
        setQ("");
        setGroup("all");
      }
    };
    read();
    window.addEventListener("hashchange", read);
    return () => window.removeEventListener("hashchange", read);
  }, []);
  useEffect(() => {
    if (hash) document.getElementById(hash)?.scrollIntoView({ block: "center" });
  }, [hash]);

  const list = useMemo(() => {
    const t = q.trim().toLowerCase();
    return ATLAS.filter(
      (d) =>
        (group === "all" || d.group === group) &&
        (!t || `${d.name} ${d.does} ${d.reach}`.toLowerCase().includes(t)),
    );
  }, [q, group]);

  return (
    <main className="min-h-screen bg-bone">
      <div className="mx-auto w-full max-w-3xl px-4 py-8 space-y-6">
        <header>
          <div className="font-mono text-[10px] uppercase opacity-40 mb-1">// DEVICE ATLAS</div>
          <h1 className="font-display text-4xl leading-none">WHAT EVERY DEVICE DOES.</h1>
          <p className="font-mono text-xs opacity-60 mt-3">
            {ATLAS.length} of Live&apos;s own devices: what it is, the job it is best at, and one tip. Want to hear them? The{" "}
            <a className="underline" href="/devices">Device Lab</a> lets you turn the knobs.
          </p>
        </header>

        <div className="space-y-3">
          <label className="block">
            <span className="sr-only">Search devices</span>
            <input
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search: reverb, bass, glitch..."
              className="w-full brutal-border bg-white px-3 py-2 font-mono text-sm"
            />
          </label>
          <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by group">
            {[{ id: "all" as const, label: "All" }, ...ATLAS_GROUPS].map((g) => (
              <button
                key={g.id}
                type="button"
                aria-pressed={group === g.id}
                onClick={() => setGroup(g.id)}
                className={`brutal-border px-3 py-1 font-mono text-xs ${group === g.id ? "bg-ink text-bone" : "bg-white"}`}
              >
                {g.label}
              </button>
            ))}
          </div>
          {group !== "all" && (
            <p className="font-mono text-xs opacity-60">{ATLAS_GROUPS.find((g) => g.id === group)?.blurb}</p>
          )}
        </div>

        <p className="font-mono text-xs opacity-50" aria-live="polite">{list.length} devices</p>
        <ul className="space-y-3">
          {list.map((d) => (
            <li
              key={d.id}
              id={d.id}
              className={`brutal-border p-4 scroll-mt-24 ${hash === d.id ? "bg-acid" : "bg-white"}`}
            >
              <div className="flex items-baseline justify-between gap-3">
                <h2 className="font-display text-2xl leading-none">{d.name}</h2>
                <span className="font-mono text-[10px] uppercase opacity-50">
                  {ATLAS_GROUPS.find((g) => g.id === d.group)?.label}
                </span>
              </div>
              <p className="font-mono text-sm mt-2">{d.does}</p>
              <p className="font-mono text-xs mt-2"><b>Reach for it:</b> {d.reach}</p>
              <p className="font-mono text-xs mt-1 opacity-70"><b>Tip:</b> {d.tip}</p>
              {lessons[d.id]?.length ? (
                <p className="font-mono text-xs mt-2">
                  <b>Learn it:</b>{" "}
                  {lessons[d.id].map((l, i) => (
                    <span key={l.slug}>
                      {i > 0 && ", "}
                      <a className="underline" href={`/learn/${l.slug}`}>{l.title}</a>
                    </span>
                  ))}
                </p>
              ) : null}
            </li>
          ))}
        </ul>
        {list.length === 0 && <p className="font-mono text-sm">Nothing matches. Try another word.</p>}
      </div>
    </main>
  );
}
