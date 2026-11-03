"use client";
import { usePathname } from "next/navigation";
/** Footer on every screen: the cat, whose project this is, and where to find the nights. */
import { CCD_LINKS, CCD_URL } from "@/lib/ccd";
import { CAT_SRC } from "./shell";

export function Footer() {
  const p = usePathname() ?? "/";
  if (p.startsWith("/studio") || p.startsWith("/dj") || /^\/(learn|mission)\/[^/]+/.test(p)) return null;
  return (
    <footer className="m1-page" style={{ paddingTop: 28, paddingBottom: 132, width: "100%" }}>
      <div className="m1-silk" aria-hidden><i className="l" /><span>cats can dance</span><i className="r" /></div>
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 14 }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={CAT_SRC} alt="" width={48} style={{ flex: "none", filter: "var(--cat-filter, none)" }} />
        <div>
          <div className="m1-t15" style={{ fontWeight: 600 }}>ccd school</div>
          <div className="m1-t11" style={{ marginTop: 2 }}>
            a <a href={CCD_URL} style={{ textDecoration: "underline", textUnderlineOffset: 2 }}>cats can dance</a> project, made in bengaluru
          </div>
        </div>
      </div>
      <nav aria-label="Cats Can Dance" style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 14 }}>
        {CCD_LINKS.map(l => (
          <a key={l.key} href={l.href} className="m1-tag" style={{ height: 30, padding: "0 12px" }}>{l.label.toLowerCase()}</a>
        ))}
      </nav>
    </footer>
  );
}
