"use strict";
var path = require("path");
var electron = require("electron");
var originalFs = require("original-fs");
require("path");
require("fs");
const os = require("os");
const fs = require("fs");
os.platform() === "darwin";
os.platform() === "win32";
os.platform() === "linux";
const { dialog } = require("electron");
const isDev = {}.npm_lifecycle_event === "vite" ? true : false;
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
  electron.ipcMain.on("transfer", (a, b, c) => {
    console.log(b, "<-- the file to be transferred", c, " <-- the project/folder name");
    mainWindow.webContents.send("ok", b, c);
    console.log(process.cwd());
  });
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
    let viewTab = [{
      label: "View",
      submenu: [
        {
          role: "reload"
        },
        {
          role: "toggledevtools"
        }
      ]
    }];
    const topMenu = [
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
            label: "Import",
            click() {
              console.log("open file manager");
              mainWindow.webContents.send("fileManager");
            }
          },
          ...projectFolderArray,
          {
            label: "Quit",
            click() {
              electron.app.quit();
            }
          }
        ]
      },
      ...viewTab
    ];
    const menu = electron.Menu.buildFromTemplate(topMenu);
    electron.Menu.setApplicationMenu(menu);
  };
  getProjects();
  electron.ipcMain.on("openFileManager", () => {
    console.log("mergerrrrrrr");
    dialog.showOpenDialog({ properties: ["openFile"] }).then((e) => {
      var _a;
      if ((_a = e == null ? void 0 : e.filePaths[0]) == null ? void 0 : _a.length) {
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
