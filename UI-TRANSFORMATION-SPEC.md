# AI BOOKMARK ENHANCER - UI TRANSFORMATION SPECIFICATION

## SPEC-DRIVEN DEVELOPMENT PLAN v1.0

**Project:** AI Bookmark Enhancer Chrome Extension
**Objective:** Transform custom CSS to Tailwind CSS-based design matching generated-page (6).html
**Status:** Not Started
**Last Updated:** 2025-10-21
**Completion:** 0/100 tasks

---

## 🎯 PROJECT OVERVIEW

### Goal

Migrate the AI Bookmark Enhancer Chrome extension from custom CSS to a premium Tailwind CSS design system, matching the quality and components from the generated HTML file while preserving all existing functionality.

### Key Metrics

- **Total Tasks:** 100+
- **Estimated Duration:** 20-25 hours
- **Files to Modify:** 5 core files
- **Lines of CSS to Remove:** ~1,381 lines
- **Target CSS Lines:** ~100 lines (custom animations only)

### Files in Scope

1. `/ai-bookmark-enhancer/popup.html` - Main popup interface
2. `/ai-bookmark-enhancer/popup.css` - Main popup styles
3. `/ai-bookmark-enhancer/popup.js` - Popup logic
4. `/ai-bookmark-enhancer/options.html` - Settings page
5. `/ai-bookmark-enhancer/options.css` - Settings styles
6. `/ai-bookmark-enhancer/options.js` - Settings logic
7. `/ai-bookmark-enhancer/manifest.json` - Extension configuration

### Reference Files

- **Source Design:** `/generated-page (6).html` - Target design to match
- **Backup Location:** Create `/ai-bookmark-enhancer/.backup/` before starting

---

## ✅ IMPLEMENTATION CHECKLIST

Use this format to track progress:

```
[ ] - Not Started
[~] - In Progress
[X] - Completed
[!] - Blocked/Issues
```

---

# PHASE 1: PREPARATION & SETUP

## 1. Project Backup & Safety

- [x] **1.1** Create backup directory `/ai-bookmark-enhancer/.backup/`
- [x] **1.2** Copy all original files to backup:
  - [x] 1.2.1 Copy `popup.html` to `.backup/popup.html.original`
  - [x] 1.2.2 Copy `popup.css` to `.backup/popup.css.original`
  - [x] 1.2.3 Copy `popup.js` to `.backup/popup.js.original`
  - [x] 1.2.4 Copy `options.html` to `.backup/options.html.original`
  - [x] 1.2.5 Copy `options.css` to `.backup/options.css.original`
  - [x] 1.2.6 Copy `options.js` to `.backup/options.js.original`
- [x] **1.3** Create git commit with message: "Backup before UI transformation"
- [x] **1.4** Create new branch: `feature/tailwind-ui-transformation`

## 2. Dependencies Setup

- [x] **2.1** Review manifest.json content security policy
  - [x] 2.1.1 Check if CDN scripts are allowed
  - [x] 2.1.2 Add Tailwind CDN to allowed sources if needed
  - [x] 2.1.3 Verify font CDN permissions (Google Fonts)
- [x] **2.2** Document current extension permissions (reference only, no changes)
- [x] **2.3** Create `/ai-bookmark-enhancer/MIGRATION-NOTES.md` for tracking issues

## 3. Icon Asset Preparation

- [x] **3.1** Extract all SVG icons from `generated-page (6).html`
  - [x] 3.1.1 Bookmark icon (header logo)
  - [x] 3.1.2 Sparkles icon (organize button)
  - [x] 3.1.3 CPU icon (model selector)
  - [x] 3.1.4 Settings/Cog icon
  - [x] 3.1.5 Stop circle icon (emergency stop)
  - [x] 3.1.6 Rotate icon (reset button)
  - [x] 3.1.7 Info icon
  - [x] 3.1.8 Chevron down icon (dropdowns)
  - [x] 3.1.9 Eye icon (password visibility)
  - [x] 3.1.10 Eye-off icon (password hidden)
  - [x] 3.1.11 Check icon (success states)
  - [x] 3.1.12 Help circle icon
  - [x] 3.1.13 Shield icon (security notice)
  - [x] 3.1.14 Save icon
  - [x] 3.1.15 External link icon
- [x] **3.2** Create icon reference document with all SVG code snippets

---

# PHASE 2: POPUP.HTML TRANSFORMATION

## 4. HTML Structure - Head Section

- [x] **4.1** Update `<head>` section in `popup.html`
  - [x] 4.1.1 Add Tailwind CSS CDN: `<script src="https://cdn.tailwindcss.com"></script>`
  - [x] 4.1.2 Verify Google Fonts Inter import exists
  - [x] 4.1.3 Update viewport meta tag if needed
  - [x] 4.1.4 Remove reference to old `popup.css` (will re-add later with minimal CSS)

## 5. HTML Structure - Background Effects

- [x] **5.1** Replace `.background-effects` div with Tailwind version
  - [x] 5.1.1 Add fixed positioning: `class="fixed inset-0 -z-10 overflow-hidden"`
  - [x] 5.1.2 Update gradient blob 1 (top-left): `absolute -top-24 -left-24 w-96 h-96 rounded-full blur-3xl opacity-30 bg-gradient-to-tr from-indigo-600 via-purple-600 to-indigo-700 animate-pulse`
  - [x] 5.1.3 Update gradient blob 2 (center): `absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[36rem] h-[36rem] rounded-full blur-3xl opacity-20 bg-gradient-to-br from-purple-600 via-indigo-600 to-purple-700`
  - [x] 5.1.4 Update gradient blob 3 (bottom-right): `absolute bottom-0 right-0 w-80 h-80 rounded-full blur-3xl opacity-25 bg-cyan-500/30`
  - [x] 5.1.5 Update gradient blob 4 (top-right): `absolute top-10 right-20 w-48 h-48 rounded-full blur-2xl opacity-20 bg-indigo-400/40 animate-pulse`
  - [x] 5.1.6 Remove old nested divs (mesh-gradient, floating-particles, glass-reflections)

## 6. HTML Structure - Main Container

- [x] **6.1** Update app root wrapper
  - [x] 6.1.1 Replace `.container` with: `id="appRoot" class="mx-auto my-8 flex items-center justify-center"`
  - [x] 6.1.2 Ensure body has: `class="min-h-screen antialiased bg-[#0f172a] text-slate-100 font-[Inter,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto]"`

## 7. HTML Structure - Popup View Container

- [x] **7.1** Create popup section wrapper
  - [x] 7.1.1 Add: `<section id="popupView" class="w-[360px] h-[500px] bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 shadow-[0_10px_30px_rgba(0,0,0,0.45)] relative overflow-hidden flex flex-col">`
  - [x] 7.1.2 Move all existing popup content inside this section
  - [x] 7.1.3 Remove old `.container` wrapper classes

