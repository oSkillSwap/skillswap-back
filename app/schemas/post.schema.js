import sanitize from "sanitize-html";
import sanitizeHtml from "sanitize-html";
import { z } from "zod";

const sanitizeTextarea = (val) =>
  sanitizeHtml(val.trim(), {
    allowedTags: ["b", "i", "em", "strong", "p", "ul", "li", "ol", "br"],
    allowedAttributes: {},
  });

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

export const updatePostSchema = z.object({
  title: sanitizeTextarea(z.string())
    .trim()
    .min(1, { message: "Le titre ne peut pas être vide" })
    .max(40, { message: "Le titre ne peut pas dépasser 40 caractères" }),
  content: sanitizeTextarea(z.string())
    .trim()
    .min(1, { message: "Le contenu ne peut pas être vide" })
    .max(500, {
      message: "Le contenu ne peut pas dépasser 500 caractères",
    }),
});
