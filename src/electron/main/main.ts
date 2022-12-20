import { join } from "path";
import { app, BrowserWindow, shell, ipcMain, ipcRenderer, Menu } from "electron";
import { existsSync } from "original-fs";
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
let slash: string;
const { dialog } = require('electron')
//path string concatenation check for linux systems
!isLinux ? (slash = nonLinux) : (slash = linux);
//log the os to the backend
// console.log(
//   "Operating system is:",
//   isLinux ? "Linux" : isMac ? "Mac" : isWindows ? "Windows" : ""
// );
const isDev = process.env.npm_lifecycle_event === "app:dev" ? true : false;
let win: any;

console.log("main.ts loaded");

async function createWindow() {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: join(__dirname, "../preload/preload.js"),
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  ipcMain.on('transfer', (a,b,c)=>{console.log(b, '<-- the file to be transferred', c, " <-- the project/folder name"); 
    mainWindow.webContents.send('ok', b, c)
    console.log(process.cwd())
  
  })

 let projectFolderArray:any = [];
console.log(process.cwd(), ' <-- current directory')

const getProjects = (b?:string) => {

  //does projectFolder exist?
if (!fs.existsSync("projectsFolder")){
  //if not, create it
  fs.mkdirSync("projectsFolder");
}
//if it does exist
if(fs.existsSync('projectsFolder'
)){
//if a parameter was passed to getProjects, and the folder for that parameter doesn't exist
  if(b && !existsSync(`projectsFolder/${b}`))
  //create it
  {fs.mkdirSync(`projectsFolder/${b}`)}
  //if not, notify user that there is a duplicate 
  else{mainWindow.webContents.send('duplicateWarning')}
//read contents of projectsFolder
  let theContents = fs.readdirSync("projectsFolder")
let menuArray:any = []
//for each item in the contents
theContents.forEach((item:any, b:any)=>{ 
  console.log(item, b)
  //turn it into a menu item
  let innerObject = {
  label: item,
  click() {
    console.log("hello from" + item + 'project');
    mainWindow.webContents.send('navigateToProject', item);
  }}
  console.log(innerObject)
  menuArray.push(innerObject)
})

projectFolderArray = menuArray;
mainWindow.webContents.send('allProjects', JSON.stringify(menuArray))
}


let thing = [ {
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
},]


  const template:any = [
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
          
          ...projectFolderArray
   
       ]
    },
    
    ...thing
    
  ]
  const menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)
}
getProjects();

ipcMain.on('openFileManager', ()=>{console.log('mergerrrrrrr');
dialog.showOpenDialog({ properties: ['openFile'] }).then((e)=>{

  if(e?.filePaths[0]?.length){
  console.log(e.filePaths[0]);
  mainWindow.webContents.send('fileManagerOpen', e.filePaths[0])

}
  else{console.log('no length, cancelled')}

})

})
ipcMain.on('makeProject', (a,b) => {getProjects(b)})

  mainWindow?.webContents.on("did-finish-load", () => {
    mainWindow?.webContents.send(
      "main-process-message",
      new Date().toLocaleString()
    );
  });

  // load the index.html of the app.
  if (!isDev) {
    mainWindow.loadURL("http://localhost:3000"); // Open the DevTools.
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(join(__dirname, "../../index.html"));
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
app.whenReady().then(() => {
  createWindow();
  app.on("activate", function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
