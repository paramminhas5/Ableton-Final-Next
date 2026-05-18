// SongStructureSim — arrange labelled blocks (intro/verse/chorus/drop/break/outro) on a timeline.
import { useState } from "react";

type Block = { id: string; type: keyof typeof TYPES; bars: number };
const TYPES = {
  Intro:  "bg-bone",
  Verse:  "bg-volt text-bone",
  Chorus: "bg-acid",
  Drop:   "bg-hot text-bone",
  Break:  "bg-sun",
  Outro:  "bg-ink text-bone",
} as const;

const TEMPLATES: Record<string, Block[]> = {
  "Pop":   [{id:"1",type:"Intro",bars:4},{id:"2",type:"Verse",bars:8},{id:"3",type:"Chorus",bars:8},{id:"4",type:"Verse",bars:8},{id:"5",type:"Chorus",bars:8},{id:"6",type:"Break",bars:4},{id:"7",type:"Chorus",bars:8},{id:"8",type:"Outro",bars:4}],
  "House": [{id:"1",type:"Intro",bars:16},{id:"2",type:"Verse",bars:16},{id:"3",type:"Break",bars:8},{id:"4",type:"Drop",bars:16},{id:"5",type:"Verse",bars:16},{id:"6",type:"Drop",bars:16},{id:"7",type:"Outro",bars:16}],
};

export function SongStructureSim() {
  const [tmpl, setTmpl] = useState<keyof typeof TEMPLATES>("Pop");
  const blocks = TEMPLATES[tmpl];
  const total = blocks.reduce((a, b) => a + b.bars, 0);

  return (
    <div className="space-y-3">
      <div className="brutal-border bg-ink text-bone p-3 flex gap-3 items-center">
        <label className="font-mono text-[10px] uppercase flex items-center gap-2">
          TEMPLATE
          <select value={tmpl} onChange={(e) => setTmpl(e.target.value as keyof typeof TEMPLATES)} className="brutal-border bg-bone text-ink px-2 py-1 text-xs">
            {Object.keys(TEMPLATES).map((t) => <option key={t}>{t}</option>)}
          </select>
        </label>
        <span className="ml-auto font-mono text-[10px] uppercase opacity-80">{total} bars total</span>
      </div>

      <div className="brutal-border bg-card p-2 flex gap-1 overflow-x-auto">
        {blocks.map((b) => (
          <div key={b.id} style={{ flex: `${b.bars} 0 0` }}
            className={`${TYPES[b.type]} brutal-border h-20 min-w-[60px] flex flex-col items-center justify-center font-mono text-[10px] uppercase`}>
            <div className="font-display text-sm">{b.type}</div>
            <div className="opacity-70">{b.bars}b</div>
          </div>
        ))}
      </div>
      <p className="font-mono text-[10px] uppercase opacity-70">▸ Song form = energy curve over time. Pop builds in 4s and 8s; club music in 8s and 16s.</p>
    </div>
  );
}
