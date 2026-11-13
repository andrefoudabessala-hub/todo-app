
import { describe, it, expect, vi } from "vitest";
import todoServiceModule from "../../src/services/todo-service.js";

const { TodoService } = todoServiceModule;

describe("Service de gestion des projets", () => {
    it("doit refuser un projet dont le nom existe déjà sans tenir compte de la casse", async () => {
        const repository = {
            getAllProjects: vi.fn().mockResolvedValue([
                { id: "p1", name: "Projet INF563" }
            ]),
            addProject: vi.fn()
        };

        const service = new TodoService({
            repository,
            clock: () => new Date("2026-11-13T10:00:00Z"),
            idGenerator: () => "p2"
        });

        await expect(
            service.createProject("projet inf563")
        ).rejects.toThrow();

        expect(repository.addProject).not.toHaveBeenCalled();
    });

    it("doit accepter un nom qui n'existe pas encore", async () => {
        const repository = {
            getAllProjects: vi.fn().mockResolvedValue([]),
            addProject: vi.fn(async (project) => project)
        };

        const service = new TodoService({
            repository,
            clock: () => new Date("2026-11-13T10:00:00Z"),
            idGenerator: () => "p1"
        });

        const project = await service.createProject("Projet INF563");

        expect(project.name).toBe("Projet INF563");
        expect(project.id).toBe("p1");
        expect(repository.addProject).toHaveBeenCalledOnce();
    });
});
