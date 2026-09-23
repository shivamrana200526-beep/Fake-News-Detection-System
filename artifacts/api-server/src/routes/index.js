import { Router } from "express";
import healthRouter from "./health.js";
import analyzeRouter from "./analyze.js";
import chatRouter from "./chat.js";
import credibilityRouter from "./credibility.js";
import trendingRouter from "./trending.js";
import quizRouter from "./quiz.js";
import usersRouter from "./users.js";
import authRouter from "./auth.js";

const router = Router();

router.use(healthRouter);
router.use(analyzeRouter);
router.use(chatRouter);
router.use(credibilityRouter);
router.use(trendingRouter);
router.use(quizRouter);
router.use(usersRouter);
router.use(authRouter);

export default router;
