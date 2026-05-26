"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { PlacementTest } from "@/components/PlacementTest";
import { useProgress } from "@/lib/progress";

type World = "fundamentals" | "dj" | "producer";

const WORLDS: { id: World; emoji: string; label: string }[] = [
  { id: "fundamentals", emoji: "🎵", label: "Fundamentals" },
  { id: "dj",           emoji: "🎧", label: "DJ World" },
  { id: "producer",     emoji: "🎛", label: "Producer" },
];

export function PlacementPageClient() {
  const router = useRouter();
  const { progress } = useProgress();
  const [selectedWorld, setSelectedWorld] = useState<World | null>(null);

  if (selectedWorld) {
    return (
      <PlacementTest
        world={selectedWorld}
        onSkip={() => setSelectedWorld(null)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-ink text-bone flex flex-col justify-center px-6 py-12 max-w-lg mx-auto space-y-8">
      <div>
        <button
          onClick={() => router.back()}
          className="font-mono text-[10px] uppercase opacity-40 hover:opacity-70 mb-4 block"
        >
          ← back
        </button>
        <div className="font-mono text-[10px] uppercase opacity-50 mb-2">PLACEMENT TEST</div>
        <h1 className="font-display text-5xl leading-none">
          ALREADY KNOW<br />
          <span className="text-acid">SOME STUFF?</span>
        </h1>
        <p className="font-mono text-sm opacity-60 mt-3 leading-relaxed">
          Pick a world and answer 4 quick questions. We&apos;ll place you in the right chapter automatically.
        </p>
      </div>

      <div className="space-y-3">
        {WORLDS.map(w => (
          <button
            key={w.id}
            onClick={() => setSelectedWorld(w.id)}
            className="w-full brutal-border bg-bone/10 hover:bg-acid hover:text-ink p-4 text-left font-mono text-sm uppercase brutal-press transition-colors flex items-center gap-3"
          >
            <span className="text-2xl">{w.emoji}</span>
            <span>Test {w.label} knowledge →</span>
          </button>
        ))}
      </div>

      <div className="font-mono text-[9px] uppercase opacity-30 text-center">
        Current level: {progress.unlockedChapter > 1 ? `Chapter ${progress.unlockedChapter} unlocked` : "Starting from Chapter 1"}
      </div>
    </div>
  );
}
