//! Note events and the per-layer sequencer. Every surface (steps, keys, pads, circle)
//! produces the same events: a note, a velocity, a start and a length, in beats.

#[derive(Clone, Copy, Debug, PartialEq)]
pub struct NoteEv {
    /// Start, in beats from the loop start.
    pub start: f64,
    /// Length in beats.
    pub len: f64,
    pub note: u8,
    pub vel: f32,
    /// Chance it plays each time round, 0..1 (Live 12's "chance"). 1 always plays.
    pub chance: f32,
    /// Trig condition (Elektron): see `cond`. 0 always plays.
    pub cond: u8,
    /// Which play of the part's loop this event belongs to inside the engine's loop, and how many plays
    /// the engine's loop holds (an arranged song repeats a part's loop many times in one engine loop).
    /// The play count a condition reads is `pass * reps + it`.
    pub it: u32,
    pub reps: u32,
    /// Parameter locks (Elektron's p-locks), applied on the note's own sample before it sounds: wire param
    /// and normalised value, or a negative value for "back to the knob's own value" (a note after a locked
    /// one that uses the same param). `n_locks` of them are live.
    pub locks: [(u16, f32); MAX_EV_LOCKS],
    pub n_locks: u8,
}

/// Most p-locks one note carries.
pub const MAX_EV_LOCKS: usize = 8;

impl NoteEv {
    /// A plain note: always plays.
    pub fn new(start: f64, len: f64, note: u8, vel: f32) -> Self {
        NoteEv { start, len, note, vel, chance: 1.0, cond: 0, it: 0, reps: 1, locks: [(0, 0.0); MAX_EV_LOCKS], n_locks: 0 }
    }

    /// Add a p-lock (EV_LOCK). A second lock on the same param replaces the first. False when full.
    pub fn lock(&mut self, index: u16, v: f32) -> bool {
        let v = if v.is_finite() { if v < 0.0 { -1.0 } else { v.min(1.0) } } else { return false };
        for l in self.locks[..self.n_locks as usize].iter_mut() {
            if l.0 == index {
                l.1 = v;
                return true;
            }
        }
        if (self.n_locks as usize) < MAX_EV_LOCKS {
            self.locks[self.n_locks as usize] = (index, v);
            self.n_locks += 1;
            true
        } else {
            false
        }
    }
}

/// Elektron's trig conditions, as sent in EV_COND. `A:B` plays on the A-th of every B plays of the loop.
pub mod cond {
    pub const NONE: u8 = 0;
    pub const C1_2: u8 = 1;
    pub const C2_2: u8 = 2;
    pub const C1_4: u8 = 3;
    pub const C2_4: u8 = 4;
    pub const C3_4: u8 = 5;
    pub const C4_4: u8 = 6;
    /// Plays only while the fill key is held.
    pub const FILL: u8 = 7;
    /// Plays only while it is not.
    pub const NOT_FILL: u8 = 8;
}

/// A number in 0..1 from the seed, the play count and the event: the same three always give the same
/// number, so chance is repeatable. Mirrored exactly in TypeScript (src/lib/chance.ts).
pub fn roll(seed: u32, n: u32, key: u32) -> f32 {
    let mut h = seed ^ n.wrapping_mul(0x9E37_79B1) ^ key.wrapping_mul(0x85EB_CA77);
    h ^= h >> 16;
    h = h.wrapping_mul(0x7FEB_352D);
    h ^= h >> 15;
    h = h.wrapping_mul(0x846C_A68B);
    h ^= h >> 16;
    (h >> 8) as f32 / 16_777_216.0
}

/// The event's key for `roll`: where it starts (in 1/960 beats) and its note.
pub fn ev_key(e: &NoteEv) -> u32 {
    ((e.start * 960.0).round() as i64 as u32) ^ ((e.note as u32) << 20)
}

/// Whether an event plays on play `n` of its loop, with the fill key `fill` and the song's `seed`.
pub fn plays(e: &NoteEv, n: u32, fill: bool, seed: u32) -> bool {
    let ok = match e.cond {
        cond::C1_2 => n % 2 == 0,
        cond::C2_2 => n % 2 == 1,
        cond::C1_4 => n % 4 == 0,
        cond::C2_4 => n % 4 == 1,
        cond::C3_4 => n % 4 == 2,
        cond::C4_4 => n % 4 == 3,
        cond::FILL => fill,
        cond::NOT_FILL => !fill,
        _ => true,
    };
    ok && (e.chance >= 1.0 || roll(seed, n, ev_key(e)) < e.chance)
}

pub const MAX_EVENTS: usize = 1024;
pub const MAX_OFFS: usize = 64;

/// A sorted list of events with a fixed capacity, so the audio thread never allocates.
pub struct Pattern {
    pub evs: Vec<NoteEv>,
    last: Option<usize>,
}

impl Pattern {
    pub fn new() -> Self {
        Pattern { evs: Vec::with_capacity(MAX_EVENTS), last: None }
    }

    pub fn clear(&mut self) {
        self.evs.clear();
        self.last = None;
    }

    /// Insert keeping start order. Returns false when full.
    pub fn insert(&mut self, ev: NoteEv) -> bool {
        if self.evs.len() >= self.evs.capacity().min(MAX_EVENTS) {
            self.last = None;
            return false;
        }
        let i = self.evs.partition_point(|e| e.start <= ev.start);
        self.evs.insert(i, ev);
        self.last = Some(i);
        true
    }

    /// The event the last `insert` put in (for EV_COND, which follows its EV_ADD).
    pub fn last_mut(&mut self) -> Option<&mut NoteEv> {
        self.last.and_then(|i| self.evs.get_mut(i))
    }

