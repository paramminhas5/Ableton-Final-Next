//! Channel strip, one per layer: low cut, 3-band eq, drive, crush, tone, duck,
//! pan and level, plus echo and reverb sends (post fader).
//!
//! A stereo part (a synth with its width up, 8 Nov) goes through two of everything that has a state, left and
//! right, set by the same smoothed knobs; pan becomes a balance (the same law on each side). A mono part takes
//! the old path, so it is bit for bit as before.

use crate::dsp::filter::{EqBand, OnePoleHp, OnePoleLp, Svf};
use crate::dsp::oversample::Drive;
use crate::dsp::smooth::Smooth;
use crate::dsp::tau_coef;
use crate::params::*;

/// What one channel of the strip remembers: the filters, the drive's oversampler, the crush's hold.
#[derive(Clone, Copy)]
struct Chan {
    cut: Svf,
    /// The part's own filter: open (bypassed) until its cutoff comes down.
    lp: crate::dsp::filter::CharFilter,
    low: EqBand,
    mid: EqBand,
    high: EqBand,
    drive: Drive,
    crush_hold: f32,
    crush_phase: f32,
    tone_lp: OnePoleLp,
    tone_hp: OnePoleHp,
}

/// The smoothed knobs for one sample, shared by both channels.
#[derive(Clone, Copy)]
struct Knobs {
    lp_hz: f32,
    lp_res: f32,
    drive: f32,
    crush: f32,
    tone: f32,
}

pub struct Strip {
    sr: f32,
    /// The left (or only) channel, and the right one for a stereo part.
    a: Chan,
    b: Chan,
    /// The last sample was stereo (the right channel is live).
    stereo: bool,
    cut_hz: f32,
    lp_hz: Smooth,
    lp_res: Smooth,
    /// Eq gains and low cut glide to their targets so moving them (or switching the
    /// whole mix for compare) never clicks.
    eq_db: [f32; 3],
    eq_target: [f32; 3],
    cut_target: f32,
    glide: f32,
    glide_count: u32,
    eq_dirty: bool,
    drive_amt: Smooth,
    crush: Smooth,
    tone: Smooth,
    level: Smooth,
    pan: Smooth,
    pub send: Smooth,
    pub echo: Smooth,
    pub duck_amt: f32,
    duck_amt_s: Smooth,
    duck_env: f32,
    duck_release: f32,
    duck_attack: f32,
    duck_target: f32,
    /// Smoothed peak, for metering later.
    pub peak: f32,
}

pub struct StripOut {
    pub l: f32,
    pub r: f32,
    pub echo: f32,
    pub verb: f32,
}

impl Strip {
    pub fn new(sr: f32) -> Self {
        let chan = Chan {
            cut: Svf::default(),
            lp: crate::dsp::filter::CharFilter::default(),
            low: EqBand::low_shelf(),
            mid: EqBand::bell(),
            high: EqBand::high_shelf(),
            drive: Drive::new(),
            crush_hold: 0.0,
            crush_phase: 0.0,
            tone_lp: OnePoleLp::default(),
            tone_hp: OnePoleHp::default(),
        };
        let mut s = Strip {
            sr,
            a: chan,
            b: chan,
            stereo: false,
            cut_hz: 20.0,
            lp_hz: Smooth::new(20_000.0),
            lp_res: Smooth::new(0.0),
            eq_db: [0.0; 3],
            eq_target: [0.0; 3],
            cut_target: 20.0,
            glide: tau_coef(0.025, sr / 16.0),
            glide_count: 0,
            eq_dirty: true,
            drive_amt: Smooth::new(0.0),
            crush: Smooth::new(0.0),
            tone: Smooth::new(0.0),
            level: Smooth::new(1.0),
            pan: Smooth::new(0.0),
            send: Smooth::new(0.0),
            echo: Smooth::new(0.0),
            duck_amt: 0.0,
            duck_amt_s: Smooth::new(0.0),
            duck_env: 0.0,
            duck_release: 0.0,
            duck_attack: 0.0,
            duck_target: 0.0,
            peak: 0.0,
        };
        s.a.cut.set(20.0, 0.707, sr);
        s.a.tone_lp.set(700.0, sr);
        s.a.tone_hp.set(700.0, sr);
        s.b = s.a;
        for sm in [&mut s.drive_amt, &mut s.crush, &mut s.tone, &mut s.level, &mut s.pan, &mut s.send, &mut s.echo, &mut s.duck_amt_s, &mut s.lp_hz, &mut s.lp_res] {
            sm.set_time(15.0, sr);
        }
        s.duck_attack = tau_coef(0.002, sr);
        s.set_duck_release(0.0);
        for (i, spec) in LAYER_PARAMS.iter().enumerate() {
            s.set_param(i, spec.to_value(spec.default), true);
        }
        s
    }

