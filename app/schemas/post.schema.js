import { z } from "zod";
import sanitizeHtml from "sanitize-html";

const sanitizeTextarea = (field) =>
	z
		.string()
		.trim()
		.min(1, { message: "Le titre ne peut pas être vide" })
		.max(40, { message: "Le titre ne peut pas dépasser 40 caractères" });

export const postSchema = z.object({
	title: sanitizeTextarea(z.string())
		.min(1, { message: "Le titre ne peut pas être vide" })
		.max(40, { message: "Le titre ne peut pas dépasser 40 caractères" }),

	content: sanitizeTextarea(z.string())
		.min(1, {
			message: "Le contenu ne peut pas être vide",
		})
		.max(500, {
			message: "Le contenu ne peut pas dépasser 200 caractères",
		}),

	skill_id: z
		.number()
		.int({
			message: "L'identifiant de la compétence doit être un nombre entier",
		})
		.positive({
			message: "L'identifiant de la compétence doit être un nombre positif",
		}),
});
