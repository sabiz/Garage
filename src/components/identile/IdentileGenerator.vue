<script setup lang="ts">
import { computed, ref } from 'vue';
import IdentileCanvas from './IdentileCanvas.vue';
import IdentileControls from './IdentileControls.vue';
import type { ControlInputs } from './IdentileControls.vue';
import { computeHashCode } from '../../utils/identile/hash';

const controlInputs = ref<ControlInputs | null>(null);

function onControlsUpdate(value: ControlInputs) {
  controlInputs.value = value;
}

const hashCode = computed(() => {
  if (!controlInputs.value || controlInputs.value.text.length === 0){
    return null;
  }
  return computeHashCode(controlInputs.value.text, controlInputs.value.salt, controlInputs.value.algorithm);
});

const canvasComponent = ref<InstanceType<typeof IdentileCanvas> | null>(null);

/**
 * Sanitize a string to be used as a filename.
 */
function sanitizeFilename(value: string) {
  const trimmed = value.trim();
  const safe = trimmed
    .replace(/[\/:*?"<>|]/g, '_')
    .replace(/\s+/g, '-')
    .replace(/_+/g, '_')
    .slice(0, 64);
  return safe.length > 0 ? safe : 'identile';
}

function downloadImage() {
  if (hashCode.value === null){
    return;
  }

  const canvas = canvasComponent.value?.canvasRef;
  if (!canvas){
    return;
  }
  const link = document.createElement('a');
  link.href = canvas.toDataURL('image/png');
  link.download = `identile-${sanitizeFilename(controlInputs.value?.text || '')}.png`;
  link.click();
}
</script>

<template>
  <div class="space-y-8">
    <IdentileControls @update:input="onControlsUpdate" />

    <div v-if="controlInputs" class="grid gap-6 lg:grid-cols-[1fr,280px]">
      <div>
        <IdentileCanvas
          ref="canvasComponent"
          :code="hashCode"
          :size="controlInputs.size"
        />
      </div>

      <div class="flex flex-col justify-between gap-4 p-4">
        <button
          class="inline-flex items-center justify-center rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
          :disabled="hashCode === null"
          @click="downloadImage"
        >
          Download PNG
        </button>
      </div>
    </div>
  </div>
</template>