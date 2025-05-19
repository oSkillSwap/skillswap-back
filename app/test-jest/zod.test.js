import { ZodError } from "zod";
import { registerSchema } from "../schemas/user.schema.js";

describe("Schéma d'inscription utilisateur", () => {
  let validData;

  beforeEach(() => {
    validData = {
      username: "Jean-Test",
      lastName: "Dupont",
      firstName: "Jean",
      email: "jean.dupont@example.com",
      password: "Motdepasse1!",
      avatar: "/avatar/avatar1.png",
      description: "<p>Bonjour <strong>tout</strong> le monde</p>",
    };
  });

  test("valide des données complètes et valides", () => {
    const result = registerSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  describe("Tests du mot de passe", () => {
    test("rejette un mot de passe sans majuscule", () => {
      validData.password = "motdepasse1!";
      const result = registerSchema.safeParse(validData);
      expect(result.success).toBe(false);
      expect(result.error.issues).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            path: ["password"],
            message: "Une lettre majuscule requise",
          }),
        ]),
      );
    });

    test("rejette un mot de passe sans minuscule", () => {
      validData.password = "MOTDEPASSE1!";
      const result = registerSchema.safeParse(validData);
      expect(result.success).toBe(false);
      expect(result.error.issues).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            path: ["password"],
            message: "Une lettre minuscule requise",
          }),
        ]),
      );
    });

    test("rejette un mot de passe sans chiffre", () => {
      validData.password = "Motdepasse!";
      const result = registerSchema.safeParse(validData);
      expect(result.success).toBe(false);
      expect(result.error.issues).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            path: ["password"],
            message: "Un chiffre requis",
          }),
        ]),
      );
    });

    test("rejette un mot de passe sans caractère spécial", () => {
      validData.password = "Motdepasse1";
      const result = registerSchema.safeParse(validData);
      expect(result.success).toBe(false);
      expect(result.error.issues).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            path: ["password"],
            message: "Un caractère spécial requis",
          }),
        ]),
      );
    });

    test("rejette un mot de passe trop court", () => {
      validData.password = "Aa1!";
      const result = registerSchema.safeParse(validData);
      expect(result.success).toBe(false);
      expect(result.error.issues).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            path: ["password"],
            message: "Le mot de passe doit faire au moins 8 caractères",
          }),
        ]),
      );
    });
  });

  describe("Tests du champ username", () => {
    test("rejette un username trop court", () => {
      validData.username = "ab";
      const result = registerSchema.safeParse(validData);
      expect(result.success).toBe(false);
      expect(result.error.issues).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            path: ["username"],
            message: "Le nom d'utilisateur est requis",
          }),
        ]),
      );
    });

    test("rejette un username avec caractères spéciaux", () => {
      validData.username = "jean$test";
      const result = registerSchema.safeParse(validData);
      expect(result.success).toBe(false);
      expect(result.error.issues).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            path: ["username"],
            message:
              "Le nom d'utilisateur ne peut contenir que des lettres, des chiffres ou des tirets",
          }),
        ]),
      );
    });
  });

  describe("Tests de l'email", () => {
    test("rejette un email invalide", () => {
      validData.email = "pas-un-mail";
      const result = registerSchema.safeParse(validData);
      expect(result.success).toBe(false);
      expect(result.error.issues).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            path: ["email"],
            message: "Adresse e-mail invalide",
          }),
        ]),
      );
    });
  });

  describe("Tests des champs optionnels", () => {
    test("autorise une description vide", () => {
      validData.description = "";
      const result = registerSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    test("autorise un nom sans lastName ni firstName", () => {
      const partialData = {
        ...validData,
        lastName: undefined,
        firstName: undefined,
      };
      const result = registerSchema.safeParse(partialData);
      expect(result.success).toBe(true);
    });
  });
});
