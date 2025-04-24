import argon2 from "argon2";
import { Sequelize } from "sequelize";
import { User } from "../models/associations.js";

export const userController = {
  register: async (req, res) => {
    try {
      const {
        username,
        lastName,
        firstName,
        email,
        password,
        role = "member", // Default role
        avatar = "/avatar/avatar1.png", // Default avatar
        description,
      } = req.validatedData;

      // Hash with argon2
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
      res.status(201).json({ message: "Utilisateur créé", user: newUser });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal Servor Error" });
    }
  },

  login: async (req, res) => {
    try {
      const { email, password } = req.validatedData;

      // Check if the user exists
      const user = await User.findOne({ where: { email } });
      if (!user) {
        return res.status(401).json({ message: "Identifiants incorrects" });
      }

      // Check if the password is correct
      const isPasswordValid = await argon2.verify(user.password, password);
      if (!isPasswordValid) {
        return res
          .status(401)
          .json({ message: "Mot de passe incorrect incorrects" });
      }

      res.status(200).json({ message: "Connexion réussie", user });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  },

  getUsers: async (req, res, next) => {
    // Fetch all users who are not banned, available, and have the role "member"
    const users = await User.findAll({
      where: {
        isBanned: false, // Ensure the user is not banned
        role: "member", // Only include users with the "member" role
        isAvailable: true, // Ensure the user is available
      },
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
      include: [
        {
          association: "Skills", // Include the user's skills
          attributes: ["id", "name"],
          through: { attributes: [] }, // Exclude join table attributes
        },
        {
          association: "WantedSkills", // Include the user's wanted skills
          attributes: ["id", "name"],
          through: { attributes: [] }, // Exclude join table attributes
        },
        {
          association: "Reviews", // Include reviews
          attributes: [], // No need to fetch review details
        },
      ],
      group: ["User.id", "Skills.id", "WantedSkills.id"], // Group by user and related entities,
      // Sort users based on the total number of reviews they have
      // order: [["nbOfReviews", "DESC"]],
    });

    return res.status(200).json({ users });
  },
};
