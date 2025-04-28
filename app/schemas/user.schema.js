import { z } from "zod";

// Schema for registration with rules
export const registerSchema = z.object({
	username: z
		.string()
		.min(1, "Le nom d'utilisateur est requis")
		.max(16, "Maximum 16 caractères")
		.regex(
			/^[a-zA-Z0-9-]+$/,
			"Le nom d'utilisateur ne peut contenir que des lettres, des chiffres ou des tirets",
		),
	lastName: z.string().optional(),
	firstName: z.string().optional(),
	email: z.string().email("Adresse e-mail invalide"),
	password: z
		.string()
		.min(8, "Le mot de passe doit faire au moins 8 caractères")
		.regex(
			/[a-z]/,
			"Le mot de passe doit contenir au moins une lettre minuscule",
		)
		.regex(
			/[A-Z]/,
			"Le mot de passe doit contenir au moins une lettre majuscule",
		)
		.regex(/[0-9]/, "Le mot de passe doit contenir au moins un chiffre")
		.regex(
			/[^a-zA-Z0-9]/,
			"Le mot de passe doit contenir au moins un caractère spécial",
		),
	avatar: z.string().optional().default("/avatar/avatar1.png"),
	role: z.enum(["admin", "member"]).optional(),
	description: z.string().max(800).optional(),
});

// schema for login with rules
export const loginSchema = z.object({
	email: z.string().email("Adresse e-mail invalide"),
	password: z.string().min(1, "Mot de passe requis"),
});

// schema for updating user with rules
export const updateUserSchema = z.object({
	username: z
		.string()
		.min(1, "Le nom d'utilisateur est requis")
		.max(16, "Maximum 16 caractères")
		.regex(
			/^[a-zA-Z0-9-]+$/,
			"Le nom d'utilisateur ne peut contenir que des lettres, des chiffres ou des tirets",
		)
		.optional(),
	firstName: z.string().max(50, "Maximum 50 caractères").optional(),
	lastName: z.string().max(50, "Maximum 50 caractères").optional(),
	email: z.string().email("Adresse e-mail invalide").optional(),
	avatar: z.string().optional(),
	description: z.string().max(800, "Maximum 800 caractères").optional(),
});

// Schema for updating wanted skills with rules
export const updateWantedSkillsSchema = z.object({
	wantedSkills: z
		.array(z.number())
		.min(1, "Veuillez sélectionner au moins une compétence"),
});
