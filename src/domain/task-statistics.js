
function calculateTaskStatistics(tasks) {
    if (!Array.isArray(tasks)) {
        throw new Error("La liste des tâches doit être un tableau.");
    }

    const total = tasks.length;

    const completed = tasks.filter(
        task => task.completed === true
    ).length;

    const remaining = total - completed;

    const percentage = total === 0
        ? 0
        : Math.round((completed / total) * 100);

    return {
        total,
        completed,
        remaining,
        percentage
    };
}

module.exports = {
    calculateTaskStatistics
};
