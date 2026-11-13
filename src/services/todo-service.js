
const { validateProjectName } = require("../domain/project");

const {
    validateTaskTitle,
    validateDueDate
} = require("../domain/task");

const {
    calculateTaskStatistics
} = require("../domain/task-statistics");

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
        const validTitle = validateTaskTitle(title);
        const validDueDate = validateDueDate(dueDate);

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

        const task = {
            id: this.idGenerator(),
            title: validTitle,
            dueDate: validDueDate,
            projectId,
            completed: false,
            createdAt: this.clock().toISOString()
        };

        return await this.repository.addTask(task);
    }

    // ========================================
    // MODIFICATION D'UNE TÂCHE
    // ========================================

    async updateTask(taskId, changes) {
        if (!changes || typeof changes !== "object" || Array.isArray(changes)) {
            throw new Error("Les modifications fournies sont invalides.");
        }

        const projects = await this.repository.getAllProjects();

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

        const updatedTask = {
            ...existingTask
        };

        if (Object.prototype.hasOwnProperty.call(changes, "title")) {
            updatedTask.title = validateTaskTitle(changes.title);
        }

        if (Object.prototype.hasOwnProperty.call(changes, "dueDate")) {
            updatedTask.dueDate = validateDueDate(changes.dueDate);
        }

        if (Object.prototype.hasOwnProperty.call(changes, "projectId")) {
            const projectExists = projects.some(
                project => project.id === changes.projectId
            );

            if (!projectExists) {
                throw new Error(
                    "Le nouveau projet associé à cette tâche n'existe pas."
                );
            }

            updatedTask.projectId = changes.projectId;
        }

        if (Object.prototype.hasOwnProperty.call(changes, "completed")) {
            if (typeof changes.completed !== "boolean") {
                throw new Error(
                    "L'état d'achèvement doit être booléen."
                );
            }

            updatedTask.completed = changes.completed;
        }

        return await this.repository.updateTask(updatedTask);
    }

    // ========================================
    // ACHÈVEMENT D'UNE TÂCHE
    // ========================================

    async setTaskCompleted(taskId, completed) {
        if (typeof completed !== "boolean") {
            throw new Error(
                "L'état d'achèvement doit être booléen."
            );
        }

        return await this.updateTask(taskId, {
            completed
        });
    }

    // ========================================
    // STATISTIQUES D'UN PROJET
    // ========================================

    async getTaskStatistics(projectId) {
        const projects = await this.repository.getAllProjects();

        const projectExists = projects.some(
            project => project.id === projectId
        );

        if (!projectExists) {
            throw new Error("Le projet demandé n'existe pas.");
        }

        const tasks = await this.repository.getTasksByProjectId(projectId);

        return calculateTaskStatistics(tasks);
    }
}

module.exports = {
    TodoService
};
