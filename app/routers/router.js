import { Router } from "express";
import { categoryontroller } from "../controllers/category.js";
import { messageController } from "../controllers/message.controller.js";
import { reviewController } from "../controllers/review.controller.js";
import { userController } from "../controllers/user.controller.js";
import { controllerwrapper } from "../middlewares/controllerwrapper.js";
import { validate } from "../middlewares/validates.js";
import { loginSchema, registerSchema } from "../schemas/user.schema.js";

export const router = Router();

router.post("/register", validate(registerSchema), userController.register);
router.post("/login", validate(loginSchema), userController.login);

router.get("/users", controllerwrapper(userController.getUsers));
router.get("/reviews", controllerwrapper(reviewController.getReviews));
router.get("/categories", controllerwrapper(categoryontroller.getCategories));
router.get("/messages/:id", controllerwrapper(messageController.getMessages));

router
  .route("/messages/:me/:userId")
  .get(controllerwrapper(messageController.getConversation));
