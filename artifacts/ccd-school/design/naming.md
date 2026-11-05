# Control names (5 Nov 2026)

Param: "not invent new names, people who use this should learn other instruments as well."

Someone who learns on CCD School should sit down at Ableton Live, Serum, Vital, Surge or a hardware synth and find the same control under the same name. So:

1. If Ableton Live 12 has the control, we use Live's name (the lessons teach Live).
2. Otherwise the name most instruments share, checked in their manuals.
3. Plain words only where they are the standard term (cutoff, resonance, attack, decay, drive, feedback, dry/wet).
4. UI lowercase, no em dashes.

Engine param ids and wire indices did not change, only labels, so every saved song loads and shows the new names (tests/control-names.test.ts loads an old save). Labels live in `engine/src/params.rs` (generated into `src/engine/params.gen.ts`); stepped value names, the oscillator-dependent label and every "same control elsewhere" line live in `src/lib/controlNames.ts`.

## Sources

| key | manual |
| --- | --- |
| live fx | https://www.ableton.com/en/manual/live-audio-effect-reference/ (Auto Filter, Glue Compressor, Echo, Delay, Reverb, Hybrid Reverb, Redux, Saturator, EQ Three, EQ Eight) |
| live inst | https://www.ableton.com/en/manual/live-instrument-reference/ (Wavetable, Operator, Drift, Collision, Tension, Analog, Simpler, Drum Sampler) |
| live m4l | https://www.ableton.com/en/manual/max-for-live-devices/ (DS Kick, DS Snare, DS Tom, DS HH, DS FM, DS Clang) |
| live midi tools | https://www.ableton.com/en/manual/midi-tools/ (Rhythm, Seed generators) |
| live warp | https://www.ableton.com/en/manual/audio-clips-tempo-and-warping/ |
| live record | https://www.ableton.com/en/manual/recording-new-clips/ (Capture MIDI) |
| live racks | https://www.ableton.com/en/manual/instrument-drum-and-effect-racks/ (Macro Variations) |
| live mixer | https://www.ableton.com/en/manual/mixing/ (Send) |
| surge xt | https://surge-synthesizer.github.io/manual-xt (Classic osc, Shape; LFO Rate, Amplitude) |
| tb-303 | https://rolandcloud.com/getmedia/b3e2da28-1951-467e-bd79-7aae34481570/TB-303-Manual-E.pdf |
| tr-808 | https://www.manualslib.com/manual/1294765/Roland-Tr-808.html?page=6 (snare "snappy") |
| elektron | https://cdn.www.elektron.se/media/downloads/digitakt/Digitakt_Quick_Guide_ENG_220928.pdf (parameter locks) |
| valhalla delay | https://valhalladsp.com/2019/04/16/valhalladelay-the-mode-control (Tape, BBD, Digital) |
| casio cz | https://en.wikipedia.org/wiki/Casio_CZ_synthesizers (phase distortion, DCW) |
| rekordbox | https://cdn.rekordbox.com/files/20250907160902/CDJ_XDJ_Control_Mapping_en_CDJ-3000X.pdf (HOT CUE, BEAT SYNC, KEY SHIFT, KEY SYNC, BEAT LOOP) |

## Renamed

