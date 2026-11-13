
import { describe, it, expect } from "vitest";

export function defineProjectRepositoryContract(
    repositoryName,
    createRepository
) {
    describe(`Contrat du dépôt : ${repositoryName}`, () => {
        it("doit retourner une liste vide au départ", async () => {
            const repository = createRepository();

            const projects = await repository.getAllProjects();

            expect(projects).toEqual([]);
        });

        it("doit enregistrer un projet et permettre de le retrouver", async () => {
            const repository = createRepository();

            const project = {
                id: "p1",
                name: "Projet INF563",
                createdAt: "2026-11-13T10:00:00.000Z"
            };

            await repository.addProject(project);

            const projects = await repository.getAllProjects();

            expect(projects).toContainEqual(project);
        });
    });
}
