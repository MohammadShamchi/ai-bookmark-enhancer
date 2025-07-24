
# Requirements Document

## Introduction

This fix addresses a bug where the 'Organize My Bookmarks' button appears frozen and unclickable, likely due to a stuck 'running' job state in storage. We'll add mechanisms to detect and reset stuck states, ensure proper state cleanup, and provide user-facing reset options.

## Requirements

### Requirement 1

**User Story:** As a user, I want the organize button to be clickable unless actively processing, so that I can use the extension without it getting stuck.

#### Acceptance Criteria

1. WHEN popup opens THEN the system SHALL check if job is stuck (running but no recent activity) and reset if necessary.
2. WHEN process completes or errors THEN the system SHALL clear the job state from storage.
3. WHEN button is disabled but no active process THEN the system SHALL enable it.
4. WHEN detecting stuck state THEN the system SHALL log the issue and reset.
5. WHEN no API key THEN the system SHALL show message but keep button enabled for configuration.

### Requirement 2

**User Story:** As a developer, I want robust state management, so that jobs don't get stuck in invalid states.

#### Acceptance Criteria

1. WHEN starting new job THEN the system SHALL clear any existing stuck jobs.
2. WHEN extension updates or reloads THEN the system SHALL reset running jobs.
3. WHEN timeout (e.g., 30min) on running job THEN the system SHALL auto-reset.
4. WHEN error occurs THEN the system SHALL set status to error and enable button after delay.
5. WHEN user closes popup during process THEN the system SHALL continue background but allow restart. 
