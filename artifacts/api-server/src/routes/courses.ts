import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, coursesTable, lessonsTable } from "@workspace/db";
import {
  ListCoursesQueryParams,
  ListCoursesResponse,
  CreateCourseBody,
  GetCourseParams,
  GetCourseResponse,
  ListCourseLessonsParams,
  ListCourseLessonsResponse,
  CreateLessonBody,
  GetLessonParams,
  GetLessonResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/courses", async (req, res): Promise<void> => {
  const query = ListCoursesQueryParams.safeParse(req.query);
  const conditions = [];
  if (query.success) {
    if (query.data.category) conditions.push(eq(coursesTable.category, query.data.category));
    if (query.data.level) conditions.push(eq(coursesTable.level, query.data.level));
  }
  const courses = conditions.length
    ? await db.select().from(coursesTable).where(conditions[0])
    : await db.select().from(coursesTable).orderBy(coursesTable.createdAt);
  res.json(ListCoursesResponse.parse(courses.map(c => ({ ...c, createdAt: c.createdAt.toISOString() }))));
});

router.post("/courses", async (req, res): Promise<void> => {
  const parsed = CreateCourseBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [course] = await db.insert(coursesTable).values(parsed.data).returning();
  res.status(201).json(GetCourseResponse.parse({ ...course, createdAt: course.createdAt.toISOString() }));
});

router.get("/courses/:id", async (req, res): Promise<void> => {
  const params = GetCourseParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [course] = await db.select().from(coursesTable).where(eq(coursesTable.id, params.data.id));
  if (!course) {
    res.status(404).json({ error: "Course not found" });
    return;
  }
  res.json(GetCourseResponse.parse({ ...course, createdAt: course.createdAt.toISOString() }));
});

router.get("/courses/:id/lessons", async (req, res): Promise<void> => {
  const params = ListCourseLessonsParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const lessons = await db.select().from(lessonsTable)
    .where(eq(lessonsTable.courseId, params.data.id))
    .orderBy(lessonsTable.orderIndex);
  res.json(ListCourseLessonsResponse.parse(lessons.map(l => ({ ...l, createdAt: l.createdAt.toISOString() }))));
});

router.post("/lessons", async (req, res): Promise<void> => {
  const parsed = CreateLessonBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [lesson] = await db.insert(lessonsTable).values(parsed.data).returning();
  res.status(201).json(GetLessonResponse.parse({ ...lesson, createdAt: lesson.createdAt.toISOString() }));
});

router.get("/lessons/:id", async (req, res): Promise<void> => {
  const params = GetLessonParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  const [lesson] = await db.select().from(lessonsTable).where(eq(lessonsTable.id, id));
  if (!lesson) {
    res.status(404).json({ error: "Lesson not found" });
    return;
  }
  res.json(GetLessonResponse.parse({ ...lesson, createdAt: lesson.createdAt.toISOString() }));
});

export default router;
