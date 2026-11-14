
import {
    describe,
    it,
    expect,
    beforeEach
} from "vitest";

import { TodoService } from "../../src/services/todo-service.js";
import { MemoryRepository } from "../../src/repositories/memory-repository.js";

describe("Gestion de l'achèvement des tâches", () => {
    let repository;
    let service;
    let project;
    let task;

    beforeEach(async () => {
        repository = new MemoryRepository();

        let nextId = 1;

        service = new TodoService({
            repository,
            clock: () => new Date("2026-11-13T10:00:00.000Z"),
            idGenerator: () => `id-${nextId++}`
        });

        project = await service.createProject("Projet de test");

        task = await service.createTask({
            title: "Préparer les tests",
            dueDate: null,
            projectId: project.id
        });
    });

    it("doit marquer une tâche comme terminée", async () => {
        await service.setTaskCompleted(task.id, true);

        const tasks = await repository.getTasksByProjectId(project.id);

        expect(tasks[0].completed).toBe(true);
    });

    it("doit permettre de remettre une tâche terminée à faire", async () => {
        await service.setTaskCompleted(task.id, true);
        await service.setTaskCompleted(task.id, false);

        const tasks = await repository.getTasksByProjectId(project.id);

        expect(tasks[0].completed).toBe(false);
    });

    it("doit refuser une valeur d'achèvement qui n'est pas booléenne", async () => {
        await expect(
            service.setTaskCompleted(task.id, "oui")
        ).rejects.toThrow(
            "L'état d'achèvement doit être booléen."
        );

        const tasks = await repository.getTasksByProjectId(project.id);

        expect(tasks[0].completed).toBe(false);
    });

    it("doit refuser une valeur null pour l'achèvement", async () => {
        await expect(
            service.setTaskCompleted(task.id, null)
        ).rejects.toThrow(
            "L'état d'achèvement doit être booléen."
        );
    });

    it("doit refuser une valeur numérique pour l'achèvement", async () => {
        await expect(
            service.setTaskCompleted(task.id, 1)
        ).rejects.toThrow(
            "L'état d'achèvement doit être booléen."
        );
    });

    it("doit refuser l'achèvement d'une tâche inexistante", async () => {
        await expect(
            service.setTaskCompleted("inexistante", true)
        ).rejects.toThrow("La tâche à modifier n'existe pas.");
    });
});
