
import {
    describe,
    it,
    expect,
    afterEach
} from "vitest";

export function defineProjectRepositoryContract(
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

    describe(`Contrat du dépôt : ${repositoryName}`, () => {

        it("doit retourner une liste vide au départ", async () => {
            const repository = newRepository();

            const projects = await repository.getAllProjects();

            expect(projects).toEqual([]);
        });

        it("doit enregistrer un projet et permettre de le retrouver", async () => {
            const repository = newRepository();

            const project = {
                id: "p1",
                name: "Projet INF563",
                createdAt: "2026-11-13T10:00:00.000Z"
            };

            await repository.addProject(project);

            const projects = await repository.getAllProjects();

            expect(projects).toContainEqual(project);
        });

        it("doit modifier un projet existant", async () => {
            const repository = newRepository();

            const project = {
                id: "p1",
                name: "Ancien nom",
                createdAt: "2026-11-13T10:00:00.000Z"
            };

            await repository.addProject(project);

            const updatedProject = {
                ...project,
                name: "Nouveau nom"
            };

            await repository.updateProject(updatedProject);

            const projects = await repository.getAllProjects();

            expect(projects).toContainEqual(updatedProject);
            expect(projects).toHaveLength(1);
        });

        it("doit supprimer un projet existant", async () => {
            const repository = newRepository();

            const project = {
                id: "p1",
                name: "Projet à supprimer",
                createdAt: "2026-11-13T10:00:00.000Z"
            };

            await repository.addProject(project);
            await repository.deleteProject("p1");

            const projects = await repository.getAllProjects();

            expect(projects).toEqual([]);
        });
    });
}
