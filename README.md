# AI Bookmark Organizer - Chrome Extension

An intelligent Chrome extension that automatically organizes your bookmarks into categorized folders using the OpenAI API.

## The Problem
My browser bookmarks were a complete mess. Hundreds of links with no organization. I wanted to see if I could build a tool that could clean them up for me automatically using the latest in AI.

## Features
- **One-Click Organizing:** A simple button to start the entire process.
- **AI-Powered Categorization:** Uses the OpenAI API (gpt-3.5-turbo) to intelligently analyze and categorize bookmarks.
- **Robust Background Processing:** Built with a resilient architecture using `chrome.alarms` to handle thousands of bookmarks without freezing or losing progress.
- **Secure API Key Storage:** Uses `chrome.storage` to securely store your API key locally.

## Tech Stack
- **AI:** OpenAI (gpt-3.5-turbo-1106)
- **Platform:** Chrome Extension (Manifest V3)
- **Language:** JavaScript (ES6+)
- **APIs:** `chrome.bookmarks`, `chrome.storage`, `chrome.alarms`

## How to Use
1. Clone or download this repository.
2. Open Chrome and navigate to `chrome://extensions`.
3. Enable "Developer mode" in the top right corner.
4. Click "Load unpacked" and select the extension's folder.
5. Right-click the extension icon in your toolbar, select "Options", and enter your OpenAI API key.
6. Click the extension icon and organize your bookmarks!

---
*This project was built in collaboration with an AI assistant, showcasing the power of human-AI partnership in modern development.*
