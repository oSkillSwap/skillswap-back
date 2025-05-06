import argon2 from "argon2";
import { Sequelize } from "sequelize";
import { BadRequestError } from "../errors/badrequest-error.js";
import { ConflictError } from "../errors/conflict-error.js";
import { NotFoundError } from "../errors/not-found-error.js";
import { UnauthorizedError } from "../errors/unauthorized-error.js";
import { generateToken } from "../helpers/jwt.js";
import { Category, User } from "../models/associations.js";

export const userController = {
  register: async (req, res, next) => {
    const users = await User.findAll();

    const lastId = users[users.length - 1].id;
    const newId = lastId + 1;

    const {
      username,
      lastName,
      firstName,
      email,
      password,
      avatar = `https://robohash.org/${newId}`,
      description,
    } = req.validatedData;

    const role = "member";

    // Email have to be unique
    const existingEmail = await User.findOne({ where: { email } });
    if (existingEmail) {
      return next(new ConflictError("Cet email est déjà utilisé"));
    }

    // username have to be unique
    const existingUsername = await User.findOne({ where: { username } });
    if (existingUsername) {
      return next(new ConflictError("Ce nom d'utilisateur est déjà utilisé"));
    }

    // Hash password
    const hashedPassword = await argon2.hash(password);

    const newUser = await User.create({
      username,
      lastName,
      firstName,
      email,
      password: hashedPassword,
      role,
      avatar,
      description,
    });

    res
      .status(201)
      .json({ message: "Utilisateur créé avec succès", user: newUser });
  },

  // Login function to authenticate users
  login: async (req, res, next) => {
    const { email, password } = req.validatedData;

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return next(new UnauthorizedError("Identifiants incorrects"));
    }

    const isPasswordValid = await argon2.verify(user.password, password);
    if (!isPasswordValid) {
      return next(new UnauthorizedError("Identifiants incorrects"));
    }

    const token = generateToken({
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
    });

    res.status(200).json({
      message: "Connexion réussie",
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
    });
  },

  getUsers: async (req, res, next) => {
    const whereCondition = {
      isBanned: false, // Ensure the user is not banned
      role: "member", // Only include users with the "member" role
      isAvailable: true, // Ensure the user is available
    };

    const skillsAndCategory = {
      association: "Skills", // Include the user's skills
      attributes: ["id", "name"],
      through: { attributes: [] }, // Exclude join table attributes
      include: [
        {
          model: Category,
        },
      ],
    };

    const wantedSkills = {
      association: "WantedSkills", // Include the user's wanted skills
      attributes: ["id", "name"],
      through: { attributes: [] }, // Exclude join table attributes
    };

    const reviews = {
      association: "Reviews", // Include reviews
      attributes: [], // No need to fetch review details
    };

    const users = await User.findAll({
      where: whereCondition,
      attributes: {
        // Excluse password, email, updatedAt and createdAt fields
        exclude: ["password", "email", "updatedAt", "createdAt"],
        include: [
          // Calculate the average grade of the user from their reviews
          [Sequelize.fn("AVG", Sequelize.col("Reviews.grade")), "averageGrade"],
          // Count the number of reviews the user has
          [
            Sequelize.fn("COUNT", Sequelize.col("Reviews.grade")),
            "nbOfReviews",
          ],
        ],
      },
      include: [skillsAndCategory, wantedSkills, reviews],
      group: ["User.id", "Skills.id", "WantedSkills.id", "Skills->Category.id"], // Group by user and related entities,
      // Sort users based on the total number of reviews they have
      order: [["nbOfReviews", "DESC"]],
    });
    return res.status(200).json({ users });
  },

  getFollowersAndFollowsFromUser: async (req, res, next) => {
    const { id } = req.params;
    const user = await User.findByPk(id, {
      attributes: [],
      include: [
        {
          association: "Followers",
          attributes: ["id", "username", "avatar"],
          through: { attributes: [] },
        },
        {
          association: "Follows",
          attributes: ["id", "username", "avatar"],
          through: { attributes: [] },
        },
      ],
    });

    if (!user) {
      return next(new NotFoundError("Utilisateur non trouvé"));
    }

    return res.status(200).json({ user });
  },

  getOneUser: async (req, res, next) => {
    const { userId } = req.params;

    // biome-ignore lint/suspicious/noGlobalIsNan: <explanation>
    if (!userId || isNaN(Number(userId))) {
      return next(new BadRequestError("Identifiant utilisateur invalide"));
    }

    const user = await User.findByPk(userId, {
      attributes: {
        exclude: ["password", "email"],
        include: [
          [Sequelize.fn("AVG", Sequelize.col("Reviews.grade")), "averageGrade"],
          [
            Sequelize.fn("COUNT", Sequelize.col("Reviews.grade")),
            "nbOfReviews",
          ],
        ],
      },
      include: [
        {
          association: "Skills",
          attributes: ["id", "name"],
          through: { attributes: [] },
        },
        {
          association: "WantedSkills",
          attributes: ["id", "name"],
          through: { attributes: [] },
        },
        {
          association: "Availabilities",
          attributes: ["day_of_the_week", "time_slot"],
          through: { attributes: [] },
        },
        {
          association: "Reviews",
          attributes: [],
        },
      ],
      group: ["User.id", "Skills.id", "WantedSkills.id", "Availabilities.id"],
    });

    if (!user) {
      return next(new NotFoundError("Utilisateur non trouvé"));
    }

    return res.status(200).json({ user });
  },

  updateUser: async (req, res, next) => {
    const userId = req.user.id; // Get the user ID from the token
    const { username, firstName, lastName, email, avatar, description } =
      req.validatedData; // Get the data from the request body

    // Check if no data provided
    if (Object.keys(req.validatedData).length === 0) {
      return next(
        new BadRequestError("Aucune donnée fournie pour la mise à jour")
      );
    }
    const user = await User.findByPk(userId); // Find the user by ID

    if (!user) {
      return next(new NotFoundError("Utilisateur non trouvé")); // If user not found, return error
    }

    if (email && email !== user.email) {
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return next(new ConflictError("Cet email est déjà utilisé")); // If email already exists, return error => Can't errase existing user
      }
    }

    const updatedFields = {
      username: username ?? user.username,
      firstName: firstName ?? user.firstName,
      lastName: lastName ?? user.lastName,
      email: email || user.email,
      avatar: avatar || user.avatar,
      description: description ?? user.description,
    };

    await user.update(updatedFields); // Update the user with the new data

    return res.status(200).json({ message: "Utilisateur mis à jour", user }); // Return success message and updated user
  },

  deleteUser: async (req, res, next) => {
    const userId = req.user.id; // Get the user ID from the token
    const user = await User.findByPk(userId);

    if (!user) {
      return next(new NotFoundError("Utilisateur non trouvé"));
    }

    await user.destroy(); // Delete User

    return res.status(200).json({ message: "Compte supprimé avec succès" });
  },

  followUser: async (req, res, next) => {
    const { userId } = req.params;
    const userLoggedIn = req.user;

    if (!userLoggedIn) {
      return next(new UnauthorizedError("Utilisateur non authentifié"));
    }

    const targetUser = await User.findByPk(userId);
    const user = await User.findByPk(userLoggedIn.id);

    if (!targetUser) {
      return next(new NotFoundError("Utilisateur non trouvé"));
    }

    if (userLoggedIn.id === Number(userId)) {
      return next(
        new BadRequestError("Vous ne pouvez pas vous suivre vous-même")
      );
    }

    const isFollowing = await user.hasFollows(targetUser);
    if (isFollowing) {
      return next(new ConflictError("Vous suivez déjà cet utilisateur"));
    }

    await user.addFollows(targetUser);

    return res
      .status(200)
      .json({ message: `Vous suivez l'utilisateur ${targetUser.username}` });
  },

  unfollowUser: async (req, res, next) => {
    const userLoggedIn = req.user;
    const { userId } = req.params;

    if (!userLoggedIn) {
      return next(new UnauthorizedError("Utilisateur non authentifié"));
    }

    const targetUser = await User.findByPk(userId);
    const user = await User.findByPk(userLoggedIn.id);

    if (!targetUser) {
      return next(new NotFoundError("Utilisateur non trouvé"));
    }

    const isFollowing = await user.hasFollows(targetUser);
    if (!isFollowing) {
      return next(new ConflictError("Vous ne suivez pas cet utilisateur"));
    }

    await user.removeFollows(targetUser);

    return res.status(200).json({
      message: `Vous ne suivez plus l'utilisateur ${targetUser.username}`,
    });
  },
};
