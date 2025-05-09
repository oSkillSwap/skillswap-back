import { z } from "zod";

export const validate = (schema) => (req, res, next) => {
  try {
    req.validatedData = schema.parse(req.body);
    next();
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({
        message: "Erreur de validation",
        errors: err.flatten(),
      });
    }
    // Pour toute autre erreur inattendue
    console.error(err);
    return res.status(500).json({ message: "Erreur serveur" });
  }
};
