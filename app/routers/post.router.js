import { Router } from "express";
import { postController } from "../controllers/post.controller.js";
import { propositionController } from "../controllers/proposition.controller.js";
import { authenticate } from "../middlewares/authenticate.js";
import { controllerwrapper } from "../middlewares/controllerwrapper.js";
import { validateParams } from "../middlewares/validateParams.js";
import { validate } from "../middlewares/validates.js";
import { postSchema } from "../schemas/post.schema.js";
import { propositionSchema } from "../schemas/proposition.schema.js";

export const postRouter = Router();

// /posts -> Get all posts
postRouter.route("/posts").get(controllerwrapper(postController.getPosts));

// /posts/:id -> user-specific posts
postRouter.get(
	"/posts/:id",
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

// /me/propositions -> Routes related to authenticated user's
postRouter
	.route("/me/propositions")
	.get(
		authenticate,
		controllerwrapper(propositionController.getUserSentPropositions),
	);

// /me/propositions/:postId -> user's propositions
postRouter.post(
	"/me/propositions/:postId",
	authenticate,
	validateParams("postId"),
	validate(propositionSchema),
	controllerwrapper(propositionController.sendPropositionToPost),
);

// /proposition/:id/accept -> Accepting a proposition
postRouter.patch(
	"/propositions/:id/accept",
	authenticate,
	controllerwrapper(propositionController.acceptProposition),
);
