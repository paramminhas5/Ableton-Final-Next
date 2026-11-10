/**
 * What a step asks you to do, pulled out of its text: the first sentence that tells you to do something
 * ("Press rec", "Turn shape", "Bring deck b's fader up"). The rest of the first paragraph is the how.
 * 10 Nov, Param: "the why will come after you tell me what to do. what, why, how."
 */
const DO_VERB = /^(press|play|tap|turn|pick|switch|slide|bring|set|match|give|listen|find|load|make|take|hold|mute|record|put|copy|drag|move|try|watch|look|decide|build|imagine|count|name|download|sweep|start|keep|add|choose|open|close|shift|slam|snap|drop|push|pull|send|use|dig|run|fix|treat|practise|practice|go|hear|read|leave|draw|lower|raise|blend|cut|loop|fade|ride|store|save|layer|stack|write|sing|hum|nudge|flip|let|change|get|shape|pan|tune|place|compare|grab|clap)\b/i;
const LEAD = /^(now|then|first|next|so|and|one|two|three|four|five|last|finally|this time|again)[,:]?\s+/i;
const strip = (s: string) => s.replace(LEAD, "").replace(LEAD, "");
/** When a step's text has no instruction line (ear steps keep theirs on the screen), say what its kind asks. */
const KIND_WHAT: Record<string, string> = {
  matchsound: "Turn the lit knobs until yours sounds like the target.",
  copy: "Listen, then play it back by ear.",
  imagine: "Read it, hear it in your head, then pick the one you heard.",
  shape: "Turn the knobs and listen to what changes.",
  tempo: "Try each setting and listen to the difference.",
  mix: "Use the decks below to do the move.",
  arrange: "Switch parts off and on in each section, then play it through.",
  play: "Press rec and play along.",
};
export function whatHow(body?: string, kind?: string): { what?: string; how?: string } {
  const paras = (body ?? "").split(/\n+/).map(s => s.trim()).filter(Boolean);
  if (!paras.length) return { what: kind ? KIND_WHAT[kind] : undefined };
  const sents = (p: string) => p.match(/[^.!?]+[.!?]+(\s|$)|[^.!?]+$/g)?.map(s => s.trim()) ?? [p];
  for (const p of paras) {
    const ss = sents(p);
    const i = ss.findIndex(s => DO_VERB.test(strip(s)));
    if (i >= 0) {
      const w = strip(ss[i]);
      return { what: w.charAt(0).toUpperCase() + w.slice(1), how: [...ss.slice(0, i), ...ss.slice(i + 1)].join(" ") || undefined };
    }
  }
  const ss = sents(paras[0]);
  return { what: ss[0], how: ss.slice(1).join(" ") || undefined };
}
