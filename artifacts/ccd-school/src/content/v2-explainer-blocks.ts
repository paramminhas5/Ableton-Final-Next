// V2 Explainer System - Deep, audio-first learning blocks
// Place in: src/content/explainer-blocks.ts

export type ExplainerBlock = 
  | { kind: 'lead'; text: string }
  | { kind: 'concept'; title: string; text: string }
  | { kind: 'howItWorks'; title: string; content: string[] }
  | { kind: 'example'; title: string; description: string; audioExample?: string; code?: string }
  | { kind: 'whereYouSeeIt'; title: string; text: string; diagram?: string }
  | { kind: 'warning'; title: string; text: string }
  | { kind: 'tip'; title: string; text: string }
  | { kind: 'links'; refs: Array<{ missionId: string; label: string }> };

// Example: COMPRESSION - Full Deep Explainer
export const COMPRESSION_EXPLAINERS: ExplainerBlock[] = [
  {
    kind: 'lead',
    text: 'Compression is the bridge between amateur and professional mixes. This single tool adds punch to drums, glue to vocals, presence to bass, and cohesion to full mixes.'
  },
  {
    kind: 'concept',
    title: 'What Compression Actually Does',
    text: `
      A compressor listens to your audio and automatically turns down the loud parts.
      
      Here's what happens:
      • You set a THRESHOLD (e.g., -20 dB)
      • Anything BELOW threshold → passes through unchanged
      • Anything ABOVE threshold → gets turned down by a RATIO
      
      Example: Threshold -20 dB, Ratio 4:1
      • A peak at -15 dB is 5 dB above the threshold
      • With 4:1 ratio, it gets reduced by 5÷4 = 1.25 dB
      • So -15 dB becomes -16.25 dB
      
      The effect: loud transients don't poke out, medium-level material feels more present.
    `
  },
  {
    kind: 'howItWorks',
    title: '5 Parameters That Control Everything',
    content: [
      '**Threshold** (-60 to 0 dB): The volume level where compression kicks in. Lower threshold = more compression. On a vocal, -20 dB is typical.',
      '**Ratio** (1:1 to ∞:1): How much to squash above threshold. 4:1 = moderate glue. 10:1 = aggressive limiter.',
      '**Attack** (0-100 ms): How fast the compressor grabs loud peaks. Slow attack (20-30 ms) = punchy (transient sneaks through). Fast attack (1-5 ms) = tame peaks.',
      '**Release** (10-500 ms): How fast it lets go after a peak passes. Short release = snappy pumping. Long release = smooth, invisible.',
      '**Knee** (0-40 dB): Softness of the threshold. Hard knee = on/off behavior. Soft knee = gradual, musical compression.',
      '**Makeup Gain**: Post-compression boost to match the original loudness. Without this, compressed sounds quieter than the original, hiding the effect.'
    ]
  },
  {
    kind: 'example',
    title: 'Hear Compression Transform Drums',
    description: 'Play the same 4-bar drum loop uncompressed vs compressed (threshold -18 dB, ratio 4:1, slow attack). Notice: more even, less peaky, more "present" in the mix.',
    audioExample: 'drums-compression-demo'
  },
  {
    kind: 'whereYouSeeIt',
    title: 'Real-World Compression Settings',
    text: `
      **Vocal Lead**: -20 dB threshold, 3-4:1 ratio, 5 ms attack, 200 ms release → keeps vocal even, prevents shouts
      **Kick Drum**: -15 dB threshold, 4:1 ratio, 1 ms attack, 150 ms release → punchy, controlled
      **Bass**: -18 dB threshold, 2:1 ratio, 10 ms attack, 250 ms release → locked groove feel
      **Snare**: -20 dB threshold, 3:1 ratio, 2 ms attack, 200 ms release → tight, present
      **Mix Bus** (Master): -12 dB threshold, 2:1 ratio, 30 ms attack, 300 ms release → glues everything, transparent
    `,
    diagram: 'compressor-settings-chart'
  },
  {
    kind: 'warning',
    title: 'The A/B Loudness Trap',
    text: 'When comparing compressed vs uncompressed in Live, ALWAYS match the makeup gain so A and B have the same peak loudness. Otherwise you\'re comparing "compressed AND louder" vs "uncompressed", which tricks your ear. Fair comparison: same loudness, just different tone/punch.'
  },
  {
    kind: 'tip',
    title: 'Pro Workflow: The "6 dB Rule"',
    text: 'Set your threshold so gain reduction hits about 6 dB on the loudest peaks. Then adjust ratio/attack/release until it feels right. Makeup gain to match uncompressed loudness. A/B repeatedly. This is how professionals dial in compression in seconds.'
  },
  {
    kind: 'tip',
    title: 'Secret: Listen for the CHANGE, Not the Loudness',
    text: 'Close your eyes. A/B the compressor on/off. Don\'t listen for "loud vs quiet". Listen for: "rough vs smooth", "pokey vs even", "thin vs fat". That tonal shift is what you\'re after.'
  },
  {
    kind: 'links',
    refs: [
      { missionId: 'dynamics-fundamentals', label: 'Dynamics Fundamentals' },
      { missionId: 'mixing-vocals', label: 'Mixing Vocals with Compression' },
      { missionId: 'sidechain-compression', label: 'Sidechain Compression for Pumping' },
      { missionId: 'multiband-compression', label: 'Advanced: Multiband Compression' }
    ]
  }
];

// Simpler explainer for CLIP WARPING
export const WARPING_EXPLAINERS: ExplainerBlock[] = [
  {
    kind: 'lead',
    text: 'Warping is how Ableton lets you use samples at any tempo without pitch shift. It\'s the reason you can load a 95 BPM drum loop into a 128 BPM set and have it fit perfectly.'
  },
  {
    kind: 'concept',
    title: 'Why Warping Matters',
    text: `
      Normally, stretching audio = pitch shift (like slowing down a vinyl record). But Ableton's Warp uses smart algorithms to separate time from pitch.
      
      Before Warp: 120 BPM drum loop in a 95 BPM song → Play it slow → pitch drops → sounds like mud
      After Warp: Same loop → Ableton stretches it → keeps pitch, fits tempo perfectly
    `
  },
  {
    kind: 'example',
    title: 'Hear the Difference',
    description: 'A 120 BPM drum loop at 95 BPM. Without warp: sounds like a vinyl slowing down. With warp: same drum kit, tighter groove.',
    audioExample: 'warp-before-after'
  },
  {
    kind: 'whereYouSeeIt',
    title: 'When to Use Warp',
    text: `
      USE WARP: Drums, percussion, any rhythmic loops
      MAYBE: Vocals, instruments with clear timing
      AVOID: Long tail reverbs, ambient pads (warp artifacts become obvious)
      
      In Live: Double-click a clip → Warp button (top left) → toggle on → done
    `
  },
  {
    kind: 'tip',
    title: 'Warp Markers: Precision Alignment',
    text: 'If a loop doesn\'t line up perfectly, use Warp Markers. Click near transients (kick, snare) in the clip editor to tell Ableton exactly where the beats are. Ableton stretches between markers, not the whole clip.'
  },
  {
    kind: 'links',
    refs: [
      { missionId: 'clips-101', label: 'Audio vs MIDI Clips' },
      { missionId: 'tempo-sync', label: 'Tempo Synchronization' }
    ]
  }
];
