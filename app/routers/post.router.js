import { Router } from "express";
import { postController } from "../controllers/post.controller.js";
import { propositionController } from "../controllers/proposition.controller.js";
import { authenticate } from "../middlewares/authenticate.js";
import { controllerwrapper } from "../middlewares/controllerwrapper.js";
import { validateParams } from "../middlewares/validateParams.js";
import { validate } from "../middlewares/validates.js";
import { postSchema, updatePostSchema } from "../schemas/post.schema.js";

export const postRouter = Router();

/**
 * @swagger
 * /api/posts:
 *   get:
 *     summary: Récupérer tous les posts
 *     tags: [Posts]
 *     responses:
 *       200:
 *         description: Liste des posts
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Annonce'
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
// /posts -> Get all posts
postRouter.route("/posts").get(controllerwrapper(postController.getPosts));

/**
 * @swagger
 * /api/posts/{userIdOrUsername}:
 *   get:
 *     summary: Récupérer les posts d'un utilisateur spécifique
 *     tags: [Posts]
 *     parameters:
 *       - name: userIdOrUsername
 *         in: path
 *         required: true
 *         description: ID ou username de l'utilisateur dont vous souhaitez récupérer les posts
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: Liste des posts de l'utilisateur
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Annonce'
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
// /posts/:id -> user-specific posts
postRouter.get("/posts/:userIdOrUsername", controllerwrapper(postController.getPostsFromUser));

// /me/posts -> posts related to authenticated user's
postRouter
  .route("/me/posts")

  /**
   * @swagger
   * /api/me/posts:
   *   get:
   *     summary: Récupérer tous les posts de l'utilisateur authentifié
   *     tags: [Posts]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Liste des posts de l'utilisateur
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 $ref: '#/components/schemas/Annonce'
   *       401:
   *         description: Non autorisé
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                   example: "Non autorisé"
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
  .get(authenticate, controllerwrapper(postController.getPostFromLoggedUser))

  /**
   * @swagger
   * /api/me/posts:
   *   post:
   *     summary: Créer un nouveau post (10 posts maximum par utilisateur)
   *     tags: [Posts]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/CreatePost'
   *     responses:
   *       201:
   *         description: Post créé avec succès
   *         content:
   *           application/json:
   *             schema:
   *             type: object
   *             properties:
   *               message:
   *                 type: string
   *                 example: "Post créé avec succès"
   *       400:
   *         description: Erreur de validation
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
   *                   example: "Non autorisé"
   *       403:
   *         description: Accès interdit
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                   example: "Vous avez atteint le nombre maximum de posts autorisés."
   *       404:
   *         description: Compétence non trouvée
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                   example: "Compétence non trouvée"
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
  // Get posts from logged-in user
  .post(authenticate, validate(postSchema), controllerwrapper(postController.createPost)); // Create a new post

/**
 * @swagger
 * /api/me/posts/{id}:
 *   delete:
 *     summary: Supprimer un post
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID du post à supprimer
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: Post supprimé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Post supprimé avec succès"
 *       401:
 *         description: Non autorisé
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Non autorisé"
 *       404:
 *         description: Post non trouvé
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Post non trouvé"
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
postRouter.delete("/me/posts/:id", authenticate, controllerwrapper(postController.deletePost));

/**
 * @swagger
 * /api/me/posts/{id}:
 *   patch:
 *     summary: Mettre à jour un post
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID du post à mettre à jour
 *         schema:
 *           type: integer
 *           example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdatePost'
 *     responses:
 *       200:
 *         description: Post mis à jour avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Post mis à jour avec succès"
 *       400:
 *         description: Erreur de validation
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
 *                   example: "Non autorisé"
 *       404:
 *         description: Post non trouvé
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Post non trouvé"
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
postRouter.patch(
  "/me/posts/:id",
  authenticate,
  validate(updatePostSchema),
  controllerwrapper(postController.updatePost),
);
