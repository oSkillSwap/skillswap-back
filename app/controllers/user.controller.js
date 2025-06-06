import argon2 from "argon2";
import { v4 as uuidv4 } from "uuid";
import { Op, Sequelize } from "sequelize";
import { BadRequestError } from "../errors/badrequest-error.js";
import { ConflictError } from "../errors/conflict-error.js";
import { JsonWebTokenError } from "../errors/jsonwebtoken-error.js";
import { NotFoundError } from "../errors/not-found-error.js";
import { UnauthorizedError } from "../errors/unauthorized-error.js";
import { generateToken, verifyToken } from "../helpers/jwt.js";
import { Availability, Category, Review, User } from "../models/associations.js";
import crypto from "crypto";
import { transporter } from "../helpers/mail.js";
import sharp from "sharp";
import path from "node:path";
import fs from "node:fs/promises";

async function sendResetEmail(to, resetUrl) {
  await transporter.sendMail({
    from: '"SkillSwap" <virmaud.gregory@gmail.com>',
    to,
    subject: "Réinitialisation de votre mot de passe",
    html: `
      <p>Bonjour,</p>
      <p>Vous avez demandé à réinitialiser votre mot de passe. Cliquez ci-dessous :</p>
      <a href="${resetUrl}">${resetUrl}</a>
      <p>Ce lien expirera dans 1 heure.</p>
      <p>Si vous n'avez rien demandé, ignorez simplement ce message.</p>
    `,
  });
}

const deleteFileSafely = async (filePath) => {
  try {
    await new Promise((res) => setTimeout(res, 100));
    await fs.unlink(filePath);
  } catch (err) {
    if (err.code !== "ENOENT") {
      console.error(`Erreur suppression fichier : ${filePath}`, err);
    }
  }
};