    /// First event at or after `beat`.
    pub fn seek(&self, beat: f64) -> usize {
        self.evs.partition_point(|e| e.start < beat)
    }

    /// Swap contents with another pattern without allocating.
    pub fn swap(&mut self, other: &mut Pattern) {
        std::mem::swap(&mut self.evs, &mut other.evs);
        self.last = None;
        other.last = None;
    }
}

impl Default for Pattern {
    fn default() -> Self {
        Self::new()
    }
}

/// Collect the events whose start falls in [from, to) on a loop of `len` beats,
/// handling the wrap. `cursor` is kept between calls so this is O(events fired).
pub fn fire_range(p: &Pattern, cursor: &mut usize, from: f64, to: f64, len: f64, mut f: impl FnMut(&NoteEv, f64)) {
    if p.evs.is_empty() || len <= 0.0 {
        return;
    }
    // Up to the loop end.
    let end = to.min(len);
    while let Some(e) = p.evs.get(*cursor) {
        if e.start >= end {
            break;
        }
        if e.start >= from {
            f(e, e.start - from);
        }
        *cursor += 1;
    }
    // Past the loop end: wrap and carry on from the top.
    if to >= len {
        *cursor = 0;
        let end = to - len;
        while let Some(e) = p.evs.get(*cursor) {
            if e.start >= end {
                break;
            }
            f(e, len - from + e.start);
            *cursor += 1;
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn ev(start: f64) -> NoteEv {
        NoteEv::new(start, 0.25, 36, 1.0)
    }

    #[test]
    fn conditions_play_on_their_pass() {
        let mut e = ev(0.0);
        let on = |e: &NoteEv, fill: bool| (0..8).filter(|&n| plays(e, n, fill, 1)).collect::<Vec<u32>>();
        e.cond = cond::C1_2;
        assert_eq!(on(&e, false), vec![0, 2, 4, 6]);
        e.cond = cond::C2_2;
        assert_eq!(on(&e, false), vec![1, 3, 5, 7]);
        e.cond = cond::C1_4;
        assert_eq!(on(&e, false), vec![0, 4]);
        e.cond = cond::C3_4;
        assert_eq!(on(&e, false), vec![2, 6]);
        e.cond = cond::FILL;
        assert!(on(&e, false).is_empty());
        assert_eq!(on(&e, true).len(), 8);
        e.cond = cond::NOT_FILL;
        assert_eq!(on(&e, false).len(), 8);
        assert!(on(&e, true).is_empty());
    }

    #[test]
    fn chance_is_repeatable_and_near_its_rate() {
        let mut e = ev(1.5);
        e.chance = 0.25;
        let a: Vec<bool> = (0..4000).map(|n| plays(&e, n, false, 9)).collect();
        let b: Vec<bool> = (0..4000).map(|n| plays(&e, n, false, 9)).collect();
        assert_eq!(a, b, "same seed, same plays");
        let c: Vec<bool> = (0..4000).map(|n| plays(&e, n, false, 10)).collect();
        assert_ne!(a, c, "another seed, other plays");
        let rate = a.iter().filter(|&&x| x).count() as f32 / 4000.0;
        assert!((rate - 0.25).abs() < 0.03, "rate {rate}");
        e.chance = 0.0;
        assert!((0..100).all(|n| !plays(&e, n, false, 9)));
    }

    /// The same numbers src/lib/chance.ts must give (tests/chance.test.ts checks the same table).
    #[test]
    fn roll_matches_the_typescript_table() {
        let got = [roll(1, 0, 0), roll(1, 1, 0), roll(7, 3, 1440), roll(123_456, 9, ev_key(&NoteEv::new(2.25, 0.2, 38, 1.0)))];
        let want = [0.408_349_04_f32, 0.771_487_36, 0.610_525, 0.766_091_9];
        for (g, w) in got.iter().zip(want) {
            assert!((g - w).abs() < 1e-6, "{got:?}");
        }
    }

    #[test]
    fn fires_once_per_pass_and_wraps() {
        let mut p = Pattern::new();
        for s in [0.0, 1.0, 2.0, 3.0, 3.75] {
            p.insert(ev(s));
        }
        let len = 4.0;
        let step = 0.01;
        let mut cursor = 0;
        let mut fired = Vec::new();
        let mut b = 0.0f64;
        for _ in 0..800 {
            // two passes
            let from = b % len;
            let to = from + step;
            fire_range(&p, &mut cursor, from, to, len, |e, _| fired.push(e.start));
            b += step;
        }
        assert_eq!(fired, vec![0.0, 1.0, 2.0, 3.0, 3.75, 0.0, 1.0, 2.0, 3.0, 3.75]);
    }

    #[test]
    fn offset_is_exact_across_the_wrap() {
        let mut p = Pattern::new();
        p.insert(ev(0.0));
        let mut cursor = 1; // already past it this pass
        let mut got = None;
        fire_range(&p, &mut cursor, 3.99, 4.01, 4.0, |_, off| got = Some(off));
        let off = got.expect("should fire after wrap");
        assert!((off - 0.01).abs() < 1e-9, "offset {off}");
    }

    #[test]
    fn insert_keeps_order() {
        let mut p = Pattern::new();
        for s in [2.0, 0.5, 3.0, 0.0, 1.5] {
            p.insert(ev(s));
        }
        let starts: Vec<f64> = p.evs.iter().map(|e| e.start).collect();
        assert_eq!(starts, vec![0.0, 0.5, 1.5, 2.0, 3.0]);
        assert_eq!(p.seek(1.0), 2);
    }
}
