import { describe, it, expect } from "vitest";
import { checkMissions, SET_MISSIONS, type SetState } from "../src/lib/setstate";

const trk = (o: Partial<SetState["tracks"][number]>) => ({
  id: "1", name: "x", kind: "midi" as const, devices: [], clips: [],
  mixer: { volumeDb: 0, pan: 0, sendsDb: [], muted: false },
  routing: { sidechainSources: [] }, automation: [], ...o,
});
const base = (o: Partial<SetState> = {}): SetState => ({
  source: "upload", liveVersion: "12.3", tempo: 120, timeSignature: [4, 4],
  tracks: [], returns: [], master: trk({ kind: "master" }), warnings: [], ...o,
});
const dev = (className: string) => ({ name: className, className, params: {} });
const by = (r: ReturnType<typeof checkMissions>, id: string) => r.find((m) => m.id === id)!;

describe("mission checker", () => {
  it("fails everything on an empty set", () => {
    expect(checkMissions(SET_MISSIONS, base()).every((m) => !m.passed)).toBe(true);
  });
  it("name check ignores Live's default names", () => {
    const r = checkMissions(SET_MISSIONS, base({ tracks: [trk({ name: "1-MIDI" }), trk({ name: "Kick" })] }));
    expect(by(r, "name-your-tracks").passed).toBe(false);
    const ok = checkMissions(SET_MISSIONS, base({ tracks: [trk({ name: "Bass" }), trk({ name: "Kick" })] }));
    expect(by(ok, "name-your-tracks").passed).toBe(true);
  });
  it("sidechain needs a compressor and a source", () => {
    const withComp = base({ tracks: [trk({ devices: [dev("Compressor2")] })] });
    expect(by(checkMissions(SET_MISSIONS, withComp), "pump-the-bass").passed).toBe(false);
    const full = base({ tracks: [trk({ devices: [dev("Compressor2")], routing: { sidechainSources: ["Kick"] } })] });
    expect(by(checkMissions(SET_MISSIONS, full), "pump-the-bass").passed).toBe(true);
  });
  it("drum bus needs a group with children and fx on the group", () => {
    const s = base({ tracks: [trk({ id: "g", kind: "group", devices: [dev("GlueCompressor")] }), trk({ id: "a", groupId: "g" }), trk({ id: "b", groupId: "g" })] });
    expect(by(checkMissions(SET_MISSIONS, s), "drum-bus").passed).toBe(true);
    const noFx = base({ tracks: [trk({ id: "g", kind: "group" }), trk({ id: "a", groupId: "g" }), trk({ id: "b", groupId: "g" })] });
    expect(by(checkMissions(SET_MISSIONS, noFx), "drum-bus").passed).toBe(false);
  });
  it("return mission needs fx on a return and a raised send", () => {
    const s = base({ returns: [trk({ kind: "return", devices: [dev("Reverb")] })], tracks: [trk({ mixer: { volumeDb: 0, pan: 0, sendsDb: [-12], muted: false } })] });
    expect(by(checkMissions(SET_MISSIONS, s), "space-with-a-return").passed).toBe(true);
    const off = base({ returns: [trk({ kind: "return", devices: [dev("Reverb")] })], tracks: [trk({ mixer: { volumeDb: 0, pan: 0, sendsDb: [-Infinity], muted: false } })] });
    expect(by(checkMissions(SET_MISSIONS, off), "space-with-a-return").passed).toBe(false);
  });
});
