//! The engine core: transport, 8 layers, shared returns, master.
//!
//! Threading: the UI side only pushes `Cmd`s and pops `OutEv`s. The audio side calls
//! `process`. Nothing in `process` allocates or locks.

use crate::analysis::{Clash, ClashDetector, LayerInfo, LayerMeter};
use crate::dsp::env::Decay;
use crate::dsp::osc::Sine;
use crate::fx::{Echo, Reverb};
use crate::loudness::Loudness;
use crate::master::{Master, TruePeak, MASTER_DELAY};
use crate::inst::{Bass, DrumRack, FxSynth, Lead, Poly, Sampler};
use crate::params::*;
use crate::ring::Ring;
use crate::seq::{fire_range, NoteEv, Pattern, MAX_OFFS};
use crate::strip::Strip;

pub const MAX_LAYERS: usize = 8;
pub const MAX_BLOCK: usize = 4096;

/// Fixed delay from a note being triggered to it leaving the engine, in samples: the 2x
/// stages in the voice and in the strip (IIR half-bands, 0.10 ms at 48 kHz), plus the
/// master limiter's look-ahead. The sequencer fires this early so sequenced notes land
/// exactly on the grid.
pub const VOICE_LATENCY: usize = (2.0 * crate::dsp::oversample::DRIVE_DELAY) as usize;
/// 23 samples, 0.48 ms at 48 kHz (it was 48, 1 ms, before the IIR half-bands).
pub const LATENCY: usize = VOICE_LATENCY + MASTER_DELAY;
/// Mix parameters a compare snapshot holds: eq, fx and mix, every layer param below
/// the instrument block.
pub const MIX_PARAMS: usize = 12;
/// Analysis reports per second while analysis is on.
pub const METER_HZ: f32 = 30.0;
/// The master's readings come with this layer number.
pub const MASTER_LAYER: u32 = MAX_LAYERS as u32;
/// Most clashes reported at once.
pub const MAX_CLASHES: usize = 6;

// ── wire format ──────────────────────────────────────────────────────────────

pub mod cmd {
    pub const NOTE_ON: u32 = 1;
    pub const NOTE_OFF: u32 = 2;
    pub const PARAM: u32 = 3;
    pub const INSTRUMENT: u32 = 4;
    pub const TEMPO: u32 = 5;
    pub const LOOP: u32 = 6;
    pub const PLAY: u32 = 7;
    pub const STOP: u32 = 8;
    pub const RECORD: u32 = 9;
    pub const RECORD_OFF: u32 = 10;
    pub const EV_CLEAR: u32 = 11;
    pub const EV_ADD: u32 = 12;
    pub const EV_COMMIT: u32 = 13;
    pub const DUCK: u32 = 14;
    pub const METRONOME: u32 = 15;
    pub const ALL_OFF: u32 = 16;
    pub const LOCATE: u32 = 17;
    pub const SWING: u32 = 18;
    /// Stop following Link (sent from the UI thread; applied on the audio thread).
    pub const LINK_OFF: u32 = 19;
    /// Master param `a` to normalised `x` (see MASTER_PARAMS).
    pub const MASTER: u32 = 20;
    /// Remember every layer's mix and the master as "before" for compare.
    pub const SNAPSHOT: u32 = 21;
    /// a = 1: play the snapshot; a = 0: back to the live mix. Glides, never clicks.
    pub const COMPARE: u32 = 22;
    /// a = 1: measure every layer and report it (METER, BANDS, CLASH, MASTER_METER).
    pub const ANALYSE: u32 = 23;
    /// Note repeat. note `a`, velocity `x` (0 lets go), division `y` in beats (0.25 = 1/16,
    /// 0.125 = 1/32). Hits land on the grid of the transport, or a free clock when stopped.
    pub const REPEAT: u32 = 24;
    /// Modulation (Live 12's modulation: the knob keeps turning, the source moves it from there).
    /// Route slot `a` (0..MAX_MODS) of the layer: source `z` (MOD_LFO, MOD_ENV) onto wire param `y`, by
    /// `x` (-1..1, in shares of the knob's travel). Amount 0 clears the slot and puts the knob back.
    pub const MOD: u32 = 25;
    /// A/B level match: trim the layer by `x` dB after its strip, sends included (glides over 20 ms). Not a knob and not
    /// saved: 0 dB takes it off, and the layer is then exactly as it was.
    pub const TRIM: u32 = 26;
}

pub mod out {
    pub const PLAYED_ON: u32 = 1;
    pub const PLAYED_OFF: u32 = 2;
    pub const POS: u32 = 3;
    pub const SEQ_ON: u32 = 4;
    /// A layer's reading. note = pitch centre (Hz), flags = 1 if sounding,
    /// vel = peak (dBFS), aux = loudness (LUFS), beat = position (-1 left .. 1 right).
    pub const METER: u32 = 5;
    /// A layer's bands. vel = low, aux = mid, beat = high (dB).
    pub const BANDS: u32 = 6;
    /// layer = the layer to change, note = the layer it clashes with,
    /// flags = group (bits 0-1: 0 low, 1 mid, 2 high) | band << 2 (3 bits) |
    /// fix << 5 | fix2 << 7 (0 duck, 1 eq, 2 pan, 3 none), vel = severity (0..1),
    /// aux = the fix's normalised value, beat = the second fix's value.
    pub const CLASH: u32 = 7;
    /// Last in each analysis frame. layer = MASTER_LAYER, note = limiter gain
    /// reduction (hundredths of a dB), flags = clashes reported | comparing << 8,
    /// vel = true peak since the last frame (dBTP), aux = loudness (LUFS),
    /// beat = glue gain reduction (dB).
    pub const MASTER_METER: u32 = 8;
    /// Sent just before MASTER_METER. layer = MASTER_LAYER, vel = momentary loudness (400 ms),
    /// aux = short-term (3 s), beat = integrated since play or analysis started (gated, EBU R 128),
    /// all LUFS (-120 when there is nothing to measure).
    pub const LOUDNESS: u32 = 9;

