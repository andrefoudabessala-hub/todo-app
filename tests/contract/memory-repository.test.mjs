
import memoryRepositoryModule from "../../src/repositories/memory-repository.js";

import {
    defineProjectRepositoryContract
} from "./project-repository.contract.mjs";

import {
    defineTaskRepositoryContract
} from "./task-repository.contract.mjs";

const { MemoryRepository } = memoryRepositoryModule;

defineProjectRepositoryContract(
    "MemoryRepository",
    () => new MemoryRepository()
);

defineTaskRepositoryContract(
    "MemoryRepository",
    () => new MemoryRepository()
);
