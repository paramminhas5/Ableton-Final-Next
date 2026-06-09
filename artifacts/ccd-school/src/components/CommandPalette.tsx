"use client";
import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { MISSIONS } from "@/content/missions";
import { FOUNDATIONS_MISSIONS } from "@/content/missions-foundations";
import { DJ_WORLD_MISSIONS } from "@/content/missions-dj";
import { DEVICES } from "@/content/devices";
import { PATHS } from "@/content/paths";

type Item = {
  id: string;
  label: string;
  sub: string;
  tag: "MISSION" | "PATH" | "DEVICE" | "PAGE";
  emoji: string;
  go: () => void;
};

export const PALETTE_OPEN_EVENT = "command-palette:open";

// Tag style map
const TAG_STYLES: Record<Item["tag"], string> = {
  MISSION: "bg-acid text-ink",
  PATH:    "bg-electric-blue text-bone",
  DEVICE:  "bg-volt text-ink",
  PAGE:    "bg-bone text-ink border border-ink/20",
};

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [activeIdx, setActiveIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // ── Open/close ──────────────────────────────────────────────────────
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen(o => !o);
      } else if (e.key === "Escape") {
        setOpen(false);
      }
    };
    const onEvent = () => setOpen(true);
    window.addEventListener("keydown", onKey);
    window.addEventListener(PALETTE_OPEN_EVENT, onEvent);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener(PALETTE_OPEN_EVENT, onEvent);
    };
  }, []);

  useEffect(() => {
    if (open) {
      setQ("");
      setActiveIdx(0);
      const t = setTimeout(() => inputRef.current?.focus(), 80);
      return () => clearTimeout(t);
    }
  }, [open]);

  // Reset active index on query change
  useEffect(() => { setActiveIdx(0); }, [q]);

  const close = useCallback(() => setOpen(false), []);

  // ── Build full item list ─────────────────────────────────────────────
  const allItems: Item[] = useMemo(() => {
    const out: Item[] = [];

    // All missions — foundations + DJ + producer
    const ALL_MISSIONS = [...FOUNDATIONS_MISSIONS, ...DJ_WORLD_MISSIONS, ...MISSIONS];
    const WORLD_EMOJI: Record<string, string> = {
      foundations: "🎵", "first-contact": "🎛", "two-views": "🎛",
      "midi-audio": "🎛", devices: "🎛", mixing: "🎛", performance: "🎛",
      "midi-instruments": "🎛", "live12-power": "🎛", dj: "🎧",
    };
    ALL_MISSIONS.forEach(m => {
      out.push({
        id: `m-${m.slug}`,
        label: m.title,
        sub: m.tagline ?? "",
        tag: "MISSION",
        emoji: WORLD_EMOJI[m.world] ?? "📖",
        go: () => router.push(`/mission/${m.slug}`),
      });
    });

    // Paths
    PATHS.forEach(p => out.push({
      id: `p-${p.slug}`,
      label: p.title,
      sub: p.tagline,
      tag: "PATH",
      emoji: "📚",
      go: () => router.push(`/path/${p.slug}`),
    }));

    // Devices
    (DEVICES as { slug: string; name?: string; title?: string; tagline?: string; category?: string }[]).forEach(d => out.push({
      id: `d-${d.slug}`,
      label: d.name ?? d.title ?? d.slug,
      sub: d.tagline ?? d.category ?? "",
      tag: "DEVICE",
      emoji: "🔌",
      go: () => router.push(`/device/${d.slug}`),
    }));

    // Pages
    [
      { to: "/worlds",      label: "Worlds",           sub: "Pick your learning world",        emoji: "🌍" },
      { to: "/learn",       label: "Paths",            sub: "All learning paths",              emoji: "📚" },
      { to: "/missions",    label: "All Missions",     sub: "Browse 153 missions",             emoji: "🎯" },
      { to: "/glossary",    label: "Glossary",         sub: "200+ music production terms",     emoji: "📖" },
      { to: "/shortcuts",   label: "Shortcuts",        sub: "Ableton Live keyboard shortcuts", emoji: "⌨️" },
      { to: "/devices",     label: "Device Dictionary",sub: "Every Ableton device explained",  emoji: "🔌" },
      { to: "/signal-flow", label: "Signal Flow",      sub: "Animated routing diagram",        emoji: "🔊" },
      { to: "/review",      label: "Review Session",   sub: "Spaced repetition queue",         emoji: "🔁" },
      { to: "/train",       label: "Ear Training",     sub: "Interval & chord drills",         emoji: "👂" },
      { to: "/challenge",   label: "Daily Challenge",  sub: "Today's timed quiz",              emoji: "⚡" },
      { to: "/leaderboard", label: "Leaderboard",      sub: "Weekly XP rankings",              emoji: "🏆" },
      { to: "/profile",     label: "Profile",          sub: "XP, badges and rank",             emoji: "👤" },
    ].forEach(p => out.push({
      id: `r-${p.to}`,
      label: p.label,
      sub: p.sub,
      tag: "PAGE",
      emoji: p.emoji,
      go: () => router.push(p.to),
    }));

    return out;
  }, [router]);

  // ── Filter ────────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    if (!q.trim()) {
      // Show a useful default: pages first, then some missions
      return [
        ...allItems.filter(i => i.tag === "PAGE"),
        ...allItems.filter(i => i.tag === "PATH").slice(0, 5),
        ...allItems.filter(i => i.tag === "MISSION").slice(0, 10),
      ].slice(0, 30);
    }
    const needle = q.toLowerCase().trim();
    const scored = allItems
      .map(item => {
        const labelMatch = item.label.toLowerCase().includes(needle);
        const subMatch = item.sub.toLowerCase().includes(needle);
        const exactStart = item.label.toLowerCase().startsWith(needle);
        const score = exactStart ? 3 : labelMatch ? 2 : subMatch ? 1 : 0;
        return { item, score };
      })
      .filter(x => x.score > 0)
      .sort((a, b) => b.score - a.score)
      .map(x => x.item)
      .slice(0, 40);
    return scored;
  }, [allItems, q]);

  // ── Group filtered results ────────────────────────────────────────────
  const grouped = useMemo(() => {
    const groups: { tag: Item["tag"]; items: Item[] }[] = [];
    const seen = new Set<Item["tag"]>();
    const order: Item["tag"][] = ["PAGE", "MISSION", "PATH", "DEVICE"];
    order.forEach(tag => {
      const tagItems = filtered.filter(i => i.tag === tag);
      if (tagItems.length > 0) {
        groups.push({ tag, items: tagItems });
        seen.add(tag);
      }
    });
    return groups;
  }, [filtered]);

  // ── Keyboard navigation ───────────────────────────────────────────────
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIdx(i => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIdx(i => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && filtered[activeIdx]) {
      close();
      filtered[activeIdx].go();
    }
  }, [filtered, activeIdx, close]);

  // Scroll active item into view
  useEffect(() => {
    const el = listRef.current?.querySelector(`[data-idx="${activeIdx}"]`);
    el?.scrollIntoView({ block: "nearest" });
  }, [activeIdx]);

  if (!open) return null;

  // Flat index for keyboard navigation
  let flatIdx = 0;

  return (
    <div
      className="fixed inset-0 z-[100] bg-ink/70 flex items-start justify-center"
      style={{ paddingTop: "max(env(safe-area-inset-top), 0px)" }}
      onClick={close}
    >
      <div
        className="w-full md:max-w-2xl md:mt-16 brutal-border bg-bone brutal-shadow-lg flex flex-col"
        style={{ maxHeight: "calc(100vh - env(safe-area-inset-top) - 48px)", borderTopLeftRadius: 0, borderTopRightRadius: 0 }}
        onClick={e => e.stopPropagation()}
      >
        {/* ── Search input ─────────────────────────────────────────────── */}
        <div className="flex items-center border-b-4 border-ink bg-bone">
          {/* Search icon */}
          <div className="px-4 opacity-50">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
              <circle cx="7.5" cy="7.5" r="5" />
              <line x1="11.5" y1="11.5" x2="16" y2="16" />
            </svg>
          </div>
          <input
            ref={inputRef}
            value={q}
            onChange={e => setQ(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search lessons, paths, devices, pages…"
            inputMode="search"
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
            className="flex-1 bg-transparent py-4 font-mono text-base outline-none placeholder:opacity-40"
          />
          {q && (
            <button
              onClick={() => { setQ(""); inputRef.current?.focus(); }}
              className="px-3 py-2 font-mono text-xs opacity-50 hover:opacity-100 transition-opacity"
              aria-label="Clear search"
            >
              ✕
            </button>
          )}
          <button
            onClick={close}
            className="px-4 py-4 font-mono text-xs uppercase opacity-40 hover:opacity-80 transition-opacity border-l-4 border-ink"
            aria-label="Close search"
          >
            ESC
          </button>
        </div>

        {/* ── Results ──────────────────────────────────────────────────── */}
        <div ref={listRef} className="overflow-y-auto flex-1">
          {filtered.length === 0 && (
            <div className="p-8 text-center">
              <div className="text-4xl mb-3">🐱</div>
              <div className="font-display text-lg mb-1">No results for &ldquo;{q}&rdquo;</div>
              <div className="font-mono text-xs opacity-50">Try a lesson title, path name or device</div>
            </div>
          )}

          {grouped.map(({ tag, items }) => (
            <div key={tag}>
              {/* Group header */}
              <div className="px-4 py-1.5 font-mono text-[10px] uppercase opacity-40 bg-ink/5 border-b border-ink/10 sticky top-0">
                {tag === "MISSION" ? "Lessons" : tag === "PATH" ? "Paths" : tag === "DEVICE" ? "Devices" : "Pages"}
              </div>

              {items.map(item => {
                const idx = flatIdx++;
                const isActive = idx === activeIdx;
                return (
                  <button
                    key={item.id}
                    data-idx={idx}
                    onClick={() => { close(); item.go(); }}
                    onMouseEnter={() => setActiveIdx(idx)}
                    className={`w-full text-left px-4 py-3 flex items-center gap-3 border-b border-ink/10 transition-colors ${
                      isActive ? "bg-acid text-ink" : "hover:bg-acid/20"
                    }`}
                  >
                    {/* Emoji */}
                    <span className="text-xl shrink-0 w-7 text-center">{item.emoji}</span>

                    {/* Label + sub */}
                    <div className="flex-1 min-w-0">
                      <div className="font-display text-sm leading-tight truncate">{item.label}</div>
                      {item.sub && (
                        <div className="font-mono text-[10px] opacity-60 truncate mt-0.5">{item.sub}</div>
                      )}
                    </div>

                    {/* Tag badge */}
                    <span className={`font-mono text-[9px] uppercase px-2 py-0.5 shrink-0 rounded-sm ${TAG_STYLES[item.tag]}`}>
                      {item.tag}
                    </span>
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {/* ── Footer hints ─────────────────────────────────────────────── */}
        <div className="px-4 py-2.5 border-t-4 border-ink flex items-center justify-between">
          <div className="font-mono text-[10px] uppercase opacity-40 flex items-center gap-3">
            <span>↑↓ navigate</span>
            <span>↵ open</span>
            <span>esc close</span>
          </div>
          <div className="font-mono text-[10px] uppercase opacity-30">
            {filtered.length} result{filtered.length !== 1 ? "s" : ""}
          </div>
        </div>
      </div>
    </div>
  );
}
