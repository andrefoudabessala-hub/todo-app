
const projectForm = document.getElementById("project-form");
const projectNameInput = document.getElementById("project-name");
const projectList = document.getElementById("project-list");

const taskContent = document.getElementById("task-content");
const noProjectMessage = document.getElementById("no-project-message");
const selectedProjectName = document.getElementById("selected-project-name");

const taskForm = document.getElementById("task-form");
const taskTitleInput = document.getElementById("task-title");
const taskDescriptionInput = document.getElementById("task-description");
const taskList = document.getElementById("task-list");

let selectedProjectId = null;

// Numéro de version permettant d'ignorer les anciens affichages.
let taskDisplayVersion = 0;

// ========================================
// SÉLECTION D'UN PROJET
// ========================================

async function selectProject(project) {
    selectedProjectId = project.id;

    noProjectMessage.style.display = "none";
    taskContent.style.display = "block";
    selectedProjectName.textContent = project.name;

    // Attendre le chargement complet des tâches.
    await displayTasks();
}

// ========================================
// AFFICHAGE DES TÂCHES
// ========================================

async function displayTasks() {
    const currentVersion = ++taskDisplayVersion;
    const currentProjectId = selectedProjectId;

    taskList.innerHTML = "";

    if (currentProjectId === null) {
        return;
    }

    const [tasks, projects] = await Promise.all([
        getTasksByProjectId(currentProjectId),
        getProjects()
    ]);

    // Ignorer un résultat devenu obsolète.
    if (
        currentVersion !== taskDisplayVersion ||
        currentProjectId !== selectedProjectId
    ) {
        return;
    }

    tasks.forEach((task) => {
        const taskItem = document.createElement("li");
        taskItem.className = "task-item";

        // Informations de la tâche
        const taskInformation = document.createElement("div");

        const title = document.createElement("strong");
        title.textContent = task.title;

        const description = document.createElement("p");
        description.textContent = task.description || "";

        taskInformation.appendChild(title);
        taskInformation.appendChild(description);

        // Statut de la tâche
        const statusContainer = document.createElement("div");

        const completionCheckbox = document.createElement("input");
        completionCheckbox.type = "checkbox";
        completionCheckbox.checked = task.completed;

        const statusLabel = document.createElement("label");
        statusLabel.textContent = task.completed
            ? "Terminée"
            : "Non terminée";

        completionCheckbox.addEventListener("change", async () => {
            const newCompletedState = completionCheckbox.checked;

            // Empêcher plusieurs modifications simultanées.
            completionCheckbox.disabled = true;

            try {
                await updateTask(
                    task.id,
                    task.title,
                    task.description,
                    newCompletedState,
                    task.projectId
                );

                // Attendre la relecture de l'état enregistré.
                await displayTasks();
            } catch (error) {
                console.error(error);

                completionCheckbox.checked = !newCompletedState;
                completionCheckbox.disabled = false;

                alert("Impossible de modifier le statut de la tâche.");
            }
        });

        statusContainer.appendChild(completionCheckbox);
        statusContainer.appendChild(statusLabel);

        // Actions sur la tâche
        const taskActions = document.createElement("div");
        taskActions.className = "task-actions";

        // Modifier une tâche
        const editButton = document.createElement("button");
        editButton.type = "button";
        editButton.textContent = "Modifier";

        editButton.addEventListener("click", async () => {
            const newTitle = prompt(
                "Nouveau titre :",
                task.title
            );

            if (newTitle === null) {
                return;
            }

            const newDescription = prompt(
                "Nouvelle description :",
                task.description || ""
            );

            if (newDescription === null) {
                return;
            }

            const trimmedTitle = newTitle.trim();
            const trimmedDescription = newDescription.trim();

            if (!trimmedTitle) {
                alert("Le titre de la tâche est obligatoire.");
                return;
            }

            try {
                await updateTask(
                    task.id,
                    trimmedTitle,
                    trimmedDescription,
                    task.completed,
                    task.projectId
                );

                await displayTasks();
                alert("Tâche modifiée avec succès !");
            } catch (error) {
                console.error(error);
                alert("Impossible de modifier la tâche.");
            }
        });

        // Supprimer une tâche
        const deleteButton = document.createElement("button");
        deleteButton.type = "button";
        deleteButton.textContent = "Supprimer";

        deleteButton.addEventListener("click", async () => {
            const confirmed = confirm(
                "Voulez-vous vraiment supprimer cette tâche ?"
            );

            if (!confirmed) {
                return;
            }

            try {
                await deleteTask(task.id);
                await displayTasks();
                alert("Tâche supprimée avec succès !");
            } catch (error) {
                console.error(error);
                alert("Impossible de supprimer la tâche.");
            }
        });

        // Déplacer une tâche vers un autre projet
        const moveSelect = document.createElement("select");
        moveSelect.className = "move-task-select";
        moveSelect.setAttribute(
            "aria-label",
            `Déplacer la tâche ${task.title} vers un autre projet`
        );

        const defaultOption = document.createElement("option");
        defaultOption.value = "";
        defaultOption.textContent = "Déplacer vers un projet...";
        defaultOption.disabled = true;
        defaultOption.selected = true;

        moveSelect.appendChild(defaultOption);

        const destinationProjects = projects.filter(
            (project) => project.id !== task.projectId
        );

        destinationProjects.forEach((project) => {
            const option = document.createElement("option");
            option.value = project.id;
            option.textContent = project.name;

            moveSelect.appendChild(option);
        });

        if (destinationProjects.length === 0) {
            moveSelect.disabled = true;
        }

        moveSelect.addEventListener("change", async () => {
            const newProjectId = Number(moveSelect.value);

            if (
                !Number.isInteger(newProjectId) ||
                newProjectId <= 0 ||
                newProjectId === task.projectId
            ) {
                return;
            }

            try {
                await updateTask(
                    task.id,
                    task.title,
                    task.description,
                    task.completed,
                    newProjectId
                );

                await displayTasks();

                alert("Tâche déplacée avec succès !");
            } catch (error) {
                console.error(error);
                alert("Impossible de déplacer la tâche.");
                await displayTasks();
            }
        });

        taskActions.appendChild(editButton);
        taskActions.appendChild(deleteButton);
        taskActions.appendChild(moveSelect);

        taskItem.appendChild(taskInformation);
        taskItem.appendChild(statusContainer);
        taskItem.appendChild(taskActions);

        taskList.appendChild(taskItem);
    });
}