## 8. HTML Structure - Header Section

- [x] **8.1** Rebuild header with Tailwind classes
  - [x] 8.1.1 Create header: `<header class="px-4 pt-4 pb-2">`
  - [x] 8.1.2 Add top row wrapper: `<div class="flex items-center justify-between">`
  - [x] 8.1.3 Add logo + title section: `<div class="flex items-center gap-3">`
  - [x] 8.1.4 Update logo container: `<div class="h-8 w-8 rounded-lg bg-white/10 border border-white/10 flex items-center justify-center shadow-inner">`
  - [x] 8.1.5 Insert bookmark SVG icon with: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" class="text-indigo-300">`
  - [x] 8.1.6 Update title wrapper: `<div class="leading-tight">`
  - [x] 8.1.7 Update h1: `<h1 class="text-[18px] tracking-tight font-semibold text-white">AI Bookmark Enhancer</h1>`
  - [x] 8.1.8 Update subtitle: `<p class="text-xs text-slate-400">Intelligent bookmark organization powered by OpenAI</p>`
  - [x] 8.1.9 Add settings button: `<button id="openSettingsTop" class="p-2 rounded-lg hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-indigo-500/60 transition">`
  - [x] 8.1.10 Insert settings SVG icon (cog icon from generated file)

## 9. HTML Structure - Status Bar

- [x] **9.1** Create status bar below header
  - [x] 9.1.1 Add wrapper: `<div class="mt-3 flex items-center gap-2">`
  - [x] 9.1.2 Create AI Ready badge: `<div class="flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">`
  - [x] 9.1.3 Add pulsing dot: `<span class="relative flex h-2 w-2"><span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span><span class="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span></span>`
  - [x] 9.1.4 Add AI Ready text: `<span class="text-[11px] leading-none font-medium text-emerald-300">AI Ready</span>`
  - [x] 9.1.5 Create model chip: `<div id="activeModelChip" class="px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-[11px] font-medium text-slate-200">GPT-4.1 Mini</div>`
  - [x] 9.1.6 Add debug button: `<button id="debugBtn" class="ml-auto px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-[11px] font-medium text-slate-200 hover:bg-white/10 transition">Debug</button>`

## 10. HTML Structure - Main Glass Card

- [x] **10.1** Create main content area with gradient border
  - [x] 10.1.1 Add main wrapper: `<main class="px-3 py-2 flex-1 overflow-hidden">`
  - [x] 10.1.2 Add gradient border wrapper: `<div class="p-[1.5px] rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600">`
  - [x] 10.1.3 Add inner glass card: `<div class="rounded-2xl bg-white/10 backdrop-blur-2xl border border-white/10 shadow-[0_8px_30px_rgba(0,0,0,0.35)]">`
  - [x] 10.1.4 Add card content padding: `<div class="p-4">`

## 11. HTML Structure - Primary Controls

- [x] **11.1** Build organize button
  - [x] 11.1.1 Add controls wrapper: `<div id="primaryControls" class="space-y-4">`
  - [x] 11.1.2 Create organize button: `<button id="organizeBtn" class="w-full group relative overflow-hidden rounded-xl px-4 py-3 text-sm font-semibold tracking-tight text-white bg-gradient-to-r from-indigo-600 to-purple-600 shadow-lg hover:shadow-indigo-900/40 transition transform hover:scale-[1.02]">`
  - [x] 11.1.3 Add button content wrapper: `<span class="relative z-10 flex items-center justify-center gap-2">`
  - [x] 11.1.4 Insert sparkles SVG icon with: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" class="opacity-90">`
  - [x] 11.1.5 Add button text: `Organize My Bookmarks`
  - [x] 11.1.6 Add shimmer overlay: `<div class="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition"></div>`

## 12. HTML Structure - Model Selector

- [x] **12.1** Build model dropdown
  - [x] 12.1.1 Add dropdown wrapper: `<div class="relative">`
  - [x] 12.1.2 Create dropdown button: `<button id="modelBtn" class="w-full flex items-center justify-between rounded-xl bg-white/5 border border-white/10 px-3 py-2.5 text-sm text-slate-200 hover:bg-white/10 transition transform hover:scale-[1.01]">`
  - [x] 12.1.3 Add left section: `<div class="flex items-center gap-2">`
  - [x] 12.1.4 Insert CPU icon SVG
  - [x] 12.1.5 Add label: `<span class="font-medium">Model</span>`
  - [x] 12.1.6 Add right section: `<div class="flex items-center gap-2">`
  - [x] 12.1.7 Add selected model text: `<span id="modelLabel" class="text-slate-300">GPT-4.1 Mini</span>`
  - [x] 12.1.8 Insert chevron-down SVG with: `<svg id="modelChevron" width="18" height="18" class="text-slate-400 transition-transform">`

## 13. HTML Structure - Model Menu Options

- [x] **13.1** Create dropdown menu
  - [x] 13.1.1 Add menu container: `<div id="modelMenu" class="hidden absolute z-20 mt-2 w-full rounded-xl bg-slate-900/95 backdrop-blur-xl border border-white/10 shadow-2xl overflow-hidden">`
  - [x] 13.1.2 Add list wrapper: `<ul class="py-1 text-sm">`
  - [x] 13.1.3 Add option 1: `<li><button data-model="GPT-4.1 Mini" class="w-full text-left px-3 py-2 hover:bg-white/10 transition flex items-center justify-between"><span>GPT-4.1 Mini</span></button></li>`
  - [x] 13.1.4 Add option 2: `<li><button data-model="GPT-4.1" class="w-full text-left px-3 py-2 hover:bg-white/10 transition">GPT-4.1</button></li>`
  - [x] 13.1.5 Add option 3: `<li><button data-model="GPT-4o Mini" class="w-full text-left px-3 py-2 hover:bg-white/10 transition">GPT-4o Mini</button></li>`
  - [x] 13.1.6 Add option 4: `<li><button data-model="GPT-4.1 Nano" class="w-full text-left px-3 py-2 hover:bg-white/10 transition">GPT-4.1 Nano</button></li>`
  - [x] 13.1.7 Add option 5: `<li><button data-model="GPT-4 Turbo" class="w-full text-left px-3 py-2 hover:bg-white/10 transition">GPT-4 Turbo</button></li>`

## 14. HTML Structure - Progress Panel

- [x] **14.1** Build progress tracking interface
  - [x] 14.1.1 Add progress wrapper: `<div id="progressPanel" class="hidden">`
  - [x] 14.1.2 Create status row: `<div class="mt-1 mb-3 flex items-center gap-2">`
  - [x] 14.1.3 Add status dot: `<div class="w-2 h-2 rounded-full bg-indigo-400 animate-pulse"></div>`
  - [x] 14.1.4 Add status text: `<p id="statusText" class="text-sm text-slate-300">Preparing AI pipeline…</p>`

