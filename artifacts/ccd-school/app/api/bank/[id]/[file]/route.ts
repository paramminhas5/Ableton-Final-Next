/**
 * Param's dj picks, served privately (design/dj-bank-private.md). The audio lives in the `dj-bank` bucket of the
 * ccd-school Supabase project, which is not public. A signed-in learner gets a link that works for ten minutes;
 * everyone else gets a 401 and deck b plays our engine at the track's tempo and key instead.
 *
 * Needs CCD_BANK_SERVICE_KEY (the project's service role key) on the deployment. Without it the route says the
 * bank is off (503) and nothing changes for learners.
 */
import { NextResponse } from "next/server";
import { auth } from "@auth";
import { REAL_TRACKS } from "@/content/djTracks";

export const dynamic = "force-dynamic";

const PROJECT_URL = process.env.CCD_BANK_SUPABASE_URL ?? "https://kpxywzhwcptvfdocnazd.supabase.co";
const BUCKET = "dj-bank";
/** What chop.py writes per track: the whole track and a 16-bar chop at each cue. */
const FILES = new Set(["full.ogg", "intro.ogg", "drums-in.ogg", "break.ogg", "drop.ogg"]);
const IDS = new Set(REAL_TRACKS.map(t => t.id));

export async function GET(_req: Request, { params }: { params: Promise<{ id: string; file: string }> }) {
  const { id, file } = await params;
  if (!IDS.has(id) || !FILES.has(file)) return NextResponse.json({ error: "not in the bank" }, { status: 404 });
  const key = process.env.CCD_BANK_SERVICE_KEY;
  if (!key) return NextResponse.json({ error: "bank off" }, { status: 503 });
  const session = await auth().catch(() => null);
  if (!session?.user?.id) return NextResponse.json({ error: "sign in to hear the real track" }, { status: 401 });
  const res = await fetch(`${PROJECT_URL}/storage/v1/object/sign/${BUCKET}/${id}/${file}`, {
    method: "POST",
    headers: { authorization: `Bearer ${key}`, apikey: key, "content-type": "application/json" },
    body: JSON.stringify({ expiresIn: 600 }),
    cache: "no-store",
  });
  if (!res.ok) return NextResponse.json({ error: "not uploaded yet" }, { status: 404 });
  const { signedURL } = (await res.json()) as { signedURL?: string };
  if (!signedURL) return NextResponse.json({ error: "not uploaded yet" }, { status: 404 });
  return NextResponse.redirect(`${PROJECT_URL}/storage/v1${signedURL}`, { status: 302, headers: { "cache-control": "private, no-store" } });
}
