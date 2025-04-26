import { z } from "zod";

// Schema for message with rules
export const postSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, { message: "Le titre ne peut pas être vide" })
    .max(40, { message: "Le titre ne peut pas dépasser 40 caractères" }),
  content: z
    .string()
    .trim()
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