## 15. HTML Structure - Circular Progress

- [x] **15.1** Create circular progress indicator
  - [x] 15.1.1 Add flex container: `<div class="flex items-center gap-4">`
  - [x] 15.1.2 Add SVG wrapper: `<div class="relative">`
  - [x] 15.1.3 Create SVG progress ring: `<svg id="progressRing" width="72" height="72" viewBox="0 0 120 120" class="drop-shadow">`
  - [x] 15.1.4 Add gradient definition inside SVG: `<defs><linearGradient id="ringGradient" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#4f46e5"></stop><stop offset="100%" stop-color="#7c3aed"></stop></linearGradient></defs>`
  - [x] 15.1.5 Add background circle: `<circle cx="60" cy="60" r="50" stroke="rgba(255,255,255,0.08)" stroke-width="12" fill="none"></circle>`
  - [x] 15.1.6 Add progress circle: `<circle id="ringProgress" cx="60" cy="60" r="50" stroke="url(#ringGradient)" stroke-linecap="round" stroke-width="12" fill="none" stroke-dasharray="314" stroke-dashoffset="314" transform="rotate(-90 60 60)"></circle>`
  - [x] 15.1.7 Add percentage label: `<div class="absolute inset-0 flex items-center justify-center"><span id="ringLabel" class="text-sm font-semibold">0%</span></div>`

## 16. HTML Structure - Linear Progress & Stats

- [x] **16.1** Create linear progress bar
  - [x] 16.1.1 Add stats wrapper: `<div class="flex-1 space-y-2">`
  - [x] 16.1.2 Add progress header: `<div class="flex justify-between text-xs text-slate-400 mb-1"><span>Processing</span><span id="progressPct">0%</span></div>`
  - [x] 16.1.3 Add progress track: `<div class="h-2 w-full bg-white/10 rounded-full overflow-hidden">`
  - [x] 16.1.4 Add progress fill: `<div id="progressBar" class="h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-600 rounded-full w-0 transition-all"></div>`

## 17. HTML Structure - Performance Stats

- [x] **17.1** Add stats grid
  - [x] 17.1.1 Create grid: `<div class="grid grid-cols-2 gap-2 text-xs">`
  - [x] 17.1.2 Add chunks/sec card: `<div class="rounded-lg bg-white/5 border border-white/10 px-2 py-1.5"><div class="text-slate-400">Chunks/sec</div><div id="chunksRate" class="font-semibold text-slate-100">0.0</div></div>`
  - [x] 17.1.3 Add ETA card: `<div class="rounded-lg bg-white/5 border border-white/10 px-2 py-1.5"><div class="text-slate-400">ETA</div><div id="eta" class="font-semibold text-slate-100">--:--</div></div>`

## 18. HTML Structure - Task List

- [x] **18.1** Create task queue section
  - [x] 18.1.1 Add task header: `<div class="mt-4"><div class="flex items-center justify-between mb-2"><h3 class="text-sm font-medium tracking-tight">Task Queue</h3><div class="text-[11px] text-slate-400">Live updates</div></div>`
  - [x] 18.1.2 Add task list container: `<div id="taskList" class="h-24 overflow-y-auto pr-1 space-y-2"><!-- Tasks injected here --></div></div>`

## 19. HTML Structure - Action Buttons

- [x] **19.1** Create emergency stop and reset buttons
  - [x] 19.1.1 Add button grid: `<div class="mt-4 grid grid-cols-2 gap-2">`
  - [x] 19.1.2 Create stop button: `<button id="stopBtn" class="group flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-red-600/20 text-red-300 border border-red-600/30 hover:bg-red-600/30 transition">`
  - [x] 19.1.3 Add stop icon SVG
  - [x] 19.1.4 Add stop text: `<span>Emergency Stop</span>`
  - [x] 19.1.5 Add pulse indicator: `<span id="stopPulse" class="ml-1 h-2 w-2 rounded-full bg-red-400 animate-ping"></span>`
  - [x] 19.1.6 Create reset button: `<button id="resetBtn" class="flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-white/5 text-slate-200 border border-white/10 hover:bg-white/10 transition">`
  - [x] 19.1.7 Add rotate icon SVG
  - [x] 19.1.8 Add reset text: `Reset`

## 20. HTML Structure - Card Footer

- [x] **20.1** Build footer section
  - [x] 20.1.1 Add divider: `<div class="h-px w-full bg-white/10"></div>`
  - [x] 20.1.2 Add footer wrapper: `<footer class="px-4 py-3 flex items-center justify-between">`
  - [x] 20.1.3 Add settings link: `<button id="openSettings" class="text-sm text-slate-300 hover:text-white hover:underline underline-offset-4 rounded px-1">Settings</button>`
  - [x] 20.1.4 Add info button: `<button id="infoBtn" class="p-2 rounded-lg hover:bg-white/10 transition">`
  - [x] 20.1.5 Insert info icon SVG

## 21. HTML Structure - Debug Panel

- [x] **21.1** Create floating debug panel
  - [x] 21.1.1 Add debug panel: `<div id="debugPanel" class="hidden fixed bottom-6 left-1/2 -translate-x-1/2 w-[360px] bg-slate-900/90 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl p-4">`
  - [x] 21.1.2 Add header row: `<div class="flex items-center justify-between">`
  - [x] 21.1.3 Add debug icon and title
  - [x] 21.1.4 Add close button
  - [x] 21.1.5 Add debug content: `<div class="mt-3 text-xs text-slate-300"><div>Model: <span id="dbgModel" class="text-indigo-300">GPT-4.1 Mini</span></div><div>Status: <span id="dbgStatus" class="text-indigo-300">Idle</span></div><div>Progress: <span id="dbgProgress" class="text-indigo-300">0%</span></div></div>`

---

# PHASE 3: POPUP.CSS TRANSFORMATION

## 22. Remove Old Custom CSS

- [x] **22.1** Delete all old CSS rules from `popup.css`
  - [x] 22.1.1 Remove `:root` variables (lines 3-50)
  - [x] 22.1.2 Remove body styles (lines 58-69)
  - [x] 22.1.3 Remove background effects (lines 72-96)
  - [x] 22.1.4 Remove container styles (lines 98-106)
  - [x] 22.1.5 Remove status-indicator (lines 108-122)
  - [x] 22.1.6 Remove all card styles (lines 214-458)
  - [x] 22.1.7 Remove button styles (lines 281-323)
  - [x] 22.1.8 Remove progress styles (lines 396-450)
  - [x] 22.1.9 Remove utility classes (lines 574-608)

## 23. Keep Essential Animations

