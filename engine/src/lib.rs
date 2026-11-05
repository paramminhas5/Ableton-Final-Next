//! CCD engine. One sound engine for the web (WASM), iOS and Android.
//!
//! - `params`: the parameter registry every control binds to.
//! - `analysis`: per-layer meters and clash detection for the mix screens.
//! - `dsp`: oscillators, zero-delay-feedback filters, envelopes, oversampling.
//! - `inst`: the drum rack and the mono bass synth.
//! - `seq`: note events and the loop sequencer.
//! - `strip`, `fx`: channel strips and shared returns; `master`: glue and true-peak limiter;
//!   `loudness`: BS.1770 / EBU R 128 loudness and export normalisation.
//! - `engine`: transport, layers, master; `ffi`: the C ABI.

pub mod analysis;
pub mod dsp;
pub mod engine;
pub mod ffi;
pub mod fx;
pub mod inst;
pub mod loudness;
pub mod master;
pub mod params;
pub mod ring;
pub mod punch;
pub mod seq;
pub mod strip;
pub mod typegen;

pub use engine::{cmd, out, Cmd, Engine, OutEv};
