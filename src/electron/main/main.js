"use strict";
var path = require("path");
var electron = require("electron");
var originalFs = require("original-fs");
require("path");
const { statSync } = require("fs");
const os = require("os");
const fs = require("fs");
const nodeDiskInfo = require("node-disk-info");
os.platform() === "darwin";
os.platform() === "win32";
const isLinux = os.platform() === "linux";
let nonLinux = "\\";
let linux = "/";
let slash;
const { dialog } = require("electron");
!isLinux ? slash = nonLinux : slash = linux;
const isDev = {}.npm_lifecycle_event === "app:dev" ? true : false;
console.log("main.ts loaded");
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
  let projectFolderArray = [];
  console.log(process.cwd(), " <-- current directory");
  const getProjects = (b) => {
    if (!fs.existsSync("projectsFolder")) {
      fs.mkdirSync("projectsFolder");
    }
    if (fs.existsSync(
      "projectsFolder"
    )) {
      if (b && !originalFs.existsSync(`projectsFolder/${b}`)) {
        fs.mkdirSync(`projectsFolder/${b}`);
      } else {
        mainWindow.webContents.send("duplicateWarning");
      }
      let theContents = fs.readdirSync("projectsFolder");
      let menuArray = [];
      theContents.forEach((item, b2) => {
        console.log(item, b2);
        let innerObject = {
          label: item,
          click() {
            console.log("hello from" + item + "project");
            mainWindow.webContents.send("navigateToProject", item);
          }
        };
        console.log(innerObject);
        menuArray.push(innerObject);
      });
      projectFolderArray = menuArray;
      mainWindow.webContents.send("allProjects", JSON.stringify(menuArray));
    }
    const template = [
      {
        label: "File",
        submenu: [
          {
            label: "New Project",
            click() {
              console.log("hello from file menu");
              mainWindow.webContents.send("createNewProject");
            }
          },
          {
            label: "Open",
            click() {
              console.log("open file manager");
              mainWindow.webContents.send("fileManager");
            }
          },
          ...projectFolderArray
        ]
      }
    ];
    const menu = electron.Menu.buildFromTemplate(template);
    electron.Menu.setApplicationMenu(menu);
  };
  getProjects();
  electron.ipcMain.on("openFileManager", () => {
    console.log("mergerrrrrrr");
    dialog.showOpenDialog({ properties: ["openFile"] }).then((e) => {
      if (e.filePaths[0].length) {
        console.log(e.filePaths[0]);
        mainWindow.webContents.send("fileManagerOpen", e.filePaths[0]);
      } else {
        console.log("no length, cancelled");
      }
    });
  });
  electron.ipcMain.on("makeProject", (a, b) => {
    getProjects(b);
  });
  electron.ipcMain.on("getDrives", (a, b) => {
    const getDrives = async () => {
      nodeDiskInfo.getDiskInfo().then((disks) => {
        console.log("ASYNC results", disks);
        console.log(typeof disks);
        let arrayFrom = Object.values(disks);
        let drivesArray = [];
        arrayFrom.forEach((theDrive) => {
          drivesArray.push((theDrive == null ? void 0 : theDrive._mounted) + slash);
        });
        console.log(drivesArray, "drives");
        mainWindow.webContents.send("backEndMsg", drivesArray);
      }).catch((reason) => {
        console.error(reason);
      });
    };
    getDrives();
  });
  electron.ipcMain.on("setDirectory", (theEvent, initialDirectory) => {
    var _a;
    mainWindow.webContents.send("ok", "setDirectory route success");
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
        if ((_a = statSync(
          initialDirectory + slash + dirContents[theFile]
        )) == null ? void 0 : _a.isDirectory()) {
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
