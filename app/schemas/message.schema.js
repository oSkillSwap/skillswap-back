import { z } from "zod";
import sanitizeHtml from "sanitize-html";

const sanitizeTextarea = (schema) =>
	schema.transform((value) =>
		sanitizeHtml(value, {
			allowedTags: ["b", "i", "em", "strong", "p", "ul", "li", "ol", "br"],
			allowedAttributes: {},
		}),
	);

// Schema for message with rules
export const messageSchema = z.object({
	message: sanitizeTextarea(
		z
			.string()
			.min(1, { message: "Le message ne peut pas être vide" })
			.max(800, {
				message: "Le message ne peut pas contenir plus de 800 caractères",
			}),
	),
});
