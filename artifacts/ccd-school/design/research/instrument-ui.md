# Instrument UI research for CCD School (screens that feel "a world apart")

Research input for the instrument and visuals pass, 5 Nov 2026. Every claim carries the URL it came from. Where a source was silent, it says so. Five primary pages could not be fetched through the proxy (teenage.engineering OP-1 field guide, vital.audio, xferrecords.com Serum 2 page, MDN AnalyserNode, a long-URL MusicRadar Pigments interview); secondary sources (reviews, KVR product pages, caniuse) were used for those products instead.

---

## 1. The best-regarded instrument UIs, 2023 to 2025

### Teenage Engineering OP-1 / OP-1 Field
- Four endless encoders whose colour matches the on-screen object they move. Sound on Sound: "On each page, colour is the natural link between on-screen objects and encoders, simple and highly effective"; "Clear graphics reveal each engine far better than long descriptive text"; the display "uses colour and animation meaningfully." https://www.soundonsound.com/reviews/teenage-engineering-op1
- Tape: four-track mode opens on an image of reels and scrolling tape; with beat match on, "bar lines scroll along with the tape" (same review). On the Field, "Each mode changes the graphics for the tape as well as the tone"; shuttling the tape "is analogue-like both visually and audibly." https://www.soundonsound.com/reviews/teenage-engineering-op-1-field
- Engine screens: "Each synth engine has a unique control screen"; Dimension is "represented rather beautifully by a Lissajous curve"; drum sampling got "a gorgeous new waveform editor with a zoomable display" and "Slice editing is straightforward on the screen"; a pop-up shows encoder values when they're not obvious (same Field review). The OP-1's punch filter is drawn as a boxer; Kouthoofd: "limitations are OP-1's biggest feature." https://en.wikipedia.org/wiki/Teenage_Engineering_OP-1
- For CCD: one metaphor per screen, colour binding control to graphic, a graphic that caricatures the parameter rather than a dial.

### Teenage Engineering OP-XY (2024)
- Grayscale screen, red only for record; "fun, and sometimes esoteric, animated graphics"; the Simple engine display is "charming but essentially irrelevant", the Wavetable oscilloscope "more informative." Encoders make synth tweaking "inherently steppy." Praise for the step component system. Cons: "no on-screen pattern display" for drums, "no persistent indication of Song position." https://www.soundonsound.com/reviews/teenage-engineering-op-xy
- MusicRadar: "at least you see something happen"; misses the OP-1's colour by control; "a half-decent tune within three minutes"; "Some per-step edits are clumsy." https://www.musicradar.com/music-tech/synths/teenage-engineering-op-xy-review
- Perfect Circuit: "nicely animated and interactive"; step components add "variations, ratchets, flips and note effects." https://www.perfectcircuit.com/signal/teenage-engineering-op-xy-review
- Lesson: decoration is forgiven once; a screen with no overview is not. Reviewers rank informative above charming.

### Ableton Note (iOS)
- "Designed for touchscreens", "fun and easy to pick up." Jumbo pads set velocity by tap height; global key and scale filter the grid. Capture: played notes appear as ghost notes, "nothing gets committed without your say-so"; free-length recording guesses tempo. Parameter moves draw temporary automation you commit or discard. Only lanes with notes are shown, "a good choice for small screens." Sampler: "pinch and zoom to change the start and end points"; live sampling "will auto-trim to the transients." Button-based move and transpose "works much better on a phone screen" than dragging. https://www.soundonsound.com/reviews/ableton-note
- v1.3 gestures: tap add or delete; long-press-drag paints notes; drag horizontally for time, vertically for pitch; right-edge handle for length, drag that handle up or down for velocity; long-press-drag to multi-select; pinch for grid resolution; loop brace long-press to duplicate or crop. https://cdm.link/ableton-note-1-3/
- MusicRadar: Capture "to retroactively generate a MIDI clip" is intuitive; Drum Sampler filter and effects respond to dragging across the screen; holding a note opens move, transpose, quantise and velocity. https://www.musicradar.com/music-tech/software-apps/with-its-latest-free-update-ableton-has-finally-turned-note-into-the-app-i-always-wanted-it-to-be

### Ableton Move (2024)
- "Capture (aka retrospective record) is where it's at"; "Touching any encoder shows its function on the screen"; step buttons make it "easy to drop notes and chords onto steps"; p-lock automation "works intuitively"; sampling "really simple." Cons: hunting across encoders, screen "obscured by your left hand." https://www.soundonsound.com/node/4932613
- Design intent (Johannes Russ): "this design principle of immediacy"; random instruments per new set to beat "decision paralysis"; it had to "feel very fluid and very snappy", which is why four tracks not eight. https://musictech.com/features/interviews/ableton-move-johannes-russ-interview and https://tapeop.com/interviews/169/the-making-of-move
- Lesson: responsiveness over feature count; touch-to-reveal; capture beats record.

