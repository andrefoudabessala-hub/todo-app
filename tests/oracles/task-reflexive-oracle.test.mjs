
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
// ORACLE RÉFLEXIF
// ========================================

describe("Oracle réflexif - Gestion de l'achèvement", () => {

    it.each(taskPairwiseCases)(
        "doit préserver le comportement attendu pour le cas $titre / $date / $projet",
        async testCase => {

            const repository = new MemoryRepository();

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

            const input = buildTaskInput(testCase);

            const creationShouldSucceed =
                testCase.titre === "valide" &&
                testCase.date !== "invalide" &&
                testCase.projet === "existant";

            // --------------------------------
            // VÉRIFICATION DE LA CRÉATION
            // --------------------------------

            if (!creationShouldSucceed) {
                await expect(
                    service.createTask(input)
                ).rejects.toThrow();

                const tasks =
                    testCase.projet === "existant"
                        ? await repository.getTasksByProjectId("projet-1")
                        : [];

                expect(tasks).toHaveLength(0);

                return;
            }

            const initialTask = await service.createTask(input);

            expect(initialTask.completed).toBe(false);

            // --------------------------------
            // PREMIER ACHÈVEMENT
            // --------------------------------

            const completedTask =
                await service.setTaskCompleted(initialTask.id, true);

            expect(completedTask.completed).toBe(true);

            // --------------------------------
            // RÉPÉTITION DE L'ACHÈVEMENT
            // --------------------------------

            const repeatedCompletedTask =
                await service.setTaskCompleted(initialTask.id, true);

            expect(repeatedCompletedTask.completed).toBe(true);

            // Une répétition ne doit pas créer de doublon.
            let tasks =
                await repository.getTasksByProjectId("projet-1");

            expect(tasks).toHaveLength(1);

            // --------------------------------
            // RETOUR À L'ÉTAT INITIAL
            // --------------------------------

            const restoredTask =
                await service.setTaskCompleted(initialTask.id, false);

            expect(restoredTask.completed).toBe(false);

            // Les autres propriétés doivent être conservées.
            expect(restoredTask).toEqual({
                ...initialTask,
                completed: false
            });

            // --------------------------------
            // RÉPÉTITION DU RETOUR À L'ÉTAT INITIAL
            // --------------------------------

            const repeatedRestoredTask =
                await service.setTaskCompleted(initialTask.id, false);

            expect(repeatedRestoredTask).toEqual(restoredTask);

            tasks =
                await repository.getTasksByProjectId("projet-1");

            expect(tasks).toHaveLength(1);
            expect(tasks[0]).toEqual(initialTask);
        }
    );
});
