import { Router } from "express";
import { categoryController } from "../controllers/category.controller.js";
import { controllerwrapper } from "../middlewares/controllerwrapper.js";

export const categoryRouter = Router();

/**
 * @swagger
 * /api/categories:
 *   get:
 *     summary: Récupérer toutes les catégories
 *     tags: [Categories]
 *     responses:
 *       200:
 *         description: Liste des catégories
 *         content:
 *           application/json:
 *             schema:
 *               items:
 *                 $ref: '#/components/schemas/Category'
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
categoryRouter.get(
  "/categories",
  controllerwrapper(categoryController.getCategories)
);
