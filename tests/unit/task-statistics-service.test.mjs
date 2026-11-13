
import {
    describe,
    it,
    expect,
    beforeEach
} from "vitest";

import { TodoService } from "../../src/services/todo-service.js";
import { MemoryRepository } from "../../src/repositories/memory-repository.js";

describe("Statistiques des tâches dans le service", () => {
    let repository;
    let service;
    let project;
    let otherProject;

    beforeEach(async () => {
        repository = new MemoryRepository();

        let nextId = 1;

        service = new TodoService({
            repository,
            clock: () => new Date("2026-11-13T10:00:00.000Z"),
            idGenerator: () => `id-${nextId++}`
        });

        project = await service.createProject("Projet principal");
        otherProject = await service.createProject("Autre projet");
    });

    it("doit retourner les statistiques d'un projet", async () => {
        const task1 = await service.createTask({
            title: "Première tâche",
            projectId: project.id
        });

        await service.createTask({
            title: "Deuxième tâche",
            projectId: project.id
        });

        await service.setTaskCompleted(task1.id, true);

        const result = await service.getTaskStatistics(project.id);

        expect(result).toEqual({
            total: 2,
            completed: 1,
            remaining: 1,
            percentage: 50
        });
    });

    it("doit retourner des statistiques à zéro pour un projet vide", async () => {
        const result = await service.getTaskStatistics(project.id);

        expect(result).toEqual({
            total: 0,
            completed: 0,
            remaining: 0,
            percentage: 0
        });
    });

    it("ne doit compter que les tâches du projet demandé", async () => {
        await service.createTask({
            title: "Tâche du projet principal",
            projectId: project.id
        });

        await service.createTask({
            title: "Tâche de l'autre projet",
            projectId: otherProject.id
        });

        const result = await service.getTaskStatistics(project.id);

        expect(result.total).toBe(1);
        expect(result.remaining).toBe(1);
    });

    it("doit refuser un identifiant de projet inexistant", async () => {
        await expect(
            service.getTaskStatistics("projet-inexistant")
        ).rejects.toThrow(
            "Le projet demandé n'existe pas."
        );
    });
});
