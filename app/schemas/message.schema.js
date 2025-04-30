import { z } from "zod";

// Schema for message with rules
export const messageSchema = z.object({
  message: z
    .string()
    .trim()
    .min(1, {
      message: "Le message ne peut pas être vide",
    })
    .max(800, {
      message: "Le message ne peut pas contenir plus de  800 caractères",
    }),
});
