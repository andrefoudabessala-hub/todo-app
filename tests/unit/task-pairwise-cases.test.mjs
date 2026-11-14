
import { describe, it, expect } from "vitest";

import pairwiseModule from "../support/task-pairwise-cases.js";

const {
    taskFactors,
    taskPairwiseCases,
    buildTaskInput
} = pairwiseModule;


// ========================================
// TESTS DU JEU DE DONNÉES PAIRWISE
// ========================================

describe("Jeu de données pairwise des tâches", () => {

    it("doit générer automatiquement des cas de test", () => {
        expect(taskPairwiseCases.length).toBeGreaterThan(0);
    });

    it("doit réduire les cas par rapport au produit cartésien", () => {
        const exhaustiveCount = Object.values(taskFactors)
            .reduce((total, values) => total * values.length, 1);

        expect(taskPairwiseCases.length)
            .toBeLessThan(exhaustiveCount);
    });

    it("doit fournir tous les facteurs dans chaque cas", () => {
        for (const testCase of taskPairwiseCases) {
            expect(Object.keys(testCase))
                .toEqual(Object.keys(taskFactors));
        }
    });

    it("doit utiliser uniquement les valeurs déclarées", () => {
        for (const testCase of taskPairwiseCases) {
            for (const factorName of Object.keys(taskFactors)) {
                expect(taskFactors[factorName])
                    .toContain(testCase[factorName]);
            }
        }
    });

    it("doit convertir chaque cas en données utilisables par le service", () => {
        for (const testCase of taskPairwiseCases) {
            const input = buildTaskInput(testCase);

            expect(input).toHaveProperty("title");
            expect(input).toHaveProperty("dueDate");
            expect(input).toHaveProperty("projectId");

            expect(typeof input.title).toBe("string");
            expect(
                input.dueDate === null ||
                typeof input.dueDate === "string"
            ).toBe(true);

            expect(typeof input.projectId).toBe("string");
        }
    });

    it("doit produire des données différentes selon les classes déclarées", () => {
        const emptyTitleCase = taskPairwiseCases.find(
            testCase => testCase.titre === "vide"
        );

        const longTitleCase = taskPairwiseCases.find(
            testCase => testCase.titre === "trop-long"
        );

        expect(emptyTitleCase).toBeDefined();
        expect(longTitleCase).toBeDefined();

        expect(buildTaskInput(emptyTitleCase).title).toBe("");
        expect(buildTaskInput(longTitleCase).title).toHaveLength(101);
    });
});
