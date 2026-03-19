<script setup lang="ts">
import { computed, onMounted, onUnmounted, reactive, ref } from 'vue';
import {
  DEFAULT_LENGTH,
  MAX_LENGTH,
  MIN_LENGTH,
  SYMBOL_GROUPS,
  buildCharacterSet,
  createSymbolSelection,
  generateRandomString,
  isClipboardSupported,
  isCryptoSupported,
  parseLengthInput,
  validateLengthInput,
} from '../../utils/rastor/random';

type FeedbackVariant = 'success' | 'error' | 'info';

const lengthInput = ref(String(DEFAULT_LENGTH));
const lastValidLength = ref(DEFAULT_LENGTH);
const includeUppercase = ref(true);
const selectedSymbols = reactive(createSymbolSelection());
const generatedText = ref('');
const cryptoAvailable = ref(true);
const clipboardAvailable = ref(true);
const feedback = ref<{ message: string; variant: FeedbackVariant } | null>(null);

let feedbackTimer: ReturnType<typeof setTimeout> | null = null;

const feedbackVariantClass: Record<FeedbackVariant, string> = {
  success: 'border-emerald-200 bg-emerald-50 text-emerald-800',
  error: 'border-rose-200 bg-rose-50 text-rose-800',
  info: 'border-blue-200 bg-blue-50 text-blue-800',
};

const lengthError = computed(() => validateLengthInput(lengthInput.value));
const parsedLength = computed(() => parseLengthInput(lengthInput.value));
const allSymbolsSelected = computed(() => SYMBOL_GROUPS.every((symbol) => selectedSymbols[symbol]));
const enabledSymbolCount = computed(() => SYMBOL_GROUPS.filter((symbol) => selectedSymbols[symbol]).length);
const characterSetSize = computed(() => buildCharacterSet(includeUppercase.value, selectedSymbols).length);

const canGenerate = computed(() => cryptoAvailable.value && parsedLength.value !== null);
const canCopy = computed(() => clipboardAvailable.value && generatedText.value.length > 0);

function setFeedback(message: string, variant: FeedbackVariant) {
  feedback.value = { message, variant };

  if (feedbackTimer !== null) {
    clearTimeout(feedbackTimer);
  }

  feedbackTimer = setTimeout(() => {
    feedback.value = null;
    feedbackTimer = null;
  }, 2500);
}

function updateLength(value: string) {
  lengthInput.value = value;

  const parsed = parseLengthInput(value);
  if (parsed !== null) {
    lastValidLength.value = parsed;
  }
}

function handleLengthBlur() {
  if (parseLengthInput(lengthInput.value) === null) {
    lengthInput.value = String(lastValidLength.value);
  }
}

function selectAllSymbols() {
  for (const symbol of SYMBOL_GROUPS) {
    selectedSymbols[symbol] = true;
  }
}

function generate() {
  if (!cryptoAvailable.value) {
    setFeedback('Secure random generation is not supported in this browser.', 'error');
    return;
  }

  const length = parsedLength.value;
  if (length === null) {
    setFeedback(lengthError.value || 'Please enter a valid length.', 'error');
    return;
  }

  generatedText.value = generateRandomString(
    length,
    buildCharacterSet(includeUppercase.value, selectedSymbols),
  );
}

async function copyGeneratedText() {
  if (!generatedText.value) {
    return;
  }

  if (!clipboardAvailable.value) {
    setFeedback('Clipboard access is not available in this browser.', 'error');
    return;
  }

  try {
    await navigator.clipboard.writeText(generatedText.value);
    setFeedback('Copied the generated string.', 'success');
  } catch {
    setFeedback('Failed to copy the generated string.', 'error');
  }
}

onMounted(() => {
  cryptoAvailable.value = isCryptoSupported();
  clipboardAvailable.value = isClipboardSupported();
});

onUnmounted(() => {
  if (feedbackTimer !== null) {
    clearTimeout(feedbackTimer);
  }
});
</script>

