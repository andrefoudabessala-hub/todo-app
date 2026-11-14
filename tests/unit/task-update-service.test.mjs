
import { describe, it, expect, vi } from "vitest";

import todoServiceModule from "../../src/services/todo-service.js";

const { TodoService } = todoServiceModule;

describe("Modification des tâches dans le service", () => {

    function createTestEnvironment() {
        const task = {
            id: "t1",
            title: "Ancien titre",
            dueDate: "2026-11-20",
            projectId: "p2",
            completed: false,
            createdAt: "2026-11-13T10:00:00.000Z"
        };

        const repository = {
            getAllProjects: vi.fn().mockResolvedValue([
                { id: "p1", name: "Projet INF563" },
                { id: "p2", name: "Projet Java" }
            ]),

            getTasksByProjectId: vi.fn(async projectId => {
                return projectId === "p2" ? [task] : [];
            }),

            updateTask: vi.fn(async updatedTask => updatedTask)
        };

        const service = new TodoService({
            repository,
            clock: () => new Date("2026-11-13T12:00:00Z"),
            idGenerator: () => "nouvel-id"
        });

        return { service, repository, task };
    }

    it("doit modifier le titre d'une tâche", async () => {
        const { service, repository } = createTestEnvironment();

        const updatedTask = await service.updateTask("t1", {
            title: "Nouveau titre"
        });

        expect(updatedTask.title).toBe("Nouveau titre");
        expect(updatedTask.id).toBe("t1");
        expect(repository.updateTask).toHaveBeenCalledOnce();
    });

    it("doit modifier la date d'échéance", async () => {
        const { service } = createTestEnvironment();

        const updatedTask = await service.updateTask("t1", {
            dueDate: "2026-11-25"
        });

        expect(updatedTask.dueDate).toBe("2026-11-25");
    });

    it("doit déplacer une tâche vers un autre projet", async () => {
        const { service } = createTestEnvironment();

        const updatedTask = await service.updateTask("t1", {
            projectId: "p1"
        });

        expect(updatedTask.projectId).toBe("p1");
    });

    it("doit conserver les propriétés non modifiées", async () => {
        const { service } = createTestEnvironment();

        const updatedTask = await service.updateTask("t1", {
            title: "Nouveau titre"
        });

        expect(updatedTask.id).toBe("t1");
        expect(updatedTask.createdAt).toBe("2026-11-13T10:00:00.000Z");
        expect(updatedTask.completed).toBe(false);
        expect(updatedTask.dueDate).toBe("2026-11-20");
        expect(updatedTask.projectId).toBe("p2");
    });

    it("doit rechercher une tâche dans les projets jusqu'à la trouver", async () => {
        const { service, repository } = createTestEnvironment();

        await service.updateTask("t1", {
            title: "Nouveau titre"
        });

        expect(repository.getTasksByProjectId).toHaveBeenCalledTimes(2);
        expect(repository.getTasksByProjectId).toHaveBeenNthCalledWith(1, "p1");
        expect(repository.getTasksByProjectId).toHaveBeenNthCalledWith(2, "p2");
    });

    it("doit refuser un objet de modifications null", async () => {
        const { service, repository } = createTestEnvironment();

        await expect(service.updateTask("t1", null))
            .rejects.toThrow("Les modifications fournies sont invalides.");

        expect(repository.updateTask).not.toHaveBeenCalled();
    });

    it("doit refuser un objet de modifications undefined", async () => {
        const { service, repository } = createTestEnvironment();

        await expect(service.updateTask("t1", undefined))
            .rejects.toThrow("Les modifications fournies sont invalides.");

        expect(repository.updateTask).not.toHaveBeenCalled();
    });

    it("doit refuser un tableau de modifications", async () => {
        const { service, repository } = createTestEnvironment();

        await expect(service.updateTask("t1", []))
            .rejects.toThrow("Les modifications fournies sont invalides.");

        expect(repository.updateTask).not.toHaveBeenCalled();
    });

    it("doit refuser une chaîne de modifications", async () => {
        const { service, repository } = createTestEnvironment();

        await expect(service.updateTask("t1", "titre"))
            .rejects.toThrow("Les modifications fournies sont invalides.");

        expect(repository.updateTask).not.toHaveBeenCalled();
    });

    it("doit accepter un objet de modifications vide", async () => {
        const { service, repository, task } = createTestEnvironment();

        const updatedTask = await service.updateTask("t1", {});

        expect(updatedTask).toEqual(task);
        expect(repository.updateTask).toHaveBeenCalledOnce();
    });

    it("doit refuser un titre invalide", async () => {
        const { service, repository } = createTestEnvironment();

        await expect(
            service.updateTask("t1", { title: "   " })
        ).rejects.toThrow("Le titre de la tâche est obligatoire.");

        expect(repository.updateTask).not.toHaveBeenCalled();
    });

    it("doit refuser une date invalide", async () => {
        const { service, repository } = createTestEnvironment();

        await expect(
            service.updateTask("t1", { dueDate: "2026-02-30" })
        ).rejects.toThrow("La date d'échéance n'est pas valide.");

        expect(repository.updateTask).not.toHaveBeenCalled();
    });

    it("doit refuser un projet inexistant", async () => {
        const { service, repository } = createTestEnvironment();

        await expect(
            service.updateTask("t1", { projectId: "inexistant" })
        ).rejects.toThrow(
            "Le nouveau projet associé à cette tâche n'existe pas."
        );

        expect(repository.updateTask).not.toHaveBeenCalled();
    });

    it("doit refuser la modification d'une tâche inexistante après avoir parcouru tous les projets", async () => {
        const { service, repository } = createTestEnvironment();

        repository.getTasksByProjectId.mockResolvedValue([]);

        await expect(
            service.updateTask("inexistant", {
                title: "Nouveau titre"
            })
        ).rejects.toThrow("La tâche à modifier n'existe pas.");

        expect(repository.getTasksByProjectId).toHaveBeenCalledTimes(2);
        expect(repository.updateTask).not.toHaveBeenCalled();
    });
});
