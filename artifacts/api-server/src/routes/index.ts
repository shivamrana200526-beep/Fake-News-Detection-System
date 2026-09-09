import { Router, type IRouter } from "express";
import healthRouter from "./health";
import analyzeRouter from "./analyze";
import chatRouter from "./chat";
import credibilityRouter from "./credibility";
import trendingRouter from "./trending";
import quizRouter from "./quiz";

const router: IRouter = Router();

router.use(healthRouter);
router.use(analyzeRouter);
router.use(chatRouter);
router.use(credibilityRouter);
router.use(trendingRouter);
router.use(quizRouter);

export default router;
