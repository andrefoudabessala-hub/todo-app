
import { describe, it, expect } from "vitest";

import serviceModule from "../../src/services/todo-service.js";
import repositoryModule from "../../src/repositories/memory-repository.js";

import pairwiseModule from "../support/task-pairwise-cases.js";

const { TodoService } = serviceModule;
const { MemoryRepository } = repositoryModule;

const {
    taskPairwiseCases,
    buildTaskInput
} = pairwiseModule;


// ========================================
// ORACLE DE RÉFÉRENCE
// ========================================

describe("Oracle de référence - Création des tâches", () => {

    it.each(taskPairwiseCases)(
        "doit respecter les règles métier pour le cas $titre / $date / $projet",
        async testCase => {

            const repository = new MemoryRepository();

            // Identifiant identique à celui utilisé
            // dans task-pairwise-cases.js.
            if (testCase.projet === "existant") {
                await repository.addProject({
                    id: "projet-1",
                    name: "Projet INF563",
                    createdAt: "2026-11-13T00:00:00.000Z"
                });
            }

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

            // Données provenant du générateur pairwise.
            const input = buildTaskInput(testCase);

            // Définition indépendante du résultat attendu.
            const expectedSuccess =
                testCase.titre === "valide" &&
                ["absente", "valide"].includes(testCase.date) &&
                testCase.projet === "existant";

            if (expectedSuccess) {

                const createdTask = await service.createTask(input);

                expect(createdTask).toMatchObject({
                    id: "task-1",
                    title: input.title,
                    dueDate: input.dueDate,
                    projectId: input.projectId,
                    completed: false
                });

                const savedTasks =
                    await repository.getTasksByProjectId(input.projectId);

                expect(savedTasks).toHaveLength(1);

                expect(savedTasks[0]).toMatchObject({
                    title: input.title,
                    dueDate: input.dueDate,
                    projectId: input.projectId
                });

            } else {

                await expect(
                    service.createTask(input)
                ).rejects.toThrow();

                if (testCase.projet === "existant") {
                    const savedTasks =
                        await repository.getTasksByProjectId("projet-1");

                    expect(savedTasks).toHaveLength(0);
                }
            }
        }
    );
});
