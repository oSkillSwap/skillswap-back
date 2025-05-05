import { Router } from "express";
import { reviewController } from "../controllers/review.controller.js";
import { controllerwrapper } from "../middlewares/controllerwrapper.js";
import { validateParams } from "../middlewares/validateParams.js";
import { authenticate } from "../middlewares/authenticate.js";
import { validate } from "../middlewares/validates.js";
import { reviewSchema } from "../schemas/review.schema.js";

export const reviewRouter = Router();

//
// PUBLIC REVIEWS ROUTES
//

// Get latest public reviews (with content)
reviewRouter.get("/reviews", controllerwrapper(reviewController.getReviews));

// Get all reviews related to a specific user ID
reviewRouter.get(
	"/reviews/:id",
	validateParams("id"),
	controllerwrapper(reviewController.getReviewsFromUser),
);

//
// AUTHENTICATED USER REVIEWS ROUTES
//

// Create a new review as the authenticated user
reviewRouter.post(
	"/me/reviews",
	authenticate,
	validate(reviewSchema),
	controllerwrapper(reviewController.createReview),
);
