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

/*
import { z } from "zod";

/**
 * If validation fails → sends a 400 error with the details.
 * If validation passes → stores the validated data in req.validatedData
 
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
*/
