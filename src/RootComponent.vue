<template>
  <div @drop="dropEvent" id="app">
    <div class="container">
      <div class="text-center">
        <br />
        <br />
        <h1 class="text-white">File Explorer</h1>
        <br />
        <h3 class="text-primary">
          <span class="text-white"> Current Path:</span>
          {{
            currentDirectoryName?.includes("\\") || currentDirectoryName?.includes("/")
              ? currentDirectoryName
              : currentDirectoryName + "\\"
          }}
        </h3>
      </div>
      <br />

      <FileSearch 
        :files="files"
        @search="(filtered) => files = filtered"
      />
      <div id="buttonDiv">
        <button class="bg-dark text-white buttonStyle" @click="upTheTree">
          <div>↸</div>
        </button>
        <button
          v-if="!isLinux"
          class="bg-dark text-white buttonStyle no-wrap"
          @click="toDesktop"
        >
          Desktop
        </button>
        <div class="break"></div>
        <button
          class="btn bg-dark text-light buttonStyle"
          v-for="(drive, i) in drivesRef"
          :key="i"
          @click="navigateToDrive(drivesRef[i])"
        >
          {{ drive }}
        </button>
        <br />
      </div>
      <br /><br />
      <div class="files-container" v-if="files.length > 0">
        <div v-for="(file, i) in files" :key="i" class="file-item">
          <File :file="file" @fileSelected="selected(file, files)" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import FileSearch from './FileSearchComponent.vue'
import File from "./File.vue";
const { ipcRenderer } = window.require("electron");
let files = ref([]);
let currentDirectoryName = ref("");
let drivesRef = ref();
let desktopRef = ref();
let osRef = ref();
const os = require("os");
const isMac = os.platform() === "darwin";
const isWindows = os.platform() === "win32";
const isLinux = os.platform() === "linux";
const dropFiles = ref({})

const dropEvent = async (e) => {
  dropFiles.value = e.dataTransfer.files;
  console.log(e.dataTransfer.files, 'files to transfer from RootComponent.vue line 66')
  

  let newOne = Object.values(e.dataTransfer.files);
   console.log(newOne[0], '-- the filename RootComponent line 69')

  const dropFileObject = {
    modified: newOne[0].lastModified,
    name: newOne[0].name,
    path: newOne[0].path,
    type: newOne[0].type
    }

    alert('success! transferred file ' + newOne[0].path + "to project directory")

  // ipcRenderer.send("transfer", JSON.stringify(newOne[0]))
  ipcRenderer.send("transfer", dropFileObject)

}

//set new directory and send to backend
const setNewDirectory = (newDirectory) => {
  // console.log("current directory: ", newDirectory);
  //send setDirectory to backend
  ipcRenderer.send("setDirectory", newDirectory);
  // console.log("setDirectory event");
  //receive directory contents and info from backend
  //quick fix for console.log event
  let i = 0;
  ipcRenderer.on("receiveDirectoryContents", (theEvent, directoryInfo) => {
    if (i < 1) {
      console.log("directory: ", directoryInfo);
      let { currentDirectoryContents, currentDirectory, desktop } = directoryInfo;

      //filter all results that are not directories or .psd files. this is string logic and could be done with mimetypes from backend
      currentDirectoryContents = currentDirectoryContents.filter(
        (item) => item.filename.includes(".") || item.isDirectory
      );
      //below .value assignments are for use in template as {{files}}, {{currentDirectoryName}}
      //set files value to currentDirectoryContents
      files.value = currentDirectoryContents;
      currentDirectoryName.value = currentDirectory;
      //set if detected OS has a desktop
      desktopRef.value = desktop;
    }
    i++;
  });
};

//get available disk drives
// const getDrivesEvent = () => {
//   ipcRenderer.send("getDrives", JSON.stringify(files));
// };

const getDrivesEvent = () => {
  ipcRenderer.send("getDrives");  // Remove the JSON.stringify(files)
};

//onMounted function. returns OS type and gets available drives.

onMounted(() => {
  ipcRenderer.on('ok', (a,b)=>{ console.log(b)})
  console.log(
    "Operating system is: ",
    isLinux ? "linux" : isWindows ? "windows" : isMac ? "mac" : null
  );
  getDrivesEvent();

  // ipcRenderer.on("os", (a, b) => {
  //   console.log(b);
  //   osRef.value = b;
  // });
  //set initial directory to current working directory
  setNewDirectory(process.cwd());
});

