
import {
    describe,
    it,
    expect
} from "vitest";

import {
    calculateTaskStatistics
} from "../../src/domain/task-statistics.js";

describe("Calcul des statistiques des tâches", () => {

    it("doit retourner des statistiques à zéro sans tâche", () => {
        const result = calculateTaskStatistics([]);

        expect(result).toEqual({
            total: 0,
            completed: 0,
            remaining: 0,
            percentage: 0
        });
    });

    it("doit compter toutes les tâches comme étant à faire", () => {
        const tasks = [
            { id: "t1", completed: false },
            { id: "t2", completed: false },
            { id: "t3", completed: false }
        ];

        const result = calculateTaskStatistics(tasks);

        expect(result).toEqual({
            total: 3,
            completed: 0,
            remaining: 3,
            percentage: 0
        });
    });

    it("doit compter les tâches terminées", () => {
        const tasks = [
            { id: "t1", completed: true },
            { id: "t2", completed: true },
            { id: "t3", completed: true }
        ];

        const result = calculateTaskStatistics(tasks);

        expect(result).toEqual({
            total: 3,
            completed: 3,
            remaining: 0,
            percentage: 100
        });
    });

    it("doit calculer correctement une progression partielle", () => {
        const tasks = [
            { id: "t1", completed: true },
            { id: "t2", completed: false },
            { id: "t3", completed: true },
            { id: "t4", completed: false },
            { id: "t5", completed: false }
        ];

        const result = calculateTaskStatistics(tasks);

        expect(result).toEqual({
            total: 5,
            completed: 2,
            remaining: 3,
            percentage: 40
        });
    });

    it("doit arrondir le pourcentage à l'entier le plus proche", () => {
        const tasks = [
            { id: "t1", completed: true },
            { id: "t2", completed: false },
            { id: "t3", completed: false }
        ];

        const result = calculateTaskStatistics(tasks);

        expect(result.percentage).toBe(33);
    });
});
