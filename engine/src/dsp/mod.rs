//! Building blocks. Everything here is allocation-free after construction.

pub mod env;
pub mod filter;
pub mod osc;
pub mod oversample;
pub mod smooth;

pub const TAU: f32 = std::f32::consts::TAU;
pub const PI: f32 = std::f32::consts::PI;

/// MIDI note to Hz, with fractional notes for glide and drift.
#[inline]
pub fn note_hz(note: f32) -> f32 {
    440.0 * ((note - 69.0) * (1.0 / 12.0)).exp2()
}

/// One-pole coefficient for a time constant in seconds.
#[inline]
pub fn tau_coef(seconds: f32, sr: f32) -> f32 {
    if seconds <= 0.0 { 0.0 } else { (-1.0 / (seconds * sr)).exp() }
}

/// Saturation that stays smooth and odd-symmetric. Cheaper than tanh, same shape near 0.
#[inline]
pub fn soft_clip(x: f32) -> f32 {
    // Pade approximant of tanh, clamped where it stops being monotonic.
    let x = x.clamp(-3.0, 3.0);
    let x2 = x * x;
    x * (27.0 + x2) / (27.0 + 9.0 * x2)
}

/// Small fast random source for noise and drift. Not for anything security related.
#[derive(Clone, Copy)]
pub struct Rng(u32);

impl Rng {
    pub const fn new(seed: u32) -> Self {
        Rng(if seed == 0 { 0x9E37_79B9 } else { seed })
    }
    #[inline]
    pub fn next_u32(&mut self) -> u32 {
        let mut x = self.0;
        x ^= x << 13;
        x ^= x >> 17;
        x ^= x << 5;
        self.0 = x;
        x
    }
    /// White noise in -1..1.
    #[inline]
    pub fn bipolar(&mut self) -> f32 {
        (self.next_u32() as f32 * (1.0 / 2_147_483_648.0)) - 1.0
    }
}

#[inline]
pub fn flush_denormal(x: f32) -> f32 {
    if x.abs() < 1e-20 { 0.0 } else { x }
}
