import { Category, Skill } from "../models/associations.js";

export const categoryController = {
  getCategories: async (req, res, next) => {
    const categories = await Category.findAll({
      include: {
        model: Skill,
        attributes: ["id", "name"],
      },
    });

    res.status(200).json({ categories });
  },
};
