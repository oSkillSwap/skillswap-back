import { JsonWebTokenError } from "../errors/jsonwebtoken-error.js";
import { verifyToken } from "../helpers/jwt.js";
import { User } from "../models/associations.js";

// Middleware to protect routes using JWT
export const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next(new JsonWebTokenError("Token invalide ou expiré"));
  }

  const token = authHeader.split(" ")[1];

  try {
    const user = verifyToken(token);
    req.user = user; // can be used in the next middleware or route handler
    next();
  } catch (err) {
    return next(new JsonWebTokenError("Token invalide ou expiré"));
  }
};
