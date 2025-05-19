import { Router } from "express";
import { skillController } from "../controllers/skill.controller.js";
import { authenticate } from "../middlewares/authenticate.js";
import { controllerwrapper } from "../middlewares/controllerwrapper.js";
import { validate } from "../middlewares/validates.js";
import { updateUserSkillsSchema, updateWantedSkillsSchema } from "../schemas/skill.schema.js";

export const skillRouter = Router();

/**
 * @swagger
 * /api/skills:
 *   get:
 *     summary: Récupérer toutes les compétences
 *     tags: [Skills]
 *     responses:
 *       200:
 *         description: Liste des compétences
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Skill'
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
skillRouter.get("/skills", controllerwrapper(skillController.getSkills));

/**
 * @swagger
 * /api/me/wanted-skills:
 *   put:
 *     summary: Mettre à jour les compétences souhaitées de l'utilisateur
 *     tags: [Skills]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateWantedSkills'
 *     responses:
 *       200:
 *         description: Compétences souhaitées mises à jour avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Compétences souhaitées mises à jour"
 *       400:
 *         description: Mauvaise requête
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Vous devez sélectionner au moins une compétence"
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
skillRouter.put(
  "/me/wanted-skills",
  authenticate,
  validate(updateWantedSkillsSchema),
  controllerwrapper(skillController.updateUserWantedSkills),
);

/**
 * @swagger
 * /api/me/skills:
 *   patch:
 *     summary: Mettre à jour les compétences de l'utilisateur
 *     tags: [Skills]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateSkills'
 *     responses:
 *       200:
 *         description: Compétences mises à jour avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Compétences mises à jour avec succès"
 *       400:
 *         description: Mauvaise requête
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Vous devez sélectionner au moins une compétence"
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
skillRouter.patch(
  "/me/skills",
  authenticate,
  validate(updateUserSkillsSchema),
  controllerwrapper(skillController.updateUserSkills),
);
