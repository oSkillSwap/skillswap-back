import { Router } from "express";
import { skillController } from "../controllers/skill.controller.js";
import { controllerwrapper } from "../middlewares/controllerwrapper.js";
import { validate } from "../middlewares/validates.js";
import { authenticate } from "../middlewares/authenticate.js";
import {
	updateUserSkillsSchema,
	updateWantedSkillsSchema,
} from "../schemas/skill.schema.js";

export const skillRouter = Router();

skillRouter.get("/skills", controllerwrapper(skillController.getSkills));

// /me/wanted-skills
skillRouter.put(
	"/me/wanted-skills",
	authenticate,
	validate(updateWantedSkillsSchema),
	controllerwrapper(skillController.updateUserWantedSkills),
);

// /me/skills
skillRouter.patch(
	"/me/skills",
	authenticate,
	validate(updateUserSkillsSchema),
	controllerwrapper(skillController.updateUserSkills),
);
