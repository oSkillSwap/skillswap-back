import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET;

//Generate a JWT token
export const generateToken = (payload, expiresIn = "15m") => {
  return jwt.sign(payload, SECRET, { expiresIn });
};

// Verify a JWT token
export const verifyToken = (token) => {
  return jwt.verify(token, SECRET);
};
