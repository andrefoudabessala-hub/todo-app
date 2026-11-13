
const { validateProjectName } = require("../domain/project");

class TodoService {
    constructor({ repository, clock, idGenerator }) {
        this.repository = repository;
        this.clock = clock;
        this.idGenerator = idGenerator;
    }

    async createProject(name) {
        // Validation du nom
        const validName = validateProjectName(name);

        // Récupération des projets existants
        const projects = await this.repository.getAllProjects();

        // Vérification de l'unicité, sans tenir compte de la casse
        const normalizedName = validName.toLowerCase();

        const alreadyExists = projects.some(
            project => project.name.trim().toLowerCase() === normalizedName
        );

        if (alreadyExists) {
            throw new Error("Un projet portant ce nom existe déjà.");
        }

        // Création du projet
        const project = {
            id: this.idGenerator(),
            name: validName,
            createdAt: this.clock().toISOString()
        };

        return await this.repository.addProject(project);
    }
}

module.exports = {
    TodoService
};
