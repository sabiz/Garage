import { md5, sha1, sha256, sha512 } from 'hash-wasm';

export type HashAlgorithm = 'md5' | 'sha1' | 'sha256' | 'sha512';

const HASH_BYTE_INDICES: Record<HashAlgorithm, [number, number, number, number]> = {
  md5: [0, 5, 8, 15],
  sha1: [0, 6, 11, 19],
  sha256: [0, 9, 16, 31],
  sha512: [0, 17, 49, 63]
};

const HASH_FUNCTIONS: Record<HashAlgorithm, (value: string) => Promise<string>> = {
  md5,
  sha1,
  sha256,
  sha512
};

function hexToBytes(hex: string): number[] {
  const bytes: number[] = [];

  for (let i = 0; i < hex.length; i += 2) {
    bytes.push(Number.parseInt(hex.slice(i, i + 2), 16));
  }

  return bytes;
}

/**
 * Computes a 32-bit hash code from the given text and salt using the specified algorithm.
 * 
 * @param text - The input text to be hashed
 * @param salt - A salt value to add randomness to the hash
 * @param algorithm - The hashing algorithm to use ('md5', 'sha1', 'sha256', or 'sha512')
 * @returns A 32-bit unsigned integer hash code derived from selected bytes of the hash output
 * 
 * @remarks
 * This function:
 * 1. Combines the text and salt into a JSON string
 * 2. Computes a hash using the specified algorithm
 * 3. Extracts 4 specific bytes from the hash (positions vary by algorithm)
 * 4. Combines these bytes into a 32-bit unsigned integer
 * 
 * The byte positions used depend on the algorithm:
 * - MD5: bytes at indices [0, 5, 8, 15]
 * - SHA1: bytes at indices [0, 6, 11, 19]
 * - SHA256: bytes at indices [0, 9, 16, 31]
 * - SHA512: bytes at indices [0, 17, 49, 63]
 */
export async function computeHashCode(text: string, salt: string, algorithm: HashAlgorithm): Promise<number> {
  const input = JSON.stringify({ text, salt });
  const hashHex = await HASH_FUNCTIONS[algorithm](input);
  const bytes = hexToBytes(hashHex);
  const [b0, b1, b2, b3] = HASH_BYTE_INDICES[algorithm].map((index) => bytes[index] ?? 0);

  return (((b0 << 24) | (b1 << 16) | (b2 << 8) | b3) >>> 0);
}
