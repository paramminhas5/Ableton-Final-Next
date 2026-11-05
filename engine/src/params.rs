//! Parameter registry. One table that every knob, fader, lesson and export binds to.
//!
//! The UI always sends normalised values (0..1). The engine maps them through the
//! curve here. `gen-types` writes the same table to TypeScript so the screen can show
//! "−3 dB" or "pan l 20" without guessing.

#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum Bank {
    Sound,
    Eq,
    Fx,
    Mix,
    /// Not on a knob yet. Kept so lessons and presets can reach it.
    Shift,
    /// A modulation source's own settings (the layer lfo, the sampler's aux envelope): shown with the
    /// source's chip, never on a knob page.
    Mod,
}

impl Bank {
    pub fn name(self) -> &'static str {
        match self {
            Bank::Sound => "sound",
            Bank::Eq => "eq",
            Bank::Fx => "fx",
            Bank::Mix => "mix",
            Bank::Shift => "shift",
            Bank::Mod => "mod",
        }
    }
}

#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum Unit {
    None,
    Hz,
    Db,
    Pct,
    Ms,
    Semis,
    Pan,
}

impl Unit {
    pub fn name(self) -> &'static str {
        match self {
            Unit::None => "none",
            Unit::Hz => "hz",
            Unit::Db => "db",
            Unit::Pct => "pct",
            Unit::Ms => "ms",
            Unit::Semis => "st",
            Unit::Pan => "pan",
        }
    }
}

#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum Curve {
    /// min + n * (max - min)
    Lin,
    /// min * (max / min) ^ n. min must be > 0.
    Exp,
    /// Fader law in dB. n = 0 is silence, n = 0.75 is 0 dB, n = 1 is +6 dB.
    Fader,
}

impl Curve {
    pub fn name(self) -> &'static str {
        match self {
            Curve::Lin => "lin",
            Curve::Exp => "exp",
            Curve::Fader => "fader",
        }
    }
}

#[derive(Clone, Copy, Debug)]
pub struct ParamSpec {
    /// Short id inside its group, eg "cutoff". Full id is "<group>.<id>".
    pub id: &'static str,
    pub label: &'static str,
    pub bank: Bank,
    pub min: f32,
    pub max: f32,
    /// Default in normalised units (0..1), so double-tap reset is exact.
    pub default: f32,
    pub unit: Unit,
    pub curve: Curve,
    /// Smoothing time constant for zipper-free changes.
    pub smooth_ms: f32,
    /// Normalised positions the control should catch on (0 dB, centre).
    pub detents: &'static [f32],
}

const fn p(
    id: &'static str,
    label: &'static str,
    bank: Bank,
    min: f32,
    max: f32,
    default: f32,
    unit: Unit,
    curve: Curve,
    smooth_ms: f32,
    detents: &'static [f32],
) -> ParamSpec {
    ParamSpec { id, label, bank, min, max, default, unit, curve, smooth_ms, detents }
}

pub const FADER_UNITY: f32 = 0.75;
pub const FADER_MIN_DB: f32 = -60.0;
pub const FADER_MAX_DB: f32 = 6.0;

impl ParamSpec {
    /// Normalised (0..1) to the value the DSP uses (Hz, dB, ms, 0..1, -1..1).
    pub fn to_value(&self, n: f32) -> f32 {
        let n = n.clamp(0.0, 1.0);
        match self.curve {
            Curve::Lin => self.min + n * (self.max - self.min),
            Curve::Exp => self.min * (self.max / self.min).powf(n),
            Curve::Fader => fader_db(n),
        }
    }

    pub fn from_value(&self, v: f32) -> f32 {
        let n = match self.curve {
            Curve::Lin => (v - self.min) / (self.max - self.min),
            Curve::Exp => (v / self.min).ln() / (self.max / self.min).ln(),
            Curve::Fader => fader_norm(v),
        };
        n.clamp(0.0, 1.0)
    }
}

/// Fader law. Below unity a 1.6 power taper so the useful range gets most of the travel.
pub fn fader_db(n: f32) -> f32 {
    let n = n.clamp(0.0, 1.0);
    if n <= 0.0 {
        f32::NEG_INFINITY
    } else if n >= FADER_UNITY {
        (n - FADER_UNITY) / (1.0 - FADER_UNITY) * FADER_MAX_DB
    } else {
        FADER_MIN_DB * ((FADER_UNITY - n) / FADER_UNITY).powf(1.6)
    }
}

pub fn fader_norm(db: f32) -> f32 {
    if !db.is_finite() || db <= FADER_MIN_DB {
        0.0
    } else if db >= 0.0 {
        FADER_UNITY + (db / FADER_MAX_DB) * (1.0 - FADER_UNITY)
    } else {
        FADER_UNITY - FADER_UNITY * (db / FADER_MIN_DB).powf(1.0 / 1.6)
    }
}

pub fn fader_gain(n: f32) -> f32 {
    let db = fader_db(n);
    if db.is_finite() { db_to_gain(db) } else { 0.0 }
}

#[inline]
pub fn db_to_gain(db: f32) -> f32 {
    (db * 0.115_129_25).exp() // ln(10)/20
}

