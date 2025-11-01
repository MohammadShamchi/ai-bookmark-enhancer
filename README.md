# AI Bookmark Organizer - Chrome Extension

An intelligent Chrome extension that automatically organizes your bookmarks into categorized folders using the OpenAI API.

## The Problem
My browser bookmarks were a complete mess. Hundreds of links with no organization. I wanted to see if I could build a tool that could clean them up for me automatically using the latest in AI.

## Features

### Core Functionality
- **One-Click Organizing:** A simple button to start the entire process.
- **AI-Powered Categorization:** Uses OpenAI (GPT-4o, GPT-4-turbo, GPT-4o-mini, GPT-3.5-turbo) to intelligently analyze and categorize bookmarks.
- **Smart Processing Flows:** Automatically chooses optimal processing method based on dataset size:
  - **Single-Shot Flow:** For small-medium collections (≤4,500 bookmarks) - one AI request
  - **Improved Chunking:** For large collections (4,501-10,000 bookmarks) - processes in chunks with global context
  - **Cost Optimization:** Estimates costs before processing

### Reliability & Safety
- **Automatic Backups:** Creates HTML backup before any changes
- **Gzip Compression:** Reduces upload size by ~70% for faster processing
- **Robust Background Processing:** Built with resilient architecture using `chrome.alarms` to handle thousands of bookmarks
- **Dry-Run Validation:** Validates all operations before execution
- **Secure API Key Storage:** Uses `chrome.storage` to securely store your API key locally
- **Progress Tracking:** Real-time progress indicators with stage information

### User Experience
- **Pre-Processing Metrics:** See bookmark count, tier, processing method, cost & time estimates before starting
- **Consent Modal:** Review what will happen before processing begins
- **Model Selection:** Choose from multiple OpenAI models based on speed/quality trade-offs
- **Error Handling:** Clear error messages and recovery options

## Tech Stack
- **AI:** OpenAI API (GPT-4o, GPT-4-turbo, GPT-4o-mini, GPT-3.5-turbo)
- **Platform:** Chrome Extension (Manifest V3)
- **Language:** JavaScript (ES6+ Modules)
- **APIs:** `chrome.bookmarks`, `chrome.storage`, `chrome.alarms`, `chrome.downloads`
- **Architecture:** Modular ES6 imports with decision engine, processing flows, and operation executor

## How to Install & Use

### Installation
1. Clone or download this repository.
2. Open Chrome and navigate to `chrome://extensions`.
3. Enable "Developer mode" in the top right corner.
4. Click "Load unpacked" and select the extension's folder.
5. The extension icon will appear in your toolbar.

### Initial Setup
1. Get an OpenAI API key from [platform.openai.com/api-keys](https://platform.openai.com/api-keys)
2. Right-click the extension icon and select "Options"
3. Enter your OpenAI API key
4. Click "Save"

### Using the Extension
1. Click the extension icon to open the popup
2. Review the pre-processing metrics (bookmark count, tier, estimated cost/time)
3. Optionally change the AI model from the dropdown
4. Click "Organize My Bookmarks"
5. Review the consent modal and click "I agree and proceed" if satisfied
6. Wait for processing to complete (typically 30-90 seconds)
7. Check the backup HTML file downloaded automatically
8. Your bookmarks will be organized into categorized folders!

### Understanding Tiers
- **T1:** ≤2,000 bookmarks - Fast single-request processing
- **T2:** 2,001-4,500 bookmarks - Single-request or chunked processing
- **T3:** 4,501-10,000 bookmarks - Chunked processing with global context
- **T4:** >10,000 bookmarks - Requires backend service (not yet implemented)

### Cost Estimates
Costs vary based on model and dataset size:
- GPT-4o: ~$0.01-0.40 depending on tier
- GPT-4o-mini: ~$0.001-0.05 depending on tier
- Estimates are shown before processing starts

---
*This project was built in collaboration with an AI assistant, showcasing the power of human-AI partnership in modern development.*
