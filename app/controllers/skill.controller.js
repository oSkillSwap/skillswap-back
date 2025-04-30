import { Category, Skill } from "../models/associations.js";

export const skillController = {
  getSkills: async (req, res) => {
    const skills = await Skill.findAll({
      attributes: ["id", "name"],
      include: {
        model: Category,
        attributes: ["id", "name"],
      },
    });

    return res.status(200).json({ skills });
  },
};
