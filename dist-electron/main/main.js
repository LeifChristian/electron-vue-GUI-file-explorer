"use strict";
const path$1 = require("path");
const electron = require("electron");
const { shell } = require("electron");
const path = require("path");
const { statSync } = require("fs");
const os = require("os");
const fs = require("fs");
const nodeDiskInfo = require("node-disk-info");
const isMac = process.platform === "darwin";
process.platform === "win32";
const isLinux = process.platform === "linux";
const slash = isLinux ? "/" : "\\";
const VITE_DEV_SERVER_URL = process.env.VITE_DEV_SERVER_URL;
console.log("main.ts loaded");
function createWindow() {
  const mainWindow = new electron.BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path$1.join(__dirname, "../preload/preload.js"),
      nodeIntegration: true,
      contextIsolation: false
    }
  });
  if (VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(VITE_DEV_SERVER_URL);
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path$1.join(__dirname, "../../index.html"));
  }
  electron.ipcMain.on("transfer", (a, b) => {
    console.log(b);
    mainWindow.webContents.send("ok");
  });
  electron.ipcMain.on("getDrives", async () => {
    try {
      const disks = await nodeDiskInfo.getDiskInfo();
      const drivesArray = Object.values(disks).map(
        (drive) => `${drive._mounted}${slash}`
      );
      console.log(drivesArray, "drives");
      mainWindow.webContents.send("backEndMsg", drivesArray);
    } catch (error) {
      console.error(error);
      mainWindow.webContents.send("backEndMsg", []);
    }
  });
  electron.ipcMain.on("open", (event, filename) => {
    console.log(filename, "PAFF!!!!");
    shell.openPath(filename);
  });
  electron.ipcMain.on("setDirectory", (theEvent, initialDirectory) => {
    mainWindow.webContents.send("ok", "setDirectory route success");
    const homeDir = os.homedir();
    const desktopDir = !isLinux ? `${homeDir}\\Desktop` : "";
    let dirContents;
    let dirContentsArray = [];
    try {
      if (initialDirectory.length > 0) {
        dirContents = fs.readdirSync(initialDirectory);
      } else {
        dirContents = fs.readdirSync("C:\\");
        initialDirectory = "C:\\";
      }
      dirContentsArray = dirContents.reduce((acc, file) => {
        try {
          const fullPath = path.join(initialDirectory, file);
          const isDir = statSync(fullPath).isDirectory();
          acc.push({ filename: file, isDirectory: isDir });
        } catch (error) {
          console.log(error);
        }
        return acc;
      }, []);
      mainWindow.webContents.send("receiveDirectoryContents", {
        currentDirectory: initialDirectory,
        currentDirectoryContents: dirContentsArray,
        desktop: desktopDir
      });
    } catch (error) {
      console.error(error);
      mainWindow.webContents.send("receiveDirectoryContents", {
        currentDirectory: initialDirectory,
        currentDirectoryContents: [],
        desktop: desktopDir
      });
    }
  });
  electron.ipcMain.on("upTheTree", (a, b) => {
    const pathParts = b.split(slash);
    if (!isLinux && pathParts.length >= 2 || isLinux && pathParts.length >= 3) {
      const newPath = pathParts.slice(0, -1).join(slash);
      mainWindow.webContents.send("newDirectory", newPath);
    }
  });
  mainWindow.webContents.on("did-finish-load", () => {
    mainWindow.webContents.send(
      "main-process-message",
      (/* @__PURE__ */ new Date()).toLocaleString()
    );
  });
}
electron.app.whenReady().then(() => {
  createWindow();
  electron.app.on("activate", () => {
    if (electron.BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});
electron.app.on("window-all-closed", () => {
  if (!isMac) {
    electron.app.quit();
  }
});
if (require("electron-squirrel-startup")) {
  electron.app.quit();
}
