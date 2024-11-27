<!-- FileSearch.vue -->
<template>
    <div class="w-50 flex m-auto align-center space-around mb-6">
      <div class="d-flex gap-3">
        <input
          type="text"
          placeholder="Search files..."
          v-model="searchTerm"
          @input="handleSearch"
          class="flex-grow-1 px-3 py-2 text-white bg-dark border border-secondary rounded"
        />
        <select
          v-model="searchType"
          @change="handleSearch"
          class="px-3 py-2 text-white bg-dark border border-secondary rounded"
        >
          <option value="all">All</option>
          <option value="files">Files</option>
          <option value="folders">Folders</option>
        </select>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, watch } from 'vue'
  
  const props = defineProps({
    files: {
      type: Array,
      required: true
    }
  })
  
  const emit = defineEmits(['search'])
  
  const searchTerm = ref('')
  const searchType = ref('all')
  
  // const handleSearch = () => {
  //   console.log(searchTerm.value)
  //   const filtered = props.files.filter(file => {
  //     if (searchType.value === 'folders' && !file.isDirectory) return false
  //     if (searchType.value === 'files' && file.isDirectory) return false
    
  //     if(!searchTerm.value.length) return file.filename.toLowerCase()
  //     return file.filename.toLowerCase().includes(searchTerm.value.toLowerCase())
  //   })
    
  //   emit('search', filtered)
  // }

  const handleSearch = () => {
  const filtered = props.files.filter(file => {
    // First check file/folder filter
    if (searchType.value === 'folders' && !file.isDirectory) return false
    if (searchType.value === 'files' && file.isDirectory) return false
    
    // If search is empty, return all items that passed type filter
    if (searchTerm.value.length === 0) return true
    
    // Otherwise filter by search term
    return file.filename.toLowerCase().includes(searchTerm.value.toLowerCase())
  })
  
  emit('search', filtered)
}
  </script>