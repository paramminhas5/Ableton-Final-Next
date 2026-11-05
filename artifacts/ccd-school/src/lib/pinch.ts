/**
 * Pinch zoom for the note grid on a phone (src/components/m1/GridStep.tsx): two fingers spread sideways
 * zoom time, two fingers spread up and down zoom pitch, the way Ableton Note's and Koala's editors do. One
 * finger still taps and drags notes. Pure, so it is tested.
 */
export type PinchAxis = "time" | "pitch";

export const TIME_ZOOM = { min: 1, max: 4 } as const;
export const PITCH_ZOOM = { min: 0.75, max: 2.5 } as const;

/** Which zoom a pinch drives, from how the two fingers sit when the second lands: sideways is time. */
export function pinchAxis(dx: number, dy: number): PinchAxis {
  return Math.abs(dx) >= Math.abs(dy) ? "time" : "pitch";
}

/** The zoom after the fingers moved from `d0` apart to `d` apart along the pinch's axis, clamped. */
export function pinchZoom(z0: number, d0: number, d: number, range: { min: number; max: number }): number {
  const z = z0 * Math.max(1, Math.abs(d)) / Math.max(1, Math.abs(d0));
  return Math.round(Math.max(range.min, Math.min(range.max, z)) * 100) / 100;
}

/**
 * The scroll that keeps what was under the fingers' midpoint under it as the content grows or shrinks:
 * `scroll0` the scroll when the pinch began, `anchor` the midpoint's distance from the view's edge.
 */
export function anchorScroll(scroll0: number, anchor: number, z0: number, z: number): number {
  return Math.max(0, Math.round((scroll0 + anchor) * (z / z0) - anchor));
}

/** "time 2x · pitch 1.5x", or null at 1:1. */
export function zoomLabel(zx: number, zy: number): string | null {
  const f = (z: number) => `${Math.round(z * 10) / 10}x`;
  const parts = [zx !== 1 ? `time ${f(zx)}` : "", zy !== 1 ? `pitch ${f(zy)}` : ""].filter(Boolean);
  return parts.length ? parts.join(" · ") : null;
}
