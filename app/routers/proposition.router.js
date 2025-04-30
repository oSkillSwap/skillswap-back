import { Router } from "express";
import { propositionController } from "../controllers/proposition.controller.js";
import { controllerwrapper } from "../middlewares/controllerwrapper.js";
import { validateParams } from "../middlewares/validateParams.js";
import { validate } from "../middlewares/validates.js";
import { propositionSchema } from "../schemas/proposition.schema.js";
import { authenticate } from "../middlewares/authenticate.js";

export const propositionRouter = Router();

propositionRouter.get(
	"/propositions/:userId",
	validateParams("userId"),
	controllerwrapper(propositionController.getProposition),
);

// /me/propositions -> Routes related to authenticated user's
propositionRouter
	.route("/me/propositions")
	.get(
		authenticate,
		controllerwrapper(propositionController.getUserSentPropositions),
	);

// /me/propositions/:postId -> user's propositions
propositionRouter.post(
	"/me/propositions/:postId",
	authenticate,
	validateParams("postId"),
	validate(propositionSchema),
	controllerwrapper(propositionController.sendPropositionToPost),
);

// /proposition/:id/accept -> Accepting a proposition
propositionRouter.patch(
	"/propositions/:id/accept",
	authenticate,
	controllerwrapper(propositionController.acceptProposition),
);
