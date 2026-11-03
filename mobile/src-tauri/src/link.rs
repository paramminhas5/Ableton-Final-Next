//! Ableton Link through its official C API (abl_link), Link 4.1.1.
//! Tempo and beat sync with Live and every other Link app on the network.
//! Link Audio (streaming audio into Live) is in the same API and comes in step 4.

#[cfg(ccd_link)]
mod ffi {
    use std::ffi::c_void;
    #[repr(C)]
    #[derive(Clone, Copy)]
    pub struct AblLink {
        pub imp: *mut c_void,
    }
    #[repr(C)]
    #[derive(Clone, Copy)]
    pub struct AblSessionState {
        pub imp: *mut c_void,
    }
    extern "C" {
        pub fn abl_link_create(bpm: f64) -> AblLink;
        pub fn abl_link_destroy(link: AblLink);
        pub fn abl_link_enable(link: AblLink, enable: bool);
        pub fn abl_link_enable_start_stop_sync(link: AblLink, enabled: bool);
        pub fn abl_link_num_peers(link: AblLink) -> u64;
        pub fn abl_link_clock_micros(link: AblLink) -> i64;
        pub fn abl_link_create_session_state() -> AblSessionState;
        pub fn abl_link_destroy_session_state(s: AblSessionState);
        pub fn abl_link_capture_audio_session_state(link: AblLink, s: AblSessionState);
        pub fn abl_link_capture_app_session_state(link: AblLink, s: AblSessionState);
        pub fn abl_link_commit_app_session_state(link: AblLink, s: AblSessionState);
        pub fn abl_link_tempo(s: AblSessionState) -> f64;
        pub fn abl_link_set_tempo(s: AblSessionState, bpm: f64, at_time: i64);
        pub fn abl_link_beat_at_time(s: AblSessionState, time: i64, quantum: f64) -> f64;
    }
}

/// The app's Link instance. abl_link is thread-safe for everything used here.
pub struct Link {
    #[cfg(ccd_link)]
    l: ffi::AblLink,
    #[cfg(ccd_link)]
    app: std::sync::Mutex<ffi::AblSessionState>,
}

unsafe impl Send for Link {}
unsafe impl Sync for Link {}

/// Session state owned by the audio callback (Link wants one per thread).
pub struct AudioLink {
    #[cfg(ccd_link)]
    s: ffi::AblSessionState,
}

unsafe impl Send for AudioLink {}

pub const AVAILABLE: bool = cfg!(ccd_link);

#[cfg(ccd_link)]
impl Link {
    pub fn new(bpm: f64) -> Self {
        unsafe {
            let l = ffi::abl_link_create(bpm);
            ffi::abl_link_enable_start_stop_sync(l, false);
            Link { l, app: std::sync::Mutex::new(ffi::abl_link_create_session_state()) }
        }
    }
    pub fn enable(&self, on: bool) {
        unsafe { ffi::abl_link_enable(self.l, on) }
    }
    pub fn peers(&self) -> u64 {
        unsafe { ffi::abl_link_num_peers(self.l) }
    }
    pub fn micros(&self) -> i64 {
        unsafe { ffi::abl_link_clock_micros(self.l) }
    }
    /// Tempo, from the app thread.
    pub fn tempo(&self) -> f64 {
        let s = self.app.lock().unwrap();
        unsafe {
            ffi::abl_link_capture_app_session_state(self.l, *s);
            ffi::abl_link_tempo(*s)
        }
    }
    /// Propose a tempo to the session, from the app thread.
    pub fn set_tempo(&self, bpm: f64) {
        let s = self.app.lock().unwrap();
        unsafe {
            ffi::abl_link_capture_app_session_state(self.l, *s);
            ffi::abl_link_set_tempo(*s, bpm, ffi::abl_link_clock_micros(self.l));
            ffi::abl_link_commit_app_session_state(self.l, *s);
        }
    }
    pub fn audio(&self) -> AudioLink {
        AudioLink { s: unsafe { ffi::abl_link_create_session_state() } }
    }
    /// From the audio callback: (beat, tempo) at `host_micros`, quantum 4 (one bar).
    #[inline]
    pub fn beat_at(&self, a: &mut AudioLink, host_micros: i64) -> (f64, f64) {
        unsafe {
            ffi::abl_link_capture_audio_session_state(self.l, a.s);
            (ffi::abl_link_beat_at_time(a.s, host_micros, 4.0), ffi::abl_link_tempo(a.s))
        }
    }
}

#[cfg(ccd_link)]
impl Drop for Link {
    fn drop(&mut self) {
        unsafe {
            ffi::abl_link_destroy_session_state(*self.app.lock().unwrap());
            ffi::abl_link_destroy(self.l);
        }
    }
}

#[cfg(ccd_link)]
impl Drop for AudioLink {
    fn drop(&mut self) {
        unsafe { ffi::abl_link_destroy_session_state(self.s) }
    }
}

// Without Link compiled in, the same API does nothing.
#[cfg(not(ccd_link))]
impl Link {
    pub fn new(_bpm: f64) -> Self {
        Link {}
    }
    pub fn enable(&self, _on: bool) {}
    pub fn peers(&self) -> u64 {
        0
    }
    pub fn micros(&self) -> i64 {
        0
    }
    pub fn tempo(&self) -> f64 {
        120.0
    }
    pub fn set_tempo(&self, _bpm: f64) {}
    pub fn audio(&self) -> AudioLink {
        AudioLink {}
    }
    pub fn beat_at(&self, _a: &mut AudioLink, _t: i64) -> (f64, f64) {
        (0.0, 120.0)
    }
}
