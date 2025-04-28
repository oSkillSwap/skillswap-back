import { Router } from "express";
import { reviewController } from "../controllers/review.controller.js";
import { controllerwrapper } from "../middlewares/controllerwrapper.js";
import { validateParams } from "../middlewares/validateParams.js";

export const reviewRouter = Router();

//  /reviews
reviewRouter
	.route("/reviews")
	.get(controllerwrapper(reviewController.getReviews)) // Get all reviews
	.post(controllerwrapper(reviewController.createReview)); // Create a new review

// /reviews/:id -> user-specific reviews
reviewRouter.get(
	"/reviews/:id",
	validateParams("id"),
	controllerwrapper(reviewController.getReviewsFromUser),
);
