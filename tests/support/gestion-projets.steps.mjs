
import {
    Given,
    When,
    Then
} from "@cucumber/cucumber";

import { expect } from "@playwright/test";

const PROJECT_LIST = "#project-list";
const PROJECT_FORM = "#project-form";
const PROJECT_NAME_INPUT = "#project-name";

const TASK_LIST = "#task-list";
const TASK_FORM = "#task-form";
const TASK_TITLE_INPUT = "#task-title";


// ========================================
// ACCÈS À LA PAGE
// ========================================

Given(
    "je suis sur la page de gestion des projets",
    async function () {
        await expect(this.page.locator("#projects-section")).toBeVisible();
        await expect(this.page.locator(PROJECT_NAME_INPUT)).toBeVisible();
    }
);


// ========================================
// AJOUT D'UN PROJET
// ========================================

When(
    "je saisis le nom {string}",
    async function (projectName) {
        await this.page.locator(PROJECT_NAME_INPUT).fill(projectName);
    }
);


When(
    "je valide l'ajout du projet",
    async function () {
        await this.page
            .locator(PROJECT_FORM)
            .locator('button[type="submit"]')
            .click();

        await expect(this.page.locator(PROJECT_LIST))
            .toContainText("Projet INF563");
    }
);


Then(
    "le projet {string} doit apparaître dans la liste",
    async function (projectName) {
        const projectItem = this.page
            .locator(`${PROJECT_LIST} li`)
            .filter({
                has: this.page.locator("span", {
                    hasText: projectName
                })
            });

        await expect(projectItem).toHaveCount(1);
        await expect(projectItem).toContainText(projectName);
    }
);


// ========================================
// PRÉPARATION D'UN PROJET EXISTANT
// ========================================

Given(
    "un projet nommé {string} existe",
    async function (projectName) {
        await this.page.locator(PROJECT_NAME_INPUT).fill(projectName);

        await this.page
            .locator(PROJECT_FORM)
            .locator('button[type="submit"]')
            .click();

        const projectItem = this.page
            .locator(`${PROJECT_LIST} li`)
            .filter({
                has: this.page.locator("span", {
                    hasText: projectName
                })
            });

        await expect(projectItem).toHaveCount(1);
    }
);


// ========================================
// MODIFICATION D'UN PROJET
// ========================================

When(
    "je modifie son nom en {string}",
    async function (newName) {
        const projectItem = this.page
            .locator(`${PROJECT_LIST} li`)
            .filter({
                has: this.page.locator("span", {
                    hasText: "Projet INF563"
                })
            });

        await expect(projectItem).toHaveCount(1);

        this.page.once("dialog", async dialog => {
            expect(dialog.type()).toBe("prompt");
            await dialog.accept(newName);
        });

        await projectItem
            .getByRole("button", { name: "Modifier" })
            .click();

        await expect(this.page.locator(`${PROJECT_LIST} li`))
            .toContainText(newName);
    }
);


Then(
    "le projet doit porter le nom {string}",
    async function (projectName) {
        const projectItem = this.page
            .locator(`${PROJECT_LIST} li`)
            .filter({
                has: this.page.locator("span", {
                    hasText: projectName
                })
            });

        await expect(projectItem).toHaveCount(1);
        await expect(projectItem).toContainText(projectName);
    }
);


// ========================================
// SUPPRESSION D'UN PROJET
// ========================================

When(
    "je demande sa suppression",
    async function () {
        const projectItem = this.page
            .locator(`${PROJECT_LIST} li`)
            .filter({
                has: this.page.locator("span", {
                    hasText: "Projet INF563"
                })
            });

        await expect(projectItem).toHaveCount(1);

        this.projectToDelete = projectItem;
    }
);


When(
    "je confirme la suppression",
    async function () {
        const projectItem = this.projectToDelete;

        await expect(projectItem).toHaveCount(1);

        this.page.once("dialog", async dialog => {
            expect(dialog.type()).toBe("confirm");
            await dialog.accept();
        });

        await projectItem
            .getByRole("button", { name: "Supprimer" })
            .click();

        await expect(this.page.locator(`${PROJECT_LIST} li`))
            .toHaveCount(0);
    }
);


Then(
    "le projet ne doit plus apparaître dans la liste",
    async function () {
        const projectItem = this.page
            .locator(`${PROJECT_LIST} li`)
            .filter({
                has: this.page.locator("span", {
                    hasText: "Projet INF563"
                })
            });

        await expect(projectItem).toHaveCount(0);
    }
);


// ========================================
// PERSISTANCE DES PROJETS
// ========================================

When(
    "je recharge la page",
    async function () {
        await this.page.reload();

        await expect(this.page.locator("#projects-section"))
            .toBeVisible();
    }
);


Then(
    "le projet {string} doit toujours apparaître dans la liste",
    async function (projectName) {
        const projectItem = this.page
            .locator(`${PROJECT_LIST} li`)
            .filter({
                has: this.page.locator("span", {
                    hasText: projectName
                })
            });

        await expect(projectItem).toHaveCount(1);
    }
);


