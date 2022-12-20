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

  ipcMain.on("getDrives", (a, b) => {
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
        .then((disks: any) => {
          console.log("ASYNC results", disks);
          console.log(typeof disks);
          let arrayFrom = Object.values(disks);
          let drivesArray: any = [];
          arrayFrom.forEach((theDrive: any) => {
            drivesArray.push(theDrive?._mounted + slash);
          });
          // console.log(arrayFrom[0]?._mounted + slash)
          console.log(drivesArray, "drives");
          mainWindow.webContents.send("backEndMsg", drivesArray);
        })
        .catch((reason: any) => {
          console.error(reason);
        });
    };
    // run the getDrives function
    getDrives();
  });
  //set directory route from frontend
  ipcMain.on("setDirectory", (theEvent, initialDirectory) => {
    mainWindow.webContents.send("ok", "setDirectory route success");
    const homeDir = require("os").homedir();
    let desktopDir = "";
    let dirContentsArray = [];
    let dirContents: any;
    console.log("initialDirectory: ", initialDirectory);
    //if a directory is passed from frontend, read that directory
    try {
      if (initialDirectory.length > 0) {
        dirContents = fs?.readdirSync(initialDirectory);
      } else {
        dirContents = fs.readdirSync("C:\\");
        initialDirectory = "C:\\";
      }
      console.log(dirContents, "contents");
    } catch (error) {}
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
        let isDir: boolean;
        let theString: string;
        // console.log(
        //   initialDirectory + slash + dirContents[theFile],
        //   "concat check"
        // );
        if (
          statSync(
            initialDirectory + slash + dirContents[theFile]
          )?.isDirectory()
        ) {
          // console.log("its a directory");
          isDir = true;
        } else {
          isDir = false;
        }
        dirContentsArray.push({
          filename: dirContents[theFile],
          isDirectory: isDir,
        });
      } catch (error) {
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
  ipcMain.on("upTheTree", (a, b) => {
    // console.log(isLinux, isMac, isWindows,)
    // console.log(slash)
    const up = b.split(slash);
    //split the string by slash variable
    console.log(up.length, "directory string length");
    let newup: any;
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
    else return;
  });

  mainWindow?.webContents.on("did-finish-load", () => {
    mainWindow?.webContents.send(
      "main-process-message",
      new Date().toLocaleString()
    );
  });

  // load the index.html of the app.
  if (isDev) {
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
