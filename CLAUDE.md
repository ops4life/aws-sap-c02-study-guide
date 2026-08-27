# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A static, no-build-step study guide site for the AWS Certified Solutions Architect – Professional (SAP-C02) exam, deployed via GitHub Pages at ops4life.github.io/aws-sap-c02-study-guide. Content is four Markdown domain files rendered client-side by a vanilla-JS app.

## Running locally

No build/install step. Serve the directory and open it:

```bash
python3 -m http.server 8000
# or: npx http-server
# then open http://localhost:8000
```

There are no tests, linter, or package.json. Verify changes by loading the page and clicking through navigation, checking the browser console for errors (mirrors STATUS.md's "Local verification" step).

## Architecture

- `index.html` / `styles.css` / `app.js` — single-page app shell. `app.js`'s `StudyGuideApp` class does everything: fetches each domain Markdown file, renders it with `marked.js` (loaded from CDN), and builds the sidebar nav.
- `01_Organizational_Complexity.md` … `04_Migration_and_Modernization.md` — the actual study content, one file per exam domain.
- **Sidebar nav is derived entirely from Markdown headings** — `app.js`'s `extractTopics()` walks each file splitting on `## ` (H2, skipping any titled "Overview") and `### ` (H3 subtopics). Every H2/H3 becomes a clickable, individually-progress-tracked topic. There is no separate manifest to update when editing content — just keep heading structure consistent.
- **Domain file skeleton** (documented in STATUS.md), follow this shape when adding/editing a domain file so extraction and progress tracking work correctly:
  ```
  # Domain N: <Title> (weight%)
  ## Overview          <- excluded from topic extraction
  ---
  ## N. <Task statement>       <- H2 topic
  ### N.M <subtopic>           <- H3 subtopic (nested under preceding H2)
  ## Key Exam Tips
  ## Practice Scenarios
  ## Additional Resources
  ```
- `this.sections` array at the top of `app.js` (constructor) is the one place that lists the four domain files/titles/ids — update it only if adding/removing/renaming a whole domain file, not for content edits within a file.
- **Progress/notes persistence**: `localStorage` only, keyed by `getTopicKey(sectionId, topicTitle)` — a slugified `sectionId-topictitle`. Because the key is derived from the heading text itself, renaming an H2/H3 heading orphans any existing saved progress/notes for that topic (readers lose their checkmark). Prefer adding new headings over renaming existing ones where practical.
- `STATUS.md` tracks authoring progress per file — update its table when completing/changing a major content section.

## UI density conventions

The layout is intentionally dense (optimized for scanning study content, not marketing-page whitespace). When touching `styles.css`, keep to this spacing scale rather than reintroducing large paddings/margins:
- Content padding: `study-content` 1.75rem/2.5rem, `content-header` 1.125rem/2rem, `sidebar-header` 1.5rem.
- Heading top-margins inside rendered Markdown: h2 1.75rem, h3 1.5rem, h4 1.25rem.
- Body/paragraph/list `line-height`: 1.6 (not 1.7).

## Verifying AWS facts

Domain files state concrete AWS service quotas/limits and service names (e.g. Organizations account limits, Transit Gateway/Direct Connect quotas, current vs. legacy migration service names). These drift as AWS updates its docs. When editing content that states a specific number or service name, spot-check it against current docs via the `context7` MCP tool (`resolve-library-id` → `query-docs`, e.g. library `/websites/aws_amazon` or `/websites/aws_amazon_servicequotas_userguide`) rather than trusting training data or the existing file content.
