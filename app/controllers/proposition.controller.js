import sanitize from "sanitize-html";
import { Op, Sequelize, ValidationError } from "sequelize";
import validator from "validator";
import { sequelize } from "../data/client.js";
import { BadRequestError } from "../errors/badrequest-error.js";
import { ForbiddenError } from "../errors/forbidden-error.js";
import { NotFoundError } from "../errors/not-found-error.js";
import { UnauthorizedError } from "../errors/unauthorized-error.js";
import { sanitizeString } from "../helpers/sanitize.js";
import { validate } from "../middlewares/validates.js";
import { Post, Proposition, User } from "../models/associations.js";

export const propositionController = {
	// Get all propositions sent to the logged-in user
	getUserSentPropositions: async (req, res, _) => {
		const user = req.user; // Get the logged-in user
		const propositions = await Proposition.findAll({
			where: { sender_id: user.id }, // Find propositions where the user is the receiver
			include: [
				{
					required: true,
					association: "Receiver", // Include the receiver details
					attributes: {
						include: [
							"id",
							"username",
							// Calculate the average grade of reviews for the receiver
							[
								Sequelize.fn("AVG", sequelize.col("Receiver->Reviews.grade")),
								"averageGrade",
							],
							// Count the number of reviews for the receiver
							[
								Sequelize.fn("COUNT", sequelize.col("Receiver->Reviews.grade")),
								"nbOfReviews",
							],
						],
					},
					include: {
						association: "Reviews", // Include reviews for the receiver
						attributes: [], // Do not return review attributes
					},
				},
				{
					model: Post, // Include the related post
					include: {
						association: "SkillWanted", // Include the skill wanted in the post
						attributes: ["id", "name"], // Return skill ID and name
					},
				},
			],
			group: [
				"Proposition.id", // Group by proposition ID
				"Receiver.id", // Group by receiver ID
				"Post.id", // Group by post ID
				"Post->SkillWanted.id", // Group by skill wanted ID
			],
		});

		return res.status(200).json({ propositions }); // Return the propositions
	},

	// Send a proposition to a specific post
	sendPropositionToPost: async (req, res, next) => {
		const { postId } = req.params; // Get the post ID from the request parameters
		const user = req.user; // Get the logged-in user

		if (!user) {
			// If the user is not authenticated, return an error
			return next(new UnauthorizedError("Utilisateur non authentifié"));
		}

		const post = await Post.findByPk(postId); // Find the post by its ID

		if (!post) {
			// If the post does not exist, return an error
			return next(new NotFoundError("Annonce non trouvée"));
		}

		if (post.user_id === user.id) {
			// If the user is the owner of the post, return an error
			return next(
				new BadRequestError(
					"Vous ne pouvez pas envoyer une proposition à votre propre annonce",
				),
			);
		}

		if (post.isClosed) {
			// If the post is closed, return an error
			return next(
				new ForbiddenError("Cette annonce n'accepte plus de proposition"),
			);
		}

		const existingProposition = await Proposition.findAll({
			where: {
				sender_id: user.id, // Check if the user already sent a proposition
				receiver_id: post.user_id,
				post_id: post.id,
			},
		});

		for (const proposition of existingProposition) {
			if (proposition) {
				if (proposition.state === "en attente")
					// If a proposition already exists, return an error
					return next(
						new BadRequestError(
							"Vous avez déjà envoyé une proposition pour cette annonce",
						),
					);
			}
		}

		const { content } = req.validatedData; // Get the validated content from the request

		const sanitizedContent = sanitizeString(content); // Sanitize the content

		if (!sanitizedContent.trim()) {
			// If the sanitized content is empty, return an error
			return next(
				new ValidationError(
					"Le contenu de la proposition ne doit pas être vide",
				),
			);
		}

		const newProposition = await Proposition.create({
			content: sanitizedContent, // Save the sanitized content
			state: "en attente", // Set the initial state to "pending"
			sender_id: user.id, // Set the sender ID
			post_id: post.id, // Set the post ID,
			receiver_id: post.user_id,
		});

		return res.status(201).json({
			// Return a success message and the new proposition
			message: `Proposition bien envoyé à l'annonce: ${post.title}`,
			newProposition,
		});
	},

	// Accept a proposition for a specific post
	acceptProposition: async (req, res, next) => {
		const propositionId = Number(req.params.id);
		const userId = req.user.id;

		// Find the proposition
		const proposition = await Proposition.findByPk(propositionId, {
			include: [{ model: Post }],
		});

		if (!proposition) {
			throw new NotFoundError("Proposition not found");
		}

		const post = proposition.Post;

		// Check if the user is the post owner
		if (post.user_id !== userId) {
			throw new ForbiddenError(
				"Vous n'etes pas le propriétaire de cette annonce",
			);
		}

		// Accepted the proposition
		proposition.state = "acceptée";
		await proposition.save();

		// Refusing all other propositions for the same post
		await Proposition.update(
			{ status: "refusée" },
			{
				where: {
					post_id: post.id,
					id: { [Op.ne]: propositionId }, // All except the accepted one
				},
			},
		);

		// Close the post
		post.isClosed = true;
		await post.save();

		res
			.status(200)
			.json({ message: "Proposition acceptée and Annonce fermée." });
	},
};
