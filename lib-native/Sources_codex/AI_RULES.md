# AI_RULES.md

# InterActive Project – AI Engineering Rules

This document defines the permanent engineering rules for all AI assistants
working on this project.

These rules apply to every implementation task unless the user explicitly
overrides them.

---

# 1. Source of Truth

Always read these documents before making architectural changes:

1.

implementation-specification.md

2.

2026_2027/PROJECT_DOCUMENTATION.md

These two documents are the project's canonical references.

Neither document is historical.

Neither document is optional.

Both documents must remain synchronized.

---

# 2. Documentation Rule

Every implementation that changes architecture, runtime behavior,
SCORM behavior, QA behavior, feedback behavior,
or data flow MUST update BOTH:

- implementation-specification.md
- PROJECT_DOCUMENTATION.md

Never update one without the other.

Do not create contradictory documentation.

---

# 3. Minimal Changes

Always prefer the smallest possible implementation.

Never perform unrelated refactoring.

Never rewrite working code.

Never rename functions without explicit approval.

Never move code unless required.

Never optimize unless requested.

---

# 4. Preserve Existing Behavior

Unless explicitly requested, never change:

- SCORM behavior
- Learning Object behavior
- Question flow
- Feedback flow
- UI behavior
- Navigation
- Audio
- Animation
- JSON schema
- Runtime lifecycle

The requested feature should be isolated.

---

# 5. SCORM Rules

The SCORM implementation is considered stable.

Do not modify:

- highest-score policy
- completion_status
- success_status
- total_time
- NumberOfAttempt
- reportResult()
- updateScore()
- restorePersistedCmi()
- restoreScormServiceStatus()
- applyHighestScormScore()
- completeSession()
- scormPost()

unless the task explicitly requires it.

---

# 6. Highest Score Rule

Highest Score must never decrease.

Lower attempts must never overwrite
a previously achieved higher score.

Preserve the current implementation.

---

# 7. Current Attempt Rule

Current Attempt Score
and
Historical SCORM Score

are intentionally separate concepts.

Feedback uses Current Attempt Score.

SCORM persistence uses Highest Score.

Never merge them.

---

# 8. QA Logging

Do not modify QA logging unless requested.

Preserve:

- QA object structure
- console output
- logging timing
- filtering
- environment rules

---

# 9. Runtime Ownership

Never infer ownership from filenames.

Always trace the runtime call chain.

Many files are helpers only.

Examples:

choose.js

drag.js

match.js

correct.js

may not own runtime behavior.

Determine ownership by execution flow,
not by filename.

---

# 10. Before Editing

Always inspect:

- who owns the lifecycle
- who owns the state
- who owns persistence
- who owns logging
- who owns scoring

Modify only the true owner.

---

# 11. Shared Helpers

If a helper already exists,
reuse it.

Do not duplicate functionality.

Do not introduce equivalent helpers.

---

# 12. Preserve Existing APIs

Do not change public APIs.

Do not change parameter order.

Do not rename exported methods.

---

# 13. Validation

Every implementation must include:

- syntax validation

(node --check where applicable)

- targeted code review

- execution-path verification

- final report

---

# 14. Final Report

Every completed task must include:

- files inspected
- files modified
- files intentionally left unchanged
- validation performed
- documentation updated
- confirmation that unrelated behavior
  was preserved

---

# 15. No Assumptions

Never assume.

Trace the code.

Read the implementation.

If something is ambiguous:

report it.

Do not invent behavior.

---

# 16. Code Style

Match the existing codebase.

Do not introduce a new coding style.

Keep changes consistent with surrounding code.

---

# 17. Project Philosophy

This project is production software.

Correctness is more important than elegance.

Backward compatibility is more important than refactoring.

Minimal risk is preferred over large improvements.

Every change should be:

- isolated
- understandable
- reversible
- documented

---

# 18. AI Workflow

For every task:

1. Read the relevant documentation.

2. Read the complete target file(s).

3. Understand the execution flow.

4. Identify the real owner.

5. Implement only the requested change.

6. Validate.

7. Update both documentation files.

8. Return a complete implementation report.

Never skip these steps.
