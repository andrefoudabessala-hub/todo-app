
import { describe, it, expect } from "vitest";

import taskModule from "../../src/domain/task.js";

const {
    MAX_TASK_TITLE_LENGTH,
    validateTaskTitle,
    validateDueDate
} = taskModule;

// ========================================
// VALIDATION DU TITRE
// ========================================

describe("Validation du titre d'une tâche", () => {

    describe("Classes d'équivalence", () => {

        it("doit refuser un titre vide", () => {
            expect(() => validateTaskTitle(""))
                .toThrow("Le titre de la tâche est obligatoire.");
        });

        it("doit refuser un titre contenant uniquement des espaces", () => {
            expect(() => validateTaskTitle("   "))
                .toThrow("Le titre de la tâche est obligatoire.");
        });

        it("doit refuser un titre qui n'est pas une chaîne", () => {
            expect(() => validateTaskTitle(123))
                .toThrow("Le titre de la tâche doit être une chaîne de caractères.");
        });

        it("doit refuser un titre null", () => {
            expect(() => validateTaskTitle(null))
                .toThrow("Le titre de la tâche doit être une chaîne de caractères.");
        });

        it("doit refuser un titre undefined", () => {
            expect(() => validateTaskTitle(undefined))
                .toThrow("Le titre de la tâche doit être une chaîne de caractères.");
        });

        it("doit refuser un titre de type objet", () => {
            expect(() => validateTaskTitle({ title: "Test" }))
                .toThrow("Le titre de la tâche doit être une chaîne de caractères.");
        });

        it("doit accepter un titre valide", () => {
            expect(validateTaskTitle("Réviser INF563"))
                .toBe("Réviser INF563");
        });

        it("doit supprimer les espaces inutiles autour du titre", () => {
            expect(validateTaskTitle("  Réviser INF563  "))
                .toBe("Réviser INF563");
        });

        it("doit conserver les espaces internes du titre", () => {
            expect(validateTaskTitle("Réviser le cours INF563"))
                .toBe("Réviser le cours INF563");
        });
    });

    describe("Tests des valeurs limites", () => {

        it("doit accepter un titre d'un seul caractère", () => {
            expect(validateTaskTitle("A")).toBe("A");
        });

        it("doit accepter un titre de 99 caractères", () => {
            const title = "A".repeat(99);

            expect(validateTaskTitle(title)).toBe(title);
        });

        it("doit accepter un titre de 100 caractères", () => {
            const title = "A".repeat(100);

            expect(validateTaskTitle(title)).toBe(title);
        });

        it("doit refuser un titre de 101 caractères", () => {
            const title = "A".repeat(101);

            expect(() => validateTaskTitle(title))
                .toThrow("Le titre ne doit pas dépasser 100 caractères.");
        });

        it("doit utiliser une limite maximale de 100 caractères", () => {
            expect(MAX_TASK_TITLE_LENGTH).toBe(100);
        });

        it("doit refuser un titre dépassant la limite après suppression des espaces", () => {
            const title = ` ${"A".repeat(101)} `;

            expect(() => validateTaskTitle(title))
                .toThrow("Le titre ne doit pas dépasser 100 caractères.");
        });
    });
});

// ========================================
// VALIDATION DE LA DATE D'ÉCHÉANCE
// ========================================

describe("Validation de la date d'échéance", () => {

    describe("Classes d'équivalence", () => {

        it("doit accepter une date undefined comme date absente", () => {
            expect(validateDueDate(undefined)).toBe(null);
        });

        it("doit accepter une date null comme date absente", () => {
            expect(validateDueDate(null)).toBe(null);
        });

        it("doit accepter une chaîne vide comme date absente", () => {
            expect(validateDueDate("")).toBe(null);
        });

        it("doit accepter une date valide", () => {
            expect(validateDueDate("2026-11-13"))
                .toBe("2026-11-13");
        });

        it("doit refuser une valeur qui n'est pas une chaîne", () => {
            expect(() => validateDueDate(20261113))
                .toThrow("La date doit être une chaîne de caractères.");
        });

        it("doit refuser une date numérique", () => {
            expect(() => validateDueDate(20261113))
                .toThrow("La date doit être une chaîne de caractères.");
        });

        it("doit refuser une date de type objet", () => {
            expect(() => validateDueDate({ year: 2026 }))
                .toThrow("La date doit être une chaîne de caractères.");
        });

        it("doit refuser un format jour/mois/année", () => {
            expect(() => validateDueDate("13/11/2026"))
                .toThrow("Le format de date doit être AAAA-MM-JJ.");
        });

        it("doit refuser une date avec des séparateurs incorrects", () => {
            expect(() => validateDueDate("2026/11/13"))
                .toThrow("Le format de date doit être AAAA-MM-JJ.");
        });

        it("doit refuser une date sans zéro initial pour le mois", () => {
            expect(() => validateDueDate("2026-4-13"))
                .toThrow("Le format de date doit être AAAA-MM-JJ.");
        });

        it("doit refuser une date sans zéro initial pour le jour", () => {
            expect(() => validateDueDate("2026-04-3"))
                .toThrow("Le format de date doit être AAAA-MM-JJ.");
        });

        it("doit refuser une date contenant une heure", () => {
            expect(() => validateDueDate("2026-11-13T10:00:00"))
                .toThrow("Le format de date doit être AAAA-MM-JJ.");
        });
    });

    describe("Tests des valeurs limites et calendaires", () => {

        it("doit accepter le premier jour d'un mois", () => {
            expect(validateDueDate("2026-04-01"))
                .toBe("2026-04-01");
        });

        it("doit accepter le dernier jour d'un mois de 30 jours", () => {
            expect(validateDueDate("2026-04-30"))
                .toBe("2026-04-30");
        });

        it("doit refuser le 31 avril", () => {
            expect(() => validateDueDate("2026-04-31"))
                .toThrow("La date d'échéance n'est pas valide.");
        });

        it("doit accepter le 31 janvier", () => {
            expect(validateDueDate("2026-01-31"))
                .toBe("2026-01-31");
        });

        it("doit refuser le 32 janvier", () => {
            expect(() => validateDueDate("2026-01-32"))
                .toThrow("La date d'échéance n'est pas valide.");
        });

        it("doit refuser un mois inexistant supérieur à 12", () => {
            expect(() => validateDueDate("2026-13-10"))
                .toThrow("La date d'échéance n'est pas valide.");
        });

        it("doit refuser le mois zéro", () => {
            expect(() => validateDueDate("2026-00-10"))
                .toThrow("La date d'échéance n'est pas valide.");
        });

        it("doit accepter le 29 février d'une année bissextile", () => {
            expect(validateDueDate("2024-02-29"))
                .toBe("2024-02-29");
        });

        it("doit refuser le 29 février d'une année non bissextile", () => {
            expect(() => validateDueDate("2023-02-29"))
                .toThrow("La date d'échéance n'est pas valide.");
        });

        it("doit accepter le 29 février de l'année 2000", () => {
            expect(validateDueDate("2000-02-29"))
                .toBe("2000-02-29");
        });

        it("doit refuser le 29 février de l'année 1900", () => {
            expect(() => validateDueDate("1900-02-29"))
                .toThrow("La date d'échéance n'est pas valide.");
        });

        it("doit accepter le 31 décembre", () => {
            expect(validateDueDate("2026-12-31"))
                .toBe("2026-12-31");
        });

        it("doit refuser le jour zéro", () => {
            expect(() => validateDueDate("2026-12-00"))
                .toThrow("La date d'échéance n'est pas valide.");
        });
    });
});
