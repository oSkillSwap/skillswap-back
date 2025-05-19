import { Sequelize } from "sequelize";
import { BadRequestError } from "../errors/badrequest-error.js";
import { NotFoundError } from "../errors/not-found-error.js";
import { Category, Message, Post, Review, User, Skill } from "../models/associations.js";

export const adminController = {
  getDashboard: async (req, res, next) => {
    const totalUsers = await User.count();
    const totalPosts = await Post.count();
    const totalCategories = await Category.count();

    const latestUsers = await User.findAll({
      where: { isBanned: false },
      limit: 5,
      order: [["createdAt", "DESC"]],
      attributes: ["id", "username", "email", "createdAt"],
    });

    const latestPosts = await Post.findAll({
      limit: 5,
      order: [["createdAt", "DESC"]],
      attributes: ["id", "title", "createdAt"],
      include: [{ model: User, as: "Author", attributes: ["id", "username"] }],
    });

    res.status(200).json({
      message: `Bonjour ${req.user.username}`,
      stats: {
        totalUsers,
        totalPosts,
        totalCategories,
      },
      recent: {
        users: latestUsers,
        posts: latestPosts,
      },
    });
  },

  getUsers: async (req, res, next) => {
    const users = await User.findAll({
      where: { isBanned: false },
      attributes: {
        exclude: ["password"],
      },
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json({ users });
  },

  getOneUser: async (req, res, next) => {
    const { userId } = req.params;

    if (!userId || Number.isNaN(Number(userId))) {
      return next(new BadRequestError("Identifiant utilisateur invalide"));
    }

    const user = await User.findByPk(userId, {
      attributes: {
        exclude: ["password"],
        include: [
          [Sequelize.fn("AVG", Sequelize.col("Reviews.grade")), "averageGrade"],
          [Sequelize.fn("COUNT", Sequelize.col("Reviews.grade")), "nbOfReviews"],
        ],
      },
      include: [
        {
          association: "Skills",
          through: { attributes: [] },
        },
        {
          association: "WantedSkills",
          through: { attributes: [] },
        },
        {
          association: "Availabilities",
          attributes: ["day_of_the_week", "time_slot"],
          through: { attributes: [] },
        },
        {
          association: "Reviews",
          attributes: ["id", "grade", "content", "createdAt"],
        },
        {
          association: "Posts",
          attributes: ["id", "title", "createdAt"],
        },
        {
          association: "SentPropositions",
          attributes: ["id", "content", "state", "createdAt"],
        },
        {
          association: "ReceivedPropositions",
          attributes: ["id", "content", "state", "createdAt"],
        },
        {
          association: "SentMessages",
          attributes: ["id", "content", "createdAt", "receiver_id"],
        },
        {
          association: "ReceivedMessages",
          attributes: ["id", "content", "createdAt", "sender_id"],
        },
      ],
      group: [
        "User.id",
        "Skills.id",
        "WantedSkills.id",
        "Availabilities.id",
        "Reviews.id",
        "Posts.id",
        "SentPropositions.id",
        "ReceivedPropositions.id",
        "SentMessages.id",
        "ReceivedMessages.id",
      ],
    });

    if (!user) {
      return next(new NotFoundError("Utilisateur non trouvé"));
    }

    return res.status(200).json({ user });
  },

  updateUser: async (req, res, next) => {
    const userId = req.params.userId;
    const data = req.validatedData;

    if (!userId || Number.isNaN(Number(userId))) {
      return next(new BadRequestError("Identifiant utilisateur invalide"));
    }

    const user = await User.findByPk(userId, {
      include: [{ association: "Reviews" }, { association: "SentMessages" }],
    });

    if (!user) {
      return next(new NotFoundError("Utilisateur non trouvé"));
    }

    const {
      username,
      firstName,
      lastName,
      avatar,
      description,
      role,
      isBanned,
      isAvailable,
      messages,
      reviews,
    } = data;

    await user.update({
      username: username ?? user.username,
      firstName: firstName ?? user.firstName,
      lastName: lastName ?? user.lastName,
      avatar: avatar ?? user.avatar,
      description: description ?? user.description,
      role: role ?? user.role,
      isBanned: isBanned ?? user.isBanned,
      isAvailable: isAvailable ?? user.isAvailable,
    });

    if (Array.isArray(messages)) {
      for (const msg of messages) {
        if (msg.action === "delete") {
          await Message.destroy({
            where: { id: msg.id, sender_id: user.id },
          });
        } else if (msg.action === "update") {
          await Message.update(
            { content: msg.content },
            { where: { id: msg.id, sender_id: user.id } },
          );
        }
      }
    }

    if (Array.isArray(reviews)) {
      for (const review of reviews) {
        if (review.action === "delete") {
          await Review.destroy({
            where: { id: review.id, user_id: user.id },
          });
        } else if (review.action === "update") {
          await Review.update(
            { content: review.content, grade: review.grade },
            { where: { id: review.id, user_id: user.id } },
          );
        }
      }
    }

    const updatedUser = await User.findByPk(userId, {
      attributes: { exclude: ["password"] },
      include: [{ association: "Reviews" }, { association: "SentMessages" }],
    });

    return res.status(200).json({
      message: `Utilisateur ${updatedUser.username} mis à jour avec succès`,
      user: updatedUser,
    });
  },

  createCategory: async (req, res, next) => {
    const { name, icon } = req.validatedData;

    const existing = await Category.findOne({ where: { name } });
    if (existing) {
      return next(new ConflictError("Cette catégorie existe déjà"));
    }

    const category = await Category.create({ name, icon });

    res.status(201).json({ message: "Catégorie créée", category });
  },

  getCategories: async (req, res, next) => {
    const categories = await Category.findAll({
      include: {
        model: Skill,
        attributes: ["id", "name"],
      },
      order: [["createdAt", "DESC"]],
    });

    console.log("👉 Catégories avec skills :", JSON.stringify(categories, null, 2));
    res.status(200).json({ categories });
  },

  updateCategories: async (req, res, next) => {
    const id = req.params.id;
    const data = req.validatedData;

    if (Number.isNaN(Number(id))) {
      return next(new BadRequestError("Catégorie non trouvée"));
    }

    const category = await Category.findByPk(id);

    const { name, icon } = data;

    const updateFields = {
      name: name ?? category.name,
      icon: icon ?? category.icon,
    };

    await category.update(updateFields);

    return res.status(200).json({ message: "Catégorie mise à jour", category });
  },

  deleteCategories: async (req, res, next) => {
    const id = Number(req.params.id);
    const category = await Category.findByPk(id);

    if (!category) {
      return next(new NotFoundError("Categorie non trouvée"));
    }

    await category.destroy(); // Delete User

    return res.status(200).json({ message: "Catégorie supprimée avec succès" });
  },
};
