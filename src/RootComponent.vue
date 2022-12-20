<template>
  <div @drop="dropEvent" id="app">
    <div class="container">
      <div class="text-center">
        <br />
        <br />
        <h1 class="text-white">Psd Explorer</h1>
        <br />

      <CreateProject v-if="toggleCreateProject "></CreateProject>
   <!-- <div style="color: white">{{ projectName }}</div>    -->
  <!-- <div style="color: white">{{ arrayOfLabels.length > 0 ? arrayOfLabels : null}}</div>  -->

  <!-- <div style="color: white" v-for="label in arrayOfLabels" :key="label">{{label}}</div> -->
  <div style="color: white">{{label}}</div>
   
      <File v-if="show && !toggleCreateProject" :projectName="projectName" @fileSelected="selected(projectName)" />

</div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUpdated } from "vue";
import File from "./File.vue";
import CreateProject from './CreateProject.vue'
const { ipcRenderer } = window.require("electron");
let file = ref();
const os = require("os");
const isMac = os.platform() === "darwin";
const isWindows = os.platform() === "win32";
const isLinux = os.platform() === "linux";
const dropFiles = ref({})
const toggleCreateProject = ref(false);
const arrayOfLabels = ref([])
const projectName = ref()
const show = ref(false);

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

  // ipcRenderer.send("transfer", JSON.stringify(newOne[0]))
  ipcRenderer.send("transfer", dropFileObject)

}

ipcRenderer.on('fileManager', ()=>{ipcRenderer.send('openFileManager')})
ipcRenderer.on('fileManagerOpen', (a,theFilePath)=> {alert(theFilePath + ' <-- file to be imported');

if(!isLinux){
let stringPlay = theFilePath.split("\\");
let length = stringPlay[stringPlay.length -1];
console.log(length);

 ipcRenderer.send("makeProject", length)}

 if(isLinux){
  let stringPlay = theFilePath.split("/");
let length = stringPlay[stringPlay.length -1];
ipcRenderer.send("makeProject", length)
 }
})

ipcRenderer.on('duplicateWarning', ()=> {alert('There is already a project with that name')})

ipcRenderer.on('navigateToProject', (a,b)=> {
  toggleCreateProject.value = false
  show.value = true;
  projectName.value = b;
})
ipcRenderer.on('allProjects', (a,b) => {
  let theProjects = JSON.parse(b); console.log(theProjects);
  console.log(typeof(theProjects))
let arrayPlease = Object.values(theProjects)
console.log(arrayPlease[0].label)

arrayPlease.forEach((theLabel)=>{
  arrayOfLabels.value.push(theLabel)
})

  })

onUpdated(()=>{
  ipcRenderer.send('getProjectFolders');})

//onMounted function. returns OS type and gets available drives.
onMounted(() => {
  ipcRenderer.send('getProjectFolders');

  console.log(
    "Operating system is: ",
    isLinux ? "linux" : isWindows ? "windows" : isMac ? "mac" : null
  );
}
);

ipcRenderer.on ('createNewProject', (a,b)=>{
  console.log('create new project!')
  toggleCreateProject.value = true;
})

//recieve new directory information from backend
ipcRenderer.on("newDirectory", (e, arg, a) => {
  console.log("newDirectory: ", arg);
  //assign correct parameter passed when in root directory
  //Works fine without below logic on any other drive than C:\\
  if (arg.toString() == "C:" || arg.toString() == "c:") {
    setNewDirectory("");
  } else setNewDirectory(arg.toString());
});

const selected = (e) => {
  show.value=true;
  alert(e + ' --> selected function, RootComponent')
}
</script>

<style>
body {
  background: black;
  text-align: center;
}
</style>
<style scoped>
#links a {
  text-decoration: none;
  color: white;
}
.buttonStyle {
  word-wrap: break-word;
  width: 20%;
  font-size: 3vw;
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
  background: dodgerblue;
}
</style>
