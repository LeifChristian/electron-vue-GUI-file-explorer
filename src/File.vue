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
            {{ projectName }}
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
  </main>
</template>

<script setup>
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
const selectTheFile = (projectName) => {

  alert(projectName + ' file project')
  theEmit('fileSelected')
}
// const letsgo = () => { alert('daisy');
// return 'hi'
// }
</script>

<style scoped>
#outerButton {
  background: none;
  border: none;
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
