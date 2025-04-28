import { Router } from "express";
import { reviewController } from "../controllers/review.controller.js";
import { controllerwrapper } from "../middlewares/controllerwrapper.js";
import { validateParams } from "../middlewares/validateParams.js";
import { authenticate } from "../middlewares/authenticate.js";

export const reviewRouter = Router();

//  /reviews
reviewRouter
	.route("/reviews")
	.get(controllerwrapper(reviewController.getReviews)); // Get all reviews

// Create a review
reviewRouter
	.route("/me/reviews")
	.post(authenticate, controllerwrapper(reviewController.createReview));

// /reviews/:id -> user-specific reviews
reviewRouter.get(
	"/me/reviews/:id",
	authenticate,
	validateParams("id"),
	controllerwrapper(reviewController.getReviewsFromUser),
);
