
import "fake-indexeddb/auto";

import indexedDBRepositoryModule from "../../src/repositories/indexeddb-repository.js";

import {
    defineProjectRepositoryContract
} from "./project-repository.contract.mjs";

import {
    defineTaskRepositoryContract
} from "./task-repository.contract.mjs";

const { IndexedDBRepository } = indexedDBRepositoryModule;

let databaseNumber = 0;

function createRepository() {
    databaseNumber++;

    return new IndexedDBRepository(
        `TodoDB-contract-${databaseNumber}`
    );
}

defineProjectRepositoryContract(
    "IndexedDBRepository",
    createRepository
);

defineTaskRepositoryContract(
    "IndexedDBRepository",
    createRepository
);
