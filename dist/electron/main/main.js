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
const isMac = os.platform() === "darwin";
const isWindows = os.platform() === "win32";
const isLinux = os.platform() === "linux";
let nonLinux = "\\";
let linux = "/";
let slash;
//path string concatenation check for linux systems
!isLinux ? (slash = nonLinux) : (slash = linux);
//log the os to the backend
// console.log(
//   "Operating system is:",
//   isLinux ? "Linux" : isMac ? "Mac" : isWindows ? "Windows" : ""
// );
const isDev = process.env.npm_lifecycle_event === "vite" ? true : false;
// const isDev = true;
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
    electron_1.ipcMain.on("transfer", (a, b) => {
        console.log(b);
        mainWindow.webContents.send("ok");
    });
    electron_1.ipcMain.on("getDrives", (a, b) => {
        // const getDrives = async () => {
        //   let drives: any = [];
        //   const drivelist = require("drivelist");
        //   const theDrives = await drivelist.list();
        //   try {
        //     console.log(theDrives);
        //     theDrives.forEach((drive: any, index: number) => {
        //       console.log(drive.mountpoints[0], "b4");
        //       if (typeof drive?.mountpoints[0] !== "undefined") {
        //         drives.push(drive.mountpoints[0].path);
        //       }
        //     });
        //     console.log(drives);
        //     //send drive information to frontend
        //     mainWindow.webContents.send("backEndMsg", drives);
        //   } catch (error) {
        //     console.log(error);
        //   }
        // };
        const getDrives = async () => {
            // let drives = [];
            // const drivelist = require("drivelist");
            // const theDrives = await drivelist.list();
            // console.log(theDrives);
            // theDrives.forEach((drive, index) => {
            //     console.log("mountpoints: ", drive.mountpoints[0]);
            //     if (typeof drive?.mountpoints[0] !== "undefined") {
            //         drives.push(drive.mountpoints[0].path);
            //     }
            // });
            // console.log('available drives: ', drives);
            // //send drive information to frontend
            // mainWindow.webContents.send("backEndMsg", drives);
            nodeDiskInfo
                .getDiskInfo()
                .then((disks) => {
                console.log("ASYNC results", disks);
                console.log(typeof disks);
                let arrayFrom = Object.values(disks);
                let drivesArray = [];
                arrayFrom.forEach((theDrive) => {
                    drivesArray.push(theDrive?._mounted + slash);
                });
                // console.log(arrayFrom[0]?._mounted + slash)
                console.log(drivesArray, "drives");
                mainWindow.webContents.send("backEndMsg", drivesArray);
            })
                .catch((reason) => {
                console.error(reason);
            });
        };
        // run the getDrives function
        getDrives();
    });
    electron_1.ipcMain.on('open', (event, filename) => {
        // construct the absolute path to the file
        const filePath = path.join(__dirname, filename);
        // console.log(filePath, 'PAFF!!!')
        console.log(filename, "PAFF!!!!");
        // use the shell module to open the file with the associated program
        shell.openPath(filename);
    });
    //set directory route from frontend
    electron_1.ipcMain.on("setDirectory", (theEvent, initialDirectory) => {
        mainWindow.webContents.send("ok", "setDirectory route success");
        const homeDir = require("os").homedir();
        let desktopDir = "";
        let dirContentsArray = [];
        let dirContents;
        console.log("initialDirectory: ", initialDirectory);
        //if a directory is passed from frontend, read that directory
        try {
            if (initialDirectory.length > 0) {
                dirContents = fs?.readdirSync(initialDirectory);
            }
            else {
                dirContents = fs.readdirSync("C:\\");
                initialDirectory = "C:\\";
            }
            console.log(dirContents, "contents");
        }
        catch (error) { }
        //else we know that it must be root directory
        //get the home directory
        //if not linux (desktop should be available on win and mac)
        // assign desktop directory
        if (!isLinux) {
            desktopDir = `${homeDir}\\Desktop`;
            console.log("desktop directory: ", desktopDir);
        }
        for (let theFile in dirContents) {
            try {
                let isDir;
                let theString;
                console.log(initialDirectory + slash + dirContents[theFile], "concat check");
                if (statSync(initialDirectory + slash + dirContents[theFile])?.isDirectory()) {
                    console.log("its a directory");
                    isDir = true;
                }
                else {
                    isDir = false;
                }
                dirContentsArray.push({
                    filename: dirContents[theFile],
                    isDirectory: isDir,
                });
            }
            catch (error) {
                console.log(error);
            }
        }
        //send directory contents of new directory to frontend
        mainWindow.webContents.send("receiveDirectoryContents", {
            currentDirectory: initialDirectory,
            currentDirectoryContents: dirContentsArray,
            desktop: desktopDir,
        });
    });
    //navigate up the directory tree route from frontend
    electron_1.ipcMain.on("upTheTree", (a, b) => {
        // console.log(isLinux, isMac, isWindows,)
        // console.log(slash)
        const up = b.split(slash);
        //split the string by slash variable
        console.log(up.length, "directory string length");
        let newup;
        console.log(up.length);
        //fixed length of string variable by system type.
        //send newDirectory to frontend
        if (!isLinux && up.length >= 2) {
            newup = up.slice(0, up.length - 1).join(slash);
            console.log(newup, "--new directory");
            mainWindow.webContents.send("newDirectory", newup);
        }
        if (isLinux && up.length >= 3) {
            newup = up.slice(0, up.length - 1).join(slash);
            mainWindow.webContents.send("newDirectory", newup);
        }
        // else do nothing
        else
            return;
    });
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
    // mainWindow.loadURL( //this doesn't work on macOS in build and preview mode
    //     isDev ?
    //     'http://localhost:3000' :
    //     join(__dirname, '../../index.html')
    // );
}
// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
electron_1.app.whenReady().then(() => {
    createWindow();
    electron_1.app.on("activate", function () {
        // On macOS it's common to re-create a window in the app when the
        // dock icon is clicked and there are no other windows open.
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