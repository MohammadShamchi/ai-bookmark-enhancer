# AI Implementation Prompts

This document contains **ready-to-use prompts** for AI agents to implement tasks from `IMPLEMENTATION_SPEC.md`.

Copy/paste these prompts into any AI chat session to execute specific tasks.

---

## 🚀 Getting Started

### Initial Setup Prompt
```
I'm working on an AI Bookmark Organizer Chrome extension. Please read the following files to understand the project:

1. Read: /Users/amohii/dev/UI-update-ai-bookmar-enhancer/ai-bookmark-enhancer/IMPLEMENTATION_SPEC.md
2. Read: /Users/amohii/dev/UI-update-ai-bookmar-enhancer/ai-bookmark-enhancer/BOOKMARK_AI_PLAN.md
3. Read: /Users/amohii/dev/UI-update-ai-bookmar-enhancer/ai-bookmark-enhancer/background.js

Once you've read these files, confirm you understand the project structure and are ready to implement tasks from the spec.
```

---

## 📋 PHASE 1: Foundation & Code Refactoring

### Task 1.1.1: Create Directory Structure
```
Implement Task 1.1.1 from IMPLEMENTATION_SPEC.md:

Create the modular directory structure for the AI Bookmark Organizer extension:

Working directory: /Users/amohii/dev/UI-update-ai-bookmar-enhancer/ai-bookmark-enhancer

Create these directories:
- src/core/          # Core business logic
- src/api/           # API integrations
- src/utils/         # Utility functions
- src/validators/    # Schema validators
- src/ui/            # UI helpers
- src/config/        # Configuration files

After creating, verify the directories exist and report completion.
```

---

### Task 1.1.2: Create Model Configuration
```
Implement Task 1.1.2 from IMPLEMENTATION_SPEC.md:

Create the model configuration file at:
/Users/amohii/dev/UI-update-ai-bookmar-enhancer/ai-bookmark-enhancer/src/config/models.json

Use the exact JSON structure provided in IMPLEMENTATION_SPEC.md section 1.1.2.

This file contains:
- OpenAI model capabilities (GPT-4o, GPT-4o-mini, GPT-4-turbo, GPT-3.5-turbo)
- Context windows, token limits, costs
- Tier definitions (T1-T4)
- Processing thresholds

After creation, validate the JSON is valid and report completion.
```

---

### Task 1.1.3: Create Metrics Calculator
```
Implement Task 1.1.3 from IMPLEMENTATION_SPEC.md:

Create the bookmark metrics calculator module at:
/Users/amohii/dev/UI-update-ai-bookmar-enhancer/ai-bookmark-enhancer/src/utils/metrics.js

This module must:
1. Export calculateBookmarkMetrics() function
2. Calculate bookmark count, raw size, gzip size, token estimates
3. Determine tier (T1-T4) based on thresholds
4. Export canUseSingleShot() function
5. Export extractBookmarkStatistics() function

Use the complete implementation from IMPLEMENTATION_SPEC.md section 1.1.3.

After creation:
- Verify all functions are exported
- Verify imports work (models.json)
- Report completion
```

---

### Task 1.1.4: Create Decision Engine
```
Implement Task 1.1.4 from IMPLEMENTATION_SPEC.md:

Create the decision engine module at:
/Users/amohii/dev/UI-update-ai-bookmar-enhancer/ai-bookmark-enhancer/src/core/decision-engine.js

This module decides which processing flow to use (single-shot vs chunking) based on metrics.

Key functions:
- decideProcessingFlow(bookmarkTree, selectedModel, options)
- validateDecision(decision)
- explainDecision(decision)

Use the complete implementation from IMPLEMENTATION_SPEC.md section 1.1.4.

Dependencies: Requires 1.1.2 and 1.1.3 to be completed first.

After creation, verify all functions work and report completion.
```

---

