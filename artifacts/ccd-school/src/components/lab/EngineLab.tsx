"use client";
import { useEffect, useRef } from "react";

/** Mounts the framework-free engine lab (src/engine/lab.ts). */
export function EngineLab() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let unmount: (() => void) | undefined;
    let cancelled = false;
    void import("@/engine/lab").then(({ mountLab }) => {
      if (!cancelled && ref.current) unmount = mountLab(ref.current);
    });
    return () => {
      cancelled = true;
      unmount?.();
    };
  }, []);
  return <div ref={ref} />;
}
