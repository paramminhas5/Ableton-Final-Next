"use client";
/**
 * The search palette loads the first time someone asks for it (cmd or ctrl + k, or a search key), not with
 * every page: it carries every lesson, device and path. Then it opens straight away and handles itself.
 */
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { PALETTE_OPEN_EVENT } from "@/lib/palette";

const CommandPalette = dynamic(() => import("./CommandPalette").then(m => m.CommandPalette), { ssr: false });

export function LazyPalette() {
  const [want, setWant] = useState(false);
  useEffect(() => {
    if (want) return;
    const onKey = (e: KeyboardEvent) => { if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); setWant(true); } };
    const onEvent = () => setWant(true);
    window.addEventListener("keydown", onKey);
    window.addEventListener(PALETTE_OPEN_EVENT, onEvent);
    return () => { window.removeEventListener("keydown", onKey); window.removeEventListener(PALETTE_OPEN_EVENT, onEvent); };
  }, [want]);
  return want ? <CommandPalette startOpen /> : null;
}
