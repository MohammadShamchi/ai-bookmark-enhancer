<!-- c9f2f120-75ad-4df8-97a2-e068cf8e1a00 d3b914e2-0962-44a7-8443-d68b9d7055bf -->
# Fix Popup UI Layout

## Goal

Ensure the consent modal footer is always visible and the popup layout has consistent padding so controls (like Settings) never clip.

## Plan

### Step 1: Restructure Consent Modal

- File: `popup.html`
- Convert modal container to `flex flex-col` with `max-h-[calc(100vh-2rem)]` and `overflow-hidden`.
- Move scrolling to the content section (`flex-1 overflow-y-auto`) so the footer stays fixed.
- Add body class toggle in `popup.js` if necessary to prevent background scroll when modal is open.

### Step 2: Adjust Popup Shell Spacing

- File: `popup.html`
- Reduce `#appRoot` vertical margin (`my-8` → `my-4`) to reclaim vertical space.
- Replace fixed height `h-[500px]` on `#popupView` with responsive `min-h`/`max-h` plus `overflow-y-auto` so content can scroll instead of clipping.
- Ensure `main` and footer paddings stay consistent (≥24px).

### Step 3: Validate Layout & Styling

- Files: `popup.html`, `popup.css`
- Confirm background gradients still fill viewport after margin changes.
- Check popup at 100% and 125% zoom to confirm Settings button and modal buttons remain visible.
- Verify no regressions in status bar, cards, or debug panel alignment.

### To-dos

- [x] Reduce consent modal max-height from max-h-[90vh] to max-h-[420px] to fit in 500px popup
- [x] Reduce modal padding: header/footer p-6→p-4, content space-y-6→space-y-4, sections p-3→p-2.5
- [x] Increase popup horizontal padding: header px-4→px-6, ensure consistent padding across sections
- [x] Fix Settings button clipping by adding adequate bottom padding and checking flex layout
- [x] Test consent modal displays footer buttons and scrolls properly