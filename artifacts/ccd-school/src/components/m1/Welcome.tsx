"use client";
/**
 * First run (canvas "first run"): hello, one question, how it works, one button.
 * Pick what you want to learn, press start, and you are in the first lesson.
 */
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useProgress } from "@/lib/progress";
import { useLearnMode } from "@/lib/mode";
import { PlacementTest } from "@/components/PlacementTest";
import { WORLD_LABEL, type WorldId } from "@/lib/worldOrder";
import { GoPill, Icon, Pad, Screen, Silk } from "./controls";
import { CAT_SRC } from "./shell";

const PICKS: { id: WorldId; name: string; line: string; first: string; led: string }[] = [
  { id: "fundamentals", name: "the basics", line: "sound, rhythm, melody, harmony", first: "what-is-sound", led: "#5EEAC1" },
  { id: "dj", name: "dj", line: "beatmatch, mix, read a room", first: "what-is-djing", led: "#7D96FF" },
  { id: "producer", name: "make tracks", line: "ableton live, from zero to a finished track", first: "your-kick", led: "#FF5FA4" },
];

const HOW = [
  ["learn one idea", "five minutes, one thing at a time"],
  ["play it", "on a real instrument, right in the lesson"],
  ["it joins your track", "every lesson adds a layer. open the finished track in ableton"],
];

export function Welcome({ onLeave }: { onLeave?: () => void }) {
  const [world, setWorld] = useState<WorldId>("fundamentals");
  const [placement, setPlacement] = useState(false);
  const { setOnboarding } = useProgress();
  const { setLearnMode } = useLearnMode();
  const router = useRouter();
  const pick = PICKS.find(p => p.id === world)!;

  const go = (slug: string) => {
    onLeave?.();
    setOnboarding(world, "normal");
    setLearnMode("flow");
    router.push(`/learn/${slug}`);
  };

  if (placement) {
    return <PlacementTest world={world} onSkip={() => setPlacement(false)} onComplete={slug => go(slug)} />;
  }

  return (
    <main className="m1-page">

      <Screen style={{ marginTop: 4 }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={CAT_SRC} alt="" className="m1-dancing" style={{ position: "absolute", right: 14, top: 12, width: 84 }} />
        <div className="m1-ss">hello.</div>
        <h1 className="m1-t36" style={{ marginTop: 8, maxWidth: 220 }}>make music while you learn it</h1>
        <div className="m1-ss" style={{ marginTop: 10 }}>free · works on your phone · no download</div>
      </Screen>

      <Silk label="what do you want to learn?" />
      <div style={{ display: "grid", gap: 8 }}>
        {PICKS.map(p => (
          <Pad key={p.id} lit={world === p.id ? p.led : null} ariaPressed={world === p.id} onClick={() => setWorld(p.id)} height={64} ariaLabel={`${p.name}: ${p.line}`}>
            <span style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 3, padding: "0 14px", width: "100%", textAlign: "left" }}>
              <span className="m1-t22" style={{ fontSize: 19, ...(world === p.id ? { color: "#06241B" } : {}) }}>{p.name}</span>
              <span className="m1-t11" style={world === p.id ? { color: "#0D2A22" } : undefined}>{p.line}</span>
            </span>
          </Pad>
        ))}
      </div>

      <div style={{ marginTop: 14, height: 72 }}>
        <GoPill onClick={() => go(pick.first)} style={{ height: 72, width: "100%" }} ariaLabel={`Start learning ${WORLD_LABEL[world]}`}>
          start learning <Icon name="play" small />
        </GoPill>
      </div>

      <Silk label="how it works" style={{ marginTop: 22 }} />
      <ol style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gap: 10 }}>
        {HOW.map(([t, d], i) => (
          <li key={t} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
            <span className="m1-tag" style={{ flex: "none", width: 26, justifyContent: "center", padding: 0 }}>{i + 1}</span>
            <span>
              <span className="m1-t15" style={{ display: "block", fontWeight: 500 }}>{t}</span>
              <span className="m1-t11" style={{ display: "block", marginTop: 2 }}>{d}</span>
            </span>
          </li>
        ))}
      </ol>

      <div style={{ marginTop: 22, display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <button type="button" className="m1-tag" style={{ height: 34, padding: "0 12px" }} onClick={() => setPlacement(true)}>i have used this before · find my level</button>
        <a className="m1-tag" style={{ height: 34, padding: "0 12px", display: "inline-flex", alignItems: "center" }} href="/worlds">see all lessons</a>
      </div>
    </main>
  );
}
