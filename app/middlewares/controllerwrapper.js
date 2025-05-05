export const controllerwrapper = (controller) => async (req, res, next) => {
	try {
		await controller(req, res, next);
	} catch (error) {
		console.error("Erreur inattendue", error);
		next(error);
	}
};
