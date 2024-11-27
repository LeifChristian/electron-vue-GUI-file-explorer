"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = require("path");
const electron_1 = require("electron");
const { shell } = require('electron');
const path = require("path");
const { statSync } = require("fs");
const os = require("os");
const fs = require("fs");
const nodeDiskInfo = require("node-disk-info");
// Platform detection
const isMac = process.platform === "darwin";
const isWindows = process.platform === "win32";
const isLinux = process.platform === "linux";
const slash = isLinux ? "/" : "\\";
// Environment detection
const VITE_DEV_SERVER_URL = process.env.VITE_DEV_SERVER_URL;
console.log("main.ts loaded");
function createWindow() {
    // Create the browser window.
    const mainWindow = new electron_1.BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: (0, path_1.join)(__dirname, "../preload/preload.js"),
            nodeIntegration: true,
            contextIsolation: false,
        },
    });
    // Load the appropriate URL
    if (VITE_DEV_SERVER_URL) {
        mainWindow.loadURL(VITE_DEV_SERVER_URL);
        mainWindow.webContents.openDevTools();
    }
    else {
        mainWindow.loadFile((0, path_1.join)(__dirname, "../../index.html"));
    }
    // IPC handlers
    electron_1.ipcMain.on("transfer", (a, b) => {
        console.log(b);
        mainWindow.webContents.send("ok");
    });
    electron_1.ipcMain.on("getDrives", async () => {
        try {
            const disks = await nodeDiskInfo.getDiskInfo();
            const drivesArray = Object.values(disks).map((drive) => `${drive._mounted}${slash}`);
            console.log(drivesArray, "drives");
            mainWindow.webContents.send("backEndMsg", drivesArray);
        }
        catch (error) {
            console.error(error);
            mainWindow.webContents.send("backEndMsg", []); // Send empty array on error
        }
    });
    electron_1.ipcMain.on('open', (event, filename) => {
        console.log(filename, "PAFF!!!!");
        shell.openPath(filename);
    });
    electron_1.ipcMain.on("setDirectory", (theEvent, initialDirectory) => {
        mainWindow.webContents.send("ok", "setDirectory route success");
        const homeDir = os.homedir();
        const desktopDir = !isLinux ? `${homeDir}\\Desktop` : "";
        let dirContents;
        let dirContentsArray = [];
        try {
            if (initialDirectory.length > 0) {
                dirContents = fs.readdirSync(initialDirectory);
            }
            else {
                dirContents = fs.readdirSync("C:\\");
                initialDirectory = "C:\\";
            }
            dirContentsArray = dirContents.reduce((acc, file) => {
                try {
                    const fullPath = path.join(initialDirectory, file);
                    const isDir = statSync(fullPath).isDirectory();
                    acc.push({ filename: file, isDirectory: isDir });
                }
                catch (error) {
                    console.log(error);
                }
                return acc;
            }, []);
            mainWindow.webContents.send("receiveDirectoryContents", {
                currentDirectory: initialDirectory,
                currentDirectoryContents: dirContentsArray,
                desktop: desktopDir,
            });
        }
        catch (error) {
            console.error(error);
            mainWindow.webContents.send("receiveDirectoryContents", {
                currentDirectory: initialDirectory,
                currentDirectoryContents: [],
                desktop: desktopDir,
            });
        }
    });
    electron_1.ipcMain.on("upTheTree", (a, b) => {
        const pathParts = b.split(slash);
        if ((!isLinux && pathParts.length >= 2) || (isLinux && pathParts.length >= 3)) {
            const newPath = pathParts.slice(0, -1).join(slash);
            mainWindow.webContents.send("newDirectory", newPath);
        }
    });
    mainWindow.webContents.on("did-finish-load", () => {
        mainWindow.webContents.send("main-process-message", new Date().toLocaleString());
    });
}
// App lifecycle handlers
electron_1.app.whenReady().then(() => {
    createWindow();
    electron_1.app.on("activate", () => {
        if (electron_1.BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});
electron_1.app.on("window-all-closed", () => {
    if (!isMac) {
        electron_1.app.quit();
    }
});
// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
    electron_1.app.quit();
}
//# sourceMappingURL=main.js.map