### Ableton Push 3 standalone
- Devices "nicely integrated with the screen", "animated graphics"; automated parameters "marked with a dot and you see the values change in real time"; MPE pads "each pad essentially being an individual X/Y controller." Cons: no display of clip modulation, flat sample list. https://www.soundonsound.com/reviews/ableton-push-3

### Koala Sampler
- "Sample, Sequence, Perform"; "logically laid out, simple to interact with"; resampling "to another pad with effects applied." Not especially attractive. https://www.soundonsound.com/reviews/elf-audio-koala-sampler
- Developer intent: "designed to be easy to understand"; many samplers leave you "focused more on making tiny edits than, well, making music." https://www.engadget.com/2019/03/07/koala-sampler/
- DJTT: "simple and intuitive interface", slice up to 32, choke, attack and release before committing, split stems. https://djtechtools.com/2023/02/07/meet-the-koala-sampler-app-a-mobile-production-powerhouse-now-with-stems
- Why it reads as the most intuitive: nothing is more than a tap from a pad; record lives on the pad; edits are fast and resampled rather than tweaked.

### Endlesss
- Each loop "appears as a circular waveform, with more complex ideas boasting more colours"; "finely tuned to function smartly on small screens"; "encouragement to experiment and commit to your audio is liberating." https://musictech.com/reviews/software-instruments/endlesss/

### Elektron parameter locks
- Hold a trig, turn a knob, that step takes the value; locked steps change colour; trigless locks act as automation nodes. https://www.elektronauts.com/t/trigless-locks-why-how-to-use-them/41953

### Polyend Play
- Eight-lane step grid, "a freeform canvas"; touching an encoder brings it to the screen; Fill generates patterns with "the amount of randomness" under your control; Perform mode "the real jewel in the crown." Con: "easy to accidentally switch modes by the slightest touch." https://www.soundonsound.com/reviews/polyend-play

### Dirtywave M8
- A tracker with an on-screen map of where you are; "once the muscle memory kicks in, it's a surprisingly fast workflow." https://www.soundonsound.com/reviews/dirtywave-m8-model02

### Synthstrom Deluge
- The original four-digit display was criticised for "unmarked Konami-Code combinations"; proposed principles: "All operations should be possible to do without memorization" and "Support for rare tasks must not make common tasks hard to do." https://people.cs.gmu.edu/~sean/projects/synth/deluge.html ; OLED added in 2022. https://www.synthtopia.com/content/2022/09/10/synthstrom-deluge-upgraded-with-oled-display/

### Novation Circuit Tracks
- No screen at all; tempo spelled on pads; "permanent labels for all ten of its rotaries"; "You can get started immediately." https://musictech.com/reviews/hardware-instruments/novation-circuit-tracks-review

### Arturia Pigments
- Colour separates modulation sources; "a colourful scope shows you an animated visual preview"; "unused modulation sources stay dark until you assign them"; assign by grabbing the outside of a control, then a coloured ring shows the amount; "The clearest approach to modulation I've seen in a soft synth." https://www.soundonsound.com/reviews/arturia-pigments

### Vital
- "animated controls running at 60fps" https://www.musicradar.com/news/vital-is-an-eye-catching-spectral-warping-wavetable-synth-plugin-that-you-can-have-for-free ; "Everything moves in real-time so you can see what's going on behind the scenes." https://www.kvraudio.com/product/vital-by-matt-tytel

### Serum / Serum 2
- Forum consensus for best visual feedback: modulators animate, and so do their targets. https://www.kvraudio.com/forum/viewtopic.php?p=6724550
- Serum 2: "sleeker and easier to navigate"; the mod matrix makes it "far easier to unpick the workings of any preset"; some elements "cramped." https://www.musicradar.com/music-tech/plugins/a-copy-of-serum-might-be-the-smartest-investment-any-budding-producer-makes-xfer-serum-2-review

### Bitwig modulators
- Click an arrow, then use the target knob itself as the attenuator; "the workflow must be direct and fun." https://www.bitwig.com/en/17/behind-the-scenes-modularity.html

### Logic Pro for iPad / GarageBand
- "Perhaps the best example yet of how to reimagine a mature and feature-rich desktop application for the iPad"; play surfaces reveal more keys or pads as you give them room; plug-in tiles for common parameters. https://www.soundonsound.com/reviews/apple-logic-pro-ipad
- GarageBand note editor: pen toggle then tap to add; hold and drag to move; drag handles for length; velocity slider in a menu; pinch zoom. https://www.musicradar.com/tuition/tech/how-to-edit-midi-notes-in-garageband-for-ios-549010

---

## 2. "The control shows what it does"

