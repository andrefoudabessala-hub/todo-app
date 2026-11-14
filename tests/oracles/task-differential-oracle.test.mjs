
import { describe, it, expect } from "vitest";

import "fake-indexeddb/auto";

import serviceModule from "../../src/services/todo-service.js";
import memoryRepositoryModule from "../../src/repositories/memory-repository.js";
import indexedDBRepositoryModule from "../../src/repositories/indexeddb-repository.js";

import pairwiseModule from "../support/task-pairwise-cases.js";

const { TodoService } = serviceModule;

const {
    MemoryRepository
} = memoryRepositoryModule;

const {
    IndexedDBRepository
} = indexedDBRepositoryModule;

const {
    taskPairwiseCases,
    buildTaskInput
} = pairwiseModule;

let databaseNumber = 0;


// ========================================
// CRÉATION D'UN SERVICE DE TEST
// ========================================

function createService(repository) {
    let identifier = 0;

    const clock = () =>
        new Date("2026-11-13T10:00:00.000Z");

    const idGenerator = () => {
        identifier++;
        return `task-${identifier}`;
    };

    return new TodoService({
        repository,
        clock,
        idGenerator
    });
}


// ========================================
// INITIALISATION IDENTIQUE DES DÉPÔTS
// ========================================

async function initializeRepository(repository) {
    await repository.addProject({
        id: "projet-1",
        name: "Projet INF563",
        createdAt: "2026-11-13T00:00:00.000Z"
    });

    await repository.addProject({
        id: "projet-2",
        name: "Projet secondaire",
        createdAt: "2026-11-13T00:00:00.000Z"
    });
}


// ========================================
// RÉCUPÉRATION D'UN ÉTAT NORMALISÉ
// ========================================

async function getRepositoryState(service, repository) {
    const project1Tasks =
        await repository.getTasksByProjectId("projet-1");

    const project2Tasks =
        await repository.getTasksByProjectId("projet-2");

    const project1Statistics =
        await service.getTaskStatistics("projet-1");

    const project2Statistics =
        await service.getTaskStatistics("projet-2");

    return {
        project1Tasks: [...project1Tasks].sort(
            (a, b) => a.id.localeCompare(b.id)
        ),

        project2Tasks: [...project2Tasks].sort(
            (a, b) => a.id.localeCompare(b.id)
        ),

        project1Statistics,
        project2Statistics
    };
}


// ========================================
// EXÉCUTION DU MÊME SCÉNARIO
// ========================================

async function executeScenario(service, repository, input) {

    const firstTask = await service.createTask(input);

    const secondTask = await service.createTask(input);

    const updatedTask = await service.updateTask(
        firstTask.id,
        {
            title: `${firstTask.title} modifiée`
        }
    );

    const movedTask = await service.updateTask(
        updatedTask.id,
        {
            projectId: "projet-2"
        }
    );

    const completedTask =
        await service.setTaskCompleted(secondTask.id, true);

    const state = await getRepositoryState(
        service,
        repository
    );

    return {
        firstTask,
        secondTask,
        updatedTask,
        movedTask,
        completedTask,
        state
    };
}


// ========================================
// ORACLE DIFFÉRENTIEL
// ========================================

describe("Oracle différentiel - MemoryRepository / IndexedDBRepository", () => {

    it.each(taskPairwiseCases)(
        "doit produire des résultats identiques pour le cas $titre / $date / $projet",
        async testCase => {

            databaseNumber++;

            const databaseName =
                `TodoDB-differential-${databaseNumber}`;

            const memoryRepository =
                new MemoryRepository();

            const indexedDBRepository =
                new IndexedDBRepository(databaseName);

            try {

                const memoryService =
                    createService(memoryRepository);

                const indexedDBService =
                    createService(indexedDBRepository);

                await initializeRepository(memoryRepository);

                await initializeRepository(indexedDBRepository);

                const input = buildTaskInput(testCase);

                const creationShouldSucceed =
                    testCase.titre === "valide" &&
                    testCase.date !== "invalide" &&
                    testCase.projet === "existant";


                // --------------------------------
                // CAS DE CRÉATION INVALIDE
                // --------------------------------

                if (!creationShouldSucceed) {

                    let memoryError;
                    let indexedDBError;

                    try {
                        await memoryService.createTask(input);
                    } catch (error) {
                        memoryError = error;
                    }

                    try {
                        await indexedDBService.createTask(input);
                    } catch (error) {
                        indexedDBError = error;
                    }

                    expect(memoryError).toBeInstanceOf(Error);
                    expect(indexedDBError).toBeInstanceOf(Error);

                    expect(indexedDBError.message)
                        .toBe(memoryError.message);

                    const memoryState =
                        await getRepositoryState(
                            memoryService,
                            memoryRepository
                        );

                    const indexedDBState =
                        await getRepositoryState(
                            indexedDBService,
                            indexedDBRepository
                        );

                    expect(indexedDBState).toEqual(memoryState);

                    expect(memoryState.project1Tasks).toHaveLength(0);
                    expect(memoryState.project2Tasks).toHaveLength(0);

                    return;
                }


                // --------------------------------
                // CAS DE CRÉATION VALIDE
                // --------------------------------

                const memoryResult =
                    await executeScenario(
                        memoryService,
                        memoryRepository,
                        input
                    );

                const indexedDBResult =
                    await executeScenario(
                        indexedDBService,
                        indexedDBRepository,
                        input
                    );


                // --------------------------------
                // COMPARAISON DES RÉSULTATS
                // --------------------------------

                expect(indexedDBResult).toEqual(memoryResult);


                // --------------------------------
                // VÉRIFICATION DES STATISTIQUES
                // --------------------------------

                expect(memoryResult.state.project1Statistics.total)
                    .toBe(1);

                expect(memoryResult.state.project2Statistics.total)
                    .toBe(1);

                expect(
                    memoryResult.state.project1Statistics.total +
                    memoryResult.state.project2Statistics.total
                ).toBe(2);

                expect(
                    memoryResult.state.project2Tasks[0].completed
                ).toBe(false);

                expect(
                    memoryResult.state.project1Tasks[0].completed
                ).toBe(true);

            } finally {

                indexedDBRepository.closeDatabase();

            }
        }
    );
});
