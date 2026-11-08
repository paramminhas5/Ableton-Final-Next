"use client";
/**
 * /admin/learning: does the school teach? The learning funnel (src/lib/learnFunnel.ts) over every signed-in
 * learner's events, behind the admin check (a signed-in staff or owner, or the admin password). "this device"
 * runs the same summary on the events kept in this browser, so it can be read without a database.
 * Tables first (they are the data); a bar beside a rate only shows its size, the number is always written.
 */
import Link from "next/link";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { funnel, type Funnel, type StepRow } from "@/lib/learnFunnel";
import { localLog } from "@/lib/learnEvents";
import { Icon, Screen, Silk } from "@/components/m1/controls";
import "@/components/m1/lesson.css";
import "@/components/m1/placement.css";

type Source = "everyone" | "device";
const pct = (x: number | null) => (x === null ? "-" : `${Math.round(x * 100)}%`);
const one = (x: number) => (Math.round(x * 10) / 10).toString();

function Bar({ v, label }: { v: number; label: string }) {
  return <span className="al-bar" title={label}><i style={{ width: `${Math.max(0, Math.min(1, v)) * 100}%` }} /></span>;
}
function Tile({ k, v, sub }: { k: string; v: ReactNode; sub?: string }) {
  return <div className="al-tile"><span>{k}</span><b>{v}</b>{sub ? <small>{sub}</small> : null}</div>;
}
function StepTable({ rows, by }: { rows: StepRow[]; by: "checks" | "skips" }) {
  if (!rows.length) return <p className="ls-read al-none">nothing yet.</p>;
  const top = Math.max(...rows.map(r => (by === "checks" ? r.avgChecks : r.skipRate)), 1e-9);
  return (
    <table className="al-t">
      <thead><tr><th scope="col">lesson · step</th><th scope="col">kind</th><th scope="col">shown</th><th scope="col">{by === "checks" ? "checks a learner" : "skipped"}</th><th scope="col">stars</th></tr></thead>
      <tbody>{rows.map(r => (
        <tr key={`${r.slug}#${r.step}`}>
          <td><Link href={`/learn/${r.slug}`}>{r.slug}</Link> · {r.step + 1}</td><td>{r.kind || "-"}</td><td>{r.shown}</td>
          <td className="al-num">{by === "checks" ? one(r.avgChecks) : `${pct(r.skipRate)} (${r.skipped})`}<Bar v={(by === "checks" ? r.avgChecks : r.skipRate) / top} label={by === "checks" ? `${one(r.avgChecks)} checks` : pct(r.skipRate)} /></td>
          <td>{r.avgStars === null ? "-" : one(r.avgStars)}</td>
        </tr>
      ))}</tbody>
    </table>
  );
}

