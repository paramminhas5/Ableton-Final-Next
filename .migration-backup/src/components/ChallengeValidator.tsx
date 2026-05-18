// V2 Challenge System - Interactive mini-quests with validation
// Place in: src/components/ChallengeValidator.tsx

import { useState } from 'react';

export type ChallengeValidation = 
  | { kind: 'checkbox'; label: string }
  | { kind: 'numerical'; param: string; target: number; tolerance: number; unit?: string }
  | { kind: 'textInput'; answer: string };

export type Challenge = {
  id: string;
  title: string;
  objective: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  steps: string[];
  validations: ChallengeValidation[];
  hints?: string[];
  reward: { xp: number; achievement?: string };
};

export function ChallengeValidator({
  challenge,
  onComplete,
}: {
  challenge: Challenge;
  onComplete: (xp: number) => void;
}) {
  const [completed, setCompleted] = useState<boolean[]>(
    new Array(challenge.validations.length).fill(false)
  );
  const [showHint, setShowHint] = useState(false);
  const allComplete = completed.every((c) => c);

  const toggleValidation = (i: number) => {
    setCompleted((prev) => {
      const next = [...prev];
      next[i] = !next[i];
      return next;
    });
  };

  const handleComplete = () => {
    if (allComplete) {
      onComplete(challenge.reward.xp);
    }
  };

  return (
    <div className="brutal-border bg-card p-6 space-y-4">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-2xl font-display">{challenge.title}</h3>
          <p className="font-mono text-xs uppercase text-acid mt-1">{challenge.difficulty}</p>
        </div>
        <div className="text-right">
          <div className="text-sm font-mono">+{challenge.reward.xp} XP</div>
          {challenge.reward.achievement && (
            <div className="text-xs font-mono text-sun mt-1">🏆 {challenge.reward.achievement}</div>
          )}
        </div>
      </div>

      <p className="font-mono text-sm">{challenge.objective}</p>

      <div className="bg-bone p-3 font-mono text-sm space-y-2">
        {challenge.steps.map((step, i) => (
          <div key={i} className="flex gap-2">
            <div className="text-acid font-bold">{i + 1}.</div>
            <div className="text-ink">{step}</div>
          </div>
        ))}
      </div>

      <div className="space-y-2 bg-volt p-3">
        {challenge.validations.map((v, i) => (
          <div key={i} className="flex items-start gap-2">
            <input
              type="checkbox"
              checked={completed[i]}
              onChange={() => toggleValidation(i)}
              className="mt-1"
            />
            <div className="flex-1">
              {v.kind === 'checkbox' && (
                <label className="font-mono text-sm cursor-pointer">{v.label}</label>
              )}
              {v.kind === 'numerical' && (
                <label className="font-mono text-sm cursor-pointer">
                  {v.param} ≈ {v.target} {v.unit || ''} (±{v.tolerance})
                </label>
              )}
              {v.kind === 'textInput' && (
                <label className="font-mono text-sm">Answer: {v.answer}</label>
              )}
            </div>
          </div>
        ))}
      </div>

      {challenge.hints && (
        <div>
          <button
            onClick={() => setShowHint(!showHint)}
            className="brutal-border px-3 py-1 font-mono text-xs uppercase brutal-press"
          >
            {showHint ? '▼ Hide Hint' : '▶ Show Hint'}
          </button>
          {showHint && (
            <div className="brutal-border bg-sun text-ink p-3 mt-2 font-mono text-sm">
              {challenge.hints?.[0]}
            </div>
          )}
        </div>
      )}

      <button
        onClick={handleComplete}
        disabled={!allComplete}
        className={`brutal-border px-4 py-2 font-display text-lg w-full brutal-press ${
          allComplete ? 'bg-green-400 text-ink' : 'opacity-50 cursor-not-allowed'
        }`}
      >
        {allComplete ? '✓ COMPLETE CHALLENGE' : 'Complete All Steps Above'}
      </button>
    </div>
  );
}