### Task 1.2.1: Extract Bookmark Operations
```
Implement Task 1.2.1 from IMPLEMENTATION_SPEC.md:

Extract bookmark CRUD operations from background.js into a new module:
/Users/amohii/dev/UI-update-ai-bookmar-enhancer/ai-bookmark-enhancer/src/core/bookmark-operations.js

First, read the current background.js to understand existing bookmark operations:
- Lines 797-815: getAllBookmarks()
- Lines 1028-1072: Bookmark manipulation functions

Then create the new module with:
- getAllBookmarks()
- getBookmarkTree()
- createFolder()
- moveBookmark()
- renameNode()
- removeNode()
- findFolderByPath()
- createFolderPath()
- batchMoveBookmarks()

Use the complete implementation from IMPLEMENTATION_SPEC.md section 1.2.1.

After creation, verify all functions are properly exported.
```

---

### Task 1.2.2: Extract OpenAI API Client
```
Implement Task 1.2.2 from IMPLEMENTATION_SPEC.md:

Extract OpenAI API communication logic from background.js into:
/Users/amohii/dev/UI-update-ai-bookmar-enhancer/ai-bookmark-enhancer/src/api/openai-client.js

Read background.js lines 863-1003 to understand current API logic.

Then create the new module with:
- sendChatCompletion()
- uploadFile() (for Files API)
- deleteFile()
- validateAPIKey()
- OpenAIAPIError class
- withRetry() wrapper

Use the complete implementation from IMPLEMENTATION_SPEC.md section 1.2.2.

Dependencies: Requires 1.1.2 (models.json)
```

---

### Task 1.2.3: Extract Validation Module
```
Implement Task 1.2.3 from IMPLEMENTATION_SPEC.md:

Extract AI response validation logic from background.js into:
/Users/amohii/dev/UI-update-ai-bookmar-enhancer/ai-bookmark-enhancer/src/validators/response-validator.js

Read background.js lines 211-345 to understand current validation.

Create module with:
- validateAIResponse(response, inputBookmarks)
- validateNewFormat(response, inputBookmarks)
- repairAIResponse(response, inputBookmarks, validation)
- sanitizeCategoryName(name)

Use the complete implementation from IMPLEMENTATION_SPEC.md section 1.2.3.

This module validates both legacy format (categories) and new format (operations).
```

---

### Task 1.3.1: Create HTML Export Module
```
Implement Task 1.3.1 from IMPLEMENTATION_SPEC.md:

Create HTML backup generator at:
/Users/amohii/dev/UI-update-ai-bookmar-enhancer/ai-bookmark-enhancer/src/utils/html-export.js

This module generates Netscape Bookmark File Format (HTML) for backup.

Key functions:
- exportToHTML(bookmarkTree) - Returns HTML string
- downloadHTML(html, filename) - Triggers browser download
- exportAndDownload() - Complete export flow

Use the complete implementation from IMPLEMENTATION_SPEC.md section 1.3.1.

The HTML format must be compatible with Chrome/Edge bookmark import.
```

---

### Task 1.4.1: Update manifest.json
```
Implement Task 1.4.1 from IMPLEMENTATION_SPEC.md:

Read the current manifest.json at:
/Users/amohii/dev/UI-update-ai-bookmar-enhancer/ai-bookmark-enhancer/manifest.json

Update it with:
1. Version: "2.0.0"
2. Add "downloads" permission (for HTML export)
3. Update background.service_worker to use "type": "module" (for ES6 imports)
4. Update description to mention new features

Use the exact structure from IMPLEMENTATION_SPEC.md section 1.4.1.

After updating, validate the manifest is valid JSON.
```

---

## 📋 PHASE 2: Single-Shot Implementation

### Task 2.1.1: Create Compression Module
```
Implement Task 2.1.1 from IMPLEMENTATION_SPEC.md:

Create gzip compression utilities at:
/Users/amohii/dev/UI-update-ai-bookmar-enhancer/ai-bookmark-enhancer/src/utils/compression.js

This module handles gzip compression/decompression using browser's native CompressionStream API.

Key functions:
- compressToGzip(data) - Returns compressed Blob
- decompressGzip(compressedBlob) - Returns decompressed string
- getCompressionRatio(data, compressedBlob) - Returns ratio

Use the complete implementation from IMPLEMENTATION_SPEC.md section 2.1.1.

This is required for uploading large bookmark datasets to OpenAI Files API.
```

---

