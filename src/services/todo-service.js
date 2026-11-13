
const { validateProjectName } = require("../domain/project");

const {
    validateTaskTitle,
    validateDueDate
} = require("../domain/task");

class TodoService {
    constructor({ repository, clock, idGenerator }) {
        this.repository = repository;
        this.clock = clock;
        this.idGenerator = idGenerator;
    }

    // ========================================
    // GESTION DES PROJETS
    // ========================================

    async createProject(name) {
        const validName = validateProjectName(name);

        const projects = await this.repository.getAllProjects();

        const normalizedName = validName.toLowerCase();

        const alreadyExists = projects.some(
            project => project.name.trim().toLowerCase() === normalizedName
        );

        if (alreadyExists) {
            throw new Error("Un projet portant ce nom existe déjà.");
        }

        const project = {
            id: this.idGenerator(),
            name: validName,
            createdAt: this.clock().toISOString()
        };

        return await this.repository.addProject(project);
    }

    // ========================================
    // GESTION DES TÂCHES
    // ========================================

    async createTask({ title, dueDate, projectId }) {

        // Validation du titre
        const validTitle = validateTaskTitle(title);

        // Validation de la date
        const validDueDate = validateDueDate(dueDate);

        // Vérification du projet
        if (projectId === undefined || projectId === null || projectId === "") {
            throw new Error("Un projet doit être associé à la tâche.");
        }

        const projects = await this.repository.getAllProjects();

        const projectExists = projects.some(
            project => project.id === projectId
        );

        if (!projectExists) {
            throw new Error("Le projet associé à cette tâche n'existe pas.");
        }

        // Construction de la tâche
        const task = {
            id: this.idGenerator(),
            title: validTitle,
            dueDate: validDueDate,
            projectId,
            completed: false,
            createdAt: this.clock().toISOString()
        };

        // Enregistrement
        return await this.repository.addTask(task);
    }

    // ========================================
    // MODIFICATION D'UNE TÂCHE
    // ========================================

    async updateTask(taskId, changes) {

        // Vérification des paramètres
        if (!changes || typeof changes !== "object" || Array.isArray(changes)) {
            throw new Error("Les modifications fournies sont invalides.");
        }

        // Récupération des projets
        const projects = await this.repository.getAllProjects();

        // Recherche de la tâche dans les différents projets
        let existingTask = null;

        for (const project of projects) {
            const tasks = await this.repository.getTasksByProjectId(project.id);

            existingTask = tasks.find(task => task.id === taskId);

            if (existingTask) {
                break;
            }
        }

        if (!existingTask) {
            throw new Error("La tâche à modifier n'existe pas.");
        }

        // Conservation des propriétés existantes
        const updatedTask = {
            ...existingTask
        };

        // Validation du titre
        if (Object.prototype.hasOwnProperty.call(changes, "title")) {
            updatedTask.title = validateTaskTitle(changes.title);
        }

        // Validation de la date d'échéance
        if (Object.prototype.hasOwnProperty.call(changes, "dueDate")) {
            updatedTask.dueDate = validateDueDate(changes.dueDate);
        }

        // Vérification du nouveau projet
        if (Object.prototype.hasOwnProperty.call(changes, "projectId")) {
            const projectExists = projects.some(
                project => project.id === changes.projectId
            );

            if (!projectExists) {
                throw new Error(
                    "Le nouveau projet associé à la tâche n'existe pas."
                );
            }

            updatedTask.projectId = changes.projectId;
        }

        // Modification éventuelle de l'état d'achèvement
        if (Object.prototype.hasOwnProperty.call(changes, "completed")) {
            if (typeof changes.completed !== "boolean") {
                throw new Error(
                    "L'état d'achèvement doit être booléen."
                );
            }

            updatedTask.completed = changes.completed;
        }

        // Enregistrement de la tâche modifiée
        return await this.repository.updateTask(updatedTask);
    }
}

module.exports = {
    TodoService
};
