import { Category, Skill, User } from "../models/associations.js";

export const skillController = {
	getSkills: async (req, res) => {
		const skills = await Skill.findAll({
			attributes: ["id", "name"],
			include: {
				model: Category,
				attributes: ["id", "name"],
			},
		});

		return res.status(200).json({ skills });
	},

	updateUserWantedSkills: async (req, res, next) => {
		const userId = req.user.id;
		const { wantedSkills } = req.validatedData;

		const user = await User.findByPk(userId);
		if (!user) {
			return next(new NotFoundError("Utilisateur non trouvé")); // If user not found, return error
		}

		await user.setWantedSkills(wantedSkills); // Update the user's wanted skills

		return res
			.status(200)
			.json({ message: "Compétences souhaitées mises à jour" }); // Return success message
	},

	updateUserSkills: async (req, res, next) => {
		const userId = req.user.id;
		const { skills } = req.validatedData;
		const user = await User.findByPk(userId);

		if (!user) {
			return next(new NotFoundError("Utilisateur non trouvé"));
		}

		await user.setSkills(skills); // Update the user's skills

		return res
			.status(200)
			.json({ message: "Compétences mises à jour avec succès" });
	},
};
