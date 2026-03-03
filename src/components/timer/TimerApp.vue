<script setup lang="ts">
import { ref, reactive, computed, onMounted, onUnmounted, watch } from 'vue';
import { buildRedTintedFavicon } from '../../utils/timer/favicon';
import { buildAlarmBuffer } from '../../utils/timer/audio';
import { secondsToHMS, hmsToSeconds } from '../../utils/timer/time';

type Mode = 'timer' | 'alarm';

// ---- State ----
const mode = ref<Mode>('timer');
const running = ref(false);
const showDialog = ref(false);
const initializing = ref(true);

const display = reactive({ h: 0, m: 0, s: 0 });
const clock = reactive({ h: 0, m: 0, s: 0 });
const timerInput = reactive({ h: 0, m: 0, s: 0 });

const alarmTime = ref('');
const alarmError = ref('');

// ---- Interval / Favicon / Audio handles ----
let interval: ReturnType<typeof setInterval> | null = null;
let faviconInterval: ReturnType<typeof setInterval> | null = null;
let originalFaviconHref = '';
let redTintedFaviconUrl = '';
let audioCtx: AudioContext | null = null;
let prebuiltBeepBuffer: AudioBuffer | null = null;
let beepSourceNode: AudioBufferSourceNode | null = null;

// ---- Helpers ----
function pad2(n: number): string {
  return String(n).padStart(2, '0');
}

const displayTime = computed(() => `${pad2(display.h)}:${pad2(display.m)}:${pad2(display.s)}`);
const clockTime = computed(() => `${pad2(clock.h)}:${pad2(clock.m)}:${pad2(clock.s)}`);

const TIMER_FIELD_MAX = { h: 99, m: 59, s: 59 } as const;
type TimerField = keyof typeof TIMER_FIELD_MAX;

const TIMER_FIELDS: { field: TimerField; label: string; max: number }[] = [
  { field: 'h', label: 'HH', max: 99 },
  { field: 'm', label: 'MM', max: 59 },
  { field: 's', label: 'SS', max: 59 },
];

function clampTimerField(field: TimerField) {
  timerInput[field] = Math.max(0, Math.min(TIMER_FIELD_MAX[field], timerInput[field]));
}

// ---- Alarm time utilities ----
function alarmTargetSeconds(): number | null {
  if (!alarmTime.value) return null;
  const [h, m, s = '00'] = alarmTime.value.split(':');
  return hmsToSeconds(Number(h), Number(m), Number(s));
}

function isAlarmFuture(): boolean {
  const targetSec = alarmTargetSeconds();
  if (targetSec === null) return false;
  const now = new Date();
  return targetSec > hmsToSeconds(now.getHours(), now.getMinutes(), now.getSeconds());
}

function validateAlarmTime(): boolean {
  if (!alarmTime.value) {
    alarmError.value = 'Please set the alarm time.';
    return false;
  }
  if (!isAlarmFuture()) {
    alarmError.value = 'The alarm time must be in the future.';
    return false;
  }
  alarmError.value = '';
  return true;
}

watch(alarmTime, () => {
  if (!running.value) {
    alarmError.value = alarmTime.value && !isAlarmFuture()
      ? 'The alarm time must be in the future.'
      : '';
  }
});

// ---- Favicon ----
function getFaviconLink(): HTMLLinkElement | null {
  return document.querySelector<HTMLLinkElement>('link[rel="icon"]');
}

function startFaviconFlash() {
  const link = getFaviconLink();
  if (!link) return;
  const redIcon = redTintedFaviconUrl || originalFaviconHref;
  let toggle = false;
  faviconInterval = setInterval(() => {
    link.href = toggle ? originalFaviconHref : redIcon;
    toggle = !toggle;
  }, 500);
}

function stopFaviconFlash() {
  if (faviconInterval !== null) {
    clearInterval(faviconInterval);
    faviconInterval = null;
  }
  const link = getFaviconLink();
  if (link && originalFaviconHref) link.href = originalFaviconHref;
}

