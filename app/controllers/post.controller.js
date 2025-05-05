import { Op, Sequelize } from "sequelize";
import { BadRequestError } from "../errors/badrequest-error.js";
import { ForbiddenError } from "../errors/forbidden-error.js";
import { NotFoundError } from "../errors/not-found-error.js";
import { UnauthorizedError } from "../errors/unauthorized-error.js";

import {
  Post,
  Proposition,
  Review,
  Skill,
  User,
} from "../models/associations.js";

export const postController = {
  // Get all posts created by a specific user
  getPostsFromUser: async (req, res, next) => {
    const { id } = req.params;

    // Find the user by their primary key (id)
    const user = await User.findByPk(id);
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
          where: { id }, // Filter posts by the user id
        },
        {
          attributes: ["id", "name"], // Only return id and name of the skill
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
        },
        {
          association: "Author", // Include the author of the post
          attributes: [
            "id",
            "username",
            // Calculate the average grade of the author's reviews
            [
              Sequelize.fn("AVG", Sequelize.col("Author->Reviews.grade")),
              "averageGrade",
            ],
            // Count the number of reviews the author has
            [
              Sequelize.fn("COUNT", Sequelize.col("Author->Reviews.grade")),
              "nbOfReviews",
            ],
          ],
          include: {
            association: "Reviews", // Include the reviews of the author
            attributes: [], // Do not return any attributes from reviews
          },
        },
      ],
      // Group by these fields to avoid duplicate rows
      group: ["Post.id", "SkillWanted.id", "Author.id"],
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
                Sequelize.fn(
                  "AVG",
                  Sequelize.col("Propositions->Sender->Reviews.grade")
                ),
                "averageGrade",
              ],
              [
                Sequelize.fn(
                  "COUNT",
                  Sequelize.col("Propositions->Sender->Reviews.grade")
                ),
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

    // Check if the skill exists
    const skill = await Skill.findByPk(skill_id);
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

    // Check if the user has reached the maximum number of posts
    const maxPostsPerUser = 10;
    const userPostCount = await Post.count({
      where: { user_id: user.id },
    });

    if (userPostCount >= maxPostsPerUser) {
      return next(
        new ForbiddenError(
          `Limite de ${maxPostsPerUser} posts crées atteinte. Veuillez supprimer un post existant pour en créer un nouveau.`
        )
      );
    }

    if (existingPost) {
      return next(
        new BadRequestError(
          "Vous avez déjà un post avec cette compétence. Veuillez choisir une autre compétence."
        )
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
};
