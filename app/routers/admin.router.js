import { Router } from "express";
import { authenticate } from "../middlewares/authenticate.js";
import { isAdmin } from "../middlewares/isAdmin.js";
import { adminController } from "../controllers/admin.controller.js";
import { controllerwrapper } from "../middlewares/controllerwrapper.js";
import { validateParams } from "../middlewares/validateParams.js";
import { validate } from "../middlewares/validates.js";
import { updateSkillSchema } from "../schemas/skill.schema.js";
import {
  updateUserAdminSchema,
  updateCategoryAdminSchema,
  createCategoryAdminSchema,
} from "../schemas/admin.schema.js";
import { skillController } from "../controllers/skill.controller.js";

export const adminRouter = Router();

adminRouter.get(
  "/admin/dashboard",
  authenticate,
  isAdmin,
  controllerwrapper(adminController.getDashboard),
);

adminRouter.get("/admin/users", authenticate, isAdmin, controllerwrapper(adminController.getUsers));

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

adminRouter
  .get("/admin/category", authenticate, isAdmin, controllerwrapper(adminController.getCategories))
  .post(
    "/admin/category",
    authenticate,
    isAdmin,
    validate(createCategoryAdminSchema),
    controllerwrapper(adminController.createCategory),
  );

adminRouter
  .patch(
    "/admin/category/:id",
    authenticate,
    isAdmin,
    validateParams("id"),
    validate(updateCategoryAdminSchema),
    controllerwrapper(adminController.updateCategories),
  )
  .delete(
    "/admin/category/:id",
    authenticate,
    isAdmin,
    validateParams("id"),
    controllerwrapper(adminController.deleteCategories),
  );

adminRouter.post(
  "/admin/skill",
  authenticate,
  isAdmin,
  controllerwrapper(skillController.createSkill),
);

adminRouter
  .patch(
    "/admin/skills/:id",
    authenticate,
    isAdmin,
    validateParams("id"),
    validate(updateSkillSchema),
    controllerwrapper(skillController.updateSkill),
  )
  .delete(
    "/admin/skills/:id",
    authenticate,
    isAdmin,
    validateParams("id"),
    controllerwrapper(skillController.deleteSkill),
  );
