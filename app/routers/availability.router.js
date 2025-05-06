import { Router } from "express";
import { availabilityController } from "../controllers/availability.controller.js";
import { controllerwrapper } from "../middlewares/controllerwrapper.js";

export const availabilityRouter = Router();

/**
 * @swagger
 * /api/availabilities:
 *   get:
 *     summary: Récupérer toutes les disponibilités
 *     tags: [Availabilities]
 *     responses:
 *       200:
 *         description: Liste des disponibilités
 *         content:
 *           application/json:
 *             schema:
 *               items:
 *                 $ref: '#/components/schemas/Availability'
 *       500:
 *         description: Erreur serveur
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Une erreur inattendue est survenue. Veuillez réessayer."
 */
availabilityRouter.get(
  "/availabilities",
  controllerwrapper(availabilityController.getAvailabilities)
);
