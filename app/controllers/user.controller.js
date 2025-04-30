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

		const existingEmail = await User.findOne({ where: { email } });
		if (existingEmail) {
			return next(new ConflictError("Cet email est déjà utilisé"));
		}

		const existingUsername = await User.findOne({ where: { username } });
		if (existingUsername) {
			return next(new ConflictError("Ce nom d'utilisateur est déjà utilisé"));
		}

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
	},

	login: async (req, res, next) => {
		const { email, password } = req.validatedData;

		const user = await User.findOne({ where: { email } });
		if (!user) return next(new UnauthorizedError("Identifiants incorrects"));

		const isPasswordValid = await argon2.verify(user.password, password);
		if (!isPasswordValid)
			return next(new UnauthorizedError("Identifiants incorrects"));

		const token = generateToken({
			id: user.id,
			email: user.email,
			username: user.username,
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

	getUsers: async (req, res) => {
		const users = await User.findAll({
			where: {
				isBanned: false,
				role: "member",
				isAvailable: true,
			},
			attributes: {
				exclude: ["password", "email", "updatedAt", "createdAt"],
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
					include: [{ model: Category }],
				},
				{
					association: "WantedSkills",
					attributes: ["id", "name"],
					through: { attributes: [] },
				},
				{
					association: "Reviews",
					attributes: [],
				},
			],
			group: ["User.id", "Skills.id", "WantedSkills.id", "Skills->Category.id"],
			order: [["nbOfReviews", "DESC"]],
		});

		res.status(200).json({ users });
	},

	getFollowersAndFollowsFromUser: async (req, res, next) => {
		const { id } = req.params;
		const user = await User.findByPk(id, {
			attributes: [],
			include: [
				{
					association: "Followers",
					attributes: ["id", "username"],
					through: { attributes: [] },
				},
				{
					association: "Follows",
					attributes: ["id", "username"],
					through: { attributes: [] },
				},
			],
		});

		if (!user) return next(new NotFoundError("Utilisateur non trouvé"));

		return res.status(200).json({ user });
	},

	getOneUser: async (req, res, next) => {
		const { userId } = req.params;

		const numericUserId = Number(userId);
		if (!userId || Number.isNaN(numericUserId)) {
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

		if (!user) return next(new NotFoundError("Utilisateur non trouvé"));

		return res.status(200).json({ user });
	},

	updateUser: async (req, res, next) => {
		const userId = req.user.id;
		const { username, firstName, lastName, email, avatar, description } =
			req.validatedData;

		if (Object.keys(req.validatedData).length === 0) {
			return next(
				new BadRequestError("Aucune donnée fournie pour la mise à jour"),
			);
		}

		const user = await User.findByPk(userId);
		if (!user) return next(new NotFoundError("Utilisateur non trouvé"));

		if (email && email !== user.email) {
			const existingUser = await User.findOne({ where: { email } });
			if (existingUser) {
				return next(new ConflictError("Cet email est déjà utilisé"));
			}
		}

		const updatedFields = {
			username: username ?? user.username,
			firstName: firstName ?? user.firstName,
			lastName: lastName ?? user.lastName,
			email: email ?? user.email,
			avatar: avatar ?? user.avatar,
			description: description ?? user.description,
		};

		await user.update(updatedFields);

		return res.status(200).json({ message: "Utilisateur mis à jour", user });
	},

	updateUserWantedSkills: async (req, res, next) => {
		const userId = req.user.id;
		const { wantedSkills } = req.validatedData;

		const user = await User.findByPk(userId);
		if (!user) return next(new NotFoundError("Utilisateur non trouvé"));

		await user.setWantedSkills(wantedSkills);

		return res
			.status(200)
			.json({ message: "Compétences souhaitées mises à jour" });
	},

	updateUserSkills: async (req, res, next) => {
		const userId = req.user.id;
		const { skills } = req.validatedData;

		const user = await User.findByPk(userId);
		if (!user) return next(new NotFoundError("Utilisateur non trouvé"));

		await user.setSkills(skills);

		return res
			.status(200)
			.json({ message: "Compétences mises à jour avec succès" });
	},

	deleteUser: async (req, res, next) => {
		const userId = req.user.id;
		const user = await User.findByPk(userId);
		if (!user) return next(new NotFoundError("Utilisateur non trouvé"));

		await user.destroy();
		return res.status(200).json({ message: "Compte supprimé avec succès" });
	},

	followUser: async (req, res, next) => {
		const { userId } = req.params;
		const userLoggedIn = req.user;

		if (!userLoggedIn)
			return next(new UnauthorizedError("Utilisateur non authentifié"));

		const targetUser = await User.findByPk(userId);
		const user = await User.findByPk(userLoggedIn.id);

		if (!targetUser) return next(new NotFoundError("Utilisateur non trouvé"));
		if (userLoggedIn.id === Number(userId)) {
			return next(
				new BadRequestError("Vous ne pouvez pas vous suivre vous-même"),
			);
		}

		const isFollowing = await user.hasFollows(targetUser);
		if (isFollowing) {
			return next(new ConflictError("Vous suivez déjà cet utilisateur"));
		}

		await user.addFollows(targetUser);

		return res.status(200).json({
			message: `Vous suivez l'utilisateur ${targetUser.username}`,
		});
	},

	unfollowUser: async (req, res, next) => {
		const userLoggedIn = req.user;
		const { userId } = req.params;

		if (!userLoggedIn)
			return next(new UnauthorizedError("Utilisateur non authentifié"));

		const targetUser = await User.findByPk(userId);
		const user = await User.findByPk(userLoggedIn.id);
		if (!targetUser) return next(new NotFoundError("Utilisateur non trouvé"));

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
