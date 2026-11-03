//! Android: AAudio, asked for the lowest latency the device has (low-latency
//! performance mode, an exclusive stream where the device allows it, a buffer of two
//! bursts). This is the path Oboe uses on Android 8.1 and later.

use crate::shared::{self, Renderer};
use ndk::audio::{
    AudioCallbackResult, AudioDirection, AudioFormat, AudioPerformanceMode, AudioSharingMode, AudioStream, AudioStreamBuilder, Clockid,
};
use std::sync::Mutex;

/// AAudio streams may be stopped from any thread; the handle just isn't marked Send.
struct Stream(AudioStream);
unsafe impl Send for Stream {}

static STREAM: Mutex<Option<Stream>> = Mutex::new(None);

pub fn start() -> Result<&'static shared::Shared, String> {
    if let (Some(s), true) = (shared::get(), STREAM.lock().unwrap().is_some()) {
        return Ok(s);
    }
    // Open once to learn the device's native rate (resampling adds latency).
    let probe = AudioStreamBuilder::new()
        .map_err(|e| e.to_string())?
        .direction(AudioDirection::Output)
        .performance_mode(AudioPerformanceMode::LowLatency)
        .sharing_mode(AudioSharingMode::Exclusive)
        .format(AudioFormat::PCM_Float)
        .channel_count(2)
        .open_stream()
        .map_err(|e| e.to_string())?;
    let sr = probe.sample_rate();
    drop(probe);

    let s = shared::init(sr as f32);
    let mut r = Renderer::new(s);
    let builder = AudioStreamBuilder::new()
        .map_err(|e| e.to_string())?
        .direction(AudioDirection::Output)
        .performance_mode(AudioPerformanceMode::LowLatency)
        .sharing_mode(AudioSharingMode::Exclusive)
        .format(AudioFormat::PCM_Float)
        .channel_count(2)
        .sample_rate(sr)
        .data_callback(Box::new(move |stream: &AudioStream, data, frames| {
            let frames = frames.max(0) as usize;
            let out = unsafe { std::slice::from_raw_parts_mut(data as *mut f32, frames * 2) };
            r.render(out, frames, 2, latency(stream));
            AudioCallbackResult::Continue
        }))
        .error_callback(Box::new(|_s, e| {
            // A disconnect (headphones in or out) closes the stream; the UI restarts it.
            eprintln!("aaudio error: {e:?}");
            if let Ok(mut g) = STREAM.try_lock() {
                *g = None;
            }
        }));
    let stream = builder.open_stream().map_err(|e| e.to_string())?;
    // Two bursts: the lowest size that is safe from glitches on most devices.
    let burst = stream.frames_per_burst();
    let _ = stream.set_buffer_size_in_frames(burst * 2);
    stream.request_start().map_err(|e| e.to_string())?;
    *STREAM.lock().unwrap() = Some(Stream(stream));
    Ok(s)
}

/// Seconds until the next frame written is heard, from AAudio's own timestamps.
fn latency(stream: &AudioStream) -> f64 {
    let sr = stream.sample_rate() as f64;
    let Ok(ts) = stream.timestamp(Clockid::Monotonic) else {
        // Before the first timestamp: assume the buffer plus a typical 10 ms of hardware.
        return stream.buffer_size_in_frames() as f64 / sr + 0.010;
    };
    let written = stream.frames_written();
    let mut now = libc::timespec { tv_sec: 0, tv_nsec: 0 };
    unsafe { libc::clock_gettime(libc::CLOCK_MONOTONIC, &mut now) };
    let now_ns = now.tv_sec as i64 * 1_000_000_000 + now.tv_nsec as i64;
    let presented_at = ts.time_nanoseconds as f64 + (written - ts.frame_position) as f64 / sr * 1e9;
    ((presented_at - now_ns as f64) / 1e9).max(0.0)
}

pub fn stop() {
    if let Some(s) = STREAM.lock().unwrap().take() {
        let _ = s.0.request_stop();
    }
}

pub fn platform() -> &'static str {
    "android"
}