1. Bind colour between control and graphic (OP-1).
2. Animate the source and the target (Serum consensus).
3. Dark until assigned (Pigments).
4. A ring around the knob for modulation amount (Pigments, Bitwig).
5. Touch to reveal name and value (Move, OP-1 Field).
6. An automation dot with the value moving live (Push 3).
7. Caricature over instrumentation, but one honest meter per screen earns one playful graphic (OP-XY).
8. Strip the chrome when teaching: "teaching some concepts is best done without the usual chrome and knobs and widgets." https://cdm.link/learn-synthesis-basics-in-your-browser-free-with-ableton/ ; Ableton Learn was "built mobile-first." https://cdm.link/ableton-learn/

On a phone: draw only what has content; one animated element per control; and three cheap honest graphics carry most screens: the envelope with a dot travelling along it on each note, the filter curve with a knee that moves with cutoff, and the lfo dot travelling its wave.

---

## 3. Sampler UX

- Simpler: slice by transient (with sensitivity), beat, region or manual; classic mode start, loop, length, fade; snap to zero crossing. https://www.loopmasters.com/articles/4565-Working-with-Samples-in-Ableton-Live-s-Simpler ; drag a marker onto the snare, zoom by dragging down. https://www.musicradar.com/tuition/tech/how-to-chop-beats-with-ableton-simplers-new-slice-mode-632939
- MPC: threshold, region (4/8/16/32), bpm, manual; click a slice to audition; assign to pads in order. https://www.audeobox.com/learn/mpc-software/chop-shop-sampling/
- Serato Sample 2: one window, key and tempo detected, chops on keys, per-slice level, filter, envelope, reverse; "Ridiculously fast." Cons: "Easy to create accidental cue points"; no readiness indicator on stems. https://musicradar.com/reviews/serato-sample-2-review
- Koala: equal division to one slice per sixteenth when tempo is set; resample and chop again. https://violetrecording.com/how-to-use-koala-sampler/

What makes slicing instant and fun:
1. Slices appear the moment the sample lands.
2. Auto modes plus manual, one sensitivity slider that re-slices live.
3. Every slice on a numbered pad that flashes when its region plays; tap the region to audition.
4. Equal division as the beginner default when tempo is known.
5. Markers big enough to drag; zoom by vertical drag or pinch.
6. Undo is one tap.
7. Commit and resample rather than endless tweaking.
8. A visible readiness state for anything that takes time.

---

## 4. Piano roll and step sequencer on touch

- Add: tap an empty cell; long-press-drag paints notes (Note 1.3, GarageBand).
- Move: drag for time and pitch, but button-based move "works much better on a phone screen" (SOS on Note).
- Length: drag a right-edge handle. Velocity: drag that handle up or down (Note) or a slider (GarageBand); jumbo pads take velocity from tap height.
- Select: long-press-drag. Zoom: pinch sets grid resolution.
- Patterning: each cell is a radial velocity bar, "nothing on the screen that doesn't function"; criticised because velocity is set one beat at a time. https://ethanhein.com/wp/2015/user-interface-case-study-patterning/
- Move: hold a step, turn a knob for a parameter lock. https://www.soundonsound.com/node/4932613

For CCD's note grid: tap adds at default velocity; long-press selects; drag moves; right-edge handle sets length and, dragged vertically, velocity; pinch sets resolution; a bottom operation strip (nudge, transpose, quantise, duplicate) as the phone-safe alternative; hold a step and turn a knob to lock it, and the step changes colour.

---

## 5. DJ: what the apps show that teaches

- Frequency-coloured waveforms: djay uses red bass, yellow low-mid, green high-mid, blue high, with bar numbers and white downbeat lines. https://help.algoriddim.com/user-manual/djay-ios/mixing-basics/waveforms ; in Serato, cutting an eq band removes its colour from the waveform. https://serato.com/latest/blog/18238/learn-eq-colored-waveforms
- Phrase labels (intro, up, chorus, build-up, breakdown) under the waveform in rekordbox. https://manuals.plus/rekordbox/alphatheta-phrase-analysis-manual
- Key compatibility: rekordbox turns compatible keys green. https://djtechtools.com/2018/08/01/rekordboxs-new-beta-brings-stoplight-key-match-display ; Traktor shows the shift in semitones. https://djtechtools.com/2019/07/02/traktor-pro-3-2-out-now-watch-chris-liebing-demo-better-harmonic-mixing-in-traktor/
- Stems: djay Neural Mix gives vocals, drums and harmonics each a fader. https://help.algoriddim.com/user-manual/djay-ios/neural-mix/overview

For CCD's decks: colour by band lets a learner see a bass swap; bar numbers and phrase labels teach counting in eights and sixteens; a green or amber key badge teaches harmonic mixing without theory; stem faders teach what a bassline swap sounds like.

---

