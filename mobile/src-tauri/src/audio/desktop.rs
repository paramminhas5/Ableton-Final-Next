//! Desktop (macOS, Windows, Linux) through cpal. Not a shipping target; it lets you run
//! the native engine and Link on your Mac next to Live with `npm run dev`.

use crate::shared::{self, Renderer};
use cpal::traits::{DeviceTrait, HostTrait, StreamTrait};
use std::sync::Mutex;

struct SendStream(#[allow(dead_code)] cpal::Stream);
unsafe impl Send for SendStream {}

static STREAM: Mutex<Option<SendStream>> = Mutex::new(None);

pub fn start() -> Result<&'static shared::Shared, String> {
    if let (Some(s), true) = (shared::get(), STREAM.lock().unwrap().is_some()) {
        return Ok(s);
    }
    let host = cpal::default_host();
    let dev = host.default_output_device().ok_or("no output device")?;
    let def = dev.default_output_config().map_err(|e| e.to_string())?;
    let sr = def.sample_rate();
    let channels = def.channels() as usize;
    let s = shared::init(sr as f32);
    let mut config = def.config();
    config.buffer_size = cpal::BufferSize::Fixed(128);
    let build = |config: cpal::StreamConfig, mut r: Renderer| {
        dev.build_output_stream::<f32, _, _>(
            config,
            move |out: &mut [f32], info: &cpal::OutputCallbackInfo| {
                let ts = info.timestamp();
                let lat = ts.playback.duration_since(ts.callback).as_secs_f64();
                let frames = out.len() / channels;
                r.render(out, frames, channels, lat);
            },
            |e| eprintln!("audio error: {e}"),
            None,
        )
    };
    // Fall back to the device's default buffer if it refuses 128 frames.
    let stream = match build(config.clone(), Renderer::new(s)) {
        Ok(st) => st,
        Err(_) => {
            config.buffer_size = cpal::BufferSize::Default;
            build(config, Renderer::new(s)).map_err(|e| e.to_string())?
        }
    };
    stream.play().map_err(|e| e.to_string())?;
    *STREAM.lock().unwrap() = Some(SendStream(stream));
    Ok(s)
}

pub fn stop() {
    STREAM.lock().unwrap().take();
}

pub fn platform() -> &'static str {
    "native"
}
