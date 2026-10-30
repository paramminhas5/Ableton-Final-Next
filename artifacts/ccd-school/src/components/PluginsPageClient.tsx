"use client";
import { atlasById } from "@/content/atlas";
import { FORMATS, PLUGIN_JOBS, type Price } from "@/content/plugins";

const PRICE: Record<Price, string> = { free: "Free", "free tier": "Free version", paid: "Paid" };

export function PluginsPageClient() {
  return (
    <main className="min-h-screen bg-bone">
      <div className="mx-auto w-full max-w-3xl px-4 py-8 space-y-6">
        <header>
          <div className="font-mono text-[10px] uppercase opacity-40 mb-1">// PLUGIN GUIDE</div>
          <h1 className="font-display text-4xl leading-none">WHICH PLUG-IN, FOR WHAT.</h1>
          <p className="font-mono text-xs opacity-60 mt-3">
            Start with what is already in Live. Add a third-party plug-in only when it does something your stock device
            cannot. Prices and licences change, so check the maker&apos;s page before you buy.
          </p>
        </header>

        <section className="brutal-border bg-white p-4" aria-label="Plug-in formats">
          <h2 className="font-display text-2xl leading-none">PLUG-IN FORMATS</h2>
          <ul className="mt-3 space-y-2">
            {FORMATS.map((f) => (
              <li key={f.name} className="font-mono text-xs">
                <b>{f.name}</b> <span className="opacity-50">({f.where})</span>. {f.note}
              </li>
            ))}
          </ul>
          <p className="font-mono text-xs mt-3">
            Not showing in Live? <a className="underline" href="/setup#plugins">Follow the scan steps</a>.
          </p>
        </section>

        {PLUGIN_JOBS.map((j) => (
          <section key={j.id} id={j.id} className="brutal-border bg-bone p-4 scroll-mt-24">
            <h2 className="font-display text-2xl leading-none">{j.job.toUpperCase()}</h2>
            <p className="font-mono text-xs opacity-70 mt-1">{j.plain}</p>

            {j.stock.length > 0 && (
              <p className="font-mono text-xs mt-3">
                <b>In Live already:</b>{" "}
                {j.stock.map((id, i) => (
                  <span key={id}>
                    {i > 0 && ", "}
                    <a className="underline" href={`/atlas#${id}`}>{atlasById(id)?.name ?? id}</a>
                  </span>
                ))}
              </p>
            )}
            <p className="font-mono text-xs mt-2">{j.beyond}</p>

            <ul className="mt-3 divide-y divide-black/10">
              {j.picks.map((p) => (
                <li key={p.name} className="py-2 font-mono text-xs">
                  <b>{p.name}</b> <span className="opacity-50">by {p.maker}</span>{" "}
                  <span className={`brutal-border px-1 ${p.price === "paid" ? "bg-white" : "bg-acid"}`}>{PRICE[p.price]}</span>
                  <p className="mt-1 opacity-70">{p.why}</p>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </main>
  );
}
