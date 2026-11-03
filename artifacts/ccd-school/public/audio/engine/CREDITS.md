# Teaching clips made on the CCD engine

Rendered on 3 Nov 2026 by `engine/src/bin/teach_clips.rs` (`cargo run --release --bin teach_clips -- <dir>`), through the same Rust engine the apps play, then encoded to MP3 at 160 kbps. They are ours outright: no samples, no AI, no licences. They replace the three Magnific AI clips used since 31 Oct.

- dry-clap.mp3: the drum rack's clap with no reverb send. Measured: falls 40 dB below its peak 0.21 s after the hit.
- hall-clap.mp3: the same clap sent fully to the engine's hall reverb (2.4 s RT60 setting). Measured: 1.05 s to fall 40 dB, about five times the dry clap. Same first-hit peak as the dry clap (-9.4 dBFS).
- house-sketch.mp3: 18 s at 124 BPM: four on the floor, claps, hats, an A minor bass and chord stabs. Bar 7 (11.6 s to 13.5 s) drops the kick and bass, then bar 8 brings them back with a crash. Measured in 0.25 s windows: energy from 30 to 120 Hz falls by 30 to 55 dB in that bar while the highs stay. Peak -2.0 dBFS.

Lessons only claim what is measured here. Nobody has listened critically yet.
