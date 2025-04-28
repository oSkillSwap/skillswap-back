import { Router } from "express";
import { availabilityController } from "../controllers/availability.controller.js";
import { controllerwrapper } from "../middlewares/controllerwrapper.js";

export const availabilityRouter = Router();

availabilityRouter.get(
	"/availabilities",
	controllerwrapper(availabilityController.getAvailabilities),
);
