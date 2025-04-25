import { Op, Sequelize } from "sequelize";
import { Post, Proposition, Skill } from "../models/associations.js";

export const postController = {
  getPostsFromUser: async (req, res, next) => {
    const { id } = req.params;

    const posts = await Post.findAll({
      exclude: ["user_id", "skill_id"],
      include: [
        {
          association: "Author",
          attributes: ["id", "username"],
          where: { id },
        },
        {
          attributes: ["id", "name"],
          association: "SkillWanted",
        },
      ],
    });
    return res.json({ posts });
  },
};
