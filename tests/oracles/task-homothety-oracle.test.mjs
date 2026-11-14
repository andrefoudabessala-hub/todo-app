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
// ORACLE D'HOMOTHÉTIE
// ========================================

describe("Oracle d'homothétie - Déplacement des tâches", () => {

    it.each(taskPairwiseCases)(
        "doit conserver le total lors du déplacement pour le cas $titre / $date / $projet",
        async testCase => {

            const repository = new MemoryRepository();

            // --------------------------------
            // PRÉPARATION DES PROJETS
            // --------------------------------

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

            // --------------------------------
            // LES CAS INVALIDES RESTENT REJETÉS
            // --------------------------------

            const creationShouldSucceed =
                testCase.titre === "valide" &&
                testCase.date !== "invalide" &&
                testCase.projet === "existant";

            if (!creationShouldSucceed) {
                await expect(
                    service.createTask(input)
                ).rejects.toThrow();

                return;
            }

            // --------------------------------
            // CRÉATION DE LA TÂCHE
            // --------------------------------

            const task = await service.createTask(input);

            expect(task.projectId).toBe("projet-1");

            // --------------------------------
            // ÉTAT INITIAL
            // --------------------------------

            const statisticsBeforeProject1 =
                await service.getTaskStatistics("projet-1");

            const statisticsBeforeProject2 =
                await service.getTaskStatistics("projet-2");

            const totalBefore =
                statisticsBeforeProject1.total +
                statisticsBeforeProject2.total;

            expect(totalBefore).toBe(1);

            expect(statisticsBeforeProject1.total).toBe(1);
            expect(statisticsBeforeProject2.total).toBe(0);

            // --------------------------------
            // DÉPLACEMENT
            // --------------------------------

            const movedTask = await service.updateTask(
                task.id,
                {
                    projectId: "projet-2"
                }
            );

            expect(movedTask.projectId).toBe("projet-2");

            // --------------------------------
            // NOUVEL ÉTAT
            // --------------------------------

            const statisticsAfterProject1 =
                await service.getTaskStatistics("projet-1");

            const statisticsAfterProject2 =
                await service.getTaskStatistics("projet-2");

            const totalAfter =
                statisticsAfterProject1.total +
                statisticsAfterProject2.total;

            // --------------------------------
            // PROPRIÉTÉ D'HOMOTHÉTIE
            // --------------------------------

            // Le nombre total de tâches reste invariant.
            expect(totalAfter).toBe(totalBefore);

            // La tâche quitte complètement le projet initial.
            expect(statisticsAfterProject1.total).toBe(0);

            // La même tâche apparaît dans le nouveau projet.
            expect(statisticsAfterProject2.total).toBe(1);

            // La transformation ne doit pas modifier
            // l'identité de la tâche.
            expect(movedTask.id).toBe(task.id);

            // Les autres propriétés restent inchangées.
            expect(movedTask.title).toBe(task.title);
            expect(movedTask.dueDate).toBe(task.dueDate);
            expect(movedTask.completed).toBe(task.completed);
            expect(movedTask.createdAt).toBe(task.createdAt);

            // --------------------------------
            // VÉRIFICATION DIRECTE DU DÉPÔT
            // --------------------------------

            const oldProjectTasks =
                await repository.getTasksByProjectId("projet-1");

            const newProjectTasks =
                await repository.getTasksByProjectId("projet-2");

            expect(oldProjectTasks).toHaveLength(0);
            expect(newProjectTasks).toHaveLength(1);

            expect(newProjectTasks[0]).toEqual(movedTask);
        }
    );
});