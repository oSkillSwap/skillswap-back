import { userController } from "../controllers/user.controller.js";
import { BadRequestError } from "../errors/badrequest-error.js";
import { ConflictError } from "../errors/conflict-error.js";
import { NotFoundError } from "../errors/not-found-error.js";
import { UnauthorizedError } from "../errors/unauthorized-error.js";
import { User } from "../models/associations.js";

jest.mock("../models/associations.js");

// Suite de tests pour le module utilisateur
describe("User module", () => {
  // ------------------------------------------ TEST RECUPERATION D'UTILISATEUR -------------------------------------------
  describe("Récupérer l'utilisateur par son identifiant", () => {
    test("Quand l'identifiant n'est pas un nombre, une BadRequestError doit être renvoyée", async () => {
      // Préparation des données de test
      const req = { params: { userId: "To" } }; // Identifiant utilisateur invalide (non numérique)
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() }; // Mock de l'objet réponse
      const next = jest.fn(); // Mock de la fonction next

      // Appel de la méthode à tester
      await userController.getOneUser(req, res, next);

      expect(next).toHaveBeenCalledTimes(1);

      // Récupère le premier argument passé à la fonction `next` lors de son premier appel.
      const [error] = next.mock.calls[0];

      expect(error).toBeInstanceOf(BadRequestError); // Vérifie que l'erreur est bien une BadRequestError
      expect(error.name).toBe("BadRequestError"); // Vérifie le nom de l'erreur
      expect(error.message).toBe("Identifiant utilisateur invalide"); // Vérifie le message d'erreur
    });
  });

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
      User.findByPk.mockResolvedValueOnce(mockUser).mockResolvedValueOnce(null);
      const req = {
        params: { userId: 1 },
        user: undefined,
      };

      await userController.unfollowUser(req, res, next);

      // Récupère le premier argument passé à la fonction `next` lors de son premier appel.
      const [error] = next.mock.calls[0];

      expect(error).toBeInstanceOf(UnauthorizedError);
      expect(error.name).toBe("UnauthorizedError");
      expect(error.message).toBe("Utilisateur non authentifié");
    });
    test("Quand l'utilisateur veut arrêter de suivre une personne qu'il ne suit pas, une ConflictError doit être renvoyée", async () => {
      const mockLoggedUser = {
        id: 1,
        hasFollows: jest.fn().mockResolvedValue(false),
      };

      User.findByPk
        .mockResolvedValueOnce(mockUser)
        .mockResolvedValueOnce(mockLoggedUser);

      const req = {
        params: { userId: 2 },
        user: { id: 1 },
      };

      await userController.unfollowUser(req, res, next);

      expect(mockLoggedUser.hasFollows).toHaveBeenCalledWith(mockUser);

      const [error] = next.mock.calls[0];
      expect(error).toBeInstanceOf(ConflictError);
      expect(error.name).toBe("ConflictError");
      expect(error.message).toBe("Vous ne suivez pas cet utilisateur");
    });
    test("Quand l'utilisateur est authentifié, qu'il ne suit pas la personne et qu'elle existe, l'opération doit réussir", async () => {
      const mockLoggedUser = {
        id: 2,
        hasFollows: jest.fn().mockResolvedValue(true),
        removeFollows: jest.fn().mockResolvedValue(true),
      };

      User.findByPk
        .mockResolvedValueOnce(mockUser)
        .mockResolvedValueOnce(mockLoggedUser);

      const req = {
        params: { userId: 2 },
        user: { id: 1 },
      };

      await userController.unfollowUser(req, res, next);

      expect(mockLoggedUser.hasFollows).toHaveBeenCalledWith(mockUser);
      expect(mockLoggedUser.removeFollows).toHaveBeenCalledWith(mockUser);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: `Vous ne suivez plus l'utilisateur ${mockUser.username}`,
      });
    });
  });
});
