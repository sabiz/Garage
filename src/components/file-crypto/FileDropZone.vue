<script setup lang="ts">
import { ref, computed } from 'vue';
import { validateFileSize, formatFileSize } from '../../utils/file-crypto/file-handler';

interface Props {
  modelValue?: File | null;
  label?: string;
  placeholder?: string;
  maxSizeText?: string;
  onFileSelected?: (file: File) => void;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: null,
  label: '',
  placeholder: '',
  maxSizeText: '',
  onFileSelected: undefined,
});

const emit = defineEmits<{
  'update:modelValue': [file: File | null];
}>();

const fileInput = ref<HTMLInputElement | null>(null);
const isDragging = ref(false);
const errorMessage = ref('');

const selectedFile = computed({
  get: () => props.modelValue,
  set: (file: File | null) => {
    emit('update:modelValue', file);
  },
});

const fileSizeWarning = computed(() => {
  if (!selectedFile.value) return false;
  const validation = validateFileSize(selectedFile.value);
  return validation.needsWarning;
});

function formatSize(bytes: number): string {
  return formatFileSize(bytes);
}

function handleFileSelect(event: Event): void {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files[0]) {
    setFile(target.files[0]);
  }
}

function handleDrop(event: DragEvent): void {
  isDragging.value = false;
  if (event.dataTransfer?.files && event.dataTransfer.files[0]) {
    setFile(event.dataTransfer.files[0]);
  }
}

function setFile(file: File): void {
  errorMessage.value = '';
  const validation = validateFileSize(file);
  if (validation.valid) {
    selectedFile.value = file;
    if (props.onFileSelected) {
      props.onFileSelected(file);
    }
  } else {
    errorMessage.value = validation.error || 'Invalid file size';
  }
}

function clearSelectedFile(): void {
  selectedFile.value = null;
  if (fileInput.value) {
    fileInput.value.value = '';
  }
}
</script>

<template>
  <div>
    <label v-if="label" class="block text-sm font-medium text-gray-700 mb-2">
      {{ label }}
    </label>
    <div
      class="border-2 border-dashed border-gray-300 rounded-sm p-6 text-center hover:border-gray-400 transition-colors cursor-pointer"
      :class="{ 'border-blue-500 bg-blue-50': isDragging }"
      @dragover.prevent="isDragging = true"
      @dragleave.prevent="isDragging = false"
      @drop.prevent="handleDrop"
      @click="fileInput?.click()"
    >
      <input
        ref="fileInput"
        type="file"
        class="hidden"
        @change="handleFileSelect"
      />
      <div v-if="!selectedFile">
        <p class="mt-2 text-sm text-gray-600">
          {{ placeholder || 'Click to select or drag and drop a file here' }}
        </p>
        <p class="mt-1 text-xs text-gray-500">
          {{ maxSizeText || 'Maximum file size: 1GB' }}
        </p>
      </div>
      <div v-else class="text-left">
        <p class="text-sm font-medium text-gray-900">{{ selectedFile.name }}</p>
        <p class="text-xs text-gray-500 mt-1">{{ formatSize(selectedFile.size) }}</p>
        <button
          type="button"
          class="mt-2 text-sm text-blue-600 hover:text-blue-800"
          @click.stop="clearSelectedFile"
        >
          Remove file
        </button>
      </div>
    </div>
    <p v-if="errorMessage" class="mt-2 text-sm text-red-600">
      {{ errorMessage }}
    </p>
    <p v-else-if="fileSizeWarning" class="mt-2 text-sm text-yellow-600">
      ⚠️ Large file detected. Processing may take some time.
    </p>
  </div>
</template>
