# Build Status

Tracks progress on authoring this site. Source: AWS Certified Solutions Architect – Professional
(SAP-C02) Exam Guide PDF (official outline only — content below is expanded well beyond the PDF's
bare bullet points, matching the depth of `/opt/az-104-study-guide`).

| # | Item | File | Status |
|---|------|------|--------|
| 1 | Scaffold (index.html, app.js, styles.css, .nojekyll) | — | ✅ done |
| 2 | Domain 1: Design Solutions for Organizational Complexity (26%, 5 task statements) | `01_Organizational_Complexity.md` | ✅ done |
| 3 | Domain 2: Design for New Solutions (29%, 6 task statements) | `02_New_Solutions.md` | ✅ done |
| 4 | Domain 3: Continuous Improvement for Existing Solutions (25%, 5 task statements) | `03_Continuous_Improvement.md` | ✅ done |
| 5 | Domain 4: Accelerate Workload Migration and Modernization (20%, 4 task statements) | `04_Migration_and_Modernization.md` | ✅ done |
| 6 | README.md (exam overview, GH Pages instructions, topic index, cheat sheet, study checklist) | `README.md` | ✅ done |
| 7 | Local verification (serve, click through nav, check console) | — | ✅ done |

Legend: ⬜ not started · 🟨 in progress · ✅ done

## Resume instructions
If picking this up in a new session: check the table above for the first non-✅ row and continue
from there. Each domain file follows the skeleton documented in the implementation plan
(`# Domain N: <Title> (weight%)` → `## Overview` → `---` → `## N. <Task statement>` /
`### N.M <subtopic>` sections → `## Key Exam Tips` → `## Practice Scenarios` → `## Additional Resources`).
`app.js`'s `this.sections` array (already wired) auto-picks up nav structure from each file's H2/H3
headings — no other manifest to update.
