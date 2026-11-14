
import {
    BeforeAll,
    AfterAll,
    Before,
    After
} from "@cucumber/cucumber";

import { chromium } from "@playwright/test";

import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const projectRoot = path.resolve(__dirname, "../..");
const srcDirectory = path.join(projectRoot, "src");

const PORT = 4173;
const BASE_URL = `http://127.0.0.1:${PORT}`;

let server;
let browser;


// ========================================
// TYPES DE CONTENU
// ========================================

function getContentType(filePath) {
    const extension = path.extname(filePath).toLowerCase();

    const types = {
        ".html": "text/html; charset=utf-8",
        ".js": "application/javascript; charset=utf-8",
        ".css": "text/css; charset=utf-8",
        ".json": "application/json; charset=utf-8",
        ".png": "image/png",
        ".jpg": "image/jpeg",
        ".jpeg": "image/jpeg",
        ".svg": "image/svg+xml"
    };

    return types[extension] || "application/octet-stream";
}


// ========================================
// SERVEUR HTTP LOCAL
// ========================================

function startServer() {
    return new Promise((resolve, reject) => {
        server = http.createServer((request, response) => {

            const requestPath = decodeURIComponent(
                new URL(request.url, BASE_URL).pathname
            );

            // Page vide sur la même origine que l'application.
            // Elle permet de supprimer IndexedDB avant
            // le chargement des scripts de l'application.
            if (requestPath === "/__bdd_empty") {
                response.writeHead(200, {
                    "Content-Type": "text/html; charset=utf-8"
                });

                response.end(`
                    <!DOCTYPE html>
                    <html lang="fr">
                    <head>
                        <meta charset="UTF-8">
                        <title>Préparation des tests BDD</title>
                    </head>
                    <body></body>
                    </html>
                `);

                return;
            }

            let fileRequestPath = requestPath;

            if (fileRequestPath === "/") {
                fileRequestPath = "/index.html";
            }

            const filePath = path.resolve(
                srcDirectory,
                `.${fileRequestPath}`
            );

            if (
                filePath !== srcDirectory &&
                !filePath.startsWith(srcDirectory + path.sep)
            ) {
                response.writeHead(403);
                response.end("Forbidden");
                return;
            }

            fs.readFile(filePath, (error, data) => {
                if (error) {
                    response.writeHead(404);
                    response.end("Not found");
                    return;
                }

                response.writeHead(200, {
                    "Content-Type": getContentType(filePath)
                });

                response.end(data);
            });
        });

        server.once("error", reject);

        server.listen(PORT, "127.0.0.1", () => {
            resolve();
        });
    });
}


// ========================================
// ARRÊT DU SERVEUR
// ========================================

function stopServer() {
    return new Promise((resolve, reject) => {
        if (!server) {
            resolve();
            return;
        }

        server.close(error => {
            if (error) {
                reject(error);
                return;
            }

            resolve();
        });
    });
}


// ========================================
// INITIALISATION GLOBALE
// ========================================

BeforeAll(async function () {
    await startServer();

    browser = await chromium.launch({
        headless: true
    });
});


// ========================================
// PRÉPARATION DE CHAQUE SCÉNARIO
// ========================================

Before(async function () {
    // Nouveau contexte isolé pour chaque scénario.
    this.context = await browser.newContext({
        locale: "fr-FR",
        timezoneId: "Africa/Douala"
    });

    this.page = await this.context.newPage();

    // On ouvre une page vide, sans charger l'application.
    await this.page.goto(`${BASE_URL}/__bdd_empty`);

    // On supprime la base avant toute ouverture par l'application.
    await this.page.evaluate(() => {
        return new Promise((resolve, reject) => {
            const request = indexedDB.deleteDatabase("TodoDB");

            request.onsuccess = () => {
                resolve();
            };

            request.onerror = () => {
                reject(
                    request.error ||
                    new Error("Impossible de supprimer la base IndexedDB.")
                );
            };

            request.onblocked = () => {
                reject(
                    new Error(
                        "La suppression de TodoDB est bloquée par une connexion ouverte."
                    )
                );
            };
        });
    });

    // L'application est maintenant chargée avec une base vierge.
    await this.page.goto(BASE_URL);

    await this.page.locator("#projects-section").waitFor();
});


// ========================================
// NETTOYAGE APRÈS CHAQUE SCÉNARIO
// ========================================

After(async function () {
    if (this.page) {
        await this.page.close();
    }

    if (this.context) {
        await this.context.close();
    }
});


// ========================================
// FERMETURE GLOBALE
// ========================================

AfterAll(async function () {
    if (browser) {
        await browser.close();
    }

    await stopServer();
});
