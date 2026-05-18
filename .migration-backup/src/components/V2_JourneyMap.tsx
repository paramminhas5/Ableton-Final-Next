// V2: Journey Map - Brutalist subway-style mission navigator with progress tracking
// Place in: src/components/JourneyMap.tsx

import { Link } from '@tanstack/react-router';

export type Mission = {
  id: string;
  world: number;
  number: number;
  title: string;
  timeMin: number;
  completed: boolean;
  locked: boolean;
};

export type JourneyMapProps = {
  currentMissionId?: string;
  missions: Mission[];
  totalMissions: number;
  completedMissions: number;
  currentXP: number;
  nextLevelXP: number;
};

export function JourneyMap({
  currentMissionId,
  missions,
  totalMissions,
  completedMissions,
  currentXP,
  nextLevelXP,
}: JourneyMapProps) {
  const progressPercent = (completedMissions / totalMissions) * 100;
  const xpPercent = (currentXP / nextLevelXP) * 100;
  const level = Math.floor(completedMissions / 10) + 1;

  // Group missions by world
  const worlds = Array.from({ length: 6 }, (_, i) => {
    const worldNum = i + 1;
    const worldMissions = missions.filter(m => m.world === worldNum);
    return {
      number: worldNum,
      title: WORLD_TITLES[worldNum],
      missions: worldMissions,
      completed: worldMissions.every(m => m.completed),
    };
  });

  return (
    <div className="space-y-8">
      {/* Progress Header */}
      <div className="brutal-border bg-card p-6">
        <div className="grid grid-cols-3 gap-6">
          {/* Completion Progress */}
          <div>
            <div className="font-mono text-xs uppercase mb-2">PROGRESS</div>
            <div className="font-display text-3xl">{completedMissions}/{totalMissions}</div>
            <div className="brutal-border bg-bone p-2 mt-2 overflow-hidden">
              <div
                className="h-2 bg-gradient-to-r from-cyan-400 to-amber-400 transition-all"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div className="font-mono text-xs mt-2 opacity-70">{progressPercent.toFixed(0)}% Complete</div>
          </div>

          {/* XP Progress */}
          <div>
            <div className="font-mono text-xs uppercase mb-2">NEXT LEVEL</div>
            <div className="font-display text-3xl">Lvl {level}</div>
            <div className="brutal-border bg-bone p-2 mt-2 overflow-hidden">
              <div
                className="h-2 bg-green-400 transition-all"
                style={{ width: `${xpPercent}%` }}
              />
            </div>
            <div className="font-mono text-xs mt-2 opacity-70">
              {currentXP}/{nextLevelXP} XP
            </div>
          </div>

          {/* Time Spent */}
          <div>
            <div className="font-mono text-xs uppercase mb-2">TIME INVESTED</div>
            <div className="font-display text-3xl">
              {Math.round((completedMissions * 8) / 60)}h
            </div>
            <div className="brutal-border bg-bone p-2 mt-2">
              <div className="font-mono text-xs">Est. {completedMissions * 8} min</div>
            </div>
          </div>
        </div>
      </div>

      {/* World Sections (Subway Map Layout) */}
      <div className="space-y-12">
        {worlds.map((world) => (
          <div key={world.number} className="space-y-4">
            {/* World Header */}
            <div className="flex items-center gap-4">
              <div className="brutal-border bg-acid text-ink px-4 py-2 font-mono font-bold text-sm">
                WORLD {world.number}
              </div>
              <div className="font-display text-xl">{world.title}</div>
              {world.completed && (
                <div className="ml-auto brutal-border bg-green-400 text-ink px-3 py-1 font-mono text-xs font-bold">
                  ✓ COMPLETE
                </div>
              )}
            </div>

            {/* Missions in Subway Map Grid */}
            <div className="brutal-border bg-card p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {world.missions.map((mission, idx) => {
                  const isCurrentMission = mission.id === currentMissionId;
                  const canAccess = !mission.locked;

                  return (
                    <Link
                      key={mission.id}
                      to={canAccess ? `/mission/${mission.id}` : '#'}
                      className={`brutal-border p-4 transition-all ${
                        isCurrentMission
                          ? 'bg-acid text-ink brutal-shadow scale-105'
                          : mission.completed
                            ? 'bg-green-400 text-ink'
                            : mission.locked
                              ? 'bg-ink opacity-40 cursor-not-allowed'
                              : 'bg-bone text-ink hover:brutal-shadow brutal-press'
                      }`}
                      disabled={!canAccess}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <div className="font-mono text-xs uppercase opacity-70">
                            Mission {mission.number}
                          </div>
                          <div className="font-display text-lg">{mission.title}</div>
                        </div>
                        {isCurrentMission && (
                          <div className="animate-pulse text-lg">◆</div>
                        )}
                        {mission.completed && (
                          <div className="text-lg">✓</div>
                        )}
                        {mission.locked && (
                          <div className="text-lg">🔒</div>
                        )}
                      </div>
                      <div className="font-mono text-xs mt-2 opacity-70">
                        ~{mission.timeMin} min
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Stats Footer */}
      <div className="brutal-border bg-volt text-bone p-4">
        <div className="grid grid-cols-3 gap-4 font-mono text-xs uppercase">
          <div>
            <div>Streak</div>
            <div className="font-display text-lg">{completedMissions > 0 ? '🔥 On Track' : '—'}</div>
          </div>
          <div>
            <div>Avg Time/Mission</div>
            <div className="font-display text-lg">~8 min</div>
          </div>
          <div>
            <div>Est. Completion</div>
            <div className="font-display text-lg">{Math.ceil((totalMissions - completedMissions) * 8 / 60)}h Left</div>
          </div>
        </div>
      </div>
    </div>
  );
}

const WORLD_TITLES: Record<number, string> = {
  1: 'FUNDAMENTALS',
  2: 'RECORDING & WARPING',
  3: 'MIXING & EFFECTS',
  4: 'ADVANCED ROUTING',
  5: 'MIDI & INSTRUMENTS',
  6: 'PRODUCTION WORKFLOW',
};

// Example missions data to use with this component
export const MISSIONS_DATA: Mission[] = [
  // World 1: Fundamentals
  { id: 'clip-101', world: 1, number: 1, title: 'Audio vs MIDI Clips', timeMin: 8, completed: false, locked: false },
  { id: 'tracks-101', world: 1, number: 2, title: 'Track Types', timeMin: 7, completed: false, locked: false },
  { id: 'devices-101', world: 1, number: 3, title: 'What Are Devices?', timeMin: 6, completed: false, locked: false },
  { id: 'mixer-101', world: 1, number: 4, title: 'The Mixer', timeMin: 8, completed: false, locked: false },
  { id: 'signal-flow-101', world: 1, number: 5, title: 'Signal Flow Basics', timeMin: 10, completed: false, locked: false },
  
  // World 2: Recording & Warping
  { id: 'recording-101', world: 2, number: 6, title: 'Recording MIDI', timeMin: 8, completed: false, locked: false },
  { id: 'warping-101', world: 2, number: 7, title: 'Warping Audio', timeMin: 9, completed: false, locked: false },
  { id: 'arrangement-101', world: 2, number: 8, title: 'Arrangement View', timeMin: 10, completed: false, locked: false },
  { id: 'session-vs-arr', world: 2, number: 9, title: 'Session vs Arrangement', timeMin: 8, completed: false, locked: true },
  
  // World 3: Mixing & Effects
  { id: 'eq-101', world: 3, number: 10, title: 'EQ Fundamentals', timeMin: 10, completed: false, locked: true },
  { id: 'compression-101', world: 3, number: 11, title: 'Compression Basics', timeMin: 12, completed: false, locked: true },
  { id: 'reverb-101', world: 3, number: 12, title: 'Space & Reverb', timeMin: 9, completed: false, locked: true },
  { id: 'delay-101', world: 3, number: 13, title: 'Time-Based Effects', timeMin: 8, completed: false, locked: true },
  { id: 'sends-returns', world: 3, number: 14, title: 'Sends & Returns', timeMin: 10, completed: false, locked: true },
  
  // World 4: Advanced Routing
  { id: 'groups-101', world: 4, number: 15, title: 'Group Tracks', timeMin: 8, completed: false, locked: true },
  { id: 'sidechain-101', world: 4, number: 16, title: 'Sidechain Compression', timeMin: 12, completed: false, locked: true },
  { id: 'resampling-101', world: 4, number: 17, title: 'Resampling', timeMin: 9, completed: false, locked: true },
  { id: 'cv-routing', world: 4, number: 18, title: 'CV Routing', timeMin: 10, completed: false, locked: true },
  
  // World 5: MIDI & Instruments
  { id: 'midi-101', world: 5, number: 19, title: 'MIDI Basics', timeMin: 10, completed: false, locked: true },
  { id: 'wavetable-101', world: 5, number: 20, title: 'Wavetable Synth', timeMin: 12, completed: false, locked: true },
  { id: 'sampler-101', world: 5, number: 21, title: 'Using Sampler', timeMin: 11, completed: false, locked: true },
  { id: 'arpeggiator-101', world: 5, number: 22, title: 'Arpeggiator Basics', timeMin: 8, completed: false, locked: true },
  
  // World 6: Workflow
  { id: 'workflow-101', world: 6, number: 23, title: 'Efficient Workflow', timeMin: 12, completed: false, locked: true },
  { id: 'performance-101', world: 6, number: 24, title: 'Live Performance', timeMin: 10, completed: false, locked: true },
];
