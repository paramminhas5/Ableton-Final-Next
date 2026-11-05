//! Punch-in effects (the EP-133's punch-in fx, Push 3's XY punch-in effects, djay's crossfader fx): hold a
//! key and the whole mix goes through one effect; where you press sets the amount; let go and it fades back
//! to the dry mix in 8 ms, after which the output is the input, bit for bit.
//!
//! - Beat repeat (the stutter): loops the last slice of the mix, a 1/4 to a 1/32 note long by the amount.
//! - Filter sweep: the DJ filter. Below the middle a low pass closing down to 120 Hz, above it a high pass
//!   opening up to 4 kHz, gliding to where you press.
//! - Tape stop: the mix slows to a stop, pitch and all, over 0.15 to 2 seconds by the amount.
//! - Reverb throw: sends the mix into the shared reverb while held; the dry mix is untouched and the tail
//!   rings on after you let go.
//!
//! The mix is always written into a four-second ring (two stores a sample), so an effect starts the
//! moment it is pressed. Nothing allocates after `new`.

use crate::dsp::filter::Svf;

pub const OFF: u8 = 0;
pub const REPEAT: u8 = 1;
pub const FILTER: u8 = 2;
pub const TAPE_STOP: u8 = 3;
pub const THROW: u8 = 4;

/// Seconds of mix the ring holds.
const RING_S: f32 = 4.0;
/// Fade in and out, seconds.
const FADE_S: f32 = 0.008;
/// Crossfade at the beat repeat's loop point, samples.
const LOOP_XF: usize = 64;

pub struct Punch {
    sr: f32,
    l: Vec<f32>,
    r: Vec<f32>,
    w: usize,
    /// The effect playing (or fading out).
    pub mode: u8,
    /// 0..1, where the key was pressed.
    pub amount: f32,
    held: bool,
    /// 0 dry .. 1 the effect, ramped so nothing clicks.
    pub mix: f32,
    step: f32,
    // beat repeat
    rep_start: usize,
    rep_len: usize,
    rep_pos: usize,
    // tape stop
    tape_pos: f64,
    tape_rate: f64,
    tape_dec: f64,
    // filter sweep
    fl: Svf,
    fr: Svf,
    cut: f32,
    hp: bool,
}

/// Beat repeat lengths in beats, by amount: a quarter note at the left, a 32nd at the right.
pub fn repeat_beats(amount: f32) -> f64 {
    match (amount.clamp(0.0, 1.0) * 4.0) as u32 {
        0 => 1.0,
        1 => 0.5,
        2 => 0.25,
        _ => 0.125,
    }
}

/// Tape stop time in seconds, by amount.
pub fn tape_seconds(amount: f32) -> f32 {
    0.15 + amount.clamp(0.0, 1.0) * 1.85
}

/// The filter sweep's cutoff and whether it is a high pass, by amount.
pub fn filter_at(amount: f32) -> (f32, bool) {
    let a = amount.clamp(0.0, 1.0);
    if a < 0.5 {
        // 0 .. 0.5: low pass from 120 Hz up to 18 kHz (open in the middle).
        (120.0 * (18_000.0f32 / 120.0).powf(a / 0.5), false)
    } else {
        // 0.5 .. 1: high pass from 20 Hz up to 4 kHz.
        (20.0 * (4_000.0f32 / 20.0).powf((a - 0.5) / 0.5), true)
    }
}

impl Punch {
    pub fn new(sr: f32) -> Self {
        let n = (sr * RING_S) as usize;
        Punch {
            sr,
            l: vec![0.0; n],
            r: vec![0.0; n],
            w: 0,
            mode: OFF,
            amount: 0.0,
            held: false,
            mix: 0.0,
            step: 1.0 / (FADE_S * sr),
            rep_start: 0,
            rep_len: 1,
            rep_pos: 0,
            tape_pos: 0.0,
            tape_rate: 1.0,
            tape_dec: 0.0,
            fl: Svf::default(),
            fr: Svf::default(),
            cut: 18_000.0,
            hp: false,
        }
    }

    /// Press (or move on) an effect key: `mode` with `amount`. `OFF` lets go. `bps` is beats per second.
    pub fn set(&mut self, mode: u8, amount: f32, bps: f64) {
        let amount = amount.clamp(0.0, 1.0);
        if mode == OFF {
            self.held = false;
            return;
        }
        let fresh = !self.held || mode != self.mode;
        let n = self.l.len();
        self.held = true;
        if fresh {
            self.mode = mode;
            match mode {
                TAPE_STOP => {
                    self.tape_pos = (self.w + n - 1) as f64 % n as f64;
                    self.tape_rate = 1.0;
                    self.tape_dec = 1.0 / (tape_seconds(amount) as f64 * self.sr as f64);
                }
                FILTER => {
                    if self.mix <= 0.0 {
                        self.fl.reset();
                        self.fr.reset();
                        // Start the glide from open, so the sweep is heard.
                        self.cut = if filter_at(amount).1 { 20.0 } else { 18_000.0 };
                    }
                }
                _ => {}
            }
        }
        if mode == REPEAT {
            let len = ((repeat_beats(amount) / bps.max(1e-6) * self.sr as f64) as usize).clamp(LOOP_XF * 2, n / 2);
            if fresh || len != self.rep_len {
                // The slice that just played, ending now.
                self.rep_start = (self.w + n - len) % n;
                self.rep_len = len;
                self.rep_pos = 0;
            }
        }
        self.amount = amount;
    }

