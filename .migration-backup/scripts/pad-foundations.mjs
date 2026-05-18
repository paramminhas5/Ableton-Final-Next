// Programmatic padder for thin foundation missions.
// Reads src/content/lesson-deep-foundations.ts as text, finds each mission
// block by `"<slug>": {` and inserts curated extras into existing arrays
// (walkthrough, listenFor, edgeCases, quizHard) just before the closing `]`.
//
// Curation: per-mission map below. Each entry adds enough to clear thresholds
// (walk≥5, listen≥4, edge≥3, quizHard≥3). Skipped if the array already meets.
//
// Usage: node scripts/pad-foundations.mjs
import fs from "node:fs";
import path from "node:path";

const FILE = path.resolve("src/content/lesson-deep-foundations.ts");
let src = fs.readFileSync(FILE, "utf8");

// --- Per-mission curated extras --------------------------------------------
// Only fields needed (any thin array). Format strings must be valid TS source.
const EXTRA = {
  "frequency-pitch": {
    walkthrough: [
      `{ do: "Lower a male vocal one octave with pitch shift.", listen: "Same identity, halved frequency — proves the 2:1 ratio." }`,
      `{ do: "Sweep a high-Q EQ bell from 200 Hz to 4 kHz on a snare.", listen: "Body lives ~200 Hz; crack lives ~3–5 kHz." }`,
    ],
    listenFor: [`"Beating between two notes a few Hz apart — that's frequency difference made audible."`],
  },
  "amplitude-volume": {
    walkthrough: [
      `{ do: "Insert a Utility, drop -6 dB on a loud track.", listen: "Mix breathes; nothing else changed." }`,
      `{ do: "Bounce at -1 dBTP and check on a true-peak meter.", listen: "Inter-sample peaks revealed even when sample peaks pass." }`,
    ],
    listenFor: [`"Loudness perception shifting when volume changes (Fletcher–Munson at work)."`],
  },
  "timbre-tone": {
    walkthrough: [
      `{ do: "Add 2nd-harmonic saturation to a sub bass.", listen: "Bass becomes audible on tiny speakers without more low end." }`,
      `{ do: "Notch an EQ around 3 kHz on a harsh synth.", listen: "Aggressive bite tamed without losing presence." }`,
    ],
    listenFor: [`"Spectral brightness changing across the same note as a filter sweeps."`],
  },
  waveforms: {
    walkthrough: [
      `{ do: "Stack a sine + saw at the same pitch and balance them.", listen: "Sub weight from sine, presence from saw — classic bass layering." }`,
      `{ do: "Slowly modulate PWM with an LFO at 0.3 Hz.", listen: "Static patch becomes living, breathing pad." }`,
    ],
    listenFor: [`"Aliasing as metallic ringing when a digital saw plays very high notes."`],
  },
  "sound-in-space": {
    walkthrough: [
      `{ do: "Add 30 ms pre-delay to a vocal reverb.", listen: "Vocal stays upfront; room sits behind it." }`,
      `{ do: "Walk around your room while a sine sweep plays.", listen: "Nulls and peaks expose room modes you can't EQ away." }`,
    ],
    listenFor: [`"Pre-delay separating source from room without losing the sense of space."`],
  },
  "overtones-harmonics": {
    walkthrough: [
      `{ do: "Play a single low piano note and listen for ~3 seconds.", listen: "Upper harmonics ring above the fundamental as it decays." }`,
      `{ do: "Run a clean bass through tape saturation.", listen: "New harmonics appear — same note, richer spectrum." }`,
    ],
    listenFor: [`"Odd vs even harmonic balance shifting tone from warm to hollow."`],
  },
  "how-we-hear": {
    walkthrough: [
      `{ do: "Reference a mix at 65 dB SPL, then at 85 dB SPL.", listen: "Bass and highs feel louder at 85 — Fletcher–Munson curve." }`,
      `{ do: "Mix for 15 minutes, then take a 5-minute silent break.", listen: "Returning, you hear problems your fatigued ears were hiding." }`,
    ],
    listenFor: [`"Ear fatigue creeping in after 45–60 minutes — decisions get worse, not better."`],
  },
  "what-is-rhythm": {
    walkthrough: [
      `{ do: "Tap a steady pulse, then accent every 4th tap.", listen: "Bars emerge from a flat stream of beats." }`,
      `{ do: "Loop a 1-bar drum break and clap the upbeats.", listen: "Counter-rhythm makes the groove feel deeper." }`,
    ],
    listenFor: [
      `"Backbeat snares pinning the second and fourth beat."`,
      `"Subtle pulse vs accented downbeat."`,
    ],
    edgeCases: [`"In 5/4 or 7/8, the 'feel' breaks the usual 4-on-the-floor instinct — count out loud at first."`],
    quizHard: [
      `{ q: "A bar in 4/4 contains how many quarter-note beats?", options: ["2", "3", "4", "8"], answer: 2 }`,
    ],
  },
  "tempo-bpm": {
    walkthrough: [
      `{ do: "Drop a 124 BPM loop into a 128 BPM project.", listen: "Live warps it to fit — pitch usually preserved." }`,
      `{ do: "Use tap tempo on a record you love.", listen: "Internalising tempos by feel sharpens production instincts." }`,
    ],
    listenFor: [
      `"BPM mismatch between layered loops causing phasing or flam."`,
    ],
    edgeCases: [`"Some tracks vary BPM (rubato or live drummers) — fixed-tempo warping flattens that feel."`],
  },
  "bars-time-signatures": {
    walkthrough: [
      `{ do: "Switch a project from 4/4 to 6/8 and play a kick on every count.", listen: "Same tempo, totally different feel." }`,
      `{ do: "Write a 4-bar phrase, then add a 1-bar 3/4 fill.", listen: "The break grabs attention before resolving back." }`,
    ],
    listenFor: [
      `"Phrase boundaries every 4 or 8 bars in dance music."`,
    ],
  },
  "groove-feel": {
    walkthrough: [
      `{ do: "Apply 56% swing to a straight 16th hat pattern.", listen: "Stiff loop instantly feels human and bouncy." }`,
      `{ do: "Nudge the snare 5 ms late on a tight pattern.", listen: "Pocket deepens — laid-back without dragging." }`,
    ],
    listenFor: [
      `"Micro-timing pulling the snare slightly behind the beat."`,
    ],
    edgeCases: [`"Too much swing on fast 16ths starts to sound like triplets — pull it back to 54–58%."`],
    quizHard: [
      `{ q: "Swing of 50% means…", options: ["Maximum shuffle", "Perfectly straight timing", "Triplet feel", "Half-time"], answer: 1 }`,
    ],
  },
  syncopation: {
    walkthrough: [
      `{ do: "Move a kick from beat 3 to the '+ of 2'.", listen: "Groove instantly leans forward." }`,
      `{ do: "Add a ghost snare on the 'e' of 4.", listen: "Bar gains forward motion without louder hits." }`,
    ],
    listenFor: [`"Accents landing between the strong beats, creating push and pull."`],
    edgeCases: [`"Over-syncopation removes the downbeat anchor — listeners lose 'the one'."`],
    quizHard: [
      `{ q: "Syncopation primarily accents…", options: ["On-beats", "Off-beats / weak positions", "The downbeat", "Bar one"], answer: 1 }`,
    ],
  },
  "note-values": {
    walkthrough: [
      `{ do: "Set hat to 1/16, kick to 1/4, snare to 1/2 in a 1-bar loop.", listen: "Three speeds layering into one groove." }`,
      `{ do: "Convert straight 1/8 hats to triplet 1/8s.", listen: "Same tempo, totally different feel — 6/8 vs 4/4 motion." }`,
    ],
    listenFor: [`"Subdivision density driving perceived energy without changing BPM."`],
    edgeCases: [`"Dotted notes (1/4 dotted = 1.5 × 1/4) sit between standard divisions — common in delays."`],
  },
  "rhythm-in-production": {
    walkthrough: [
      `{ do: "Sidechain a pad to the kick.", listen: "Pad ducks on each kick — rhythmic 'pump' without programming notes." }`,
      `{ do: "Add a 1/16-dotted delay to a single vocal phrase.", listen: "Polyrhythmic echo against the main pulse." }`,
    ],
    listenFor: [`"Rhythmic interplay between melodic parts and the kick pattern."`],
    edgeCases: [`"Quantising every layer to grid removes the human pull — leave some elements off-grid intentionally."`],
    quizHard: [
      `{ q: "Sidechain compression on a pad creates…", options: ["Constant volume", "Rhythmic ducking", "Pitch shift", "Stereo width"], answer: 1 }`,
    ],
  },
  "major-scale": {
    walkthrough: [
      `{ do: "Play C major up two octaves, then back down.", listen: "Whole–whole–half–whole–whole–whole–half — the shape is constant." }`,
      `{ do: "Transpose the same melody up a 5th to G major.", listen: "Identical mood, higher position — proves scale = relative pattern." }`,
    ],
    listenFor: [`"Resolution onto the tonic feeling 'home'."`],
    edgeCases: [`"Major doesn't always mean 'happy' — context, rhythm and tempo override mode in modern music."`],
  },
  "minor-scale": {
    walkthrough: [
      `{ do: "Play A natural minor, then A harmonic minor.", listen: "Raised 7th in harmonic minor adds tension on the leading tone." }`,
      `{ do: "Loop a single Am chord, improvise notes from A minor.", listen: "Stays inside the mood; no 'wrong' notes." }`,
    ],
    listenFor: [`"Lowered 3rd as the defining minor colour."`],
    edgeCases: [`"Melodic minor changes its 6th and 7th on the way down — common in jazz, rare in EDM."`],
  },
  intervals: {
    walkthrough: [
      `{ do: "Sing the first two notes of 'Twinkle Twinkle' (a perfect 5th).", listen: "Reference for hearing P5 anywhere." }`,
      `{ do: "Play a tritone (C → F#).", listen: "Unresolved, dissonant — the 'devil's interval' in old theory." }`,
    ],
    listenFor: [`"Consonant intervals (P5, P4, M3) vs dissonant (m2, tritone, M7)."`],
    edgeCases: [`"Octave equivalence: a M10 sounds like a M3 + octave — same name family, different register."`],
  },
  "melody-writing": {
    walkthrough: [
      `{ do: "Write a 4-bar phrase that ends on the tonic.", listen: "Sense of completion." }`,
      `{ do: "Repeat the phrase but end on the 2nd degree.", listen: "Open, unresolved — invites a continuation." }`,
    ],
    listenFor: [`"Contour: where the melody peaks and how it descends."`],
    edgeCases: [`"Wide leaps (>P5) are memorable but exhausting — balance with stepwise motion."`],
    quizHard: [
      `{ q: "A melody resolving onto scale degree 1 creates…", options: ["Tension", "Resolution / arrival", "Modulation", "Syncopation"], answer: 1 }`,
    ],
  },
  "ear-training": {
    walkthrough: [
      `{ do: "Play C, then sing 'so' (G) without checking.", listen: "Test your internal 5th." }`,
      `{ do: "Identify the bass note of a loaded track by ear.", listen: "Confirm against a tuner — repeat daily." }`,
    ],
    listenFor: [`"Interval colours becoming instinctive after weeks of drills."`],
    edgeCases: [`"Perfect pitch is rare and not required — relative pitch (intervals from a reference) is what producers actually use."`],
    quizHard: [
      `{ q: "Relative pitch is…", options: ["Naming notes without a reference", "Hearing intervals from a known note", "Reading sheet music", "Tuning by ear"], answer: 1 }`,
    ],
  },
  "transposition-modes": {
    walkthrough: [
      `{ do: "Take a C major melody, shift +5 semitones (to F major).", listen: "Same melody, new key — singer comfort or vibe shift." }`,
      `{ do: "Play C major notes over a D bass.", listen: "D Dorian mode — same notes, different tonal centre." }`,
    ],
    listenFor: [`"Modal flavour shifting as the tonic moves through the same set of notes."`],
    edgeCases: [`"MIDI transpose preserves notes; audio transpose changes formants — vocals stretched too far sound chipmunked."`],
    quizHard: [
      `{ q: "Dorian mode is built starting on which degree of the major scale?", options: ["1st", "2nd", "5th", "6th"], answer: 1 }`,
    ],
  },
  "chord-types": {
    walkthrough: [
      `{ do: "Play C major, C minor, C diminished, C augmented in sequence.", listen: "Four moods from one root by altering 3rd and 5th." }`,
      `{ do: "Add a 7th to each.", listen: "Maj7 dreamy, m7 smooth, dim7 unstable, dominant 7 itching to resolve." }`,
    ],
    listenFor: [`"How the 3rd flips the entire emotional weight of the chord."`],
    edgeCases: [`"Power chords (root + 5th, no 3rd) are mode-neutral — they sit comfortably in major or minor contexts."`],
    quizHard: [
      `{ q: "A diminished triad consists of…", options: ["Root, m3, P5", "Root, M3, P5", "Root, m3, ♭5", "Root, M3, #5"], answer: 2 }`,
    ],
  },
  "chord-progressions": {
    walkthrough: [
      `{ do: "Loop I–V–vi–IV in C major.", listen: "Most-used pop progression ever; instant familiarity." }`,
      `{ do: "Swap the IV for a iv (minor IV).", listen: "Bittersweet colour from a single semitone change." }`,
    ],
    listenFor: [`"Functional pull from V back to I."`],
    edgeCases: [`"Modal progressions (e.g. Dorian i–IV) avoid the classical V–I cadence and feel suspended."`],
  },
  "keys-tonality": {
    walkthrough: [
      `{ do: "Detect the key of a favourite track in Live's analysis.", listen: "Cross-check by humming the root over the chorus." }`,
      `{ do: "Modulate up a semitone for the last chorus.", listen: "Classic energy lift — Beyoncé and Whitney move." }`,
    ],
    listenFor: [`"Stable tonal centre that the melody and bass return to."`],
    edgeCases: [`"Some tracks are ambiguous (modal interchange, no clear cadence) — analysers can be wrong."`],
    quizHard: [
      `{ q: "Relative minor of C major is…", options: ["A minor", "E minor", "G minor", "F minor"], answer: 0 }`,
    ],
  },
  "tension-resolution": {
    walkthrough: [
      `{ do: "Play V7 → I in C major (G7 → C).", listen: "Classic textbook resolution — tension fully released." }`,
      `{ do: "Replace the I with a vi (deceptive cadence).", listen: "Pull happens, but landing is unexpected — keeps the listener leaning in." }`,
    ],
    listenFor: [`"Leading tone (7th degree) resolving up to the tonic."`],
    edgeCases: [`"Constant resolution becomes predictable — pop hooks often delay or sidestep the expected I."`],
    quizHard: [
      `{ q: "A deceptive cadence resolves V to…", options: ["I", "vi", "IV", "ii"], answer: 1 }`,
    ],
  },
  "harmony-in-production": {
    walkthrough: [
      `{ do: "Layer a piano chord with a saw pad voicing the same notes.", listen: "Body + sustain — fuller stack from two timbres." }`,
      `{ do: "Drop the 3rd from a chord on bass-heavy sections.", listen: "Open 5th avoids low-mid mud when bass is busy." }`,
    ],
    listenFor: [`"Voicing spread keeping low notes wide and high notes close."`],
    edgeCases: [`"Doubling a chord at the octave below clashes with bass — leave low harmony to the bass instrument."`],
    quizHard: [
      `{ q: "Why drop the 3rd of a chord in dense low-frequency mixes?", options: ["To make it major", "To avoid muddy low-mid clash", "To change the key", "To add tension"], answer: 1 }`,
    ],
  },
  "song-structure": {
    walkthrough: [
      `{ do: "Sketch intro – verse – chorus – verse – chorus – bridge – chorus.", listen: "Familiar pop arc — predictable in the best way." }`,
      `{ do: "Add a 4-bar pre-chorus that pulls energy back before the drop.", listen: "Contrast makes the chorus hit harder." }`,
    ],
    listenFor: [`"Section boundaries marked by drum changes, filter sweeps or silence."`],
    edgeCases: [`"Dance tracks often use 16- or 32-bar phrases — DJs need predictable lengths for mixing."`],
    quizHard: [
      `{ q: "Purpose of a pre-chorus?", options: ["Repeat the verse", "Build tension into the chorus", "Replace the bridge", "Reduce energy"], answer: 1 }`,
    ],
  },
  "listening-actively": {
    walkthrough: [
      `{ do: "Loop one 8-bar section of a reference and list every instrument.", listen: "Forces detail-level awareness over passive listening." }`,
      `{ do: "Mute the lead and re-listen.", listen: "Reveals what the backing tracks are actually doing." }`,
    ],
    listenFor: [`"Production decisions: reverb size, pan placement, when the bass enters."`],
    edgeCases: [`"Listening on phone vs headphones reveals different mix problems — both are valid references."`],
    quizHard: [
      `{ q: "Best practice when learning from a reference?", options: ["Listen once casually", "Loop short sections and dissect", "Skip to the drop", "Compare loudness only"], answer: 1 }`,
    ],
  },
  "daw-explained": {
    advanced_what: [
      `"Core architecture: an audio engine streams samples at fixed buffer sizes through a directed graph of tracks → devices → buses → master. A separate MIDI engine schedules note events sample-accurate to that audio clock."`,
      `"Plugin host: VST3 / AU / AAX run as in-process modules; Live additionally hosts Max for Live devices that share the engine without an external IPC bridge."`,
      `"Automation system: every device parameter is addressable; automation lanes live in clips (Session) or on tracks (Arrangement) and are resolved per-sample during render."`,
      `"Plugin Delay Compensation walks the graph at start, measures each plugin's reported latency, and inserts compensating delays on parallel paths so downbeats stay aligned."`,
      `"32-bit float internal headroom means nothing clips until the final master output stage — buses can run hot internally without distortion."`,
    ],
    walkthrough: [
      `{ do: "Group three drum tracks into a bus and add a glue compressor.", listen: "Sub-mixing reduces master-bus work and tightens the kit." }`,
      `{ do: "Freeze and flatten a CPU-heavy synth track.", listen: "DAW writes audio to disk; CPU drops dramatically." }`,
    ],
    listenFor: [`"Plugin chain order changing the result (EQ→comp vs comp→EQ are different sounds)."`],
    edgeCases: [`"Changing sample rate mid-project re-samples audio clips on the fly — saved warp markers may drift slightly."`],
    quizHard: [
      `{ q: "Why does Live use 32-bit float internally?", options: ["Smaller files", "Effectively unclippable headroom on internal buses", "Better latency", "MIDI accuracy"], answer: 1 }`,
    ],
  },
  "midi-explained": {
    advanced_what: [
      `"MIDI 1.0 is a serial protocol of 1- to 3-byte messages on 16 channels; status bytes encode message type and channel, data bytes carry note number, velocity, controller value, or program."`,
      `"Note On with velocity 0 is functionally identical to Note Off — many controllers use it as a bandwidth optimisation."`,
      `"Continuous Controllers (CC) are 7-bit (0–127) by default; CC numbers 0/32, 6/38, etc. pair into 14-bit MSB/LSB messages for finer resolution."`,
      `"MIDI 2.0 introduces bidirectional negotiation, 32-bit data resolution, per-note controllers (true polyphonic expression), and property exchange — adoption is partial across DAWs and hardware."`,
      `"MPE (MIDI Polyphonic Expression) sits on top of MIDI 1.0 by assigning each note its own channel so pitch bend and CCs can be per-note — Push 3 and ROLI controllers rely on this."`,
    ],
    walkthrough: [
      `{ do: "Map a CC1 (mod wheel) move to a filter cutoff with MIDI Learn.", listen: "Real-time expressive control over a single parameter." }`,
      `{ do: "Use Live's Scale device above an instrument to constrain notes to A minor.", listen: "Wrong notes simply can't happen — useful for improv recording." }`,
    ],
    listenFor: [`"Velocity driving filter brightness as well as volume on well-designed patches."`],
    edgeCases: [`"Quantising MIDI to grid removes humanisation; use 'Quantize Strength' < 100% to retain feel."`],
    quizHard: [
      `{ q: "Why does Note On with velocity 0 equal Note Off?", options: ["Bug in spec", "Bandwidth optimisation on serial MIDI", "Required by VSTs", "Bit-depth limit"], answer: 1 }`,
    ],
  },
  "digital-audio": {
    walkthrough: [
      `{ do: "Render a session at 44.1 kHz and 96 kHz and A/B in matched playback.", listen: "Most differences are masked once dithered to 16-bit delivery." }`,
      `{ do: "Truncate a 24-bit mix to 16-bit without dither.", listen: "Quiet tails reveal quantisation noise; with dither, it disappears." }`,
    ],
    listenFor: [`"Quantisation hiss on faded tails when bit depth is wrong."`],
    edgeCases: [`"Sample-rate conversion quality varies between DAWs — bounce at project rate when possible."`],
    quizHard: [
      `{ q: "Dither is added when…", options: ["Increasing bit depth", "Reducing bit depth", "Changing sample rate", "Compressing audio"], answer: 1 }`,
    ],
  },
  "samples-loops": {
    walkthrough: [
      `{ do: "Drop a 90 BPM break into a 128 BPM project with Complex Pro warping.", listen: "Tempo matches, transients survive." }`,
      `{ do: "Slice the same break to a Drum Rack with 1/16 markers.", listen: "Each hit is now playable from a pad — instant remix material." }`,
    ],
    listenFor: [`"Warp artefacts (flam, smear) on fast transients — different modes for different sources."`],
    edgeCases: [`"Commercial sample packs are usually royalty-free but check the licence on every pack before release."`],
    quizHard: [
      `{ q: "Which warp mode is generally best for full drum loops?", options: ["Beats", "Tones", "Texture", "Re-Pitch"], answer: 0 }`,
    ],
  },
  "signal-chain": {
    walkthrough: [
      `{ do: "Place an EQ before a compressor on a vocal.", listen: "Compressor reacts to the EQ'd signal — less pumping on lows." }`,
      `{ do: "Swap the order: compressor before EQ.", listen: "Different result — neither is wrong, but they sound different." }`,
    ],
    listenFor: [`"Bypass-and-compare to confirm each device is earning its place."`],
    edgeCases: [`"Some devices reset on stop (envelope followers); printing audio captures their settled state."`],
    quizHard: [
      `{ q: "Why does plugin order matter?", options: ["It doesn't — they're commutative", "Each device transforms the signal before the next sees it", "Only for MIDI plugins", "Only at master bus"], answer: 1 }`,
    ],
  },
  "effects-overview": {
    walkthrough: [
      `{ do: "Send a snare to a reverb return at -20 dB.", listen: "Subtle space added without drowning the snare itself." }`,
      `{ do: "Insert a transient shaper on a kick.", listen: "Attack sharpened or softened without touching levels." }`,
    ],
    listenFor: [`"Effects serving a specific job per track, not added by reflex."`],
    quizHard: [
      `{ q: "Why use a send for reverb instead of an insert?", options: ["Lower CPU and consistent space across multiple tracks", "Higher fidelity always", "Required by the DAW", "Reverb only works on sends"], answer: 0 }`,
    ],
  },
  "mixing-basics": {
    walkthrough: [
      `{ do: "Reference your mix against a commercial track at matched LUFS.", listen: "Honest comparison of balance, not loudness." }`,
      `{ do: "Mono-sum the master and re-listen.", listen: "Phase issues collapse — anything that vanishes is a problem." }`,
    ],
    listenFor: [`"Mix translation across phone, headphones and monitors."`],
    edgeCases: [`"Mixing on headphones produces wider mixes than monitors — cross-check both."`],
    quizHard: [
      `{ q: "Best comparison method when referencing?", options: ["Match peaks", "Match LUFS loudness", "Match RMS only", "By eye"], answer: 1 }`,
    ],
  },
  "music-tech-integration": {
    walkthrough: [
      `{ do: "Build a Live template with sends, bus structure and your favourite drum rack pre-loaded.", listen: "Time to first note drops to seconds." }`,
      `{ do: "Map your controller's transport and 8 macros once, save as User Remote Script.", listen: "Hands stay on the controller; mouse stays unused." }`,
    ],
    listenFor: [`"Friction points in your workflow — each is a template or shortcut waiting to happen."`],
    edgeCases: [`"Plugin authorisation expires when libraries move drives — keep a documented list of serials."`],
    quizHard: [
      `{ q: "Highest-leverage early-career investment?", options: ["More plugins", "Templates + shortcut fluency", "Newer interface", "Studio monitors upgrade"], answer: 1 }`,
    ],
  },
};

