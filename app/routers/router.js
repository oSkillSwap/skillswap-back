// Comment
import { Router } from "express";
import { userController } from "../controllers/user.controller.js";
import { controllerwrapper } from "../middlewares/controllerwrapper.js";

export const router = Router();

router.get("/users/", controllerwrapper(userController.getUsers));