const NONE: &[f32] = &[];
const CENTRE: &[f32] = &[0.5];
const UNITY: &[f32] = &[FADER_UNITY];

// ── Every layer: eq, fx, mix ─────────────────────────────────────────────────
// Index order is the wire format. Append only.

pub const LAYER_PARAMS: &[ParamSpec] = &[
    p("eq.low", "low", Bank::Eq, -15.0, 15.0, 0.5, Unit::Db, Curve::Lin, 20.0, CENTRE),
    p("eq.mid", "mid", Bank::Eq, -15.0, 15.0, 0.5, Unit::Db, Curve::Lin, 20.0, CENTRE),
    p("eq.high", "high", Bank::Eq, -15.0, 15.0, 0.5, Unit::Db, Curve::Lin, 20.0, CENTRE),
    p("eq.cut", "low cut", Bank::Eq, 20.0, 1000.0, 0.0, Unit::Hz, Curve::Exp, 20.0, NONE),
    p("fx.drive", "drive", Bank::Fx, 0.0, 1.0, 0.0, Unit::Pct, Curve::Lin, 20.0, NONE),
    p("fx.crush", "crush", Bank::Fx, 0.0, 1.0, 0.0, Unit::Pct, Curve::Lin, 20.0, NONE),
    p("fx.echo", "echo", Bank::Fx, 0.0, 1.0, 0.0, Unit::Pct, Curve::Lin, 20.0, NONE),
    p("fx.tone", "tone", Bank::Fx, -1.0, 1.0, 0.5, Unit::None, Curve::Lin, 20.0, CENTRE),
    p("mix.level", "level", Bank::Mix, 0.0, 1.0, FADER_UNITY, Unit::Db, Curve::Fader, 15.0, UNITY),
    p("mix.pan", "pan", Bank::Mix, -1.0, 1.0, 0.5, Unit::Pan, Curve::Lin, 15.0, CENTRE),
    p("mix.send", "send", Bank::Mix, 0.0, 1.0, 0.0, Unit::Pct, Curve::Lin, 15.0, NONE),
    p("mix.duck", "duck", Bank::Mix, 0.0, 1.0, 0.0, Unit::Pct, Curve::Lin, 15.0, NONE),
    // A filter on every part (a cloud session, 5 Nov): cutoff (fully open by default, so nothing changes
    // until you turn it), resonance, and the three characters, so drums, samples and fx can teach filters too.
    p("fx.lp", "cutoff", Bank::Fx, 40.0, 20000.0, 1.0, Unit::Hz, Curve::Exp, 15.0, NONE),
    p("fx.lpres", "resonance", Bank::Fx, 0.0, 1.0, 0.0, Unit::Pct, Curve::Lin, 15.0, NONE),
    p("fx.lpkind", "circuit", Bank::Fx, 0.0, 1.0, 0.0, Unit::None, Curve::Lin, 0.0, NONE),
];

pub const L_EQ_LOW: usize = 0;
pub const L_EQ_MID: usize = 1;
pub const L_EQ_HIGH: usize = 2;
pub const L_EQ_CUT: usize = 3;
pub const L_DRIVE: usize = 4;
pub const L_CRUSH: usize = 5;
pub const L_ECHO: usize = 6;
pub const L_TONE: usize = 7;
pub const L_LEVEL: usize = 8;
pub const L_PAN: usize = 9;
pub const L_SEND: usize = 10;
pub const L_DUCK: usize = 11;
pub const L_LP: usize = 12;
pub const L_LP_RES: usize = 13;
pub const L_LP_KIND: usize = 14;

// ── Master bus ───────────────────────────────────────────────────────────────
// Sent with the MASTER command; index order is the wire format. Append only.

pub const MASTER_PARAMS: &[ParamSpec] = &[
    p("master.out", "out", Bank::Mix, 0.0, 1.0, FADER_UNITY, Unit::Db, Curve::Fader, 15.0, UNITY),
    p("master.glue", "glue", Bank::Mix, 0.0, 1.0, 0.25, Unit::Pct, Curve::Lin, 0.0, NONE),
    // Appended 5 Nov (engine 2, item 6): the glue's ratio switch (2, 4, 10 to 1), the high-pass on
    // what it listens to (off at the bottom, 90 Hz by default) and a dry/compressed mix.
    p("master.glueratio", "ratio", Bank::Mix, 0.0, 1.0, 0.0, Unit::None, Curve::Lin, 0.0, NONE),
    p("master.sidechain", "sidechain", Bank::Mix, 20.0, 300.0, 0.555, Unit::Hz, Curve::Exp, 0.0, NONE),
    p("master.gluemix", "dry/wet", Bank::Mix, 0.0, 1.0, 1.0, Unit::Pct, Curve::Lin, 15.0, NONE),
    // Appended 5 Nov (engine 2, item 9): which reverb the send goes to (hall or plate) and how long it rings.
    p("master.space", "algorithm", Bank::Mix, 0.0, 1.0, 0.0, Unit::None, Curve::Lin, 0.0, NONE),
    p("master.verbtime", "decay", Bank::Mix, 400.0, 8000.0, 0.598, Unit::Ms, Curve::Exp, 0.0, NONE),
    // Appended 5 Nov (engine 2, item 11): the echo's style (clean, tape, analogue) and how many repeats.
    p("master.echotype", "echo", Bank::Mix, 0.0, 1.0, 0.5, Unit::None, Curve::Lin, 0.0, NONE),
    p("master.repeats", "feedback", Bank::Mix, 0.0, 0.9, 0.4667, Unit::Pct, Curve::Lin, 0.0, NONE),
];

