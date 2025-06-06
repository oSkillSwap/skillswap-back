export const controllerwrapper = (controller) => async (req, res, next) => {
  try {
    await controller(req, res, next);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Une erreur inattendue est survenue. Veuillez réessayer.",
    });
  }
};
