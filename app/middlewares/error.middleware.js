export const errorMiddleware = (error, _, res, __) => {
  if (error.name === "Not Found Error") {
    return res.status(404).json({ message: error.message });
  }

  return res.status(500).json({
    message: "Une erreur inattendue est survenue. Veuillez réessayez.",
  });
};
