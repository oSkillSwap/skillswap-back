// Comment
import { Router } from "express";
import { reviewController } from "../controllers/review.controller.js";
import { userController } from "../controllers/user.controller.js";
import { controllerwrapper } from "../middlewares/controllerwrapper.js";

export const router = Router();

router.get("/users/", controllerwrapper(userController.getUsers));

router.get("/reviews", controllerwrapper(reviewController.getReviews));
