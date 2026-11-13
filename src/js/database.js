
const DB_NAME = "TodoDB";
const DB_VERSION = 3;

let db;


// ========================================
// OUVERTURE DE LA BASE DE DONNÉES
// ========================================

function openDatabase() {
    return new Promise((resolve, reject) => {

        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onerror = function () {
            reject(new Error("Impossible d'ouvrir la base de données."));
        };

        request.onsuccess = function () {
            db = request.result;

            // Détecter une fermeture inattendue de la base
            db.onversionchange = function () {
                db.close();
            };

            resolve(db);
        };

        request.onupgradeneeded = function (event) {

            const database = event.target.result;

            // Création de l'espace de stockage des projets
            if (!database.objectStoreNames.contains("projects")) {

                const projectStore = database.createObjectStore(
                    "projects",
                    {
                        keyPath: "id",
                        autoIncrement: true
                    }
                );

                projectStore.createIndex(
                    "name",
                    "name",
                    {
                        unique: false
                    }
                );
            }

            // Création de l'espace de stockage des tâches
            if (!database.objectStoreNames.contains("tasks")) {

                const taskStore = database.createObjectStore(
                    "tasks",
                    {
                        keyPath: "id",
                        autoIncrement: true
                    }
                );

                taskStore.createIndex(
                    "projectId",
                    "projectId",
                    {
                        unique: false
                    }
                );
            }
        };
    });
}


// ========================================
// FONCTION UTILITAIRE POUR LES TRANSACTIONS
// ========================================

function executeTransaction(storeName, mode, operation) {
    return new Promise((resolve, reject) => {

        if (!db) {
            reject(new Error("La base de données n'est pas ouverte."));
            return;
        }

        if (!db.objectStoreNames.contains(storeName)) {
            reject(new Error(
                "L'espace de stockage '" + storeName +
                "' n'existe pas dans la base de données."
            ));
            return;
        }

        let transaction;

        try {
            transaction = db.transaction([storeName], mode);
        } catch (error) {
            reject(error);
            return;
        }

        const store = transaction.objectStore(storeName);

        let result;

        try {
            result = operation(store);
        } catch (error) {
            reject(error);
            return;
        }

        transaction.oncomplete = function () {
            resolve(result);
        };

        transaction.onerror = function () {
            reject(transaction.error || new Error("Erreur de transaction."));
        };

        transaction.onabort = function () {
            reject(transaction.error || new Error("Transaction annulée."));
        };
    });
}


// ========================================
// GESTION DES PROJETS
// ========================================

function addProject(name) {
    return executeTransaction("projects", "readwrite", function (store) {

        return new Promise((resolve, reject) => {

            const request = store.add({
                name: name
            });

            request.onsuccess = function () {
                resolve(request.result);
            };

            request.onerror = function () {
                reject(request.error);
            };
        });
    });
}


function getProjects() {
    return executeTransaction("projects", "readonly", function (store) {

        return new Promise((resolve, reject) => {

            const request = store.getAll();

            request.onsuccess = function () {
                resolve(request.result);
            };

            request.onerror = function () {
                reject(request.error);
            };
        });
    });
}


function updateProject(id, name) {
    return executeTransaction("projects", "readwrite", function (store) {

        return new Promise((resolve, reject) => {

            const request = store.put({
                id: id,
                name: name
            });

            request.onsuccess = function () {
                resolve();
            };

            request.onerror = function () {
                reject(request.error);
            };
        });
    });
}


function deleteProject(id) {
    return executeTransaction("projects", "readwrite", function (store) {

        return new Promise((resolve, reject) => {

            const request = store.delete(id);

            request.onsuccess = function () {
                resolve();
            };

            request.onerror = function () {
                reject(request.error);
            };
        });
    });
}


// ========================================
// GESTION DES TÂCHES
// ========================================

function addTask(title, description, projectId) {
    return executeTransaction("tasks", "readwrite", function (store) {

        return new Promise((resolve, reject) => {

            const request = store.add({
                title: title,
                description: description,
                completed: false,
                projectId: projectId
            });

            request.onsuccess = function () {
                resolve(request.result);
            };

            request.onerror = function () {
                reject(request.error);
            };
        });
    });
}


function getTasksByProjectId(projectId) {
    return executeTransaction("tasks", "readonly", function (store) {

        return new Promise((resolve, reject) => {

            const index = store.index("projectId");
            const request = index.getAll(projectId);

            request.onsuccess = function () {
                resolve(request.result);
            };

            request.onerror = function () {
                reject(request.error);
            };
        });
    });
}


function updateTask(id, title, description, completed, projectId) {
    return executeTransaction("tasks", "readwrite", function (store) {

        return new Promise((resolve, reject) => {

            const request = store.put({
                id: id,
                title: title,
                description: description,
                completed: completed,
                projectId: projectId
            });

            request.onsuccess = function () {
                resolve();
            };

            request.onerror = function () {
                reject(request.error);
            };
        });
    });
}


function deleteTask(id) {
    return executeTransaction("tasks", "readwrite", function (store) {

        return new Promise((resolve, reject) => {

            const request = store.delete(id);

            request.onsuccess = function () {
                resolve();
            };

            request.onerror = function () {
                reject(request.error);
            };
        });
    });
}
