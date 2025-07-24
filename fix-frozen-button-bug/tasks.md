
# Implementation Plan

- [ ] 1. Add Timestamp to Job State
  - Modify updateJobState to include timestamp.
  - Update all state changes to refresh timestamp.
  - _Requirements: 2.3_

- [ ] 2. Implement State Validation
  - In checkJobStatus, check if running and old, reset to error.
  - Add threshold constant (e.g., 1 hour).
  - _Requirements: 1.1, 1.4, 2.1_

- [ ] 3. Improve Cleanup
  - On complete/error, clear storage after delay.
  - Add alarm for periodic cleanup.
  - _Requirements: 1.2, 2.2, 2.4_

- [ ] 4. Update Popup Logic
  - If status error, enable button after showing message.
  - Add force reset button if stuck.
  - _Requirements: 1.3, 1.5, 2.5_

- [ ] 5. Test the Fix
  - Test with simulated stuck states.
  - Verify auto-reset and button enabling.
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 2.1, 2.2, 2.3, 2.4, 2.5_ 