    pub const F_PLAYING: u32 = 1;
    pub const F_COUNT_IN: u32 = 2;
    pub const F_RECORDING: u32 = 4;
    pub const F_LINK: u32 = 8;
    /// Set on a PLAYED_ON that note repeat made, so the recorder keeps it as a hit.
    pub const F_REPEAT: u32 = 16;
}

/// A command from the UI. Field meaning depends on `kind` (see `cmd`).
#[repr(C)]
#[derive(Clone, Copy, Debug, Default)]
pub struct Cmd {
    pub kind: u32,
    pub layer: u32,
    pub a: u32,
    pub x: f32,
    pub y: f64,
    pub z: f64,
}

/// Something that happened in the engine, for the UI.
#[repr(C)]
#[derive(Clone, Copy, Debug, Default)]
pub struct OutEv {
    pub kind: u32,
    pub layer: u32,
    pub note: u32,
    pub flags: u32,
    /// Velocity for notes; tempo for position reports.
    pub vel: f32,
    /// For played notes: ms from the touch (as the host reported it) to the engine
    /// acting on it. The input half of touch-to-sound latency. -1 if unknown.
    pub aux: f32,
    /// Loop beat (negative during the count-in).
    pub beat: f64,
}

// ── transport ────────────────────────────────────────────────────────────────

#[derive(Clone, Copy, PartialEq, Debug)]
pub enum State {
    Stopped,
    /// Running toward `start_at` (count-in, or waiting for the next Link bar).
    Armed,
    Playing,
}

pub struct Transport {
    pub sr: f64,
    pub tempo: f64,
    pub swing: f64,
    /// Song beat. Follows Link when Link is on.
    pub beat: f64,
    pub state: State,
    pub start_at: f64,
    pub count_in: bool,
    pub recording: bool,
    pub loop_len: f64,
    /// Position inside the loop, advanced by exactly one sample's worth each sample so
    /// consecutive ranges never leave a gap or overlap.
    pub lpos: f64,
    pub link: bool,
    pub metronome: bool,
}

impl Transport {
    #[inline]
    pub fn bps(&self) -> f64 {
        self.tempo / 60.0 / self.sr
    }
    /// Beat inside the loop. Negative while counting in.
    #[inline]
    pub fn loop_beat_at(&self, song: f64) -> f64 {
        match self.state {
            State::Playing => (song - self.start_at).rem_euclid(self.loop_len),
            State::Armed => song - self.start_at,
            State::Stopped => 0.0,
        }
    }
    pub fn flags(&self) -> u32 {
        let mut f = 0;
        if self.state == State::Playing {
            f |= out::F_PLAYING;
        }
        if self.state == State::Armed && self.count_in {
            f |= out::F_COUNT_IN;
        }
        if self.recording {
            f |= out::F_RECORDING;
        }
        if self.link {
            f |= out::F_LINK;
        }
        f
    }
}

// ── layers ───────────────────────────────────────────────────────────────────

pub const MAX_REPEATS: usize = 4;

/// Modulation slots per layer.
pub const MAX_MODS: usize = 8;
/// Sources: the instrument's lfo (chords, lead), and its filter envelope (chords, lead, bass).
pub const MOD_LFO: u8 = 0;
pub const MOD_ENV: u8 = 1;
/// The routed knobs move every this many samples (0.33 ms at 48 kHz); each knob's own smoothing joins
/// the steps, as it does for a hand on the knob.
pub const MOD_EVERY: u32 = 16;

/// One modulation: a source, the wire param it moves, and by how much (shares of the knob's travel).
#[derive(Clone, Copy, Debug, Default)]
pub struct ModRoute {
    pub src: u8,
    pub dest: u16,
    pub amount: f32,
}

pub struct Layer {
    pub inst: Instrument,
    pub drums: Box<DrumRack>,
    pub bass: Box<Bass>,
    pub chords: Box<Poly>,
    pub lead: Box<Lead>,
    pub fx: Box<FxSynth>,
    pub sampler: Box<Sampler>,
    pub strip: Strip,
    pub params: [f32; MAX_PARAMS],
    pub live: Pattern,
    pub staging: Pattern,
    pub cursor: usize,
    offs: [(u8, f64); MAX_OFFS],
    n_offs: usize,
    /// Layer this one ducks under (-1 none) and which note triggers it (-1 any).
    pub duck_src: i32,
    pub duck_note: i32,
    /// While comparing: the snapshot's duck routing.
    cmp_duck: Option<(i32, i32)>,
    /// Held note-repeat pads: (note, velocity, beats per hit, last grid index fired).
    pub rep: [(i32, f32, f64, i64); MAX_REPEATS],
    /// Modulation routes (cmd::MOD) and how many are live. With none, nothing below runs.
    pub mods: [ModRoute; MAX_MODS],
    pub n_mods: usize,
    mod_count: u32,
    /// The filter envelope as a modulation source: one per layer, at the control rate, gated by notes held.
    mod_env: crate::dsp::env::Adsr,
    held: u32,
    /// The a/b level match (cmd::TRIM). Off, it is not in the signal path at all.
    trim: crate::dsp::smooth::Smooth,
    trim_on: bool,
}

