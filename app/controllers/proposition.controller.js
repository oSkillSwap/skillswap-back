import { Op } from "sequelize";
import { NotFoundError } from "../errors/not-found-error.js";
import { Proposition, User } from "../models/associations.js";

export const propositionController = {
  // TODO récupérer la liste des offres de l'utilisateur avec l'annonce à laquelle l'offre correspond (+ skill), le créateur de l'annonce, sa note moyenne et son nombre de reviews reçues.
  getUserReceivedPropositions: async (req, res, next) => {},
};
