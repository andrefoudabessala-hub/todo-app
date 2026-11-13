
// ========================================
// GÉNÉRATEUR PAIRWISE DÉTERMINISTE
// ========================================

function validateFactors(factors) {
    if (
        factors === null ||
        typeof factors !== "object" ||
        Array.isArray(factors)
    ) {
        throw new Error("Les facteurs doivent être un objet.");
    }

    const entries = Object.entries(factors);

    if (entries.length < 2) {
        throw new Error(
            "Le générateur pairwise nécessite au moins deux facteurs."
        );
    }

    for (const [name, values] of entries) {
        if (name.trim() === "") {
            throw new Error("Le nom d'un facteur ne peut pas être vide.");
        }

        if (!Array.isArray(values) || values.length === 0) {
            throw new Error(
                `Le facteur "${name}" doit contenir au moins une valeur.`
            );
        }

        const uniqueValues = new Set();

        for (const value of values) {
            const isSupported =
                value === null ||
                typeof value === "string" ||
                typeof value === "boolean" ||
                (typeof value === "number" && Number.isFinite(value));

            if (!isSupported) {
                throw new Error(
                    `Le facteur "${name}" contient une valeur non prise en charge.`
                );
            }

            if (uniqueValues.has(value)) {
                throw new Error(
                    `Le facteur "${name}" contient des valeurs en double.`
                );
            }

            uniqueValues.add(value);
        }
    }

    return entries;
}

function pairKey(firstFactor, firstValue, secondFactor, secondValue) {
    return `${firstFactor}:${firstValue}|${secondFactor}:${secondValue}`;
}

function markCoveredPairs(row, lastFactorIndex, coveredPairs) {
    for (let first = 0; first <= lastFactorIndex; first++) {
        for (let second = first + 1; second <= lastFactorIndex; second++) {
            coveredPairs.add(
                pairKey(first, row[first], second, row[second])
            );
        }
    }
}

function generatePairwiseCases(factors) {
    const entries = validateFactors(factors);

    const factorNames = entries.map(([name]) => name);
    const domains = entries.map(([, values]) => values);

    // Initialisation : toutes les combinaisons des deux premiers facteurs.
    let rows = [];

    for (let first = 0; first < domains[0].length; first++) {
        for (let second = 0; second < domains[1].length; second++) {
            rows.push([first, second]);
        }
    }

    // Ajout progressif de chaque facteur supplémentaire.
    for (let currentFactor = 2; currentFactor < domains.length; currentFactor++) {
        const coveredPairs = new Set();

        for (const row of rows) {
            markCoveredPairs(row, currentFactor - 1, coveredPairs);
        }

        // Extension verticale : choisir la valeur qui couvre
        // le plus de nouvelles paires avec les facteurs précédents.
        for (const row of rows) {
            let bestValue = 0;
            let bestScore = -1;

            for (
                let candidate = 0;
                candidate < domains[currentFactor].length;
                candidate++
            ) {
                let score = 0;

                for (let previous = 0; previous < currentFactor; previous++) {
                    const key = pairKey(
                        previous,
                        row[previous],
                        currentFactor,
                        candidate
                    );

                    if (!coveredPairs.has(key)) {
                        score++;
                    }
                }

                if (score > bestScore) {
                    bestScore = score;
                    bestValue = candidate;
                }
            }

            row.push(bestValue);

            for (let previous = 0; previous < currentFactor; previous++) {
                coveredPairs.add(
                    pairKey(
                        previous,
                        row[previous],
                        currentFactor,
                        bestValue
                    )
                );
            }
        }

        // Extension horizontale : ajouter les lignes nécessaires
        // pour couvrir toutes les paires qui restent absentes.
        for (let previous = 0; previous < currentFactor; previous++) {
            for (
                let previousValue = 0;
                previousValue < domains[previous].length;
                previousValue++
            ) {
                for (
                    let currentValue = 0;
                    currentValue < domains[currentFactor].length;
                    currentValue++
                ) {
                    const key = pairKey(
                        previous,
                        previousValue,
                        currentFactor,
                        currentValue
                    );

                    if (coveredPairs.has(key)) {
                        continue;
                    }

                    const newRow = Array(currentFactor + 1).fill(0);

                    newRow[previous] = previousValue;
                    newRow[currentFactor] = currentValue;

                    rows.push(newRow);

                    markCoveredPairs(
                        newRow,
                        currentFactor,
                        coveredPairs
                    );
                }
            }
        }
    }

    // Conversion des indices en cas de test lisibles.
    return rows.map(row => {
        const testCase = {};

        for (let index = 0; index < factorNames.length; index++) {
            testCase[factorNames[index]] = domains[index][row[index]];
        }

        return testCase;
    });
}

module.exports = {
    generatePairwiseCases
};
