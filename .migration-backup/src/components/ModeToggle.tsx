import { useMode, type Mode } from "@/lib/mode";

const MODES: { id: Mode; label: string; color: string }[] = [
  { id: "beginner", label: "Beginner", color: "bg-acid text-ink" },
  { id: "intermediate", label: "Inter.", color: "bg-volt text-bone" },
  { id: "advanced", label: "Advanced", color: "bg-hot text-bone" },
];

export function ModeToggle() {
  const { mode, setMode } = useMode();
  return (
    <div className="brutal-border inline-flex font-mono text-[10px] uppercase">
      {MODES.map((m, i) => (
        <button
          key={m.id}
          onClick={() => setMode(m.id)}
          aria-pressed={mode === m.id}
          title={`${m.label} depth`}
          className={`px-2 py-1 transition-colors ${
            mode === m.id ? m.color : "bg-bone text-ink/50 hover:text-ink"
          } ${i > 0 ? "brutal-border border-y-0 border-r-0" : ""}`}
        >
          {m.label}
        </button>
      ))}
    </div>
  );
}
