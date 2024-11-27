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
  :files="allFiles"
  @search="handleSearch"
/>

      <div id="buttonDiv">
        <button class="navigation-button" @click="upTheTree">
          <ArrowUpCircle class="w-6 h-6" />
        </button>
        <button
          v-if="!isLinux"
          class="navigation-button"
          @click="toDesktop"
        >
          <Monitor class="w-6 h-6 mr-2" />
          Desktop
        </button>
        <div class="break"></div>
        <button
          class="navigation-button"
          v-for="(drive, i) in drivesRef"
          :key="i"
          @click="navigateToDrive(drivesRef[i])"
        >
          <HardDrive class="w-6 h-6 mr-2" />
          {{ drive }}
        </button>
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
import { ArrowUpCircle, Monitor, HardDrive } from 'lucide-vue-next';
import FileSearch from './FileSearchComponent.vue'
import File from "./File.vue";
import { 
  Folder,
  FileText,
  Image,
  FileVideo,
  FileAudio,
  FileCode,
  FileJson,
  FileArchive,
  File as FileIcon
} from 'lucide-vue-next';

const { ipcRenderer } = window.require("electron");
const allFiles = ref([]); // Add this to store original files
const files = ref([]); // This will store filtered files
let currentDirectoryName = ref("");
let drivesRef = ref();
let desktopRef = ref();
let osRef = ref();
const os = require("os");
const isMac = os.platform() === "darwin";
const isWindows = os.platform() === "win32";
const isLinux = os.platform() === "linux";
const dropFiles = ref({});

const getFileIcon = (file) => {
  if (file.isDirectory) return Folder;

  const extension = file.filename.split('.').pop()?.toLowerCase();

  const iconMap = {
    // Images
    'jpg': Image, 'jpeg': Image, 'png': Image, 'gif': Image,
    'svg': Image, 'webp': Image, 'psd': Image,

    // Videos
    'mp4': FileVideo, 'mov': FileVideo, 'avi': FileVideo,
    'mkv': FileVideo, 'webm': FileVideo,

    // Audio
    'mp3': FileAudio, 'wav': FileAudio, 'ogg': FileAudio,
    'm4a': FileAudio, 'flac': FileAudio,

    // Code
    'js': FileCode, 'ts': FileCode, 'py': FileCode,
    'java': FileCode, 'cpp': FileCode, 'html': FileCode,
    'css': FileCode, 'vue': FileCode, 'jsx': FileCode,
    'php': FileCode,

    // Config/Data
    'json': FileJson, 'xml': FileJson, 'yaml': FileJson,
    'yml': FileJson, 'toml': FileJson,

    // Archives
    'zip': FileArchive, 'rar': FileArchive, '7z': FileArchive,
    'tar': FileArchive, 'gz': FileArchive,

    // Documents
    'txt': FileText, 'md': FileText, 'pdf': FileText,
    'doc': FileText, 'docx': FileText, 'rtf': FileText
  };

  return iconMap[extension] || FileIcon;
};

const dropEvent = async (e) => {
  dropFiles.value = e.dataTransfer.files;
  let newOne = Object.values(e.dataTransfer.files);
  const dropFileObject = {
    modified: newOne[0].lastModified,
    name: newOne[0].name,
    path: newOne[0].path,
    type: newOne[0].type
  }
  alert('success! transferred file ' + newOne[0].path + "to project directory")
  ipcRenderer.send("transfer", dropFileObject)
}

// const setNewDirectory = (newDirectory) => {
//   ipcRenderer.send("setDirectory", newDirectory);
//   let i = 0;
//   ipcRenderer.on("receiveDirectoryContents", (theEvent, directoryInfo) => {
//     if (i < 1) {
//       let { currentDirectoryContents, currentDirectory, desktop } = directoryInfo;
//       currentDirectoryContents = currentDirectoryContents.filter(
//         (item) => item.filename.includes(".") || item.isDirectory
//       );
//       files.value = currentDirectoryContents;
//       currentDirectoryName.value = currentDirectory;
//       desktopRef.value = desktop;
//     }
//     i++;
//   });
// };


const setNewDirectory = (newDirectory) => {
  ipcRenderer.send("setDirectory", newDirectory);
  let i = 0;
  ipcRenderer.on("receiveDirectoryContents", (theEvent, directoryInfo) => {
    if (i < 1) {
      let { currentDirectoryContents, currentDirectory, desktop } = directoryInfo;
      currentDirectoryContents = currentDirectoryContents.filter(
        (item) => item.filename.includes(".") || item.isDirectory
      );
      allFiles.value = currentDirectoryContents; // Store in original list
      files.value = currentDirectoryContents;    // Display all initially
      currentDirectoryName.value = currentDirectory;
      desktopRef.value = desktop;
    }
    i++;
  });
};

const handleSearch = (filtered) => {
  files.value = filtered;
};

const getDrivesEvent = () => {
  ipcRenderer.send("getDrives");
};

onMounted(() => {
  ipcRenderer.on('ok', (a,b)=>{ console.log(b)})
  getDrivesEvent();
  setNewDirectory(process.cwd());
});

ipcRenderer.on("newDirectory", (e, arg, a) => {
  if (arg.toString() == "C:" || arg.toString() == "c:") {
    setNewDirectory("");
  } else setNewDirectory(arg.toString());
});

ipcRenderer.on("backEndMsg", (e, arg, a) => {
  drivesRef.value = arg;
});

const selected = (e) => {
  let slash = isLinux ? "/" : "\\";
  const path = currentDirectoryName.value + slash + e.filename;
  const newPathString = currentDirectoryName.value + slash + e.filename;

  files.value.forEach((file) => {
    if (file.filename == e.filename) {
      if (file.isDirectory == true) {
        setNewDirectory(newPathString);
      } else {
        alert("Hi there! " + newPathString);
        ipcRenderer.send('open', newPathString)
      }
    }
  });
};

const upTheTree = () => {
  ipcRenderer.send("upTheTree", currentDirectoryName.value);
};

const toDesktop = () => {
  setNewDirectory(desktopRef.value);
};

const navigateToDrive = (theDrive) => {
  theDrive == "C:\\" ? setNewDirectory("") : setNewDirectory(theDrive);
};
</script>

<style scoped>
body {
  background: black
}

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

.files-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 0.5rem;
  padding: 1rem;
  background: rgba(30, 30, 30, 1);
  border-radius: 8px;
  max-width: 1800px;
  margin: 0 auto;
  min-height: calc(100vh - 300px);
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
  min-height: 120px;
  overflow: visible;
}

.file-item:hover {
  background: rgba(60, 60, 60, 0.8);
}

.container {
  width: 100%;
  max-width: 1800px;
  margin: 0 auto;
  padding: 0 1rem;
  background: black;
  min-height: 100vh;
}

#app {
  background: black;
  min-height: 100vh;
}

.filename {
  background: rgba(40, 40, 40, 0.5);
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.85rem;
  color: #fff;
  text-align: center;
  word-break: break-word;
  overflow-wrap: break-word;
  max-width: 100%;
  line-height: 1.2;
  max-height: 2.4em;
  overflow: visible;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

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

.navigation-button {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem 1rem;
  margin: 0.5rem;
  border-radius: 0.5rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background-color: rgba(40, 40, 40, 0.5);
  color: white;
  cursor: pointer;
  transition: all 0.15s ease-in-out;
  min-width: 100px;
  font-size: 1rem;
}

.navigation-button:hover {
  background-color: grey;
}

.navigation-button:active {
  background-color: rgba(30, 144, 255, 0.2);
}
</style>