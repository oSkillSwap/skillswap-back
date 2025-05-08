import { Availability } from "../models/associations.js";
import { User } from "../models/associations.js";
import { BadRequestError } from "../errors/badrequest-error.js";

export const availabilityController = {
  getAvailabilities: async (req, res, _) => {
    const availabilities = await Availability.findAll();

    return res.status(200).json({ availabilities });
  },

  updateUserAvailabilities: async (req, res, next) => {
    const userId = req.user.id;
    const avalabilities = req.validatedData;

    if (!Array.isArray(availabilites) || availabilities.length === 0) {
      return next(new BadRequestError("Aucune disponibilité fournie"));
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return next(new NotFoundError("Utilisateur non trouvé"));
    }

    await user.setAvailabilities([]);
    await user.addAvailabilities(availabilites);

    res.status(200).json({ message: "Disponibilités mise à jour avec succès" });
  },
};
