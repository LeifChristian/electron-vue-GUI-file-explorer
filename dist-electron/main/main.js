"use strict";
var path = require("path");
var electron = require("electron");
require("path");
const { statSync } = require("fs");
const os = require("os");
const fs = require("fs");
const isMac = os.platform() === "darwin";
const isWindows = os.platform() === "win32";
const isLinux = os.platform() === "linux";
require("electron-reloader")(module);
let nonLinux = "\\";
let linux = "/";
let slash;
!isLinux ? slash = nonLinux : slash = linux;
console.log(
  "Operating system is:",
  isLinux ? "Linux" : isMac ? "Mac" : isWindows ? "Windows" : ""
);
const isDev = {}.npm_lifecycle_event === "vite" ? true : false;
async function createWindow() {
  const mainWindow = new electron.BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, "../preload/preload.js"),
      nodeIntegration: true,
      contextIsolation: false
    }
  });
  electron.ipcMain.on("getDrives", (a, b) => {
    console.log("message from frontend:", JSON.parse(b));
    const getDrives = async () => {
      let drives = [];
      const drivelist = require("drivelist");
      const theDrives = await drivelist.list();
      try {
        console.log(theDrives);
        theDrives.forEach((drive, index) => {
          console.log(drive.mountpoints[0], "b4");
          if (typeof (drive == null ? void 0 : drive.mountpoints[0]) !== "undefined") {
            drives.push(drive.mountpoints[0].path);
          }
        });
        console.log(drives);
        mainWindow.webContents.send("backEndMsg", drives);
      } catch (error) {
        console.log(error);
      }
    };
    getDrives();
  });
  electron.ipcMain.on("setDirectory", (theEvent, initialDirectory) => {
    var _a;
    const homeDir = require("os").homedir();
    let desktopDir = "";
    let dirContentsArray = [];
    let dirContents;
    console.log("initialDirectory: ", initialDirectory);
    try {
      if (initialDirectory.length > 0) {
        dirContents = fs == null ? void 0 : fs.readdirSync(initialDirectory);
      } else {
        dirContents = fs.readdirSync("C:\\");
        initialDirectory = "C:\\";
      }
      console.log(dirContents, "contents");
    } catch (error) {
    }
    if (!isLinux) {
      desktopDir = `${homeDir}\\Desktop`;
      console.log("desktop directory: ", desktopDir);
    }
    for (let theFile in dirContents) {
      try {
        let isDir;
        let theString;
        console.log(
          initialDirectory + slash + dirContents[theFile],
          "concat check"
        );
        if ((_a = statSync(
          initialDirectory + slash + dirContents[theFile]
        )) == null ? void 0 : _a.isDirectory()) {
          console.log("its a directory");
          isDir = true;
        } else {
          isDir = false;
        }
        dirContentsArray.push({
          filename: dirContents[theFile],
          isDirectory: isDir
        });
      } catch (error) {
        console.log(error);
      }
    }
    mainWindow.webContents.send("receiveDirectoryContents", {
      currentDirectory: initialDirectory,
      currentDirectoryContents: dirContentsArray,
      desktop: desktopDir
    });
  });
  electron.ipcMain.on("upTheTree", (a, b) => {
    const up = b.split(slash);
    console.log(up.length, "directory string length");
    let newup;
    console.log(up.length);
    if (!isLinux && up.length >= 2) {
      newup = up.slice(0, up.length - 1).join(slash);
      console.log(newup, "--new directory");
      mainWindow.webContents.send("newDirectory", newup);
    }
    if (isLinux && up.length >= 3) {
      newup = up.slice(0, up.length - 1).join(slash);
      mainWindow.webContents.send("newDirectory", newup);
    } else
      return;
  });
  mainWindow == null ? void 0 : mainWindow.webContents.on("did-finish-load", () => {
    mainWindow == null ? void 0 : mainWindow.webContents.send(
      "main-process-message",
      new Date().toLocaleString()
    );
  });
  if (isDev) {
    mainWindow.loadURL("http://localhost:3000");
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, "../../index.html"));
  }
}
electron.app.whenReady().then(() => {
  createWindow();
  electron.app.on("activate", function() {
    if (electron.BrowserWindow.getAllWindows().length === 0)
      createWindow();
  });
});
electron.app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    electron.app.quit();
  }
});
