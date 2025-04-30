import { z } from "zod";
import sanitizeHtml from "sanitize-html";

const cleanHTML = (val) =>
	sanitizeHtml(val, {
		allowedTags: ["b", "i", "em", "strong", "p", "ul", "li", "br"],
		allowedAttributes: {},
		disallowedTagsMode: "discard",
	});

export const registerSchema = z.object({
	username: z
		.string()
		.trim()
		.min(3)
		.max(16)
		.regex(/^[a-zA-Z0-9-]+$/, {
			message:
				"Le nom d'utilisateur ne peut contenir que des lettres, des chiffres ou des tirets",
		}),
	lastName: z.string().trim().max(50).optional(),
	firstName: z.string().trim().max(50).optional(),
	email: z.string().trim().email(),
	password: z
		.string()
		.min(8)
		.regex(/[a-z]/)
		.regex(/[A-Z]/)
		.regex(/[0-9]/)
		.regex(/[^a-zA-Z0-9]/),
	avatar: z.string().optional().default("/avatar/avatar1.png"),
	role: z.enum(["admin", "member"]).optional(),
	description: z.string().trim().max(800).transform(cleanHTML).optional(),
});

export const loginSchema = z.object({
	email: z.string().trim().email(),
	password: z.string().min(1),
});

export const updateUserSchema = z.object({
	username: z
		.string()
		.trim()
		.min(3)
		.max(16)
		.regex(/^[a-zA-Z0-9-]+$/)
		.optional(),
	firstName: z.string().trim().max(50).optional(),
	lastName: z.string().trim().max(50).optional(),
	email: z.string().trim().email().optional(),
	avatar: z.string().optional(),
	description: z.string().trim().max(800).transform(cleanHTML).optional(),
});

export const updateWantedSkillsSchema = z.object({
	wantedSkills: z.array(z.number()).min(1),
});

export const updateUserSkillsSchema = z.object({
	skills: z
		.array(z.number(), {
			required_error: "Les compétences doivent être sous forme de tableau",
		})
		.refine((skills) => skills.length > 0, {
			message: "Vous devez sélectionner au moins une compétence",
		}),
});

export const updateReviewSchema = z.object({
	grade: z.number().min(1).max(5),
	content: z.string().min(10).max(1000),
});
