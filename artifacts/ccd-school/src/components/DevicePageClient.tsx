"use client";
import Link from "next/link";
import { deviceBySlug, DEVICES } from "@/content/devices";
import { DeviceLab } from "@/components/DeviceLab";
import { DeviceExplainers } from "@/components/DeviceExplainers";
import { getDeviceExplainer } from "@/content/device-explainers";
import { ClientOnly } from "@/components/ClientOnly";

export function DevicePageClient({ slug }: { slug: string }) {
  const d = deviceBySlug(slug);
  if (!d) return <div className="p-12 font-mono">Device not found: {slug}</div>;
  const idx = DEVICES.findIndex((x) => x.slug === slug);
  const prev = DEVICES[idx - 1];
  const next = DEVICES[idx + 1];
  const explainer = getDeviceExplainer(slug);

  return (
    <div className="max-w-6xl mx-auto p-6 md:p-12 space-y-6">
      <Link href="/devices" className="font-mono text-xs uppercase underline">← all devices</Link>
      <header className="brutal-border bg-acid p-6 brutal-shadow">
        <div className="font-mono text-xs uppercase flex items-center gap-2">
          <span>{d.category} · DEVICE LAB</span>
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
        <DeviceLab key={d.slug} title={d.name} subtitle={d.tagline} deviceLabel={d.name.toUpperCase()} factory={d.factory} params={d.params} listenFor={d.listenFor} signalFlow={d.signalFlow} presets={d.presets} />
      </ClientOnly>
      {explainer && <DeviceExplainers blocks={explainer} />}
      <nav className="flex gap-3 flex-wrap">
        {prev && <Link href={`/device/${prev.slug}`} className="brutal-border px-4 py-2 font-mono text-xs uppercase brutal-press hover:bg-sun">← {prev.name}</Link>}
        {next && <Link href={`/device/${next.slug}`} className="brutal-border px-4 py-2 font-mono text-xs uppercase brutal-press hover:bg-sun">{next.name} →</Link>}
        <Link href="/devices" className="brutal-border px-4 py-2 font-mono text-xs uppercase brutal-press hover:bg-sun ml-auto">ALL DEVICES</Link>
      </nav>
    </div>
  );
}
