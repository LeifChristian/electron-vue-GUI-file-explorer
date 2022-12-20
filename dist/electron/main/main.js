"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = require("path");
const electron_1 = require("electron");
const original_fs_1 = require("original-fs");
const path = require("path");
const { statSync } = require("fs");
const os = require("os");
const fs = require("fs");
const nodeDiskInfo = require("node-disk-info");
const isMac = os.platform() === "darwin";
const isWindows = os.platform() === "win32";
const isLinux = os.platform() === "linux";
let nonLinux = "\\";
let linux = "/";
let slash;
const { dialog } = require('electron');
//path string concatenation check for linux systems
!isLinux ? (slash = nonLinux) : (slash = linux);
//log the os to the backend
// console.log(
//   "Operating system is:",
//   isLinux ? "Linux" : isMac ? "Mac" : isWindows ? "Windows" : ""
// );
const isDev = process.env.npm_lifecycle_event === "app:dev" ? true : false;
let win;
console.log("main.ts loaded");
async function createWindow() {
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
    let projectFolderArray = [];
    electron_1.ipcMain.on('transfer', (a, b, c) => {
        console.log(b, '<-- the file to be transferred', c, " <-- the project/folder name");
        mainWindow.webContents.send('ok', b, c);
        console.log(process.cwd());
    });
    console.log(process.cwd(), ' <-- current directory');
    const getProjects = (b) => {
        //does projectFolder exist?
        if (!fs.existsSync("projectsFolder")) {
            //if not, create it
            fs.mkdirSync("projectsFolder");
        }
        //if it does exist
        if (fs.existsSync('projectsFolder')) {
            //if a parameter was passed to getProjects, and the folder for that parameter doesn't exist
            if (b && !(0, original_fs_1.existsSync)(`projectsFolder/${b}`)) 
            //create it
            {
                fs.mkdirSync(`projectsFolder/${b}`);
            }
            //if not,notify user that there is a duplicate 
            else {
                mainWindow.webContents.send('duplicateWarning');
            }
            //read contents of projectsFolder
            let theContents = fs.readdirSync("projectsFolder");
            let menuArray = [];
            //for each item in the contents
            theContents.forEach((item, b) => {
                console.log(item, b);
                //turn it into a menu item
                let innerObject = {
                    label: item,
                    click() {
                        console.log("hello from" + item + 'project');
                        mainWindow.webContents.send('navigateToProject', item);
                    }
                };
                console.log(innerObject);
                menuArray.push(innerObject);
            });
            projectFolderArray = menuArray;
            mainWindow.webContents.send('allProjects', JSON.stringify(menuArray));
        }
        let viewTab = [{
                label: 'View',
                submenu: [
                    {
                        role: 'reload'
                    },
                    {
                        role: 'toggledevtools'
                    },
                    {
                        type: 'separator'
                    },
                    {
                        role: 'resetzoom'
                    },
                    {
                        role: 'zoomin'
                    },
                    {
                        role: 'zoomout'
                    },
                    {
                        type: 'separator'
                    },
                    {
                        role: 'togglefullscreen'
                    }
                ]
            },];
        const topMenu = [
            {
                label: 'File',
                submenu: [
                    {
                        label: 'New Project',
                        click() {
                            console.log("hello from file menu");
                            mainWindow.webContents.send('createNewProject');
                        }
                    },
                    {
                        label: 'Import',
                        click() {
                            console.log("open file manager");
                            mainWindow.webContents.send('fileManager');
                        }
                    },
                    ...projectFolderArray,
                    {
                        label: 'Quit',
                        click() {
                            electron_1.app.quit();
                        }
                    }
                ]
            },
            ...viewTab
        ];
        const menu = electron_1.Menu.buildFromTemplate(topMenu);
        electron_1.Menu.setApplicationMenu(menu);
    };
    getProjects();
    electron_1.ipcMain.on('openFileManager', () => {
        console.log('mergerrrrrrr');
        dialog.showOpenDialog({ properties: ['openFile'] }).then((e) => {
            if (e?.filePaths[0]?.length) {
                console.log(e.filePaths[0]);
                mainWindow.webContents.send('fileManagerOpen', e.filePaths[0]);
            }
            else {
                console.log('no length, cancelled');
            }
        });
    });
    electron_1.ipcMain.on('makeProject', (a, b) => { getProjects(b); });
    mainWindow?.webContents.on("did-finish-load", () => {
        mainWindow?.webContents.send("main-process-message", new Date().toLocaleString());
    });
    // load the index.html of the app.
    if (isDev) {
        mainWindow.loadURL("http://localhost:3000"); // Open the DevTools.
        mainWindow.webContents.openDevTools();
    }
    else {
        mainWindow.loadFile((0, path_1.join)(__dirname, "../../index.html"));
    }
}
// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
electron_1.app.whenReady().then(() => {
    createWindow();
    electron_1.app.on("activate", function () {
        if (electron_1.BrowserWindow.getAllWindows().length === 0)
            createWindow();
    });
});
// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
electron_1.app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        electron_1.app.quit();
    }
});
//# sourceMappingURL=main.js.map