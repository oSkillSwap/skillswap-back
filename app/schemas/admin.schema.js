import { z } from "zod";
import sanitizeHtml from "sanitize-html";

const sanitizeTextarea = (val) =>
	sanitizeHtml(val.trim(), {
		allowedTags: ["b", "i", "em", "strong", "p", "ul", "li", "ol", "br"],
		allowedAttributes: {},
	});

export const updateUserAdminSchema = z.object({
	username: z
		.string()
		.min(3, "Le nom d'utilisateur est requis")
		.max(25, "Maximum 25 caractères")
		.regex(
			/^[a-zA-Z0-9-]+$/,
			"Le nom d'utilisateur ne peut contenir que des lettres, des chiffres ou des tirets",
		)
		.optional()
		.transform((val) => (val ? sanitizeHtml(val.trim()) : undefined)),

	firstName: z
		.string()
		.max(50, "Maximum 50 caractères")
		.optional()
		.transform((val) => (val ? sanitizeHtml(val.trim()) : undefined)),

	lastName: z
		.string()
		.max(50, "Maximum 50 caractères")
		.optional()
		.transform((val) => (val ? sanitizeHtml(val.trim()) : undefined)),

	avatar: z.string().optional(),

	description: z
		.string()
		.max(800, "Maximum 800 caractères")
		.optional()
		.transform((val) => (val ? sanitizeTextarea(val) : undefined)),

	role: z.enum(["admin", "member"]).optional(),

	isBanned: z.boolean().optional(),
	isAvailable: z.boolean().optional(),

	messages: z
		.array(
			z.object({
				id: z.number({ required_error: "L'id est requis pour chaque message" }),
				content: z.string().min(1, "Le contenu est requis").optional(),
				action: z.enum(["update", "delete"]),
			}),
		)
		.optional(),

	reviews: z
		.array(
			z.object({
				id: z.number({ required_error: "L'id est requis pour chaque review" }),
				grade: z.number().min(1).max(5).optional(),
				content: z.string().max(1000).optional(),
				action: z.enum(["update", "delete"]),
			}),
		)
		.optional(),
});
