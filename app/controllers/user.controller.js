import { Sequelize } from "sequelize";
import { User } from "../models/associations.js";

export const userController = {
  getUsers: async (req, res, next) => {
    const users = await User.findAll({
      where: {
        isBanned: false,
        role: "member",
        isAvailable: true,
      },
      attributes: [
        "id",
        "username",
        "description",
        "firstName",
        "lastName",
        "avatar",
        [Sequelize.fn("AVG", Sequelize.col("Reviews.grade")), "averageGrade"],
        [Sequelize.fn("COUNT", Sequelize.col("Reviews.grade")), "nbOfReviews"],
      ],
      include: [
        {
          association: "Skills",
          attributes: ["id", "name"],
          through: { attributes: [] },
        },
        {
          association: "WantedSkills",
          attributes: ["id", "name"],
          through: { attributes: [] },
        },
        {
          association: "Reviews",
          attributes: [],
        },
      ],
      group: ["User.id", "Skills.id", "WantedSkills.id"],
    });

    return res.status(200).json({ users });
  },
};
