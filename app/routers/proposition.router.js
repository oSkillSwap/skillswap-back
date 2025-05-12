import { Router } from "express";
import { propositionController } from "../controllers/proposition.controller.js";
import { authenticate } from "../middlewares/authenticate.js";
import { controllerwrapper } from "../middlewares/controllerwrapper.js";
import { validateParams } from "../middlewares/validateParams.js";
import { validate } from "../middlewares/validates.js";
import { propositionSchema } from "../schemas/proposition.schema.js";

export const propositionRouter = Router();

/**
 * @swagger
 * /api/propositions/{userId}:
 *   get:
 *     summary: Récupérer toutes les propositions d'un utilisateur spécifique
 *     tags: [Propositions]
 *     parameters:
 *       - name: userId
 *         in: path
 *         required: true
 *         description: ID de l'utilisateur dont vous souhaitez récupérer les propositions
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: Liste des propositions de l'utilisateur
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/PropositionFromUser'
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
propositionRouter.get(
  "/propositions/:userId",
  validateParams("userId"),
  controllerwrapper(propositionController.getProposition)
);

// /me/propositions -> Routes related to authenticated user's
propositionRouter
  .route("/me/propositions")

  /**
   * @swagger
   * /api/me/propositions:
   *   get:
   *     summary: Récupérer toutes les propositions envoyées par l'utilisateur authentifié
   *     tags: [Propositions]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Liste des propositions envoyées par l'utilisateur
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 $ref: '#/components/schemas/PropositionFromUser'
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
  .get(
    authenticate,
    controllerwrapper(propositionController.getUserSentPropositions)
  );

/**
 * @swagger
 * /api/me/propositions/{postId}:
 *   post:
 *     summary: Envoyer une proposition à un post spécifique
 *     tags: [Propositions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: postId
 *         in: path
 *         required: true
 *         description: ID du post auquel vous souhaitez envoyer une proposition
 *         schema:
 *           type: integer
 *           example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateProposition'
 *     responses:
 *       201:
 *         description: Proposition envoyée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Proposition bien envoyée à l'annonce"
 *                 newProposition:
 *                   type: object
 *                   properties:
 *                     content:
 *                       type: string
 *                       example: "Je suis intéressé par cette annonce."
 *                     state:
 *                       type: string
 *                       example: "en attente"
 *                     sender_id:
 *                       type: integer
 *                       example: 1
 *                     post_id:
 *                       type: integer
 *                       example: 1
 *                     receiver_id:
 *                       type: integer
 *                       example: 2
 *       400:
 *         description: Mauvaise requête
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Erreur de validation des données | Une proposition en attente a déjà été envoyée à cette annonce | Vous ne pouvez pas envoyer une proposition à votre propre annonce"
 *       401:
 *         description: Non autorisé
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
 *                   example: "Cette annonce n'accepte plus de proposition"
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

// /me/propositions/:postId -> user's propositions
propositionRouter.post(
  "/me/propositions/:postId",
  authenticate,
  validateParams("postId"),
  validate(propositionSchema),
  controllerwrapper(propositionController.sendPropositionToPost)
);

/**
 * @swagger
 * /api/propositions/{id}/accept:
 *   patch:
 *     summary: Mettre à jour l'état d'une proposition en "acceptée"
 *     tags: [Propositions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID de la proposition à accepter
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: Proposition acceptée avec succès
 *         content:
 *           application/json:
 *             schema:
 *             type: object
 *             properties:
 *               message:
 *                 type: string
 *                 example: "Proposition acceptée avec succès"
 *       400:
 *         description: Mauvaise requête
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Vous ne pouvez pas accepter votre propre proposition | Cette proposition a déjà été acceptée"
 *       401:
 *         description: Non autorisé
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
 *                   example: "Vous n'etes pas le propriétaire de cette annonce"
 *     404:
 *       description: Proposition non trouvée
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               message:
 *                 type: string
 *                 example: "Proposition non trouvée"
 *     409:
 *       description: Conflit
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               message:
 *                 type: string
 *                 example: "Cette proposition a déjà été acceptée | Cette proposition a déjà été refusée"
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
// /proposition/:id/accept -> Accepting a proposition
propositionRouter.patch(
  "/propositions/:id/accept",
  authenticate,
  validateParams("id"),
  controllerwrapper(propositionController.acceptProposition)
);
