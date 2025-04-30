import { Router } from "express";
import { categoryController } from "../controllers/category.controller.js";
import { controllerwrapper } from "../middlewares/controllerwrapper.js";

export const categoryRouter = Router();

categoryRouter.get(
	"/categories",
	controllerwrapper(categoryController.getCategories),
);
