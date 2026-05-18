import { Router, type IRouter } from "express";
import healthRouter from "./health";
import coursesRouter from "./courses";
import modulesRouter from "./modules";
import progressRouter from "./progress";
import quizzesRouter from "./quizzes";

const router: IRouter = Router();

router.use(healthRouter);
router.use(coursesRouter);
router.use(modulesRouter);
router.use(progressRouter);
router.use(quizzesRouter);

export default router;
