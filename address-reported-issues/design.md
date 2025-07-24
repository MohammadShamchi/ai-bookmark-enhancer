# Address Reported Issues - Design Document

## Overview

Comprehensive fix involving state validation with timestamps, progress messaging, error recovery mechanisms, and chunked processing for performance. The design incorporates background script enhancements for state management and popup UI updates for better user feedback.

## Architecture

### Background Script
- Add timestamp to job state and periodic checks using Chrome alarms to reset stuck jobs.
- Implement chunked processing with progress updates sent via runtime messages.

### Popup Script
- Enhanced UI updates with animation classes for processing states.
- Add reset button for manual error recovery.

## Components and Interfaces

### Enhanced JobState
```javascript
interface JobState {
  status: string;
  message: string;
  progress: number;
  timestamp: number;
}
```

## Data Models

### ProgressUpdate Message
```javascript
{
  action: 'updateProgress',
  progress: number,
  message: string
}
```

## Error Handling

### Stuck Job
- **Scenario**: Job in running state with timestamp older than 30 minutes.
- **Handling**: Automatically reset to error state and notify popup.

### Communication Error
- **Scenario**: Message port closed before response.
- **Handling**: Implement retry with exponential backoff up to 3 attempts.

## Testing Strategy

### Unit Tests
- **Approach**: Test state validation and timeout logic.
- **Tools**: Jest.
- **Validation**: Verify automatic resets and progress calculations.

### Integration Tests
- **Approach**: Simulate long operations and errors.
- **Tools**: Chrome API mocks.
- **Validation**: Confirm UI updates, resets, and recovery flows.

## Implementation Details

### Timeout Check
```javascript
async function checkJobStatus() {
  const job = await chrome.storage.local.get(JOB_STORAGE_KEY);
  if (job.status === 'running' && Date.now() - job.timestamp > 1800000) {
    await updateJobState({ status: 'error', message: 'Process timed out' });
  }
  return job;
}
```

### Technology Choices
- **Chrome Alarms**: For periodic stuck job checks.
- **Runtime Messages**: For real-time progress updates to popup. 
