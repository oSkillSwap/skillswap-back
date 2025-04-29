import { Sequelize } from "sequelize";
import { postController } from "../controllers/post.controller.js";
import { Post, User } from "../models/associations.js";
import { NotFoundError } from "../errors/not-found-error.js";
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
});
