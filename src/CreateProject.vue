<template>
    <div style="color: white">
Create a Project <br> <br>
    <input v-model="message" placeholder="edit me">
<p> {{ message }}</p>
<button @click="submit(message)">
    Submit
</button>
    </div>
</template>

<script setup>
import {ref} from 'vue'
import { defineEmits } from 'vue'
const { ipcRenderer } = window.require("electron");
const theThing = ref()
const message = ref()
const showCreateProject = ref(true)

const submit = (theProject) => {
    console.log("the project: " + theProject)
    alert(theProject);
ipcRenderer.send("makeProject", theProject)
}

</script>

<style lang="scss" scoped>

</style>