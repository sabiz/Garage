# Rastor Tool Requirements

## Overview

A web-based random string generator inspired by [`sabiz/Rastor`](https://github.com/sabiz/Rastor).

The tool allows users to generate a random string with a configurable length and character set. It is intended for use cases such as temporary identifiers, test data, sample tokens, and other non-secret random text generation.

---

## Core Features

### 1. String Generation

- Generate a random string on demand.
- The generated string must use the browser's cryptographically secure random API (`window.crypto.getRandomValues`) rather than `Math.random()`.
- A new random string is generated each time the user presses the **Generate** button.
- The generated result is displayed prominently in a dedicated output area.

---

### 2. Length Configuration

- Provide a numeric input for the generated string length.
- Default length: `16`
- Minimum length: `1`
- Maximum length: `1024`
- Prevent invalid values from being applied.
- If the user enters an out-of-range value, the UI must clearly indicate the validation error and keep the last valid value.

---

### 3. Character Set Configuration

The generated string is built from the following character groups.

#### 3-1. Always Included

- Lowercase alphabet: `a-z`
- Digits: `0-9`

#### 3-2. Optional Groups

- Uppercase alphabet: `A-Z`
- Selectable symbol groups:
  - `()`
  - `[]`
  - `{}`
  - `<>`
  - `$`
  - `%`
  - `@`
  - `#`
  - `&`
  - `?`
  - `!`
  - `-`
  - `=`
  - `_`
  - `/`
  - `*`
  - `+`
  - `\`
  - `|`
  - `~`
  - `"`
  - `'`
  - `` ` ``
  - `^`
  - `,`
  - `.`
  - `:`
  - `;`

---

### 4. Character Set Controls

- Provide a checkbox to include or exclude uppercase alphabet characters.
- Provide individual checkboxes for each symbol group.
- Provide a **Select all symbols** action that enables every symbol checkbox at once.
- The configuration state must immediately affect subsequent generations.

---

### 5. Generated Result Area

- Display the generated string in a large, easy-to-read monospace area.
- The result area must support long strings without breaking the layout.
- Long output may wrap or scroll horizontally, but the text must remain readable and selectable.
- Before the first generation, the result area may be empty.

---

### 6. Copy to Clipboard

- Provide a dedicated control to copy the generated string to the clipboard.
- After a successful copy, show brief positive feedback such as a toast message.
- If there is no generated string yet, the copy control should be disabled or otherwise prevented from performing a meaningless action.
- If clipboard access fails, show an explicit error message to the user.

---

## UI Requirements

- Include a navigation link at the top of the page to return to the top page.
- Keep the page structure consistent with other Garage tool pages: a back link and the main tool content.
- Use a responsive layout that works on both desktop and mobile screens.
- Use Tailwind CSS `rounded-sm` when rounded corners are needed.
- Group configuration controls and generated output so the workflow is easy to understand:
  1. Configure options
  2. Generate text
  3. Copy the result

---

## Technical Requirements

- Implement as an Astro page shell with a Vue 3 interactive component.
- Complete all processing on the client side.
- Use the browser Clipboard API for copy functionality.
- Use the browser Crypto API for random value generation.
- Do not send generated strings or configuration values to any server.

---

## Error Handling

- If the browser Crypto API is unavailable, disable generation and show an error message explaining that secure random generation is not supported.
- If the Clipboard API is unavailable or a copy operation fails, show an error message explaining that the copy action could not be completed.
- If the length input is empty, non-numeric, or out of range, prevent generation until the value becomes valid.

---

## Page URL

- `/rastor`
