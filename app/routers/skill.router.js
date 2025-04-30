import { Router } from "express";
import { skillController } from "../controllers/skill.controller.js";
import { controllerwrapper } from "../middlewares/controllerwrapper.js";

export const skillRouter = Router();

skillRouter.get("/skills", controllerwrapper(skillController.getSkills));
