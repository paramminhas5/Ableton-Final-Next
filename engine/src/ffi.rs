//! C ABI. The same functions serve the web (WASM in an AudioWorklet), iOS and Android.
//!
//! Thread rules:
//! - `ccd_send`, `ccd_poll`: UI thread (any one thread).
//! - `ccd_process*`, `ccd_link_sync`, `ccd_link_off`: audio thread.

use crate::engine::{Cmd, Engine, OutEv};

#[no_mangle]
pub extern "C" fn ccd_engine_new(sample_rate: f32) -> *mut Engine {
    Box::into_raw(Box::new(Engine::new(sample_rate)))
}

/// # Safety
/// `e` must come from `ccd_engine_new` and not be used afterwards.
#[no_mangle]
pub unsafe extern "C" fn ccd_engine_free(e: *mut Engine) {
    if !e.is_null() {
        drop(Box::from_raw(e));
    }
}

/// Push a command. Returns 0 if the queue is full.
///
/// # Safety
/// `e` must be a live engine.
#[no_mangle]
pub unsafe extern "C" fn ccd_send(e: *const Engine, kind: u32, layer: u32, a: u32, x: f32, y: f64, z: f64) -> u32 {
    (*e).send(Cmd { kind, layer, a, x, y, z }) as u32
}

/// Pop up to `max` events into `out`. Returns how many.
///
/// # Safety
/// `out` must have room for `max` events.
#[no_mangle]
pub unsafe extern "C" fn ccd_poll(e: *const Engine, out: *mut OutEv, max: u32) -> u32 {
    let mut n = 0;
    while n < max {
        match (*e).poll() {
            Some(ev) => {
                *out.add(n as usize) = ev;
                n += 1;
            }
            None => break,
        }
    }
    n
}

/// Render into the engine's own buffers (read them with `ccd_out_left/right`).
///
/// # Safety
/// Audio thread only.
#[no_mangle]
pub unsafe extern "C" fn ccd_process(e: *const Engine, frames: u32) {
    (*e).process(frames as usize);
}

/// Render straight into an interleaved float buffer (native hosts).
///
/// # Safety
/// `out` must hold `frames * channels` floats. Audio thread only.
#[no_mangle]
pub unsafe extern "C" fn ccd_process_interleaved(e: *const Engine, out: *mut f32, frames: u32, channels: u32) {
    let ch = channels.max(1) as usize;
    let mut done = 0usize;
    let total = frames as usize;
    while done < total {
        let n = (total - done).min(crate::engine::MAX_BLOCK);
        (*e).process(n);
        let core = (*e).core();
        for i in 0..n {
            let base = (done + i) * ch;
            *out.add(base) = core.out_l[i];
            if ch > 1 {
                *out.add(base + 1) = core.out_r[i];
                for c in 2..ch {
                    *out.add(base + c) = 0.0;
                }
            }
        }
        done += n;
    }
}

/// # Safety
/// Valid until the next `ccd_process`.
#[no_mangle]
pub unsafe extern "C" fn ccd_out_left(e: *const Engine) -> *const f32 {
    (*e).core().out_l.as_ptr()
}

/// # Safety
/// Valid until the next `ccd_process`.
#[no_mangle]
pub unsafe extern "C" fn ccd_out_right(e: *const Engine) -> *const f32 {
    (*e).core().out_r.as_ptr()
}

/// Frames rendered so far. The host maps touch times onto this clock.
///
/// # Safety
/// Audio thread, or a racy read for display.
#[no_mangle]
pub unsafe extern "C" fn ccd_frames(e: *const Engine) -> f64 {
    (*e).core().frame as f64
}

/// Follow Ableton Link. Call right before `ccd_process` with Link's beat at the time the
/// first sample of this block reaches the speaker, and the session tempo.
///
/// # Safety
/// Audio thread only.
#[no_mangle]
pub unsafe extern "C" fn ccd_link_sync(e: *const Engine, beat: f64, tempo: f64) {
    (*e).link_sync(beat, tempo);
}

/// # Safety
/// Audio thread only.
#[no_mangle]
pub unsafe extern "C" fn ccd_link_off(e: *const Engine) {
    (*e).link_off();
}

/// Size of `OutEv` in bytes, so hosts can check their struct layout.
#[no_mangle]
pub extern "C" fn ccd_out_event_size() -> u32 {
    std::mem::size_of::<OutEv>() as u32
}

// ── memory for the WASM host ─────────────────────────────────────────────────

/// 8-byte aligned, so the host can view it as f64 (events carry an f64 beat).
#[no_mangle]
pub extern "C" fn ccd_alloc(bytes: u32) -> *mut u8 {
    let words = (bytes as usize).div_ceil(8);
    let mut v: Vec<u64> = Vec::with_capacity(words);
    let p = v.as_mut_ptr();
    std::mem::forget(v);
    p as *mut u8
}

/// # Safety
/// `p` and `bytes` must come from `ccd_alloc`.
#[no_mangle]
pub unsafe extern "C" fn ccd_dealloc(p: *mut u8, bytes: u32) {
    drop(Vec::from_raw_parts(p as *mut u64, 0, (bytes as usize).div_ceil(8)));
}