/// Instrument params start here on the wire, after the layer block.
pub const INSTRUMENT_BASE: usize = 16;

// ── Bass (mono synth) ────────────────────────────────────────────────────────

pub const BASS_PARAMS: &[ParamSpec] = &[
    p("cutoff", "cutoff", Bank::Sound, 40.0, 12000.0, 0.45, Unit::Hz, Curve::Exp, 8.0, NONE),
    p("res", "res", Bank::Sound, 0.0, 1.0, 0.3, Unit::Pct, Curve::Lin, 8.0, NONE),
    p("env", "env", Bank::Sound, 0.0, 1.0, 0.45, Unit::Pct, Curve::Lin, 8.0, NONE),
    p("glide", "glide", Bank::Sound, 0.0, 400.0, 0.15, Unit::Ms, Curve::Lin, 0.0, NONE),
    p("decay", "decay", Bank::Shift, 30.0, 2000.0, 0.45, Unit::Ms, Curve::Exp, 0.0, NONE),
    p("wave", "shape", Bank::Shift, 0.0, 1.0, 0.0, Unit::None, Curve::Lin, 15.0, NONE),
    p("sub", "sub", Bank::Shift, 0.0, 1.0, 0.35, Unit::Pct, Curve::Lin, 15.0, NONE),
    p("drift", "drift", Bank::Shift, 0.0, 1.0, 0.2, Unit::Pct, Curve::Lin, 0.0, NONE),
    // Appended 5 Nov (engine 2, item 7): the filter's character and the drive into it.
    p("character", "circuit", Bank::Shift, 0.0, 1.0, 0.0, Unit::None, Curve::Lin, 0.0, NONE),
    p("fdrive", "drive", Bank::Shift, 0.0, 1.0, 0.0, Unit::Pct, Curve::Lin, 15.0, NONE),
];

pub const B_CUTOFF: usize = 0;
pub const B_RES: usize = 1;
pub const B_ENV: usize = 2;
pub const B_GLIDE: usize = 3;
pub const B_DECAY: usize = 4;
pub const B_WAVE: usize = 5;
pub const B_SUB: usize = 6;
pub const B_DRIFT: usize = 7;
pub const B_CHAR: usize = 8;
pub const B_FDRIVE: usize = 9;

// ── The layer lfo: a modulation source for drums, fx and the sampler ─────────
// Live 12's LFO device (Max for Live modulators): Rate in Hz or, with the time mode toggle, in synced beat
// divisions; Waveform sine, up, down, triangle, square, random. The synths keep the lfo in their voice.
// Appended to each of the three tables (after leftovers, 5 Nov), so no saved knob moves.

pub const LFO_RATE_SPEC: ParamSpec = p("modrate", "rate", Bank::Mod, 0.05, 20.0, 0.5, Unit::Hz, Curve::Exp, 0.0, NONE);
pub const LFO_SYNC_SPEC: ParamSpec = p("modsync", "time mode", Bank::Mod, 0.0, 1.0, 1.0, Unit::None, Curve::Lin, 0.0, NONE);
pub const LFO_SYNCED_SPEC: ParamSpec = p("modsynced", "rate", Bank::Mod, 0.0, 1.0, 5.0 / 7.0, Unit::None, Curve::Lin, 0.0, NONE);
pub const LFO_WAVE_SPEC: ParamSpec = p("modwave", "waveform", Bank::Mod, 0.0, 1.0, 0.0, Unit::None, Curve::Lin, 0.0, NONE);
/// Offsets of the four lfo params inside the block each table appends.
pub const LFO_RATE: usize = 0;
pub const LFO_SYNC: usize = 1;
pub const LFO_SYNCED: usize = 2;
pub const LFO_WAVE: usize = 3;
pub const LFO_PARAMS: usize = 4;
/// Synced rates in beats: 1/32, 1/16, 1/8, 1/4, 1/2, 1 bar, 2 bars, 4 bars.
pub const LFO_BEATS: [f64; 8] = [0.125, 0.25, 0.5, 1.0, 2.0, 4.0, 8.0, 16.0];
pub fn lfo_beats(n: f32) -> f64 {
    LFO_BEATS[(n.clamp(0.0, 1.0) * 7.0).round() as usize]
}
/// Live's LFO waveforms, in its menu's order.
pub mod wave {
    pub const SINE: u8 = 0;
    pub const UP: u8 = 1;
    pub const DOWN: u8 = 2;
    pub const TRIANGLE: u8 = 3;
    pub const SQUARE: u8 = 4;
    pub const RANDOM: u8 = 5;
}
pub fn lfo_wave(n: f32) -> u8 {
    (n.clamp(0.0, 1.0) * 5.0).round() as u8
}

// ── Drum rack: 16 pads, the sound bank shapes the selected pad ───────────────

