import { Op, where } from "sequelize";
import { Review } from "../models/associations.js";

export const reviewController = {
  getReviews: async (req, res, next) => {
    const reviews = await Review.findAll({
      where: {
        content: {
          [Op.not]: null, // Ensures only reviews with content are fetched
        },
      },
      order: [["createdAt", "DESC"]], // Sort reviews by grade in descending order
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
    });

    return res.status(200).json({ reviews });
  },
};
