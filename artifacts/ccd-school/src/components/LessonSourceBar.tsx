"use client";

interface Props {
  /** Citation string from LearningPath.source — e.g. "rekordbox 6.0.0 Instruction Manual — §3.2 Beat Grid Analysis" */
  source: string | null | undefined;
}

/**
 * LessonSourceBar — displays a source citation string for a lesson.
 * Renders nothing if source is empty, null, or undefined.
 *
 * Distinct from the audio SourceBar.tsx (which is a sim audio picker).
 */
export function LessonSourceBar({ source }: Props) {
  if (!source) return null;

  return (
    <div
      className="brutal-border bg-bone px-4 py-2 mt-4"
      aria-label="Content source citation"
    >
      <span className="font-mono text-[10px] uppercase opacity-60">
        📄 SOURCE: {source}
      </span>
    </div>
  );
}
