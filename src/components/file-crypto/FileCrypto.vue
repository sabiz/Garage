<script setup lang="ts">
import { ref, onMounted } from 'vue';
import EncryptPanel from './EncryptPanel.vue';
import DecryptPanel from './DecryptPanel.vue';
import { isCryptoSupported as checkCryptoSupport } from '../../utils/file-crypto/crypto';

type Mode = 'encrypt' | 'decrypt';

const mode = ref<Mode>('encrypt');
const isCryptoSupported = ref(true);

onMounted(() => {
  isCryptoSupported.value = checkCryptoSupport();
});
</script>


<template>
  <div>
    <div v-if="!isCryptoSupported" class="mb-6 p-4 bg-red-50 border border-red-200 rounded-sm">
      <p class="text-sm text-red-800">
        <strong>⚠️ Browser Not Supported:</strong> Your browser does not support the Web Crypto API required for secure encryption. Please use a modern browser like Chrome, Firefox, Safari, or Edge.
      </p>
    </div>

    <div class="mb-6">
      <div class="border-b border-gray-200">
        <nav class="-mb-px flex space-x-8">
          <button
            type="button"
            class="py-4 px-1 border-b-2 font-medium text-sm transition-colors"
            :class="mode === 'encrypt' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'"
            @click="mode = 'encrypt'"
          >
            <svg class="inline-block w-5 h-5 mr-2 -mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            Encrypt
          </button>
          <button
            type="button"
            class="py-4 px-1 border-b-2 font-medium text-sm transition-colors"
            :class="mode === 'decrypt' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'"
            @click="mode = 'decrypt'"
          >
            <svg class="inline-block w-5 h-5 mr-2 -mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
            </svg>
            Decrypt
          </button>
        </nav>
      </div>
    </div>

    <div v-if="isCryptoSupported">
      <EncryptPanel v-if="mode === 'encrypt'" />
      <DecryptPanel v-else />
    </div>

    <div class="mt-8 p-4 bg-gray-50 rounded-sm">
      <details class="text-sm text-gray-700">
        <summary class="cursor-pointer font-medium hover:text-gray-900">
          Technical Details
        </summary>
        <div class="mt-3 space-y-2 text-xs">
          <p><strong>Encryption Algorithm:</strong> AES-256-GCM (Galois/Counter Mode)</p>
          <p><strong>Key Derivation:</strong> PBKDF2-SHA256 with 600,000 iterations</p>
          <p><strong>Privacy:</strong> All operations performed locally - no data sent to servers</p>
        </div>
      </details>
    </div>
  </div>
</template>