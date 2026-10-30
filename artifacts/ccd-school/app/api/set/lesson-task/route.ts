import { NextResponse } from "next/server";
import { AlsError, checkMission, parseAls } from "@/lib/setstate";
import { LIVE_TASKS } from "@/content/liveTasks";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const MAX_BYTES = 30 * 1024 * 1024;

/** Checks one lesson's "Do it in Live" task against an uploaded Set. The file is read in memory and never stored. */
export async function POST(request: Request) {
  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: "Upload a .als file." }, { status: 400 });
  }
  const slug = String(form.get("slug") ?? "");
  const task = Object.hasOwn(LIVE_TASKS, slug) ? LIVE_TASKS[slug] : undefined;
  if (!task) return NextResponse.json({ error: "This lesson has no Live task." }, { status: 404 });
  const file = form.get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "Upload a .als file." }, { status: 400 });
  if (file.size > MAX_BYTES) return NextResponse.json({ error: "That file is over 30 MB." }, { status: 413 });
  try {
    const state = await parseAls(new Uint8Array(await file.arrayBuffer()));
    const r = checkMission({ id: slug, title: task.title, why: task.task, checks: task.checks }, state);
    return NextResponse.json({ passed: r.passed, checks: r.checks });
  } catch (e) {
    if (e instanceof AlsError) return NextResponse.json({ error: "That does not look like a Live Set. Choose a file ending in .als." }, { status: 422 });
    return NextResponse.json({ error: "Could not read that file." }, { status: 500 });
  }
}
