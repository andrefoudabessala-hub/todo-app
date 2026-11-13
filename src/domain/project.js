function validateProjectName(name) {
    if (typeof name !== "string" || name.trim() === "") {
        throw new Error("Le nom du projet est obligatoire.");
    }

    return name.trim();
}

module.exports = {
    validateProjectName
};