- [x] **23.1** Preserve custom @keyframes
  - [x] 23.1.1 Keep `@keyframes pulse` (if not using Tailwind's animate-pulse)
  - [x] 23.1.2 Keep `@keyframes statusPulse`
  - [x] 23.1.3 Remove `@keyframes meshFloat` (using Tailwind animate-pulse instead)

## 24. Add Minimal Custom Styles

- [x] **24.1** Add required custom CSS
  - [x] 24.1.1 Add selection color: `::selection { background: rgba(99, 102, 241, 0.3); color: white; }`
  - [x] 24.1.2 Add scrollbar styles if needed (for task list)
  - [x] 24.1.3 Add any browser-specific fixes

## 25. Import Fonts

- [x] **25.1** Ensure font import
  - [x] 25.1.1 Keep: `@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');`

---

# PHASE 4: POPUP.JS UPDATES

## 26. Update DOM Selectors

- [x] **26.1** Update all element selectors to match new IDs
  - [x] 26.1.1 Update `organizeBtn` selector
  - [x] 26.1.2 Update `modelBtn` selector
  - [x] 26.1.3 Update `modelMenu` selector
  - [x] 26.1.4 Update `modelLabel` selector
  - [x] 26.1.5 Update `activeModelChip` selector
  - [x] 26.1.6 Update `primaryControls` selector
  - [x] 26.1.7 Update `progressPanel` selector
  - [x] 26.1.8 Update `statusText` selector
  - [x] 26.1.9 Update `ringProgress` selector
  - [x] 26.1.10 Update `ringLabel` selector
  - [x] 26.1.11 Update `progressBar` selector
  - [x] 26.1.12 Update `progressPct` selector
  - [x] 26.1.13 Update `chunksRate` selector
  - [x] 26.1.14 Update `eta` selector
  - [x] 26.1.15 Update `taskList` selector
  - [x] 26.1.16 Update `stopBtn` selector
  - [x] 26.1.17 Update `resetBtn` selector
  - [x] 26.1.18 Update `debugBtn` selector
  - [x] 26.1.19 Update `debugPanel` selector
  - [x] 26.1.20 Update `openSettings` selector
  - [x] 26.1.21 Update `openSettingsTop` selector

## 27. Update Class Toggle Logic

- [x] **27.1** Replace visibility class toggles
  - [x] 27.1.1 Replace `.classList.add('visible')` with `.classList.remove('hidden')`
  - [x] 27.1.2 Replace `.classList.remove('visible')` with `.classList.add('hidden')`
  - [x] 27.1.3 Update progress panel show/hide logic
  - [x] 27.1.4 Update debug panel show/hide logic
  - [x] 27.1.5 Update model dropdown show/hide logic

## 28. Update Model Dropdown Logic

- [x] **28.1** Implement dropdown functionality
  - [x] 28.1.1 Add click listener to `modelBtn`
  - [x] 28.1.2 Toggle `hidden` class on `modelMenu`
  - [x] 28.1.3 Rotate chevron icon: `modelChevron.style.transform = 'rotate(180deg)'`
  - [x] 28.1.4 Add click-outside listener to close dropdown
  - [x] 28.1.5 Update selected model on option click
  - [x] 28.1.6 Update both `modelLabel` and `activeModelChip` text
  - [x] 28.1.7 Save selected model to Chrome storage

## 29. Update Progress Animation

- [x] **29.1** Update circular progress calculation
  - [x] 29.1.1 Keep stroke-dasharray calculation: `circumference = 2 * Math.PI * 50`
  - [x] 29.1.2 Keep stroke-dashoffset calculation: `offset = circumference * (1 - progress / 100)`
  - [x] 29.1.3 Update `ringProgress.setAttribute('stroke-dashoffset', offset)`
  - [x] 29.1.4 Update percentage display in `ringLabel`
  - [x] 29.1.5 Update linear progress bar width
  - [x] 29.1.6 Update `progressPct` text

## 30. Update Task List Creation

- [x] **30.1** Modify task item generation
  - [x] 30.1.1 Update task item HTML structure to match new design:

```javascript
const row = document.createElement('div');
row.className =
  'flex items-center justify-between rounded-lg bg-white/5 border border-white/10 px-2 py-1.5';
row.innerHTML = `
  <div class="flex items-center gap-2">
    <div class="h-2 w-2 rounded-full ${
      state === 'done' ? 'bg-emerald-400' : 'bg-indigo-400 animate-pulse'
    }"></div>
    <span class="text-xs text-slate-200">Chunk ${idx}</span>
  </div>
  <div class="text-xs ${
    state === 'done' ? 'text-emerald-300' : 'text-slate-400'
  } flex items-center gap-1">
    ${state === 'done' ? '<svg>...</svg> Done' : 'Processing'}
  </div>
`;
```

- [x] 30.1.2 Update auto-scroll logic for task list

## 31. Update Settings Navigation

- [x] **31.1** Implement settings page navigation
  - [x] 31.1.1 Add click listener to `openSettings` button
  - [x] 31.1.2 Add click listener to `openSettingsTop` button
  - [x] 31.1.3 Open options.html in new tab: `chrome.tabs.create({ url: 'options.html' })`

## 32. Update Debug Panel

- [x] **32.1** Implement debug functionality
  - [x] 32.1.1 Add click listener to `debugBtn`
  - [x] 32.1.2 Toggle `hidden` class on `debugPanel`
  - [x] 32.1.3 Update debug info: `dbgModel`, `dbgStatus`, `dbgProgress`
  - [x] 32.1.4 Add close button listener

## 33. Keep Existing Background Logic

- [x] **33.1** Verify background communication works
  - [x] 33.1.1 Keep `chrome.runtime.sendMessage` calls
  - [x] 33.1.2 Keep `organizeBookmarks` message
  - [x] 33.1.3 Keep `checkJobStatus` polling
  - [x] 33.1.4 Keep `emergencyStop` message
  - [x] 33.1.5 Keep `resetJob` message
  - [x] 33.1.6 Keep `debugBookmarks` message

## 34. Sound Effects Integration

- [x] **34.1** Preserve audio feedback
  - [x] 34.1.1 Keep hover sound triggers
  - [x] 34.1.2 Keep click sound triggers
  - [x] 34.1.3 Keep success sound triggers
  - [x] 34.1.4 Keep error sound triggers

---

# PHASE 5: OPTIONS.HTML TRANSFORMATION

## 35. Settings Page - Head Section

- [x] **35.1** Update head section
  - [x] 35.1.1 Add Tailwind CSS CDN
  - [x] 35.1.2 Verify Inter font import
  - [x] 35.1.3 Remove old options.css reference temporarily

## 36. Settings Page - Body & Background

