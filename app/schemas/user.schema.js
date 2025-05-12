import sanitizeHtml from "sanitize-html";
import { z } from "zod";

// clean textareas && inputs
const sanitizeTextarea = (val) =>
  sanitizeHtml(val.trim(), {
    allowedTags: ["b", "i", "em", "strong", "p", "ul", "li", "ol", "br"],
    allowedAttributes: {},
  });

// SLot for availabilities
const validDays = [
  "Lundi",
  "Mardi",
  "Mercredi",
  "Jeudi",
  "Vendredi",
  "Samedi",
  "Dimanche",
];
const validSlots = ["matin", "midi", "après-midi", "soir"];

export const registerSchema = z
  .object({
    username: z
      .string()
      .min(3, { message: "Le nom d'utilisateur est requis" })
      .max(25, { message: "Maximum 25 caractères" })
      .regex(/^[a-zA-Z0-9-]+$/, {
        message:
          "Le nom d'utilisateur ne peut contenir que des lettres, des chiffres ou des tirets",
      })
      .transform((val) => sanitizeHtml(val.trim())),
    lastName: z
      .string()
      .max(50, "Maximum 50 caractères")
      .optional()
      .transform((val) => (val ? sanitizeHtml(val.trim()) : undefined)),
    firstName: z
      .string()
      .max(50, "Maximum 50 caractères")
      .optional()
      .transform((val) => (val ? sanitizeHtml(val.trim()) : undefined)),
    password: z
      .string()
      .min(8, { message: "Le mot de passe doit faire au moins 8 caractères" })
      .regex(/[a-z]/, { message: "Une lettre minuscule requise" })
      .regex(/[A-Z]/, { message: "Une lettre majuscule requise" })
      .regex(/[0-9]/, { message: "Un chiffre requis" })
      .regex(/[^a-zA-Z0-9]/, {
        message: "Un caractère spécial requis",
      }),
    email: z.string().email({ message: "Adresse e-mail invalide" }),
    avatar: z.string().optional(),
    description: z
      .string()
      .max(800, "Maximum 800 caractères")
      .optional()
      .transform((val) => (val ? sanitizeTextarea(val) : undefined)),
  })
  .strict({ message: "Vous avez essayé de faire une action non autorisée" });

export const loginSchema = z.object({
  email: z.string().email("Adresse e-mail invalide"),
  password: z.string().min(1, "Mot de passe requis"),
});

export const updateUserSchema = z.object({
  username: z
    .string()
    .min(3, "Le nom d'utilisateur est requis")
    .max(25, "Maximum 16 caractères")
    .regex(
      /^[a-zA-Z0-9-]+$/,
      "Le nom d'utilisateur ne peut contenir que des lettres, des chiffres ou des tirets"
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
  email: z.string().email("Adresse e-mail invalide").optional(),
  isAvailable: z.boolean().optional(),
  avatar: z.string().optional(),
  description: z
    .string()
    .max(800, "Maximum 800 caractères")
    .optional()
    .transform((val) => (val ? sanitizeTextarea(val) : undefined)),
  availabilities: z
    .array(
      z.object({
        day_of_the_week: z.enum(validDays),
        time_slot: z.enum(validSlots),
      })
    )
    .optional(),
});

export const updatePasswordSchema = z.object({
  currentPassword: z
    .string()
    .min(8, { message: "Le mot de passe doit faire au moins 8 caractères" })
    .regex(/[a-z]/, { message: "Une lettre minuscule requise" })
    .regex(/[A-Z]/, { message: "Une lettre majuscule requise" })
    .regex(/[0-9]/, { message: "Un chiffre requis" })
    .regex(/[^a-zA-Z0-9]/, {
      message: "Un caractère spécial requis",
    }),
  newPassword: z
    .string()
    .min(8, { message: "Le mot de passe doit faire au moins 8 caractères" })
    .regex(/[a-z]/, { message: "Une lettre minuscule requise" })
    .regex(/[A-Z]/, { message: "Une lettre majuscule requise" })
    .regex(/[0-9]/, { message: "Un chiffre requis" })
    .regex(/[^a-zA-Z0-9]/, {
      message: "Un caractère spécial requis",
    }),
  confirmPassword: z
    .string()
    .min(8, { message: "Le mot de passe doit faire au moins 8 caractères" })
    .regex(/[a-z]/, { message: "Une lettre minuscule requise" })
    .regex(/[A-Z]/, { message: "Une lettre majuscule requise" })
    .regex(/[0-9]/, { message: "Un chiffre requis" })
    .regex(/[^a-zA-Z0-9]/, {
      message: "Un caractère spécial requis",
    }),
});
