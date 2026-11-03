//! iOS: RemoteIO, the lowest-latency output Core Audio has. The audio session asks for
//! a 64-frame buffer (about 1.3 ms at 48 kHz); iOS grants the nearest it supports,
//! usually 64 to 256 depending on device and route.

use crate::shared::{self, Renderer};
use objc2_audio_toolbox::{
    kAudioUnitManufacturer_Apple, kAudioUnitProperty_MaximumFramesPerSlice, kAudioUnitProperty_SetRenderCallback,
    kAudioUnitProperty_StreamFormat, kAudioUnitScope_Global, kAudioUnitScope_Input, kAudioUnitType_Output, AURenderCallbackStruct,
    AudioComponentDescription, AudioComponentFindNext, AudioComponentInstanceNew, AudioOutputUnitStart, AudioOutputUnitStop, AudioUnit,
    AudioUnitInitialize, AudioUnitRenderActionFlags, AudioUnitSetProperty,
};
use objc2_avf_audio::{AVAudioSession, AVAudioSessionCategoryPlayback};
use objc2_core_audio_types::{
    kAudioFormatFlagIsFloat, kAudioFormatFlagIsPacked, kAudioFormatLinearPCM, AudioBufferList, AudioStreamBasicDescription, AudioTimeStamp,
};
use std::ffi::c_void;
use std::ptr::NonNull;
use std::sync::atomic::{AtomicU64, Ordering};
use std::sync::Mutex;

/// 'rioc'. Not exported by the bindings.
const SUBTYPE_REMOTE_IO: u32 = 0x7269_6f63;

struct Unit(AudioUnit);
unsafe impl Send for Unit {}

static UNIT: Mutex<Option<Unit>> = Mutex::new(None);
/// Seconds from the render callback to the speaker (session output latency + one buffer).
static LATENCY_BITS: AtomicU64 = AtomicU64::new(0);

unsafe extern "C-unwind" fn render(
    refcon: NonNull<c_void>,
    _flags: NonNull<AudioUnitRenderActionFlags>,
    _ts: NonNull<AudioTimeStamp>,
    _bus: u32,
    frames: u32,
    io: *mut AudioBufferList,
) -> i32 {
    let r = &mut *(refcon.as_ptr() as *mut Renderer);
    let list = &mut *io;
    let buf = &mut list.mBuffers[0];
    let channels = buf.mNumberChannels.max(1) as usize;
    let out = std::slice::from_raw_parts_mut(buf.mData as *mut f32, frames as usize * channels);
    let lat = f64::from_bits(LATENCY_BITS.load(Ordering::Relaxed));
    r.render(out, frames as usize, channels, lat);
    0
}

fn check(status: i32, what: &str) -> Result<(), String> {
    if status == 0 { Ok(()) } else { Err(format!("{what} failed ({status})")) }
}

pub fn start() -> Result<&'static shared::Shared, String> {
    if let (Some(s), true) = (shared::get(), UNIT.lock().unwrap().is_some()) {
        return Ok(s);
    }
    unsafe {
        // Session: playback (ignores the silent switch, like an instrument should),
        // smallest buffer, 48 kHz.
        let session = AVAudioSession::sharedInstance();
        if let Some(cat) = AVAudioSessionCategoryPlayback {
            session.setCategory_error(cat).map_err(|e| format!("category: {e:?}"))?;
        }
        let _ = session.setPreferredSampleRate_error(48_000.0);
        let _ = session.setPreferredIOBufferDuration_error(64.0 / 48_000.0);
        session.setActive_error(true).map_err(|e| format!("activate: {e:?}"))?;
        let sr = session.sampleRate();
        let io = session.IOBufferDuration();
        let lat = session.outputLatency() + io;
        LATENCY_BITS.store(lat.to_bits(), Ordering::Relaxed);

        let s = shared::init(sr as f32);
        let desc = AudioComponentDescription {
            componentType: kAudioUnitType_Output,
            componentSubType: SUBTYPE_REMOTE_IO,
            componentManufacturer: kAudioUnitManufacturer_Apple,
            componentFlags: 0,
            componentFlagsMask: 0,
        };
        let comp = AudioComponentFindNext(std::ptr::null_mut(), NonNull::from(&desc));
        if comp.is_null() {
            return Err("no RemoteIO".into());
        }
        let mut unit: AudioUnit = std::ptr::null_mut();
        check(AudioComponentInstanceNew(comp, NonNull::from(&mut unit)), "new unit")?;

        let fmt = AudioStreamBasicDescription {
            mSampleRate: sr,
            mFormatID: kAudioFormatLinearPCM,
            mFormatFlags: kAudioFormatFlagIsFloat | kAudioFormatFlagIsPacked,
            mBytesPerPacket: 8,
            mFramesPerPacket: 1,
            mBytesPerFrame: 8,
            mChannelsPerFrame: 2,
            mBitsPerChannel: 32,
            mReserved: 0,
        };
        let size = std::mem::size_of::<AudioStreamBasicDescription>() as u32;
        check(
            AudioUnitSetProperty(unit, kAudioUnitProperty_StreamFormat, kAudioUnitScope_Input, 0, &fmt as *const _ as *const c_void, size),
            "stream format",
        )?;
        let max_frames: u32 = 4096;
        let _ = AudioUnitSetProperty(
            unit,
            kAudioUnitProperty_MaximumFramesPerSlice,
            kAudioUnitScope_Global,
            0,
            &max_frames as *const _ as *const c_void,
            4,
        );
        let renderer = Box::into_raw(Box::new(Renderer::new(s)));
        let cb = AURenderCallbackStruct { inputProc: Some(render), inputProcRefCon: renderer as *mut c_void };
        check(
            AudioUnitSetProperty(
                unit,
                kAudioUnitProperty_SetRenderCallback,
                kAudioUnitScope_Input,
                0,
                &cb as *const _ as *const c_void,
                std::mem::size_of::<AURenderCallbackStruct>() as u32,
            ),
            "render callback",
        )?;
        check(AudioUnitInitialize(unit), "initialise")?;
        check(AudioOutputUnitStart(unit), "start")?;
        *UNIT.lock().unwrap() = Some(Unit(unit));
        Ok(s)
    }
}

pub fn stop() {
    if let Some(u) = UNIT.lock().unwrap().take() {
        unsafe {
            AudioOutputUnitStop(u.0);
        }
    }
}

pub fn platform() -> &'static str {
    "ios"
}