impl Layer {
    fn new(sr: f32) -> Self {
        let mut params = [0.0; MAX_PARAMS];
        for (i, s) in LAYER_PARAMS.iter().enumerate() {
            params[i] = s.default;
        }
        Layer {
            inst: Instrument::None,
            drums: Box::new(DrumRack::new(sr)),
            bass: Box::new(Bass::new(sr)),
            chords: Box::new(Poly::new(sr)),
            lead: Box::new(Lead::new(sr)),
            fx: Box::new(FxSynth::new(sr)),
            sampler: Box::new(Sampler::new(sr)),
            strip: Strip::new(sr),
            params,
            live: Pattern::new(),
            staging: Pattern::new(),
            cursor: 0,
            offs: [(0, 0.0); MAX_OFFS],
            n_offs: 0,
            duck_src: -1,
            duck_note: -1,
            cmp_duck: None,
            rep: [(-1, 0.0, 0.25, i64::MIN); MAX_REPEATS],
            mods: [ModRoute::default(); MAX_MODS],
            n_mods: 0,
            mod_count: 0,
            mod_env: crate::dsp::env::Adsr::new(sr / MOD_EVERY as f32),
            held: 0,
            trim: { let mut t = crate::dsp::smooth::Smooth::new(1.0); t.set_time(20.0, sr); t },
            trim_on: false,
        }
    }

    /// The duck routing in effect (the snapshot's while comparing).
    fn duck_route(&self) -> (i32, i32) {
        self.cmp_duck.unwrap_or((self.duck_src, self.duck_note))
    }

    fn note_on(&mut self, note: u8, vel: f32) {
        if self.n_mods > 0 {
            self.mod_note_on();
        }
        self.held = self.held.saturating_add(1);
        match self.inst {
            Instrument::Drums => self.drums.note_on(note, vel),
            Instrument::Bass => self.bass.note_on(note, vel),
            Instrument::Chords => self.chords.note_on(note, vel),
            Instrument::Lead => self.lead.note_on(note, vel),
            Instrument::Fx => self.fx.note_on(note, vel),
            Instrument::Sampler => self.sampler.note_on(note, vel),
            Instrument::None => {}
        }
    }

    fn note_off(&mut self, note: u8) {
        self.held = self.held.saturating_sub(1);
        if self.held == 0 {
            self.mod_env.gate_off();
        }
        match self.inst {
            Instrument::Bass => self.bass.note_off(note),
            Instrument::Chords => self.chords.note_off(note),
            Instrument::Lead => self.lead.note_off(note),
            Instrument::Fx => self.fx.note_off(note),
            Instrument::Sampler => self.sampler.note_off(note),
            _ => {}
        }
    }

    fn all_off(&mut self) {
        self.held = 0;
        self.mod_env.gate_off();
        self.n_offs = 0;
        self.bass.all_off();
        self.chords.all_off();
        self.lead.all_off();
        self.fx.all_off();
        self.sampler.all_off();
    }

    fn set_param(&mut self, index: usize, norm: f32, jump: bool) {
        if index >= MAX_PARAMS || spec_for(self.inst, index).is_none() {
            return;
        }
        self.params[index] = norm.clamp(0.0, 1.0);
        if self.n_mods > 0 && self.mods.iter().any(|m| m.amount != 0.0 && m.dest as usize == index) {
            // A modulated knob moves from its new place on the very next sample.
            self.mod_count = MOD_EVERY - 1;
        } else {
            self.apply(index, norm, jump);
        }
    }

    /// Send a normalised value to the strip or the instrument without making it the knob's value.
    fn apply(&mut self, index: usize, norm: f32, jump: bool) {
        let Some(spec) = spec_for(self.inst, index) else { return };
        let v = spec.to_value(norm);
        if index < INSTRUMENT_BASE {
            // While comparing, the strip plays the snapshot; the live value waits.
            if self.cmp_duck.is_none() {
                self.strip.set_param(index, v, jump);
            }
        } else {
            let i = index - INSTRUMENT_BASE;
            match self.inst {
                Instrument::Bass => self.bass.set_param(i, v),
                Instrument::Drums => self.drums.set_param(i, v),
                Instrument::Chords => self.chords.set_param(i, v),
                Instrument::Lead => self.lead.set_param(i, v),
                Instrument::Fx => self.fx.set_param(i, v),
                Instrument::Sampler => self.sampler.set_param(i, v),
                Instrument::None => {}
            }
        }
    }

    fn schedule_off(&mut self, note: u8, at: f64) {
        // If this note already has a pending off, move it (a retrigger extends it).
        for o in self.offs[..self.n_offs].iter_mut() {
            if o.0 == note {
                o.1 = at;
                return;
            }
        }
        if self.n_offs < MAX_OFFS {
            self.offs[self.n_offs] = (note, at);
            self.n_offs += 1;
        }
    }

    /// Is the a/b level match in the signal path (for tests)?
    pub fn strip_trimmed(&self) -> bool {
        self.trim_on
    }

    /// Route a modulation slot (cmd::MOD). Clearing or moving a slot puts the knob it moved back.
    fn set_mod(&mut self, slot: usize, src: u8, dest: usize, amount: f32) {
        if slot >= MAX_MODS {
            return;
        }
        let old = self.mods[slot];
        let amount = if dest < MAX_PARAMS && spec_for(self.inst, dest).is_some() && amount.is_finite() { amount.clamp(-1.0, 1.0) } else { 0.0 };
        self.mods[slot] = ModRoute { src, dest: if amount == 0.0 { 0 } else { dest as u16 }, amount };
        self.n_mods = self.mods.iter().filter(|m| m.amount != 0.0).count();
        if old.amount != 0.0 && (amount == 0.0 || old.dest as usize != dest) {
            let d = old.dest as usize;
            self.apply(d, self.params[d], false);
        }
        if self.n_mods > 0 && self.held > 0 && old.amount == 0.0 {
            self.mod_note_on();
        }
        self.mod_count = MOD_EVERY - 1;
    }

    /// The modulation envelope's times follow the instrument's filter envelope, taken at each note.
    fn mod_note_on(&mut self) {
        let v = |i: usize| spec_for(self.inst, INSTRUMENT_BASE + i).map(|s| s.to_value(self.params[INSTRUMENT_BASE + i])).unwrap_or(0.0);
        match self.inst {
            Instrument::Bass => {
                let d = v(B_DECAY) * 0.001;
                self.mod_env.set(0.001, d, 0.0, d * 0.6);
            }
            Instrument::Lead => self.mod_env.set(0.001, v(LD_FDECAY) * 0.001, 0.4, v(LD_FREL) * 0.001),
            Instrument::Chords => self.mod_env.set(0.002 + v(C_ATTACK) * 0.0005, v(C_FDECAY) * 0.001, 0.35, v(C_FREL) * 0.001),
            _ => {}
        }
        self.mod_env.gate_on();
    }

