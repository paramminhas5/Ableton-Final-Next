/**
 * Which hands-on steps to suggest next, by where the learner is. Pure, so each path can be tested.
 * New: get Live ready and make a first beat. Growing: build a Set and train the ear.
 * Experienced: check a real Set, learn the device and plug-in detail, keep the ear sharp.
 */
export interface Move {
  href: string;
  title: string;
  why: string;
}

export type Stage = "new" | "growing" | "experienced";

export function stageFor(input: { completed: number; placementDone: boolean }): Stage {
  if (input.completed >= 15 || (input.placementDone && input.completed >= 3)) return "experienced";
  if (input.completed >= 3) return "growing";
  return "new";
}

export function movesFor(stage: Stage): Move[] {
  if (stage === "new")
    return [
      { href: "/setup", title: "Get Live ready", why: "Install, audio, MIDI and plug-ins, in 11 short steps." },
      { href: "/beat", title: "Make your first beat", why: "Tap a drum pattern, then drag it into Live." },
      { href: "/atlas", title: "See what every device does", why: "A plain guide to Live's own tools." },
    ];
  if (stage === "growing")
    return [
      { href: "/build", title: "Build your first track", why: "Fourteen stages, checked against your real Set." },
      { href: "/gym", title: "Five-minute Ear Gym", why: "Train your ears for EQ, compression and groove." },
      { href: "/plugins", title: "Which plug-in for what", why: "Stock first, then the best free and paid options." },
    ];
  return [
    { href: "/link", title: "Check a Set you already made", why: "Four real mixing habits, checked on your project." },
    { href: "/plugins", title: "Find the right plug-in", why: "Match a job to a tool before you buy." },
    { href: "/gym", title: "Keep your ears sharp", why: "Adaptive drills, three sessions a week." },
  ];
}
