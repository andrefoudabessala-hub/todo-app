
class MemoryRepository {
    constructor() {
        this.projects = [];
        this.tasks = [];
    }

    // ========================================
    // GESTION DES PROJETS
    // ========================================

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

    // ========================================
    // GESTION DES TÂCHES
    // ========================================

    async getTasksByProjectId(projectId) {
        return this.tasks
            .filter(task => task.projectId === projectId)
            .map(task => ({ ...task }));
    }

    async addTask(task) {
        this.tasks.push({ ...task });
        return { ...task };
    }

    async updateTask(task) {
        const index = this.tasks.findIndex(
            item => item.id === task.id
        );

        if (index === -1) {
            throw new Error("Tâche introuvable.");
        }

        this.tasks[index] = { ...task };

        return { ...task };
    }

    async deleteTask(id) {
        const index = this.tasks.findIndex(
            task => task.id === id
        );

        if (index !== -1) {
            this.tasks.splice(index, 1);
        }
    }
}

module.exports = {
    MemoryRepository
};
