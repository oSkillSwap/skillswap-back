import { Router } from "express";
import { userController } from "../controllers/user.controller.js";
import { reviewController } from "../controllers/review.controller.js";
import { authenticate } from "../middlewares/authenticate.js";
import { controllerwrapper } from "../middlewares/controllerwrapper.js";
import { validateParams } from "../middlewares/validateParams.js";
import { validate } from "../middlewares/validates.js";
import {
	loginSchema,
	registerSchema,
	updateReviewSchema,
	updateUserSchema,
	updateUserSkillsSchema,
	updateWantedSkillsSchema,
} from "../schemas/user.schema.js";

export const userRouter = Router();

// /me
userRouter
	.route("/me")
	.get(authenticate, (req, res) => {
		res.status(200).json({ message: "Utilisateur connecté", user: req.user });
	})
	// Update user information
	.patch(
		authenticate,
		validate(updateUserSchema),
		controllerwrapper(userController.updateUser),
	)
	// Delete user account
	.delete(authenticate, controllerwrapper(userController.deleteUser));

// /me/wanted-skills
userRouter.put(
	"/me/wanted-skills",
	authenticate,
	validate(updateWantedSkillsSchema),
	controllerwrapper(userController.updateUserWantedSkills),
);

// /me/skills
userRouter.patch(
	"/me/skills",
	authenticate,
	validate(updateUserSkillsSchema),
	controllerwrapper(userController.updateUserSkills),
);

// /me/reviews/:userId
userRouter.patch(
	"/me/reviews/:userId",
	authenticate,
	validateParams("userId"),
	validate(updateReviewSchema),
	controllerwrapper(reviewController.updateReview),
);

// /me/users -> Get user information
userRouter.get("/me/users", authenticate, async (req, res, next) => {
	req.params.userId = req.user.id;
	return userController.getOneUser(req, res, next);
});

// /users -> Get all users
userRouter.get("/users", controllerwrapper(userController.getUsers));

// /users/follows/:id
userRouter.get(
	"/users/follows/:id",
	validateParams("id"),
	controllerwrapper(userController.getFollowersAndFollowsFromUser),
);

// /me/follows
userRouter.get("/me/follows", authenticate, async (req, res, next) => {
	req.params.id = req.user.id;
	return userController.getFollowersAndFollowsFromUser(req, res, next);
});
// /me/follow/:userId
userRouter
	.route("/me/follow/:userId")
	.post(
		authenticate,
		validateParams("userId"),
		controllerwrapper(userController.followUser),
	)
	.delete(
		authenticate,
		validateParams("userId"),
		controllerwrapper(userController.unfollowUser),
	);

// /users/:userId
userRouter.get(
	"/users/:userId",
	validateParams("userId"),
	controllerwrapper(userController.getOneUser),
);

// Auth
userRouter.post(
	"/register",
	validate(registerSchema),
	controllerwrapper(userController.register),
);

userRouter.post(
	"/login",
	validate(loginSchema),
	controllerwrapper(userController.login),
);
