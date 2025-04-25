import { Router } from "express";
import { categoryontroller } from "../controllers/category.js";
import { messageController } from "../controllers/message.controller.js";
import { reviewController } from "../controllers/review.controller.js";
import { userController } from "../controllers/user.controller.js";
import { controllerwrapper } from "../middlewares/controllerwrapper.js";
import { validate } from "../middlewares/validates.js";
import { loginSchema, registerSchema } from "../schemas/user.schema.js";
import { validateParams } from "../middlewares/validateParams.js";

export const router = Router();

router.get("/users", controllerwrapper(userController.getUsers));
router.post(
	"/register",
	validate(registerSchema),
	controllerwrapper(userController.register),
);
router.post(
	"/login",
	validate(loginSchema),
	controllerwrapper(userController.login),
);

router.get("/reviews", controllerwrapper(reviewController.getReviews));
router.get("/categories", controllerwrapper(categoryontroller.getCategories));
router.get(
	"/messages/:id",
	validateParams("id"),
	controllerwrapper(messageController.getMessages),
);

router
	.route("/messages/:me/:userId")
	.get(
		validateParams("me", "userId"),
		controllerwrapper(messageController.getConversation),
	);
