# Loop learnings

Each round adds what it found, built and learned, newest first. Read this before starting a round.

## Before the loop (5 Nov 2026, the session that set it up)
- Test against a production build (`next build` then `next start -p 3100`), not the dev server: the dev server hot-reloads mid-run and fails lessons that are fine.
- Never rebuild `.next` while a walk is running against it; restart the server after every build.
- The walker clicks "Skip this step" on any recorder, so comping and capture steps pass; mixer lessons are covered by `mix-smoke.mjs`, which clicks on until the mixer is on screen.
- Spectrum tests need a Blackman-Harris window: a Hann window's leakage floor (-53 dB) hid the real numbers and made the old drive look worse than it was.
- Keep the old version of anything you improve inside its test (see `OldDrive` in `engine/tests/sound.rs`) so every run reports before and after on the same signal.
- Match loudness in every a/b. A louder clip always sounds better.
- The engine's latency alignment depends on whole-sample delays (`DRIVE_DELAY`, `VOICE_LATENCY`); an extra oversampling stage would break it. Prefer ADAA inside the existing 2x.
- A mono voice must stay exactly in tune; voice-card tuning offsets belong on polyphonic voices only.
- Content bug class to look for: a goal the learner's default song can't meet (an A minor song fitted no bank key). Check every goal against the default song.
