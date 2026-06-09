"use client";

import { useState } from "react";
import { WorldSlug, getWorldTheme } from "./worldTheme";
import { chaptersByWorld } from "@/content/chapters";
import { pathsByWorld } from "@/content/paths";
import { useProgress } from "@/lib/progress";
import Link from "next/link";
import Image from "next/image";
import { getChapterEmoji } from "./worldTheme";

interface WorldShellProps {
  worldSlug: WorldSlug;
  children: React.ReactNode;
  currentView?: "world" | "wiki";
}

type ShellView = "world" | "wiki";

export function WorldShell({ worldSlug, children, currentView = "world" }: WorldShellProps) {
  const [activeView, setActiveView] = useState<ShellView>(currentView);
  const theme = getWorldTheme(worldSlug);
  const { progress } = useProgress();
  const completed = progress.completedMissions;
  
  const chapters = chaptersByWorld(worldSlug);
  const paths = pathsByWorld(worldSlug);
  
  // Calculate world progress
  const allSlugs = paths.flatMap(p => p.missionSlugs);
  const done = allSlugs.filter(s => !!completed[s]).length;
  const total = allSlugs.length;
  const worldPct = total > 0 ? Math.round((done / total) * 100) : 0;
  
  return (
    <div className={`min-h-screen ${theme.bg} ${theme.textPrimary}`}>
      
      {/* Hero Header */}
      <header className={`${theme.heroBg} ${theme.heroText} ${theme.heroBorder}`}>
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-start justify-between gap-4">
            
            {/* Left: Back link + Title */}
            <div className="flex-1 min-w-0">
              <Link href="/worlds" className={`font-mono text-[10px] uppercase opacity-50 hover:opacity-100 transition-opacity block mb-3 ${theme.heroText}`}>
                ← ALL WORLDS
              </Link>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-4xl md:text-5xl leading-none">{theme.emoji}</span>
                <div>
                  <h1 className="font-display text-4xl md:text-5xl leading-none">
                    {theme.title.toUpperCase()}
                  </h1>
                  <p className={`font-mono text-[10px] uppercase opacity-65 mt-1`}>
                    {theme.tagline}
                  </p>
                </div>
              </div>
              
              {/* Progress */}
              <div className="flex items-center gap-3 max-w-md">
                <div className={`flex-1 h-2.5 brutal-border overflow-hidden ${theme.barBg}`}>
                  <div
                    className={`h-full ${theme.barFill} transition-all duration-700`}
                    style={{ width: `${worldPct}%` }}
                  />
                </div>
                <div className={`font-mono text-xs opacity-60 shrink-0 tabular-nums`}>
                  {done}/{total} · {worldPct}%
                </div>
              </div>
            </div>
            
            {/* Right: Cat mascot */}
            <div className="shrink-0 flex flex-col items-center gap-2">
              <div
                className="w-16 h-16 md:w-20 md:h-20 wiggle"
                style={{ filter: "drop-shadow(3px 3px 0 rgba(0,0,0,0.2))" }}
                aria-hidden
              >
                <Image src={theme.catMain} alt="" width={80} height={80} className="w-full h-full object-contain" />
              </div>
            </div>
          </div>
          
          {/* View Toggle */}
          <div className="mt-5">
            <div className={`inline-flex brutal-border overflow-hidden ${theme.viewToggleBg}`}>
              <button
                onClick={() => setActiveView("world")}
                className={`px-4 py-2 font-display text-sm transition-colors ${
                  activeView === "world"
                    ? `${theme.viewToggleActive}`
                    : `${theme.viewToggleText} hover:opacity-80`
                }`}
              >
                World View
              </button>
              <button
                onClick={() => setActiveView("wiki")}
                className={`px-4 py-2 font-display text-sm transition-colors ${
                  activeView === "wiki"
                    ? `${theme.viewToggleActive}`
                    : `${theme.viewToggleText} hover:opacity-80`
                }`}
              >
                Wiki View
              </button>
            </div>
          </div>
        </div>
      </header>
      
      {/* Main Content with Sidebar */}
      <div className="max-w-6xl mx-auto flex">
        
        {/* Sidebar */}
        <aside className={`w-64 shrink-0 ${theme.sidebarBg} ${theme.sidebarBorder} hidden md:block`}>
          <div className="p-4">
            <div className="font-mono text-[9px] uppercase opacity-60 mb-3">
              CHAPTERS
            </div>
            
            <div className="space-y-1">
              {chapters.map((ch) => {
                const chPaths = paths.filter(p => p.chapter === ch.slug);
                const chSlugs = chPaths.flatMap(p => p.missionSlugs);
                const chDone = chSlugs.filter(s => !!completed[s]).length;
                const chTotal = chSlugs.length;
                const chPct = chTotal > 0 ? Math.round((chDone / chTotal) * 100) : 0;
                const complete = chDone === chTotal && chTotal > 0;
                const emoji = getChapterEmoji(ch.slug);
                
                return (
                  <Link
                    key={ch.slug}
                    href={`#chapter-${ch.slug}`}
                    className={`block brutal-border px-3 py-2 transition-colors ${
                      complete
                        ? theme.pillDone
                        : chPct > 0
                        ? theme.pillPartial
                        : `${theme.viewToggleBg} ${theme.viewToggleText}`
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-sm">
                        {complete ? "✓" : emoji}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="font-display text-xs leading-tight truncate">
                          {ch.title}
                        </div>
                        <div className="font-mono text-[8px] opacity-60 mt-0.5">
                          CH {String(ch.number).padStart(2, "0")} · {chPct}%
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
            
            {/* Stats */}
            <div className="mt-6 pt-4 border-t border-current/20">
              <div className="font-mono text-[9px] uppercase opacity-60 mb-2">
                WORLD STATS
              </div>
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className="font-mono text-[10px] opacity-70">Missions</span>
                  <span className="font-display text-sm">{done}/{total}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-mono text-[10px] opacity-70">Chapters</span>
                  <span className="font-display text-sm">{chapters.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-mono text-[10px] opacity-70">Paths</span>
                  <span className="font-display text-sm">{paths.length}</span>
                </div>
              </div>
            </div>
            
            {/* Mode Switcher */}
            <div className="mt-6 pt-4 border-t border-current/20">
              <div className="font-mono text-[9px] uppercase opacity-60 mb-2">
                LEARNING MODE
              </div>
              <div className="space-y-1.5">
                <Link
                  href={`/world/${worldSlug}`}
                  className={`block brutal-border px-3 py-2 text-center font-display text-sm transition-colors ${theme.flowBtn}`}
                >
                  🌊 Flow Mode
                </Link>
                <Link
                  href={`/world/${worldSlug}?view=free`}
                  className={`block brutal-border px-3 py-2 text-center font-display text-sm transition-colors ${theme.freeBtn}`}
                >
                  🔓 Free Mode
                </Link>
              </div>
            </div>
          </div>
        </aside>
        
        {/* Main Content Area */}
        <main className={`flex-1 ${theme.contentBg} min-h-[calc(100vh-200px)]`}>
          <div className="p-4 md:p-6">
            {/* View Header */}
            <div className="mb-6">
              <h2 className="font-display text-2xl mb-2">
                {activeView === "world" ? "World Dashboard" : "World Wiki"}
              </h2>
              <p className={`font-mono text-xs ${theme.textMuted}`}>
                {activeView === "world"
                  ? "Dashboard view showing all chapters and paths in this world."
                  : "Wiki view with detailed explanations and references."}
              </p>
            </div>
            
            {/* View Content */}
            {activeView === "world" ? (
              // World View: Pass through children (either WorldPageClient or WorldPathClient)
              children
            ) : (
              // Wiki View: Placeholder for now
              <div className={`brutal-border p-6 ${theme.viewToggleBg}`}>
                <div className="text-center py-8">
                  <div className="text-4xl mb-3">📚</div>
                  <h3 className="font-display text-xl mb-2">Wiki View</h3>
                  <p className={`font-mono text-sm ${theme.textMuted} max-w-md mx-auto`}>
                    This view will contain detailed explanations, reference materials, 
                    and additional resources for this world.
                  </p>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}