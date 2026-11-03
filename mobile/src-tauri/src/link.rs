//! Ableton Link: tempo and beat sync with Live and every other Link app on the network.
//!
//! - iOS: LinkKit, Ableton's iOS SDK (free, under the Ableton Link SDK licence). Users
//!   turn Link on in Ableton's own settings pane, which LinkKit requires.
//! - Android and desktop: open-source Link 4.1.1 through its C API (abl_link). GPLv2:
//!   fine for development and unofficial builds; a store release needs Ableton's
//!   proprietary licence (requested from link-devs@ableton.com).
//! - Without either compiled in, the same API does nothing.
//!
//! Link Audio (streaming into Live) is in both SDKs and comes in step 4.

#![allow(dead_code)]

#[allow(unused_imports)]
use std::sync::atomic::{AtomicBool, Ordering};

pub const AVAILABLE: bool = cfg!(any(ccd_linkkit, ccd_link));

/// Quantum: one bar of 4/4, so loops land on Live's bars.
const QUANTUM: f64 = 4.0;

// ── iOS: LinkKit ──────────────────────────────────────────────────────────────

#[cfg(ccd_linkkit)]
mod imp {
    use super::*;
    use std::ffi::c_void;

    #[repr(C)]
    pub struct ABLLink {
        _p: [u8; 0],
    }
    #[repr(C)]
    pub struct ABLLinkSessionState {
        _p: [u8; 0],
    }
    type LinkRef = *mut ABLLink;
    type StateRef = *mut ABLLinkSessionState;

    extern "C" {
        fn ABLLinkNew(bpm: f64) -> LinkRef;
        fn ABLLinkDelete(l: LinkRef);
        fn ABLLinkSetActive(l: LinkRef, active: bool);
        fn ABLLinkIsEnabled(l: LinkRef) -> bool;
        fn ABLLinkNumPeers(l: LinkRef) -> usize;
        fn ABLLinkCaptureAudioSessionState(l: LinkRef) -> StateRef;
        fn ABLLinkCaptureAppSessionState(l: LinkRef) -> StateRef;
        fn ABLLinkCommitAppSessionState(l: LinkRef, s: StateRef);
        fn ABLLinkGetTempo(s: StateRef) -> f64;
        fn ABLLinkSetTempo(s: StateRef, bpm: f64, host_time_at_output: u64);
        fn ABLLinkBeatAtTime(s: StateRef, host_time_at_output: u64, quantum: f64) -> f64;
        fn mach_absolute_time() -> u64;
        fn mach_timebase_info(info: *mut Timebase) -> i32;
    }

    // Keep LinkKit's settings pane in the final link: nothing else references it by name.
    extern "C" {
        #[link_name = "OBJC_CLASS_$_ABLLinkSettingsViewController"]
        static SETTINGS_CLASS: c_void;
    }

    #[repr(C)]
    #[derive(Default)]
    pub struct Timebase {
        numer: u32,
        denom: u32,
    }

    pub struct Link {
        l: LinkRef,
        ticks_per_sec: f64,
        app: std::sync::Mutex<()>,
    }
    unsafe impl Send for Link {}
    unsafe impl Sync for Link {}

    pub struct AudioLink;

