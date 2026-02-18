<script setup lang="ts">
import { ref, watch } from 'vue';
import { formatFileSize } from '../../utils/file';
import { calculateHash, readFileBytes, type HashAlgorithm } from '../../utils/hash-compare/hash';

interface Props {
  side: 'left' | 'right';
  title: string;
  algorithm: HashAlgorithm;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  'hash-updated': [hash: string | null];
  'status': [message: string, variant: 'info' | 'warning' | 'error'];
}>();

const fileInput = ref<HTMLInputElement | null>(null);
const textInput = ref('');
const hashOutput = ref('');
const sourceLabel = ref('No file selected');
const dropZoneActive = ref(false);

const file = ref<File | null>(null);

let debounceTimer: ReturnType<typeof setTimeout> | null = null;

watch(() => props.algorithm, () => recalculate());

function clearFileSource() {
  file.value = null;
  if (fileInput.value) {
    fileInput.value.value = '';
  }
  sourceLabel.value = 'No file selected';
}

function setFileSource(f: File) {
  file.value = f;
  textInput.value = '';
  sourceLabel.value = `${f.name} (${formatFileSize(f.size)})`;
}

async function recalculate() {
  const hasInput = file.value || textInput.value.length > 0;
  if (!hasInput) {
    hashOutput.value = '';
    emit('hash-updated', null);
    return;
  }

  let bytes: Uint8Array;
  let fallbackWarning = '';

  if (file.value) {
    const result = await readFileBytes(file.value, textInput.value || file.value.name);
    bytes = result.bytes;
    fallbackWarning = result.fallbackWarning;
  } else {
    bytes = new TextEncoder().encode(textInput.value);
  }

  try {
    const hash = await calculateHash(props.algorithm, bytes);
    hashOutput.value = hash;
    if (fallbackWarning) emit('status', fallbackWarning, 'warning');
    emit('hash-updated', hash);
  } catch (error) {
    hashOutput.value = '';
    emit('status', `Hash calculation failed: ${error instanceof Error ? error.message : String(error)}`, 'error');
    emit('hash-updated', null);
  }
}

function scheduleRecalculate() {
  clearFileSource();
  if (debounceTimer !== null) {
    clearTimeout(debounceTimer);
  }
  debounceTimer = setTimeout(() => recalculate(), 300);
}

function onFileChange(event: Event) {
  const f = (event.target as HTMLInputElement).files?.[0];
  if (f) {
    setFileSource(f);
    recalculate();
  }
}

function onDrop(event: DragEvent) {
  dropZoneActive.value = false;
  const f = event.dataTransfer?.files?.[0];
  if (f) {
    setFileSource(f);
    recalculate();
  }
}

function onClearSource() {
  clearFileSource();
  textInput.value = '';
  recalculate();
}
</script>

<template>
  <section class="rounded-sm border border-slate-200 p-4">
    <h2 class="mb-3 text-lg font-semibold text-slate-900">{{ title }}</h2>

    <div
      class="mb-3 cursor-pointer rounded-sm border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-slate-600 transition-colors hover:border-slate-400 hover:bg-slate-100"
      :class="{ 'ring-2 ring-slate-400 bg-slate-100': dropZoneActive }"
      @click="fileInput?.click()"
      @dragover.prevent="dropZoneActive = true"
      @dragleave.prevent="dropZoneActive = false"
      @drop.prevent="onDrop"
    >
      <p class="font-medium">Drop a file here or click to choose</p>
      <p class="mt-1 text-xs text-slate-400">{{ sourceLabel }}</p>
      <input ref="fileInput" type="file" class="hidden" @change="onFileChange" />
    </div>

    <label class="mb-3 block">
      <span class="mb-2 block text-sm font-medium text-slate-700">Text Input</span>
      <textarea
        v-model="textInput"
        rows="6"
        class="w-full rounded-sm border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-slate-500 focus:outline-none"
        placeholder="Type or paste text."
        @input="scheduleRecalculate"
      ></textarea>
    </label>

    <div class="mb-3 flex justify-end">
      <button
        type="button"
        class="rounded-sm border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100"
        @click="onClearSource"
      >
        Clear
      </button>
    </div>

    <label class="block">
      <span class="mb-2 block text-sm font-medium text-slate-700">Hash Output</span>
      <textarea
        :value="hashOutput"
        rows="3"
        readonly
        class="w-full rounded-sm border border-slate-300 bg-slate-50 px-3 py-2 text-xs text-slate-900"
      ></textarea>
    </label>
  </section>
</template>
