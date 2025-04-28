import { Sequelize } from "sequelize";
import { userController } from "../controllers/user.controller.js";
import { User } from "../models/associations.js";

// Test suite for the User module
describe("User module", () => {
	// Suite de tests pour la fonctionnalité "Obtenir un utilisateur par ID"
	describe("Get user by id", () => {
		test("When id is not numeric, should return BadRequestError", async () => {
			// Arrange
			const req = { params: { userId: "Toto" } };
			const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
			const next = jest.fn();

			// Act
			await userController.getOneUser(req, res, next);

			// Assert
			expect(next).toHaveBeenCalledTimes(1); // Vérifie qu'on a bien eu 1 appel

			// Récupération de l'erreur
			const [error] = next.mock.calls[0];

			expect(error).toBeInstanceOf(Error); // Vérifie que c'est bien une erreur
			expect(error.name).toBe("BadRequestError");
			expect(error.message).toBe("Identifiant utilisateur invalide");
		});
	});
});
