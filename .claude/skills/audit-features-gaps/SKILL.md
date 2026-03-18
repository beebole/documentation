---
name: audit-features-gaps
description: "Check .features/features.md against the documentation and produce a numbered plan of action for every undocumented or partially documented sub-feature. Use when asked which features are missing from the docs, what needs to be written, or to get a coverage audit."
disable-model-invocation: true
---

# Audit Feature Coverage Gaps

Compare every user-facing feature bullet in `.features/features.md` against the documentation. For each feature that is missing or only partially documented, produce a numbered plan of action and a compact quick-reference index. Save results to `.todo/coverage-gaps.md` and print both blocks to chat.
