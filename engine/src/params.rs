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
}

impl Bank {
    pub fn name(self) -> &'static str {
        match self {
            Bank::Sound => "sound",
            Bank::Eq => "eq",
            Bank::Fx => "fx",
            Bank::Mix => "mix",
            Bank::Shift => "shift",
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

/// Instrument params start here on the wire, after the layer block.
pub const INSTRUMENT_BASE: usize = 16;

// ── Bass (mono synth) ────────────────────────────────────────────────────────

pub const BASS_PARAMS: &[ParamSpec] = &[
    p("cutoff", "cutoff", Bank::Sound, 40.0, 12000.0, 0.45, Unit::Hz, Curve::Exp, 8.0, NONE),
    p("res", "res", Bank::Sound, 0.0, 1.0, 0.3, Unit::Pct, Curve::Lin, 8.0, NONE),
    p("env", "env", Bank::Sound, 0.0, 1.0, 0.45, Unit::Pct, Curve::Lin, 8.0, NONE),
    p("glide", "glide", Bank::Sound, 0.0, 400.0, 0.15, Unit::Ms, Curve::Lin, 0.0, NONE),
    p("decay", "decay", Bank::Shift, 30.0, 2000.0, 0.45, Unit::Ms, Curve::Exp, 0.0, NONE),
    p("wave", "wave", Bank::Shift, 0.0, 1.0, 0.0, Unit::None, Curve::Lin, 15.0, NONE),
    p("sub", "sub", Bank::Shift, 0.0, 1.0, 0.35, Unit::Pct, Curve::Lin, 15.0, NONE),
    p("drift", "drift", Bank::Shift, 0.0, 1.0, 0.2, Unit::Pct, Curve::Lin, 0.0, NONE),
];

pub const B_CUTOFF: usize = 0;
pub const B_RES: usize = 1;
pub const B_ENV: usize = 2;
pub const B_GLIDE: usize = 3;
pub const B_DECAY: usize = 4;
pub const B_WAVE: usize = 5;
pub const B_SUB: usize = 6;
pub const B_DRIFT: usize = 7;

// ── Drum rack: 16 pads, the sound bank shapes the selected pad ───────────────

pub const DRUM_PAD_PARAMS: &[ParamSpec] = &[
    p("tune", "tune", Bank::Sound, -12.0, 12.0, 0.5, Unit::Semis, Curve::Lin, 0.0, CENTRE),
    p("decay", "decay", Bank::Sound, 0.0, 1.0, 0.5, Unit::Pct, Curve::Lin, 0.0, NONE),
    p("drive", "drive", Bank::Sound, 0.0, 1.0, 0.15, Unit::Pct, Curve::Lin, 0.0, NONE),
    p("level", "level", Bank::Sound, 0.0, 1.0, FADER_UNITY, Unit::Db, Curve::Fader, 0.0, UNITY),
];

pub const DRUM_PADS: usize = 16;

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
}

impl Instrument {
    pub fn from_u8(v: u8) -> Instrument {
        match v {
            1 => Instrument::Drums,
            2 => Instrument::Bass,
            _ => Instrument::None,
        }
    }
    pub fn name(self) -> &'static str {
        match self {
            Instrument::None => "none",
            Instrument::Drums => "drums",
            Instrument::Bass => "bass",
        }
    }
    /// Number of instrument params on the wire.
    pub fn param_count(self) -> usize {
        match self {
            Instrument::None => 0,
            Instrument::Drums => DRUM_PADS * DRUM_PAD_PARAMS.len(),
            Instrument::Bass => BASS_PARAMS.len(),
        }
    }
    /// The spec for wire index `i` (counted from INSTRUMENT_BASE).
    pub fn spec(self, i: usize) -> Option<&'static ParamSpec> {
        match self {
            Instrument::None => None,
            Instrument::Bass => BASS_PARAMS.get(i),
            Instrument::Drums => DRUM_PAD_PARAMS.get(i % DRUM_PAD_PARAMS.len()).filter(|_| i < DRUM_PADS * DRUM_PAD_PARAMS.len()),
        }
    }
}

/// Total param slots per layer.
pub const MAX_PARAMS: usize = INSTRUMENT_BASE + DRUM_PADS * 4;

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
        assert!(INSTRUMENT_BASE + Instrument::Bass.param_count() <= MAX_PARAMS);
    }

    #[test]
    fn defaults_are_normalised() {
        for s in LAYER_PARAMS.iter().chain(BASS_PARAMS).chain(DRUM_PAD_PARAMS) {
            assert!((0.0..=1.0).contains(&s.default), "{}", s.id);
            for d in s.detents {
                assert!((0.0..=1.0).contains(d));
            }
        }
    }
}
