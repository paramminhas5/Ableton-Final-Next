import type { CSSProperties } from "react";

/**
 * The mark: a knob, seen from above, its indicator line at one o'clock.
 * It is the "u" of the wordmark on its own. Draw it anywhere a logo goes: the favicon,
 * the install icon, the banner, a share card.
 *
 * Colours follow the Model 1 faceplate: graphite cap on the body, the line in cream.
 * Pass `tone="light"` for a cap that reads on the light deck, or set `cap` and `line`
 * directly. The indicator can be pink (the go key's colour) when it marks something live.
 */
export const MARK_CAP = "#1c1c1e";
export const MARK_BODY = "#121214";
export const MARK_SEAM = "#0b0b0d";
export const MARK_LINE = "#f2f2f7";
export const MARK_GO = "#ff4d8d";

/** One o'clock: 30 degrees clockwise from twelve. */
const ANGLE = 30;

export function UstadMark({
  size = 24,
  cap = MARK_CAP,
  body = MARK_BODY,
  line = MARK_LINE,
  seam = MARK_SEAM,
  title,
  style,
  className,
}: {
  size?: number | string;
  cap?: string;
  body?: string;
  line?: string;
  seam?: string;
  /** Accessible name. Leave it out and the mark is decorative. */
  title?: string;
  style?: CSSProperties;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
      style={style}
      className={className}
    >
      {title ? <title>{title}</title> : null}
      {/* the body the knob sits in */}
      <circle cx="32" cy="32" r="31" fill={body} />
      {/* the seam between body and cap */}
      <circle cx="32" cy="32" r="25.5" fill={seam} />
      {/* the cap, lit a touch from above */}
      <circle cx="32" cy="32" r="23" fill={cap} />
      <circle cx="32" cy="32" r="23" fill="url(#ustad-mark-sheen)" />
      {/* the indicator at one o'clock */}
      <g transform={`rotate(${ANGLE} 32 32)`}>
        <rect x="30.25" y="12.5" width="3.5" height="13" rx="1.75" fill={line} />
      </g>
      <defs>
        <radialGradient id="ustad-mark-sheen" cx="50%" cy="28%" r="70%">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.14" />
          <stop offset="0.55" stopColor="#ffffff" stopOpacity="0.02" />
          <stop offset="1" stopColor="#000000" stopOpacity="0.18" />
        </radialGradient>
      </defs>
    </svg>
  );
}

/**
 * The same knob as a plain SVG string, for places that cannot render React: the favicon
 * route, a manifest icon, a share card drawn on a canvas.
 */
export function ustadMarkSvg({
  size = 64,
  background,
  radius = 0,
  cap = MARK_CAP,
  body = MARK_BODY,
  line = MARK_LINE,
  seam = MARK_SEAM,
}: {
  size?: number;
  /** Fill behind the knob (a plate). Omit for a transparent background. */
  background?: string;
  /** Corner radius of the plate, in the 64-unit viewBox. */
  radius?: number;
  cap?: string;
  body?: string;
  line?: string;
  seam?: string;
} = {}): string {
  const plate = background ? `<rect width="64" height="64" rx="${radius}" fill="${background}"/>` : "";
  // When there is a plate the knob sits inside it with a little room; otherwise it fills the box.
  const r = background ? 0.78 : 1;
  const cx = 32;
  return [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 64 64">`,
    plate,
    `<circle cx="${cx}" cy="${cx}" r="${31 * r}" fill="${body}"/>`,
    `<circle cx="${cx}" cy="${cx}" r="${25.5 * r}" fill="${seam}"/>`,
    `<circle cx="${cx}" cy="${cx}" r="${23 * r}" fill="${cap}"/>`,
    `<g transform="rotate(${ANGLE} ${cx} ${cx})"><rect x="${cx - 1.75 * r}" y="${cx - 19.5 * r}" width="${3.5 * r}" height="${13 * r}" rx="${1.75 * r}" fill="${line}"/></g>`,
    `</svg>`,
  ].join("");
}
