import type { CSSProperties } from "react";
import { PRODUCT_NAME_LOWER } from "@/lib/product";
import { UstadMark } from "./UstadMark";
import "./brand.css";

/**
 * The wordmark: `ustad`, lowercase, engraved into the faceplate. The "u" is the knob with
 * its indicator at one o'clock; the other letters follow in Space Grotesk, letterspaced,
 * with a light edge above and a dark edge below so the type reads as cut into the panel.
 *
 * `size` is the cap height in px; the knob is drawn a touch taller than the x-height so the
 * two read as one word. Use `glass` on the black screens and on ink.
 */
export function UstadWordmark({
  size = 15,
  glass = false,
  title,
  style,
  className,
}: {
  size?: number;
  glass?: boolean;
  /** Accessible name; defaults to the product name. Pass "" to make it decorative. */
  title?: string;
  style?: CSSProperties;
  className?: string;
}) {
  const rest = PRODUCT_NAME_LOWER.slice(1);
  const label = title === undefined ? PRODUCT_NAME_LOWER : title;
  const knob = Math.round(size * 1.08);
  return (
    <span
      className={["ustad-wm", glass ? "is-glass" : "", className ?? ""].filter(Boolean).join(" ")}
      role={label ? "img" : undefined}
      aria-label={label || undefined}
      aria-hidden={label ? undefined : true}
      style={{ fontSize: size, ...style }}
    >
      <UstadMark size={knob} style={{ marginBottom: Math.round(size * 0.04) }} />
      <span className="ustad-wm__rest" aria-hidden>{rest}</span>
    </span>
  );
}
