import { z } from "zod";
import sanitizeHtml from "sanitize-html";

const cleanString = (val) =>
	sanitizeHtml(val.trim(), { allowedTags: [], allowedAttributes: {} });

const cleanHtml = (val) =>
	sanitizeHtml(val.trim(), {
		allowedTags: ["b", "i", "em", "strong", "ul", "ol", "li", "br", "p"],
		allowedAttributes: {},
	});

export const reviewSchema = z.object({
	postId: z.number({ required_error: "Annonce obligatoire" }),
	propositionId: z.number({
		required_error: "Une review doit appartenir à un échange",
	}),
	grade: z.number().min(1).max(5),
	comment: z
		.string()
		.max(500)
		.optional()
		.nullable()
		.transform((val) => (typeof val === "string" ? cleanHtml(val) : val)),
	title: z.string().min(3).max(255).transform(cleanString),
});

export const updateReviewSchema = z.object({
	grade: z.number().min(1).max(5),
	content: z.string().min(10).max(1000).transform(cleanHtml),
});