    /// The lfo now, -1..1: the instrument's own lfo (same phase as the one inside its voices), 0 if it has none.
    fn lfo_now(&self) -> f32 {
        let ph = match self.inst {
            Instrument::Chords => self.chords.lfo_phase(),
            Instrument::Lead => self.lead.lfo_phase(),
            _ => return 0.0,
        };
        (core::f32::consts::TAU * ph).sin()
    }

    /// Every MOD_EVERY samples: move each routed knob to its value plus its sources. The knob's own
    /// value (`params`) is never touched, so turning it still works and clearing the route puts it back.
    #[inline]
    fn mod_tick(&mut self, comparing: bool) {
        self.mod_count += 1;
        if self.mod_count < MOD_EVERY {
            return;
        }
        self.mod_count = 0;
        let lfo = self.lfo_now();
        let env = self.mod_env.next();
        for i in 0..MAX_MODS {
            let m = self.mods[i];
            if m.amount == 0.0 || self.mods[..i].iter().any(|o| o.amount != 0.0 && o.dest == m.dest) {
                continue;
            }
            let dest = m.dest as usize;
            if comparing && dest < MIX_PARAMS {
                continue;
            }
            let mut sum = 0.0;
            for o in self.mods[i..].iter() {
                if o.amount != 0.0 && o.dest == m.dest {
                    sum += o.amount * if o.src == MOD_LFO { lfo } else { env };
                }
            }
            let n = (self.params[dest] + sum).clamp(0.0, 1.0);
            self.apply(dest, n, false);
        }
    }

    #[inline]
    fn tick(&mut self) -> f32 {
        match self.inst {
            Instrument::Drums => self.drums.tick(),
            Instrument::Bass => self.bass.tick(),
            Instrument::Chords => self.chords.tick(),
            Instrument::Lead => self.lead.tick(),
            Instrument::Fx => self.fx.tick(),
            Instrument::Sampler => self.sampler.tick(),
            Instrument::None => 0.0,
        }
    }
}

// ── metronome ────────────────────────────────────────────────────────────────

struct Click {
    osc: Sine,
    env: Decay,
    hz: f32,
}

/// The mix as it was, for hold to compare.
struct Snapshot {
    valid: bool,
    layers: [[f32; MIX_PARAMS]; MAX_LAYERS],
    duck: [(i32, i32); MAX_LAYERS],
    master: [f32; crate::master::MASTER_SLOTS],
}

// ── engine ───────────────────────────────────────────────────────────────────

pub struct Core {
    pub sr: f32,
    pub tr: Transport,
    pub layers: Vec<Layer>,
    echo: Echo,
    verb: Reverb,
    click: Click,
    pub frame: u64,
    pub out_l: Vec<f32>,
    pub out_r: Vec<f32>,
    pos_every: u64,
    last_pos: u64,
    fired: Vec<(u8, f32, f64, f64)>,
    /// Free-running beat clock for note repeat while the transport is stopped.
    rep_clock: f64,
    pub master: Master,
    pub analyse: bool,
    pub meters: Vec<LayerMeter>,
    /// The master's loudness, to BS.1770 / EBU R 128.
    pub loud: Loudness,
    out_tp: TruePeak,
    out_tp_max: f32,
    pub clash: ClashDetector,
    clashes: [Clash; MAX_CLASHES],
    meter_every: u64,
    last_meter: u64,
    snap: Snapshot,
    pub comparing: bool,
}

pub struct Engine {
    pub cmds: Box<Ring<Cmd, 8192>>,
    pub events: Box<Ring<OutEv, 4096>>,
    pub core: std::cell::UnsafeCell<Core>,
}

// The UI thread only touches `cmds` (push) and `events` (pop); the audio thread only
// touches `core`, `cmds` (pop) and `events` (push).
unsafe impl Sync for Engine {}
unsafe impl Send for Engine {}

impl Engine {
    pub fn new(sr: f32) -> Self {
        let core = Core::new(sr);
        Engine { cmds: Box::new(Ring::new()), events: Box::new(Ring::new()), core: std::cell::UnsafeCell::new(core) }
    }

    /// UI thread.
    pub fn send(&self, c: Cmd) -> bool {
        self.cmds.push(c)
    }

    /// UI thread.
    pub fn poll(&self) -> Option<OutEv> {
        self.events.pop()
    }

    /// Audio thread. Renders `frames` into `core.out_l/out_r`.
    ///
    /// # Safety
    /// Only one thread may call this at a time.
    pub unsafe fn process(&self, frames: usize) {
        let core = &mut *self.core.get();
        core.process(frames, &self.cmds, &self.events);
    }

    /// Audio thread. Link's view of the timeline at the first sample of the next block.
    ///
    /// # Safety
    /// Call from the audio thread only, right before `process`.
    pub unsafe fn link_sync(&self, beat: f64, tempo: f64) {
        let core = &mut *self.core.get();
        core.link_sync(beat, tempo);
    }

    /// Audio thread, between blocks. Put a mono sample into slot `slot` of a sampler layer.
    /// Allocates, so never call it from inside `process`.
    ///
    /// # Safety
    /// Call from the audio thread only, not while `process` runs.
    pub unsafe fn load_sample(&self, layer: usize, slot: usize, data: &[f32], src_rate: f32) {
        let core = &mut *self.core.get();
        if let Some(l) = core.layers.get_mut(layer) {
            l.sampler.load(slot, data, src_rate);
        }
    }

    /// Audio thread. Turn Link following off.
    ///
    /// # Safety
    /// Audio thread only.
    pub unsafe fn link_off(&self) {
        let core = &mut *self.core.get();
        core.tr.link = false;
    }

