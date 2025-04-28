export const errorMiddleware = (error, _, res, __) => {
  if (error.name === "NotFoundError") {
    return res.status(404).json({ message: error.message });
  }

  return res.status(500).json({
    message: "Une erreur inattendue est survenue. Veuillez réessayez.",
  });
};