// --- Patcher ---------------------------------------------------------------
function findMissionBlock(src, slug) {
  const re = new RegExp(`"${slug}":\\s*{`, "g");
  const m = re.exec(src);
  if (!m) return null;
  // Walk braces to find matching close.
  let depth = 0;
  let i = m.index + m[0].length - 1; // at opening '{'
  for (; i < src.length; i++) {
    const c = src[i];
    if (c === "{") depth++;
    else if (c === "}") {
      depth--;
      if (depth === 0) return { start: m.index, end: i + 1 };
    }
  }
  return null;
}

function insertIntoArray(block, key, extras) {
  // Match e.g.  walkthrough: [ ... ],  (multiline). Insert before the closing `]`.
  // Use a regex that captures: key: [   <body>   ]
  const re = new RegExp(`(${key}:\\s*\\[)([\\s\\S]*?)(\\n?\\s*\\])`, "m");
  const m = block.match(re);
  if (!m) return null; // key not present — skip
  const [full, open, body, close] = m;
  const indentMatch = body.match(/\n(\s+)/);
  const indent = indentMatch ? indentMatch[1] : "      ";
  const trimmedBody = body.replace(/\s*$/, "");
  const trailingComma = trimmedBody.endsWith(",") ? "" : ",";
  const inserted = extras.map((e) => `\n${indent}${e},`).join("");
  const newBlock = block.replace(
    full,
    `${open}${trimmedBody}${trailingComma}${inserted}${close}`,
  );
  return newBlock;
}

