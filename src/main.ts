/* eslint-disable */
import "bootstrap/dist/css/bootstrap.min.css"
import { createApp } from 'vue'
import App from './App.vue'
const {ipcRenderer} = window.require('electron') 
var fs = require("fs");
var mime = require("mime-types");

const os = require("os");
const isMac = os.platform() === "darwin";
const isWindows = os.platform() === "win32";
const isLinux = os.platform() === "linux";

ipcRenderer.on("main-process-message", (_event, ...args) => {
    //   console.log(...args)  --> logs the time
  });
  
  //send os to frontend
  ipcRenderer.on("os", (event, osResult) => {
    console.log("Event from App.vue -- >OS is: " + osResult);
  });

  document.addEventListener("drop", (event) => {
    console.log(event);
    event.preventDefault();
    event.stopPropagation();
  
    if (event?.dataTransfer?.files != null) {
      for (const f of event?.dataTransfer?.files) {
        console.log("File Path of dragged files: ", f.path);
        const ogFilePath = f.path.toString();
        const ogFileName = ogFilePath.substring(ogFilePath.lastIndexOf("\\") + 1);
        console.log(ogFileName);
        const workingDir = process.cwd();
        const finalPath = `${workingDir}\\src\\dragDropDestination\\${ogFileName}`;
        console.log(finalPath);
        console.log(finalPath, "<-- final path");
        // get image mime type
        const mimeType = mime.lookup(ogFilePath);
        //disallow drag/drop if not a psd file
        if (mimeType !== "image/vnd.adobe.photoshop") {
          alert("not a psd");
          return;
        }
  
        //check path and copy file to directory ${projectRoot}/src/dragDropDestination/
        try {
          if (fs.existsSync(finalPath)) {
            if (confirm("Overwrite?") == true) {
              fs.copyFile(ogFilePath, finalPath, () => {
                console.log("file overwritten");
              });
            } else {
              console.log("overwrite cancelled");
              return;
            }
          } else
            fs.copyFile(ogFilePath, finalPath, () => {
              console.log("file written");
            });
        } catch (err) {
          console.error(err);
        }
      }
    }
  });
  
  document.addEventListener("dragover", (e) => {
    e.preventDefault();
    e.stopPropagation();
  });
  
  document.addEventListener("dragenter", (event) => {
     console.log('File is in drop space');
  });
  
  document.addEventListener("dragleave", (event) => {
     console.log('File has left the drop space');
  });
  

const app = createApp(App)
app.mount('#app')
