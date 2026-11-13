
import { describe, it, expect, vi } from "vitest";

import todoServiceModule from "../../src/services/todo-service.js";

const { TodoService } = todoServiceModule;

describe("Service de gestion des tâches", () => {

    it("doit créer une tâche dans un projet existant", async () => {
        const repository = {
            getAllProjects: vi.fn().mockResolvedValue([
                { id: "p1", name: "Projet INF563" }
            ]),
            addTask: vi.fn(async task => task)
        };

        const service = new TodoService({
            repository,
            clock: () => new Date("2026-11-13T10:00:00Z"),
            idGenerator: () => "t1"
        });

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
        const repository = {
            getAllProjects: vi.fn().mockResolvedValue([]),
            addTask: vi.fn()
        };

        const service = new TodoService({
            repository,
            clock: () => new Date("2026-11-13T10:00:00Z"),
            idGenerator: () => "t1"
        });

        await expect(
            service.createTask({
                title: "Préparer les tests",
                dueDate: null,
                projectId: "inexistant"
            })
        ).rejects.toThrow();

        expect(repository.addTask).not.toHaveBeenCalled();
    });

    it("doit refuser une tâche dont le titre est invalide", async () => {
        const repository = {
            getAllProjects: vi.fn().mockResolvedValue([
                { id: "p1", name: "Projet INF563" }
            ]),
            addTask: vi.fn()
        };

        const service = new TodoService({
            repository,
            clock: () => new Date("2026-11-13T10:00:00Z"),
            idGenerator: () => "t1"
        });

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
        const repository = {
            getAllProjects: vi.fn().mockResolvedValue([
                { id: "p1", name: "Projet INF563" }
            ]),
            addTask: vi.fn()
        };

        const service = new TodoService({
            repository,
            clock: () => new Date("2026-11-13T10:00:00Z"),
            idGenerator: () => "t1"
        });

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