### Task 2.2.1: Create Prompt Templates
```
Implement Task 2.2.1 from IMPLEMENTATION_SPEC.md:

Create system and user prompt templates at:
/Users/amohii/dev/UI-update-ai-bookmar-enhancer/ai-bookmark-enhancer/src/config/prompts.js

This module provides reusable prompts for AI processing.

Key functions:
- getSystemPromptSingleShot(options) - System prompt for single-shot flow
- getUserPromptSingleShot(bookmarkData, stats) - User prompt with data
- getSystemPromptChunking(globalContext) - System prompt for chunking
- getPromptSimpleCategories(bookmarks) - Fallback simple categorization

Use the complete implementation from IMPLEMENTATION_SPEC.md section 2.2.1.

These prompts include security constraints and JSON schema specifications.
```

---

### Task 2.3.1: Create Single-Shot Processor
```
Implement Task 2.3.1 from IMPLEMENTATION_SPEC.md:

Create the main single-shot processing module at:
/Users/amohii/dev/UI-update-ai-bookmar-enhancer/ai-bookmark-enhancer/src/core/single-shot-processor.js

This is the core single-shot processing flow that:
1. Exports bookmarks
2. Creates HTML backup
3. Compresses data with gzip
4. Uploads to OpenAI Files API
5. Sends chat completion request
6. Validates response
7. Returns operations

Key function:
- processSingleShot(apiKey, model, onProgress)

Use the complete implementation from IMPLEMENTATION_SPEC.md section 2.3.1.

Dependencies: Requires ALL Phase 1 tasks + Tasks 2.1.1 and 2.2.1
```

---

### Task 2.4.1: Create Operation Executor
```
Implement Task 2.4.1 from IMPLEMENTATION_SPEC.md:

Create the operation executor at:
/Users/amohii/dev/UI-update-ai-bookmar-enhancer/ai-bookmark-enhancer/src/core/operation-executor.js

This module applies AI operations in phases:
- Phase 1: Create folders
- Phase 2: Move bookmarks
- Phase 3: Rename folders
- Phase 4: Remove empty folders

Key functions:
- executeOperations(operations, onProgress)
- dryRunOperations(operations) - Validation without execution
- validateOperation(op) - Single operation validation

Use the complete implementation from IMPLEMENTATION_SPEC.md section 2.4.1.

Dependencies: Requires 1.2.1 (bookmark-operations.js)
```

---

## 📋 PHASE 3: Improved Chunking Fallback

### Task 3.1.1: Create Global Context Generator
```
Implement Task 3.1.1 from IMPLEMENTATION_SPEC.md:

Create the global context generator at:
/Users/amohii/dev/UI-update-ai-bookmar-enhancer/ai-bookmark-enhancer/src/core/context-generator.js

This module generates context summary for chunked processing to maintain consistency across chunks.

Key functions:
- generateGlobalContext() - Creates context from bookmark tree
- updateContextWithFolders(context, newFolders) - Updates with created folders

Context includes:
- Existing folder structure
- Keyword clusters
- Domain frequency
- Naming policy

Use the complete implementation from IMPLEMENTATION_SPEC.md section 3.1.1.

Dependencies: Requires 1.2.1, 1.1.3
```

---

### Task 3.2.1: Create Chunking Processor
```
Implement Task 3.2.1 from IMPLEMENTATION_SPEC.md:

Create the improved chunking processor at:
/Users/amohii/dev/UI-update-ai-bookmar-enhancer/ai-bookmark-enhancer/src/core/chunking-processor.js

This module implements the fallback chunking flow for large datasets.

Key features:
- Chunks bookmarks by domain/folder affinity
- Passes global context to each chunk
- Uses handle-based folder references
- Reconciliation pass to merge duplicate folders
- Maintains consistency across chunks

Key function:
- processChunked(apiKey, model, onProgress)

NOTE: The complete implementation is marked as truncated in the spec.
You should create a skeleton based on the design principles and we'll flesh it out together.

Dependencies: Requires 3.1.1 and all previous modules
```

---

## 🎨 PHASE 4: UI/UX Enhancements

