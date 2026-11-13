
import { describe, it, expect } from "vitest";

import project from "../../src/domain/project.js";

const validateProjectName = project.validateProjectName;


// ========================================
// VALIDATION DU NOM D'UN PROJET
// ========================================

describe("Validation du nom d'un projet", () => {

    describe("Classes d'équivalence invalides", () => {

        it("doit refuser un nom vide", () => {
            expect(() => validateProjectName("")).toThrow();
        });

        it("doit refuser un nom contenant uniquement des espaces", () => {
            expect(() => validateProjectName("   ")).toThrow();
        });

        it("doit refuser une valeur qui n'est pas une chaîne", () => {
            expect(() => validateProjectName(123)).toThrow();
        });

        it("doit refuser une valeur nulle", () => {
            expect(() => validateProjectName(null)).toThrow();
        });

        it("doit refuser une valeur non définie", () => {
            expect(() => validateProjectName(undefined)).toThrow();
        });
    });

    describe("Classes d'équivalence valides", () => {

        it("doit accepter un nom valide", () => {
            expect(validateProjectName("Projet INF563"))
                .toBe("Projet INF563");
        });

        it("doit supprimer les espaces inutiles autour du nom", () => {
            expect(validateProjectName("  Projet INF563  "))
                .toBe("Projet INF563");
        });

        it("doit conserver les espaces à l'intérieur du nom", () => {
            expect(validateProjectName("Projet de développement"))
                .toBe("Projet de développement");
        });

        it("doit conserver la casse du nom fourni", () => {
            expect(validateProjectName("Mon PROJET INF563"))
                .toBe("Mon PROJET INF563");
        });
    });
});
