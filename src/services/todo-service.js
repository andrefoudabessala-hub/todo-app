
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
}

module.exports = {
    TodoService
};
