"use client";
/** /devices: the device lab list on Model 1 parts. Instruments first, then effects, then the chain builder. */
import { useMemo, useState } from "react";
import { DEVICES } from "@/content/devices";
import { INSTRUMENTS } from "@/content/instruments";
import { DeviceChainSim } from "@/components/sims/DeviceChainSim";
import { Silk } from "@/components/m1/controls";
import { Chips, ListRow, RefPage, SearchField } from "@/components/m1/parts";

const CATEGORIES = ["all", "instrument", "eq", "dynamics", "drive", "time", "mod", "filter"] as const;
type Cat = (typeof CATEGORIES)[number];

export function DevicesPageClient() {
  const [cat, setCat] = useState<Cat>("all");
  const [q, setQ] = useState("");
  const [chain, setChain] = useState(false);
  const needle = q.trim().toLowerCase();

  const devices = useMemo(() => DEVICES
    .filter(d => cat === "all" || d.category.toLowerCase() === cat)
    .filter(d => !needle || d.name.toLowerCase().includes(needle) || d.tagline.toLowerCase().includes(needle)), [cat, needle]);
  const instruments = useMemo(() => INSTRUMENTS
    .filter(() => cat === "all" || cat === "instrument")
    .filter(i => !needle || i.name.toLowerCase().includes(needle) || i.tagline.toLowerCase().includes(needle)), [cat, needle]);
  const total = devices.length + instruments.length;

  return (
    <RefPage title="device lab" back="/atlas" meta="library" right={`${total} items`}
      intro={`${DEVICES.length} effects and ${INSTRUMENTS.length} instruments explained, each with a real loop and an a/b switch.`}>
      <SearchField value={q} onChange={setQ} label="Search devices and instruments" />
      <Chips options={CATEGORIES} value={cat} onChange={setCat} label="Kind" />

      {instruments.length > 0 && (
        <>
          <Silk label="instruments" right={`${instruments.length}`} />
          {instruments.map(i => (
            <ListRow key={i.slug} href={`/learn/${i.slug}`} led="var(--led-go)" title={i.name} sub={i.tagline} right={<span className="m1-tag">{i.family.toLowerCase()}</span>} />
          ))}
        </>
      )}
      {devices.length > 0 && (
        <>
          <Silk label="effects" right={`${devices.length}`} />
          {devices.map(d => (
            <ListRow key={d.slug} href={`/device/${d.slug}`} led="var(--led-cobalt)" title={d.name} sub={d.tagline} right={<span className="m1-tag">{d.category.toLowerCase()}</span>} />
          ))}
        </>
      )}
      {total === 0 && <div className="ls-panel" style={{ marginTop: 12 }}><span className="m1-t11">no matches. try a different word or kind.</span></div>}

      <Silk label="chain builder" />
      <ListRow onClick={() => setChain(v => !v)} title="build a chain" sub="stack devices on a live drum loop and hear order matter" right={<span className="m1-t11">{chain ? "close" : "open"}</span>} />
      {chain && <div className="ls-panel" style={{ marginTop: 8, display: "block" }}><DeviceChainSim /></div>}
    </RefPage>
  );
}
