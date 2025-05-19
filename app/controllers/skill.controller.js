import { Category, Skill, User } from "../models/associations.js";

export const skillController = {
  getSkills: async (req, res) => {
    const skills = await Skill.findAll({
      attributes: ["id", "name"],
      include: {
        model: Category,
        attributes: ["id", "name"],
      },
    });

    return res.status(200).json({ skills });
  },

  updateUserWantedSkills: async (req, res, next) => {
    const userId = req.user.id;
    const { wantedSkills } = req.validatedData;

    const user = await User.findByPk(userId);
    if (!user) {
      return next(new NotFoundError("Utilisateur non trouvé")); // If user not found, return error
    }

    await user.setWantedSkills(wantedSkills); // Update the user's wanted skills

    return res.status(200).json({ message: "Compétences souhaitées mises à jour" }); // Return success message
  },

  updateUserSkills: async (req, res, next) => {
    const userId = req.user.id;
    const { skills } = req.validatedData;
    const user = await User.findByPk(userId);

    if (!user) {
      return next(new NotFoundError("Utilisateur non trouvé"));
    }

    await user.setSkills(skills); // Update the user's skills

    return res.status(200).json({ message: "Compétences mises à jour avec succès" });
  },

  createSkill: async (req, res, next) => {
    const { name, category_id } = req.body;

    if (!name || !category_id) {
      return next(new BadRequestError("Nom et catégorie requis."));
    }

    const skill = await Skill.create({ name, category_id });
    return res.status(201).json({ message: "Compétence créée", skill });
  },

  updateSkill: async (req, res, next) => {
    const skillId = Number(req.params.id);
    const data = req.validatedData;

    const skill = await Skill.findByPk(skillId);
    if (!skill) {
      return res.status(404).json({ error: "Compétence non trouvée" });
    }

    await skill.update(data);

    res.status(200).json({ message: "Compétence mise à jour", skill });
  },
  deleteSkill: async (req, res, next) => {
    const skillId = Number(req.params.id);

    if (Number.isNaN(skillId)) {
      return res.status(400).json({ error: "ID de compétence invalide" });
    }

    const skill = await Skill.findByPk(skillId);
    if (!skill) {
      return res.status(404).json({ error: "Compétence introuvable" });
    }

    await skill.destroy();
    return res.status(200).json({ message: "Compétence supprimée avec succès", id: skillId });
  },
};
