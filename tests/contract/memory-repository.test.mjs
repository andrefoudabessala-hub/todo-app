
import memoryRepositoryModule from "../../src/repositories/memory-repository.js";

import {
    defineProjectRepositoryContract
} from "./project-repository.contract.mjs";

const { MemoryRepository } = memoryRepositoryModule;

defineProjectRepositoryContract(
    "MemoryRepository",
    () => new MemoryRepository()
);
