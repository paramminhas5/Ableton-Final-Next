"use client";
/**
 * You, Model 1 (canvas board ZYou). The screen shows who you are and how far to the next
 * rank; four readouts for streak, xp, lessons and layers; settings on switches; then the
 * rank ladder, your worlds and your account.
 */
import Link from "next/link";
import { useEffect, useState, type CSSProperties } from "react";
import { useProgress } from "@/lib/progress";
import { RANKS, rankFor } from "@/lib/ranks";
import { MISSIONS } from "@/content/missions";
import { FOUNDATIONS_MISSIONS } from "@/content/missions-foundations";
import { DJ_WORLD_MISSIONS } from "@/content/missions-dj";
import { useAuth, signOut } from "@/lib/auth";
import { useLearnMode } from "@/lib/mode";
import { useMode, type Mode } from "@/components/ThemeSwitcher";
import { setUiSounds, uiSoundsOn } from "@/lib/audio";
import { useTrackV2 } from "@/lib/track2";
import { worldDone, WORLD_IDS, WORLD_LABEL } from "@/lib/worldOrder";
import { GoPill, Icon, Key, Screen, Silk, Switch, WORLD_LED } from "@/components/m1/controls";
import { CAT_SRC } from "@/components/m1/shell";
import { SevenSeg } from "@/components/m1/SevenSeg";
import "@/components/m1/lesson.css";

const ALL = [...FOUNDATIONS_MISSIONS, ...DJ_WORLD_MISSIONS, ...MISSIONS];

function Readout({ value, label, color }: { value: number; label: string; color: string }) {
  const text = value > 9999 ? `${Math.round(value / 1000)}k` : String(value);
  return (
    <div className="ls-use" style={{ gap: 8, padding: "12px 6px 10px" }}>
      <span className="ls-lcd" style={{ marginTop: 0, padding: "7px 9px", minWidth: 54, justifyContent: "center" }}>
        <SevenSeg text={text} color={color} digits={Math.max(1, Math.min(4, text.length))} height={26} />
      </span>
      <small style={{ fontSize: 11 }}>{label}</small>
    </div>
  );
}

function Row({ led, label, children }: { led: string; label: string; children: React.ReactNode }) {
  return (
    <div className="ls-panel" style={{ alignItems: "center", padding: "10px 12px 10px 16px", marginTop: 8 }}>
      <span className="ls-led" style={{ ["--c" as string]: led, marginTop: 0 } as CSSProperties} />
      <span style={{ flex: 1, color: "var(--sub)" }}>{label}</span>
      <div style={{ width: 196 }}>{children}</div>
    </div>
  );
}