pub const DRUM_PAD_PARAMS: &[ParamSpec] = &[
    p("tune", "tune", Bank::Sound, -12.0, 12.0, 0.5, Unit::Semis, Curve::Lin, 0.0, CENTRE),
    p("decay", "decay", Bank::Sound, 0.0, 1.0, 0.5, Unit::Pct, Curve::Lin, 0.0, NONE),
    p("drive", "drive", Bank::Sound, 0.0, 1.0, 0.0, Unit::Pct, Curve::Lin, 0.0, NONE),
    p("level", "level", Bank::Sound, 0.0, 1.0, FADER_UNITY, Unit::Db, Curve::Fader, 0.0, UNITY),
];

pub const DRUM_PADS: usize = 16;

/// Rack-wide drum params, after the 16 pads' own: how open the closed hat is.
pub const DRUM_RACK_PARAMS: &[ParamSpec] = &[
    p("open", "open", Bank::Sound, 0.0, 1.0, 0.0, Unit::Pct, Curve::Lin, 0.0, NONE),
    LFO_RATE_SPEC,
    LFO_SYNC_SPEC,
    LFO_SYNCED_SPEC,
    LFO_WAVE_SPEC,
];
pub const D_OPEN: usize = 0;
/// The drums' lfo block, from DRUM_RACK_BASE.
pub const D_LFO: usize = 1;
/// Wire offset (from INSTRUMENT_BASE) of the first rack-wide drum param.
pub const DRUM_RACK_BASE: usize = DRUM_PADS * 4;
/// Slots kept for rack-wide drum params.
pub const DRUM_RACK_SLOTS: usize = 16;

/// Per pad, second page (engine 2): appended as its own block so the first four knobs keep their wire
/// indices. Wire index = INSTRUMENT_BASE + DRUM_PAD2_BASE + pad * DRUM_PAD2_STRIDE + index. The stride
/// keeps room so knobs added later never move the ones a saved song holds.
pub const DRUM_PAD2_PARAMS: &[ParamSpec] = &[
    // Item 5, part three: the kick's body, round (the 808's sine), tight (rounded off, like a 909's)
    // or hard (clipped almost square). Other pads ignore it.
    p("shape", "shape", Bank::Shift, 0.0, 1.0, 0.0, Unit::None, Curve::Lin, 0.0, NONE),
    // Item 8: every pad is a tone layer and a noise layer, each with its own envelope and filter.
    // noise: the balance (tone alone at 0, noise alone at 1); snap: how long the noise layer rings;
    // color: where its filter sits; sweep: how far the pitch falls; wobble: a pitch wobble on every
    // hit; random: each hit a little different (pitch, level, length, color).
    p("noise", "noise", Bank::Shift, 0.0, 1.0, 0.5, Unit::Pct, Curve::Lin, 0.0, NONE),
    p("snap", "noise decay", Bank::Shift, 0.0, 1.0, 0.5, Unit::Pct, Curve::Lin, 0.0, NONE),
    p("color", "color", Bank::Shift, -1.0, 1.0, 0.5, Unit::None, Curve::Lin, 0.0, CENTRE),
    p("sweep", "pitch env", Bank::Shift, 0.0, 1.0, 0.5, Unit::Pct, Curve::Lin, 0.0, NONE),
    p("wobble", "vibrato", Bank::Shift, 0.0, 1.0, 0.0, Unit::Pct, Curve::Lin, 0.0, NONE),
    p("random", "random", Bank::Shift, 0.0, 1.0, 0.0, Unit::Pct, Curve::Lin, 0.0, NONE),
];
pub const DP_SHAPE: usize = 0;
pub const DP_NOISE: usize = 1;
pub const DP_SNAP: usize = 2;
pub const DP_COLOR: usize = 3;
pub const DP_SWEEP: usize = 4;
pub const DP_WOBBLE: usize = 5;
pub const DP_RANDOM: usize = 6;
pub const DRUM_PAD2_BASE: usize = DRUM_RACK_BASE + DRUM_RACK_SLOTS;
pub const DRUM_PAD2_STRIDE: usize = 8;

/// Which of three steps a stepped knob is on.
pub fn step3(n: f32) -> u8 {
    if n < 0.34 { 0 } else if n < 0.67 { 1 } else { 2 }
}

// ── Chords: polyphonic synth ─────────────────────────────────────────────────

