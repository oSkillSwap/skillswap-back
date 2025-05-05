import { z } from "zod";
import sanitizeHtml from "sanitize-html";

// Sanitize HTML content while allowing basic formatting tags
const cleanMessage = (val) =>
	sanitizeHtml(val.trim(), {
		allowedTags: ["b", "i", "em", "strong", "br", "p", "ul", "ol", "li"],
		allowedAttributes: {},
		disallowedTagsMode: "discard",
	});

export const messageSchema = z.object({
	message: z
		.string()
		.min(1, { message: "Le message ne peut pas être vide" })
		.max(800, {
			message: "Le message ne peut pas contenir plus de 800 caractères",
		})
		.transform(cleanMessage),
});
