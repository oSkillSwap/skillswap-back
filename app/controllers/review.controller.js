import { Op } from "sequelize";
import { Post, Proposition, Review, User } from "../models/associations.js";

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
      return res.status(404).json({ message: "Utilisateur non trouvé" });
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
};
