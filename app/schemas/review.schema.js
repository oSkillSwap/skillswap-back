import { z } from "zod";
import sanitizeHtml from "sanitize-html";

const sanitizeTextarea = (value) =>
  sanitizeHtml(value, {
    allowedTags: ["b", "i", "em", "strong", "p", "ul", "li", "ol", "br"],
    allowedAttributes: {},
  }).trim();

export const reviewSchema = z.object({
  postId: z.preprocess(
    (val) => (typeof val === "string" ? Number(val) : val),
    z.number({
      required_error: "Annonce obligatoire",
      invalid_type_error: "L'identifiant de l'annonce doit être un nombre",
    }),
  ),
  propositionId: z.preprocess(
    (val) => (typeof val === "string" ? Number(val) : val),
    z.number({
      required_error: "Une review doit appartenir à un échange",
      invalid_type_error: "L'identifiant de la proposition doit être un nombre",
    }),
  ),
  grade: z
    .number()
    .min(1, "La note doit être comprise entre 1 et 5")
    .max(5, "La note doit être comprise entre 1 et 5"),
  comment: z
    .string()
    .max(500, "Le commentaire ne peut pas dépasser 500 caractères")
    .transform((val) => sanitizeTextarea(val || ""))
    .optional(),
  title: z
    .string()
    .max(255, "Le titre ne peut pas dépasser 255 caractères")
    .transform((val) => sanitizeTextarea(val))
    .optional(),
});

export const updateReviewSchema = z.object({
  grade: z.number().min(1, "La note doit être au moins 1").max(5, "La note ne peut pas dépasser 5"),
  content: z
    .string()
    .min(10, "La review doit contenir au moins 10 caractères")
    .max(1000, "La review ne peut pas dépasser 1000 caractères")
    .transform(sanitizeTextarea),
});
