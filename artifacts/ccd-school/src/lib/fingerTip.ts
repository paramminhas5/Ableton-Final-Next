/**
 * Touch to reveal (Koala, OP-1 field): while a finger drags a knob, a fader or a picture, its name and value
 * sit just above the finger (src/components/m1/controls.tsx FingerTip). Where the tip goes, pure so it is
 * tested: centred on the finger, its bottom edge 52 px above the touch point (a fingertip covers about 40 px
 * above where it lands), kept 8 px inside the screen's sides and never above the top.
 */
export const TIP_LIFT = 52;

/** A rough width for the tip from its text (17 px value, 10.5 px label, 12 px padding each side). */
export function fingerTipWidth(label: string, value: string): number {
  return Math.max(64, Math.ceil(Math.max(label.length * 5.6, value.length * 9)) + 24);
}

/** `left` is the tip's centre and `top` its bottom edge (the tip is drawn translated by -50%, -100%). */
export function fingerTipPlace(x: number, y: number, viewW: number, tipW = 120): { left: number; top: number } {
  const half = Math.min(tipW, viewW - 16) / 2;
  return { left: Math.round(Math.max(8 + half, Math.min(viewW - 8 - half, x))), top: Math.round(Math.max(TIP_LIFT, y - TIP_LIFT)) };
}
