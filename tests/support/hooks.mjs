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
import { lookup } from "node:dns/promises";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const projectRoot = path.resolve(__dirname, "../..");
const srcDirectory = path.join(projectRoot, "src");

const PORT = 4173;
const BASE_URL = `http://127.0.0.1:${PORT}`;

let server;
let browser;

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

function startServer() {
    return new Promise((resolve, reject) => {
        server = http.createServer((request, response) => {
            let requestPath = decodeURIComponent(
                new URL(request.url, BASE_URL).pathname
            );

            if (requestPath === "/") {
                requestPath = "/index.html";
            }

            const filePath = path.normalize(
                path.join(srcDirectory, requestPath)
            );

            if (!filePath.startsWith(srcDirectory)) {
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

BeforeAll(async function () {
    await startServer();

    browser = await chromium.launch({
        headless: true
    });
});

Before(async function () {
    this.context = await browser.newContext({
        locale: "fr-FR",
        timezoneId: "Africa/Douala"
    });

    this.page = await this.context.newPage();

    // Chaque scénario commence avec une base IndexedDB vide.
    await this.page.goto(BASE_URL);

    await this.page.evaluate(() => {
        return new Promise((resolve, reject) => {
            const request = indexedDB.deleteDatabase("TodoDB");

            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
            request.onblocked = () => resolve();
        });
    });

    // Rechargement après suppression de la base.
    await this.page.reload();

    await this.page.locator("#projects-section").waitFor();
});

After(async function () {
    if (this.page) {
        await this.page.close();
    }

    if (this.context) {
        await this.context.close();
    }
});

AfterAll(async function () {
    if (browser) {
        await browser.close();
    }

    await stopServer();
});