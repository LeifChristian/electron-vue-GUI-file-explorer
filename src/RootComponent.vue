<script setup lang="ts">
import { ref, onMounted } from "vue";
import File from "./File.vue";
const { ipcRenderer } = window.require('electron');
let files = ref([]);
let currentDirectoryName = ref("");
let drivesRef = ref();
let desktopRef = ref();
let osRef = ref();
const os = require("os");
const isMac = os.platform() === "darwin";
const isWindows = os.platform() === "win32";
const isLinux = os.platform() === "linux";

// This starter template is using Vue 3 <script setup> SFCs
// Check out https://vuejs.org/api/sfc-script-setup.html#script-setup
const setNewDirectory = (newDirectory) => {
  // console.log("current directory: ", newDirectory);
  //send setDirectory to backend
  ipcRenderer.send("setDirectory", newDirectory);
  // console.log("setDirectory event");
  //receive directory contents and info from backend
  //quick fix for console.log event
  let i=0;
  ipcRenderer.on("receiveDirectoryContents", (theEvent, directoryInfo) => {
    if(i<1){
    console.log("directory: ", directoryInfo);
    let { currentDirectoryContents, currentDirectory, desktop } = directoryInfo;
    //filter all results that are not directories or .psd files. this is string logic and could be done with mimetypes from backend
    currentDirectoryContents = currentDirectoryContents.filter(item => item.filename.includes('.psd') || item.isDirectory
    )
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
const getDrivesEvent = () => {
  ipcRenderer.send("getDrives", JSON.stringify(files));
};
//onMounted function. returns OS type and gets available drives.
onMounted(() => {
  getDrivesEvent();
  ipcRenderer.on("os", (a, b) => {
    console.log(b);
    osRef.value = b;
  });
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
const path = currentDirectoryName.value + slash + e.filename
  let stats = {name: e.filename, isDirectory: e.isDirectory, path: path}
  console.log("selected item: ", stats)

  let i=0;
  // let bread=files.value; console.log(bread)
  // console.log("file selected: ", e.filename)
  const newDirectoryString = currentDirectoryName.value + slash + e.filename;
  files.value.forEach((file) => {
    //  console.log(file.filename); console.log(e.filename);
    if (file.filename == e.filename) {
   
      if (file.isDirectory == true) {
        // console.log("file matched: ", file);
     
        // console.log(newDirectoryString);
        setNewDirectory(newDirectoryString);
      }
      // <--  P o i n t   o f   E n t r y
      //below else statement is where the conversion functionality will execute once a .psd file is clicked.
      else {alert("Hi there! " + newDirectoryString)}

    }
  })
  ;
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

<template>
  <div id="app">
    <div class="container">
      <div class="text-center">
        <br /> <br>
        <h1 class="text-white">Psd Explorer</h1><br>
        <h3 class="text-primary"><span class="text-white"> Current Path:</span> {{ currentDirectoryName?.includes('\\') || currentDirectoryName?.includes('/') ? currentDirectoryName : currentDirectoryName + '\\'  }}</h3>
      </div><br>
      <div id="buttonDiv">

        <button class=" text-white buttonStyle" @click="upTheTree">
          <!-- <img style="" src="./assets/arrow.png" /> -->
          <div style="">↸</div> 
        </button>
        
        <button
          v-if="!isLinux"
          class="text-white buttonStyle"
          @click="toDesktop"
        >
          Desktop
        </button>
        <div class="break"></div> 

        <button
        class="btn text-light buttonStyle"
        v-for="(drive, i) in drivesRef"
        :key="i"
        @click="navigateToDrive(drivesRef[i])"
      >
        {{ drive }}
      </button>
        <!-- <button id="buttonStyle" @click="sendEvent">Test</button> -->
        <br />
      </div>
      <br /><br />
      <div class="row" v-if="files.length > 0">
        <div class="col-md-3" v-for="(file, i) in files" :key="i">
          <File :file="file" @fileSelected="selected(file, files)" />
        </div>
      </div>
    </div>
  </div>
</template>

<style>
body {
  background: black;
  color: white;
  text-align: center;
}
</style>

<style scoped>

#links a {
  text-decoration: none;
  color: white;
}
.buttonStyle {
  width: 20%;
  font-size: 1.7em;
  font-weight: 450;
  justify-content: center;
  font-family:'Segoe UI';
  padding: 10px;
  margin-top: 2%;
  margin-left: 1%;
  margin-right: 1%;
  background:   rgb(40,36,44);
  border-radius: .5rem;
  border: .6px solid gray;
}
#buttonDiv {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  padding: 2px;
  text-align: center;
}

.break {
  flex-basis: 100%;
  height: 0;
}

.buttonStyle:hover {
background: dodgerblue
 
}
</style>
