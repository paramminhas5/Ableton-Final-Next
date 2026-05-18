import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { deviceBySlug, DEVICES } from "@/content/devices";
import { DeviceLab } from "@/components/DeviceLab";
import { DeviceExplainers } from "@/components/DeviceExplainers";
import { getDeviceExplainer } from "@/content/device-explainers";
import { ClientOnly } from "@/components/ClientOnly";
import { useMode } from "@/lib/mode";

export const Route = createFileRoute("/device/$slug")({
  head: ({ params }) => {
    const d = deviceBySlug(params.slug);
    return { meta: [
      { title: `${d?.name ?? "Device"} — Device Lab` },
      { name: "description", content: d?.tagline ?? "" },
    ]};
  },
  component: DevicePage,
  notFoundComponent: () => <div className="p-12 font-mono">Device not found.</div>,
});

function DevicePage() {
  const { slug } = Route.useParams();
  const { mode } = useMode();
  const advanced = mode === "advanced";
  const d = deviceBySlug(slug);
  if (!d) throw notFound();
  const idx = DEVICES.findIndex((x) => x.slug === slug);
  const prev = DEVICES[idx - 1];
  const next = DEVICES[idx + 1];
  return (
    <div className="max-w-6xl mx-auto p-6 md:p-12 space-y-6">
      <Link to="/devices" className="font-mono text-xs uppercase underline">← all devices</Link>

      <header className="brutal-border bg-acid p-6 brutal-shadow">
        <div className="font-mono text-xs uppercase flex items-center gap-2">
          <span>{d.category} · DEVICE LAB</span>
          <span className={`brutal-border px-2 py-0.5 ${advanced ? "bg-volt text-bone" : "bg-bone text-ink"}`}>{advanced ? "ADVANCED" : "BEGINNER"} MODE</span>
        </div>
        <h1 className="text-5xl md:text-7xl mt-2">{d.name}</h1>
        <p className="font-mono mt-2 text-lg">{d.tagline}</p>
      </header>

      <section className="grid md:grid-cols-2 gap-4">
        <div className="brutal-border bg-card p-4 brutal-shadow-sm">
          <div className="font-mono text-xs uppercase mb-2">WHAT IT DOES</div>
          <p className="font-mono text-sm">{d.what}</p>
        </div>
        <div className="brutal-border bg-card p-4 brutal-shadow-sm">
          <div className="font-mono text-xs uppercase mb-2">HOW IT WORKS</div>
          <p className="font-mono text-sm">{d.how}</p>
        </div>
      </section>

      <ClientOnly fallback={<div className="brutal-border bg-bone p-6 font-mono text-xs uppercase">Loading audio engine…</div>}>
        <DeviceLab
          key={d.slug}
          title={d.name}
          subtitle={d.tagline}
          deviceLabel={d.name.toUpperCase()}
          factory={d.factory}
          params={d.params}
          presets={d.presets}
          listenFor={d.listenFor}
          signalFlow={d.signalFlow}
          defaultSample={d.defaultSample ?? "drum-loop"}
          deviceSlug={d.slug}
        />
      </ClientOnly>

      <div className="brutal-border bg-bone p-3 font-mono text-[11px] uppercase">
        SOURCE: Parameters & terminology modeled on Ableton Live 12's <b>{d.name}</b>{d.source ? ` — ${d.source}` : ""}. DSP is a simplified Web Audio approximation — directionally accurate, not a clone.
      </div>

      {(d.commonMistakes || d.workedExample || d.related) && (
        <section className="grid md:grid-cols-2 gap-4">
          {d.commonMistakes && d.commonMistakes.length > 0 && (
            <div className="brutal-border bg-hot text-bone p-4">
              <div className="font-display text-xl mb-2">COMMON MISTAKES</div>
              <ul className="space-y-1 font-mono text-sm">
                {d.commonMistakes.map((m, i) => <li key={i}>✗ {m}</li>)}
              </ul>
            </div>
          )}
          {d.workedExample && (
            <div className="brutal-border bg-acid p-4">
              <div className="font-display text-xl mb-2">WORKED EXAMPLE</div>
              <div className="font-mono text-sm font-bold mb-2">GOAL: {d.workedExample.goal}</div>
              <ol className="list-decimal list-inside space-y-1 font-mono text-sm">
                {d.workedExample.steps.map((s, i) => <li key={i}>{s}</li>)}
              </ol>
              {d.workedExample.preset && (
                <div className="font-mono text-xs uppercase mt-3 opacity-80">▸ Try preset: <b>{d.workedExample.preset}</b></div>
              )}
            </div>
          )}
          {d.related && (d.related.devices?.length || d.related.missions?.length) ? (
            <div className="brutal-border bg-card p-4 md:col-span-2">
              <div className="font-display text-xl mb-2">RELATED</div>
              <div className="flex flex-wrap gap-2">
                {d.related.devices?.map((s) => {
                  const r = DEVICES.find((x) => x.slug === s);
                  if (!r) return null;
                  return (
                    <Link key={s} to="/device/$slug" params={{ slug: s }} className="brutal-border bg-bone px-3 py-1 font-mono text-xs uppercase brutal-press">
                      → {r.name}
                    </Link>
                  );
                })}
              </div>
            </div>
          ) : null}
        </section>
      )}

      {/* Deep Explanations — advanced mode only */}
      {advanced ? (
        <div className="brutal-border bg-card p-6 space-y-4">
          <div className="font-mono text-xs uppercase opacity-70">▸ ADVANCED · ENGINEER NOTES</div>
          <DeviceExplainers blocks={getDeviceExplainer(slug)} />
        </div>
      ) : (
        <div className="brutal-border bg-bone p-4 font-mono text-xs uppercase opacity-80">
          ▸ Want the technical breakdown, DSP notes and edge cases? Switch to <b>ADVANCED</b> mode in the header.
        </div>
      )}

      <div className="flex justify-between gap-3">
        {prev ? (
          <Link to="/device/$slug" params={{ slug: prev.slug }} className="brutal-border bg-bone px-4 py-3 font-mono uppercase brutal-press">← {prev.name}</Link>
        ) : <span />}
        {next ? (
          <Link to="/device/$slug" params={{ slug: next.slug }} className="brutal-border bg-acid px-4 py-3 font-mono uppercase brutal-press">{next.name} →</Link>
        ) : <span />}
      </div>
    </div>
  );
}