| old | new | why (source) | where it shows |
| --- | --- | --- | --- |
| character (synth filter) | circuit | Auto Filter's "Filter Circuit chooser"; Wavetable/Operator/Simpler "circuit" (live fx, live inst) | studio sound 2 on bass, chords, lead; lessons 210, 214 |
| character (every part's filter) | circuit | same | studio fx > filter page on every part; lesson 247 |
| warm | prd · ladder | Live: "PRD uses a ladder design" (live fx) | circuit readout, filter picture label |
| scream | ms2 · sallen-key | Live: "MS2 uses a Sallen-Key design and soft clipping", the MS-20's filter (live fx) | circuit readout, /sound |
| smooth | svf · state variable | Live 12 Auto Filter's state-variable circuit is SVF (live fx) | circuit readout, /sound |
| filter (every part) | cutoff | Auto Filter "Freq", the standard word is cutoff | studio fx > filter page |
| filter (fx instrument) | cutoff | same | studio fx part, sound bank |
| filter drive | drive | Auto Filter and Wavetable filter "Drive" (live fx, live inst) | studio sound 2 |
| wave | shape | Drift Osc 1 "Shape"; Surge XT Classic "Shape: -100% pulse, 0% saw" (live inst, surge) | studio, every shape step that turns it, 19 lessons |
| wave, when osc is wavetable | position | Wavetable "Wave Position" (live inst) | studio sound 2, shape steps |
| wave, when osc is feedback | feedback | Operator "Osc Feedback" (live inst) | same |
| wave, when osc is phase | dcw | Casio CZ: "The DCW adjusts the magnitude of phase distortion" (cz) | same |
| osc: table | wavetable | Live Wavetable; Surge XT "Wavetable" osc type | osc readout |
| osc: phase | phase dist | Casio CZ phase distortion (cz) | osc readout |
| osc: classic, feedback | kept | Surge XT "Classic" osc type; Operator "Feedback" | osc readout |
| voice | exciter | Tension "Exciter Type chooser" (live inst) | studio sound 2 on chords, lead |
| voice: synth | off | Tension's exciter switched off; the oscillators play | readout |
| voice: pluck | plectrum | Tension exciter "Plectrum" | readout, /sound |
| voice: mallet | mallet | Collision "Mallet" section (live inst) | readout, /sound |
| voice: keys | hammer | Tension exciter "Hammer ... found in a piano" | readout, /sound |
| ring | decay | Collision resonator "Decay" (live inst) | studio sound 2 |
| bright | stiffness | Collision mallet "Stiffness adjusts the hardness of the mallet"; Tension hammer/plectrum "Stiffness" | studio sound 2 |
| body (kick) | shape | it chooses the body's wave shape; Saturator "Curve Type" (live fx) | studio drums sound 2, kick pad |
| round, tight, hard | sine, soft clip, hard clip | what each does (sine through, saturated, clipped near square); Saturator curves "Soft Sine", "Hard Curve", "Digital Clip" | readout, /sound |
| sound (perc 1, perc 2) | type | it picks the drum model | studio drums sound 2, perc pads |
| blip | fm | a two-operator fm blip, Live's DS FM (live m4l) | readout |
| snap (drum knob) | noise decay | the noise layer's decay; Collision Noise "D (Decay)" | studio drums sound 2 |
| sweep | pitch env | Drum Sampler "Pitch Env"; DS Kick "Env"; DS Tom "Bend" (live inst, live m4l) | studio drums sound 2 |
| wobble | vibrato | Analog "Vib" (live inst) | studio drums sound 2 |
| glue mix | dry/wet | Glue Compressor "Dry/Wet" (live fx) | mix > master |
| sidechain readout "hears it all" | off | Glue "Sidechain EQ" off | mix > master |
| space | algorithm | Hybrid Reverb "Algorithm" (live fx) | mix > master |
| verb time | decay | Reverb and Hybrid Reverb "Decay" (live fx) | mix > master |
| echo: clean, tape, analogue | digital, tape, bbd | ValhallaDelay modes "Digital", "Tape", "BBD" (valhalla) | mix > master readout |
| repeats | feedback | Echo and Delay "Feedback" (live fx) | mix > master |
| "hold a step, turn a knob" / "locked" | p-lock (parameter lock) | Elektron "Parameter locks enable all trigs to have their own unique parameter values" (elektron); Live 12 has none | studio step bar, readout, step aria label |
| fill (dice fader) | density | Live 12 Rhythm and Seed generators "Density" (live midi tools) | studio steps, grid step |
| repitch | re-pitch | Live warp mode "Re-Pitch" (live warp) | sampler warp step, lessons 209, 238, 239 |
| sampler gate +0 / +100 | trigger / gate | Simpler and Drum Sampler "Trigger" / "Gate" (live inst) | studio sampler sound 2 |

## Checked and kept

| name | why |
| --- | --- |
| cutoff, res, resonance, attack, release, decay, glide, sub, drift, detune, spread, fm, ratio, lfo, lfo rate, env, f decay, f release | standard, or Live's own (Drift "Drift", Operator "Spread", Wavetable "Sub", Drift/Wavetable "Glide") |
| low, mid, high, low cut | EQ Three bands, EQ Eight "low cut" |
| drive, crush, tone, level, pan, send, echo, duck | standard; Live Echo has "Ducking" |
| noise, color | Drum Sampler "Noise Amount", "Noise Color"; DS Snare and DS Tom "Color" |
| random | standard; no manual name to move to |
| open (closed hat) | no shared name found; kept |
| glue, ratio, sidechain | Glue Compressor "Ratio", "Sidechain"; glue is the device's name |
| hall, plate | the two reverb types we built (an FDN hall, a Dattorro plate) |
| capture | Live "Capture MIDI" |
| macro, variation a/b | Live "Macro Variations" |
| beats, warp off | Live warp mode "Beats" |
| sync, cue, loop, key shift (dj) | rekordbox "BEAT SYNC", "HOT CUE", "BEAT LOOP", "KEY SHIFT" |
| snap (recording) | a recording quantise, as in most DAWs; not a sound control |
| arpeggiator up, down, up and down; vary | Live's style list was not spelled out in the manual text; "vary" has no shared name; left |
| step names (shape it, your turn, keep in my song) | our product's own UI, not instrument controls |

## Same control elsewhere

Shown as a fold-out under every shape step ("same control elsewhere"), under the glue and swing steps and the dj tools; on the studio screen after you turn a knob ("elsewhere · ..."), on hover over a studio knob, and on the glossary entry for each renamed control. Only names checked in a manual; a cell is left out rather than guessed.

| our name | elsewhere |
| --- | --- |
| cutoff | live auto filter: freq · live drift: freq · tb-303: cut off freq |
| res | live auto filter: res · live drift: res · tb-303: resonance |
| env | tb-303: env mod |
| circuit | live auto filter: circuit (svf, dfm, ms2, prd) · live wavetable: circuit (clean, osr, ms2, smp, prd) |
| drive (filter) | live auto filter: drive · live wavetable: drive |
| f decay | tb-303: decay |
| shape (osc) | live drift: shape · surge xt classic: shape · live wavetable: wave position · tb-303: waveform (saw or square) |
| osc | surge xt: classic, wavetable (osc types) · live operator: feedback · casio cz: phase distortion, its amount is dcw |
| sub | live wavetable: sub |
| drift | live drift: drift |
| detune | live wavetable: unison amount · live drift: unison strength |
| spread | live operator: spread |
| glide | live drift: glide · live wavetable: glide · tb-303: slide |
| fm | live wavetable: fm amt · live ds fm: amnt |
| ratio | live operator: coarse · live wavetable: fm tune |
| lfo | live auto filter: lfo amt · surge xt: amplitude |
| lfo rate | live auto filter: rate · surge xt: rate |
| exciter | live tension: exciter type (plectrum, hammer) · live collision: mallet |
| decay (resonator) | live collision: resonator decay |
| stiffness | live collision: mallet stiffness · live tension: stiffness |
| low, mid, high | live eq three: low, mid, high |
| low cut | live eq eight: low cut |
| drive (part) | live saturator: drive · live ds kick: drive |
| crush | live redux: bits and rate |
| send | live mixer: send (to a return track with a reverb) |
| echo | live mixer: send (to a return track with a delay) |
| tune | live ds snare: tune · live ds kick: pitch · live drum sampler: transpose |
| decay (drums, bass) | live ds kick: decay · tb-303: decay |
| shape (kick) | live saturator: curve type (soft sine, hard curve, digital clip) · live ds kick: drive |
| type (perc) | live: ds fm, ds clang · live ds clang: clave switch |
| noise | live drum sampler: noise amount · tr-808 snare: snappy |
| noise decay | live collision noise: d (decay) |
| color | live drum sampler: noise color · live ds hh: tone |
| pitch env | live drum sampler: pitch env · live ds kick: env · live ds tom: bend |
| vibrato | live analog: vib |
| start | live simpler: start · live drum sampler: sample start |
| gate | live simpler: trigger / gate · live drum sampler: trigger / gate |
| glue | live glue compressor: threshold (lower is more glue) |
| ratio (master) | live glue compressor: ratio |
| sidechain | live glue compressor: sidechain eq |
| dry/wet | live glue compressor: dry/wet |
| algorithm | live hybrid reverb: algorithm |
| decay (master) | live reverb: decay · live hybrid reverb: decay |
| echo (master) | valhalla delay: mode (tape, bbd, digital) |
| feedback | live echo: feedback · live delay: feedback |
| p-lock | elektron: parameter lock |
| density | live 12 rhythm generator: density · live 12 seed generator: density |
| capture | live: capture midi |
| macro | live racks: macro variations |
| warp | live warp modes: beats, re-pitch |
| swing | live: global groove amount |
| cue, loop, sync, key (dj) | rekordbox: hot cue, beat loop, beat sync, key shift and key sync |

## Not verified

- Serum 2 and Vital: their manuals were not reachable from here, so no Serum or Vital names are listed. Add them only after checking a manual.
- TR-808 front-panel knob names (the service notes name "snappy" by circuit, not the panel's TONE).
- The Glue Compressor's ratio values (2, 4, 10) are what we built; the manual text does not list them.
- rekordbox crossfader curve, stems and beat fx echo names are not in the control mapping checked, so the dj "curve", "stems" and "echo a" controls have no elsewhere line yet.
