"use client";
/**
 * Gem shop, Model 1. Streak shield, heart refill, 2x xp for an hour, a theme.
 * Gems come from lessons (10), perfect scores (25) and reviews (10).
 */
import { useState } from "react";
import { useProgress, MAX_HEARTS } from "@/lib/progress";
import { Icon, Screen, Silk } from "@/components/m1/controls";
import { SevenSeg } from "@/components/m1/SevenSeg";
import { ListRow, PageHead, Readout } from "@/components/m1/parts";

type Item = { id: string; icon: string; led: string; title: string; desc: string; cost: number; action: () => void; off?: string };

export function ShopPageClient() {
  const { progress, spendGems, refillHeart } = useProgress();
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null);
  const say = (text: string, ok: boolean) => { setMsg({ text, ok }); window.setTimeout(() => setMsg(null), 2600); };
  const pay = (cost: number) => { if (!spendGems(cost)) { say(`you need ${cost} gems`, false); return false; } return true; };

  const items: Item[] = [
    { id: "shield", icon: "shield", led: "var(--led-lilac)", title: "streak shield", desc: "miss a day and keep your streak. it is used on its own the next time you miss.", cost: 200,
      off: progress.streakShield ? "active" : undefined,
      action: () => { if (pay(200)) say("shield is on", true); } },
    { id: "hearts", icon: "heart", led: "var(--led-red)", title: "heart refill", desc: `all ${MAX_HEARTS} hearts back now, no waiting.`, cost: 100,
      off: progress.hearts >= MAX_HEARTS ? "full" : undefined,
      action: () => { if (pay(100)) { refillHeart(); say("hearts are full", true); } } },
    { id: "boost", icon: "bolt", led: "var(--led-go)", title: "2x xp for an hour", desc: "double xp for the next 60 minutes. good before a long session.", cost: 150,
      action: () => { if (pay(150)) { try { localStorage.setItem("ccd.xpboost", String(Date.now() + 3_600_000)); } catch { /* private mode */ } say("2x xp for 60 minutes", true); } } },
    { id: "theme", icon: "sun", led: "var(--led-cobalt)", title: "bonus theme", desc: "a second screen colour for your profile.", cost: 300,
      action: () => { if (pay(300)) say("theme unlocked, find it on you", true); } },
  ];

  return (
    <main className="m1-page" style={{ paddingTop: 4 }}>
      <PageHead title="shop" back="/profile" />
      <Screen>
        <div className="ls-meta"><span>gems</span><span>everything here is optional</span></div>
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 14 }}>
          <span className="ls-lcd" style={{ marginTop: 0 }}><SevenSeg text={String(Math.min(progress.gems, 9999))} color="var(--led-lilac)" digits={4} height={40} /></span>
          <Icon name="gem" />
        </div>
        {msg && <div role="status" className="m1-ss" style={{ marginTop: 12, color: msg.ok ? "var(--led-mint)" : "var(--led-red)" }}>{msg.text}</div>}
      </Screen>

      <Silk label="how to earn" />
      <div className="ls-uses" style={{ ["--n" as string]: 3 } as React.CSSProperties}>
        <Readout value={10} label="gems a lesson" color="var(--led-mint)" />
        <Readout value={25} label="gems, perfect" color="var(--led-mint)" />
        <Readout value={10} label="gems a review" color="var(--led-mint)" />
      </div>

      <Silk label="items" />
      {items.map(it => {
        const can = !it.off && progress.gems >= it.cost;
        return (
          <ListRow key={it.id} led={it.led} title={it.title} sub={it.desc}
            right={
              <button type="button" className="m1-tag" disabled={!can} onClick={it.action}
                aria-label={it.off ? `${it.title}, ${it.off}` : `buy ${it.title} for ${it.cost} gems`}
                style={{ cursor: can ? "pointer" : "default", height: 30, padding: "0 10px", opacity: can ? 1 : 0.55, color: can ? "var(--ink)" : "var(--sub)", minHeight: 0 }}>
                {it.off ?? (can ? `${it.cost} gems` : `need ${it.cost}`)}
              </button>
            } />
        );
      })}

      {(progress.streakShield || progress.hearts < MAX_HEARTS) && (
        <>
          <Silk label="active" />
          {progress.streakShield && <ListRow led="var(--led-lilac)" title="streak shield" sub="covers your next missed day" />}
          {progress.hearts < MAX_HEARTS && <ListRow led="var(--led-red)" title={`${progress.hearts} of ${MAX_HEARTS} hearts`} sub="one comes back every 4 hours" />}
        </>
      )}
    </main>
  );
}
