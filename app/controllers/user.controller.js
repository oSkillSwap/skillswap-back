import { Sequelize } from "sequelize";
import { User } from "../models/associations.js";

export const userController = {
  getUsers: async (req, res, next) => {
    // Fetch all users who are not banned, available, and have the role "member"
    const users = await User.findAll({
      where: {
        isBanned: false, // Ensure the user is not banned
        role: "member", // Only include users with the "member" role
        isAvailable: true, // Ensure the user is available
      },
      attributes: {
        // Excluse password, email, updatedAt and createdAt fields
        exclude: ["password", "email", "updatedAt", "createdAt"],
        include: [
          // Calculate the average grade of the user from their reviews
          [Sequelize.fn("AVG", Sequelize.col("Reviews.grade")), "averageGrade"],
          // Count the number of reviews the user has
          [
            Sequelize.fn("COUNT", Sequelize.col("Reviews.grade")),
            "nbOfReviews",
          ],
        ],
      },
      include: [
        {
          association: "Skills", // Include the user's skills
          attributes: ["id", "name"],
          through: { attributes: [] }, // Exclude join table attributes
        },
        {
          association: "WantedSkills", // Include the user's wanted skills
          attributes: ["id", "name"],
          through: { attributes: [] }, // Exclude join table attributes
        },
        {
          association: "Reviews", // Include reviews
          attributes: [], // No need to fetch review details
        },
      ],
      group: ["User.id", "Skills.id", "WantedSkills.id"], // Group by user and related entities,
      // Sort users based on the total number of reviews they have
      order: [["nbOfReviews", "DESC"]],
    });

    return res.status(200).json({ users });
  },
};
