import { z } from "zod";

// Schema for message with rules
export const propositionSchema = z.object({
  content: z
    .string()
    .trim()
    .min(1, {
      message: "Le contenu de la proposition ne doit pas être vide",
    })
    .max(800, {
      message:
        "Le contenu de la proposition doit comporter 800 caractères au maximum",
    }),
});
