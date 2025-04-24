export const controllerwrapper = (controller) => async (req, res, next) => {
  try {
    await controller(req, res, next);
  } catch (error) {
    console.error("Unexpected error in controller:", error);
    return res.status(500).json({
      message: "An unexpected error occurred. Please try again later.",
    });
  }
};