    /// Read-only view for tests and tools on a single thread.
    ///
    /// # Safety
    /// Not while another thread is in `process`.
    #[allow(clippy::mut_from_ref)]
    pub unsafe fn core(&self) -> &mut Core {
        &mut *self.core.get()
    }
}

impl Core {
    pub fn new(sr: f32) -> Self {
        let mut echo = Echo::new(sr);
        echo.set_tempo(120.0);
        let mut core = Core {
            sr,
            tr: Transport {
                sr: sr as f64,
                tempo: 120.0,
                swing: 0.0,
                beat: 0.0,
                state: State::Stopped,
                start_at: 0.0,
                count_in: false,
                recording: false,
                loop_len: 4.0,
                lpos: 0.0,
                link: false,
                metronome: false,
            },
            layers: (0..MAX_LAYERS).map(|_| Layer::new(sr)).collect(),
            echo,
            verb: Reverb::new(sr),
            click: Click { osc: Sine::default(), env: Decay::new(), hz: 1000.0 },
            frame: 0,
            out_l: vec![0.0; MAX_BLOCK],
            out_r: vec![0.0; MAX_BLOCK],
            pos_every: (sr / 60.0) as u64,
            last_pos: 0,
            fired: Vec::with_capacity(256),
            rep_clock: 0.0,
            master: Master::new(sr),
            analyse: false,
            meters: (0..MAX_LAYERS).map(|_| LayerMeter::new(sr)).collect(),
            loud: Loudness::new(sr),
            out_tp: TruePeak::new(),
            out_tp_max: 0.0,
            clash: ClashDetector::new(sr),
            clashes: [Clash { target: 0, other: 0, group: 0, band: 0, severity: 0.0, fix: 0, value: 0.0, fix2: 0, value2: 0.0 }; MAX_CLASHES],
            meter_every: (sr / METER_HZ) as u64,
            last_meter: 0,
            snap: Snapshot { valid: false, layers: [[0.0; MIX_PARAMS]; MAX_LAYERS], duck: [(-1, -1); MAX_LAYERS], master: [0.0; crate::master::MASTER_SLOTS] },
            comparing: false,
        };
        // The master's defaults reach the shared returns too (the echo's style, the reverb's kind and time).
        for (i, spec) in MASTER_PARAMS.iter().enumerate() {
            core.set_master(i, spec.default, true);
        }
        core
    }

    fn snapshot(&mut self) {
        for (i, l) in self.layers.iter().enumerate() {
            // While comparing, "live" is what the layer holds, not what plays.
            self.snap.layers[i].copy_from_slice(&l.params[..MIX_PARAMS]);
            self.snap.duck[i] = (l.duck_src, l.duck_note);
        }
        self.snap.master = self.master.params;
        self.snap.valid = true;
    }

    fn compare(&mut self, on: bool) {
        if on == self.comparing || (on && !self.snap.valid) {
            return;
        }
        self.comparing = on;
        for (i, l) in self.layers.iter_mut().enumerate() {
            let vals = if on { self.snap.layers[i] } else { l.params[..MIX_PARAMS].try_into().unwrap() };
            for (k, n) in vals.iter().enumerate() {
                if let Some(spec) = spec_for(l.inst, k) {
                    l.strip.set_param(k, spec.to_value(*n), false);
                }
            }
            l.cmp_duck = if on { Some(self.snap.duck[i]) } else { None };
        }
        // The master keeps its live values in `params`; push the right ones through.
        let live = self.master.params;
        let vals = if on { self.snap.master } else { live };
        for (k, n) in vals.iter().enumerate().take(MASTER_PARAMS.len()) {
            self.set_master(k, *n, false);
        }
        self.master.params = live;
    }

    /// A master param, and the shared returns it reaches (the reverb's kind and time).
    fn set_master(&mut self, i: usize, n: f32, jump: bool) {
        self.master.set_param(i, n, jump);
        let Some(spec) = MASTER_PARAMS.get(i) else { return };
        match i {
            crate::master::M_SPACE => self.verb.set_kind(if n < 0.5 { crate::fx::HALL } else { crate::fx::PLATE }),
            crate::master::M_VERB_TIME => self.verb.set(spec.to_value(n) * 0.001),
            crate::master::M_ECHO_TYPE => self.echo.set_kind(step3(n)),
            crate::master::M_REPEATS => self.echo.feedback = spec.to_value(n),
            _ => {}
        }
    }

    fn link_sync(&mut self, beat: f64, tempo: f64) {
        self.tr.link = true;
        if (self.tr.tempo - tempo).abs() > 1e-6 {
            self.tr.tempo = tempo;
            self.echo.set_tempo(tempo as f32);
            for l in self.layers.iter_mut() {
                l.fx.set_tempo(tempo as f32);
            }
        }
        self.tr.beat = beat;
        if self.tr.state == State::Playing {
            let ahead = LATENCY as f64 * self.tr.bps();
            let target = (beat + ahead - self.tr.start_at).rem_euclid(self.tr.loop_len);
            let mut d = (target - self.tr.lpos).abs();
            d = d.min(self.tr.loop_len - d);
            if d > 4.0 * self.tr.bps() {
                self.tr.lpos = target;
                for l in self.layers.iter_mut() {
                    l.cursor = l.live.seek(target);
                }
            }
        }
    }

    fn emit(&self, events: &Ring<OutEv, 4096>, e: OutEv) {
        let _ = events.push(e);
    }

    fn start(&mut self, count_in_beats: f64) {
        let tr = &mut self.tr;
        if tr.link {
            // Land on Link's next bar so we line up with Live (quantum 4).
            let q = 4.0;
            let ready = tr.beat + count_in_beats;
            tr.start_at = (ready / q).ceil() * q;
        } else {
            // With no count-in, start the clock one engine-delay early so the first
            // downbeat is heard on time.
            tr.beat = if count_in_beats > 0.0 { 0.0 } else { -(LATENCY as f64) * tr.bps() };
            tr.start_at = count_in_beats;
        }
        tr.count_in = count_in_beats > 0.0;
        tr.state = State::Armed;
        for l in self.layers.iter_mut() {
            l.cursor = 0;
        }
    }

