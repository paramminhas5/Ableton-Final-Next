/**
 * Text size (10 Nov): "normal" or "big". Big puts <html data-text="big">, which raises every type token a step
 * and the small labels two, so the whole app reads larger without any layout of its own. Set before first paint
 * in app/layout.tsx; chosen in settings.
 */
export type TextSize = "normal" | "big";
export const TEXT_KEY = "ccd.textsize";
export function readTextSize(): TextSize {
  try { return localStorage.getItem(TEXT_KEY) === "big" ? "big" : "normal"; } catch { return "normal"; }
}
export function applyTextSize(t: TextSize) {
  try { if (t === "big") localStorage.setItem(TEXT_KEY, "big"); else localStorage.removeItem(TEXT_KEY); } catch { /* blocked */ }
  if (t === "big") document.documentElement.setAttribute("data-text", "big"); else document.documentElement.removeAttribute("data-text");
}
