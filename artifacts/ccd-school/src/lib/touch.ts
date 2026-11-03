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
