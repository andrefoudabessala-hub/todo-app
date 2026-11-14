import {
    Given,
    When,
    Then
} from "@cucumber/cucumber";

import { expect } from "@playwright/test";

const PROJECT_LIST = "#project-list";
const PROJECT_FORM = "#project-form";
const PROJECT_NAME_INPUT = "#project-name";


// ========================================
// ACCÈS À LA PAGE
// ========================================

Given(
    "je suis sur la page de gestion des projets",
    async function () {
        await expect(
            this.page.locator("#projects-section")
        ).toBeVisible();

        await expect(
            this.page.locator(PROJECT_NAME_INPUT)
        ).toBeVisible();
    }
);


// ========================================
// AJOUT D'UN PROJET
// ========================================

When(
    "je saisis le nom {string}",
    async function (projectName) {
        await this.page
            .locator(PROJECT_NAME_INPUT)
            .fill(projectName);
    }
);


When(
    "je valide l'ajout du projet",
    async function () {
        await this.page
            .locator(PROJECT_FORM)
            .locator('button[type="submit"]')
            .click();

        await expect(
            this.page.locator(PROJECT_LIST)
        ).toContainText("Projet INF563");
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
        await this.page
            .locator(PROJECT_NAME_INPUT)
            .fill(projectName);

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
// MODIFICATION
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
            .getByRole("button", {
                name: "Modifier"
            })
            .click();

        await expect(
            this.page.locator(`${PROJECT_LIST} li`)
        ).toContainText(newName);
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
// SUPPRESSION
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
            .getByRole("button", {
                name: "Supprimer"
            })
            .click();

        await expect(
            this.page.locator(`${PROJECT_LIST} li`)
        ).toHaveCount(0);
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