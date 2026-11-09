"use client";
/**
 * A device, Model 1 (canvas board ZDevice). The glass names the device and what it is;
 * try it is the device lab (it plays for real; nothing breaks); reach for it says when;
 * learn it in links the lesson that teaches it.
 */
import Link from "next/link";
import type { CSSProperties } from "react";
import { deviceBySlug, DEVICES } from "@/content/devices";
import { DeviceLab } from "@/components/DeviceLab";
import { DeviceExplainers } from "@/components/DeviceExplainers";
import { getDeviceExplainer } from "@/content/device-explainers";
import { ClientOnly } from "@/components/ClientOnly";
import { atlasById, atlasIdForLabName } from "@/content/atlas";
import { LESSON_LINKS } from "@/content/lessonLinks";
import { missionBySlug } from "@/content/missions";
import { useProgress } from "@/lib/progress";
import { Icon, Key, Screen, Silk } from "@/components/m1/controls";
import "@/components/m1/lesson.css";

export function DevicePageClient({ slug }: { slug: string }) {
  const { progress } = useProgress();
  const d = deviceBySlug(slug);
  if (!d) {
    return (
      <main className="m1-page">
        <Screen><span className="m1-ss">library · devices</span><div className="ls-title">no device called {slug}.</div></Screen>
        <div className="m1-g" style={{ marginTop: 14 }}><Key href="/devices" label="devices" ariaLabel="All devices"><Icon name="back" /></Key></div>
      </main>
    );
  }
  const idx = DEVICES.findIndex(x => x.slug === slug);
  const prev = DEVICES[idx - 1];
  const next = DEVICES[idx + 1];
  const explainer = getDeviceExplainer(slug);
  const atlasId = atlasIdForLabName(d.name);
  const a = atlasId ? atlasById(atlasId) : undefined;
  const lessons = Object.entries(LESSON_LINKS).filter(([, l]) => atlasId && l.devices?.includes(atlasId)).map(([s]) => missionBySlug(s)).filter(Boolean).slice(0, 3);

  return (
    <main className="m1-page dv" style={{ paddingTop: 4 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, height: 60 }}>
        <Key href="/devices" ariaLabel="All devices" style={{ width: 44, height: 44 }}><Icon name="back" /></Key>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h1 style={{ fontSize: 22, fontWeight: 500, margin: 0, letterSpacing: "-.02em" }}>{d.name.toLowerCase()}</h1>
          <div className="m1-t11">library · devices</div>
        </div>
        {a && <span className="m1-tag">in live 12</span>}
      </div>

      <Screen>
        <div className="ls-meta"><span>{d.category.toLowerCase()}</span><span>device lab</span></div>
        <div className="ls-title">{d.name.toLowerCase()}</div>
        <p className="ls-sub">{d.tagline}</p>
      </Screen>

      <Silk label="try it" right="turn anything, nothing breaks" />
      <div className="ls-sim">
        <ClientOnly fallback={<div className="m1-t11" style={{ padding: 20 }}>loading the sound</div>}>
          <DeviceLab key={d.slug} title={d.name} subtitle={d.tagline} deviceLabel={d.name} deviceSlug={d.slug} factory={d.factory} params={d.params} listenFor={d.listenFor} signalFlow={d.signalFlow} presets={d.presets} />
        </ClientOnly>
      </div>

      <Silk label="what it does" />
      <p className="ls-read" style={{ fontSize: 16, lineHeight: "24px" }}>{d.what}</p>
      <p className="ls-read" style={{ fontSize: 16, lineHeight: "24px", color: "var(--sub)" }}>{d.how}</p>
      {a && (
        <>
          <Silk label="reach for it" />
          <div className="ls-panel" style={{ marginTop: 0 }}><span className="ls-led" style={{ ["--c" as string]: "var(--led-mint)" } as CSSProperties} /><span>{a.reach} <Link href={`/atlas#${a.id}`} style={{ color: "var(--sub)" }}>read the guide</Link></span></div>
        </>
      )}
      {lessons.length > 0 && (
        <>
          <Silk label="learn it in" />
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {lessons.map(m => m && (
              <Link key={m.slug} href={`/learn/${m.slug}`} className="ls-panel is-link" style={{ marginTop: 0, alignItems: "center", textDecoration: "none" }}>
                <span style={{ flex: 1 }}><span className="m1-t11" style={{ display: "block" }}>learn it in</span><b style={{ fontWeight: 600, fontSize: 17 }}>{m.title.toLowerCase()}</b></span>
                <span className="ls-led" style={{ ["--c" as string]: progress.completedMissions[m.slug] ? "var(--led-mint)" : "var(--ledoff)", marginTop: 0 } as CSSProperties} aria-label={progress.completedMissions[m.slug] ? "done" : "not done yet"} />
              </Link>
            ))}
          </div>
        </>
      )}
      {explainer && <div className="ls-legacy" style={{ marginTop: 14 }}><DeviceExplainers blocks={explainer} /></div>}
      <div className="m1-g" style={{ marginTop: 18 }}>
        {prev ? <Key href={`/device/${prev.slug}`} label={prev.name.toLowerCase()} ariaLabel={`Previous: ${prev.name}`}><Icon name="back" /></Key> : <span />}
        <span /><span />
        {next ? <Key href={`/device/${next.slug}`} label={next.name.toLowerCase()} ariaLabel={`Next: ${next.name}`}><Icon name="back" className="ls-flip" /></Key> : <span />}
      </div>
    </main>
  );
}
