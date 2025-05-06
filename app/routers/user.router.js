import { Router } from "express";
import { userController } from "../controllers/user.controller.js";
import { authenticate } from "../middlewares/authenticate.js";
import { controllerwrapper } from "../middlewares/controllerwrapper.js";
import { validateParams } from "../middlewares/validateParams.js";
import { validate } from "../middlewares/validates.js";
import {
  loginSchema,
  registerSchema,
  updateUserSchema,
} from "../schemas/user.schema.js";

export const userRouter = Router();

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Récupérer tous les utilisateurs
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: Liste des utilisateurs
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
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
userRouter.get("/users", controllerwrapper(userController.getUsers));

/**
 * @swagger
 * /api/users/{userId}:
 *   get:
 *     summary: Récupérer un utilisateur par son ID
 *     tags: [Users]
 *     parameters:
 *       - name: userId
 *         in: path
 *         required: true
 *         description: ID de l'utilisateur
 *         schema:
 *           type: integer
 *           format: int64
 *           example: 1
 *     responses:
 *       200:
 *         description: Utilisateur trouvé
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DetailedUser'
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
userRouter.get(
  "/users/:userId",
  validateParams("userId"),
  controllerwrapper(userController.getOneUser)
);

/**
 * @swagger
 * /api/users/follows/{id}:
 *   get:
 *     summary: Récupérer les follows et followers d'un utilisateur
 *     tags: [Users]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID de l'utilisateur
 *         schema:
 *           type: integer
 *           format: int64
 *           example: 1
 *     responses:
 *       200:
 *         description: Liste des utilisateurs qui suivent et sont suivis par l'utilisateur
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FollowsAndFollowers'
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
userRouter.get(
  "/users/follows/:id",
  validateParams("id"),
  controllerwrapper(userController.getFollowersAndFollowsFromUser)
);

/**
 * @swagger
 * /api/me/users:
 *   get:
 *     summary: Récupérer les informations de l'utilisateur connecté
 *     description: Permet à un utilisateur authentifié d'obtenir ses propres informations
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Informations de l'utilisateur récupérées avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Bonjour johndoe"
 *                 user:
 *                   $ref: '#/components/schemas/DetailedUser'
 *       401:
 *         description: Non authentifié
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Token invalide ou expiré"
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
userRouter.get("/me/users", authenticate, async (req, res, next) => {
  req.params.userId = req.user.id;
  return userController.getOneUser(req, res, next);
});

/**
 * @swagger
 * /api/me/follows:
 *   get:
 *     summary: Récupérer les follows et followers de l'utilisateur connecté
 *     description: Permet à un utilisateur authentifié d'obtenir ses propres follows et followers
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des utilisateurs qui suivent et sont suivis par l'utilisateur connecté
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FollowsAndFollowers'
 *       401:
 *         description: Non authentifié
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Token invalide ou expiré"
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
userRouter.get("/me/follows", authenticate, async (req, res, next) => {
  req.params.id = req.user.id;
  return userController.getFollowersAndFollowsFromUser(req, res, next);
});

/**
 * @swagger
 * /api/register:
 *   post:
 *     summary: Inscription d'un nouvel utilisateur
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterUser'
 *     responses:
 *       201:
 *         description: Utilisateur créé
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Utilisateur créé avec succès"
 *                 user:
 *                   $ref: '#/components/schemas/DetailedUser'
 *       400:
 *         description: Mauvaise requête
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Erreur de validation"
 *       409:
 *         description: Conflit
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Cet email est déjà utilisé | Ce nom d'utilisateur est déjà utilisé"
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
userRouter.post(
  "/register",
  validate(registerSchema),
  controllerwrapper(userController.register)
);

/**
 * @swagger
 * /api/login:
 *   post:
 *     summary: Authentification d'un utilisateur
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginUser'
 *     responses:
 *       200:
 *         description: Authentification réussie
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Authentification réussie"
 *                 token:
 *                   type: string
 *                   example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *       400:
 *         description: Mauvaise requête
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Erreur de validation"
 *       401:
 *         description: Identifiants incorrects
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Identifiants incorrects"
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
userRouter.post(
  "/login",
  validate(loginSchema),
  controllerwrapper(userController.login)
);

userRouter
  .route("/me/follow/:userId")
  /**
   * @swagger
   * /api/me/follow/{userId}:
   *   post:
   *     summary: Suivre un utilisateur
   *     description: Permet à un utilisateur authentifié de suivre un autre utilisateur
   *     tags: [Users]
   *     parameters:
   *       - name: userId
   *         in: path
   *         required: true
   *         description: ID de l'utilisateur à suivre
   *         example: 1
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Utilisateur suivi avec succès
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                   example: "Vous suivez l'utilisateur johndoe"
   *       400:
   *         description: Mauvaise requête
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                   example: "Vous ne pouvez pas vous suivre vous-même"
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
   *       409:
   *         description: Conflit
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                   example: "Vous suivez déjà cet utilisateur"
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
  .post(
    authenticate,
    validateParams("userId"),
    controllerwrapper(userController.followUser)
  )
  /**
   * @swagger
   * /api/me/follow/{userId}:
   *   delete:
   *     summary: Ne plus suivre un utilisateur
   *     description: Permet à un utilisateur authentifié de ne plus suivre un autre utilisateur
   *     tags: [Users]
   *     parameters:
   *       - name: userId
   *         in: path
   *         required: true
   *         description: ID de l'utilisateur à ne plus suivre
   *         example: 1
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: L'utilisateur a arrêté d'être suivi avec succès
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                   example: "Vous ne suivez plus l'utilisateur johndoe"
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
   *       409:
   *         description: Conflit
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                   example: "Vous ne suivez pas cet utilisateur"
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
  .delete(
    authenticate,
    validateParams("userId"),
    controllerwrapper(userController.unfollowUser)
  );

userRouter
  .route("/me")
  /**
   * @swagger
   * /api/me:
   *   delete:
   *     summary: Supprimer l'utilisateur connecté
   *     description: Permet à un utilisateur authentifié de supprimer son compte
   *     tags: [Users]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Utilisateur supprimé avec succès
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                   example: "Compte supprimé avec succès"
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
  .delete(authenticate, controllerwrapper(userController.deleteUser))

  /**
   * @swagger
   * /api/me:
   *   patch:
   *     summary: Mettre à jour les informations de l'utilisateur connecté
   *     description: Permet à un utilisateur authentifié de mettre à jour ses informations
   *     tags: [Users]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/UpdateUser'
   *     responses:
   *       200:
   *         description: Utilisateur mis à jour avec succès
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                   example: "Utilisateur mis à jour avec succès"
   *                 user:
   *                   $ref: '#/components/schemas/DetailedUser'
   *       400:
   *         description: Mauvaise requête
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                   example: "Erreur de validation"
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
   *       409:
   *         description: Conflit
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                   example: "Cet email est déjà utilisé | Ce nom d'utilisateur est déjà utilisé"
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
  .patch(
    authenticate,
    validate(updateUserSchema),
    controllerwrapper(userController.updateUser)
  );
