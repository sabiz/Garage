<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { clearCanvas, renderIdenticon } from '../../utils/identile/renderer';

interface Props {
  code: number | null;
  size: number;
}

const props = defineProps<Props>();
const canvasRef = ref<HTMLCanvasElement | null>(null);

function render() {
  if (!canvasRef.value){
    return;
  }
  if (props.code === null) {
    clearCanvas(canvasRef.value);
    return;
  }
  renderIdenticon(canvasRef.value, { code: props.code, size: props.size });
}

// Ensure rendering occurs after canvas element updates (e.g., size changes) by specifying flush: 'post'
watch(() => [props.code, props.size], render, {flush: 'post'});

defineExpose({ canvasRef });
</script>


<template>
  <div class="flex flex-col items-center gap-4">
    <canvas
      ref="canvasRef"
      class="rounded-sm border border-slate-200 bg-white shadow-sm"
      :width="size"
      :height="size"
      role="img"
    ></canvas>
    <p class="text-sm text-slate-500">{{ size }} × {{ size }} px</p>
  </div>
</template>