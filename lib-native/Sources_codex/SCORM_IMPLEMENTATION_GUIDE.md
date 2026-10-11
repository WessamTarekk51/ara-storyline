# SCORM Implementation Guide

**A framework-agnostic engineering handbook for designing, implementing, integrating, maintaining, validating, and extending SCORM in web-based learning content.**

---

## How to use this document

This guide is not tied to any specific codebase, framework, or project. It documents *how SCORM should be engineered*, not how one particular repository happens to implement it. Where a pattern is illustrated with example code, the example is written in plain, framework-neutral JavaScript so it can be adapted to Vue, React, Angular, vanilla JS, or any other stack.

Some patterns in this guide are described as "field-tested" — meaning they were arrived at (and, in several cases, arrived at the hard way, via a real production defect) in a real SCORM 1.2 integration spanning dozens of learning-object runtimes. They are included because they generalize well, not because they are specific to that project. No knowledge of that project is required to use this guide.

Use this document to:

- Design a new SCORM layer from scratch.
- Review an existing SCORM integration for correctness.
- Onboard a new engineer or AI coding assistant onto SCORM work.
- Diagnose a category of SCORM bug you're seeing in production.

---

## Table of Contents

1. [Introduction](#1-introduction)
2. [SCORM Architecture](#2-scorm-architecture)
3. [Runtime Lifecycle](#3-runtime-lifecycle)
4. [CMI Data Model](#4-cmi-data-model)
5. [Score Management](#5-score-management)
6. [Completion Rules](#6-completion-rules)
7. [Time Management](#7-time-management)
8. [Suspend / Resume](#8-suspend--resume)
9. [Question Lifecycle](#9-question-lifecycle)
10. [Logging](#10-logging)
11. [Error Handling](#11-error-handling)
12. [Best Practices](#12-best-practices)
13. [Anti-Patterns](#13-anti-patterns)
14. [Validation Checklist](#14-validation-checklist)
15. [Testing Checklist](#15-testing-checklist)
16. [AI Assistant Rules](#16-ai-assistant-rules)
17. [Future Extensions](#17-future-extensions)

---

## 1. Introduction

### What is SCORM

SCORM (Sharable Content Object Reference Model) is a set of technical standards for web-based e-learning content. It defines how a piece of learning content (a "SCO" — Sharable Content Object, commonly called a Learning Object) communicates with the system that hosts it (the LMS — Learning Management System).

SCORM standardizes three things:

1. **Packaging** — how content, assets, and a manifest (`imsmanifest.xml`) are bundled into a deployable unit.
2. **Runtime communication** — a JavaScript API the content calls to read and write learner data (score, completion, time spent, etc.).
3. **Data model** — a fixed vocabulary of fields (`cmi.core.score.raw`, `cmi.core.lesson_status`, etc.) that both sides agree on.

SCORM does **not** standardize how the content itself is built. A SCORM package can be a single static HTML page, a full single-page application, or a complex simulation — SCORM only governs the thin communication layer at its boundary.

### Why SCORM exists

Before SCORM, every LMS vendor had its own proprietary way of tracking learner progress, which meant content built for one LMS could not run in another. SCORM solved this by defining a vendor-neutral contract: any SCORM-conformant content runs in any SCORM-conformant LMS, and any SCORM-conformant LMS can host any SCORM-conformant content.

This has one important consequence for engineering: **the content author never talks to a specific LMS.** It talks to an abstract JavaScript API that the LMS is required to expose. This is the seed of the architecture recommended in this guide — the content should not "know" anything about which LMS is hosting it, only about the standard API surface.

### SCORM 1.2 vs SCORM 2004

| Aspect | SCORM 1.2 | SCORM 2004 |
|---|---|---|
| API object | `API` (found via `window`/`window.parent`/`window.opener` chain) | `API_1484_11` |
| Core status field | Single field: `cmi.core.lesson_status` (`passed`/`failed`/`completed`/`incomplete`/`browsed`/`not attempted`) | Split into two: `cmi.completion_status` and `cmi.success_status` |
| Score | `cmi.core.score.raw`/`min`/`max` (0–100 only) | `cmi.score.raw`/`min`/`max`/`scaled` (`scaled` is a normalized 0.0–1.0 value; raw/min/max are optional) |
| Time tracking | `cmi.core.session_time` (per-session only; LMS accumulates) | `cmi.session_time` plus richer navigation/sequencing time data |
| Sequencing | None — content controls its own flow | Full sequencing and navigation (SN) specification — the LMS can control flow between SCOs |
| Suspend data | `cmi.suspend_data`, max 4096 characters | `cmi.suspend_data`, max 64,000 characters |
| Interactions tracking | Basic | Much richer (objectives, interaction types, correct responses) |
| Complexity to implement | Low–moderate | High |

**Practical guidance:** most custom-built learning content (as opposed to authoring-tool output) targets **SCORM 1.2** because it is simpler, has near-universal LMS support, and the split `completion_status`/`success_status` distinction in SCORM 2004 is rarely needed for simple pass/fail content. This guide uses SCORM 1.2 field names by default but every pattern applies equally to SCORM 2004 with the field-name substitutions in the table above.

### LMS communication model

The runtime communication contract, regardless of version, follows this shape:

```
Content (SCO)                          LMS
     │                                   │
     │──── LMSInitialize("") ──────────▶│   (1.2)  / Initialize("")   (2004)
     │◀─── true/false ──────────────────│
     │                                   │
     │──── LMSGetValue("cmi.core...") ─▶│   read a field
     │◀─── value ────────────────────────│
     │                                   │
     │──── LMSSetValue("cmi...", v) ───▶│   stage a write (in-memory only)
     │◀─── true/false ──────────────────│
     │                                   │
     │──── LMSCommit("") ───────────────▶│   flush staged writes to persistent storage
     │◀─── true/false ──────────────────│
     │                                   │
     │──── LMSFinish("") ───────────────▶│   end the session
     │◀─── true/false ──────────────────│
     │                                   │
     │──── LMSGetLastError() ───────────▶│   diagnostics, called after any false/error
     │◀─── error code ───────────────────│
```

Every call is **synchronous** and returns a string (`"true"`/`"false"`, or the field value, or `""` on error). This is a legacy of SCORM's mid-2000s origins — there is no Promise-based or async variant in the standard itself. `LMSSetValue` does **not** guarantee persistence by itself; the LMS is only required to durably persist data after `LMSCommit` (or, per spec, at `LMSFinish`, though relying on this is fragile — see [§11 Error Handling](#11-error-handling)).

The API object itself is not injected via a global variable directly usable by the content — it must be *located* by walking up the frame/window hierarchy (`window`, `window.parent`, `window.opener`, recursively), because the LMS typically hosts the SCO inside an iframe or popup and places the API object on one of the ancestor windows. Locating this object correctly is the first and most commonly mishandled step of any SCORM integration (see [§11](#11-error-handling)).

---

## 2. SCORM Architecture

### The core principle: SCORM is a boundary adapter, not a feature

The single most important architectural decision in any SCORM integration is this:

> **SCORM must be an adapter layer that observes and reports on the activity — it must never be woven into the activity's own business logic.**

The learning content (the quiz, the game, the drag-and-drop exercise — whatever the pedagogical activity actually is) should be fully functional, testable, and runnable with **zero knowledge that SCORM exists**. SCORM sits at the boundary, watching the activity's state and translating it into the standard data model when required.

```
┌─────────────────────────────────────────────────────────────────┐
│  UI                                                              │
│  (rendering, DOM, animation, audio, user input handling)         │
└───────────────────────────────┬───────────────────────────────────┘
                                 │
┌───────────────────────────────▼───────────────────────────────────┐
│  Learning Object / Activity State                                │
│  (questions, answers, current score, progress, completion flag)   │
└───────────────────────────────┬───────────────────────────────────┘
                                 │
┌───────────────────────────────▼───────────────────────────────────┐
│  Business Logic                                                  │
│  (scoring formula, pass/fail threshold, retry rules, feedback)    │
└───────────────────────────────┬───────────────────────────────────┘
                                 │  observes state, never drives it
┌───────────────────────────────▼───────────────────────────────────┐
│  SCORM Adapter                                                   │
│  (translates activity state → CMI fields, owns API discovery,     │
│   owns best-score preservation, owns status mapping)              │
└───────────────────────────────┬───────────────────────────────────┘
                                 │
┌───────────────────────────────▼───────────────────────────────────┐
│  SCORM API                                                        │
│  (LMSInitialize / LMSGetValue / LMSSetValue / LMSCommit / Finish)  │
└───────────────────────────────┬───────────────────────────────────┘
                                 │
┌───────────────────────────────▼───────────────────────────────────┐
│  LMS                                                               │
│  (persists learner records, renders reports, enforces sequencing) │
└─────────────────────────────────────────────────────────────────┘
```

### Why this separation matters

**1. Testability.** If scoring logic calls `LMSSetValue` directly, you cannot unit-test the scoring logic without mocking the entire SCORM API surface. If SCORM is a pure adapter that *reads* activity state, the activity is trivially testable in isolation, and the adapter is testable with a handful of fake state objects.

**2. Portability.** Content built with SCORM woven into its core logic cannot be repurposed for a non-LMS context (a public website, an app, a different tracking standard like xAPI) without a rewrite. An adapter can be swapped or run in parallel with almost no change to the activity itself.

**3. Correctness under failure.** SCORM API calls can fail (missing API, LMS timeout, disconnected iframe). If SCORM logic is mixed into the activity's core flow, a SCORM failure can break the learning experience itself. When SCORM is a side-observing adapter wrapped in defensive error handling, a SCORM failure degrades gracefully — the learner can still complete the activity even if nothing gets reported.

**4. Single ownership.** When one adapter owns *all* communication with the LMS, there is exactly one place that decides "is this score allowed to be written," "has this session already reported completion," and so on. When SCORM calls are scattered across many UI event handlers, these invariants (see [§5](#5-score-management) and [§13](#13-anti-patterns)) are nearly impossible to guarantee, because any one of dozens of call sites could violate them.

### Recommended module boundary

A minimal, reusable SCORM adapter should expose roughly this surface, independent of the framework the activity itself is written in:

```js
// A pure, framework-agnostic SCORM 1.2 adapter.
// No knowledge of the activity's UI, question types, or scoring formula.
window.ScormService = (function () {
  let connected = false;
  let bestScore = 0;
  let persistedStatus = { completionStatus: "unknown", successStatus: "unknown", hasFinalStatus: false };

  return {
    init() { /* locate API, connect, restore bestScore + persistedStatus */ },
    updateScore(score) { /* commit best-score-so-far, every call */ },
    reportResult(score) { /* final score + status + session_time, once */ },
    completeSession() { /* session-end signal, NOT LMSFinish */ },
    isConnected() { return connected; },
    getBestScore() { return bestScore; },
    getPersistedStatus() { return { ...persistedStatus }; },
  };
})();
```

The activity's own code calls into this adapter (`ScormService.updateScore(currentScore)`, `ScormService.reportResult(finalScore)`) from a small number of well-defined lifecycle points — it never calls `LMSSetValue` directly, and it never needs to know the field names in the CMI data model at all. See [§4](#4-cmi-data-model) for what the adapter itself is responsible for translating.

### Where the adapter should NOT live

Do not put the adapter's logic:

- Inside a UI component's click handler (couples reporting timing to a DOM event instead of a lifecycle state).
- Inside more than one file per activity, unless those files are the adapter's own internal modules. Every question-type/answer-checking helper file should call *into* the single adapter-consuming layer, never talk to `LMSSetValue`/`window.ScormService` directly.
- Behind a UI framework's reactivity system as its source of truth. The activity's own current-attempt state is the source of truth; the SCORM layer reads it, never the reverse (see the Current-Attempt vs. Historical separation in [§5](#5-score-management)).

---

## 3. Runtime Lifecycle

Every SCORM-integrated learning object follows the same high-level lifecycle, regardless of what the activity itself does:

```
 Initialization
      │
      ▼
 Data Loading  (fetch activity content: questions, media, config)
      │
      ▼
 Restoring Previous State  (backend-persisted state AND/OR LMS-persisted state)
      │
      ▼
 Question Progress  (the learner interacts; this loops N times)
      │
      ▼
 Score Updates  (synchronized to SCORM after each interaction, not just at the end)
      │
      ▼
 Completion  (the activity's own definition of "done" is reached)
      │
      ▼
 Final Reporting  (final CMI values computed and sent, exactly once)
      │
      ▼
 Session End  (notify the host that the attempt has concluded)
```

### Initialization

Initialization has two independent halves that are frequently — and incorrectly — conflated:

1. **SCORM API connection.** Locate the API object, call `LMSInitialize("")`, and read whatever the LMS already knows (previous best score, previous status). This should happen as early as possible — ideally synchronously, before the UI framework even constructs its root component — so that everything downstream can assume the connection state is already resolved.
2. **Activity data loading.** Fetching the actual learning content (questions, media, configuration) from wherever it lives (a static JSON file, a CMS, a backend API). This is entirely independent of SCORM and should not be blocked by it, or vice versa.

**Field-tested pattern:** run SCORM connection as a synchronous, top-level side effect *before* the UI framework's app instance is even constructed, and guard it so its failure can never throw:

```js
let scormConnected = false;
try {
  if (window.ScormService) {
    scormConnected = !!window.ScormService.init();
  }
} catch (e) {
  console.error("ScormService init error:", e);
}
// ... framework app construction happens after this point, so every
// downstream lifecycle step can safely assume SCORM state is already resolved.
```

Doing this synchronously (rather than inside an async `mounted`/`onMount` hook) closes an entire class of race condition: nothing in the activity can possibly run before the SCORM connection attempt has resolved, because nothing in the activity exists yet.

### Data loading

Activity data loading and SCORM connection are independent and should be able to fail independently:

- If SCORM is unavailable (standalone preview, broken LMS iframe, local development), the activity must still load and be fully playable.
- If activity data fails to load, that's a content-loading error, unrelated to SCORM, and should be handled as such (retry, error screen) — not conflated with a SCORM failure.

### Restoring previous state

This step is commonly under-implemented. There are, in general, **two independent sources of "previous state"**, and a correct implementation must reconcile both — see [§8 Suspend/Resume](#8-suspend--resume) for the full treatment. In brief:

- State the **LMS itself** already holds (`cmi.core.lesson_status`, `cmi.core.score.raw`) from a prior SCORM session against this same registration.
- State a **backend/platform** might independently persist alongside or instead of the LMS (a full snapshot of the activity's data model, saved by the application's own backend, independent of SCORM).

### Question progress / score updates

This is the longest-running phase and the one with the most subtle correctness requirements. See [§9 Question Lifecycle](#9-question-lifecycle) for the full state machine. The high-level rule: **score should synchronize to the SCORM layer after every scoring-relevant interaction**, not only once at the very end — this way, if the learner closes the browser mid-attempt, the LMS still reflects meaningful partial progress rather than nothing at all.

### Completion

"Completion" is a judgment the *activity* makes, using its own domain-specific definition (all questions answered, all levels cleared, time expired, etc.). SCORM does not define what completion means for your content — it only defines the vocabulary you report it with (see [§6](#6-completion-rules)). The adapter must never guess at completion; it must be told, explicitly, by the activity, exactly once.

### Final reporting

The single most important invariant of the entire lifecycle:

> **Final reporting must happen exactly once per attempt, gated by an explicit "already reported" flag, and it must compute every final CMI value fresh at the moment it fires** — not rely on values that may have drifted since an earlier per-question update.

### Session end

Ending a SCORM session is a distinct operation from finalizing scores/status, and the two are frequently confused (see [§6](#6-completion-rules) and [§13](#13-anti-patterns) for why calling `LMSFinish` from content code is usually wrong).

---

## 4. CMI Data Model

The CMI ("Computer Managed Instruction") data model is the fixed vocabulary of fields SCORM defines. Below are the fields that matter for the overwhelming majority of learning content; consult the full SCORM 1.2 RTE (Run-Time Environment) specification for the complete list (interactions, objectives, student data, etc.).

| Field (SCORM 1.2) | Type | Purpose | Owner | Changes | Must never change |
|---|---|---|---|---|---|
| `cmi.core.lesson_status` | enum: `passed`/`failed`/`completed`/`incomplete`/`browsed`/`not attempted` | The single source of truth for "how did this attempt go" | SCORM adapter, final-report step only | Once, at final reporting (plus one bootstrap write at init — see below) | Mid-attempt, or by a later *lower*-scoring attempt regressing a prior pass |
| `cmi.core.score.raw` | number, 0–100 | The learner's score | SCORM adapter | Every score sync, always holding the *highest* seen (see [§5](#5-score-management)) | Never decreases |
| `cmi.core.score.min` / `.max` | number | The valid range of `score.raw` | SCORM adapter | Rarely; typically fixed at `0`/`100` | — |
| `cmi.core.score.scaled` *(2004 only, or informal convention in 1.2)* | number, 0.0–1.0 | Normalized score | SCORM adapter | Alongside `score.raw` | — |
| `cmi.core.session_time` | duration string | **This session's** elapsed time only | SCORM adapter, written once at `LMSCommit`/finalize time | Once per session | — |
| `cmi.core.total_time` | duration string | LMS-accumulated time across all sessions for this registration | **The LMS**, not the content | The LMS adds `session_time` to the running total on commit | Content should never write this directly in SCORM 1.2 — some content-side patterns track their own cumulative total independently for display purposes (see [§7](#7-time-management)) |
| `cmi.core.entry` | enum: `ab-initio`/`resume`/`""` | Whether this is the registration's first-ever initialization | **The LMS**, read-only from the content's perspective | Set by the LMS before `LMSInitialize` returns | Content must never write this |
| `cmi.core.exit` | enum: `time-out`/`suspend`/`logout`/`""` | How the content intends to leave the session | Content, optionally, before `LMSFinish` | Once, at session end | — |
| `cmi.core.lesson_location` | string, ≤255 chars | Where in the content the learner was ("bookmark") | Content | Whenever the learner's position changes meaningfully | — |
| `cmi.suspend_data` | string, ≤4096 chars (1.2) | Arbitrary content-defined state blob for mid-attempt resume | Content | Whenever resumable state changes | — |
| `cmi.core.student_id` / `cmi.core.student_name` | string | Learner identity, supplied by the LMS | LMS, read-only | — | Content must never write these |
| `cmi.launch_data` | string | Content-configuration data set by the LMS/authoring tool | LMS, read-only | — | — |

### Ownership discipline

The single most valuable discipline in CMI field management: **for every field, know exactly one function that is allowed to write it, and never write it from anywhere else.** This is not a stylistic preference — it is the only way to guarantee the invariants in [§5](#5-score-management) and [§6](#6-completion-rules) hold under a codebase with many contributors and many years of maintenance. A responsibility matrix like the one above should be kept up to date for the actual field set your content uses, and should be treated as load-bearing documentation, not decoration.

### SCORM 2004 field mapping

| SCORM 1.2 | SCORM 2004 equivalent |
|---|---|
| `cmi.core.lesson_status` | Split into `cmi.completion_status` (`completed`/`incomplete`/`not attempted`/`unknown`) and `cmi.success_status` (`passed`/`failed`/`unknown`) |
| `cmi.core.score.raw` | `cmi.score.raw` (optional; prefer `cmi.score.scaled`) |
| `cmi.core.session_time` | `cmi.session_time`, ISO 8601 duration format (`PT1H30M0S`) instead of `HH:MM:SS` |
| `cmi.core.entry` | `cmi.entry` |
| `cmi.core.exit` | `cmi.exit`, plus richer navigation-request values |

---

## 5. Score Management

### The central rule

> **Current Attempt Score and Historical (Best/Highest) Score are two different concepts and must never be merged into one variable, one field, or one code path.**

This single rule prevents the most common and most damaging class of SCORM defect: a learner who already passed with a high score opens the content again (to review, or by accident), scores lower this time, and their LMS record regresses to the lower score — permanently erasing a legitimate prior achievement.

### Definitions

| Term | Definition | Lifetime |
|---|---|---|
| **Current Attempt Score** | The score computed from the learner's actual answers *in the runtime session happening right now*. | Reset to 0 (or an equivalent "no answers yet" state) every time a genuinely new attempt starts. |
| **Historical Score / Best Score** | The highest score this learner has ever achieved on this registration, across every past session, as recorded by the LMS and/or backend. | Persists indefinitely; only ever increases. |
| **Highest Score (the value actually written to SCORM)** | `max(historical score, current attempt score)`, recomputed every time a score is about to be written. | Recomputed on every write; the "current view" of the best score. |

### The preservation formula

Before writing any score to SCORM, compute the highest score from *every* source of prior truth you have access to, and always write that maximum — never the raw current-attempt value on its own:

```js
function getHighestScore(currentAttemptScore, {
  previouslyPersistedScore,   // from your own backend/local restoration
  scormReportedBestScore,     // from the SCORM adapter's own memory (see below)
  restoredCmiScoreRaw,        // from a restored CMI snapshot, if you keep one
}) {
  return Math.max(
    normalize(previouslyPersistedScore),
    normalize(scormReportedBestScore),
    normalize(restoredCmiScoreRaw),
    normalize(currentAttemptScore),
  );
}
```

Every source is included because any one of them might be the only place the true best score currently lives, depending on which restoration path fired (see [§8](#8-suspend--resume)). Omitting any one source reintroduces the regression bug for the specific scenario that source was covering.

### Who updates what, and how often

| Operation | When it runs | What it writes | Regresses best score? |
|---|---|---|---|
| Per-answer score sync | After every scoring-relevant interaction | Recomputes highest score and commits it to the LMS *unconditionally*, even if this particular answer didn't raise it | Never — see below |
| Final reporting | Exactly once, at true completion | Same highest-score computation, plus final `lesson_status` | Never |

**Field-tested pitfall:** a "commit only if the score increased" optimization is a real bug, not a harmless optimization. If a learner's best score is 80%, and they open a new, lower-scoring attempt but never reach that attempt's own completion (they close the tab mid-way), any per-answer sync that skips committing because "the new score isn't higher" will also skip *re-affirming* the still-valid 80% with the LMS. If the LMS's own stored value had, for any reason, drifted to something else in the interim (a partial write from the abandoned attempt, a race condition), the learner's correctly-preserved 80% never gets written back. **The correct behavior is: the best-score *value* only increases, but the *commit itself* should happen on every sync, writing whatever the current best score is — equal, lower current attempt, or higher.**

```js
// Field-tested shape: bestScore only ever increases, but the commit
// happens unconditionally, every time this is called.
function updateScore(currentAttemptScore) {
  if (!connected) return false;

  const candidate = normalize(currentAttemptScore);
  if (candidate !== null && candidate > bestScore) {
    bestScore = candidate;          // only ever raises bestScore
  }

  api.setValue("cmi.core.score.raw", String(bestScore));  // always commits
  api.setValue("cmi.core.score.min", "0");
  api.setValue("cmi.core.score.max", "100");
  return api.commit();
}
```

### Decimal precision

If your scoring model produces fractional scores (partial credit, weighted questions), do not round to an integer anywhere in the score pipeline. `Math.round()`, `parseInt()`, `Math.floor()`/`Math.ceil()`, and bitwise coercion (`| 0`, `~~x`) are all integer-truncating and will silently corrupt a `66.7%` into `67%` or `66%`, which then disagrees with whatever the content's own UI displays. Normalize floating-point noise (e.g., `33.30000000000004`) with a fixed `.toFixed(n)` precision instead — this is normalization, not rounding, and should be the *only* numeric transformation applied to a score value between calculation and the LMS write.

```js
function normalize(score) {
  const n = Number(score);
  if (!Number.isFinite(n)) return null;
  const clamped = Math.max(0, Math.min(100, n));
  return Number(clamped.toFixed(1));  // precision normalization, NOT rounding
}
```

### Feedback vs. persistence

A related but distinct rule: **visible, in-session feedback text/UI must be driven by the Current Attempt Score, never by the Historical Best Score, once a genuinely new attempt has actually started.** A returning learner with a previous 90% who starts over and is currently at 20% should see feedback reflecting 20% — not their historical 90% — even though the LMS record correctly continues to protect the 90% as the best score. The one narrow exception: before the learner has answered anything in a fresh session, it is reasonable to seed the visible feedback from the historical score (there is no current-attempt score yet), provided that seed is immediately overwritten the instant the learner's first real action of the new attempt occurs.

---

## 6. Completion Rules

### The status vocabulary (SCORM 1.2)

| `cmi.core.lesson_status` | Meaning | When to send it |
|---|---|---|
| `not attempted` | The learner has never launched this content. | Never sent by content — this is the LMS's own default before first launch. |
| `browsed` | The learner viewed the content in a non-tracked "review" mode. | Only relevant if your content explicitly supports a browse/preview mode distinct from a real attempt; most content never sends this. |
| `incomplete` | The learner has started but not finished, **or** finished with a failing result and the content has no separate `passed`/`failed` distinction to make. | Two situations: (a) an LMS-compliance bootstrap write at init if the LMS didn't already have a status, and (b) final reporting, when the highest score is below the pass threshold and completion (not pass/fail) is the operative concept for this content. |
| `completed` | The learner finished the content. Says nothing about performance/correctness — only that it was done. | Final reporting, for content that has no pass/fail concept (e.g., a slideshow with no scored questions). |
| `passed` | The learner finished **and** met the passing criteria. | Final reporting, when the highest score is at or above the pass threshold. |
| `failed` | The learner finished and did **not** meet the passing criteria. | Final reporting, when the highest score is below the pass threshold. |

**Practical rule for scored content:** use the `passed`/`failed` pair, driven by a threshold (commonly 50%, but content-defined) applied to the *highest* score, never the raw current-attempt score in isolation. For unscored content (pure presentation, no assessment), use `completed`/`incomplete` instead.

### The lifecycle of status, precisely

1. **First launch, in progress:** status remains `unknown`/`not attempted`-equivalent throughout. Never force a status mid-attempt just because a live, in-progress score has crossed the pass threshold — status and score update on different schedules; status is a *final-reporting* concern only.
2. **First launch, final feedback reached:** status is set exactly once, from the result at that moment (`highestScore >= threshold` → `passed`; else → `failed`).
3. **Reopened, before final feedback again:** the *previously saved* final status is restored and displayed, and remains unchanged for the entire new attempt until final feedback is reached again in *this* attempt. It must not reset to unknown, and it must not be upgraded early just because the live in-progress score has already crossed the threshold.
4. **Reopened, final feedback reached again:** status is recomputed from the *highest* score (which, by the preservation rule in [§5](#5-score-management), can only be equal to or better than any previous result) — so a previously-passed learner can never end up `failed` later, even if this specific attempt alone scored lower.

### A subtlety: distinguishing a bootstrap write from a real result

Many LMSs require `cmi.core.lesson_status` to hold a non-blank value immediately after `LMSInitialize`, so a compliant adapter will write `incomplete` at init time if the LMS reports `not attempted`/blank/`unknown`. **This bootstrap write must never be mistaken by your own code for a genuinely finalized `incomplete` result from a prior session.** Capture whatever status the LMS handed you *before* performing this bootstrap write, and expose that captured value (not the post-bootstrap value) to the rest of your code as "the last known finalized status."

This gets one layer more subtle: some LMSs default a **brand-new** registration's status directly to `incomplete` rather than `not attempted` — meaning the very first read of `lesson_status`, on a true first launch, may already look identical to a previously-bootstrapped `incomplete`. The field that disambiguates this is `cmi.core.entry`: it is `"ab-initio"` if and only if this is the registration's first-ever initialization. Read it alongside `lesson_status`, and when it is `"ab-initio"`, force your internal "last known finalized status" to fully-unknown regardless of what the raw status value says — because on a true first launch, there is no finalized status yet, no matter what the LMS's default happened to be.

```js
const status = api.getValue("cmi.core.lesson_status");
const entry  = api.getValue("cmi.core.entry");
const isFirstEntry = entry === "ab-initio";

capturedStatus = isFirstEntry
  ? { completionStatus: "unknown", successStatus: "unknown", hasFinalStatus: false }
  : mapLessonStatusToInternal(status);   // only meaningful on a real resume

// The bootstrap write happens AFTER capture, and is unconditional on the raw value:
if (status === "not attempted" || status === "" || status === "unknown") {
  api.setValue("cmi.core.lesson_status", "incomplete");
  api.commit();
}
```

---

## 7. Time Management

### session_time vs. total_time

- `cmi.core.session_time`: elapsed time in **this one session only**. Written once, at session end/final commit.
- `cmi.core.total_time`: the LMS's own running total across every session for this registration. In SCORM 1.2, the LMS accumulates this automatically from the `session_time` values you send — **content should not attempt to write this field directly.**

### Cumulative time, tracked by content

Despite the above, content frequently wants to *display* or *log* a cumulative "total time spent" figure independent of whatever the LMS's own record shows (for QA visibility, or because the content persists its own state snapshot outside the LMS entirely — see [§8](#8-suspend--resume)). This is a legitimate, separate concern from `cmi.core.total_time` and should be implemented as the content's own field, computed as:

```
new cumulative total = previously-persisted cumulative total (parsed)
                      + this session's elapsed seconds (Date.now() - sessionStartTimestamp)
```

This addition should happen **once**, at final completion — never at every intermediate score sync, or the same session's elapsed time will be double-counted into the running total on every partial update.

### Time formatting

SCORM 1.2 conventionally uses `HH:MM:SS`. Content sometimes encounters legacy or non-standard stored values (an ISO-8601-style `PT#H#M#S` string, a raw numeric seconds count, or a malformed/missing value). A robust parser should accept all of these on the *read* side, and always emit the canonical `HH:MM:SS` format on the *write* side:

```js
function parseTimeToSeconds(value) {
  if (value == null) return 0;
  if (typeof value === "number") return Number.isFinite(value) ? Math.max(0, Math.floor(value)) : 0;
  if (typeof value === "string") {
    const hhmmss = value.match(/^(\d+):(\d{2}):(\d{2})$/);
    if (hhmmss) return +hhmmss[1] * 3600 + +hhmmss[2] * 60 + +hhmmss[3];
    const iso = value.match(/^PT(\d+)H(\d+)M(\d+)S$/);
    if (iso) return +iso[1] * 3600 + +iso[2] * 60 + +iso[3];
    const numeric = Number(value);
    if (Number.isFinite(numeric)) return Math.max(0, Math.floor(numeric));
  }
  return 0;
}

function formatSecondsToTime(totalSeconds) {
  const s = Math.max(0, Math.floor(totalSeconds));
  const pad = (n) => String(n).padStart(2, "0");
  return `${pad(Math.floor(s / 3600))}:${pad(Math.floor((s % 3600) / 60))}:${pad(s % 60)}`;
}
```

**Default value discipline:** when a brand-new content session initializes its own local time-tracking state for the very first time (no prior value exists yet at all), default it to the canonical format your parser and formatter both use (`"00:00:00"`), not a legacy or foreign format. This is purely a default-value choice for *new* records — it should never change how a parser reads an *existing*, already-persisted value in whatever format it happens to be in; the parser must remain permissively backward-compatible even after the default is corrected, or every historical record written before the correction becomes unreadable.

### Multiple sessions

Because `session_time` is per-session and the LMS accumulates `total_time` on your behalf, a learner who visits an activity five times across five separate SCORM sessions will have five `session_time` writes and one continuously-growing LMS-side `total_time`. If your content maintains its own independent cumulative-time field (see above), it must perform the same accumulation logic itself, because it cannot rely on the LMS's internal accumulator (it likely does not have read access to a running total mid-session, only to the value last committed).

---

## 8. Suspend / Resume

### Two independent sources of "previous state"

A correct resume implementation must reconcile **two separate, independent sources of truth**, because either one might be the only place a given piece of state currently lives:

1. **LMS-native state** — whatever the SCORM API itself reports back via `LMSGetValue` on a fresh `LMSInitialize` (`cmi.core.lesson_status`, `cmi.core.score.raw`, `cmi.suspend_data`, etc.). This is available even if your content has no backend of its own at all.
2. **Application/backend-persisted state** — a full snapshot of your content's own data model, saved by *your own* backend or storage layer, independent of and in addition to whatever the LMS tracks. This is common when content needs richer state than SCORM's data model can hold (per-question timestamps, detailed attempt history, etc.), or when the same learner record needs to be visible outside the LMS entirely.

### Priority rule

When both sources are available and both contain a meaningful value for the same concept, **the application/backend-persisted state wins**, because it is typically the richer, more authoritative source (it usually *is* what was originally used to construct the LMS values in the first place). The LMS-native path should only be consulted as a **fallback** for exactly the case the backend path cannot cover: a bare SCORM-session relaunch where no backend snapshot exists yet (or is not accessible) but the LMS itself still holds a previously-committed result from an earlier session against the same registration.

```
              ┌─────────────────────────────┐
              │  Backend/application state   │
              │  available for this learner?  │
              └───────────────┬───────────────┘
                       yes │        │ no
                           ▼        ▼
              restore from it   ┌─────────────────────────────┐
              (wins if present) │  LMS-native state available   │
                                │  (getPersistedStatus, etc.)?  │
                                └───────────────┬───────────────┘
                                         yes │        │ no
                                             ▼        ▼
                                restore from it   true first launch —
                                (fallback only)    everything defaults fresh
```

### What must be restored, and in what order

For a typical scored, status-tracked activity, restore in this order, each step only filling in gaps the previous step left untouched:

1. Create the fresh default state for a brand-new attempt (default status `unknown`, default score `0`, default cumulative time `"00:00:00"`).
2. If a backend/application snapshot exists, copy its **continuity fields only** (`completion_status`, `success_status`, `total_time`, `score.raw`/`min`/`max`/`scaled`, a visit counter, etc.) into the fresh state — do **not** wholesale-replace the fresh state with the old snapshot, because the underlying *content* (questions, config) should always load from its live, current source, not from a frozen historical copy. Only the SCORM-continuity metadata should carry over.
3. If, after step 2, the status is still at its default "unknown" (meaning no backend snapshot existed, or it had nothing meaningful to restore), consult the LMS-native persisted status as a fallback, and apply it only in that case.
4. Only after both restoration steps complete should attempt-counting, feedback-metadata preparation, or any current-session score computation run.

**Field-tested pitfall:** restoring a backend snapshot by wholesale-replacing the live content object with the old snapshot (rather than copying only the continuity fields onto a freshly-loaded live object) silently freezes the learner's content at whatever it looked like when the snapshot was taken — any subsequent authoring update to the content's questions, text, or configuration will never be seen by a returning learner, because their "restored" session is really just replaying stale, saved JSON instead of loading the current live source.

### `suspend_data`

`cmi.suspend_data` is SCORM's own built-in mechanism for mid-attempt resume — an opaque, content-defined string blob (4096 characters in SCORM 1.2, far larger in 2004) that the content writes as its state changes and reads back on relaunch to restore exactly where the learner left off. If your content does not have an independent backend snapshot mechanism, `suspend_data` is the correct and only SCORM-native place to persist this kind of state — but be mindful of the character limit in 1.2; it is easy to exceed with a naive JSON-stringify of a large state object, and there is no standard error-recovery behavior defined for what happens when you do.

### A same-tab reload is not a fresh launch — and your content frame is not the whole session

Content is frequently embedded in an iframe inside the LMS's own player chrome. Calling `location.reload()` (or the browser's own reload) on that inner frame reloads *your* JavaScript context — every module-level variable resets — but it does **not** reload the LMS player around it. The actual SCORM API object lives in that surviving ancestor frame (which is why a correct `findAPI` implementation walks `window.parent`/`window.top`/`window.opener`, not just `window`), and so does whatever session state the LMS itself is tracking.

This has a concrete consequence: SCORM 1.2 requires an `LMSFinish` call before a second `LMSInitialize` can succeed. Most production integrations deliberately never call `LMSFinish` from content code at all (see [§13](#13-anti-patterns)'s "premature session termination" anti-pattern) — session end is the host environment's responsibility, not the content's. So when the content frame reloads and re-runs its own `LMSInitialize`, a spec-conformant LMS is *expected* to reject it, because from the LMS's point of view the previous session was never properly closed. **A failed `LMSInitialize` on a reload is not evidence that the SCORM connection is broken — it is evidence that it never actually went away.**

Treating that rejection as "no SCORM available" and falling back to fresh-attempt defaults is the single most common way a working, previously-scored session appears to silently lose its history after a reload, even though the LMS itself still has the correct data the whole time.

**Recovery pattern — verify before discarding, without ever repeating `LMSInitialize`:**

1. Attempt `LMSInitialize` once, normally, as always.
2. If it fails, do **not** immediately conclude the connection is dead, and do **not** call `LMSInitialize` again. Instead, probe the already-discovered raw API handle directly with a harmless read — `API.LMSGetValue("cmi.core.score.raw")` — followed by `API.LMSGetLastError()`.
3. Treat error code `0` (SCORM's universal, vendor-neutral "no error" code) from that probe as proof a session is genuinely active and answering: recover your wrapper's local "connected" state from this, and proceed to read the LMS-native score/status normally.
4. Treat any other outcome — a thrown exception, a non-zero error code, no API found at all — as a genuine failure. Do not force a "connected" state on unverified evidence; fail safe exactly as described in [§11](#11-error-handling).

This distinction matters because most thin SCORM wrapper libraries gate their own `getValue`/`setValue` helpers behind a local "is this session active" flag that only gets set inside a *successful* `LMSInitialize` call — so a naive fix (just start calling `getValue` again) silently no-ops without ever reaching the LMS, and needs its own local flag recovered by the same evidence-based probe before those calls will do anything.

**Field-tested pitfall:** restoring *status* (`completion_status`/`success_status`) from the LMS on relaunch while forgetting to restore *score* the same way. It is tempting to treat status and score as restored together because they are conceptually related, but they are frequently two separate accessor calls in an adapter (e.g. a `getPersistedStatus()` alongside a `getBestScore()`), and it is easy to wire up only one of them. The visible symptom is exactly what you'd expect from the [§5](#5-score-management) highest-score rule silently not being honored: a learner who previously passed at a high score reloads, scores lower on the new attempt, and every downstream final-state computation — completion, success, any console/debug summary — legitimately (per its own inputs) reports the *new*, lower attempt as if it were the whole truth, because the one number it needed to reconcile against was never fed back in. The fix is never to special-case the summary/log output itself; it is to make sure the restoration step feeds *every* value the reconciliation step depends on — for score specifically, reconcile via `Math.max(currentLocalScore, previouslyKnownScore, lmsReportedBestScore)`, never a plain overwrite, so a stale or zero LMS-native read can never downgrade a value already known to be correct locally, and a valid local value can never be downgraded by it either.

---

## 9. Question Lifecycle

### The three lifecycle boundaries

Every question-and-answer-driven activity, regardless of its specific question types, has three distinct lifecycle boundaries that must be identified *independently* for the specific runtime you're working with — their names and exact trigger conditions vary per implementation, but the concepts are universal:

| Boundary | Meaning | Common mistake |
|---|---|---|
| **`ATTEMPT_EVALUATED`** | An answer/attempt has just been checked. This is *not* necessarily the same moment the question is "done" — a wrong, retryable attempt is evaluated but not terminal. | Treating every evaluated attempt as if it were terminal — causes duplicate scoring/logging/persistence on every retry. |
| **`QUESTION_TERMINAL_STATE`** | The current logical question can no longer be re-answered (retries exhausted, "show answer" invoked, correct answer given, drag/drop fully placed). Per-question reporting/logging belongs here. | Reporting from `ATTEMPT_EVALUATED` instead — over-reports on multi-attempt or multi-part questions. |
| **`OVERALL_FINAL_FEEDBACK`** | The single point where activity-level completion becomes active (a results screen, a "you're done" transition). The *final* activity-level report belongs here, not at the last question's own terminal state. | Reporting final completion from the last question's own terminal handler instead of waiting for the overall final-feedback transition — causes a duplicate/premature final report, race-condition-prone against the true final-feedback UI transition. |

```
  Learner answers
        │
        ▼
  ATTEMPT_EVALUATED ──────────► is this attempt terminal for the
        │                        current question? (correct, OR
        │                        retries exhausted, OR show-answer
        │                        invoked, OR single-required-action)
        │
        ├── NO  (retryable) ──► loop back, no logging, no per-question
        │                       report — only score-state sync if your
        │                       scoring model needs live-updated state
        │
        └── YES ─────────────► QUESTION_TERMINAL_STATE
                                  │  per-question logging/report fires
                                  │  here, exactly once
                                  ▼
                                is this the LAST question?
                                  │
                        ┌─────── NO ────────┐         YES ───────────┐
                        ▼                   │                        ▼
                 advance to next            │            suppress the ordinary
                 question, loop              │            per-question report —
                                             │            wait for the real
                                             │            OVERALL_FINAL_FEEDBACK
                                             │            transition instead
                                             ▼
                                    (repeat from ATTEMPT_EVALUATED)


                                OVERALL_FINAL_FEEDBACK
                                  │
                                  ▼
                          compute final CMI values
                                  │
                                  ▼
                          persist final state
                                  │
                                  ▼
                          final report / final log
                                  │
                                  ▼
                          session-end signal
```

### Why the last question needs special handling

The last question's own `QUESTION_TERMINAL_STATE` and the activity's `OVERALL_FINAL_FEEDBACK` are two *different* moments, even though they're related — the learner typically must still transition to a results/summary screen (click "Next"/"Finish", or an automatic transition) between finishing the last question and the activity being truly, finally complete. Two defects follow directly from conflating them:

1. **Duplicate per-question logging on the final question.** If your per-question logging fires unconditionally at every question's terminal state, the last question produces both its own ordinary per-question log *and* a final report — when the correct behavior is for the last question to produce *only* the final report. Suppress the ordinary per-question output specifically for the question index that is currently the last one, using a per-index guard (not a single global boolean — a global flag can block legitimate logging for an *earlier* question if state ordering is ever slightly different than expected).

2. **Duplicate final-state persistence.** This is the more damaging version, and the single most common real-world SCORM defect this guide's field experience surfaces: if the last question's own terminal handler independently sends its state to a backend/persistence endpoint (as a normal, correct behavior for every *non-final* question, to keep partial progress saved), and the true final-completion flow *also* persists the finalized state moments later, the endpoint gets hit twice for the same question — once with pre-final data, once with the correctly finalized data. The fix is always the same shape: **guard the per-question persistence call specifically when the current question is the last one**, so that persistence for the final question happens *only* through the true final-completion path.

```js
// The generalizable shape of the fix, regardless of what the per-question
// persistence function or the "is this the last question" check are named
// in your specific implementation:
function onQuestionTerminal() {
  updateLiveScoreState();          // safe to run on every question, including the last
  if (!isFinalQuestionInProgress()) {
    persistPartialProgress();      // the endpoint the final flow will hit again — must be skipped here
  }
  logPerQuestionSummary();         // this function's own internal guard suppresses output for the final question
}
```

**Why a guard on one call site is not enough:** if the same persistence endpoint is reachable from more than one code path (a "correct answer" handler *and* a "show answer" handler, say, both eventually calling the same underlying send), guarding only the more obvious call site does not guarantee the less obvious one is also guarded. Every distinct code path that can reach the shared persistence endpoint must be traced and guarded independently — do not assume a sibling function is safe merely because a structurally similar function nearby was already fixed.

### Retry vs. terminal, and "show answer"

A frequently mishandled sub-case: a wrong answer that grants the learner a retry is *not* terminal, and must not log or persist as if it were — but score-state can still legitimately be synced (since the learner's live score-so-far genuinely changed, even on a wrong attempt, if your scoring model tracks attempts). If the retry is eventually followed by a "show answer" action (rather than a correct retry), the "show answer" moment — not the original wrong attempt — is the true terminal state and owns the single canonical per-question report.

---

## 10. Logging

### The four audiences, and why they must be kept separate

| Log tier | Audience | When it should print | What it should contain |
|---|---|---|---|
| **Developer logs** | Engineers during local development | Anywhere useful during development | Anything — verbose, unfiltered, freely added and removed |
| **QA logs** | QA testers validating scoring/completion/persistence correctness | After each terminal question state (local/non-production environments only) | A structured, filtered object: current score, completion/success status, attempt count, the runtime-selected question set (not the full raw content JSON) |
| **SCORM Cloud / LMS-visible logs** | Whoever is watching the browser console while validating against a real or test LMS session | **Exactly once**, only after the learner reaches final completion | A single compact line: final score, final completion status, final success status |
| **Production logs** | Nobody, ideally — or a real error-tracking pipeline | Only genuine errors | Caught exceptions from SCORM API calls; never routine lifecycle information |

### Why the SCORM-Cloud-visible summary must be final-feedback-only

This deserves its own explicit rule because it is easy to get subtly wrong even when the underlying intent is understood correctly:

> **The compact SCORM-visible summary line is a Final Feedback operation. It belongs exclusively to the final-reporting lifecycle step and must never be reachable from any per-question or per-attempt code path — even a path that is otherwise completely correct for the non-final QA log.**

A very easy, very common mistake: a shared per-question logging dispatcher correctly suppresses the local QA object for a testing/production environment split, but *also* prints the compact summary line whenever that same environment check passes — meaning a real LMS/SCORM-Cloud session sees one summary line printed after *every question*, not once at the end. This is wrong even though nothing about the *scoring* or *persistence* is broken — it is purely a logging-timing defect, but it is exactly the kind of defect that makes a real LMS validation session look chaotic and makes final-state debugging much harder than it needs to be.

**The generalizable fix shape**, regardless of what your per-question dispatcher is named:

```js
// WRONG — reachable from every question, not just the final one:
function afterEachQuestion() {
  if (isFinalReportingEnvironment()) {
    printCompactSummary();     // fires on every question — BUG
  } else {
    printLocalQaObject();
  }
}

// CORRECT — the compact summary is reachable from exactly one place:
function afterEachQuestion() {
  if (!isFinalQuestionInProgress()) {
    printLocalQaObject();      // local/dev only, self-guarded internally
  }
}

function afterFinalFeedback() {          // called exactly once, from the true final-completion path
  if (isFinalReportingEnvironment()) {
    printCompactSummary();
  } else {
    printLocalQaObject();
  }
}
```

This rule applies **regardless of what a given runtime names its per-question dispatcher** — if your codebase has more than one differently-named implementation of "the per-question logging hook" across different modules/activities, every one of them must be checked independently; a fix applied to files using one naming convention does not automatically cover files using a different one for the architecturally-equivalent hook.

### What the QA object should (and should not) contain

Include only fields meaningful for validating correctness: current score (both raw/percentage and, if your model has one, a normalized display value), completion/success status, cumulative time, attempt/visit count, and the runtime-selected (already shuffled/filtered) question set — summarized to timestamps and trial counts, not full question/answer content. Exclude: full raw content payloads, DOM/UI object references, internal-only implementation fields not needed for QA validation, and anything that would make the log unsafe or meaningless to read in a real LMS console (SCORM Cloud validation sessions are commonly watched live by non-engineers).

---

## 11. Error Handling

### Every SCORM API call is a potential failure point

The SCORM API is exposed by a third party (the LMS) over a communication path your content does not control (a frame/window hierarchy that could be misconfigured, blocked by browser security policy, or simply absent in a standalone preview). Treat every single call into it as fallible:

```js
try {
  const result = window.ScormService.someOperation();
} catch (e) {
  console.error("ScormService <operation> error:", e);
  // never rethrow — a SCORM failure must not break the learning experience
}
```

### Initialization failures

If `LMSInitialize` fails, or the API object cannot be located at all, the content must still be fully usable — just without reporting. Do not block rendering, gate the UI, or throw on a failed/absent SCORM connection. Every downstream SCORM call site should independently check connection state before attempting to use it (see the pattern in [§2](#2-scorm-architecture)'s adapter surface — `isConnected()` should be the first check in nearly every adapter method).

**Exception worth distinguishing:** a failed `LMSInitialize` is not always "no SCORM available" — it can also mean an already-active session rejected a redundant re-initialize (typically after a same-tab content reload; see [§8](#8-suspend--resume)'s "A same-tab reload is not a fresh launch" for the full recovery pattern). Before falling back to fresh-attempt defaults, it is worth a single evidence-based read probe to distinguish "genuinely unreachable" from "already active and still fully usable" — but never by retrying `LMSInitialize` itself, and never by assuming a specific vendor's error code for "already initialized," since different SCORM 1.2 LMS implementations report that condition differently.

### Missing API

A completely standalone preview (no LMS present at all — common during content authoring/QA before packaging) is not an error state; it is an expected, first-class mode of operation. `findAPI` returning nothing should be handled identically to `LMSInitialize` returning `false` — the content runs normally, reporting simply never fires.

### Commit failures

`LMSCommit` can return `false` (or throw, in a defensively-wrapped adapter) if the LMS is unreachable, times out, or rejects the write for any reason. There is no standard retry mechanism defined by SCORM itself. A reasonable production posture:

- Log the failure (developer/error tier — see [§10](#10-logging)).
- Do not block the learner's progress on a failed commit — the activity should continue.
- If your content has an independent backend persistence path (see [§8](#8-suspend--resume)), that path is your safety net; do not build elaborate SCORM-side retry logic when a parallel, more reliable persistence path already exists.
- If SCORM is your *only* persistence path, consider a bounded retry (a small number of attempts, with backoff) on the *final* report specifically — since that one commit matters far more than any individual per-question sync, which will simply be superseded by the next one anyway.

### Resume failures

If restoration (see [§8](#8-suspend--resume)) encounters malformed, missing, or unexpected data from either the backend or the LMS, fail safe: fall back to fresh-attempt defaults rather than throwing or leaving the activity in a half-initialized state. A learner starting over with a lost history is a bad but recoverable outcome; a broken launch is not.

### Retry strategy summary

| Failure | Recommended response |
|---|---|
| API not found | Run without SCORM; no retry (nothing to retry against) |
| `LMSInitialize` returns false, no prior session in this frame | Run without SCORM; no retry |
| `LMSInitialize` returns false, likely reload of an already-active session | One evidence-based raw read probe (§8/§11 above), never a second `LMSInitialize`; fall back to "run without SCORM" only if the probe itself fails |
| `LMSSetValue`/`LMSCommit` fails mid-session | Log and continue; rely on the next natural sync point to re-attempt |
| Final `LMSCommit` fails | Optionally retry a small bounded number of times; log loudly either way |
| Malformed restored data | Fall back to fresh-attempt defaults; never throw during restoration |

---

## 12. Best Practices

- **Keep SCORM isolated.** One adapter module, one well-defined call surface, called from a small number of explicit lifecycle points in the activity. See [§2](#2-scorm-architecture).
- **Never mix UI code with LMS communication.** A button's click handler should call an activity-level method (`onAnswerSubmitted()`), never `LMSSetValue` directly.
- **Never duplicate score calculation.** There should be exactly one function that computes "the current attempt's score," and every consumer (feedback UI, SCORM sync, final reporting) calls that same function — never a second, slightly-differently-written copy of the same formula.
- **Avoid multiple owners for any single CMI field or lifecycle flag.** Maintain (and keep current) a responsibility matrix like the one in [§4](#4-cmi-data-model) for your actual field set.
- **Use a shared helper/service, and reuse it.** If a helper for a concept (time formatting, score normalization, status mapping) already exists, extend or reuse it — do not write a second, parallel implementation elsewhere in the codebase just because it's locally convenient. Divergent duplicate implementations are a common source of "it works in one activity but not another" bugs.
- **Trace runtime ownership before changing anything.** In any codebase with more than a couple of files, do not assume a file owns a piece of behavior because of its name or its folder location. Trace the actual call chain. A file named `scoring.js` might be a pure helper called *by* the real owner, not the owner itself.
- **Guard every optional/global dependency.** Any helper function or global your SCORM integration depends on that might not be present in every deployment context (a packaging variant, a standalone preview) should be checked with a `typeof x === "function"` guard before use, not assumed to exist.
- **Compute final values fresh at final-report time.** Never assume a per-question sync's value is still accurate by the time final reporting runs — recompute from the authoritative current state at that exact moment.
- **One explicit "already reported" flag, checked and set atomically at the top of the final-report function**, before any asynchronous work begins inside it. This is the single most reliable way to guarantee "exactly once" semantics for final reporting.

---

## 13. Anti-Patterns

Each of the following has been observed as a real, shipped defect in production SCORM content — not a theoretical concern.

### Updating SCORM after every click, indiscriminately

Symptom: a shared, repeatable interaction handler (a click on any of several answer options, a per-item drag-drop callback) fires a full SCORM sync *and* a canonical per-question log on every raw interaction, rather than only once per logically-completed question. For a single-required-click question this is invisible; for a multi-select or multi-part question it produces one sync/log per click instead of one per completed question.

**Fix shape:** introduce a local (not global) "is this question now actually complete" flag inside the interaction handler, set only in the branches that represent true completion, and gate the sync/log behind it.

### Duplicating score calculations

Symptom: the feedback UI computes "current score" with one formula, and the SCORM sync path computes it with a second, separately-maintained formula. The two drift apart the moment either one is edited without the other being updated in lockstep.

**Fix shape:** one function, `calculateCurrentAttemptScore()`, called by every consumer.

### Multiple status owners

Symptom: `completion_status`/`success_status` (or the SCORM 1.2 equivalent `lesson_status`) is written from more than one place — an initialization default, a restoration step, a per-question sync, and a final-report step — without a clear, enforced rule for which of these is allowed to write a *non-default* value and when.

**Fix shape:** the responsibility matrix from [§4](#4-cmi-data-model). Per-question syncs should update score-related fields only, never status; status is a final-report-only concern (with the narrow exception of restoration, which is a one-time "fill in from prior state" operation, not an ongoing write).

### Mixing feedback with persistence

Symptom: the visible current-attempt feedback text is computed from — or worse, written into the same field as — the persisted historical/best-score state, so a returning learner's fresh 0%-progress attempt briefly (or permanently) displays feedback calculated from their old best score instead of their actual current progress.

**Fix shape:** the Current-Attempt vs. Historical separation from [§5](#5-score-management), enforced as a hard rule with no exceptions once a new attempt has genuinely started.

### Overwriting historical score

Symptom: a per-question or final-report score write uses the raw current-attempt score directly, without first computing the maximum against every known prior-best source. A lower-scoring later attempt silently erases a previous pass.

**Fix shape:** the preservation formula in [§5](#5-score-management), applied at *every* write site, with no write site exempted.

### Calling session-termination too early, or from the wrong layer

Symptom: content code calls `LMSFinish` (or an equivalent "end the session" API) directly from an answer handler, a `beforeunload` listener, or immediately after final score reporting — rather than treating session termination as the responsibility of the external host/runtime environment.

**Why this matters:** `LMSFinish` tells the LMS the SCO's communication session is over. If content ends the session prematurely (before the host environment is ready, or on every navigation event, or redundantly on top of a host-driven termination), you risk losing late-arriving commits, double-terminating a session the host is also trying to manage, or leaving the host's own sequencing/navigation logic in an inconsistent state. **Recommendation: in most embedded/hosted deployments, do not call session-termination from content code at all.** Let the external runtime/host decide when the session truly ends; content's job ends at final reporting. If your architecture requires content to signal "I'm done" to an orchestrating host, use a distinct, purpose-built signal (a `postMessage` notification, a dedicated "session complete" callback) — not the SCORM termination call itself.

### Treating a bootstrap status write as a real prior result

Covered in detail in [§6](#6-completion-rules) — worth repeating here as an anti-pattern in its own right: code that reads `lesson_status` immediately after the adapter's own compliance-driven bootstrap write, rather than the value captured *before* that write, will misidentify every true first launch as a previously-finalized `incomplete` attempt.

---

## 14. Validation Checklist

Run through this checklist before considering any SCORM integration — new or modified — production-ready.

- [ ] **Initialization** — SCORM connects synchronously, before the activity's own state is constructed; a missing/failed connection does not block or break the activity.
- [ ] **Resume** — both backend/application-persisted state and LMS-native persisted state are checked, with a defined and correct priority order; a bare LMS relaunch with no backend snapshot still restores a previously-finalized status correctly.
- [ ] **Completion** — the activity's own definition of "done" is used to trigger final reporting; SCORM never guesses at completion independently.
- [ ] **Best Score** — every score write (per-question and final) computes the maximum across every known prior-best source before writing; a lower later attempt never regresses a previously-achieved score.
- [ ] **Status** — `passed`/`failed` (or `completed`/`incomplete`) is set exactly once at final reporting, derived from the *highest* score, never mid-attempt, never regressed by a later lower-scoring attempt.
- [ ] **Total Time** — cumulative time correctly adds the current session's elapsed time to the previously-persisted total, exactly once, at final reporting only.
- [ ] **Logging** — the compact/production-visible summary is reachable from exactly one place, gated by the true final-completion path; developer/QA logs are separated by environment.
- [ ] **Final Feedback** — the activity-level final report fires from the true `OVERALL_FINAL_FEEDBACK` transition, not from the last question's own terminal state.
- [ ] **Session End** — the session-termination signal (if your architecture calls one from content at all) fires after, and only after, final CMI values are computed and persisted — never before, never from an unrelated event handler.
- [ ] **Duplicate reporting** — an explicit "already reported" flag guards final reporting; every real completion path funnels through the same guarded function.
- [ ] **Duplicate persistence** — every distinct code path that can reach a shared persistence endpoint has been traced individually and guarded for the final-question case, not just the most obvious call site.
- [ ] **Error handling** — every SCORM API call is wrapped defensively; no SCORM failure can throw an uncaught exception into the activity's own code.
- [ ] **Decimal precision** — no integer-rounding operation exists anywhere in the score pipeline, if your scoring model supports fractional scores.

---

## 15. Testing Checklist

Manual QA scenarios that should be run against a real or sandboxed SCORM/LMS environment (SCORM Cloud or equivalent) before release, and re-run after any change to the SCORM layer.

| # | Scenario | Expected result |
|---|---|---|
| 1 | **First launch** | Status `unknown`/`not attempted`-equivalent throughout; score `0`; no premature status write beyond the compliance bootstrap. |
| 2 | **Resume, before completion** | Reopening mid-attempt restores prior progress correctly (from whichever source — backend or LMS-native — actually has it); status remains as previously saved, not reset. |
| 3 | **Passed** | Completing with a score at/above threshold sets `passed`/`completed`; score matches what was actually achieved. |
| 4 | **Failed** | Completing with a score below threshold sets `failed`/`incomplete`; score matches what was actually achieved. |
| 5 | **Reload mid-attempt** | Reloading before completion does not trigger a duplicate or premature final report; in-progress state is preserved or safely reset per your resume design. |
| 6 | **Multiple attempts** | Each new attempt increments any visit/attempt counter exactly once; current-attempt feedback resets to reflect the new attempt, not the historical best. |
| 7 | **Higher score on a later attempt** | The LMS-recorded best score rises to match; status upgrades if the new score now passes. |
| 8 | **Lower score on a later attempt (after a prior pass)** | The LMS-recorded best score and `passed` status are **unchanged** — the lower attempt's own visible feedback reflects the lower score, but nothing persisted regresses. |
| 9 | **Suspend** | Whatever your resume mechanism defines as "leaving mid-attempt" correctly captures resumable state. |
| 10 | **Restore** | Relaunching after a suspend correctly reconstructs the mid-attempt state the learner left. |
| 11 | **No SCORM API present (standalone preview)** | Activity is fully playable; no thrown errors; no broken UI states. |
| 12 | **Console/log output on a real LMS session** | Exactly one compact summary line, printed only after final feedback is reached — never during question progression, retries, or "show answer." |
| 13 | **Retry / Show Answer** | Neither produces a premature final report or a premature per-question terminal log; only the true terminal action for that question does. |
| 14 | **Last question, before final feedback screen** | Reaching the last question's own terminal state does *not* by itself trigger final reporting; final reporting waits for the true final-feedback transition. |

---

## 16. AI Assistant Rules

Guidance specifically for AI coding assistants (or any automated tooling) working on a SCORM integration.

1. **Always identify the true runtime owner before editing.** Trace the actual call chain (who calls whom, in what order, under what conditions) rather than inferring ownership from a file's name or folder location. A file named `scoring.js` or `answer-check.js` is very often a pure helper, called *by* the true owner — not the owner itself.

2. **Never modify SCORM-related code without first understanding the full lifecycle it participates in.** Read the complete target file, not an excerpt. A change that looks locally correct (e.g., "just add a guard here") can violate an invariant (best-score preservation, exactly-once final reporting) that is only visible by tracing the surrounding lifecycle.

3. **Never infer that a call site is safe because a similarly-named or nearby call site was already fixed.** Every distinct code path reaching a shared endpoint (a persistence call, a logging call) must be traced and verified independently. "A guard on one call site does not guarantee every reachable call site is guarded" is a standing rule, not a one-time observation.

4. **Prefer the smallest possible change.** Do not refactor, rename, or restructure code beyond what the specific task requires. SCORM logic that is "considered stable" (already correctly implementing the invariants in this guide) should not be rewritten "while you're in there" — isolate the requested change.

5. **Never merge Current Attempt Score and Historical/Best Score into a single code path**, even under time pressure or for apparent simplification. This is the single most consequential rule in this entire guide, per [§5](#5-score-management).

6. **Preserve existing public APIs, parameter orders, and exported method names** unless a rename is explicitly requested and approved.

7. **Reuse existing shared helpers rather than introducing parallel equivalents.** If a codebase already has a time-formatting helper, a score-normalization helper, or a status-mapping helper, extend or call it — do not write a second implementation of the same concept elsewhere.

8. **Validate syntax and trace execution paths after every change**, and report exactly what was inspected, what was changed, what was deliberately left unchanged, and why. Silence about scope is not acceptable — an assistant that changes a file should account for every part of that file it touched and every part it didn't.

9. **When something is ambiguous, report it — do not invent behavior.** If the correct handling of an edge case (a malformed restored value, an undocumented field, a naming inconsistency) is genuinely unclear from the existing code and documentation, say so explicitly rather than guessing silently.

10. **Treat documentation as load-bearing, not decorative.** If a change affects SCORM behavior, lifecycle, data flow, or logging, the relevant documentation (a spec, a project reference, a guide like this one) should be updated in the same change — not left to drift out of sync with the code it describes.

---

## 17. Future Extensions

This guide's core architecture — a clean UI/activity/business-logic separation with SCORM confined to a single boundary adapter — is specifically designed to make the following extensions additive rather than disruptive.

### SCORM 2004

Because the adapter is the only layer that knows CMI field names, migrating from SCORM 1.2 to SCORM 2004 (or supporting both simultaneously, detected at runtime) is primarily a matter of swapping the adapter's internal field-name mapping (see the table in [§1](#1-introduction)) and adding support for the split `completion_status`/`success_status` model instead of the single `lesson_status`. The activity's own business logic — score calculation, question flow, feedback — needs no changes at all if the boundary was respected.

### xAPI (Experience API / Tin Can API)

xAPI abandons SCORM's field-based CMI model entirely in favor of a statement-based model (`actor` did `verb` on `object`, with a `result`). An adapter that already isolates "the activity's state" from "how it's reported" can add an xAPI-emitting sibling adapter that observes the same activity-state events (question answered, activity completed) and emits xAPI statements instead of — or alongside — SCORM CMI writes, without touching the activity itself.

### cmi5

cmi5 is a profile of xAPI specifically designed to bring SCORM-like launch, completion, and scoring semantics to xAPI-based content, while remaining LMS-agnostic in its underlying transport. An architecture that already treats SCORM as a swappable adapter is well-positioned for cmi5, since cmi5's own launch/session/completion lifecycle maps closely to the lifecycle described in [§3](#3-runtime-lifecycle).

### LRS (Learning Record Store) integration

An LRS is the xAPI ecosystem's equivalent of an LMS's tracking backend, but designed to receive statements from many sources, not just one piece of SCO content. If your adapter already emits xAPI statements (see above), pointing them at an LRS instead of (or in addition to) a traditional LMS is a transport-level configuration change, not an architectural one.

### Offline sync

Content that must function without a live network connection (or a live LMS iframe) needs a local queue: write every "would-be" SCORM/xAPI event to local storage first, and replay the queue against the real API once connectivity is restored. Because the adapter is already the single choke point for all outbound communication, inserting a local queue *inside* the adapter (rather than scattered through the activity) is a contained change — the activity continues calling the same adapter methods regardless of whether they're currently writing live or queuing offline.

### Analytics

Because the adapter already observes every scoring-relevant and completion-relevant event in the activity's lifecycle, it is a natural, low-risk place to also emit analytics events (to a product-analytics pipeline, a data warehouse, etc.) — the same events that drive SCORM reporting are, in the overwhelming majority of cases, exactly the events a product analytics system also wants to know about. Emit analytics events from the same lifecycle points documented in [§3](#3-runtime-lifecycle) and [§9](#9-question-lifecycle), rather than instrumenting the UI layer separately and risking a second, divergent definition of "what counts as a completed question."

---

*This document is a living engineering reference. It should be reviewed and extended as new SCORM edge cases, LMS quirks, or architectural lessons are encountered — the goal is for it to remain the single source of truth for "how we do SCORM," independent of any one project's lifetime.*
