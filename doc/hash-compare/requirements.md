# Hash Compare Tool Requirements

## Overview
Provide a web tool that calculates hash values from two inputs (file or text) and immediately determines whether they match.

## Core Features

### 1. Hash Algorithm Selection
- Support the following algorithms:
  - MD5
  - SHA-1
  - SHA-256
  - SHA-384
  - SHA-512
  - RIPEMD-160
  - BLAKE3
- Default selection must be MD5.

### 2. Dual Inputs (Left / Right)
- Provide independent input areas for left and right values.
- Each input must support:
  1. File input via drag-and-drop
  2. Direct text input / paste

### 3. Hash Calculation and Comparison
- A single "Calculate Hash" action must hash both sides with the currently selected algorithm.
- Output format must be uppercase hexadecimal.
- Show "Match" when both hashes are identical, otherwise show "Mismatch".
- Result state must be visually distinguishable with clear status colors.

## Input Interpretation Rules
- If the input is a valid file path/source, hash the raw file bytes.
- If file reading is not available, hash the input as a UTF-8 string.
- Apply the same rules to both left and right inputs.

## UI Requirements
- The page must include:
  - Algorithm selector
  - Left and right input areas
  - Left and right hash output areas
  - Match/mismatch result area
- Support responsive layout (mobile and desktop).
- Use Tailwind CSS `rounded-sm` for all rounded corners.
- Include a navigation link at the top to return to the top page.

## Technical Requirements
- Implement the tool using Astro for the page shell and Vue 3 for interactive components.
- Complete all hash processing on the client side.
- Implement all supported hash algorithms using WebAssembly.
- Use `hash-wasm` as the WebAssembly implementation library for MD5, SHA-1, SHA-256, SHA-384, SHA-512, RIPEMD-160, and BLAKE3.

## Error Handling
- If file reading fails and text fallback is used, make that behavior visible to the user.
- If hash calculation fails, show an explicit error and keep the UI ready for retry.

## Page URL
- `/hash-compare`
