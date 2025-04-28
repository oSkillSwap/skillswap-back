import { z } from "zod";

/**
 * Zod-based validation middleware
 *
 * Validates req.body against the provided Zod schema RegisterScema & loginSchema
 * If validation fails → sends a 400 error with the details.
 * If validation passes → stores the validated data in req.validatedData
 */
export const validate = (schema) => (req, res, next) => {
  try {
    req.validatedData = schema.parse(req.body);
    next();
  } catch (err) {
    if (err instanceof z.ZodError) {
      // Zod method Flatten for more error readable format
      return res.status(400).json({ errors: err.flatten() });
    }
    next(err);
  }
};
