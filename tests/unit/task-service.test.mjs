
import { describe, it, expect, vi } from "vitest";

import todoServiceModule from "../../src/services/todo-service.js";

const { TodoService } = todoServiceModule;

describe("Service de gestion des tâches", () => {

    function createService(projects = [{ id: "p1", name: "Projet INF563" }]) {
        const repository = {
            getAllProjects: vi.fn().mockResolvedValue(projects),
            addTask: vi.fn(async task => task)
        };

        const service = new TodoService({
            repository,
            clock: () => new Date("2026-11-13T10:00:00Z"),
            idGenerator: () => "t1"
        });

        return { service, repository };
    }

    it("doit créer une tâche dans un projet existant", async () => {
        const { service, repository } = createService();

        const task = await service.createTask({
            title: "Préparer les tests",
            dueDate: "2026-11-20",
            projectId: "p1"
        });

        expect(task).toEqual({
            id: "t1",
            title: "Préparer les tests",
            dueDate: "2026-11-20",
            projectId: "p1",
            completed: false,
            createdAt: "2026-11-13T10:00:00.000Z"
        });

        expect(repository.addTask).toHaveBeenCalledOnce();
    });

    it("doit refuser une tâche associée à un projet inexistant", async () => {
        const { service, repository } = createService([]);

        await expect(
            service.createTask({
                title: "Préparer les tests",
                dueDate: null,
                projectId: "inexistant"
            })
        ).rejects.toThrow(
            "Le projet associé à cette tâche n'existe pas."
        );

        expect(repository.addTask).not.toHaveBeenCalled();
    });

    it("doit refuser une tâche sans identifiant de projet", async () => {
        const { service, repository } = createService();

        await expect(
            service.createTask({
                title: "Préparer les tests",
                dueDate: null
            })
        ).rejects.toThrow(
            "Un projet doit être associé à la tâche."
        );

        expect(repository.getAllProjects).not.toHaveBeenCalled();
        expect(repository.addTask).not.toHaveBeenCalled();
    });

    it("doit refuser un identifiant de projet undefined", async () => {
        const { service, repository } = createService();

        await expect(
            service.createTask({
                title: "Préparer les tests",
                dueDate: null,
                projectId: undefined
            })
        ).rejects.toThrow(
            "Un projet doit être associé à la tâche."
        );

        expect(repository.addTask).not.toHaveBeenCalled();
    });

    it("doit refuser un identifiant de projet null", async () => {
        const { service, repository } = createService();

        await expect(
            service.createTask({
                title: "Préparer les tests",
                dueDate: null,
                projectId: null
            })
        ).rejects.toThrow(
            "Un projet doit être associé à la tâche."
        );

        expect(repository.addTask).not.toHaveBeenCalled();
    });

    it("doit refuser un identifiant de projet vide", async () => {
        const { service, repository } = createService();

        await expect(
            service.createTask({
                title: "Préparer les tests",
                dueDate: null,
                projectId: ""
            })
        ).rejects.toThrow(
            "Un projet doit être associé à la tâche."
        );

        expect(repository.addTask).not.toHaveBeenCalled();
    });

    it("doit refuser une tâche dont le titre est invalide", async () => {
        const { service, repository } = createService();

        await expect(
            service.createTask({
                title: "   ",
                dueDate: null,
                projectId: "p1"
            })
        ).rejects.toThrow();

        expect(repository.addTask).not.toHaveBeenCalled();
    });

    it("doit refuser une date d'échéance invalide", async () => {
        const { service, repository } = createService();

        await expect(
            service.createTask({
                title: "Préparer les tests",
                dueDate: "2026-02-30",
                projectId: "p1"
            })
        ).rejects.toThrow();

        expect(repository.addTask).not.toHaveBeenCalled();
    });
});