pub const CHORD_PARAMS: &[ParamSpec] = &[
    p("voicing", "voicing", Bank::Sound, 0.0, 1.0, 0.35, Unit::Pct, Curve::Lin, 15.0, NONE),
    p("spread", "spread", Bank::Sound, 0.0, 1.0, 0.4, Unit::Pct, Curve::Lin, 15.0, NONE),
    p("attack", "attack", Bank::Sound, 2.0, 1500.0, 0.3, Unit::Ms, Curve::Exp, 0.0, NONE),
    p("release", "release", Bank::Sound, 20.0, 4000.0, 0.45, Unit::Ms, Curve::Exp, 0.0, NONE),
    p("cutoff", "cutoff", Bank::Shift, 150.0, 16000.0, 0.62, Unit::Hz, Curve::Exp, 8.0, NONE),
    p("res", "res", Bank::Shift, 0.0, 1.0, 0.15, Unit::Pct, Curve::Lin, 8.0, NONE),
    p("env", "env", Bank::Shift, 0.0, 1.0, 0.3, Unit::Pct, Curve::Lin, 8.0, NONE),
    p("drift", "drift", Bank::Shift, 0.0, 1.0, 0.25, Unit::Pct, Curve::Lin, 0.0, NONE),
    // Appended 5 Nov: an lfo, a two-operator fm voice and a filter envelope of its own.
    p("lforate", "lfo rate", Bank::Shift, 0.1, 10.0, 0.5, Unit::Hz, Curve::Exp, 0.0, NONE),
    p("lfo", "lfo", Bank::Shift, 0.0, 1.0, 0.0, Unit::Pct, Curve::Lin, 15.0, NONE),
    p("lfoto", "lfo to", Bank::Shift, 0.0, 1.0, 0.0, Unit::None, Curve::Lin, 0.0, NONE),
    p("fm", "fm", Bank::Shift, 0.0, 1.0, 0.0, Unit::Pct, Curve::Lin, 15.0, NONE),
    p("ratio", "ratio", Bank::Shift, 0.0, 1.0, 0.25, Unit::None, Curve::Lin, 0.0, NONE),
    p("fdecay", "f decay", Bank::Shift, 30.0, 3000.0, 0.65, Unit::Ms, Curve::Exp, 0.0, NONE),
    p("frel", "f release", Bank::Shift, 20.0, 4000.0, 0.45, Unit::Ms, Curve::Exp, 0.0, NONE),
    // Appended 5 Nov (engine 2, item 7): the filter's character and the drive into it.
    p("character", "circuit", Bank::Shift, 0.0, 1.0, 0.0, Unit::None, Curve::Lin, 0.0, NONE),
    p("fdrive", "drive", Bank::Shift, 0.0, 1.0, 0.0, Unit::Pct, Curve::Lin, 15.0, NONE),    // Appended 5 Nov (engine 2, item 10): what makes the sound. synth (the oscillators), or a tuned
    // resonator: pluck (a string), mallet (a bar with a second resonator four times up), keys (two
    // strings a hair apart, struck). ring: how long the resonator rings at middle c; bright: the strike.
    p("voice", "exciter", Bank::Shift, 0.0, 1.0, 0.0, Unit::None, Curve::Lin, 0.0, NONE),
    p("ring", "decay", Bank::Shift, 100.0, 8000.0, 0.68, Unit::Ms, Curve::Exp, 0.0, NONE),
    p("bright", "stiffness", Bank::Shift, 0.0, 1.0, 0.5, Unit::Pct, Curve::Lin, 0.0, NONE),
    // Appended 5 Nov (engine 2, item 12): the oscillator. classic (saw to pulse on the wave knob),
    // table (a band-limited wavetable, the wave knob sweeps its eight frames), feedback (fm feedback,
    // the wave knob goes from sine through saw to noise), phase (casio cz phase distortion, the wave
    // knob and the filter envelope bend it from a cosine to a saw).
    p("osc", "osc", Bank::Shift, 0.0, 1.0, 0.0, Unit::None, Curve::Lin, 0.0, NONE),
];
pub const C_VOICING: usize = 0;
pub const C_SPREAD: usize = 1;
pub const C_ATTACK: usize = 2;
pub const C_RELEASE: usize = 3;
pub const C_CUTOFF: usize = 4;
pub const C_RES: usize = 5;
pub const C_ENV: usize = 6;
pub const C_DRIFT: usize = 7;
pub const C_LFO_RATE: usize = 8;
pub const C_LFO: usize = 9;
pub const C_LFO_TO: usize = 10;
pub const C_FM: usize = 11;
pub const C_RATIO: usize = 12;
pub const C_FDECAY: usize = 13;
pub const C_FREL: usize = 14;
pub const C_CHAR: usize = 15;
pub const C_FDRIVE: usize = 16;
pub const C_VOICE: usize = 17;
pub const C_RING: usize = 18;
pub const C_BRIGHT: usize = 19;
pub const C_OSC: usize = 20;

// ── Lead: mono synth with glide ──────────────────────────────────────────────

