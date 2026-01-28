/**
 * Core cryptographic operations for file encryption/decryption
 * Using AES-256-GCM with PBKDF2 key derivation
 */

const SALT_LENGTH = 32; // 256 bits
const NONCE_LENGTH = 12; // 96 bits (recommended for GCM)
const PBKDF2_ITERATIONS = 600000; // OWASP 2024+ recommendation
const KEY_LENGTH = 256; // AES-256

export interface EncryptResult {
  encryptedData: Uint8Array;
  salt: Uint8Array;
  nonce: Uint8Array;
}

export interface DecryptResult {
  decryptedData: Uint8Array;
}

/**
 * Generate a random salt for key derivation
 */
export function generateSalt(): Uint8Array<ArrayBuffer> {
  const salt = new Uint8Array(SALT_LENGTH);
  crypto.getRandomValues(salt);
  return salt;
}

/**
 * Generate a random nonce for AES-GCM
 */
export function generateNonce(): Uint8Array<ArrayBuffer> {
  const nonce = new Uint8Array(NONCE_LENGTH);
  crypto.getRandomValues(nonce);
  return nonce;
}

/**
 * Derive encryption key from password using PBKDF2
 * Combines password and salt before key derivation
 */
export async function deriveKey(
  password: string,
  salt: Uint8Array<ArrayBuffer>,
  onProgress?: (progress: number) => void
): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  
  const combinedPassword = password;
  const passwordBuffer = encoder.encode(combinedPassword);

  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    passwordBuffer,
    'PBKDF2',
    false,
    ['deriveBits', 'deriveKey']
  );

  onProgress?.(0.1);

  const key = await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: PBKDF2_ITERATIONS,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: KEY_LENGTH },
    false,
    ['encrypt', 'decrypt']
  );

  onProgress?.(1.0);

  return key;
}

/**
 * Encrypt file data using AES-256-GCM
 */
export async function encryptData(
  data: Uint8Array<ArrayBuffer>,
  password: string,
  onProgress?: (progress: number) => void
): Promise<EncryptResult> {
  const salt = generateSalt();
  const nonce = generateNonce();

  onProgress?.(0.1);

  const key = await deriveKey(password, salt, (keyProgress) => {
    onProgress?.(0.1 + keyProgress * 0.3); // 10-40% for key derivation
  });

  onProgress?.(0.4);

  const encryptedBuffer = await crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: nonce,
      tagLength: 128, // 16 bytes authentication tag
    },
    key,
    data
  );

  onProgress?.(1.0);

  return {
    encryptedData: new Uint8Array(encryptedBuffer),
    salt,
    nonce,
  };
}

/**
 * Decrypt file data using AES-256-GCM
 */
export async function decryptData(
  encryptedData: Uint8Array<ArrayBuffer>,
  salt: Uint8Array<ArrayBuffer>,
  nonce: Uint8Array<ArrayBuffer>,
  password: string,
  onProgress?: (progress: number) => void
): Promise<DecryptResult> {
  onProgress?.(0.1);

  const key = await deriveKey(password, salt, (keyProgress) => {
    onProgress?.(0.1 + keyProgress * 0.3); // 10-40% for key derivation
  });

  onProgress?.(0.4);

  try {
    const decryptedBuffer = await crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: nonce,
        tagLength: 128,
      },
      key,
      encryptedData
    );

    onProgress?.(1.0);

    return {
      decryptedData: new Uint8Array(decryptedBuffer),
    };
  } catch (error) {
    throw new Error('Decryption failed: Invalid password or file has been tampered with');
  }
}

/**
 * Combine salt, nonce, and encrypted data into final file format
 * Format: [salt(32)] + [nonce(12)] + [ciphertext + auth_tag(16)]
 */
export function createEncryptedFile(result: EncryptResult): Uint8Array {
  const totalLength = SALT_LENGTH + NONCE_LENGTH + result.encryptedData.length;
  const output = new Uint8Array(totalLength);

  output.set(result.salt, 0);
  output.set(result.nonce, SALT_LENGTH);
  output.set(result.encryptedData, SALT_LENGTH + NONCE_LENGTH);

  return output;
}

/**
 * Parse encrypted file and extract salt, nonce, and encrypted data
 */
export function parseEncryptedFile(fileData: Uint8Array): {
  salt: Uint8Array<ArrayBuffer>;
  nonce: Uint8Array<ArrayBuffer>;
  encryptedData: Uint8Array<ArrayBuffer>;
} {
  if (fileData.length < SALT_LENGTH + NONCE_LENGTH + 16) {
    throw new Error('Invalid encrypted file: File is too small');
  }

  const salt = fileData.slice(0, SALT_LENGTH);
  const nonce = fileData.slice(SALT_LENGTH, SALT_LENGTH + NONCE_LENGTH);
  const encryptedData = fileData.slice(SALT_LENGTH + NONCE_LENGTH);

  return { salt, nonce, encryptedData };
}

/**
 * Check if Web Crypto API is available
 */
export function isCryptoSupported(): boolean {
  return (
    typeof crypto !== 'undefined' &&
    typeof crypto.subtle !== 'undefined' &&
    typeof crypto.getRandomValues !== 'undefined'
  );
}
