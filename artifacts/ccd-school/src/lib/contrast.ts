/**
 * High contrast (Live 12 has one): darker text, solid outlines on every key and panel, no grain, thicker focus
 * rings. "system" follows the device's "increase contrast" setting; the choice lives in ccd.contrast and is put on
 * <html data-contrast="high"> before first paint (app/layout.tsx).
 */
export type Contrast = "system" | "normal" | "high";
export const CONTRAST_KEY = "ccd.contrast";
export function readContrast(): Contrast {
  try { const v = localStorage.getItem(CONTRAST_KEY); return v === "normal" || v === "high" ? v : "system"; } catch { return "system"; }
}
export function applyContrast(c: Contrast) {
  try { if (c === "system") localStorage.removeItem(CONTRAST_KEY); else localStorage.setItem(CONTRAST_KEY, c); } catch { /* blocked */ }
  const high = c === "high" || (c === "system" && typeof matchMedia !== "undefined" && matchMedia("(prefers-contrast: more)").matches);
  if (high) document.documentElement.setAttribute("data-contrast", "high"); else document.documentElement.removeAttribute("data-contrast");
}
