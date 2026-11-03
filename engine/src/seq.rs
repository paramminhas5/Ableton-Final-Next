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
}

pub const MAX_EVENTS: usize = 1024;
pub const MAX_OFFS: usize = 64;

/// A sorted list of events with a fixed capacity, so the audio thread never allocates.
pub struct Pattern {
    pub evs: Vec<NoteEv>,
}

impl Pattern {
    pub fn new() -> Self {
        Pattern { evs: Vec::with_capacity(MAX_EVENTS) }
    }

    pub fn clear(&mut self) {
        self.evs.clear();
    }

    /// Insert keeping start order. Returns false when full.
    pub fn insert(&mut self, ev: NoteEv) -> bool {
        if self.evs.len() >= self.evs.capacity().min(MAX_EVENTS) {
            return false;
        }
        let i = self.evs.partition_point(|e| e.start <= ev.start);
        self.evs.insert(i, ev);
        true
    }

    /// First event at or after `beat`.
    pub fn seek(&self, beat: f64) -> usize {
        self.evs.partition_point(|e| e.start < beat)
    }

    /// Swap contents with another pattern without allocating.
    pub fn swap(&mut self, other: &mut Pattern) {
        std::mem::swap(&mut self.evs, &mut other.evs);
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
        NoteEv { start, len: 0.25, note: 36, vel: 1.0 }
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