    fn apply(&mut self, c: Cmd, events: &Ring<OutEv, 4096>) {
        let li = (c.layer as usize).min(MAX_LAYERS - 1);
        match c.kind {
            cmd::NOTE_ON => {
                let note = c.a as u8;
                let vel = c.x.clamp(0.0, 1.0);
                self.layers[li].note_on(note, vel);
                self.duck_from(li, note);
                let beat = self.beat_for_frame(c.y);
                let aux = if c.y >= 0.0 { ((self.frame as f64 - c.y) / self.sr as f64 * 1000.0) as f32 } else { -1.0 };
                self.emit(events, OutEv { kind: out::PLAYED_ON, layer: li as u32, note: c.a, flags: self.tr.flags(), vel, aux, beat });
            }
            cmd::NOTE_OFF => {
                self.layers[li].note_off(c.a as u8);
                let beat = self.beat_for_frame(c.y);
                self.emit(events, OutEv { kind: out::PLAYED_OFF, layer: li as u32, note: c.a, flags: self.tr.flags(), vel: 0.0, aux: -1.0, beat });
            }
            cmd::PARAM => self.layers[li].set_param(c.a as usize, c.x, false),
            cmd::MASTER => {
                let i = c.a as usize;
                if self.comparing {
                    if i < self.master.params.len() {
                        self.master.params[i] = c.x.clamp(0.0, 1.0);
                    }
                } else {
                    self.set_master(i, c.x, false);
                }
            }
            cmd::REPEAT => {
                let note = c.a as i32;
                let l = &mut self.layers[li];
                if c.x <= 0.0 || c.y <= 0.0 {
                    for r in l.rep.iter_mut() {
                        if r.0 == note {
                            r.0 = -1;
                        }
                    }
                } else {
                    let div = c.y.clamp(1.0 / 64.0, 2.0);
                    let slot = l.rep.iter().position(|r| r.0 == note).or_else(|| l.rep.iter().position(|r| r.0 < 0));
                    if let Some(k) = slot {
                        l.rep[k] = (note, c.x.clamp(0.0, 1.0), div, i64::MIN);
                    }
                }
            }
            cmd::MOD => self.layers[li].set_mod(c.a as usize, c.z as u8, c.y as usize, c.x),
            cmd::TRIM => {
                let l = &mut self.layers[li];
                let g = if c.x.is_finite() && c.x.abs() > 0.001 { db_to_gain(c.x.clamp(-48.0, 12.0)) } else { 1.0 };
                if g != 1.0 || l.trim_on {
                    l.trim.set(g);
                    l.trim_on = true;
                }
            }
            cmd::SNAPSHOT => self.snapshot(),
            cmd::COMPARE => self.compare(c.a != 0),
            cmd::ANALYSE => {
                let on = c.a != 0;
                if on && !self.analyse {
                    for m in self.meters.iter_mut() {
                        m.clear();
                    }
                    self.loud.reset();
                    self.clash.clear();
                    self.last_meter = self.frame;
                }
                self.analyse = on;
            }
            cmd::INSTRUMENT => {
                let l = &mut self.layers[li];
                l.all_off();
                // Routes belong to an instrument's knobs: a new instrument starts with none.
                l.mods = [ModRoute::default(); MAX_MODS];
                l.n_mods = 0;
                l.inst = Instrument::from_u8(c.a as u8);
                self.meters[li].clear();
                // Push this instrument's defaults through, keep the strip as it is.
                let n = l.inst.param_count();
                for i in 0..n {
                    let idx = INSTRUMENT_BASE + i;
                    if let Some(s) = spec_for(l.inst, idx) {
                        l.set_param(idx, s.default, true);
                    }
                }
            }
            cmd::TEMPO => {
                if !self.tr.link {
                    self.tr.tempo = c.y.clamp(20.0, 300.0);
                    self.echo.set_tempo(self.tr.tempo as f32);
                    let bpm = self.tr.tempo as f32;
                    for l in self.layers.iter_mut() {
                        l.fx.set_tempo(bpm);
                    }
                }
            }
            cmd::LOOP => self.tr.loop_len = c.y.max(0.25),
            cmd::SWING => self.tr.swing = c.y.clamp(0.0, 0.75),
            cmd::PLAY => {
                if self.tr.state == State::Stopped {
                    self.start(0.0);
                    // A new play-through: the song's loudness is measured from here.
                    self.loud.reset_integrated();
                }
                self.tr.recording = false;
            }
            cmd::STOP => {
                self.tr.state = State::Stopped;
                self.tr.recording = false;
                self.tr.count_in = false;
                for l in self.layers.iter_mut() {
                    l.all_off();
                }
            }
            cmd::RECORD => {
                self.tr.recording = true;
                if self.tr.state == State::Stopped {
                    self.start(c.a as f64);
                }
            }
            cmd::RECORD_OFF => self.tr.recording = false,
            cmd::EV_CLEAR => self.layers[li].staging.clear(),
            cmd::EV_ADD => {
                let ev = NoteEv { start: c.y.max(0.0), len: c.z.max(1.0 / 64.0), note: c.a as u8, vel: c.x };
                self.layers[li].staging.insert(ev);
            }
            cmd::EV_COMMIT => {
                let lb = if self.tr.state == State::Playing { self.tr.lpos } else { 0.0 };
                let l = &mut self.layers[li];
                l.live.swap(&mut l.staging);
                l.cursor = l.live.seek(lb);
            }
            cmd::DUCK => {
                let l = &mut self.layers[li];
                l.duck_src = if c.a == u32::MAX { -1 } else { c.a as i32 };
                l.duck_note = if c.x < 0.0 { -1 } else { c.x as i32 };
            }
            cmd::METRONOME => self.tr.metronome = c.a != 0,
            cmd::LINK_OFF => self.tr.link = false,
            cmd::ALL_OFF => self.layers[li].all_off(),
            cmd::LOCATE => {
                if !self.tr.link {
                    self.tr.beat = self.tr.start_at + c.y;
                    self.tr.lpos = c.y.rem_euclid(self.tr.loop_len);
                    for l in self.layers.iter_mut() {
                        l.cursor = l.live.seek(c.y);
                    }
                }
            }
            _ => {}
        }
    }

