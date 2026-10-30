import { createGunzip } from "node:zlib";
import { Readable } from "node:stream";
import { StringDecoder } from "node:string_decoder";
import { XmlScanner, type Attrs, type XmlHandler } from "./xml";
import {
  AlsError,
  DEFAULT_LIMITS,
  type Clip,
  type Device,
  type ParseLimits,
  type SetState,
  type Track,
  type TrackKind,
} from "./types";

const NOTE_NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
// Live's scale list, in menu order. Only the first 16 are relied on; others fall back to "scale N".
const SCALE_NAMES = [
  "Major", "Minor", "Dorian", "Mixolydian", "Lydian", "Phrygian", "Locrian", "Whole Tone",
  "Half-whole Dim.", "Whole-half Dim.", "Minor Blues", "Minor Pentatonic", "Major Pentatonic",
  "Harmonic Minor", "Harmonic Major", "Melodic Minor",
];

const TRACK_KIND: Record<string, TrackKind> = {
  MidiTrack: "midi",
  AudioTrack: "audio",
  GroupTrack: "group",
  ReturnTrack: "return",
};

const toDb = (lin: number) => (lin > 0 ? Math.round(20 * Math.log10(lin) * 100) / 100 : -Infinity);
const num = (s: string | undefined, d = 0) => {
  if (s === undefined) return d;
  if (s === "true") return 1;
  if (s === "false") return 0;
  const n = Number(s);
  return Number.isFinite(n) ? n : d;
};

function emptyTrack(id: string, kind: TrackKind): Track {
  return {
    id,
    name: "",
    kind,
    devices: [],
    clips: [],
    mixer: { volumeDb: 0, pan: 0, sendsDb: [], muted: false },
    routing: { sidechainSources: [] },
    automation: [],
  };
}

interface ClipCtx {
  clip: Clip;
  depth: number; // path length of the clip element
  keyPitch: number;
  keyNotes: { start: number; dur: number; vel: number }[];
  curStart: number;
  curEnd: number;
}

class Builder implements XmlHandler {
  state: SetState = {
    source: "upload",
    liveVersion: "",
    tempo: 120,
    timeSignature: [4, 4],
    tracks: [],
    returns: [],
    master: emptyTrack("master", "master"),
    warnings: [],
  };
  private cur: Track | null = null;
  private curDepth = 0;
  private dev: Device | null = null;
  private clip: ClipCtx | null = null;
  private scaleRoot: number | null = null;
  private scaleName: number | null = null;
  private env: { param: string; points: number } | null = null;
  private seenLiveSet = false;
  private noteOverflow = false;
  private scOn = false;
  private scPending: number | null = null;

  constructor(private limits: ParseLimits) {}

  get sawLiveSet() {
    return this.seenLiveSet;
  }