// ---- Audio ----
function startAlarmSound() {
  if (!prebuiltBeepBuffer) return;
  try {
    audioCtx = new AudioContext();
  } catch {
    return;
  }
  const source = audioCtx.createBufferSource();
  source.buffer = prebuiltBeepBuffer;
  source.loop = true;
  source.connect(audioCtx.destination);
  source.start();
  beepSourceNode = source;
}

function stopAlarmSound() {
  beepSourceNode?.stop();
  beepSourceNode = null;
  audioCtx?.close();
  audioCtx = null;
}

// ---- Tick ----
function tick() {
  const now = new Date();
  Object.assign(clock, { h: now.getHours(), m: now.getMinutes(), s: now.getSeconds() });

  if (!running.value) return;

  if (mode.value === 'timer') {
    const total = hmsToSeconds(display.h, display.m, display.s);
    if (total <= 0) { triggerAlarm(); return; }
    Object.assign(display, secondsToHMS(total - 1));
  } else {
    const nowSec = hmsToSeconds(clock.h, clock.m, clock.s);
    const targetSec = alarmTargetSeconds() ?? 0;
    const remaining = Math.max(0, targetSec - nowSec);
    Object.assign(display, secondsToHMS(remaining));
    if (remaining === 0) triggerAlarm();
  }
}

function restartInterval() {
  if (interval !== null) clearInterval(interval);
  interval = setInterval(tick, 1000);
}

// ---- Alarm trigger ----
function triggerAlarm() {
  running.value = false;
  showDialog.value = true;
  startAlarmSound();
  startFaviconFlash();
}

// ---- Mode management ----
function resetForMode(newMode: Mode) {
  Object.assign(display, { h: 0, m: 0, s: 0 });
  if (newMode === 'alarm') {
    const now = new Date();
    alarmTime.value = `${pad2(now.getHours())}:${pad2(now.getMinutes())}:00`;
    alarmError.value = '';
  } else {
    Object.assign(timerInput, { h: 0, m: 0, s: 0 });
  }
}

// ---- Computed ----
const canStart = computed(() => {
  if (initializing.value || running.value) return false;
  return mode.value === 'alarm'
    ? isAlarmFuture()
    : hmsToSeconds(timerInput.h, timerInput.m, timerInput.s) > 0;
});

// ---- Button handlers ----
function handleStart() {
  if (mode.value === 'alarm') {
    if (!validateAlarmTime()) return;
    tick(); // sync display immediately before interval fires
  } else {
    Object.assign(display, timerInput);
  }
  running.value = true;
  restartInterval();
}

function handleStop() {
  running.value = false;
}

function handleClear() {
  if (!running.value) resetForMode(mode.value);
}

function handleModeToggle() {
  if (running.value) return;
  mode.value = mode.value === 'timer' ? 'alarm' : 'timer';
  resetForMode(mode.value);
}

function handleCloseDialog() {
  showDialog.value = false;
  stopAlarmSound();
  stopFaviconFlash();
  running.value = false;
  resetForMode(mode.value);
}

// ---- Initialise ----
resetForMode('timer');
tick();
restartInterval();

onMounted(async () => {
  const link = getFaviconLink();
  const faviconPromise = link
    ? buildRedTintedFavicon(link.href).then((url) => {
        originalFaviconHref = link.href;
        redTintedFaviconUrl = url;
      })
    : Promise.resolve();

  const audioPromise = buildAlarmBuffer().then((buf) => { prebuiltBeepBuffer = buf; });

  await Promise.all([faviconPromise, audioPromise]);
  initializing.value = false;
});

onUnmounted(() => {
  if (interval !== null) clearInterval(interval);
  stopAlarmSound();
  stopFaviconFlash();
});
</script>

