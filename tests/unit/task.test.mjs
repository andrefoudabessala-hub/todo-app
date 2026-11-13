
import { describe, it, expect } from "vitest";

import taskModule from "../../src/domain/task.js";

const {
    validateTaskTitle,
    validateDueDate
} = taskModule;

describe("Validation du titre d'une tâche", () => {

    it("doit refuser un titre vide", () => {
        expect(() => validateTaskTitle("")).toThrow();
    });

    it("doit refuser un titre contenant uniquement des espaces", () => {
        expect(() => validateTaskTitle("   ")).toThrow();
    });

    it("doit refuser un titre qui n'est pas une chaîne", () => {
        expect(() => validateTaskTitle(123)).toThrow();
    });

    it("doit accepter un titre d'un seul caractère", () => {
        expect(validateTaskTitle("A")).toBe("A");
    });

    it("doit accepter un titre de 100 caractères", () => {
        const title = "A".repeat(100);

        expect(validateTaskTitle(title)).toBe(title);
    });

    it("doit refuser un titre de 101 caractères", () => {
        const title = "A".repeat(101);

        expect(() => validateTaskTitle(title)).toThrow();
    });

    it("doit supprimer les espaces inutiles autour du titre", () => {
        expect(validateTaskTitle("  Réviser INF563  "))
            .toBe("Réviser INF563");
    });
});

describe("Validation de la date d'échéance", () => {

    it("doit accepter une date absente", () => {
        expect(validateDueDate(undefined)).toBe(null);
    });

    it("doit accepter une date vide", () => {
        expect(validateDueDate("")).toBe(null);
    });

    it("doit accepter une date valide", () => {
        expect(validateDueDate("2026-11-13"))
            .toBe("2026-11-13");
    });

    it("doit accepter le 29 février d'une année bissextile", () => {
        expect(validateDueDate("2024-02-29"))
            .toBe("2024-02-29");
    });

    it("doit refuser le 29 février d'une année non bissextile", () => {
        expect(() => validateDueDate("2023-02-29")).toThrow();
    });

    it("doit refuser un jour inexistant", () => {
        expect(() => validateDueDate("2026-04-31")).toThrow();
    });

    it("doit refuser un format de date incorrect", () => {
        expect(() => validateDueDate("13/11/2026")).toThrow();
    });
});