  open(path: string[], a: Attrs) {
    const n = path.length;
    const tag = path[n - 1];
    const v = a.Value;

    if (n === 1) {
      if (tag !== "Ableton") this.state.warnings.push(`unexpected root <${tag}>`);
      const m = /(\d+\.\d+(?:\.\d+)?)/.exec(a.Creator ?? "");
      this.state.liveVersion = m ? m[1] : (a.MinorVersion ?? "");
      return;
    }
    if (path[1] !== "LiveSet") return;
    this.seenLiveSet = true;

    // ---- track boundaries ----
    if (!this.cur) {
      if (n === 4 && (path[2] === "Tracks" || path[2] === "ReturnTracks") && TRACK_KIND[tag]) {
        if (this.state.tracks.length + this.state.returns.length >= this.limits.maxTracks) {
          throw new AlsError("too_many_tracks", `more than ${this.limits.maxTracks} tracks`);
        }
        this.cur = emptyTrack(a.Id ?? String(this.state.tracks.length), TRACK_KIND[tag]);
        this.curDepth = n;
      } else if (n === 3 && (tag === "MainTrack" || tag === "MasterTrack")) {
        this.cur = this.state.master;
        this.curDepth = n;
      } else if (n === 4 && path[2] === "ScaleInformation") {
        if (tag === "Root") this.scaleRoot = num(v, 0);
        if (tag === "Name") this.scaleName = num(v, 0);
      }
      return;
    }

    const t = this.cur;
    const rel = path.slice(this.curDepth).join("/");

    // ---- clips ----
    if (!this.clip && (tag === "MidiClip" || tag === "AudioClip")) {
      const session = path.includes("ClipSlotList");
      this.clip = {
        depth: n,
        keyPitch: 0,
        keyNotes: [],
        curStart: 0,
        curEnd: 0,
        clip: {
          name: "",
          view: session ? "session" : "arrangement",
          kind: tag === "MidiClip" ? "midi" : "audio",
          lengthBeats: 0,
          ...(tag === "MidiClip" ? { notes: [] } : {}),
        },
      };
      return;
    }
    if (this.clip) {
      const c = this.clip;
      const crel = path.slice(c.depth).join("/");
      switch (crel) {
        case "Name": c.clip.name = v ?? ""; break;
        case "CurrentStart": c.curStart = num(v); break;
        case "CurrentEnd": c.curEnd = num(v); break;
        case "IsWarped": c.clip.warp = { on: v === "true", mode: c.clip.warp?.mode ?? "" }; break;
        case "WarpMode": c.clip.warp = { on: c.clip.warp?.on ?? false, mode: String(v ?? "") }; break;
        case "Notes/KeyTracks/KeyTrack": c.keyPitch = 0; c.keyNotes = []; break;
        case "Notes/KeyTracks/KeyTrack/MidiKey": c.keyPitch = num(v); break;
        case "Notes/KeyTracks/KeyTrack/Notes/MidiNoteEvent":
          if (a.IsEnabled === "false") break;
          if ((c.clip.notes?.length ?? 0) + c.keyNotes.length >= this.limits.maxNotesPerClip) {
            if (!this.noteOverflow) this.state.warnings.push(`clip "${c.clip.name}" truncated at ${this.limits.maxNotesPerClip} notes`);
            this.noteOverflow = true;
            break;
          }
          c.keyNotes.push({ start: num(a.Time), dur: num(a.Duration), vel: num(a.Velocity, 100) });
          break;
      }
      return;
    }

    // ---- track fields ----
    switch (rel) {
      case "Name/EffectiveName": t.name = v ?? t.name; return;
      case "Name/UserName": if (v) t.name = v; return;
      case "TrackGroupId": if (v && v !== "-1") t.groupId = v; return;
      case "Color": t.color = num(v); return;
      case "DeviceChain/Mixer/Volume/Manual": t.mixer.volumeDb = toDb(num(v, 1)); return;
      case "DeviceChain/Mixer/Pan/Manual": t.mixer.pan = num(v); return;
      case "DeviceChain/Mixer/Speaker/Manual": t.mixer.muted = v === "false"; return;
      case "DeviceChain/Mixer/Sends/TrackSendHolder/Send/Manual": t.mixer.sendsDb.push(toDb(num(v, 0))); return;
      case "DeviceChain/AudioInputRouting/Target": t.routing.input = v; return;
      case "DeviceChain/AudioOutputRouting/Target": t.routing.output = v; return;
      case "DeviceChain/MidiInputRouting/Target": t.routing.input ??= v; return;
      case "DeviceChain/MidiOutputRouting/Target": t.routing.output ??= v; return;
    }
    if (t === this.state.master) {
      if (rel === "DeviceChain/Mixer/Tempo/Manual") this.state.tempo = num(v, 120);
      else if (rel === "DeviceChain/Mixer/TimeSignature/Manual") {
        const e = num(v, 201);
        this.state.timeSignature = [(e % 99) + 1, 2 ** Math.floor(e / 99)];
      }
    }

    // ---- devices ----
    const parts = rel.split("/");
    if (parts[0] === "DeviceChain" && parts[1] === "DeviceChain" && parts[2] === "Devices") {
      if (parts.length === 4) {
        this.dev = { name: tag, className: tag, params: {} };
        t.devices.push(this.dev);
        return;
      }
      if (this.dev && parts.length === 6 && parts[5] === "Manual" && v !== undefined) {
        const f = Number(v === "true" ? 1 : v === "false" ? 0 : v);
        if (Number.isFinite(f)) this.dev.params[parts[4]] = f;
        return;
      }
      if (this.dev && parts.length === 5 && parts[4] === "UserName" && v) this.dev.name = v;
      if (this.dev && parts[4] === "SideChain") {
        if (parts.length === 7 && parts[5] === "OnOff" && parts[6] === "Manual") this.scOn = v === "true";
        else if (parts.length === 8 && parts[5] === "RoutedInput" && parts[6] === "Routable") {
          if (parts[7] === "Target" && this.scOn && v && !/\/None$/.test(v)) {
            this.scPending = t.routing.sidechainSources.push(v) - 1;
          } else if (parts[7] === "UpperDisplayString" && this.scPending !== null && v) {
            t.routing.sidechainSources[this.scPending] = v;
            this.scPending = null;
          }
        }
      }
      return;
    }
    if (parts[0] === "AutomationEnvelopes" || rel.startsWith("AutomationEnvelopes")) {
      if (rel === "AutomationEnvelopes/Envelopes/AutomationEnvelope") this.env = { param: "", points: 0 };
      else if (this.env && rel.endsWith("EnvelopeTarget/PointeeId")) this.env.param = `pointee:${v}`;
      else if (this.env && /\/Automation\/Events\/(Float|Bool|Enum)Event$/.test(rel)) this.env.points++;
    }
  }

