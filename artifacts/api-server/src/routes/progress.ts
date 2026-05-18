import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, progressTable, lessonsTable, coursesTable } from "@workspace/db";
import {
  ListProgressResponse,
  UpsertProgressBody,
  UpsertProgressResponse,
  CompleteLessonParams,
  CompleteLessonResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/progress", async (_req, res): Promise<void> => {
  const records = await db.select().from(progressTable);
  res.json(ListProgressResponse.parse(records.map(p => ({ ...p, updatedAt: p.updatedAt.toISOString() }))));
});

router.post("/progress", async (req, res): Promise<void> => {
  const parsed = UpsertProgressBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const existing = await db.select().from(progressTable).where(eq(progressTable.lessonId, parsed.data.lessonId));
  let record;
  if (existing.length > 0) {
    const updateData: Record<string, unknown> = {};
    if (parsed.data.completed !== undefined) updateData.completed = parsed.data.completed;
    if (parsed.data.watchedSeconds !== undefined) updateData.watchedSeconds = parsed.data.watchedSeconds;
    if (parsed.data.quizScore !== undefined) updateData.quizScore = parsed.data.quizScore;
    [record] = await db.update(progressTable).set(updateData).where(eq(progressTable.lessonId, parsed.data.lessonId)).returning();
  } else {
    [record] = await db.insert(progressTable).values(parsed.data).returning();
  }
  res.json(UpsertProgressResponse.parse({ ...record, updatedAt: record.updatedAt.toISOString() }));
});

router.post("/progress/:lessonId/complete", async (req, res): Promise<void> => {
  const params = CompleteLessonParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const existing = await db.select().from(progressTable).where(eq(progressTable.lessonId, params.data.lessonId));
  let record;
  if (existing.length > 0) {
    [record] = await db.update(progressTable).set({ completed: true }).where(eq(progressTable.lessonId, params.data.lessonId)).returning();
  } else {
    [record] = await db.insert(progressTable).values({ lessonId: params.data.lessonId, completed: true }).returning();
  }
  res.json(CompleteLessonResponse.parse({ ...record, updatedAt: record.updatedAt.toISOString() }));
});

export default router;
