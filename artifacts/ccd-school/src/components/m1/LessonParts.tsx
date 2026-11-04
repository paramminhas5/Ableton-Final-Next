"use client";
/* Small pieces every lesson step shares: the bottom keys, the meta line, Enter to go on. */
import { useEffect, type ReactNode } from "react";
import { GoPill, Icon, Key } from "./controls";

export function Bottom({ left, go }: { left?: { label: string; icon: string; onClick?: () => void; href?: string; disabled?: boolean; aria?: string }; go: { label: ReactNode; onClick?: () => void; href?: string; disabled?: boolean; aria?: string } }) {
  return (
    <div className="ls-bottom">
      <div className="m1-g">
        {left ? (
          <Key label={left.label} onClick={left.onClick} href={left.href} disabled={left.disabled} ariaLabel={left.aria ?? left.label}><Icon name={left.icon} /></Key>
        ) : null}
        <GoPill onClick={go.onClick} href={go.href} disabled={go.disabled} style={{ gridColumn: left ? "span 3" : "1 / -1" }} ariaLabel={go.aria}>{go.label}</GoPill>
      </div>
    </div>
  );
}

export function Meta({ left, right, color }: { left: ReactNode; right?: ReactNode; color?: string }) {
  return <div className="ls-meta"><span style={color ? { color } : undefined}>{left}</span>{right ? <span>{right}</span> : null}</div>;
}

export const useEnter = (fn: (() => void) | null) => {
  useEffect(() => {
    if (!fn) return;
    const h = (e: KeyboardEvent) => {
      if (e.key === "Enter" && !(e.target instanceof HTMLInputElement)) { e.preventDefault(); fn(); }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [fn]);
};
