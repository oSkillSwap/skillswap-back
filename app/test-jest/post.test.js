import { Sequelize } from "sequelize";
import { postController } from "../controllers/post.controller.js";
import { Post, User, Proposition, Skill } from "../models/associations.js";
import { NotFoundError } from "../errors/not-found-error.js";
import { UnauthorizedError } from "../errors/unauthorized-error.js";
import { BadRequestError } from "../errors/badrequest-error.js";
import { ForbiddenError } from "../errors/forbidden-error.js";
import { controllerwrapper } from "../middlewares/controllerwrapper.js";

jest.mock("../models/associations.js");

// Suite de tests pour le module Post
describe("Post module", () => {
	// ------------------------------------------ TEST RECUPERATION D'UN POST D'UN UTILISATEUR -------------------------------------------
	describe("Récupérer les posts d'un utilisateur", () => {
		test("Quand l'utilisateur n'existe pas, une NotFoundError doit être envoyée", async () => {
			// Préparation des données de test
			const req = { params: { id: 102 } };
			const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
			const next = jest.fn();

			User.findByPk.mockResolvedValueOnce(null); // Simuler que l'utilisateur n'existe pas

			// Appel de la méthode à tester
			await postController.getPostsFromUser(req, res, next);

			// Vérifications
			expect(next).toHaveBeenCalledTimes(1);

			const [error] = next.mock.calls[0];
			expect(error).toBeInstanceOf(NotFoundError);
			expect(error.name).toBe("NotFoundError");
			expect(error.message).toBe("Utilisateur non trouvé");
		});

		test("Quand l'utilisateur existe, la liste de ses posts doit être renvoyée", async () => {
			const req = { params: { id: 1 } };
			const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
			const next = jest.fn();

			User.findByPk.mockResolvedValueOnce({ id: 1 });

			Post.findAll.mockResolvedValue([
				{ id: 1, title: "Premier post" },
				{ id: 2, title: "Deuxième post" },
			]);

			await postController.getPostsFromUser(req, res, next);

			expect(res.json).toHaveBeenCalledTimes(1);
			expect(res.json).toHaveBeenCalledWith({
				posts: [
					{ id: 1, title: "Premier post" },
					{ id: 2, title: "Deuxième post" },
				],
			});
		});

		test("Quand l'utilisateur existe mais n'a aucun post, une liste vide doit être renvoyée", async () => {
			const req = { params: { id: 1 } };
			const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
			const next = jest.fn();

			User.findByPk.mockResolvedValueOnce({ id: 1 });
			Post.findAll.mockResolvedValue([]);

			await postController.getPostsFromUser(req, res, next);

			expect(res.json).toHaveBeenCalledWith({ posts: [] });
		});

		test("Lorsqu'on récupère un utilisateur, on vérifie que l'identifiant passé est celui attendu", async () => {
			const req = { params: { id: 5 } };
			const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
			const next = jest.fn();

			User.findByPk.mockResolvedValueOnce({ id: 5 });
			Post.findAll.mockResolvedValueOnce([]);

			await postController.getPostsFromUser(req, res, next);

			expect(User.findByPk).toHaveBeenCalledWith(5);
		});

		test("Quand un utilisateur est trouvé, on doit chercher tous les posts associés à son identifiant", async () => {
			const req = { params: { id: 3 } };
			const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
			const next = jest.fn();

			User.findByPk.mockResolvedValueOnce({ id: 3 });
			Post.findAll.mockResolvedValueOnce([]);

			await postController.getPostsFromUser(req, res, next);

			expect(Post.findAll).toHaveBeenCalled();
		});

		test("Quand une erreur inattendue survient, elle doit retourner une erreur 500", async () => {
			// Préparation des mocks
			const req = { params: { id: 1 } };
			const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
			const next = jest.fn();

			// Simulation d'une erreur sur User.findByPk
			User.findByPk.mockRejectedValueOnce(new Error("Erreur inattendue"));

			// Appel de la méthode
			await controllerwrapper(postController.getPostsFromUser)(req, res, next);

			// Vérifications
			expect(res.status).toHaveBeenCalledWith(500); // L'erreur doit envoyer 500
			expect(res.json).toHaveBeenCalledWith({
				message: "Une erreur inattendue est survenue. Veuillez réessayez.",
			});
		});
	});

	// ------------------------------------------ TEST RECUPERATION DE TOUS LES POSTS -------------------------------------------
	describe("Récupérer tous les posts", () => {
		test("Quand tout se passe bien, doit retourner la liste complète des posts avec les skills et auteur", async () => {
			const req = {};
			const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
			const next = jest.fn();

			// Mock de Post.findAll pour simuler la réponse complète
			Post.findAll.mockResolvedValue([
				{
					id: 1,
					title: "Post 1",
					SkillWanted: { id: 101, name: "JavaScript" },
					Author: {
						id: 11,
						username: "Alice",
						averageGrade: 4.8,
						nbOfReviews: 10,
					},
				},
				{
					id: 2,
					title: "Post 2",
					SkillWanted: { id: 102, name: "Python" },
					Author: {
						id: 12,
						username: "Bob",
						averageGrade: 4.5,
						nbOfReviews: 8,
					},
				},
			]);

			// Appel du contrôleur
			await postController.getPosts(req, res, next);

			// Vérifications
			expect(res.status).toHaveBeenCalledWith(200);
			expect(res.json).toHaveBeenCalledWith({
				posts: [
					{
						id: 1,
						title: "Post 1",
						SkillWanted: { id: 101, name: "JavaScript" },
						Author: {
							id: 11,
							username: "Alice",
							averageGrade: 4.8,
							nbOfReviews: 10,
						},
					},
					{
						id: 2,
						title: "Post 2",
						SkillWanted: { id: 102, name: "Python" },
						Author: {
							id: 12,
							username: "Bob",
							averageGrade: 4.5,
							nbOfReviews: 8,
						},
					},
				],
			});
		});

		test("Quand une erreur inattendue survient, elle doit retourner une erreur 500", async () => {
			const req = {};
			const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
			const next = jest.fn();

			// Simuler une erreur
			Post.findAll.mockRejectedValueOnce(new Error("Erreur inattendue"));

			await controllerwrapper(postController.getPosts)(req, res, next);

			expect(res.status).toHaveBeenCalledWith(500);
			expect(res.json).toHaveBeenCalledWith({
				message: "Une erreur inattendue est survenue. Veuillez réessayez.",
			});
		});

		test("Quand on récupère les posts, Post.findAll doit être appelé avec les bonnes associations et groupements", async () => {
			// Préparation des mocks
			const req = {}; // Pas besoin de params ici
			const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
			const next = jest.fn();

			Post.findAll.mockResolvedValueOnce([]); // On simule une réponse vide (c'est pas le but du test ici)

			// Appel de la méthode
			await postController.getPosts(req, res, next);

			// Vérification que Post.findAll a été appelé correctement
			expect(Post.findAll).toHaveBeenCalledWith({
				include: [
					{
						association: "SkillWanted",
					},
					{
						association: "Author",
						attributes: [
							"id",
							"username",
							[
								Sequelize.fn("AVG", Sequelize.col("Author->Reviews.grade")),
								"averageGrade",
							],
							[
								Sequelize.fn("COUNT", Sequelize.col("Author->Reviews.grade")),
								"nbOfReviews",
							],
						],
						include: {
							association: "Reviews",
							attributes: [],
						},
					},
				],
				group: ["Post.id", "SkillWanted.id", "Author.id"],
			});

			// En plus, on peut vérifier que res.status(200) a été appelé (bonus)
			expect(res.status).toHaveBeenCalledWith(200);
			expect(res.json).toHaveBeenCalledWith({ posts: [] });
		});
	});

	// ----------------------------------- TEST RECUPERATION DE TOUS LES POSTS DE l'UTILISATEUR CONNECTE -------------------------------------------
	describe("Récupérer tous les posts de l'utilisateur connecté", () => {
		test("Quand un utilisateur connecté récupère ses posts, Post.findAll est appelé avec les bons paramètres", async () => {
			const req = { user: { id: 1 } };
			const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
			const next = jest.fn();

			Post.findAll.mockResolvedValueOnce([]);

			await postController.getPostFromLoggedUser(req, res, next);

			expect(Post.findAll).toHaveBeenCalledWith(
				expect.objectContaining({
					attributes: { exclude: ["user_id", "skill_id"] },
					include: expect.arrayContaining([
						expect.objectContaining({
							association: "Author",
							where: { id: req.user.id },
							attributes: ["id", "username"],
						}),
						expect.objectContaining({ association: "SkillWanted" }),
						expect.objectContaining({
							model: Proposition,
							attributes: { exclude: ["sender_id", "receiver_id", "post_id"] },
						}),
					]),
					group: expect.arrayContaining([
						"Post.id",
						"Author.id",
						"SkillWanted.id",
						"Propositions.id",
						"Propositions->Sender.id",
						"Propositions->Sender->Reviews.id",
					]),
				}),
			);

			expect(res.status).toHaveBeenCalledWith(200);
			expect(res.json).toHaveBeenCalledWith({ posts: [] });
		});

		test("Quand une erreur inattendue survient lors de la récupération des posts, elle doit retourner un status 500", async () => {
			const req = { user: { id: 1 } };
			const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
			const next = jest.fn();

			Post.findAll.mockRejectedValueOnce(new Error("Erreur inattendue"));

			await controllerwrapper(postController.getPostFromLoggedUser)(
				req,
				res,
				next,
			);

			expect(res.status).toHaveBeenCalledWith(500);
			expect(res.json).toHaveBeenCalledWith({
				message: "Une erreur inattendue est survenue. Veuillez réessayez.",
			});
		});

		test("Quand tout se passe bien, il doit retourner tous les posts avec SkillWanted, Author et Propositions complets", async () => {
			const req = { user: { id: 1 } };
			const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
			const next = jest.fn();

			const mockPosts = [
				{
					id: 1,
					title: "Mon premier post",
					SkillWanted: {
						id: 2,
						name: "Compétence en React",
					},
					Author: {
						id: 1,
						username: "JohnDoe",
					},
					Propositions: [
						{
							id: 5,
							content: "Je suis intéressé",
							Sender: {
								id: 3,
								username: "JaneDoe",
								averageGrade: 4.5,
								nbOfReviews: 12,
							},
						},
					],
				},
			];

			Post.findAll.mockResolvedValueOnce(mockPosts);

			await postController.getPostFromLoggedUser(req, res, next);

			expect(Post.findAll).toHaveBeenCalledWith(
				expect.objectContaining({
					include: expect.arrayContaining([
						expect.objectContaining({
							association: "Author",
							where: { id: req.user.id },
						}),
					]),
				}),
			);

			expect(res.status).toHaveBeenCalledWith(200);
			expect(res.json).toHaveBeenCalledWith({ posts: mockPosts });
		});

		test("Quand aucun post n'est trouvé, il doit retourner une liste vide", async () => {
			const req = { user: { id: 1 } };
			const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
			const next = jest.fn();

			Post.findAll.mockResolvedValueOnce([]);

			await postController.getPostFromLoggedUser(req, res, next);

			expect(Post.findAll).toHaveBeenCalledWith(
				expect.objectContaining({
					include: expect.arrayContaining([
						expect.objectContaining({
							association: "Author",
							where: { id: req.user.id },
						}),
					]),
				}),
			);

			expect(res.status).toHaveBeenCalledWith(200);
			expect(res.json).toHaveBeenCalledWith({ posts: [] });
		});

		test("Quand l'utilisateur n'est pas connecté, une UnauthorizedError doit être renvoyée", async () => {
			const req = { user: undefined }; // utilisateur non connecté
			const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
			const next = jest.fn();

			await postController.getPostFromLoggedUser(req, res, next);

			expect(next).toHaveBeenCalledTimes(1);
			const [error] = next.mock.calls[0];
			expect(error).toBeInstanceOf(UnauthorizedError);
			expect(error.message).toBe("Utilisateur non authentifié");
		});

		test("Quand un post n'a pas de propositions, il doit quand même retourner un status 200", async () => {
			const req = { user: { id: 1 } };
			const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
			const next = jest.fn();

			const mockPosts = [
				{
					id: 1,
					title: "Post sans proposition",
					SkillWanted: { id: 2, name: "Compétence Vue.js" },
					Author: { id: 1, username: "JohnDoe" },
					Propositions: [], // Aucune proposition
				},
			];

			Post.findAll.mockResolvedValueOnce(mockPosts);

			await postController.getPostFromLoggedUser(req, res, next);

			expect(res.status).toHaveBeenCalledWith(200);
			expect(res.json).toHaveBeenCalledWith({ posts: mockPosts });
		});

		test("Les champs sender_id, receiver_id et post_id doivent être exclus dans les propositions", async () => {
			const req = { user: { id: 1 } };
			const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
			const next = jest.fn();

			Post.findAll.mockResolvedValueOnce([]);

			await postController.getPostFromLoggedUser(req, res, next);

			// Exclusion des IDs sensible dans la proposition
			expect(Post.findAll).toHaveBeenCalledWith(
				expect.objectContaining({
					include: expect.arrayContaining([
						expect.objectContaining({
							model: Proposition,
							attributes: expect.objectContaining({
								exclude: expect.arrayContaining([
									"sender_id",
									"receiver_id",
									"post_id",
								]),
							}),
						}),
					]),
				}),
			);

			expect(res.status).toHaveBeenCalledWith(200);
			expect(res.json).toHaveBeenCalledWith({ posts: [] });
		});
	});

	// ----------------------------------- TEST DE CREATION DE POST D'UN UTILISATEUR CONNECTE -------------------------------------------
	describe("Création de post par un utilisateur connecté", () => {
		test("Quand la compétence n'existe pas, une NotFoundError doit être renvoyée", async () => {
			const req = {
				user: { id: 1, username: "JohnDoe" }, // Utilisateur connecté
				validatedData: { content: "Contenu", title: "Titre", skill_id: 99 }, // skill_id qui n'existe pas
			};
			const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
			const next = jest.fn();

			Skill.findByPk.mockResolvedValueOnce(null); // Simuler que la compétence n'existe pas

			await postController.createPost(req, res, next);

			expect(Skill.findByPk).toHaveBeenCalledWith(99);
			expect(next).toHaveBeenCalledTimes(1);

			const [error] = next.mock.calls[0];
			expect(error).toBeInstanceOf(NotFoundError);
			expect(error.message).toBe("Compétence non trouvée");
		});

		test("Quand l'utilisateur a déjà un post avec cette compétence, une BadRequestError doit être renvoyée", async () => {
			const req = {
				user: { id: 1, username: "JohnDoe" },
				validatedData: { content: "Contenu", title: "Titre", skill_id: 5 },
			};
			const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
			const next = jest.fn();

			Skill.findByPk.mockResolvedValueOnce({ id: 5 }); // Compétence trouvée
			Post.findOne.mockResolvedValueOnce({ id: 10 }); // Un post existe déjà avec cette compétence

			await postController.createPost(req, res, next);

			expect(Skill.findByPk).toHaveBeenCalledWith(5);
			expect(Post.findOne).toHaveBeenCalledWith({
				where: { skill_id: 5, user_id: 1 },
			});
			expect(next).toHaveBeenCalledTimes(1);

			const [error] = next.mock.calls[0];
			expect(error).toBeInstanceOf(BadRequestError);
			expect(error.message).toBe(
				"Vous avez déjà un post avec cette compétence. Veuillez choisir une autre compétence.",
			);
		});

		test("Quand l'utilisateur a atteint la limite maximale de posts, une ForbiddenError doit être renvoyée", async () => {
			const req = {
				user: { id: 1, username: "JohnDoe" },
				validatedData: { content: "Contenu", title: "Titre", skill_id: 5 },
			};
			const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
			const next = jest.fn();

			Skill.findByPk.mockResolvedValueOnce({ id: 5 }); // Compétence trouvée
			Post.findOne.mockResolvedValueOnce(null); // Aucun post existant avec la compétence
			Post.count.mockResolvedValueOnce(10); // L'utilisateur a déjà 10 posts

			await postController.createPost(req, res, next);

			expect(Skill.findByPk).toHaveBeenCalledWith(5);
			expect(Post.findOne).toHaveBeenCalledWith({
				where: { skill_id: 5, user_id: 1 },
			});
			expect(Post.count).toHaveBeenCalledWith({
				where: { user_id: 1 },
			});

			expect(next).toHaveBeenCalledTimes(1);

			const [error] = next.mock.calls[0];
			expect(error).toBeInstanceOf(ForbiddenError);
			expect(error.message).toBe(
				"Limite de 10 posts crées atteinte. Veuillez supprimer un post existant pour en créer un nouveau.",
			);
		});

		test("Quand l'utilisateur a déjà un post avec cette compétence, une BadRequestError doit être renvoyée", async () => {
			const req = {
				user: { id: 1, username: "JohnDoe" },
				validatedData: {
					content: "Contenu test",
					title: "Titre test",
					skill_id: 10,
				},
			};
			const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
			const next = jest.fn();

			// Simulation : la compétence existe
			Skill.findByPk.mockResolvedValueOnce({ id: 10 });

			// Simulation : l'utilisateur a déjà un post avec cette compétence
			Post.findOne.mockResolvedValueOnce({ id: 1 });

			// Appel du contrôleur
			await postController.createPost(req, res, next);

			// Vérification que next est appelé avec une BadRequestError
			expect(next).toHaveBeenCalledTimes(1);
			const [error] = next.mock.calls[0];
			expect(error).toBeInstanceOf(BadRequestError);
			expect(error.message).toBe(
				"Vous avez déjà un post avec cette compétence. Veuillez choisir une autre compétence.",
			);
		});
	});
});
