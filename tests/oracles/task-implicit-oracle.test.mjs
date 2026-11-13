
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
// ORACLE IMPLICITE
// ========================================

describe("Oracle implicite - Création des tâches", () => {

    it.each(taskPairwiseCases)(
        "doit respecter les propriétés invariantes pour le cas $titre / $date / $projet",
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

            const tasksBefore =
                testCase.projet === "existant"
                    ? await repository.getTasksByProjectId("projet-1")
                    : [];

            expect(tasksBefore).toHaveLength(0);

            let creationSucceeded = false;
            let createdTask = null;

            try {
                createdTask = await service.createTask(input);
                creationSucceeded = true;
            } catch (error) {
                expect(error).toBeInstanceOf(Error);
            }

            const tasksAfter =
                testCase.projet === "existant"
                    ? await repository.getTasksByProjectId("projet-1")
                    : [];

            if (creationSucceeded) {

                // Une création réussie doit produire une seule tâche.
                expect(tasksAfter).toHaveLength(1);

                // Propriétés invariantes de toute nouvelle tâche.
                expect(createdTask.id).toBeTruthy();

                expect(typeof createdTask.id).toBe("string");

                expect(createdTask.completed).toBe(false);

                expect(createdTask.createdAt).toBe(
                    "2026-11-13T10:00:00.000Z"
                );

                expect(
                    Number.isNaN(Date.parse(createdTask.createdAt))
                ).toBe(false);

                expect(createdTask.title).toBe(
                    createdTask.title.trim()
                );

                expect(createdTask.projectId).toBe("projet-1");

                // Le dépôt doit contenir la tâche retournée.
                expect(tasksAfter[0]).toEqual(createdTask);

            } else {

                // Un rejet ne doit provoquer aucun enregistrement.
                expect(tasksAfter).toHaveLength(0);
            }
        }
    );
});
