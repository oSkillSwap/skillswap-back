import { Router } from "express";
import { authenticate } from "../middlewares/authenticate.js";
import { isAdmin } from "../middlewares/isAdmin.js";
import { adminController } from "../controllers/adminController.js";
import { controllerwrapper } from "../middlewares/controllerwrapper.js";
import { validateParams } from "../middlewares/validateParams.js";
import { validate } from "../middlewares/validates.js";
import { updateUserAdminSchema } from "../schemas/admin.schema.js";

export const adminRouter = Router();

adminRouter.get(
	"/admin/dashboard",
	authenticate,
	isAdmin,
	controllerwrapper(adminController.getDashboard),
);

adminRouter.get(
	"/admin/users",
	authenticate,
	isAdmin,
	controllerwrapper(adminController.getUsers),
);

adminRouter
	.get(
		"/admin/users/:userId",
		authenticate,
		isAdmin,
		validateParams("userId"),
		controllerwrapper(adminController.getOneUser),
	)
	.patch(
		"/admin/users/:userId",
		authenticate,
		isAdmin,
		validateParams("userId"),
		validate(updateUserAdminSchema),
		controllerwrapper(adminController.updateUser),
	);

adminRouter.get(
	"/admin/category",
	authenticate,
	isAdmin,
	controllerwrapper(adminController.getCategories),
);
