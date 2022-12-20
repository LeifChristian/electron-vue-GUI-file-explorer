<template>
  <main>
    <div class="card mb-4 shadow-lg border border-secondary bg-dark text-light">
      <button id="outerButton" @click="selectTheFile(projectName)" style="">
        <!-- <img
          v-if="file?.isDirectory"
          class="card-img-top"
          src="./assets/folder1.png"
          alt="Folder Image"
        />
        <img
          v-else
          class="card-img-top"
          src="./assets/psd.png"
          alt="File Image"
        /> -->
        <div>
          <p id="fileNameDisplay" style="color: white">
            {{ projectName }}{{setName(projectName)}}
          </p>

          <button
            id="psd"
            v-if="!file?.isDirectory"
            style="margin: auto; width: 100%"
            class="btn btn-primary"
          >
            Select
          </button>
          <!-- <div style="display: none">{{letsgo()}}</div> -->
        </div>
      </button>
    </div>
    <div @drop="dropEvent" class="dropZone"></div>
  </main>
</template>

<script setup>
import { ref } from 'vue';
const { ipcRenderer } = window.require("electron");
const thing = ref()
defineProps({projectName: {
      type: String
    },
    show: {
      type: Boolean
  },
  projectName: {
    type: String
  }
  })
const theEmit = defineEmits(['fileSelected'])

const setName = (a) => {

  thing.value = a;
  console.log(a);
}
const selectTheFile = (projectName) => {
  theEmit('fileSelected')
}

const dropEvent = async (e) => {
  console.log(thing.value)
  // dropFiles.value = e.dataTransfer.files;
  console.log(e.dataTransfer.files)

  let newOne = Object.values(e.dataTransfer.files);
   console.log(newOne[0], '-- the filename')

  const dropFileObject = {
    modified: newOne[0].lastModified,
    name: newOne[0].name,
    path: newOne[0].path,
    type: newOne[0].type
    }

  // ipcRenderer.send("transfer", JSON.stringify(newOne[0]))
 ipcRenderer.send("transfer", dropFileObject, thing.value)
}

ipcRenderer.on('ok', (a,b)=>{alert('okeydokey'); console.log(b)})

// const letsgo = () => { alert('daisy');
// return 'hi'
// }
</script>

<style scoped>
#outerButton {
  background: none;
  border: none;
}
.dropZone {

  width: 100%;
  height: 50vh;
  border: 2px solid white
}

#outerButton img:hover {
  background: dodgerblue;
}

#fakeButton {
  margin: auto;
  width: 100%;
  opacity: 0;
}

#fileNameDisplay {
  margin: auto;
  width: 70%;
  text-align: center;
}

#psd {
  display: none;
  opacity: 0;
}

#psd:hover {
  opacity: 1;
}
</style>
