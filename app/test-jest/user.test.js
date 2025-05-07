import { userController } from "../controllers/user.controller.js";
import { BadRequestError } from "../errors/badrequest-error.js";
import { ConflictError } from "../errors/conflict-error.js";
import { NotFoundError } from "../errors/not-found-error.js";
import { UnauthorizedError } from "../errors/unauthorized-error.js";
import { User } from "../models/associations.js";

jest.mock("../models/associations.js");

// Suite de tests pour le module utilisateur
describe("User module", () => {
  // ---------------------------------------- TESTS DES FOLLOWS ---------------------------------------------------------------
  describe("Un utilisateur suit un autre utilisateur", () => {
    let res;
    let next;
    const mockUser = { id: 1 };
    beforeEach(() => {
      jest.resetAllMocks();
      res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      next = jest.fn();
    });

    test("Quand l'utilisateur veut suivre un utilisateur qui n'existe pas, une NotFoundError doit être renvoyée", async () => {
      User.findByPk.mockResolvedValueOnce(null).mockResolvedValueOnce(mockUser);

      const req = {
        params: { userId: 50 },
        user: { id: 1 },
      };

      await userController.followUser(req, res, next);

      // Récupère le premier argument passé à la fonction `next` lors de son premier appel.
      const [error] = next.mock.calls[0];

      expect(error).toBeInstanceOf(NotFoundError);
      expect(error.name).toBe("NotFoundError");
      expect(error.message).toBe("Utilisateur non trouvé");
    });

    test("Quand l'utilisateur se suit lui-même, une BadRequestError doit être renvoyée", async () => {
      // Préparation des données de test
      // Configurer le mock pour ce test spécifique
      User.findByPk
        .mockResolvedValueOnce(mockUser) // Pour targetUser
        .mockResolvedValueOnce(mockUser); // Pour userLoggedIn

      // Préparation des données de test
      const req = {
        params: { userId: 1 }, // Identifiant de l'utilisateur à suivre
        user: { id: 1 }, // Identifiant de l'utilisateur connecté (même ID)
      };
      // Appel de la méthode à tester
      await userController.followUser(req, res, next);

      // Récupération de l'erreur passée à next()
      const [error] = next.mock.calls[0];
      expect(error).toBeInstanceOf(BadRequestError); // Vérifie que l'erreur est bien une BadRequestError
      expect(error.name).toBe("BadRequestError"); // Vérifie le nom de l'erreur
      expect(error.message).toBe("Vous ne pouvez pas vous suivre vous-même"); // Vérifie le message d'erreur
    });

    test("Quand l'utilisateur n'est pas connecté, une UnauthorizedError doit être renvoyée", async () => {
      User.findByPk.mockResolvedValueOnce(mockUser).mockResolvedValueOnce(null);
      const req = {
        params: { userId: 1 },
        user: undefined,
      };

      await userController.followUser(req, res, next);

      const [error] = next.mock.calls[0];
      expect(error).toBeInstanceOf(UnauthorizedError);
      expect(error.name).toBe("UnauthorizedError");
      expect(error.message).toBe("Utilisateur non authentifié");
    });

    test("Quand l'utilisateur suit déjà l'utilisateur cible, une ConflictError doit être renvoyée", async () => {
      const mockLoggedUser = {
        id: 1,
        hasFollows: jest.fn().mockResolvedValue(true),
      };

      User.findByPk
        .mockResolvedValueOnce(mockUser)
        .mockResolvedValueOnce(mockLoggedUser);

      const req = {
        params: { userId: 2 },
        user: { id: 1 },
      };

      await userController.followUser(req, res, next);

      expect(mockLoggedUser.hasFollows).toHaveBeenCalledWith(mockUser);

      const [error] = next.mock.calls[0];
      expect(error).toBeInstanceOf(ConflictError);
      expect(error.name).toBe("ConflictError");
      expect(error.message).toBe("Vous suivez déjà cet utilisateur");
    });

    test("Quand un utilisateur est authentifié, qu'il ne suit pas la cible et qu'elle existe, l'opération doit réussir", async () => {
      const mockLoggedUser = {
        id: 2,
        hasFollows: jest.fn().mockResolvedValue(false),
        addFollows: jest.fn().mockResolvedValue(true),
      };

      User.findByPk
        .mockResolvedValueOnce(mockUser)
        .mockResolvedValueOnce(mockLoggedUser);

      const req = {
        params: { userId: 2 },
        user: { id: 1 },
      };

      await userController.followUser(req, res, next);

      expect(mockLoggedUser.hasFollows).toHaveBeenCalledWith(mockUser);
      expect(mockLoggedUser.addFollows).toHaveBeenCalledWith(mockUser);

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: `Vous suivez l'utilisateur ${mockUser.username}`,
      });
    });
  });
  // --------------------------------------- TEST DES UNFOLLOWS ----------------------------------------------
  describe("Un utilisateur arrête de suivre un autre utilisateur", () => {
    let res;
    let next;
    const mockUser = { id: 1 };
    beforeEach(() => {
      jest.resetAllMocks();
      res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      next = jest.fn();
    });
    test("Quand l'utilisateur veut arrêter de suivre un utilisateur qui n'existe pas, une NotFoundError doit être renvoyée", async () => {
      User.findByPk.mockResolvedValueOnce(null).mockResolvedValueOnce(mockUser);
      const req = {
        params: { userId: 50 },
        user: { id: 1 },
      };

      await userController.unfollowUser(req, res, next);

      // Récupère le premier argument passé à la fonction `next` lors de son premier appel.
      const [error] = next.mock.calls[0];

      expect(error).toBeInstanceOf(NotFoundError);
      expect(error.name).toBe("NotFoundError");
      expect(error.message).toBe("Utilisateur non trouvé");
    });
    test("Quand l'utilisateur n'est pas authentifié, une UnauthorizedError doit être renvoyée", async () => {
      // Mock de l'utilisateur cible
      const mockUser = {
        id: 1,
        username: "testUser",
      };

      // Configuration des mocks pour User.findByPk
      User.findByPk
        .mockResolvedValueOnce(mockUser) // Retourne l'utilisateur cible
        .mockResolvedValueOnce(null); // Simule un utilisateur non authentifié

      // Simulation de la requête HTTP sans utilisateur authentifié
      const req = {
        params: { userId: 1 }, // ID de l'utilisateur à ne plus suivre
        user: undefined, // Aucun utilisateur connecté
      };

      // Appel de la fonction unfollowUser
      await userController.unfollowUser(req, res, next);

      // Récupère l'erreur passée à next lors de son premier appel
      const [error] = next.mock.calls[0];

      // Vérifications de l'erreur
      expect(error).toBeInstanceOf(UnauthorizedError); // Vérifie que c'est une UnauthorizedError
      expect(error.name).toBe("UnauthorizedError"); // Vérifie le nom de l'erreur
      expect(error.message).toBe("Utilisateur non authentifié"); // Vérifie le message d'erreur
    });
    test("Quand l'utilisateur veut arrêter de suivre une personne qu'il ne suit pas, une ConflictError doit être renvoyée", async () => {
      // Mock de l'utilisateur connecté
      const mockLoggedUser = {
        id: 1,
        hasFollows: jest.fn().mockResolvedValue(false), // Simule que l'utilisateur ne suit pas
      };

      // Mock de l'utilisateur cible
      const mockUser = {
        id: 2,
        username: "testUser",
      };

      // Configuration des mocks pour User.findByPk
      User.findByPk
        .mockResolvedValueOnce(mockUser) // Retourne l'utilisateur cible
        .mockResolvedValueOnce(mockLoggedUser); // Retourne l'utilisateur connecté

      const req = {
        params: { userId: 2 }, // ID de l'utilisateur à ne plus suivre
        user: { id: 1 }, // ID de l'utilisateur connecté
      };

      // Appel de la fonction unfollowUser
      await userController.unfollowUser(req, res, next);

      // Vérification que hasFollows a été appelé
      expect(mockLoggedUser.hasFollows).toHaveBeenCalledWith(mockUser);

      // Vérification de l'erreur renvoyée
      const [error] = next.mock.calls[0]; // Récupère l'erreur passée à next
      expect(error).toBeInstanceOf(ConflictError); // Vérifie que c'est une ConflictError
      expect(error.name).toBe("ConflictError"); // Vérifie le nom de l'erreur
      expect(error.message).toBe("Vous ne suivez pas cet utilisateur"); // Vérifie le message d'erreur
    });
    test("Quand l'utilisateur est authentifié, qu'il ne suit pas la personne et qu'elle existe, l'opération doit réussir", async () => {
      const mockLoggedUser = {
        id: 2,
        hasFollows: jest.fn().mockResolvedValue(true), // Simule la vérification si l'utilisateur suit
        removeFollows: jest.fn().mockResolvedValue(true), // Simule la suppression du suivi
      };

      const mockUser = {
        id: 1,
        username: "testUser",
      };

      // Configuration des mocks pour User.findByPk
      User.findByPk
        .mockResolvedValueOnce(mockUser) // Retourne l'utilisateur cible
        .mockResolvedValueOnce(mockLoggedUser); // Retourne l'utilisateur connecté

      // Simulation de la requête HTTP
      const req = {
        params: { userId: 2 }, // ID de l'utilisateur à ne plus suivre
        user: { id: 1 }, // ID de l'utilisateur connecté
      };

      await userController.unfollowUser(req, res, next);

      // Vérifications des appels
      expect(mockLoggedUser.hasFollows).toHaveBeenCalledWith(mockUser); // Vérifie si hasFollows a été appelé
      expect(mockLoggedUser.removeFollows).toHaveBeenCalledWith(mockUser); // Vérifie si removeFollows a été appelé

      // Vérifications de la réponse
      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200); // Vérifie le code de statut 200
      expect(res.json).toHaveBeenCalledWith({
        message: `Vous ne suivez plus l'utilisateur ${mockUser.username}`, // Vérifie le message de réponse
      });
    });
  });
});
