# Requirements Document

## Introduction

Address the model dropdown visibility issues in the Chrome extension popup caused by stacking context and containing block problems from backdrop-filter, ensuring the dropdown appears correctly above other elements without clipping or positioning errors.

## Requirements

### Requirement 1

**User Story:** As a user, I want the model dropdown to appear reliably above all other UI elements, so that I can select AI models without visual obstructions or clipping.

#### Acceptance Criteria

1. WHEN opening the dropdown THEN the system SHALL position it relative to the viewport without being contained by ancestors with backdrop-filter.
2. WHEN the status indicator is hovered THEN the system SHALL maintain correct dropdown positioning despite any transforms.
3. WHEN the dropdown extends near popup edges THEN the system SHALL prevent clipping by the popup window bounds.
4. WHEN switching models THEN the system SHALL update the selection without repositioning errors.
5. WHEN testing in different Chrome versions THEN the system SHALL ensure consistent visibility and interaction.

### Requirement 2

**User Story:** As a user, I want accurate positioning of the dropdown, so that it appears in the correct location relative to the model badge.

#### Acceptance Criteria

1. WHEN calculating position THEN the system SHALL use coordinates relative to the true containing block.
2. WHEN window resizes THEN the system SHALL recalculate and adjust dropdown position dynamically.
3. WHEN popup size changes THEN the system SHALL maintain dropdown alignment to the badge.
4. WHEN scrolling is attempted THEN the system SHALL keep dropdown fixed in view if necessary.
5. WHEN multiple dropdown interactions occur THEN the system SHALL consistently position without offsets.

### Requirement 3

**User Story:** As a developer, I want a robust solution that avoids Chrome extension popup limitations, so that the UI works reliably across environments.

#### Acceptance Criteria

1. WHEN backdrop-filter is present THEN the system SHALL move dropdown outside affected stacking contexts.
2. WHEN testing in extension mode THEN the system SHALL verify no interference from browser wrappers.
3. WHEN using fixed positioning THEN the system SHALL confirm it references the viewport correctly.
4. WHEN alternatives are needed THEN the system SHALL provide fallback to absolute positioning.
5. WHEN validating THEN the system SHALL test with DevTools layers panel for correct stacking. 