## 6. Knobs, faders, pads: touch ergonomics and accessibility

- WCAG 2.2 minimum target 24 by 24 css px. https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html ; Apple recommends 44 by 44 points, Material enforces 48. https://docs.deque.com/devtools-mobile/2025.7.2/en/ios-touch-target-spacing . Practical floor for CCD: a 44 px hit area around every knob and 48 px pads.
- Drag: vertical drag with the finger free to wander; fine mode on long-press or a second finger; a value readout beside, never under, the finger. https://forum.juce.com/t/rotary-knob-movement-sensitivity/48280
- A small movement threshold before a knob takes, to stop accidental touches (Polyend Play con).
- Haptics: navigator.vibrate works on Chrome and Android, not on iOS Safari. https://caniuse.com/mdn-api_navigator_vibrate . Treat it as Android-only; use a visual detent flash elsewhere.
- ARIA slider pattern: role slider, valuenow, valuemin, valuemax, valuetext in human units, arrows step, Page Up and Down for bigger steps, Home and End. https://www.w3.org/WAI/ARIA/apg/patterns/slider/

---

## 7. Motion and sound-reactive visuals in the browser

- Canvas is about ten times faster than SVG for hundreds of moving objects; keep knobs and labels in DOM or SVG, draw waveforms, scopes, playheads and the note grid on canvas. https://blog.logrocket.com/when-to-use-html5s-canvas-ce992b100ee8
- OffscreenCanvas in a worker keeps drawing while the main thread is busy; supported in Safari 17 and up. https://blog.scottlogic.com/2020/03/19/offscreen-canvas.html ; https://caniuse.com/offscreencanvas
- A production analyser writes worklet samples to a lock-free ring buffer and draws only on animation frames. https://engineered.at/articles/building-a-signal-analyzer-with-modern-web-tech . For CCD: per-control animation from small engine-sent state (envelope stage, lfo phase, cutoff) is cheaper and more honest than an AnalyserNode; keep the analyser for the master scope only.
- Budget: one canvas per screen, 60 fps target, 30 on low-end devices.

---

## 8. Learning-app specifics

- Melodics colours each note by accuracy and raises tempo as you improve. https://promusicianhub.com/melodics-review
- Yousician: a bouncing ball, green in time, red missed, first missions stop until you play the missed note. https://beginnerguitarhq.com/yousician-guitar-review
- Simply Piano "tells you right away when a note is wrong or late." https://violetrecording.com/simply-piano-review/
- Duolingo iterated its milestone animation's timing in rough passes. https://blog.duolingo.com/streak-milestone-design-animation
- Ableton Learning Synths is "visual and playable and sonic." https://cdm.link/learn-synthesis-basics-in-your-browser-free-with-ableton/

What makes an instrument screen teach rather than overwhelm: one new control lit per lesson, the rest dim; an immediate colour verdict on each hit; slow-then-faster practice loops; a "where am I" strip; a playground at the end.

---

## The twelve interface moves, in order of payoff per effort

1. **Touch-to-reveal value strip.** Any control touched shows name, value and unit on the screen, offset from the finger. All screens.
2. **Colour-bind controls to the screen graphic.** Each knob's LED colour is the colour of the line it moves. Synths, fx, macro, sampler.
3. **Dark until used.** Unused modulation, fx and lanes dim; assigning lights them. Synths, fx, macro, arpeggiator, note grid.
4. **Three honest animated graphics, reused everywhere:** envelope with a travelling dot, filter curve with a moving knee, lfo dot on its wave, driven by engine state, one canvas per screen. Drum rack, synths, fx, sampler.
5. **Instant slices.** Sliced on arrival, one sensitivity slider, numbered pads that flash, tap to audition, one-tap undo. Sampler slice, drum rack.
6. **Hold a step, turn a knob to lock it,** and the step changes colour. Note grid, drum steps, arpeggiator.
7. **Capture instead of record.** A rolling buffer; ghost notes you commit; tempo guessed from free play. Drum rack, synths, note grid, comping.
8. **Pads with velocity from tap height,** 48 px, a ring flash on hit, choke groups dim each other. Drum rack, sampler.
9. **Phone-safe note editing:** tap to add, long-press to select, edge handle for length and velocity, pinch for grid, an operation strip. Note grid, arpeggiator.
10. **Frequency-coloured waveforms** with bar numbers, downbeat lines, phrase labels and a key badge; an eq cut removes its colour. DJ decks, sampler warp.
11. **Fill and randomise with an amount.** Drum rack, arpeggiator, note grid.
12. **A "you are here" strip and lesson spotlight:** the lesson lights only the control it teaches, with green, amber or red verdicts on each hit and a speed-up loop. All screens.

Worth noting but lower payoff: a radial velocity sequencer, circular waveform thumbnails for loops, iOS haptics.