    /// Whether anything is playing or fading (false means the output is exactly the input).
    #[inline]
    pub fn active(&self) -> bool {
        self.held || self.mix > 0.0
    }

    /// The reverb throw's send for this sample (0 unless throwing). Call before `tick`.
    #[inline]
    pub fn throw_send(&self, l: f32, r: f32) -> f32 {
        if self.mode == THROW && self.mix > 0.0 {
            (l + r) * 0.5 * self.mix * (0.3 + 0.7 * self.amount) * 1.6
        } else {
            0.0
        }
    }

    #[inline]
    fn ring(&self, buf: &[f32], pos: f64) -> f32 {
        let n = buf.len();
        let i = pos.floor() as usize % n;
        let f = (pos - pos.floor()) as f32;
        buf[i] + (buf[(i + 1) % n] - buf[i]) * f
    }

    /// One sample of the mix through the punch: returns what plays.
    #[inline]
    pub fn tick(&mut self, l: f32, r: f32) -> (f32, f32) {
        let n = self.l.len();
        self.l[self.w] = l;
        self.r[self.w] = r;
        self.w = (self.w + 1) % n;
        if !self.held && self.mix <= 0.0 {
            return (l, r);
        }
        self.mix = if self.held { (self.mix + self.step).min(1.0) } else { (self.mix - self.step).max(0.0) };
        if self.mix <= 0.0 {
            // Faded out: back to the dry mix exactly, ready for the next press.
            self.mode = OFF;
            self.fl.reset();
            self.fr.reset();
            return (l, r);
        }
        let (wl, wr) = match self.mode {
            REPEAT => {
                let p = self.rep_pos;
                let i = (self.rep_start + p) % n;
                let (mut a, mut b) = (self.l[i], self.r[i]);
                // Fade the loop's end into its start so the repeat does not click.
                let left = self.rep_len - p;
                if left <= LOOP_XF {
                    let t = 1.0 - left as f32 / LOOP_XF as f32;
                    let j = (self.rep_start + n - left) % n;
                    a = a * (1.0 - t) + self.l[j] * t;
                    b = b * (1.0 - t) + self.r[j] * t;
                }
                self.rep_pos = (p + 1) % self.rep_len;
                (a, b)
            }
            TAPE_STOP => {
                if self.tape_rate <= 0.0 {
                    (0.0, 0.0)
                } else {
                    let a = self.ring(&self.l, self.tape_pos) * self.tape_rate.sqrt() as f32;
                    let b = self.ring(&self.r, self.tape_pos) * self.tape_rate.sqrt() as f32;
                    self.tape_pos = (self.tape_pos + self.tape_rate) % n as f64;
                    self.tape_rate = (self.tape_rate - self.tape_dec).max(0.0);
                    (a, b)
                }
            }
            FILTER => {
                let (target, hp) = filter_at(self.amount);
                if hp != self.hp {
                    self.hp = hp;
                    self.cut = if hp { 20.0 } else { 18_000.0 };
                }
                // Glide in octaves, about 60 ms for the whole range.
                self.cut *= (target / self.cut).powf(0.0035);
                self.fl.set(self.cut, 0.9, self.sr);
                self.fr.set(self.cut, 0.9, self.sr);
                let (a, b) = (self.fl.tick(l), self.fr.tick(r));
                if self.hp {
                    (a.hp, b.hp)
                } else {
                    (a.lp, b.lp)
                }
            }
            _ => (l, r), // the throw leaves the dry mix alone
        };
        let m = self.mix;
        (l + (wl - l) * m, r + (wr - r) * m)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn noise(n: usize) -> Vec<f32> {
        let mut s = 12345u32;
        (0..n)
            .map(|_| {
                s = s.wrapping_mul(1_664_525).wrapping_add(1_013_904_223);
                (s >> 8) as f32 / 16_777_216.0 - 0.5
            })
            .collect()
    }

    #[test]
    fn idle_is_bit_identical() {
        let mut p = Punch::new(48_000.0);
        for x in noise(50_000) {
            let (a, b) = p.tick(x, -x);
            assert_eq!(a.to_bits(), x.to_bits());
            assert_eq!(b.to_bits(), (-x).to_bits());
        }
    }

    #[test]
    fn after_letting_go_it_is_the_input_again_bit_for_bit() {
        for mode in [REPEAT, FILTER, TAPE_STOP, THROW] {
            let mut p = Punch::new(48_000.0);
            let x = noise(60_000);
            for (i, v) in x.iter().enumerate() {
                if i == 10_000 {
                    p.set(mode, 0.3, 2.0);
                }
                if i == 30_000 {
                    p.set(OFF, 0.0, 2.0);
                }
                let (a, _) = p.tick(*v, *v);
                // 8 ms of fade after letting go, then exact.
                if i >= 30_000 + 400 {
                    assert_eq!(a.to_bits(), v.to_bits(), "mode {mode} sample {i}");
                }
            }
        }
    }
}