// ========================================
// SÉLECTION D'UN PROJET
// ========================================

When(
    "je sélectionne le projet {string}",
    async function (projectName) {
        const projectNameElement = this.page.getByText(
            projectName,
            { exact: true }
        );

        await expect(projectNameElement).toBeVisible();
        await projectNameElement.click();

        await expect(this.page.locator("#task-content")).toBeVisible();

        await expect(this.page.locator("#selected-project-name"))
            .toHaveText(projectName);
    }
);


// ========================================
// CRÉATION D'UNE TÂCHE
// ========================================

When(
    "je crée une tâche intitulée {string}",
    async function (taskTitle) {
        await expect(this.page.locator(TASK_FORM)).toBeVisible();

        await this.page.locator(TASK_TITLE_INPUT).fill(taskTitle);

        await this.page
            .locator(TASK_FORM)
            .locator('button[type="submit"]')
            .click();

        await expect(this.page.locator(TASK_LIST))
            .toContainText(taskTitle);
    }
);


// ========================================
// MODIFICATION D'UNE TÂCHE
// ========================================

When(
    "je modifie la tâche {string} avec le titre {string} et la description {string}",
    async function (oldTitle, newTitle, newDescription) {
        const taskItem = this.page
            .locator(`${TASK_LIST} li`)
            .filter({
                has: this.page.locator("strong", {
                    hasText: oldTitle
                })
            });

        await expect(taskItem).toHaveCount(1);

        const dialogHandler = async dialog => {

            if (dialog.type() === "alert") {
                await dialog.accept();
                return;
            }

            if (
                dialog.type() === "prompt" &&
                dialog.message() === "Nouveau titre :"
            ) {
                await dialog.accept(newTitle);
                return;
            }

            if (
                dialog.type() === "prompt" &&
                dialog.message() === "Nouvelle description :"
            ) {
                await dialog.accept(newDescription);
                return;
            }

            await dialog.dismiss();

            throw new Error(
                `Dialogue inattendu : ${dialog.type()} - ${dialog.message()}`
            );
        };

        this.page.on("dialog", dialogHandler);

        try {
            await taskItem
                .getByRole("button", { name: "Modifier" })
                .click();

            const updatedTask = this.page
                .locator(`${TASK_LIST} li`)
                .filter({
                    has: this.page.locator("strong", {
                        hasText: newTitle
                    })
                });

            await expect(updatedTask).toHaveCount(1);

            await expect(updatedTask.locator("strong"))
                .toHaveText(newTitle);

            await expect(updatedTask.locator("p"))
                .toHaveText(newDescription);

        } finally {
            this.page.off("dialog", dialogHandler);
        }
    }
);


Then(
    "la tâche {string} doit afficher le titre {string} et la description {string}",
    async function (oldTitle, newTitle, newDescription) {
        const taskItem = this.page
            .locator(`${TASK_LIST} li`)
            .filter({
                has: this.page.locator("strong", {
                    hasText: newTitle
                })
            });

        await expect(taskItem).toHaveCount(1);

        await expect(taskItem.locator("strong"))
            .toHaveText(newTitle);

        await expect(taskItem.locator("p"))
            .toHaveText(newDescription);

        const oldTask = this.page
            .locator(`${TASK_LIST} li`)
            .filter({
                has: this.page.locator("strong", {
                    hasText: oldTitle
                })
            });

        await expect(oldTask).toHaveCount(0);
    }
);


// ========================================
// VALIDATION D'UNE TÂCHE
// ========================================

When(
    "je marque la tâche {string} comme terminée",
    async function (taskTitle) {
        const taskItem = this.page
            .locator(`${TASK_LIST} li`)
            .filter({
                has: this.page.locator("strong", {
                    hasText: taskTitle
                })
            });

        await expect(taskItem).toHaveCount(1);

        const checkbox = taskItem.locator('input[type="checkbox"]');

        await expect(checkbox).toBeVisible();
        await checkbox.check();
        await expect(checkbox).toBeChecked();
    }
);


Then(
    "la tâche {string} doit être marquée comme terminée",
    async function (taskTitle) {
        const taskItem = this.page
            .locator(`${TASK_LIST} li`)
            .filter({
                has: this.page.locator("strong", {
                    hasText: taskTitle
                })
            });

        await expect(taskItem).toHaveCount(1);

        const checkbox = taskItem.locator('input[type="checkbox"]');

        await expect(checkbox).toBeChecked();
    }
);


// ========================================
// PERSISTANCE DES TÂCHES
// ========================================

Then(
    "la tâche {string} doit toujours apparaître dans la liste",
    async function (taskTitle) {
        const taskItem = this.page
            .locator(`${TASK_LIST} li`)
            .filter({
                has: this.page.locator("strong", {
                    hasText: taskTitle
                })
            });

        await expect(taskItem).toHaveCount(1);
        await expect(taskItem).toContainText(taskTitle);
    }
);
