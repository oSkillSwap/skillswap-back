
import { Sequelize } from "sequelize";
import { Category, User } from "../models/associations.js";
import argon2 from "argon2";
import validator from "validator";
import { generateToken } from "../helpers/jwt.js";


export const userController = {
	register: async (req, res) => {
		const {
			username,
			lastName,
			firstName,
			email,
			password,
			role = "member",
			avatar = "/avatar/avatar1.png",
			description,
		} = req.validatedData;

		// Sanitize input
		const sanitizedUsername = validator.trim(username);
		const sanitizedLastName = lastName ? validator.trim(lastName) : null;
		const sanitizedFirstName = firstName ? validator.trim(firstName) : null;
		const sanitizedDescription = description
			? validator.escape(validator.trim(description))
			: null;

		// Hash password
		const hashedPassword = await argon2.hash(password);

		const newUser = await User.create({
			username: sanitizedUsername,
			lastName: sanitizedLastName,
			firstName: sanitizedFirstName,
			email,
			password: hashedPassword,
			role,
			avatar,
			description: sanitizedDescription,
		});

		res.status(201).json({ message: "Utilisateur créé", user: newUser });
	},

	// Login function to authenticate users
	login: async (req, res) => {
		const { email, password } = req.validatedData;

		const user = await User.findOne({ where: { email } });
		if (!user) {
			return res.status(401).json({ message: "Identifiants incorrects" });
		}

		const isPasswordValid = await argon2.verify(user.password, password);
		if (!isPasswordValid) {
			return res.status(401).json({ message: "Mot de passe incorrect" });
		}

		const token = generateToken({ id: user.id, email: user.email });

    res.status(200).json({ message: "Connexion réussie", user });
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
};
