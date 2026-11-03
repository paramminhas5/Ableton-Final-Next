//! CCD School app core (Tauri 2). The React UI runs in the system webview; sound runs
//! here, natively, in the same Rust engine the web build runs as WebAssembly.

mod audio;
mod link;
mod shared;

use ccd_engine::{cmd, Cmd, OutEv};
use serde::Serialize;
use std::sync::atomic::{AtomicBool, Ordering};
use tauri::ipc::Channel;

#[derive(Serialize)]
struct Info {
    platform: &'static str,
    sample_rate: f32,
    buffer_frames: u32,
    output_latency: f64,
    load: f32,
    link_available: bool,
    link_enabled: bool,
    link_peers: u64,
    tempo: f64,
}

fn info(s: &shared::Shared) -> Info {
    let on = s.link.enabled();
    Info {
        platform: audio::platform(),
        sample_rate: s.sr,
        buffer_frames: s.buffer_frames.load(Ordering::Relaxed),
        output_latency: s.out_latency(),
        load: s.load(),
        link_available: link::AVAILABLE,
        link_enabled: on,
        link_peers: if on { s.link.peers() } else { 0 },
        tempo: if on { s.link.tempo() } else { 0.0 },
    }
}

static PUMP: AtomicBool = AtomicBool::new(false);

/// Start audio and stream engine events back to the page.
#[tauri::command]
fn engine_start(events: Channel<Vec<f64>>) -> Result<Info, String> {
    let s = audio::start()?;
    if !PUMP.swap(true, Ordering::SeqCst) {
        std::thread::Builder::new()
            .name("ccd-events".into())
            .spawn(move || {
                let mut buf: Vec<f64> = Vec::with_capacity(7 * 256);
                loop {
                    buf.clear();
                    while let Some(e) = s.engine.poll() {
                        push_event(&mut buf, &e);
                        if buf.len() >= 7 * 256 {
                            break;
                        }
                    }
                    if !buf.is_empty() && events.send(buf.clone()).is_err() {
                        break;
                    }
                    std::thread::sleep(std::time::Duration::from_millis(8));
                }
                PUMP.store(false, Ordering::SeqCst);
            })
            .map_err(|e| e.to_string())?;
    }
    Ok(info(s))
}

fn push_event(buf: &mut Vec<f64>, e: &OutEv) {
    buf.extend_from_slice(&[e.kind as f64, e.layer as f64, e.note as f64, e.flags as f64, e.vel as f64, e.aux as f64, e.beat]);
}

/// Commands in groups of 6: kind, layer, a, x, y, z. For note on/off, y is how many ms
/// ago the finger touched (or -1), turned here into an engine frame.
#[tauri::command]
fn engine_send(cmds: Vec<f64>) -> Result<(), String> {
    let s = shared::get().ok_or("engine not started")?;
    for c in cmds.chunks_exact(6) {
        let kind = c[0] as u32;
        let mut y = c[4];
        if (kind == cmd::NOTE_ON || kind == cmd::NOTE_OFF) && y >= 0.0 {
            y = s.frame_for_age(y);
        }
        s.engine.send(Cmd { kind, layer: c[1] as u32, a: c[2] as u32, x: c[3] as f32, y, z: c[5] });
    }
    Ok(())
}

#[tauri::command]
fn engine_info() -> Result<Info, String> {
    shared::get().map(info).ok_or_else(|| "engine not started".into())
}

#[tauri::command]
fn engine_stop() {
    audio::stop();
}

/// Join or leave the Link session. With Link on, the engine follows the session's
/// tempo and lands its loop on the session's bars. On iOS this opens Ableton's Link
/// settings pane instead (LinkKit requires that users switch Link there).
#[tauri::command]
fn link_enable(enabled: bool) -> Result<(), String> {
    let s = shared::get().ok_or("engine not started")?;
    if !link::AVAILABLE {
        return Err("this build has no Ableton Link (run npm run link:fetch and rebuild)".into());
    }
    if link::open_settings(&s.link) {
        return Ok(());
    }
    s.link.enable(enabled);
    Ok(())
}

#[tauri::command]
fn set_tempo(bpm: f64) -> Result<(), String> {
    let s = shared::get().ok_or("engine not started")?;
    if s.link.enabled() {
        s.link.set_tempo(bpm);
    }
    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![engine_start, engine_send, engine_info, engine_stop, link_enable, set_tempo])
        .run(tauri::generate_context!())
        .expect("error while running ccd school");
}
