<template>
  <div 
    class="file-card"
    @click="selectTheFile"
    :class="{ 'is-directory': file?.isDirectory }"
  >
    <div class="icon-container">
      <component 
        :is="getFileIcon" 
        class="icon"
        size="48"
        stroke-width="1.5"
      />
    </div>
    <div class="filename">{{ file?.filename }}</div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
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

const props = defineProps({
  file: {
    type: Object
  }
});

const theEmit = defineEmits(['fileSelected']);

const getFileIcon = computed(() => {
  if (props.file?.isDirectory) return Folder;

  const extension = props.file?.filename.split('.').pop()?.toLowerCase();

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
});

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
  color: #fff;
}

.icon {
  width: 100%;
  height: 100%;
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

.is-directory:hover {
  background-color: rgba(30, 144, 255, 0.15);
}

button {
  all: unset;
}
</style>