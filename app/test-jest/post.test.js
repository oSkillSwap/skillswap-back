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
});