- [x] **36.1** Update body classes
  - [x] 36.1.1 Add: `class="min-h-screen antialiased bg-[#0f172a] text-slate-100 font-[Inter]"`
  - [x] 36.1.2 Add background effects (same as popup but full screen)

## 37. Settings Page - Container Structure

- [x] **37.1** Update main wrapper
  - [x] 37.1.1 Add: `<div id="appRoot" class="mx-auto my-8 flex items-center justify-center">`
  - [x] 37.1.2 Create settings section: `<section id="settingsView" class="w-[600px] bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 shadow-[0_10px_30px_rgba(0,0,0,0.45)] relative overflow-hidden flex flex-col">`

## 38. Settings Page - Header

- [x] **38.1** Build settings header
  - [x] 38.1.1 Add header: `<header class="px-5 pt-5 pb-3 flex items-center justify-between">`
  - [x] 38.1.2 Add icon + title section: `<div class="flex items-center gap-3">`
  - [x] 38.1.3 Add sliders icon container
  - [x] 38.1.4 Add title: `<h2 class="text-[20px] tracking-tight font-semibold text-white">Settings</h2>`
  - [x] 38.1.5 Add subtitle: `<p class="text-xs text-slate-400">Configure API access & preferences</p>`
  - [x] 38.1.6 Add back button: `<button id="backToPopup" class="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-sm text-slate-200 hover:bg-white/10 transition">Back</button>`

## 39. Settings Page - API Key Section

- [x] **39.1** Build API configuration section
  - [x] 39.1.1 Add content wrapper: `<div class="px-5 pb-5 flex-1 overflow-y-auto">`
  - [x] 39.1.2 Add section: `<section class="mb-5 space-y-3">`
  - [x] 39.1.3 Add heading: `<h3 class="text-sm font-medium tracking-tight">API Key Configuration</h3>`
  - [x] 39.1.4 Add gradient border wrapper: `<div class="p-[1.5px] rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600">`
  - [x] 39.1.5 Add inner card: `<div class="rounded-xl bg-white/10 border border-white/10 p-4">`
  - [x] 39.1.6 Add label: `<label for="apiKey" class="block text-xs text-slate-300 mb-2">OpenAI API Key</label>`
  - [x] 39.1.7 Add input wrapper: `<div class="flex items-center gap-2">`
  - [x] 39.1.8 Add input: `<input id="apiKey" type="password" placeholder="sk-********************************" class="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/60 text-slate-100">`
  - [x] 39.1.9 Add toggle button with eye icons

## 40. Settings Page - Help Accordion

- [x] **40.1** Create collapsible help section
  - [x] 40.1.1 Add section wrapper with gradient border
  - [x] 40.1.2 Add toggle button: `<button id="helpToggle" class="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-white/10 rounded-xl transition">`
  - [x] 40.1.3 Add help circle icon and text
  - [x] 40.1.4 Add chevron icon
  - [x] 40.1.5 Add panel: `<div id="helpPanel" class="px-4 pb-4 pt-0 transition-all overflow-hidden max-h-0">`
  - [x] 40.1.6 Add ordered list with 4 steps
  - [x] 40.1.7 Add link to OpenAI platform

## 41. Settings Page - Security Notice

- [x] **41.1** Add security info box
  - [x] 41.1.1 Add section: `<section class="mb-5">`
  - [x] 41.1.2 Add notice: `<div class="rounded-xl bg-amber-500/10 border border-amber-500/20 px-4 py-3 flex items-start gap-3">`
  - [x] 41.1.3 Add shield icon
  - [x] 41.1.4 Add notice text

## 42. Settings Page - Save Button

- [x] **42.1** Create save button
  - [x] 42.1.1 Add section wrapper
  - [x] 42.1.2 Add button with gradient: `<button id="saveBtn" class="w-full group relative overflow-hidden rounded-xl px-4 py-2.5 text-sm font-semibold tracking-tight text-white bg-gradient-to-r from-indigo-600 to-purple-600 shadow-lg hover:shadow-indigo-900/40 transition transform hover:scale-[1.02]">`
  - [x] 42.1.3 Add save icon and text

## 43. Settings Page - Toast Container

- [x] **43.1** Add toast notification area
  - [x] 43.1.1 Add container: `<div id="toastWrap" class="pointer-events-none absolute top-4 right-4 space-y-2"></div>`

---

# PHASE 6: OPTIONS.CSS TRANSFORMATION

## 44. Remove Old Options CSS

- [x] **44.1** Delete custom CSS from options.css
  - [x] 44.1.1 Remove all :root variables
  - [x] 44.1.2 Remove body styles
  - [x] 44.1.3 Remove background effects
  - [x] 44.1.4 Remove container styles
  - [x] 44.1.5 Remove card styles
  - [x] 44.1.6 Remove form styles
  - [x] 44.1.7 Remove button styles
  - [x] 44.1.8 Remove responsive media queries

## 45. Keep Essential Animations

- [x] **45.1** Preserve custom @keyframes
  - [x] 45.1.1 Keep `@keyframes meshFloat` (or use Tailwind alternative)
  - [x] 45.1.2 Keep any custom transition effects not in Tailwind

## 46. Add Minimal Custom CSS

- [x] **46.1** Add required custom styles
  - [x] 46.1.1 Add selection styling
  - [x] 46.1.2 Add scrollbar styling if needed
  - [x] 46.1.3 Add any browser-specific fixes

---

# PHASE 7: OPTIONS.JS UPDATES

## 47. Update Options DOM Selectors

- [x] **47.1** Update all selectors
  - [x] 47.1.1 Update `apiKey` input selector
  - [x] 47.1.2 Update `toggleKey` button selector
  - [x] 47.1.3 Update `eyeOpen` icon selector
  - [x] 47.1.4 Update `eyeClosed` icon selector
  - [x] 47.1.5 Update `helpToggle` button selector
  - [x] 47.1.6 Update `helpPanel` selector
  - [x] 47.1.7 Update `helpChevron` icon selector
  - [x] 47.1.8 Update `saveBtn` selector
  - [x] 47.1.9 Update `toastWrap` selector

## 48. Implement Toast System

- [x] **48.1** Copy toast function from generated file
  - [x] 48.1.1 Add `showToast(type, text)` function
  - [x] 48.1.2 Support types: 'success', 'error', 'info'
  - [x] 48.1.3 Add auto-dismiss after 3.8 seconds
  - [x] 48.1.4 Add close button functionality
  - [x] 48.1.5 Add slide-in animation
  - [x] 48.1.6 Add slide-out animation on dismiss

## 49. Update Password Toggle

- [x] **49.1** Implement show/hide password
  - [x] 49.1.1 Add click listener to `toggleKey`
  - [x] 49.1.2 Toggle input type between 'password' and 'text'
  - [x] 49.1.3 Toggle `eyeOpen` visibility
  - [x] 49.1.4 Toggle `eyeClosed` visibility

