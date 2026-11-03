//! State shared between the UI side (Tauri commands) and the audio callback.

use crate::link::{AudioLink, Link};
use ccd_engine::Engine;
use std::sync::atomic::{AtomicU32, AtomicU64, Ordering};
use std::sync::OnceLock;
use std::time::Instant;

pub struct Shared {
    pub engine: Engine,
    pub sr: f32,
    pub link: Link,
    /// Frames rendered and when (ns since `T0`), at the start of the last callback.
    /// Lets a command map "the touch was 12 ms ago" onto an engine frame.
    frames_at_cb: AtomicU64,
    ns_at_cb: AtomicU64,
    pub buffer_frames: AtomicU32,
    out_latency_us: AtomicU32,
    load_x100: AtomicU32,
}

static T0: OnceLock<Instant> = OnceLock::new();
static SHARED: OnceLock<Shared> = OnceLock::new();

pub fn now_ns() -> u64 {
    T0.get_or_init(Instant::now).elapsed().as_nanos() as u64
}

pub fn get() -> Option<&'static Shared> {
    SHARED.get()
}

pub fn init(sr: f32) -> &'static Shared {
    SHARED.get_or_init(|| Shared {
        engine: Engine::new(sr),
        sr,
        link: Link::new(120.0),
        frames_at_cb: AtomicU64::new(0),
        ns_at_cb: AtomicU64::new(now_ns()),
        buffer_frames: AtomicU32::new(0),
        out_latency_us: AtomicU32::new(0),
        load_x100: AtomicU32::new(0),
    })
}

impl Shared {
    /// Engine frame for a touch that happened `age_ms` ago.
    pub fn frame_for_age(&self, age_ms: f64) -> f64 {
        let f = self.frames_at_cb.load(Ordering::Acquire) as f64;
        let since = now_ns().saturating_sub(self.ns_at_cb.load(Ordering::Acquire)) as f64 / 1e9;
        let max_ahead = self.buffer_frames.load(Ordering::Relaxed).max(1) as f64;
        let now_frame = f + (since * self.sr as f64).min(max_ahead * 2.0);
        (now_frame - age_ms / 1000.0 * self.sr as f64).max(0.0)
    }

    pub fn out_latency(&self) -> f64 {
        self.out_latency_us.load(Ordering::Relaxed) as f64 / 1e6
    }

    pub fn load(&self) -> f32 {
        self.load_x100.load(Ordering::Relaxed) as f32 / 100.0
    }
}

/// What every platform's audio callback does. Call once per callback.
pub struct Renderer {
    s: &'static Shared,
    link: AudioLink,
    following: bool,
    busy_ns: u64,
    rendered: u64,
}

impl Renderer {
    pub fn new(s: &'static Shared) -> Self {
        Renderer { link: s.link.audio(), following: false, s, busy_ns: 0, rendered: 0 }
    }

    /// Fill `out` (interleaved, `channels` wide). `out_latency` is seconds from now until
    /// the first frame of `out` reaches the speaker.
    #[inline]
    pub fn render(&mut self, out: &mut [f32], frames: usize, channels: usize, out_latency: f64) {
        let t0 = now_ns();
        let s = self.s;
        unsafe {
            s.frames_at_cb.store(ccd_engine::ffi::ccd_frames(&s.engine) as u64, Ordering::Release);
        }
        s.ns_at_cb.store(t0, Ordering::Release);
        s.buffer_frames.store(frames as u32, Ordering::Relaxed);
        s.out_latency_us.store((out_latency.max(0.0) * 1e6) as u32, Ordering::Relaxed);

        if s.link.enabled() {
            // Link's beat at the moment this buffer is heard.
            let (beat, tempo) = s.link.beat_at_output(&mut self.link, out_latency);
            unsafe { s.engine.link_sync(beat, tempo) };
            self.following = true;
        } else if self.following {
            // Link turned off: back to the engine's own clock, keeping the last tempo.
            unsafe { s.engine.link_off() };
            self.following = false;
        }
        unsafe { ccd_engine::ffi::ccd_process_interleaved(&s.engine, out.as_mut_ptr(), frames as u32, channels as u32) };

        self.busy_ns += now_ns() - t0;
        self.rendered += frames as u64;
        if self.rendered >= s.sr as u64 {
            let pct = self.busy_ns as f64 / (self.rendered as f64 / s.sr as f64 * 1e9) * 100.0;
            s.load_x100.store((pct * 100.0) as u32, Ordering::Relaxed);
            self.busy_ns = 0;
            self.rendered = 0;
        }
    }
}
