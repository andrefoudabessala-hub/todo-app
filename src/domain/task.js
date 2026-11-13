
const MAX_TASK_TITLE_LENGTH = 100;

/**
 * Valide et normalise le titre d'une tâche.
 */
function validateTaskTitle(title) {
    if (typeof title !== "string") {
        throw new Error("Le titre de la tâche doit être une chaîne de caractères.");
    }

    const normalizedTitle = title.trim();

    if (normalizedTitle === "") {
        throw new Error("Le titre de la tâche est obligatoire.");
    }

    if (normalizedTitle.length > MAX_TASK_TITLE_LENGTH) {
        throw new Error(
            `Le titre ne doit pas dépasser ${MAX_TASK_TITLE_LENGTH} caractères.`
        );
    }

    return normalizedTitle;
}

/**
 * Valide une date au format AAAA-MM-JJ.
 * Une date absente est représentée par null.
 */
function validateDueDate(date) {
    if (date === undefined || date === null || date === "") {
        return null;
    }

    if (typeof date !== "string") {
        throw new Error("La date doit être une chaîne de caractères.");
    }

    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);

    if (!match) {
        throw new Error("Le format de date doit être AAAA-MM-JJ.");
    }

    const year = Number(match[1]);
    const month = Number(match[2]);
    const day = Number(match[3]);

    const parsedDate = new Date(Date.UTC(year, month - 1, day));

    const isValid =
        parsedDate.getUTCFullYear() === year &&
        parsedDate.getUTCMonth() === month - 1 &&
        parsedDate.getUTCDate() === day;

    if (!isValid) {
        throw new Error("La date d'échéance n'est pas valide.");
    }

    return date;
}

module.exports = {
    MAX_TASK_TITLE_LENGTH,
    validateTaskTitle,
    validateDueDate
};
