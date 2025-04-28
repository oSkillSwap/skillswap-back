import { Sequelize } from "sequelize";
import { sequelize } from "../data/client.js";
import { Post, Proposition, User } from "../models/associations.js";

export const propositionController = {
  getUserSentPropositions: async (req, res, _) => {
    const user = req.user;
    const propositions = await Proposition.findAll({
      where: { receiver_id: user.id },
      include: [
        {
          required: true,
          association: "Receiver",
          attributes: {
            include: [
              "id",
              "username",
              [
                Sequelize.fn("AVG", sequelize.col("Receiver->Reviews.grade")),
                "averageGrade",
              ],
              [
                Sequelize.fn("COUNT", sequelize.col("Receiver->Reviews.grade")),
                "nbOfReviews",
              ],
            ],
          },
          include: {
            association: "Reviews",
            attributes: [],
          },
        },
        {
          model: Post,
          include: {
            association: "SkillWanted",
            attributes: ["id", "name"],
          },
        },
      ],
      group: [
        "Proposition.id",
        "Receiver.id",
        "Post.id",
        "Post->SkillWanted.id",
      ],
    });

    return res.status(200).json({ propositions });
  },
  sendPropositionToPost: async (req, res, next) => {},
};
