
import { describe, it, expect } from "vitest";

import pairwiseModule from "../support/pairwise-generator.js";

const {
    generatePairwiseCases
} = pairwiseModule;


// ========================================
// OUTIL DE VÉRIFICATION DE LA COUVERTURE
// ========================================

function expectCompletePairwiseCoverage(factors, cases) {
    const factorNames = Object.keys(factors);

    for (let first = 0; first < factorNames.length; first++) {
        for (
            let second = first + 1;
            second < factorNames.length;
            second++
        ) {
            const firstFactor = factorNames[first];
            const secondFactor = factorNames[second];

            for (const firstValue of factors[firstFactor]) {
                for (const secondValue of factors[secondFactor]) {
                    const pairExists = cases.some(testCase =>
                        testCase[firstFactor] === firstValue &&
                        testCase[secondFactor] === secondValue
                    );

                    expect(
                        pairExists,
                        `Paire absente : ${firstFactor}=${firstValue}, ` +
                        `${secondFactor}=${secondValue}`
                    ).toBe(true);
                }
            }
        }
    }
}


// ========================================
// VALIDATION DES PARAMÈTRES
// ========================================

describe("Validation des paramètres du générateur", () => {

    it("doit refuser une définition absente", () => {
        expect(() => generatePairwiseCases(null)).toThrow();
    });

    it("doit refuser un tableau à la place des facteurs", () => {
        expect(() => generatePairwiseCases([])).toThrow();
    });

    it("doit refuser un objet vide", () => {
        expect(() => generatePairwiseCases({})).toThrow();
    });

    it("doit refuser un seul facteur", () => {
        expect(() => generatePairwiseCases({
            titre: ["valide", "invalide"]
        })).toThrow();
    });

    it("doit refuser un facteur sans valeurs", () => {
        expect(() => generatePairwiseCases({
            titre: [],
            date: ["valide", "invalide"]
        })).toThrow();
    });

    it("doit refuser un facteur qui n'est pas un tableau", () => {
        expect(() => generatePairwiseCases({
            titre: "valide",
            date: ["valide", "invalide"]
        })).toThrow();
    });

    it("doit refuser les valeurs dupliquées dans un facteur", () => {
        expect(() => generatePairwiseCases({
            titre: ["valide", "valide"],
            date: ["absente", "présente"]
        })).toThrow();
    });

    it("doit refuser les valeurs non prises en charge", () => {
        expect(() => generatePairwiseCases({
            titre: ["valide", {}],
            date: ["absente", "présente"]
        })).toThrow();
    });
});


// ========================================
// GÉNÉRATION DES CAS DE TEST
// ========================================

describe("Génération des cas de test", () => {

    const factors = {
        titre: ["valide", "invalide"],
        date: ["absente", "valide"],
        projet: ["existant", "inexistant"],
        achevement: [false, true]
    };

    it("doit produire des cas de test", () => {
        const cases = generatePairwiseCases(factors);

        expect(cases.length).toBeGreaterThan(0);
    });

    it("doit produire des résultats déterministes", () => {
        const firstGeneration = generatePairwiseCases(factors);
        const secondGeneration = generatePairwiseCases(factors);

        expect(firstGeneration).toEqual(secondGeneration);
    });

    it("doit produire des cas contenant tous les facteurs", () => {
        const cases = generatePairwiseCases(factors);

        for (const testCase of cases) {
            expect(Object.keys(testCase)).toEqual(Object.keys(factors));
        }
    });

    it("doit utiliser uniquement les valeurs déclarées", () => {
        const cases = generatePairwiseCases(factors);

        for (const testCase of cases) {
            for (const factorName of Object.keys(factors)) {
                expect(factors[factorName]).toContain(
                    testCase[factorName]
                );
            }
        }
    });

    it("doit couvrir toutes les paires de valeurs possibles", () => {
        const cases = generatePairwiseCases(factors);

        expectCompletePairwiseCoverage(factors, cases);
    });

    it("doit réduire le nombre de cas par rapport au produit cartésien", () => {
        const smallFactors = {
            titre: ["valide", "invalide"],
            date: ["absente", "présente"],
            projet: ["existant", "inexistant"]
        };

        const cases = generatePairwiseCases(smallFactors);

        const exhaustiveCount = Object.values(smallFactors)
            .reduce((total, values) => total * values.length, 1);

        expect(cases.length).toBeLessThan(exhaustiveCount);
    });

    it("doit couvrir les paires avec des facteurs de tailles différentes", () => {
        const mixedFactors = {
            titre: ["valide", "invalide", "limite"],
            date: ["absente", "présente"],
            projet: ["existant", "inexistant", "supprimé", "invalide"],
            achevement: [false, true, null]
        };

        const cases = generatePairwiseCases(mixedFactors);

        expectCompletePairwiseCoverage(mixedFactors, cases);
    });
});
