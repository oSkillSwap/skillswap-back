import { z } from "zod";

// Schema for message with rules
export const postSchema = z.object({
  title: z.string().trim().min(1).max(40),
  content: z.string().trim().min(1).max(800),
  skill_id: z.number().int().positive(),
});
