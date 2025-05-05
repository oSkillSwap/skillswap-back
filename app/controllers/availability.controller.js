import { Availability } from "../models/associations.js";

export const availabilityController = {
	getAvailabilities: async (req, res, _) => {
		const availabilities = await Availability.findAll();

		return res.status(200).json({ availabilities });
	},
};
