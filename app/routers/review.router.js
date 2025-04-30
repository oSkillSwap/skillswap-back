import { Router } from "express";
import { reviewController } from "../controllers/review.controller.js";
import { controllerwrapper } from "../middlewares/controllerwrapper.js";
import { validateParams } from "../middlewares/validateParams.js";
import { authenticate } from "../middlewares/authenticate.js";
import { reviewSchema, updateReviewSchema } from "../schemas/review.schema.js";
import { validate } from "../middlewares/validates.js";

export const reviewRouter = Router();

//  /reviews
reviewRouter
	.route("/reviews")
	.get(controllerwrapper(reviewController.getReviews)); // Get all reviews

// Create a review
reviewRouter
	.route("/me/reviews")
	.post(
		authenticate,
		validate(reviewSchema),
		controllerwrapper(reviewController.createReview),
	);

// /reviews/:id -> user-specific reviews
reviewRouter.get(
	"/reviews/:id",
	validateParams("id"),
	controllerwrapper(reviewController.getReviewsFromUser),
);

// /me/reviews/:userId -> update review I made
reviewRouter.patch(
	"/me/reviews/:reviewId",
	authenticate,
	validateParams("reviewId"),
	validate(updateReviewSchema),
	controllerwrapper(reviewController.updateReview),
);
