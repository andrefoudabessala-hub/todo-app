
const {
    generatePairwiseCases
} = require("./pairwise-generator");

// ========================================
// FACTEURS DU SCÉNARIO DE CRÉATION
// ========================================

const taskFactors = {
    titre: [
        "valide",
        "vide",
        "trop-long"
    ],

    date: [
        "absente",
        "valide",
        "invalide"
    ],

    projet: [
        "existant",
        "inexistant"
    ]
};

// ========================================
// GÉNÉRATION AUTOMATIQUE DES CAS
// ========================================

const taskPairwiseCases = generatePairwiseCases(taskFactors);

// ========================================
// CONVERSION DES CLASSES EN DONNÉES
// ========================================

function buildTaskInput(testCase) {
    const titles = {
        valide: "Préparer le rapport INF563",
        vide: "",
        "trop-long": "A".repeat(101)
    };

    const dates = {
        absente: null,
        valide: "2026-11-20",
        invalide: "2026-02-30"
    };

    const projects = {
        existant: "projet-1",
        inexistant: "projet-inexistant"
    };

    return {
        title: titles[testCase.titre],
        dueDate: dates[testCase.date],
        projectId: projects[testCase.projet]
    };
}

module.exports = {
    taskFactors,
    taskPairwiseCases,
    buildTaskInput
};