export function AdminLearning() {
  const [src, setSrc] = useState<Source>("everyone");
  const [days, setDays] = useState(30);
  const [pw, setPw] = useState("");
  const [need, setNeed] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [server, setServer] = useState<Funnel | null>(null);
  const [device, setDevice] = useState<Funnel | null>(null);
  useEffect(() => { setDevice(funnel(localLog().map(e => ({ who: "this device", e: e.e, t: e.t, p: e.p })))); }, []);
  const load = async (password = pw) => {
    setMsg("loading");
    const r = await fetch(`/api/admin/learning?days=${days}`, { headers: password ? { "x-admin-password": password } : {} }).catch(() => null);
    if (!r) { setMsg("could not reach the server"); return; }
    if (r.status === 401) { setNeed(true); setMsg(password ? "wrong password" : null); return; }
    if (!r.ok) { setMsg("no database here: showing this device instead"); setSrc("device"); return; }
    const d = await r.json();
    setNeed(false); setMsg(null); setServer(d.funnel);
  };
  useEffect(() => { if (src === "everyone") void load(); }, [days, src]); // eslint-disable-line react-hooks/exhaustive-deps
  const f = src === "device" ? device : server;
  const worstLessons = useMemo(() => (f ? [...f.lessons].filter(l => l.started > 0).sort((a, b) => a.finishRate - b.finishRate || b.started - a.started).slice(0, 12) : []), [f]);
  return (
    <main className="m1-page al" style={{ paddingBottom: 48 }}>
      <header className="wd-head">
        <Link href="/admin" className="m1-m" aria-label="Back to admin" style={{ width: 44, height: 44 }}><Icon name="back" /></Link>
        <div style={{ flex: 1 }}><div className="m1-t22">learning</div><div className="m1-t11">where learners stop, what takes checks, who comes back</div></div>
      </header>
      <div className="al-bar-row" role="group" aria-label="Whose events">
        {(["everyone", "device"] as Source[]).map(s => <button key={s} type="button" className={`ls-chip ${src === s ? "is-on" : ""}`} aria-pressed={src === s} onClick={() => setSrc(s)}>{s === "everyone" ? "everyone signed in" : "this device"}</button>)}
        {src === "everyone" ? [7, 30, 90].map(d => <button key={d} type="button" className={`ls-chip ${days === d ? "is-on" : ""}`} aria-pressed={days === d} onClick={() => setDays(d)}>{d} days</button>) : null}
      </div>
      {need && src === "everyone" ? (
        <form className="al-pw" onSubmit={e => { e.preventDefault(); void load(pw); }}>
          <label htmlFor="al-pw">admin password, or sign in as staff</label>
          <input id="al-pw" type="password" value={pw} onChange={e => setPw(e.target.value)} autoComplete="current-password" />
          <button type="submit" className="ls-chip">open</button>
        </form>
      ) : null}
      {msg ? <p className="ls-read" role="status">{msg}</p> : null}
      {f ? (
        <>
          <Screen>
            <div className="al-tiles">
              <Tile k="learners" v={f.learners} sub={`${f.events} events`} />
              <Tile k="lessons started" v={f.lessons.reduce((a, l) => a + l.started, 0)} sub={`${f.lessons.reduce((a, l) => a + l.finished, 0)} finished`} />
              <Tile k="back the next day" v={pct(f.returning.nextDayRate)} sub={`${f.returning.nextDay} of ${f.returning.learners}`} />
              <Tile k="gym sessions" v={f.gym.sessions} sub={f.gym.accuracy === null ? "" : `${pct(f.gym.accuracy)} right`} />
            </div>
          </Screen>
          <Silk label="where learners stop" right="lowest finish rate first" />
          {worstLessons.length ? (
            <table className="al-t">
              <thead><tr><th scope="col">lesson</th><th scope="col">started</th><th scope="col">finished</th><th scope="col">finish rate</th><th scope="col">biggest drop after</th></tr></thead>
              <tbody>{worstLessons.map(l => (
                <tr key={l.slug}><td><Link href={`/learn/${l.slug}`}>{l.slug}</Link></td><td>{l.started}</td><td>{l.finished}</td><td className="al-num">{pct(l.finishRate)}<Bar v={l.finishRate} label={pct(l.finishRate)} /></td><td>{l.dropStep ?? "-"}</td></tr>
              ))}</tbody>
            </table>
          ) : <p className="ls-read al-none">no lessons started yet.</p>}
          <Silk label="steps that take the most checks" right="copy and match" />
          <StepTable rows={f.mostChecks} by="checks" />
          <Silk label="steps skipped most" />
          <StepTable rows={f.mostSkipped} by="skips" />
          <Silk label="find your level" right={`${f.placements.reduce((a, p) => a + p.n, 0)} taken`} />
          {f.placements.length ? (
            <table className="al-t"><thead><tr><th scope="col">world</th><th scope="col">level</th><th scope="col">learners</th></tr></thead>
              <tbody>{f.placements.map(p => <tr key={`${p.world}${p.level}`}><td>{p.world}</td><td>{p.level}</td><td>{p.n}</td></tr>)}</tbody></table>
          ) : <p className="ls-read al-none">nobody has taken it yet.</p>}
          <Silk label="end of world challenges" />
          {f.challenges.length ? (
            <table className="al-t"><thead><tr><th scope="col">world</th><th scope="col">rounds played</th><th scope="col">stars a round</th></tr></thead>
              <tbody>{f.challenges.map(c => <tr key={c.world}><td>{c.world}</td><td>{c.n}</td><td>{one(c.avgStars)}</td></tr>)}</tbody></table>
          ) : <p className="ls-read al-none">no rounds played yet.</p>}
        </>
      ) : null}
      <p className="m1-t11" style={{ marginTop: 18 }}>events wait on a learner&apos;s device until they sign in, then go to the database. vercel web analytics gets a few of them as custom events once it is switched on for the project.</p>
    </main>
  );
}

