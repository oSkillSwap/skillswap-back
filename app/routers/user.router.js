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
	updateUserSchema,
	updateUserSkillsSchema,
	updateWantedSkillsSchema,
} from "../schemas/user.schema.js";

export const userRouter = Router();

//
// AUTHENTICATION ROUTES
//
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

//
// AUTHENTICATED USER ROUTES (/me)
//
userRouter.get("/me", authenticate, (req, res) =>
	res.status(200).json({ message: "Authenticated user", user: req.user }),
);

userRouter.patch(
	"/me",
	authenticate,
	validate(updateUserSchema),
	controllerwrapper(userController.updateUser),
);

userRouter.delete(
	"/me",
	authenticate,
	controllerwrapper(userController.deleteUser),
);

// Update wanted skills
userRouter.put(
	"/me/wanted-skills",
	authenticate,
	validate(updateWantedSkillsSchema),
	controllerwrapper(userController.updateUserWantedSkills),
);

// Update owned skills
userRouter.patch(
	"/me/skills",
	authenticate,
	validate(updateUserSkillsSchema),
	controllerwrapper(userController.updateUserSkills),
);

// Get current authenticated user's full info
userRouter.get("/me/users", authenticate, async (req, res, next) => {
	req.params.userId = req.user.id;
	return userController.getOneUser(req, res, next);
});

//
// GENERAL USERS ROUTES
//
userRouter.get("/users", controllerwrapper(userController.getUsers));

userRouter.get(
	"/users/:userId",
	validateParams("userId"),
	controllerwrapper(userController.getOneUser),
);

//
// FOLLOWING / FOLLOWERS ROUTES
//
// Get followers and followings of a given user
userRouter.get(
	"/users/follows/:id",
	validateParams("id"),
	controllerwrapper(userController.getFollowersAndFollowsFromUser),
);

// Get followers and followings of the authenticated user
userRouter.get("/me/follows", authenticate, async (req, res, next) => {
	req.params.id = req.user.id;
	return userController.getFollowersAndFollowsFromUser(req, res, next);
});

// Follow a user
userRouter.post(
	"/me/follow/:userId",
	authenticate,
	validateParams("userId"),
	controllerwrapper(userController.followUser),
);

// Unfollow a user
userRouter.delete(
	"/me/follow/:userId",
	authenticate,
	validateParams("userId"),
	controllerwrapper(userController.unfollowUser),
);
