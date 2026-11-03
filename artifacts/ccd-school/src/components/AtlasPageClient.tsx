"use client";
/**
 * Library, Model 1 (canvas board ZLibrary). Search sits on the glass; a switch picks
 * devices, words or more. Each device row has a picture of what it does and a light that
 * is on once you've done a lesson that uses it. Tap a row to open it.
 */
import Link from "next/link";
import { useEffect, useMemo, useState, type CSSProperties, type ReactNode } from "react";
import { editionNeeded, ATLAS, ATLAS_GROUPS, type AtlasGroup } from "@/content/atlas";
import { TERMS } from "@/content/glossary";
import { useProgress } from "@/lib/progress";
import { Icon, Screen, Silk, Switch } from "@/components/m1/controls";
import "@/components/m1/lesson.css";

const GROUP_COLOR: Record<AtlasGroup, string> = {
  instrument: "#FF4F9A", midi: "#7D96FF", eq: "#4FE3B6", dynamics: "#B89CFF", space: "#7D96FF", drive: "#F3C14F",
  mod: "#4FE3B6", creative: "#FF4F9A", utility: "#E9E9E6", rack: "#B89CFF", max: "#F3C14F",
};

function GroupPic({ g }: { g: AtlasGroup }) {
  const c = GROUP_COLOR[g];
  const s = { stroke: c, strokeWidth: 2, fill: "none", strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  const P: Record<AtlasGroup, ReactNode> = {
    instrument: <path d="M4 20c4-12 8-12 12 0s8 12 12 0 8-12 12 0" {...s} />,
    midi: <><rect x="6" y="10" width="10" height="5" rx="1" fill={c} /><rect x="20" y="18" width="14" height="5" rx="1" fill={c} /><rect x="36" y="13" width="8" height="5" rx="1" fill={c} /></>,
    eq: <path d="M4 26h10c5 0 6-14 10-14s5 14 10 14h10" {...s} />,
    dynamics: <><path d="M6 30 22 14l18-4" {...s} /><path d="M22 14v16" {...s} strokeDasharray="2 3" opacity={0.6} /></>,
    space: <>{[6, 11, 16, 21, 26, 31, 36, 41].map((x, i) => <path key={x} d={`M${x} ${8 + i * 2.2}v${24 - i * 4.4}`} {...s} opacity={1 - i * 0.1} />)}</>,
    drive: <path d="M4 20c3-8 5-10 8-10h4c3 0 5 20 8 20h4c3 0 5-20 8-20h4" {...s} />,
    mod: <><path d="M4 20c4-6 8-6 12 0s8 6 12 0 8-6 12 0" {...s} /><path d="M4 28c4-3 8-3 12 0s8 3 12 0 8-3 12 0" {...s} opacity={0.5} /></>,
    creative: <><path d="M4 20h6l3-10 4 20 3-14 3 8 4-4h17" {...s} /></>,
    utility: <><rect x="10" y="8" width="6" height="24" rx="2" {...s} /><rect x="22" y="14" width="6" height="18" rx="2" {...s} /><rect x="34" y="20" width="6" height="12" rx="2" {...s} /></>,
    rack: <><rect x="6" y="9" width="36" height="7" rx="2" {...s} /><rect x="6" y="19" width="36" height="7" rx="2" {...s} /><rect x="6" y="29" width="36" height="3" rx="1.5" fill={c} /></>,
    max: <path d="M24 6 38 14v14l-14 8-14-8V14z" {...s} />,
  };
  return (
    <span style={{ width: 56, height: 44, borderRadius: 9, background: "#050506", display: "flex", alignItems: "center", justifyContent: "center", flex: "none", boxShadow: "inset 0 1px 3px rgba(0,0,0,.8), 0 0 0 1px rgba(255,255,255,.05)" }}>
      <svg viewBox="0 0 48 40" width={44} height={36} aria-hidden style={{ filter: `drop-shadow(0 0 3px ${c})` }}>{P[g]}</svg>
    </span>
  );
}

const MORE = [
  { href: "/devices", label: "device lab", what: "turn the knobs and hear each device" },
  { href: "/plugins", label: "plug-in guide", what: "which plug-in for which job, stock first" },
  { href: "/signal-flow", label: "signal flow", what: "where sound goes, track to speaker" },
  { href: "/shortcuts", label: "shortcuts", what: "the keys that save the most time in live" },
  { href: "/setup", label: "set up live", what: "audio, midi and folders, step by step" },
  { href: "/build", label: "build a set", what: "a whole track, checked in your own set" },
  { href: "/link", label: "check my set", what: "upload a .als and get a readable summary" },
  { href: "/wiki", label: "wiki", what: "longer reads on the big ideas" },
];

type Tab = "devices" | "words" | "more";

export function AtlasPageClient({ lessons = {} }: { lessons?: Record<string, { slug: string; title: string }[]> }) {
  const { progress } = useProgress();
  const [q, setQ] = useState("");
  const [tab, setTab] = useState<Tab>("devices");
  const [group, setGroup] = useState<AtlasGroup | "all">("all");
  const [open, setOpen] = useState<string | null>(null);

  useEffect(() => {
    const read = () => {
      const h = window.location.hash.slice(1);
      if (!h) return;
      setQ(""); setGroup("all"); setTab("devices"); setOpen(h);
      window.setTimeout(() => document.getElementById(h)?.scrollIntoView({ block: "center" }), 60);
    };
    read();
    window.addEventListener("hashchange", read);
    return () => window.removeEventListener("hashchange", read);
  }, []);

  const t = q.trim().toLowerCase();
  const devices = useMemo(() => ATLAS.filter(d => (group === "all" || d.group === group) && (!t || `${d.name} ${d.does} ${d.reach}`.toLowerCase().includes(t))), [t, group]);
  const words = useMemo(() => TERMS.filter(w => !t || `${w.term} ${w.def}`.toLowerCase().includes(t)), [t]);
  const more = MORE.filter(m => !t || `${m.label} ${m.what}`.includes(t));
  const used = (id: string) => (lessons[id] ?? []).find(l => !!progress.completedMissions[l.slug]);

  return (
    <main className="m1-page" style={{ paddingTop: 4 }}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", height: 52 }}>
        <h1 style={{ fontSize: 26, fontWeight: 400, letterSpacing: "-.02em", margin: 0 }}>library</h1>
        <span className="m1-t11">{ATLAS.length + TERMS.length + MORE.length} entries</span>
      </div>
      <Screen>
        <label style={{ display: "flex", alignItems: "center", gap: 12, color: "var(--disp-ink)" }}>
          <span style={{ color: "var(--disp-sub)" }}><Icon name="search" /></span>
          <span className="sr-only">Search the library</span>
          <input type="search" value={q} onChange={e => setQ(e.target.value)} placeholder="search: reverb, bass, sidechain"
            style={{ flex: 1, background: "none", border: 0, outline: "none", color: "var(--disp-ink)", font: "400 24px/1.2 Outfit, system-ui", caretColor: "var(--led-go)", minWidth: 0 }} />
        </label>
        <div className="ls-meta" style={{ marginTop: 14, justifyContent: "flex-start", gap: 16 }} aria-live="polite">
          <span style={{ color: tab === "devices" ? "var(--disp-ink)" : undefined }}>{devices.length} devices</span>
          <span style={{ color: tab === "words" ? "var(--disp-ink)" : undefined }}>{words.length} words</span>
          <span style={{ color: tab === "more" ? "var(--disp-ink)" : undefined }}>{more.length} guides</span>
        </div>
      </Screen>

      <div style={{ marginTop: 14 }}>
        <Switch label="Library section" value={tab} onChange={id => setTab(id as Tab)} options={[{ id: "devices", label: "devices" }, { id: "words", label: "words" }, { id: "more", label: "more" }]} />
      </div>

      {tab === "devices" && (
        <>
          <Silk label="devices" right="light on means you've used it" />
          <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 6, marginBottom: 4, scrollbarWidth: "none" }} role="group" aria-label="Filter by kind">
            {[{ id: "all" as const, label: "all" }, ...ATLAS_GROUPS.map(g => ({ id: g.id, label: g.label.toLowerCase() }))].map(g => (
              <button key={g.id} type="button" aria-pressed={group === g.id} onClick={() => setGroup(g.id)} className="m1-tag"
                style={{ flex: "none", height: 26, padding: "0 10px", cursor: "pointer", background: group === g.id ? "var(--ink)" : "none", color: group === g.id ? "var(--deck)" : "var(--sub)", borderColor: group === g.id ? "var(--ink)" : undefined }}>
                {g.label}
              </button>
            ))}
          </div>
          {group !== "all" && <p className="m1-t11" style={{ margin: "0 4px 8px" }}>{ATLAS_GROUPS.find(g => g.id === group)?.blurb.toLowerCase()}</p>}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {devices.map(d => {
              const u = used(d.id);
              const first = lessons[d.id]?.[0];
              const isOpen = open === d.id;
              const ed = editionNeeded(d.id);
              return (
                <div key={d.id} id={d.id} className="ls-panel" style={{ flexDirection: "column", gap: 0, padding: 0, marginTop: 0, scrollMarginTop: 90 }}>
                  <button type="button" onClick={() => setOpen(isOpen ? null : d.id)} aria-expanded={isOpen}
                    style={{ display: "flex", alignItems: "center", gap: 14, width: "100%", padding: "12px 14px", background: "none", border: 0, font: "inherit", color: "inherit", textAlign: "left", cursor: "pointer" }}>
                    <GroupPic g={d.group} />
                    <span style={{ flex: 1, minWidth: 0 }}>
                      <b style={{ display: "block", fontSize: 16, fontWeight: 600 }}>{d.name.toLowerCase()}</b>
                      <span style={{ display: "block", fontSize: 13, fontWeight: 500, lineHeight: 1.35, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: isOpen ? "normal" : "nowrap" }}>{d.reach.toLowerCase().replace(/\.$/, "")}</span>
                      <span className="m1-t11" style={{ display: "block", marginTop: 2 }}>{u ? `learned in ${u.title.toLowerCase()}` : first ? `learn it in ${first.title.toLowerCase()}` : ATLAS_GROUPS.find(g => g.id === d.group)?.label.toLowerCase()}</span>
                    </span>
                    <span className="ls-led" style={{ ["--c" as string]: u ? "var(--led-go)" : "var(--ledoff)", background: u ? undefined : "#2A2A2E", boxShadow: u ? undefined : "inset 0 1px 1px rgba(0,0,0,.4)" } as CSSProperties} aria-label={u ? "used" : "not used yet"} />
                  </button>
                  {isOpen && (
                    <div style={{ padding: "0 16px 14px 84px", fontSize: 14, lineHeight: 1.5 }}>
                      <p style={{ margin: 0 }}>{d.does}</p>
                      <p style={{ margin: "8px 0 0" }}><b style={{ fontWeight: 600 }}>tip</b> · {d.tip}</p>
                      {ed && <p className="m1-t11" style={{ margin: "8px 0 0" }}>{ed === "Suite" ? "needs live suite" : "needs live standard or suite"}</p>}
                      {lessons[d.id]?.length ? (
                        <p style={{ margin: "10px 0 0", display: "flex", flexWrap: "wrap", gap: 6 }}>
                          {lessons[d.id].map(l => <Link key={l.slug} href={`/learn/${l.slug}`} className="m1-tag" style={{ height: 24 }}>{l.title.toLowerCase()}</Link>)}
                        </p>
                      ) : null}
                    </div>
                  )}
                </div>
              );
            })}
            {devices.length === 0 && <p className="m1-t11" style={{ textAlign: "center", padding: 20 }}>nothing matches. try another word.</p>}
          </div>
        </>
      )}

      {tab === "words" && (
        <>
          <Silk label="words" right={`${words.length} of ${TERMS.length}`} />
          <div className="ls-panel" style={{ flexDirection: "column", gap: 0, padding: "4px 16px", marginTop: 0 }}>
            {words.slice(0, 200).map((w, i) => (
              <div key={w.term} style={{ padding: "12px 0", borderTop: i ? "1px solid var(--line)" : 0, width: "100%" }}>
                <b style={{ fontWeight: 600 }}>{w.term.toLowerCase()}</b>
                <p style={{ margin: "4px 0 0", fontSize: 14, lineHeight: 1.45, color: "var(--sub)" }}>{w.def}</p>
              </div>
            ))}
            {words.length === 0 && <p className="m1-t11" style={{ padding: 16 }}>nothing matches.</p>}
          </div>
        </>
      )}

      {tab === "more" && (
        <>
          <Silk label="guides" />
          <div className="ls-pads">
            {more.map(m => (
              <Link key={m.href} href={m.href} className="ls-pad" style={{ minHeight: 104 }}>
                <small>{m.what}</small><span>{m.label}</span>
              </Link>
            ))}
          </div>
        </>
      )}
    </main>
  );
}
