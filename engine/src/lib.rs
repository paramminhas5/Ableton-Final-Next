//! CCD engine. One sound engine for the web (WASM), iOS and Android.
//!
//! - `params`: the parameter registry every control binds to.
//! - `dsp`: oscillators, zero-delay-feedback filters, envelopes, oversampling.
//! - `inst`: the drum rack and the mono bass synth.
//! - `seq`: note events and the loop sequencer.
//! - `strip`, `fx`: channel strips and shared returns.
//! - `engine`: transport, layers, master; `ffi`: the C ABI.

pub mod dsp;
pub mod engine;
pub mod ffi;
pub mod fx;
pub mod inst;
pub mod params;
pub mod ring;
pub mod seq;
pub mod strip;
pub mod typegen;

pub use engine::{cmd, out, Cmd, Engine, OutEv};