//recieve new directory information from backend
ipcRenderer.on("newDirectory", (e, arg, a) => {
  console.log("newDirectory: ", arg);
  //assign correct parameter passed when in root directory
  //Works fine without below logic on any other drive than C:\\
  if (arg.toString() == "C:" || arg.toString() == "c:") {
    setNewDirectory("");
  } else setNewDirectory(arg.toString());
});

//receive drives from backend
ipcRenderer.on("backEndMsg", (e, arg, a) => {
  console.log("drives", arg);
  drivesRef.value = arg;
});

//onclick function from App.vue <template> --> <Files> component
const selected = (e) => {
  let slash;
  isLinux ? (slash = "\/") : (slash = "\\");
  const path = currentDirectoryName.value + slash + e.filename;
  let stats = { name: e.filename, isDirectory: e.isDirectory, path: path };
  console.log("selected item: ", stats);

  let i = 0;
  // console.log("file selected: ", e.filename)
  const newPathString = currentDirectoryName.value + slash + e.filename;   // if directory, e.filename == ""

  files.value.forEach((file) => {
    //  console.log(file.filename); console.log(e.filename);
    if (file.filename == e.filename) {
      if (file.isDirectory == true) {
        // console.log("file matched: ", file);
        // console.log(newPathString);
        setNewDirectory(newPathString);
      }
      //below else statement is where the conversion functionality will execute once a .psd file is clicked.
      else {
        // <--  P o i n t   o f   E n t r y
        alert("Hi there! " + newPathString);
        ipcRenderer.send('open', newPathString)
      }
    }
  });
};
//navigate up the directory tree
const upTheTree = () => {
  console.log(currentDirectoryName.value, "up the tree");
  ipcRenderer.send("upTheTree", currentDirectoryName.value);
};
//navigate to desktop
//No logic required as the button only displays if desktop is available
//(v-if <button> in App.vue template)
const toDesktop = () => {
  setNewDirectory(desktopRef.value);
};
//navigate to another of the available disk drives
const navigateToDrive = (theDrive) => {
  console.log(theDrive);
  //Can't currently test drive navigation on ubunutu
  //likely the same '/' replacement used in isLinux, line 116
  theDrive == "C:\\" ? setNewDirectory("") : setNewDirectory(theDrive);
};
</script>



<style scoped>
#links a {
  text-decoration: none;
  color: white;
}

.buttonStyle {
  width: 20%;
  font-size: 2vw;
  font-weight: 450;
  justify-content: center;
  font-family: "Segoe UI";
  padding: 10px;
  margin-top: 2%;
  margin-left: 1%;
  margin-right: 1%;
  border-radius: 0.5rem;
  border: 0.6px solid gray;
}

.no-wrap {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

#buttonDiv {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  padding: 2px;
  text-align: center;
  margin-bottom: 2rem;
}

.break {
  flex-basis: 100%;
  height: 0;
}

.buttonStyle:hover {
  background: dodgerblue;
}

/* Updated grid layout styles */
.files-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 0.5rem;
  padding: 1rem;
  background: rgba(30, 30, 30, 0.5);
  border-radius: 8px;
  max-width: 1800px;
  margin: 0 auto;
}

.file-item {
  background: rgba(40, 40, 40, 0.5);
  border-radius: 4px;
  padding: 0.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  transition: background-color 0.2s;
  aspect-ratio: 1/1;
  max-width: 120px;
  margin: 0 auto;
}

.file-item:hover {
  background: rgba(60, 60, 60, 0.8);
}

.container {
  width: 100%;
  max-width: 1800px;
  margin: 0 auto;
  padding: 0 1rem;
  background: black
}

/* Media queries for different screen sizes */
@media (min-width: 1400px) {
  .files-container {
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    max-width: 1400px;
  }
}

@media (max-width: 1399px) and (min-width: 1200px) {
  .files-container {
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  }
}

@media (max-width: 1199px) and (min-width: 992px) {
  .files-container {
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  }
}

@media (max-width: 991px) and (min-width: 768px) {
  .files-container {
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  }
}

@media (max-width: 767px) and (min-width: 576px) {
  .files-container {
    grid-template-columns: repeat(auto-fill, minmax(90px, 1fr));
  }
}

@media (max-width: 575px) {
  .files-container {
    grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
  }
  
  .buttonStyle {
    font-size: 4vw;
  }
}
</style>