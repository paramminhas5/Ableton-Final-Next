// Deep explainers for all 9 audio devices
// 10-15 blocks per device, fully detailed

export interface ExplainerBlock {
  type: 'lead' | 'concept' | 'parameters' | 'example' | 'listening' | 'mistakes' | 'tips' | 'formula' | 'diagram';
  title: string;
  content: string;
  // For listening: what to listen for
  // For examples: actual use case
  // For tips: pro workflow
}

export interface DeviceExplainer {
  deviceId: string;
  deviceName: string;
  blocks: ExplainerBlock[];
}

export const DEVICE_EXPLAINERS: Record<string, ExplainerBlock[]> = {
  eq: [
    {
      type: 'lead',
      title: 'What is EQ?',
      content: 'Equalization lets you boost or cut specific frequency ranges. Every mixing decision starts here: boomy kick needs low-end reduction, dull vocal needs mid-range boost, harsh synth needs treble taming. EQ is the single most powerful mixing tool.'
    },
    {
      type: 'concept',
      title: 'How the 3-Band EQ Works',
      content: 'Three independent filters work together:\n1. LOW SHELF at 120 Hz: Controls kick body, bass weight, sub rumble\n2. MID PEAK at 1-6 kHz: Controls vocals, snare, guitar - the most musical part of audio\n3. HIGH SHELF at 6 kHz: Controls air, sparkle, brilliance, sibilance\n\nEach can be boosted (+18 dB) or cut (-18 dB). The MID has extra controls: frequency (WHERE is the problem) and Q (HOW WIDE or NARROW is the fix).'
    },
    {
      type: 'parameters',
      title: 'Understanding Each Parameter',
      content: 'LOW: Below 120 Hz - kick fundamental, bass, sub. Cut for clarity, boost for weight.\n\nMID: The "surgical knife" - most mixing happens here. Has 3 controls:\n  • Gain: How much to boost/cut (dB)\n  • Frequency: Where the problem is (200-6000 Hz range)\n  • Q: Width of the fix. Q=0.3 is very wide (gentle), Q=8 is narrow (surgical)\n\nHIGH: Above 6 kHz - air, sizzle, presence. Cut harsh sources, boost dull ones.\n\nRULE: When you find a problem, narrow the Q, reduce the gain slightly, then widen the Q until it sounds right.'
    },
    {
      type: 'example',
      title: 'Boomy Kick Problem',
      content: 'Kick drum rumbles too much - annoying in headphones, takes up space in the mix.\n\nSOLUTION:\n1. Open this EQ on the kick\n2. Set LOW to -6 dB\n3. Listen - if it\'s still boomy, cut more (-8 to -12)\n4. If it loses punch, the problem is MID or LOW is peaky\n5. Try MID at -4 dB around 200-400 Hz with narrow Q\n6. A/B to compare.'
    },
    {
      type: 'example',
      title: 'Dull Vocal Problem',
      content: 'Vocal sounds dark, lacks presence, gets lost in mix.\n\nSOLUTION:\n1. Boost MID +3 to +6 dB around 2-4 kHz\n2. This adds presence and clarity\n3. Boost HIGH +2 to +4 dB around 8 kHz for air\n4. If too harsh, narrow the Q and reduce boost slightly\n5. Pro tip: A/B frequently - our ears adapt fast'
    },
    {
      type: 'example',
      title: 'Harsh Cymbal Problem',
      content: 'Cymbals or hi-hats are too brittle, painful in headphones.\n\nSOLUTION:\n1. Cut HIGH -3 to -6 dB around 8-10 kHz\n2. Use narrow Q to avoid losing all brightness\n3. If still harsh, cut MID -2 dB around 3-5 kHz\n4. You\'ve removed the harsh peak without losing definition'
    },
    {
      type: 'listening',
      title: 'What to Listen For',
      content: 'Sweep the MID frequency with +12 dB gain and narrow Q - you\'ll hear a screeching tone that reveals problem frequencies.\n\nThen reduce the gain and widen Q to see what that frequency naturally does.\n\nA/B constantly: The EQ should make the source CLEARER, not just LOUDER. If boosting makes it louder, use makeup gain on a compressor instead.\n\nListen in mono, headphones, and a treated room. What sounds clear in headphones might be too bright in a room.'
    },
    {
      type: 'mistakes',
      title: 'Common EQ Mistakes',
      content: '❌ Boosting everything - "If some is good, more is better" leads to harsh, hyped mixes. Cut more than boost.\n\n❌ Too much resonance (high Q on boosts) - Makes the EQ obvious and artificial.\n\n❌ Forgetting A/B - You\'ll convince yourself the extreme is right because you got used to it.\n\n❌ Confusing presence with loudness - EQ doesn\'t increase level. Use makeup gain for that.\n\n❌ Using the same EQ settings for every source - What works for vocals doesn\'t work for kick drums.'
    },
    {
      type: 'tips',
      title: 'Professional EQ Workflow',
      content: '1. SUBTRACTIVE first: Find problem frequencies and cut them slightly\n2. ADDITIVE second: Only boost if something is genuinely missing\n3. USE NARROW Q for problems (cuts and narrow boosts)\n4. USE WIDE Q for musical shaping (gentle shelves)\n5. AUTOMATE: EQ can change every 8 bars - vocal needs more presence in chorus\n6. A/B CONSTANTLY: Toggle bypass every 10 seconds while making changes\n7. TAKE BREAKS: Ear fatigue is real. Step away for 10 minutes\n8. REFERENCE: Compare your mix to commercial songs. A/B your track vs theirs.'
    },
    {
      type: 'formula',
      title: 'Understanding dB and Frequency',
      content: 'DECIBELS (dB):\n+6 dB = approximately 2x louder\n+12 dB = approximately 4x louder\n-6 dB = approximately half as loud\nLogarithmic scale: +20 dB ≠ 2x louder than +10 dB\n\nFREQUENCY RANGES:\n20-60 Hz = Sub bass (felt, rarely heard on small speakers)\n60-250 Hz = Bass weight and body\n250 Hz-2 kHz = Muddiness, warmth, body\n2-6 kHz = Presence, clarity, nasal (too much = harsh)\n6-20 kHz = Brilliance, air, sibilance\n\nMost problems live in 200-5000 Hz. Start looking there first.'
    },
    {
      type: 'diagram',
      title: 'Frequency Spectrum Visualization',
      content: 'The full audio spectrum from 20 Hz to 20 kHz:\n\nSUB BASS    BASS    MID BASS    MIDS    PRESENCE    BRILLIANCE    AIR\n20 Hz------125------250-------1k-------2k-----------6k---------20k Hz\n|__________|________|_________|______|_____________|__________|_____|\n   KICK      BASS    WARMTH    VOCAL    CLARITY      SIZZLE   ULTRA HI\n\nMost music energy lives between 125 Hz and 6 kHz.\nProblem frequencies usually stick out - they\'re too loud relative to neighbors.'
    },
    {
      type: 'tips',
      title: 'Advanced: Q Value Explained',
      content: 'Q (Quality Factor) controls the WIDTH of the EQ peak/cut:\n\nQ = 0.3 (very wide): Gentle shelf, affects 2+ octaves\nQ = 1.0 (medium): Affects about 1 octave, musical\nQ = 4.0 (narrow): Surgical fix, affects ~1/3 octave  \nQ = 8.0+ (very narrow): Laser-focused cut, only affects problem frequency\n\nUSE WIDE Q (0.5-1.0) for musical shaping: gentle curves, natural EQ\nUSE NARROW Q (4.0+) for problem-solving: cutting feedback, fixing harshness'
    },
    {
      type: 'tips',
      title: 'EQ on Different Sources',
      content: 'DRUMS: Cut mud (300 Hz), boost presence (4 kHz), brighten (8 kHz)\nBASS: Keep 60-200 Hz tight, slight presence boost around 2 kHz\nVOCAL: Slight low-cut (80 Hz), mid-scoop or mid-peak depending on voice, air (10 kHz)\nSYNTH: Depends on patch - usually additive EQ to blend with other elements\nMASTER BUS: Subtle - like -1 dB at 1 kHz to reduce midrange, +1 dB at 8 kHz for air'
    }
  ],

  compressor: [
    {
      type: 'lead',
      title: 'What is a Compressor?',
      content: 'A compressor automatically turns DOWN loud parts and optionally turns UP the whole signal. Result: quiet parts sound louder, loud parts don\'t poke out. Used on vocals to keep them present, on drums to add punch, on a mix bus to glue everything together. Most important tool in mixing after EQ.'
    },
    {
      type: 'concept',
      title: 'How Compression Works',
      content: 'Three steps:\n1. DETECT: Listen to incoming signal. If it goes above THRESHOLD, compression kicks in.\n2. REDUCE: Turn down the signal by a ratio. 4:1 means 4 dB above threshold becomes 1 dB above.\n3. MAKEUP: Turn everything back up so the quiet parts stay audible.\n\nResult: Dynamic range is reduced. Everything feels more even and controlled.'
    },
    {
      type: 'parameters',
      title: 'Understanding Threshold & Ratio',
      content: 'THRESHOLD (-60 to 0 dB):\nThe level above which compression engages.\n-60 dB = almost everything gets compressed\n-20 dB = only loud peaks get compressed\n-12 dB = moderate compression\n\nRATIO (1:1 to 20:1):\n1:1 = Off (1 dB in = 1 dB out)\n2:1 = Mild (2 dB in = 1 dB out). Very natural.\n4:1 = Medium (4 dB in = 1 dB out). Standard vocal compression.\n10:1 = Aggressive (10 dB in = 1 dB out). Limiter territory.\n∞:1 = Brick wall limiter (anything above threshold = stays at threshold).\n\nSTART: Set threshold -20 dB, ratio 4:1. Adjust both until it feels right.'
    },
    {
      type: 'parameters',
      title: 'Attack & Release: The Time Domain',
      content: 'ATTACK (0-1000 ms): How FAST the compressor engages.\nFast attack (5-20 ms): Grabs transients quickly, tames peaks, kills punch\nSlow attack (100-300 ms): Lets initial hit through, adds punch\n\nRELEASE (10-1000 ms): How FAST the compressor lets go after signal drops.\nFast release (50-100 ms): Tracks peaks closely, can sound pumpy\nSlow release (200-500 ms): Smooth, musical, less obvious\n\nPRO TIP: Fast attack = control. Slow attack = punch. Match your song.'
    },
    {
      type: 'parameters',
      title: 'Knee & Makeup: The Shape & Level',
      content: 'KNEE (0-40 dB): How GRADUALLY compression engages.\nHard knee (0 dB): Compression starts immediately at threshold. Obvious, aggressive.\nSoft knee (6-12 dB): Compression gradually increases around threshold. Smooth, transparent.\n\nMAKEUP (0-4x): How much to amplify after compression.\nRule: A/B compressed vs uncompressed. Makeup gain should match loudness.\nIf compressed is quiet, increase makeup until A/B sounds similarly loud.\nThis reveals if compression is actually helping tone or just making it louder.'
    },
    {
      type: 'example',
      title: 'Vocal Compression: Keeping Words Present',
      content: 'Problem: Vocal level bounces all over - some words quiet, some loud. Gets lost in mix.\n\nSETTINGS:\nThreshold: -22 dB\nRatio: 3:1\nAttack: 5 ms (fast, grabs louder words)\nRelease: 100-200 ms (smooth)\nKnee: 12 dB (soft, transparent)\nMakeup: 1.5x (to match uncompressed level)\n\nRESULT: All words sit at same perceived level. Vocal sits in the mix naturally without riding.'
    },
    {
      type: 'example',
      title: 'Drum Compression: Adding Punch',
      content: 'Problem: Kick and snare sound weak, don\'t punch through.\n\nSETTINGS:\nThreshold: -18 dB\nRatio: 4:1\nAttack: 20-50 ms (slow, lets transient through for punch)\nRelease: 100-150 ms (matches drum timing)\nKnee: 4 dB (slightly aggressive)\nMakeup: 1.6x (to compensate for reduction)\n\nRESULT: Transient pierces through, then body is controlled. More presence without just turning up volume.'
    },
    {
      type: 'example',
      title: 'Bus Compression: Glue Everything Together',
      content: 'Problem: Individual tracks sit fine, but mix sounds separated, lacking cohesion.\n\nSETTINGS:\nThreshold: -12 dB\nRatio: 2:1 (gentle, barely noticeable)\nAttack: 30-50 ms\nRelease: 300-500 ms (slow, smooth)\nKnee: 12 dB (soft, transparent)\nMakeup: 1.2x (subtle)\n\nRESULT: Mix glues together invisibly. No single element pokes out. Professional sound.\nA/B every few seconds - should be almost unnoticeable.'
    },
    {
      type: 'listening',
      title: 'What to Listen For in Compression',
      content: 'Set threshold to -30 dB, ratio 10:1. You\'ll see the gain reduction meter pumping. This is compression in action.\n\nNow SLOWLY raise threshold until gain reduction = 6 dB on loud parts. This is audible but not extreme.\n\nToggle A/B: Compressed should feel MORE EVEN, not just louder. If it just sounds louder, it\'s not compression - it\'s makeup gain.\n\nTurn attack very fast (1 ms): Notice how it kills punch? That\'s what fast attack does.\nThen slow to 100 ms: Notice the punch comes back? That\'s the transient getting through.\n\nThis is where compression magic lives - the transient.'
    },
    {
      type: 'mistakes',
      title: 'Compression Mistakes',
      content: '❌ Too much ratio too fast: Sounds squashed and unnatural\n❌ Not A/B matching loudness: Makeup gain fooled you - it\'s just louder, not better\n❌ Attacking too fast on drums: Kills the punch you wanted\n❌ Release too fast: Creates pumping effect that\'s obvious and bad\n❌ Threshold too high: Only ultra-loud peaks compress, most signal unaffected\n❌ Over-compressing a whole mix: Kills dynamics, sounds dead\n❌ Forgetting that compression changes with loudness: A mix at -3 dB will compress differently'
    },
    {
      type: 'tips',
      title: 'Professional Compression Workflow',
      content: '1. START SLOW: 2-3 dB of gain reduction on peaks is usually enough\n2. A/B CONSTANTLY: Every 5 seconds toggle bypass\n3. MATCH LOUDNESS: Use makeup gain so A/B sounds the same volume\n4. TEST AT REFERENCE LEVEL: Compression feels different at -18 dBFS vs 0 dBFS\n5. LISTEN FOR MUSICALITY: Does release feel right with the tempo?\n6. USE SLOW ATTACK FOR PUNCH: Most sources benefit from 50-100 ms attack\n7. LAYER COMPRESSION: Better to use 2 mild compressors than 1 aggressive one\n8. AUTOMATE: Threshold and makeup can change per section'
    },
    {
      type: 'formula',
      title: 'Calculating Compression Output',
      content: 'COMPRESSION MATH:\nInput level: -10 dB\nThreshold: -20 dB\nInput is 10 dB above threshold\nRatio: 4:1\nOutput: 10 dB ÷ 4 = 2.5 dB above threshold\nFinal output: -20 dB + 2.5 dB = -17.5 dB\n\nSo -10 dB input becomes -17.5 dB output = 7.5 dB of GAIN REDUCTION\n\nThen makeup gain (1.5x = +3.5 dB) brings it back to -14 dB output.'
    },
    {
      type: 'tips',
      title: 'Compressor Types & Personalities',
      content: 'SOFTWARE COMPRESSOR (what this is):\nNeeds no warmup, instant response\nVery clean, transparent\nPerfect for learning and experimenting\n\nVINTAGE COMPRESSOR (like SSL, API):\nAdds harmonic coloration, slight saturation\nSmooth, musicalsounding\n\nTUBE COMPRESSOR:\nAdds subtle warmth\nFast, aggressive character\nGreat on vocals and bass\n\nOPTICAL COMPRESSOR:\nVery smooth, slow\nGreat for long legato passages\nPerfect on vocals and bass\n\nDYNAMIC RANGE COMPRESSOR vs LIMITING:\nCompressor: Reduces dynamic range, controlled ratio\nLimiter: 10:1+ ratio, protective ceiling, stops peaks'
    },
    {
      type: 'diagram',
      title: 'Before & After Compression Visualization',
      content: 'BEFORE COMPRESSION (wide dynamic range):\n        |_____|  <- Some peaks super loud\n    ___|     |___  <- Some valleys quiet\n  _|           |_  <- 20+ dB range\n\nAFTER COMPRESSION (narrower dynamic range):\n       |---|      <- Peaks tamed\n    __|   |__     <- Valleys boosted\n  __|       |__   <- Maybe 10 dB range\n\nAUDION FEELS MORE CONTROLLED AND EVEN\nBUT TRANSIENTS STILL VISIBLE (good attack setting)'
    }
  ],

  saturator: [
    {
      type: 'lead',
      title: 'What is Saturation?',
      content: 'Saturation adds warmth, character, and harmonic richness. It gently distorts audio by adding overtones. Use it on almost everything for cohesion. Subtle saturation on every channel = pro sound. Extreme saturation = aggressive distortion effect.'
    },
    {
      type: 'concept',
      title: 'How Saturation Works: Waveshaping',
      content: 'Normal audio: Clean, pure sine wave\nSaturated audio: Wave gets bent/shaped at peaks, creating harmonics\n\nThe bending adds NEW FREQUENCIES above the original. These are harmonics - musical overtones that make sound richer.\n\nSOFT saturation: Gentle bending, smooth harmonics, warmth\nHARD saturation: Aggressive clipping, harsh harmonics, distortion\n\nTUBE saturation: Smooth bending, natural-sounding\nDIGITAL saturation: Crunchy bit reduction, lo-fi character'
    },
    {
      type: 'parameters',
      title: 'Drive: How Much to Saturate',
      content: 'DRIVE (0 to 1.0):\n0.0 = No saturation, clean signal\n0.1-0.2 = Subtle warmth (recommended starting point)\n0.3-0.5 = Obvious coloration, noticeable presence\n0.7-0.9 = Heavy distortion, obvious effect\n1.0+ = Maximum effect, very aggressive\n\nSTART: 0.1-0.2 drive on vocals, bass, keys. Increases harmonics subtly.\n\nTYPE (soft/hard/tube/digital):\nSOFT: Warm, smooth, forgiving - best for vocals\nHARD: Aggressive, clipping, loud - best for drums\nTUBE: Rich harmonics, musical - best for everything\nDIGITAL: Crunchy, lo-fi, retro - best for character'
    },
    {
      type: 'example',
      title: 'Vocal Saturation: Adding Warmth',
      content: 'Problem: Vocal sounds thin, cold, uninviting.\n\nSOLUTION:\n1. Set drive to 0.15, soft type\n2. Listen - vocal now has subtle warmth\n3. Gradually increase to 0.3-0.4 if you want more character\n4. A/B: Original was thin, saturated is full and present\n\nRESULT: Vocal sits in mix naturally without sounding processed.'
    },
    {
      type: 'example',
      title: 'Bass Saturation: Adding Weight',
      content: 'Problem: Bass sounds weak, disappears in headphones, feels thin.\n\nSOLUTION:\n1. Set drive to 0.2, tube type\n2. Low frequencies get richer harmonics\n3. Bass now has weight and presence\n4. If too much, reduce to 0.1-0.15\n\nRESULT: Bass harmonics now sit in midrange, giving the illusion of more bass on small speakers.'
    },
    {
      type: 'example',
      title: 'Full Mix Saturation: Adding Glue',
      content: 'Problem: Mix sounds separated, sterile, lacking cohesion.\n\nSOLUTION:\n1. Add subtle saturation to master bus: drive 0.05-0.1\n2. This adds 1-2% harmonic coloration\n3. Mix now feels more organic and musical\n4. Professional mixing trick: almost every major studio uses gentle saturation on the mix bus\n\nRESULT: Mix glues, sounds less digital, more alive.'
    },
    {
      type: 'listening',
      title: 'What to Listen For in Saturation',
      content: 'Set drive to 0: Listen to the pure signal\nNow slowly increase drive to 0.3, keep listening\nYou\'ll hear:\n1. First: Subtle warmth, more presence\n2. Then: Obvious coloration, character, personality\n3. Finally: Distortion, that\'s too much\n\nA/B at 0.1-0.2: Should be almost unnoticeable but makes you say "oh, that sounds better"\n\nDifferent types at same drive:\nSOFT vs HARD: Soft sounds musical, hard sounds aggressive\nTUBE vs DIGITAL: Tube sounds vintage, digital sounds retro/8-bit'
    },
    {
      type: 'mistakes',
      title: 'Saturation Mistakes',
      content: '❌ Too much drive = sounds distorted and cheap\n❌ Using hard saturation on vocals = sounds brittle\n❌ Forgetting A/B = you convince yourself the extreme is right\n❌ Using same saturation everywhere = loses subtlety and character\n❌ Not considering mix context = saturation that sounds good solo sounds bad in mix\n❌ Saturating already compressed signal = compounds coloration issues'
    },
    {
      type: 'tips',
      title: 'Professional Saturation Workflow',
      content: '1. USE SUBTLY: 0.05-0.2 drive is usually enough\n2. A/B CONSTANTLY: Toggle to hear the difference\n3. USE SOFT TYPE by default: Hard type is for effects\n4. LAYER SATURATION: Better to add 0.05 on every channel than 0.3 on a few\n5. MIX IN CONTEXT: Solo sounds different than in the mix\n6. MATCH OUTPUT: Use gain knob so A/B sounds the same loudness\n7. AUTOMATE: Can change per section for dynamic effect\n8. UNDERSTAND HARMONIC SERIES: 2x, 3x, 4x the fundamental frequency are added'
    },
    {
      type: 'formula',
      title: 'Harmonic Series and Overtones',
      content: 'When you saturate a 100 Hz sine wave, you add harmonics at:\n100 Hz (fundamental)\n200 Hz (2nd harmonic, octave)\n300 Hz (3rd harmonic, perfect fifth above 200)\n400 Hz (4th harmonic)\n500 Hz (5th harmonic)\n\nThese are MUSICAL - they form intervals. That\'s why saturation sounds good, not just loud.'
    },
    {
      type: 'tips',
      title: 'Saturation for Different Sources',
      content: 'VOCALS: Soft type, 0.1-0.2 drive - adds presence and warmth\nBASS: Tube type, 0.15-0.3 drive - adds harmonics in midrange\nDRUMS: Hard type, 0.2-0.4 drive - adds aggression and punch\nKEYS/SYNTH: Soft type, 0.05-0.15 - adds organic character\nMASTER BUS: Soft type, 0.02-0.05 - adds cohesion invisibly'
    },
    {
      type: 'diagram',
      title: 'Soft vs Hard Saturation Waveforms',
      content: 'CLEAN (no saturation):\n    /\\\\        /\\\\\nWave is smooth sine curve\n\nSOFT SATURATION:\n   /|\\\\      /|\\\\\nPeaks gently rounded, smooth distortion\n\nHARD SATURATION:\n   /-\\\\-    /-\\\\-\nPeaks clipped flat, aggressive limiting\n\nSOFT = WARM, MUSICAL\nHARD = CRUNCHY, DISTORTED'
    }
  ],

  reverb: [
    {
      type: 'lead',
      title: 'What is Reverb?',
      content: 'Reverb simulates a physical space - a room, hall, cathedral, or plate. It adds depth and ambience. Use it to make vocals feel present, to add space around drums, or to create lush pads. Too much reverb = amateur (sounds like a bathroom). Right amount = professional and spacious.'
    },
    {
      type: 'concept',
      title: 'How Reverb Works: Simulating Reflections',
      content: 'In a real room:\n1. Sound bounces off walls, ceiling, floor\n2. Early reflections: First few bounces, tell your brain the room size\n3. Late reflections: Many bounces, create the tail\n4. Eventually sound dies away\n\nReverb algorithms recreate this with delay networks. We\'re using convolution: pass the signal through a recorded "impulse response" of a real space.\n\nRESULT: Your audio sounds like it\'s in that space.'
    },
    {
      type: 'parameters',
      title: 'Room Size & Decay: Creating Space',
      content: 'ROOM SIZE (20-100%):\nSmall = tight room, short reflections\nMedium = standard room, natural ambience\nLarge = cathedral, huge space\n\nDECAY (0.5-5 seconds):\nHow long the reverb tail lasts\nShort (0.5-1s) = small rooms, drums\nMedium (1.5-2s) = vocals, natural\nLong (3-5s) = lush pads, spacey\n\nPRE-DELAY (0-100 ms):\nTime before reverb tail starts\nSmall (0-10 ms) = intimate\nMedium (20-50 ms) = clear separation\nLarge (100+ ms) = obvious effect\n\nBEST PRACTICE: Pre-delay 20-30 ms keeps source clear before reflections'
    },
    {
      type: 'example',
      title: 'Vocal Reverb: Adding Presence',
      content: 'Problem: Vocal sounds too close and dry, needs space.\n\nSETTINGS:\nWet level: 25-35%\nRoom size: 60%\nDecay: 1.5-2 seconds\nPre-delay: 20 ms\n\nRESULT: Vocal feels like it\'s in a room, not in your face. Presence without being too wet.'
    },
    {
      type: 'example',
      title: 'Drum Reverb: Adding Dimension',
      content: 'Problem: Drums sound flat and stuck to front of mix.\n\nSETTINGS:\nWet level: 10-20%\nRoom size: 40%\nDecay: 1 second\nPre-delay: 15 ms\n\nRESULT: Drums now have depth. Kick and snare feel like they\'re in space. Subtle ambience.'
    },
    {
      type: 'example',
      title: 'Lush Pad Reverb: Creating Atmosphere',
      content: 'Problem: Synth pad needs to sound lush and spacious.\n\nSETTINGS:\nWet level: 40-50%\nRoom size: 90%\nDecay: 3-4 seconds\nPre-delay: 10 ms\n\nRESULT: Pad now floats in huge space. Ethereal and beautiful.'
    },
    {
      type: 'listening',
      title: 'What to Listen For in Reverb',
      content: 'Set wet level to 100%: You\'re hearing ONLY reverb. Listen to the tail.\nNow reduce to 30%: Dry signal + reverb blend. Much more musical.\n\nTurn pre-delay to 100 ms: Huge delay before reverb kicks in. Obvious and wrong.\nThen reduce to 20 ms: Source is clear, reverb is separated. Natural.\n\nIncrease decay to 5 seconds: Long, spacious, beautiful.\nReduce to 0.5 seconds: Tight, controlled, almost no ambience.\n\nA/B constantly: Reverb should enhance, not dominate.'
    },
    {
      type: 'mistakes',
      title: 'Reverb Mistakes',
      content: '❌ Too much wet level: Sounds like source is in a bathroom\n❌ Pre-delay too long: Obvious echo effect, not ambience\n❌ Decay too long: Tail becomes mud that clouds the mix\n❌ Same reverb on everything: Kills separation and definition\n❌ Using reverb to fix level: Should use volume, not effects\n❌ Not A/B matching: Reverb fool you - it sounds different but maybe worse\n❌ Forgetting that reverb hides: Too much reverb hides detail and issues'
    },
    {
      type: 'tips',
      title: 'Professional Reverb Workflow',
      content: '1. LESS IS MORE: 10-30% wet is usually right\n2. USE PRE-DELAY: 20-30 ms keeps source clear\n3. MATCH DECAY TO TEMPO: If tempo is slow, reverb can be longer\n4. USE DIFFERENT REVERBS: Don\'t send everything to same reverb\n5. AUTOMATE WET LEVEL: Can increase in chorus for spaciousness\n6. HIGH-PASS THE REVERB: Reduce low-end in reverb send to prevent mud\n7. LAYER REVERBS: Can use short + long reverb together\n8. LISTEN IN MONO: Reverb should work in mono, not just stereo'
    },
    {
      type: 'formula',
      title: 'Reverb Time Calculation',
      content: 'Reverb time = how long it takes for sound to decay 60 dB\n\nSMALL ROOM: 0.5-1 second\nNORMAL ROOM: 1-1.5 seconds\nLARGE HALL: 2-3 seconds\nCATHEDRAL: 4-8 seconds\n\nPRO TIP: Set reverb decay to 60 BPM ÷ 4 beats\nIf song is 120 BPM = 2 beats per second\n1 bar = 4 beats = 2 seconds = good reverb time'
    },
    {
      type: 'tips',
      title: 'Using Reverb as an Effect vs Ambience',
      content: 'AMBIENCE (subtle, present):\nWet: 15-25%\nDecay: 1-2 seconds\nUse: On almost all sources for cohesion\nGoal: Add air without sounding reverby\n\nEFFECT (obvious, dramatic):\nWet: 40-60%\nDecay: 2-4 seconds\nUse: On specific sources for impact\nGoal: Create obvious space, ethereal pads, spacey vocals\n\nMOST MIXES: Use 80% ambience (subtle) + 20% effect (obvious) reverbs'
    }
  ],

  delay: [
    {
      type: 'lead',
      title: 'What is Delay?',
      content: 'Delay repeats audio after a specific time interval. Creates rhythmic echoes and spatial depth. When synced to BPM, delay feels musical. Unsync delays sound sloppy. Use 1/4 or 1/8 note delays for most sources.'
    },
    {
      type: 'concept',
      title: 'How Delay Works: Repeat with Decay',
      content: 'Delay has 4 steps:\n1. Hear original sound\n2. Delay time passes\n3. Hear first repeat (echo 1)\n4. Feedback determines if there are more repeats\n\nFEEDBACK controls how many repeats:\n0% = No repeats, just 1 echo\n30% = 3-4 repeats before fading\n70% = 10+ repeats, long tail\n100% = Repeats forever (infinite)\n\nTIME is synced to song tempo so repeats land on beats.'
    },
    {
      type: 'parameters',
      title: 'Time: Syncing to BPM',
      content: 'TIME (milliseconds or note length):\n1/16 note = fastest, slapback feel\n1/8 note = medium, typical repeats\n1/4 note = slower, slapback doubling\n1/2 note = very slow, space\n\nCALCULATION:\nBPM = 120\n1 beat = 60/120 = 0.5 seconds = 500 ms\n1/4 note = 500 ms\n1/8 note = 250 ms\n1/16 note = 125 ms\n\nALWAYS SYNC to BPM. Unsync delays sound wrong.\n\nFEEDBACK: 20-50% typical\nPING-PONG: Alternate left/right channels for width'
    },
    {
      type: 'example',
      title: 'Slapback Delay: Doubling Lead Vocal',
      content: 'Problem: Vocal needs width and doubling effect.\n\nSETTINGS:\nTime: 1/4 note (500 ms at 120 BPM)\nFeedback: 0% (just one repeat)\nWet: 30-40%\nMix: Dry + delayed\n\nRESULT: Vocal has a doubling effect, sounds wider. Classic Fifties vocal effect.'
    },
    {
      type: 'example',
      title: 'Ping-Pong Delay: Spacious Synth',
      content: 'Problem: Synth pad needs space and movement.\n\nSETTINGS:\nTime: 1/8 note (250 ms at 120 BPM)\nFeedback: 40-50%\nPing-pong: ON (bounces left to right)\nWet: 35-45%\n\nRESULT: Synth repeats bounce across stereo field. Spacious and moving.'
    },
    {
      type: 'example',
      title: 'Long Delay: Space & Depth',
      content: 'Problem: Need huge space and echoes.\n\nSETTINGS:\nTime: 1/2 note (1 second at 120 BPM)\nFeedback: 60%\nWet: 20-30%\nMix: Subtle delay with long tail\n\nRESULT: Long echoes repeat, creating depth and space. Sounds like a huge room.'
    },
    {
      type: 'listening',
      title: 'What to Listen For in Delay',
      content: 'Set feedback to 0%: Just one repeat, then silence. You hear the delay clearly.\nThen increase to 30%: More repeats, fades out. More musical.\nThen to 70%: Lots of repeats, long tail. Can be muddy.\n\nSet time to 1/4 note: You hear repeats land on beat 2. Musical.\nThen set time to 1/3 note: Repeats land off-beat. Sounds weird and sloppy.\n\nToggle ping-pong: Can hear repeat bouncing left to right. Fun effect.\nThen turn off: Sound is more centered.'
    },
    {
      type: 'mistakes',
      title: 'Delay Mistakes',
      content: '❌ Time not synced to BPM: Sounds sloppy and amateurish\n❌ Too much feedback: Repeats become mud\n❌ Too much wet level: Original gets buried in echoes\n❌ Using same delay for everything: Loses separation\n❌ Long delays on fast elements: Can cloud the mix\n❌ Forgetting about phase: Some delays can cause comb filtering\n❌ Not A/B matching: Delay can fool your ear about clarity'
    },
    {
      type: 'tips',
      title: 'Professional Delay Workflow',
      content: '1. ALWAYS SYNC to BPM: Use 1/4, 1/8, or 1/16 note lengths\n2. START at 0% FEEDBACK: Add only if you need repeats\n3. WET LEVEL 10-30%: Delay should enhance, not dominate\n4. USE HIGH-PASS FILTER: Keep low end out of delays to avoid mud\n5. AUTOMATE TIME: Can change delay time per section\n6. LAYER DELAYS: Short + long delays together create space\n7. PING-PONG FOR WIDTH: Great for stereo pads and leads\n8. DOTTED EIGHTH: 1.5x note length creates interesting timing'
    },
    {
      type: 'formula',
      title: 'Delay Time Calculator',
      content: 'FORMULA: (60,000 ÷ BPM) ÷ Note Length\n\nBPM 120:\n(60,000 ÷ 120) = 500 ms per beat\n\n1/4 note = 500 ms\n1/8 note = 250 ms\n1/16 note = 125 ms\n1/2 note = 1000 ms\nDotted 1/8 = 375 ms (1.5x 1/8)\n\nTRIPLET 1/8 = 333 ms (1/3 of 1/4)\n\nPRO TIP: Use dotted notes for interesting rhythm (not straight 1/4)'
    }
  ],

  filter: [
    {
      type: 'lead',
      title: 'What is an Auto Filter?',
      content: 'A filter sweeps its cutoff frequency based on an LFO (oscillator) or envelope (dynamics). Creates movement and modulation. Most common: LFO modulation creates wobbling basses, wa-wa guitars, and pulsing pads.'
    },
    {
      type: 'concept',
      title: 'How Auto Filter Works',
      content: 'Normal filter: Cutoff stays fixed\nAuto filter: Cutoff frequency moves automatically\n\nTwo modulation options:\nLFO: Oscillator modulates cutoff, creates rhythmic sweep\nENVELOPE FOLLOW: Signal dynamics control cutoff, creates dynamic response\n\nRESULT: Filter frequency is constantly changing, creating movement.'
    },
    {
      type: 'parameters',
      title: 'Cutoff, Resonance, LFO, Envelope',
      content: 'CUTOFF (Hz): Center frequency of filter\n250 Hz = Dull, bassy\n1000 Hz = Mids, bright\n6000 Hz = Treble, thin\n\nRESONANCE (0-10): Peak at cutoff\n0 = Flat, no peak\n5 = Noticeable peak, musical\n10 = Screech, extreme peak\n\nLFO RATE (Hz): Speed of modulation\n0.5 Hz = Slow, spacious\n1 Hz = Medium, standard\n5 Hz = Fast, frantic\n\nLFO DEPTH: How much cutoff moves\n0 = No modulation\n500 Hz = Huge sweep\n\nENVELOPE FOLLOW: Signal dynamics trigger cutoff movement'
    },
    {
      type: 'example',
      title: 'Wobbling Bass: LFO Modulation',
      content: 'Problem: Bass sounds static, needs movement.\n\nSETTINGS:\nCutoff: 500 Hz\nResonance: 6 (noticeable peak)\nLFO Rate: 1 Hz\nLFO Depth: 300 Hz (big sweep)\nFilter type: Low-pass (only lows pass through)\n\nRESULT: Bass wobbles in and out. Hypnotic and groovy.'
    },
    {
      type: 'example',
      title: 'Wa-Wa Guitar: Fast LFO',
      content: 'Problem: Guitar needs wa-wa effect.\n\nSETTINGS:\nCutoff: 2000 Hz\nResonance: 8 (high peak)\nLFO Rate: 4 Hz (fast)\nLFO Depth: 1000 Hz (big sweep)\nFilter type: Low-pass\n\nRESULT: Classic wa-wa effect. Sounds like a muted trumpet.'
    },
    {
      type: 'example',
      title: 'Dynamic Sidechain Pump: Envelope Follow',
      content: 'Problem: Need dynamic sidechain effect without dedicated sidechain input.\n\nSETTINGS:\nCutoff: 1000 Hz\nResonance: 4\nEnvelope Follow: ON\nEnvelope sensitivity: 0.7\n\nRESULT: When incoming signal gets loud (drums hit), filter opens up. When quiet, closes down. Creates pumping effect.'
    },
    {
      type: 'listening',
      title: 'What to Listen For',
      content: 'Increase resonance slowly: At 0, sound is dull. At 5, you hear a peak at cutoff. At 10, it screams.\n\nIncrease LFO depth: At 0, no movement. At 200, subtle wobble. At 500, huge sweep.\n\nIncrease LFO rate: At 0.5, slow wobble. At 1, standard. At 5, rapid vibration.\n\nChange filter type from low-pass to high-pass: Completely different character. Low-pass removes highs, high-pass removes lows.'
    },
    {
      type: 'mistakes',
      title: 'Filter Mistakes',
      content: '❌ Resonance too high: Sounds screechy and annoying\n❌ LFO rate too fast: Can sound like glitching\n❌ LFO depth too big: Sound becomes unrecognizable\n❌ Wrong filter type: High-pass might not sound good on bass\n❌ Forgetting modulation is subtle: Most filters work best at depth 10-30%, not 100%\n❌ Using on wrong source: Drums might sound weird, pads need it'
    },
    {
      type: 'tips',
      title: 'Professional Filter Workflow',
      content: '1. START SIMPLE: LFO rate 1 Hz, depth 200 Hz, resonance 4\n2. ADJUST CUTOFF FIRST: Find the center frequency\n3. THEN ADJUST RESONANCE: Add sparkle without screech (usually 3-6)\n4. THEN ADJUST LFO: Depth and rate for movement\n5. MATCH TO TEMPO: LFO rate should relate to song speed\n6. HIGH-PASS FILTER: Better for bright, filter-swept sounds\n7. LOW-PASS FILTER: Better for bassy, filtered sounds\n8. AUTOMATE: Can change cutoff and resonance per section'
    }
  ],

  chorus: [
    {
      type: 'lead',
      title: 'What is Chorus?',
      content: 'Chorus creates width and lush thickness by layering slightly detuned copies of the signal. Makes vocals sound like 3 people, makes keys sound full. Use subtly on almost everything for cohesion.'
    },
    {
      type: 'concept',
      title: 'How Chorus Works: Layered Detuning',
      content: 'Normal signal: Just one voice\nChorus: Original + 2-3 copies pitched slightly different\n\nThe copies are modulated (pitch wobbles slightly), creating motion and width.\n\nRESULT: Sounds like multiple performances playing together.\n\nDifference between similar effects:\nCHORUS: Subtle pitch shift, smooth effect\nFLANGER: Narrower pitch shift, more obvious\nVIBRATO: Just pitch modulation, no volume\nTREMOLO: Just volume modulation, no pitch'
    },
    {
      type: 'parameters',
      title: 'Rate, Depth, Mix, Feedback',
      content: 'RATE (Hz): Speed of modulation\n0.5 Hz = Slow, subtle\n1-2 Hz = Medium, smooth\n5 Hz = Fast, obvious\n\nDEPTH (ms): How much pitch shifts\n2-5 ms = Subtle\n10-15 ms = Obvious\n20+ ms = Out of tune\n\nFEEDBACK: How much modulated signal feeds back\n0% = No feedback\n20-40% = Some repeats\n50%+ = Extreme effect\n\nMIX (wet/dry): Blend of original + chorus\n20-30% = Subtle enhancement\n50% = Obvious effect\n70%+ = Extreme, artificial'
    },
    {
      type: 'example',
      title: 'Vocal Chorus: Width & Lush Sound',
      content: 'Problem: Vocal sounds thin and monophonic.\n\nSETTINGS:\nRate: 1 Hz\nDepth: 8 ms\nFeedback: 25%\nMix: 30%\n\nRESULT: Vocal sounds like 2-3 people singing. Lush and full.'
    },
    {
      type: 'example',
      title: 'Pad Chorus: Ethereal & Spacious',
      content: "Problem: Synth pad needs lush, ethereal quality.\n\nSETTINGS:\nRate: 0.7 Hz (slow)\nDepth: 12 ms\nFeedback: 30%\nMix: 40%\n\nRESULT: Pad sounds huge and spacious. Classic '80s synth sound."
    },
    {
      type: 'listening',
      title: 'What to Listen For in Chorus',
      content: 'Slowly increase depth: At 0, no effect. At 5 ms, subtle. At 15 ms, obviously out of tune. Too much!\n\nIncrease rate: At 0.5, slow wobble. At 2, standard movement. At 5, fast vibration.\n\nIncrease mix: At 0%, you hear original. At 50%, obvious effect. At 100%, only chorus.\n\nCompare to flanger: Chorus is smoother, flanger is more "whooshing"'
    },
    {
      type: 'mistakes',
      title: 'Chorus Mistakes',
      content: '❌ Depth too high: Sounds out of tune, not in a good way\n❌ Rate too fast: Can sound like vibrato/pitch wobble\n❌ Mix too high: Original gets buried\n❌ Feedback too high: Creates weird repeating effect\n❌ Using on things that should be mono: Bass might get weird\n❌ Forgetting that width = less punch: Chorus reduces transient impact'
    },
    {
      type: 'tips',
      title: 'Professional Chorus Workflow',
      content: '1. START SUBTLE: Rate 1 Hz, depth 5-8 ms, mix 20-30%\n2. LISTEN TO MODULATION: Can you hear the wobble? Good.\n3. MATCH TO SONG: Rate around 1-1.5 Hz is usually right\n4. USE ON LUSH SOURCES: Vocals, pads, strings, keys\n5. AVOID ON DRUMS: Can make drums sound weird and wide\n6. LAYER EFFECTS: Can use chorus + reverb together for lush sound\n7. AUTOMATE: Can increase depth/mix in chorus section for more width\n8. GAIN COMPENSATION: Chorus can lower perceived level, use makeup gain'
    }
  ],

  phaser: [
    {
      type: 'lead',
      title: 'What is Phaser?',
      content: 'Phaser is like a subtle, smooth version of flanger. It uses all-pass filters to create a sweeping, "swooshing" effect. More musical than flanger, less obvious than chorus. Creates width and movement.'
    },
    {
      type: 'concept',
      title: 'How Phaser Works: All-Pass Filters',
      content: 'Normal signal: Goes straight through\nPhaser: Signal passes through all-pass filters, each rotates the phase slightly\n\nWhen original and phase-shifted signal combine, they create a comb filter effect.\nThe all-pass filters are modulated (pitch wobbles), so the effect moves.\n\nRESULT: Sweeping, smooth movement, like sound is flying in circles.'
    },
    {
      type: 'parameters',
      title: 'Rate, Depth, Stages, Feedback',
      content: 'RATE (Hz): Speed of sweep\n0.3 Hz = Very slow, subtle\n1 Hz = Medium, standard\n3 Hz = Fast, obvious\n\nDEPTH (0-1): How much effect sweeps\n0.2 = Barely noticeable\n0.5 = Obvious but subtle\n0.8-1.0 = Extreme effect\n\nSTAGES (2-24): Number of all-pass filters\n2-4 = Subtle, smooth\n8-12 = More obvious\n24+ = Extreme, lots of peaks\n\nFEEDBACK: How much output feeds back\n0% = No feedback\n30-50% = Some resonance\n70%+ = Extreme effect'
    },
    {
      type: 'example',
      title: 'Subtle Phaser: Width Without Obvious Effect',
      content: 'Problem: Vocal needs width but shouldn\'t sound processed.\n\nSETTINGS:\nRate: 0.5 Hz\nDepth: 0.3\nStages: 8\nFeedback: 20%\nMix: 20-25%\n\nRESULT: Subtle movement, adds width without sounding like a effect.'
    },
    {
      type: 'example',
      title: 'Obvious Phaser: Spacey Effect',
      content: 'Problem: Need obvious phaser effect for interest.\n\nSETTINGS:\nRate: 1.5 Hz\nDepth: 0.7\nStages: 12\nFeedback: 40%\nMix: 40-50%\n\nRESULT: Classic spacey phaser. Obvious and cool.'
    },
    {
      type: 'listening',
      title: 'What to Listen For',
      content: 'Increase depth slowly: At 0, no effect. At 0.5, obvious. At 1.0, extreme.\n\nIncrease stages: At 2, minimal sweeping. At 8, smoother. At 24, many peaks.\n\nCompare phaser to flanger: Phaser is smoother, flanger is more "whoosh".\nPhaser to chorus: Phaser is more movement-based, chorus is more width-based.\n\nIncrease feedback: Creates resonance peaks that get more obvious.'
    },
    {
      type: 'mistakes',
      title: 'Phaser Mistakes',
      content: '❌ Depth too high: Can sound weird and modulated\n❌ Feedback too high: Creates ringing effect\n❌ Rate wrong for song: Can sound sloppy if not matching tempo\n❌ Mix too high: Original gets buried\n❌ Stages too high: Can become ear-fatiguing\n❌ Using on mono sources: Works best on stereo'
    },
    {
      type: 'tips',
      title: 'Phaser vs Similar Effects',
      content: 'PHASER: Smooth, sweeping, all-pass filters\nFLANGER: More metallic, comb filter effect, more obvious\nCHORUS: Width-based, pitch shift, lush\nVIBRATO: Just pitch modulation, no effect on volume\n\nWHEN TO USE:\nPHASER: Vocals, guitars, anything needing subtle width\nFLANGER: Drums, synths, when you want obvious effect\nCHORUS: Vocals, pads, when you want lush/thick\n\nMOST SUBTLE: Phaser\nMOST OBVIOUS: Flanger\nMOST MUSICAL: Chorus'
    }
  ],

  glue: [
    {
      type: 'lead',
      title: 'What is Glue Compression?',
      content: 'Glue compression is transparent, gentle compression on the mix bus. It "glues" all the elements together invisibly. Most professional mixes use subtle glue compression. Almost unnoticeable, but makes everything sound more cohesive.'
    },
    {
      type: 'concept',
      title: 'How Glue Compression Works',
      content: 'Unlike regular compression, glue comp should be almost invisible.\n\nGoal: 1-3 dB of gain reduction on peaks\nResult: Nothing pokes out, everything feels together\n\nKEY: Soft knee + slow attack + slow release = transparent effect that glues without being obvious.'
    },
    {
      type: 'parameters',
      title: 'Settings for Invisible Glue',
      content: 'THRESHOLD: -12 to -15 dB\nEnough to compress loud peaks but not everything\n\nRATIO: 1.5:1 to 2:1\nGentle, barely noticeable reduction\n\nATTACK: 30-50 ms\nSlow enough to preserve transients\n\nRELEASE: 200-500 ms\nSlow and smooth, musical recovery\n\nKNEE: 12 dB soft\nGraduay engagement, not obvious\n\nMAKEUP: 1.2-1.3x\nSubtle, barely turning up\n\nGAIN REDUCTION TARGET: 1-3 dB on peaks'
    },
    {
      type: 'example',
      title: 'Mix Bus Glue: Professional Cohesion',
      content: 'Problem: Mix sounds separated, individual tracks poke out, lacks cohesion.\n\nSETTINGS:\nThreshold: -12 dB\nRatio: 2:1\nAttack: 40 ms\nRelease: 300 ms\nKnee: 12 dB\nMakeup: 1.2x\n\nRESULT: Mix now glues together. No single element pokes out. Professional sound.'
    },
    {
      type: 'listening',
      title: 'What to Listen For: Subtlety is Key',
      content: 'Toggle A/B and ALMOST can\'t hear the difference. That\'s the point.\n\nWatch the gain reduction meter: Should barely move, max 2-3 dB on peaks.\n\nCompare to regular compressor: Glue should be WAY subtler. It\'s barely there.\n\nListen at low volume: Glue becomes obvious at quiet playback levels. Best to set it at -18 dBFS.\n\nThe magic: When you remove glue comp, mix suddenly sounds separated and amateurish.'
    },
    {
      type: 'mistakes',
      title: 'Glue Compression Mistakes',
      content: '❌ Ratio too high: Sounds squashed, not glued\n❌ Attack too fast: Kills transients, loses punch\n❌ Threshold too low: Compresses everything, not just peaks\n❌ Too much makeup gain: Fooled you - it\'s just louder\n❌ Release too fast: Creates obvious pumping\n❌ Using it alone: Glue is subtle, might need gentle EQ too\n❌ Setting it too loud: Glue is meant for -18 dBFS reference level'
    },
    {
      type: 'tips',
      title: 'Professional Glue Compression Workflow',
      content: '1. SET AT REFERENCE: -18 dBFS, not 0 dBFS\n2. AIM FOR 1-3 dB REDUCTION: Watch the meter\n3. A/B EVERY 10 SECONDS: Should barely hear difference\n4. SLOW ATTACK/RELEASE: Let transients through\n5. SOFT KNEE: Gentle engagement\n6. USE MAKEUP GAIN: To match uncompressed level\n7. DON\'T OVER-THINK: Should take 30 seconds to set, not 30 minutes\n8. COMPARE TO REFERENCE MIXES: Listen to pro mixes with/without glue comp'
    },
    {
      type: 'formula',
      title: 'Glue Compression Settings Template',
      content: 'STARTING POINT (almost always works):\nThreshold: -12 dB\nRatio: 2:1\nAttack: 30 ms\nRelease: 250 ms\nKnee: 12 dB\nMakeup: 1.25x\n\nThen A/B and adjust if needed:\n- If too obvious: Slower attack, lower ratio\n- If not obvious enough: Faster attack, higher ratio\n- If loses punch: Slower attack\n- If sounds pumpy: Slower release\n\nGOAL: 1-3 dB gain reduction, barely noticeable effect'
    }
  ]
};

// Slug aliases — devices.ts uses different keys than the explainer map
const SLUG_ALIAS: Record<string, string> = {
  "auto-filter": "filter",
  "glue-compressor": "glue",
  "operator": "operator",
  "wavetable": "wavetable",
};

export const getDeviceExplainer = (deviceId: string) => {
  const key = SLUG_ALIAS[deviceId] ?? deviceId;
  return DEVICE_EXPLAINERS[key] || [];
};

export const getAllDeviceIds = () => Object.keys(DEVICE_EXPLAINERS);
