import type { PointerEvent } from "react";

/** Velocity from how you hit: force where the device reports it, else contact size. */
export function velocity(e: PointerEvent<HTMLElement>): number {
  if (e.pointerType === "pen" || (e.pressure > 0 && e.pressure !== 0.5 && e.pointerType !== "mouse")) {
    return Math.min(1, Math.max(0.2, 0.25 + e.pressure * 0.75));
  }
  const size = Math.max(e.width || 0, e.height || 0);
  if (e.pointerType === "touch" && size > 2) return Math.min(1, Math.max(0.45, 0.4 + (size - 8) / 40));
  return 0.85;
}

/** Velocity from where on the pad you hit: the top edge is loudest (1), the bottom softest (0.3).
 * A pen or a screen that really reports force uses that instead. Pure apart from the rect read. */
export function velocityFromY(y: number, top: number, height: number): number {
  const f = Math.min(1, Math.max(0, (y - top) / Math.max(1, height)));
  return Math.round((0.3 + 0.7 * (1 - f)) * 100) / 100;
}
export function velocityAt(e: PointerEvent<HTMLElement>): number {
  if (e.pointerType === "pen" || (e.pressure > 0 && e.pressure !== 0.5 && e.pointerType !== "mouse")) {
    return Math.min(1, Math.max(0.2, 0.25 + e.pressure * 0.75));
  }
  const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
  return velocityFromY(e.clientY, r.top, r.height);
}
