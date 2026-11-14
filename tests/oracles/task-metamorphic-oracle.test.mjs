import { describe, it, expect } from "vitest";

import serviceModule from "../../src/services/todo-service.js";
import repositoryModule from "../../src/repositories/memory-repository.js";

import pairwiseGeneratorModule from "../support/pairwise-generator.js";
import taskCasesModule from "../support/task-pairwise-cases.js";

const { TodoService } = serviceModule;
const { MemoryRepository } = repositoryModule;

const {
    generatePairwiseCases
} = pairwiseGeneratorModule;

const {
    taskFactors,
    buildTaskInput
} = taskCasesModule;

// ========================================
// FACTEURS DES TRANSFORMATIONS
// ========================================

const metamorphicFactors = {
    transformation: [
        "permutation",
        "deplacement",
        "partition"
    ],

    scenario: [
        "creation-valide",
        "creation-invalide"
    ]
};

// ========================================
// GÉNÉRATION DES CAS MÉTAMORPHIQUES
// ========================================

const metamorphicPairwiseCases =
    generatePairwiseCases(metamorphicFactors);

// ========================================
// SERVICE DE TEST
// ========================================

function createService() {
    const repository = new MemoryRepository();

    const projects = [
        {
            id: "projet-1",
            name: "Projet INF563",
            createdAt: "2026-11-13T00:00:00.000Z"
        },
        {
            id: "projet-2",
            name: "Projet secondaire",
            createdAt: "2026-11-13T00:00:00.000Z"
        }
    ];

    const clock = () =>
        new Date("2026-11-13T10:00:00.000Z");

    let identifier = 0;

    const idGenerator = () => {
        identifier++;
        return `task-${identifier}`;
    };

    const service = new TodoService({
        repository,
        clock,
        idGenerator
    });

    return {
        repository,
        service,
        projects
    };
}

// ========================================
// CRÉATION D'UNE TÂCHE VALIDE
// ========================================

async function createValidTask(service, repository) {
    await repository.addProject({
        id: "projet-1",
        name: "Projet INF563",
        createdAt: "2026-11-13T00:00:00.000Z"
    });

    await repository.addProject({
        id: "projet-2",
        name: "Projet secondaire",
        createdAt: "2026-11-13T00:00:00.000Z"
    });

    const validTaskCase =
        generatePairwiseCases(taskFactors)
            .find(testCase =>
                testCase.titre === "valide" &&
                testCase.date !== "invalide" &&
                testCase.projet === "existant"
            );

    if (!validTaskCase) {
        throw new Error(
            "Le générateur pairwise n'a produit aucun cas valide."
        );
    }

    return service.createTask(
        buildTaskInput(validTaskCase)
    );
}

// ========================================
// ORACLE MÉTAMORPHIQUE
// ========================================

describe("Oracle métamorphique", () => {

    it.each(metamorphicPairwiseCases)(
        "doit respecter la relation métamorphique $transformation / $scenario",
        async testCase => {

            // ========================================
            // CAS INVALIDES
            // ========================================

            if (testCase.scenario === "creation-invalide") {

                const {
                    repository,
                    service
                } = createService();

                await repository.addProject({
                    id: "projet-1",
                    name: "Projet INF563",
                    createdAt: "2026-11-13T00:00:00.000Z"
                });

                const invalidCases =
                    generatePairwiseCases(taskFactors)
                        .filter(pairwiseCase => {
                            return !(
                                pairwiseCase.titre === "valide" &&
                                pairwiseCase.date !== "invalide" &&
                                pairwiseCase.projet === "existant"
                            );
                        });

                const invalidCase = invalidCases[0];

                expect(invalidCase).toBeDefined();

                await expect(
                    service.createTask(
                        buildTaskInput(invalidCase)
                    )
                ).rejects.toThrow();

                const tasks =
                    await repository.getTasksByProjectId("projet-1");

                expect(tasks).toHaveLength(0);

                return;
            }

            // ========================================
            // CAS VALIDE
            // ========================================

            const {
                repository,
                service
            } = createService();

            const firstTask =
                await createValidTask(service, repository);

            const secondTask =
                await createValidTask(service, repository);

            // ========================================
            // ÉTAT DE RÉFÉRENCE
            // ========================================

            const referenceStatistics =
                await service.getTaskStatistics("projet-1");

            const referenceTotal =
                referenceStatistics.total;

            expect(referenceTotal).toBe(2);

            // ========================================
            // PERMUTATION
            // ========================================

            if (testCase.transformation === "permutation") {

                const permutationRepository =
                    new MemoryRepository();

                const {
                    service: permutationService
                } = (() => {

                    const repository = permutationRepository;

                    const clock = () =>
                        new Date("2026-11-13T10:00:00.000Z");

                    let identifier = 0;

                    const idGenerator = () => {
                        identifier++;
                        return `task-${identifier}`;
                    };

                    return {
                        service: new TodoService({
                            repository,
                            clock,
                            idGenerator
                        })
                    };
                })();

                await permutationRepository.addProject({
                    id: "projet-1",
                    name: "Projet INF563",
                    createdAt: "2026-11-13T00:00:00.000Z"
                });

                await permutationRepository.addProject({
                    id: "projet-2",
                    name: "Projet secondaire",
                    createdAt: "2026-11-13T00:00:00.000Z"
                });

                const validTaskCase =
                    generatePairwiseCases(taskFactors)
                        .find(pairwiseCase =>
                            pairwiseCase.titre === "valide" &&
                            pairwiseCase.date !== "invalide" &&
                            pairwiseCase.projet === "existant"
                        );

                const taskInput =
                    buildTaskInput(validTaskCase);

                await permutationService.createTask(taskInput);
                await permutationService.createTask(taskInput);

                const permutationStatistics =
                    await permutationService.getTaskStatistics(
                        "projet-1"
                    );

                expect(permutationStatistics.total)
                    .toBe(referenceTotal);

                expect(permutationStatistics.completed)
                    .toBe(referenceStatistics.completed);

                expect(permutationStatistics.remaining)
                    .toBe(referenceStatistics.remaining);

                expect(permutationStatistics.percentage)
                    .toBe(referenceStatistics.percentage);

                return;
            }

            // ========================================
            // DÉPLACEMENT
            // ========================================

            if (testCase.transformation === "deplacement") {

                await service.updateTask(
                    firstTask.id,
                    {
                        projectId: "projet-2"
                    }
                );

                const project1Statistics =
                    await service.getTaskStatistics("projet-1");

                const project2Statistics =
                    await service.getTaskStatistics("projet-2");

                const totalAfterMove =
                    project1Statistics.total +
                    project2Statistics.total;

                expect(totalAfterMove)
                    .toBe(referenceTotal);

                expect(project1Statistics.total)
                    .toBe(1);

                expect(project2Statistics.total)
                    .toBe(1);

                return;
            }

            // ========================================
            // PARTITION
            // ========================================

            if (testCase.transformation === "partition") {

                await service.updateTask(
                    secondTask.id,
                    {
                        projectId: "projet-2"
                    }
                );

                const project1Statistics =
                    await service.getTaskStatistics("projet-1");

                const project2Statistics =
                    await service.getTaskStatistics("projet-2");

                const partitionedTotal =
                    project1Statistics.total +
                    project2Statistics.total;

                expect(partitionedTotal)
                    .toBe(referenceTotal);

                expect(project1Statistics.total)
                    .toBe(1);

                expect(project2Statistics.total)
                    .toBe(1);

                return;
            }

            throw new Error(
                `Transformation inconnue : ${testCase.transformation}`
            );
        }
    );
});