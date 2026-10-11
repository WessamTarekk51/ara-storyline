# Task Invocation

## Reusable Task ID

```text
SCORM_RUNTIME_ALIGNMENT
```

This task is intended to be executed repeatedly against different Learning Object JavaScript files.

The only mandatory runtime input is:

```text
TARGET_SCRIPT
```

`TASK_NOTES` is optional. If it is omitted or set to `None`, the task must still begin immediately.

All implementation rules, constraints, validation requirements, and preservation rules are defined in this document.

## Mandatory Reference Files

Every execution of `SCORM_RUNTIME_ALIGNMENT` must read and use both of the following files:

```text
D:\ST-Projects-InterActive_2025\InterActive-Project\implementation-specification.md
```

```text
D:\ST-Projects-InterActive_2025\InterActive-Project\2026_2027\lib-native\digital-screen_26\choose\js\zoki.js
```

The reference `zoki.js` must be used only as the concrete reference for SCORM, metadata, console behavior, highest-score handling, immediate final reporting, and `NumberOfAttempt`.

It must not be copied wholesale over the target script.

The target Learning Object’s original architecture and behavior must remain unchanged.

## Invocation Format

To execute the reusable task, use:

```text
Execute Task: SCORM_RUNTIME_ALIGNMENT

TARGET_SCRIPT:
<absolute path to the target JavaScript file>

TASK_NOTES:
<optional notes or None>
```

## Example

```text
Execute Task: SCORM_RUNTIME_ALIGNMENT

TARGET_SCRIPT:
D:\ST-Projects-InterActive_2025\InterActive-Project\2026_2027\lib-native\digital-screen_26\input\js\zoki.js

TASK_NOTES:
None
```

## Invocation Behavior

When a valid invocation containing `TARGET_SCRIPT` is provided:

* Do not ask which task should be executed.
* Do not ask whether implementation should begin.
* Do not ask for confirmation before editing.
* Do not ask for `TASK_NOTES` when they are omitted.
* Do not substitute the currently open editor file for `TARGET_SCRIPT`.
* Do not modify a different file based on editor state or assumptions.
* Use the exact absolute path supplied in `TARGET_SCRIPT`.
* Read the complete current version of `implementation-specification.md`.
* Read the complete current reference `zoki.js`.
* Read the complete target script.
* Analyze the target script’s real architecture and completion paths.
* Perform the complete requirement-by-requirement audit.
* Apply only the missing or incorrect SCORM, console, metadata, visit-count, and directly related persistence behavior.
* Preserve all unrelated Learning Object behavior.
* Run the required validation.
* Provide the required final implementation report.

## Missing Input Behavior

Only ask for clarification when `TARGET_SCRIPT` is missing, empty, invalid, or points to more than one possible file.

If `TARGET_SCRIPT` is present and unambiguous, begin the task immediately.

## Path Authority Rule

`TARGET_SCRIPT` is authoritative.

The currently open file, active editor tab, recently modified file, similarly named file, or inferred template path must never replace the explicitly supplied `TARGET_SCRIPT`.

Before editing, confirm internally that the file being modified exactly matches the supplied absolute path.

## Execution Requirement

A valid task invocation is an instruction to perform the implementation, not a request to describe the task.

Do not stop after:

* explaining the task
* producing a plan
* listing recommendations
* identifying missing changes
* comparing the target with the reference

Proceed through analysis, implementation, validation, documentation review, and final reporting in the same task execution.

# 1. Overall Goal

The goal of the transformation is to add SCORM reporting support to existing JavaScript learning-object scripts without changing their original activity behavior.

The SCORM logic must behave as an adapter layer around the existing flow. It observes the activity state, enriches the loaded activity data with SCORM-compatible metadata, calculates the final result using the script's existing scoring model, and reports completion only when the activity has genuinely reached one of its existing completion paths.

The transformation must not rewrite the quiz, activity, UI, animation, audio, navigation, scoring, answer-checking, shuffling, submit, or feedback logic. The original script remains the source of truth for activity behavior. SCORM is added around it.

# 2. Guiding Principles

- Preserve existing business logic.
- Preserve the file's architecture and coding style.
- Prefer additive changes over rewrites.
- Keep backward compatibility wherever possible.
- Avoid changing unrelated behavior.
- Keep modifications localized to SCORM, metadata normalization, debug output, and unload cleanup.
- Reuse existing counters, flags, and completion functions instead of introducing a new activity lifecycle.
- Do not blindly copy from another file; map the pattern to the target file's real variables and flow.
- Do not change existing scoring unless the SCORM score needs to read from it.
- Do not change DOM behavior, transitions, audio playback, animations, timers, or navigation.
- Do not remove duplicate methods if they already exist. Preserve them and add the SCORM call consistently where needed.
- Do not assume a completion path. Identify it from the existing code.
- If a file has multiple valid final paths, call `scormPost()` from each path and prevent duplicate reporting inside `scormPost()`.
- Keep SCORM calls guarded so files still work when `window.ScormService` is unavailable.
- Wrap SCORM API calls in `try/catch`.

## Living Documentation Requirement

This file is the official implementation specification and Single Source of Truth (SSOT) for the project.

Every completed implementation, refactor, architectural improvement, cleanup, integration change, behavioral modification, configuration change, JSON/data-structure change, metadata change, logging change, API change, file-organization change, or business-logic change must include a review and synchronization of this document.

Before modifying any source file, read this document completely and use it as the source of truth for the implementation approach.

Updating source code without updating this specification when the implementation changes is an incomplete task. No implementation task is complete until the source code and this document describe the same current behavior.

The required workflow for every task is:

1. Analyze the requested change:
   - identify the purpose
   - identify affected modules
   - identify impacted behavior
   - identify compatibility considerations
   - identify the implementation scope
2. Check this specification:
   - determine whether the requested behavior is already documented
   - update existing sections instead of duplicating documentation
   - remove obsolete or contradictory information
3. Implement with minimal, localized changes while preserving existing behavior, architecture, public APIs, coding conventions, and backward compatibility.
4. Update this specification immediately after implementation whenever the work changes behavior, architecture, workflow, configuration, data structure, metadata, logging, APIs, file organization, validation rules, error handling, compatibility, limitations, migration notes, or reusable implementation methodology.
5. Cross-validate before finishing:
   - source code reflects the requested behavior
   - this specification reflects the actual implementation
   - no undocumented implementation behavior remains
   - no documented behavior is missing from the implementation
   - no obsolete or contradictory documentation remains

After each completed task:

- Determine whether the completed work changes the implementation methodology.
- Update only the relevant sections when the methodology changes.
- Preserve unaffected sections.
- Keep the document internally consistent.
- Remove obsolete implementation details.
- Add newly established implementation patterns.
- Update workflow, validation, risks, and reusable-pattern guidance whenever they evolve.
- Keep the document synchronized with the current codebase.

Documentation must be technically accurate, implementation-focused, version-independent, concise but complete, and suitable for onboarding another developer or AI coding assistant without additional context. Do not add temporary notes or TODOs unless explicitly requested. Describe the actual current implementation, not intended future behavior.

# 3. Transformation Rules

## SCORM Integration Pattern

Add SCORM as a small adapter layer, not as a replacement for the activity flow.

The integration consists of:

- Guarded `window.ScormService` initialization.
- Start-time tracking.
- Activity data enrichment after data loading.
- A time conversion helper.
- A centralized `scormPost()` method.
- Calls to `scormPost()` from real completion paths.
- No activity-script call to `window.ScormService.finish()`; session finalization is owned outside the activity scripts.

The existing activity continues to calculate answers, counters, feedback, UI state, and final submit exactly as before.

## Initialization Pattern

Insert SCORM initialization near the top of the file, after existing top-level DOM/page constants and before the Vue/app instance.

The initialization must:

- Check whether `window.ScormService` exists.
- Call `window.ScormService.init()` only if available.
- Store the connection result in a local `scormConnected` flag when used.
- Catch and log initialization errors with `console.error`, without a message prefix (for example `console.error("ScormService init error:", e)`).
- Avoid throwing if SCORM is missing.
- Do not print a non-error initialization status log; successful initialization is silent.

This keeps the script usable both inside and outside an LMS/SCORM runtime.

## Data Normalization Pattern

After activity data has loaded and after URL/query overrides have been applied, enrich the main activity data object.

First identify the main data object. Common shapes seen so far:

- `this.posts[0]`
- `this.posts`

Then add or normalize:

- `numberOfTotalQuestion`
- `studentPoint`
- `scoreOutOf10`
- `NumberOfAttempt`
- `lang`
- `feedBackTxt`
- `feedBackDes`
- `feedbackIndex`
- `studentProgress`
- `cmi`

`numberOfTotalQuestion` should come from the complete items/questions array where available:

- `this.posts[0].items.length`
- `this.posts[0].questions.length`
- `this.allQuestions.length`
- `this.shuffledQuestion.length`

`studentPoint` should be initialized as `0`.

`studentPoint` is the project's normalized learner score out of 10. The target script's internal percentage calculation, commonly named `result`, remains a 0-100 value and must not be changed when introducing or updating `studentPoint`. Store `studentPoint` by dividing the percentage result by 10 and rounding to one decimal place, for example `Number((result / 10).toFixed(1))`. It should be calculated when the activity result is calculated in the target script's normal result flow, usually inside the file's equivalent of `finished()`, `feedback()`, final score calculation, or final result helper. Do not create or update `studentPoint` only inside delayed SCORM posting.

`scormPost()` should read already-prepared scoring values such as `studentPoint`, `scoreOutOf10`, and the file's existing counters. It should adapt those values into SCORM fields without treating `studentPoint` as the SCORM raw score. SCORM raw score calculations remain percentage-based and continue to use the 0-100 result/current-attempt score where required. `scormPost()` should not be the primary owner of activity score calculation. A defensive fallback calculation is acceptable only to prevent runtime failure in older files, but the normal implementation path must prepare `studentPoint` before SCORM reporting is scheduled.

`counterCorrect` and `scoreOutOf10` have separate meanings:

- `counterCorrect` must represent only the actual number of correct answers.
- When `LOcorrectcounter` is the source correct-answer counter, synchronize `counterCorrect` immediately after every `LOcorrectcounter` mutation, including resets and increments.
- `studentPoint` must represent the normalized learner score out of 10 derived from the 0-100 activity percentage.
- `scoreOutOf10` must represent the normalized score bucket out of 10 used by submit/runtime degree logic when that bucketed scoring model exists.
- Every Learning Object must guarantee that `scoreOutOf10` exists during data normalization. Initialize it to `0` only when missing; do not overwrite an existing value.
- Do not store normalized score buckets in `counterCorrect`.
- When a 0-10 score is required for submit/runtime degree logic, use `scoreOutOf10`.
- When existing older payloads do not yet provide `scoreOutOf10`, shared submit code may derive it from the legacy value for backward compatibility, then write it back to `posts.scoreOutOf10`.

`NumberOfAttempt` means the number of times the learner has opened or visited the Learning Object. It is not a question-attempt counter, wrong-answer counter, retry counter inside the same session, `finished()` call count, or SCORM report count.

Initialize `NumberOfAttempt` only after the final post object for the current session has been restored or selected, and before the first save/submit of that session. Read the previous value from the existing persistence mechanism, such as `learningObjectAsJson`, persisted full-post payloads, SCORM suspend data, or the target script's established equivalent. Do not implement it as an in-memory increment unless the previous value has first been restored from persistent state.

The increment rule is:

- Convert the restored value to a number.
- If it is a finite non-negative value, store `Math.floor(previousValue) + 1`.
- If it is missing, malformed, or negative, store `1`.
- Increment exactly once per runtime/page session.
- Use the smallest session guard needed when a script's data-loading lifecycle can run more than once.
- Do not increment in answer handlers, wrong/correct branches, timers, loops, feedback functions, `finished()`, `scormPost()`, SCORM scheduling, or repeated submit calls.

The incremented value must be included in the existing full-post persistence payload. Do not create a separate save path when the current submit/update flow already persists the whole post object. If the existing persistence flow cannot retain the value between visits, report that limitation clearly.

When the existing persistence flow parses a restored full-post payload only to read specific continuity fields (such as the previous SCORM score, persisted runtime `cmi`, and `NumberOfAttempt`) without reassigning it as the live activity data object, preserve that scoped restoration. The live activity data should keep loading fully from its normal JSON/runtime source for the current session; only the specific SCORM-continuity fields carry over from the restored payload.

## CMI Restoration

Runtime `post.cmi` must be restored from the persisted full-post payload when an activity is reopened. This prevents a previously completed or passed activity from starting the new runtime session with default values such as `completion_status: "unknown"` and `success_status: "unknown"` until the learner finishes again.

CMI restoration occurs after the current-session post object has been loaded and its default CMI structure has been created, but before `NumberOfAttempt` initialization, feedback metadata preparation, QA output, or any current-session score update can run.

The initialization sequence is:

1. Load the normal activity JSON/runtime data.
2. Load or parse the persisted activity JSON, such as `learningObjectAsJson`, when available.
3. Create the current runtime post object and default `cmi` structure when missing.
4. Restore persisted `cmi` into the current runtime post.
5. Initialize and increment `NumberOfAttempt`.
6. Continue normal metadata, feedback, and runtime initialization.

The dedicated CMI restoration helper should restore only these CMI continuity fields from `restoredPost.cmi` into `post.cmi`:

- `completion_status`
- `success_status`
- `total_time`
- `score.raw`
- `score.min`
- `score.max`
- `score.scaled`

Do not overwrite valid persisted values with defaults. If a persisted property is missing, keep the runtime default that was already prepared by the current script. Normalize `score.raw` through the existing score-normalization helper when available, preserve numeric score field types, and update the script's previous-score tracking after restoration so the existing highest-score logic continues to compare against the restored runtime CMI.

Do not change highest-score helpers, answer-update logic, `UpdateStudentActivity()`, `scormPost()`, or SCORM reporting behavior only to perform initialization-time CMI restoration.

## Final CMI Persistence

Final CMI state has two persistence destinations:

- SCORM LMS state through `ScormService`.
- Platform activity JSON through `UpdateStudentActivity(...)`, which stores `learningObjectAsJson`.

Both destinations must receive the finalized CMI state. Saving only to SCORM is insufficient because the activity runtime restores local `post.cmi` from the platform's persisted `learningObjectAsJson` on the next platform launch.

Per-question or intermediate platform updates may persist partial score information before the final statuses are known. At final completion, once the runtime reaches the final feedback state and `scormPost()` calculates final time and score, the script must apply the highest score and final CMI statuses locally, then persist the finalized post again through the existing platform update flow before final QA/SCORM Cloud logging. Activity scripts must not finish the SCORM session.

The final lifecycle is:

1. The platform returns the previously persisted `learningObjectAsJson`.
2. The runtime parses it into `restoredPost`.
3. `data.json` or runtime data provides the fresh activity structure.
4. `restorePersistedCmi(post, restoredPost)` restores persisted CMI fields.
5. `initializeNumberOfAttempt(post, restoredPost)` increments the visit count.
6. Per-question updates may persist intermediate score information.
7. Final feedback is displayed and `scormPost()` is invoked immediately (the canonical reference no longer applies an artificial delay here; a target script that still implements its own `FINAL_FEEDBACK_DELAY` has not yet been migrated to the current policy).
8. `scormPost()` calculates final time and final score.
9. `window.ScormService.reportResult(currentAttemptScore)` reports the current attempt score to the SCORM LMS when connected.
10. `applyHighestScormScore()` applies the preserved highest score and final CMI statuses.
11. The finalized post is persisted again through the existing platform `UpdateStudentActivity(...)` flow.
12. Final QA metadata or SCORM Cloud summary logging occurs.
13. `window.ScormService.completeSession()` is called, guarded by `typeof window.ScormService.completeSession === "function"`, only after steps 10-12 have completed.
14. The activity leaves further SCORM session finalization (`LMSFinish`) to the external runtime or host.

### `completeSession()` Canonical Rule

`completeSession()` (defined in `2026_2027/js/scorm-lo.js`) is a distinct, later-stage operation from score reporting and platform persistence:

- It performs its own defensive `scorm.save()` commit, then posts a `{ type: "SCORM_MVP_SESSION_END", reason: "final-feedback" }` message to `window.top` via `postMessage`, notifying the external host/SCORM Cloud MVP wrapper that the attempt has ended. It does not call `LMSFinish` or `scorm.quit()`, and it does not change the SCORM connection state.
- It is safe to call in any environment: it no-ops with a `console.warn` when `ScormService` is not connected, and activity scripts must additionally guard with `typeof window.ScormService.completeSession === "function"` since standalone/packaged SCORM builds may not define it.
- `completeSession()` is separate from and must not be conflated with `reportResult()` (SCORM score reporting) or the platform `UpdateStudentActivity(...)` call (activity JSON persistence). All three are distinct operations with a required order.
- Call it from the connected branch of `scormPost()` (or the target script's equivalent), guarded the same way as the file's other optional `ScormService` methods:
  ```js
  if (typeof window.ScormService.completeSession === "function") {
    window.ScormService.completeSession();
  }
  ```
  wrapped in `try/catch`, without duplicating the outer SCORM-connection guard already provided by `isScormServiceConnected()`/the enclosing connected branch.
- The call must occur after `applyHighestScormScore()` (final CMI values applied), after `persistFinalActivityState()` (final platform persistence has been triggered), and after `logPostAfterFinalFeedback()` (final logging has completed) — never before.
- The call must execute exactly once per session, protected by the same `scormReported` guard that prevents duplicate `scormPost()` execution. Do not introduce a second, separate guard for it.
- `window.ScormService.finish()` must not be reintroduced into migrated runtime scripts as a call site. `completeSession()` does not replace `finish()` at the SCORM-API level — it is a notification mechanism for external session-end orchestration, not a session-termination call — but the current canonical policy is that activity scripts call neither `finish()` directly.
- Every migrated runtime script must include the same guarded `completeSession()` call, in this same relative position, once its `scormPost()`/equivalent implements the full final-persistence sequence above.

### Canonical default: `total_time` initialization

When a script creates a fresh local `cmi` object (i.e. `if (!post.cmi) { post.cmi = { ... } }` inside `getData()` or an equivalent first-launch initializer), the default `total_time` value must be:

```js
total_time: "00:00:00"
```

not the legacy `"PT0H0M0S"` ISO-8601-style default used in earlier passes. This is a **default-value-only** correction:

- It applies only to the literal placed in a brand-new/first-launch `cmi` object (or an equivalent `createDefaultCmi()`/`getDefaultCmi()`/`initializeCmi()` helper, where one exists). A brand-new learner's first launch now starts with `total_time: "00:00:00"`.
- It does not change how a previously-persisted `total_time` is restored — `restorePersistedCmi()` still copies `persistedCmi.total_time` through unchanged when present, regardless of which format (`"HH:MM:SS"` or legacy `"PT#H#M#S"`) it was stored in.
- It does not change `parseScormTimeToSeconds()`, which must keep accepting **both** the `HH:MM:SS` format and the legacy ISO-8601 `PT#H#M#S` format when reading a persisted value, so records written before this correction continue to parse and accumulate correctly.
- It does not change `formatSecondsToScormTime()`, cumulative-time addition, `reportResult()`, `completeSession()`, or any score/completion logic.
- Files whose fresh-`cmi` initializer uses a different pre-existing convention entirely (for example a numeric `total_time: 0` sentinel, as in the `digital-screen_26/choose/js/zoki.js` reference) are out of scope for this correction — they do not exhibit the `"PT0H0M0S"` pattern and changing their type/convention would be a separate, unrelated migration.

The finalized platform payload must include:

- `completion_status`
- `success_status`
- `total_time`
- `score.raw`
- `score.min`
- `score.max`
- `score.scaled`

Use a small guarded helper for final platform persistence when the same call is needed in multiple `scormPost()` branches. The helper must avoid throwing in standalone, local, packaged SCORM, or non-platform modes by checking that platform globals and update functions are available before calling them. Do not introduce duplicate final saves; rely on the same final reporting guard, such as `scormReported`, that prevents duplicate `scormPost()` execution.

Do not persist the final post before final CMI statuses are applied. Do not delay or block SCORM termination unless the existing platform update function actually returns a promise and the behavior has been verified as safe. If the existing update function performs a fire-and-forget fetch, keep the final persistence call compatible with that behavior.

Existing records saved before this final-persistence rule may still contain stale `"unknown"` values in `learningObjectAsJson`. Those records are corrected only after the learner completes one new final activity submission after deployment.

`subjectId` is supplied by JSON when available. Do not derive it from the URL, folder name, filesystem path, or `window.location.pathname`. Do not assign `post.subjectId = folderName`.

Language and feedback-key normalization must use `post.Educational_stage` as the source of truth when that metadata exists.

Use the shared `preparePostFeedbackMetadata(post)` function for feedback metadata preparation instead of duplicating `Educational_stage` parsing inside template-specific scripts. Call it immediately after JSON data is loaded and before progress or feedback calculation can run.

## FINAL_QUESTION_FEEDBACK_AND_TERMINAL_LOGGING_POLICY

Two lifecycle rules govern when the *final* activity update and per-question canonical logging may run. Both are lifecycle-based, not function-name-based: every target script must be analyzed to find its own equivalent of the boundaries below rather than assuming the reference script's method names exist.

Three lifecycle boundaries must be located in every target before applying this policy:

- **`ATTEMPT_EVALUATED`** — the point where an answer/attempt has just been checked (e.g. `checkanswer()`, `afterCheckAnswer()`, `validateAnswer()`). This is not necessarily the same moment the question is finished — a wrong, retryable attempt is evaluated but not terminal.
- **`QUESTION_TERMINAL_STATE`** — the point where the current logical question can no longer be re-answered (retries exhausted, Show Answer completed, correct answer given, drag/drop or match completed, next-question navigation enabled). Canonical per-question logging belongs here, not at `ATTEMPT_EVALUATED`.
- **`OVERALL_FINAL_FEEDBACK`** — the single point where activity-level final feedback becomes active (final modal/screen/overlay, a `finished()`/`finishLO` transition, an activity-complete callback). The final activity update belongs here, not at the last question's own `QUESTION_TERMINAL_STATE`.

### Canonical rule A — Last question waits for final feedback

The last logical question must not directly invoke the final activity-update operation (the operation that persists finalized CMI/score/status to the platform — e.g. `persistFinalActivityState()`/`UpdateStudentActivity(...)`/target-specific equivalent) from its answer-attempt or per-question feedback handler. The final activity update must run only after `OVERALL_FINAL_FEEDBACK` becomes active, so that final score, status, and cumulative time are computed once, from finalized data, in one place.

### Canonical rule B — Terminal-state logging

Canonical logging and final per-question sending must occur at `QUESTION_TERMINAL_STATE`, not automatically after every `ATTEMPT_EVALUATED`. A retryable wrong attempt must not log; only the attempt that actually finishes the question does.

### Canonical rule C — Wrong answer followed by Show Answer

When the false/wrong-answer handler only exposes a Show Answer action and the show-answer handler is what actually completes the question, the false/wrong-answer handler must not emit the canonical question log — it may still update score/attempt state (e.g. `updateScormScoreAfterAnswer(...)`, `numberOfTrial`). The show-answer handler owns the single canonical terminal log. If a target has no Show Answer step and the false/wrong-answer handler is itself the real terminal state, it keeps its logging call — this rule only applies when a later handler is the true terminal boundary.

### Canonical rule D — Last-question suppression

The last question must skip the ordinary per-question log and the final activity-update path at its own terminal state. The overall final-feedback flow owns the final persistence, the one final canonical log, and the `completeSession()` call. Use a per-question-id/per-index guard (not a single global boolean) so suppressing the last question never blocks logging for earlier questions.

### Canonical rule F — SCORM Cloud summary logging is Final-Feedback-only

`logScormCloudSummary()` (the compact `Score: X | Completion: Y | Success: Z` console line, gated internally by `isScormCloudEnvironment()`) must be printed exactly once per completed attempt, from `logPostAfterFinalFeedback()` only. It must never be reachable from `logPostAfterAnswerAttempt()` (the per-question, non-final dispatcher) — a SCORM Cloud environment must see no console summary output at all while question-answering is in progress, only after `OVERALL_FINAL_FEEDBACK` is reached. `logQaMetadata()` (the local/non-cloud QA object dump) is unaffected by this rule and continues to run from both dispatchers exactly as before — it already self-guards on `isScormCloudEnvironment()` internally, so it never overlaps with `logScormCloudSummary()`'s output in the same environment. The canonical shape of `logPostAfterAnswerAttempt()` is therefore:

```js
logPostAfterAnswerAttempt() {
  if (!this.isFinalQuestionAttempt()) {
    this.logQaMetadata(this.posts[0]); // or this.posts, if the file has no posts[0] wrapper
  }
},
```

`logPostAfterFinalFeedback()` is unaffected by this rule and keeps its existing shape (cloud → `logScormCloudSummary()`; local → `logQaMetadata()`), since it already only runs once, from inside `scormPost()`'s `scormReported`-guarded final block.

### Canonical rule E — Lifecycle-based adaptation

Function names are not canonical. Each migrated runtime must be analyzed on its own terms to locate its equivalent `ATTEMPT_EVALUATED`, `QUESTION_TERMINAL_STATE`, and `OVERALL_FINAL_FEEDBACK` boundaries before any call is moved, added, or removed.

### Reference implementation: `digital-screen_26/digital-screen-input/js/zoki_.js`

This file's lifecycle: `checkanswer()` (`ATTEMPT_EVALUATED`) dispatches to `trueAnswer()` or `falseAnswer()`. A correct answer is terminal immediately (`trueAnswer()` is `QUESTION_TERMINAL_STATE`). A wrong answer is *not* terminal — `falseAnswer()` only arms the Show Answer button; `showAnswer()` is the actual `QUESTION_TERMINAL_STATE` for the wrong-answer path. `OVERALL_FINAL_FEEDBACK` is `isFinalFeedbackVisible()` (`counter >= loQuestions`, true only after `nextQuestion()` has advanced past the last item), which gates `scheduleFinalScormPost()` → `scormPost()`.

Confirmed current state, matching canonical rules B/C/D:

- `this.logPostAfterAnswerAttempt();` remains in `trueAnswer()` — a correct answer is always terminal in this runtime, so logging from it is correct per rule C's exception (no Show Answer step follows a correct answer).
- `this.logPostAfterAnswerAttempt();` was removed from `falseAnswer()` — `falseAnswer()` is non-terminal (Show Answer always follows), so it must not log; it still calls `updateScormScoreAfterAnswer(...)` to keep score state current.
- `this.logPostAfterAnswerAttempt();` remains in `showAnswer()` — this is the true terminal state for the wrong-answer path, so it owns the single canonical log.
- This prevents the duplicate send/log that previously occurred as `falseAnswer()` → first log, `showAnswer()` → second log for the same question.
- `logPostAfterAnswerAttempt()` itself already implements last-question suppression (rule D) via its internal `if (!this.isFinalQuestionAttempt())` guard, so no normal per-question log is produced for the last question regardless of which terminal path completes it.
- The true rule-A final activity update, `persistFinalActivityState()`, is called only from inside `scormPost()`, itself only reachable once `OVERALL_FINAL_FEEDBACK` (`isFinalFeedbackVisible()`) is true — never from `trueAnswer()`/`falseAnswer()`/`showAnswer()` directly. This part was correct from the start.

**Corrected 2026-07-20 (do not repeat this mistake in future migrations):** this file also has a Vue method literally named `UpdateStudentActivity()`, called unconditionally from both `trueAnswer()` and `showAnswer()`. Earlier passes over this section (and over several other files in this codebase) reasoned that because this method is **per-question intermediate platform persistence** — described in "Final CMI Persistence" above — it was therefore exempt from rule A and safe to leave unguarded, including on the last question. **That reasoning was wrong and has been retracted.** `UpdateStudentActivity()` calls the exact same platform endpoint (`globalFunctions.UpdateStudentActivity(this.activityId, this.posts[0])`) that `persistFinalActivityState()` calls for final persistence. "Per-question intermediate persistence is allowed to run every question" describes syncing progress on questions *other than* the one final feedback is about to finalize — it was never license to also fire, unguarded, on the exact same question `persistFinalActivityState()` is about to fire on again moments later. Browser testing on the sibling `choose/js/zoki.js` file exposed this as a real, observable duplicate network send on the final question; tracing then confirmed the identical bug existed here too. Both call sites (`trueAnswer()`, `showAnswer()`) are now guarded: `if (!this.isFinalQuestionAttempt()) { this.UpdateStudentActivity(); }`. **The corrected rule:** any method that reaches the platform's `UpdateStudentActivity`/activity-persistence endpoint — regardless of its own name or which "intermediate vs. final" bucket it was assumed to belong to — must be traced to its actual endpoint before deciding whether rule A applies. If two differently-named call paths converge on the same platform write, both must respect rule A's final-question exclusivity, or the last question will double-send. Do not assume a distinctly-named per-question method is automatically exempt; confirm which underlying platform call it makes.

### ⚠ 2026-07-20: outstanding re-audit required across this codebase

The "Naming collision" correction above documents a real bug found via browser testing on `digital-screen_26/choose/js/zoki.js` and confirmed by code tracing on `digital-screen_26/digital-screen-input/js/zoki_.js`: a per-question method named differently from `persistFinalActivityState()` (typically also named `UpdateStudentActivity()`) can still call the same platform endpoint, and earlier passes repeatedly assumed such methods were exempt from rule A without checking what endpoint they actually hit.

**Every Migration Records entry below dated before this correction that says something equivalent to "Rule A ... already satisfied" / "final activity update deferred ... never called from the answer handlers" / "no source change was required this pass" for a file's `UpdateStudentActivity()`-named per-question method is now suspect until re-verified.** This includes, at minimum, the `2026-07-20 FINAL_QUESTION_FEEDBACK_AND_TERMINAL_LOGGING_POLICY confirmation/audit` entries for: `zoki_with_animation.js`, `digital-screen-tworound-input-choose/js/zoki_choose_input.js`, `digital-screen-tworound-input-choose/js/zoki.js`, `digital-screen-tworound-inputs/js/zoki_.js`, `digital-screen-tworound-inputs/js/zoki.js`, both `space_26/space-input` files, both `penguin-choose`/`penguin-tworound-input-choose` files, all four `penguin-input`/`penguin-tworound-inputs` files, both `buzzTime` files, and `glossary/assets/js/main.js` — every one of these was audited (by direct inspection or by a subagent) using the same now-retracted assumption. None of these have been re-traced against the corrected rule. Do not treat any of them as confirmed rule-A-compliant until they are.

**Two-round files specifically:** do not assume a two-round file needs the same guard shape as a single-round file. In `digital-screen-tworound-input-choose/js/zoki_.js` (see below), round-1 handlers (`showAnswer()`, `trueAnswerInput()`) call `UpdateStudentActivity()` unconditionally and correctly need **no** guard — `isFinalQuestionAttempt()` there requires `roundTwo === true`, and `roundTwo` is provably `false` at both round-1 call sites for every item (it is only set `true` later, inside those same functions' own trailing delayed callback) — so the guard would be a permanent no-op. Only the round-2 handlers (`trueAnswerChoose()`, `falseAnswerChoose()`) can actually coincide with the true final question and need the guard. Verify this per file — do not assume round 1 is safe elsewhere without the same trace.

**A guard on one `UpdateStudentActivity()`-style call site does not guarantee every reachable platform-send call site in the same function chain is guarded.** `digital-screen-tworound-input-choose/js/zoki_.js` was initially marked "confirmed re-traced, no change needed" after verifying `trueAnswerChoose()`'s own guard — but that function also calls `isAllQuestionsRight()`, which contains a *separate*, unguarded inline `globalFunctions.UpdateStudentActivity(...)` send that was missed on the first pass and only caught while auditing the sibling `zoki_choose_input.js`. When a terminal handler calls another method (`isAllQuestionsRight()`, `isAllQuestionsFalse()`, or equivalent), that called method must be independently traced for its own platform-send call sites — do not assume it's clean because the caller's own call site was already fixed.

Confirmed re-traced as of this correction: `digital-screen_26/choose/js/zoki.js` (fixed), `digital-screen_26/digital-screen-input/js/zoki_.js` (fixed), `digital-screen_26/digital-screen-input/js/zoki.js` (already had the fix applied when its `TARGET_SCRIPT` audit began — independently verified, not authored, by that audit), `digital-screen-tworound-input-choose/js/zoki_.js` (fixed — one gap in `isAllQuestionsRight()`'s inline send found on a second pass, see above), `digital-screen-tworound-input-choose/js/zoki_choose_input.js` (fixed — three gaps: `showAnswer()`, `falseAnswerInput()`, and the same `isAllQuestionsRight()`-inline-send pattern). `zoki_video.js` shares byte-identical `trueAnswer()`/`showAnswer()`/`isFinalQuestionAttempt()` structure with the fixed single-round files and is a likely candidate to already be fixed or trivially fixable the same way, but has not actually been re-opened and confirmed — treat it as unverified until it is. **For any remaining two-round file, also check for an `isAllQuestionsRight()`/`isAllQuestionsFalse()`-style inline `globalFunctions.UpdateStudentActivity` send in addition to the more obvious `UpdateStudentActivity()`-method call sites.**

### Shared/repeatable interaction handlers

A single handler is often wired to run on every raw interaction rather than once per logical question — click handlers, multi-select/choose handlers, drag/drop callbacks, per-input change handlers, item-selection callbacks. Canonical per-question logging (`endTime` finalization, `logPostAfterAnswerAttempt()`/`logQaMetadata()`/`logScormCloudSummary()`, and the per-question `UpdateStudentActivity()` call where it is wired to the same funnel) must not run merely because the shared handler executed — that is `INTERACTION_OCCURRED`, not necessarily `QUESTION_COMPLETED`.

Before retaining or adding any such call, identify the target-specific `QUESTION_TERMINAL_STATE` inside that handler and distinguish it from `INTERACTION_OCCURRED`:

- If the handler always completes the question in one call (e.g. a single required click), `INTERACTION_OCCURRED` and `QUESTION_TERMINAL_STATE` coincide and no change is needed.
- If the handler can fire multiple times before the question is actually finished (e.g. a multi-select question requiring several clicks, or a drag/drop handler firing per dropped item before all items are placed), gate the logging/`endTime` calls behind the handler's own actual completion condition — not the handler's invocation.

Worked example: `2026_2027/lib-native/digital-screen_26/choose/js/zoki.js`'s `chechedClicked(answer, e)` is bound to every click on any answer option. For `e.correctAnswer.length == 1` questions, one click is always terminal. For `e.correctAnswer.length > 1` (multi-select) questions, the handler fires once per click but the question is only complete when `e.counter === e.correctAnswer.length` — a target-specific condition that must not be copied literally into unrelated scripts. The fix was a local flag (`questionTerminal`, declared fresh per handler invocation — not shared/global state) set only inside the branches that represent true completion, gating the trailing `endTime`/`logPostAfterAnswerAttempt()` pair. See the Migration Records entry for the exact diff.

### Prior application of this policy: Storyline Q

The `2026_2027/allTemplete/ara/storyline-q/mymovie.html` migration record's `LOGGING_TIMING_CORRECTION (2026-07-19)` entry (see Migration Records below) is an earlier, independently-arrived-at application of rules B/C/D to a differently-shaped runtime (`afterCheckAnswer()` as the shared `ATTEMPT_EVALUATED` funnel across six question-type engines, `checkStateFeedBack()`'s `nextButtonShow` branches as `QUESTION_TERMINAL_STATE`, a per-index `questionLogged{}` guard). Use it as a worked example of adapting these rules to a runtime with none of the reference's method names.

## URL Parameter Override Pattern

URL/query parameter overrides are development-only behavior. Do not call `getURLParameters()` in production, SCORM Cloud, LMS platforms, production hosting, or unknown server environments.

Only execute URL override logic when the URL helper exists and one of these conditions is true:

- `window.location.protocol === "file:"`
- `window.location.hostname === "localhost"`
- `window.location.hostname === "127.0.0.1"`
- `window.location.href` starts with `https://stblobstrgeaccount.blob.core.windows.net/dev-media/`

The environment check is not enough by itself. The override block must also require `typeof getURLParameters === "function"` before calling the helper. Local development pages may omit the script that defines `getURLParameters()`, and those pages must continue using JSON values without throwing or logging an error.

When the environment is allowed, preserve the existing override behavior exactly. If the target file previously allowed query parameters to override `upper`, `isEng`, `numberOfquestion`, `loQuestions`/`loQuestion`, `hint`, or `questionAudio`, keep those assignments unchanged inside the environment guard.

When the environment is not allowed, or when `getURLParameters` is not callable, skip the entire override block. Do not call `getURLParameters()`, do not partially apply parameters, and do not replace JSON/runtime values.

Place the environment guard after JSON data loading and any optional question-count helper guards, before normal data enrichment that depends on final activity values.

`Educational_stage` format:

- `<grade><stage>_<term><language>`
- example: `1r_1a`
- `grade`: numeric grade
- `stage`: `k`, `r`, or `p`
- `term`: numeric term, currently not used for feedback selection
- `language`: `a` for Arabic or `e` for English

Language normalization should preserve existing data while using `Educational_stage`:

- Parse the final language character from `Educational_stage`.
- Map `e` to `eng`.
- Map `a` to `ara`.
- Do not infer language from `window.location.pathname`, folder names, or directory naming conventions.
- When `Educational_stage` is present and valid, set `lang` and `feedbackIndex` from it because it is the authoritative metadata source.
- Do not store lookup key names such as `txtAr`, `txtEn`, `descriptionAr`, or `descriptionEn` in `post.feedBackTxt` or `post.feedBackDes`.
- If `Educational_stage` is missing or malformed, do not invent a folder-based fallback.
- If the post object is missing, `preparePostFeedbackMetadata(post)` must return `null`.
- If `Educational_stage` is malformed, `preparePostFeedbackMetadata(post)` must return the original post without crashing.

Feedback description selection should use the educational stage and grade from `Educational_stage`:

- `Feedback[0]`: every Kindergarten stage, where `stage` is `k`.
- `Feedback[1]`: Primary grades 1-3, where the grade/stage is `1r`, `2r`, or `3r`.
- `Feedback[2]`: Primary grades 4-6, where the grade/stage is `4r`, `5r`, or `6r`.
- `Feedback[3]`: every Preparatory stage, where `stage` is `p`.
- The academic term must not affect feedback selection.
- Store the selected index on the post as `feedbackIndex`.
- When score/final progress is known for the final completion stage, resolve the matching level and write display values to the post.
- For Arabic posts, set `post.feedBackTxt = level.txtAr` and `post.feedBackDes = level.Feedback[post.feedbackIndex].descriptionAr`.
- For English posts, set `post.feedBackTxt = level.txtEn` and `post.feedBackDes = level.Feedback[post.feedbackIndex].descriptionEn`.
- Templates should display `post.feedBackTxt` and `post.feedBackDes` directly.
- Progress calculation should use the enriched post fields prepared by `preparePostFeedbackMetadata(post)`.
- Shared feedback helpers must be wired into the real progress calculation/output path, such as `calculate(...)`, instead of being left as unused utilities.
- Existing `calculate(...)` callers must remain backward compatible. If a post object is added as an optional argument, the original return structure must still preserve existing indexes for level text and final progress.
- When `calculate(...)` returns a feedback description, assign that value to the existing Vue/template-bound feedback description property. If no bound property exists, reuse an existing suitable data property before adding a new one.
- The final feedback description must be rendered in the final feedback UI, not only returned from helper logic.
- Do not write final display strings into `post.feedBackTxt` or `post.feedBackDes` during normal non-final question attempts. Non-final progress updates may calculate percentages and animation states, but they should omit the post argument or otherwise avoid mutating final feedback display fields.
- Final feedback display fields should be resolved only after the last-question result is known and the final feedback screen state is reached or about to be shown.

### Storyline Q overall final feedback sourced from the shared feedback system

`2026_2027/lib-native/storyline-q/assets/js/main.js`'s **entire** overall final-feedback screen (every text shown once the activity completes, distinct from per-question popup/retry text) is resolved through the shared feedback system in `2026_2027/js/progress.js` (`getProgressFeedback(score, post)`, backed by `levels`/`Educational_stage` mapping), not from Storyline Q's own built-in defaults or `data.json`'s `feedback.feedbackcorrect`/`feedback.feedbackwrong`/`feedback.tryAgain` override values. `2026_2027/js/finalProgress_26.js`'s `calculate(...)` is also attempted (see below) but is not the authority for any of the assigned text — `getProgressFeedback()` is. `progress.js` exposes no dedicated retry/secondary-text field for this — both final-screen strings are read from `getProgressFeedback()`'s existing `description`/`txt` return values; no `retry`/`retryAr`/`retryEn` field exists in `progress.js`.

- **Hook point:** `resolveFinalProgressFeedback(finalProgressScore)`, called once from `finished()` — the `OVERALL_FINAL_FEEDBACK` completion path — immediately after `this.passLo` has been determined (the pass/fail branch that also triggers the pass/fail audio). It is not called during data loading, per-question answering, retries, or navigation.
- **Score input:** reuses `finished()`'s already-computed `result` (the file's own `(LOcorrectcounter / numberOfquestion) * 100` percentage) for `getProgressFeedback`, and the raw `post.LOcorrectcounter`/`post.numberOfquestion` pair (the same values `result` was derived from, and the same argument shape `calculate(...)` expects, matching other already-migrated runtimes such as `digital-screen_26/choose/js/zoki.js`) for the best-effort `calculate()` attempt. No second scoring formula was introduced.
- **`calculate()` is attempted but never authoritative:** guarded by `typeof calculate === "function"` and wrapped in `try/catch`, since Storyline Q has no `stars`/`progressbar` Lottie object for `calculate()`'s animation side effect to call — it throws safely and is caught whenever `finalProgress_26.js` is loaded (it is not loaded by any current Storyline Q template). Its only effect, when it doesn't throw, is a redundant (harmless) write of `post.feedBackTxt`/`post.feedBackDes` via its own internal `getProgressFeedback` call. The values actually assigned to the UI always come from this file's own direct `getProgressFeedback(finalProgressScore, post)` call afterward, which is the single source of truth for both final-screen strings.
- **Main vs. level-label text — both from the existing shared return shape, no new field:** `progressFeedback.description` (`Feedback[feedbackIndex].descriptionAr`/`descriptionEn`, selected by score level + `Educational_stage`) is the main final message. `progressFeedback.txt` (`level.txtAr`/`txtEn` — e.g. `"Fair"`/`"مقبول"`) is the level label `progress.js` already exposed before this task, reused as-is (no new field) for two Storyline Q properties. `getProgressFeedbackConfig()`/`getProgressFeedback()` were **not** extended with a `retryKey`/`retry` field — that approach was tried and reverted; `progress.js` contains no second set of final-feedback strings.
- **`Keyfeedback` (new Vue data property):** did not previously exist anywhere in `main.js` or any Storyline Q `mymovie.html` (confirmed by repo-wide search — no template renders `{{Keyfeedback}}`). Declared in `data()` (default `""`) alongside the other feedback strings and assigned `progressFeedback.txt` unconditionally at final feedback, for both pass and fail, whenever `getProgressFeedback` resolves a non-empty `txt`. It carries the level label (`Fair`/`Good`/`Very Good`/`Excellent` or the Arabic equivalent) for future/other consumers; since no current template renders it, this assignment has no visible effect today but is otherwise inert and safe.
- **Existing Vue properties reused, no HTML change:** `progressFeedback.description` is assigned to `this.feedbackcorrect` when `this.passLo` is `true`, or `this.feedbackwrong` when `false`; in the failure branch only, `progressFeedback.txt` is additionally assigned to `this.tryAgain` (both text assignments are individually guarded as non-empty strings). `feedbackcorrect`/`feedbackwrong`/`tryAgain` are the exact three existing data properties `mymovie.html` already renders on the final screen (`{{feedbackcorrect}}` / `{{feedbackwrong}}` + `{{tryAgain}}`, all inside the `homeButtonShow` branch of the final feedback block). No new HTML binding was added and `mymovie.html` was not modified — `Keyfeedback` is populated for parity/future use only.
- **Why `tryAgain` needed a separate fix:** `tryAgain` is a single shared Vue property rendered in two different template contexts — the per-question retry popup (`v-if="numOfAttemp === 1 && numberOfAnswer > 2"`, shown only while `homeButtonShow` is `false`, i.e. during question answering) and the final failure screen (shown only when `homeButtonShow && !passLo`). Assigning `this.tryAgain` from `resolveFinalProgressFeedback()` is safe despite this reuse because `homeButtonShow` only ever becomes `true` once, immediately before `finished()` runs, and there is no question left to retry afterward — the per-question popup can never render again after this point in the same attempt.
- **`overrideFeedback` preserved:** `getFeedBackJson()` (gated by `post.overrideFeedback`) still supplies `tryAgain`, `popupWrong`, `popupCorrect`, `correctanswer`, and the initial `feedbackcorrect`/`feedbackwrong` defaults for the per-question popup system, unchanged. It only runs once during `getData()` (page load), strictly before `finished()` can ever run, so it can never overwrite the shared final message written later — no ordering fix was required. After `resolveFinalProgressFeedback()` runs, `data.json`'s `feedback.feedbackcorrect`/`feedback.feedbackwrong`/`feedback.tryAgain` no longer own any text visible on the final screen; they remain the source only for per-question interaction messages (and for the final-screen defaults in the rare case `getProgressFeedback` cannot resolve a level/language for the current post).
- **Availability is template-dependent and requires no HTML edit:** `getProgressFeedback`/`preparePostFeedbackMetadata` come from `2026_2027/js/progress.js`. Whichever `<script>` tags a given `mymovie.html` does or does not already include entirely determines whether the shared message activates for that template — `resolveFinalProgressFeedback()`'s `typeof` guards make this transparent and safe either way: templates that load `progress.js` get the full shared final screen (main message + secondary `txt` level label); templates that load neither keep their existing Storyline Q/`data.json` message exactly as before.

### Final feedback visual: stars-only (`2026_2027/js/finalProgress_26.js`)

`calculate(result, loQuestion, isEng, upper, post)` (the shared final-progress helper) plays the `stars` animation for the final feedback visual, regardless of `upper`. `upper` no longer selects between a `stars` animation and a `progressbar` animation — that branching has been removed. `progressbar.playSegments(...)` is not called anywhere in `finalProgress_26.js`.

`upper` remains the fourth parameter of `calculate(...)` only for backward compatibility with existing callers that still pass it; it has no effect on which animation plays. Do not reintroduce an `if (!upper) { stars... } else { progressbar... }`-style branch, and do not remove `upper` from the signature or reorder the parameters.

The `finalProgress` score-range boundaries and their `stars.playSegments(...)` segment mappings are unchanged and must not be altered by unrelated work:

- `finalProgress == 0` → `stars.playSegments([0, 1], true)`
- `0 < finalProgress < 50` → `stars.playSegments([0, 1], true)`
- `50 <= finalProgress <= 64` → `stars.playSegments([59, 60], true)`
- `65 <= finalProgress <= 84` → `stars.playSegments([74, 75], true)`
- `84 <= finalProgress <= 100` → `stars.playSegments([99, 100], true)`

The `84` boundary appearing in both the third and fourth ranges above is pre-existing overlapping-threshold behavior, intentionally left unresolved by this change. `calculate(...)`'s return value (`[Estimation, finalProgress, feedbackDescription]`), `getProgressFeedback(...)`, and `feedbackDescription`/post feedback metadata handling are all unaffected.

**`Estimation` source by range:** the `finalProgress == 0`, `0 < finalProgress < 50`, and `50 <= finalProgress <= 64` branches still set `Estimation` inline from `isEng` (`"Poor"/"ضعيف"`, `"Poor"/"ضعيف"`, `"Good"/"مقبول"`). The `65 <= finalProgress <= 84` and `84 <= finalProgress <= 100` branches no longer set `Estimation` inline — the previous `isEng ? "Very Good"/"جيد" : ...` and `isEng ? "Excellent"/"يفوق التوقعات " : ...` ternaries were removed from those two branches. For those two ranges, `Estimation` is populated solely by the `getProgressFeedback(finalProgress, post)` block below (`Estimation = progressFeedback.txt`) — callers of `calculate(...)` for scores at or above `65` must supply a `post` with `getProgressFeedback` available, or `Estimation` will remain whatever it was previously set to (or `undefined` on a first call in that range).

`studentProgress` should only be created when missing. Do not overwrite an existing progress object.

`cmi` should only be created when missing. The default object must include:

- `completion_status: "unknown"`
- `success_status: "unknown"`
- `total_time`
- `score.raw`
- `score.min`
- `score.max`
- `score.scaled`

The default `completion_status` is intentionally `"unknown"`, not `"incomplete"`.

## Start Time Pattern

Add a Vue/data property or equivalent state field:

- `scormStartTime`
- `scormReported`

Set `scormStartTime` after the activity data is loaded and normalized.

Use `scormReported` to prevent duplicate SCORM reporting when multiple final paths call `scormPost()`.

## Time Conversion Pattern

Add a helper equivalent to `msToScormTime`.

The helper should calculate elapsed time from `scormStartTime` to the current time and return a SCORM-compatible time string used by the existing project pattern.

The helper should not affect timers, animations, audio, or activity pacing.

## Cumulative Total Time Pattern

`cmi.total_time` should represent accumulated time across visits, not only the current session's elapsed time, when the target script's completion reporter finalizes it.

Add two helpers alongside the time conversion helper:

- `parseScormTimeToSeconds(timeValue)`: safely converts a persisted time value back into seconds. Accepts `HH:MM:SS` strings, `PTxHxMxS`-style ISO duration strings (some default `cmi.total_time` values use this format), plain numeric seconds, or numeric strings. Treats missing, malformed, or negative input as `0`.
- `formatSecondsToScormTime(totalSeconds)`: formats a non-negative second count back into `HH:MM:SS`.

At final completion, before writing `cmi.total_time`:

1. Read the previous persisted total from `post.cmi.total_time` (already restored by `restorePersistedCmi`) and convert it with `parseScormTimeToSeconds`.
2. Compute the current session's elapsed seconds from `scormStartTime` to now.
3. Write `formatSecondsToScormTime(previousTotalSeconds + currentSessionSeconds)` to `post.cmi.total_time`.

Do not apply this addition at intermediate/per-answer score updates — only at the final `scormPost()` completion point, alongside the other final CMI fields. `msToScormTime` remains available for scripts that only need current-session elapsed time and do not yet implement cumulative persistence.

## Question Timestamp Format Pattern

Root-level `startTime`/`endTime` (the file's existing `getDate()`-equivalent) must remain unchanged.

Question-level (item-level) `startTime` and `endTime` use a separate, time-only 12-hour format: `hh:mm:ss AM/PM`, for example `02:45:07 PM`. Add a dedicated helper (such as `getQuestionTime()`) that formats the current time this way, and use it only for question/item-level `startTime`/`endTime` assignments — never for the root-level fields, and never derived by copying the root-level value.

## QUESTION_TIMING_LIFECYCLE

Question and activity timestamps belong to the interaction lifecycle, never to platform persistence:

1. Assign the activity `startTime` once when the current attempt begins: after runtime data has loaded and before the first question is activated. Do not delay it with an arbitrary timer.
2. When activating a question, deactivate the previous items first, activate the current item second, then assign its `startTime` if the field is empty.
3. Question `startTime` must not depend on an authored JSON `active` value.
4. A multi-stage logical question receives one `startTime`, shared by all its stages.
5. Assign a multi-stage question's `endTime` only when its final stage reaches a terminal result, and only if the field is empty.
6. `UpdateStudentActivity()` and other persistence methods must not own or mutate question timing.
7. Assign the final question's `endTime` before counter mutation, final persistence, or final QA/cloud logging.
8. Assign the activity `endTime` once inside the authoritative completion gate and before final persistence or final logging.
9. Never overwrite an existing non-empty activity or question timestamp during the same attempt.

Every future `SCORM_RUNTIME_ALIGNMENT` audit must trace all activity/item timestamp assignments and verify these ownership rules, including each terminal path in multi-stage runtimes.

## Completion Reporting Pattern

Add one centralized `scormPost()` method.

`scormPost()` must:

- Read the result prepared by the target file's existing scoring model.
- Check whether the activity is truly complete.
- Exit without reporting if the activity is not complete.
- Exit without reporting if `scormReported` is already true.
- Set `scormReported = true` only when reporting is actually allowed.
- Update `cmi.score.raw` with the preserved highest SCORM score.
- Update `cmi.score.min`.
- Update `cmi.score.max`.
- Update `cmi.score.scaled` from the preserved highest SCORM score.
- Read `studentPoint` as the normalized activity result out of 10 when available.
- Do not use `studentPoint` as `cmi.score.raw`; SCORM raw score remains a 0-100 percentage value derived from the target script's existing result/current-attempt score.
- Store SCORM score display values consistently to one decimal place where the current project pattern uses percentage results.
- Set `success_status` using the 50% rule unless the target file already defines another passing rule.
- Set `completion_status` based on the preserved highest score:
  - `completed` when highest score is at least 50
  - `incomplete` when highest score is below 50
- Set `total_time`.
- Call `window.ScormService.reportResult(currentAttemptScore)` only when SCORM exists and is connected, then read/synchronize the preserved highest score from the shared SCORM service.
- Do not call `window.ScormService.finish()` from activity scripts, including after reporting or during page unload.
- Wrap SCORM API calls in `try/catch`.
- Emit only the environment-appropriate console output: filtered QA metadata outside SCORM Cloud, or the compact SCORM summary on SCORM Cloud.

The completion status rule must be applied after `success_status`.

## Highest SCORM Score Preservation Pattern

SCORM score fields must preserve the highest saved score across visits. A lower score from a later visit must never overwrite a higher score from an earlier visit.

Before writing or reporting a SCORM score:

- Calculate the current attempt score exactly as the target script already does.
- Read the previous saved score from the existing persistence flow before overwriting it. Valid sources include restored `learningObjectAsJson`, the restored post object's `cmi.score.raw`, SCORM runtime best-score helpers, suspend data, or the target script's established equivalent.
- Normalize both previous and current scores safely. Missing, empty, null, invalid, or negative values should behave as `0`.
- Include the shared SCORM runtime best score in the comparison when available: `highestScore = Math.max(previousSavedScore, window.ScormService.getBestScore(), post.cmi.score.raw, currentAttemptScore)`.
- Write `highestScore` to `cmi.score.raw`.
- If `cmi.score.scaled` is written, derive it from `highestScore / 100`, using the script's established rounding pattern and expected range.
- Send the current attempt score to SCORM score APIs such as `updateScore(...)` and `reportResult(...)`. The shared SCORM service owns the `bestScore` comparison and prevents lower scores from overwriting higher saved scores.
- After each SCORM score API call, read `window.ScormService.getBestScore()` when available and synchronize the local post `cmi.score` fields from the highest score.

Synchronize the SCORM score after every answered question, not only at final completion. Reuse a single `updateScormScoreAfterAnswer(currentAttemptScore)`-equivalent helper across the correct-answer, wrong-answer, and show-answer/forced-reveal paths. When an existing per-answer activity-update method (such as `UpdateStudentActivity()`) already runs on some of those paths, call the score-sync helper from inside that method so those paths inherit it automatically. For any answer path that does not go through that method (for example a wrong-answer branch that only allows a retry), call the score-sync helper directly from that path instead of routing through the broader activity-update method, so the score still synchronizes without adding an otherwise-unneeded call.

Established reusable helper names seen across reference implementations: `normalizeScormScore(score)` (clamp to `0-100`, treat missing/invalid/negative as `0`), `calculateCurrentAttemptScore()` (the file's own percentage formula), `isScormServiceConnected()`, `getHighestScormScore(currentAttemptScore)` (the `Math.max(...)` rule above), `applyHighestScormScore(currentAttemptScore, options)` (writes `highestScore` into `cmi.score`, optionally updates `scaled`/`success_status`/`completion_status` via `options.updateScaled`/`options.updateStatus`/`options.finalStatus`), and `updateScormScoreAfterAnswer(currentAttemptScore)` (calls `ScormService.updateScore(...)` when connected, then delegates to `applyHighestScormScore`). Reuse these names in new target scripts instead of inventing equivalents, unless the target already has established names of its own.

### `updateScore()` commits on every call, independent of whether `bestScore` changed

The shared adapter's `updateScore(score)` (in `2026_2027/js/scorm-lo.js`) must perform a SCORM `SetValue`/`Commit` of the preserved `bestScore` on **every** call where SCORM is connected — not only when the supplied `score` raises `bestScore`. `updateBestScore(score)` decides whether `bestScore` changes; that decision is independent from whether `updateScore()` commits. An equal or lower current-attempt score must still result in `cmi.core.score.raw`/`min`/`max` being written and `scorm.save()` being called with the existing (higher) `bestScore` — this is what allows a later, lower-scoring visit to re-affirm the previously preserved highest score with the LMS instead of silently no-opping.

Canonical shape:

```js
updateScore(score) {
  if (!connected) return false;

  updateBestScore(score);

  scorm.set("cmi.core.score.raw", String(bestScore));
  scorm.set("cmi.core.score.min", "0");
  scorm.set("cmi.core.score.max", "100");

  return scorm.save();
},
```

Rules:

- `updateScore()` no-ops (returns `false`) only when SCORM is not connected. It never no-ops merely because `bestScore` didn't increase.
- An invalid/unparseable `score` (per `normalizeScore`) leaves `bestScore` untouched (`updateBestScore` returns `false` without mutating it) and `updateScore()` still writes and commits the last valid `bestScore` — it must never write `NaN` and must never regress a previously preserved score.
- `updateScore()` never writes `cmi.core.lesson_status`, `completion_status`, or `success_status`, and never calls `reportResult()`, `completeSession()`, `finish()`, `scorm.quit()`, or `LMSFinish()`. Final status remains exclusively owned by `reportResult()`, invoked only from the centralized final-feedback reporter (`scormPost()`/equivalent), exactly as described elsewhere in this section.
- `reportResult(score)` already committed unconditionally (it never had the early-return bug) and is unaffected by this correction.
- This closes the gap where a learner's highest score, once reached and left uncommitted by an equal/lower later visit, could still read back as an earlier, lower `cmi.core.score.raw` value from the LMS (observed on SCORM Cloud: a 50% attempt followed by a lower-scoring visit that never reached final feedback read back as the earlier 33% instead of the preserved 50%, because the intervening `updateScore()` calls from the lower visit silently skipped their commit).

`success_status` and `completion_status` must not regress because of a lower later attempt. Use the script's existing pass threshold and completion rules, but apply them to `highestScore` when SCORM status is written. A previous pass/completion must not become failed/incomplete because the current attempt score is lower.

`studentPoint` is not part of the highest-score preservation rule. Keep its normalized out-of-10 meaning and assignment timing. Do not replace it with `highestScore`, recalculate it from `highestScore`, use it as the persisted best-score field, or use it as the SCORM raw score.

Review every score-writing path in the target script, including intermediate update methods, delayed final `scormPost()` methods, `cmi.score.raw`, `cmi.score.scaled`, `success_status`, `completion_status`, `updateScore(...)`, `reportResult(...)`, and any equivalent final SCORM submission. Intermediate score paths may update `cmi.score.raw` and `cmi.score.scaled`, but they must not mark final completion or success before the activity is actually complete. Final status remains owned by the centralized completion reporter.

Final reporting is executed immediately once the runtime reaches the final feedback state. There is no artificial delay between final feedback activation and `scormPost()`. `scheduleFinalScormPost()` calls `this.scormPost()` directly, with no `setTimeout()`:

```js
scheduleFinalScormPost() {
  if (this.scormPostScheduled || this.scormReported) return;

  this.scormPostScheduled = true;
  this.scormPost();
}
```

`FINAL_FEEDBACK_DELAY` has been removed from the canonical implementation and must not be reintroduced. Schedule the immediate SCORM call only from the real final feedback branch, not from intermediate submit helpers that may also run on non-final questions. Use the same `scormPostScheduled` scheduling flag plus the normal `scormReported` guard so only one final SCORM submission can execute, even though the call is now synchronous rather than deferred — `scormPostScheduled` still prevents a second call from a different final-completion path in the same tick, and `scormReported` still prevents `scormPost()` itself from reporting twice.

The canonical Digital Screen Choose reference previously used `const FINAL_FEEDBACK_DELAY = 1000;` (itself reduced from an earlier `6000`), delaying `scormPost()` until 1000 milliseconds after the transition into final feedback completed. That constant and its `setTimeout()` have been removed entirely; the constant declaration no longer exists in the reference file. Final CMI finalization, platform persistence, local QA or SCORM Cloud logging, and `completeSession()` ordering continue to occur through `scormPost()` exactly as before, still executing exactly once each, still governed by `scormReported`. This change affects only the gap between reaching final feedback and invoking `scormPost()`; it does not affect the unrelated internal `1000`ms `setTimeout()` inside `scormPost()`'s own SCORM-connected branch (which waits for the SCORM API calls, not for final feedback), and it does not affect any other runtime timing, scoring, CMI restoration, cumulative-time, status, highest-score, feedback, animation, transition, persistence, or logging behavior.

If the final transition mutates or resets the same state used by the SCORM completion guard, capture completion before the reset with a dedicated latch such as `scormCompletionReady`. The latch must be set only from a real final branch and only when scheduling the final SCORM submission. `scormPost()` may then treat either the current live completion condition or the latched completion state as complete.

## SCORM Score Decimal Precision Policy

The shared `window.ScormService` adapter (`2026_2027/js/scorm-lo.js`) must preserve the decimal score value calculated by the learning-object runtime all the way to `cmi.core.score.raw`. Learning-object runtimes calculate scores with up to one decimal place (for example `33.3`, `66.7`); the shared adapter must not round that value to a whole number before sending it to SCORM.

**Canonical `normalizeScore(score)` (in `scorm-lo.js`):**

```js
function normalizeScore(score) {
  const normalizedScore = Number(score);

  if (!Number.isFinite(normalizedScore)) {
    return null;
  }

  const clampedScore = Math.max(0, Math.min(100, normalizedScore));
  return Number(clampedScore.toFixed(1));
}
```

Rules:

- **No integer rounding.** `Math.round()`, `parseInt()`, `Math.floor()`, `Math.ceil()`, bitwise coercion (`| 0`, `~~`, `>>> 0`), or any other integer-truncating operation must never appear in the score pipeline (`normalizeScore`, `updateBestScore`, `updateScore`, `reportResult`, `getBestScore`, or their callers' score handling). This is a permanent regression guard, not a one-time fix.
- **Maximum supported precision: one decimal place.** `normalizeScore` calls `.toFixed(1)` (then converts back to `Number`) purely to normalize floating-point noise (e.g. `33.30000000000001`) to the precision the learning-object runtimes actually calculate at. This is not integer rounding and must not be reintroduced as such.
- **Clamp range: 0–100**, applied to the decimal value before precision normalization, unchanged from the prior implementation.
- **Invalid score handling:** non-numeric or non-finite input (`NaN`, `Infinity`, unparseable strings, `null`/`undefined` that coerce to `NaN`) returns `null` from `normalizeScore`, and `updateBestScore` treats a `null` result as "no update" (returns `false` without touching `bestScore`).
- **Highest-score comparison uses decimal values.** `updateBestScore` compares `normalizeScore(score) > bestScore` using full decimal precision — a `66.7` best score is never overwritten by a lower `33.3`, and a `66.6` never overwrites an existing `66.7`. `bestScore` itself is stored as a decimal `Number`, not truncated.
- **Saved decimal-score restoration:** `init()` reads `scorm.get("cmi.core.score.raw")` through the same `normalizeScore()`, so a previously-saved decimal score (e.g. `"66.7"`) is restored into `bestScore` as `66.7`, not rounded to `67`.
- **Pass/fail threshold uses the unrounded decimal score.** `reportResult()`'s `bestScore >= 50 ? "passed" : "failed"` check is unchanged and evaluates against the full decimal `bestScore` — `49.9` fails, `50.0` passes, `66.7` passes. The threshold value and comparison operator were not modified.
- **Required consistency:** the value in the learning-object's own console summary (`post.cmi.score.raw`, printed via `logQaMetadata`/`logScormCloudSummary`), the shared `ScormService`'s internal `bestScore`, and the SCORM `cmi.core.score.raw` value actually sent to the LMS must all agree to one decimal place. `String(bestScore)` (e.g. `String(33.3)` → `"33.3"`, `String(50)` → `"50"`, `String(100)` → `"100"`) is written directly to `cmi.core.score.raw` in both `updateScore()` and `reportResult()` — no intermediate formatting step may re-round it.

**Acceptance example:**

```
Runtime console:
Score: 33.3 | Completion: unknown | Success: unknown

Expected SCORM Cloud:
Score 33.30 %
```

**Regression warning:** `Math.round()`, `parseInt()`, `Math.floor()`/`Math.ceil()` on a score value, or any bitwise integer coercion must never be reintroduced anywhere in `scorm-lo.js`'s score pipeline (`normalizeScore`, `updateBestScore`, `updateScore`, `reportResult`, `getBestScore`). Doing so silently truncates decimal scores and reintroduces the `33.3 → 33` display mismatch this policy fixes. This does not affect the unrelated `Math.floor()` calls used for session-time formatting in `reportResult()` (`diffMs`/`totalSeconds` → `hh:mm:ss`), which are not part of the score pipeline.

## SCORM Status Restoration Policy

The SCORM 1.2 source of truth for a previously finalized result is `cmi.core.lesson_status`. The runtime's own `post.cmi.completion_status`/`post.cmi.success_status` must reflect that previously saved result on reopen, not silently reset to `"unknown"/"unknown"` — even when there is no backend `learningObjectAsJson` restoration path available (the SCORM Cloud case: a bare relaunch of the same registration/session has no backend post to restore from, only the LMS's own persisted `cmi.core.lesson_status`).

### Lifecycle rules

- **First launch, in progress:** `completion_status`/`success_status` remain `"unknown"/"unknown"` throughout question answering. Never force a status during normal answering on a first attempt.
- **First launch, final feedback:** the centralized completion reporter (`scormPost()`'s `applyHighestScormScore(result, { updateScaled: true, updateStatus: true, finalStatus: true })` call) sets the final status once, from the result reached at finalization: `highestScore >= 50` → `completed`/`passed`; otherwise → `incomplete`/`failed`.
- **Reopen, before final feedback:** the last saved final status (`passed`/`failed`/`completed`/`incomplete`) is restored into `post.cmi` at initialization and remains unchanged for the entire new attempt until the runtime reaches final feedback again. It is never reset to `"unknown"/"unknown"` mid-attempt, and it is never upgraded to `passed`/`completed` early just because the current attempt's live score has crossed 50 before finalization — score and status update on different schedules (see "Highest SCORM Score Preservation Pattern" above for score; this section governs status).
- **Reopen, final feedback:** status updates again through the same centralized `scormPost()` path, evaluated against the highest score at that moment (which by construction can only be equal to or higher than any previously saved score — see the score-preservation policy). **This codebase's established final-status policy is "status follows the highest saved score," not "status follows the newest attempt":** because `applyHighestScormScore`'s `highestScore` input already incorporates `window.ScormService.getBestScore()`, a previously saved passing score can never be finalized as failing later, even if the newest in-progress attempt alone would have scored lower — this was already the codebase's behavior before this task (see the pre-existing rule: "`success_status` and `completion_status` must not regress because of a lower later attempt," in "Highest SCORM Score Preservation Pattern" above) and is preserved unchanged, not reinterpreted, by this task.

### Status mapping (`cmi.core.lesson_status` → runtime `post.cmi`)

| `cmi.core.lesson_status` | `completion_status` | `success_status` | Meaningful previous final status? |
|---|---|---|---|
| `passed` | `completed` | `passed` | yes |
| `failed` | `incomplete` | `failed` | yes |
| `completed` | `completed` | last known valid success value, else `unknown` | yes |
| `incomplete` | `incomplete` | last known valid success value, else `unknown` | yes |
| `not attempted` | `unknown` | `unknown` | no |
| `unknown` | `unknown` | `unknown` | no |
| empty / missing | `unknown` | `unknown` | no |

`scorm-lo.js` has no independent source for "the last known valid success value" beyond `cmi.core.lesson_status` itself (SCORM 1.2 has no separate success-only field), so for `completed`/`incomplete` its `getPersistedStatus()` reports `successStatus: "unknown"` — this is a documented limitation, not an oversight; a runtime with its own separately-persisted `success_status` (via the backend `learningObjectAsJson` path) is unaffected, since `restoreScormServiceStatus()` (below) only fills in status when the runtime has not already restored one from that other source.

### Separating initialization-only `incomplete` from a real finalized result

`ScormService.init()` still writes `cmi.core.lesson_status = "incomplete"` to the LMS when the raw saved value is `"not attempted"`, `""`, or `"unknown"` (pre-existing SCORM-compliance behavior for LMSs that require a non-blank status after the first `initialize` call; unchanged by this task). This write must never be mistaken, by the runtime, for a genuinely previously-finalized `incomplete` result. `ScormService` captures the *original* raw value into its internal `persistedStatus` state and maps it *before* performing that write, so `getPersistedStatus().hasFinalStatus` is `false` for a true first launch even though the LMS's stored value becomes `"incomplete"` moments later. This is the required separation between "the SCORM initialization value written to the LMS" and "the last finalized status exposed to the runtime."

**This ordering guarantee is necessary but not sufficient.** Some LMSs (SCORM Cloud included) default a brand-new registration's `cmi.core.lesson_status` directly to `"incomplete"` rather than `"not attempted"` — meaning the *very first* `scorm.get("cmi.core.lesson_status")` call of a genuinely new attempt can already return `"incomplete"`, before `ScormService.init()` has performed any write at all. Read in isolation, that raw value is indistinguishable from a resumed attempt where a *previous* session's bootstrap write set `"incomplete"` on the LMS. `cmi.core.lesson_status` alone cannot disambiguate "brand new, LMS-defaulted" from "resumed, previously incomplete."

The disambiguating signal is `cmi.core.entry`, the standard SCORM 1.2 field an LMS is required to populate on every `LMSInitialize()` call: `"ab-initio"` means this is the first time this registration's data model has ever been initialized; `"resume"` or `""` mean it is not. `ScormService.init()` reads `cmi.core.entry` alongside `cmi.core.lesson_status` and, when `entry === "ab-initio"`, forces `persistedStatus` to `{ completionStatus: "unknown", successStatus: "unknown", hasFinalStatus: false }` unconditionally — regardless of what the raw `lesson_status` value happens to be — before the bootstrap `incomplete` write runs. On every subsequent launch of the same registration, `entry` is no longer `"ab-initio"`, so the normal `mapLessonStatusToRuntime(status)` mapping applies and a genuinely previous `incomplete`/`failed`/`passed`/`completed` result is restored correctly.

### `ScormService` API

```js
getPersistedStatus() {
  return { ...persistedStatus }; // { lessonStatus, completionStatus, successStatus, hasFinalStatus }
}
```

Read-only, returns a snapshot captured once during `init()` (before the initialization-only `incomplete` write). `hasFinalStatus` is `true` only for `passed`/`failed`/`completed`/`incomplete` **and only when `cmi.core.entry` is not `"ab-initio"`**; `false` for `not attempted`/`unknown`/empty/any unrecognized value, and forced `false` on any genuine first entry regardless of the raw `lesson_status` value (see "Separating initialization-only `incomplete` from a real finalized result" above).

### Runtime integration: `restoreScormServiceStatus(post)`

Each runtime calls a reusable `restoreScormServiceStatus(post)` method once, in `getData()`, immediately after `restorePersistedCmi(post, restoredPost)` and before `initializeNumberOfAttempt(post, restoredPost)` — i.e., after `post.cmi` has been both default-initialized and (if a backend payload existed) backend-restored, but before any question-answer logging can begin (question interaction is only possible after `mounted()`'s `await this.getData()` resolves and the learner clicks Start).

```js
restoreScormServiceStatus(post) {
  if (!post || !post.cmi) return;
  if (!this.isScormServiceConnected()) return;
  if (typeof window.ScormService.getPersistedStatus !== "function") return;

  const persisted = window.ScormService.getPersistedStatus();
  if (!persisted || !persisted.hasFinalStatus) return;

  const alreadyRestored =
    post.cmi.completion_status !== "unknown" ||
    post.cmi.success_status !== "unknown";
  if (alreadyRestored) return;

  post.cmi.completion_status = persisted.completionStatus;
  post.cmi.success_status = persisted.successStatus;
},
```

Behavior guarantees:

1. No-ops if `post`/`post.cmi` is missing (runs after the default-`cmi` initializer, so this only guards against a malformed post).
2. No-ops if SCORM is not connected (`isScormServiceConnected()`, the same helper already used by `updateScormScoreAfterAnswer`).
3. Reads the persisted status through `ScormService.getPersistedStatus()` only — no direct `cmi.core.lesson_status` reads or SCORM 1.2 mapping logic duplicated in the runtime.
4. Applies the mapped status only when `hasFinalStatus` is `true`.
5. First-launch `"unknown"/"unknown"` is preserved automatically: `hasFinalStatus` is `false` on a true first launch, so the function returns without writing anything.
6. Never resets a valid restored status to `unknown`: the `alreadyRestored` guard means this function only ever writes when `post.cmi` is still at its default `unknown`/`unknown` (i.e., nothing — not even a backend-restored value — is already present), and it only ever writes non-`"unknown"` values (since `hasFinalStatus` is only `true` for mapped statuses that are not both `unknown`).
7. Never touches `post.cmi.score` or any score-related field.
8. Never sets `scormReported`/`scormPostScheduled`/`scormCompletionReady` or calls `scormPost()` — restoring a display value is not the same as marking the current attempt final.
9. Runs after `post.cmi` initialization (called after the `if (!post.cmi) { post.cmi = {...} }` block completes, both directly and via `restorePersistedCmi` running first).
10. Runs before question-answer logging begins (`getData()` is `await`-ed in its entirety before `mounted()` proceeds to any further setup, and no question can be answered before the learner explicitly starts the activity after mount).

Precedence when both a backend-restored status (via `restorePersistedCmi`, from `learningObjectAsJson`) and a SCORM-service-restored status are available: **the backend restoration wins**, because `restorePersistedCmi` runs first in `getData()` and `restoreScormServiceStatus`'s `alreadyRestored` guard only fires when the backend path left `post.cmi` at its default `unknown`/`unknown`. This means `restoreScormServiceStatus` acts purely as a fallback for the case the backend path cannot cover — a bare SCORM Cloud relaunch of the same registration with no `learningObjectAsJson` payload — without overriding or duplicating the backend path when both are present.

### Status preservation during question updates

Per-question score synchronization (`updateScormScoreAfterAnswer(currentAttemptScore)` → `applyHighestScormScore(currentAttemptScore, { updateScaled: true })`) never passes `updateStatus: true`, so `applyHighestScormScore`'s `if (options.updateStatus) {...}` status-writing branch is unreachable from every per-question call site in this codebase — confirmed by grepping every `applyHighestScormScore(currentAttemptScore, {` call site across all migrated runtime files: each passes only `{ updateScaled: true }`. Only the two `scormPost()` branches pass `{ updateScaled: true, updateStatus: true, finalStatus: true }`, and `scormPost()` itself only executes once per session (`scormReported` guard) and only from the true final-completion path. This was already the codebase's architecture before this task; this task did not need to change it, only verify it by trace (see the Final Report's "Per-question preservation proof").

### Call-site classification (status-mutating lines only)

- `post.cmi = { completion_status: "unknown", success_status: "unknown", ... }` (only inside `if (!post.cmi) { ... }`) — **initialization**.
- `restorePersistedCmi()`'s `post.cmi.completion_status = persistedCmi.completion_status` / `.success_status = persistedCmi.success_status` — **restoration** (backend `learningObjectAsJson` path; pre-existing, unmodified by this task).
- `restoreScormServiceStatus()`'s equivalent two lines — **restoration** (new, SCORM-service-sourced fallback path; only fires when the backend path did not already restore a status).
- `applyHighestScormScore()`'s `if (options.updateStatus) { ... }` block — **final feedback** (the only call sites that pass `updateStatus: true` are `scormPost()`'s two branches; the per-question call site never reaches this branch, per the trace above).
- `scorm-lo.js`'s `reportResult()`: `scorm.set("cmi.core.lesson_status", bestScore >= 50 ? "passed" : "failed")` — **final feedback** (SCORM-side write; unchanged; only called from `scormPost()`'s SCORM-connected branch).
- `scorm-lo.js`'s `init()`: `scorm.set("cmi.core.lesson_status", "incomplete")` bootstrap write — **initialization** (SCORM-side LMS-compliance write only; unchanged; does not affect `getPersistedStatus()`, which captures the raw value beforehand).
- No **reset** or **unrelated** status-mutating call sites were found in any of the seven audited runtime files or in `scorm-lo.js`.

### Acceptance examples

```
First launch, during play:
Score: 33.3 | Completion: unknown | Success: unknown

First launch, final failed:
Score: 33.3 | Completion: incomplete | Success: failed

Reopen, during play:
Score: 33.3 | Completion: incomplete | Success: failed

Reopen, higher score before final feedback:
Score: 66.7 | Completion: incomplete | Success: failed

Reopen, final passed:
Score: 66.7 | Completion: completed | Success: passed
```

### Regression warning

Do not read `cmi.core.lesson_status` or re-implement SCORM 1.2 status mapping directly inside a runtime file — always go through `window.ScormService.getPersistedStatus()`, so the mapping rules exist in exactly one place. Do not call `restoreScormServiceStatus(post)` from anywhere other than `getData()` (in particular, never from a per-question or final-feedback path — it is a one-time initialization step). Do not remove the `alreadyRestored` guard — without it, a SCORM-sourced status could silently overwrite a legitimately different backend-restored status on every reopen.

## Completion Guard Pattern

The completion guard must be adapted to the target file.

Examples from transformed files:

- Single-round choose:
  - complete when the current question counter reaches the total question count.
- Single input:
  - complete when the activity counter reaches the last/total question boundary used by the file.
  - video-gated input variants may start the question flow through an intro video or `skipvideo()` path, but completion and SCORM reporting still use the same input question counter and delayed final-report pattern.
  - animation-enhanced input variants must preserve their existing animation calls and pacing; attach score synchronization, QA logging, and delayed final SCORM reporting to the same answer/final hooks used by the non-animation input variant.
- Two-round input/choose:
  - complete only after the second round has occurred and the final question has been completed.
- Two-round inputs:
  - complete when `counter >= totalQuestions` and the file's second-round flag confirms the second round has been reached.
- Penguin choose/input variants:
  - use `loQuestion` as the total question count.
  - use `counter` as the progression counter.
  - use `LOcorrectcounter` as the correct-answer score source.
- BuzzTime variants:
  - use `this.posts` as the data object.
  - use `this.studentScore` as the score source.
  - complete when `showResultScreen` is true and `askedQuestions.length >= allQuestions.length`.
- Slideshow variants:
  - use `this.posts` as the data object.
  - use `questionCounter` and `maxLengthQuestions` as completion state.
  - complete through `feedback()` -> `finished(score)`.
- Storyline question:
  - use `this.posts[0]`.
  - complete when `finishLO` is true and `questionIndex >= questions.length`.
- Glossary:
  - use `this.posts[0]`.
  - complete when `LOcorrectcounter >= numberOfquestion`.

Do not invent a generic guard. Use the real variables in the target file.

## Scoring Pattern

Use the existing scoring model.

Common patterns seen:

- `LOcorrectcounter / numberOfquestion * 100`
- `LOcorrectcounter / loQuestion * 100`
- `studentScore / totalQuestions * 100`
- `score` already passed into an existing `finished(score)` method

Some files award partial credit, such as `0.5` per round. Preserve that. Do not convert partial scoring into whole-question scoring.

Preserve the distinction between correct-count and normalized-score fields:

- `counterCorrect` is the actual number of correct answers.
- If `counterCorrect` mirrors `LOcorrectcounter`, update it immediately after every `LOcorrectcounter` assignment, increment, decrement, reset, or other mutation.
- `studentPoint` is the normalized activity result out of 10 and must be prepared by the activity result path before delayed SCORM reporting.
- The activity percentage variable, often named `result`, remains 0-100 and continues to feed percentage-based SCORM score calculations.
- `scoreOutOf10` is the normalized score bucket out of 10.
- Existing normalized score bucket calculations such as `0`, `2.5`, `5`, `7.5`, or `10` must write to `scoreOutOf10`, not `counterCorrect`.
- Existing final submit behavior should keep receiving the same score values as before, but those values should come from `scoreOutOf10` when the value represents a 0-10 score.
- SCORM reads from the file's existing score model and does not redefine activity scoring semantics.

## Safe Completion Insertion Points

Call `scormPost()` only from real completion paths.

Safe insertion points include:

- Existing `finished()` methods after or before existing final submit behavior, depending on the file's current flow.
- Final branch of `nextQuestion()` where feedback/final screen is shown.
- Correct final-answer path after the counter advances to completion.
- Wrong/show-answer final path after the counter advances to completion.
- Existing end-of-questions branch, such as `availableQuestions.length === 0`.
- Existing final feedback path, such as `feedback()` -> `finished(score)`.
- Any existing function that clearly represents final completion.

If duplicate `finished()` methods exist, preserve both and add SCORM calls consistently unless one is clearly unreachable and removing it is explicitly allowed.

If an existing `finished()` or submit helper runs for both intermediate and final questions, do not schedule SCORM from that helper. Schedule from the final feedback branch after final score/feedback values have been calculated and the final screen is visible or about to be visible.

When unsure whether a function is final or intermediate, do not report there unless `scormPost()` has a strict completion guard.

## Cleanup Pattern

Do not add an activity-level `beforeunload` handler that calls `window.ScormService.finish()`. Activity scripts report and persist final results, while SCORM session finalization remains the responsibility of the external runtime or host.

## Error Handling Pattern

All SCORM API interaction must be safe:

- Initialization must be inside `try/catch`.
- Reporting and finishing must be inside `try/catch`.
- Missing `window.ScormService` must not break the activity.
- Failed SCORM calls must not prevent the original activity from completing.
- Errors may be logged for development debugging.

Global helper functions that are supplied by template/runtime bundles must also be treated as optional when a SCORM package may omit them. Do not call helpers such as `checkQuestions()` directly unless `typeof helperName === "function"` has been verified. When the helper is missing, preserve the default data state and continue without throwing. When the helper exists, preserve the original behavior exactly.

## Console Logging Pattern

Reference implementations do not use string-prefixed lifecycle logs (`[INIT]`, `[DATA]`, `[STATE]`, `[SCORM]`). Lifecycle and state visibility is provided entirely by the QA Metadata Logging Pattern below: the filtered QA object locally, the compact summary on SCORM Cloud.

The only console output outside that pattern is error logging: wrap SCORM API calls in `try/catch` and log real failures with `console.error(...)`, without a message prefix, for example `console.error("ScormService init error:", e)` or `console.error(e)`.

Do not keep verbose SCORM object dumps. Avoid logging full objects containing `numberOfquestion`, `numberOfTotalQuestion`, `studentPoint`, `subjectId`, full `cmi`, or nested `cmi.score` outside the filtered QA object.

Do not log the same value repeatedly on separate lines. Logs should be production-safe, short, and useful for locating lifecycle timing without exposing full activity payloads.

## QA Metadata Logging Pattern

When QA validation metadata is requested for answer-state review, emit one compact structured console output after each answered question once the answer state has been processed.

Do not print QA metadata immediately after initialization unless a task explicitly asks for an initialization-only snapshot.

For final-question handling, avoid duplicate output:

- If the answered question is not the last question, print the QA object immediately after the answer is processed.
- If the answered question is the last question, skip the immediate answer-attempt log.
- For the last question, do not print the QA object from final feedback calculation if SCORM/CMI values are updated later by delayed completion reporting.
- When delayed SCORM reporting is used, wait for the final feedback delay, run the centralized `scormPost()` or equivalent completion reporter, let it update `completion_status`, `success_status`, `total_time`, `cmi.score.raw`, `cmi.score.scaled`, and any required final result fields, then print the final QA object once.
- The final-question QA output must happen after the final data mutation, not before it.

The QA log must never dump the full Learning Object. It must include only validation-oriented fields:

- `loDegree`
- `numberOfquestion`
- `numberOfTotalQuestion`
- `counterCorrect`
- `NumberOfAttempt`
- `studentPoint`
- `startTime`
- `endTime`
- `subjectId`
- `cmi.completion_status`
- `cmi.success_status`
- `cmi.total_time`
- `cmi.score.raw`
- `cmi.score.min`
- `cmi.score.max`
- `cmi.score.scaled`
- the detected question collection under its real property name, summarized to QA-safe fields only
- `studentProgress`
- `lang`
- `feedBackTxt`
- `feedBackDes`

The QA console should expose only fields required by QA validation. Include `studentPoint` in the local/dev QA metadata object because it is the project's normalized learner score out of 10. Do not include internal implementation fields such as `scoreOutOf10` unless a task explicitly requires them for testing. `scoreOutOf10` remains required internally for scoring, SCORM, submit/runtime calculations, and backward compatibility, but it is not part of the default QA console payload. This standard applies to all future templates regardless of their internal implementation details or data model.

Include `NumberOfAttempt` in local/dev QA metadata when visit tracking has been implemented for the script. Include `studentPoint` in local/dev QA metadata, but do not add `studentPoint` or `NumberOfAttempt` to the SCORM Cloud compact summary; the SCORM Cloud summary must remain `Score: <score> | Completion: <completion_status> | Success: <success_status>`.

`studentPoint` and `cmi.score.raw` represent different values and both must remain visible in the local/dev QA metadata. `studentPoint` is stored as a score out of 10. `cmi.score.raw` remains the SCORM raw score and uses percentage-based values. Do not treat either field as a replacement for the other.

Detect the question collection from the target file's real data shape. Common collection names include:

- `questions`
- `items`
- `slides`
- `words`
- `tabs`

Do not force `questions` when the script uses another name. Include the compact summary under the detected collection's real property name. Do not include images, audio objects, DOM elements, Vue instances, timers, animation objects, or full answer/media payloads.

The QA question collection must contain only the questions that actually participate in the current Learning Object session. It must not dump the complete JSON question collection when the activity uses only a subset. Determine the runtime-selected collection from the target script's real execution flow. Examples may include the post collection after in-place shuffle, a selected/shuffled runtime array, an available/current questions array, or another file-specific collection used by navigation and answer processing.

Preserve the exact runtime order. If the activity shuffles or randomly selects questions, the QA metadata must show those selected questions in the same order used during execution. Do not blindly use `post.items.slice(0, post.numberOfquestion)` unless `post.items` is the real runtime collection after the activity's own selection/shuffle has already been applied. When the runtime collection contains more questions than the current session uses, filter the QA-only copy to the current-session count without mutating the original collection or changing activity behavior. When the current-session count cannot be read as a valid positive number, fall back to the full runtime-selected collection instead of omitting the QA question data.

The logged QA question count should normally equal `post.numberOfquestion`. The only exception is when the activity itself intentionally contains fewer available runtime questions. This filtering applies only to QA logging; do not change JSON data, question selection, shuffle logic, navigation, scoring, or answer validation.

Use the same filtered runtime-selected collection for intermediate QA logging and delayed final QA logging. The final QA object must not switch back to the full JSON collection.

The QA console output must be the plain object itself with no label or prefix:

- Use `console.log(qaObject)`.
- Do not use `console.log("[QA]", qaObject)`.
- Do not use `console.log("Learning Object", qaObject)`.

The detected collection must not be renamed in the output. If the script uses `items`, the QA object must contain `items: [...]`. If the script uses `questions`, the QA object must contain `questions: [...]`.

Established reusable helper names seen across reference implementations: `getQuestionCollectionName(post)` (detects the real collection name), `isScormCloudEnvironment()` (the hostname check), `logQaMetadata(post)` (builds and prints the filtered, runtime-filtered QA object), and `logScormCloudSummary()` (prints the compact SCORM Cloud summary). Reuse these names in new target scripts instead of inventing equivalents, unless the target already has established names of its own.

When this QA object is the requested console output for a script, suppress other non-error `console.log` lifecycle/debug messages in that script. Do not also print `[STATE]`, `[DATA]`, `[SCORM]`, or similar string-only logs. Keep caught error logging only when it is needed for runtime diagnostics.

Console output must be environment-aware:

- Local/dev environments may print the filtered QA metadata object.
- SCORM Cloud must not print the filtered QA metadata object, full post objects, `[STATE]` logs, verbose SCORM debug data, or initialization debug logs.
- Shared SCORM service API-discovery/debug logs may remain available for local development, but they must be suppressed on SCORM Cloud unless they are real errors.
- Detect SCORM Cloud with a safe URL/hostname check such as `window.location.hostname.includes("cloud.scorm")`, or an equivalent robust check.
- On SCORM Cloud, print the compact SCORM summary after every non-final answered question once the answer result and score counters have been processed.
- The SCORM Cloud score shown in the summary must be the preserved highest score. Send the current attempt score to `window.ScormService.updateScore(currentAttemptScore)`, let the shared service update `bestScore`, then synchronize local `cmi.score.raw`, `cmi.score.min`, `cmi.score.max`, and `cmi.score.scaled` from the highest available score before printing.
- Intermediate SCORM Cloud summaries must not prematurely change final completion or success status. Final `completion_status` and `success_status` remain owned by `scormPost()` or the target script's equivalent completion reporter.
- For the final question, do not print an immediate answer-attempt summary when delayed final reporting is scheduled. Wait until delayed `scormPost()` has called `reportResult(currentAttemptScore)`, synchronized from `window.ScormService.getBestScore()`, and updated final CMI values, then print the compact summary exactly once.
- The SCORM Cloud summary format is:
  `Score: <score> | Completion: <completion_status> | Success: <success_status>`
- The summary must use the updated local CMI values, such as `cmi.score.raw`, `cmi.completion_status`, and `cmi.success_status`.
- Do not print the final SCORM Cloud summary before `scormPost()` updates the CMI fields.
- This environment-aware console rule applies to all scripts and template types.

## Safe Insertion Points

Use these insertion zones:

- Top-level SCORM init: after page/root constants.
- Data properties: near existing activity state fields.
- Data normalization: at the end of data loading after URL overrides and before the activity starts using the normalized values.
- URL parameter overrides: after JSON loading and optional helper-derived question-count updates, but only inside an allowed development environment guard.
- Time helper: inside methods near data/helper methods.
- `scormPost()`: near existing submit/final/scoring methods.
- Completion calls: after existing submit, after final counter increments, or in final feedback branches.
- `beforeunload`: after the Vue/app instance.

# 4. Console Refactoring Standard

Console output should be structured and compact, and is owned by the QA Metadata Logging Pattern: the filtered QA object locally, the compact `Score: <score> | Completion: <completion_status> | Success: <success_status>` summary on SCORM Cloud.

Do not use string-prefixed lifecycle logs such as `[INIT]`, `[DATA]`, `[STATE]`, or `[SCORM]`. Reference implementations do not use these; use the QA object/summary pattern instead.

Allowed examples:

- `console.error("ScormService init error:", e)`
- `console.error(e)` inside a SCORM API `try/catch`

Do not log verbose SCORM payload objects containing:

- `numberOfquestion`
- `numberOfTotalQuestion`
- `subjectId`
- full `cmi`
- nested `cmi.score`

outside the filtered QA object.

Debug logs should be suitable for development. They should not introduce behavior changes and should not be required for the activity to function.

Remove redundant logs when replacing many individual logs with one structured output.

Do not hide errors silently when SCORM integration fails during development. Log caught SCORM errors with `console.error`.

For QA post-state debugging, do not log the full post object during answer attempts, final feedback, or delayed completion scheduling. Use the filtered QA object at the requested lifecycle point. For answer-state review, log after each non-final answer attempt and once after final delayed completion reporting has updated CMI/result fields for the last question. Do not scatter `console.log(post)` calls across correct, wrong, timer, feedback, SCORM scheduler, or completion branches.

# 5. Workflow

1. Read `implementation-specification.md` before modifying any JavaScript file.
2. Analyze the target file before editing.
3. Identify the main loaded data object.
4. Identify the total question/completion count.
5. Identify the current question/progress counter.
6. Identify the correct-answer counter, score source, or completion counter.
7. Identify whether scoring is whole-question, partial-credit, pass-through score, or completion-only.
8. Identify all real completion paths:
   - correct completion
   - wrong/failure/show-answer completion
   - final feedback screen
   - existing final submit method
   - end-of-content path
9. Identify unload or cleanup lifecycle hooks.
10. Compare the target file's flow with the reference pattern.
11. Choose insertion points that preserve the file's existing architecture.
12. Add guarded SCORM initialization if missing.
13. Add `scormStartTime` and `scormReported`.
14. Normalize `cmi`, `studentProgress`, language, feedback keys, and subject metadata after data loading.
15. Add the time conversion helper.
16. Add centralized `scormPost()`.
17. Call `scormPost()` from every real completion path.
18. Add guarded unload cleanup if missing.
19. Refactor debug logging into structured output where needed.
20. Run syntax validation, usually with `node --check`.
21. Inspect the diff and confirm no unrelated business logic changed.
22. Review `implementation-specification.md` after the implementation.
23. If the completed work changes the implementation methodology, update only the affected sections of `implementation-specification.md`.
24. Report:
   - what was added
   - which functions changed
   - how the completion flow was mapped
   - what validation was performed
   - any ambiguity or risk

# 6. Validation Checklist

After every refactor, verify:

- The file still parses successfully.
- No unrelated file was modified.
- Existing counters were not renamed or reset.
- Existing question/navigation flow was not changed.
- Existing slide/tab/glossary navigation was not changed.
- Existing transitions and animations were not changed.
- Existing audio behavior was not changed.
- Existing DOM manipulation was not changed.
- Existing shuffle behavior was not changed.
- Existing answer-checking behavior was not changed.
- Existing scoring logic was preserved.
- Existing `finalResponse.submitData()` behavior was preserved.
- `counterCorrect` stores the actual correct-answer count, not a normalized score.
- `counterCorrect` remains synchronized with `LOcorrectcounter` throughout the activity lifecycle when `LOcorrectcounter` is the live correct-answer source.
- `studentPoint` is calculated in the normal activity result path as a normalized score out of 10 and is not created only inside `scormPost()`.
- The internal percentage result remains 0-100; `studentPoint` is stored as `Number((result / 10).toFixed(1))`.
- `studentPoint` is not used as the SCORM raw score.
- Delayed SCORM reporting reads already-prepared scoring values instead of owning the primary score calculation.
- `scoreOutOf10` stores any normalized 0-10 score used by submit/runtime degree logic.
- `scoreOutOf10` is initialized to `0` when missing during data normalization and existing values are not overwritten.
- Any existing 0-10 bucket calculation writes to `scoreOutOf10`, not `counterCorrect`.
- `NumberOfAttempt` is restored from persistent state, incremented once per runtime session, and included in the persisted full-post payload.
- `NumberOfAttempt` is not incremented by question attempts, answer retries, completion functions, SCORM reporting, or repeated submit calls.
- Local/dev QA metadata includes `NumberOfAttempt` when visit tracking is implemented, while SCORM Cloud compact output remains unchanged.
- Previous SCORM raw score is restored before score comparison.
- Persisted runtime `cmi` restores `completion_status`, `success_status`, `total_time`, `score.raw`, `score.min`, `score.max`, and `score.scaled` before `NumberOfAttempt` initialization.
- `cmi.score.raw` preserves the highest score across visits and does not regress when a later attempt scores lower.
- `cmi.score.scaled` is derived from the preserved highest score when it is written.
- SCORM score APIs such as `updateScore(...)` and `reportResult(...)` receive the current attempt score; the shared SCORM service preserves the highest score and exposes it through `getBestScore()`.
- Finalized CMI status, time, and score fields are persisted back to platform `learningObjectAsJson` after final statuses are applied and before final logging.
- Final platform persistence is guarded so standalone and non-platform modes do not throw.
- Records saved before the final-CMI-persistence rule may keep stale `"unknown"` statuses until one new completed attempt persists corrected final CMI.
- Non-final SCORM Cloud answers print one compact summary after the local CMI score has been synchronized from the highest score, and final answers print once after delayed final reporting updates CMI.
- `success_status` and `completion_status` are based on the preserved highest score and do not regress after a previous pass/completion.
- SCORM initialization is guarded.
- Missing `window.ScormService` does not break the file.
- `cmi.completion_status` defaults to `"unknown"`.
- `success_status` is set from the score.
- `completion_status` is set from the score after `success_status`.
- `studentPoint` matches the activity result converted from the 0-100 percentage result into a 0-10 score rounded to one decimal place.
- `score.raw`, `score.min`, `score.max`, and `score.scaled` are populated.
- Percentage-based `score.raw` and `score.scaled` use the established one-decimal numeric rounding pattern when that scoring model is used; `studentPoint` uses the same one-decimal rounding after dividing the percentage result by 10.
- `total_time` is populated at completion.
- When the target script implements the Cumulative Total Time Pattern, final `total_time` equals the previously-persisted total plus the current session's elapsed time, using safe parsing for missing, invalid, numeric, `HH:MM:SS`, or ISO-duration-formatted persisted values.
- Question-level `startTime`/`endTime` use the `hh:mm:ss AM/PM` format via a dedicated helper; root-level `startTime`/`endTime` remain on the file's existing format.
- `scormPost()` only reports when the activity is complete.
- `scormReported` prevents duplicate reporting.
- Final SCORM scheduling (`scheduleFinalScormPost()` or equivalent) calls `scormPost()` directly, with no artificial delay; `scormPostScheduled` and `scormReported` still ensure it cannot be scheduled or reported twice.
- Final feedback and animation are not delayed by SCORM timing; the SCORM submission itself now executes immediately once the real final feedback branch is reached.
- If final-transition state resets affect completion guards, a dedicated completion-ready latch preserves the true final state for the immediate SCORM report.
- Every real completion path calls `scormPost()`.
- Completion guards match the target file's own flow.
- `beforeunload` cleanup is guarded.
- SCORM calls are wrapped in `try/catch`.
- Optional runtime/global helpers are guarded with `typeof helperName === "function"` before being called.
- URL parameter override blocks call `getURLParameters()` only in allowed development environments.
- URL parameter override blocks also require `typeof getURLParameters === "function"` so local pages without the helper keep using JSON values without crashing.
- Debug logs are structured and readable.
- QA metadata logs, when requested for answer-state review, are emitted after each non-final answer attempt and once after delayed completion reporting updates final CMI/result fields for the last question as `console.log(qaObject)`.
- Local/dev QA metadata includes `studentPoint` as the normalized learner score out of 10.
- Local/dev QA metadata includes both `studentPoint` and `cmi.score.raw`; they represent different values and neither replaces the other.
- QA metadata logs detect the real question collection, keep the collection's real property name, and do not dump the full Learning Object.
- QA metadata logs include only the runtime-selected questions that participate in the current session, in the same order used by the activity.
- QA metadata question counts normally equal `numberOfquestion`, unless the activity itself intentionally contains fewer runtime questions.
- QA-only question filtering does not mutate the JSON collection, runtime selection, shuffle logic, navigation, scoring, or answer validation.
- Intermediate and delayed final QA metadata use the same filtered runtime-selected collection.
- QA metadata logs exclude internal implementation fields such as `scoreOutOf10` unless explicitly required for testing.
- SCORM Cloud suppresses detailed QA metadata, including `studentPoint`, and prints only `Score: <score> | Completion: <completion_status> | Success: <success_status>` after each non-final answered question and once after final delayed `scormPost()` updates CMI values.
- Scripts with a requested QA metadata object do not also emit non-error string-only lifecycle logs such as `[STATE] Answer attempt processed`.
- Duplicate existing methods were preserved unless explicitly instructed otherwise.
- Language detection does not depend on `window.location.pathname`, folder names, or folder-name splitting.
- `Educational_stage` is the source of truth for language and educational-stage feedback selection when present.
- `preparePostFeedbackMetadata(post)` is called after data loading and before progress/feedback calculation.
- Template-specific scripts do not duplicate `Educational_stage` parsing logic when the shared preparer is available.
- `subjectId` is not assigned from a folder name and remains sourced from JSON when available.
- Arabic feedback resolves from `txtAr` and `descriptionAr`, then stores display text in `post.feedBackTxt` and `post.feedBackDes`.
- English feedback resolves from `txtEn` and `descriptionEn`, then stores display text in `post.feedBackTxt` and `post.feedBackDes`.
- Feedback index selection follows the `Educational_stage` mapping for Kindergarten, Primary 1-3, Primary 4-6, and Preparatory.
- Feedback descriptions are read from nested `Feedback[feedbackIndex]`, not directly from the level object.
- `post.feedBackTxt` and `post.feedBackDes` contain display strings after score calculation, not lookup key names.
- Feedback helper functions are connected to the actual progress calculation/output path or removed if direct inline logic is used.
- Existing `calculate(...)` callers still receive the expected level text and final progress positions.
- Final feedback descriptions returned from `calculate(...)` are assigned to a Vue data property that is rendered by the template.
- `implementation-specification.md` was reviewed after the change.
- If the methodology changed, only the relevant sections of `implementation-specification.md` were updated.
- Obsolete implementation guidance was removed when superseded.

# 7. Common Risks

## Reporting Too Early

Risk: SCORM reports after an intermediate step instead of real completion.

Mitigation: Use a strict completion guard inside `scormPost()`. In two-round activities, require both final counter completion and second-round state.

## Duplicate Reporting

Risk: Multiple final paths call `scormPost()`.

Mitigation: Use `scormReported` and return early after the first valid report.

## Breaking Existing Scoring

Risk: A generic score calculation ignores partial credit, file-specific counters, or completion-only activities.

Mitigation: Use the target file's existing score source, such as `LOcorrectcounter`, `studentScore`, `numberOfquestion`, `loQuestion`, or the existing `score` argument.

## Overwriting Existing Data

Risk: Existing `cmi`, `studentProgress`, language, or feedback values are replaced.

Mitigation: Only create missing structures. Use nullish assignment where appropriate.

## URL-Derived Metadata

Risk: Language, feedback, or `subjectId` is inferred from folder names even though JSON now provides authoritative metadata.

Mitigation: Use `post.Educational_stage` for language and feedback selection. Preserve `post.subjectId` from JSON and do not assign it from `window.location.pathname` or folder names.

## Production URL Overrides

Risk: SCORM Cloud, LMS, or production hosting URLs contain query parameters that override JSON/runtime values and change the activity unexpectedly.

Mitigation: Guard every `getURLParameters()` override block with the development-only environment check and a callable-helper check. Allow only `file:`, `localhost`, `127.0.0.1`, and the exact dev-media base URL, and only call `getURLParameters()` when `typeof getURLParameters === "function"`. Outside those environments, or when the helper is unavailable, do not call `getURLParameters()`.

## SCORM Runtime Missing

Risk: File crashes outside LMS.

Mitigation: Guard every `window.ScormService` reference.

## Wrong Completion Status

Risk: Marking failed attempts as `completed`.

Mitigation: Default `completion_status` to `"unknown"` and set final completion status from the score:

- passed result: `completed`
- failed result: `incomplete`

## Duplicate Methods

Risk: A file contains duplicate `finished()` methods and only one is updated.

Mitigation: Preserve duplicates and add SCORM calls consistently.

## Mechanical Copying

Risk: Copying from another file uses wrong variable names or the wrong data shape.

Mitigation: First map equivalents:

- loaded data object
- total question/completion count
- current index/counter
- correct answer or completion counter
- final correct path
- final wrong path
- final submit function
- cleanup lifecycle

## Formatting or Syntax Damage

Risk: Bulk edits insert malformed text or line endings.

Mitigation: Run `node --check` on every modified JavaScript file and inspect representative diffs.

# 8. Reusable Pattern

To apply this transformation to another script:

1. Read the file and understand its activity flow.
2. Do not rewrite the script.
3. Identify the existing data object, usually the object passed to final submit or progress update.
4. Identify the total question/completion count and active progress counter.
5. Identify how correct answers, score, or completion are counted.
   - Use `counterCorrect` only for the actual number of correct answers.
   - If `LOcorrectcounter` is mutated, synchronize `counterCorrect` immediately after the mutation.
   - Preserve the activity percentage calculation, usually `result = (correctAnswers / numberOfquestion) * 100`, as a 0-100 value.
   - Prepare `studentPoint` as the normalized learner score out of 10 in the normal result calculation path by storing `Number((result / 10).toFixed(1))`.
   - Do not use `studentPoint` as the SCORM raw score; SCORM percentage fields continue to use the 0-100 result/current-attempt score.
   - Use `scoreOutOf10` for normalized 0-10 score values.
   - Initialize `scoreOutOf10` to `0` when missing; do not overwrite existing values.
   - Do not let normalized score buckets overwrite the correct-answer count.
   - Restore `NumberOfAttempt` from the target script's existing persistent post state and increment it exactly once per runtime session.
   - Restore the previous SCORM raw score from the target script's existing persistent state before any new SCORM score write.
   - Restore persisted runtime `cmi` from the target script's existing persistent post state before `NumberOfAttempt`, QA output, or current-session score updates.
6. Identify all final completion paths.
7. Add guarded SCORM initialization near the top if missing.
8. Add `scormStartTime` and `scormReported` to activity state.
9. After data loading, enrich the data object with SCORM metadata:
   - `numberOfTotalQuestion`
   - `studentPoint`
   - `lang`
   - `feedBackTxt`
   - `feedBackDes`
   - `feedbackIndex`
   - `studentProgress`
   - `cmi`
10. Restore and increment `NumberOfAttempt` once from the target script's existing persistent post state before the first current-session save.
11. Preserve `subjectId` from JSON when present; never derive it from folder names.
12. Derive language and feedback keys from `Educational_stage`, not from URL or folder structure.
13. Initialize `cmi.completion_status` as `"unknown"`.
14. Add a time conversion helper.
15. Add one centralized `scormPost()` method.
16. In the file's own final result calculation path, prepare `studentPoint` as a normalized score out of 10 from the 0-100 activity percentage.
17. Before any local SCORM score write, calculate the highest score from the previous saved score, `window.ScormService.getBestScore()` when available, the current post raw score, and the current attempt score.
18. In `scormPost()`, read the prepared result from the file's own scoring model.
19. In `scormPost()`, report only when the file's own completion condition is true.
20. In `scormPost()`, prevent duplicates with `scormReported`.
21. In `scormPost()`, set:
   - `score.raw`
   - `score.min`
   - `score.max`
   - `score.scaled`
   - `success_status`
   - `completion_status`
   - `total_time`
22. Set `completion_status` after `success_status` using:
   - highest score at least 50: `completed`
   - highest score below 50: `incomplete`
23. Call SCORM `reportResult(currentAttemptScore)` only with guards and `try/catch`, then synchronize local CMI from the shared highest score. Never call `window.ScormService.finish()` from an activity script.
24. Persist the finalized local post through the existing guarded platform update flow after final CMI statuses are applied and before final logging.
25. Call `scormPost()` from every real completion path.
26. Do not add activity-level `beforeunload` cleanup that finishes the SCORM session.
27. Replace scattered debug logs with structured SCORM debug objects.
28. When QA metadata logging is requested, detect the real runtime-selected question collection and emit one compact plain QA object with `console.log(qaObject)` at the requested lifecycle point. Include `studentPoint` in the local/dev QA object alongside `cmi.score.raw` because they are different values. Include only the questions that participate in the current session, preserve their runtime order, keep the collection's real property name, and do not mutate the JSON/runtime collection. For answer-state review, log after each non-final answer attempt and once after delayed completion reporting has updated final CMI/result values for the last question.
29. Add environment-aware console behavior: local/dev may print the filtered QA object after each non-final answered question and once after final `scormPost()` updates CMI (`logQaMetadata()`, unaffected by the correction below). SCORM Cloud must never print the compact CMI summary (`logScormCloudSummary()`) during question answering — **corrected 2026-07-22, see Canonical rule F under `FINAL_QUESTION_FEEDBACK_AND_TERMINAL_LOGGING_POLICY` above and the shared Migration Records entry below; the summary is Final-Feedback-only, exactly once per completed attempt.**
30. Validate syntax.
31. Confirm no unrelated behavior changed.
32. Produce a change report explaining the mapping and verification.

# 9. Migration Records

Concise per-file records for migrations that introduced or first exercised a new canonical pattern beyond the baseline `SCORM_RUNTIME_ALIGNMENT` pass. Not every migrated file needs an entry — only those that established or verified new methodology.

## Runtime integration: SCORM Cloud summary logging restricted to Final Feedback — applied to 21 files (2026-07-22)

**Task:** "Move SCORM Cloud summary logging to Final Feedback only." Establishes and applies "Canonical rule F — SCORM Cloud summary logging is Final-Feedback-only" (see `FINAL_QUESTION_FEEDBACK_AND_TERMINAL_LOGGING_POLICY` above). This entry covers the identical, minimal change applied to all 21 already-migrated runtime files that share the `logPostAfterAnswerAttempt()`/`logPostAfterFinalFeedback()`/`logScormCloudSummary()`/`logQaMetadata()` dispatcher pattern, to avoid duplicating the same trace 21 times.

- **Root cause (identical in every file):** `logPostAfterAnswerAttempt()` — the dispatcher called from every *non-final* question's terminal handler — branched on `isScormCloudEnvironment()` and called `this.logScormCloudSummary()` in that branch. Since this dispatcher is guarded only by `if (!this.isFinalQuestionAttempt())`, it ran on every non-final question, so a SCORM Cloud environment printed the compact `Score: X | Completion: Y | Success: Z` summary after every answered question, not only at final feedback.
- **Complete call graph of `logScormCloudSummary()` audited in every file before any edit (per the task's "Required Investigation"):** exactly two callers exist in each of the 21 files, no more, no fewer:
  1. `logPostAfterAnswerAttempt()` (non-final path) — **the bug**. Removed in this fix.
  2. `logPostAfterFinalFeedback()` — called exactly once, from inside `scormPost()`'s (or the file's equivalent final-completion method's) `scormReported`/`scormPostScheduled`-guarded block, itself only reachable once `OVERALL_FINAL_FEEDBACK` is active. **Already correct, left unchanged in every file.**
  - No file in this list has a third caller of `logScormCloudSummary()`; no file calls it directly from a per-question handler, bypassing the dispatcher.
- **Fix, byte-identical across all 21 files:** `logPostAfterAnswerAttempt()` no longer branches on `isScormCloudEnvironment()` and no longer calls `this.logScormCloudSummary()`. It now unconditionally calls `this.logQaMetadata(this.posts[0])` (or `this.logQaMetadata(this.posts)` in the two `buzzTime*` files, which have no `posts[0]` wrapper) whenever `!this.isFinalQuestionAttempt()`. This is behaviorally safe because `logQaMetadata()` already self-guards internally (`if (this.isScormCloudEnvironment()) return;`), so the net effect is: SCORM Cloud environment during non-final questions → no console output at all (previously: the summary); non-cloud/local environment during non-final questions → `logQaMetadata()` runs exactly as it always did, byte-for-byte unchanged QA logging behavior.
  ```js
  logPostAfterAnswerAttempt() {
    if (!this.isFinalQuestionAttempt()) {
      this.logQaMetadata(this.posts[0]); // this.posts in buzzTime/js/main.js and buzzTime_primary/js/main.js
    }
  },
  ```
- **`logPostAfterFinalFeedback()` was not touched in any file** — still dispatches to `logScormCloudSummary()` in a cloud environment or `logQaMetadata()` otherwise, called exactly once per completed attempt from the final-completion path. This is the sole remaining source of the SCORM Cloud summary, satisfying "printed ONLY once when the learner reaches Final Feedback."
- **Files modified (all 21, identical one-method edit, nothing else changed):**
  1. `2026_2027/lib-native/digital-screen_26/choose/js/zoki.js` (canonical runtime named in the task)
  2. `2026_2027/lib-native/space_26/space-input/js/main.js`
  3. `2026_2027/lib-native/space_26/space-input/js/main_.js`
  4. `2026_2027/lib-native/digital-screen_26/digital-screen-input/js/zoki_.js`
  5. `2026_2027/lib-native/digital-screen_26/digital-screen-input/js/zoki_video.js`
  6. `2026_2027/lib-native/digital-screen_26/digital-screen-input/js/zoki.js`
  7. `2026_2027/lib-native/digital-screen_26/digital-screen-tworound-input-choose/js/zoki_.js`
  8. `2026_2027/lib-native/digital-screen_26/digital-screen-tworound-input-choose/js/zoki_choose_input.js`
  9. `2026_2027/lib-native/digital-screen_26/digital-screen-tworound-input-choose/js/zoki.js`
  10. `2026_2027/lib-native/digital-screen_26/digital-screen-tworound-inputs/js/zoki_.js`
  11. `2026_2027/lib-native/digital-screen_26/digital-screen-tworound-inputs/js/zoki.js`
  12. `2026_2027/lib-native/digital-screen_26/digital-screen-input/js/zoki_with_animation.js`
  13. `2026_2027/lib-native/penguin_26/penguin-choose/js/main.js`
  14. `2026_2027/lib-native/penguin_26/penguin-input/js/main_.js`
  15. `2026_2027/lib-native/penguin_26/penguin-tworound-input-choose/js/main.js`
  16. `2026_2027/lib-native/penguin_26/penguin-tworound-inputs/js/main_.js`
  17. `2026_2027/lib-native/penguin_26/penguin-input/js/main.js`
  18. `2026_2027/lib-native/penguin_26/penguin-tworound-inputs/js/main.js`
  19. `2026_2027/lib-native/buzzTime/js/main.js`
  20. `2026_2027/lib-native/buzzTime_primary/js/main.js`
  21. `2026_2027/lib-native/glossary_26/assets/js/main.js` (the spec's own file-specific heading below predates a later rename of this LO's folder from `glossary` to `glossary_26`; the path has been corrected here to match the file that actually exists on disk)
- **Preserved untouched in all 21 files, confirmed by diff review:** `updateScormScoreAfterAnswer()`, `applyHighestScormScore()`, `reportResult()`, every SCORM commit/save call, `UpdateStudentActivity()`, `persistFinalActivityState()`, `scormPost()`/`scheduleFinalScormPost()` and their `scormReported`/`scormPostScheduled` guards, `completeSession()` ordering, completion/success status policy, `isFinalQuestionAttempt()`'s own per-file logic (untouched, only read by the dispatcher), and `logPostAfterFinalFeedback()` itself — score updates continue to be sent to SCORM after every answered question exactly as before; only the intermediate console summary print was removed.
- **Validation performed (per the task's required scenarios, static trace only — see Browser Verification below):**
  - Scenario 1/2 (answer non-final questions): `logPostAfterAnswerAttempt()` no longer reaches `logScormCloudSummary()` under any environment — confirmed by removal of the only non-final call site.
  - Scenario 3 (reach Final Feedback): `logPostAfterFinalFeedback()`, unchanged, still fires exactly once from inside the `scormReported`/`scormPostScheduled`-guarded final block in every file — confirmed unchanged by diff.
  - Scenario 4 (reload after completion): `scormReported`/`scormPostScheduled` guards, unchanged, prevent `scormPost()` (and therefore `logPostAfterFinalFeedback()`) from re-firing on reload; no new summary print is introduced by this change since the fix only removed a call site, it did not add one.
  - Scenario 5 (two-round activities): verified in the 8 two-round files in this list (`digital-screen-tworound-input-choose/*`, `digital-screen-tworound-inputs/*`, `penguin-tworound-input-choose/*`, `penguin-tworound-inputs/*`) — `logPostAfterAnswerAttempt()`'s dispatcher is identical in shape regardless of round count; only `isFinalQuestionAttempt()`'s own per-file condition (e.g. `firstQ == loQuestions && roundTwo`, or `counter >= loQuestions && roundTwo`) determines when the non-final branch is skipped, and that condition was not touched.
- **Syntax validation:** `node --check` passed for all 21 files (batch-run, zero failures).
- **`git diff --stat` isolation:** confirmed the change in every file is isolated to the single `logPostAfterAnswerAttempt()` method (removal of the `isScormCloudEnvironment()`/`logScormCloudSummary()` branch, `this.logQaMetadata(...)` now unconditional within the existing `!isFinalQuestionAttempt()` guard) — no other method, call site, or line touched in any file.
- Out-of-Scope Findings: none — this fix is self-contained to the dispatcher method already present, identically shaped, in all 21 files; no runtime required an architectural change beyond the one method body.
- Browser verification: not performed — this environment has no browser/network-inspection or SCORM Cloud access. Verified by static analysis, `node --check` (all 21 files), `git diff --stat` review, and manual call-graph tracing of every `logScormCloudSummary()` call site in every file before editing.

## `2026_2027/lib-native/digital-screen_26/choose/js/zoki.js` final feedback delay

- Modified runtime file: `2026_2027/lib-native/digital-screen_26/choose/js/zoki.js`.
- Modified documentation file: `implementation-specification.md`.
- History: the final feedback delay was first reduced from `6000` to `1000` milliseconds (`const FINAL_FEEDBACK_DELAY = 1000;`), then, in a later pass, removed entirely. `scheduleFinalScormPost()` now calls `this.scormPost()` directly with no `setTimeout()`, and the `FINAL_FEEDBACK_DELAY` constant no longer exists in the file (it was declared at the top of the file, immediately after `pageUrl`; that declaration line was deleted along with a leftover blank line).
- Reason: the project no longer requires an artificial delay between reaching the final feedback state and executing `scormPost()`.
- The final answer evaluation, transition, feedback calculation and display still precede `scheduleFinalScormPost()`; `scormPostScheduled` plus `scormReported` still prevent duplicate execution of the now-synchronous call.
- Final CMI finalization, platform persistence, logging, and `completeSession()` ordering still occur through `scormPost()` exactly as before, each still executing exactly once; all other CMI and SCORM conditions remain unchanged.
- The unrelated internal `1000`ms `setTimeout()` inside `scormPost()`'s own SCORM-connected branch (waiting for the SCORM API calls, not for final feedback) was left untouched — it is a different timing concern from the final-feedback delay that was removed.
- Verification performed: `node --check` syntax validation; grepped the file for `FINAL_FEEDBACK_DELAY`, `scheduleFinalScormPost`, and `scormPost()` — confirmed zero remaining references to the constant, exactly one direct `this.scormPost()` call inside `scheduleFinalScormPost()` with no `setTimeout()`, and both original call sites of `scheduleFinalScormPost()` unchanged; `git diff` reviewed and confirmed no other runtime timing, scoring, CMI, persistence, or logging behavior changed.
- No other runtime timing or behavior was changed.

## `2026_2027/lib-native/digital-screen_26/choose/js/zoki.js` (canonical SCORM reference)

- **2026-07-20 `FINAL_QUESTION_FEEDBACK_AND_TERMINAL_LOGGING_POLICY` application (`TARGET_SCRIPT` invocation):** this file is the canonical `SCORM_RUNTIME_ALIGNMENT` reference (per "Mandatory Reference Files" above) but had not yet had the new policy (see `## FINAL_QUESTION_FEEDBACK_AND_TERMINAL_LOGGING_POLICY`, established this same day from the `zoki_.js`/digital-screen-input reference) applied to its own choose-type lifecycle.
- **Runtime architecture:** single shared answer-attempt funnel `chechedClicked(answer, e)`, bound to every click on any answer option. Two branches by `e.correctAnswer.length`: `== 1` (single required click, always right/wrong-terminal immediately) and `> 1` (multi-select — the user must click `e.correctAnswer.length` options before `e.counter === e.correctAnswer.length` makes the question terminal; earlier clicks in the sequence are non-terminal `ATTEMPT_EVALUATED` events). No Show Answer lifecycle exists — the wrong path resolves automatically via `falsechoose()` (an automatic reveal-and-advance, not a user-triggered second step), so canonical rule C's specific two-step pattern does not apply here; rule B (terminal- vs. attempt-based logging) is the relevant one.
- **Rule B violation found and fixed:** `this.posts[0].items[this.counter].endTime = this.getQuestionTime(); this.logPostAfterAnswerAttempt();` sat unconditionally at the very end of `chechedClicked()`, outside both branches — meaning every intermediate multi-select click (not just the one reaching `e.counter === e.correctAnswer.length`) fired a canonical per-question log. For single-answer questions this was harmless (one click is always terminal there), but for multi-select questions requiring more than one click it produced one log per click instead of one log at question completion.
- **Fix applied:** added a local `questionTerminal = false` flag (declared fresh per `chechedClicked()` call, not shared/global state). Set to `true` unconditionally on entry to the single-answer branch (always terminal there) and inside the multi-select branch's `if (e.counter === e.correctAnswer.length)` block (the actual terminal condition). The trailing `endTime`/`logPostAfterAnswerAttempt()` pair is now gated by `if (questionTerminal)`. No other statement, timing, or control flow inside `chechedClicked()` was touched — in particular the pre-existing `breakLoop`/`breakLoopfalse` logic and the async `falsechoose()`/`isAllQuestionsRight()`/`UpdateStudentActivity()` call sites (already correctly scoped to terminal-only completion, not per-click) were left exactly as they were.
- **Rule D (per-question log suppression) confirmed satisfied at the time:** `isFinalQuestionAttempt()` (`this.firstQ === this.loQuestions`) guards `logPostAfterAnswerAttempt()`'s own body, so the last question correctly produces no normal per-question log. This part of the analysis held up.
- **`completeSession()` ordering fix (same pass, user-confirmed in-scope since this file is now the explicit `TARGET_SCRIPT`):** `completeSession()` was called immediately after `reportResult()`, before `applyHighestScormScore()`/`persistFinalActivityState()`/`logPostAfterFinalFeedback()` — the same out-of-order placement previously found (and left deliberately unfixed, since this file was not the target at the time) in every other file migrated from this reference. Moved it to its own guarded `try/catch`, positioned after those three calls and immediately before the dead `finish()` scaffolding, matching the canonical order used everywhere else. Still executes exactly once, governed by the same `scormReported` guard; no `finish()` call was added or reintroduced.
- **Naming note (per the policy's naming-collision warning):** this file also has a Vue method literally named `UpdateStudentActivity()`, called from `chechedClicked()`'s wrong branches and from `isAllQuestionsRight()` — this is per-question intermediate platform persistence (see "Final CMI Persistence"), not the rule-A final activity update.
- Verification performed: `node --check` (pass); `git diff` reviewed and confirmed isolated to the four `questionTerminal`-related insertions in `chechedClicked()` and the `completeSession()` relocation in `scormPost()` — no scoring, answer-evaluation, transition, audio, DOM, or unrelated SCORM/persistence behavior changed.
- Browser verification: not performed this pass — static analysis, syntax check, and diff/grep review only. **This gap in verification is exactly what let the rule-A defect documented in the 2026-07-20 correction below ship undetected.**
- Remaining risk: the pre-existing `breakLoop`/`breakLoopfalse` control flow in the multi-select wrong-answer branch was not altered and may (independent of this change) invoke terminal handlers more than once per click in some edge cases per its own existing logic; this is unrelated to the two lifecycle rules applied here and was left as pre-existing behavior, out of scope for this task.

### 2026-07-20 correction: rule A was never actually applied to this file — duplicate final `UpdateStudentActivity` sends

**The claim in the entry above that "Rule A ... already satisfied, unchanged" was incorrect and has been struck.** That entry only verified rule D (per-question log suppression on the last question); it never actually audited or guarded the three per-question `this.UpdateStudentActivity()` call sites against rule A ("the last question must not invoke the final activity update from its own answer-terminal handler"). Per-question *logging* suppression and per-question *persistence* suppression are separate concerns, gated by separate code paths — fixing one does not fix the other, and the earlier pass conflated them.

- **Browser verification exposed the defect.** Testing `http://127.0.0.1:5502/2026_2027/allTemplete/mth/digital-screen-choose-lower-eng_2027/mymovie.html` showed `UpdateStudentActivity` firing twice on the last question: once immediately from the answer-terminal handler, and again after final feedback via `calculate(true)` → `scheduleFinalScormPost()` → `scormPost()` → `persistFinalActivityState()` → `globalFunctions.UpdateStudentActivity(...)`.
- **Confirmed premature call sites (all unguarded before this fix):** `chechedClicked()`'s single-answer wrong-terminal branch (`this.UpdateStudentActivity();`, immediately following the scheduled `falsechoose()` call), `chechedClicked()`'s multi-select wrong-terminal branch (same pattern, inside the `e.counter === e.correctAnswer.length` terminal condition's wrong-sub-branch), and `isAllQuestionsRight()`'s correct-answer path (`this.UpdateStudentActivity();`, called synchronously right after `this.finished();`, before the 5500ms feedback `setTimeout`). All three fired unconditionally regardless of whether the completed question was the last one.
- **Fix applied:** wrapped each of the three call sites in `if (!this.isFinalQuestionAttempt()) { this.UpdateStudentActivity(); }`, reusing the existing `isFinalQuestionAttempt()` helper (`this.firstQ === this.loQuestions`) unchanged — runtime tracing confirmed `firstQ` is not mutated by any other code between question-terminal detection and each of these three call sites (the only mutator, `nextQuestion()`, runs later — either inside `falsechoose()`'s own further-nested, further-delayed `setTimeout`, or inside `isAllQuestionsRight()`'s 5500ms `setTimeout` — so no local capture of the final-question result was needed at any of the three sites; a direct guard is safe).
- **Result:** non-final questions still call `this.UpdateStudentActivity()` exactly once from their answer-terminal handler, immediately, as before. The final question now calls it from none of the three per-question handlers — the final platform persistence is instead produced exactly once, exclusively by `persistFinalActivityState()` inside `scormPost()`'s `scormReported`-guarded branch, reached only via `calculate(true)` → `scheduleFinalScormPost()` from the two `firstQ == loQuestions` branches (`isAllQuestionsRight()`, `falsechoose()`). `persistFinalActivityState()` itself remains intentionally unguarded by `isFinalQuestionAttempt()` — it is the sole final-persistence owner and is only ever reached once completion is already confirmed by `scormPost()`'s own `firstQ == loQuestions && !scormReported` gate. No final-question code path can reach both `this.UpdateStudentActivity()` and `persistFinalActivityState()`; they are now mutually exclusive by construction.
- **Finalization order unchanged:** `reportResult()` → `applyHighestScormScore()` → `persistFinalActivityState()` → `logPostAfterFinalFeedback()` → `completeSession()`, still inside the same `scormReported`-guarded, 1000ms-deferred SCORM-connected branch (plus the equivalent not-connected branch) fixed in the entry above. `calculate(true)`/`scheduleFinalScormPost()` were not moved.
- **Logging unaffected:** `logPostAfterAnswerAttempt()`'s existing `isFinalQuestionAttempt()` guard (rule D, from the entry above) was not touched — the final question still produces zero normal per-question logs and exactly one final log via `logPostAfterFinalFeedback()`, called after `persistFinalActivityState()` and before `completeSession()`.
- Verification performed: `node --check` (pass); `git diff` reviewed and confirmed isolated to the three new `if (!this.isFinalQuestionAttempt())` guards (no scoring, UI, audio, animation, navigation, timing, or feedback behavior changed); grepped for `this.UpdateStudentActivity()`, `globalFunctions.UpdateStudentActivity`, `persistFinalActivityState()`, `isFinalQuestionAttempt()`, `calculate(true)`, `scheduleFinalScormPost()`, `logPostAfterAnswerAttempt()`, `logPostAfterFinalFeedback()` — every remaining occurrence accounted for (three guarded per-question call sites, the `UpdateStudentActivity()`/`persistFinalActivityState()` method definitions, the two `persistFinalActivityState()`/`logPostAfterFinalFeedback()` call sites inside `scormPost()`'s two branches, the two `calculate(true)`/`scheduleFinalScormPost()` pairs in the final-question branches of `isAllQuestionsRight()`/`falsechoose()`, unchanged).
- **Browser verification: not performed.** This environment has no browser/network-inspection tool available to me, so the five required cases (final question correct/incorrect-single/incorrect-multi-select, penultimate correct/incorrect) against `http://127.0.0.1:5502/2026_2027/allTemplete/mth/digital-screen-choose-lower-eng_2027/mymovie.html` were **not** executed. The fix above is verified by static analysis and code tracing only: the three premature call sites are now provably unreachable when `isFinalQuestionAttempt()` is true, and `persistFinalActivityState()`/`this.UpdateStudentActivity()` are structurally mutually exclusive on the final question. This does not substitute for the browser confirmation the original defect report was based on — the user (or a future pass with browser tooling) should verify the Network-panel request counts before treating this as fully closed.
- **2026-07-21 SCORM status restoration:** added `restoreScormServiceStatus(post)` + its `getData()` call site (this is the canonical file for that change) — see "SCORM Status Restoration Policy" above and the shared "Runtime integration: `restoreScormServiceStatus(post)`" migration entry near the end of this section for the full trace.

## `2026_2027/lib-native/space_26/space-input/js/main.js`

- Runtime family: Space single-round input (`space_26/space-input`), same shape as `space_26/space-input/js/main_.js`.
- Question collection: `this.posts[0].items`.
- Correct-answer counter: `this.posts[0].LOcorrectcounter`, mirrored into `counterCorrect` immediately on every mutation (`start()`, `isAllQuestionsRight()`).
- Score calculation: `calculateCurrentAttemptScore()` → `(LOcorrectcounter / posts[0].numberOfquestion) * 100`.
- CMI initialization: default `cmi` object created in `getData()` when missing (`total_time: "00:00:00"` default — corrected 2026-07-19 from the legacy `"PT0H0M0S"` default; see the "Canonical default: total_time initialization" rule above).
- Persisted-CMI restoration point: `restorePersistedCmi(post, restoredPost)`, called in `getData()` immediately after the fresh post object is confirmed and before `initializeNumberOfAttempt(...)`, matching the canonical initialization order.
- `NumberOfAttempt` initialization point: `initializeNumberOfAttempt(post, restoredPost)`, called immediately after `restorePersistedCmi`, guarded by `numberOfAttemptInitialized`.
- Cumulative time implementation: added `parseScormTimeToSeconds`/`formatSecondsToScormTime` (see Cumulative Total Time Pattern) and applied them in `scormPost()` to add the previously-persisted `cmi.total_time` (restored by `restorePersistedCmi`) to the current session's elapsed seconds before formatting the final value. This is the first target file to implement true cross-visit cumulative time; `msToScormTime` remains defined but is superseded at the final-completion call site.
- Per-question score-update call sites: `UpdateStudentActivity()` (covers `trueAnswer()` and `showAnswer()`), plus a direct `updateScormScoreAfterAnswer(...)` call in `falseAnswer()` (a retry path that does not route through `UpdateStudentActivity()`).
- Final CMI finalization point: `scormPost()`, guarded by `scormCompletionReady || counter >= loQuestions` and `scormReported`.
- Final platform persistence point: `persistFinalActivityState()`, called from both branches of `scormPost()` (SCORM-connected and not) immediately after `applyHighestScormScore(...)` and before `logPostAfterFinalFeedback()`.
- Cloud logging: `logScormCloudSummary()` / local logging: `logQaMetadata()`, both via the standard `logPostAfterAnswerAttempt()` / `logPostAfterFinalFeedback()` dispatchers.
- Intentional differences from Digital Screen Choose: uses `loQuestions`/`numberOfquestion` naming instead of the reference's variable names; completion path is `isAllQuestionsRight()` (correct) and `isAllQuestionsFalse()` → `next()` (wrong/show-answer), both feeding `scheduleFinalScormPost()`.
- Verification performed: `node --check` syntax validation; diff reviewed to confirm only the CMI-restoration, final-persistence, and cumulative-time additions were made, with no changes to question flow, transitions, audio, or DOM handling.
- **2026-07-19 `FINAL_FEEDBACK_DELAY` removal + `completeSession()` ordering fix:** the same two gaps found and fixed across the `digital-screen_26` and `penguin_26` families:
  1. Deleted the `const FINAL_FEEDBACK_DELAY = 1000;` declaration and simplified `scheduleFinalScormPost()` to call `this.scormPost()` directly with no `setTimeout()`, preserving the `scormCompletionReady = true;` line unchanged.
  2. `completeSession()` was called immediately after `reportResult()`, before `applyHighestScormScore()`/`persistFinalActivityState()`/`logPostAfterFinalFeedback()`. Moved it to after those three calls, in its own guarded `try/catch`, immediately before the dead `finish()` scaffolding (note: this file's dead `finish()` scaffolding is `setTimeout(() => {}, 1000);` — empty body, no comment — pre-existing, harmless, left unchanged).

  The pre-existing `scormCompletionReady` latch and cumulative time pattern were untouched. Verified via `node --check` (pass) and `git diff` (isolated to these two fixes).
- Remaining risk: cumulative time assumes `cmi.total_time` is only ever written by this script's own `formatSecondsToScormTime`/legacy `"PT0H0M0S"` default; an externally-written total_time in an unrecognized format falls back to `0` via `parseScormTimeToSeconds` rather than throwing. This file's `completeSession()` position now diverges from the current `zoki.js` (Digital Screen Choose) reference, which still calls it in the earlier (pre-persistence) position.
- **2026-07-20 `FINAL_QUESTION_FEEDBACK_AND_TERMINAL_LOGGING_POLICY` confirmation (shared/repeatable interaction handler audit):** re-audited `checkanswer()` (the shared `ATTEMPT_EVALUATED` funnel, bound once per click to `.check-button`, confirmed via the `mymovie.html` templates' `@click` binding) against the policy's "Shared/repeatable interaction handlers" subsection. The only other interaction handlers are the per-digit-input `changeValue()`/`maxLength()` (`@change`/`@keyup`), neither of which calls `logPostAfterAnswerAttempt()`, `UpdateStudentActivity()`, or sets `endTime`. `INTERACTION_OCCURRED` and `QUESTION_TERMINAL_STATE` therefore coincide — no multi-fire-before-terminal condition exists, so no local terminal-flag guard was needed. Rules B/C/D re-confirmed already satisfied (log present in `trueAnswer()`/`showAnswer()`, absent from non-terminal `falseAnswer()`; last-question suppression via `isFinalQuestionAttempt()`; `persistFinalActivityState()` reachable only through `scormPost()` ← `scheduleFinalScormPost()`'s `finalizeFeedback` branches, never called directly from the answer handlers). `completeSession()` ordering re-verified unchanged and correct. No source change required. `node --check` re-run (pass, no changes).
- **Out-of-scope observation, not fixed:** `finished()` (a separate `finalResponse.submitData(...)` platform call, unrelated to `ScormService`/CMI/the audited canonical-logging funnel) fires from both `falseAnswer()` (non-terminal) and `isAllQuestionsFalse()` (terminal, reached via `showAnswer()`) — i.e. twice on the wrong-then-shown path. Pre-existing behavior, outside this pass's scope, left untouched.
- **2026-07-20 `FINISHED_SINGLE_EXECUTION_AUDIT`:** traced every `finished()`/`this.finished()` call site end-to-end. `finished()` is genuinely called twice on the wrong-then-shown-answer path — once from `falseAnswer()` (non-terminal, first attempt) and once from `isAllQuestionsFalse()` (terminal, invoked from the separate `showAnswer()` click) — reconfirming the "Out-of-scope observation" above from first principles. Traced whether this duplication threatens the SCORM finalization funnel (`reportResult()` → `applyHighestScormScore()` → `persistFinalActivityState()`/`UpdateStudentActivity()` → `logPostAfterFinalFeedback()` → `completeSession()`): it does not. `finished()` only mutates `posts[0].studentPoint`/`posts[0].scoreOutOf10` and calls `finalResponse.submitData()`; it never calls `scormPost()`, `UpdateStudentActivity()`, `persistFinalActivityState()`, `logPostAfterFinalFeedback()`, or `completeSession()`, and both values it writes are unconditionally recomputed and overwritten by `scormPost()` before final persistence/logging runs. The funnel's `scormReported`/`scormPostScheduled` guards are set synchronously, before any async work, so `scormPost()` — and everything it calls — executes exactly once per session regardless of how many times `finished()` fires. No genuine risk to the funnel was found; no guard was added and no source change was made, consistent with this pattern's existing out-of-scope status. `node --check` re-run (pass, no changes). Analysis-only.

- **2026-07-20 correction — duplicate final `UpdateStudentActivity` send:** a fresh endpoint-level trace found that both terminal handlers, `trueAnswer()` and `showAnswer()`, called the per-question `UpdateStudentActivity()` method unconditionally. On the last question this reached `globalFunctions.UpdateStudentActivity(...)` before final feedback, then `persistFinalActivityState()` reached the same endpoint again from the final `scormPost()` funnel. Both handler calls are now guarded by `if (!this.isFinalQuestionAttempt())`, preserving immediate persistence for non-final terminal questions and suppressing it on the final question. `falseAnswer()` remains a non-terminal retry path with score sync only; `showAnswer()` remains the terminal owner for the wrong-answer path. Final persistence is now exclusively owned by `persistFinalActivityState()` after final feedback, and the connected order remains `reportResult()` → `applyHighestScormScore()` → `persistFinalActivityState()` → `logPostAfterFinalFeedback()` → `completeSession()`. The existing last-question logging suppression was unchanged. Browser verification was not performed; validation was limited to static tracing, syntax checking, and diff review.
- **2026-07-20 effective runtime question-count migration:** this runtime already supported question filtering through the canonical guarded `checkQuestions()` block, but its placement was ineffective: it set `loQuestions` from the filtered `items.length` synchronously, then the existing one-second initialization callback overwrote it with the authored `posts[0].numberOfquestion`. The unchanged canonical block now runs inside that callback immediately after the authored count initializes `loQuestions`, so the filtered `items.length` wins when filtering is active. `posts[0].numberOfquestion` remains untouched as authored metadata, while navigation, final-question detection, and completion continue using the effective `loQuestions`. No unrelated initialization logic was modified.

- **2026-07-20 effective-count + `QUESTION_TIMING_LIFECYCLE` migration:** retained the canonical guarded `checkQuestions()` block in synchronous post-fetch initialization and removed authored-count/root-start writes from the loading timer, so filtered `items.length` is effective before `getData()` returns and root `startTime` belongs to the current attempt at the end of data initialization. `nextQuestion()` already deactivated and activated in the correct order; its item `startTime` write is now guarded against overwrite. Correct terminal completion (`isAllQuestionsRight()`) and wrong→Show Answer terminal completion (`isAllQuestionsFalse()`) now assign only the current item's `endTime`, once. Their former root `endTime` writes were removed, as was item-end mutation from `UpdateStudentActivity()`. Root `endTime` is now assigned once inside `scormPost()`'s completion gate before highest-score application, final persistence, and final logging. Scoring, retry/Show Answer flow, duplicate-persistence guards, Space transitions, audio, navigation delays, feedback, and counters were preserved.

- **2026-07-20 effective-count + `QUESTION_TIMING_LIFECYCLE` migration:** retained the canonical guarded `checkQuestions()` block in synchronous post-fetch initialization and removed the delayed root/count writes, so filtered `items.length` is effective before `getData()` returns and authored `numberOfquestion` remains metadata. Root `startTime` is assigned once at the end of `getData()`. `nextQuestion()` already deactivated all items before activating the current item; its item `startTime` write is now empty-only. Correct completion (`isAllQuestionsRight()`) and wrong→Show Answer completion (`isAllQuestionsFalse()`) each assign the current item `endTime` once, while their former root-end writes were removed. Item-end mutation was removed from `UpdateStudentActivity()`. Root `endTime` is assigned once inside `scormPost()`'s authoritative completion gate before final persistence/logging. Scoring, retries, Show Answer, final-update suppression, UI, transitions, audio, navigation timing, and logging ownership were preserved.
- **2026-07-21 batch `TARGET_SCRIPT` re-audit — Rule A/B/C/D re-confirmed correct by fresh trace, one gap found and fixed (Status Restoration Policy):** re-traced independently — `trueAnswer()`/`showAnswer()`'s `isFinalQuestionAttempt()` guards (pre-advance `counter >= loQuestions - 1` convention) evaluate before `nextQuestion()`'s later-delayed `counter` mutation in both paths; `falseAnswer()` correctly omits the log. Matches the sibling `main_.js`'s already-confirmed byte-identical architecture. `normalizeScormScore()` contains no integer-rounding operation. **Gap found and fixed:** this file had no `restoreScormServiceStatus(post)` (unlike `main_.js`, which already received it in an earlier task). Added the canonical method and its `getData()` call site. `node --check` passed; `git diff --stat` showed 1 file, 17 insertions, isolated. Browser verification: not performed.

## `2026_2027/lib-native/digital-screen_26/digital-screen-input/js/zoki_.js`

- Runtime family: Digital Screen single-round input (`digital-screen_26/digital-screen-input`), already had the baseline `SCORM_RUNTIME_ALIGNMENT` pass from an earlier migration; this pass added the CMI-restoration, final-persistence, and cumulative-time patterns established by the `space-input/main.js` migration above.
- Question collection: `this.posts[0].items`.
- Correct-answer counter: `this.posts[0].LOcorrectcounter`, mirrored into `counterCorrect` immediately on every mutation (`start()`, `isAllQuestionsRight()`).
- Score calculation: `calculateCurrentAttemptScore()` → `(LOcorrectcounter / posts[0].numberOfquestion) * 100`.
- CMI initialization: default `cmi` object created in `getData()` when missing (`total_time: "00:00:00"` default — corrected 2026-07-19 from the legacy `"PT0H0M0S"` default; see the "Canonical default: total_time initialization" rule above).
- Persisted-CMI restoration point: `restorePersistedCmi(post, restoredPost)`, called in `getData()` immediately after the fresh post object is confirmed and before `initializeNumberOfAttempt(...)`.
- `NumberOfAttempt` initialization point: `initializeNumberOfAttempt(post, restoredPost)`, called immediately after `restorePersistedCmi`, guarded by `numberOfAttemptInitialized`.
- Cumulative time implementation: added `parseScormTimeToSeconds`/`formatSecondsToScormTime` and applied them in `scormPost()`, adding the previously-persisted `cmi.total_time` to the current session's elapsed seconds before formatting the final value.
- Per-question score-update call sites: `UpdateStudentActivity()` (covers `trueAnswer()` and `showAnswer()`), plus a direct `updateScormScoreAfterAnswer(...)` call in `falseAnswer()` (a wrong-answer retry path that does not route through `UpdateStudentActivity()`).
- Final CMI finalization point: `scormPost()`, guarded by `counter >= loQuestions - 1` and `scormReported`.
- Final platform persistence point: `persistFinalActivityState()`, called from both branches of `scormPost()` immediately after `applyHighestScormScore(...)` and before `logPostAfterFinalFeedback()`.
- Cloud logging: `logScormCloudSummary()` / local logging: `logQaMetadata()`, both via the standard dispatchers.
- Intentional differences from Digital Screen Choose: completion path is `isAllQuestionsRight()` (correct, via `trueAnswer()`) and `isAllQuestionsFalse()` → `next()` (wrong/show-answer, via `falseAnswer()`/`showAnswer()`), both feeding `scheduleFinalScormPost()`; no `scormCompletionReady` latch exists in this file since its final-transition state does not reset the completion guard before `scormPost()` runs. Also has its own `isFinalFeedbackVisible()` helper (`counter >= loQuestions`, checked after `nextQuestion()` has already advanced `counter`) distinct from `isFinalQuestionAttempt()` (`counter >= loQuestions - 1`, checked before the increment in `next()`) — two different completion checks for the two different call sites, not a duplication.
- Additional cleanup (earlier pass): normalized a stray bracket-prefixed `console.error("[ERROR] ScormService finish error:", err)` in the `beforeunload` handler to the unprefixed `console.error(err)` form used by the reference, per the Console Logging Pattern.
- **2026-07-19 re-audit:** this file was found already updated to match the current reference/spec's SCORM-termination policy change (`window.ScormService.finish()` is no longer called anywhere — the `scormPost()` connected branch has only dead `typeof ... === "function"` scaffolding around a commented-out call, and the `beforeunload` handler's `finish()` call is commented out — matching `zoki.js`'s current state exactly), including the new, still-undocumented `window.ScormService.completeSession()` call in the connected branch. No source changes were needed this pass; this record was updated only to keep the documentation synchronized with the actual current code.
- **2026-07-19 `completeSession()` ordering fix:** `completeSession()` was already present (added by an earlier external update), but at the wrong point in the sequence — it was called immediately after `reportResult()`, before `applyHighestScormScore()`/`persistFinalActivityState()`/`logPostAfterFinalFeedback()`, exactly matching the current `zoki.js` reference's own (equally out-of-order) placement. Per the now-documented "`completeSession()` Canonical Rule" (see Final CMI Persistence), the call was moved to after `applyHighestScormScore()`, `persistFinalActivityState()`, and `logPostAfterFinalFeedback()` — i.e., immediately before the dead `finish()` scaffolding, still inside the same `scormReported`-guarded, `1000`ms-deferred, SCORM-connected branch, using the pre-existing `typeof window.ScormService.completeSession === "function"` guard (unchanged) wrapped in its own `try/catch`. This means **the target now diverges from the current `zoki.js` reference's literal line order** on this one point — `zoki.js` itself was not modified, since this task's scope was limited to the target script. No `finish()` call was added or reintroduced; the pre-existing dead scaffolding around it remains untouched and inert. Executes exactly once, governed by the same `scormReported` guard as before.
- Verification performed: `node --check` syntax validation; grepped the file for `completeSession`, `.finish(`, `scormPost`, and `scormReported` — confirmed exactly one active, guarded `completeSession()` call and zero active `.finish(` calls (both remaining `.finish(` occurrences are commented out); `git diff` reviewed and confirmed the only change is the relocation of the `completeSession()` block, with `reportResult()`, `applyHighestScormScore()`, `persistFinalActivityState()`, `logPostAfterFinalFeedback()`, `FINAL_FEEDBACK_DELAY`, CMI restoration, `NumberOfAttempt`, cumulative time, and per-answer score sync all unchanged.
- **2026-07-19 `FINAL_FEEDBACK_DELAY` removal:** matching the policy change already applied to the `zoki.js` reference (see that file's Migration Record), the artificial delay between reaching final feedback and calling `scormPost()` has been removed. Deleted the `const FINAL_FEEDBACK_DELAY = 1000;` declaration (previously at the top of the file, immediately after `pageUrl`) and simplified `scheduleFinalScormPost()` to call `this.scormPost()` directly with no `setTimeout()`:
  ```js
  scheduleFinalScormPost() {
    if (this.scormPostScheduled || this.scormReported) return;

    this.scormPostScheduled = true;
    this.scormPost();
  },
  ```
  `scormPostScheduled`/`scormReported` still prevent duplicate execution of the now-synchronous call; the internal `1000`ms `setTimeout()` inside `scormPost()`'s own SCORM-connected branch (which waits for the SCORM API calls themselves) is unrelated and was left untouched. No other timing, scoring, CMI, persistence, logging, or `completeSession()`-ordering behavior changed. Verified via `node --check` (pass) and `git diff` (isolated to the constant deletion and the `scheduleFinalScormPost()` body).
- Remaining risk: same `parseScormTimeToSeconds` fallback-to-`0` behavior as `space-input/main.js` for unrecognized persisted time formats. The current `zoki.js` reference itself still calls `completeSession()` in the earlier (pre-persistence) position and was intentionally left unmodified per this task's scope — a future task may want to apply the same reordering fix back to the reference for full consistency.
- **2026-07-20 `FINAL_QUESTION_FEEDBACK_AND_TERMINAL_LOGGING_POLICY` confirmation:** re-audited this file as the canonical reference for the new policy (see that section above, in `## Final CMI Persistence` → `FINAL_QUESTION_FEEDBACK_AND_TERMINAL_LOGGING_POLICY`). Confirmed current state already matches rules B/C/D: `this.logPostAfterAnswerAttempt();` is present in `trueAnswer()` (correct answer is terminal immediately) and in `showAnswer()` (the true terminal state for the wrong-answer path), and is **absent** from `falseAnswer()` (non-terminal — Show Answer always follows), which prevents the duplicate log that previously fired once from `falseAnswer()` and again from `showAnswer()` for the same wrong-then-shown question. Last-question suppression (rule D) is enforced inside `logPostAfterAnswerAttempt()`'s existing `isFinalQuestionAttempt()` guard. `persistFinalActivityState()` itself is reachable only through `scormPost()`, gated by `isFinalFeedbackVisible()`, never called directly from `trueAnswer()`/`falseAnswer()`/`showAnswer()` — this specific claim holds. **The broader rule-A claim in this entry — "Rule A ... was already satisfied ... no source change was required" — was incorrect and is superseded by the 2026-07-20 correction entry immediately below.** This entry only checked whether `persistFinalActivityState()` itself was called prematurely; it did not check whether a *different*-named method reaching the same platform endpoint (`this.UpdateStudentActivity()`) was. `node --check` re-run (pass, no changes at the time). Analysis-only — no other file in the repository was modified this pass; no `TARGET_SCRIPT` for a migration was supplied.
- **2026-07-20 correction — duplicate final `UpdateStudentActivity` send (rule A actually violated):** browser verification against the sibling `digital-screen_26/choose/js/zoki.js` file (`http://127.0.0.1:5502/2026_2027/allTemplete/mth/digital-screen-choose-lower-eng_2027/mymovie.html`) exposed a duplicate final `UpdateStudentActivity` platform send on the last question there. Runtime tracing of *this* file (prompted by that finding, via a fresh `TARGET_SCRIPT` invocation) confirmed the identical defect exists here: `trueAnswer()` and `showAnswer()` both called `this.UpdateStudentActivity()` unconditionally — including on the last question — and that Vue method calls the exact same `globalFunctions.UpdateStudentActivity(this.activityId, this.posts[0])` platform endpoint that `persistFinalActivityState()` calls again moments later, once overall final feedback fires. The entry above had rationalized this as safe "per-question intermediate persistence," distinct from the rule-A final update — that rationalization is now retracted (see the corrected "Naming collision" note in the `FINAL_QUESTION_FEEDBACK_AND_TERMINAL_LOGGING_POLICY` reference-implementation section above). **Fix:** guarded both call sites — `if (!this.isFinalQuestionAttempt()) { this.UpdateStudentActivity(); }` in `trueAnswer()` (immediately after `this.result += 1;`) and in `showAnswer()` (immediately after `this.isAllQuestionsFalse();`). Runtime tracing confirmed no local capture of `isFinalQuestionAttempt()` was needed at either site: `counter`/`firstQ` (the values the helper reads) are not mutated by `isAllQuestionsRight()` or `isAllQuestionsFalse()` synchronously — the only mutator, `nextQuestion()`, runs later inside a separately-delayed `setTimeout` in each path, well after these guarded calls have already executed. Non-final questions still call `this.UpdateStudentActivity()` exactly once, immediately, unchanged. The final question no longer calls it from either per-question handler; final platform persistence is now produced exactly once, exclusively by `persistFinalActivityState()` inside `scormPost()`'s `scormReported`-guarded branch — the two are structurally mutually exclusive on the final question. Finalization order unchanged: `reportResult()` → `applyHighestScormScore()` → `persistFinalActivityState()` → `logPostAfterFinalFeedback()` → `completeSession()`. `logPostAfterAnswerAttempt()`'s existing last-question suppression (rule D, unaffected by this fix) was not touched. Verified via `node --check` (pass) and `git diff` (isolated to the two new guards — no scoring, UI, audio, animation, navigation, timing, or feedback behavior changed). **Browser verification: not performed** — this environment has no browser/network-inspection tool available; the fix is verified by static analysis and code tracing only. The five cases required to fully close this out (final question correct/incorrect-single-answer-equivalent/incorrect-show-answer-equivalent, penultimate correct/incorrect) against a running instance of this template should still be checked in a browser before treating this as fully confirmed.
- **2026-07-21 SCORM status restoration:** added `restoreScormServiceStatus(post)` + its `getData()` call site — see "SCORM Status Restoration Policy" above and the shared "Runtime integration: `restoreScormServiceStatus(post)`" migration entry near the end of this section for the full trace.

## `2026_2027/lib-native/digital-screen_26/digital-screen-input/js/zoki_video.js`

- Runtime family: Digital Screen single-round input, video-gated variant (intro video via `start()`, real activity entry via `skipvideo()`). Already had the baseline `SCORM_RUNTIME_ALIGNMENT` pass; this migration added the CMI-restoration, final-persistence, and cumulative-time patterns.
- Question collection: `this.posts[0].items`.
- Correct-answer counter: `this.posts[0].LOcorrectcounter`, mirrored into `counterCorrect` immediately on every mutation (`skipvideo()`'s two reset sites, `isAllQuestionsRight()`).
- Score calculation: `calculateCurrentAttemptScore()` → `(LOcorrectcounter / posts[0].numberOfquestion) * 100`.
- CMI initialization: default `cmi` object created in `getData()` when missing (`total_time: "00:00:00"` default — corrected 2026-07-19 from the legacy `"PT0H0M0S"` default; see the "Canonical default: total_time initialization" rule above).
- Persisted-CMI restoration point: `restorePersistedCmi(post, restoredPost)`, called in `getData()` immediately after the fresh post object is confirmed and before `initializeNumberOfAttempt(...)`.
- `NumberOfAttempt` initialization point: `initializeNumberOfAttempt(post, restoredPost)`, called immediately after `restorePersistedCmi`, guarded by `numberOfAttemptInitialized`.
- Cumulative time implementation: added `parseScormTimeToSeconds`/`formatSecondsToScormTime` and applied them in `scormPost()`, adding the previously-persisted `cmi.total_time` to the current session's elapsed seconds before formatting the final value.
- Per-question score-update call sites: `UpdateStudentActivity()` (covers `trueAnswer()` and `showAnswer()`), plus a direct `updateScormScoreAfterAnswer(...)` call in `falseAnswer()`.
- Final CMI finalization point: `scormPost()`, guarded by `counter >= loQuestions - 1` and `scormReported`.
- Final platform persistence point: `persistFinalActivityState()`, called from both branches of `scormPost()` immediately after `applyHighestScormScore(...)` and before `logPostAfterFinalFeedback()`.
- Cloud logging: `logScormCloudSummary()` / local logging: `logQaMetadata()`, both via the standard dispatchers.
- Intentional differences from Digital Screen Choose: video-gated entry (`start()` plays the intro video and schedules `skip = true`; `skipvideo()` is the real activity entry point) was preserved exactly — no SCORM calls were added to the video-gating logic itself, only to the same answer/completion hooks used by the non-video input variant. `skipvideo()` contains two back-to-back, functionally-redundant `LOcorrectcounter = 0; counterCorrect = LOcorrectcounter;` assignments (pre-existing duplication, not introduced by any migration pass) — left untouched since it is harmless and unrelated to SCORM behavior. `checkInputALL(this.activeQuestion)` and `maxLength(event, this.activeQuestion)` use fewer arguments here than the sibling `zoki_.js` (`checkInputALL(this.activeQuestion, this.isEng, this.upper)` / `maxLength(event, this.activeQuestion, isEng, upper)`) — a pre-existing, file-specific business-logic difference, not a SCORM/metadata concern, left untouched.
- **2026-07-19 re-audit:** found already updated to match the current reference/spec's SCORM-termination policy change — `window.ScormService.finish()` is no longer called anywhere (the `scormPost()` connected branch has dead `typeof ... === "function"` scaffolding around an empty `setTimeout`, and the `beforeunload` handler's `finish()` call is commented out), and the still-undocumented `window.ScormService.completeSession()` call is present in the connected branch, matching `zoki.js` and `zoki_.js`. No source changes were needed this pass; this record is updated only to keep the documentation synchronized with the actual current code.
- Verification performed: `node --check` syntax validation; full re-audit against the current reference and spec confirmed CMI restoration, `NumberOfAttempt`, highest-score preservation, cumulative time, per-answer score sync, `counterCorrect` sync, item-vs-root timestamp formats, and the `finish()`/`completeSession()` state are all already correct; no diff was produced.
- **2026-07-19 `FINAL_FEEDBACK_DELAY` removal + `completeSession()` ordering fix:** the earlier re-audit above only checked that `completeSession()` existed, not that it was correctly positioned; a fresh audit against the `completeSession()` Canonical Rule (see Final CMI Persistence) found two gaps, both now fixed:
  1. Deleted the `const FINAL_FEEDBACK_DELAY = 1000;` declaration and simplified `scheduleFinalScormPost()` to call `this.scormPost()` directly with no `setTimeout()`, matching the policy already applied to `zoki.js` and `zoki_.js`.
  2. `completeSession()` was called immediately after `reportResult()`, before `applyHighestScormScore()`/`persistFinalActivityState()`/`logPostAfterFinalFeedback()` — the same out-of-order placement found and fixed in `zoki_.js`. Moved it to after those three calls, in its own guarded `try/catch`, immediately before the dead `finish()` scaffolding.

  `scormPostScheduled`/`scormReported` still guard against duplicate execution; the internal `1000`ms `setTimeout()` inside `scormPost()`'s connected branch (waiting on the SCORM API calls) is unrelated and untouched. No other CMI, scoring, persistence, or logging behavior changed. Verified via `node --check` (pass) and `git diff` (isolated to these two fixes).
- Remaining risk: same `parseScormTimeToSeconds` fallback-to-`0` behavior as the other migrated files for unrecognized persisted time formats. Like `zoki_.js`, this file's `completeSession()` position now diverges from the current `zoki.js` reference, which still calls it in the earlier (pre-persistence) position.
- **2026-07-20 `FINAL_QUESTION_FEEDBACK_AND_TERMINAL_LOGGING_POLICY` confirmation (shared/repeatable interaction handler check):** audited against the "Shared/repeatable interaction handlers" subsection of the policy. `checkanswer()` is a single Check-button click funnel (not a per-character, multi-select, or drag/drop handler), so `INTERACTION_OCCURRED` and `QUESTION_TERMINAL_STATE` coincide for the correct-answer path; `falseAnswer()` is non-terminal (Show Answer always follows) and correctly carries no `logPostAfterAnswerAttempt()` call; `showAnswer()` is the true terminal state for the wrong-answer path and owns the single canonical log. Both `trueAnswer()` and `showAnswer()` fire exactly once per logical question — no multi-fire-before-terminal condition exists in this file. Rule A (final activity update deferred to `scormPost()`/`isActivityComplete`, never called from the answer handlers) and rule D (last-question suppression via `isFinalQuestionAttempt()` inside `logPostAfterAnswerAttempt()`) were both already satisfied. No source change was required this pass. `node --check` re-run (pass, no changes). Analysis-only.

- **2026-07-20 correction — duplicate final `UpdateStudentActivity` send:** the rule-A claim in the confirmation above was incorrect because it checked only direct `persistFinalActivityState()` calls and did not trace the differently named per-question `UpdateStudentActivity()` method to the same `globalFunctions.UpdateStudentActivity(...)` platform endpoint. Both terminal handlers (`trueAnswer()` for a correct answer and `showAnswer()` for the wrong-answer/Show Answer path) called that method unconditionally, so the last question persisted once at question terminal state and again after final feedback through `persistFinalActivityState()`. Both per-question calls are now guarded by `if (!this.isFinalQuestionAttempt())`, preserving one immediate update for every non-final terminal question while suppressing both ordinary persistence and the already-guarded ordinary log on the final question. `falseAnswer()` remains non-terminal and continues to own only the intermediate score sync; `showAnswer()` remains the sole terminal owner for its wrong-answer path. Final persistence remains exclusively owned by `persistFinalActivityState()` inside the `scormReported`-guarded `scormPost()` flow, after final feedback calculation. The connected final order remains `reportResult()` → `applyHighestScormScore()` → `persistFinalActivityState()` → `logPostAfterFinalFeedback()` → `completeSession()`. No video gating, UI, scoring, feedback, navigation, animation, audio, timing, or unrelated lifecycle behavior changed. Browser verification was not performed; validation was limited to static tracing, syntax checking, and diff review.
- **2026-07-21 `TARGET_SCRIPT` re-audit (full `SCORM_RUNTIME_ALIGNMENT` pass against the current spec, including the two policies added since the last audit) — one gap found and fixed, rest confirmed already correct:**
  - **Rule A (duplicate final `UpdateStudentActivity` send):** re-confirmed already correct by fresh trace, not assumed from the 2026-07-20 entry. `trueAnswer()`'s guard (`if (!this.isFinalQuestionAttempt()) { this.UpdateStudentActivity(); }`, right after `this.isAllQuestionsRight();`): `isAllQuestionsRight()` only mutates `LOcorrectcounter`/`counterCorrect`/item `endTime` synchronously and schedules its `nextQuestion()` call (which mutates `counter`) inside a 5500ms-delayed `setTimeout`, so `counter` is unchanged at the guard's evaluation point — correct. `showAnswer()`'s guard (right after `this.isAllQuestionsFalse();`): `isAllQuestionsFalse()` only mutates `zokiStatus`/item/root `endTime` synchronously and schedules its `next()` call (which mutates `counter` via `nextQuestion()`) inside a 3500ms-delayed `setTimeout`, so `counter` is likewise unchanged at this guard's evaluation point — correct. No `isAllQuestionsRight()`/`isAllQuestionsFalse()`-style hidden inline `globalFunctions.UpdateStudentActivity(...)` send exists in this file (this is a single-round file; that pattern is specific to the two-round Choose family) — confirmed by reading both functions in full, no such call site exists.
  - **Rule B/C/D (terminal logging):** re-confirmed already correct. `falseAnswer()` (non-terminal, Show Answer follows) calls only `updateScormScoreAfterAnswer(...)`, no log. `showAnswer()` (true terminal for the wrong-answer path) and `trueAnswer()` (terminal for the correct-answer path) both call `logPostAfterAnswerAttempt()`, which self-suppresses via `isFinalQuestionAttempt()` on the last question (rule D).
  - **SCORM Score Decimal Precision Policy:** `normalizeScormScore()` already contains no `Math.round`/`parseInt`/bitwise coercion — clamps via `Math.max(0, ...)`/`Math.min(..., 100)` only, identical in shape to every other already-verified file's version. No change needed.
  - **SCORM Status Restoration Policy — gap found and fixed:** this file had no `restoreScormServiceStatus(post)` (flagged as an Out-of-Scope Finding in the `scorm-lo.js` status-restoration task). Added the canonical method and its `getData()` call site, identical to the other seven runtime files that already received it — see "SCORM Status Restoration Policy" and the shared "Runtime integration: `restoreScormServiceStatus(post)`" migration entry for the full behavior proof (all 10 guarantees apply identically here). **Control-flow proof specific to this file:** `window.ScormService.init()` runs synchronously at top-of-script (lines 4–11), before `new Vue(...)`; `mounted()`'s `await this.getData()` therefore always finds `getPersistedStatus()` already fully populated, with no async gap. `restoreScormServiceStatus(post)` was inserted immediately after `this.restorePersistedCmi(post, restoredPost);` and immediately before `this.initializeNumberOfAttempt(post, restoredPost);`, so it runs after `post.cmi` is both default-initialized and (if present) backend-restored, and before any question can be answered (interaction is gated behind the video-intro/`skipvideo()` start flow, itself only reachable after `mounted()` completes). The `alreadyRestored` guard means a backend-restored status (via `restorePersistedCmi`) still takes precedence when both are present.
  - **Verification:** `node --check` passed. `git diff --stat` showed 1 file changed, 17 insertions — isolated to the one new method and one new call site; no video-gating, scoring, UI, audio, animation, navigation, timing, or unrelated lifecycle behavior changed.
  - Out-of-Scope Findings: none new found in this file.
  - Browser verification: not performed — this environment has no browser/network-inspection or SCORM Cloud access. Verified by static analysis, `node --check`, `git diff` review, and control-flow tracing only.

## `2026_2027/lib-native/digital-screen_26/digital-screen-input/js/zoki.js`

- Runtime family: Digital Screen single-round input, plain (non-underscore, non-animated, non-video) variant. Already had the baseline `SCORM_RUNTIME_ALIGNMENT` pass; this migration added the CMI-restoration, final-persistence, and cumulative-time patterns.
- Question collection: `this.posts[0].items`.
- Correct-answer counter: `this.posts[0].LOcorrectcounter`, mirrored into `counterCorrect` immediately on every mutation (`start()`, `isAllQuestionsRight()`).
- Score calculation: `calculateCurrentAttemptScore()` → `(LOcorrectcounter / posts[0].numberOfquestion) * 100`.
- CMI initialization: default `cmi` object created in `getData()` when missing (`total_time: "00:00:00"` default — corrected 2026-07-19 from the legacy `"PT0H0M0S"` default; see the "Canonical default: total_time initialization" rule above).
- Persisted-CMI restoration point: `restorePersistedCmi(post, restoredPost)`, called in `getData()` immediately after the fresh post object is confirmed and before `initializeNumberOfAttempt(...)`.
- `NumberOfAttempt` initialization point: `initializeNumberOfAttempt(post, restoredPost)`, called immediately after `restorePersistedCmi`, guarded by `numberOfAttemptInitialized`.
- Cumulative time implementation: added `parseScormTimeToSeconds`/`formatSecondsToScormTime` and applied them in `scormPost()`, adding the previously-persisted `cmi.total_time` to the current session's elapsed seconds before formatting the final value.
- Per-question score-update call sites: `UpdateStudentActivity()` (covers `trueAnswer()` and `showAnswer()`), plus a direct `updateScormScoreAfterAnswer(...)` call in `falseAnswer()`.
- Final CMI finalization point: `scormPost()`, guarded by `counter >= loQuestions - 1` and `scormReported`.
- Final platform persistence point: `persistFinalActivityState()`, called from both branches of `scormPost()` immediately after `applyHighestScormScore(...)` and before `logPostAfterFinalFeedback()`.
- Cloud logging: `logScormCloudSummary()` / local logging: `logQaMetadata()`, both via the standard dispatchers.
- Additional gap found and fixed: this file's `logQaMetadata()` omitted `studentPoint` from the qaObject (present in every sibling file and required by the QA Metadata Logging Pattern) — added `studentPoint: post.studentPoint,` back into the qaObject alongside `NumberOfAttempt`.
- Verification performed: `node --check` syntax validation; diff reviewed to confirm only the CMI-restoration, final-persistence, cumulative-time, and QA-object additions were made, with no changes to question flow, transitions, audio, or DOM handling.
- **2026-07-19 `FINAL_FEEDBACK_DELAY` removal + `completeSession()` ordering fix:** a fresh audit against the `completeSession()` Canonical Rule (see Final CMI Persistence) found the same two gaps already fixed in the sibling `zoki_.js`/`zoki_video.js`/`zoki_with_animation.js`:
  1. Deleted the `const FINAL_FEEDBACK_DELAY = 1000;` declaration and simplified `scheduleFinalScormPost()` to call `this.scormPost()` directly with no `setTimeout()`.
  2. `completeSession()` was called immediately after `reportResult()`, before `applyHighestScormScore()`/`persistFinalActivityState()`/`logPostAfterFinalFeedback()`. Moved it to after those three calls, in its own guarded `try/catch`, immediately before the dead `finish()` scaffolding.

  `scormPostScheduled`/`scormReported` still guard against duplicate execution; the internal `1000`ms `setTimeout()` inside `scormPost()`'s connected branch is unrelated and untouched. No other CMI, scoring, persistence, or logging behavior changed. Verified via `node --check` (pass) and `git diff` (isolated to these two fixes).
- Remaining risk: same `parseScormTimeToSeconds` fallback-to-`0` behavior as the other migrated files for unrecognized persisted time formats. Like its siblings, this file's `completeSession()` position now diverges from the current `zoki.js` (Digital Screen Choose) reference, which still calls it in the earlier (pre-persistence) position.
- **2026-07-20 `FINAL_QUESTION_FEEDBACK_AND_TERMINAL_LOGGING_POLICY` confirmation (shared/repeatable interaction handler check):** same audit as `zoki_video.js`/`zoki_.js` applied to this file's `checkanswer()` → `trueAnswer()`/`falseAnswer()`/`showAnswer()` lifecycle. `checkanswer()` is a single Check-button click funnel with no multi-select or repeat-per-item structure; `falseAnswer()` is non-terminal and non-logging; `showAnswer()` owns the single canonical terminal log for the wrong-answer path; `trueAnswer()` owns it for the correct-answer path. Both fire exactly once per logical question. Rule D (last-question log suppression via `isFinalQuestionAttempt()`) was correctly confirmed. **The rule-A claim in this entry ("final activity update confined to `scormPost()` ... already satisfied") was incorrect and is superseded by the entry below** — it never checked what platform endpoint the per-question `UpdateStudentActivity()` method itself hit.
- **2026-07-20 correction — duplicate final `UpdateStudentActivity` send (rule A actually violated, now fixed):** per the `⚠ 2026-07-20: outstanding re-audit required` warning in the `FINAL_QUESTION_FEEDBACK_AND_TERMINAL_LOGGING_POLICY` section, this file's `trueAnswer()` and `showAnswer()` both called `this.UpdateStudentActivity()` unconditionally, including on the last question — the same duplicate-send defect confirmed by browser testing on `choose/js/zoki.js` and fixed by code tracing on the `zoki_.js` reference. Both call sites are now guarded: `if (!this.isFinalQuestionAttempt()) { this.UpdateStudentActivity(); }`, in `trueAnswer()` (after `this.result += 1;`) and in `showAnswer()` (after `this.isAllQuestionsFalse();`). Runtime tracing (identical reasoning to `zoki_.js`, since this file shares its exact architecture) confirmed no local capture of `isFinalQuestionAttempt()` was needed: `counter`/`firstQ` are not mutated synchronously by `isAllQuestionsRight()` or `isAllQuestionsFalse()` — the only mutator, `nextQuestion()`, runs later inside a separately-delayed `setTimeout` in each path. Non-final questions still call `this.UpdateStudentActivity()` exactly once, immediately; the final question now produces its platform update exactly once, exclusively via `persistFinalActivityState()` inside `scormPost()`'s `scormReported`-guarded branch. Finalization order confirmed unchanged: `reportResult()` → `applyHighestScormScore()` → `persistFinalActivityState()` → `logPostAfterFinalFeedback()` → `completeSession()`. Verified via `node --check` (pass) and grep audit of every `this.UpdateStudentActivity()`/`globalFunctions.UpdateStudentActivity`/`persistFinalActivityState()`/`isFinalQuestionAttempt()`/`scheduleFinalScormPost()`/`logPostAfterFinalFeedback()` occurrence — every remaining call site accounted for and correctly scoped. **This fix was already present in the file (applied outside this session's own edit history) when this `TARGET_SCRIPT` audit began; this entry documents independent verification of that fix, not its authorship.** Browser verification: not performed — this environment has no browser/network-inspection tool; verified by static analysis and code tracing only.

- **2026-07-20 correction — duplicate final `UpdateStudentActivity` send:** the earlier rule-A confirmation was incorrect because it checked the named final helper without tracing the per-question `UpdateStudentActivity()` method to the same `globalFunctions.UpdateStudentActivity(...)` platform endpoint used by `persistFinalActivityState()`. Both question-terminal paths (`trueAnswer()` and the wrong-answer `showAnswer()` path) called it unconditionally, causing the last question to persist once immediately and again after final feedback. Both per-question calls are now guarded by `if (!this.isFinalQuestionAttempt())`, preserving one immediate update for every non-final terminal question while making final persistence the exclusive responsibility of `persistFinalActivityState()` inside the `scormReported`-guarded final flow. `falseAnswer()` remains non-terminal and continues only its direct score synchronization; `showAnswer()` remains the sole terminal owner for the wrong-answer path. The existing guard inside `logPostAfterAnswerAttempt()` continues to suppress the ordinary final-question log. Final connected ordering remains `reportResult()` → `applyHighestScormScore()` → `persistFinalActivityState()` → `logPostAfterFinalFeedback()` → `completeSession()`. No scoring, feedback, UI, DOM, transition, navigation, audio, timing, or unrelated Input lifecycle behavior changed. Browser verification was not performed; validation was limited to static lifecycle tracing, syntax checking, and diff review.
- **2026-07-21 `TARGET_SCRIPT` re-audit (batch invocation, full `SCORM_RUNTIME_ALIGNMENT` pass) — one gap found and fixed, rest re-confirmed already correct:** re-traced Rule A/B/C/D fresh (not assumed from the entries above) — both guards' `isFinalQuestionAttempt()` evaluation points are unaffected by any synchronous `counter` mutation (`nextQuestion()` is the only `counter` mutator and always runs inside a later delayed `setTimeout` in both `trueAnswer()`'s and `showAnswer()`'s paths); `falseAnswer()` correctly omits the log; no hidden `isAllQuestionsRight()`-style inline `globalFunctions.UpdateStudentActivity` send exists (single-round file). `normalizeScormScore()` already contains no integer-rounding operation (Decimal Precision Policy). **Gap found and fixed:** this file had no `restoreScormServiceStatus(post)` (Status Restoration Policy). Added the canonical method and its `getData()` call site, identical to the other now-nine runtime files that have it — `ScormService.init()` runs synchronously before `new Vue(...)`, so `getPersistedStatus()` is fully populated before `mounted()`'s `await this.getData()` runs; the call sits after `post.cmi` init/backend-restoration and before any question can be answered. `node --check` passed; `git diff --stat` showed 1 file, 17 insertions, isolated. Browser verification: not performed.

## `2026_2027/lib-native/digital-screen_26/digital-screen-tworound-input-choose/js/zoki_.js`

- Runtime family: Digital Screen two-round input-then-choose (`digital-screen-tworound-input-choose`). Already had the baseline `SCORM_RUNTIME_ALIGNMENT` pass, including its own correct `scormCompletionReady` latch; this migration added the CMI-restoration, final-persistence, and cumulative-time patterns.
- Question collection: `this.posts[0].items`.
- Correct-answer counter: `this.posts[0].LOcorrectcounter`, mirrored into `counterCorrect` immediately on every mutation (`start()`, `isAllQuestionsRight()`, `trueAnswerInput()`), `+= 0.5` partial credit per round preserved unchanged.
- Score calculation: `calculateCurrentAttemptScore()` → `(LOcorrectcounter / posts[0].numberOfquestion) * 100`.
- CMI initialization: default `cmi` object created in `getData()` when missing (`total_time: "00:00:00"` default — corrected 2026-07-19 from the legacy `"PT0H0M0S"` default; see the "Canonical default: total_time initialization" rule above).
- Persisted-CMI restoration point: `restorePersistedCmi(post, restoredPost)`, called in `getData()` immediately after the fresh post object is confirmed and before `initializeNumberOfAttempt(...)`.
- `NumberOfAttempt` initialization point: `initializeNumberOfAttempt(post, restoredPost)`, called immediately after `restorePersistedCmi`, guarded by `numberOfAttemptInitialized`.
- Cumulative time implementation: added `parseScormTimeToSeconds`/`formatSecondsToScormTime` and applied them in `scormPost()`, adding the previously-persisted `cmi.total_time` to the current session's elapsed seconds before formatting the final value.
- Per-question score-update call sites: `UpdateStudentActivity()` (covers `showAnswer()`, `trueAnswerInput()`, `trueAnswerChoose()`, `falseAnswerChoose()`), plus a direct `updateScormScoreAfterAnswer(...)` call in `falseAnswerInput()` (a round-1 wrong-answer path that does not route through `UpdateStudentActivity()`).
- Final CMI finalization point: `scormPost()`, guarded by `this.scormCompletionReady || (firstQ == loQuestions && roundTwo)` and `scormReported` — the pre-existing latch was left completely untouched.
- Final platform persistence point: `persistFinalActivityState()`, called from both branches of `scormPost()` immediately after `applyHighestScormScore(...)` and before `logPostAfterFinalFeedback()`.
- Cloud logging: `logScormCloudSummary()` / local logging: `logQaMetadata()`, both via the standard dispatchers.
- Intentional differences from Digital Screen Choose: two-round input-then-choose flow (`checkanswer()` → `trueAnswerInput()`/`falseAnswerInput()` for round 1, `checkChoose()` → `trueAnswerChoose()`/`falseAnswerChoose()` for round 2), `0.5` partial credit per round preserved exactly, `roundTwo`/`typeChoose`/`correctChoose` state untouched.
- Verification performed: `node --check` syntax validation; diff reviewed and grepped for `roundTwo|typeChoose|correctChoose|checkChoose|arrayanswer|scormCompletionReady|firstQ|loQuestions` against removed lines — zero matches, confirming the two-round architecture and its latch were not touched.
- **2026-07-19 `FINAL_FEEDBACK_DELAY` removal + `completeSession()` ordering fix:** a fresh audit against the `completeSession()` Canonical Rule (see Final CMI Persistence) found the same two gaps already fixed across the `digital-screen-input` family:
  1. Deleted the `const FINAL_FEEDBACK_DELAY = 1000;` declaration and simplified `scheduleFinalScormPost()` to call `this.scormPost()` directly with no `setTimeout()`, preserving the `scormCompletionReady = true;` line unchanged.
  2. `completeSession()` was called immediately after `reportResult()`, before `applyHighestScormScore()`/`persistFinalActivityState()`/`logPostAfterFinalFeedback()`. Moved it to after those three calls, in its own guarded `try/catch`, immediately before the dead `finish()` scaffolding.

  The pre-existing `scormCompletionReady` latch, `scormPostScheduled`/`scormReported` duplicate-execution guards, and the two-round input/choose architecture were untouched. Verified via `node --check` (pass) and `git diff` (isolated to these two fixes).
- Remaining risk: same `parseScormTimeToSeconds` fallback-to-`0` behavior as the other migrated files for unrecognized persisted time formats. This file's `completeSession()` position now diverges from the current `zoki.js` (Digital Screen Choose) reference, which still calls it in the earlier (pre-persistence) position.
- **2026-07-20 `FINAL_QUESTION_FEEDBACK_AND_TERMINAL_LOGGING_POLICY` audit (rule B/D only — superseded below for rule A):** re-audited against the "Shared/repeatable interaction handlers" subsection. Round 1 (input): `trueAnswerInput()` always terminal, logs; `falseAnswerInput()` non-terminal (Show Answer follows), does not log; `showAnswer()` is the true round-1 terminal state and owns the log. Round 2 (choose): `checkChoose()` (external helper in `2026_2027/js/choose.js`) disables further clicks via `pointer-events:none` synchronously on first click, so it is single-fire per round, not a repeatable multi-select handler; `trueAnswerChoose()`/`falseAnswerChoose()` are each their own terminal state (no Show Answer step in round 2) and both correctly log once. No multi-fire-before-terminal condition found in either round. Rule D (`isFinalQuestionAttempt() = firstQ == loQuestions && roundTwo` correctly distinguishes the round-1-of-last-item boundary from the true overall-last-question) and `completeSession()` ordering re-confirmed correct. **This entry's rule-A claim was not actually traced against the `UpdateStudentActivity()` platform endpoint and has been superseded — see the 2026-07-20 control-flow verification entry immediately below.**
- **2026-07-20 control-flow verification (rule A) — full trace, no code change required:** re-opened this file specifically to check whether it has the duplicate-final-`UpdateStudentActivity`-send defect confirmed on `choose/js/zoki.js` and `digital-screen-input/js/zoki_.js`. Found `trueAnswerChoose()`/`falseAnswerChoose()` **already guarded** (`if (!this.isFinalQuestionAttempt()) { this.UpdateStudentActivity(); }`, present before this audit began — not authored by this pass) and `showAnswer()`/`trueAnswerInput()` (round 1) **unguarded**. Traced both categories to confirm correctness rather than assuming it either way:
  - **Round-2 guards (`trueAnswerChoose()`, `falseAnswerChoose()`):** execute synchronously inside `checkChoose()`, before any of that function's own `setTimeout`s fire. At that point `firstQ` reflects the current item (last mutated by `nextQuestion()`, which only runs once per item, from the *previous* item's round-2 completion) and `roundTwo` is already `true` (set by round 1's own trailing 3000ms-delayed callback for *this* item, which has necessarily already fired since round 2 is now interactable). Nothing between the last mutation of either variable and the guard's evaluation touches them. `nextQuestion()` — the next mutator of `firstQ`/`roundTwo` — only runs later, inside `isAllQuestionsRight()`/`isAllQuestionsFalse()`'s own delayed callback, itself invoked later in these same functions' bodies, after the guard has already executed. On the last item, `firstQ == loQuestions && roundTwo === true` at evaluation time → guard correctly suppresses the send. On any other item, `firstQ != loQuestions` → guard correctly allows it. **Confirmed correct as written.**
  - **Round-1 calls (`showAnswer()` line ~1128, `trueAnswerInput()` line ~1154):** verified these do **not** need a guard, rather than assuming they're fine because they weren't flagged. `isFinalQuestionAttempt()` requires `roundTwo === true`. `roundTwo` is unconditionally reset to `false` by `nextQuestion()` at the start of every item, and the *only* code that ever sets it back to `true` is the trailing delayed `setTimeout` inside these same two functions — which has not fired yet at the point their own synchronous `UpdateStudentActivity()` call executes (it fires strictly after, following a further 3000ms delay). Therefore `roundTwo` is provably `false` at both call sites for every item without exception, `isFinalQuestionAttempt()` would evaluate `false` there 100% of the time, and adding a guard would be a permanent no-op. These calls represent legitimate per-round intermediate persistence for round 1 of *every* item (final or not) — architecturally incapable of coinciding with the true final send, which can only ever be scheduled from round 2's completion of the last item. **No change needed.**
  - **Final path re-confirmed:** `persistFinalActivityState()` unguarded (correct — reachable only via `scormPost()`'s `isActivityComplete && !scormReported` gate); `isActivityComplete`'s `firstQ == loQuestions && roundTwo` and `scormCompletionReady` are both derived from `finalizeFeedback = this.isFinalQuestionAttempt()`, captured in `isAllQuestionsRight()`/`isAllQuestionsFalse()`'s delayed callbacks **before** their own call to `nextQuestion()` — correct pre-mutation capture, unchanged. `completeSession()` ordering re-confirmed: `reportResult()` → `applyHighestScormScore()` → `persistFinalActivityState()` → `logPostAfterFinalFeedback()` → `completeSession()`, both branches.
  - **Files modified: none.** `node --check` re-run (pass, no diff). `git status --short` confirmed zero uncommitted changes for this file both before and after this audit. Browser verification: not performed — this environment has no browser/network-inspection tool; verified by static analysis and code tracing only.

- **2026-07-21 `TARGET_SCRIPT` re-audit (batch invocation) — Rule A/B/C/D re-confirmed correct by fresh trace, decimal precision already compliant, one gap found and fixed (Status Restoration Policy):** re-traced every `UpdateStudentActivity`/`globalFunctions.UpdateStudentActivity` call site from scratch rather than trusting the entries above — arrived at the identical conclusions independently: round-1 (`showAnswer()`, `trueAnswerInput()`) unguarded calls are provably safe since `roundTwo` is always `false` at their synchronous evaluation point (its only mutator is each function's own later-delayed `setTimeout`); round-2 (`trueAnswerChoose()`, `falseAnswerChoose()`) and `isAllQuestionsRight()`'s inline send are correctly guarded. `normalizeScormScore()` contains no integer-rounding operation. **Gap found and fixed:** this file had no `restoreScormServiceStatus(post)`. Added the canonical method and its `getData()` call site, identical to the other now-ten runtime files that have it — `ScormService.init()` runs synchronously before `new Vue(...)`, so `getPersistedStatus()` is fully populated before `mounted()`'s `await this.getData()` runs; the call sits after `post.cmi` init/backend-restoration and before any question can be answered, and does not touch `roundTwo`/`firstQ`/any two-round state. `node --check` passed; `git diff --stat` showed 1 file, 19 insertions/1 deletion total (includes this session's earlier `isAllQuestionsRight()` fix plus this addition), isolated to SCORM/status concerns. Browser verification: not performed.

- **2026-07-20 correction — duplicate final persistence in round two:** the earlier rule-A/D audit correctly identified `isFinalQuestionAttempt()` as `firstQ == loQuestions && roundTwo`, but it did not trace all per-round `UpdateStudentActivity()` calls to the same platform endpoint used by `persistFinalActivityState()`. The round-one calls in `trueAnswerInput()` and `showAnswer()` remain intentionally unchanged: even on the last item, `roundTwo` is still false, the overall activity is not complete, and those calls persist the legitimate round-one terminal state. The actual duplicate occurred only in the round-two terminal handlers, where both `trueAnswerChoose()` and `falseAnswerChoose()` called `UpdateStudentActivity()` on the final item before the final-feedback flow called `persistFinalActivityState()` again. Those two calls are now guarded by `if (!this.isFinalQuestionAttempt())`. Non-final round-two items still persist immediately; the final round-two item now persists exclusively through `persistFinalActivityState()` inside the `scormCompletionReady`/`scormReported`-guarded `scormPost()` flow. The existing `logPostAfterAnswerAttempt()` guard continues to suppress only the true final round-two log, without suppressing the last item's round-one log. Wrong-answer ownership remains unchanged: `falseAnswerInput()` is non-terminal and score-sync-only until `showAnswer()`, while `falseAnswerChoose()` is terminal because round two has no Show Answer step. Final connected ordering remains `reportResult()` → `applyHighestScormScore()` → `persistFinalActivityState()` → `logPostAfterFinalFeedback()` → `completeSession()`. Partial-credit scoring, `roundTwo`, `scormCompletionReady`, choose/input behavior, UI, audio, timing, navigation, and transitions were preserved. Browser verification was not performed; validation was limited to static two-round lifecycle tracing, syntax checking, and diff review.
- **2026-07-20 second correction — a *separate* unguarded send inside `isAllQuestionsRight()` was missed by both entries above:** discovered while auditing the sibling `zoki_choose_input.js` (same folder) under the mandatory control-flow-verification standard — the previous entry's claim that "the final round-two item now persists exclusively through `persistFinalActivityState()`" was incomplete. `isAllQuestionsRight()` (round-two-correct completion, called from `trueAnswerChoose()` immediately after `trueAnswerChoose()`'s own now-guarded `UpdateStudentActivity()` call) contains its *own*, entirely separate inline send: `direction != "" ? (...field assignments..., globalFunctions.UpdateStudentActivity(this.activityId, this.posts[0])) : ""`. This inline call was never guarded — guarding `trueAnswerChoose()`'s own `UpdateStudentActivity()` call did not protect it, since it is a different call site inside a different function that `trueAnswerChoose()` happens to invoke synchronously afterward. **Trace:** at the point this inline call executes (inside `isAllQuestionsRight()`, reached synchronously from `trueAnswerChoose()`, before `isAllQuestionsRight()`'s own delayed `setTimeout`s fire), `firstQ`/`roundTwo` hold the exact same values already established correct at `trueAnswerChoose()`'s own guard moments earlier — nothing between the two mutates them. So on the final item's round-two-correct completion, this inline call fired unguarded, sending a second (now-stale, pre-final-status) copy of the post immediately before `persistFinalActivityState()` sent the finalized one. **Fix:** changed the ternary's final comma-expression member from `globalFunctions.UpdateStudentActivity(this.activityId, this.posts[0])` to `!this.isFinalQuestionAttempt() && globalFunctions.UpdateStudentActivity(this.activityId, this.posts[0])`, using `&&` short-circuit to gate only the send while leaving the preceding field assignments (`title`, `bloomLevels`, `learningObjectives`, `loDegree`, `keywords`, `type`, `unitId`) unconditional and unchanged — minimal, style-consistent with the existing comma-expression, no restructuring into an `if` block. Verified via `node --check` (pass) and `git diff` (isolated to this one line). **Lesson for future audits of this codebase:** a guard on a method's own `UpdateStudentActivity()`/`globalFunctions.UpdateStudentActivity` call does not guarantee every reachable platform-send call site in functions it subsequently calls is also guarded — each call site must be independently traced to its actual endpoint, not assumed safe by association with an already-fixed sibling call.

## `2026_2027/lib-native/digital-screen_26/digital-screen-tworound-input-choose/js/zoki_choose_input.js`

- Runtime family: Digital Screen two-round choose-then-input (reverse-order sibling of `zoki_.js` in the same folder — round 1 is choose via `checkanswer()`'s else-branch using `choosecounter`/`number_checked`, or `checkChoose()`; round 2 is input via `checkanswer()`'s `roundTwo`-branch). Already had the baseline `SCORM_RUNTIME_ALIGNMENT` pass, including its own correct `scormCompletionReady` latch; this migration added the CMI-restoration, final-persistence, and cumulative-time patterns.
- Question collection: `this.posts[0].items`.
- Correct-answer counter: `this.posts[0].LOcorrectcounter`, mirrored into `counterCorrect` immediately on every mutation (`start()`, `isAllQuestionsRight()`, `trueAnswerChoose()`), `+= 0.5` partial credit per round preserved unchanged.
- Score calculation: `calculateCurrentAttemptScore()` → `(LOcorrectcounter / posts[0].numberOfquestion) * 100`.
- CMI initialization: default `cmi` object created in `getData()` when missing (`total_time: "00:00:00"` default — corrected 2026-07-19 from the legacy `"PT0H0M0S"` default; see the "Canonical default: total_time initialization" rule above).
- Persisted-CMI restoration point: `restorePersistedCmi(post, restoredPost)`, called in `getData()` immediately after the fresh post object is confirmed and before `initializeNumberOfAttempt(...)`.
- `NumberOfAttempt` initialization point: `initializeNumberOfAttempt(post, restoredPost)`, called immediately after `restorePersistedCmi`, guarded by `numberOfAttemptInitialized`.
- Cumulative time implementation: added `parseScormTimeToSeconds`/`formatSecondsToScormTime` and applied them in `scormPost()`, adding the previously-persisted `cmi.total_time` to the current session's elapsed seconds before formatting the final value.
- Per-question score-update call sites: `UpdateStudentActivity()` (covers `showAnswer()`, `falseAnswerInput()`, `trueAnswerChoose()`), plus direct `updateScormScoreAfterAnswer(...)` calls in `trueAnswerInput()` and `falseAnswerChoose()` (paths that do not route through `UpdateStudentActivity()`).
- Final CMI finalization point: `scormPost()`, guarded by `this.scormCompletionReady || (firstQ == loQuestions && roundTwo)` and `scormReported` — the pre-existing latch was left completely untouched.
- Final platform persistence point: `persistFinalActivityState()`, called from both branches of `scormPost()` immediately after `applyHighestScormScore(...)` and before `logPostAfterFinalFeedback()`.
- Cloud logging: `logScormCloudSummary()` / local logging: `logQaMetadata()`, both via the standard dispatchers.
- Intentional differences from Digital Screen Choose and from the input-then-choose sibling: reverse round order (choose first, input second), `choosecounter`/`number_checked`/`getSlicePath()`/`multipleChoose()` pie-slice-selection state and math untouched, `0.5` partial credit per round preserved exactly.
- Verification performed: `node --check` syntax validation; diff reviewed and grepped for `roundTwo|typeChoose|correctChoose|checkChoose|multipleChoose|choosecounter|getSlicePath|arrayanswer|scormCompletionReady|firstQ|loQuestions` against removed lines — zero matches, confirming the two-round architecture and its latch were not touched.
- **2026-07-19 `FINAL_FEEDBACK_DELAY` removal + `completeSession()` ordering fix:** the same two gaps found and fixed in the sibling `zoki_.js` (this folder) and across the `digital-screen-input` family:
  1. Deleted the `const FINAL_FEEDBACK_DELAY = 1000;` declaration and simplified `scheduleFinalScormPost()` to call `this.scormPost()` directly with no `setTimeout()`, preserving the `scormCompletionReady = true;` line unchanged.
  2. `completeSession()` was called immediately after `reportResult()`, before `applyHighestScormScore()`/`persistFinalActivityState()`/`logPostAfterFinalFeedback()`. Moved it to after those three calls, in its own guarded `try/catch`, immediately before the dead `finish()` scaffolding.

  The pre-existing `scormCompletionReady` latch, duplicate-execution guards, and the choose-then-input architecture (`choosecounter`, `getSlicePath()`, `multipleChoose()`) were untouched. Verified via `node --check` (pass) and `git diff` (isolated to these two fixes).
- Remaining risk: same `parseScormTimeToSeconds` fallback-to-`0` behavior as the other migrated files for unrecognized persisted time formats. This file's `completeSession()` position now diverges from the current `zoki.js` (Digital Screen Choose) reference, which still calls it in the earlier (pre-persistence) position.
- **2026-07-20 `FINAL_QUESTION_FEEDBACK_AND_TERMINAL_LOGGING_POLICY` application (rule C violation found and fixed):** this file's round-1 (choose) wrong-answer path violated canonical rule C. `falseAnswerChoose()` enables the Show Answer button (non-terminal — Show Answer always follows a wrong round-1 choose answer in this reverse-order, choose-then-input runtime), but also called `this.logPostAfterAnswerAttempt();` unconditionally. The shared `showAnswer()` handler (used for both rounds' wrong-then-shown path, branching internally on `this.roundTwo`) also logs unconditionally at its top — so a wrong round-1 choose answer produced two canonical logs instead of one: `falseAnswerChoose()` → first log, `showAnswer()` → second log. Fix: removed the trailing `this.logPostAfterAnswerAttempt();` from `falseAnswerChoose()`; the existing `this.updateScormScoreAfterAnswer(this.calculateCurrentAttemptScore());` score-sync call was left untouched (rule C permits non-terminal handlers to keep updating score/attempt state, just not log). Round 2 (input) and the correct-round-1 path (`trueAnswerChoose()`, always terminal) were already correct and unchanged. **The rule-A claim in this entry ("Rule A/D ... re-confirmed already correct, unaffected by this fix") was not actually traced against the `UpdateStudentActivity()` platform endpoint and has been retracted — see the 2026-07-20 control-flow verification entry below, which found and fixed three genuine rule-A gaps in this exact file.** Verification: `node --check` (pass); `git diff` reviewed and confirmed isolated to the single-line removal in `falseAnswerChoose()` — no scoring, answer-evaluation, transition, audio, DOM, or unrelated SCORM/persistence behavior changed. Browser verification not performed — static analysis, syntax check, and diff review only.
- **2026-07-20 control-flow verification (rule A) — three gaps found and fixed:** re-opened this file under the mandatory control-flow-verification standard to check for the duplicate-final-`UpdateStudentActivity`-send defect already confirmed and fixed on `choose/js/zoki.js`, `digital-screen-input/js/zoki_.js`, and (this same day) the sibling `zoki_.js` in this folder. Traced every `this.UpdateStudentActivity()`/`globalFunctions.UpdateStudentActivity` call site individually rather than assuming correctness from the presence of *any* guard:
  - **`showAnswer()` (line ~1177) — gap found and fixed.** This handler is shared across both rounds' wrong-then-shown path, branching internally on the *current* value of `this.roundTwo` read at the top of the function. `this.UpdateStudentActivity()` was called unconditionally, before that branch. **Trace:** when entered from round 1 (choose wrong → Show Answer), `this.roundTwo` is still `false` at this point (round 1 is, by construction, the phase before `roundTwo` is ever set `true` for the current item), so `isFinalQuestionAttempt()` (`firstQ == loQuestions && roundTwo`) is `false` regardless of `firstQ` — this call was always safe in that scenario. When entered from round 2 (input wrong → Show Answer, the file's actual `roundTwo === true` phase and — via the function's own `if (this.roundTwo)` branch — the path that calls `nextQuestion()`/`scheduleFinalScormPost()`), `roundTwo` is already `true` and, on the last item, `firstQ` already equals `loQuestions` (last set by the previous item's `nextQuestion()` call; nothing in `showAnswer()`'s own body before this point touches `firstQ`) — so `isFinalQuestionAttempt()` evaluates `true` here, and the unconditional call sent prematurely, duplicating the later `persistFinalActivityState()` send. **Fix:** wrapped the call in `if (!this.isFinalQuestionAttempt()) { this.UpdateStudentActivity(); }`. Because the guard reads the same `roundTwo`/`firstQ` state the function's own subsequent `if (this.roundTwo)` branch and `finalizeFeedback` capture already rely on (all evaluated before any mutation — `roundTwo`'s only mutator here is the function's own 3000ms-delayed `setTimeout`, and `nextQuestion()`'s mutations happen only inside the 3500ms-delayed callback further down), no local capture was needed — a direct guard is correct and self-adapts to whichever round the function was entered from.
  - **`falseAnswerInput()` (line ~1248) — gap found and fixed, different in kind from the other two.** This is the non-terminal round-2 wrong-answer handler (Show Answer always follows — the direct round-2 analogue of the round-1 `falseAnswerChoose()` rule-C fix above). It called the *full* `this.UpdateStudentActivity()` (score-sync **and** platform send) instead of the narrower `this.updateScormScoreAfterAnswer(this.calculateCurrentAttemptScore())` that this file's own `falseAnswerChoose()` and the analogous handler in every other already-verified file in this codebase use for non-terminal wrong-answer paths. Per rule C, a non-terminal handler may keep updating score/attempt state but must not perform the platform send that belongs to the terminal handler — here, `showAnswer()` sends moments later for the exact same event, so this was a genuine duplicate send on *every* round-2 wrong-then-shown answer, not only on the final question (compounding into three total sends — this call, `showAnswer()`'s, and `persistFinalActivityState()` — specifically on the final item's round-2-wrong-then-shown path). **Fix:** replaced `this.UpdateStudentActivity();` with `this.updateScormScoreAfterAnswer(this.calculateCurrentAttemptScore());`, matching this file's own `falseAnswerChoose()` pattern exactly. No guard was needed once the full send was removed — `updateScormScoreAfterAnswer()` never reaches `globalFunctions.UpdateStudentActivity`.
  - **`isAllQuestionsRight()`'s inline `globalFunctions.UpdateStudentActivity(...)` (in the `direction != "" ? (...) : ""` ternary) — gap found and fixed, identical in shape to the one found the same pass in the sibling `zoki_.js`.** Reached from `trueAnswerInput()` (round-2-correct, the file's other true terminal path alongside `showAnswer()`'s round-2 branch), this inline send is a separate call site from any guarded `UpdateStudentActivity()` call and was unguarded. **Trace:** `trueAnswerInput()` calls `isAllQuestionsRight()` synchronously; at that point `roundTwo` is already `true` (round 2 is active) and `firstQ` reflects the current item unchanged since the last `nextQuestion()` — so on the last item this inline call fired unguarded, sending a second, pre-final-status copy of the post. **Fix:** changed the ternary's final comma-expression member to `!this.isFinalQuestionAttempt() && globalFunctions.UpdateStudentActivity(this.activityId, this.posts[0])`, leaving the preceding field assignments unconditional, matching the fix applied to the sibling `zoki_.js` this same pass.
  - **Confirmed safe without a guard, by trace, not by assumption:** `trueAnswerChoose()`'s own `this.UpdateStudentActivity()` call (round-1/choose-correct) — only reachable from `checkanswer()`'s `else` branch, itself only taken while `roundTwo === false`, and nothing in `trueAnswerChoose()` before that call touches `roundTwo`; `isFinalQuestionAttempt()` is therefore provably `false` there for every item. No change made.
  - **Final path re-confirmed unaffected:** `persistFinalActivityState()` unguarded (correct); finalization order `reportResult()` → `applyHighestScormScore()` → `persistFinalActivityState()` → `logPostAfterFinalFeedback()` → `completeSession()` unchanged in both branches of `scormPost()`.
  - **Files modified:** this file, plus the sibling `digital-screen-tworound-input-choose/js/zoki_.js` (the `isAllQuestionsRight()` inline-send gap was discovered here and found to apply identically there — see that file's own corrected entry above). `node --check` pass on both. `git diff` reviewed and confirmed isolated to the three changes described above (`showAnswer()`'s guard, `falseAnswerInput()`'s method swap, `isAllQuestionsRight()`'s guarded ternary member) — no scoring, UI, audio, animation, navigation, timing, or feedback behavior changed. Browser verification: not performed — this environment has no browser/network-inspection tool; verified by static analysis and code tracing only.
- **2026-07-21 re-audit under Strict Target Scope + Control Flow Verification (no changes needed):** re-opened as the explicit `TARGET_SCRIPT` and re-traced every platform-send call site from scratch (not relying on the 2026-07-20 entry's conclusions):
  - `showAnswer()`'s guard (line ~1178, `if (!this.isFinalQuestionAttempt()) { this.UpdateStudentActivity(); }`): re-confirmed present and correctly positioned before any synchronous mutation of `firstQ`/`roundTwo` — `roundTwo`'s only mutator in this function is its own 3000ms-delayed `setTimeout` (line ~1183) and `nextQuestion()`'s `firstQ` increment happens only inside the 3500ms-delayed callback further down, so the guard reads pre-mutation state in both the round-1-entry and round-2-entry cases traced in the 2026-07-20 entry above.
  - `falseAnswerInput()` (line ~1247): re-confirmed it calls only `this.updateScormScoreAfterAnswer(this.calculateCurrentAttemptScore())`, not the full `UpdateStudentActivity()` — matches the 2026-07-20 fix, no regression.
  - `isAllQuestionsRight()`'s inline ternary member (line ~642-643): re-confirmed `!this.isFinalQuestionAttempt() && globalFunctions.UpdateStudentActivity(...)` is in place, reached only from `trueAnswerInput()` (round-2, `roundTwo` already `true` and unmutated between `checkanswer()`'s dispatch and this call).
  - `trueAnswerChoose()`'s unconditional `this.UpdateStudentActivity()` (line ~1326): re-confirmed safe without a guard — only reachable from `checkanswer()`'s `else` branch (itself gated on `roundTwo === false` at entry), and nothing between that dispatch and this call mutates `roundTwo`, so `isFinalQuestionAttempt()` is provably `false` at every invocation regardless of `firstQ`.
  - `isAllQuestionsFalse()` (called from `falseAnswerInput()`): re-confirmed it contains no `globalFunctions.UpdateStudentActivity`/`UpdateStudentActivity()` call of its own — no hidden inline-send gap of the kind found in `isAllQuestionsRight()`.
  - `logPostAfterAnswerAttempt()` self-guards via `isFinalQuestionAttempt()` (rule D); `falseAnswerChoose()` correctly omits the log (rule C, per the 2026-07-20 fix) while still calling `updateScormScoreAfterAnswer(...)`.
  - **Outcome:** zero defects found; zero lines changed in this file this pass. `git status --short` and `node --check` reconfirmed the file matches the 2026-07-20 fixed state exactly, uncommitted. This entry exists to record that the mandatory control-flow re-trace was performed (not skipped) on the current `TARGET_SCRIPT`, per the standing Control Flow Verification policy — a repeat audit of an already-fixed file is not assumed correct without re-tracing.
- **2026-07-21 SCORM status restoration:** added `restoreScormServiceStatus(post)` + its `getData()` call site — see "SCORM Status Restoration Policy" above and the shared "Runtime integration: `restoreScormServiceStatus(post)`" migration entry near the end of this section for the full trace.
- **2026-07-21 batch `TARGET_SCRIPT` re-audit (no changes):** re-opened as part of a 4-file batch invocation; both the Rule A/B/C/D re-trace above and the Status Restoration addition are already current and complete for this file (verified by reading the full file fresh — `restoreScormServiceStatus(post)` present and called from `getData()`, all guards intact). Zero changes made this pass. `node --check`/`git status` reconfirmed no drift.

## `2026_2027/lib-native/digital-screen_26/digital-screen-tworound-input-choose/js/zoki.js`

- Runtime family: Digital Screen two-round input-then-choose, plain (non-underscore) variant — third sibling in this folder alongside `zoki_.js` and `zoki_choose_input.js`. Already had the baseline `SCORM_RUNTIME_ALIGNMENT` pass, including its own correct `scormCompletionReady` latch; this migration added the CMI-restoration, final-persistence, and cumulative-time patterns.
- Question collection: `this.posts[0].items`.
- Correct-answer counter: `this.posts[0].LOcorrectcounter`, mirrored into `counterCorrect` immediately on every mutation (`start()`, `isAllQuestionsRight()`, `trueAnswerInput()`), `+= 0.5` partial credit per round preserved unchanged.
- Score calculation: `calculateCurrentAttemptScore()` → `(LOcorrectcounter / posts[0].numberOfquestion) * 100`.
- CMI initialization: default `cmi` object created in `getData()` when missing (`total_time: "00:00:00"` default — corrected 2026-07-19 from the legacy `"PT0H0M0S"` default; see the "Canonical default: total_time initialization" rule above).
- Persisted-CMI restoration point: `restorePersistedCmi(post, restoredPost)`, called in `getData()` immediately after the fresh post object is confirmed and before `initializeNumberOfAttempt(...)`.
- `NumberOfAttempt` initialization point: `initializeNumberOfAttempt(post, restoredPost)`, called immediately after `restorePersistedCmi`, guarded by `numberOfAttemptInitialized`.
- Cumulative time implementation: added `parseScormTimeToSeconds`/`formatSecondsToScormTime` and applied them in `scormPost()`, adding the previously-persisted `cmi.total_time` to the current session's elapsed seconds before formatting the final value.
- Per-question score-update call sites: `UpdateStudentActivity()` (covers `showAnswer()`, `trueAnswerInput()`, `falseAnswerChoose()`), plus direct `updateScormScoreAfterAnswer(...)` calls in `isAllQuestionsRight()` (called by `trueAnswerChoose()`) and `falseAnswerInput()`.
- Final CMI finalization point: `scormPost()`, guarded by `this.scormCompletionReady || (firstQ == loQuestions && roundTwo)` and `scormReported` — the pre-existing latch was left completely untouched.
- Final platform persistence point: `persistFinalActivityState()`, called from both branches of `scormPost()` immediately after `applyHighestScormScore(...)` and before `logPostAfterFinalFeedback()`.
- Cloud logging: `logScormCloudSummary()` / local logging: `logQaMetadata()`, both via the standard dispatchers.
- Intentional differences from Digital Screen Choose: two-round input-then-choose flow identical in shape to `zoki_.js`, `0.5` partial credit per round preserved exactly.
- Verification performed: `node --check` syntax validation; diff reviewed and grepped for `roundTwo|typeChoose|correctChoose|checkChoose|arrayanswer|scormCompletionReady|firstQ|loQuestions` against removed lines — zero matches, confirming the two-round architecture and its latch were not touched.
- **2026-07-19 `FINAL_FEEDBACK_DELAY` removal + `completeSession()` ordering fix:** the same two gaps found and fixed in the sibling `zoki_.js`/`zoki_choose_input.js` (this folder) and across the `digital-screen-input` family:
  1. Deleted the `const FINAL_FEEDBACK_DELAY = 1000;` declaration and simplified `scheduleFinalScormPost()` to call `this.scormPost()` directly with no `setTimeout()`, preserving the `scormCompletionReady = true;` line unchanged.
  2. `completeSession()` was called immediately after `reportResult()`, before `applyHighestScormScore()`/`persistFinalActivityState()`/`logPostAfterFinalFeedback()`. Moved it to after those three calls, in its own guarded `try/catch`, immediately before the dead `finish()` scaffolding.

  The pre-existing `scormCompletionReady` latch, duplicate-execution guards, and the two-round architecture were untouched. Verified via `node --check` (pass) and `git diff` (isolated to these two fixes).
- Remaining risk: same `parseScormTimeToSeconds` fallback-to-`0` behavior as the other migrated files for unrecognized persisted time formats. This file's `completeSession()` position now diverges from the current `zoki.js` (Digital Screen Choose) reference, which still calls it in the earlier (pre-persistence) position.
- **2026-07-20 `FINAL_QUESTION_FEEDBACK_AND_TERMINAL_LOGGING_POLICY` application (rule C violation found and fixed):** mirrors the bug found in the sibling `zoki_choose_input.js`, but on the input side of this input-then-choose runtime. `falseAnswerInput()` (round 1, input) enables the Show Answer button (non-terminal), but also called `this.logPostAfterAnswerAttempt();` unconditionally; the round-1-only `showAnswer()` handler also logs unconditionally — producing two canonical logs instead of one for a wrong round-1 input answer. Fix: removed the trailing `this.logPostAfterAnswerAttempt();` from `falseAnswerInput()` (confirmed via `git diff`: single-line removal at the end of the method, immediately before `checkChoose(event, answer) {`); the existing `this.updateScormScoreAfterAnswer(this.calculateCurrentAttemptScore());` call was left untouched. Round 2 (choose): `falseAnswerChoose()` has no Show Answer step (auto-resolves via `isAllQuestionsFalse()`), so its unconditional log is correct per rule C's no-Show-Answer exception, and `trueAnswerChoose()` (always terminal) was already correct — both unchanged. Rule A/D and `completeSession()` ordering re-confirmed already correct, unaffected. Verification: `node --check` (pass); `git diff` reviewed and confirmed isolated to the single-line removal in `falseAnswerInput()`. Browser verification not performed.

- **2026-07-20 correction — duplicate final persistence in round two:** the earlier rule-A/D conclusion was incomplete because this plain variant has two differently shaped round-two persistence paths. `falseAnswerChoose()` called the per-question `UpdateStudentActivity()` method, while the correct path reached `globalFunctions.UpdateStudentActivity(...)` directly inside `isAllQuestionsRight()` after applying its `0.5` score increment and intermediate SCORM score sync. Both writes reached the same platform endpoint later used by `persistFinalActivityState()`, so either correct or wrong completion of the final round-two item produced a premature platform write followed by final persistence. The wrong-path call and only the direct platform-write block in `isAllQuestionsRight()` are now guarded by `if (!this.isFinalQuestionAttempt())`; the correct path's `LOcorrectcounter`/`counterCorrect` mutation and `updateScormScoreAfterAnswer(...)` remain unconditional and unchanged. Round-one `showAnswer()`/`trueAnswerInput()` persistence remains intentionally active, including on the last item, because `roundTwo` is false and overall completion has not occurred. Non-final round-two items also continue to persist immediately. Final persistence is now exclusively owned by `persistFinalActivityState()` inside the `scormCompletionReady`/`scormReported`-guarded final flow. Existing final-question ordinary-log suppression remains intact. `falseAnswerInput()` remains non-terminal and score-sync-only until Show Answer; `falseAnswerChoose()` remains terminal because round two has no Show Answer step. Final connected ordering remains `reportResult()` → `applyHighestScormScore()` → `persistFinalActivityState()` → `logPostAfterFinalFeedback()` → `completeSession()`. Partial-credit scoring, two-round state, feedback, UI, audio, transitions, timing, navigation, and completion latch behavior were preserved. Browser verification was not performed; validation was limited to static two-round lifecycle tracing, syntax checking, and diff review.
- **2026-07-21 batch `TARGET_SCRIPT` re-audit — Rule A/B/C/D re-confirmed correct by fresh trace, one gap found and fixed (Status Restoration Policy):** this was the one file in the family not yet directly re-opened this session; read in full and re-traced independently. Confirmed: `showAnswer()`'s and `trueAnswerInput()`'s unguarded `this.UpdateStudentActivity()` calls (round 1) are safe because `roundTwo` is provably `false` at their synchronous evaluation point (its only mutator is each function's own later-delayed `setTimeout`, and round 2's UI/handlers — `checkChoose()`/`trueAnswerChoose()`/`falseAnswerChoose()` — are only reachable after that transition fires); `falseAnswerChoose()`'s guard and `isAllQuestionsRight()`'s guarded inline block (line ~638, `if (!this.isFinalQuestionAttempt()) { ... globalFunctions.UpdateStudentActivity(...) }`) are correctly gated and are the *only* platform-send call sites reached from `trueAnswerChoose()` (unlike the sibling `zoki_.js`, this file's `trueAnswerChoose()` has no separate direct `UpdateStudentActivity()` call of its own — score sync is delegated entirely to `isAllQuestionsRight()`). `falseAnswerInput()` correctly omits the log. `normalizeScormScore()` contains no integer-rounding operation. **Gap found and fixed:** this file had no `restoreScormServiceStatus(post)`. Added the canonical method and its `getData()` call site, identical to the other files that already have it. `node --check` passed; `git diff --stat` showed 1 file, 17 insertions, isolated. Browser verification: not performed.

## `2026_2027/lib-native/digital-screen_26/digital-screen-tworound-inputs/js/zoki_.js`

- Runtime family: Digital Screen two-round input-input (`digital-screen-tworound-inputs`, distinct from `digital-screen-tworound-input-choose`) — two rounds of input questions via `roundNum` (1 → 2), driven by `trueAnswerInput()`/`falseAnswerInput()` (round 1) and `trueAnswerInputRoundTwo()`/`falseAnswerInputRoundTwo()` (round 2). Had a baseline `SCORM_RUNTIME_ALIGNMENT` pass (guarded `ScormService` init, `scormCompletionReady` latch, highest-score preservation, `completeSession()` present) but, unlike its sibling folders, had never received the CMI-restoration, final-persistence, or cumulative-time patterns — this was a fuller migration than the delay/ordering-only fixes applied elsewhere in this family.
- Question collection: `this.posts[0].items`.
- Correct-answer counter: `this.posts[0].LOcorrectcounter`, mirrored into `counterCorrect` immediately on every mutation (`start()`, `trueAnswerInput()`), `+= 0.5` partial credit per round preserved unchanged.
- Score calculation: `calculateCurrentAttemptScore()` → `(LOcorrectcounter / posts[0].numberOfquestion) * 100`.
- CMI initialization: default `cmi` object created in `getData()` when missing (`total_time: "00:00:00"` default — corrected 2026-07-19 from the legacy `"PT0H0M0S"` default; see the "Canonical default: total_time initialization" rule above).
- **Gap found and fixed: `restorePersistedCmi()` did not exist in this file at all** — neither the helper nor any call site. Added the canonical helper (identical to the sibling folders) and called it in `getData()` immediately after the fresh post object is confirmed and before `initializeNumberOfAttempt(...)`.
- **Gap found and fixed: `persistFinalActivityState()` did not exist in this file at all** — `scormPost()` applied the final highest score/status locally but never re-persisted the finalized post to the platform. Added the canonical guarded helper and called it from both branches of `scormPost()`, immediately after `applyHighestScormScore(...)` and before `logPostAfterFinalFeedback()`.
- **Gap found and fixed: no cumulative time pattern** — `scormPost()` wrote `total_time` via the non-cumulative `msToScormTime(Date.now() - this.scormStartTime)` (recomputes from this session's start, discarding any previously-persisted total). Added `parseScormTimeToSeconds`/`formatSecondsToScormTime` and applied them to add the previously-persisted `cmi.total_time` (now restored by the newly-added `restorePersistedCmi`) to the current session's elapsed seconds before formatting the final value. `msToScormTime` remains defined but is superseded at the final-completion call site.
- **`FINAL_FEEDBACK_DELAY` removal:** deleted the `const FINAL_FEEDBACK_DELAY = 1000;` declaration and simplified `scheduleFinalScormPost()` to call `this.scormPost()` directly with no `setTimeout()`, preserving the `scormCompletionReady = true;` line unchanged, matching the policy applied across the rest of this family.
- **`completeSession()` ordering fix:** was called immediately after `reportResult()`, before `applyHighestScormScore()`/`persistFinalActivityState()`/`logPostAfterFinalFeedback()`. Moved to after those three calls, in its own guarded `try/catch`, immediately before the dead `finish()` scaffolding, per the `completeSession()` Canonical Rule.
- Final CMI finalization point: `scormPost()`, guarded by `this.scormCompletionReady || (firstQ == loQuestions && roundTwo)` and `scormReported` — the pre-existing latch was left completely untouched.
- Cloud logging: `logScormCloudSummary()` / local logging: `logQaMetadata()`, both via the standard dispatchers — pre-existing, unchanged.
- Intentional differences from the input-then-choose sibling folder: both rounds are input questions (no `checkChoose()`/choose UI); round-2 completion routes through `trueAnswerInputRoundTwo()`/`falseAnswerInputRoundTwo()` rather than `trueAnswerChoose()`/`falseAnswerChoose()`; `checkInputALL`/`maxLength` are called with `this.isEng, this.upper` extra arguments (unlike the plain `zoki.js` sibling in this same folder, which omits them) — pre-existing, file-specific, left untouched.
- Additional pre-existing, harmless quirks left untouched (not SCORM/metadata concerns): the dead `finish()` scaffolding has an empty `if` body with no `setTimeout`/comment (`if (typeof window.ScormService.finish === "function") { }`), and the `beforeunload` handler's connected-branch body is entirely empty — both already satisfy the no-`finish()`-call policy, just with different inert formatting than the reference.
- Verification performed: `node --check` syntax validation; `git diff` reviewed and confirmed the additions are isolated to the new `restorePersistedCmi`/`formatSecondsToScormTime`/`parseScormTimeToSeconds`/`persistFinalActivityState` helpers, their call sites, the `FINAL_FEEDBACK_DELAY` removal, and the `completeSession()` relocation — no changes to the two-round input flow, `roundNum` state machine, transitions, or audio handling.
- Remaining risk: same `parseScormTimeToSeconds` fallback-to-`0` behavior as the other migrated files for unrecognized persisted time formats. This file's `completeSession()` position now diverges from the current `zoki.js` (Digital Screen Choose) reference, which still calls it in the earlier (pre-persistence) position.
- **2026-07-20 `FINAL_QUESTION_FEEDBACK_AND_TERMINAL_LOGGING_POLICY` audit (no change):** re-audited against the "Shared/repeatable interaction handlers" subsection. Both rounds are input-type, distinguished by `roundNum` (1→2): `trueAnswerInput()`/`trueAnswerInputRoundTwo()` always terminal and log; `falseAnswerInput()`/`falseAnswerInputRoundTwo()` correctly omit the log (Show Answer follows), calling only the score-sync helper; the shared `showAnswer()` handler owns the single terminal log for whichever round is active (branches internally on `this.roundNum`/`this.roundTwo`), firing exactly once per round. No multi-fire-before-terminal condition found. Rule A/D and `completeSession()` ordering re-confirmed already correct. No source change required. `node --check` re-run (pass, no changes).

- **2026-07-20 correction — duplicate final persistence in round-two input paths:** the earlier rule-A/D audit correctly identified the terminal handlers but did not trace their per-question `UpdateStudentActivity()` calls to the same platform endpoint used by `persistFinalActivityState()`. On a correct round-two answer, `trueAnswerInputRoundTwo()` routes through `isAllQuestionsRight()`, which called `UpdateStudentActivity()` unconditionally. On a wrong round-two answer, `falseAnswerInputRoundTwo()` remains non-terminal and score-sync-only, but the subsequent shared `showAnswer()` terminal handler also called `UpdateStudentActivity()` unconditionally. Both calls therefore produced a premature platform write on the final round-two item before final feedback persisted the finalized state again. The call in `isAllQuestionsRight()` and the shared call in `showAnswer()` are now guarded by `if (!this.isFinalQuestionAttempt())`. Because the helper requires both `firstQ == loQuestions` and `roundTwo`, the shared Show Answer call remains active for round one (including round one of the last item) and for all non-final round-two items. `trueAnswerInput()` round-one persistence is unchanged. Final persistence is now exclusively owned by `persistFinalActivityState()` inside the `scormCompletionReady`/`scormReported`-guarded final flow. The existing `logPostAfterAnswerAttempt()` guard suppresses only the true final round-two log; round-one terminal logs remain intact. Wrong-answer terminal ownership remains correct in both rounds: the false handlers only expose Show Answer and synchronize score, while `showAnswer()` owns the canonical terminal action. Final connected ordering remains `reportResult()` → `applyHighestScormScore()` → `persistFinalActivityState()` → `logPostAfterFinalFeedback()` → `completeSession()`. Partial-credit scoring, `roundNum`/`roundTwo`, feedback, UI, timing, audio, transitions, navigation, and completion latch behavior were preserved. Browser verification was not performed; validation was limited to static two-round lifecycle tracing, syntax checking, and diff review.

- **2026-07-21 `TARGET_SCRIPT` re-audit (full `SCORM_RUNTIME_ALIGNMENT` pass, including the Decimal Precision and Status Restoration policies) — one gap found and fixed, rest confirmed already correct:**
  - **Rule A:** re-confirmed by fresh trace. `persistFinalActivityState()` is called exactly once, inside `scormPost()`'s `isActivityComplete && !this.scormReported` block, with `this.scormReported = true` set as the first synchronous statement in that block — no later branch can re-enter. The per-question `UpdateStudentActivity()` calls in `isAllQuestionsRight()` and `showAnswer()` are both guarded by `if (!this.isFinalQuestionAttempt())` (from the 2026-07-20 correction above), and this guard evaluates correctly since neither call site synchronously mutates `firstQ`/`roundTwo` before the guard runs (both defer `nextQuestion()`/`roundTwo = true` to a later `setTimeout`).
  - **Rule B/C/D:** re-confirmed by independently re-tracing `trueAnswerInputRoundTwo()`: it calls `isAllQuestionsRight()` (synchronous portion only sets counters and schedules the 5500ms-delayed `nextQuestion()`/`scheduleFinalScormPost()`), then synchronously calls `logPostAfterAnswerAttempt()`. At that exact moment `firstQ`/`roundTwo` are unchanged from `isAllQuestionsRight()`'s own guard evaluation moments earlier, so `logPostAfterAnswerAttempt()`'s internal `isFinalQuestionAttempt()` check agrees and correctly self-suppresses the ordinary log on the true final question, deferring to `logPostAfterFinalFeedback()` inside `scormPost()`. `falseAnswerInputRoundTwo()` never logs (non-terminal, score-sync-only) — consistent with Rule C.
  - **Decimal Precision:** `normalizeScormScore()` contains only `Math.min(normalizedScore, 100)` — no `Math.round()`/`parseInt()`/bitwise truncation. Already compliant.
  - **Gap found and fixed (Status Restoration Policy):** this file had no `restoreScormServiceStatus(post)` method or call site — a SCORM-Cloud relaunch with no backend `learningObjectAsJson` would never learn a previously-saved terminal status. Added the canonical method (defined immediately after `restorePersistedCmi()`) and its call site in `getData()` between `restorePersistedCmi(post, restoredPost)` and `initializeNumberOfAttempt(post, restoredPost)`. Full canonical implementation and behavior proof documented once under "Runtime integration: `restoreScormServiceStatus(post)`" below.
  - Verification performed: `node --check` (pass); `git diff --stat` confirmed 1 file, 17 insertions, isolated to the new method + call site. Browser verification: not performed (no browser tool available in this environment).

## `2026_2027/lib-native/digital-screen_26/digital-screen-tworound-inputs/js/zoki.js`

- Runtime family: Digital Screen two-round input-input, plain (non-underscore) sibling of `zoki_.js` in this same folder — architecturally identical (same `roundNum` state machine, same `trueAnswerInput()`/`falseAnswerInput()`/`trueAnswerInputRoundTwo()`/`falseAnswerInputRoundTwo()` flow). Had the same gaps as `zoki_.js`: no `restorePersistedCmi()`, no `persistFinalActivityState()`, no cumulative time pattern, plus the same `FINAL_FEEDBACK_DELAY`/`completeSession()`-ordering issues found across this family.
- Question collection: `this.posts[0].items`.
- Correct-answer counter: `this.posts[0].LOcorrectcounter`, mirrored into `counterCorrect` immediately on every mutation (`start()`, `trueAnswerInput()`), `+= 0.5` partial credit per round preserved unchanged.
- Score calculation: `calculateCurrentAttemptScore()` → `(LOcorrectcounter / posts[0].numberOfquestion) * 100`.
- CMI initialization: default `cmi` object created in `getData()` when missing (`total_time: "00:00:00"` default — corrected 2026-07-19 from the legacy `"PT0H0M0S"` default; see the "Canonical default: total_time initialization" rule above).
- Gap found and fixed (identical to `zoki_.js`): added `restorePersistedCmi()` helper and call site in `getData()` (immediately after the fresh post object is confirmed, before `initializeNumberOfAttempt(...)`), added `persistFinalActivityState()` helper and call sites in both branches of `scormPost()`, and added the cumulative time pattern (`parseScormTimeToSeconds`/`formatSecondsToScormTime`) replacing the non-cumulative `msToScormTime(Date.now() - this.scormStartTime)` write.
- `FINAL_FEEDBACK_DELAY` removed; `scheduleFinalScormPost()` now calls `this.scormPost()` directly (preserving `scormCompletionReady = true;`).
- `completeSession()` moved to after `applyHighestScormScore()`/`persistFinalActivityState()`/`logPostAfterFinalFeedback()`, per the canonical rule.
- Final CMI finalization point: `scormPost()`, guarded by `this.scormCompletionReady || (firstQ == loQuestions && roundTwo)` and `scormReported` — the pre-existing latch was left completely untouched.
- Cloud logging: `logScormCloudSummary()` / local logging: `logQaMetadata()`, both via the standard dispatchers — pre-existing, unchanged.
- Intentional differences from `zoki_.js`: `checkInputALL(this.activeQuestion, this.roundNum)` and `maxLength(event, this.activeQuestion, this.roundNum)` omit the `isEng`/`upper` arguments that `zoki_.js` passes — pre-existing, file-specific, left untouched.
- Same harmless pre-existing quirks as `zoki_.js` (empty dead `finish()` scaffolding, empty `beforeunload` body) left untouched — already satisfy the no-`finish()`-call policy.
- Verification performed: `node --check` syntax validation; `git diff` reviewed and confirmed the additions mirror `zoki_.js` exactly, isolated to the same four helpers/call sites plus the `FINAL_FEEDBACK_DELAY`/`completeSession()` fixes — no changes to the two-round input flow or `roundNum` state machine.
- Remaining risk: same `parseScormTimeToSeconds` fallback-to-`0` behavior as the other migrated files for unrecognized persisted time formats. This file's `completeSession()` position now diverges from the current `zoki.js` (Digital Screen Choose) reference, which still calls it in the earlier (pre-persistence) position.
- **2026-07-20 `FINAL_QUESTION_FEEDBACK_AND_TERMINAL_LOGGING_POLICY` audit (no change):** architecturally identical to `zoki_.js` in this folder — verified independently, same conclusion: `falseAnswerInput()`/`falseAnswerInputRoundTwo()` correctly omit the log, the shared `showAnswer()` owns the single terminal log per round, `trueAnswerInput()`/`trueAnswerInputRoundTwo()` log correctly (always terminal). No multi-fire-before-terminal condition found. Rule A/D and `completeSession()` ordering already correct. No source change required. `node --check` re-run (pass, no changes).

- **2026-07-20 correction — duplicate final persistence in round-two input paths:** the earlier rule-A/D audit identified the correct terminal ownership but did not trace the `UpdateStudentActivity()` calls in those terminal paths to the same platform endpoint used later by `persistFinalActivityState()`. The correct round-two path (`trueAnswerInputRoundTwo()` → `isAllQuestionsRight()`) and the wrong round-two path (`falseAnswerInputRoundTwo()` → shared `showAnswer()`) each persisted the final item before the final-feedback flow persisted it again. The calls inside `isAllQuestionsRight()` and `showAnswer()` are now guarded by `if (!this.isFinalQuestionAttempt())`. Since the helper requires `firstQ == loQuestions && roundTwo`, round-one persistence—including round one of the last item—and all non-final round-two updates remain unchanged. `trueAnswerInput()` retains its round-one update. The false handlers remain non-terminal and score-sync-only; shared Show Answer remains their terminal owner. Final persistence is now exclusively owned by `persistFinalActivityState()` inside the `scormCompletionReady`/`scormReported`-guarded flow, while the existing logging guard suppresses only the true final round-two ordinary log. Final connected ordering remains `reportResult()` → `applyHighestScormScore()` → `persistFinalActivityState()` → `logPostAfterFinalFeedback()` → `completeSession()`. Partial-credit scoring, `roundNum`/`roundTwo`, feedback, UI, timing, audio, transitions, navigation, and completion latch behavior were preserved. Browser verification was not performed; validation was limited to static two-round lifecycle tracing, syntax checking, and diff review.

- **2026-07-21 `TARGET_SCRIPT` re-audit (full `SCORM_RUNTIME_ALIGNMENT` pass, including the Decimal Precision and Status Restoration policies) — one gap found and fixed, rest confirmed already correct:** architecturally identical to `zoki_.js` in this same folder — verified independently, same conclusions:
  - **Rule A:** `persistFinalActivityState()` called exactly once inside `scormPost()`'s `isActivityComplete && !this.scormReported` block (latch set first). Per-question `UpdateStudentActivity()` calls in `isAllQuestionsRight()`/`showAnswer()` correctly guarded by `if (!this.isFinalQuestionAttempt())`, evaluated before either call site's deferred `counter`/`roundTwo` mutation.
  - **Rule B/C/D:** `trueAnswerInputRoundTwo()` → `isAllQuestionsRight()` (synchronous part only) → `logPostAfterAnswerAttempt()`, all evaluated against the same unchanged `firstQ`/`roundTwo` values, so the terminal case correctly self-suppresses. `falseAnswerInputRoundTwo()` never logs.
  - **Decimal Precision:** `normalizeScormScore()` uses only `Math.min(normalizedScore, 100)` — compliant, no change.
  - **Gap found and fixed (Status Restoration Policy):** no `restoreScormServiceStatus(post)` existed. Added the canonical method after `restorePersistedCmi()` and its call site in `getData()` between `restorePersistedCmi(post, restoredPost)` and `initializeNumberOfAttempt(post, restoredPost)`. See the shared cross-file entry "Runtime integration: `restoreScormServiceStatus(post)`" below for the full implementation and behavior proof.
  - Verification performed: `node --check` (pass); `git diff --stat` confirmed 1 file, 17 insertions, isolated to the new method + call site. Browser verification: not performed.

## `2026_2027/lib-native/digital-screen_26/digital-screen-input/js/zoki_with_animation.js`

- Runtime family: Digital Screen single-round input, animation-enhanced variant (`items_original` pre-shuffle snapshot, per-item `originalIndex`, `window.ArrowAnimation.init()/goTo()/play()`, `activeQuestion.holdTime`-delayed callbacks). Already had the baseline `SCORM_RUNTIME_ALIGNMENT` pass; this migration added the CMI-restoration, final-persistence, and cumulative-time patterns.
- Question collection: `this.posts[0].items`.
- Correct-answer counter: `this.posts[0].LOcorrectcounter`, mirrored into `counterCorrect` immediately on every mutation (`start()`, `isAllQuestionsRight()`).
- Score calculation: `calculateCurrentAttemptScore()` → `(LOcorrectcounter / posts[0].numberOfquestion) * 100`.
- CMI initialization: default `cmi` object created in `getData()` when missing (`total_time: "00:00:00"` default — corrected 2026-07-19 from the legacy `"PT0H0M0S"` default; see the "Canonical default: total_time initialization" rule above).
- Persisted-CMI restoration point: `restorePersistedCmi(post, restoredPost)`, called in `getData()` immediately after the fresh post object is confirmed and before `initializeNumberOfAttempt(...)`.
- `NumberOfAttempt` initialization point: `initializeNumberOfAttempt(post, restoredPost)`, called immediately after `restorePersistedCmi`, guarded by `numberOfAttemptInitialized`.
- Cumulative time implementation: added `parseScormTimeToSeconds`/`formatSecondsToScormTime` and applied them in `scormPost()`, adding the previously-persisted `cmi.total_time` to the current session's elapsed seconds before formatting the final value.
- Per-question score-update call sites: `UpdateStudentActivity()` (covers `trueAnswer()` and the `holdTime`-delayed `showAnswer()` callback), plus a direct `updateScormScoreAfterAnswer(...)` call in `falseAnswer()`.
- Final CMI finalization point: `scormPost()`, guarded by `counter >= loQuestions - 1` and `scormReported`.
- Final platform persistence point: `persistFinalActivityState()`, called from both branches of `scormPost()` immediately after `applyHighestScormScore(...)` and before `logPostAfterFinalFeedback()`.
- Cloud logging: `logScormCloudSummary()` / local logging: `logQaMetadata()`, both via the standard dispatchers.
- Intentional differences from Digital Screen Choose: all animation-specific logic (`items_original`, `originalIndex`, `window.ArrowAnimation.init()/goTo()/play()` calls, `activeQuestion.holdTime`-delayed `setTimeout` callbacks in `checkanswer()` and `showAnswer()`) was preserved exactly; the new SCORM calls were inserted inside the existing `holdTime`-delayed callbacks rather than disturbing their timing.
- Verification performed: `node --check` syntax validation; diff reviewed and grepped for `ArrowAnimation|originalIndex|holdTime|items_original` against removed lines — zero matches, confirming the animation logic was not touched.
- **2026-07-19 `FINAL_FEEDBACK_DELAY` removal + `completeSession()` ordering fix:** a fresh audit against the `completeSession()` Canonical Rule (see Final CMI Persistence) found the same two gaps already fixed in the sibling `zoki_.js`/`zoki_video.js`:
  1. Deleted the `const FINAL_FEEDBACK_DELAY = 1000;` declaration and simplified `scheduleFinalScormPost()` to call `this.scormPost()` directly with no `setTimeout()`.
  2. `completeSession()` was called immediately after `reportResult()`, before `applyHighestScormScore()`/`persistFinalActivityState()`/`logPostAfterFinalFeedback()`. Moved it to after those three calls, in its own guarded `try/catch`, immediately before the dead `finish()` scaffolding.

  `scormPostScheduled`/`scormReported` still guard against duplicate execution; the internal `1000`ms `setTimeout()` inside `scormPost()`'s connected branch is unrelated and untouched. No animation logic, CMI, scoring, persistence, or logging behavior changed. Verified via `node --check` (pass) and `git diff` (isolated to these two fixes).
- Remaining risk: same `parseScormTimeToSeconds` fallback-to-`0` behavior as the other migrated files for unrecognized persisted time formats. Like `zoki_.js`/`zoki_video.js`, this file's `completeSession()` position now diverges from the current `zoki.js` reference, which still calls it in the earlier (pre-persistence) position.
- **2026-07-20 `FINAL_QUESTION_FEEDBACK_AND_TERMINAL_LOGGING_POLICY` confirmation (shared/repeatable interaction handler check):** audited `checkanswer()` → `trueAnswer()`/`falseAnswer()`/`showAnswer()` against the "Shared/repeatable interaction handlers" subsection, accounting for this file's `holdTime`-delayed `setTimeout` wrapping around the terminal calls (`checkanswer()`'s success branch schedules `trueAnswer()` after `this.activeQuestion.holdTime`; `showAnswer()` schedules its own terminal block, including `logPostAfterAnswerAttempt()`, after the same delay). The delay changes *when* the terminal call fires, not *how many times* — `trueAnswer()` and `showAnswer()` each still execute exactly once per logical question, consistent with the file's existing "Per-question score-update call sites" migration note. `falseAnswer()` remains non-terminal and non-logging. Rule A (final activity update confined to `scormPost()`/`isActivityComplete`) and rule D (last-question suppression via `isFinalQuestionAttempt()`) were already satisfied. No source change was required this pass; the animation/`holdTime` timing was not touched. `node --check` re-run (pass, no changes). Analysis-only.

- **2026-07-20 correction — duplicate final `UpdateStudentActivity` send:** the earlier rule-A confirmation was incorrect because it did not trace the per-question `UpdateStudentActivity()` method to the same `globalFunctions.UpdateStudentActivity(...)` endpoint used by `persistFinalActivityState()`. Both terminal paths persisted the last question prematurely: `trueAnswer()` did so after its existing `holdTime` delay, and `showAnswer()` did so inside its own `holdTime`-delayed terminal callback. Both calls are now guarded with `if (!this.isFinalQuestionAttempt())`, preserving exactly one immediate platform update for each non-final terminal question while leaving final persistence exclusively to `persistFinalActivityState()` after final feedback. The guard remains inside the existing Show Answer callback; `isAllQuestionsFalse()` does not synchronously advance `counter` because its `next()` call is separately delayed, so the helper still evaluates the terminal question index correctly without changing animation timing. `falseAnswer()` remains the non-terminal wrong-attempt owner and continues only its direct score synchronization; `showAnswer()` remains the wrong-path terminal owner. Ordinary final-question logging remains suppressed by the existing guard inside `logPostAfterAnswerAttempt()`. The connected final order remains `reportResult()` → `applyHighestScormScore()` → `persistFinalActivityState()` → `logPostAfterFinalFeedback()` → `completeSession()`. All `ArrowAnimation`, `originalIndex`, `holdTime`, UI, scoring, feedback, navigation, audio, and transition behavior was preserved. Browser verification was not performed; validation was limited to static lifecycle tracing, syntax checking, and diff review.
- **2026-07-21 `TARGET_SCRIPT` re-audit (full `SCORM_RUNTIME_ALIGNMENT` pass against the current spec, including the two policies added since the last audit) — one gap found and fixed, rest confirmed already correct:**
  - **Rule A:** re-confirmed by fresh trace (not assumed from the 2026-07-20 entry). `trueAnswer()`'s guard: `isAllQuestionsRight()` only mutates `LOcorrectcounter`/`counterCorrect`/item `endTime` synchronously; its `nextQuestion()` call (the only `counter` mutator) is inside a 5500ms-delayed `setTimeout`, so `counter` is unchanged at the guard's evaluation point. `showAnswer()`'s guard: the entire block (`isAllQuestionsFalse()` call, the guard, and `logPostAfterAnswerAttempt()`) is wrapped in a single `this.activeQuestion.holdTime`-delayed `setTimeout`; within that callback, `isAllQuestionsFalse()` runs synchronously and only schedules its own `next()`/`nextQuestion()` call inside a further 3500ms-delayed `setTimeout`, so `counter` is still unchanged when the guard evaluates immediately afterward in the same synchronous tick. No hidden `isAllQuestionsRight()`-style inline `globalFunctions.UpdateStudentActivity(...)` send exists in this file (single-round file; confirmed by reading `isAllQuestionsRight()` in full).
  - **Rule B/C/D:** re-confirmed already correct — `falseAnswer()` (non-terminal) omits the log; `trueAnswer()`/`showAnswer()` (terminal) call `logPostAfterAnswerAttempt()`, self-suppressed on the last question via `isFinalQuestionAttempt()`.
  - **SCORM Score Decimal Precision Policy:** `normalizeScormScore()` already contains no integer-rounding operation; no change needed.
  - **SCORM Status Restoration Policy — gap found and fixed:** this file had no `restoreScormServiceStatus(post)` (flagged as an Out-of-Scope Finding in the `scorm-lo.js` status-restoration task). Added the canonical method and its `getData()` call site, identical to the other files that already received it. **Control-flow proof:** `window.ScormService.init()` runs synchronously at top-of-script, before `new Vue(...)`, so `getPersistedStatus()` is fully populated before `mounted()`'s `await this.getData()` runs, with no async gap. The call was inserted immediately after `this.restorePersistedCmi(post, restoredPost);` and before `this.initializeNumberOfAttempt(post, restoredPost);`, so it runs after `post.cmi` is default-initialized/backend-restored and before any question can be answered (interaction requires `start()`, only reachable after `mounted()` completes). The `alreadyRestored` guard means a backend-restored status still takes precedence when present. This file's `ArrowAnimation`/`originalIndex`/`holdTime` logic is untouched by this addition — the new call site sits entirely inside `getData()`, before any animation-related code runs.
  - **Verification:** `node --check` passed. `git diff --stat` showed 1 file changed, 17 insertions — isolated to the one new method and one new call site.
  - Out-of-Scope Findings: none new found in this file.
  - Browser verification: not performed — this environment has no browser/network-inspection or SCORM Cloud access. Verified by static analysis, `node --check`, `git diff` review, and control-flow tracing only.

## `2026_2027/lib-native/space_26/space-input/js/main_.js`

- Runtime family: Space single-round input, sibling of `space_26/space-input/js/main.js` (byte-identical architecture). Already had the baseline `SCORM_RUNTIME_ALIGNMENT` pass; this migration added the CMI-restoration, final-persistence, and cumulative-time patterns.
- Question collection: `this.posts[0].items`.
- Correct-answer counter: `this.posts[0].LOcorrectcounter`, mirrored into `counterCorrect` immediately on every mutation (`start()`, `isAllQuestionsRight()`).
- Score calculation: `calculateCurrentAttemptScore()` → `(LOcorrectcounter / posts[0].numberOfquestion) * 100`.
- CMI initialization: default `cmi` object created in `getData()` when missing (`total_time: "00:00:00"` default — corrected 2026-07-19 from the legacy `"PT0H0M0S"` default; see the "Canonical default: total_time initialization" rule above).
- Persisted-CMI restoration point: `restorePersistedCmi(post, restoredPost)`, called in `getData()` immediately after the fresh post object is confirmed and before `initializeNumberOfAttempt(...)`.
- `NumberOfAttempt` initialization point: `initializeNumberOfAttempt(post, restoredPost)`, called immediately after `restorePersistedCmi`, guarded by `numberOfAttemptInitialized`.
- Cumulative time implementation: added `parseScormTimeToSeconds`/`formatSecondsToScormTime` and applied them in `scormPost()`, adding the previously-persisted `cmi.total_time` to the current session's elapsed seconds before formatting the final value.
- Per-question score-update call sites: `UpdateStudentActivity()` (covers `trueAnswer()`, `showAnswer()`), plus a direct `updateScormScoreAfterAnswer(...)` call in `falseAnswer()`.
- Final CMI finalization point: `scormPost()`, guarded by `scormCompletionReady || counter >= loQuestions` and `scormReported`.
- Final platform persistence point: `persistFinalActivityState()`, called from both branches of `scormPost()` immediately after `applyHighestScormScore(...)` and before `logPostAfterFinalFeedback()`.
- Cloud logging: `logScormCloudSummary()` / local logging: `logQaMetadata()`, both via the standard dispatchers.
- Intentional differences from Digital Screen Choose: same as `space-input/main.js`, `isFinalQuestionAttempt()`'s `counter >= loQuestions - 1` off-by-one convention preserved.
- Verification performed: `node --check` syntax validation; diff reviewed to confirm only the CMI-restoration, final-persistence, and cumulative-time additions were made, with no changes to question flow, transitions, audio, or DOM handling.
- **2026-07-19 `FINAL_FEEDBACK_DELAY` removal + `completeSession()` ordering fix:** the same two gaps found and fixed in the sibling `space-input/js/main.js`:
  1. Deleted the `const FINAL_FEEDBACK_DELAY = 1000;` declaration and simplified `scheduleFinalScormPost()` to call `this.scormPost()` directly with no `setTimeout()`, preserving the `scormCompletionReady = true;` line unchanged.
  2. `completeSession()` was called immediately after `reportResult()`, before `applyHighestScormScore()`/`persistFinalActivityState()`/`logPostAfterFinalFeedback()`. Moved it to after those three calls, in its own guarded `try/catch`, immediately before the dead `finish()` scaffolding.

  The pre-existing `scormCompletionReady` latch and cumulative time pattern were untouched. Verified via `node --check` (pass) and `git diff` (isolated to these two fixes).
- Remaining risk: same `parseScormTimeToSeconds` fallback-to-`0` behavior as the other migrated files for unrecognized persisted time formats. This file's `completeSession()` position now diverges from the current `zoki.js` (Digital Screen Choose) reference, which still calls it in the earlier (pre-persistence) position.
- **2026-07-20 `FINAL_QUESTION_FEEDBACK_AND_TERMINAL_LOGGING_POLICY` confirmation (shared/repeatable interaction handler audit):** identical audit and conclusion as the sibling `space-input/js/main.js` (byte-identical architecture) — `checkanswer()` is a true single-required-click terminal handler, the per-digit `changeValue()`/`maxLength()` handlers don't touch logging/`endTime`, so `INTERACTION_OCCURRED` and `QUESTION_TERMINAL_STATE` coincide and no fix was needed. Rules B/C/D and `completeSession()` ordering re-confirmed already correct. No source change required. `node --check` re-run (pass, no changes).
- **Out-of-scope observation, not fixed:** same as `space-input/js/main.js` — `finished()` fires from both `falseAnswer()` (non-terminal) and `isAllQuestionsFalse()` (terminal), i.e. twice on the wrong-then-shown path. Pre-existing, outside this pass's scope.
- **2026-07-20 `FINISHED_SINGLE_EXECUTION_AUDIT`:** identical trace and conclusion as the sibling `space-input/js/main.js` (byte-identical architecture) — `finished()` fires twice on the wrong-then-shown path (`falseAnswer()` then `isAllQuestionsFalse()` via `showAnswer()`), but has no call edge into `scormPost()`/`UpdateStudentActivity()`/`persistFinalActivityState()`/`logPostAfterFinalFeedback()`/`completeSession()`; the funnel remains protected by the synchronous `scormReported`/`scormPostScheduled` guards regardless. No genuine risk to the funnel; no source change made. `node --check` re-run (pass, no changes). Analysis-only.

- **2026-07-20 correction — duplicate final persistence in correct and Show Answer terminal paths:** the earlier rule-A/D confirmation did not trace `trueAnswer()` and `showAnswer()`'s per-question `UpdateStudentActivity()` calls to the same platform endpoint later used by `persistFinalActivityState()`. This runtime's `isFinalQuestionAttempt()` is intentionally pre-advance (`counter >= loQuestions - 1`), and both calls occur before their delayed `nextQuestion()`/`next()` transition, so the helper correctly identifies the final current item at those sites. Both calls are now guarded by `if (!this.isFinalQuestionAttempt())`. Non-final correct and wrong→Show Answer terminal paths still persist immediately; the final terminal path skips ordinary persistence and is saved exclusively by `persistFinalActivityState()` after final feedback. `falseAnswer()` remains non-terminal and score-sync-only; `showAnswer()` remains its terminal owner. The existing logging dispatcher continues to suppress the final ordinary log with the same helper. The pre-existing double `finished()` execution on wrong→Show Answer remains unchanged because it has no edge into the SCORM/final-persistence funnel. Final connected ordering remains `reportResult()` → `applyHighestScormScore()` → `persistFinalActivityState()` → `logPostAfterFinalFeedback()` → `completeSession()`. Space UI, feedback, scoring, audio, DOM, transitions, timing, navigation, and `scormCompletionReady` behavior were preserved. Browser verification was not performed; validation was limited to static lifecycle tracing, syntax checking, and diff review.

- **2026-07-20 effective-count + `QUESTION_TIMING_LIFECYCLE` migration:** retained the canonical guarded `checkQuestions()` block in synchronous post-fetch initialization and removed authored-count/root-start writes from the loading timer, so filtered `items.length` is effective before `getData()` returns and root `startTime` belongs to the current attempt at the end of data initialization. `nextQuestion()` already deactivated and activated in the correct order; its item `startTime` write is now guarded against overwrite. Correct terminal completion (`isAllQuestionsRight()`) and wrong→Show Answer terminal completion (`isAllQuestionsFalse()`) now assign only the current item's `endTime`, once. Their former root `endTime` writes were removed, as was item-end mutation from `UpdateStudentActivity()`. Root `endTime` is now assigned once inside `scormPost()`'s completion gate before highest-score application, final persistence, and final logging. Scoring, retry/Show Answer flow, duplicate-persistence guards, Space transitions, audio, navigation delays, feedback, and counters were preserved. This sibling's file-specific input helper signatures remain unchanged.

- **2026-07-20 effective-count + `QUESTION_TIMING_LIFECYCLE` migration:** the underscore Space sibling received the same lifecycle correction while preserving its own UI/input helper differences. The canonical guarded `checkQuestions()` block remains synchronous and the delayed root/count writes were removed; root `startTime` is assigned once at the end of `getData()`. Item activation remains deactivate→activate, with `startTime` now assigned only when empty. `isAllQuestionsRight()` and terminal `isAllQuestionsFalse()` each own a guarded current-item `endTime`; `UpdateStudentActivity()` no longer mutates timing, and root `endTime` is assigned once inside final `scormPost()` before final persistence/logging. Authored `numberOfquestion`, effective `loQuestions`, scoring, retry/Show Answer flow, duplicate-final-update prevention, animations, audio, navigation delays, and logging were preserved.
- **2026-07-21 SCORM status restoration:** added `restoreScormServiceStatus(post)` + its `getData()` call site — see "SCORM Status Restoration Policy" above and the shared "Runtime integration: `restoreScormServiceStatus(post)`" migration entry near the end of this section for the full trace.
- **2026-07-21 `TARGET_SCRIPT` re-audit (no changes):** re-read the full file fresh; both `UpdateStudentActivity()` guards (`trueAnswer()`, `showAnswer()`), `restoreScormServiceStatus(post)`, and the integer-free `normalizeScormScore()` are all present and correct. Zero changes made this pass.

## `2026_2027/lib-native/penguin_26/penguin-choose/js/main.js`

- Runtime family: Penguin single-round choose (`penguin_26/penguin-choose`). Already had the baseline `SCORM_RUNTIME_ALIGNMENT` pass, including its own correct `scormCompletionReady` latch; this migration added the CMI-restoration, final-persistence, and cumulative-time patterns.
- Question collection: `this.posts[0].items`.
- Correct-answer counter: `this.posts[0].LOcorrectcounter`, mirrored into `counterCorrect` immediately on the `isAllQuestionsRight()` mutation.
- Score calculation: `calculateCurrentAttemptScore()` → `(LOcorrectcounter / loQuestion) * 100` (Penguin-family variable naming: `loQuestion`, not `loQuestions`/`numberOfquestion`).
- CMI initialization: default `cmi` object created in `getData()` when missing (`total_time: "00:00:00"` default — corrected 2026-07-19 from the legacy `"PT0H0M0S"` default; see the "Canonical default: total_time initialization" rule above).
- Persisted-CMI restoration point: `restorePersistedCmi(post, restoredPost)`, called in `getData()` immediately after the fresh post object is confirmed and before `initializeNumberOfAttempt(...)`.
- `NumberOfAttempt` initialization point: `initializeNumberOfAttempt(post, restoredPost)`, called immediately after `restorePersistedCmi`, guarded by `numberOfAttemptInitialized`.
- Cumulative time implementation: added `parseScormTimeToSeconds`/`formatSecondsToScormTime` and applied them in `scormPost()`, adding the previously-persisted `cmi.total_time` to the current session's elapsed seconds before formatting the final value.
- Per-question score-update call sites: `UpdateStudentActivity()`, called unconditionally at the end of `checkChoose()` (the single answer handler covering both correct and wrong choose paths).
- Final CMI finalization point: `scormPost()`, guarded by `this.scormCompletionReady || counter >= loQuestion` and `scormReported` — the pre-existing latch was left completely untouched.
- Final platform persistence point: `persistFinalActivityState()`, called from both branches of `scormPost()` immediately after `applyHighestScormScore(...)` and before `logPostAfterFinalFeedback()`.
- Cloud logging: `logScormCloudSummary()` / local logging: `logQaMetadata()`, both via the standard dispatchers.
- Intentional differences from Digital Screen Choose: single combined `checkChoose()` answer handler (branches internally on `answer.answer` for correct/wrong) rather than separate `trueAnswer()`/`falseAnswer()` methods; `mover()`/`moverStart()` pie-transition state untouched.
- Verification performed: `node --check` syntax validation; diff reviewed and grepped for `loQuestion|counter|mover|penguinCharacter|informationLO|firstQ|typeChoose|correctChoose|selectChoose` against removed lines — zero matches, confirming the choose architecture and its latch were not touched.
- **2026-07-19 `FINAL_FEEDBACK_DELAY` removal + `completeSession()` ordering fix:** a fresh audit against the `completeSession()` Canonical Rule (see Final CMI Persistence) found the same two gaps found across the Digital Screen family:
  1. Deleted the `const FINAL_FEEDBACK_DELAY = 1000;` declaration and simplified `scheduleFinalScormPost()` to call `this.scormPost()` directly with no `setTimeout()`, preserving the `scormCompletionReady = true;` line unchanged.
  2. `completeSession()` was called immediately after `reportResult()`, before `applyHighestScormScore()`/`persistFinalActivityState()`/`logPostAfterFinalFeedback()`. Moved it to after those three calls, in its own guarded `try/catch`, immediately before the dead `finish()` scaffolding.

  The pre-existing `scormCompletionReady` latch and the single combined `checkChoose()` answer handler were untouched. Verified via `node --check` (pass) and `git diff` (isolated to these two fixes).
- Remaining risk: same `parseScormTimeToSeconds` fallback-to-`0` behavior as the other migrated files for unrecognized persisted time formats. This file's `completeSession()` position now diverges from the current `zoki.js` (Digital Screen Choose) reference, which still calls it in the earlier (pre-persistence) position.
- **2026-07-20 `FINAL_QUESTION_FEEDBACK_AND_TERMINAL_LOGGING_POLICY` confirmation (shared/repeatable interaction handler check):** audited `checkChoose(event, answer)`, the single click handler bound to every option in each item's `choose` array. Confirmed each `choose` array in the runtime JSON contains exactly one `answer: true` entry (single-select), so `INTERACTION_OCCURRED` and `QUESTION_TERMINAL_STATE` coincide per the policy's single-required-click exception — unlike the multi-select `chechedClicked()` bug in the `digital-screen_26/choose/js/zoki.js` reference. The handler additionally self-disables `pointer-events` on all choose elements at its own end (re-enabled only by `mover()` for the next question), so it cannot re-enter for the same question. The unconditional `this.UpdateStudentActivity(); this.logPostAfterAnswerAttempt();` pair at the end of `checkChoose()` therefore already fires exactly once per logical question — no gating was required. Rule A/D already satisfied: `isFinalQuestionAttempt()` (`counter >= loQuestion`) correctly suppresses the last question's normal log, and `persistFinalActivityState()` is reachable only through `scormPost()` ← `scheduleFinalScormPost()`, called after `nextQuestion()` has already set `this.question = true` (`OVERALL_FINAL_FEEDBACK` active), never directly from `checkChoose()`/`isAllQuestionsRight()`. No source change was required this pass. `node --check` re-run (pass, no changes). Analysis-only.
- **2026-07-20 `FINISHED_SINGLE_EXECUTION_AUDIT`:** traced every `finished()`/`this.finished()` call site from scratch, independent of the `space_26/space-input` family's confirmed (but funnel-harmless) double-fire pattern — this file does **not** exhibit that pattern. This file has no `falseAnswer()`, `showAnswer()`, or `isAllQuestionsFalse()` methods — its only answer-completion handler is the single combined `checkChoose(event, answer)`, which branches internally on `answer.answer`. `finished()` is called from exactly two places: `isAllQuestionsRight()` (reached only from `checkChoose()`'s correct-answer `if` branch) and `checkChoose()`'s own wrong-answer `else` branch — the two mutually exclusive arms of one `if`/`else` inside a single handler, never both for the same question. `checkChoose()` is itself single-fire per question (same self-disabling `pointer-events` mechanism verified in the entry above). `finished()` therefore executes exactly once per logical question, and the SCORM finalization funnel (already confirmed single-execution-safe via `scormReported`/`scormPostScheduled`) is unaffected. No defect found; no source change made. `node --check` re-run (pass, no changes). Analysis-only.

- **2026-07-20 correction — duplicate final persistence from the shared Choose terminal handler:** the earlier rule-A/D confirmation correctly established that `checkChoose()` is single-fire and terminal for both correct and wrong answers, but it treated its per-question `UpdateStudentActivity()` call as distinct from final persistence without tracing it to the same `globalFunctions.UpdateStudentActivity(...)` platform endpoint used by `persistFinalActivityState()`. Because `counter >= loQuestions` is already true while `checkChoose()` handles the last question, the unconditional shared call persisted that question immediately; the final-feedback flow then persisted the finalized state again. The shared call is now guarded by `if (!this.isFinalQuestionAttempt())`, so every non-final correct or wrong answer still receives exactly one immediate platform update, while the final question skips ordinary persistence and is saved exclusively through `persistFinalActivityState()` inside the `scormCompletionReady`/`scormReported`-guarded final flow. The adjacent `logPostAfterAnswerAttempt()` retains its existing internal final-question suppression. Both answer branches remain terminal, `finished()` remains exactly once per question, and the pointer-event single-fire protection remains unchanged. Final connected ordering remains `reportResult()` → `applyHighestScormScore()` → `persistFinalActivityState()` → `logPostAfterFinalFeedback()` → `completeSession()`. Penguin movement, feedback, scoring, audio, DOM, transition timing, question advancement, and completion latch behavior were preserved. Browser verification was not performed; validation was limited to static lifecycle tracing, syntax checking, and diff review.

- **2026-07-20 effective-count + `QUESTION_TIMING_LIFECYCLE` migration:** retained the canonical guarded `checkQuestions()` block in synchronous post-fetch initialization and removed the later authored-count reassignment from the loading timer, so filtered `items.length` is effective before `getData()` returns, `mounted()` shuffles, or the first question is scheduled; authored metadata remains unchanged and `loQuestions` is the effective count. Root `startTime` is now assigned once at the end of `getData()` before the first question activation, and the duplicate writes from the delayed loading callback and `closePopup()` were removed. Because this runtime activates each question inside `nextQuestion()`'s existing 3500ms callback and then advances `counter`, item `startTime` is now assigned there immediately after activation, only when empty. The single-stage terminal handler `checkChoose()` now assigns `items[counter - 1].endTime` once before either correct/wrong branch can call `finished()`, before ordinary persistence, and before logging. The previous correct-only item/root end writes in `isAllQuestionsRight()` were removed; wrong answers now receive the same lifecycle timing. Root `endTime` is assigned once inside `scormPost()`'s authoritative completion gate before highest-score application, final persistence, and final logging. Scoring, answer handling, duplicate-persistence prevention, counter semantics, the 3500/4000ms navigation timing, Penguin animation/audio, and feedback behavior were preserved.
- **2026-07-21 SCORM status restoration:** added `restoreScormServiceStatus(post)` + its `getData()` call site — see "SCORM Status Restoration Policy" above and the shared "Runtime integration: `restoreScormServiceStatus(post)`" migration entry near the end of this section for the full trace.
- **2026-07-21 batch `TARGET_SCRIPT` re-audit (no changes):** re-read the full file fresh; the guarded `checkChoose()` platform send, `restoreScormServiceStatus(post)`, and `normalizeScormScore()`'s integer-free clamp are all present and correct. Zero changes made this pass.

## `2026_2027/lib-native/penguin_26/penguin-input/js/main_.js`

- Runtime family: Penguin single-round input (`penguin_26/penguin-input`), same shape as `penguin-input/js/main.js`. Already had the baseline `SCORM_RUNTIME_ALIGNMENT` pass, including its own correct `scormCompletionReady` latch and a pre-existing duplicate `finished()` method (preserved per the duplicate-methods rule, not removed). This migration added the CMI-restoration, final-persistence, and cumulative-time patterns.
- Question collection: `this.posts[0].items`.
- Correct-answer counter: `this.posts[0].LOcorrectcounter`, mirrored into `counterCorrect` immediately on the `trueAnswer()` mutation.
- Score calculation: `calculateCurrentAttemptScore()` → `(LOcorrectcounter / loQuestion) * 100`.
- CMI initialization: default `cmi` object created in `getData()` when missing (`total_time: "00:00:00"` default — corrected 2026-07-19 from the legacy `"PT0H0M0S"` default; see the "Canonical default: total_time initialization" rule above).
- Persisted-CMI restoration point: `restorePersistedCmi(post, restoredPost)`, called in `getData()` immediately after the fresh post object is confirmed and before `initializeNumberOfAttempt(...)`.
- `NumberOfAttempt` initialization point: `initializeNumberOfAttempt(post, restoredPost)`, called immediately after `restorePersistedCmi`, guarded by `numberOfAttemptInitialized`.
- Cumulative time implementation: added `parseScormTimeToSeconds`/`formatSecondsToScormTime` and applied them in `scormPost()`, adding the previously-persisted `cmi.total_time` to the current session's elapsed seconds before formatting the final value.
- Per-question score-update call sites: `UpdateStudentActivity()` (covers `trueAnswer()`, `showAnswer()`), plus a direct `updateScormScoreAfterAnswer(...)` call in `falseAnswer()`.
- Final CMI finalization point: `scormPost()`, guarded by `scormCompletionReady || counter >= loQuestion` and `scormReported` — the pre-existing latch was left completely untouched.
- Final platform persistence point: `persistFinalActivityState()`, called from both branches of `scormPost()` immediately after `applyHighestScormScore(...)` and before `logPostAfterFinalFeedback()`.
- Cloud logging: `logScormCloudSummary()` / local logging: `logQaMetadata()`, both via the standard dispatchers.
- Intentional differences from Digital Screen Choose: same as `penguin-input/main.js` — duplicate `finished()` (object-literal shadowing) preserved rather than removed.
- Verification performed: `node --check` syntax validation; diff reviewed and grepped for `loQuestion|counter|mover|penguinCharacter|informationLO|firstQ|questionStart|border` against removed lines — zero matches, confirming the input architecture and its latch were not touched.
- **2026-07-19 `FINAL_FEEDBACK_DELAY` removal + `completeSession()` ordering fix:** the same two gaps found and fixed in `penguin-choose/js/main.js` and across the Digital Screen family:
  1. Deleted the `const FINAL_FEEDBACK_DELAY = 1000;` declaration and simplified `scheduleFinalScormPost()` to call `this.scormPost()` directly with no `setTimeout()`, preserving the `scormCompletionReady = true;` line unchanged.
  2. `completeSession()` was called immediately after `reportResult()`, before `applyHighestScormScore()`/`persistFinalActivityState()`/`logPostAfterFinalFeedback()`. Moved it to after those three calls, in its own guarded `try/catch`, immediately before the dead `finish()` scaffolding.

  The pre-existing `scormCompletionReady` latch and the preserved duplicate `finished()` method were untouched. Verified via `node --check` (pass) and `git diff` (isolated to these two fixes).
- Remaining risk: same `parseScormTimeToSeconds` fallback-to-`0` behavior as the other migrated files for unrecognized persisted time formats. This file's `completeSession()` position now diverges from the current `zoki.js` (Digital Screen Choose) reference, which still calls it in the earlier (pre-persistence) position.
- **2026-07-20 `FINAL_QUESTION_FEEDBACK_AND_TERMINAL_LOGGING_POLICY` audit (no change):** `checkInputALL()` evaluates all blanks of the current item in a single call/click and dispatches once to `trueAnswer()`/`falseAnswer()` — confirmed against the HTML template that the per-input `@change="changeValue()"` only toggles button-active styling and does not itself dispatch true/false. `falseAnswer()` correctly omits the log (Show Answer follows); `trueAnswer()`/`showAnswer()` each own the single terminal log for their path, and `counter += 1` happens before `logPostAfterAnswerAttempt()` in both, so `isFinalQuestionAttempt()` correctly suppresses the last question's normal log. No multi-fire-before-terminal condition exists. `completeSession()` ordering already correct. No source change required. `node --check` re-run (pass, no changes).

- **2026-07-20 correction — duplicate final persistence with pre-advance indexing:** the earlier lifecycle audit correctly placed terminal logging after `counter += 1`, but it did not trace the earlier per-question `UpdateStudentActivity()` calls in `trueAnswer()` and `showAnswer()` to the same platform endpoint later used by `persistFinalActivityState()`. Both calls occur *before* those handlers increment `counter`, so the existing `isFinalQuestionAttempt()` helper (`counter >= loQuestions`) is intentionally post-advance and cannot correctly guard persistence at that earlier point—the final current item still has index `loQuestions - 1`. Both per-question calls are now guarded with the pre-advance index condition `this.counter < this.loQuestions - 1`. Non-final correct and Show Answer terminal paths continue to persist immediately; the final correct or wrong→Show Answer path skips ordinary persistence and is saved exclusively by `persistFinalActivityState()` after final feedback. The handlers still increment `counter` before `logPostAfterAnswerAttempt()`, so that method's existing `isFinalQuestionAttempt()` guard remains correct and unchanged for logging. `falseAnswer()` remains non-terminal and score-sync-only. The duplicate `finished()` method definitions remain preserved per policy. Final connected ordering remains `reportResult()` → `applyHighestScormScore()` → `persistFinalActivityState()` → `logPostAfterFinalFeedback()` → `completeSession()`. Penguin movement, feedback, scoring, audio, DOM, timing, navigation, and `scormCompletionReady` behavior were preserved. Browser verification was not performed; validation was limited to static pre/post-counter lifecycle tracing, syntax checking, and diff review.
- **2026-07-21 batch `TARGET_SCRIPT` re-audit — Rule A/B/C/D re-confirmed correct by fresh trace, one gap found and fixed (Status Restoration Policy):** re-traced `trueAnswer()`/`showAnswer()`'s pre-advance `counter < loQuestions - 1` guards and `logPostAfterAnswerAttempt()`'s post-advance `isFinalQuestionAttempt()` guard independently — both correctly identify the last question from their own (pre- vs. post-`counter += 1`) vantage point, matching the entry above exactly. `falseAnswer()` correctly omits the log. `normalizeScormScore()` contains no integer-rounding operation. **Gap found and fixed:** this file had no `restoreScormServiceStatus(post)`. Added the canonical method and its `getData()` call site, identical to the other files that already have it — placed after `restorePersistedCmi` and before `initializeNumberOfAttempt`, so it runs before any question can be answered and does not interact with the `counter`-based guards above. `node --check` passed; `git diff --stat` showed 1 file, 17 insertions, isolated. Browser verification: not performed.

## `2026_2027/lib-native/penguin_26/penguin-tworound-input-choose/js/main.js`

- Runtime family: Penguin two-round input-then-choose (`penguin_26/penguin-tworound-input-choose`). Already had the baseline `SCORM_RUNTIME_ALIGNMENT` pass from an earlier migration in this same file (which also fixed a spec violation where `subjectId`/language were derived from the folder name instead of `preparePostFeedbackMetadata(post)` — that fix remains intact). This migration added the CMI-restoration, final-persistence, and cumulative-time patterns.
- Question collection: `this.posts[0].items`.
- Correct-answer counter: `this.posts[0].LOcorrectcounter`, mirrored into `counterCorrect` immediately on every mutation (`trueAnswerInput()`, `trueAnswerChoose()`), `+= 0.5` partial credit per round preserved unchanged.
- Score calculation: `calculateCurrentAttemptScore()` → `(LOcorrectcounter / loQuestion) * 100`.
- CMI initialization: default `cmi` object created in `getData()` when missing (`total_time: "00:00:00"` default — corrected 2026-07-19 from the legacy `"PT0H0M0S"` default; see the "Canonical default: total_time initialization" rule above).
- Persisted-CMI restoration point: `restorePersistedCmi(post, restoredPost)`, called in `getData()` immediately after the fresh post object is confirmed and before `initializeNumberOfAttempt(...)`.
- `NumberOfAttempt` initialization point: `initializeNumberOfAttempt(post, restoredPost)`, called immediately after `restorePersistedCmi`, guarded by `numberOfAttemptInitialized`.
- Cumulative time implementation: added `parseScormTimeToSeconds`/`formatSecondsToScormTime` and applied them in `scormPost()`, adding the previously-persisted `cmi.total_time` to the current session's elapsed seconds before formatting the final value.
- Per-question score-update call sites: `UpdateStudentActivity()` (covers `showAnswer()`, `trueAnswerInput()`, `trueAnswerChoose()`, `falseAnswerChoose()`), plus a direct `updateScormScoreAfterAnswer(...)` call in `falseAnswerInput()`.
- Final CMI finalization point: `scormPost()`, guarded by `counter >= loQuestion && roundTwo` and `scormReported`. This file has no `scormCompletionReady` latch (none was needed — `scormPost()` is called synchronously and immediately from `finished()`, `nextQuestion()`, `trueAnswerChoose()`, and `falseAnswerChoose()`, idempotent via `scormReported`); this architecture was preserved exactly, not converted to a latch pattern.
- Final platform persistence point: `persistFinalActivityState()`, called from both branches of `scormPost()` immediately after `applyHighestScormScore(...)` and before `logPostAfterFinalFeedback()`.
- Cloud logging: `logScormCloudSummary()` / local logging: `logQaMetadata()`, both via the standard dispatchers.
- Intentional differences from Digital Screen Choose: two-round input-then-choose flow with immediate (non-delayed) `scormPost()` calls from multiple sites rather than a single delayed final-feedback call; duplicate `finished()` method (already fixed identically in the earlier migration) preserved.
- Verification performed: `node --check` syntax validation; diff reviewed and grepped for `loQuestion|counter|mover|penguinCharacter|informationLO|firstQ|roundTwo|typeChoose|correctChoose|selectChoose|preparePostFeedbackMetadata` against removed lines — zero matches, confirming the two-round architecture and the earlier feedback-metadata fix were not disturbed.
- **2026-07-19 `completeSession()` ordering fix:** this file has no `FINAL_FEEDBACK_DELAY`/`scheduleFinalScormPost()` at all (by design — `scormPost()` is called synchronously from multiple sites, see above), so only the `completeSession()` gap found across the rest of this family applied: it was called immediately after `reportResult()`, before `applyHighestScormScore()`/`persistFinalActivityState()`/`logPostAfterFinalFeedback()`. Moved it to after those three calls, in its own guarded `try/catch`, immediately before the dead `finish()` scaffolding, per the `completeSession()` Canonical Rule. The synchronous multi-site `scormPost()` architecture and `scormReported` idempotency guard were untouched. Verified via `node --check` (pass) and `git diff` (isolated to this one relocation).
- Remaining risk: same `parseScormTimeToSeconds` fallback-to-`0` behavior as the other migrated files for unrecognized persisted time formats. This file's `completeSession()` position now diverges from the current `zoki.js` (Digital Screen Choose) reference, which still calls it in the earlier (pre-persistence) position.
- **2026-07-20 `FINAL_QUESTION_FEEDBACK_AND_TERMINAL_LOGGING_POLICY` confirmation (shared/repeatable interaction handler check):** audited both round funnels. Round 1: `checkInputALL()` → `trueAnswerInput()`/`falseAnswerInput()` → `showAnswer()`, matching the `digital-screen-input`/`zoki_.js` reference lifecycle — `falseAnswerInput()` non-terminal, correctly omits the log; `trueAnswerInput()`/`showAnswer()` own the terminal log for their path. Round 2: `checkChoose(event, answer)` → `trueAnswerChoose()`/`falseAnswerChoose()`, both unconditionally terminal (no Show-Answer step exists for round 2 in this family) and both correctly log once; confirmed against the runtime JSON that every item's `choose` array is single-select, and that the shared `2026_2027/js/choose.js` helper disables `pointer-events` on all choose elements on first click, ruling out re-entry. `isFinalQuestionAttempt()` (`counter >= loQuestion && roundTwo`) correctly distinguishes round 1 of the last item (not final, logs normally) from round 2 of the last item (true final, suppressed). No source change was required this pass. `node --check` re-run (pass, no changes).

- **2026-07-20 correction — duplicate final round-two Choose persistence with pre-advance indexing:** the earlier rule-A/D confirmation correctly distinguished round one from round two but did not trace `trueAnswerChoose()`/`falseAnswerChoose()`'s per-question `UpdateStudentActivity()` calls to the same endpoint used by final `persistFinalActivityState()`. Both calls occur before `counter += 1`; therefore the post-advance `isFinalQuestionAttempt()` helper (`counter >= loQuestions && roundTwo`) is false while handling the last current item at index `loQuestions - 1`. Both round-two Choose calls are now guarded with `this.counter < this.loQuestions - 1`. Non-final round-two items still persist immediately, while the final correct or wrong Choose result skips ordinary persistence and is saved exclusively through `persistFinalActivityState()` after `counter` advances and the existing synchronous `scormPost()` call passes its completion gate. Round-one `trueAnswerInput()` and `showAnswer()` persistence remains unchanged, including on the last item's first round. `falseAnswerInput()` remains non-terminal and score-sync-only. Logging still occurs after the round-two counter increment, so the existing `isFinalQuestionAttempt()` guard remains correct. The synchronous multi-site `scormPost()` architecture and `scormReported` idempotency remain unchanged. Final connected ordering remains `reportResult()` → `applyHighestScormScore()` → `persistFinalActivityState()` → `logPostAfterFinalFeedback()` → `completeSession()`. Partial-credit scoring, Penguin movement, feedback, audio, DOM, timing, navigation, and round state were preserved. Browser verification was not performed; validation was limited to static pre/post-counter two-round tracing, syntax checking, and diff review.

- **2026-07-20 effective runtime question-count migration:** this runtime supported filtering through `checkQuestions()`, but the previous unguarded call set `loQuestions` synchronously and the existing one-second initialization callback later overwrote it with authored `posts[0].numberOfquestion`; it could also throw when the global helper was absent. Replaced that expression with the canonical guarded block inside the callback, immediately after authored-count initialization. When filtering is active, `loQuestions` now becomes `posts[0].items.length`; `posts[0].numberOfquestion` remains unchanged as authored metadata. Navigation, two-round final-question detection, scoring denominators, and completion already use `loQuestions`. No unrelated initialization or two-round lifecycle logic was modified.

- **2026-07-20 `QUESTION_TIMING_LIFECYCLE` migration:** removed the delayed root `startTime` assignment and now assigns it once at the end of `getData()`, before `mounted()` activates the first question. `nextQuestion()` now deactivates all items, activates the current item, and then assigns its non-empty-once item `startTime`, eliminating dependence on authored `active`. Removed item `endTime` mutation from `UpdateStudentActivity()`; both Stage 2 terminal handlers (`trueAnswerChoose()` and `falseAnswerChoose()`) now assign the current item's `endTime` once before ordinary persistence, `counter` mutation, `scormPost()`, and logging. The authoritative completion branch in `scormPost()` assigns root `posts[0].endTime` once after final score/time calculation and before `applyHighestScormScore()`, final persistence, and final logging. Stage 1 handlers no longer have any path that owns question completion timing. Scoring, duplicate-persistence prevention, round transitions, navigation delays, audio, animation, and duplicate `finished()` definitions were preserved.
- **2026-07-21 SCORM status restoration:** added `restoreScormServiceStatus(post)` + its `getData()` call site — see "SCORM Status Restoration Policy" above and the shared "Runtime integration: `restoreScormServiceStatus(post)`" migration entry near the end of this section for the full trace.
- **2026-07-21 batch `TARGET_SCRIPT` re-audit (no changes):** re-traced independently, including the file's unusual "`scormPost()` called synchronously from multiple sites, embedded once inside `finished()` and again explicitly after `counter += 1`" architecture — confirmed the `finished()`-embedded call is always a harmless no-op at the moment it fires (round 1: `roundTwo` still `false`; round 2: fires *before* `counter += 1`, so `isActivityComplete` can't yet be `true` even on the last item) and the explicit post-increment call in `trueAnswerChoose()`/`falseAnswerChoose()` is the one that actually triggers finalization, gated correctly by `scormReported`. Round-1 (`showAnswer()`, `trueAnswerInput()`) unguarded sends remain safe since `roundTwo` is `false` at their synchronous evaluation point. `restoreScormServiceStatus(post)` and `normalizeScormScore()` re-confirmed correct. Zero changes made this pass.

## `2026_2027/lib-native/penguin_26/penguin-tworound-inputs/js/main_.js`

- Runtime family: Penguin two-round input-input (`penguin_26/penguin-tworound-inputs`), with `FINAL_FEEDBACK_DELAY`/`scormCompletionReady` latch already present. Already had the baseline `SCORM_RUNTIME_ALIGNMENT` pass, including a duplicate `finished()` method (preserved per the duplicate-methods rule). This migration added the CMI-restoration, final-persistence, and cumulative-time patterns.
- Question collection: `this.posts[0].items`.
- Correct-answer counter: `this.posts[0].LOcorrectcounter`, mirrored into `counterCorrect` immediately on every mutation (`trueAnswerInput()`, `trueAnswerInputRoundTwo()`), `+= 0.5` partial credit per round preserved unchanged.
- Score calculation: `calculateCurrentAttemptScore()` → `(LOcorrectcounter / loQuestion) * 100`.
- CMI initialization: default `cmi` object created in `getData()` when missing (`total_time: "00:00:00"` default — corrected 2026-07-19 from the legacy `"PT0H0M0S"` default; see the "Canonical default: total_time initialization" rule above).
- Persisted-CMI restoration point: `restorePersistedCmi(post, restoredPost)`, called in `getData()` immediately after the fresh post object is confirmed and before `initializeNumberOfAttempt(...)`.
- `NumberOfAttempt` initialization point: `initializeNumberOfAttempt(post, restoredPost)`, called immediately after `restorePersistedCmi`, guarded by `numberOfAttemptInitialized`.
- Cumulative time implementation: added `parseScormTimeToSeconds`/`formatSecondsToScormTime` and applied them in `scormPost()`, adding the previously-persisted `cmi.total_time` to the current session's elapsed seconds before formatting the final value.
- Per-question score-update call sites: `UpdateStudentActivity()` (covers `trueAnswerInput()`, `trueAnswerInputRoundTwo()`), plus direct `updateScormScoreAfterAnswer(...)` calls in `falseAnswerInput()` and `falseAnswerInputRoundTwo()`.
- Final CMI finalization point: `scormPost()`, guarded by `scormCompletionReady || (counter >= loQuestion && roundTwo)` and `scormReported` — the pre-existing latch was left completely untouched.
- Final platform persistence point: `persistFinalActivityState()`, called from both branches of `scormPost()` immediately after `applyHighestScormScore(...)` and before `logPostAfterFinalFeedback()`.
- Cloud logging: `logScormCloudSummary()` / local logging: `logQaMetadata()`, both via the standard dispatchers.
- Intentional differences from Digital Screen Choose: two-round input-input flow (`roundNum` 1/2 gating via `checkInputALL()`), duplicate `finished()` (object-literal shadowing) preserved.
- Verification performed: `node --check` syntax validation; diff reviewed and grepped for `loQuestion|counter|mover|penguinCharacter|informationLO|firstQ|roundTwo|roundNum` against removed lines — zero matches, confirming the two-round architecture and its latch were not touched.
- **2026-07-19 `FINAL_FEEDBACK_DELAY` removal + `completeSession()` ordering fix:** the same two gaps found and fixed across the rest of the family:
  1. Deleted the `const FINAL_FEEDBACK_DELAY = 1000;` declaration and simplified `scheduleFinalScormPost()` to call `this.scormPost()` directly with no `setTimeout()`, preserving the `scormCompletionReady = true;` line unchanged.
  2. `completeSession()` was called immediately after `reportResult()`, before `applyHighestScormScore()`/`persistFinalActivityState()`/`logPostAfterFinalFeedback()`. Moved it to after those three calls, in its own guarded `try/catch`, immediately before the dead `finish()` scaffolding (note: this file's dead `finish()` scaffolding uses a `2000`ms inert `setTimeout()` rather than the usual `1000`ms — pre-existing, harmless, left unchanged).

  The pre-existing `scormCompletionReady` latch and the preserved duplicate `finished()` method were untouched. Verified via `node --check` (pass) and `git diff` (isolated to these two fixes).
- Remaining risk: same `parseScormTimeToSeconds` fallback-to-`0` behavior as the other migrated files for unrecognized persisted time formats. This file's `completeSession()` position now diverges from the current `zoki.js` (Digital Screen Choose) reference, which still calls it in the earlier (pre-persistence) position.

- **2026-07-20 correction — duplicate final round-two input persistence with shared Show Answer:** the earlier migration listed per-question score-update sites but did not trace them to the same platform endpoint used by final `persistFinalActivityState()`. Correct round-two completion calls `UpdateStudentActivity()` inside `trueAnswerInputRoundTwo()` before `counter += 1`; that call is now guarded by `this.counter < this.loQuestions - 1`. Wrong round-two completion goes through `falseAnswerInputRoundTwo()` (non-terminal, score-sync-only) and then the shared `showAnswer()` handler. Because that handler also serves round one, its call is guarded with `!(this.roundTwo && this.counter >= this.loQuestions - 1)`, suppressing only the final round-two persistence while preserving round-one Show Answer persistence—including round one of the last item—and every non-final round-two update. `trueAnswerInput()` round-one persistence remains unchanged. The shared handler still marks only its round-two branch as the logical-question terminal state, increments `counter`, and then emits the ordinary log; the existing post-advance `isFinalQuestionAttempt()` guard therefore remains correct. Final persistence is exclusively owned by `persistFinalActivityState()` inside the `scormCompletionReady`/`scormReported`-guarded final flow. Wrong-answer terminal ownership, partial-credit scoring, `roundNum`/`roundTwo`, duplicate `finished()` definitions, Penguin movement, feedback, audio, DOM, timers, navigation, and the existing 2000ms inert finish scaffolding were preserved. Final connected ordering remains `reportResult()` → `applyHighestScormScore()` → `persistFinalActivityState()` → `logPostAfterFinalFeedback()` → `completeSession()`. Browser verification was not performed; validation was limited to static pre/post-counter two-round tracing, syntax checking, and diff review.
- **2026-07-21 batch `TARGET_SCRIPT` re-audit — Rule A/B/C/D re-confirmed correct by fresh trace, one gap found and fixed (Status Restoration Policy):** independently re-traced every call site, including the unguarded round-one sends (`trueAnswerInput()`, `showAnswer()`'s round-one branch) — both provably safe since `roundTwo` is `false` at their synchronous evaluation point (its only mutator is a later-delayed `setTimeout` in each path) — and the guarded round-two sends (`trueAnswerInputRoundTwo()`, `showAnswer()`'s round-two branch), which correctly gate only the true final item. Confirmed this file's logging model differs intentionally from the sibling `-input-choose` family: only round-two completion (`trueAnswerInputRoundTwo()` or `showAnswer()`'s round-two branch, via its `questionTerminal` flag) ever calls `logPostAfterAnswerAttempt()` — round one never logs on either path, in either `trueAnswerInput()` or `showAnswer()`'s round-one branch. This was already the case before this pass (not something introduced here) and produces no duplicate or missing log relative to this file's own "one log per fully-resolved two-round question" model; left unchanged as pre-existing, self-consistent business logic outside this task's narrow duplicate-send/duplicate-log scope. **Gap found and fixed:** this file had no `restoreScormServiceStatus(post)`. Added the canonical method and its `getData()` call site, identical to the other files that already have it. `node --check` passed; `git diff --stat` showed 1 file, 17 insertions, isolated. Observed but not fixed (pre-existing, unrelated to SCORM duplicate-send/status scope): `UpdateStudentActivity()` unconditionally overwrites root `this.posts[0].endTime` on every per-question call, not only at final completion — a `QUESTION_TIMING_LIFECYCLE`-category concern, not a Rule A/B/C/D or Status Restoration one; left untouched. Browser verification: not performed.

## `2026_2027/lib-native/penguin_26/penguin-input/js/main.js`

- Runtime family: Penguin single-round input, sibling of `penguin-input/js/main_.js` (same architecture, including its own duplicate `finished()` method preserved per the duplicate-methods rule). Already had the baseline `SCORM_RUNTIME_ALIGNMENT` pass; this migration added the CMI-restoration, final-persistence, and cumulative-time patterns.
- Question collection: `this.posts[0].items`.
- Correct-answer counter: `this.posts[0].LOcorrectcounter`, mirrored into `counterCorrect` immediately on the `trueAnswer()` mutation.
- Score calculation: `calculateCurrentAttemptScore()` → `(LOcorrectcounter / loQuestion) * 100`.
- CMI initialization: default `cmi` object created in `getData()` when missing (`total_time: "00:00:00"` default — corrected 2026-07-19 from the legacy `"PT0H0M0S"` default; see the "Canonical default: total_time initialization" rule above).
- Persisted-CMI restoration point: `restorePersistedCmi(post, restoredPost)`, called in `getData()` immediately after the fresh post object is confirmed and before `initializeNumberOfAttempt(...)`.
- `NumberOfAttempt` initialization point: `initializeNumberOfAttempt(post, restoredPost)`, called immediately after `restorePersistedCmi`, guarded by `numberOfAttemptInitialized`.
- Cumulative time implementation: added `parseScormTimeToSeconds`/`formatSecondsToScormTime` and applied them in `scormPost()`, adding the previously-persisted `cmi.total_time` to the current session's elapsed seconds before formatting the final value.
- Per-question score-update call sites: `UpdateStudentActivity()` (covers `trueAnswer()`, `showAnswer()`), plus a direct `updateScormScoreAfterAnswer(...)` call in `falseAnswer()`.
- Final CMI finalization point: `scormPost()`, guarded by `scormCompletionReady || counter >= loQuestion` and `scormReported` — the pre-existing latch was left completely untouched.
- Final platform persistence point: `persistFinalActivityState()`, called from both branches of `scormPost()` immediately after `applyHighestScormScore(...)` and before `logPostAfterFinalFeedback()`.
- Cloud logging: `logScormCloudSummary()` / local logging: `logQaMetadata()`, both via the standard dispatchers.
- Intentional differences from Digital Screen Choose: same as `penguin-input/main_.js` — duplicate `finished()` (object-literal shadowing) preserved rather than removed.
- Verification performed: `node --check` syntax validation; diff reviewed and grepped for `loQuestion|counter|mover|penguinCharacter|informationLO|firstQ|questionStart|border` against removed lines — zero matches, confirming the input architecture and its latch were not touched.
- **2026-07-19 `FINAL_FEEDBACK_DELAY` removal + `completeSession()` ordering fix:** the same two gaps found and fixed in the sibling `penguin-input/js/main_.js` and across the Digital Screen family:
  1. Deleted the `const FINAL_FEEDBACK_DELAY = 1000;` declaration and simplified `scheduleFinalScormPost()` to call `this.scormPost()` directly with no `setTimeout()`, preserving the `scormCompletionReady = true;` line unchanged.
  2. `completeSession()` was called immediately after `reportResult()`, before `applyHighestScormScore()`/`persistFinalActivityState()`/`logPostAfterFinalFeedback()`. Moved it to after those three calls, in its own guarded `try/catch`, immediately before the dead `finish()` scaffolding.

  The pre-existing `scormCompletionReady` latch and the preserved duplicate `finished()` method were untouched. Verified via `node --check` (pass) and `git diff` (isolated to these two fixes).
- Remaining risk: same `parseScormTimeToSeconds` fallback-to-`0` behavior as the other migrated files for unrecognized persisted time formats. This file's `completeSession()` position now diverges from the current `zoki.js` (Digital Screen Choose) reference, which still calls it in the earlier (pre-persistence) position.

- **2026-07-20 correction — duplicate final persistence with pre-advance indexing:** `trueAnswer()` and `showAnswer()` called the per-question `UpdateStudentActivity()` endpoint before incrementing `counter`, then the final-feedback flow persisted the same final item again through `persistFinalActivityState()`. The existing `isFinalQuestionAttempt()` helper is deliberately post-advance (`counter >= loQuestions`) for the adjacent logging calls and would return false at these earlier persistence sites, where the last current item is index `loQuestions - 1`. Both per-question calls are therefore guarded with `this.counter < this.loQuestions - 1`. Non-final correct and wrong→Show Answer terminal paths still persist immediately; the final terminal path now persists exclusively through `persistFinalActivityState()` after final feedback. `counter` still increments before `logPostAfterAnswerAttempt()`, so the existing logging guard remains correct and unchanged. `falseAnswer()` remains non-terminal and score-sync-only, and the duplicate `finished()` definitions remain preserved. Final connected ordering remains `reportResult()` → `applyHighestScormScore()` → `persistFinalActivityState()` → `logPostAfterFinalFeedback()` → `completeSession()`. Penguin movement, feedback, scoring, audio, DOM, timing, navigation, and `scormCompletionReady` behavior were preserved. Browser verification was not performed; validation was limited to static pre/post-counter lifecycle tracing, syntax checking, and diff review.
- **2026-07-21 SCORM status restoration:** added `restoreScormServiceStatus(post)` + its `getData()` call site — see "SCORM Status Restoration Policy" above and the shared "Runtime integration: `restoreScormServiceStatus(post)`" migration entry near the end of this section for the full trace.
- **2026-07-21 batch `TARGET_SCRIPT` re-audit (no changes):** re-read the full file fresh; the pre-advance `counter < loQuestions - 1` guards, post-advance logging guard, `restoreScormServiceStatus(post)`, and integer-free `normalizeScormScore()` are all present and correct, byte-identical to the sibling `main_.js`. Zero changes made this pass.

## `2026_2027/lib-native/penguin_26/penguin-tworound-inputs/js/main.js`

- Runtime family: Penguin two-round input-input, sibling of `penguin-tworound-inputs/js/main_.js` (byte-identical architecture, including the same duplicate `finished()` method). Already had the baseline `SCORM_RUNTIME_ALIGNMENT` pass; this migration added the CMI-restoration, final-persistence, and cumulative-time patterns.
- Question collection: `this.posts[0].items`.
- Correct-answer counter: `this.posts[0].LOcorrectcounter`, mirrored into `counterCorrect` immediately on every mutation (`trueAnswerInput()`, `trueAnswerInputRoundTwo()`), `+= 0.5` partial credit per round preserved unchanged.
- Score calculation: `calculateCurrentAttemptScore()` → `(LOcorrectcounter / loQuestion) * 100`.
- CMI initialization: default `cmi` object created in `getData()` when missing (`total_time: "00:00:00"` default — corrected 2026-07-19 from the legacy `"PT0H0M0S"` default; see the "Canonical default: total_time initialization" rule above).
- Persisted-CMI restoration point: `restorePersistedCmi(post, restoredPost)`, called in `getData()` immediately after the fresh post object is confirmed and before `initializeNumberOfAttempt(...)`.
- `NumberOfAttempt` initialization point: `initializeNumberOfAttempt(post, restoredPost)`, called immediately after `restorePersistedCmi`, guarded by `numberOfAttemptInitialized`.
- Cumulative time implementation: added `parseScormTimeToSeconds`/`formatSecondsToScormTime` and applied them in `scormPost()`, adding the previously-persisted `cmi.total_time` to the current session's elapsed seconds before formatting the final value.
- Per-question score-update call sites: `UpdateStudentActivity()` (covers `trueAnswerInput()`, `trueAnswerInputRoundTwo()`), plus direct `updateScormScoreAfterAnswer(...)` calls in `falseAnswerInput()` and `falseAnswerInputRoundTwo()`.
- Final CMI finalization point: `scormPost()`, guarded by `scormCompletionReady || (counter >= loQuestion && roundTwo)` and `scormReported` — the pre-existing latch was left completely untouched.
- Final platform persistence point: `persistFinalActivityState()`, called from both branches of `scormPost()` immediately after `applyHighestScormScore(...)` and before `logPostAfterFinalFeedback()`.
- Cloud logging: `logScormCloudSummary()` / local logging: `logQaMetadata()`, both via the standard dispatchers.
- Intentional differences from Digital Screen Choose: same as `penguin-tworound-inputs/main_.js` — duplicate `finished()` (object-literal shadowing) preserved rather than removed.
- Verification performed: `node --check` syntax validation; diff reviewed and grepped for `loQuestion|counter|mover|penguinCharacter|informationLO|firstQ|roundTwo|roundNum` against removed lines — zero matches, confirming the two-round architecture and its latch were not touched.
- **2026-07-19 `FINAL_FEEDBACK_DELAY` removal + `completeSession()` ordering fix:** the same two gaps found and fixed in the sibling `main_.js`:
  1. Deleted the `const FINAL_FEEDBACK_DELAY = 1000;` declaration and simplified `scheduleFinalScormPost()` to call `this.scormPost()` directly with no `setTimeout()`, preserving the `scormCompletionReady = true;` line unchanged.
  2. `completeSession()` was called immediately after `reportResult()`, before `applyHighestScormScore()`/`persistFinalActivityState()`/`logPostAfterFinalFeedback()`. Moved it to after those three calls, in its own guarded `try/catch`, immediately before the dead `finish()` scaffolding (standard `1000`ms inert delay, unlike `main_.js`'s `2000`ms).

  The pre-existing `scormCompletionReady` latch and the preserved duplicate `finished()` method were untouched. Verified via `node --check` (pass) and `git diff` (isolated to these two fixes).
- Remaining risk: same `parseScormTimeToSeconds` fallback-to-`0` behavior as the other migrated files for unrecognized persisted time formats. This file's `completeSession()` position now diverges from the current `zoki.js` (Digital Screen Choose) reference, which still calls it in the earlier (pre-persistence) position.

- **2026-07-20 correction — duplicate final round-two input persistence with shared Show Answer:** this plain sibling had the same untraced endpoint overlap as `main_.js`. `trueAnswerInputRoundTwo()` called `UpdateStudentActivity()` before incrementing `counter`, and the wrong round-two path reached the same call through shared `showAnswer()` before its delayed round-two branch incremented `counter`; final feedback later persisted again through `persistFinalActivityState()`. The correct round-two call is now guarded by `this.counter < this.loQuestions - 1`. The shared Show Answer call is guarded by `!(this.roundTwo && this.counter >= this.loQuestions - 1)`, which suppresses only final round-two persistence while preserving round-one Show Answer persistence—including the last item's first round—and all non-final round-two updates. `trueAnswerInput()` round-one persistence remains unchanged. The false handlers remain non-terminal and score-sync-only; shared Show Answer remains their terminal owner, and its round-two branch still increments `counter` before the existing final-question logging guard runs. Final persistence is exclusively owned by `persistFinalActivityState()` inside the `scormCompletionReady`/`scormReported`-guarded final flow. Partial-credit scoring, `roundNum`/`roundTwo`, duplicate `finished()` definitions, Penguin movement, feedback, audio, DOM, timers, navigation, and the standard 1000ms inert finish scaffolding were preserved. Final connected ordering remains `reportResult()` → `applyHighestScormScore()` → `persistFinalActivityState()` → `logPostAfterFinalFeedback()` → `completeSession()`. Browser verification was not performed; validation was limited to static pre/post-counter two-round tracing, syntax checking, and diff review.

- **2026-07-20 effective-count + `QUESTION_TIMING_LIFECYCLE` migration:** moved the canonical guarded `checkQuestions()` block into the delayed count initializer so filtered `items.length` is no longer overwritten by authored `numberOfquestion`; authored metadata remains unchanged and `loQuestions` remains the effective runtime count. Removed the delayed root `startTime` write and now assigns the current attempt's start once at the end of `getData()`, before first activation. `nextQuestion()` now deactivates all items, activates the current item, and assigns item `startTime` only when empty. Removed both item `endTime` and root `endTime` mutations from `UpdateStudentActivity()`. Correct Stage 2 completion assigns item `endTime` once in `trueAnswerInputRoundTwo()`; wrong Stage 2 completion assigns it once at entry to shared `showAnswer()` only when `roundNum === 2`, before its guarded persistence and delayed counter mutation. `scormPost()` now assigns root `endTime` once inside the authoritative completion gate before highest-score application, final persistence, and final logging. Stage 1 timing, two-round scoring, Show Answer behavior, duplicate-persistence guards, round/counter semantics, delays, audio, animation, navigation, and duplicate `finished()` definitions were otherwise preserved.
- **2026-07-21 batch `TARGET_SCRIPT` re-audit — Rule A/B/C/D re-confirmed correct by fresh trace, one gap found and fixed (Status Restoration Policy):** re-traced independently, byte-identical reasoning to the sibling `main_.js` re-audit above — unguarded round-one sends safe (`roundTwo` false at evaluation), guarded round-two sends correctly gate the true final item, and the "only round-two completion logs" model is pre-existing/self-consistent (left unchanged, out of scope). **Gap found and fixed:** this file had no `restoreScormServiceStatus(post)`. Added the canonical method and its `getData()` call site. `node --check` passed; `git diff --stat` showed 1 file, 17 insertions, isolated. Browser verification: not performed.

## `2026_2027/lib-native/buzzTime/js/main.js`

- Runtime family: BuzzTime (single data object, not an array — `this.posts` is the fresh JSON payload assigned directly, never `this.posts[0]`). First file in this family to receive any SCORM/CMI alignment pass; this migration applied the full baseline pattern plus CMI restoration, `NumberOfAttempt`, highest-score preservation, per-answer score sync, final platform persistence, cumulative time, and QA/cloud logging in a single pass.
- Question collection: runtime-selected `this.allQuestions` (a shuffled 6-question subset of the raw `data.questions` fetched from `data.json`, filtered to `questionType === "text"` entries). `this.posts.questions` is a separate, pre-existing sparse mirror array written index-by-index as questions are asked/answered; it does not hold the real runtime-selected order, so QA logging reads from `this.allQuestions` instead and reports it under the `questions` key (the collection's real property name in the data model).
- Correct-answer counter: `this.posts.LOcorrectcounter`, incremented in `updateScoreAndHints(true)`. `this.posts.counterCorrect` existed in `data.json` but was never synchronized — added `this.posts.counterCorrect = this.posts.LOcorrectcounter;` immediately after the increment, per the counter-sync rule.
- Score calculation: `calculateCurrentAttemptScore()` → `(this.studentScore / (this.posts.numberOfquestion || 6)) * 100`, matching the file's pre-existing `scormPost()` formula.
- CMI initialization: default `cmi` object created in the `data.json` fetch handler inside `postQuestions()` when missing (`total_time: "PT0H0M0S"` default) — pre-existing, left unchanged.
- Persisted-CMI restoration point: `restorePersistedCmi(post, restoredPost)`, called in `postQuestions()` immediately after `const post = this.posts; if (!post) return;` and before `initializeNumberOfAttempt(...)`. `restoredPost` itself is newly captured from the `direction == "2"` branch's existing (previously unused/commented) `JSON.parse(this.data.learningObjectAsJson)` call.
- `NumberOfAttempt` initialization point: `initializeNumberOfAttempt(post, restoredPost)`, called immediately after `restorePersistedCmi`, guarded by `numberOfAttemptInitialized`. This field did not exist anywhere in the file or `data.json` before this migration.
- Cumulative time implementation: added `parseScormTimeToSeconds`/`formatSecondsToScormTime` and applied them in `scormPost()`, adding the previously-persisted `cmi.total_time` (restored by `restorePersistedCmi`) to the current session's elapsed seconds before formatting the final value. `msToScormTime` remains defined but is superseded at the final-completion call site.
- Per-question score-update call sites: `UpdateStudentActivity()`, which now calls `updateScormScoreAfterAnswer(this.calculateCurrentAttemptScore())` before its existing platform-metadata assignment. This is the file's only per-answer update method and is already called from `updateScoreAndHints(isCorrect)` for both the correct and wrong branches, so no separate call site was needed for a retry/wrong path.
- Final CMI finalization point: `scormPost()`, guarded by `this.showResultScreen && this.askedQuestions.length >= this.allQuestions.length` (the pre-existing, spec-documented BuzzTime completion guard) and `scormReported`. This guard and its call site (the `availableQuestions.length === 0` branch of `loadRandomQuestion()`) were left completely untouched; the file's existing animation/feedback sequence (`calculateScore()`, `playDynamicFeedback()`) already runs before this call, so no artificial `FINAL_FEEDBACK_DELAY` was introduced.
- Final platform persistence point: `persistFinalActivityState()` (guards on `this.posts` directly rather than `this.posts?.[0]`, since `posts` is not an array here), called from both branches of `scormPost()` immediately after `applyHighestScormScore(...)` and before `logPostAfterFinalFeedback()`.
- Cloud logging: `logScormCloudSummary()` / local logging: `logQaMetadata()`, both via the standard `logPostAfterAnswerAttempt()`/`logPostAfterFinalFeedback()` dispatchers; `isFinalQuestionAttempt()` is `this.askedQuestions.length >= this.allQuestions.length`.
- Intentional differences from Digital Screen Choose: `post` is `this.posts` (no array indexing) throughout every helper; `getQuestionCollectionName(post)` is defined for consistency with the reusable helper set but `logQaMetadata` reads the actual runtime-selected question order from the top-level `this.allQuestions` Vue data property instead of `post.questions`, since the latter is a sparse legacy mirror and not the real session-ordered collection.
- Other corrected pre-existing spec violations found during audit and fixed in the same pass: `studentPoint` was initialized to `null` (now `0`) and was set to the raw 0-100 `result` at final completion instead of the normalized out-of-10 value (now `Number((result / 10).toFixed(1))`); `scoreOutOf10` was missing from data normalization (now `this.posts.scoreOutOf10 ??= 0;`, unused elsewhere in this file but guaranteed to exist per spec); `post.subjectId = folderName` was removed (subjectId must come from JSON only); question-level `startTime`/`endTime` (on `this.allQuestions[...]` and `currentQ`) were using the root-level `getDate()` format and now use a newly added `getQuestionTime()` helper (`hh:mm:ss AM/PM`), while root-level `this.posts.startTime`/`this.posts.endTime` keep `getDate()` unchanged; three verbose SCORM/full-post console dumps (`console.log(this.posts)` after load, a `"SCORM debug data:"` object dump, and a `"SCORM completion data:"` object dump in `scormPost()`) were removed in favor of the QA/cloud logging dispatchers.
- Verification performed: `node --check` syntax validation; `git diff` reviewed in full and grepped for `studentScore|askedQuestions|allQuestions|showResultScreen|LOcorrectcounter|isGameRunning|animations\.|playSegments|Audio\(|handleKeyPress|checkAnswer` against removed lines — matches were limited to the intentional `getDate()`→`getQuestionTime()` timestamp fixes and the `scormPost()` rewrite; no animation, audio, keyboard, timer, or answer-checking logic was altered.
- Remaining risk: `preparePostFeedbackMetadata`/`Educational_stage` are not wired in, since this template has no `Educational_stage` field in `data.json` and does not load `progress.js` in its HTML (`lang`/`feedBackTxt`/`feedBackDes` are computed via a pre-existing folder-name-derived fallback that is not referenced anywhere in the BuzzTime template and was left untouched as dead/vestigial code, out of scope for this migration). Same `parseScormTimeToSeconds` fallback-to-`0` behavior as the other migrated files for unrecognized persisted time formats.
- **2026-07-20 `completeSession()` ordering fix + `FINAL_QUESTION_FEEDBACK_AND_TERMINAL_LOGGING_POLICY` re-verification:** re-audited under the "Shared/repeatable interaction handlers" subsection. The interaction funnel `handleEnter()` → `updateScoreAndHints(isCorrect)` was confirmed to already fire exactly once per logical question (guarded by `enterPressed`, reset only when the next question loads via `resetTurnState()`/`loadRandomQuestion()`), so no logging-timing change was needed. A genuine `completeSession()`-ordering violation was found in `scormPost()`'s SCORM-connected branch: `completeSession()` was called immediately after `reportResult()`, before `applyHighestScormScore()`/`persistFinalActivityState()`/`logPostAfterFinalFeedback()`. Moved it to its own guarded `try/catch`, positioned after those three calls and immediately before the dead `finish()`-scaffolding `setTimeout(() => {}, 1000);`, matching the canonical order. Executes exactly once, still governed by `scormReported`. Verified via `node --check` (pass) and `git diff` (isolated to the `completeSession()` relocation only; no scoring, animation, audio, timer, or answer-evaluation logic touched).
- **Observation (not fixed, out of scope):** `finishAutoStart()` (the idle-timeout auto-answer path reached via `autoStartQuiz()`) evaluates an answer via `checkAndSetAnswerStatus()` but never calls `updateScoreAndHints()`, `UpdateStudentActivity()`, or `logPostAfterAnswerAttempt()` — an under-logging gap for auto-answered questions, distinct from the multi-fire/over-logging pattern this pass targeted. Left untouched; flagged for a future pass.
- **2026-07-20 `BUZZTIME_AUTO_COMPLETION_SCORING_AND_LOGGING` fix:** the above gap was fixed. `finishAutoStart()` (reached via the idle-timeout `autoStartQuiz()` path) evaluated an answer via `checkAndSetAnswerStatus()` but, on a correct auto-detected answer, only manually set `endTime`/`posts.endTime`/`posts.questions[...]` before calling `finalizeTurn(true)` to advance — it never updated `studentScore`, `posts.LOcorrectcounter`/`counterCorrect`, `posts.items`, never called `UpdateStudentActivity()` (per-answer SCORM score sync), and never called `logPostAfterAnswerAttempt()` (canonical per-question log). The wrong-answer branch of `finishAutoStart()` was confirmed non-terminal — it restarts the timer and hands control back to the player on the same question rather than advancing (`handleWrongAnswer()`/`updateScoreAndHints(false)` are never called from there) — so it correctly requires no scoring/logging change under canonical rule B's retry exception; the file has no other same-question retry path (a wrong answer via the normal `handleEnter()`/timeout route is itself terminal, matching this single-shot buzzer-style game), so a per-question terminal guard cannot suppress a legitimate second attempt. `updateScoreAndHints(isCorrect)` was extended to `updateScoreAndHints(isCorrect, options = {})` with an `options.silent` flag: all data/scoring/logging statements (score increment, `LOcorrectcounter`/`counterCorrect`, `posts.items.push`, `currentQ.endTime`, `posts.endTime`, `posts.questions[...]` sync, `UpdateStudentActivity()`, `logPostAfterAnswerAttempt()`) remain unconditional; only the learner-facing celebration/fail audio and `boyStage`/`girlStage` animation calls (including the trailing reset `setTimeout`s) were gated behind `if (!silent)`. `finishAutoStart()`'s correct branch now calls `this.updateScoreAndHints(true, { silent: true })` in place of its old manual `endTime`/`posts` sync, immediately before `finalizeTurn(true)` — reusing the canonical shared funnel (including `UpdateStudentActivity()` → `updateScormScoreAfterAnswer(calculateCurrentAttemptScore())`) rather than duplicating the scoring formula. `silent: true` is required because `finishAutoStart()` already plays its own `characterConfig`-based correct-answer audio immediately beforehand; a non-silent call would double-fire success audio and re-trigger avatar celebration animation concurrently with `finishAutoStart()`'s own sequence. A new per-question-index terminal guard (`questionTerminalState: {}`, added to `data()`) was added at the top of `updateScoreAndHints()`: `if (this.questionTerminalState[questionIndex]) return;` before any mutation, then marks the index finalized. This guard exists because `finishAutoStart()` resets `enterPressed = false` synchronously (before its own internal 4500ms delayed evaluation) while `showKeyboard` is already `true`, opening a window in which a genuine Enter press could race the auto-timeout's own delayed check for the same question index; the guard ensures whichever path reaches the funnel first performs the one-time score/counter/log finalization and the other becomes a no-op, guaranteeing exactly one score update and exactly one canonical per-question log per logical question regardless of race outcome. `logPostAfterAnswerAttempt()`'s existing `isFinalQuestionAttempt()` guard is untouched and applies identically whether the terminal call came from the real or auto path, so the last question still receives no ordinary per-question log via this route. `finishAutoStart()` still never calls `scormPost()`/`persistFinalActivityState()` directly; `OVERALL_ACTIVITY_COMPLETION` remains owned exclusively by `scormPost()`, gated by the pre-existing `showResultScreen && askedQuestions.length >= allQuestions.length` condition, unchanged. No answer-correctness rule, timer-firing timing, UI flow, question order/count, retry rule, or the existing `completeSession()`-ordering fix was altered. Verified via `node --check` (pass) and `git diff` (isolated to the `questionTerminalState` guard/data property, the `silent`-gating inside `updateScoreAndHints()`, and the `finishAutoStart()` call-site swap). Remaining risk: the pre-existing `this.handleComputerResponse();` call (no argument) inside `finishAutoStart()`'s correct branch still evaluates `!isCorrect` on `undefined` — a distinct, pre-existing bug in the computer's reaction animation/audio only, not in scoring/logging, left untouched as out of scope. Browser verification not performed — static analysis, syntax check, and diff review only.

## `2026_2027/lib-native/buzzTime_primary/js/main.js`

- Runtime family: BuzzTime Primary, a sibling of `buzzTime/js/main.js` with the identical `this.posts` (single object, not `posts[0]`) architecture and the same `showResultScreen && askedQuestions.length >= allQuestions.length` completion guard, but a different final-feedback badge system (`getAdjustedScore`/`getAnimationRangeByLevel`/`feedbackMessage`/`feedbackImage` — crystal/gold/broken self-score bands, no `computerScore` comparison) which was left completely untouched. Unlike `buzzTime/js/main.js`, this file already had a partial, hand-written SCORM pass (`scormPost()` using an early-return guard style, guarded `post.cmi` check, a `msToScormTime(ms)` that accepts an optional explicit `ms` argument) but was missing every canonical CMI-restoration/highest-score/final-persistence/cumulative-time/QA-logging pattern. This migration completed that pass while preserving the file's own early-return coding style in `scormPost()`.
- Question collection: runtime-selected `this.allQuestions` (same shuffled 6-question subset approach as `buzzTime/js/main.js`); `this.posts.questions` is the same kind of pre-existing sparse mirror array and is not used for QA logging for the same reason.
- Correct-answer counter: `this.posts.LOcorrectcounter`, incremented in `updateScoreAndHints(true)`. `this.posts.counterCorrect` existed in `data.json` (`counterCorrect: 0`) but was never synchronized — added `this.posts.counterCorrect = this.posts.LOcorrectcounter;` immediately after the increment, same as `buzzTime/js/main.js`.
- Score calculation: `calculateCurrentAttemptScore()` → `(this.studentScore / (this.posts.numberOfquestion || this.allQuestions.length || 6)) * 100`, preserving the file's own pre-existing `totalQuestions` fallback chain (`post.numberOfquestion || this.allQuestions.length || 6`) rather than the simpler `|| 6` used in `buzzTime/js/main.js`.
- CMI initialization: default `cmi` object created in the `data.json` fetch handler inside `postQuestions()` when missing (`total_time: "PT0H0M0S"` default) — pre-existing, left unchanged.
- Persisted-CMI restoration point: `restorePersistedCmi(post, restoredPost)`, called in `postQuestions()` immediately after the `cmi`/`studentProgress` default-creation blocks and before the `scoreOutOf10`/`lang` normalization continues, and before `initializeNumberOfAttempt(...)`. `restoredPost` is newly captured from the `direction == "2"` branch's existing (previously unused/commented) `JSON.parse(this.data.learningObjectAsJson)` call, identical in shape to `buzzTime/js/main.js`.
- `NumberOfAttempt` initialization point: `initializeNumberOfAttempt(post, restoredPost)`, called immediately after `restorePersistedCmi`, guarded by `numberOfAttemptInitialized`. This field, along with `numberOfAttemptInitialized`/`previousScormScore` data properties, did not exist anywhere in the file before this migration.
- Cumulative time implementation: added `parseScormTimeToSeconds`/`formatSecondsToScormTime` and applied them in `scormPost()`, adding the previously-persisted `cmi.total_time` (restored by `restorePersistedCmi`) to the current session's elapsed seconds before formatting the final value. The pre-existing parameterized `msToScormTime(ms)` remains defined but is superseded at the final-completion call site.
- Per-question score-update call sites: `UpdateStudentActivity()`, which now calls `updateScormScoreAfterAnswer(this.calculateCurrentAttemptScore())` before its existing platform-metadata assignment — the file's only per-answer update method, already called from `updateScoreAndHints(isCorrect)` for both branches, same as `buzzTime/js/main.js`.
- Final CMI finalization point: `scormPost()`, rewritten to keep the file's own early-return guard style (`if (!post || !post.cmi) return;` then `if (!isActivityComplete || this.scormReported) return;`) rather than the nested-if style used in `buzzTime/js/main.js`, guarded by the same `showResultScreen && askedQuestions.length >= allQuestions.length` condition and `scormReported`. The call site in `loadRandomQuestion()`'s `availableQuestions.length === 0` branch was left untouched.
- Final platform persistence point: `persistFinalActivityState()` (guards on `this.posts` directly, matching the non-array `posts` shape), called from both branches of `scormPost()` immediately after `applyHighestScormScore(...)` and before `logPostAfterFinalFeedback()`.
- Cloud logging: `logScormCloudSummary()` / local logging: `logQaMetadata()`, both via the standard dispatchers; `isFinalQuestionAttempt()` is `this.askedQuestions.length >= this.allQuestions.length`.
- Intentional differences from Digital Screen Choose: same as `buzzTime/js/main.js` — `post` is `this.posts` throughout; `logQaMetadata` reads `this.allQuestions` rather than `post.questions` for the same sparse-mirror reason. Additionally, this file's own `playDynamicFeedback()`, `getAdjustedScore()`, `getAnimationRangeByLevel()`, and `getBadgeClass()` (crystal/gold/broken bands, distinct from `buzzTime/js/main.js`'s computer-vs-player comparison) were left completely untouched.
- Other corrected pre-existing spec violations found during audit and fixed in the same pass: `studentPoint` was initialized to `null` (now `0`) and was set to the raw 0-100 `result` at final completion instead of the normalized out-of-10 value (now `Number((result / 10).toFixed(1))`); `scoreOutOf10` was missing from data normalization (now `post.scoreOutOf10 ??= 0;`); `post.subjectId = folderName` was removed; question-level `startTime`/`endTime` (on `this.allQuestions[...]` and `currentQ`) were using the root-level `getDate()` format and now use a newly added `getQuestionTime()` helper, while root-level `this.posts.startTime`/`this.posts.endTime` keep `getDate()` unchanged; a `console.log(this.posts)` full-post dump after load, a `console.log(this.posts.questions)` dump in `handleEnter()`, a `"SCORM debug data:"` object dump, and a `"SCORM completion data:"` object dump in `scormPost()` were all removed in favor of the QA/cloud logging dispatchers.
- Verification performed: `node --check` syntax validation; `git diff` reviewed in full and grepped for `studentScore|askedQuestions|allQuestions|showResultScreen|LOcorrectcounter|animations\.|playSegments|Audio\(|handleKeyPress|checkAnswer|playDynamicFeedback|getAdjustedScore|getAnimationRangeByLevel|feedbackMessage|feedbackImage|computerScore` against removed lines — matches were limited to the intentional `getDate()`→`getQuestionTime()` timestamp fixes and the `scormPost()`/`calculateCurrentAttemptScore()` rewrite; the badge/feedback system, animations, audio, keyboard, and answer-checking logic were not altered.
- Remaining risk: same as `buzzTime/js/main.js` — no `Educational_stage`/`preparePostFeedbackMetadata` wiring (this template also has no `Educational_stage` field and does not load `progress.js`), and the same `parseScormTimeToSeconds` fallback-to-`0` behavior for unrecognized persisted time formats.
- **2026-07-20 `completeSession()` ordering fix + `FINAL_QUESTION_FEEDBACK_AND_TERMINAL_LOGGING_POLICY` re-verification:** same audit and same finding as `buzzTime/js/main.js` this same day — the `handleEnter()` → `updateScoreAndHints(isCorrect)` funnel already fires exactly once per question (same `enterPressed` guard), so no logging-timing change was needed. `scormPost()`'s SCORM-connected branch had the same `completeSession()`-before-`applyHighestScormScore()`/`persistFinalActivityState()`/`logPostAfterFinalFeedback()` ordering violation; fixed identically, preserving the file's own early-return coding style and leaving the dead `//window.ScormService.finish();` line untouched. Verified via `node --check` (pass) and `git diff` (isolated to the relocation). Same `finishAutoStart()` under-logging observation as `buzzTime/js/main.js` applies here too — not fixed, out of scope.
- **2026-07-20 `BUZZTIME_AUTO_COMPLETION_SCORING_AND_LOGGING` fix:** identical gap and identical fix as `buzzTime/js/main.js` (see that entry's 2026-07-20 bullet for the full explanation) — this file's `finishAutoStart()` had the same byte-identical under-logging pattern on a correct auto-detected answer (manual `endTime`/`posts` sync only, no score/counter update, no `UpdateStudentActivity()`, no `logPostAfterAnswerAttempt()`), and the same non-terminal, no-scoring-needed wrong-answer branch. Same fix applied: `updateScoreAndHints(isCorrect, options = {})` gained an `options.silent` flag gating only the celebration/fail audio and animation calls (all data/scoring/logging statements remain unconditional); a per-question-index terminal guard (`questionTerminalState: {}`, added to `data()`) was added at the top of `updateScoreAndHints()` to make the real-vs-auto race safe; `finishAutoStart()`'s correct branch now calls `this.updateScoreAndHints(true, { silent: true })` in place of its old manual sync, immediately before `finalizeTurn(true)`. Verified via `node --check` (pass) and `git diff` (isolated to the same shape of change: guard/data property, `silent`-gating, and the `finishAutoStart()` call-site swap). `OVERALL_ACTIVITY_COMPLETION` remains owned exclusively by `scormPost()`, unchanged. Browser verification not performed.

## `2026_2027/allTemplete/ara/storyline-q/mymovie.html` (Storyline Q)

- **Target entry HTML:** `2026_2027/allTemplete/ara/storyline-q/mymovie.html` — a first-time migration target and a previously undocumented template family, distinct from every prior Digital Screen/Penguin/Space entry.
- **Discovered dependency graph** (all paths resolved relative to `mymovie.html`, confirmed by reading every file):
  ```text
  mymovie.html
  ├── ../../../lib-native/storyline-q/assets/js/lottie-min.js   [SHARED_OR_GENERATED — vendor animation lib]
  ├── ../../../lib-native/storyline-q/assets/js/vue.js          [SHARED_OR_GENERATED — vendor, Vue 2]
  ├── ../../../js/scorm.js                                      [SHARED_OR_GENERATED — vendor pipwerks SCORM 1.2 API wrapper]
  ├── ../../../js/scorm-lo.js                                   [SCORM_INTEGRATION — shared `window.ScormService`; read-only, already canonical]
  ├── ../../../js/submit_sender.js                              [PLATFORM_PERSISTENCE + ENTRY_AND_BOOTSTRAP — defines `globalFunctions` (class `Global`) incl. `UpdateStudentActivity(id, posts)`, `direction`, `returnData`, `finalResponse` stub; shared across many templates]
  ├── input.js / correct.js / choose.js / match.js / drag.js   [ANSWER_EVALUATION — per-question-type checking utilities (`checkChoose`, `checkInputALL`, `MatchManager`, `DragDropManager`, etc.); grepped for `scorm|finish\(|UpdateStudentActivity|completion_status|success_status|reportResult|completeSession` — zero matches in all five]
  ├── main.js                                                   [ACTIVITY_STATE + FINAL_FEEDBACK + SCORM_INTEGRATION call sites + LOGGING_AND_METADATA — the Vue root instance `window.app`; the sole runtime owner]
  └── animation.js                                              [SHARED_OR_GENERATED — empty stub, no-op]
  ```
- **Runtime architecture:** Vue 2 SPA (`window.app`, mounted on `#Question`), a distinct multi-question-type quiz engine (`choose`, `trueFalse`, `dragDrop`, `match`, `input`, `correct`) that shuffles questions across type/subType groups (`shuffleQuestions()`), with a single shared answer-completion funnel (`afterCheckAnswer()`, called by `selectChoose()`, `checkDragDrop()`, `checkAnswers()` for matching, and `checkInputALL()`) and a single synchronous final-completion path (`loadQuestion()` sets `finishLO = true` when `questionIndex >= questions.length`, activates the `feedback`/`homeButtonShow` DOM state, then calls `finished()`, which calls `scormPost()` directly — no `scheduleFinalScormPost()`/`FINAL_FEEDBACK_DELAY`/latch pattern exists or was needed, already matching the immediate-execution policy).
- **Runtime owner file:** `2026_2027/lib-native/storyline-q/assets/js/main.js` only. Had none of the canonical SCORM patterns implemented before this migration.
- **Implementation strategy selected: STRATEGY_A (MODIFY_EXISTING_RUNTIME).** `main.js` is a non-generated, template-authored (not vendor/minified) file that owns 100% of the required lifecycle (state, answer completion, final detection, SCORM, persistence, logging) directly — no adapter or multi-file patch was needed. `mymovie.html`, `scorm-lo.js`, `scorm.js`, `submit_sender.js`, and all five question-engine files were inspected and confirmed to require zero changes.
- **Files modified:** `2026_2027/lib-native/storyline-q/assets/js/main.js` (canonical SCORM/persistence/logging migration, then the 2026-07-19 logging-timing correction below); `2026_2027/lib-native/storyline-q/assets/js/correct.js` and `2026_2027/lib-native/storyline-q/assets/js/input.js` (2026-07-19 debug-log removal only — no lifecycle/logic changes).

### SHARED_CANONICAL_BEHAVIOR (implemented identically to the rest of the codebase)

- Root runtime object: `window.app` (Vue instance); question/interaction collection: `this.posts[0].questions` (via the `questions` computed property).
- **`restorePersistedCmi()`** — did not exist at all. `getData()`'s `direction == "2"` branch parsed `learningObjectAsJson` into `jsonData` but never captured it into a `restoredPost` variable (didn't exist) and the reassignment to `this.posts[0]` was already commented out, so persisted CMI was silently discarded on every return visit. Added `let restoredPost = null;` at the top of `getData()`, populated it in the `direction == "2"` branch (`restoredPost = Array.isArray(jsonData) ? jsonData[0] : jsonData;` plus the `previousScormScore` capture), added the canonical helper, and called it at the point where fresh activity data, prior platform data, and default CMI/`studentProgress` structures all exist but the new attempt hasn't started — inside the existing deferred `setTimeout` callback in `getData()`, immediately after the `cmi`/`studentProgress` default blocks and before `preparePostFeedbackMetadata`.
- **`NumberOfAttempt`** — never initialized. Added `initializeNumberOfAttempt(post, restoredPost)`, called immediately after `restorePersistedCmi`, guarded by a new `numberOfAttemptInitialized` data property; increments once per visit (called once in `getData()`, not per question).
- **Highest-score retention** — `scormPost()` previously overwrote `cmi.score.raw`/`scaled` with only the current attempt's value, so a later lower attempt could regress a previously passed activity. Added the full canonical helper set (`normalizeScormScore`, `getHighestScormScore`, `applyHighestScormScore`, `updateScormScoreAfterAnswer`) and wired `updateScormScoreAfterAnswer(currentAttemptScore)` into the existing `UpdateStudentActivity()` (the shared per-answer path called from `afterCheckAnswer()` for all six question types), so per-answer score sync and highest-score tracking now happen live.
- **Cumulative total time** — `scormPost()` wrote `total_time` via the non-cumulative `msToScormTime(Date.now() - this.scormStartTime)`, discarding any previously-persisted total. Added `parseScormTimeToSeconds`/`formatSecondsToScormTime`, applied in `scormPost()` as `previous persisted total + current session elapsed`; the pre-existing `msToScormTime` remains defined but is superseded at the final-completion call site. The session timer (`scormStartTime`) is set only after `restorePersistedCmi`/`initializeNumberOfAttempt` run, inside the same deferred `getData()` callback.
- **`persistFinalActivityState()`** — did not exist; the finalized CMI (highest score, final statuses, cumulative time) was never re-persisted to the platform after `scormPost()` computed it, only per-answer `UpdateStudentActivity()` calls existed. Added the canonical guarded helper, reusing the target's own `globalFunctions.UpdateStudentActivity(id, posts)` (defined in `submit_sender.js`, unmodified) as the platform update mechanism — the same mechanism used by every other migrated template.
- **QA Metadata Logging Pattern** — did not exist at all. Added `getQuestionCollectionName`, `isScormCloudEnvironment`, `logQaMetadata`, `logScormCloudSummary`, `logPostAfterFinalFeedback`. `logPostAfterFinalFeedback()` is wired into `scormPost()`'s final branch (logs once, after final CMI application and persistence). The per-question (non-final) logging trigger was originally wired into `afterCheckAnswer()` and was subsequently corrected — see `### LOGGING_TIMING_CORRECTION (2026-07-19)` below.
- **CRITICAL — `window.ScormService.finish()` removal.** Was being actively called: unguarded inside `scormPost()`'s SCORM-connected branch (`window.ScormService.reportResult(result); window.ScormService.finish();`) and uncommented in the `beforeunload` handler — both violate the current no-`finish()` policy. Removed the `scormPost()` call, replaced with the standard guarded-and-inert dead scaffolding (`if (typeof window.ScormService.finish === "function") { setTimeout(() => { //window.ScormService.finish(); }, 1000); }`), and commented out the `beforeunload` call. Also guarded the surviving `reportResult` with `typeof window.ScormService.reportResult === "function"` (was unconditional) and replaced the inline connection check with the canonical `isScormServiceConnected()` helper.
- **`completeSession()`** — added fresh (none existed before), guarded by `typeof window.ScormService.completeSession === "function"`, positioned after `applyHighestScormScore()`/`persistFinalActivityState()`/`logPostAfterFinalFeedback()` and before the dead `finish()` scaffolding, per the canonical rule.
- **Finalization function and exact call order:** `scormPost()` (kept its existing name; no rename needed). Guarded by `scormReported` for single execution. Connected-branch order: `calculateCurrentAttemptScore()` → `studentPoint` → cumulative `cmi.total_time` → `reportResult()` → `applyHighestScormScore()` (final statuses) → `persistFinalActivityState()` → `logPostAfterFinalFeedback()` → `completeSession()` → dead `finish()` scaffolding. Verified via grep: `reportResult` (line ~1426) → `applyHighestScormScore` (~1432) → `persistFinalActivityState` (~1437) → `logPostAfterFinalFeedback` (~1438) → `completeSession` (~1442).
- **Immediate final execution — no artificial delay.** `finished()` (called once, from `loadQuestion()`'s single final branch — the only path to completion, reached identically whether the last question was answered correctly or incorrectly) calls `this.scormPost()` directly and synchronously. No `FINAL_FEEDBACK_DELAY` was ever present in this file and none was added; no `setTimeout()` wraps the finalization call itself. The internal `1000`ms `setTimeout()` inside `scormPost()`'s own SCORM-connected branch (waiting for the SCORM API calls, not for final feedback) is the same pattern preserved untouched across every other file in this codebase.
- Other corrected pre-existing spec violations: `studentPoint` was initialized to `null` (now `0`) and stored as the raw 0-100 percentage instead of the normalized out-of-10 value (now `Number((result / 10).toFixed(1))`); a verbose `"SCORM debug data:"` object dump (the full `cmi` object plus several post fields) inside `getData()`'s deferred callback was removed in favor of the QA/cloud logging dispatchers.

### STORYLINE_Q_TARGET_ADAPTATION (target-specific, not shared elsewhere)

- Score calculation uses `calculateCurrentAttemptScore()` → `(LOcorrectcounter / posts[0].numberOfquestion) * 100` — same formula as the reference, factored out of the inline computation previously duplicated in `scormPost()`. `finished()`'s own separate inline computation (used only for the bucketed `counterCorrect` value passed to `finalResponse.submitData`, a target-specific 0/2.5/5/7.5/10 banding unrelated to SCORM) was left untouched since it serves a different purpose.
- `isFinalQuestionAttempt()` (used by `logAfterQuestionFinalFeedback()`, see below) is `this.questionIndex >= this.questions.length - 1` — "the last question currently being answered" — deliberately distinct from `finishLO`/`scormPost()`'s own "LO fully complete" check, since the per-question feedback boundary is reached before `finishLO` is set on the actual last question.
- CMI initialization, `restorePersistedCmi`/`initializeNumberOfAttempt` call sites, and `scormStartTime` capture all live inside a pre-existing `setTimeout(..., 1000)` callback in `getData()` — an unusual, target-specific deferred-execution architecture (unlike every other migrated file, which does this synchronously) that was preserved exactly rather than collapsed, since doing so was outside this task's scope and risked disturbing unrelated timing-dependent UI setup.
- The six question-type engines (`choose`/`trueFalse`/`dragDrop`/`match`/`input`/`correct`), `shuffleQuestions()`'s type/subType grouping, the `setSafeTimeout`/`clearAllTimeouts` retry-timing wrapper, and the SVG line-drawing logic for `match` were not touched — confirmed via `git diff` grepped for `dragDrop|match|choose|trueFalse|shuffleQuestions|shuffleAnswers|checkStateFeedBack|setSafeTimeout|drawLine|touchStart|touchMove|touchEnd|dragStart|dragEnd`, zero matches against removed lines.

### LOGGING_TIMING_CORRECTION (2026-07-19)

The initial migration wired `logPostAfterAnswerAttempt()` into `afterCheckAnswer()` — the shared answer-completion funnel called by `selectChoose()`, `checkDragDrop()`, `checkAnswers()`, and `checkInputALL()` on **every** answer attempt. Because `afterCheckAnswer()` fires for wrong attempts, retryable attempts, and correct attempts alike (it is the generic "an evaluation just ran" hook, not a "the question is done" hook), the canonical QA/SCORM-Cloud log was appearing after every attempt instead of once per completed question. `correct.js`/`input.js` also contained unrelated debug `console.log` leaks (raw counters, full question objects, static strings) firing on every `showAnswer()`/`checkanswer()` call.

**Two timing rules are distinct and must not be conflated:**

```text
PER_QUESTION_SCORE_UPDATE:
after the target-specific evaluated answer state
  (UpdateStudentActivity() → calculateCurrentAttemptScore() → updateScormScoreAfterAnswer(),
   called from afterCheckAnswer() on every attempt — UNCHANGED)

PER_QUESTION_CONSOLE_LOG:
after the completed question's final feedback becomes active
  (activateFinalFeedback() → logAfterQuestionFinalFeedback(), called only from the
   terminal branches of checkStateFeedBack() where nextButtonShow is set true — CORRECTED)
```

- **Previous attempt-level logging call site (removed):** `afterCheckAnswer()`'s `this.logPostAfterAnswerAttempt();` call (fired on every attempt, correct or wrong, retryable or terminal). The `logPostAfterAnswerAttempt()` method itself was removed; its role is replaced by `logAfterQuestionFinalFeedback()`.
- **True question-completion boundary identified:** `checkStateFeedBack()` sets `this.nextButtonShow = true` immediately before calling `this.getFeedback()` at exactly the branches that represent a *terminal* per-question outcome — first-attempt terminal (≤2 choices, single-attempt questions), second-attempt terminal (all types), and any correct answer (always terminal). The one branch that does **not** set `nextButtonShow` (first wrong attempt on a >2-choice question, which instead sets `reloadButtonShow = true`) is the retryable/non-terminal case and was left untouched — it still calls `getFeedback()` to show inline feedback, but never reaches the logging trigger.
- **New completed-question feedback logging hook:** added `activateFinalFeedback()`, which replaces the five duplicated `this.nextButtonShow = true; this.getFeedback();` pairs inside `checkStateFeedBack()`'s terminal branches with a single call: `this.nextButtonShow = true; this.getFeedback(); this.logAfterQuestionFinalFeedback(this.questionIndex);`. No `setTimeout()` was added for logging — the hook reuses the pre-existing `setSafeTimeout` chains that already gate when feedback becomes visible.
- **Duplicate-prevention mechanism:** added `questionLogged: {}` to `data()` (an object keyed by question index, not a single global boolean, so later questions are never blocked by an earlier question's guard). `logAfterQuestionFinalFeedback(questionIndex)` returns early if `this.questionLogged[questionIndex]` is already `true`, otherwise sets it and dispatches to `logScormCloudSummary()`/`logQaMetadata()`.
- **Last-question suppression:** `logAfterQuestionFinalFeedback()` returns early when `isFinalQuestionAttempt()` is `true` (i.e., `questionIndex >= questions.length - 1`), exactly as the old `logPostAfterAnswerAttempt()` did — so `activateFinalFeedback()` still fires (setting `nextButtonShow`/showing feedback normally) on the last question, but no normal per-question log is produced. The last question's sole log comes from `logPostAfterFinalFeedback()`, called once from `scormPost()`'s final branch (unchanged finalization order, unchanged position relative to `completeSession()`).
- **Engine debug logs removed:** `correct.js` — `checkanswer()`'s two raw-counter `console.log` calls, and `showAnswer()`'s three debug calls (`console.log(activeQuestion)` ×2, `console.log("Show Answer Called")`, `console.log(\`This Is Active Qusetions\`)`). `input.js` — `checkanswer()`'s two raw-counter `console.log` calls (identical duplicated function to `correct.js`). `main.js` — two duplicate `console.log(el)` DOM-element dumps inside `shoWDragDropAnswer()`, and the `"Show All Answer Called"` labels in `showInputsAnswer()`/`showCorrectAnswer()`. `choose.js`, `drag.js`, and `match.js` were inspected and contained no debug/unwanted console output — not modified. Genuine `console.error`/`console.warn` diagnostics (ScormService init failures, all `try/catch` blocks) and the two canonical output statements (`logQaMetadata`'s `console.log(qaObject)`, `logScormCloudSummary`'s summary line) were left untouched.
- **Per-answer score synchronization confirmed unaffected:** `UpdateStudentActivity()` (still called from `afterCheckAnswer()` on every attempt) still runs `calculateCurrentAttemptScore()` → `updateScormScoreAfterAnswer()` → `applyHighestScormScore()` before any logging concern; `correctAnswerSolve()`'s `LOcorrectcounter` increment, `numOfAttemp` tracking, and question `startTime`/`endTime` timestamps are all set in their original locations, untouched by this correction.
- **Finalization order confirmed unchanged:** `reportResult()` → `applyHighestScormScore()` → `persistFinalActivityState()` → `logPostAfterFinalFeedback()` → `completeSession()`, still inside `scormPost()`'s `scormReported`-guarded branch; `completeSession()` was not moved.

### Generated/shared files intentionally not modified

`mymovie.html` (entry, only loads scripts — no lifecycle logic of its own), `lottie-min.js`, `vue.js`, `scorm.js` (vendor), `scorm-lo.js` (shared adapter, already canonical, read-only), `submit_sender.js` (shared platform-persistence/global-state file used by many templates), `choose.js`, `match.js`, `drag.js` (confirmed zero SCORM involvement and zero unwanted console output via inspection), `animation.js` (empty stub). Note: `correct.js` and `input.js` are listed as modified above (debug-log removal only, no lifecycle/scoring/answer-validation changes) — see `LOGGING_TIMING_CORRECTION` for the exact lines removed.

### Verification performed

`node --check` syntax validation on `main.js`, `correct.js`, `input.js` (pass); `git status --short` confirmed only `main.js`, `correct.js`, and `input.js` changed within the entire dependency graph (`choose.js`, `drag.js`, `match.js`, `mymovie.html`, and all shared/vendor files unchanged); grepped the runtime for `console.log|console.info|console.debug|console.warn|console.error|logQaMetadata|logScormCloudSummary|logPostAfterFinalFeedback|completeSession|setTimeout|FINAL_FEEDBACK_DELAY` — confirmed zero `FINAL_FEEDBACK_DELAY` occurrences; zero active (uncommented) `.finish(` call sites; the only remaining `console.log`/`console.info`/`console.debug` calls in `main.js` are the two canonical logging methods' output statements and two one-time bootstrap logs (`"Lo Started...."`, `"ScormService init:"`) unrelated to per-question/per-attempt logging; all remaining `console.warn`/`console.error` calls are genuine diagnostics inside `try/catch` blocks; `correct.js`, `input.js`, `choose.js`, `drag.js`, `match.js` contain zero active `console.*` calls; confirmed via grep line numbers that `logAfterQuestionFinalFeedback`/`activateFinalFeedback` are called only from `checkStateFeedBack()`'s terminal branches and not from any generic answer-attempt handler; confirmed the exact finalization order and `completeSession()` position are unchanged from the prior migration.

### Remaining limitations

`subjectId` is not present anywhere in this file's `data.json`/runtime post — no violation to fix, JSON-only sourcing is trivially satisfied. Same `parseScormTimeToSeconds` fallback-to-`0` behavior as the other migrated files for unrecognized persisted time formats. This file's `completeSession()` position (after final persistence) diverges from the current `zoki.js` (Digital Screen Choose) reference, which still calls it in the earlier (pre-persistence) position — consistent with every other file migrated in this session. Browser/runtime verification (first launch, restored launch, correct/wrong answer paths per question type, retry-then-correct, penultimate vs. last question, local vs. SCORM Cloud environment) was **not performed** — only static analysis, syntax checking, and diff/grep verification were carried out.

### RE-VERIFICATION_UNDER_GENERALIZED_POLICY (2026-07-20)

Re-audited `main.js` (plus `correct.js`, `input.js`, `choose.js`, `drag.js`, `match.js`) under the "Shared/repeatable interaction handlers" subsection of `FINAL_QUESTION_FEEDBACK_AND_TERMINAL_LOGGING_POLICY`, specifically checking whether `match`'s per-pair-drawn callback or `dragDrop`'s per-item-dropped callback could reach `activateFinalFeedback()`/canonical logging more than once per question, independent of the `checkStateFeedBack()`-branch analysis the prior `LOGGING_TIMING_CORRECTION` already covered.

- `match.js` (`MatchManager.checkAnswers()`) and `drag.js` (`DragDropManager.checkAnswers()`) both compute their full result set in one synchronous pass over all lines/drags and return a single aggregate object — neither exposes a per-pair/per-item completion callback.
- The genuinely per-item handlers in `main.js` — `handleDrop()`, `touchEndDrag()`, `dragEnd()`/`drop()` (match line-drawing) — only mutate local drop-slot/line state (`INTERACTION_OCCURRED`); none of them call `afterCheckAnswer()`, `checkStateFeedBack()`, or any logging method.
- Only the explicit "Check" actions — `checkDragDrop()` and `checkAnswers()` (match), bound via `mymovie.html`'s `@click="checkDragDrop()"` / `@click="checkAnswers()"` — call `afterCheckAnswer()`, exactly once per click.
- Even under a hypothetical repeat-click race (before `checkStateFeedBack()`'s `poniterEvent`-class click-block is lifted by the delayed `getFeedback()` call), `logAfterQuestionFinalFeedback(questionIndex)`'s existing `questionLogged[questionIndex]` per-index guard (added by the 2026-07-19 correction) prevents a second log for the same question regardless of how many times `activateFinalFeedback()` executes — rule B holds via this guard as a second line of defense, not merely via the `checkStateFeedBack()` branch structure alone.
- `completeSession()` ordering reconfirmed unchanged and correct: `reportResult()` → `applyHighestScormScore()` → `persistFinalActivityState()` → `logPostAfterFinalFeedback()` → `completeSession()`, inside `scormPost()`'s `scormReported`-guarded branch.
- **Conclusion: no source change required.** `main.js`, `correct.js`, `input.js`, `choose.js`, `drag.js`, `match.js` were all inspected; grepped for `console.*|scormPost|completeSession|logQaMetadata|logScormCloudSummary|logPostAfterFinalFeedback|logAfterQuestionFinalFeedback|FINAL_FEEDBACK_DELAY|\.finish\(` in the five engine files — zero matches in any of them. `node --check` on `main.js` (pass); `git status`/`git diff` for the entire `storyline-q` directory tree confirmed empty (no changes this pass).

## `2026_2027/lib-native/glossary/assets/js/main.js`

- **First documented `SCORM_RUNTIME_ALIGNMENT` pass for this file (`TARGET_SCRIPT` invocation, 2026-07-20).** This is a distinct, previously-undocumented template family — a free-exploration "gate" activity (4 fixed gates: mean/reverse/plural/single), not a question-by-question quiz. The file already had a substantial hand-written SCORM implementation (init guard, `restorePersistedCmi`, `initializeNumberOfAttempt`, highest-score preservation, cumulative time, QA/cloud logging dispatchers, `scormReported` guard) predating any documented migration — this pass audited it against the full "# 6. Validation Checklist" and fixed the gaps found, rather than re-implementing from scratch.
- Runtime architecture: single Vue instance (`#glossary`). The one shared interaction handler is `openTable(gate)`, bound to every gate click. A gate's first click marks `items[gateIndex].check = true`, increments `LOcorrectcounter`/`counterCorrect`, and is the `QUESTION_TERMINAL_STATE` for that gate; re-opening an already-checked gate (`items[gateIndex].check` already `true`) is `INTERACTION_OCCURRED` only — the same gate can be reopened freely to re-browse its word list without that being a new "answer." `isFinalQuestionAttempt()` is `LOcorrectcounter >= numberOfquestion` (i.e., all 4 gates opened at least once); `OVERALL_FINAL_FEEDBACK`/completion is `scormPost()`'s own `isActivityComplete` check, called from both branches of `openTable()`'s `if`/`else` and self-gated by `scormReported`.
- **Gap 1 (found and fixed) — Console Logging Pattern / Initialization Pattern violation:** the SCORM init block printed two non-error status logs on success (`console.log("Lo Started....")`, `console.log("ScormService init:", scormConnected)`) plus a `console.warn("ScormService not found on window")` when absent — none of which are in the canonical allowed-log list ("# 4. Console Refactoring Standard": only `console.error("ScormService init error:", e)` and `console.error(e)` inside SCORM `try/catch` blocks are permitted). Removed all three; the init block now matches the reference `zoki.js`/`zoki_.js` shape exactly (silent on success, `console.error` only on thrown exceptions).
- **Gap 2 (found and fixed) — stale-JSON restoration bug (CMI Restoration / Data Normalization Pattern violation):** in `getData()`'s `direction == "2"` branch, the restored `learningObjectAsJson` payload was being assigned wholesale to `this.posts[0] = jsonData`, before the fresh `pageUrl + ".json"` fetch even ran. Because this made `this.posts.length` non-zero, the subsequent `if (this.posts.length == 0) { this.posts = this.localPosts; }` check then skipped assigning the freshly-fetched live JSON entirely — a returning learner would keep seeing the *old, persisted* gate/glossary-word content forever, never picking up any update to the source JSON, and only `restorePersistedCmi()`'s explicit field-by-field copy (already correctly scoped) was actually intended to carry data across visits. This is the exact anti-pattern the "CMI Restoration" section warns against: "the live activity data should keep loading fully from its normal JSON/runtime source for the current session; only the specific SCORM-continuity fields carry over from the restored payload." Fix: removed the `this.posts[0] = jsonData` reassignment (and its dependent `LOcorrectcounter`/`counterCorrect`/`item.check` reset lines) from the `direction == "2"` branch, keeping only `restoredPost = jsonData` (used by `restorePersistedCmi`/`initializeNumberOfAttempt`/the early `previousScormScore` capture, all unchanged). `this.posts.length == 0` is now always true at the check (posts is never pre-populated), so live JSON is always loaded as the activity's source of truth, matching the canonical pattern. The `LOcorrectcounter = 0; counterCorrect = 0; items.forEach(item => item.check = false)` reset was preserved but moved to run unconditionally immediately after the live JSON is assigned — this keeps the file's original intended behavior (progress restarts fresh each visit; gates must be re-opened) while now applying it to live/current gate content instead of stale persisted content.
- **Gap 3 (found and fixed) — Shared/repeatable interaction handler over-logging (rule B violation):** `this.UpdateStudentActivity()` (which internally calls `updateScormScoreAfterAnswer()` and `logPostAfterAnswerAttempt()`) was called unconditionally at the end of `openTable()`, *outside* the `if (already checked) {...} else {first-time check...}` branch — meaning every re-click on an already-completed gate re-triggered the per-question SCORM score sync and canonical QA/cloud log, even though nothing about the activity's state had changed (`INTERACTION_OCCURRED` without `QUESTION_TERMINAL_STATE`, the exact pattern documented in "Shared/repeatable interaction handlers"). Fix: moved `this.UpdateStudentActivity();` into the `else` branch, immediately after the existing `this.scormPost();` call, so it now fires only once, at the moment a gate is actually completed for the first time. Re-opening an already-checked gate now only re-renders its word list (`getSlideWords()`/`appendText()`) with no SCORM/logging side effects. `logPostAfterAnswerAttempt()`'s existing `isFinalQuestionAttempt()` guard is unaffected and continues to correctly suppress the ordinary per-gate log for the gate whose first-time click brings `LOcorrectcounter` to `numberOfquestion` (the true last gate), since the counter increment (top of the `else` branch) happens before this call.
- **Gap 4 (found and fixed) — `persistFinalActivityState()` missing entirely + `completeSession()` ordering violation (Final CMI Persistence / `completeSession()` Canonical Rule violations):** `scormPost()` computed and applied the final highest score/status locally (`applyHighestScormScore(...)`) but never re-persisted the finalized post to the platform afterward — no `persistFinalActivityState()` helper existed anywhere in the file, so a device syncing only through `globalFunctions.UpdateStudentActivity` would never receive the final CMI statuses. Separately, `window.ScormService.completeSession()` was called *before* the final QA/cloud log (`logPostAfterFinalFeedback()`, which itself ran synchronously immediately after `applyHighestScormScore()`, not waiting for the 1000ms-delayed `reportResult()`/SCORM-connected branch at all) — violating the required order in both respects. Fix: added the canonical guarded `persistFinalActivityState()` helper (identical shape to every other migrated file in this codebase). Restructured `scormPost()`'s tail so that, in the SCORM-connected branch, `reportResult()` → `persistFinalActivityState()` → `logPostAfterFinalFeedback()` → `completeSession()` (its own guarded `try/catch`) → dead `finish()` scaffolding now all execute inside the same 1000ms-delayed callback, in that order; a new `else` branch covers the not-connected case with `persistFinalActivityState()` → `logPostAfterFinalFeedback()` running immediately, matching the pattern used everywhere else in this codebase. `applyHighestScormScore(...)` itself was left running once, before the branch (unchanged), since it has no connectivity dependency.
- Cumulative time (`parseScormTimeToSeconds`/`formatSecondsToScormTime`), highest-score preservation (`getHighestScormScore`/`applyHighestScormScore`/`updateScormScoreAfterAnswer`), `NumberOfAttempt` initialization/increment-once guard, `scormReported` single-execution guard, and QA Metadata Logging (including `studentPoint`) were all already correctly implemented and were not modified.
- **Canonical default: `total_time` initialization** — the fresh-`cmi` initializer used the legacy `total_time: "PT0H0M0S"` default; corrected to `"00:00:00"` per the existing canonical rule (default-value-only change; `parseScormTimeToSeconds()` already accepts both formats for restoring older persisted records, and was not modified).
- Preserved untouched: drag-and-drop word-matching mechanics (`dragstart`/`drag`/`dragend`, `touchstart`/`touchmove`/`touchend`), pagination (`next()`/`prev()`/`getSlideWords()`), audio/music toggling, the gate-list construction logic in `getData()` (including its pre-existing `items.length` vs. `numberOfquestion` distinction — see remaining risk below), and the `beforeunload` handler (already had `finish()` commented out, matching the no-`finish()`-call policy; not touched).
- Verification performed: `node --check` (pass); `git diff` reviewed in full and confirmed isolated to the five gaps above — no changes to drag/drop, pagination, audio, or the gate/word data model. Grepped for `logPostAfterAnswerAttempt|UpdateStudentActivity|persistFinalActivityState|logPostAfterFinalFeedback|completeSession|scormReported|\.finish\(|FINAL_FEEDBACK_DELAY|setTimeout` — confirmed every remaining occurrence is either a definition, a correctly-scoped call site (both branches of `scormPost()` reach `persistFinalActivityState()`/`logPostAfterFinalFeedback()`; `completeSession()` now follows both), or an unrelated UI `setTimeout` (loading-state delay, drag/drop `poniterNone` reset) distinct from the canonical SCORM-API-call delay and the forbidden `FINAL_FEEDBACK_DELAY` pattern (which does not exist in this file).
- Remaining risk (observed, not fixed — pre-existing, outside this pass's narrow scope): the `if (checked) { if (LOcorrectcounter == items.length) { scormPost(); } }` fallback re-trigger branch compares against `items.length` (the *total* items array, including placeholder entries pushed for any of the 4 gates missing real content in `getData()`), whereas `scormPost()`'s own authoritative completion check and the `else` branch's fallback both correctly use `numberOfquestion` (the filtered non-empty-item count). If any gate lacks real content, this fallback re-trigger condition may never become true — harmless in practice since `scormPost()` already fires unconditionally from the `else` branch's first-time-completion path and is idempotent via `scormReported`, so this only affects a defensive fallback path, not the primary completion trigger. Left untouched as pre-existing business logic outside this pass's SCORM/logging/persistence scope.
- Browser verification: not performed — static analysis, syntax checking, and diff/grep verification only.

## `2026_2027/js/scorm-lo.js` (shared `window.ScormService` adapter)

- **2026-07-21 `normalizeScore()` decimal-precision fix (`TARGET_SCRIPT` invocation) — see "SCORM Score Decimal Precision Policy" above for the full normative rule.** Root cause: `normalizeScore(score)` computed `Math.round(Number(score))`, truncating every learning-object-calculated decimal score (e.g. `33.3`, `66.7`) to a whole number (`33`, `67`) before it ever reached `bestScore`, `cmi.core.score.raw`, or SCORM Cloud — while the learning-object runtime's own console summary and `post.cmi.score.raw` correctly retained the decimal value, producing a display mismatch (`33.3` in-app vs. `33.00 %` on SCORM Cloud).
- **Fix:** replaced the body of `normalizeScore()`:
  ```js
  function normalizeScore(score) {
    const normalizedScore = Number(score);

    if (!Number.isFinite(normalizedScore)) {
      return null;
    }

    const clampedScore = Math.max(0, Math.min(100, normalizedScore));
    return Number(clampedScore.toFixed(1));
  }
  ```
  This is the only change in the file. `Math.round()` was removed; `Number.isNaN` was widened to `!Number.isFinite` (also rejects `Infinity`/`-Infinity`, a strict superset of the prior invalid-value rejection); clamping to `0–100` is unchanged; `.toFixed(1)` (converted back to `Number`) was added solely to normalize floating-point noise to the one-decimal-place precision the learning-object runtimes actually calculate at — it is not integer rounding.
- **Complete decimal-score control-flow trace (every consumer re-verified, not assumed from the diff alone):**
  - `init()` → `normalizeScore(scorm.get("cmi.core.score.raw"))` → `bestScore = savedScore`. A previously-saved `"66.7"` is now restored as `66.7` (previously `67`). Nothing between this assignment and `bestScore`'s later reads (`updateBestScore`'s comparison, `getBestScore()`) re-rounds it.
  - `updateScore(score)` (per-question intermediate sync) → `updateBestScore(score)` → `normalizeScore(score)` computed once, compared against the current decimal `bestScore`, assigned to `bestScore` verbatim if higher → `scorm.set("cmi.core.score.raw", String(bestScore))`. `String(33.3)` → `"33.3"`; no `.toString(10)` radix coercion, no template-literal numeric formatting, no second rounding step exists between `updateBestScore`'s assignment and this `scorm.set()` call.
  - `reportResult(score)` (final sync) → same `updateBestScore(score)` call, same decimal `bestScore` → `scorm.set("cmi.core.score.raw", String(bestScore))` → `scorm.set("cmi.core.lesson_status", bestScore >= 50 ? "passed" : "failed")`. The threshold comparison reads the same unrounded `bestScore` used for the score write, evaluated in the same synchronous statement block — no intervening mutation of `bestScore` occurs between the `score.raw` write and the `lesson_status` write.
  - `getBestScore()` → `return bestScore;`, a direct unmodified return of the decimal value — the only consumer outside this file is each learning-object runtime's `getHighestScormScore()`, which already includes it in its own `Math.max(...)` comparison (unaffected by this change, not part of this file, not modified).
  - **Why no later operation converts the score back to an integer:** grepped the full score pipeline (`normalizeScore`, `updateBestScore`, `updateScore`, `reportResult`, `getBestScore`, and their call sites in `init()`) for `Math.round`, `parseInt`, `Math.floor`, `Math.ceil`, and bitwise coercion (`| 0`, `~~`, `>>> 0`) — the only `Math.floor()` occurrences in the file are in `reportResult()`'s session-time formatting (`diffMs`/`totalSeconds` → `hh:mm:ss`), which operates on elapsed milliseconds, not the score, and was not touched.
- **Highest-score verification:** re-traced `updateBestScore`'s `currentScore > bestScore` comparison with decimal inputs — `66.7` existing + `33.3` new → `33.3 > 66.7` is `false`, `bestScore` stays `66.7` (not downgraded); `33.3` existing + `66.7` new → `66.7 > 33.3` is `true`, `bestScore` becomes `66.7`; `66.7` existing + `66.6` new → `66.6 > 66.7` is `false`, `bestScore` stays `66.7`. All three match the required examples exactly; the comparison operator and logic were not changed, only the precision of the values being compared.
- **Pass/fail threshold verification:** `reportResult()`'s `bestScore >= 50 ? "passed" : "failed"` is untouched. With decimal `bestScore` values: `49.9 >= 50` is `false` → `"failed"`; `50.0 >= 50` (note `Number(50.0) === 50`, so `50 >= 50`) is `true` → `"passed"`; `66.7 >= 50` is `true` → `"passed"`. No rounding occurs before this comparison.
- **Syntax and static verification:** `node --check "2026_2027/js/scorm-lo.js"` passed. Grepped the file for `Math.round`, `parseInt`, `Math.floor`, bitwise coercion, and `toFixed` — zero remaining `Math.round`/`parseInt`; the only `Math.floor()` calls are the unrelated session-time ones noted above; the only `toFixed` is the new, intentional one-decimal-place normalization inside `normalizeScore()`. `git diff` confirmed the change is isolated to `normalizeScore()`'s three-line body (5 lines changed total) — no changes to `init()`, `updateScore()`, `reportResult()`, `completeSession()`, `finish()`, `isConnected()`, `getBestScore()`, API discovery (`findAPI`/`findAPIInWindow`), or the session-end `postMessage`.
- **Manually traced example values** (matching the required demonstration set exactly, by re-deriving each from the implementation rather than assuming the recommended snippet is correct as pasted): `normalizeScore(33.3)` → `33.3`; `normalizeScore(66.7)` → `66.7`; `normalizeScore(49.9)` → `49.9`; `normalizeScore(50)` → `50`; `normalizeScore(100)` → `100`; `normalizeScore(101)` → clamped to `100`; `normalizeScore(-1)` → clamped to `0`; `normalizeScore("33.3")` → `Number("33.3")` = `33.3`; `normalizeScore("invalid")` → `Number("invalid")` = `NaN`, `!Number.isFinite(NaN)` is `true` → `null`.
- Preserved untouched, confirmed by diff and by re-reading the full file: SCORM API discovery (`findAPI`/`findAPIInWindow`), `init()`'s connection/lesson-status bootstrap, `completeSession()`'s commit-then-`postMessage` sequence, `finish()`, `isConnected()`, session-time formatting in `reportResult()`, and the `cmi.core.score.min`/`cmi.core.score.max` writes (still hardcoded `"0"`/`"100"` strings, unrelated to this fix).
- Out-of-Scope Findings: none discovered in `scorm-lo.js` itself. Each individual learning-object runtime's own `normalizeScormScore()`/`getHighestScormScore()`/`applyHighestScormScore()` helpers (documented under "Highest SCORM Score Preservation Pattern" above) are separate, per-file implementations that already avoid integer rounding in the files audited so far this campaign (they use their own `.toFixed()`-based or unrounded arithmetic) — none were opened or modified as part of this task, per the explicit two-file scope restriction (`scorm-lo.js` + this spec only).
- Browser verification: not performed — this environment has no browser/network-inspection or SCORM Cloud access. Verified by static analysis, `node --check`, `git diff` review, and manual re-derivation of every required example value from the implementation.
- **2026-07-21 SCORM status restoration (`PRIMARY FILE TO MODIFY` invocation) — see "SCORM Status Restoration Policy" above for the full normative rule.** Root cause: on a bare relaunch with no backend `learningObjectAsJson` payload (the SCORM Cloud scenario), a runtime's `post.cmi.completion_status`/`success_status` had no way to learn that the LMS already held a previously finalized `cmi.core.lesson_status` (e.g. `failed`) — `scorm-lo.js` read that value in `init()` only to decide whether to bootstrap-write `"incomplete"`, then discarded it; nothing exposed it back to the runtime.
- **Architecture decision:** `scorm-lo.js` has no reference to any runtime's `post` object (confirmed by reading the full file — it is a pure closure over `connected`/`bestScore`/now `persistedStatus`, with no DOM/Vue/`post` access), so `scorm-lo.js` alone cannot write `post.cmi.completion_status`/`success_status`. It can only own the SCORM-1.2-side read and status-mapping logic and expose the result. Runtime integration is therefore required to consume that exposed value and apply it to `post.cmi`. Per the task's explicit scope, this integration was applied only to the seven named candidate runtime files (listed below), not rewritten or duplicated elsewhere.
- **Fix in this file:**
  1. Added `persistedStatus` internal state (`{ lessonStatus, completionStatus, successStatus, hasFinalStatus }`, default all-`unknown`/`false`) alongside `bestScore`.
  2. Added `mapLessonStatusToRuntime(status)`, a pure function implementing the required SCORM 1.2 → runtime mapping table (`passed`→`completed`/`passed`; `failed`→`incomplete`/`failed`; `completed`→`completed`/`unknown`; `incomplete`→`incomplete`/`unknown`; everything else, including `not attempted`/`unknown`/`""`/unrecognized values, →`unknown`/`unknown`, `hasFinalStatus: false`).
  3. In `init()`'s already-`connected` branch, immediately after reading `const status = scorm.get("cmi.core.lesson_status");` and **before** the pre-existing `if (status === "not attempted" || status === "" || status === "unknown") { scorm.set(.... "incomplete"); scorm.save(); }` bootstrap block, added `const mappedStatus = mapLessonStatusToRuntime(status); persistedStatus = { lessonStatus: status || "unknown", ...mappedStatus };`. Capturing the mapping from the raw `status` variable *before* the bootstrap write means a true first launch (`status` was `"not attempted"`/`""`/`"unknown"`) is captured with `hasFinalStatus: false` even though the LMS's stored value becomes `"incomplete"` immediately afterward — the pre-existing bootstrap write itself was left completely unchanged (same condition, same `scorm.set`/`scorm.save` calls, same position), satisfying "if the LMS still requires cmi.core.lesson_status to be set to incomplete during initialization, separate the SCORM initialization value written to the LMS from the last finalized status exposed to the runtime."
  4. Added `getPersistedStatus()`, returning a shallow copy (`{ ...persistedStatus }`) of the captured state — read-only, no write side effects, callable any time after `init()`.
- **Status mapping table:** see "SCORM Status Restoration Policy" above (identical table, not duplicated here).
- **Control-flow proof:** `init()` runs synchronously to completion (no `await`, no `setTimeout`) before `init()`'s caller receives a return value; every candidate runtime calls `window.ScormService.init()` synchronously at top-of-file, before `new Vue(...)` is even constructed, so `persistedStatus` is fully populated before the Vue instance's `mounted()` (and therefore before `getData()`, which each runtime calls via `await this.getData()` inside `mounted()`) ever runs. There is no async gap between `ScormService.init()` completing and a runtime's `getData()` reading `getPersistedStatus()` — confirmed by reading each candidate file's top-of-script `scormConnected = !!window.ScormService.init();` block, which is plain synchronous top-level script code, not inside any Promise/callback.
- **Syntax validation:** `node --check "2026_2027/js/scorm-lo.js"` passed.
- **Static call-site audit:** grepped the full file for `.completion_status`/`.success_status`/`lesson_status` writes — the only writes are the pre-existing `scorm.set("cmi.core.lesson_status", ...)` calls in `init()` (initialization, unchanged) and `reportResult()` (final feedback, unchanged); `persistedStatus` itself is only ever assigned once, inside `init()`, from the freshly-read `status` value — no other function in this file mutates it.
- Preserved untouched, confirmed by diff and full re-read: `normalizeScore`/`updateBestScore` (decimal-score pipeline from the prior migration), `updateScore()`, `reportResult()`'s score/session-time/lesson_status writes, `completeSession()`, `finish()`, `isConnected()`, `getBestScore()`, SCORM API discovery.
- Out-of-Scope Findings: none discovered in `scorm-lo.js` itself.
- Browser verification: not performed — this environment has no browser/network-inspection or SCORM Cloud access. Verified by static analysis, `node --check`, `git diff` review, and manual control-flow tracing.

- **2026-07-21 correction — `"ab-initio"` entry disambiguation (`TARGET_SCRIPT` invocation):** the 2026-07-21 status-restoration entry above correctly capture-before-write-ordered `persistedStatus`, but that ordering alone is insufficient: it silently assumed a genuinely new registration's raw `cmi.core.lesson_status` would always be `"not attempted"`/`""`/`"unknown"` before any write occurred. In practice, some LMSs (SCORM Cloud included) default a brand-new attempt's `lesson_status` directly to `"incomplete"`, so `init()`'s very first `scorm.get("cmi.core.lesson_status")` call could already return `"incomplete"` on a true first launch, before the bootstrap write ever ran. `mapLessonStatusToRuntime("incomplete")` returns `hasFinalStatus: true`, so `persistedStatus` was wrongly captured as a meaningful previous result, and `restoreScormServiceStatus(post)` (in every one of the seven candidate runtime files) wrote `completion_status: "incomplete"` on the learner's very first attempt — observed via each runtime's `logScormCloudSummary()` console output (`Score: 16.7 | Completion: incomplete | Success: unknown`) during first-launch question answering, when the required output is `Completion: unknown | Success: unknown`.
  - **Fix:** `init()` now also reads `const entry = scorm.get("cmi.core.entry");` and computes `const isFirstEntry = entry === "ab-initio";` — `cmi.core.entry` is the SCORM 1.2 field an LMS is required to populate on every `LMSInitialize()` call specifically to signal whether this is the registration's first-ever initialization (`"ab-initio"`) or not (`"resume"`/`""`). When `isFirstEntry` is `true`, `persistedStatus` is now forced to `{ completionStatus: "unknown", successStatus: "unknown", hasFinalStatus: false }` unconditionally — bypassing `mapLessonStatusToRuntime(status)` entirely for that one call — regardless of what raw `status` the LMS returned. When `isFirstEntry` is `false` (every subsequent launch of the same registration), the pre-existing `mapLessonStatusToRuntime(status)` call runs unchanged. The pre-existing bootstrap write (`if (status === "not attempted" || status === "" || status === "unknown") { scorm.set(..., "incomplete"); scorm.save(); }`) was not touched — it still fires (or not) based on the same raw `status` condition as before; only the internal `persistedStatus` capture changed.
  - **Control-flow proof:**
    1. `ScormService.init()` runs synchronously, before `new Vue(...)`, at top-of-script in every consuming runtime (unchanged from the prior entry's proof).
    2. First launch: `scorm.get("cmi.core.entry")` returns `"ab-initio"` (LMS-mandated for a registration's first initialization) — regardless of whatever `scorm.get("cmi.core.lesson_status")` returns (`"not attempted"` on a spec-compliant LMS, or `"incomplete"` on an LMS that pre-defaults it), `isFirstEntry` is `true`, so `persistedStatus = { lessonStatus: status || "unknown", completionStatus: "unknown", successStatus: "unknown", hasFinalStatus: false }`.
    3. `restoreScormServiceStatus(post)` (called later, in each runtime's `getData()`) checks `if (!persisted || !persisted.hasFinalStatus) return;` — `hasFinalStatus` is now `false`, so it returns immediately without writing. `post.cmi.completion_status`/`success_status` remain at their `getData()` default-initialization value of `"unknown"/"unknown"`, satisfying Scenario A.
    4. First session ends without reaching final feedback: the pre-existing bootstrap write (unchanged, still gated on the same raw `status` condition, not on `entry`) sets `cmi.core.lesson_status = "incomplete"` on the LMS if the raw status was blank/not-attempted/unknown — this still happens, because Scenario B requires the LMS to actually hold `"incomplete"` on the next reopen.
    5. Reopen (second launch, same registration): `scorm.get("cmi.core.entry")` now returns `"resume"` (or, on some LMSs, `""`), so `isFirstEntry` is `false`. `scorm.get("cmi.core.lesson_status")` returns `"incomplete"` (written in step 4). `mapLessonStatusToRuntime("incomplete")` → `{ completionStatus: "incomplete", successStatus: "unknown", hasFinalStatus: true }`. `restoreScormServiceStatus(post)` now passes its `hasFinalStatus` check and writes `post.cmi.completion_status = "incomplete"`, `success_status = "unknown"` — satisfying Scenario B.
    6. First session instead reaches final feedback with a failing/passing score: `reportResult()` (unchanged) writes `cmi.core.lesson_status = "failed"`/`"passed"` to the LMS, exactly as before this fix. A later reopen has `entry !== "ab-initio"`, so the normal mapping restores `incomplete`/`failed` or `completed`/`passed` correctly — satisfying Scenarios D and F. Scenarios C and E (status set *within* the same session that reaches final feedback) are unaffected by this fix entirely — they go through `applyHighestScormScore`'s `updateStatus: true` branch inside `scormPost()`, a completely separate code path from `persistedStatus`/`restoreScormServiceStatus`, not touched by this change.
  - **Why this is the minimum correction:** `mapLessonStatusToRuntime()` itself was left unchanged — it remains a pure, correct raw-status-to-runtime mapping function, reusable and unambiguous once a resumed/non-first launch is confirmed. The ambiguity only existed at the point of capturing `persistedStatus` during `init()`, which is where the fix was applied. No runtime file needed any change — all seven already consume `getPersistedStatus()` through the same `restoreScormServiceStatus(post)` method, so fixing the shared source in `scorm-lo.js` corrects the defect for every consumer at once.
  - **Syntax validation:** `node --check "2026_2027/js/scorm-lo.js"` passed.
  - **`git diff` isolation:** the only change is the four new lines (`const entry = ...`, `const isFirstEntry = ...`, the conditional `mappedStatus` assignment replacing the unconditional `mapLessonStatusToRuntime(status)` call) plus an explanatory comment, inside `init()`'s already-`connected` branch, immediately before the existing `persistedStatus = {...}` assignment. No other function, no runtime file, and no other line in `scorm-lo.js` was touched.
  - Preserved untouched: `mapLessonStatusToRuntime()`'s mapping table, the bootstrap `incomplete` write condition and its `scorm.set`/`scorm.save` calls, `reportResult()`, `updateScore()`, `completeSession()`, `finish()`, `getBestScore()`, `getPersistedStatus()`'s shallow-copy return, and the decimal-score pipeline.
  - Out-of-Scope Findings: none discovered in `scorm-lo.js` itself. All seven runtime files that consume `restoreScormServiceStatus(post)` benefit from this fix automatically with zero changes to those files, since the correction is entirely upstream of their call site.
  - Browser verification: not performed — this environment has no browser/network-inspection or SCORM Cloud access. Verified by static analysis, `node --check`, and manual control-flow tracing through all six required scenarios (A/1 through F/6 in the task's validation list).

## Runtime integration: `restoreScormServiceStatus(post)` — applied identically to 7 files (2026-07-21)

This entry covers the identical, minimal runtime-side change applied to all seven candidate files from the "SCORM Status Restoration Policy" task, to avoid duplicating the same trace seven times. Each individual file's own Migration Records entry (above/below) carries a one-line pointer back to this entry.

- **Files modified (all seven candidates from the task, none skipped, none added beyond the candidate list):**
  1. `2026_2027/lib-native/digital-screen_26/choose/js/zoki.js` (canonical reference — implemented first, then applied identically to the rest)
  2. `2026_2027/lib-native/digital-screen_26/digital-screen-input/js/zoki_.js`
  3. `2026_2027/lib-native/digital-screen_26/digital-screen-tworound-input-choose/js/zoki_choose_input.js`
  4. `2026_2027/lib-native/penguin_26/penguin-choose/js/main.js`
  5. `2026_2027/lib-native/penguin_26/penguin-input/js/main.js`
  6. `2026_2027/lib-native/penguin_26/penguin-tworound-input-choose/js/main.js`
  7. `2026_2027/lib-native/space_26/space-input/js/main_.js`
- **Change, identical in all seven files:** added one method, `restoreScormServiceStatus(post)` (full implementation and 10-point behavior proof in "SCORM Status Restoration Policy" above — not repeated here), and one call site: `this.restoreScormServiceStatus(post);` inserted in `getData()` immediately after the existing `this.restorePersistedCmi(post, restoredPost);` and immediately before the existing `this.initializeNumberOfAttempt(post, restoredPost);`. No other line in any of the seven files was touched.
- **Why these seven and not the other already-migrated runtime files in this codebase** (e.g. `digital-screen-tworound-input-choose/js/zoki_.js`/`zoki.js`, `penguin_26/penguin-input/js/main_.js`, `penguin_26/penguin-tworound-inputs/*`, `space_26/space-input/js/main.js`, `buzzTime*`, `glossary/*`): the task explicitly scoped this change to a named candidate list and instructed "Do not edit all files automatically... implement only the files proven necessary" from that list. The other runtime files in this codebase share the same `restorePersistedCmi`/`getData()` architecture and would need the identical one-method/one-call-site change to gain SCORM-Cloud-relaunch status restoration, but were left untouched per the explicit scope instruction — see Out-of-Scope Findings below.
- **Control-flow proof (representative trace, identical reasoning applies to all seven — verified individually in each file, not assumed from the canonical file's correctness alone):**
  1. `window.ScormService.init()` runs synchronously at top-of-script, before `new Vue(...)`.
  2. `getData()` (called via `await this.getData()` in `mounted()`) reaches `const post = this.posts?.[0]; if (!post) return;` after `post.cmi` has already been default-initialized (`if (!post.cmi) { post.cmi = { completion_status: "unknown", ... } }`, which runs unconditionally earlier in `getData()`).
  3. `this.restorePersistedCmi(post, restoredPost);` runs next — if a backend `learningObjectAsJson` payload existed (`direction == "2"` and non-empty), `post.cmi.completion_status`/`success_status` are set from it here.
  4. `this.restoreScormServiceStatus(post);` runs immediately after. It reads `window.ScormService.getPersistedStatus()` (already fully populated by step 1, no async gap — see the `scorm-lo.js` entry above for the synchronous-timing proof) and checks `post.cmi.completion_status !== "unknown" || post.cmi.success_status !== "unknown"`. If step 3 already restored a non-`unknown` value, this check is `true` and the function returns without writing — the backend value wins. If step 3 found no backend payload (`post.cmi` is still at its step-2 default), this check is `false` and, provided `persisted.hasFinalStatus` is `true`, the SCORM-sourced status is written.
  5. `this.initializeNumberOfAttempt(post, restoredPost);` runs after, unaffected — it reads `NumberOfAttempt`, not `cmi.completion_status`/`success_status`.
  6. `getData()`'s `await` resolves, `mounted()` continues; no question can be answered (no per-question or final-feedback status write can occur) until the learner explicitly triggers `start()`, well after this point.
  - **Race conditions checked and ruled out:** `getData()` is `async` and its `direction == "2"` branch does `await returnData.then(...)`, but `restoreScormServiceStatus(post)` does not depend on that `await` — it only reads `window.ScormService`'s already-synchronously-populated state, not `returnData`/`restoredPost`. `mounted()` cannot log or process an answer before `await this.getData()` resolves, because every question-interaction method is only reachable after the template renders past the "Start" gate, which itself is gated on `mounted()` having completed. No `setTimeout` in `getData()` or `restoreScormServiceStatus()` could reorder this — `restoreScormServiceStatus()` contains no asynchronous code at all.
- **Per-question preservation proof (verified in every one of the seven files, not assumed):** grepped every `applyHighestScormScore(currentAttemptScore, {` call site (the per-question `updateScormScoreAfterAnswer()` path) in all seven files — each passes only `{ updateScaled: true }`, never `updateStatus`. `applyHighestScormScore`'s `if (options.updateStatus) { ... }` branch is therefore unreachable from any per-question call in any of the seven files; a restored `incomplete`/`failed` (or `completed`/`passed`) status cannot be overwritten by answering questions before final feedback.
- **Final-feedback update proof (verified in every one of the seven files):** grepped every `applyHighestScormScore(result, {` call site (both branches of `scormPost()`) in all seven files — each passes `{ updateScaled: true, updateStatus: true, finalStatus: true }`, unchanged from before this task. `scormPost()` itself remains gated by `scormReported` (executes at most once) and by the file's own final-completion condition, unchanged by this task.
- **Best-score/status interaction proof:** unchanged by this task — `getHighestScormScore()` already includes `window.ScormService.getBestScore()` in its `Math.max(...)`, so a restored best score can only stay the same or increase across a reopen, and `applyHighestScormScore`'s `highestScore >= 50` check at final feedback is therefore evaluated against a value that already reflects the best score across all visits, matching this codebase's pre-existing "status follows highest saved score, never regresses" policy (see "SCORM Status Restoration Policy" above) — this task did not alter that policy, only added the missing SCORM-Cloud status-restoration path that feeds `post.cmi.completion_status`/`success_status` on reopen before that policy runs again at the next finalization.
- **Syntax validation:** `node --check` passed for all seven files.
- **Static call-site audit:** see the "Call-site classification" list in "SCORM Status Restoration Policy" above — identical classification applies verbatim to all seven files (verified individually via the same grep pattern run against each file).
- Preserved untouched in all seven files: score pipeline (`calculateCurrentAttemptScore`, `getHighestScormScore`, `applyHighestScormScore`, `updateScormScoreAfterAnswer`), `restorePersistedCmi`'s own logic, `initializeNumberOfAttempt`, cumulative time, QA/cloud logging dispatchers, `scormReported`/`scormPostScheduled`/`scormCompletionReady` guards, `completeSession()` ordering, and every file's own answer-evaluation/UI/audio/animation logic — confirmed via `git diff` review showing only the one method and one call-site addition per file.
- **Out-of-Scope Findings:** the same `restoreScormServiceStatus(post)` gap (no SCORM-Cloud-relaunch status restoration path) exists in every other already-migrated runtime file in this codebase that shares the `restorePersistedCmi`/`getData()` architecture but was not in this task's candidate list, including at minimum: `digital-screen_26/digital-screen-tworound-input-choose/js/zoki_.js`, `digital-screen_26/digital-screen-tworound-input-choose/js/zoki.js`, `digital-screen_26/digital-screen-input/js/zoki_video.js`, `digital-screen_26/digital-screen-input/js/zoki_with_animation.js`, `digital-screen_26/digital-screen-tworound-inputs/js/{zoki_,zoki}.js`, `penguin_26/penguin-input/js/main_.js`, `penguin_26/penguin-tworound-inputs/js/*`, `space_26/space-input/js/main.js`, `buzzTime/js/main.js`, `buzzTime_primary/js/main.js`, and `glossary/assets/js/main.js`. None of these were opened or modified as part of this task, per the explicit candidate-list scope restriction. Recommended future task: a follow-up `PRIMARY FILE TO MODIFY`/`TARGET_SCRIPT` pass applying the identical `restoreScormServiceStatus(post)` method + call site to each, one at a time, with the same control-flow verification.
- Browser verification: not performed — this environment has no browser/network-inspection or SCORM Cloud access. All seven acceptance scenarios in the task (`New registration first launch`, `Finish with failing score`, `Close and relaunch before final feedback`, `Achieve higher score before final feedback`, `Reach final feedback with passing score`, `Close and relaunch after passing`, `New lower-scoring attempt after passing`) were verified by static control-flow tracing only, not by an actual SCORM Cloud session.

## `2026_2027/lib-native/storyline-q/assets/js/main.js` — full `SCORM_RUNTIME_ALIGNMENT` re-audit (2026-07-26, `TARGET_SCRIPT` invocation)

- **Invocation:** `TARGET_SCRIPT` supplied as the directory `2026_2027/lib-native/storyline-q/assets/js` (not a single file). Resolved unambiguously to `main.js`: grepped the full directory for `ScormService|new Vue` — only `main.js` matched. The five sibling engine files (`choose.js`, `correct.js`, `drag.js`, `input.js`, `match.js`) and `slide-show.js` contain zero SCORM/Vue-app surface (confirmed again this pass) and were not modified.
- **Context:** this file already had a full canonical migration (see the `mymovie.html` entry above) plus a later independent `RE-VERIFICATION_UNDER_GENERALIZED_POLICY` pass. This pass re-read the complete current file (1652 lines) and the complete current `implementation-specification.md` against the reference `digital-screen_26/choose/js/zoki.js`, and found four genuine, previously-undocumented gaps against sections of the spec added or generalized since the original migration.
- **Gap 1 — Console Logging Pattern / Initialization Pattern violation:** the SCORM init block printed two non-error status logs (`console.log("Lo Started....")`, `console.log("ScormService init:", scormConnected)`) plus `console.warn("ScormService not found on window")` when `window.ScormService` was absent — none permitted by "# 4. Console Refactoring Standard" (only `console.error("ScormService init error:", e)` is allowed). This is the same class of violation already fixed in `glossary/assets/js/main.js`'s Gap 1. **Fix:** removed all three; the init block now matches the reference `zoki.js` shape exactly (silent on success, `console.error` only on a thrown exception).
- **Gap 2 — `restoreScormServiceStatus(post)` missing entirely (SCORM Status Restoration Policy):** this file was not among the seven candidates in the "`restoreScormServiceStatus(post)` — applied identically to 7 files" entry above, and the gap was never separately closed for it. On a bare SCORM-Cloud relaunch with no backend `learningObjectAsJson` payload, a previously-finalized `cmi.core.lesson_status` (e.g. `failed`) had no path into `post.cmi.completion_status`/`success_status` here, so a returning learner would see `unknown`/`unknown` during requestioning instead of their last finalized result. **Fix:** added the canonical `restoreScormServiceStatus(post)` method (identical body to the reference/seven-file entry — no target-specific adaptation needed) and its call site in `getData()`, immediately after `this.restorePersistedCmi(post, restoredPost);` and immediately before `this.initializeNumberOfAttempt(post, restoredPost);`, matching the required ordering exactly.
- **Gap 3 — `counterCorrect` misused as the normalized 0-10 score bucket (Scoring Pattern violation):** `finished()` assigned the bucketed `0/2.5/5/7.5/10` value directly into `this.posts[0].counterCorrect` (never into a `scoreOutOf10` field, which did not exist anywhere in this file), and `finalResponse.submitData(...)` read that bucketed value from `counterCorrect` for both its degree and score arguments. This violates "`counterCorrect` must represent only the actual number of correct answers... existing normalized score bucket calculations such as 0, 2.5, 5, 7.5, or 10 must write to `scoreOutOf10`, not `counterCorrect`," and the local/dev QA object (which reports `counterCorrect: post.counterCorrect`) was therefore displaying a bucketed score instead of the actual correct-answer count. **Fix (values sent to `finalResponse.submitData()` are unchanged — only the source field changed, per "existing final submit behavior should keep receiving the same score values as before, but those values should come from `scoreOutOf10`"):**
  1. Added `this.posts[0].scoreOutOf10 ??= 0;` to data normalization in `getData()`, alongside the existing `studentPoint = 0` initialization.
  2. `finished()`: renamed the assignment target from `this.posts[0].counterCorrect` to `this.posts[0].scoreOutOf10` (the bucketed ternary expression itself — `result <= 25 ? 2.5 : ...` — was not touched), and updated both `finalResponse.submitData(...)` arguments from `this.posts[0].counterCorrect` to `this.posts[0].scoreOutOf10` — the exact same numeric values are still computed and sent, only the field they come from changed.
  3. Gave `counterCorrect` its correct meaning: added `this.posts[0].counterCorrect = this.posts[0].LOcorrectcounter;` immediately after every `LOcorrectcounter` mutation — the reset in `startLo()` and the increment in `correctAnswerSolve()` — matching the reference `zoki.js` pattern of keeping `counterCorrect` synchronized with the live correct-answer counter.
  4. Checked the entire `2026_2027/allTemplete/**` tree for any HTML template reading `counterCorrect` for direct display — none found (only `data.json` seed files contain a static `counterCorrect: 0` default, not a template binding), so this correction has no template-rendering impact.
- **Gap 4 — Question Timestamp Format Pattern / `QUESTION_TIMING_LIFECYCLE` violation:** question-level `startTime`/`endTime` were assigned using the root-level `getDate()` helper (`D/M/YYYY H:M:S` format) instead of a dedicated 12-hour `hh:mm:ss AM/PM` helper, and — separately — only the *first* question ever received a `startTime` at all: `startQuestions()` manually stamped `questions[0].startTime` before calling `loadQuestion()`, but `loadQuestion()`'s own activation branch (which runs for every question via `nextQuestion() → loadQuestion()`) never assigned `startTime`, so questions 2..N were persisted with an empty `startTime` field. **Fix:**
  1. Added `getQuestionTime()` (copied verbatim from the reference `zoki.js` — 12-hour `hh:mm:ss AM/PM` format), placed next to the existing `getDate()`.
  2. Removed `startQuestions()`'s one-off `questions[0].startTime = this.getDate();` line (wrong format, and now redundant).
  3. Added `if (!this.currentQuestion.startTime) { this.currentQuestion.startTime = this.getQuestionTime(); }` inside `loadQuestion()`'s activation branch, immediately after `this.currentQuestion = this.questions[this.questionIndex];` — this now runs for every question (first and subsequent), assigns the correctly-formatted timestamp exactly once per question (guarded against overwriting per `QUESTION_TIMING_LIFECYCLE` rule 9), and requires no change to `nextQuestion()`'s activation-triggering call chain.
  4. Changed `nextQuestion()`'s existing `this.posts[0].questions[this.questionIndex].endTime = this.getDate();` to use `this.getQuestionTime()` instead — same ownership/position (still assigned before `questionIndex++`), only the format corrected. Root-level `this.posts[0].startTime`/`this.posts[0].endTime` (set via `getDate()` in `getData()` and `loadQuestion()`'s final branch) were left untouched, per the rule that root-level timestamps keep their own existing format.
- **Preserved untouched, confirmed by diff review:** all six question-type engines (`choose`/`trueFalse`/`dragDrop`/`match`/`input`/`correct`) and their check/reset/show-answer logic, `shuffleQuestions()`'s type/subType grouping, drag/drop and match-line SVG mechanics, audio playback, `setSafeTimeout`/`clearAllTimeouts`, the existing highest-score pipeline (`calculateCurrentAttemptScore`/`getHighestScormScore`/`applyHighestScormScore`/`updateScormScoreAfterAnswer`, unchanged), cumulative `total_time` in `scormPost()`, the `scormReported` single-execution guard, `completeSession()` ordering, and `logAfterQuestionFinalFeedback()`'s per-index `questionLogged{}` guard.
- **Syntax validation:** `node --check` on `main.js` passed.
- **Regression search:** grepped the modified file for `console.log|console.warn|console.info|console.debug` — only the two canonical logging methods' output statements and pre-existing commented-out debug lines remain; for `LMSFinish|scorm.quit|\.finish\(|FINAL_FEEDBACK_DELAY` — zero active occurrences, only the pre-existing commented-out dead `finish()` scaffolding in `scormPost()` and `beforeunload`; for `counterCorrect|scoreOutOf10|getQuestionTime|restoreScormServiceStatus` — each new symbol appears exactly at its intended definition/call sites, with no duplicate or stray occurrence.
- **Diff isolation:** `git diff --stat` reports one file changed, 39 insertions / 9 deletions, confirmed via full `git diff` review to be limited to the four gaps above — no changes to answer-checking, DOM, audio, shuffling, navigation, or final-submit *values*.
- Browser/SCORM Cloud verification: not performed — this environment has no browser or SCORM Cloud access. Verified by static analysis, `node --check`, and `git diff` review only.
