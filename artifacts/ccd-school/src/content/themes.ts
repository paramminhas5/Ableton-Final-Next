// Theme palettes — applied via `data-theme` on <html>. Ported from
// paramminhas5/ccdfinal (CCD reference palette), mapped onto our 6-token
// system: --bone (surface), --ink (text), --acid (accent), --hot (hotPink),
// --volt (electricBlue), --sun (acidYellow/warm).
export type ThemeId =
  | "ccd-classic"
  | "default"
  | "brutalist"
  | "midnight"
  | "sunburn"
  | "original"
  | "synthwave"
  | "y2k"
  | "matcha"
  | "mono"
  | "sunset"
  | "oceanic"
  | "candy"
  | "forest"
  | "pinkpunk"
  | "linework";

export type ThemeDef = {
  id: ThemeId;
  name: string;
  // Swatch shown in the picker — [surface, ink, accent, hotPink]
  swatch: [string, string, string, string];
};

export const THEMES: ThemeDef[] = [
  { id: "ccd-classic", name: "CCD Classic", swatch: ["#F5F0E8", "#0B0B0B", "#C6FF00", "#FF2D2D"] },
  { id: "default",     name: "Default",     swatch: ["#E8E3DA", "#0B0B0B", "#D9E94A", "#D62828"] },
  { id: "brutalist",   name: "Brutalist",   swatch: ["#E8E3DA", "#0A0E1A", "#C6F560", "#D62828"] },
  { id: "midnight",    name: "Midnight",    swatch: ["#0C1426", "#E8E3DA", "#9AE6B4", "#3B72E0"] },
  { id: "sunburn",     name: "Sunburn",     swatch: ["#E8E3DA", "#0A0E1A", "#C6F560", "#E76F2B"] },
  { id: "original",    name: "Original",    swatch: ["#FBF1DB", "#100F0F", "#FFE21F", "#FF6FAA"] },
  { id: "synthwave",   name: "Synthwave",   swatch: ["#15082E", "#F5EDFC", "#FF3D8A", "#00DEFF"] },
  { id: "y2k",         name: "Y2K",         swatch: ["#F0E6FF", "#1A0B3D", "#FFFF00", "#FF6FAA"] },
  { id: "matcha",      name: "Matcha",      swatch: ["#EAE2C2", "#27332A", "#E5B73B", "#D26544"] },
  { id: "mono",        name: "Mono+1",      swatch: ["#FAFAFA", "#0A0A0A", "#FF4500", "#FF4500"] },
  { id: "sunset",      name: "Sunset",      swatch: ["#FFE0C2", "#2B0F18", "#FF7676", "#FFB100"] },
  { id: "oceanic",     name: "Oceanic",     swatch: ["#03253F", "#E0F7FF", "#FFB100", "#F23A77"] },
  { id: "candy",       name: "Candy Pop",   swatch: ["#FFEAF2", "#3D0C24", "#FF4D8C", "#FFE74C"] },
  { id: "forest",      name: "Forest",      swatch: ["#1B2E1E", "#F1E5C2", "#C7D769", "#B33A3A"] },
  { id: "pinkpunk",    name: "Pink Punk",   swatch: ["#000000", "#FFFFFF", "#FF1E7E", "#FF1E7E"] },
  { id: "linework",    name: "Linework",    swatch: ["#FFFFFF", "#000000", "#000000", "#000000"] },
];

export const DEFAULT_THEME: ThemeId = "ccd-classic";
