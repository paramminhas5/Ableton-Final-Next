"use client";
/**
 * A world as a 16-step sequencer. Each key is a lesson; done keys have their light on,
 * the next one is black, the rest wait. Banks page through the world 16 steps at a time.
 * The screen shows the step you pressed and what it adds to your track.
 */
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useProgress } from "@/lib/progress";
import { useLearnMode } from "@/lib/mode";
import { useTrack, offerFor, previewLayer } from "@/lib/track";
import { audition } from "@/lib/track-engine";
import { worldSteps, missionAny, missionImage, missionTools, minutesFor, WORLD_LABEL, type WorldId } from "@/lib/worldOrder";
import { Dash, GoPill, Icon, Key, Pad, Screen, Silk, Switch, WORLD_LED } from "./controls";
import { DuoFilters } from "./Today";

export function World({ world }: { world: WorldId }) {
  const { progress } = useProgress();
  const { learnMode, setLearnMode } = useLearnMode();
  const { track } = useTrack();
  const done = progress.completedMissions;
  const steps = worldSteps(world);
  const nextIdx = Math.max(0, steps.findIndex(s => !done[s.slug]));
  const banks = Math.max(1, Math.ceil(steps.length / 16));
  const [bank, setBank] = useState(Math.floor(nextIdx / 16));
  const [pick, setPick] = useState(nextIdx);
  useEffect(() => { setBank(Math.floor(nextIdx / 16)); setPick(nextIdx); }, [nextIdx]);

  const flow = learnMode !== "classic";
  const cur = steps[pick] ?? steps[0];
  const mission = cur ? missionAny(cur.slug) : undefined;
  const offer = useMemo(() => (mission ? offerFor(track, mission) : null), [track, mission]);
  const locked = (i: number) => flow && i > nextIdx && !done[steps[i]?.slug];
  const doneCount = steps.filter(s => done[s.slug]).length;
  const led = WORLD_LED[world];

  return (
    <div className="m1-page">
      <header style={{ display: "flex", alignItems: "center", gap: 12, height: 48 }}>
        <Link href="/dashboard" className="m1-m" aria-label="Back" style={{ width: 44 }}><Icon name="back" /></Link>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="m1-t22">{WORLD_LABEL[world]}</div>
          <div className="m1-t11">{doneCount} of {steps.length} done</div>
        </div>
        <Dash color={led} />
      </header>

      <div style={{ marginTop: 6 }}>
        <Switch label="how you learn" value={flow ? "flow" : "free"} onChange={id => setLearnMode(id === "flow" ? "flow" : "classic")}
          options={[{ id: "flow", label: "flow" }, { id: "free", label: "free" }]} />
        <div className="m1-t11" style={{ marginTop: 6, textAlign: "center" }}>{flow ? "in order, one step opens the next" : "every step is open, go where you like"}</div>
      </div>

      {cur && mission && (
        <Screen style={{ marginTop: 10 }}>
          <div style={{ display: "flex", gap: 14, margin: -16, minHeight: 176 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={missionImage(cur.slug, world)} alt="" style={{ width: 132, objectFit: "cover", filter: `url(#duo-${world})` }} />
            <div style={{ flex: 1, padding: "16px 16px 14px 0", display: "flex", flexDirection: "column", justifyContent: "space-between", minWidth: 0 }}>
              <span style={{ fontSize: 40, fontWeight: 200, lineHeight: 1 }}>{String(pick + 1).padStart(2, "0")}</span>
              <div>
                <div className="m1-t22" style={{ textTransform: "lowercase" }}>{mission.title}</div>
                {offer && <div className="m1-ss" style={{ marginTop: 6, color: "var(--disp-ink)" }}>{offer.isNew ? `adds ${offer.kind} to your track` : `changes your ${offer.kind}`}</div>}
                <div className="m1-ss" style={{ marginTop: 4 }}>{minutesFor(cur.slug)} min · {missionTools(cur.slug).join(" · ")}{done[cur.slug] ? " · done" : ""}</div>
              </div>
            </div>
          </div>
        </Screen>
      )}

      <Silk label={(steps[bank * 16]?.pathTitle ?? "").toLowerCase()} right={`steps ${bank * 16 + 1}–${Math.min(steps.length, bank * 16 + 16)}`} />
      <div className="m1-g">
        {Array.from({ length: 16 }, (_, k) => {
          const i = bank * 16 + k;
          const s = steps[i];
          if (!s) return <div key={k} className="m1-m is-dim" aria-hidden />;
          const isDone = !!done[s.slug];
          const isNext = i === nextIdx && !isDone;
          if (locked(i)) {
            return <div key={k} className="m1-m is-dim" aria-label={`Step ${i + 1}, locked`}><span className="m1-leg" style={{ fontSize: 22, color: "var(--sub)" }}>{i + 1}</span></div>;
          }
          return (
            <Key key={k} cap={isNext ? "blk" : ""} led={isDone ? led : null} onClick={() => setPick(i)} ariaPressed={pick === i}
              ariaLabel={`Step ${i + 1}, ${s.title}${isDone ? ", done" : isNext ? ", next" : ""}`}
              capStyle={pick === i && !isNext ? { boxShadow: "0 0 0 2px var(--go), 0 3px 0 var(--cs2)" } : undefined}>
              <span className="m1-leg" style={{ fontSize: 24, color: isDone || isNext ? undefined : "var(--sub)" }}>{i + 1}</span>
            </Key>
          );
        })}
      </div>

      {banks > 1 && (
        <>
          <Silk label="bank" />
          <div style={{ display: "grid", gridTemplateColumns: `repeat(${Math.min(banks, 8)}, 1fr)`, gap: 6 }}>
            {Array.from({ length: banks }, (_, b) => (
              <Pad key={b} height={36} lit={b === bank ? led : null} ariaPressed={b === bank} onClick={() => setBank(b)} ariaLabel={`Bank ${b + 1}`}>{b + 1}</Pad>
            ))}
          </div>
        </>
      )}

      <div className="m1-g" style={{ marginTop: 16 }}>
        <Key label="preview" ariaLabel="Hear what this step adds" disabled={!offer} onClick={() => offer && audition(previewLayer(track, offer))}><Icon name="hear" /></Key>
        {cur && (
          <GoPill href={locked(pick) ? undefined : `/learn/${cur.slug}`} disabled={locked(pick)} style={{ gridColumn: "span 3" }} ariaLabel={`Start step ${pick + 1}`}>
            <Icon name="play" />{done[cur.slug] ? "redo" : "start"} step {String(pick + 1).padStart(2, "0")}
          </GoPill>
        )}
      </div>
      <DuoFilters />
    </div>
  );
}
