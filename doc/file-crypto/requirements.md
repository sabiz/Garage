# File Encryption/Decryption Tool - Requirements

## Overview
A web-based file encryption and decryption tool that allows users to secure their files using password-based AES encryption. This tool is based on the [ladon](https://github.com/sabiz/ladon) CLI application, adapted for browser use.

## Feature Description
This tool provides secure file encryption and decryption functionality directly in the browser, without uploading files to any server. All cryptographic operations are performed client-side using the Web Crypto API.

## Core Functionality

### 1. Encryption
- User selects a file to encrypt
- User enters a password (with confirmation)
- System generates a random 32-byte salt
- System derives an encryption key using PBKDF2-SHA256 (600,000 iterations)
- System generates a random 12-byte nonce
- System encrypts the file using AES-256-GCM (produces ciphertext + 16-byte authentication tag)
- System outputs: salt (32 bytes) + nonce (12 bytes) + encrypted data (includes auth tag)
- User downloads the encrypted file

### 2. Decryption
- User selects an encrypted file
- User enters the password
- System extracts salt from the first 32 bytes of the file
- System derives the encryption key using PBKDF2-SHA256 (600,000 iterations)
- System extracts nonce (next 12 bytes) and encrypted data (remaining bytes)
- System decrypts and verifies authentication tag using AES-256-GCM
- If authentication fails, displays tampering detection error
- User downloads the decrypted file

## Technical Specifications

### Cryptographic Algorithm
- **Algorithm**: AES-256-GCM (Galois/Counter Mode)
  - **Mode**: AEAD (Authenticated Encryption with Associated Data)
  - **Authentication Tag**: 16 bytes (128 bits)
- **Key Derivation**: PBKDF2-SHA256
  - **Iterations**: 600,000 (OWASP recommendation for 2024+)
  - **Key Length**: 256 bits (32 bytes)
  - **Hash Function**: SHA-256
- **Salt**: 32 bytes, randomly generated using crypto.getRandomValues()
- **Nonce**: 12 bytes (96 bits), randomly generated using crypto.getRandomValues()
- **File Format**: [salt(32)] + [nonce(12)] + [ciphertext + auth_tag(16)]

### AES-GCM Advantages
- **Authenticated Encryption**: Detects tampering and prevents data modification
- **Performance**: Faster than CBC mode with separate MAC
- **Security**: Industry standard for modern encryption (TLS 1.3, IPsec)
- **No Padding**: Stream cipher mode, no padding oracle attacks

### PBKDF2 Parameters Rationale
- **600,000 iterations**: Balances security and performance for 2024-2026
- Protects against brute-force attacks while maintaining usable encryption/decryption times
- For reference: ~100-200ms on modern hardware for key derivation

### Security Notes
- **Nonce Uniqueness**: Each encryption operation must use a unique nonce with the same key
- **Random Nonces**: Using crypto.getRandomValues() ensures uniqueness (12 bytes = 2^96 combinations)
- **Authentication**: GCM automatically verifies data integrity during decryption

### UI Components

#### Mode Selection
- Radio buttons or tabs to switch between "Encrypt" and "Decrypt" modes

#### Encrypt Mode
- File input field with drag-and-drop support
- Password input field (type="password")
- Password confirmation field
- Visual password strength indicator
- "Encrypt" button
- Download link for the encrypted file (appears after encryption)

#### Decrypt Mode
- File input field with drag-and-drop support
- Password input field (type="password")
- "Decrypt" button
- Download link for the decrypted file (appears after decryption)

#### Shared Elements
- Clear status messages (success/error)
- Loading indicator during processing
- File information display (name, size)
- Navigation link to return to top page

## Implementation Requirements

### File Structure
```
src/
├── pages/
│   └── file-crypto.astro          # Main page
├── components/
│   └── file-crypto/
│       ├── FileCrypto.vue         # Main component
│       ├── EncryptPanel.vue       # Encryption UI
│       └── DecryptPanel.vue       # Decryption UI
└── utils/
    └── file-crypto/
        ├── crypto.ts              # Core encryption/decryption logic
        ├── file-handler.ts        # File reading/writing utilities
        ├── password.ts            # Password validation utilities
        └── crypto-worker.ts       # Web Worker for large file processing (optional)
```

### Technology Stack
- **Framework**: Astro + Vue 3
- **Styling**: Tailwind CSS (with `rounded-sm` for rounded corners)
- **Crypto**: Web Crypto API (SubtleCrypto)
- **File Handling**: File API, Blob, FileReader

### Security Considerations
- All operations must be performed client-side
- No data should be sent to any server
- Clear sensitive data from memory after use
- Warn users to remember their passwords (no recovery possible)
- Display warning about the security implications of weak passwords

### User Experience
- Responsive design for mobile and desktop
- Clear visual feedback for all operations
- Disabled buttons during processing
- File size validation (maximum: 1GB, warning at: 100MB)
- Browser compatibility check (Web Crypto API support)

### Performance Considerations
- **File Size Limit**: Maximum 1GB per file to ensure browser stability
- **Non-blocking Processing**: Use Web Workers for cryptographic operations to prevent UI freezing
- **Web Worker Usage**: 
  - Files <10MB: Process in main thread for simplicity
  - Files ≥10MB: Delegate to Web Worker for UI responsiveness
- **Progress Feedback**: Display progress indicator during key derivation and encryption/decryption
- **Async Operations**: Use async/await patterns to maintain UI responsiveness
- **Memory Management**: 
  - Release file buffers immediately after processing
  - Clear ArrayBuffers to prevent memory leaks
  - Use transferable objects when posting to Web Workers
- **UI Updates**: Update progress at reasonable intervals (every 100-200ms) to avoid excessive DOM manipulation
- **User Feedback**: Show file size warnings for files >100MB before processing

### Error Handling
- Invalid file format errors
- Password mismatch errors
- Decryption failure (wrong password)
- Authentication failure (file tampering detected)
- Browser compatibility errors
- File reading errors

## Page URL
`/file-crypto`

## UI/UX Guidelines
1. Use Tailwind CSS `rounded-sm` for all rounded corners
2. Include a prominent "Back to Home" link at the top of the page
3. Use clear, descriptive labels for all inputs
4. Provide inline help text where necessary
5. Show file names and sizes before processing
6. Automatically trigger download after successful encryption/decryption
