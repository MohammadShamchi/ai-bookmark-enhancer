<!-- c313abc9-65b9-4390-8b56-8ce7b4ad3a45 f2c7c693-1801-4d12-833d-78d5cbc1935e -->
# Full-page Bookmark Organizer Plan

## Steps

1. Update extension entry point

- Remove the `default_popup` entry from `manifest.json`.
- Add an `chrome.action.onClicked` handler in `background.js` that opens a new tab at `chrome.runtime.getURL('popup.html')`.
- Confirm no other logic expects the popup to exist.

2. Rework `popup.html` for full-tab layout

- Replace the fixed-width container (`w-[360px] h-[600px]`) with responsive classes (`max-w-4xl`, `min-h-screen`, `mx-auto`, `py-10`, etc.).
- Ensure modal/backdrop positioning uses viewport-relative units so it still covers the entire page.
- Verify background/gradient elements still render correctly at larger sizes.

3. Adjust styles/scripts if needed

- Review `popup.js` for any layout-dependent assumptions (e.g., size checks, hard-coded measurements) and remove them if found.
- Update `popup.css` and related assets only if necessary to support the full-width layout.

4. Test experience

- Reload the extension, click the toolbar icon, and confirm a new tab opens with the organizer UI filling the page.
- Trigger the consent modal to ensure scrolling and interaction work in the full-tab context.

## Todos

- [ ] update-entry
- modify manifest and background scripts to launch a tab
- *Requirements: 1.1*
- [ ] expand-layout
- make `popup.html` responsive and full viewport
- *Requirements: 2.1, 2.2*
- [ ] verify-behavior
- sanity check JS/layout interactions in the new context
- *Requirements: 3.1, 4.1*