    fn set_duck_release(&mut self, amt: f32) {
        // The duck knob sets amount and release together: more duck, longer pump.
        self.duck_release = tau_coef((0.06 + amt * 0.22) / 3.0, self.sr);
    }

    pub fn set_param(&mut self, i: usize, v: f32, jump: bool) {
        let set = |s: &mut Smooth, v: f32| if jump { s.reset(v) } else { s.set(v) };
        match i {
            L_EQ_LOW | L_EQ_MID | L_EQ_HIGH => {
                let k = i - L_EQ_LOW;
                self.eq_target[k] = v;
                if jump {
                    self.eq_db[k] = v;
                    self.eq_dirty = true;
                }
            }
            L_EQ_CUT => {
                self.cut_target = v;
                if jump {
                    self.cut_hz = v;
                    self.a.cut.set(v, 0.707, self.sr);
                    self.b.cut.set(v, 0.707, self.sr);
                }
            }
            L_LP => set(&mut self.lp_hz, v),
            L_LP_RES => set(&mut self.lp_res, v),
            L_LP_KIND => {
                self.a.lp.set_mode(crate::params::step3(v));
                self.b.lp.set_mode(crate::params::step3(v));
            }
            L_DRIVE => set(&mut self.drive_amt, v),
            L_CRUSH => set(&mut self.crush, v),
            L_ECHO => set(&mut self.echo, v),
            L_TONE => set(&mut self.tone, v),
            L_LEVEL => set(&mut self.level, if v.is_finite() { db_to_gain(v) } else { 0.0 }),
            L_PAN => set(&mut self.pan, v),
            L_SEND => set(&mut self.send, v),
            L_DUCK => {
                self.duck_amt = v;
                set(&mut self.duck_amt_s, v);
                self.set_duck_release(v);
            }
            _ => {}
        }
    }

    /// A hit on the layer this one ducks under.
    pub fn duck_hit(&mut self) {
        if self.duck_amt > 0.0 {
            self.duck_target = 1.0;
        }
    }

    /// Move the eq and low cut a step towards their targets (every 16 samples).
    fn glide_eq(&mut self) {
        let g = self.glide;
        for k in 0..3 {
            let (c, t) = (self.eq_db[k], self.eq_target[k]);
            if c != t {
                let n = t + (c - t) * g;
                self.eq_db[k] = if (n - t).abs() < 0.02 { t } else { n };
                self.eq_dirty = true;
            }
        }
        if self.cut_hz != self.cut_target {
            // Glide in octaves, so the sweep sounds even.
            let (c, t) = (self.cut_hz.log2(), self.cut_target.log2());
            let n = t + (c - t) * g;
            self.cut_hz = if (n - t).abs() < 0.005 { self.cut_target } else { n.exp2() };
            self.a.cut.set(self.cut_hz, 0.707, self.sr);
            self.b.cut.set(self.cut_hz, 0.707, self.sr);
        }
    }

    /// The glides, the eq's coefficients when they moved, and this sample's smoothed knobs.
    #[inline]
    fn knobs(&mut self) -> Knobs {
        self.glide_count += 1;
        if self.glide_count >= 16 {
            self.glide_count = 0;
            self.glide_eq();
        }
        if self.eq_dirty {
            for c in [&mut self.a, &mut self.b] {
                c.low.set(110.0, 0.707, self.eq_db[0], self.sr);
                c.mid.set(1_000.0, 0.6, self.eq_db[1], self.sr);
                c.high.set(6_500.0, 0.707, self.eq_db[2], self.sr);
            }
            self.eq_dirty = false;
        }
        let (lp_hz, lp_res) = (self.lp_hz.next(), self.lp_res.next());
        let drive = self.drive_amt.next();
        let crush = self.crush.next();
        let tone = self.tone.next();
        Knobs { lp_hz, lp_res, drive, crush, tone }
    }

    /// One channel through the low cut, filter, eq, drive, crush and tone.
    #[inline]
    fn chan(c: &mut Chan, x: f32, k: &Knobs, cut_hz: f32, eq_db: &[f32; 3], sr: f32) -> f32 {
        let mut y = x;
        if cut_hz > 21.0 {
            y = c.cut.tick(y).hp;
        }
        if k.lp_hz < 19_500.0 {
            c.lp.set(k.lp_hz, k.lp_res, sr);
            y = c.lp.tick(y);
        }
        if eq_db[0] != 0.0 {
            y = c.low.tick(y);
        }
        if eq_db[1] != 0.0 {
            y = c.mid.tick(y);
        }
        if eq_db[2] != 0.0 {
            y = c.high.tick(y);
        }
        y = c.drive.process(y, k.drive);

        let cr = k.crush;
        if cr > 0.001 {
            // Sample-rate reduction then bit reduction. A deliberate lo-fi effect.
            let rate = 1.0 - cr * 0.94;
            c.crush_phase += rate;
            if c.crush_phase >= 1.0 {
                c.crush_phase -= 1.0;
                let bits = 16.0 - cr * 12.0;
                let q = bits.exp2() * 0.5;
                c.crush_hold = (y * q).round() / q;
            }
            y = y + (c.crush_hold - y) * (cr * 3.0).min(1.0);
        }

        let t = k.tone;
        if t.abs() > 0.001 {
            // Tilt: lean towards the low pass or the high pass around 700 Hz.
            let lp = c.tone_lp.tick(y);
            let hp = c.tone_hp.tick(y);
            y = if t < 0.0 { y + (lp * 1.4 - y) * -t } else { y + (hp * 1.6 + lp * 0.4 - y) * t };
        }
        y
    }

