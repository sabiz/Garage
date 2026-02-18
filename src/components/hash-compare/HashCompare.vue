<script setup lang="ts">
import { ref } from 'vue';
import HashCompareInputPanel from './HashCompareInputPanel.vue';
import { HASH_ALGORITHMS, type HashAlgorithm } from '../../utils/hash-compare/hash';

const algorithm = ref<HashAlgorithm>('MD5');

const hashState = ref<{ left: string | null; right: string | null }>({ left: null, right: null });

const statusMessage = ref('');
const statusVariant = ref<'info' | 'warning' | 'error'>('info');

const statusVariantClass: Record<string, string> = {
  info: 'border-blue-200 bg-blue-50 text-blue-800',
  warning: 'border-amber-200 bg-amber-50 text-amber-800',
  error: 'border-rose-200 bg-rose-50 text-rose-800',
};

const resultVariantClass: Record<string, string> = {
  default: 'border-slate-200 bg-slate-50 text-slate-700',
  match: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  mismatch: 'border-rose-200 bg-rose-50 text-rose-700',
};

function resultVariant(): 'default' | 'match' | 'mismatch' {
  if (hashState.value.left === null || hashState.value.right === null) return 'default';
  return hashState.value.left === hashState.value.right ? 'match' : 'mismatch';
}

function resultText(): string {
  const v = resultVariant();
  if (v === 'default') return 'Enter input on both sides to see hash comparison.';
  return v === 'match' ? 'Match' : 'Mismatch';
}

function onHashUpdated(side: 'left' | 'right', hash: string | null) {
  statusMessage.value = '';
  hashState.value = { ...hashState.value, [side]: hash };
}

function onStatus(message: string, variant: 'info' | 'warning' | 'error') {
  statusMessage.value = message;
  statusVariant.value = variant;
}
</script>

<template>
  <div>
    <div class="mb-6">
      <label class="block">
        <span class="mb-2 block text-sm font-medium text-slate-700">Algorithm</span>
        <select
          v-model="algorithm"
          class="w-full rounded-sm border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:border-slate-500 focus:outline-none sm:max-w-xs"
        >
          <option v-for="alg in HASH_ALGORITHMS" :key="alg" :value="alg">{{ alg }}</option>
        </select>
      </label>
    </div>

    <div
      v-if="statusMessage"
      class="mb-4 rounded-sm border px-3 py-2 text-sm"
      :class="statusVariantClass[statusVariant]"
    >
      {{ statusMessage }}
    </div>

    <div class="grid gap-6 lg:grid-cols-2">
      <HashCompareInputPanel
        side="left"
        title="Left Input"
        :algorithm="algorithm"
        @hash-updated="(hash) => onHashUpdated('left', hash)"
        @status="(msg, variant) => onStatus(msg, variant)"
      />
      <HashCompareInputPanel
        side="right"
        title="Right Input"
        :algorithm="algorithm"
        @hash-updated="(hash) => onHashUpdated('right', hash)"
        @status="(msg, variant) => onStatus(msg, variant)"
      />
    </div>

    <div
      class="mt-6 rounded-sm border px-4 py-3 text-sm font-semibold"
      :class="resultVariantClass[resultVariant()]"
    >
      {{ resultText() }}
    </div>
  </div>
</template>
