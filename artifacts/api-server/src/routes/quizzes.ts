import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, quizzesTable } from "@workspace/db";
import {
  ListQuizzesQueryParams,
  ListQuizzesResponse,
  CreateQuizBody,
  SubmitQuizParams,
  SubmitQuizBody,
  SubmitQuizResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/quizzes", async (req, res): Promise<void> => {
  const query = ListQuizzesQueryParams.safeParse(req.query);
  let quizzes;
  if (query.success && query.data.lessonId) {
    quizzes = await db.select().from(quizzesTable).where(eq(quizzesTable.lessonId, query.data.lessonId));
  } else {
    quizzes = await db.select().from(quizzesTable);
  }
  res.json(ListQuizzesResponse.parse(quizzes.map(q => ({ ...q, createdAt: q.createdAt.toISOString() }))));
});

router.post("/quizzes", async (req, res): Promise<void> => {
  const parsed = CreateQuizBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [quiz] = await db.insert(quizzesTable).values(parsed.data).returning();
  res.status(201).json({ ...quiz, createdAt: quiz.createdAt.toISOString() });
});

router.post("/quizzes/:id/submit", async (req, res): Promise<void> => {
  const params = SubmitQuizParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const body = SubmitQuizBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }
  const [quiz] = await db.select().from(quizzesTable).where(eq(quizzesTable.id, params.data.id));
  if (!quiz) {
    res.status(404).json({ error: "Quiz not found" });
    return;
  }
  const correct = body.data.selectedAnswerIndex === quiz.correctAnswerIndex;
  res.json(SubmitQuizResponse.parse({
    correct,
    explanation: quiz.explanation ?? null,
    correctAnswerIndex: quiz.correctAnswerIndex,
  }));
});

export default router;
