import type { ReactNode } from "react";
import { ArpStep, KeyStep, MacroStep, type StepProps } from "./ToolSteps";
import { GridStep } from "./GridStep";
import { SampleStep } from "./SampleStep";
import { CompStep } from "./CompStep";
import { ChanceStep, ChordsStep, CommitStep, LengthStep, PlayerStep } from "./WriteSteps";

/** The tool steps by the `set` a lesson names (the rest of `set` is handled in LessonSteps). */
export const TOOL_STEPS: Partial<Record<string, (p: StepProps) => ReactNode>> = { arp: ArpStep, key: KeyStep, grid: GridStep, sample: SampleStep, mic: SampleStep, comp: CompStep, macro: MacroStep, chords: ChordsStep, player: PlayerStep, chance: ChanceStep, length: LengthStep, commit: CommitStep };
