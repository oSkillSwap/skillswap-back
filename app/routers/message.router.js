import { Router } from "express";
import { messageController } from "../controllers/message.controller.js";
import { authenticate } from "../middlewares/authenticate.js";
import { controllerwrapper } from "../middlewares/controllerwrapper.js";
import { validate } from "../middlewares/validates.js";
import { validateParams } from "../middlewares/validateParams.js";
import { messageSchema } from "../schemas/message.schema.js";

export const messageRouter = Router();

// /me/messages -> Get all messages related to authenticated user's
messageRouter.get(
	"/me/messages",
	authenticate,
	controllerwrapper(messageController.getMessages),
);

// /me/messages/:userId
messageRouter
	.route("/me/messages/:userId")
	// Get all messages between two users
	.get(
		authenticate,
		validateParams("userId"),
		controllerwrapper(messageController.getConversation),
	)
	// Send a message to a user
	.post(
		authenticate,
		validateParams("userId"),
		validate(messageSchema),
		messageController.createMessage,
	);
