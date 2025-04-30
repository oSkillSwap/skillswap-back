import { Router } from "express";
import { postController } from "../controllers/post.controller.js";
import { propositionController } from "../controllers/proposition.controller.js";
import { authenticate } from "../middlewares/authenticate.js";
import { controllerwrapper } from "../middlewares/controllerwrapper.js";
import { validateParams } from "../middlewares/validateParams.js";
import { validate } from "../middlewares/validates.js";
import { postSchema } from "../schemas/post.schema.js";

export const postRouter = Router();

// /posts -> Get all posts
postRouter.route("/posts").get(controllerwrapper(postController.getPosts));

// /posts/:id -> user-specific posts
postRouter.get(
	"/posts/:id",
	validateParams("id"),
	controllerwrapper(postController.getPostsFromUser),
);

// /me/posts -> posts related to authenticated user's
postRouter
	.route("/me/posts")
	.get(authenticate, controllerwrapper(postController.getPostFromLoggedUser))
	// Get posts from logged-in user
	.post(
		authenticate,
		validate(postSchema),
		controllerwrapper(postController.createPost),
	); // Create a new post
