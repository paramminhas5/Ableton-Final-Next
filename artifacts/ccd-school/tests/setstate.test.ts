import { describe, it, expect } from "vitest";
import { gzipSync } from "node:zlib";
import { parseAls, parseSetXml, AlsError } from "../src/lib/setstate";

const XML = `<?xml version="1.0" encoding="UTF-8"?>
<Ableton MajorVersion="5" Creator="Ableton Live 12.3.2">
<LiveSet>
<Tracks>
<MidiTrack Id="5">
<Name><EffectiveName Value="Drums" /></Name>
<TrackGroupId Value="-1" />
<DeviceChain>
<Mixer>
<Volume><Manual Value="0.5" /></Volume>
<Speaker><Manual Value="true" /></Speaker>
</Mixer>
<DeviceChain>
<Devices>
<DrumGroupDevice Id="0">
<Gain><Manual Value="0.25" /></Gain>
</DrumGroupDevice>
<Compressor2 Id="1">
<SideChain>
<OnOff><Manual Value="true" /></OnOff>
<RoutedInput>
<Routable>
<Target Value="AudioIn/Track.9/DeviceOut" />
<UpperDisplayString Value="Kick" />
</Routable>
</RoutedInput>
</SideChain>
</Compressor2>
</Devices>
</DeviceChain>
</DeviceChain>
<ClipSlotList>
<ClipSlot><ClipSlot><Value>
<MidiClip Id="0">
<CurrentStart Value="0" />
<CurrentEnd Value="4" />
<Name Value="Beat &amp; Bass" />
<Notes><KeyTracks><KeyTrack>
<Notes>
<MidiNoteEvent Time="0" Duration="0.25" Velocity="100" />
<MidiNoteEvent Time="1" Duration="0.25" Velocity="90" IsEnabled="true" />
</Notes>
<MidiKey Value="36" />
</KeyTrack></KeyTracks></Notes>
</MidiClip>
</Value></ClipSlot></ClipSlot>
</ClipSlotList>
</MidiTrack>
</Tracks>
<ReturnTracks><ReturnTrack Id="9"><Name><EffectiveName Value="A-Reverb" /></Name></ReturnTrack></ReturnTracks>
<MainTrack>
<DeviceChain><Mixer>
<Tempo><Manual Value="128" /></Tempo>
<TimeSignature><Manual Value="203" /></TimeSignature>
</Mixer></DeviceChain>
</MainTrack>
<ScaleInformation><Root Value="9" /><Name Value="1" /></ScaleInformation>
</LiveSet>
</Ableton>
`.replace(/></g, ">\n<"); // Live writes one tag per line

describe("parseSetXml", () => {
  const s = parseSetXml(XML);
  it("reads header, tempo, meter, scale", () => {
    expect(s.liveVersion).toBe("12.3.2");
    expect(s.tempo).toBe(128);
    expect(s.timeSignature).toEqual([6, 4]); // 203 -> (203%99)+1 = 6, 2^(203//99)=4
    expect(s.scale).toEqual({ root: "A", name: "Minor" });
  });
  it("reads tracks, mixer, devices, returns", () => {
    expect(s.tracks).toHaveLength(1);
    const t = s.tracks[0];
    expect(t.name).toBe("Drums");
    expect(t.kind).toBe("midi");
    expect(t.groupId).toBeUndefined();
    expect(t.mixer.volumeDb).toBeCloseTo(-6.02, 1);
    expect(t.devices.map((d) => d.className)).toEqual(["DrumGroupDevice", "Compressor2"]);
    expect(t.devices[0].params.Gain).toBe(0.25);
    expect(s.returns.map((r) => r.name)).toEqual(["A-Reverb"]);
  });
  it("decodes sidechain source by display name", () => {
    expect(s.tracks[0].routing.sidechainSources).toEqual(["Kick"]);
  });
  it("reads clips and notes with pitch from the key track", () => {
    const c = s.tracks[0].clips[0];
    expect(c.name).toBe("Beat & Bass");
    expect(c.view).toBe("session");
    expect(c.lengthBeats).toBe(4);
    expect(c.notes).toEqual([
      { pitch: 36, start: 0, dur: 0.25, vel: 100 },
      { pitch: 36, start: 1, dur: 0.25, vel: 90 },
    ]);
  });
});

describe("parseAls", () => {
  it("reads a gzip archive", async () => {
    const s = await parseAls(gzipSync(Buffer.from(XML)));
    expect(s.tempo).toBe(128);
  });
  it("rejects non-gzip", async () => {
    await expect(parseAls(Buffer.from("hello"))).rejects.toMatchObject({ code: "not_gzip" });
  });
  it("rejects gzip that is not a Live Set", async () => {
    await expect(parseAls(gzipSync(Buffer.from("<a>\n</a>\n")))).rejects.toBeInstanceOf(AlsError);
  });
  it("enforces the expansion limit", async () => {
    const big = gzipSync(Buffer.from(XML + "\n".repeat(50000)));
    await expect(parseAls(big, { maxXmlBytes: 1000, maxTracks: 10, maxNotesPerClip: 10, maxDepth: 64 })).rejects.toMatchObject({ code: "too_large" });
  });
  it("enforces nesting depth", () => {
    const deep = "<Ableton>\n<LiveSet>\n" + "<X>\n".repeat(200) + "</X>\n".repeat(200);
    expect(() => parseSetXml(deep)).toThrow(/nesting/);
  });
});

describe("devices inside racks", () => {
  const rack = `<?xml version="1.0" encoding="UTF-8"?>
<Ableton><LiveSet><Tracks><AudioTrack Id="1"><Name><EffectiveName Value="Bus" /></Name>
<DeviceChain><DeviceChain><Devices>
<AudioEffectGroupDevice Id="0"><Branches><AudioEffectBranch Id="0"><DeviceChain><DeviceChain><Devices>
<Eq8 Id="1"></Eq8><InstrumentGroupDevice Id="2"><Branches><InstrumentBranch Id="0"><DeviceChain><AudioToAudioDeviceChain><Devices><Saturator Id="3"></Saturator></Devices></AudioToAudioDeviceChain></DeviceChain></InstrumentBranch></Branches></InstrumentGroupDevice>
</Devices></DeviceChain></DeviceChain></AudioEffectBranch></Branches></AudioEffectGroupDevice>
<Limiter Id="9"></Limiter>
</Devices></DeviceChain></DeviceChain></AudioTrack></Tracks></LiveSet></Ableton>`;
  it("finds devices nested in racks, at any depth", () => {
    const names = parseSetXml(rack.replace(/>/g, ">\n")).tracks[0].devices.map((d) => d.className);
    expect(names).toContain("AudioEffectGroupDevice");
    expect(names).toContain("Eq8");
    expect(names).toContain("Saturator");
    expect(names).toContain("Limiter");
  });
});