pub const LEAD_PARAMS: &[ParamSpec] = &[
    p("cutoff", "cutoff", Bank::Sound, 120.0, 16000.0, 0.6, Unit::Hz, Curve::Exp, 8.0, NONE),
    p("res", "res", Bank::Sound, 0.0, 1.0, 0.35, Unit::Pct, Curve::Lin, 8.0, NONE),
    p("attack", "attack", Bank::Sound, 1.0, 800.0, 0.1, Unit::Ms, Curve::Exp, 0.0, NONE),
    p("release", "release", Bank::Sound, 20.0, 3000.0, 0.4, Unit::Ms, Curve::Exp, 0.0, NONE),
    p("glide", "glide", Bank::Shift, 0.0, 400.0, 0.2, Unit::Ms, Curve::Lin, 0.0, NONE),
    p("wave", "shape", Bank::Shift, 0.0, 1.0, 0.0, Unit::None, Curve::Lin, 15.0, NONE),
    p("detune", "detune", Bank::Shift, 0.0, 1.0, 0.3, Unit::Pct, Curve::Lin, 15.0, NONE),
    p("env", "env", Bank::Shift, 0.0, 1.0, 0.35, Unit::Pct, Curve::Lin, 8.0, NONE),
    // Appended 5 Nov: an lfo, a two-operator fm voice and a filter envelope of its own.
    p("lforate", "lfo rate", Bank::Shift, 0.1, 10.0, 0.5, Unit::Hz, Curve::Exp, 0.0, NONE),
    p("lfo", "lfo", Bank::Shift, 0.0, 1.0, 0.0, Unit::Pct, Curve::Lin, 15.0, NONE),
    p("lfoto", "lfo to", Bank::Shift, 0.0, 1.0, 0.0, Unit::None, Curve::Lin, 0.0, NONE),
    p("fm", "fm", Bank::Shift, 0.0, 1.0, 0.0, Unit::Pct, Curve::Lin, 15.0, NONE),
    p("ratio", "ratio", Bank::Shift, 0.0, 1.0, 0.25, Unit::None, Curve::Lin, 0.0, NONE),
    p("fdecay", "f decay", Bank::Shift, 30.0, 3000.0, 0.53, Unit::Ms, Curve::Exp, 0.0, NONE),
    p("frel", "f release", Bank::Shift, 20.0, 3000.0, 0.4, Unit::Ms, Curve::Exp, 0.0, NONE),
    // Appended 5 Nov (engine 2, item 7): the filter's character and the drive into it.
    p("character", "circuit", Bank::Shift, 0.0, 1.0, 0.0, Unit::None, Curve::Lin, 0.0, NONE),
    p("fdrive", "drive", Bank::Shift, 0.0, 1.0, 0.0, Unit::Pct, Curve::Lin, 15.0, NONE),    // Appended 5 Nov (engine 2, item 10): what makes the sound. synth (the oscillators), or a tuned
    // resonator: pluck (a string), mallet (a bar with a second resonator four times up), keys (two
    // strings a hair apart, struck). ring: how long the resonator rings at middle c; bright: the strike.
    p("voice", "exciter", Bank::Shift, 0.0, 1.0, 0.0, Unit::None, Curve::Lin, 0.0, NONE),
    p("ring", "decay", Bank::Shift, 100.0, 8000.0, 0.68, Unit::Ms, Curve::Exp, 0.0, NONE),
    p("bright", "stiffness", Bank::Shift, 0.0, 1.0, 0.5, Unit::Pct, Curve::Lin, 0.0, NONE),
    // Appended 5 Nov (engine 2, item 12): the oscillator. classic (saw to pulse on the wave knob),
    // table (a band-limited wavetable, the wave knob sweeps its eight frames), feedback (fm feedback,
    // the wave knob goes from sine through saw to noise), phase (casio cz phase distortion, the wave
    // knob and the filter envelope bend it from a cosine to a saw).
    p("osc", "osc", Bank::Shift, 0.0, 1.0, 0.0, Unit::None, Curve::Lin, 0.0, NONE),
];
pub const LD_CUTOFF: usize = 0;
pub const LD_RES: usize = 1;
pub const LD_ATTACK: usize = 2;
pub const LD_RELEASE: usize = 3;
pub const LD_GLIDE: usize = 4;
pub const LD_WAVE: usize = 5;
pub const LD_DETUNE: usize = 6;
pub const LD_ENV: usize = 7;
pub const LD_LFO_RATE: usize = 8;
pub const LD_LFO: usize = 9;
pub const LD_LFO_TO: usize = 10;
pub const LD_FM: usize = 11;
pub const LD_RATIO: usize = 12;
pub const LD_FDECAY: usize = 13;
pub const LD_FREL: usize = 14;
pub const LD_CHAR: usize = 15;
pub const LD_FDRIVE: usize = 16;
pub const LD_VOICE: usize = 17;
pub const LD_RING: usize = 18;
pub const LD_BRIGHT: usize = 19;
pub const LD_OSC: usize = 20;

/// The fm ratio knob steps through these (modulator frequency over carrier).
pub const FM_RATIOS: [f32; 9] = [0.5, 1.0, 2.0, 3.0, 4.0, 5.0, 6.0, 7.0, 8.0];
pub fn fm_ratio(n: f32) -> f32 {
    FM_RATIOS[((n.clamp(0.0, 1.0) * (FM_RATIOS.len() - 1) as f32).round()) as usize]
}

/// What makes a synth's sound: 0 the oscillators, 1 pluck, 2 mallet, 3 keys (engine 2, item 10).
pub fn voice_model(n: f32) -> u8 {
    (n.clamp(0.0, 1.0) * 3.0).round() as u8
}

/// Which oscillator: 0 classic, 1 table, 2 feedback, 3 phase (engine 2, item 12).
pub fn osc_kind(n: f32) -> u8 {
    (n.clamp(0.0, 1.0) * 3.0).round() as u8
}

/// Where the lfo goes: 0 the filter, 1 the pitch, 2 the volume.
pub fn lfo_dest(n: f32) -> u8 {
    if n < 0.34 { 0 } else if n < 0.67 { 1 } else { 2 }
}

// ── FX: noise, sweeps, impacts, riser ────────────────────────────────────────

