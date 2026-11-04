"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { PlacementTest } from "@/components/PlacementTest";
import { useProgress } from "@/lib/progress";
import { Icon, Screen, Silk, WORLD_LED } from "@/components/m1/controls";
import { ListRow } from "@/components/m1/parts";
import "@/components/m1/lesson.css";

type World = "fundamentals" | "dj" | "producer";
const WORLDS: { id: World; label: string; sub: string }[] = [
  { id: "fundamentals", label: "basics", sub: "sound, rhythm, notes, the studio" },
  { id: "dj", label: "dj", sub: "decks, mixing, beatmatching, sets" },
  { id: "producer", label: "producer", sub: "synths, mixing, arranging, finishing" },
];

export function PlacementPageClient() {
  const router = useRouter();
  const { progress } = useProgress();
  const [world, setWorld] = useState<World | null>(null);
  if (world) return <PlacementTest world={world} onSkip={() => setWorld(null)} />;
  return (
    <div className="ls">
      <div className="ls-top">
        <button type="button" className="ls-x" aria-label="Close" onClick={() => router.back()}><Icon name="close" /></button>
        <span style={{ flex: 1 }} />
      </div>
      <div className="ls-col" style={{ paddingBottom: 24 }}>
        <Screen>
          <div className="ls-meta"><span>find my level</span><span>4 questions a world</span></div>
          <div className="ls-title">already know some of this?</div>
          <p className="ls-sub">pick a world and answer a few questions. we start you at the right chapter.</p>
        </Screen>
        <Silk label="pick a world" />
        {WORLDS.map(w => <ListRow key={w.id} onClick={() => setWorld(w.id)} led={WORLD_LED[w.id]} title={w.label} sub={w.sub} right={<Icon name="back" className="ls-flip" />} />)}
        <p className="m1-t11" style={{ margin: "14px 4px 0" }}>{progress.unlockedChapter > 1 ? `chapter ${progress.unlockedChapter} is open for you now` : "you are starting from chapter 1"}</p>
      </div>
    </div>
  );
}
