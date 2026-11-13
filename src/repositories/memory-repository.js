
class MemoryRepository {
    constructor() {
        this.projects = [];
    }

    async getAllProjects() {
        return [...this.projects];
    }

    async addProject(project) {
        this.projects.push({ ...project });
        return { ...project };
    }
}

module.exports = {
    MemoryRepository
};
