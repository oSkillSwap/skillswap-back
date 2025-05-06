import { Router } from "express";
import { messageController } from "../controllers/message.controller.js";
import { authenticate } from "../middlewares/authenticate.js";
import { controllerwrapper } from "../middlewares/controllerwrapper.js";
import { validateParams } from "../middlewares/validateParams.js";
import { validate } from "../middlewares/validates.js";
import { messageSchema } from "../schemas/message.schema.js";

export const messageRouter = Router();

/**
 * @swagger
 * /api/me/messages:
 *   get:
 *     summary: Récupérer tous les messages de l'utilisateur authentifié
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des messages de l'utilisateur
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Message'
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
// /me/messages -> Get all messages related to authenticated user's
messageRouter.get(
  "/me/messages",
  authenticate,
  controllerwrapper(messageController.getMessages)
);

// /me/messages/:userId
messageRouter
  .route("/me/messages/:userId")

  /**
   * @swagger
   * /api/me/messages/{userId}:
   *   get:
   *     summary: Récupérer tous les messages entre l'utilisateur authentifié et un autre utilisateur
   *     tags: [Messages]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - name: userId
   *         in: path
   *         required: true
   *         description: ID de l'utilisateur avec lequel vous souhaitez récupérer les messages
   *         schema:
   *           type: integer
   *           example: 1
   *     responses:
   *       200:
   *         description: Liste des messages entre les deux utilisateurs
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 $ref: '#/components/schemas/Message'
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
  // Get all messages between two users
  .get(
    authenticate,
    validateParams("userId"),
    controllerwrapper(messageController.getConversation)
  )

  /**
   * @swagger
   * /api/me/messages/{userId}:
   *   post:
   *     summary: Envoyer un message à un utilisateur
   *     tags: [Messages]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - name: userId
   *         in: path
   *         required: true
   *         description: ID de l'utilisateur à qui vous souhaitez envoyer un message
   *         schema:
   *           type: integer
   *           example: 1
   *     requestBody:
   *       required: true
   *       content:
   *       application/json:
   *         schema:
   *           $ref: '#/components/schemas/CreateMessage'
   *     responses:
   *       201:
   *         description: Message envoyé avec succès
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                   example: "Message envoyé avec succès"
   *                 newMessage:
   *                   $ref: '#/components/schemas/CreateMessage'
   *       400:
   *         description: Mauvaise requête
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                   example: "Erreur de validation des données"
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
   *                   example: "Impossible d'envoyer un message à soi-même"
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
  // Send a message to a user
  .post(
    authenticate,
    validateParams("userId"),
    validate(messageSchema),
    messageController.createMessage
  );
