import "bootstrap/dist/css/bootstrap.min.css";
import { createApp } from "vue";
import RootComponent from "./RootComponent.vue";
const os = require("os");
const fs = require("fs");
const isMac = os.platform() === "darwin";
const isWindows = os.platform() === "win32";
const isLinux = os.platform() === "linux";
let nonLinux = "\\";
let linux = "/";
let slash: string;
//path string concatenation check for linux systems
!isLinux ? (slash = nonLinux) : (slash = linux);

var mime = require("mime-types");
document.addEventListener("drop", (event) => {
  // console.log(event);
  event.preventDefault();
  event.stopPropagation();

  if (event?.dataTransfer?.files != null) {
    for (const f of event?.dataTransfer?.files) {
      console.log("Original path of dragged files: ", f.path);
      const ogFilePath = f.path.toString();
      const ogFileName = ogFilePath.substring(ogFilePath.lastIndexOf("\\") + 1);
      console.log(ogFileName);
      const workingDir = process.cwd();
      const finalPath = `${workingDir}\\${ogFileName}`;

      console.log(finalPath);
      console.log(finalPath, "<-- final path from index.ts line 32");
      // get image mime type
      const mimeType = mime.lookup(ogFilePath);
      //disallow drag/drop if not a psd file
      if (mimeType !== "image/vnd.adobe.photoshop") {
        alert("not a psd");
        return;
      }

      //check path and copy file to directory
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
        } else {
          fs.copyFile(ogFilePath, finalPath, () => {
            console.log("file written");
          });
        }
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

document.addEventListener("dragenter", (event) => {});

document.addEventListener("dragleave", (event) => {});

const theApp = createApp(RootComponent);
theApp.mount("#app");