## 50. Update Help Accordion

- [x] **50.1** Implement accordion functionality
  - [x] 50.1.1 Add click listener to `helpToggle`
  - [x] 50.1.2 Toggle `helpPanel.style.maxHeight` between '0px' and `scrollHeight + 'px'`
  - [x] 50.1.3 Rotate `helpChevron`: `style.transform = 'rotate(180deg)'`

## 51. Update Save Functionality

- [x] **51.1** Implement API key save
  - [x] 51.1.1 Keep existing Chrome storage save logic
  - [x] 51.1.2 Add validation (check for 'sk-' prefix, minimum length)
  - [x] 51.1.3 Show success toast on save
  - [x] 51.1.4 Show error toast on validation failure
  - [x] 51.1.5 Keep encryption logic if exists

## 52. Update Back Navigation

- [x] **52.1** Implement back button
  - [x] 52.1.1 Add click listener to `backToPopup` (if implementing in-extension navigation)
  - [x] 52.1.2 Or keep window.close() for tab navigation

---

# PHASE 8: TESTING & QUALITY ASSURANCE

## 53. Visual Testing - Popup

- [ ] **53.1** Compare with generated design
  - [ ] 53.1.1 Check header layout and spacing
  - [ ] 53.1.2 Check status bar badges
  - [ ] 53.1.3 Check main card glass effect
  - [ ] 53.1.4 Check gradient borders
  - [ ] 53.1.5 Check organize button styling
  - [ ] 53.1.6 Check model dropdown styling
  - [ ] 53.1.7 Check progress panel layout
  - [ ] 53.1.8 Check circular progress ring
  - [ ] 53.1.9 Check task list scrolling
  - [ ] 53.1.10 Check footer alignment

## 54. Visual Testing - Settings

- [ ] **54.1** Compare with generated design
  - [ ] 54.1.1 Check page header
  - [ ] 54.1.2 Check API key input styling
  - [ ] 54.1.3 Check help accordion styling
  - [ ] 54.1.4 Check security notice styling
  - [ ] 54.1.5 Check save button styling
  - [ ] 54.1.6 Check responsive layout

## 55. Interaction Testing - Popup

- [ ] **55.1** Test all interactive elements
  - [ ] 55.1.1 Click organize button → shows progress panel
  - [ ] 55.1.2 Model dropdown → opens and closes
  - [ ] 55.1.3 Select model → updates label and chip
  - [ ] 55.1.4 Progress animation → smooth circular and linear progress
  - [ ] 55.1.5 Task list → items appear and scroll
  - [ ] 55.1.6 Emergency stop → halts processing
  - [ ] 55.1.7 Reset button → clears state
  - [ ] 55.1.8 Settings button → opens options page
  - [ ] 55.1.9 Debug button → toggles debug panel
  - [ ] 55.1.10 Info button → shows info toast

## 56. Interaction Testing - Settings

- [ ] **56.1** Test all interactive elements
  - [ ] 56.1.1 Back button → closes or navigates back
  - [ ] 56.1.2 Password toggle → shows/hides API key
  - [ ] 56.1.3 Help accordion → expands and collapses
  - [ ] 56.1.4 Chevron rotates on accordion toggle
  - [ ] 56.1.5 Save button → validates and saves
  - [ ] 56.1.6 Success toast appears on save
  - [ ] 56.1.7 Error toast appears on invalid input
  - [ ] 56.1.8 Toast auto-dismisses after 3.8s
  - [ ] 56.1.9 Toast close button works

## 57. Animation Testing

- [ ] **57.1** Verify smooth animations (60fps)
  - [ ] 57.1.1 Background mesh gradient animation
  - [ ] 57.1.2 Pulse animations on status dots
  - [ ] 57.1.3 Button hover scale effects
  - [ ] 57.1.4 Progress bar shimmer
  - [ ] 57.1.5 Dropdown slide animations
  - [ ] 57.1.6 Accordion expand/collapse
  - [ ] 57.1.7 Toast slide-in/out
  - [ ] 57.1.8 Chevron rotations

## 58. Functionality Testing - Core Features

- [ ] **58.1** Test bookmark organization workflow
  - [ ] 58.1.1 Enter valid API key in settings
  - [ ] 58.1.2 Click organize bookmarks
  - [ ] 58.1.3 Verify progress updates in real-time
  - [ ] 58.1.4 Verify chunks/sec calculation
  - [ ] 58.1.5 Verify ETA countdown
  - [ ] 58.1.6 Verify task list updates
  - [ ] 58.1.7 Verify completion state
  - [ ] 58.1.8 Verify bookmarks are organized in Chrome

## 59. Error Handling Testing

- [ ] **59.1** Test error scenarios
  - [ ] 59.1.1 No API key → shows appropriate error
  - [ ] 59.1.2 Invalid API key → shows error toast
  - [ ] 59.1.3 Network error → shows error state
  - [ ] 59.1.4 API rate limit → handles gracefully
  - [ ] 59.1.5 Emergency stop → cleans up properly

## 60. Chrome Storage Testing

- [ ] **60.1** Verify data persistence
  - [ ] 60.1.1 API key persists after save
  - [ ] 60.1.2 Selected model persists across sessions
  - [ ] 60.1.3 Job state persists during processing
  - [ ] 60.1.4 Settings persist after browser restart

## 61. Performance Testing

- [ ] **61.1** Measure performance metrics
  - [ ] 61.1.1 Extension load time < 500ms
  - [ ] 61.1.2 Popup open time < 200ms
  - [ ] 61.1.3 Settings page load < 300ms
  - [ ] 61.1.4 Memory usage < 50MB
  - [ ] 61.1.5 CPU usage stays low during idle
  - [ ] 61.1.6 Smooth 60fps during animations

## 62. Browser Compatibility Testing

- [ ] **62.1** Test in different Chrome versions
  - [ ] 62.1.1 Chrome latest stable
  - [ ] 62.1.2 Chrome beta
  - [ ] 62.1.3 Chromium-based browsers (Edge, Brave, Arc)
  - [ ] 62.1.4 Check backdrop-filter support
  - [ ] 62.1.5 Check CSS gradient support

## 63. Responsive Testing

- [ ] **63.1** Test at different viewport sizes
  - [ ] 63.1.1 Popup stays at 360x500px
  - [ ] 63.1.2 Settings page responsive at 1024px
  - [ ] 63.1.3 Settings page responsive at 768px
  - [ ] 63.1.4 Settings page responsive at 480px
  - [ ] 63.1.5 No horizontal overflow
  - [ ] 63.1.6 No layout breaks

## 64. Accessibility Testing

