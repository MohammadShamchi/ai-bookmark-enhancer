# Fix Z-Index and Spacing - Design Document

## Overview

This design addresses z-index conflicts in the model dropdown and optimizes spacing in the progress section for better usability. It ensures the dropdown is always visible above other elements and provides comfortable, readable spacing in status displays while maintaining the premium aesthetic.

## Architecture

### Layering System
- **Z-Index Hierarchy**: Set model-dropdown to z-index: 10000 with !important to override conflicts.
- **Positioning**: Use position: fixed if needed to attach dropdown to viewport.
- **Stacking Context**: Ensure parent elements don't create isolated contexts that trap the dropdown.

### Spacing System
- **Padding Adjustments**: Increase status-card padding to var(--space-sm) var(--space-md).
- **Margins**: Add 4px bottom margin to cards and 8px between progress container and cards.
- **Dimensions**: Set min-height: 36px for cards to prevent compression.

## Components and Interfaces

### Model Dropdown
```css
.model-dropdown {
  z-index: 10000 !important;
  position: fixed;
}
```

### Status Card
```css
.status-card {
  padding: var(--space-sm) var(--space-md);
  margin-bottom: 4px;
  min-height: 36px;
  border-radius: calc(var(--radius-sm) + 2px);
}
```

### Progress Container
```css
.progress-container {
  margin-bottom: 8px;
}
```

## Data Models

Not applicable, but text content will be shortened in JS/CSS as needed.

## Error Handling

### Layering Conflicts
- **Scenario**: Dropdown hidden behind card
- **Handling**: High z-index and fixed positioning

### Spacing Issues
- **Scenario**: Cramped text
- **Handling**: Increased padding and min-height

### Visual Overflow
- **Scenario**: Text clipping
- **Handling**: Truncation with ellipsis

## Testing Strategy

### Visual Testing
- **Approach**: Manual inspection of layers
- **Tools**: Browser dev tools
- **Validation**: Dropdown always on top

### Spacing Validation
- **Approach**: Measure pixel distances
- **Tools**: Screen ruler
- **Validation**: No visual crowding

## Implementation Details

### CSS Updates
```css
.status-card-title {
  font-size: 10px; /* Reduced by 1px */
}
```

### Technology Choices
- **Z-Index**: Simple numeric stacking for reliability
- **Margins/Padding**: CSS variables for consistency
- **Truncation**: text-overflow: ellipsis for clean display 
