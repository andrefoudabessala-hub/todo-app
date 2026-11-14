
import { describe, it, expect, vi } from "vitest";
import todoServiceModule from "../../src/services/todo-service.js";

const { TodoService } = todoServiceModule;

describe("Service de gestion des projets", () => {

    function createService(projects = []) {
        const repository = {
            getAllProjects: vi.fn().mockResolvedValue(projects),
            addProject: vi.fn(async project => project)
        };

        const service = new TodoService({
            repository,
            clock: () => new Date("2026-11-13T10:00:00Z"),
            idGenerator: () => "p2"
        });

        return { service, repository };
    }

    it("doit refuser un projet dont le nom existe déjà sans tenir compte de la casse", async () => {
        const { service, repository } = createService([
            { id: "p1", name: "Projet INF563" }
        ]);

        await expect(
            service.createProject("projet inf563")
        ).rejects.toThrow("Un projet portant ce nom existe déjà.");

        expect(repository.addProject).not.toHaveBeenCalled();
    });

    it("doit refuser un nom existant même si le nom enregistré contient des espaces autour", async () => {
        const { service, repository } = createService([
            { id: "p1", name: "  Projet INF563  " }
        ]);

        await expect(
            service.createProject("projet inf563")
        ).rejects.toThrow("Un projet portant ce nom existe déjà.");

        expect(repository.addProject).not.toHaveBeenCalled();
    });

    it("doit accepter un nom qui n'existe pas encore", async () => {
        const { service, repository } = createService([]);

        const project = await service.createProject("Projet INF563");

        expect(project.name).toBe("Projet INF563");
        expect(project.id).toBe("p2");
        expect(repository.addProject).toHaveBeenCalledOnce();
    });

    it("doit accepter un nom différent de ceux déjà enregistrés", async () => {
        const { service, repository } = createService([
            { id: "p1", name: "Projet Java" }
        ]);

        const project = await service.createProject("Projet INF563");

        expect(project.name).toBe("Projet INF563");
        expect(repository.addProject).toHaveBeenCalledOnce();
    });

    it("doit supprimer les espaces autour du nom avant son enregistrement", async () => {
        const { service, repository } = createService([]);

        const project = await service.createProject("  Projet INF563  ");

        expect(project.name).toBe("Projet INF563");
        expect(repository.addProject).toHaveBeenCalledOnce();
    });

    it("doit récupérer les projets existants avant de créer un projet", async () => {
        const { service, repository } = createService([]);

        await service.createProject("Projet INF563");

        expect(repository.getAllProjects).toHaveBeenCalledOnce();
    });
});
