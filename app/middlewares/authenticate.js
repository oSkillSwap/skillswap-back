import { verifyToken } from "../helpers/jwt.js";

// Middleware to protect routes using JWT
export const authenticate = (req, res, next) => {
	const authHeader = req.headers.authorization;

	if (!authHeader || !authHeader.startsWith("Bearer ")) {
		return res.status(401).json({ message: "Token manquant ou invalide" });
	}

	const token = authHeader.split(" ")[1];

	try {
		const user = verifyToken(token);
		req.user = user; // can be used in the next middleware or route handler
		next();
	} catch (err) {
		return res.status(401).json({ message: "Token invalide ou expiré" });
	}
};