    impl Link {
        pub fn new(bpm: f64) -> Self {
            let mut tb = Timebase::default();
            unsafe { mach_timebase_info(&mut tb) };
            let ns_per_tick = tb.numer as f64 / tb.denom.max(1) as f64;
            let l = unsafe { ABLLinkNew(bpm) };
            unsafe {
                let _ = &SETTINGS_CLASS;
                ABLLinkSetActive(l, true);
            }
            Link { l, ticks_per_sec: 1e9 / ns_per_tick, app: std::sync::Mutex::new(()) }
        }
        /// On iOS only the user turns Link on or off, in Ableton's settings pane.
        pub fn enable(&self, _on: bool) {}
        pub fn enabled(&self) -> bool {
            unsafe { ABLLinkIsEnabled(self.l) }
        }
        pub fn peers(&self) -> u64 {
            unsafe { ABLLinkNumPeers(self.l) as u64 }
        }
        pub fn tempo(&self) -> f64 {
            let _g = self.app.lock().unwrap();
            unsafe { ABLLinkGetTempo(ABLLinkCaptureAppSessionState(self.l)) }
        }
        pub fn set_tempo(&self, bpm: f64) {
            let _g = self.app.lock().unwrap();
            unsafe {
                let s = ABLLinkCaptureAppSessionState(self.l);
                ABLLinkSetTempo(s, bpm, mach_absolute_time());
                ABLLinkCommitAppSessionState(self.l, s);
            }
        }
        pub fn audio(&self) -> AudioLink {
            AudioLink
        }
        /// Beat and tempo at the moment a buffer starting now is heard.
        #[inline]
        pub fn beat_at_output(&self, _a: &mut AudioLink, out_latency: f64) -> (f64, f64) {
            unsafe {
                let host = mach_absolute_time() + (out_latency * self.ticks_per_sec) as u64;
                let s = ABLLinkCaptureAudioSessionState(self.l);
                (ABLLinkBeatAtTime(s, host, QUANTUM), ABLLinkGetTempo(s))
            }
        }
        pub fn raw(&self) -> *mut c_void {
            self.l as *mut c_void
        }
        /// Keep running in the background only while connected, as Ableton asks.
        pub fn set_active(&self, active: bool) {
            unsafe { ABLLinkSetActive(self.l, active) }
        }
    }

    impl Drop for Link {
        fn drop(&mut self) {
            unsafe { ABLLinkDelete(self.l) }
        }
    }
}

// ── Android and desktop: open-source Link (abl_link) ─────────────────────────

#[cfg(all(ccd_link, not(ccd_linkkit)))]
mod imp {
    use super::*;
    use std::ffi::c_void;

    #[repr(C)]
    #[derive(Clone, Copy)]
    struct AblLink {
        imp: *mut c_void,
    }
    #[repr(C)]
    #[derive(Clone, Copy)]
    struct AblSessionState {
        imp: *mut c_void,
    }
    extern "C" {
        fn abl_link_create(bpm: f64) -> AblLink;
        fn abl_link_destroy(link: AblLink);
        fn abl_link_enable(link: AblLink, enable: bool);
        fn abl_link_enable_start_stop_sync(link: AblLink, enabled: bool);
        fn abl_link_num_peers(link: AblLink) -> u64;
        fn abl_link_clock_micros(link: AblLink) -> i64;
        fn abl_link_create_session_state() -> AblSessionState;
        fn abl_link_destroy_session_state(s: AblSessionState);
        fn abl_link_capture_audio_session_state(link: AblLink, s: AblSessionState);
        fn abl_link_capture_app_session_state(link: AblLink, s: AblSessionState);
        fn abl_link_commit_app_session_state(link: AblLink, s: AblSessionState);
        fn abl_link_tempo(s: AblSessionState) -> f64;
        fn abl_link_set_tempo(s: AblSessionState, bpm: f64, at_time: i64);
        fn abl_link_beat_at_time(s: AblSessionState, time: i64, quantum: f64) -> f64;
    }

    pub struct Link {
        l: AblLink,
        on: AtomicBool,
        app: std::sync::Mutex<AblSessionState>,
    }
    unsafe impl Send for Link {}
    unsafe impl Sync for Link {}

    /// Session state owned by the audio callback (Link wants one per thread).
    pub struct AudioLink {
        s: AblSessionState,
    }
    unsafe impl Send for AudioLink {}

