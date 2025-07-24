
# Bookmark Progress Indicator - Design Document

## Overview

We'll enhance the background script to send granular progress updates via messages to the popup. The popup will update its progress bar accordingly. For performance, implement chunking in API calls and batch operations in bookmark management.

## Architecture

### Background Script Enhancements
- **Chunk Processing**: Divide bookmarks into chunks of 50.
- **Progress Messaging**: Send updates after each chunk with current progress percentage.

### Popup UI Updates
- **Progress Bar**: Animate width based on percentage received.

## Components and Interfaces

### ProgressMessage
```javascript
interface ProgressMessage {
  action: 'updateStatus';
  job: {
    status: string;
    message: string;
    progress: number; // 0-100
  };
}
```

## Data Models

### JobState
```javascript
interface JobState {
  status: 'running' | 'complete' | 'error';
  message: string;
  progress: number;
}
```

## Error Handling

### API Rate Limits
- **Scenario**: Too many requests.
- **Handling**: Implement exponential backoff.

### Large Bookmark Sets
- **Scenario**: Thousands of bookmarks.
- **Handling**: Process in smaller batches with progress updates.

## Testing Strategy

### Unit Tests
- **Approach**: Test chunking logic.
- **Tools**: Jest.
- **Validation**: Verify correct chunk sizes and progress calculations.

### Integration Tests
- **Approach**: Simulate organization with mock bookmarks.
- **Tools**: Chrome testing API.
- **Validation**: Check progress updates and UI reflection.

## Implementation Details

### Chunk Processing Example
```javascript
async function processBookmarks(bookmarks) {
  const chunkSize = 50;
  const totalChunks = Math.ceil(bookmarks.length / chunkSize);
  for (let i = 0; i < totalChunks; i++) {
    const chunk = bookmarks.slice(i * chunkSize, (i + 1) * chunkSize);
    await processChunk(chunk);
    const progress = ((i + 1) / totalChunks) * 100;
    sendProgressUpdate(progress);
  }
}
```

### Technology Choices
- **Messaging**: Chrome runtime messages for real-time updates.
- **Batching**: Use Promise.all for parallel operations where possible. 
