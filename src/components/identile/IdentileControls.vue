<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import type { HashAlgorithm } from '../../utils/identile/hash';

export interface ControlInputs {
  text: string;
  salt: string;
  algorithm: HashAlgorithm;
  size: number;
}

const text = ref('');
const salt = ref('');
const algorithm = ref<HashAlgorithm>('md5');
const sizePreset = ref('128');
const customSize = ref(128);
const sizeError = computed(() => {
  if (sizePreset.value !== 'custom'){
    return null;
  }
  if (!Number.isFinite(customSize.value) || customSize.value < 32 || customSize.value > 1024) {
    return 'Enter a size between 32 and 1024.';
  }
  return null;
});

const emit = defineEmits<{
  (event: 'update:input', value: ControlInputs): void;
}>();

watch([text, salt, algorithm, sizePreset, customSize],
  () => {
  const inputs = makeControlInputs();
  if (inputs) {
      emit('update:input', inputs);
  }
  },
  { immediate: true }
);

function makeControlInputs(): ControlInputs | null {
  if (sizeError.value) {
      return null;
  }
  return {
      text: text.value,
      salt: salt.value,
      algorithm: algorithm.value,
      size: sizePreset.value === 'custom'
        ? Math.round(customSize.value)
        : Number(sizePreset.value)
  };
}
</script>

<template>
<div class="grid gap-6 lg:grid-cols-2">
  <div class="space-y-4">
    <div>
      <label class="block text-sm font-medium text-slate-700" for="identile-text">Text</label>
      <input
        id="identile-text"
        type="text"
        class="mt-1 w-full rounded-sm border border-slate-200 px-3 py-2 text-slate-900 shadow-sm focus:border-slate-400 focus:outline-none"
        v-model="text"
        placeholder="Enter text"
      />
    </div>

    <div>
      <label class="block text-sm font-medium text-slate-700" for="identile-salt">Salt (optional)</label>
      <input
        id="identile-salt"
        type="text"
        class="mt-1 w-full rounded-sm border border-slate-200 px-3 py-2 text-slate-900 shadow-sm focus:border-slate-400 focus:outline-none"
        v-model="salt"
        placeholder="Add salt for variation"
      />
    </div>

    <div>
      <label class="block text-sm font-medium text-slate-700" for="identile-algorithm">Hash Algorithm</label>
      <select
        id="identile-algorithm"
        class="mt-1 w-full rounded-sm border border-slate-200 px-3 py-2 text-slate-900 shadow-sm focus:border-slate-400 focus:outline-none"
        v-model="algorithm"
      >
        <option value="md5">MD5</option>
        <option value="sha1">SHA-1</option>
        <option value="sha256">SHA-256</option>
        <option value="sha512">SHA-512</option>
      </select>
    </div>
  </div>

  <div class="space-y-4">
    <div>
      <label class="block text-sm font-medium text-slate-700" for="identile-size">Icon Size</label>
      <select
        id="identile-size"
        class="mt-1 w-full rounded-sm border border-slate-200 px-3 py-2 text-slate-900 shadow-sm focus:border-slate-400 focus:outline-none"
        v-model="sizePreset"
      >
        <option value="64">64 px</option>
        <option value="128">128 px</option>
        <option value="256">256 px</option>
        <option value="512">512 px</option>
        <option value="custom">Custom</option>
      </select>
    </div>

    <div v-if="sizePreset === 'custom'">
      <label class="block text-sm font-medium text-slate-700" for="identile-custom-size">Custom Size</label>
      <input
        id="identile-custom-size"
        type="number"
        min="32"
        max="1024"
        class="mt-1 w-full rounded-sm border border-slate-200 px-3 py-2 text-slate-900 shadow-sm focus:border-slate-400 focus:outline-none"
        v-model="customSize"
      />
      <p v-if="sizeError" class="mt-1 text-sm text-rose-600">{{ sizeError }}</p>
    </div>
  </div>
</div>
</template>