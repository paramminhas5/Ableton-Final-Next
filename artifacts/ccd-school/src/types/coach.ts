export type DashboardCoachContext = {
  streak: number;
  xp: number;
  world: string | null;
  nextSlug: string | null;
};

export function formatDashboardContext(ctx: DashboardCoachContext): string {
  return [
    "[Dashboard]",
    `[Streak: ${ctx.streak} days]`,
    `[XP: ${ctx.xp}]`,
    ctx.world ? `[Last World: ${ctx.world}]` : "",
    ctx.nextSlug ? `Next lesson: ${ctx.nextSlug.replace(/-/g, " ")}.` : "All caught up!",
  ].filter(Boolean).join(" ");
}