    /// Loop beat at a host frame (-1 = now). Used to place what you played where you
    /// played it, before the time it took to reach the engine.
    fn beat_for_frame(&self, t_frame: f64) -> f64 {
        let song = if t_frame >= 0.0 {
            let ago = (self.frame as f64 - t_frame).max(0.0);
            self.tr.beat - ago * self.tr.bps()
        } else {
            self.tr.beat
        };
        self.tr.loop_beat_at(song)
    }

    fn duck_from(&mut self, src: usize, note: u8) {
        for l in self.layers.iter_mut() {
            let (s, n) = l.duck_route();
            if s == src as i32 && (n < 0 || n == note as i32) {
                l.strip.duck_hit();
            }
        }
    }

    /// What clash detection needs to know about a layer's settings (the ones playing:
    /// the snapshot's while comparing).
    fn layer_info(&self, i: usize, sounding: bool) -> LayerInfo {
        let l = &self.layers[i];
        let p = |k: usize| if self.comparing { self.snap.layers[i][k] } else { l.params[k] };
        let v = |k: usize| LAYER_PARAMS[k].to_value(p(k));
        LayerInfo {
            sounding,
            drums: l.inst == Instrument::Drums,
            duck_src: l.duck_route().0,
            duck_amt: p(L_DUCK),
            pan_knob: v(L_PAN),
            cut_hz: v(L_EQ_CUT),
            mid_db: v(L_EQ_MID),
            high_db: v(L_EQ_HIGH),
        }
    }

    /// Report every layer, the clashes and the master. About 30 times a second.
    fn report(&mut self, events: &Ring<OutEv, 4096>) {
        let mut info = [LayerInfo::default(); MAX_LAYERS];
        for i in 0..MAX_LAYERS {
            let l = &self.layers[i];
            if l.inst == Instrument::None {
                continue;
            }
            let r = self.meters[i].read();
            info[i] = self.layer_info(i, r.active);
            let _ = events.push(OutEv { kind: out::METER, layer: i as u32, note: r.centre_hz.round() as u32, flags: r.active as u32, vel: r.peak_db, aux: r.lufs, beat: r.pan as f64 });
            let _ = events.push(OutEv { kind: out::BANDS, layer: i as u32, note: 0, flags: 0, vel: r.bands_db[0], aux: r.bands_db[1], beat: r.bands_db[2] as f64 });
        }
        let n = self.clash.detect(&self.meters, &info, &mut self.clashes);
        for c in &self.clashes[..n] {
            let flags = c.group as u32 | (c.band as u32) << 2 | c.fix << 5 | c.fix2 << 7;
            let _ = events.push(OutEv { kind: out::CLASH, layer: c.target as u32, note: c.other as u32, flags, vel: c.severity, aux: c.value, beat: c.value2 as f64 });
        }
        let lr = self.loud.read();
        let _ = events.push(OutEv { kind: out::LOUDNESS, layer: MASTER_LAYER, note: 0, flags: 0, vel: lr.momentary, aux: lr.short_term, beat: lr.integrated as f64 });
        let tp = self.out_tp_max;
        self.out_tp_max = 0.0;
        let _ = events.push(OutEv {
            kind: out::MASTER_METER,
            layer: MASTER_LAYER,
            note: (self.master.limiter.gr_db * 100.0).round() as u32,
            flags: n as u32 | (self.comparing as u32) << 8,
            vel: if tp > 1e-6 { 20.0 * tp.log10() } else { -120.0 },
            aux: lr.momentary,
            beat: self.master.glue.gr_db as f64,
        });
    }

    /// The clashes found at the last report (for tests and tools).
    pub fn detect_clashes(&mut self) -> Vec<Clash> {
        let mut info = [LayerInfo::default(); MAX_LAYERS];
        for i in 0..MAX_LAYERS {
            if self.layers[i].inst != Instrument::None {
                info[i] = self.layer_info(i, self.meters[i].total() > 1e-10);
            }
        }
        let mut out = [self.clashes[0]; MAX_CLASHES];
        let n = self.clash.detect(&self.meters, &info, &mut out);
        out[..n].to_vec()
    }