export function ProfilePageClient() {
  const { progress, reset } = useProgress();
  const { user, isPro } = useAuth();
  const { learnMode, setLearnMode } = useLearnMode();
  const { mode, set: setMode } = useMode();
  const { track } = useTrackV2();
  const [sound, setSound] = useState(true);
  const [confirmReset, setConfirmReset] = useState(false);
  const [portal, setPortal] = useState(false);
  const [shared, setShared] = useState(false);
  useEffect(() => setSound(uiSoundsOn()), []);

  const { current: rank, next, progress: pct, idx } = rankFor(progress.xp);
  const lessons = ALL.filter(m => !!progress.completedMissions[m.slug]).length;
  const handle = user?.name ?? user?.email?.split("@")[0] ?? null;
  const lit = Math.round(pct * 16);

  const share = async () => {
    const url = handle ? `${location.origin}/u/${encodeURIComponent(handle)}` : location.origin;
    const text = `${rank.name.toLowerCase()} on cats can dance school`;
    try {
      if (navigator.share) await navigator.share({ title: "cats can dance school", text, url });
      else { await navigator.clipboard.writeText(url); setShared(true); window.setTimeout(() => setShared(false), 1600); }
    } catch { /* cancelled */ }
  };
  const billing = async () => {
    setPortal(true);
    try {
      const r = await fetch("/api/stripe/portal", { method: "POST" });
      const d = await r.json();
      if (d.url) window.location.href = d.url;
    } finally { setPortal(false); }
  };

  return (
    <main className="m1-page pf" style={{ paddingTop: 4 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, height: 56 }}>
        <Key href="/dashboard" ariaLabel="Back" style={{ width: 44, height: 44 }}><Icon name="back" /></Key>
        <h1 style={{ flex: 1, fontSize: 22, fontWeight: 500, letterSpacing: "-.02em", margin: 0 }}>you</h1>
        <Key href="/settings" ariaLabel="Settings" style={{ width: 44, height: 44 }}><svg viewBox="0 0 24 24" className="m1-ico" aria-hidden><path d="M4 7h10M18 7h2M4 17h2M10 17h10" /><circle cx="16" cy="7" r="2" /><circle cx="8" cy="17" r="2" /></svg></Key>
        <Key onClick={share} ariaLabel={shared ? "Link copied" : "Share your profile"} style={{ width: 44, height: 44 }}><Icon name="out" /></Key>
      </div>

      <div className="pf-cols">
      <div className="pf-col">
      <Screen>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <span style={{ width: 64, height: 64, borderRadius: "50%", background: "#141416", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "inset 0 0 0 1px rgba(255,255,255,.08)" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={CAT_SRC} alt="" style={{ width: 48 }} />
          </span>
          <div>
            <div style={{ fontSize: 22, fontWeight: 400, color: "var(--disp-ink)", letterSpacing: "-.02em" }}>{(user?.name ?? "you").toLowerCase()}</div>
            <div className="m1-ss" style={{ color: "var(--disp-ink)", marginTop: 4 }}>{rank.name.toLowerCase()} · rank {idx + 1} of {RANKS.length}{isPro ? " · pro" : ""}</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 18 }}>
          <span style={{ display: "flex", gap: 3, flex: 1 }} role="img" aria-label={`${Math.round(pct * 100)} percent to the next rank`}>
            {Array.from({ length: 16 }, (_, i) => <i key={i} style={{ flex: 1, height: 9, borderRadius: 2, background: i < lit ? "var(--led-go)" : "#232326", boxShadow: i < lit ? "0 0 5px var(--led-go)" : undefined }} />)}
          </span>
          <span className="m1-ss">{next ? `${next.minXp - progress.xp} to rank ${idx + 2}` : "top rank"}</span>
        </div>
        {shared && <div className="m1-ss" style={{ marginTop: 8, color: "var(--led-mint)" }}>link copied</div>}
      </Screen>

      <div className="ls-uses" style={{ ["--n" as string]: 4, marginTop: 14 } as CSSProperties}>
        <Readout value={progress.streakDays} label="day streak" color="var(--led-red)" />
        <Readout value={progress.xp} label="xp" color="#F3F2EF" />
        <Readout value={lessons} label="lessons" color="var(--led-mint)" />
        <Readout value={track.layers.length} label="layers" color="var(--led-lilac)" />
      </div>

      </div>
      <div className="pf-col">
      <Silk label="settings" />
      <Row led="var(--ledoff)" label="look">
        <Switch label="Look" value={mode === "system" ? "auto" : mode} onChange={id => { setMode((id === "auto" ? "system" : id) as Mode); }}
          options={[{ id: "light", label: "light" }, { id: "dark", label: "dark" }, { id: "auto", label: "auto" }]} />
      </Row>
      <Row led="var(--led-go)" label="learning">
        <Switch label="Learning mode" value={learnMode === "flow" ? "flow" : "free"} onChange={id => setLearnMode(id === "flow" ? "flow" : "classic")}
          options={[{ id: "flow", label: "flow" }, { id: "free", label: "free" }]} />
      </Row>
      <Row led="var(--led-mint)" label="sounds">
        <Switch label="Interface sounds" value={sound ? "on" : "off"} onChange={id => { setSound(id === "on"); setUiSounds(id === "on"); }}
          options={[{ id: "on", label: "on" }, { id: "off", label: "off" }]} />
      </Row>
      <p className="m1-t11" style={{ margin: "8px 4px 0" }}>flow keeps lessons in order with five hearts. free opens everything, no hearts. sounds are the little clicks and chimes; music always plays.</p>

      <Silk label="your worlds" />
      <div className="ls-panel" style={{ flexDirection: "column", gap: 12 }}>
        {WORLD_IDS.map(w => {
          const d = worldDone(w, progress.completedMissions);
          const n = Math.round((d.done / Math.max(1, d.total)) * 16);
          return (
            <Link key={w} href={`/world/${w}`} style={{ display: "flex", alignItems: "center", gap: 12, width: "100%", color: "inherit", textDecoration: "none" }}>
              <span style={{ width: 70 }}>{WORLD_LABEL[w]}</span>
              <span style={{ display: "flex", gap: 3, flex: 1 }} aria-hidden>
                {Array.from({ length: 16 }, (_, i) => <i key={i} style={{ flex: 1, height: 8, borderRadius: 2, background: i < n ? WORLD_LED[w] : "var(--ledoff)" }} />)}
              </span>
              <span className="m1-t11" style={{ width: 48, textAlign: "right" }}>{d.done} of {d.total}</span>
            </Link>
          );
        })}
      </div>

      </div>
      <div className="pf-col">
      <Silk label="ranks" right={`${progress.xp} xp`} />
      <ol className="ls-learn" style={{ padding: "0 4px" }}>
        {RANKS.map((r, i) => (
          <li key={r.slug} style={{ alignItems: "center", opacity: i > idx ? 0.55 : 1 }}>
            <span className="ls-led" style={{ ["--c" as string]: i <= idx ? "var(--led-go)" : "var(--ledoff)", boxShadow: i <= idx ? undefined : "none", background: i <= idx ? undefined : "var(--ledoff)" } as CSSProperties} />
            <span style={{ flex: 1, fontWeight: i === idx ? 600 : 400 }}>{r.name.toLowerCase()}</span>
            <span className="m1-t11">{i === idx ? "you are here" : `${r.minXp} xp`}</span>
          </li>
        ))}
      </ol>

      <Silk label="account" />
      <div className="ls-pads">
        {user ? (
          <Link href={handle ? `/u/${encodeURIComponent(handle)}` : "/profile"} className="ls-pad is-glowpad" style={{ ["--c" as string]: "var(--led-go)", minHeight: 96 } as CSSProperties}>
            <small>public page</small><span>see your profile</span>
          </Link>
        ) : (
          <Link href="/login" className="ls-pad is-lit" style={{ ["--c" as string]: "var(--led-go)", minHeight: 96 } as CSSProperties}>
            <small>sign in</small><span>save to cloud</span>
          </Link>
        )}
        <Link href="/placement" className="ls-pad is-glowpad" style={{ ["--c" as string]: "var(--led-cobalt)", minHeight: 96 } as CSSProperties}>
          <small>skip ahead</small><span>placement check</span>
        </Link>
        <Link href="/leaderboard" className="ls-pad" style={{ minHeight: 76 }}><small>this week</small><span>leaderboard</span></Link>
        <Link href="/shop" className="ls-pad" style={{ minHeight: 76 }}><small>{progress.gems} gems</small><span>shop</span></Link>
      </div>
      {isPro && (
        <button type="button" className="ls-panel is-link" onClick={billing} disabled={portal}>
          <span className="ls-led" style={{ ["--c" as string]: "var(--led-lilac)" } as CSSProperties} /><span>{portal ? "opening billing" : "manage pro and billing"}</span>
        </button>
      )}
      {confirmReset ? (
        <div className="ls-panel" style={{ alignItems: "center" }}>
          <span className="ls-led" style={{ ["--c" as string]: "var(--led-red)" } as CSSProperties} />
          <span style={{ flex: 1 }}>reset all progress? this can&apos;t be undone.</span>
          <button type="button" className="m1-tag" onClick={() => { reset(); setConfirmReset(false); }} style={{ cursor: "pointer", color: "var(--red)" }}>reset</button>
          <button type="button" className="m1-tag" onClick={() => setConfirmReset(false)} style={{ cursor: "pointer", marginLeft: 6 }}>cancel</button>
        </div>
      ) : (
        <button type="button" className="ls-panel is-link" onClick={() => setConfirmReset(true)}>
          <span className="ls-led" style={{ ["--c" as string]: "var(--ledoff)", boxShadow: "none", background: "var(--ledoff)" } as CSSProperties} /><span>reset progress</span>
        </button>
      )}
      {user && (
        <div className="m1-g" style={{ marginTop: 16 }}>
          <GoPill onClick={() => signOut()} style={{ gridColumn: "1 / -1" }}>sign out</GoPill>
        </div>
      )}
      </div>
      </div>
    </main>
  );
}
