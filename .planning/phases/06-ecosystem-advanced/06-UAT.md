---
status: testing
phase: 06-ecosystem-advanced
source: [SUMMARY.md]
started: 2026-04-13T11:10:00Z
updated: 2026-04-13T16:00:00Z
---

## Current Test
<!-- OVERWRITE each test - shows where we are -->

number: 3
name: Monaco Editor with ATA
expected: |
  View a slide with a Monaco editor code block in `demo.md`. 
  The editor shows syntax highlighting (Shiki). 
  After a few seconds, it provides IntelliSense for external libraries like `nanostores` (e.g., hover over `atom` to see its type).
awaiting: user response

## Tests

### 1. Cold Start Smoke Test
expected: |
  Kill any running server/service. Clear ephemeral state (temp DBs, caches, lock files). 
  Start the application from scratch using `npm run slidastro dev demo.md`. 
  Server boots without errors, and the first slide of `demo.md` renders correctly in the browser.
result: pass

### 2. Mermaid Integration
expected: |
  View a slide with a Mermaid diagram in `demo.md`. 
  The diagram renders correctly. 
  Switch between dark and light themes in the browser/OS; the diagram re-renders and adapts its theme automatically.
result: issue
reported: "I'm not sure how to toggle light/dark because the menu/buttons show garbled text like: âœï¸"
severity: major

### 3. Monaco Editor with ATA
expected: |
  View a slide with a Monaco editor code block in `demo.md`. 
  The editor shows syntax highlighting (Shiki). 
  After a few seconds, it provides IntelliSense for external libraries like `nanostores` (e.g., hover over `atom` to see its type).
result: [pending]

### 4. Drauu Drawing Tools
expected: |
  Open the drawing toolbar in the viewer. 
  Select the pen tool and draw on the current slide. 
  Switch tools (eraser, clear) and verify they work as expected. 
  Navigation away and back to the slide should preserve the drawing.
result: [pending]

### 5. State Sync for Drawings
expected: |
  Open the presentation in two separate windows (e.g., Presenter and Audience views). 
  Draw on a slide in one window; the drawing appears in the other window in real-time.
result: [pending]

### 6. In-Browser Recording
expected: |
  Use the recording feature in the viewer. 
  Capture the screen with a camera overlay. 
  Stop the recording and download the `.webm` file. 
  Verify the video file plays and contains the expected content.
result: [pending]

### 7. MDX Support
expected: |
  Run `npm run slidastro dev presentation.mdx`. 
  The slides render correctly, and any imported Astro components function as expected within the MDX content.
result: [pending]

### 8. Astro Support
expected: |
  Run `npm run slidastro dev demo.astro`. 
  The single slide defined in the Astro file renders correctly in the browser.
result: [pending]

## Summary

total: 8
passed: 1
issues: 1
pending: 6
skipped: 0

## Gaps

- truth: "Server boots without errors, and the first slide of demo.md renders correctly in the browser."
  status: failed
  reason: "User reported: 404 not found"
  severity: blocker
  test: 1
  root_cause: "Catch-all route /[...no] was not matching the root /. Added explicit / route injection."
  artifacts:
    - path: "packages/core/src/index.ts"
      issue: "Missing root route injection"
  missing:
    - "Add injectRoute for pattern '/'"
  debug_session: ""

- truth: "UI menus and buttons display characters correctly."
  status: failed
  reason: "User reported: menu/buttons show garbled text like: âœï¸"
  severity: major
  test: 2
  root_cause: "Templates missing <meta charset=\"UTF-8\"> tag."
  artifacts:
    - path: "packages/core/src/templates/SlideView.astro"
      issue: "Missing UTF-8 meta tag"
    - path: "packages/core/src/templates/OverviewView.astro"
      issue: "Missing UTF-8 meta tag"
  missing:
    - "Add <meta charset=\"UTF-8\"> to all HTML templates"
  debug_session: ""