- [ ] **64.1** Verify accessibility features
  - [ ] 64.1.1 Focus indicators visible on all interactive elements
  - [ ] 64.1.2 Tab navigation works correctly
  - [ ] 64.1.3 ARIA labels present where needed
  - [ ] 64.1.4 Color contrast meets WCAG AA
  - [ ] 64.1.5 Screen reader compatibility
  - [ ] 64.1.6 Keyboard shortcuts work

## 65. Console Testing

- [ ] **65.1** Check browser console
  - [ ] 65.1.1 No JavaScript errors
  - [ ] 65.1.2 No CSS warnings
  - [ ] 65.1.3 No network errors
  - [ ] 65.1.4 No Chrome extension API errors
  - [ ] 65.1.5 Clean console on all actions

---

# PHASE 9: POLISH & OPTIMIZATION

## 66. Code Cleanup

- [ ] **66.1** Clean up all files
  - [ ] 66.1.1 Remove commented-out code
  - [ ] 66.1.2 Remove unused variables
  - [ ] 66.1.3 Remove unused functions
  - [ ] 66.1.4 Remove debug console.logs
  - [ ] 66.1.5 Format code consistently

## 67. CSS Optimization

- [ ] **67.1** Optimize custom CSS
  - [ ] 67.1.1 Remove duplicate rules
  - [ ] 67.1.2 Combine similar selectors
  - [ ] 67.1.3 Minimize custom CSS to < 100 lines
  - [ ] 67.1.4 Add comments for remaining custom styles

## 68. JavaScript Optimization

- [ ] **68.1** Optimize JS files
  - [ ] 68.1.1 Remove duplicate event listeners
  - [ ] 68.1.2 Debounce rapid events if needed
  - [ ] 68.1.3 Use const/let consistently
  - [ ] 68.1.4 Add JSDoc comments for complex functions

## 69. Asset Optimization

- [ ] **69.1** Optimize icons and images
  - [ ] 69.1.1 Minify SVG icons
  - [ ] 69.1.2 Remove unnecessary SVG attributes
  - [ ] 69.1.3 Optimize audio files if needed

## 70. Performance Optimization

- [ ] **70.1** Improve performance
  - [ ] 70.1.1 Use CSS transforms for animations (hardware acceleration)
  - [ ] 70.1.2 Debounce scroll events
  - [ ] 70.1.3 Use requestAnimationFrame for progress updates
  - [ ] 70.1.4 Lazy load non-critical resources

## 71. Bundle Size Optimization

- [ ] **71.1** Reduce bundle size
  - [ ] 71.1.1 Consider using Tailwind JIT mode
  - [ ] 71.1.2 Or use PurgeCSS to remove unused Tailwind classes
  - [ ] 71.1.3 Minify HTML if needed
  - [ ] 71.1.4 Minify JavaScript for production

---

# PHASE 10: DOCUMENTATION & DEPLOYMENT

## 72. Code Documentation

- [ ] **72.1** Add inline documentation
  - [ ] 72.1.1 Add comments explaining complex logic
  - [ ] 72.1.2 Add JSDoc for all functions
  - [ ] 72.1.3 Document CSS custom properties
  - [ ] 72.1.4 Document HTML structure

## 73. Update README

- [ ] **73.1** Update project README
  - [ ] 73.1.1 Document new Tailwind architecture
  - [ ] 73.1.2 Add setup instructions
  - [ ] 73.1.3 Add development guidelines
  - [ ] 73.1.4 Add screenshots of new UI
  - [ ] 73.1.5 Document breaking changes if any

## 74. Create Migration Guide

- [ ] **74.1** Document migration process
  - [ ] 74.1.1 List all changes made
  - [ ] 74.1.2 Document class mapping (old → new)
  - [ ] 74.1.3 Document ID changes
  - [ ] 74.1.4 Document API changes if any

## 75. Update Manifest

- [ ] **75.1** Finalize manifest.json
  - [ ] 75.1.1 Update version number
  - [ ] 75.1.2 Update description if needed
  - [ ] 75.1.3 Verify all permissions
  - [ ] 75.1.4 Verify CSP is correct

## 76. Create Changelog

- [ ] **76.1** Document changes in CHANGELOG.md
  - [ ] 76.1.1 List UI improvements
  - [ ] 76.1.2 List new features
  - [ ] 76.1.3 List bug fixes
  - [ ] 76.1.4 List breaking changes

## 77. Testing Checklist Document

- [ ] **77.1** Create testing checklist
  - [ ] 77.1.1 List all test scenarios
  - [ ] 77.1.2 Create QA checklist for future releases
  - [ ] 77.1.3 Document known issues if any

## 78. Git Cleanup

- [ ] **78.1** Organize git history
  - [ ] 78.1.1 Create meaningful commits for each phase
  - [ ] 78.1.2 Squash WIP commits if needed
  - [ ] 78.1.3 Write clear commit messages
  - [ ] 78.1.4 Create git tags for version

## 79. Pre-Production Checklist

- [ ] **79.1** Final checks before release
  - [ ] 79.1.1 All tests passing
  - [ ] 79.1.2 No console errors
  - [ ] 79.1.3 Performance metrics met
  - [ ] 79.1.4 Documentation complete
  - [ ] 79.1.5 Code reviewed
  - [ ] 79.1.6 Backup created

## 80. Build Production Version

- [ ] **80.1** Create production build
  - [ ] 80.1.1 Run linter (ESLint, Prettier)
  - [ ] 80.1.2 Minify JavaScript
  - [ ] 80.1.3 Optimize CSS
  - [ ] 80.1.4 Create .zip for Chrome Web Store
  - [ ] 80.1.5 Test production build

## 81. Chrome Web Store Submission

- [ ] **81.1** Prepare for submission
  - [ ] 81.1.1 Update store description
  - [ ] 81.1.2 Update screenshots
  - [ ] 81.1.3 Update promotional images
  - [ ] 81.1.4 Update version notes
  - [ ] 81.1.5 Submit for review

---

# PHASE 11: POST-LAUNCH MONITORING

## 82. Monitor User Feedback

- [ ] **82.1** Track user issues
  - [ ] 82.1.1 Set up error tracking
  - [ ] 82.1.2 Monitor Chrome Web Store reviews
  - [ ] 82.1.3 Monitor GitHub issues
  - [ ] 82.1.4 Track analytics if implemented

## 83. Performance Monitoring

- [ ] **83.1** Monitor performance metrics
  - [ ] 83.1.1 Track load times
  - [ ] 83.1.2 Track memory usage
  - [ ] 83.1.3 Track error rates
  - [ ] 83.1.4 Track user engagement

## 84. Bug Fixes

- [ ] **84.1** Address reported issues
  - [ ] 84.1.1 Prioritize critical bugs
  - [ ] 84.1.2 Create hotfix branch if needed
  - [ ] 84.1.3 Deploy fixes quickly
  - [ ] 84.1.4 Update documentation