    fn process(&mut self, frames: usize, cmds: &Ring<Cmd, 8192>, events: &Ring<OutEv, 4096>) {
        let frames = frames.min(MAX_BLOCK);
        while let Some(c) = cmds.pop() {
            self.apply(c, events);
        }
        let bps = self.tr.bps();
        let ahead = LATENCY as f64 * bps;
        for i in 0..frames {
            let tr = &mut self.tr;
            // Transport state. The sequencer runs `LATENCY` samples ahead of what you hear.
            if tr.state == State::Armed && tr.beat + ahead >= tr.start_at {
                tr.state = State::Playing;
                tr.count_in = false;
                tr.lpos = 0.0;
                for l in self.layers.iter_mut() {
                    l.cursor = 0;
                }
            }
            let running = tr.state != State::Stopped;

            // Metronome: every beat in the count-in, and while recording if on.
            if running && (tr.count_in || (tr.metronome && tr.state == State::Playing)) {
                // A whole beat falls inside this sample.
                let b = tr.beat.ceil();
                if b < tr.beat + bps {
                    let bar_beat = (b - tr.start_at).rem_euclid(4.0);
                    self.click.hz = if bar_beat < 0.5 { 1_600.0 } else { 1_050.0 };
                    self.click.osc.phase = 0.0;
                    self.click.env.trigger(0.05, self.sr, 0.0005);
                }
            }

            // Note repeat: a held pad fires on the grid, aligned to the song when it runs.
            {
                let clock = if self.tr.state == State::Playing { self.tr.lpos } else { self.rep_clock };
                let song = self.tr.beat + ahead;
                let flags = self.tr.flags() | out::F_REPEAT;
                for li in 0..MAX_LAYERS {
                    for k in 0..MAX_REPEATS {
                        let (note, vel, div, last) = self.layers[li].rep[k];
                        if note < 0 {
                            continue;
                        }
                        let idx = (clock / div).floor() as i64;
                        // The first hit lands right away; after that, once per grid line.
                        if last == i64::MIN || idx != last {
                            self.layers[li].rep[k].3 = idx;
                            let l = &mut self.layers[li];
                            l.note_on(note as u8, vel);
                            l.schedule_off(note as u8, song + div * 0.8);
                            self.duck_from(li, note as u8);
                            let _ = events.push(OutEv { kind: out::PLAYED_ON, layer: li as u32, note: note as u32, flags, vel, aux: -1.0, beat: clock });
                        }
                    }
                }
            }

            // Sequencer.
            if self.tr.state == State::Playing {
                let from = self.tr.lpos;
                let to = from + bps;
                let song = self.tr.beat + ahead;
                let len = self.tr.loop_len;
                for li in 0..MAX_LAYERS {
                    self.fired.clear();
                    {
                        let l = &self.layers[li];
                        if l.inst == Instrument::None {
                            continue;
                        }
                        let mut cursor = l.cursor;
                        let fired = &mut self.fired;
                        fire_range(&l.live, &mut cursor, from, to, len, |e, off| {
                            if fired.len() < fired.capacity() {
                                fired.push((e.note, e.vel, off, e.len));
                            }
                        });
                        self.layers[li].cursor = cursor;
                    }
                    for k in 0..self.fired.len() {
                        let (note, vel, off, elen) = self.fired[k];
                        let l = &mut self.layers[li];
                        l.note_on(note, vel);
                        l.schedule_off(note, song + off + elen);
                        self.duck_from(li, note);
                        let _ = events.push(OutEv { kind: out::SEQ_ON, layer: li as u32, note: note as u32, flags: 0, vel, aux: -1.0, beat: from + off });
                    }
                }
            }

            // Scheduled note offs.
            let song = self.tr.beat + ahead;
            for l in self.layers.iter_mut() {
                let mut k = 0;
                while k < l.n_offs {
                    if l.offs[k].1 <= song {
                        let note = l.offs[k].0;
                        l.note_off(note);
                        l.n_offs -= 1;
                        l.offs[k] = l.offs[l.n_offs];
                    } else {
                        k += 1;
                    }
                }
            }

            // Render.
            let (mut ml, mut mr, mut echo_in, mut verb_in) = (0.0, 0.0, 0.0, 0.0);
            let mut live = 0u8;
            let comparing = self.comparing;
            for (li, l) in self.layers.iter_mut().enumerate() {
                if l.inst == Instrument::None {
                    continue;
                }
                if l.n_mods > 0 {
                    l.mod_tick(comparing);
                }
                let x = l.tick();
                let mut o = l.strip.tick(x);
                if l.trim_on {
                    // After the strip, sends too: the whole part as you hear it.
                    let g = l.trim.next();
                    o.l *= g;
                    o.r *= g;
                    o.echo *= g;
                    o.verb *= g;
                    // Back at unity (within 0.001 dB: a one-pole in f32 stalls a few ulps short of its
                    // target): out of the path again, so the layer is bit for bit as it was.
                    if l.trim.target == 1.0 && (g - 1.0).abs() < 1e-4 {
                        l.trim.reset(1.0);
                        l.trim_on = false;
                    }
                }
                ml += o.l;
                mr += o.r;
                echo_in += o.echo;
                verb_in += o.verb;
                if self.analyse {
                    self.meters[li].tick(o.l, o.r);
                    live |= 1 << li;
                }
            }
            if self.analyse {
                self.clash.tick(&self.meters, live);
            }
            let (el, er) = self.echo.tick(echo_in);
            let (vl, vr) = self.verb.tick(verb_in + (el + er) * 0.15);
            let c = if self.click.env.is_active() { self.click.osc.next(self.click.hz / self.sr) * self.click.env.next() * 0.35 } else { 0.0 };
            ml += el + vl + c;
            mr += er + vr + c;
            let (ol, or) = self.master.tick(ml, mr);
            self.out_l[i] = ol;
            self.out_r[i] = or;
            if self.analyse {
                self.loud.tick(ol, or);
                let tp = self.out_tp.push(ol, or);
                if tp > self.out_tp_max {
                    self.out_tp_max = tp;
                }
            }

            self.rep_clock += bps;
            if running {
                self.tr.beat += bps;
                if self.tr.state == State::Playing {
                    self.tr.lpos += bps;
                    if self.tr.lpos >= self.tr.loop_len {
                        self.tr.lpos -= self.tr.loop_len;
                    }
                }
            }
            self.frame += 1;
        }

        if self.analyse && self.frame - self.last_meter >= self.meter_every {
            // Step by exactly one period so the rate averages 30 Hz whatever the block size.
            self.last_meter += self.meter_every;
            if self.frame - self.last_meter >= self.meter_every {
                self.last_meter = self.frame;
            }
            self.report(events);
        }

        if self.frame - self.last_pos >= self.pos_every {
            self.last_pos = self.frame;
            let beat = self.tr.loop_beat_at(self.tr.beat);
            let _ = events.push(OutEv { kind: out::POS, layer: 0, note: 0, flags: self.tr.flags(), vel: self.tr.tempo as f32, aux: -1.0, beat });
        }
    }
}
