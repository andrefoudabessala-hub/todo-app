
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


// ========================================
// SÉLECTION D'UN PROJET
// ========================================

async function selectProject(project) {
    selectedProjectId = project.id;

    noProjectMessage.style.display = "none";
    taskContent.style.display = "block";

    selectedProjectName.textContent = project.name;

    await displayTasks();
}


// ========================================
// AFFICHAGE DES TÂCHES
// ========================================

async function displayTasks() {
    taskList.innerHTML = "";

    if (selectedProjectId === null) {
        return;
    }

    const tasks = await getTasksByProjectId(selectedProjectId);

    tasks.forEach(function (task) {

        const taskItem = document.createElement("li");
        taskItem.classList.add("task-item");

        // Zone contenant le titre et la description
        const taskInformation = document.createElement("div");
        taskInformation.classList.add("task-information");

        const taskTitle = document.createElement("strong");
        taskTitle.textContent = task.title;

        const taskDescription = document.createElement("p");
        taskDescription.textContent = task.description;

        taskInformation.appendChild(taskTitle);
        taskInformation.appendChild(taskDescription);


        // Zone contenant le statut
        const taskStatusArea = document.createElement("div");
        taskStatusArea.classList.add("task-status-area");

        const completionCheckbox = document.createElement("input");
        completionCheckbox.type = "checkbox";
        completionCheckbox.checked = task.completed;

        const statusLabel = document.createElement("label");
        statusLabel.textContent = task.completed
            ? "Terminée"
            : "Non terminée";

        completionCheckbox.addEventListener("change", async function () {
            try {
                await updateTask(
                    task.id,
                    task.title,
                    task.description,
                    completionCheckbox.checked,
                    task.projectId
                );

                await displayTasks();

            } catch (error) {
                console.error("Erreur lors du changement de statut :", error);
                alert("Impossible de modifier le statut de la tâche.");
            }
        });

        taskStatusArea.appendChild(completionCheckbox);
        taskStatusArea.appendChild(statusLabel);


        // Zone contenant les boutons d'action
        const taskActions = document.createElement("div");
        taskActions.classList.add("task-actions");


        // Bouton de modification
        const editButton = document.createElement("button");
        editButton.textContent = "Modifier";
        editButton.classList.add("edit-task-button");

        editButton.addEventListener("click", async function () {

            const newTitle = prompt(
                "Nouveau titre :",
                task.title
            );

            if (newTitle === null) {
                return;
            }

            const newDescription = prompt(
                "Nouvelle description :",
                task.description
            );

            if (newDescription === null) {
                return;
            }

            const trimmedTitle = newTitle.trim();
            const trimmedDescription = newDescription.trim();

            if (trimmedTitle === "") {
                alert("Le titre ne peut pas être vide.");
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
                console.error("Erreur lors de la modification :", error);
                alert("Impossible de modifier la tâche.");
            }
        });


        // Bouton de suppression
        const deleteButton = document.createElement("button");
        deleteButton.textContent = "Supprimer";
        deleteButton.classList.add("delete-task-button");

        deleteButton.addEventListener("click", async function () {

            const confirmation = confirm(
                "Voulez-vous vraiment supprimer cette tâche ?"
            );

            if (!confirmation) {
                return;
            }

            try {
                await deleteTask(task.id);

                await displayTasks();

                alert("Tâche supprimée avec succès !");

            } catch (error) {
                console.error("Erreur lors de la suppression :", error);
                alert("Impossible de supprimer la tâche.");
            }
        });


        // Assemblage des boutons
        taskActions.appendChild(editButton);
        taskActions.appendChild(deleteButton);

        // Assemblage complet de la tâche
        taskItem.appendChild(taskInformation);
        taskItem.appendChild(taskStatusArea);
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

    projects.forEach(function (project) {

        const projectItem = document.createElement("li");

        const projectName = document.createElement("span");
        projectName.textContent = project.name;
        projectName.style.cursor = "pointer";

        // Sélectionner un projet
        projectName.addEventListener("click", async function () {
            try {
                await selectProject(project);

            } catch (error) {
                console.error("Erreur lors de la sélection :", error);
                alert("Impossible d'afficher les tâches de ce projet.");
            }
        });


        // Bouton de modification du projet
        const editButton = document.createElement("button");
        editButton.textContent = "Modifier";

        editButton.addEventListener("click", async function () {

            const newName = prompt(
                "Nouveau nom du projet :",
                project.name
            );

            if (newName === null) {
                return;
            }

            const trimmedName = newName.trim();

            if (trimmedName === "") {
                alert("Le nom du projet ne peut pas être vide.");
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
                console.error("Erreur lors de la modification :", error);
                alert("Impossible de modifier le projet.");
            }
        });


        // Bouton de suppression du projet
        const deleteButton = document.createElement("button");
        deleteButton.textContent = "Supprimer";

        deleteButton.addEventListener("click", async function () {

            const confirmation = confirm(
                "Voulez-vous vraiment supprimer ce projet ?"
            );

            if (!confirmation) {
                return;
            }

            try {
                await deleteProject(project.id);

                if (selectedProjectId === project.id) {
                    selectedProjectId = null;

                    taskContent.style.display = "none";
                    noProjectMessage.style.display = "block";

                    taskList.innerHTML = "";
                }

                await displayProjects();

                alert("Projet supprimé avec succès !");

            } catch (error) {
                console.error("Erreur lors de la suppression :", error);
                alert("Impossible de supprimer le projet.");
            }
        });


        // Assemblage des éléments du projet
        projectItem.appendChild(projectName);
        projectItem.appendChild(editButton);
        projectItem.appendChild(deleteButton);

        projectList.appendChild(projectItem);
    });
}


// ========================================
// AJOUT D'UN PROJET
// ========================================

projectForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const projectName = projectNameInput.value.trim();

    if (projectName === "") {
        alert("Veuillez saisir le nom du projet.");
        return;
    }

    try {
        await addProject(projectName);

        projectNameInput.value = "";

        await displayProjects();

        alert("Projet ajouté avec succès !");

    } catch (error) {
        console.error("Erreur lors de l'ajout du projet :", error);
        alert("Impossible d'ajouter le projet.");
    }
});


// ========================================
// AJOUT D'UNE TÂCHE
// ========================================

taskForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    try {
        if (selectedProjectId === null) {
            throw new Error("Aucun projet sélectionné.");
        }

        const title = taskTitleInput.value.trim();
        const description = taskDescriptionInput.value.trim();

        if (title === "") {
            throw new Error("Le titre de la tâche est obligatoire.");
        }

        await addTask(
            title,
            description,
            selectedProjectId
        );

        taskTitleInput.value = "";
        taskDescriptionInput.value = "";

        await displayTasks();

        alert("Tâche ajoutée avec succès !");

    } catch (error) {
        console.error("Erreur lors de l'ajout de la tâche :", error);
        alert("Échec de l'ajout : " + error.message);
    }
});


// ========================================
// INITIALISATION DE L'APPLICATION
// ========================================

async function initializeApplication() {
    try {
        await openDatabase();

        await displayProjects();

    } catch (error) {
        console.error("Erreur d'initialisation :", error);

        alert("Impossible de démarrer l'application. Vérifiez la base de données.");
    }
}

initializeApplication();
