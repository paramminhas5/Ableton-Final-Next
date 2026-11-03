/// One-pole parameter smoother. Stops zipper noise when a knob moves.
#[derive(Clone, Copy)]
pub struct Smooth {
    pub value: f32,
    pub target: f32,
    coef: f32,
}

impl Smooth {
    pub fn new(v: f32) -> Self {
        Smooth { value: v, target: v, coef: 0.0 }
    }

    pub fn set_time(&mut self, ms: f32, sr: f32) {
        self.coef = super::tau_coef(ms * 0.001, sr);
    }

    #[inline]
    pub fn set(&mut self, v: f32) {
        self.target = v;
    }

    /// Jump straight to the value, eg on load.
    pub fn reset(&mut self, v: f32) {
        self.target = v;
        self.value = v;
    }

    #[inline]
    pub fn next(&mut self) -> f32 {
        self.value = self.target + (self.value - self.target) * self.coef;
        self.value
    }
}
