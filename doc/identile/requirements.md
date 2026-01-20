# Identile - Identicon Generator

## Overview
Identile is a web-based tool that generates unique visual identicons from text input. An identicon is a visual representation of a hash value, commonly used for user avatars or unique visual identifiers.

## Technology Stack
- Astro framework with Vue integration
- Vue 3 composition API
- Canvas API for image rendering
- TypeScript for type safety

## Core Features

### 1. Text Input
- Allow users to input any text string
- Real-time identicon generation as user types
- Support for custom salt value (optional)

### 2. Hash Algorithm Selection
- Support multiple hash algorithms:
  - MD5 (default)
  - SHA-1
  - SHA-256
  - SHA-512
- Algorithm selector UI component

### 3. Identicon Generation
- Generate a unique 7x7 pixel pattern based on hash code
- Use 32-bit hash code to determine:
  - **Bit 0-6**: Frame pattern type
  - **Bit 7**: Center fill type
  - **Bit 8**: Cross pattern type
  - **Bit 9**: Turn-cross pattern type
  - **Bit 10**: Slash pattern type
  - **Bit 11-13**: Inner pattern type
  - **Bit 14-18**: Fill options
  - **Bit 19-23**: Saturation (HSV)
  - **Bit 24-31**: Hue (HSV)
- Color generation using HSV color space
- Symmetric pattern design for aesthetic consistency

### 4. Customization Options
- Icon size selection (default: 200px)
  - Preset sizes: 64px, 128px, 200px, 256px, 512px
  - Custom size input
- Salt value input for hash variation
- Color scheme options:
  - Auto (based on hash)
  - Custom base color picker (optional enhancement)

### 5. Preview and Display
- Real-time preview of generated identicon
- Display on HTML Canvas element
- Smooth rendering with appropriate scaling

### 6. Download Functionality
- Download generated identicon as PNG image
- Filename format: `identile-{input-text}.png`
- Preserve selected size in downloaded image

### 7. User Interface
- Clean, intuitive layout
- Responsive design for mobile and desktop
- Input controls grouped logically:
  - Text input section
  - Algorithm and options section
  - Preview section
  - Action buttons section

## Technical Implementation

### Architecture
```
src/
  pages/
    identile.astro          # Main page
  components/
    identile/
      IdentileGenerator.vue  # Main Vue component
      IdentileCanvas.vue     # Canvas rendering component
      IdentileControls.vue   # Input controls component
  utils/
    identile/
      hash.ts                # Hash generation functions
      renderer.ts            # Identicon rendering logic
      colors.ts              # Color calculation utilities
```

### Hash Generation Algorithm
1. Combine input text with salt: `{text}@{salt}`
2. Generate hash using selected algorithm
3. Extract 4 bytes from specific positions in hash:
   - MD5: bytes [0, 5, 8, 15]
   - SHA-1: bytes [0, 6, 11, 19]
   - SHA-256: bytes [0, 9, 16, 31]
   - SHA-512: bytes [0, 17, 49, 63]
4. Combine bytes into 32-bit unsigned integer

### Rendering Algorithm
1. Create 7x7 pixel grid
2. Apply frame pattern (symmetric)
3. Apply inner patterns based on decoded bits:
   - Center pattern
   - Cross pattern
   - Turn-cross pattern
   - Slash pattern
4. Calculate colors:
   - Base color from HSV (extracted from hash)
   - Secondary/tertiary colors using triad color scheme
5. Scale up to target size using nearest-neighbor interpolation
6. Render to Canvas

### Color Scheme
- Use HSV color space for vibrant colors
- Hue: 0-255 mapped to 0-360 degrees
- Saturation: 0-31 mapped to 0-100%
- Value: Fixed at 100% for brightness
- Triad colors: +120° and +240° from base hue

## User Experience Requirements

### Performance
- Identicon generation should be near-instantaneous
- No perceivable lag when typing or changing options
- Efficient Canvas rendering

### Accessibility
- Proper labels for all input controls
- Keyboard navigation support
- Alt text for generated images
- Color contrast compliance

### Error Handling
- Handle empty input gracefully
- Validate size inputs
- Show appropriate error messages

## Future Enhancements (Not in Initial Scope)
- Multiple identicon styles/templates
- Batch generation from CSV
- API endpoint for programmatic access
- SVG export option
- Animation effects
- Social sharing features

## Testing Considerations
- Verify hash generation matches expected values
- Test with various input lengths and characters
- Verify symmetry in generated patterns
- Cross-browser compatibility
- Responsive design testing

## References
- Original Go implementation: https://github.com/sabiz/identile
- Identicon concept: https://en.wikipedia.org/wiki/Identicon