pub const FX_PARAMS: &[ParamSpec] = &[
    p("length", "length", Bank::Sound, 1.0, 8.0, 0.43, Unit::None, Curve::Lin, 0.0, NONE),
    p("noise", "noise", Bank::Sound, 0.0, 1.0, 0.6, Unit::Pct, Curve::Lin, 15.0, NONE),
    p("filter", "cutoff", Bank::Sound, 200.0, 14000.0, 0.7, Unit::Hz, Curve::Exp, 15.0, NONE),
    p("reverb", "reverb", Bank::Sound, 0.0, 1.0, 0.3, Unit::Pct, Curve::Lin, 15.0, NONE),
    // The riser fader. 0 is calm, 1 is the peak. Driven by hand or by a riser hit.
    p("build", "build", Bank::Shift, 0.0, 1.0, 0.0, Unit::Pct, Curve::Lin, 0.0, NONE),
    p("tune", "tune", Bank::Shift, -12.0, 12.0, 0.5, Unit::Semis, Curve::Lin, 0.0, CENTRE),
    LFO_RATE_SPEC,
    LFO_SYNC_SPEC,
    LFO_SYNCED_SPEC,
    LFO_WAVE_SPEC,
];
pub const F_LENGTH: usize = 0;
pub const F_NOISE: usize = 1;
pub const F_FILTER: usize = 2;
pub const F_REVERB: usize = 3;
pub const F_BUILD: usize = 4;
pub const F_TUNE: usize = 5;
pub const F_LFO: usize = 6;

// ── Sampler: 16 slots as pads, or slot 0 as a keyboard ───────────────────────

pub const SAMPLER_PARAMS: &[ParamSpec] = &[
    p("tune", "tune", Bank::Sound, -12.0, 12.0, 0.5, Unit::Semis, Curve::Lin, 0.0, CENTRE),
    p("start", "start", Bank::Sound, 0.0, 1.0, 0.0, Unit::Pct, Curve::Lin, 0.0, NONE),
    p("release", "release", Bank::Sound, 10.0, 2000.0, 0.25, Unit::Ms, Curve::Exp, 0.0, NONE),
    p("gate", "gate", Bank::Shift, 0.0, 1.0, 0.0, Unit::None, Curve::Lin, 0.0, NONE),
    p("keys", "keys", Bank::Shift, 0.0, 1.0, 0.0, Unit::None, Curve::Lin, 0.0, NONE),
    p("reverse", "reverse", Bank::Shift, 0.0, 1.0, 0.0, Unit::None, Curve::Lin, 0.0, NONE),
    LFO_RATE_SPEC,
    LFO_SYNC_SPEC,
    LFO_SYNCED_SPEC,
    LFO_WAVE_SPEC,
    // Live's Sampler calls its free envelope the auxiliary envelope (its Modulation tab): attack and decay.
    p("auxattack", "attack", Bank::Mod, 1.0, 2000.0, 0.15, Unit::Ms, Curve::Exp, 0.0, NONE),
    p("auxdecay", "decay", Bank::Mod, 10.0, 4000.0, 0.5, Unit::Ms, Curve::Exp, 0.0, NONE),
];
pub const S_TUNE: usize = 0;
pub const S_START: usize = 1;
pub const S_RELEASE: usize = 2;
pub const S_GATE: usize = 3;
pub const S_PITCHED: usize = 4;
pub const S_REVERSE: usize = 5;
pub const S_LFO: usize = 6;
pub const S_AUX_ATTACK: usize = 10;
pub const S_AUX_DECAY: usize = 11;
/// Pad n answers to this note plus n. In keys mode every note plays slot 0 from this root.
pub const SAMPLER_NOTE_BASE: u8 = 36;
pub const SAMPLER_ROOT: u8 = 60;

/// fx pads, bottom-left first. The note each one answers to is `FX_NOTE_BASE + index`.
pub const FX_NAMES: [&str; 8] = ["impact", "sub drop", "noise hit", "sweep up", "sweep down", "riser", "zap", "whoosh"];
pub const FX_NOTE_BASE: u8 = 36;
pub const FX_RISER_NOTE: u8 = 41;
pub const FX_IMPACT_NOTE: u8 = 36;

/// Pad names, bottom-left first (pad 0 is the kick, like an MPC/Push drum rack).
pub const DRUM_PAD_NAMES: [&str; DRUM_PADS] = [
    "kick", "snare", "clap", "rim",
    "closed hat", "open hat", "shaker", "ride",
    "low tom", "mid tom", "high tom", "crash",
    "perc 1", "perc 2", "fx", "reverse",
];

/// General MIDI note for each pad, so exports land on the right sounds in Live's drum racks.
pub const DRUM_PAD_NOTES: [u8; DRUM_PADS] = [36, 38, 39, 37, 42, 46, 70, 51, 41, 45, 48, 49, 60, 61, 54, 55];

#[derive(Clone, Copy, Debug, PartialEq, Eq)]
#[repr(u8)]
pub enum Instrument {
    None = 0,
    Drums = 1,
    Bass = 2,
    Chords = 3,
    Lead = 4,
    Fx = 5,
    Sampler = 6,
}

