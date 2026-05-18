import { useState, useEffect } from "react";
import { THEMES, DEFAULT_THEME, type ThemeId } from "@/content/themes";

const KEY = "ccd.theme";

function applyTheme(id: ThemeId) {
  if (typeof document === "undefined") return;
  document.documentElement.setAttribute("data-theme", id);
  if (typeof localStorage !== "undefined") localStorage.setItem(KEY, id);
  window.dispatchEvent(new CustomEvent("theme:change", { detail: id }));
}

function useTheme() {
  const [current, setCurrent] = useState<ThemeId>(DEFAULT_THEME);
  useEffect(() => {
    const saved = (typeof localStorage !== "undefined" && (localStorage.getItem(KEY) as ThemeId)) || DEFAULT_THEME;
    setCurrent(saved);
    document.documentElement.setAttribute("data-theme", saved);
    const h = (e: Event) => setCurrent((e as CustomEvent<ThemeId>).detail);
    window.addEventListener("theme:change", h);
    return () => window.removeEventListener("theme:change", h);
  }, []);
  return { current, set: (id: ThemeId) => { applyTheme(id); setCurrent(id); } };
}

function Swatch({ colors, size = 3 }: { colors: string[]; size?: number }) {
  return (
    <span className="flex gap-0.5">
      {colors.map((c, i) => (
        <span
          key={i}
          className="brutal-border"
          style={{ background: c, borderWidth: 1, width: `${size * 4}px`, height: `${size * 4}px` }}
        />
      ))}
    </span>
  );
}

export function ThemeSwitcher({ compact = false }: { compact?: boolean }) {
  const { current, set } = useTheme();
  const [open, setOpen] = useState(false);
  const currentTheme = THEMES.find((t) => t.id === current) ?? THEMES[0];

  if (compact) {
    return (
      <div className="relative">
        <button
          onClick={() => setOpen((v) => !v)}
          className="brutal-border bg-bone px-2 py-1.5 hover:bg-sun flex items-center gap-1.5 font-mono text-[10px] uppercase brutal-press"
          title={`Theme: ${currentTheme.name}`}
          aria-label="Switch theme"
          aria-expanded={open}
        >
          <Swatch colors={currentTheme.swatch} size={2} />
          <span className="hidden lg:inline">{currentTheme.name}</span>
          <span className="opacity-60">▾</span>
        </button>
        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <div className="absolute right-0 top-full mt-1 brutal-border bg-bone z-50 min-w-[220px] max-h-[60vh] overflow-y-auto brutal-shadow-sm">
              <div className="font-mono text-[9px] uppercase opacity-50 px-3 pt-2 pb-1">Theme</div>
              {THEMES.map((t) => (
                <button
                  key={t.id}
                  onClick={() => { set(t.id); setOpen(false); }}
                  className={`w-full px-3 py-2 flex items-center gap-2 font-mono text-[10px] uppercase brutal-border border-x-0 border-t-0 hover:bg-sun text-left ${t.id === current ? "bg-acid" : ""}`}
                >
                  <Swatch colors={t.swatch} size={3} />
                  <span className="flex-1">{t.name}</span>
                  {t.id === current && <span>✓</span>}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    );
  }

  // Full grid (Profile page)
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
      {THEMES.map((t) => (
        <button
          key={t.id}
          onClick={() => set(t.id)}
          className={`brutal-border p-3 text-left brutal-press transition-all ${t.id === current ? "bg-acid" : "bg-bone hover:bg-sun/30"}`}
        >
          <div
            className="w-full h-10 brutal-border mb-2 flex"
            style={{ borderWidth: 2 }}
          >
            {t.swatch.map((c, i) => (
              <div key={i} className="flex-1 h-full" style={{ background: c }} />
            ))}
          </div>
          <div className="font-display text-sm">{t.name}</div>
          {t.id === current && <div className="font-mono text-[9px] mt-1">● ACTIVE</div>}
        </button>
      ))}
    </div>
  );
}
