import { deviceBySlug } from "@/content/devices";
import { DeviceLab } from "@/components/DeviceLab";
import { Link } from "@tanstack/react-router";

export function DeviceLabBySlug({ slug }: { slug: string }) {
  const d = deviceBySlug(slug);
  if (!d) return <div className="brutal-border bg-bone p-4 font-mono text-xs uppercase">Device not found.</div>;
  return (
    <div className="space-y-3">
      <DeviceLab title={d.name} subtitle={d.tagline} deviceLabel={d.name.toUpperCase()}
        factory={d.factory} params={d.params} presets={d.presets} listenFor={d.listenFor} signalFlow={d.signalFlow} />
      <Link to="/device/$slug" params={{ slug: d.slug }}
        className="brutal-border bg-volt text-bone px-4 py-2 font-mono text-xs uppercase brutal-press inline-block">
        OPEN FULL {d.name.toUpperCase()} LAB →
      </Link>
    </div>
  );
}
