import { CCD_LINKS, CCD_URL } from "@/lib/ccd";

/** "From the CCD scene" cards. Server component, no client JS. */
export function CcdSceneCards() {
  return (
    <section
      aria-labelledby="ccd-scene-heading"
      className="border-t-4 border-ink bg-bone px-4 py-10 md:py-14"
    >
      <div className="mx-auto max-w-5xl">
        <p className="font-mono text-xs uppercase tracking-widest opacity-50">
          Part of Cats Can Dance
        </p>
        <h2
          id="ccd-scene-heading"
          className="mt-1 font-display text-3xl md:text-4xl uppercase leading-[0.9]"
        >
          Learn it. Then go hear it.
        </h2>
        <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {CCD_LINKS.map((l) => (
            <li key={l.key}>
              <a
                href={l.href}
                className="block h-full brutal-border bg-bone p-4 chunk-shadow brutal-press hover:bg-acid transition-colors"
              >
                <span className="font-display text-lg uppercase">{l.label}</span>
                <span className="mt-2 block font-sans text-sm opacity-80">
                  {l.blurb}
                </span>
                <span className="mt-3 block font-mono text-[10px] uppercase tracking-widest opacity-50">
                  {CCD_URL.replace(/^https?:\/\//, "")} &rarr;
                </span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/** Compact link row for the desktop footer. */
export function CcdFooterLinks() {
  return (
    <nav aria-label="Cats Can Dance" className="flex flex-wrap items-center gap-x-4 gap-y-1">
      {CCD_LINKS.map((l) => (
        <a
          key={l.key}
          href={l.href}
          className="font-mono text-[10px] uppercase tracking-widest opacity-60 hover:text-acid hover:opacity-100"
        >
          {l.label}
        </a>
      ))}
    </nav>
  );
}
