//! The engine core: transport, 8 layers, shared returns, master.
//!
//! Threading: the UI side only pushes `Cmd`s and pops `OutEv`s. The audio side calls
//! `process`. Nothing in `process` allocates or locks.

use crate::dsp::env::Decay;
use crate::dsp::osc::Sine;
use crate::dsp::soft_clip;
use crate::fx::{Echo, Reverb};
use crate::inst::{Bass, DrumRack};
use crate::params::*;
use crate::ring::Ring;
use crate::seq::{fire_range, NoteEv, Pattern, MAX_OFFS};
use crate::strip::Strip;

pub const MAX_LAYERS: usize = 8;
pub const MAX_BLOCK: usize = 4096;

/// Fixed delay from a note being triggered to it leaving the engine, in samples: the 2x
/// stages in the voice and in the strip. The sequencer fires this early so sequenced
/// notes land exactly on the grid. 1 ms at 48 kHz.
pub const LATENCY: usize = 4 * crate::dsp::oversample::LATENCY;

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
}

pub mod out {
    pub const PLAYED_ON: u32 = 1;
    pub const PLAYED_OFF: u32 = 2;
    pub const POS: u32 = 3;
    pub const SEQ_ON: u32 = 4;

    pub const F_PLAYING: u32 = 1;
    pub const F_COUNT_IN: u32 = 2;
    pub const F_RECORDING: u32 = 4;
    pub const F_LINK: u32 = 8;
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

pub struct Layer {
    pub inst: Instrument,
    pub drums: Box<DrumRack>,
    pub bass: Box<Bass>,
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
            strip: Strip::new(sr),
            params,
            live: Pattern::new(),
            staging: Pattern::new(),
            cursor: 0,
            offs: [(0, 0.0); MAX_OFFS],
            n_offs: 0,
            duck_src: -1,
            duck_note: -1,
        }
    }

    fn note_on(&mut self, note: u8, vel: f32) {
        match self.inst {
            Instrument::Drums => self.drums.note_on(note, vel),
            Instrument::Bass => self.bass.note_on(note, vel),
            Instrument::None => {}
        }
    }

    fn note_off(&mut self, note: u8) {
        if self.inst == Instrument::Bass {
            self.bass.note_off(note);
        }
    }

    fn all_off(&mut self) {
        self.n_offs = 0;
        self.bass.all_off();
    }

    fn set_param(&mut self, index: usize, norm: f32, jump: bool) {
        if index >= MAX_PARAMS {
            return;
        }
        let Some(spec) = spec_for(self.inst, index) else { return };
        self.params[index] = norm.clamp(0.0, 1.0);
        let v = spec.to_value(norm);
        if index < INSTRUMENT_BASE {
            self.strip.set_param(index, v, jump);
        } else {
            let i = index - INSTRUMENT_BASE;
            match self.inst {
                Instrument::Bass => self.bass.set_param(i, v),
                Instrument::Drums => self.drums.set_param(i, v),
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

    #[inline]
    fn tick(&mut self) -> f32 {
        match self.inst {
            Instrument::Drums => self.drums.tick(),
            Instrument::Bass => self.bass.tick(),
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
        Core {
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
        }
    }

    fn link_sync(&mut self, beat: f64, tempo: f64) {
        self.tr.link = true;
        if (self.tr.tempo - tempo).abs() > 1e-6 {
            self.tr.tempo = tempo;
            self.echo.set_tempo(tempo as f32);
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
            cmd::INSTRUMENT => {
                let l = &mut self.layers[li];
                l.all_off();
                l.inst = Instrument::from_u8(c.a as u8);
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
                }
            }
            cmd::LOOP => self.tr.loop_len = c.y.max(0.25),
            cmd::SWING => self.tr.swing = c.y.clamp(0.0, 0.75),
            cmd::PLAY => {
                if self.tr.state == State::Stopped {
                    self.start(0.0);
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
            if l.duck_src == src as i32 && (l.duck_note < 0 || l.duck_note == note as i32) {
                l.strip.duck_hit();
            }
        }
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
            for l in self.layers.iter_mut() {
                if l.inst == Instrument::None {
                    continue;
                }
                let x = l.tick();
                let o = l.strip.tick(x);
                ml += o.l;
                mr += o.r;
                echo_in += o.echo;
                verb_in += o.verb;
            }
            let (el, er) = self.echo.tick(echo_in);
            let (vl, vr) = self.verb.tick(verb_in + (el + er) * 0.15);
            let c = if self.click.env.is_active() { self.click.osc.next(self.click.hz / self.sr) * self.click.env.next() * 0.35 } else { 0.0 };
            ml += el + vl + c;
            mr += er + vr + c;
            // Safety stage. A proper glue compressor and true-peak limiter come with the mix step.
            self.out_l[i] = soft_clip(ml * 0.85).clamp(-1.0, 1.0);
            self.out_r[i] = soft_clip(mr * 0.85).clamp(-1.0, 1.0);

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

        if self.frame - self.last_pos >= self.pos_every {
            self.last_pos = self.frame;
            let beat = self.tr.loop_beat_at(self.tr.beat);
            let _ = events.push(OutEv { kind: out::POS, layer: 0, note: 0, flags: self.tr.flags(), vel: self.tr.tempo as f32, aux: -1.0, beat });
        }
    }
}
