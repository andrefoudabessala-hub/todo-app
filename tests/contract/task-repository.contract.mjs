
import {
    describe,
    it,
    expect,
    afterEach
} from "vitest";

export function defineTaskRepositoryContract(
    repositoryName,
    createRepository
) {
    let activeRepository;

    function newRepository() {
        activeRepository = createRepository();
        return activeRepository;
    }

    afterEach(async () => {
        if (activeRepository?.closeDatabase) {
            await activeRepository.closeDatabase();
        }

        activeRepository = null;
    });

    describe(`Contrat des tâches : ${repositoryName}`, () => {

        it("doit retourner une liste vide pour un projet sans tâche", async () => {
            const repository = newRepository();

            const tasks = await repository.getTasksByProjectId("p1");

            expect(tasks).toEqual([]);
        });

        it("doit enregistrer une tâche et permettre de la retrouver", async () => {
            const repository = newRepository();

            const task = {
                id: "t1",
                title: "Préparer les tests",
                dueDate: "2026-11-20",
                projectId: "p1",
                completed: false,
                createdAt: "2026-11-13T10:00:00.000Z"
            };

            await repository.addTask(task);

            const tasks = await repository.getTasksByProjectId("p1");

            expect(tasks).toContainEqual(task);
        });

        it("doit modifier une tâche existante", async () => {
            const repository = newRepository();

            const task = {
                id: "t1",
                title: "Ancien titre",
                dueDate: null,
                projectId: "p1",
                completed: false,
                createdAt: "2026-11-13T10:00:00.000Z"
            };

            await repository.addTask(task);

            const updatedTask = {
                ...task,
                title: "Nouveau titre",
                completed: true
            };

            await repository.updateTask(updatedTask);

            const tasks = await repository.getTasksByProjectId("p1");

            expect(tasks).toContainEqual(updatedTask);
            expect(tasks).toHaveLength(1);
        });

        it("doit supprimer une tâche existante", async () => {
            const repository = newRepository();

            const task = {
                id: "t1",
                title: "Tâche à supprimer",
                dueDate: null,
                projectId: "p1",
                completed: false,
                createdAt: "2026-11-13T10:00:00.000Z"
            };

            await repository.addTask(task);
            await repository.deleteTask("t1");

            const tasks = await repository.getTasksByProjectId("p1");

            expect(tasks).toEqual([]);
        });
    });
}