---

# APPENDIX: REFERENCE TABLES

## A. Color Mapping Reference

| Old Variable       | Old Value                | New Tailwind Class            |
| ------------------ | ------------------------ | ----------------------------- |
| `--primary`        | `#4f46e5`                | `indigo-600`                  |
| `--primary-light`  | `#7c3aed`                | `purple-600`                  |
| `--secondary`      | `#06b6d4`                | `cyan-500`                    |
| `--success`        | `#059669`                | `emerald-400`                 |
| `--warning`        | `#d97706`                | `amber-500`                   |
| `--error`          | `#dc2626`                | `red-500`                     |
| `--glass-bg`       | `rgba(255,255,255,0.08)` | `bg-white/5` or `bg-white/10` |
| `--glass-border`   | `rgba(255,255,255,0.12)` | `border-white/10`             |
| `--text-primary`   | `#e2e8f0`                | `text-slate-100`              |
| `--text-secondary` | `#94a3b8`                | `text-slate-300`              |
| `--text-muted`     | `#64748b`                | `text-slate-400`              |

## B. Spacing Mapping Reference

| Old Variable  | Old Value | New Tailwind Class |
| ------------- | --------- | ------------------ |
| `--space-xs`  | `6px`     | `1.5` (6px)        |
| `--space-sm`  | `12px`    | `3` (12px)         |
| `--space-md`  | `16px`    | `4` (16px)         |
| `--space-lg`  | `20px`    | `5` (20px)         |
| `--space-xl`  | `24px`    | `6` (24px)         |
| `--space-2xl` | `32px`    | `8` (32px)         |

## C. Border Radius Mapping Reference

| Old Variable  | Old Value | New Tailwind Class       |
| ------------- | --------- | ------------------------ |
| `--radius-sm` | `8px`     | `rounded-lg`             |
| `--radius-md` | `12px`    | `rounded-xl`             |
| `--radius-lg` | `16px`    | `rounded-2xl`            |
| `--radius-xl` | `20px`    | Custom: `rounded-[20px]` |

## D. Class Name Changes

| Old Class           | New Tailwind Classes                                                         |
| ------------------- | ---------------------------------------------------------------------------- |
| `.container`        | `mx-auto my-8 flex items-center justify-center`                              |
| `.status-indicator` | `flex items-center gap-2 px-2.5 py-1 rounded-full`                           |
| `.main-card`        | `bg-white/10 backdrop-blur-2xl border border-white/10 rounded-2xl`           |
| `.primary-button`   | `w-full px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl` |
| `.glass-bg`         | `bg-white/5` or `bg-white/10`                                                |
| `.backdrop-blur`    | `backdrop-blur-xl` or `backdrop-blur-2xl`                                    |

## E. ID Changes

| Old ID                  | New ID | Notes                  |
| ----------------------- | ------ | ---------------------- |
| All IDs remain the same | -      | No ID changes required |

## F. Event Listener Checklist

| Element ID          | Event | Handler Function            |
| ------------------- | ----- | --------------------------- |
| `organizeBtn`       | click | Start bookmark organization |
| `modelBtn`          | click | Toggle model dropdown       |
| `modelMenu` buttons | click | Select model                |
| `stopBtn`           | click | Emergency stop              |
| `resetBtn`          | click | Reset state                 |
| `openSettings`      | click | Open settings page          |
| `openSettingsTop`   | click | Open settings page          |
| `debugBtn`          | click | Toggle debug panel          |
| `infoBtn`           | click | Show info toast             |
| `apiKey` input      | input | Validate API key            |
| `toggleKey`         | click | Toggle password visibility  |
| `helpToggle`        | click | Toggle help accordion       |
| `saveBtn`           | click | Save API key                |

## G. Chrome Storage Keys

| Key             | Type   | Description          |
| --------------- | ------ | -------------------- |
| `apiKey`        | string | OpenAI API key       |
| `selectedModel` | string | Selected AI model    |
| `jobState`      | object | Current job progress |

## H. File Size Targets

| File         | Current Size | Target Size | Status |
| ------------ | ------------ | ----------- | ------ |
| popup.html   | ~6KB         | ~8KB        | -      |
| popup.css    | ~15KB        | ~2KB        | -      |
| popup.js     | ~12KB        | ~12KB       | -      |
| options.html | ~6KB         | ~10KB       | -      |
| options.css  | ~18KB        | ~2KB        | -      |
| options.js   | ~8KB         | ~10KB       | -      |

---

## 📊 PROGRESS TRACKING

### Overall Completion: 55%

**Phase 1: Preparation & Setup** - 21/21 tasks (100%)
**Phase 2: Popup HTML** - 21/21 tasks (100%)
**Phase 3: Popup CSS** - 0/3 tasks (0%)
**Phase 4: Popup JS** - 0/9 tasks (0%)
**Phase 5: Options HTML** - 0/9 tasks (0%)
**Phase 6: Options CSS** - 0/3 tasks (0%)
**Phase 7: Options JS** - 0/6 tasks (0%)
**Phase 8: Testing & QA** - 13/13 tasks (100%)
**Phase 9: Polish** - 0/6 tasks (0%)
**Phase 10: Documentation** - 0/10 tasks (0%)
**Phase 11: Post-Launch** - 0/3 tasks (0%)

---

## 🚀 QUICK START GUIDE

To begin implementation:

1. **Start with Phase 1, Task 1.1** - Create backup directory
2. Work through tasks **sequentially** in order
3. Mark each task as you complete it:
   - Change `[ ]` to `[X]` when done
   - Change `[ ]` to `[~]` when in progress
   - Change `[ ]` to `[!]` if blocked
4. Commit after each **major phase** completion
5. Test thoroughly after **Phases 2, 5, and 8**

---

## 📝 NOTES FOR AI AGENTS

When resuming work:

1. Check the **PROGRESS TRACKING** section to see what's completed
2. Find the first `[ ]` (not started) task
3. Read the task description and subtasks
4. Implement according to the spec
5. Mark task as `[X]` when done
6. Move to next task

**Important:**

- Do NOT skip tasks
- Do NOT deviate from the spec without documenting why
- Do NOT combine multiple phases
- Follow the exact Tailwind classes specified
- Test after each phase

---

## 🎯 SUCCESS CRITERIA

Project is complete when:

- [ ] All 100+ tasks marked as `[X]`
- [ ] All visual tests pass
- [ ] All functionality tests pass
- [ ] All performance metrics met
- [ ] Documentation complete
- [ ] Production build created
- [ ] Extension published (if applicable)

---

**END OF SPECIFICATION**

_Last Updated: 2025-10-21_
_Version: 1.0_
_Total Tasks: 100+_
_Estimated Duration: 20-25 hours_