  close(path: string[]) {
    const n = path.length;
    if (this.clip && n === this.clip.depth) {
      const c = this.clip;
      c.clip.startBeat = c.clip.view === "arrangement" ? c.curStart : undefined;
      c.clip.lengthBeats = Math.max(0, c.curEnd - c.curStart);
      this.cur?.clips.push(c.clip);
      this.clip = null;
      return;
    }
    if (this.clip) {
      const c = this.clip;
      if (path.slice(c.depth).join("/") === "Notes/KeyTracks/KeyTrack") {
        for (const k of c.keyNotes) c.clip.notes?.push({ pitch: c.keyPitch, ...k });
        c.keyNotes = [];
      }
      return;
    }
    if (this.dev && this.cur && n === this.curDepth + 4 && path[n - 2] === "DeviceChain") this.dev = null;
    if (this.env && this.cur && path.slice(this.curDepth).join("/") === "AutomationEnvelopes/Envelopes/AutomationEnvelope") {
      if (this.env.points) this.cur.automation.push(this.env);
      this.env = null;
    }
    if (this.cur && n === this.curDepth) {
      const t = this.cur;
      if (t.kind === "return") this.state.returns.push(t);
      else if (t !== this.state.master) this.state.tracks.push(t);
      else t.name ||= "Main";
      this.cur = null;
      this.dev = null;
    }
  }

  finish(): SetState {
    if (this.scaleRoot !== null && this.scaleName !== null) {
      this.state.scale = {
        root: NOTE_NAMES[((this.scaleRoot % 12) + 12) % 12],
        name: SCALE_NAMES[this.scaleName] ?? `scale ${this.scaleName}`,
      };
    }
    return this.state;
  }
}

/** Parse already-decompressed Live XML (tests, and the extension path later). */
export function parseSetXml(xml: string, limits: ParseLimits = DEFAULT_LIMITS): SetState {
  const b = new Builder(limits);
  const sc = new XmlScanner(b, limits.maxDepth, () => {
    throw new AlsError("too_deep", "XML nesting too deep");
  });
  sc.push(xml);
  sc.end();
  if (!b.sawLiveSet) throw new AlsError("not_live_set", "No <LiveSet> found");
  return b.finish();
}

/** Parse a .als file (gzip of XML) by streaming; never holds the whole XML in memory. */
export async function parseAls(buf: Uint8Array, limits: ParseLimits = DEFAULT_LIMITS): Promise<SetState> {
  if (buf.length < 2 || buf[0] !== 0x1f || buf[1] !== 0x8b) {
    throw new AlsError("not_gzip", "Not an .als file (expected gzip data)");
  }
  const b = new Builder(limits);
  const sc = new XmlScanner(b, limits.maxDepth, () => {
    throw new AlsError("too_deep", "XML nesting too deep");
  });
  const dec = new StringDecoder("utf8");
  const gz = createGunzip();
  let total = 0;
  const src = Readable.from([Buffer.from(buf.buffer, buf.byteOffset, buf.byteLength)]);
  try {
    for await (const chunk of src.pipe(gz) as AsyncIterable<Buffer>) {
      total += chunk.length;
      if (total > limits.maxXmlBytes) throw new AlsError("too_large", "Set expands beyond the size limit");
      sc.push(dec.write(chunk));
    }
    sc.push(dec.end());
    sc.end();
  } catch (e) {
    gz.destroy();
    if (e instanceof AlsError) throw e;
    throw new AlsError("not_gzip", `Could not read archive: ${(e as Error).message}`);
  }
  if (!b.sawLiveSet) throw new AlsError("not_live_set", "No <LiveSet> found");
  return b.finish();
}
