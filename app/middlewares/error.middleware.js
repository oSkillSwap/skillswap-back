export const errorMiddleware = (error, _, res, __) => {
  // Handle "Bad Request" errors (e.g., invalid input)
  if (error.name === "BadRequestError") {
    return res.status(400).json({ message: error.message });
  }

  // Handle "Validation" errors (e.g., data validation failed)
  if (error.name === "ValidationError") {
    return res.status(400).json({ message: error.message });
  }

  // Handle "Unauthorized" errors (e.g., authentication required)
  if (error.name === "UnauthorizedError") {
    return res.status(401).json({ message: error.message });
  }

  if (error.name === "JsonWebTokenError") {
    return res.status(401).json({ message: error.message });
  }

  // Handle "Forbidden" errors (e.g., access denied)
  if (error.name === "ForbiddenError") {
    return res.status(403).json({ message: error.message });
  }

  // Handle "Not Found" errors (e.g., resource not found)
  if (error.name === "NotFoundError") {
    return res.status(404).json({ message: error.message });
  }

  if (error.name === "ConflictError") {
    return res.status(409).json({ message: error.message });
  }

  // Handle all other unexpected errors
  return res.status(500).json({
    message: "Une erreur inattendue est survenue. Veuillez réessayez.",
  });
};
