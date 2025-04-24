import { Category } from "../models/associations.js";

export const categoryontroller = {
  getCategories: async (req, res, next) => {
    const categories = await Category.findAll();

    return res.status(200).json({ categories });
  },
};
