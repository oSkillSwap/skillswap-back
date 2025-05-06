import { Router } from "express";
import { reviewController } from "../controllers/review.controller.js";
import { authenticate } from "../middlewares/authenticate.js";
import { controllerwrapper } from "../middlewares/controllerwrapper.js";
import { validateParams } from "../middlewares/validateParams.js";
import { validate } from "../middlewares/validates.js";
import { reviewSchema, updateReviewSchema } from "../schemas/review.schema.js";

export const reviewRouter = Router();

/**
 * @swagger
 * /api/reviews:
 *   get:
 *     summary: Récupérer toutes les évaluations
 *     tags: [Reviews]
 *     responses:
 *       200:
 *         description: Liste des évaluations
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Review'
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
 *
 */
reviewRouter
  .route("/reviews")
  .get(controllerwrapper(reviewController.getReviews)); // Get all reviews

/**
 * @swagger
 * /api/reviews/{id}:
 *   get:
 *     summary: Récupérer les évaluations d'un utilisateur spécifique
 *     tags: [Reviews]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID de l'utilisateur dont vous souhaitez récupérer les évaluations
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: Liste des évaluations de l'utilisateur
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Review'
 *       404:
 *         description: Utilisateur non trouvé
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Utilisateur non trouvé"
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
// /reviews/:id -> user-specific reviews
reviewRouter.get(
  "/reviews/:id",
  validateParams("id"),
  controllerwrapper(reviewController.getReviewsFromUser)
);

/**
 * @swagger
 * /api/me/reviews:
 *   post:
 *     summary: Créer une évaluation
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateReview'
 *     responses:
 *       201:
 *         description: Évaluation créée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Évaluation créée avec succès"
 *                 review:
 *                   $ref: '#/components/schemas/Review'
 *       400:
 *         description: Mauvaise requête
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Mauvaise requête"
 *       401:
 *         description: Non authentifié
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Token invalide ou expiré"
 *       403:
 *         description: Accès interdit
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "L'annonce doit être fermée pour laisser un avis. | La proposition n'est pas acceptée | Vous n'avez pas le droit de laisser un avis sur cette annonce | Vous avez déjà laissé un avis pour cette annonce et cette proposition."
 *       404:
 *         description: Annonce ou proposition non trouvée
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Annonce non trouvée | La proposition est introuvable"
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
// Create a review
reviewRouter
  .route("/me/reviews")
  .post(
    authenticate,
    validate(reviewSchema),
    controllerwrapper(reviewController.createReview)
  );

/**
 * @swagger
 * /api/me/reviews/{reviewId}:
 *   patch:
 *     summary: Mettre à jour une évaluation
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: reviewId
 *         in: path
 *         required: true
 *         description: ID de l'évaluation à mettre à jour
 *         schema:
 *           type: integer
 *           example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateReview'
 *     responses:
 *       200:
 *         description: Évaluation mise à jour avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Évaluation mise à jour avec succès"
 *                 review:
 *                   $ref: '#/components/schemas/Review'
 *       400:
 *         description: Mauvaise requête
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Mauvaise requête"
 *       401:
 *         description: Non authentifié
 *         content:
 *           application/json:
 *             schema:
 *             type: Object
 *             properties:
 *               message:
 *                 type: string
 *                 example: "Token invalide ou expiré"
 *       403:
 *         description: Accès interdit
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Vous ne pouvez pas modifier cette évaluation. | Vous ne pouvez modifier que vos propres évaluations."
 *       404:
 *         description: Évaluation non trouvée
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Évaluation non trouvée"
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
// /me/reviews/:userId -> update review I made
reviewRouter.patch(
  "/me/reviews/:reviewId",
  authenticate,
  validateParams("reviewId"),
  validate(updateReviewSchema),
  controllerwrapper(reviewController.updateReview)
);
