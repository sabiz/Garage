<script setup lang="ts">
import { ref, computed } from 'vue';
import FileDropZone from './FileDropZone.vue';
import { encryptData, createEncryptedFile } from '../../utils/file-crypto/crypto';
import {
  readFileAsBytes,
  createDownloadBlob,
  downloadFile,
  getEncryptedFilename,
  clearBuffer,
} from '../../utils/file-crypto/file-handler';
import {
  validatePasswordMatch,
  calculatePasswordStrength,
} from '../../utils/file-crypto/password';

const selectedFile = ref<File | null>(null);
const password = ref('');
const passwordConfirm = ref('');
const isProcessing = ref(false);
const progress = ref(0);
const errorMessage = ref('');
const encryptedFile = ref<Uint8Array | null>(null);

const passwordStrength = computed(() => {
  return calculatePasswordStrength(password.value);
});

const passwordMismatch = computed(() => {
  return passwordConfirm.value && !validatePasswordMatch(password.value, passwordConfirm.value);
});

const canEncrypt = computed(() => {
  return (
    selectedFile.value &&
    password.value &&
    passwordConfirm.value &&
    !passwordMismatch.value &&
    !isProcessing.value
  );
});

function handleFileSelected(file: File): void {
  errorMessage.value = '';
  encryptedFile.value = null;
}

async function encrypt(): Promise<void> {
  if (!selectedFile.value || !canEncrypt.value) {
    return;
  }

  isProcessing.value = true;
  errorMessage.value = '';
  encryptedFile.value = null;
  progress.value = 0;

  try {
    const fileData = await readFileAsBytes(selectedFile.value) as Uint8Array<ArrayBuffer>;
    progress.value = 0.1;

    const result = await encryptData(fileData, password.value, (p) => {
      progress.value = 0.1 + p * 0.9;
    });

    const encrypted = createEncryptedFile(result);
    encryptedFile.value = encrypted;

    clearBuffer(fileData);

    progress.value = 1;
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Encryption failed';
    encryptedFile.value = null;
  } finally {
    isProcessing.value = false;
  }
}

function downloadEncryptedFile(): void {
  if (!encryptedFile.value || !selectedFile.value){
    return;
  }

  const filename = getEncryptedFilename(selectedFile.value.name);
  const blob = createDownloadBlob(encryptedFile.value as Uint8Array<ArrayBuffer>);
  downloadFile(blob, filename);
}
</script>


<template>
  <div class="space-y-6">
    <FileDropZone
      v-model="selectedFile"
      label="Select File to Encrypt"
      :onFileSelected="handleFileSelected"
    />

    <div>
      <label for="password" class="block text-sm font-medium text-gray-700 mb-2">
        Password
      </label>
      <input
        id="password"
        v-model="password"
        type="password"
        class="w-full px-3 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="Enter a strong password"
        :disabled="isProcessing"
      />
    </div>

    <div>
      <label for="passwordConfirm" class="block text-sm font-medium text-gray-700 mb-2">
        Confirm Password
      </label>
      <input
        id="passwordConfirm"
        v-model="passwordConfirm"
        type="password"
        class="w-full px-3 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="Re-enter your password"
        :disabled="isProcessing"
      />
      <p v-if="passwordMismatch" class="mt-2 text-sm text-red-600">
        Passwords do not match
      </p>
    </div>

    <div v-if="password" class="p-4 bg-gray-50 rounded-sm">
      <div class="flex items-center justify-between mb-2">
        <span class="text-sm font-medium text-gray-700">Password Strength:</span>
        <span class="text-sm font-semibold" :class="passwordStrength.color">
          {{ passwordStrength.label }}
        </span>
      </div>
      <div class="w-full bg-gray-200 rounded-full h-2">
        <div
          class="h-2 rounded-full transition-all duration-300"
          :class="{
            'bg-red-600': passwordStrength.score <= 1,
            'bg-orange-600': passwordStrength.score === 2,
            'bg-yellow-600': passwordStrength.score === 3,
            'bg-green-600': passwordStrength.score >= 4,
          }"
          :style="{ width: `${(passwordStrength.score / 4) * 100}%` }"
        ></div>
      </div>
      <ul class="mt-2 text-xs text-gray-600 space-y-1">
        <li v-for="(tip, index) in passwordStrength.feedback" :key="index">
          • {{ tip }}
        </li>
      </ul>
    </div>

    <div v-if="isProcessing" class="space-y-2">
      <div class="flex items-center justify-between text-sm text-gray-700">
        <span>Encrypting file...</span>
        <span>{{ Math.round(progress * 100) }}%</span>
      </div>
      <div class="w-full bg-gray-200 rounded-full h-2">
        <div
          class="bg-blue-600 h-2 rounded-full transition-all duration-300"
          :style="{ width: `${progress * 100}%` }"
        ></div>
      </div>
    </div>

    <div v-if="errorMessage" class="p-4 bg-red-50 border border-red-200 rounded-sm">
      <p class="text-sm text-red-800">{{ errorMessage }}</p>
    </div>

    <div v-if="encryptedFile" class="p-4 bg-green-50 border border-green-200 rounded-sm">
      <p class="text-sm text-green-800 mb-3">
        ✓ File encrypted successfully!
      </p>
      <button
        type="button"
        class="px-4 py-2 bg-green-600 text-white rounded-sm hover:bg-green-700 transition-colors"
        @click="downloadEncryptedFile"
      >
        Download Encrypted File
      </button>
    </div>

    <button
      type="button"
      class="w-full px-4 py-3 bg-blue-600 text-white rounded-sm hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
      :disabled="!canEncrypt"
      @click="encrypt"
    >
      {{ isProcessing ? 'Encrypting...' : 'Encrypt File' }}
    </button>

    <div class="p-4 bg-yellow-50 border border-yellow-200 rounded-sm">
      <p class="text-xs text-yellow-800">
        <strong>⚠️ Important:</strong> Make sure to remember your password. There is no way to recover your files if you forget it. All encryption is performed locally in your browser.
      </p>
    </div>
  </div>
</template>

