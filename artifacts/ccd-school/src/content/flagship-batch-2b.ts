import type { LessonScreen } from "./types";

/**
 * Batch 2, part B: pitch and scales (notes-and-octaves to pentatonic-scales).
 * Same shape as batch 1. No em dashes in copy.
 */
export const FLAGSHIP_BATCH_2B: Record<string, LessonScreen[]> = {
  "notes-and-octaves": [
    { kind: "hook", emoji: "🎹", headline: "Twelve notes, forever", subtext: "Every melody you will ever write is built from the same twelve." },
    { kind: "concept", title: "The twelve notes", body: "Western music uses twelve notes: C, C sharp, D, D sharp, E, F, F sharp, G, G sharp, A, A sharp, B. After B the pattern starts over at C, one octave higher. Each step is a semitone.", keyFact: "12 semitones make one octave.", visual: "piano" },
    { kind: "interact", sim: "note-explorer", prompt: "Tap the keys. Hear each semitone step up." },
    { kind: "concept", title: "Black keys have two names", body: "C sharp and D flat are the same key, called by two names. There is no black key between E and F or between B and C, because those pairs are already one semitone apart.", keyFact: "E to F and B to C are single semitones." },
    { kind: "quiz", q: "How many semitones from C up to G?", options: ["5", "6", "7", "8"], answer: 2, explain: "Counting each key including the black ones: C sharp 1, D 2, D sharp 3, E 4, F 5, F sharp 6, G 7. That distance is a perfect fifth.", hint: "Count every key, black ones too." },
    { kind: "concept", title: "Octaves and names", body: "The same note an octave up has double the frequency, so A4 is 440 Hz and A5 is 880 Hz. MIDI numbers each note: 60 is middle C and 69 is A4. Live labels middle C as C3, not C4.", keyFact: "In Live, middle C is C3." },
    { kind: "type-answer", q: "In Live's piano roll, what is the name of middle C (MIDI note 60)? Write the note name and number.", acceptableAnswers: ["C3", "c3"], explain: "Live labels MIDI note 60 as C3. Many other programs call it C4, so octave numbers can differ between DAWs.", hint: "Live's naming is one lower than most." },
    { kind: "quiz", q: "A Drum Rack's first pad is labelled C1 in Live. If you copy a drum clip into another DAW that calls the same note C2, what will happen?", options: ["Nothing, notes are universal", "It still plays the same pad, only the label differs", "It plays a different pad", "It plays an octave higher"], answer: 1, explain: "The MIDI note number, 36 here, is what triggers the pad. Different programs label octaves differently, but the number is the same.", hint: "Labels versus numbers." },
    { kind: "quiz", q: "You write a bass part and it sounds muddy. You move the whole pattern up one octave and it clears. What changed in frequency?", options: ["It doubled", "It halved", "It stayed the same", "It tripled"], answer: 0, explain: "One octave up doubles every note's frequency. Low octaves crowd each other, so moving up often cleans a muddy part.", hint: "Octave up means times two." },
    { kind: "quiz", q: "From the earlier lessons: what is the frequency of the note one octave above 220 Hz?", options: ["221 Hz", "330 Hz", "440 Hz", "660 Hz"], answer: 2, explain: "One octave up is double, so 220 times 2 is 440 Hz." },
    { kind: "summary", learned: ["12 semitones make an octave", "Octave up doubles the frequency", "Live calls middle C3, MIDI note 60"] },
  ],

  "major-scale": [
    { kind: "hook", emoji: "🌞", headline: "A recipe, not a list of notes", subtext: "Learn one pattern and you can build the major scale from any note." },
    { kind: "concept", title: "Whole and half steps", body: "A whole step is two semitones and a half step is one. The major scale is whole, whole, half, whole, whole, whole, half. Starting from any note and following the pattern gives that key's major scale.", keyFact: "W W H W W W H.", visual: "scale-steps" },
    { kind: "interact", sim: "note-explorer", prompt: "Play C D E F G A B C. Hear the major sound." },
    { kind: "concept", title: "C major is the white keys", body: "Start on C and the pattern lands entirely on white keys: C D E F G A B. The half steps fall between E and F, and between B and C, exactly where the pattern puts them.", keyFact: "Half steps sit at degrees 3 to 4 and 7 to 8." },
    { kind: "sequence", prompt: "Order the steps of the C major scale from the bottom", items: ["Whole step, C to D", "Whole step, D to E", "Half step, E to F", "Whole step, F to G", "Whole step, G to A", "Whole step, A to B", "Half step, B to C"], explain: "Two wholes, then a half, then three wholes, then a half. The two half steps, E to F and B to C, are what give the scale its shape." },
    { kind: "quiz", q: "Build G major with the pattern. What is the seventh note?", options: ["F", "F sharp", "G sharp", "E"], answer: 1, explain: "G A B C D E then F sharp. A whole step above E is F sharp, and the pattern needs a half step from there back to G.", hint: "The last step before G must be a half step." },
    { kind: "quiz", q: "A melody in C major keeps landing on F sharp and sounds sour. What is the likeliest reason?", options: ["F sharp is not in C major", "F sharp is too low", "The tempo is wrong", "C major has no F"], answer: 0, explain: "C major uses only white keys. F sharp is outside the key, so it clashes unless you are using it on purpose.", hint: "Which keys does C major use?" },
    { kind: "concept", title: "In Live 12", body: "In Live 12 you can give a MIDI clip a Root Note and Scale Name, and the piano roll marks the notes that belong to the scale. The Scale MIDI effect goes further and moves stray notes into the key.", keyFact: "Clip scale shows the notes. The Scale device enforces them." },
    { kind: "quiz", q: "You set a clip's scale to D major in Live 12. Two black keys are marked as in the scale. Which are they?", options: ["F sharp and C sharp", "G sharp and A sharp", "B flat and E flat", "C sharp and G sharp"], answer: 0, explain: "D major is D E F sharp G A B C sharp. The pattern needs those two black keys to keep its whole and half steps in the right places.", hint: "Apply the pattern from D." },
    { kind: "quiz", q: "From the last lesson: how many semitones are in an octave?", options: ["7", "8", "12", "10"], answer: 2, explain: "Twelve semitones make one octave." },
    { kind: "summary", learned: ["Major is W W H W W W H", "C major is all white keys", "Live 12 can mark a clip's scale in the piano roll"] },
  ],

  "minor-scale": [
    { kind: "hook", emoji: "🌙", headline: "Three notes lowered, a whole mood changed", subtext: "The same twelve notes can sound hopeful or heavy. Here is the switch." },
    { kind: "concept", title: "Natural minor", body: "The natural minor scale is whole, half, whole, whole, half, whole, whole. Compared with major, the third, sixth and seventh notes are each a semitone lower, which gives it a darker sound.", keyFact: "W H W W H W W.", visual: "scale-steps" },
    { kind: "interact", sim: "note-explorer", prompt: "Play A B C D E F G A. Hear the minor sound." },
    { kind: "concept", title: "Relative major and minor", body: "Every major key shares its notes with a minor key that starts on the sixth note. C major and A minor use the same white keys, but A feels like home in the minor version.", keyFact: "Relative minor starts on the 6th note of the major." },
    { kind: "audio-id", prompt: "Does this scale sound major or minor?", audioType: "scale-steps", options: ["Major, bright", "Minor, darker", "Neither", "Chromatic"], answer: 0, explain: "The bright, lifted sound comes from the major third and the half steps in the usual places." },
    { kind: "quiz", q: "What is the relative minor of G major?", options: ["E minor", "A minor", "D minor", "B minor"], answer: 0, explain: "Count to the sixth note of G major: G, A, B, C, D, E. So the relative minor is E minor, with the same notes as G major.", hint: "Sixth degree of the major." },
    { kind: "quiz", q: "A sad chord progression is in A minor. You switch the melody to A major and it suddenly sounds cheerful but wrong. Why?", options: ["A major has a different third, which clashes with the minor chords", "A major has fewer notes", "The tempo changed", "A major is lower"], answer: 0, explain: "The third is the note that sets major or minor. A major third over a minor chord fights it. Match the scale to the chords.", hint: "Which note defines the mood?" },
    { kind: "concept", title: "Two common variations", body: "Harmonic minor raises the seventh note by a semitone, which makes a stronger pull back to the root. Many dance tracks use natural minor, with the raised seventh only on the dominant chord.", keyFact: "Harmonic minor raises the 7th." },
    { kind: "quiz", q: "A minor lead in A harmonic minor includes G sharp. In natural A minor that note is...", options: ["G", "F", "A sharp", "B"], answer: 0, explain: "Natural A minor uses G. Harmonic minor raises it to G sharp, which sounds more urgent against the root." },
    { kind: "quiz", q: "From the last lesson: the major scale pattern is...", options: ["W W H W W W H", "W H W W H W W", "H W W H W W W", "W W W H W W H"], answer: 0, explain: "Two wholes, a half, three wholes, a half is the major pattern." },
    { kind: "summary", learned: ["Natural minor is W H W W H W W", "Relative minor starts on the 6th note", "Match your melody's scale to your chords"] },
  ],

  intervals: [
    { kind: "hook", emoji: "📐", headline: "Distance between notes has a sound", subtext: "Once you hear intervals, chords and melodies stop being mysterious." },
    { kind: "concept", title: "Counting in semitones", body: "An interval is the distance between two notes. A minor second is 1 semitone, a major third 4, a perfect fifth 7 and an octave 12. Each size has its own recognisable character.", keyFact: "Perfect fifth is 7 semitones. Octave is 12.", visual: "piano" },
    { kind: "interact", sim: "ear-training", preset: { mode: "intervals" }, prompt: "Listen. Name the interval you hear." },
    { kind: "match", prompt: "Match each interval to its size", pairs: [{ left: "Minor 3rd", right: "3 semitones" }, { left: "Major 3rd", right: "4 semitones" }, { left: "Perfect 4th", right: "5 semitones" }, { left: "Perfect 5th", right: "7 semitones" }] },
    { kind: "concept", title: "Stable and tense", body: "Octaves, fifths, fourths and thirds sound stable. Minor seconds, major sevenths and the tritone, 6 semitones, sound tense and want to resolve. Tense is not wrong, it is a tool.", keyFact: "Tension and release is the engine of music." },
    { kind: "quiz", q: "You stack a note 4 semitones above C, then another 3 semitones above that. What chord have you built?", options: ["C major", "C minor", "C diminished", "C suspended"], answer: 0, explain: "A major third, 4 semitones, plus a minor third, 3 semitones, makes a major triad. Swap the order and you get a minor triad.", hint: "4 then 3 is the major recipe." },
    { kind: "quiz", q: "A synth stab plays two notes 6 semitones apart and sounds restless. What is that interval?", options: ["Perfect fifth", "Tritone", "Major third", "Octave"], answer: 1, explain: "Six semitones is the tritone, the classic unstable interval. It sits exactly halfway through the octave.", hint: "Half of 12." },
    { kind: "type-answer", q: "How many semitones are in a perfect fifth? Write the number.", acceptableAnswers: ["7", "seven"], explain: "A perfect fifth is 7 semitones, for example C up to G.", hint: "C up to G." },
    { kind: "quiz", q: "A pad sounds muddy because two low notes only 1 semitone apart beat against each other. What is the quick fix?", options: ["Move one note up an octave or more so they are not packed together", "Raise the tempo", "Add more reverb", "Pan both hard left"], answer: 0, explain: "Close intervals in the bass rumble and clash. Spreading notes apart, especially in low octaves, cleans up the sound.", hint: "Give the notes room." },
    { kind: "quiz", q: "From the last lesson: which note is the sixth degree of C major?", options: ["A", "B", "G", "D"], answer: 0, explain: "C D E F G A, so A is the sixth. That is why A minor is C major's relative minor." },
    { kind: "summary", learned: ["Intervals are distances in semitones", "Fifths, fourths, thirds and octaves are stable", "Tritone and close seconds add tension"] },
  ],

  "pentatonic-scales": [
    { kind: "hook", emoji: "🎸", headline: "Five notes and almost nothing sounds wrong", subtext: "No wonder it runs through blues, folk, rock and club music." },
    { kind: "concept", title: "The major pentatonic", body: "Take the major scale and remove the fourth and seventh notes, the two that rub hardest against chords. What remains is 1, 2, 3, 5, 6. In C that is C, D, E, G, A.", keyFact: "Major pentatonic: 1 2 3 5 6.", visual: "piano" },
    { kind: "interact", sim: "melody-shaper", prompt: "Play a melody using only pentatonic notes." },
    { kind: "concept", title: "Why it is so safe", body: "The five notes are spaced by whole steps and two gaps of a step and a half, so none sit a semitone apart. With no semitone clashes, any order of them sounds acceptable.", keyFact: "No semitones means no sour notes." },
    { kind: "quiz", q: "Which set is the C major pentatonic?", options: ["C D E F G", "C D E G A", "C E G B D", "C D F G A"], answer: 1, explain: "It is C major without F and B: C D E G A. The set C D E F G contains the semitone E to F, which pentatonic avoids.", hint: "Drop the 4th and 7th." },
    { kind: "concept", title: "The minor pentatonic", body: "Starting the same five notes from the sixth gives the minor pentatonic: 1, flat 3, 4, 5, flat 7. In A that is A, C, D, E, G, the same notes as C major pentatonic.", keyFact: "A minor pentatonic equals C major pentatonic, shifted." },
    { kind: "type-answer", q: "Which two degrees of the major scale are removed to make the major pentatonic? Write them as numbers.", acceptableAnswers: ["4 and 7", "4, 7", "4,7", "4 7", "7 and 4", "4th and 7th", "fourth and seventh"], explain: "The 4th and 7th are removed, leaving 1, 2, 3, 5 and 6. Those two removed notes are the ones that sit a semitone from a neighbour.", hint: "Two notes sit a semitone above a neighbour." },
    { kind: "quiz", q: "Your pentatonic melody never clashes with the chords, but it feels bland. What is the most useful next step?", options: ["Add the missing scale notes at weak moments, or bend into them for colour", "Lower the tempo", "Delete half the notes", "Use only the root note"], answer: 0, explain: "Safe notes give a solid base. Passing through the left-out notes briefly, or bending into them, adds colour without losing stability.", hint: "Add colour carefully." },
    { kind: "quiz", q: "You play C major pentatonic over an F sharp major chord and it sounds off. Why?", options: ["Pentatonic is always bad", "The notes belong to a different key than the chord", "The tempo is wrong", "The octave is wrong"], answer: 1, explain: "Pentatonic is safe within its own key. Over a chord from another key, the notes can clash. Match the scale to the harmony.", hint: "Safe in which key?" },
    { kind: "quiz", q: "From the last lesson: how many semitones is a major third?", options: ["3", "4", "5", "7"], answer: 1, explain: "A major third is 4 semitones, for example C up to E." },
    { kind: "summary", learned: ["Major pentatonic is 1 2 3 5 6", "No semitone steps, so few clashes", "Stay in the key, or it can still sound wrong"] },
  ],
};