// ========================================
// AFFICHAGE DES PROJETS
// ========================================

async function displayProjects() {
    projectList.innerHTML = "";

    const projects = await getProjects();

    projects.forEach((project) => {
        const projectItem = document.createElement("li");
        projectItem.className = "project-item";

        // Sélectionner le projet
        const projectName = document.createElement("span");
        projectName.textContent = project.name;
        projectName.style.cursor = "pointer";

        projectName.addEventListener("click", async () => {
            try {
                await selectProject(project);
            } catch (error) {
                console.error(error);
                alert("Impossible de charger les tâches du projet.");
            }
        });

        // Modifier le projet
        const editButton = document.createElement("button");
        editButton.type = "button";
        editButton.textContent = "Modifier";

        editButton.addEventListener("click", async () => {
            const newName = prompt(
                "Nouveau nom du projet :",
                project.name
            );

            if (newName === null) {
                return;
            }

            const trimmedName = newName.trim();

            if (!trimmedName) {
                alert("Le nom du projet est obligatoire.");
                return;
            }

            try {
                await updateProject(project.id, trimmedName);

                if (selectedProjectId === project.id) {
                    selectedProjectName.textContent = trimmedName;
                }

                await displayProjects();
                alert("Projet modifié avec succès !");
            } catch (error) {
                console.error(error);
                alert("Impossible de modifier le projet.");
            }
        });

        // Supprimer le projet
        const deleteButton = document.createElement("button");
        deleteButton.type = "button";
        deleteButton.textContent = "Supprimer";

        deleteButton.addEventListener("click", async () => {
            const confirmed = confirm(
                "Voulez-vous vraiment supprimer ce projet ?"
            );

            if (!confirmed) {
                return;
            }

            try {
                await deleteProject(project.id);

                if (selectedProjectId === project.id) {
                    selectedProjectId = null;
                    taskDisplayVersion++;

                    taskContent.style.display = "none";
                    noProjectMessage.style.display = "block";
                    taskList.innerHTML = "";
                }

                await displayProjects();
                alert("Projet supprimé avec succès !");
            } catch (error) {
                console.error(error);
                alert("Impossible de supprimer le projet.");
            }
        });

        projectItem.appendChild(projectName);
        projectItem.appendChild(editButton);
        projectItem.appendChild(deleteButton);

        projectList.appendChild(projectItem);
    });
}

// ========================================
// AJOUT D'UN PROJET
// ========================================

projectForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const projectName = projectNameInput.value.trim();

    if (!projectName) {
        alert("Le nom du projet est obligatoire.");
        return;
    }

    try {
        await addProject(projectName);

        projectNameInput.value = "";

        await displayProjects();
    } catch (error) {
        console.error(error);
        alert("Impossible d'ajouter le projet.");
    }
});

// ========================================
// AJOUT D'UNE TÂCHE
// ========================================

taskForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (selectedProjectId === null) {
        alert("Veuillez sélectionner un projet.");
        return;
    }

    const title = taskTitleInput.value.trim();
    const description = taskDescriptionInput.value.trim();

    if (!title) {
        alert("Le titre de la tâche est obligatoire.");
        return;
    }

    try {
        await addTask(
            title,
            description,
            selectedProjectId
        );

        taskTitleInput.value = "";
        taskDescriptionInput.value = "";

        await displayTasks();
    } catch (error) {
        console.error(error);
        alert("Impossible d'ajouter la tâche.");
    }
});

// ========================================
// INITIALISATION
// ========================================

async function initializeApplication() {
    try {
        await openDatabase();
        await displayProjects();
    } catch (error) {
        console.error(error);
        alert("Impossible d'initialiser l'application.");
    }
}

initializeApplication();
