/**
 * The click (metronome) setting, kept per learner (10 Nov): normal, quiet or off.
 * Off also silences the count-in clicks; the count-in still runs, and its numbers still show.
 */
export type ClickMode = "normal" | "quiet" | "off";
const KEY = "ccd.click";
export const CLICK_EVENT = "ccd:click";
export const CLICK_LEVEL: Record<ClickMode, number> = { normal: 0.55, quiet: 0.22, off: 0.22 };

export function readClick(): ClickMode {
  try { const v = localStorage.getItem(KEY); return v === "quiet" || v === "off" ? v : "normal"; } catch { return "normal"; }
}
export function saveClick(m: ClickMode) {
  try { localStorage.setItem(KEY, m); } catch { /* no storage */ }
  try { window.dispatchEvent(new CustomEvent(CLICK_EVENT, { detail: m })); } catch { /* no window */ }
}
export const nextClick = (m: ClickMode): ClickMode => (m === "normal" ? "quiet" : m === "quiet" ? "off" : "normal");
