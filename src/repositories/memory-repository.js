
class MemoryRepository {
    constructor() {
        this.projects = [];
    }

    async getAllProjects() {
        return this.projects.map(project => ({ ...project }));
    }

    async addProject(project) {
        this.projects.push({ ...project });
        return { ...project };
    }

    async updateProject(project) {
        const index = this.projects.findIndex(
            item => item.id === project.id
        );

        if (index === -1) {
            throw new Error("Projet introuvable.");
        }

        this.projects[index] = { ...project };

        return { ...project };
    }

    async deleteProject(id) {
        const index = this.projects.findIndex(
            project => project.id === id
        );

        if (index !== -1) {
            this.projects.splice(index, 1);
        }
    }
}

module.exports = {
    MemoryRepository
};
