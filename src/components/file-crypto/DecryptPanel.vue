<script setup lang="ts">
import { ref, computed } from 'vue';
import FileDropZone from './FileDropZone.vue';
import { decryptData, parseEncryptedFile } from '../../utils/file-crypto/crypto';
import {
  readFileAsBytes,
  createDownloadBlob,
  downloadFile,
  getDecryptedFilename,
  clearBuffer,
} from '../../utils/file-crypto/file-handler';

const selectedFile = ref<File | null>(null);
const password = ref('');
const isProcessing = ref(false);
const progress = ref(0);
const errorMessage = ref('');
const decryptedFile = ref<Uint8Array | null>(null);

const isTamperingError = computed(() => {
  return errorMessage.value.toLowerCase().includes('tampered') || 
         errorMessage.value.toLowerCase().includes('invalid password');
});

const canDecrypt = computed(() => {
  return selectedFile.value && password.value && !isProcessing.value;
});

function handleFileSelected(file: File): void {
  errorMessage.value = '';
  decryptedFile.value = null;
}

async function decrypt(): Promise<void> {
  if (!selectedFile.value || !canDecrypt.value) return;

  isProcessing.value = true;
  errorMessage.value = '';
  decryptedFile.value = null;
  progress.value = 0;

  try {
    const fileData = await readFileAsBytes(selectedFile.value);
    progress.value = 0.1;

    const { salt, nonce, encryptedData } = parseEncryptedFile(fileData);
    progress.value = 0.15;

    const result = await decryptData(encryptedData, salt, nonce, password.value, (p) => {
      progress.value = 0.15 + p * 0.85;
    });

    decryptedFile.value = result.decryptedData;

    clearBuffer(fileData);
    clearBuffer(encryptedData);

    progress.value = 1;
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Decryption failed';
    decryptedFile.value = null;
  } finally {
    isProcessing.value = false;
  }
}

function downloadDecryptedFile(): void {
  if (!decryptedFile.value || !selectedFile.value) return;

  const filename = getDecryptedFilename(selectedFile.value.name);
  const blob = createDownloadBlob(decryptedFile.value as Uint8Array<ArrayBuffer>);
  downloadFile(blob, filename);
}
</script>

<template>
  <div class="space-y-6">
    <FileDropZone
      v-model="selectedFile"
      label="Select Encrypted File"
      placeholder="Click to select or drag and drop an encrypted file here"
      :onFileSelected="handleFileSelected"
    />

    <div>
      <label for="decrypt-password" class="block text-sm font-medium text-gray-700 mb-2">
        Password
      </label>
      <input
        id="decrypt-password"
        v-model="password"
        type="password"
        class="w-full px-3 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="Enter the password used for encryption"
        :disabled="isProcessing"
      />
      <p class="mt-2 text-xs text-gray-500">
        Enter the same password that was used to encrypt this file
      </p>
    </div>

    <div v-if="isProcessing" class="space-y-2">
      <div class="flex items-center justify-between text-sm text-gray-700">
        <span>Decrypting file...</span>
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
      <p v-if="isTamperingError" class="text-xs text-red-700 mt-2">
        This could mean:
      </p>
      <ul v-if="isTamperingError" class="text-xs text-red-700 mt-1 ml-4 list-disc">
        <li>The password is incorrect</li>
        <li>The file has been modified or corrupted</li>
        <li>The file is not a valid encrypted file</li>
      </ul>
    </div>

    <div v-if="decryptedFile" class="p-4 bg-green-50 border border-green-200 rounded-sm">
      <p class="text-sm text-green-800 mb-3">
        ✓ File decrypted successfully!
      </p>
      <button
        type="button"
        class="px-4 py-2 bg-green-600 text-white rounded-sm hover:bg-green-700 transition-colors"
        @click="downloadDecryptedFile"
      >
        Download Decrypted File
      </button>
    </div>

    <button
      type="button"
      class="w-full px-4 py-3 bg-blue-600 text-white rounded-sm hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
      :disabled="!canDecrypt"
      @click="decrypt"
    >
      {{ isProcessing ? 'Decrypting...' : 'Decrypt File' }}
    </button>

    <div class="p-4 bg-blue-50 border border-blue-200 rounded-sm">
      <p class="text-xs text-blue-800">
        <strong>🔒 Secure Decryption:</strong> Your file is decrypted locally in your browser. No data is sent to any server. The decryption process verifies the file's authenticity and will fail if the file has been tampered with.
      </p>
    </div>
  </div>
</template>