### Task 4.1: Update Background.js to Use Modules
```
Now that we have modular code, update background.js to:

1. Import the new modules using ES6 import syntax
2. Replace monolithic functions with imported module functions
3. Keep message handlers and job state management
4. Integrate decision engine to choose flow
5. Add progress callbacks to UI

First, read the current background.js to understand the structure.

Then refactor to use:
- import { decideProcessingFlow } from './src/core/decision-engine.js';
- import { processSingleShot } from './src/core/single-shot-processor.js';
- import { processChunked } from './src/core/chunking-processor.js';
- import { executeOperations } from './src/core/operation-executor.js';

This is a major refactoring task. We should do it incrementally.
```

---

### Task 4.2: Update Popup UI
```
Update popup.html and popup.js to:

1. Show tier information (T1-T4)
2. Display estimated cost and time before processing
3. Add consent checkbox for data upload
4. Show "Creating backup..." step
5. Improve progress indicators with phase names
6. Add decision explanation (why single-shot vs chunking)

Read current popup.html and popup.js first.

Then add new UI elements and update JavaScript to handle:
- Metrics display
- Decision display
- Cost/time estimates
- Backup status
```

---

### Task 4.3: Create Consent Screen
```
Create a consent/confirmation screen that shows:

1. What data will be sent (bookmark titles + URLs)
2. Which AI provider (OpenAI)
3. Estimated cost
4. Estimated time
5. Tier information
6. "Create backup before proceeding" checkbox (default: checked)

Add to popup.html as a modal or separate screen.

User must explicitly click "I understand and agree" before processing starts.
```

---

## 🧪 PHASE 5: Testing

### Task 5.1: Create Test Fixtures
```
Create test fixture bookmark trees for testing at:
/Users/amohii/dev/UI-update-ai-bookmar-enhancer/ai-bookmark-enhancer/tests/fixtures/

Create:
- small-tree.json (50 bookmarks, T1)
- medium-tree.json (500 bookmarks, T1)
- large-tree.json (2500 bookmarks, T2)
- huge-tree.json (5000 bookmarks, T3)
- edge-cases.json (special characters, missing fields, etc.)

Each fixture should be a valid bookmark tree structure.
```

---

### Task 5.2: Test Metrics Calculator
```
Test the metrics calculator (Task 1.1.3) with:

1. Load test fixtures
2. Call calculateBookmarkMetrics() on each
3. Verify:
   - Bookmark count is correct
   - Tier determination is correct
   - Gzip size < raw size
   - Token estimates are reasonable
   - Compression ratio is 0.2-0.4

Report results and any issues found.
```

---

### Task 5.3: Test Decision Engine
```
Test the decision engine (Task 1.1.4) with:

1. Load test fixtures
2. Call decideProcessingFlow() with different models
3. Verify:
   - Small datasets → single-shot
   - Large datasets → chunking
   - T4 datasets → backend-assisted
   - Cost estimates are reasonable
   - Time estimates are reasonable

Report results and any issues found.
```

---

## 📦 Integration Prompts

### Full Phase 1 Integration
```
I want to integrate all Phase 1 modules. Please:

1. Verify all Phase 1 tasks (1.1.1 through 1.4.1) are completed
2. Test imports work between modules
3. Create a simple test script that:
   - Imports decision-engine.js
   - Calls decideProcessingFlow()
   - Prints the decision

If any imports fail, fix the module paths and export/import statements.
```

---

### Test Single-Shot Flow End-to-End
```
Test the complete single-shot flow:

1. Ensure all Phase 1 and Phase 2 tasks are completed
2. Create a test script that:
   - Loads a small bookmark tree fixture
   - Calls processSingleShot() with a test API key
   - Logs each progress callback
   - Validates the returned operations

NOTE: You'll need a valid OpenAI API key to test. We can do a dry-run without actually calling the API first.
```

---

## 🔧 Debugging Prompts

### Debug Import Issues
```
I'm getting import errors. Please:

1. Check that manifest.json has "type": "module" in background section
2. Verify all import paths are correct (use relative paths: './src/...')
3. Verify all modules export their functions (export function name() {})
4. Check for circular dependencies
5. Suggest fixes
```

---

### Debug Gzip Compression
```
The gzip compression isn't working. Please:

1. Check if browser supports CompressionStream API
2. Test compression.js with a simple string
3. Add fallback for browsers without CompressionStream
4. Verify the blob is created correctly
5. Test round-trip (compress then decompress)
```

---

## 🎯 Quick Start Sequences

