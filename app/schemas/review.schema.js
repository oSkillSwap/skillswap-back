import { z } from "zod";

export const reviewSchema = z.object({
	postId: z.number({
		required_error: "Annonce obligatoire",
	}),
	propositionId: z.number({
		required_error: "Une review oit appartenir a un echange",
	}),
	grade: z
		.number()
		.min(1, "La note doit etre comprise entre 1 et 5")
		.max(5, "La note doit etre comprise entre 1 et 5"),
	comment: z.string().max(500).optional().nullable(),
	title: z.string().min(3).max(255),
});
