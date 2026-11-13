
class IndexedDBRepository {
    constructor(databaseName = "TodoDB", version = 3) {
        this.databaseName = databaseName;
        this.version = version;
        this.dbPromise = null;
    }

    // ========================================
    // OUVERTURE DE LA BASE DE DONNÉES
    // ========================================

    async openDatabase() {
        if (this.dbPromise) {
            return this.dbPromise;
        }

        this.dbPromise = new Promise((resolve, reject) => {
            const request = indexedDB.open(
                this.databaseName,
                this.version
            );

            request.onupgradeneeded = (event) => {
                const database = event.target.result;

                if (!database.objectStoreNames.contains("projects")) {
                    const store = database.createObjectStore(
                        "projects",
                        { keyPath: "id", autoIncrement: true }
                    );

                    store.createIndex("name", "name", {
                        unique: false
                    });
                }

                if (!database.objectStoreNames.contains("tasks")) {
                    const store = database.createObjectStore(
                        "tasks",
                        { keyPath: "id", autoIncrement: true }
                    );

                    store.createIndex("projectId", "projectId", {
                        unique: false
                    });
                }
            };

            request.onsuccess = () => {
                const database = request.result;

                database.onversionchange = () => {
                    database.close();
                    this.dbPromise = null;
                };

                resolve(database);
            };

            request.onerror = () => {
                this.dbPromise = null;
                reject(request.error);
            };
        });

        return this.dbPromise;
    }

    // ========================================
    // EXÉCUTION DES TRANSACTIONS
    // ========================================

    async executeTransaction(storeName, mode, operation) {
        const database = await this.openDatabase();

        return new Promise((resolve, reject) => {
            if (!database.objectStoreNames.contains(storeName)) {
                reject(new Error(
                    `L'espace de stockage '${storeName}' n'existe pas.`
                ));
                return;
            }

            let transaction;
            let result;

            try {
                transaction = database.transaction(storeName, mode);

                const store = transaction.objectStore(storeName);

                result = operation(store);
            } catch (error) {
                reject(error);
                return;
            }

            transaction.oncomplete = () => {
                resolve(
                    result && "result" in result
                        ? result.result
                        : result
                );
            };

            transaction.onerror = () => {
                reject(transaction.error);
            };

            transaction.onabort = () => {
                reject(transaction.error);
            };
        });
    }

    // ========================================
    // GESTION DES PROJETS
    // ========================================

    async getAllProjects() {
        return this.executeTransaction(
            "projects",
            "readonly",
            store => store.getAll()
        );
    }

    async addProject(project) {
        await this.executeTransaction(
            "projects",
            "readwrite",
            store => store.add(project)
        );

        return { ...project };
    }

    async updateProject(project) {
        await this.executeTransaction(
            "projects",
            "readwrite",
            store => store.put(project)
        );

        return { ...project };
    }

    async deleteProject(id) {
        return this.executeTransaction(
            "projects",
            "readwrite",
            store => store.delete(id)
        );
    }

    // ========================================
    // GESTION DES TÂCHES
    // ========================================

    async getTasksByProjectId(projectId) {
        return this.executeTransaction(
            "tasks",
            "readonly",
            store => store.index("projectId").getAll(projectId)
        );
    }

    async addTask(task) {
        await this.executeTransaction(
            "tasks",
            "readwrite",
            store => store.add(task)
        );

        return { ...task };
    }

    async updateTask(task) {
        await this.executeTransaction(
            "tasks",
            "readwrite",
            store => store.put(task)
        );

        return { ...task };
    }

    async deleteTask(id) {
        return this.executeTransaction(
            "tasks",
            "readwrite",
            store => store.delete(id)
        );
    }

    // ========================================
    // FERMETURE DE LA BASE DE DONNÉES
    // ========================================

    async closeDatabase() {
        if (!this.dbPromise) return;

        const database = await this.dbPromise;

        database.close();
        this.dbPromise = null;
    }
}

module.exports = {
    IndexedDBRepository
};
