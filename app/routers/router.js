import { Router } from "express";
import { userRouter } from "./user.router.js";
import { postRouter } from "./post.router.js";
import { reviewRouter } from "./review.router.js";
import { messageRouter } from "./message.router.js";
import { skillRouter } from "./skill.router.js";
import { categoryRouter } from "./category.router.js";
import { availabilityRouter } from "./availability.router.js";
import { propositionRouter } from "./proposition.router.js";
import { adminRouter } from "./admin.router.js";
import { errorMiddleware } from "../middlewares/error.middleware.js";

export const router = Router();

router.use(userRouter);
router.use(postRouter);
router.use(reviewRouter);
router.use(messageRouter);
router.use(skillRouter);
router.use(categoryRouter);
router.use(availabilityRouter);
router.use(propositionRouter);
router.use(adminRouter);

router.use(errorMiddleware);
