import { Op, Sequelize, where } from "sequelize";
import { BadRequestError } from "../errors/badrequest-error.js";
import { ForbiddenError } from "../errors/forbidden-error.js";
import { NotFoundError } from "../errors/not-found-error.js";
import { UnauthorizedError } from "../errors/unauthorized-error.js";

import { Post, Proposition, Review, Skill, User } from "../models/associations.js";

export const postController = {
  // Get all posts created by a specific user
  getPostsFromUser: async (req, res, next) => {
    const { userIdOrUsername } = req.params;

    // Find the user by their primary key (id)
    const user = await User.findOne({
      // biome-ignore lint/suspicious/noGlobalIsNan: <explanation>
      where: isNaN(userIdOrUsername)
        ? { username: userIdOrUsername }
        : { id: Number(userIdOrUsername) },
    });
    if (!user) {
      // If user is not found, return a 404 error
      return next(new NotFoundError("Utilisateur non trouvé"));
    }

    // Find all posts created by the user
    const posts = await Post.findAll({
      exclude: ["user_id", "skill_id"], // Exclude these fields from the result
      include: [
        {
          association: "Author", // Include the author of the post
          attributes: [], // Only return id and username of the author
          where: { id: user.id }, // Filter posts by the user id
        },
        {
          association: "SkillWanted", // Include the skill wanted in the post
        },
      ],
    });
    return res.status(200).json({ posts });
  },

  getPosts: async (req, res, _) => {
    const posts = await Post.findAll({
      include: [
        {
          association: "SkillWanted", // Include the skill wanted in the post
          attributes: ["id", "name", "category_id"], // Only return id and name of the skill,
          include: {
            association: "Category",
            attributes: ["id", "name"],
          },
        },
        {
          association: "Author", // Include the author of the post
          attributes: [
            "id",
            "username",
            "avatar",
            // Calculate the average grade of the author's reviews
            [Sequelize.fn("AVG", Sequelize.col("Author->Reviews.grade")), "averageGrade"],
            // Count the number of reviews the author has
            [Sequelize.fn("COUNT", Sequelize.col("Author->Reviews.grade")), "nbOfReviews"],
          ],
          include: {
            association: "Reviews", // Include the reviews of the author
            attributes: [], // Do not return any attributes from reviews
          },
        },
      ],
      // Group by these fields to avoid duplicate rows
      group: ["Post.id", "SkillWanted.id", "Author.id", "SkillWanted->Category.id"],
    });

    return res.status(200).json({ posts }); // Return the posts as JSON
  },

  // Get all posts created by the logged-in user
  getPostFromLoggedUser: async (req, res, next) => {
    const loggedUser = req.user;

    // Check if the user is connected
    if (!loggedUser) {
      return next(new UnauthorizedError("Utilisateur non authentifié"));
    }

    const posts = await Post.findAll({
      attributes: {
        exclude: ["user_id", "skill_id"], // Exclude these fields from the result
      },
      include: [
        {
          association: "Author", // Include the author of the post
          where: { id: loggedUser.id }, // Filter posts by the logged-in user id
          attributes: ["id", "username"], // Only return id and username of the author
        },
        {
          association: "SkillWanted", // Include the skill wanted in the post
        },
        {
          model: Proposition, // Include propositions related to the post
          attributes: {
            exclude: ["sender_id", "receiver_id", "post_id"], // Exclude these fields from the result
          },
          include: {
            association: "Sender", // Include the sender of the proposition
            attributes: [
              "id",
              "username",
              [
                Sequelize.fn("AVG", Sequelize.col("Propositions->Sender->Reviews.grade")),
                "averageGrade",
              ],
              [
                Sequelize.fn("COUNT", Sequelize.col("Propositions->Sender->Reviews.grade")),
                "nbOfReviews",
              ],
            ],
            include: {
              association: "Reviews", // Include the reviews of the sender
              attributes: [], // Do not return any attributes from reviews
            },
          },
        },
      ],
      group: [
        "Post.id",
        "Author.id",
        "SkillWanted.id",
        "Propositions.id",
        "Propositions->Sender.id",
        "Propositions->Sender->Reviews.id",
      ],
    });

    return res.status(200).json({ posts }); // Return the posts as JSON
  },

  // Create a new post
  createPost: async (req, res, next) => {
    const user = req.user; // Get the logged-in user
    const { content, title, skill_id } = req.validatedData; // Extract validated data from the request

    // Check if the user has reached the maximum number of posts
    const maxPostsPerUser = 10;
    const userPostCount = await Post.count({
      where: { user_id: user.id },
    });

    if (userPostCount >= maxPostsPerUser) {
      return next(
        new ForbiddenError(
          "Limite de 10 posts crées atteinte. Veuillez supprimer un post existant pour en créer un nouveau.",
        ),
      );
    }
    // Check if the skill exists
    const skill = await Skill.findByPk(Number(skill_id));
    if (!skill) {
      return next(new NotFoundError("Compétence non trouvée"));
    }

    // Check if the user already has a post with the same skill
    const existingPost = await Post.findOne({
      where: {
        skill_id,
        user_id: user.id,
      },
    });

    if (existingPost) {
      return next(
        new BadRequestError(
          "Vous avez déjà un post avec cette compétence. Veuillez choisir une autre compétence.",
        ),
      );
    }

    // Create a new post
    const newPost = await Post.create({
      content,
      title,
      skill_id,
      user_id: user.id,
      isClosed: false,
    });

    return res.status(201).json({
      message: `Nouveau post crée par ${user.username}`,
      newPost,
    });
  },
  deletePost: async (req, res, next) => {
    const { id } = req.params; // Get the post ID from the request parameters
    const user = req.user; // Get the logged-in user

    // Find the post by its ID
    const post = await Post.findByPk(id);
    if (!post) {
      return next(new NotFoundError("Post non trouvé"));
    }

    // Check if the logged-in user is the author of the post
    if (Number(post.user_id) !== Number(user.id)) {
      return next(new ForbiddenError("Vous n'êtes pas autorisé à supprimer ce post"));
    }

    // Check if the post has any propositions
    const propositions = await Proposition.findAll({
      where: {
        post_id: id,
      },
    });

    if (propositions && propositions.length > 0) {
      await propositions.destroy();
    }

    // Delete the post
    await post.destroy();

    return res.status(200).json({ message: "Post supprimé avec succès" });
  },
  updatePost: async (req, res, next) => {
    const { id } = req.params; // Get the post ID from the request parameters
    const user = req.user; // Get the logged-in user
    const { content, title, skill_id } = req.validatedData; // Extract validated data from the request
    const post = await Post.findByPk(id);
    if (!post) {
      return next(new NotFoundError("Post non trouvé"));
    }

    // Check if the logged-in user is the author of the post
    if (Number(post.user_id) !== Number(user.id)) {
      return next(new ForbiddenError("Vous n'êtes pas autorisé à modifier ce post"));
    }

    if (Object.keys(req.validatedData).length === 0) {
      return next(new BadRequestError("Aucune donnée à mettre à jour"));
    }

    const updatedFields = {
      title: title ?? post.title,
      content: content ?? post.content,
      skill_id: post.skill_id,
    };

    // Update the post with the new data
    const updatedPost = await post.update(updatedFields);

    return res.status(200).json({ message: "Post modifié avec succès", updatedPost });
  },
};