    impl Link {
        pub fn new(bpm: f64) -> Self {
            unsafe {
                let l = abl_link_create(bpm);
                abl_link_enable_start_stop_sync(l, false);
                Link { l, on: AtomicBool::new(false), app: std::sync::Mutex::new(abl_link_create_session_state()) }
            }
        }
        pub fn enable(&self, on: bool) {
            unsafe { abl_link_enable(self.l, on) };
            self.on.store(on, Ordering::Relaxed);
        }
        pub fn enabled(&self) -> bool {
            self.on.load(Ordering::Relaxed)
        }
        pub fn peers(&self) -> u64 {
            unsafe { abl_link_num_peers(self.l) }
        }
        pub fn tempo(&self) -> f64 {
            let s = self.app.lock().unwrap();
            unsafe {
                abl_link_capture_app_session_state(self.l, *s);
                abl_link_tempo(*s)
            }
        }
        pub fn set_tempo(&self, bpm: f64) {
            let s = self.app.lock().unwrap();
            unsafe {
                abl_link_capture_app_session_state(self.l, *s);
                abl_link_set_tempo(*s, bpm, abl_link_clock_micros(self.l));
                abl_link_commit_app_session_state(self.l, *s);
            }
        }
        pub fn audio(&self) -> AudioLink {
            AudioLink { s: unsafe { abl_link_create_session_state() } }
        }
        #[inline]
        pub fn beat_at_output(&self, a: &mut AudioLink, out_latency: f64) -> (f64, f64) {
            unsafe {
                let host = abl_link_clock_micros(self.l) + (out_latency * 1e6) as i64;
                abl_link_capture_audio_session_state(self.l, a.s);
                (abl_link_beat_at_time(a.s, host, QUANTUM), abl_link_tempo(a.s))
            }
        }
        pub fn raw(&self) -> *mut c_void {
            std::ptr::null_mut()
        }
        pub fn set_active(&self, _active: bool) {}
    }

    impl Drop for Link {
        fn drop(&mut self) {
            unsafe {
                abl_link_destroy_session_state(*self.app.lock().unwrap());
                abl_link_destroy(self.l);
            }
        }
    }

    impl Drop for AudioLink {
        fn drop(&mut self) {
            unsafe { abl_link_destroy_session_state(self.s) }
        }
    }
}

// ── Without Link ──────────────────────────────────────────────────────────────

#[cfg(not(any(ccd_link, ccd_linkkit)))]
mod imp {
    use super::*;
    pub struct Link {
        on: AtomicBool,
    }
    pub struct AudioLink;
    impl Link {
        pub fn new(_bpm: f64) -> Self {
            Link { on: AtomicBool::new(false) }
        }
        pub fn enable(&self, on: bool) {
            self.on.store(on && AVAILABLE, Ordering::Relaxed);
        }
        pub fn enabled(&self) -> bool {
            self.on.load(Ordering::Relaxed)
        }
        pub fn peers(&self) -> u64 {
            0
        }
        pub fn tempo(&self) -> f64 {
            120.0
        }
        pub fn set_tempo(&self, _bpm: f64) {}
        pub fn audio(&self) -> AudioLink {
            AudioLink
        }
        pub fn beat_at_output(&self, _a: &mut AudioLink, _l: f64) -> (f64, f64) {
            (0.0, 120.0)
        }
        pub fn raw(&self) -> *mut std::ffi::c_void {
            std::ptr::null_mut()
        }
        pub fn set_active(&self, _active: bool) {}
    }
}

pub use imp::{AudioLink, Link};

/// iOS: show Ableton's Link settings pane (LinkKit requires it; it is where users turn
/// Link on). Elsewhere returns false and the caller toggles Link directly.
#[cfg(ccd_linkkit)]
pub fn open_settings(link: &Link) -> bool {
    use objc2::runtime::{AnyClass, AnyObject};
    use objc2::msg_send;
    unsafe {
        let (Some(app_cls), Some(settings_cls), Some(nav_cls)) =
            (AnyClass::get(c"UIApplication"), AnyClass::get(c"ABLLinkSettingsViewController"), AnyClass::get(c"UINavigationController"))
        else {
            return false;
        };
        let app: *mut AnyObject = msg_send![app_cls, sharedApplication];
        if app.is_null() {
            return false;
        }
        let window: *mut AnyObject = msg_send![app, keyWindow];
        if window.is_null() {
            return false;
        }
        let mut top: *mut AnyObject = msg_send![window, rootViewController];
        loop {
            let next: *mut AnyObject = msg_send![top, presentedViewController];
            if next.is_null() {
                break;
            }
            top = next;
        }
        let settings: *mut AnyObject = msg_send![settings_cls, instance: link.raw()];
        let nav: *mut AnyObject = msg_send![nav_cls, alloc];
        let nav: *mut AnyObject = msg_send![nav, initWithRootViewController: settings];
        let done: Option<&block2::Block<dyn Fn()>> = None;
        let _: () = msg_send![top, presentViewController: nav, animated: true, completion: done];
        true
    }
}

#[cfg(not(ccd_linkkit))]
pub fn open_settings(_link: &Link) -> bool {
    false
}