<template>
  <Teleport to="body">
    <div
      v-if="showDialog"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
    >
      <div class="rounded-sm bg-white p-10 shadow-2xl text-center max-w-sm w-full mx-4">
        <p class="text-5xl mb-4">⏰</p>
        <h2 class="text-2xl font-bold text-slate-900 mb-2">Time's up!</h2>
        <p class="text-slate-500 mb-6">Your timer has finished.</p>
        <button
          class="px-6 py-2 bg-slate-900 text-white rounded-sm font-semibold hover:bg-slate-700 transition-colors"
          @click="handleCloseDialog"
        >
          Close
        </button>
      </div>
    </div>
  </Teleport>

  <div class="relative flex flex-col items-center gap-8">
    <div
      v-if="initializing"
      class="absolute inset-0 z-10 flex items-center justify-center rounded-sm bg-white/80"
    >
      <p class="text-slate-400 text-sm animate-pulse">Initializing…</p>
    </div>

    <div class="flex rounded-sm overflow-hidden border border-slate-300">
      <button
        v-for="m in (['timer', 'alarm'] as const)"
        :key="m"
        class="px-6 py-2 text-sm font-semibold transition-colors capitalize"
        :class="mode === m ? 'bg-slate-900 text-white' : 'bg-white text-slate-600 hover:bg-slate-100'"
        :disabled="running"
        @click="handleModeToggle"
      >
        {{ m }}
      </button>
    </div>

    <p v-if="mode === 'alarm'" class="text-slate-500 text-sm tracking-widest font-mono">
      Current time: {{ clockTime }}
    </p>

    <div class="timer-display text-7xl sm:text-9xl font-mono tracking-widest text-slate-900 select-none">
      {{ displayTime }}
    </div>

    <div class="w-full max-w-sm">
      <div v-if="mode === 'timer'" class="flex items-center justify-center gap-2">
        <template v-for="{ field, label, max } in TIMER_FIELDS" :key="field">
          <span v-if="field !== 'h'" class="text-2xl font-bold text-slate-400 mt-5">:</span>
          <div class="flex flex-col items-center gap-1">
            <label class="text-xs text-slate-500 uppercase tracking-wider">{{ label }}</label>
            <input
              type="number"
              :min="0"
              :max="max"
              :value="pad2(timerInput[field as TimerField])"
              :disabled="running"
              class="w-16 text-center text-xl font-mono border border-slate-300 rounded-sm p-2 disabled:bg-slate-100 disabled:text-slate-400"
              @change="(e) => { timerInput[field as TimerField] = Number((e.target as HTMLInputElement).value); clampTimerField(field as TimerField); }"
              @blur="clampTimerField(field as TimerField)"
            />
          </div>
        </template>
      </div>

      <div v-else class="flex flex-col items-center gap-2">
        <input
          type="time"
          step="1"
          v-model="alarmTime"
          :disabled="running"
          class="border border-slate-300 rounded-sm p-2 text-xl font-mono text-center disabled:bg-slate-100 disabled:text-slate-400"
        />
        <p v-if="alarmError" class="text-sm text-rose-600">{{ alarmError }}</p>
      </div>
    </div>

    <div class="flex gap-3 flex-wrap justify-center">
      <button
        class="px-5 py-2 rounded-sm font-semibold text-sm transition-colors bg-emerald-600 text-white hover:bg-emerald-500 disabled:bg-slate-300 disabled:text-slate-400 disabled:cursor-not-allowed"
        :disabled="!canStart"
        @click="handleStart"
      >
        Start
      </button>
      <button
        class="px-5 py-2 rounded-sm font-semibold text-sm transition-colors bg-amber-500 text-white hover:bg-amber-400 disabled:bg-slate-300 disabled:text-slate-400 disabled:cursor-not-allowed"
        :disabled="!running"
        @click="handleStop"
      >
        Stop
      </button>
      <button
        class="px-5 py-2 rounded-sm font-semibold text-sm transition-colors bg-slate-200 text-slate-700 hover:bg-slate-300 disabled:opacity-40 disabled:cursor-not-allowed"
        :disabled="running"
        @click="handleClear"
      >
        Clear
      </button>
    </div>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Share+Tech+Mono&display=swap');

.timer-display {
  font-family: 'Share Tech Mono', monospace;
}
</style>
