
# Fix Frozen Button Bug - Design Document

## Overview

The bug occurs when job state remains 'running' in storage, disabling the button. We'll implement state validation on load, add timeouts, and improve cleanup. Use timestamps to detect stuck jobs (e.g., if running > 1 hour, reset).

## Architecture

### Background Script
- **State Validation**: On checkJobStatus, verify if job is valid.
- **Auto Reset**: Alarm to check and reset old jobs.

### Popup Script
- **UI Reset**: Add button to force reset state.

## Components and Interfaces

### JobState with Timestamp
```javascript
interface JobState {
  status: string;
  message: string;
  progress: number;
  timestamp: number;
}
```

## Data Models

### ResetMessage
```javascript
{ action: 'resetJob' }
```

## Error Handling

### Stuck State
- **Scenario**: Job running but no activity.
- **Handling**: If timestamp > threshold, set to error or complete.

### Storage Failure
- **Scenario**: Can't access storage.
- **Handling**: Assume no job, enable button.

## Testing Strategy

### Unit Tests
- **Approach**: Test state validation logic.
- **Tools**: Jest.
- **Validation**: Verify reset on old timestamps.

### Integration Tests
- **Approach**: Simulate stuck states.
- **Tools**: Chrome API mocks.
- **Validation**: Confirm button enables after reset.

## Implementation Details

### State Check Example
```javascript
async function checkJobStatus() {
  const job = await chrome.storage.local.get(JOB_STORAGE_KEY);
  if (job.status === 'running' && Date.now() - job.timestamp > 3600000) {
    await updateJobState({ status: 'error', message: 'Process timed out' });
  }
  return job;
}
```

### Technology Choices
- **Alarms**: Chrome alarms for periodic checks.
- **Storage**: Local storage with timestamps. 
