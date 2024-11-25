<template>
  <div 
    class="file-card"
    @click="selectTheFile"
    :class="{ 'is-directory': file?.isDirectory }"
  >
    <div class="icon-container">
      <img
        v-if="file?.isDirectory"
        class="icon"
        src="./assets/folder1.png"
        alt="Folder"
      />
      <img
        v-else
        class="icon"
        src="./assets/psd.png"
        alt="PSD File"
      />
    </div>
    <div class="filename">{{ file?.filename }}</div>
  </div>
</template>

<script setup>
defineProps({
  file: {
    type: Object
  }
});

const theEmit = defineEmits(['fileSelected']);
const selectTheFile = () => {
  theEmit('fileSelected');
};
</script>

<style scoped>
.file-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0.5rem;
  cursor: pointer;
  border-radius: 4px;
  transition: background-color 0.15s ease-in-out;
  height: 100%;
  user-select: none;
}

.file-card:hover {
  background-color: rgba(30, 144, 255, 0.1);
}

.file-card:active {
  background-color: rgba(30, 144, 255, 0.2);
}

.icon-container {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 0.5rem;
  width: 48px;
  height: 48px;
}

.icon {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.filename {
  font-size: 0.85rem;
  color: #fff;
  text-align: center;
  word-break: break-word;
  overflow-wrap: break-word;
  max-width: 100%;
  padding: 0 0.25rem;
  line-height: 1.2;
  max-height: 2.4em;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

/* Optional: Different styling for directories */
.is-directory:hover {
  background-color: rgba(30, 144, 255, 0.15);
}

/* Remove button styling */
button {
  all: unset;
}
</style>