import { z } from "zod";

export const updateWantedSkillsSchema = z.object({
	wantedSkills: z
		.array(
			z.preprocess(
				(val) => (typeof val === "string" ? Number(val) : val),
				z.number({
					invalid_type_error:
						"Chaque compétence doit être un identifiant numérique",
				}),
			),
		)
		.min(1, "Veuillez sélectionner au moins une compétence")
		.refine((arr) => arr.every((id) => Number.isInteger(id)), {
			message: "Chaque compétence doit être un identifiant entier",
		}),
});

export const updateUserSkillsSchema = z.object({
	skills: z
		.array(
			z.preprocess(
				(val) => (typeof val === "string" ? Number(val) : val),
				z.number({
					invalid_type_error:
						"Chaque compétence doit être un identifiant numérique",
				}),
			),
		)
		.min(1, "Vous devez sélectionner au moins une compétence")
		.refine((arr) => arr.every((id) => Number.isInteger(id)), {
			message: "Chaque compétence doit être un identifiant entier",
		}),
});
