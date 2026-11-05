/**
 * CCD suite links.
 *
 * CCD.SCHOOL is one product inside Cats Can Dance. The base URL comes from
 * NEXT_PUBLIC_CCD_URL so it can follow the main site without a code change.
 * Paths below are routes that exist on the live catscandance.com today. When
 * the new site replaces it (Episodes, Litter, Catwalk, ...), change the paths
 * here in one place.
 */
export const CCD_URL = (
  process.env.NEXT_PUBLIC_CCD_URL ?? "https://catscandance.com"
).replace(/\/+$/, "");

export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://ccd.school"
).replace(/\/+$/, "");

export interface CcdLink {
  key: string;
  label: string;
  blurb: string;
  href: string;
}

export function ccdHref(path: string): string {
  return `${CCD_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

/** The rest of the CCD world, as seen from School. */
export const CCD_LINKS: CcdLink[] = [
  { key: "home", label: "Cats Can Dance", blurb: "The whole thing: music, nights, artists.", href: ccdHref("/") },
  { key: "events", label: "Events", blurb: "Come to a night. Hear what you are learning on a real system.", href: ccdHref("/events") },
  { key: "artists", label: "Artists", blurb: "The artists CCD plays and books.", href: ccdHref("/artists") },
  { key: "book", label: "Book an artist", blurb: "Bring a CCD artist to your night.", href: ccdHref("/book") },
  { key: "shop", label: "Shop", blurb: "Merch and things for your cat.", href: ccdHref("/shop") },
  { key: "playlists", label: "Playlists", blurb: "Sets and selections to study by ear.", href: ccdHref("/playlists") },
];
