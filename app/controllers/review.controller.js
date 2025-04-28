import { Op } from "sequelize";
import { NotFoundError } from "../errors/not-found-error.js";
import { ForbiddenError } from "../errors/forbidden-error.js";
import { ValidationError } from "../errors/validation-error.js";
import { Post, Proposition, Review, User } from "../models/associations.js";
import { reviewSchema } from "../schemas/review.schema.js";

export const reviewController = {
	getReviews: async (req, res, next) => {
		const reviews = await Review.findAll({
			where: {
				content: {
					[Op.not]: null, // Ensures only reviews with content are fetched
				},
			},
			attributes: {
				exclude: ["user_id", "proposition_id"],
			},
			include: [
				{
					association: "Reviewer", // Include Reviewer
					attributes: {
						exclude: ["password"], // Exclude sensitive password field
					},
					where: {
						isBanned: false, // Only include reviewers who are not banned
					},
				},
			],
			order: [["createdAt", "DESC"]], // Sort reviews by grade in descending order,
			limit: 6, // Limit to 6 reviews
		});

		return res.status(200).json({ reviews });
	},
	getReviewsFromUser: async (req, res, next) => {
		const { id } = req.params;

		const user = await User.findByPk(id);

		if (!user) {
			return next(new NotFoundError("Utilisateur non trouvé"));
		}

		const reviews = await Review.findAll({
			include: [
				{
					association: "Reviewer",
					attributes: ["id", "username"],
				},
				{
					model: Proposition,
					required: true,
					include: {
						model: Post,
						required: true,
						where: { user_id: id },
						attributes: ["id", "title"],
						include: {
							association: "Author",
						},
					},
				},
			],
		});

		return res.status(200).json({ reviews });
	},

	updateReview: async (req, res, next) => {
		const { reviewId } = req.params;
		const { grade, content } = req.validatedData;
		const userId = req.user.id;

		const review = await Review.findByPk(reviewId);

		if (!review) {
			return next(new NotFoundError("Review non trouvée"));
		}

		if (review.user_id !== userId) {
			return next(
				new ForbiddenError("Vous ne pouvez modifier que vos propres reviews"),
			);
		}

		await review.update({ grade, content });

		return res
			.status(200)
			.json({ message: "Review mise à jour avec succès", review });
	},

	createReview: async (req, res, next) => {
		const userId = req.user.id;

		//Zod Validation
		const result = reviewSchema.safeParse(req.body);
		if (!result.success) {
			const errors = result.error.errors.map((e) => e.message).join(", ");
			throw new ValidationError(errors);
		}

		const { postId, propositionId, grade, title, comment } = result.data;

		// Check Post's existence && isClosed
		const post = await Post.findByPk(postId);
		if (!post) {
			return next(new NotFoundError("Annonce non trouvée"));
		}

		if (!post.isClosed) {
			return next(
				new ForbiddenError("L'annonce doit etre fermée pour laisser un avis"),
			);
		}

		// Check Accepted proposition belongs to the post
		const proposition = await Proposition.findOne({
			where: {
				id: propositionId,
				post_id: postId,
				state: "acceptée",
			},
		});
		if (!proposition) {
			return next(new NotFoundError("La proposition doit être acceptée"));
		}

		// Check user is the post owner
		if (post.user_id !== userId) {
			return next(
				new ForbiddenError(
					"Vous n'avez pas le droit de laisser un avis sur cette annonce",
				),
			);
		}

		// Create the review
		const review = await Review.create({
			grade,
			title,
			comment,
			reviewer_id: userId,
			reviewed_id: proposition.user_id,
			post_id: postId,
		});

		res.status(201).json(review);
	},
};
