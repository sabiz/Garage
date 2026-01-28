/**
 * File handling utilities for reading and writing files
 */

const MAX_FILE_SIZE = 1024 * 1024 * 1024; // 1GB
const WARNING_FILE_SIZE = 100 * 1024 * 1024; // 100MB

export interface FileInfo {
  name: string;
  size: number;
  type: string;
}

/**
 * Read file as Uint8Array
 */
export function readFileAsBytes(file: File): Promise<Uint8Array> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      if (reader.result instanceof ArrayBuffer) {
        resolve(new Uint8Array(reader.result));
      } else {
        reject(new Error('Failed to read file as ArrayBuffer'));
      }
    };

    reader.onerror = () => {
      reject(new Error('File reading failed: ' + reader.error?.message));
    };

    reader.readAsArrayBuffer(file);
  });
}

/**
 * Create a downloadable Blob from Uint8Array
 */
export function createDownloadBlob(data: Uint8Array<ArrayBuffer>, mimeType: string = 'application/octet-stream'): Blob {
  return new Blob([data], { type: mimeType });
}

/**
 * Trigger file download
 */
export function downloadFile(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 100);
}

/**
 * Validate file size
 */
export function validateFileSize(file: File): { valid: boolean; needsWarning: boolean; error?: string } {
  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      needsWarning: false,
      error: `File size exceeds maximum limit of ${formatFileSize(MAX_FILE_SIZE)}`,
    };
  }

  if (file.size > WARNING_FILE_SIZE) {
    return {
      valid: true,
      needsWarning: true,
    };
  }

  return {
    valid: true,
    needsWarning: false,
  };
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Get file extension
 */
function getFileExtension(filename: string): string {
  const lastDotIndex = filename.lastIndexOf('.');
  return lastDotIndex === -1 ? '' : filename.slice(lastDotIndex);
}

/**
 * Add suffix to filename before extension
 */
function addFilenameSuffix(filename: string, suffix: string): string {
  const extension = getFileExtension(filename);
  const nameWithoutExtension = extension ? filename.slice(0, -extension.length) : filename;
  return nameWithoutExtension + suffix + extension;
}

/**
 * Remove suffix from filename
 */
function removeFilenameSuffix(filename: string, suffix: string): string {
  const extension = getFileExtension(filename);
  const nameWithoutExtension = extension ? filename.slice(0, -extension.length) : filename;

  if (nameWithoutExtension.endsWith(suffix)) {
    return nameWithoutExtension.slice(0, -suffix.length) + extension;
  }

  return filename;
}

/**
 * Get encrypted filename
 */
export function getEncryptedFilename(originalFilename: string): string {
  return addFilenameSuffix(originalFilename, '.encrypted');
}

/**
 * Get decrypted filename
 */
export function getDecryptedFilename(encryptedFilename: string): string {
  return removeFilenameSuffix(encryptedFilename, '.encrypted');
}

/**
 * Clear ArrayBuffer/Uint8Array from memory (best effort)
 */
export function clearBuffer(buffer: Uint8Array | ArrayBuffer): void {
  try {
    if (buffer instanceof Uint8Array) {
      buffer.fill(0);
    }
    // Note: Cannot directly clear ArrayBuffer, but can clear views
  } catch (error) {
    // Silently fail if buffer is already cleared or inaccessible
  }
}
