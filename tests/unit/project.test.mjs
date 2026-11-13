
import { describe, it, expect } from "vitest";
import project from "../../src/domain/project.js";

const validateProjectName = project.validateProjectName;


describe("Validation du nom d'un projet", () => {
    it("doit refuser un nom vide", () => {
        expect(() => validateProjectName("")).toThrow();
    });

    it("doit refuser un nom contenant uniquement des espaces", () => {
        expect(() => validateProjectName("   ")).toThrow();
    });

    it("doit accepter un nom valide", () => {
        expect(validateProjectName("Projet INF563")).toBe("Projet INF563");
    });
});
