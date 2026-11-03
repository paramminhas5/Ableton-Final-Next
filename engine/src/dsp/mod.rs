//! Building blocks. Everything here is allocation-free after construction.

pub mod env;
pub mod filter;
pub mod osc;
pub mod oversample;
pub mod smooth;

pub const TAU: f32 = std::f32::consts::TAU;
pub const PI: f32 = std::f32::consts::PI;

/// sin(2*pi*phase) for phase in [0, 1). Polynomial, about 4e-6 worst-case error, a lot
/// cheaper than libm's sin in WebAssembly.
#[inline]
pub fn sin_cycle(phase: f32) -> f32 {
    let mut t = phase - 0.5;
    if t > 0.25 {
        t = 0.5 - t;
    } else if t < -0.25 {
        t = -0.5 - t;
    }
    let u = t * TAU;
    let u2 = u * u;
    -(u * (1.0 + u2 * (-1.0 / 6.0 + u2 * (1.0 / 120.0 + u2 * (-1.0 / 5040.0 + u2 * (1.0 / 362_880.0))))))
}

/// tan(x) for 0 <= x < pi/2, Pade approximant. Good to about 0.1% up to 0.47*pi.
#[inline]
pub fn fast_tan(x: f32) -> f32 {
    let x2 = x * x;
    x * (945.0 + x2 * (-105.0 + x2)) / (945.0 + x2 * (-420.0 + 15.0 * x2))
}

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

#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn fast_math_is_close() {
        for i in 0..1000 {
            let p = i as f32 / 1000.0;
            assert!((sin_cycle(p) - (p * TAU).sin()).abs() < 1e-5, "sin at {p}");
        }
        for i in 1..95 {
            let x = i as f32 / 100.0 * PI * 0.5;
            let rel = (fast_tan(x) - x.tan()).abs() / x.tan();
            assert!(rel < 0.02, "tan at {x}: {rel}");
        }
    }
}

#[inline]
pub fn flush_denormal(x: f32) -> f32 {
    if x.abs() < 1e-20 { 0.0 } else { x }
}
