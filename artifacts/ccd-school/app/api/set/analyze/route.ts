import { NextResponse } from "next/server";
import { AlsError, SET_MISSIONS, checkMissions, parseAls } from "@/lib/setstate";
import { summarizeSet } from "@/lib/setstate/summary";
import { BUILD_STAGES } from "@/content/build";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const MAX_BYTES = 30 * 1024 * 1024;

const MESSAGES: Record<AlsError["code"], string> = {
  not_gzip: "That does not look like an Ableton Live Set. Choose a file ending in .als.",
  too_large: "This Set is too large to read here. Try Collect All and Save, or a smaller Set.",
  not_live_set: "We could not find a Live Set inside that file.",
  too_deep: "This file has an unusual structure we cannot read.",
  too_many_tracks: "This Set has more tracks than we can read here.",
};

/** Reads a Live Set in memory and returns a summary plus mission results. The file is never stored. */
export async function POST(request: Request) {
  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: "Upload a .als file." }, { status: 400 });
  }
  const file = form.get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "Upload a .als file." }, { status: 400 });
  if (file.size > MAX_BYTES) return NextResponse.json({ error: "That file is over 30 MB." }, { status: 413 });
  try {
    const state = await parseAls(new Uint8Array(await file.arrayBuffer()));
    return NextResponse.json({ set: summarizeSet(state), missions: checkMissions(SET_MISSIONS, state),
      build: checkMissions(BUILD_STAGES.map((b) => ({ id: b.id, title: b.title, why: b.why, checks: b.checks })), state),
    });
  } catch (e) {
    if (e instanceof AlsError) return NextResponse.json({ error: MESSAGES[e.code] }, { status: 422 });
    return NextResponse.json({ error: "Could not read that file." }, { status: 500 });
  }
}
