"use client";
import { Silk } from "@/components/m1/controls";
import { RefPage } from "@/components/m1/parts";
import { atlasById, editionNeeded } from "@/content/atlas";
import { FORMATS, PLUGIN_JOBS, type Price } from "@/content/plugins";

const PRICE: Record<Price, string> = { free: "free", "free tier": "free version", paid: "paid" };

export function PluginsPageClient() {
  return (
    <RefPage title="plug-ins" meta="plug-in guide" intro="start with what is already in live. add a third-party plug-in only when it does something your stock device cannot. prices and licences change, so check the maker's page before you buy.">
      <Silk label="formats" />
      <div className="ls-panel" style={{ flexDirection: "column", gap: 8 }} aria-label="Plug-in formats">
        {FORMATS.map(f => (
          <div key={f.name} style={{ fontSize: 14, lineHeight: 1.5 }}><b style={{ fontWeight: 500 }}>{f.name}</b> <span className="m1-t11">({f.where})</span><br /><span style={{ color: "var(--sub)", fontWeight: 400 }}>{f.note}</span></div>
        ))}
        <span className="m1-t11">not showing in live? <a href="/setup#plugins" style={{ textDecoration: "underline" }}>follow the scan steps</a>.</span>
      </div>
      {PLUGIN_JOBS.map(j => (
        <section key={j.id} id={j.id} style={{ scrollMarginTop: 80 }}>
          <Silk label={j.job.toLowerCase()} />
          <div className="ls-panel" style={{ flexDirection: "column", gap: 8 }}>
            <span style={{ fontSize: 14, lineHeight: 1.5, fontWeight: 400 }}>{j.plain}</span>
            {j.stock.length > 0 && (
              <span style={{ fontSize: 14, lineHeight: 1.5 }}><b style={{ fontWeight: 500 }}>in live already:</b>{" "}
                {j.stock.map((id, i) => (
                  <span key={id}>{i > 0 && ", "}<a href={`/atlas#${id}`} style={{ textDecoration: "underline" }}>{atlasById(id)?.name ?? id}</a>{editionNeeded(id) && <span className="m1-t11"> ({editionNeeded(id) === "Suite" ? "suite" : "standard+"})</span>}</span>
                ))}
              </span>
            )}
            <span style={{ fontSize: 14, lineHeight: 1.5, color: "var(--sub)", fontWeight: 400 }}>{j.beyond}</span>
          </div>
          {j.picks.map(p => (
            <div key={p.name} className="ls-panel" style={{ flexDirection: "column", gap: 4, marginTop: 8 }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 8, width: "100%", alignItems: "baseline" }}>
                <span><b style={{ fontWeight: 500, fontSize: 16 }}>{p.name}</b> <span className="m1-t11">by {p.maker}</span></span>
                <span className="m1-tag">{PRICE[p.price]}</span>
              </div>
              <span style={{ fontSize: 14, lineHeight: 1.5, color: "var(--sub)", fontWeight: 400 }}>{p.why}</span>
            </div>
          ))}
        </section>
      ))}
    </RefPage>
  );
}
