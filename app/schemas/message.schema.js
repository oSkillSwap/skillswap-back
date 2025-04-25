import { z } from "zod";

// Schema for message with rules
export const messageSchema = z.object({
  message: z.string().trim().min(1).max(800),
});
