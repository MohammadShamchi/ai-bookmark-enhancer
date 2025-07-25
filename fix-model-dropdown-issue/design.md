# Fix Model Dropdown Issue - Design Document

## Overview

This design resolves the model dropdown visibility issues by addressing stacking context containment caused by backdrop-filter and transforms. It moves the dropdown to body level for true viewport-relative positioning while maintaining the premium UI aesthetic and adding safeguards for extension environment constraints.

## Architecture

### Positioning System
- **DOM Relocation**: Dynamically append dropdown to body on show to escape local stacking contexts.
- **Coordinate Calculation**: Use getBoundingClientRect() with window.scroll offsets for accurate placement.
- **Fallback Mechanism**: Detect extension environment and switch to absolute positioning if fixed fails.

### Layering System
- **Z-Index Hierarchy**: Set dropdown to z-index: 2147483647 to exceed any potential browser limits.
- **Stacking Context Isolation**: Avoid properties that create new contexts in parent elements.

## Components and Interfaces

### Model Dropdown
```css
.model-dropdown {
  position: fixed;
  z-index: 2147483647;
  /* Additional styles */
}
```

### Positioning Function
```javascript
function positionDropdown() {
  const badgeRect = modelBadge.getBoundingClientRect();
  const dropdown = modelDropdown;
  
  // Append to body if not already
  if (dropdown.parentElement !== document.body) {
    document.body.appendChild(dropdown);
  }
  
  dropdown.style.top = `${badgeRect.bottom + window.scrollY + 4}px`;
  dropdown.style.left = `${badgeRect.right + window.scrollX - dropdown.offsetWidth}px`;
}
```

## Data Models

### Position Data
```typescript
interface PositionData {
  top: number;
  left: number;
  viewportHeight: number;
  viewportWidth: number;
  dropdownHeight: number;
}
```

## Error Handling

### Positioning Failure
- **Scenario**: Dropdown clipped by popup bounds
- **Handling**: Adjust position to stay within viewport with min/max calculations

### Stacking Conflict
- **Scenario**: Browser wrapper overrides z-index
- **Handling**: Use maximum possible z-index and test in extension context

## Testing Strategy

### Visual Testing
- **Approach**: Automated screenshot comparison
- **Tools**: Puppeteer
- **Validation**: Dropdown visible in all positions

### Position Testing
- **Approach**: Unit tests for coordinate calculations
- **Tools**: Jest
- **Validation**: Positions match expected values

## Implementation Details

### JS Updates
```javascript
modelBadge.addEventListener('click', () => {
  positionDropdown();
  modelDropdown.classList.toggle('show');
});
```

### Technology Choices
- **Fixed Positioning**: For viewport attachment in extensions
- **DOM Manipulation**: To break out of containing blocks
- **Bounding Rect**: Reliable cross-browser positioning
``` 