<template>
  <div class="space-y-6">
    <div
      v-if="!cryptoAvailable"
      class="rounded-sm border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800"
    >
      Secure random generation is not supported in this browser. Please use a modern browser with the
      Web Crypto API.
    </div>

    <div
      v-if="!clipboardAvailable"
      class="rounded-sm border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800"
    >
      Clipboard copy is not available in this browser. You can still generate and manually select the text.
    </div>

    <div
      v-if="feedback"
      class="rounded-sm border px-4 py-3 text-sm"
      :class="feedbackVariantClass[feedback.variant]"
    >
      {{ feedback.message }}
    </div>

    <div class="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
      <section class="space-y-6">
        <div class="rounded-sm border border-slate-200 bg-slate-50 p-5">
          <label class="block">
            <span class="mb-2 block text-sm font-medium text-slate-700">Length</span>
            <input
              :value="lengthInput"
              type="number"
              inputmode="numeric"
              :min="MIN_LENGTH"
              :max="MAX_LENGTH"
              class="w-full rounded-sm border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:border-slate-500 focus:outline-none"
              @input="updateLength(($event.target as HTMLInputElement).value)"
              @blur="handleLengthBlur"
            />
          </label>

          <p class="mt-2 text-xs text-slate-500">
            Allowed range: {{ MIN_LENGTH }}-{{ MAX_LENGTH }} characters.
          </p>

          <p v-if="lengthError" class="mt-2 text-sm text-rose-700">
            {{ lengthError }}
          </p>
        </div>

        <div class="rounded-sm border border-slate-200 bg-slate-50 p-5">
          <div class="flex items-start justify-between gap-4">
            <div>
              <h2 class="text-sm font-medium text-slate-700">Character Set</h2>
              <p class="mt-1 text-xs text-slate-500">
                Lowercase letters and digits are always included.
              </p>
            </div>

            <button
              type="button"
              class="rounded-sm border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-700 transition hover:border-slate-400 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
              :disabled="allSymbolsSelected"
              @click="selectAllSymbols"
            >
              Select all symbols
            </button>
          </div>

          <label class="mt-4 flex items-center gap-3 rounded-sm border border-slate-200 bg-white px-3 py-3 text-sm text-slate-800">
            <input
              v-model="includeUppercase"
              type="checkbox"
              class="h-4 w-4 rounded-sm border-slate-300 text-slate-900 focus:ring-slate-400"
            />
            <span>Include uppercase letters (`A-Z`)</span>
          </label>

          <div class="mt-4">
            <div class="mb-2 flex items-center justify-between text-xs text-slate-500">
              <span>Selectable symbols</span>
              <span>{{ enabledSymbolCount }} selected</span>
            </div>

            <div class="grid grid-cols-2 gap-2 sm:grid-cols-3">
              <label
                v-for="symbol in SYMBOL_GROUPS"
                :key="symbol"
                class="flex items-center gap-2 rounded-sm border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800"
              >
                <input
                  v-model="selectedSymbols[symbol]"
                  type="checkbox"
                  class="h-4 w-4 rounded-sm border-slate-300 text-slate-900 focus:ring-slate-400"
                />
                <span class="font-mono">{{ symbol }}</span>
              </label>
            </div>
          </div>
        </div>
      </section>

      <section class="rounded-sm border border-slate-200 bg-slate-50 p-5">
        <div class="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 class="text-sm font-medium text-slate-700">Generated String</h2>
            <p class="mt-1 text-xs text-slate-500">
              Character pool size: {{ characterSetSize }}
            </p>
          </div>

          <div class="flex gap-3">
            <button
              type="button"
              class="rounded-sm bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
              :disabled="!canGenerate"
              @click="generate"
            >
              Generate
            </button>
            <button
              type="button"
              class="rounded-sm border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
              :disabled="!canCopy"
              @click="copyGeneratedText"
            >
              Copy
            </button>
          </div>
        </div>

        <div
          class="mt-4 min-h-64 overflow-auto rounded-sm bg-slate-950 px-4 py-4 font-mono text-lg leading-relaxed text-slate-100 shadow-inner break-all"
        >
          <template v-if="generatedText">
            {{ generatedText }}
          </template>
          <p v-else class="text-sm text-slate-400">
            Generate a random string to display it here.
          </p>
        </div>

        <div class="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
          <span>Current output length: {{ generatedText.length }}</span>
          <span>Copy is enabled after a string is generated.</span>
        </div>
      </section>
    </div>
  </div>
</template>
