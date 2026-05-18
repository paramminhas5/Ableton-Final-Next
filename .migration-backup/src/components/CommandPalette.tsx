import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { MISSIONS } from "@/content/missions";
import { WORLDS } from "@/content/worlds";
import { DEVICES } from "@/content/devices";
import { PATHS } from "@/content/paths";

type Item = { id: string; label: string; sub: string; tag: string; go: () => void };

// Exposed globally so the mobile header button can open the palette
// without prop-drilling. Fire: window.dispatchEvent(new Event('command-palette:open'))
export const PALETTE_OPEN_EVENT = "command-palette:open";

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const nav = useNavigate();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
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

  // Focus input after open — delayed so iOS keyboard pops reliably
  useEffect(() => {
    if (open) {
      setQ("");
      const t = setTimeout(() => inputRef.current?.focus(), 80);
      return () => clearTimeout(t);
    }
  }, [open]);

  const items: Item[] = useMemo(() => {
    const out: Item[] = [];
    MISSIONS.forEach((m) =>
      out.push({
        id: `m-${m.slug}`,
        label: `#${m.number} ${m.title}`,
        sub: m.tagline ?? "",
        tag: "MISSION",
        go: () => nav({ to: "/mission/$slug", params: { slug: m.slug } }),
      }),
    );
    WORLDS.forEach((w) =>
      out.push({
        id: `w-${w.slug}`,
        label: `World ${w.number} · ${w.title}`,
        sub: w.tagline,
        tag: "WORLD",
        go: () => nav({ to: "/world/$slug", params: { slug: w.slug } }),
      }),
    );
    DEVICES.forEach((d: any) =>
      out.push({
        id: `d-${d.slug}`,
        label: d.name ?? d.title ?? d.slug,
        sub: d.tagline ?? d.category ?? "",
        tag: "DEVICE",
        go: () => nav({ to: "/device/$slug", params: { slug: d.slug } }),
      }),
    );
    PATHS.forEach((p) =>
      out.push({
        id: `p-${p.slug}`,
        label: p.title,
        sub: p.tagline,
        tag: "PATH",
        go: () => nav({ to: "/path/$slug", params: { slug: p.slug } }),
      }),
    );
    [
      { to: "/train", label: "Ear Training", sub: "7 drills with cloud scores" },
      { to: "/match", label: "Mix Match", sub: "Match a target with sliders" },
      { to: "/glossary", label: "Glossary", sub: "210+ terms" },
      { to: "/shortcuts", label: "Shortcuts Trainer", sub: "Drill key bindings" },
      { to: "/signal-flow", label: "Signal Flow", sub: "Animated routing diagram" },
      { to: "/playground", label: "Workbench", sub: "Free-form sandbox" },
      { to: "/profile", label: "Profile", sub: "XP, badges, rank" },
      { to: "/paths", label: "Learning Paths", sub: "Curated sequences" },
      { to: "/leaderboard", label: "Leaderboard", sub: "Weekly XP rankings" },
    ].forEach((p) =>
      out.push({
        id: `r-${p.to}`,
        label: p.label,
        sub: p.sub,
        tag: "PAGE",
        go: () => nav({ to: p.to as any }),
      }),
    );
    return out;
  }, [nav]);

  const filtered = useMemo(() => {
    if (!q.trim()) return items.slice(0, 30);
    const needle = q.toLowerCase();
    return items
      .filter(
        (i) =>
          i.label.toLowerCase().includes(needle) ||
          i.sub.toLowerCase().includes(needle) ||
          i.tag.toLowerCase().includes(needle),
      )
      .slice(0, 50);
  }, [items, q]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] bg-ink/60 flex items-start justify-center p-4 md:p-20"
      onClick={() => setOpen(false)}
    >
      <div
        className="brutal-border bg-bone w-full max-w-2xl brutal-shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center">
          <span className="px-3 font-mono text-xs uppercase opacity-50">Search</span>
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="missions, devices, paths…"
            inputMode="search"
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
            className="flex-1 bg-acid brutal-border border-x-0 border-y-0 px-3 py-3 font-mono text-sm outline-none"
            onKeyDown={(e) => {
              if (e.key === "Enter" && filtered[0]) {
                setOpen(false);
                filtered[0].go();
              }
            }}
          />
          <button
            onClick={() => setOpen(false)}
            className="px-3 py-3 font-mono text-xs opacity-50 hover:opacity-100"
            aria-label="Close search"
          >
            ESC
          </button>
        </div>
        <div className="max-h-[60vh] overflow-y-auto">
          {filtered.length === 0 && (
            <div className="p-4 font-mono text-sm opacity-60">No matches.</div>
          )}
          {filtered.map((i) => (
            <button
              key={i.id}
              onClick={() => {
                setOpen(false);
                i.go();
              }}
              className="w-full text-left px-4 py-2 brutal-border border-x-0 border-t-0 hover:bg-acid flex items-center gap-3"
            >
              <span className="font-mono text-[10px] uppercase brutal-border bg-bone px-2 py-1 w-20 text-center shrink-0">
                {i.tag}
              </span>
              <span className="font-display text-base flex-1 truncate">{i.label}</span>
              <span className="font-mono text-xs opacity-70 truncate hidden md:block">{i.sub}</span>
            </button>
          ))}
        </div>
        <div className="px-4 py-2 font-mono text-[10px] uppercase opacity-40 border-t border-current/10">
          ↵ to open first result · ⌘K to toggle · tap outside to close
        </div>
      </div>
    </div>
  );
}
