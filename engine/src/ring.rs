//! Single-producer single-consumer ring. The UI thread pushes, the audio thread pops
//! (and the reverse for events coming back). No locks, no allocation after creation.

use std::cell::UnsafeCell;
use std::mem::MaybeUninit;
use std::sync::atomic::{AtomicUsize, Ordering};

pub struct Ring<T: Copy, const N: usize> {
    buf: UnsafeCell<[MaybeUninit<T>; N]>,
    head: AtomicUsize, // next write
    tail: AtomicUsize, // next read
}

// Safe because exactly one thread writes (push) and one reads (pop), and slots are
// published with release/acquire on the indices.
unsafe impl<T: Copy + Send, const N: usize> Sync for Ring<T, N> {}
unsafe impl<T: Copy + Send, const N: usize> Send for Ring<T, N> {}

impl<T: Copy, const N: usize> Ring<T, N> {
    pub fn new() -> Self {
        assert!(N.is_power_of_two());
        Ring {
            buf: UnsafeCell::new([MaybeUninit::uninit(); N]),
            head: AtomicUsize::new(0),
            tail: AtomicUsize::new(0),
        }
    }

    /// Producer side. Returns false when full (the item is dropped).
    pub fn push(&self, v: T) -> bool {
        let h = self.head.load(Ordering::Relaxed);
        let t = self.tail.load(Ordering::Acquire);
        if h.wrapping_sub(t) >= N {
            return false;
        }
        unsafe {
            (*self.buf.get())[h & (N - 1)] = MaybeUninit::new(v);
        }
        self.head.store(h.wrapping_add(1), Ordering::Release);
        true
    }

    /// Consumer side.
    pub fn pop(&self) -> Option<T> {
        let t = self.tail.load(Ordering::Relaxed);
        let h = self.head.load(Ordering::Acquire);
        if t == h {
            return None;
        }
        let v = unsafe { (*self.buf.get())[t & (N - 1)].assume_init() };
        self.tail.store(t.wrapping_add(1), Ordering::Release);
        Some(v)
    }

    pub fn len(&self) -> usize {
        self.head.load(Ordering::Acquire).wrapping_sub(self.tail.load(Ordering::Acquire))
    }

    pub fn is_empty(&self) -> bool {
        self.len() == 0
    }
}

impl<T: Copy, const N: usize> Default for Ring<T, N> {
    fn default() -> Self {
        Self::new()
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::sync::Arc;

    #[test]
    fn fifo_and_full() {
        let r: Ring<u32, 4> = Ring::new();
        for i in 0..4 {
            assert!(r.push(i));
        }
        assert!(!r.push(9));
        for i in 0..4 {
            assert_eq!(r.pop(), Some(i));
        }
        assert_eq!(r.pop(), None);
    }

    #[test]
    fn across_threads() {
        let r: Arc<Ring<u64, 1024>> = Arc::new(Ring::new());
        let p = r.clone();
        let h = std::thread::spawn(move || {
            let mut i = 0u64;
            while i < 100_000 {
                if p.push(i) {
                    i += 1;
                }
            }
        });
        let mut next = 0u64;
        while next < 100_000 {
            if let Some(v) = r.pop() {
                assert_eq!(v, next);
                next += 1;
            }
        }
        h.join().unwrap();
    }
}