    /// The duck's gain now.
    #[inline]
    fn duck_gain(&mut self) -> f32 {
        // Duck: attack fast toward the target, then let it go.
        if self.duck_target > 0.0 {
            self.duck_env = self.duck_target + (self.duck_env - self.duck_target) * self.duck_attack;
            if self.duck_env > 0.98 {
                self.duck_target = 0.0;
            }
        } else {
            self.duck_env *= self.duck_release;
        }
        1.0 - self.duck_env * self.duck_amt_s.next() * 0.92
    }

    #[inline]
    pub fn tick(&mut self, x: f32) -> StripOut {
        self.stereo = false;
        let k = self.knobs();
        let y = Self::chan(&mut self.a, x, &k, self.cut_hz, &self.eq_db, self.sr);
        let duck = self.duck_gain();

        let g = self.level.next() * duck;
        let p = self.pan.next();
        // Equal-power pan.
        let a = (p + 1.0) * 0.25 * std::f32::consts::PI;
        let l = y * g * a.cos() * std::f32::consts::SQRT_2;
        let r = y * g * a.sin() * std::f32::consts::SQRT_2;
        let m = (l.abs()).max(r.abs());
        self.peak = if m > self.peak { m } else { self.peak * 0.9995 };
        let post = y * g;
        StripOut { l, r, echo: post * self.echo.next(), verb: post * self.send.next() }
    }

    /// A stereo part: left and right through their own channels, pan as a balance (each side keeps the
    /// equal-power law, so a centred stereo part plays at unity on both sides). The sends take the middle.
    #[inline]
    pub fn tick_stereo(&mut self, xl: f32, xr: f32) -> StripOut {
        if !self.stereo {
            // The right channel starts from where the left one is, so nothing jumps.
            self.b = self.a;
            self.stereo = true;
        }
        let k = self.knobs();
        let yl = Self::chan(&mut self.a, xl, &k, self.cut_hz, &self.eq_db, self.sr);
        let yr = Self::chan(&mut self.b, xr, &k, self.cut_hz, &self.eq_db, self.sr);
        let duck = self.duck_gain();
        let g = self.level.next() * duck;
        let p = self.pan.next();
        let a = (p + 1.0) * 0.25 * std::f32::consts::PI;
        let l = yl * g * a.cos() * std::f32::consts::SQRT_2;
        let r = yr * g * a.sin() * std::f32::consts::SQRT_2;
        let m = (l.abs()).max(r.abs());
        self.peak = if m > self.peak { m } else { self.peak * 0.9995 };
        let post = 0.5 * (yl + yr) * g;
        StripOut { l, r, echo: post * self.echo.next(), verb: post * self.send.next() }
    }

    /// Duck depth right now (0 = no dip). For tests and the duck graph.
    pub fn duck_depth(&self) -> f32 {
        self.duck_env * self.duck_amt_s.value * 0.92
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn centre_pan_unity_level_keeps_mono_power() {
        let mut s = Strip::new(48_000.0);
        let mut o = s.tick(0.5);
        for _ in 0..2000 {
            o = s.tick(0.5);
        }
        assert!((o.l - 0.5).abs() < 1e-3 && (o.r - 0.5).abs() < 1e-3, "{} {}", o.l, o.r);
    }

    #[test]
    fn duck_dips_then_recovers() {
        let sr = 48_000.0;
        let mut s = Strip::new(sr);
        s.set_param(L_DUCK, 0.6, true);
        for _ in 0..100 {
            s.tick(0.5);
        }
        s.duck_hit();
        let mut low = 1.0f32;
        for _ in 0..(sr * 0.02) as usize {
            low = low.min(s.tick(0.5).l);
        }
        assert!(low < 0.5 * 0.6, "should dip: {low}");
        let mut last = 0.0;
        for _ in 0..(sr * 0.6) as usize {
            last = s.tick(0.5).l;
        }
        assert!(last > 0.48, "should recover: {last}");
    }
}