### "Implement Foundation (1 hour)"
```
Execute these tasks in order:

1. Task 1.1.1: Create directories
2. Task 1.1.2: Create models.json
3. Task 1.1.3: Create metrics.js
4. Task 1.1.4: Create decision-engine.js
5. Test: Verify decision engine works with a sample tree

Report progress after each task.
```

---

### "Implement Single-Shot Flow (2 hours)"
```
Execute these tasks in order (requires Phase 1 complete):

1. Task 2.1.1: Create compression.js
2. Task 2.2.1: Create prompts.js
3. Task 2.3.1: Create single-shot-processor.js
4. Task 2.4.1: Create operation-executor.js
5. Test: Dry-run single-shot with sample data

Report progress after each task.
```

---

### "Refactor Background.js (1 hour)"
```
Refactor background.js to use new modules:

1. Read current background.js
2. Identify which functions are now in modules
3. Add ES6 imports at top
4. Replace old function calls with module imports
5. Test that extension still loads
6. Test that existing functionality still works

Report each change made.
```

---

## 📝 Checkpoint Prompts

### "Where are we?"
```
Review the project state:

1. List which tasks from IMPLEMENTATION_SPEC.md are complete (check for file existence)
2. List which tasks are in progress
3. List which tasks are blocked
4. Identify next task to work on
5. Report any issues or concerns
```

---

### "Test everything so far"
```
Run comprehensive tests on completed modules:

1. List all completed modules (files in src/)
2. For each module:
   - Verify it exists
   - Verify exports are correct
   - Test with sample data
   - Report any errors
3. Create integration test for all modules together
4. Report overall status
```

---

## 🚨 Emergency Prompts

### "Something broke, fix it"
```
Debug the extension:

1. Check browser console for errors
2. Check if extension loads in chrome://extensions
3. Verify manifest.json is valid
4. Check for JavaScript syntax errors
5. Verify all imports resolve correctly
6. Test each module individually
7. Report findings and suggest fixes
```

---

### "Rollback to working state"
```
The refactoring broke things. Let's rollback:

1. Identify what changed recently (use git status if available)
2. Revert problematic changes
3. Test that extension works again
4. Document what went wrong
5. Suggest safer approach for next attempt
```

---

## 💡 Pro Tips

### For New AI Sessions
Always start with:
```
Read these files first:
1. /Users/amohii/dev/UI-update-ai-bookmar-enhancer/ai-bookmark-enhancer/IMPLEMENTATION_SPEC.md
2. /Users/amohii/dev/UI-update-ai-bookmar-enhancer/ai-bookmark-enhancer/AI_PROMPTS.md (this file)
3. /Users/amohii/dev/UI-update-ai-bookmar-enhancer/ai-bookmark-enhancer/BOOKMARK_AI_PLAN.md

Then tell me: "I'm ready. Which task should I implement?"
```

### For Continuing Work
```
I'm continuing work on the AI Bookmark Organizer.

What was the last completed task? Check IMPLEMENTATION_SPEC.md for completion status, then tell me what to work on next.
```

### For Parallel Development
```
I want to work on [SPECIFIC FEATURE] in parallel.

Which tasks from IMPLEMENTATION_SPEC.md can I do independently without blocking other work? Show me the dependency tree.
```

---

## 📊 Status Tracking Template

Update this after each task:

```
PHASE 1: Foundation
- [✅] 1.1.1 Directory Structure
- [✅] 1.1.2 Models Config
- [✅] 1.1.3 Metrics Calculator
- [✅] 1.1.4 Decision Engine
- [⬜] 1.2.1 Bookmark Operations
- [⬜] 1.2.2 OpenAI Client
- [⬜] 1.2.3 Validator
- [⬜] 1.3.1 HTML Export
- [⬜] 1.4.1 Manifest Update

PHASE 2: Single-Shot
- [⬜] 2.1.1 Compression
- [⬜] 2.2.1 Prompts
- [⬜] 2.3.1 Processor
- [⬜] 2.4.1 Executor

PHASE 3: Chunking
- [⬜] 3.1.1 Context Generator
- [⬜] 3.2.1 Chunking Processor

Legend:
✅ Complete
🏗️ In Progress
⬜ Not Started
⚠️ Blocked
```
