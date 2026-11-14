
import { Given, When, Then } from "@cucumber/cucumber";
import { expect } from "@playwright/test";

// ========================================
// CRÉATION DES PROJETS
// ========================================

Given(
    "les projets {string} et {string} sont créés",
    async function (sourceName, destinationName) {
        for (const projectName of [sourceName, destinationName]) {
            await this.page.locator("#project-name").fill(projectName);
            await this.page.locator("#project-form button[type='submit']").click();

            await expect(
                this.page.locator("#project-list li")
                    .filter({ hasText: projectName })
            ).toHaveCount(1);
        }
    }
);

// ========================================
// CRÉATION D'UNE TÂCHE
// ========================================

When(
    "je crée la tâche {string} dans le projet {string}",
    async function (taskTitle, projectName) {
        const projectItem = this.page
            .locator("#project-list li")
            .filter({ hasText: projectName });

        await expect(projectItem).toHaveCount(1);
        await projectItem.locator("span").click();

        await this.page.locator("#task-title").fill(taskTitle);
        await this.page.locator("#task-form button[type='submit']").click();

        await expect(
            this.page.locator("#task-list li")
                .filter({
                    has: this.page.locator("strong", {
                        hasText: taskTitle
                    })
                })
        ).toHaveCount(1);
    }
);

// ========================================
// DÉPLACEMENT D'UNE TÂCHE
// ========================================

When(
    "je déplace cette tâche vers {string}",
    async function (destinationName) {
        const taskTitle = "Tâche à déplacer";

        const taskItem = this.page
            .locator("#task-list li")
            .filter({
                has: this.page.locator("strong", {
                    hasText: taskTitle
                })
            });

        await expect(taskItem).toHaveCount(1);

        const moveSelect = taskItem.locator("select.move-task-select");

        await expect(moveSelect).toBeEnabled();

        await moveSelect.selectOption({
            label: destinationName
        });

        await expect(taskItem).toHaveCount(0);
    }
);

// ========================================
// VÉRIFICATION DANS LE PROJET SOURCE
// ========================================

Then(
    "la tâche {string} ne doit plus être présente dans le projet {string}",
    async function (taskTitle, sourceName) {
        const projectItem = this.page
            .locator("#project-list li")
            .filter({ hasText: sourceName });

        await expect(projectItem).toHaveCount(1);

        await projectItem.locator("span").click();

        const taskItem = this.page
            .locator("#task-list li")
            .filter({
                has: this.page.locator("strong", {
                    hasText: taskTitle
                })
            });

        await expect(taskItem).toHaveCount(0);
    }
);

// ========================================
// CONSULTATION DU PROJET DESTINATION
// ========================================

When(
    "je consulte le projet {string}",
    async function (projectName) {
        const projectItem = this.page
            .locator("#project-list li")
            .filter({ hasText: projectName });

        await expect(projectItem).toHaveCount(1);
        await projectItem.locator("span").click();
    }
);

// ========================================
// VÉRIFICATION DANS LE PROJET DESTINATION
// ========================================

Then(
    "la tâche {string} doit être présente dans le projet {string}",
    async function (taskTitle, projectName) {
        await expect(
            this.page.locator("#selected-project-name")
        ).toHaveText(projectName);

        const taskItem = this.page
            .locator("#task-list li")
            .filter({
                has: this.page.locator("strong", {
                    hasText: taskTitle
                })
            });

        await expect(taskItem).toHaveCount(1);
    }
);
