# Timer Tool Requirements

## Overview

A web-based timer tool with two modes: a countdown timer and an alarm (notification at a specified time).

---

## Core Features

### 1. Operation Modes

| Mode | Description |
|------|-------------|
| **Timer Mode** | Counts down from a configured time (HH:MM:SS) and notifies when it reaches 0 |
| **Alarm Mode** | Notifies when the current time reaches a configured target time (HH:MM:SS) |

- Switch between modes using the mode toggle button at the top of the screen.
- Timer mode maximum values: hours 99 / minutes 59 / seconds 59
- Alarm mode maximum values: hours 23 / minutes 59 / seconds 59 (per `input type="time"` constraints)
- Reset the time display when switching modes:
  - Timer → 00:00:00
  - Alarm → current time (HH:MM:00)

---

### 2. Time Display

- Display the time prominently in HH:MM:SS format.
- Use a 7-segment-style font ([Share Tech Mono](https://fonts.google.com/specimen/Share+Tech+Mono) from Google Fonts or an equivalent monospace font).
- In Alarm mode, display the current time in real-time somewhere on the screen.

---

### 3. Time Input

#### Timer Mode

- Use separate `<input type="number">` fields for hours, minutes, and seconds.
  - Hours: 0–99, Minutes: 0–59, Seconds: 0–59
  - Each field displays as zero-padded 2 digits.
- Disable all inputs after Start is pressed.

#### Alarm Mode

- Use `<input type="time" step="1">` to provide the browser's native time input UI.
- The input value is treated as the target time (HH:MM:SS) at which the alarm fires.
- Disable the input after Start is pressed.

---

### 4. Control Buttons

| Button | Behavior |
|--------|----------|
| **Start** | Starts the timer / alarm. Disables time input, mode toggle, and clear while running |
| **Stop** | Stops the timer / alarm without resetting the time |
| **Clear** | Resets the time to 00:00:00 (only available when stopped) |
| **Mode** | Toggles between Timer and Alarm modes (only available when stopped) |

---

### 5. Alarm Notification

When time is up, the following actions are triggered simultaneously:

#### 5-1. Alarm Sound

- Generate and play alarm audio programmatically using the Web Audio API (no external audio files).
- Sound pattern: intermittent beep using sine waves at multiple frequencies.
- Loop playback until the dialog is closed.

#### 5-2. Modal Dialog

- Display a modal dialog in the center of the screen with a message such as "Time's up!".
- Closing the dialog via a "Close" button stops the alarm sound.

#### 5-3. Favicon Animation

- Flash the favicon while the notification dialog is open.
- Implementation: draw on a `<canvas>` element in JavaScript, convert to a base64 DataURL via `canvas.toDataURL('image/png')`, and dynamically swap the `<link rel="icon">`.
- Flash pattern: alternate between the default favicon and a filled red circle every 500ms.
- Restore the original favicon and stop flashing when the dialog is closed.

---

### 6. Current Time Display (Alarm Mode)

- While in Alarm mode, update and display the current time every second.
- Format: `Current time: HH:MM:SS`

---

## UI Requirements

- Include a navigation link at the top of the page to return to the top page.
- Responsive layout (mobile and desktop support).
- Use Tailwind CSS `rounded-sm` for rounded corners.
- Display control buttons in a row (Start / Stop / Clear / Mode).

---

## Technical Requirements

- Implement using an Astro page shell with a Vue 3 interactive component.
- All processing must be completed on the client side.
- Use the Web Audio API for alarm sound generation and playback (no external audio files required).

---

## Error Handling

- If the Web Audio API is unavailable, display the dialog only without playing alarm sound.
- In Alarm mode, if the configured time is in the past relative to the current time, disable the Start button and display an error message.

---

## Page URL

- `/timer`