impl Instrument {
    pub fn from_u8(v: u8) -> Instrument {
        match v {
            1 => Instrument::Drums,
            2 => Instrument::Bass,
            3 => Instrument::Chords,
            4 => Instrument::Lead,
            5 => Instrument::Fx,
            6 => Instrument::Sampler,
            _ => Instrument::None,
        }
    }
    pub fn name(self) -> &'static str {
        match self {
            Instrument::None => "none",
            Instrument::Drums => "drums",
            Instrument::Bass => "bass",
            Instrument::Chords => "chords",
            Instrument::Lead => "lead",
            Instrument::Fx => "fx",
            Instrument::Sampler => "sampler",
        }
    }
    /// Number of instrument params on the wire.
    pub fn param_count(self) -> usize {
        match self {
            Instrument::None => 0,
            Instrument::Drums => DRUM_PAD2_BASE + DRUM_PADS * DRUM_PAD2_STRIDE,
            Instrument::Bass => BASS_PARAMS.len(),
            Instrument::Chords => CHORD_PARAMS.len(),
            Instrument::Lead => LEAD_PARAMS.len(),
            Instrument::Fx => FX_PARAMS.len(),
            Instrument::Sampler => SAMPLER_PARAMS.len(),
        }
    }
    /// The spec for wire index `i` (counted from INSTRUMENT_BASE).
    pub fn spec(self, i: usize) -> Option<&'static ParamSpec> {
        match self {
            Instrument::None => None,
            Instrument::Bass => BASS_PARAMS.get(i),
            Instrument::Chords => CHORD_PARAMS.get(i),
            Instrument::Lead => LEAD_PARAMS.get(i),
            Instrument::Fx => FX_PARAMS.get(i),
            Instrument::Sampler => SAMPLER_PARAMS.get(i),
            Instrument::Drums => {
                if i < DRUM_RACK_BASE {
                    DRUM_PAD_PARAMS.get(i % DRUM_PAD_PARAMS.len())
                } else if i < DRUM_PAD2_BASE {
                    DRUM_RACK_PARAMS.get(i - DRUM_RACK_BASE)
                } else {
                    DRUM_PAD2_PARAMS.get((i - DRUM_PAD2_BASE) % DRUM_PAD2_STRIDE)
                }
            }
        }
    }
}

/// Wire index of the layer lfo's first param for this instrument, if it has the layer lfo.
pub fn lfo_base(inst: Instrument) -> Option<usize> {
    match inst {
        Instrument::Drums => Some(INSTRUMENT_BASE + DRUM_RACK_BASE + D_LFO),
        Instrument::Fx => Some(INSTRUMENT_BASE + F_LFO),
        Instrument::Sampler => Some(INSTRUMENT_BASE + S_LFO),
        _ => None,
    }
}

/// Total param slots per layer.
pub const MAX_PARAMS: usize = INSTRUMENT_BASE + DRUM_PAD2_BASE + DRUM_PADS * DRUM_PAD2_STRIDE;

/// Look up any wire index for a layer of this instrument.
pub fn spec_for(inst: Instrument, index: usize) -> Option<&'static ParamSpec> {
    if index < INSTRUMENT_BASE {
        LAYER_PARAMS.get(index)
    } else {
        inst.spec(index - INSTRUMENT_BASE)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn fader_law_round_trips() {
        for i in 1..=100 {
            let n = i as f32 / 100.0;
            let back = fader_norm(fader_db(n));
            assert!((back - n).abs() < 1e-4, "n={n} back={back}");
        }
        assert_eq!(fader_db(FADER_UNITY), 0.0);
        assert_eq!(fader_db(1.0), 6.0);
        assert!(fader_db(0.0).is_infinite());
    }

    #[test]
    fn exp_curve_hits_ends() {
        let c = &BASS_PARAMS[B_CUTOFF];
        assert!((c.to_value(0.0) - 40.0).abs() < 1e-3);
        assert!((c.to_value(1.0) - 12000.0).abs() < 1.0);
        assert!((c.from_value(c.to_value(0.37)) - 0.37).abs() < 1e-4);
    }

    #[test]
    fn layer_params_fit_before_instrument_block() {
        assert!(LAYER_PARAMS.len() <= INSTRUMENT_BASE);
        assert!(INSTRUMENT_BASE + Instrument::Drums.param_count() <= MAX_PARAMS);
        assert!(DRUM_RACK_PARAMS.len() <= DRUM_RACK_SLOTS && DRUM_PAD2_PARAMS.len() <= DRUM_PAD2_STRIDE);
        for i in [Instrument::Bass, Instrument::Chords, Instrument::Lead, Instrument::Fx, Instrument::Sampler] {
            assert!(INSTRUMENT_BASE + i.param_count() <= MAX_PARAMS);
        }
    }

    #[test]
    fn defaults_are_normalised() {
        for s in LAYER_PARAMS.iter().chain(BASS_PARAMS).chain(DRUM_PAD_PARAMS).chain(DRUM_RACK_PARAMS).chain(DRUM_PAD2_PARAMS).chain(CHORD_PARAMS).chain(LEAD_PARAMS).chain(FX_PARAMS).chain(SAMPLER_PARAMS).chain(MASTER_PARAMS) {
            assert!((0.0..=1.0).contains(&s.default), "{}", s.id);
            for d in s.detents {
                assert!((0.0..=1.0).contains(d));
            }
        }
    }
}
