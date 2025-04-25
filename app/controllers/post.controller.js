import { Op, Sequelize } from "sequelize";
import { Post, Proposition, Skill, User } from "../models/associations.js";

export const postController = {
  getPostsFromUser: async (req, res, next) => {
    const { id } = req.params;

    // Find the user by their primary key (id)
    const user = await User.findByPk(id);
    if (!user) {
      // If user is not found, return a 404 error
      return res.status(404).json({ message: "Aucun utilisateur trouvé" });
    }

    // Find all posts created by the user
    const posts = await Post.findAll({
      exclude: ["user_id", "skill_id"], // Exclude these fields from the result
      include: [
        {
          association: "Author", // Include the author of the post
          attributes: ["id", "username"], // Only return id and username of the author
          where: { id }, // Filter posts by the user id
        },
        {
          attributes: ["id", "name"], // Only return id and name of the skill
          association: "SkillWanted", // Include the skill wanted in the post
        },
      ],
    });
    return res.json({ posts }); // Return the posts as JSON
  },
  getPosts: async (req, res, next) => {
    // Find all posts with additional information
    const posts = await Post.findAll({
      include: [
        {
          association: "SkillWanted", // Include the skill wanted in the post
        },
        {
          association: "Author", // Include the author of the post
          attributes: [
            "id",
            "username",
            // Calculate the average grade of the author's reviews
            [
              Sequelize.fn("AVG", Sequelize.col("Author->Reviews.grade")),
              "averageGrade",
            ],
            // Count the number of reviews the author has
            [
              Sequelize.fn("COUNT", Sequelize.col("Author->Reviews.grade")),
              "nbOfReviews",
            ],
          ],
          include: {
            association: "Reviews", // Include the reviews of the author
            attributes: [], // Do not return any attributes from reviews
          },
        },
      ],
      // Group by these fields to avoid duplicate rows
      group: ["Post.id", "SkillWanted.id", "Author.id"],
    });

    return res.status(200).json({ posts }); // Return the posts as JSON
  },
};
