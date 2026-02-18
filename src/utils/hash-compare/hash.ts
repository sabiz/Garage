import { blake3, md5, ripemd160, sha1, sha256, sha384, sha512 } from 'hash-wasm';

export type HashAlgorithm = 'MD5' | 'SHA-1' | 'SHA-256' | 'SHA-384' | 'SHA-512' | 'RIPEMD-160' | 'BLAKE3';

export const HASH_ALGORITHMS: HashAlgorithm[] = [
  'MD5', 'SHA-1', 'SHA-256', 'SHA-384', 'SHA-512', 'RIPEMD-160', 'BLAKE3',
];

const hashFns: Record<HashAlgorithm, (data: Uint8Array) => Promise<string>> = {
  MD5: md5,
  'SHA-1': sha1,
  'SHA-256': sha256,
  'SHA-384': sha384,
  'SHA-512': sha512,
  'RIPEMD-160': ripemd160,
  BLAKE3: blake3,
};

/**
 * Calculate hash of given bytes using the specified algorithm.
 * Returns uppercase hexadecimal string.
 */
export async function calculateHash(algorithm: HashAlgorithm, bytes: Uint8Array): Promise<string> {
  const fn = hashFns[algorithm];
  if (!fn) throw new Error(`Unsupported algorithm: ${algorithm}`);
  return (await fn(bytes)).toUpperCase();
}

/**
 * Read a File as Uint8Array, falling back to UTF-8 encoding of fallbackText on failure.
 * Returns the bytes and an optional warning message when fallback is used.
 */
export async function readFileBytes(
  file: File,
  fallbackText: string,
): Promise<{ bytes: Uint8Array; fallbackWarning: string }> {
  try {
    return { bytes: new Uint8Array(await file.arrayBuffer()), fallbackWarning: '' };
  } catch {
    return {
      bytes: new TextEncoder().encode(fallbackText),
      fallbackWarning: `File "${file.name}" read failed. Used UTF-8 text fallback.`,
    };
  }
}