function replaceAdvancedWhat(block, items) {
  // Find advanced: { what: [ ... ] } and replace the what array.
  const re = /(advanced:\s*{\s*what:\s*\[)([\s\S]*?)(\n?\s*\])/;
  const m = block.match(re);
  if (!m) return null;
  const indent = "        ";
  const body = items.map((s) => `\n${indent}${s},`).join("");
  return block.replace(re, `$1${body}\n      $3`);
}

let touched = 0;
for (const [slug, extras] of Object.entries(EXTRA)) {
  const loc = findMissionBlock(src, slug);
  if (!loc) {
    console.log(`SKIP (not found): ${slug}`);
    continue;
  }
  let block = src.slice(loc.start, loc.end);
  let changed = false;

  if (extras.advanced_what) {
    const next = replaceAdvancedWhat(block, extras.advanced_what);
    if (next) { block = next; changed = true; }
  }
  for (const key of ["walkthrough", "listenFor", "edgeCases", "quizHard"]) {
    if (!extras[key]) continue;
    const next = insertIntoArray(block, key, extras[key]);
    if (next) { block = next; changed = true; }
    else {
      // Need to create the array. For edgeCases/quizHard inside advanced; for walkthrough/listenFor at top level.
      // For simplicity skip — most thin missions already have these arrays.
      console.log(`  · ${slug}: array '${key}' missing — manual edit needed`);
    }
  }

  if (changed) {
    src = src.slice(0, loc.start) + block + src.slice(loc.end);
    touched++;
    console.log(`PATCHED ${slug}`);
  }
}

fs.writeFileSync(FILE, src);
console.log(`\nDone. Patched ${touched}/${Object.keys(EXTRA).length} missions.`);