export const userController = {
  forgotPassword: async (req, res, next) => {
    const { email } = req.validatedData;

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(200).json({
        message: "Si un compte est associé à cet email, un lien de réinitialisation a été envoyé.",
      });
    }

    const rawToken = crypto.randomBytes(32).toString("hex");
    const resetToken = crypto.createHash("sha256").update(rawToken).digest("hex");

    const expires = new Date(Date.now() + 60 * 60 * 1000); // 1h

    await user.update({
      reset_token: resetToken,
      reset_token_expires: expires,
    });

    const baseFrontendUrl = process.env.BASE_URL.replace(/\/api\/?$/, "");
    const resetUrl = `${baseFrontendUrl}/reset-password/${rawToken}`;
    await sendResetEmail(user.email, resetUrl);

    return res.status(200).json({
      message: "Si un compte est associé à cet email, un lien de réinitialisation a été envoyé.",
    });
  },

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

    res.status(201).json({ message: "Utilisateur créé avec succès", user: newUser });
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

    // Access token (15 minutes)
    const accessToken = generateToken(
      {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
      },
      "1m",
    );

    // Refresh token (7 jours)
    const refreshToken = generateToken(
      { id: user.id, email: user.email, username: user.username, role: user.role },
      "7d",
    );

    res
      .cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: true, // true if using https
        sameSite: "None",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 jours
      })
      .status(200)
      .json({
        message: "Connexion réussie",
        token: accessToken,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          avatar: user.avatar,
          role: user.role,
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
      through: { attributes: [] }, // Exclude join table attributes
      include: [
        {
          model: Category,
        },
      ],
    };

    const wantedSkills = {
      association: "WantedSkills", // Include the user's wanted skills,
      attributes: ["id", "name", "category_id"],
      through: { attributes: [] }, // Exclude join table attributes
      include: [
        {
          model: Category,
        },
      ],
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
          [Sequelize.fn("COUNT", Sequelize.col("Reviews.grade")), "nbOfReviews"],
        ],
      },
      include: [skillsAndCategory, wantedSkills, reviews],
      group: [
        "User.id",
        "Skills.id",
        "WantedSkills.id",
        "Skills->Category.id",
        "WantedSkills->Category.id",
      ], // Group by user and related entities,
      // Sort users based on the total number of reviews they have
      order: [["nbOfReviews", "DESC"]],
    });
    return res.status(200).json({ users });
  },

  getFollowersAndFollowsFromUser: async (req, res, next) => {
    const { userIdOrUsername } = req.params;
    const user = await User.findOne({
      // biome-ignore lint/suspicious/noGlobalIsNan: <explanation>
      where: isNaN(userIdOrUsername)
        ? { username: userIdOrUsername }
        : { id: Number(userIdOrUsername) },
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
    const { userIdOrUsername } = req.params;

    const isNumeric = /^\d+$/.test(userIdOrUsername);
    const whereCondition = isNumeric
      ? {
          [Op.or]: [{ id: Number(userIdOrUsername) }, { username: userIdOrUsername }],
        }
      : { username: userIdOrUsername };

    const user = await User.findOne({
      where: whereCondition,
      attributes: {
        exclude: ["password", "email"],
      },
      include: [
        {
          association: "Skills",
          attributes: ["id", "name", "category_id"],
          through: { attributes: [] },
        },
        {
          association: "WantedSkills",
          attributes: ["id", "name", "category_id"],
          through: { attributes: [] },
        },
        {
          association: "Availabilities",
          attributes: ["day_of_the_week", "time_slot"],
          through: { attributes: [] },
        },
      ],
    });

    if (!user) {
      return next(new NotFoundError("Utilisateur non trouvé"));
    }

    const reviewStats = await Review.findOne({
      where: { user_id: user.id },
      attributes: [
        [Sequelize.fn("AVG", Sequelize.col("grade")), "averageGrade"],
        [Sequelize.fn("COUNT", Sequelize.col("grade")), "nbOfReviews"],
      ],
      raw: true,
    });

    user.setDataValue("averageGrade", reviewStats.averageGrade);
    user.setDataValue("nbOfReviews", reviewStats.nbOfReviews);

    return res.status(200).json({ user });
  },

  updateUser: async (req, res, next) => {
    const userId = req.user.id; // Get the user ID from the token
    const {
      username,
      firstName,
      lastName,
      email,
      avatar,
      availabilities,
      isAvailable,
      password,
      description,
    } = req.validatedData; // Get the data from the request body

    // Check if no data provided
    if (Object.keys(req.validatedData).length === 0) {
      return next(new BadRequestError("Aucune donnée fournie pour la mise à jour"));
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
      password: password || user.password,
      email: email || user.email,
      avatar: avatar || user.avatar,
      description: description ?? user.description,
      isAvailable: isAvailable ?? user.isAvailable,
    };

    await user.update(updatedFields); // Update the user with the new data

    const updatedUser = await User.findByPk(user.id, {
      attributes: {
        exclude: ["password"],
      },
      include: [
        {
          association: "Availabilities",
          attributes: ["day_of_the_week", "time_slot"],
          through: { attributes: [] },
        },
      ],
    });

    if (availabilities && Array.isArray(availabilities)) {
      await user.setAvailabilities([]); // delete old

      const availabilityInstances = await Promise.all(
        availabilities.map(async ({ day_of_the_week, time_slot }) => {
          // find the availability
          const availability = await Availability.findOne({
            where: { day_of_the_week, time_slot },
          });

          if (!availability) {
            throw new BadRequestError(`Disponibilité invalide : ${day_of_the_week} - ${time_slot}`);
          }

          return availability;
        }),
      );

      await user.addAvailabilities(availabilityInstances); // add news
    }

    return res.status(200).json({ message: "Utilisateur mis à jour", user: updatedUser }); // Return success message and updated user
  },

  updatePassword: async (req, res, next) => {
    const userId = req.user.id;
    const { currentPassword, newPassword, confirmPassword } = req.validatedData;

    if (newPassword !== confirmPassword) {
      return next(new BadRequestError("Les mots de passe ne correspondent pas"));
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return next(new NotFoundError("Utilisateur non trouvé"));
    }

    const isPasswordValid = await argon2.verify(user.password, currentPassword);
    if (!isPasswordValid) {
      return next(new UnauthorizedError("Mot de passe actuel incorrect"));
    }

    const hashedNewPassword = await argon2.hash(newPassword);
    await user.update({ password: hashedNewPassword });

    return res.status(200).json({ message: "Mot de passe mis à jour avec succès" });
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
    const { userIdOrUsername } = req.params;
    const userLoggedIn = req.user;

    if (!userLoggedIn) {
      return next(new UnauthorizedError("Utilisateur non authentifié"));
    }

    const targetUser = await User.findOne({
      // biome-ignore lint/suspicious/noGlobalIsNan: <explanation>
      where: isNaN(userIdOrUsername)
        ? { username: userIdOrUsername }
        : { id: Number(userIdOrUsername) },
    });
    const user = await User.findByPk(userLoggedIn.id);

    if (!targetUser) {
      return next(new NotFoundError("Utilisateur non trouvé"));
    }

    if (userLoggedIn.username === targetUser.username) {
      return next(new BadRequestError("Vous ne pouvez pas vous suivre vous-même"));
    }

    if (Number(userLoggedIn.id) === Number(userIdOrUsername)) {
      return next(new BadRequestError("Vous ne pouvez pas vous suivre vous-même"));
    }

    const isFollowing = await user.hasFollows(targetUser);
    if (isFollowing) {
      return next(new ConflictError("Vous suivez déjà cet utilisateur"));
    }

    await user.addFollows(targetUser);

    return res.status(200).json({ message: `Vous suivez l'utilisateur ${targetUser.username}` });
  },

  unfollowUser: async (req, res, next) => {
    const userLoggedIn = req.user;
    const { userIdOrUsername } = req.params;

    if (!userLoggedIn) {
      return next(new UnauthorizedError("Utilisateur non authentifié"));
    }

    const targetUser = await User.findOne({
      // biome-ignore lint/suspicious/noGlobalIsNan: <explanation>
      where: isNaN(userIdOrUsername)
        ? { username: userIdOrUsername }
        : { id: Number(userIdOrUsername) },
    });
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

  refreshToken: async (req, res, next) => {
    const token = req.cookies.refreshToken;

    console.log("refresh token", token);

    if (!token) {
      return next(new JsonWebTokenError("Refresh token manquant"));
    }
    const payload = verifyToken(token); // On récupère l'id du user

    // Tu peux retrouver l'utilisateur si nécessaire
    const user = await User.findByPk(payload.id);

    if (!user) {
      return next(new JsonWebTokenError("Utilisateur non trouvé"));
    }

    // Regénère un nouvel access token
    const newAccessToken = generateToken(
      {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
      },
      "15m",
    );

    res.status(200).json({ token: newAccessToken });
  },

  resetPassword: async (req, res, next) => {
    const { password, confirmPassword } = req.validatedData;
    const { token } = req.params;

    if (password !== confirmPassword) {
      return next(new BadRequestError("Les mots de passe ne correspondent pas"));
    }

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      where: {
        reset_token: hashedToken,
        reset_token_expires: {
          [Op.gt]: new Date(),
        },
      },
    });

    if (!user) {
      return next(new BadRequestError("Lien invalide ou expiré"));
    }

    const hashedNewPassword = await argon2.hash(password);
    await user.update({
      password: hashedNewPassword,
      reset_token: null,
      reset_token_expires: null,
    });

    return res.status(200).json({ message: "Mot de passe réinitialisé avec succès" });
  },

  uploadAvatar: async (req, res, next) => {
    try {
      const user = await User.findByPk(req.user.id);
      if (!user) return next(new NotFoundError("Utilisateur non trouvé"));
      if (!req.file) return next(new BadRequestError("Aucun fichier envoyé"));

      const uniqueId = uuidv4();
      const webpFilename = `avatar-${user.id}-${uniqueId}.webp`;
      const outputPath = path.join("uploads", webpFilename);

      // Conversion vers WebP
      await sharp(req.file.path).resize(300, 300).webp({ quality: 80 }).toFile(outputPath);

      // Supprimer le fichier temporaire (ex: temp-12-xxxx.jpg)
      await deleteFileSafely(req.file.path);

      // Supprimer l'ancien avatar .webp s'il existe
      if (user.avatar?.includes("/uploads/")) {
        const oldFile = path.join("uploads", path.basename(user.avatar));
        await deleteFileSafely(oldFile);
      }

      const avatarUrl = `${process.env.BASE_URL}/uploads/${webpFilename}`;
      await user.update({ avatar: avatarUrl });

      return res.status(200).json({ avatar: avatarUrl });
    } catch (err) {
      return next(err);
    }
  },
};
