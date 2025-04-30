import { ZodError } from "zod";
import { registerSchema } from "../schemas/user.schema.js";

describe("Schema d'incription utilisateur zod", () => {
  let input;
  beforeEach(() => {
    input = {
      username: "User1",
      lastName: "userlastname",
      firstName: "userfirstname",
      email: "user@gmail.com",
      password: "User1234+",
      avatar: "/",
      role: "member",
      description: ".....",
    };
  });
  describe("Tests du mot de passe", () => {
    test("Si le mot de passe ne fait pas minimum 8 caractères, doit renvoyer un message disant: 'Le mot de passe doit faire au moins 8 caractères'", () => {
      input.password = "User12+";

      const result = registerSchema.safeParse(input);

      expect(result.success).toBe(false);
      expect(result.error).toBeInstanceOf(ZodError);
      expect(result.error.issues).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            path: ["password"],
            message: "Le mot de passe doit faire au moins 8 caractères",
          }),
        ])
      );
    });
    test("Si le mot de passe ne contient pas au moins une lettre minuscule, doit renvoyer un message disant: Le mot de passe doit contenir au moins une lettre minuscule", () => {
      input.password = "USER1234+";

      const result = registerSchema.safeParse(input);

      expect(result.success).toBe(false);
      expect(result.error).toBeInstanceOf(ZodError);
      expect(result.error.issues).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            path: ["password"],
            message:
              "Le mot de passe doit contenir au moins une lettre minuscule",
          }),
        ])
      );
    });
    test("Si le mot de passe ne contient pas au moins une lettre majuscule, doit renvoyer un message disant: Le mot de passe doit contenir au moins une lettre majuscule", () => {
      input.password = "user1234+";

      const result = registerSchema.safeParse(input);

      expect(result.success).toBe(false);
      expect(result.error).toBeInstanceOf(ZodError);
      expect(result.error.issues).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            path: ["password"],
            message:
              "Le mot de passe doit contenir au moins une lettre majuscule",
          }),
        ])
      );
    });
    test("Si le mot de passe ne contient pas au moins un caractère spécial, doit renvoyer un message disant: Le mot de passe doit contenir au moins un caractère spécial", () => {
      input.password = "User12345";

      const result = registerSchema.safeParse(input);

      expect(result.success).toBe(false);
      expect(result.error).toBeInstanceOf(ZodError);
      expect(result.error.issues).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            path: ["password"],
            message:
              "Le mot de passe doit contenir au moins un caractère spécial",
          }),
        ])
      );
    });
    test("Quand le mot de passe fait 8 caractères minimum, contient au moins une minuscule, une majuscule et un caractère spécial, l'opération doit réussir", () => {
      input.password = "User1234+";
      const result = registerSchema.safeParse(input);
      expect(result.success).toBe(true);
    });
  });
  describe("Tests du username", () => {
    test("Si le username contient moins de 3 caractères, doit renvoyer un code 'too_short'", () => {
      input.username = "az";
      const result = registerSchema.safeParse(input);

      expect(result.success).toBe(false);

      expect(result.error).toBeInstanceOf(ZodError);
      expect(result.error.issues).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            path: ["username"],
            code: "too_small",
          }),
        ])
      );
    });
    test("Si le username contient plus de 16 caractères, doit renvoyer un code 'too_big'", () => {
      input.username = "azertyuiopqsdfghjklmwxcvbn";
      const result = registerSchema.safeParse(input);

      expect(result.success).toBe(false);
      expect(result.error).toBeInstanceOf(ZodError);
      expect(result.error.issues).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            path: ["username"],
            code: "too_big",
          }),
        ])
      );
    });
    test("Si le username ne contient pas que des chiffres, lettres et tirets, doit renvoyer un code 'invalid_string'", () => {
      input.username = "bonjour++";
      const result = registerSchema.safeParse(input);

      expect(result.success).toBe(false);
      expect(result.error).toBeInstanceOf(ZodError);
      console.log(result.error.issues);
      expect(result.error.issues).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            path: ["username"],
            code: "invalid_string",
          }),
        ])
      );
    });
    test("Si le username contient au moins un 3 caractères et maximum 16 caractères, l'opération doit réussir", () => {
      input.username = "Oui";
      const result = registerSchema.safeParse(input);

      expect(result.success).toBe(true);
    });
  });
});
