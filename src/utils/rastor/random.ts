export const DEFAULT_LENGTH = 16;
export const MIN_LENGTH = 1;
export const MAX_LENGTH = 1024;

const LOWERCASE_AND_DIGITS = 'abcdefghijklmnopqrstuvwxyz0123456789';
const UPPERCASE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

export const SYMBOL_GROUPS = [
  '()',
  '[]',
  '{}',
  '<>',
  '$',
  '%',
  '@',
  '#',
  '&',
  '?',
  '!',
  '-',
  '=',
  '_',
  '/',
  '*',
  '+',
  '\\',
  '|',
  '~',
  '"',
  "'",
  '`',
  '^',
  ',',
  '.',
  ':',
  ';',
] as const;

export type SymbolSelection = Record<(typeof SYMBOL_GROUPS)[number], boolean>;

export function createSymbolSelection(): SymbolSelection {
  return Object.fromEntries(
    SYMBOL_GROUPS.map((symbol) => [symbol, false]),
  ) as SymbolSelection;
}

export function validateLengthInput(value: string): string {
  const trimmed = value.trim();

  if (trimmed.length === 0) {
    return 'Length is required.';
  }

  const length = Number(trimmed);

  if (!Number.isInteger(length)) {
    return `Length must be an integer between ${MIN_LENGTH} and ${MAX_LENGTH}.`;
  }

  if (length < MIN_LENGTH || length > MAX_LENGTH) {
    return `Length must be between ${MIN_LENGTH} and ${MAX_LENGTH}.`;
  }

  return '';
}

export function parseLengthInput(value: string): number | null {
  return validateLengthInput(value) ? null : Number(value.trim());
}

export function buildCharacterSet(
  includeUppercase: boolean,
  selectedSymbols: Record<string, boolean>,
): string {
  let characters = LOWERCASE_AND_DIGITS;

  if (includeUppercase) {
    characters += UPPERCASE;
  }

  for (const symbol of SYMBOL_GROUPS) {
    if (selectedSymbols[symbol]) {
      characters += symbol;
    }
  }

  return characters;
}

export function isCryptoSupported(): boolean {
  return typeof globalThis !== 'undefined' && typeof globalThis.crypto?.getRandomValues === 'function';
}

export function isClipboardSupported(): boolean {
  return typeof navigator !== 'undefined' && typeof navigator.clipboard?.writeText === 'function';
}

export function generateRandomString(length: number, characters: string): string {
  if (!isCryptoSupported()) {
    throw new Error('Secure random generation is not supported in this browser.');
  }

  if (characters.length === 0) {
    throw new Error('Character set must not be empty.');
  }

  const values = new Uint32Array(length);
  globalThis.crypto.getRandomValues(values);

  return Array.from(values, (value) => characters[value % characters.length]).join('');
}