// Example challenges
export const CHALLENGE_LIBRARY: Challenge[] = [
  {
    id: 'drum-punch',
    title: 'Make Drums Punch',
    objective: 'Use compressor to make drum loop more present and controlled',
    difficulty: 'beginner',
    steps: [
      'Load the "drum-loop" sample source',
      'Add a Compressor device to the chain',
      'Set Threshold to -18 dB',
      'Set Ratio to 4:1',
      'Set Attack to 20 ms (slow attack preserves transient)',
      'Set Release to 150 ms',
      'Toggle A/B to hear the difference',
    ],
    validations: [
      { kind: 'numerical', param: 'Threshold', target: -18, tolerance: 2, unit: 'dB' },
      { kind: 'numerical', param: 'Ratio', target: 4, tolerance: 0.5 },
      { kind: 'numerical', param: 'Attack', target: 20, tolerance: 5, unit: 'ms' },
      { kind: 'checkbox', label: 'Can hear the difference when toggling A/B' },
    ],
    hints: ['Slow attack (20-30ms) on drums lets the initial "click" through → feels punchier'],
    reward: { xp: 150, achievement: 'Drum Punch Master' },
  },
  {
    id: 'eq-clarity',
    title: 'Carve Vocal Presence',
    objective: 'Use EQ to make a vocal sample clear and upfront',
    difficulty: 'beginner',
    steps: [
      'Load the "vox-chop" sample',
      'Add EQ device',
      'Cut the low frequencies (-6 dB at 120 Hz) to remove rumble',
      'Boost mids around 2-4 kHz by +4 dB',
      'A/B to hear clarity improve',
    ],
    validations: [
      { kind: 'numerical', param: 'Low Shelf', target: -6, tolerance: 2, unit: 'dB' },
      { kind: 'numerical', param: 'Mid Peak', target: 4, tolerance: 2, unit: 'dB' },
      { kind: 'checkbox', label: 'Vocal sounds clearer and more present' },
    ],
    hints: ['Human hearing is most sensitive in the 2-4 kHz range — boost here for presence'],
    reward: { xp: 100, achievement: 'EQ Surgeon' },
  },
  {
    id: 'reverb-space',
    title: 'Create Ambience',
    objective: 'Add reverb to make a drum loop feel spacious',
    difficulty: 'beginner',
    steps: [
      'Load "drum-loop"',
      'Add Reverb device',
      'Set Room Size to 70%',
      'Set Decay Time to 2.5 seconds',
      'Set Wet Level to 35%',
      'Listen — drums should feel like they\'re in a room',
    ],
    validations: [
      { kind: 'numerical', param: 'Room Size', target: 70, tolerance: 5 },
      { kind: 'numerical', param: 'Decay', target: 2.5, tolerance: 0.3 },
      { kind: 'checkbox', label: 'Can hear spatial depth' },
    ],
    hints: ['Keep wet level below 50% or reverb overpowers the source'],
    reward: { xp: 120, achievement: 'Space Creator' },
  },
  {
    id: 'compressor-sidechain',
    title: 'Sidechain Compression (Advanced)',
    objective: 'Make bass duck every time the kick hits',
    difficulty: 'advanced',
    steps: [
      'Load "full-mix" source (has drums + bass)',
      'Add Compressor to bass track',
      'Set Sidechain input to kick/drum track',
      'Threshold -12 dB, Ratio 4:1',
      'Release 300 ms for smooth ducking',
      'A/B — bass should pump with kick',
    ],
    validations: [
      { kind: 'numerical', param: 'Threshold', target: -12, tolerance: 2 },
      { kind: 'numerical', param: 'Release', target: 300, tolerance: 50 },
      { kind: 'checkbox', label: 'Bass audibly ducks when kick plays' },
    ],
    hints: ['Sidechain detection comes from the KICK track, but compression affects BASS track'],
    reward: { xp: 300, achievement: 'Sidechain Master' },
  },
];
