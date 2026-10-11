# get_Sources_codex

This task collects the required JavaScript files into a single folder named `Sources_codex`, making them easy to upload to Codex.

The original files are never moved or modified by this task. It copies the latest version of every source file and gives each copy a unique name that identifies its original project or activity.

The task also automatically collects every top-level `.js` file from the shared `../js` directory, except for the explicitly excluded files listed below. Shared files receive a `shared_` prefix, such as `shared_scorm.js`.

The project-level `../../implementation-specification.md` document is also copied into `Sources_codex` without renaming. It is included in `SOURCES_MAP.md`, allowing Codex to identify its original location.

The `../PROJECT_DOCUMENTATION.md` document is also copied into `Sources_codex` without renaming and recorded in the source map.

The `../SCORM_IMPLEMENTATION_GUIDE.md` and `../AI_RULES.md` documents are also copied without renaming and recorded in the source map.

## Run the task

Run this command from the project root:

```powershell
.\get_Sources_codex.ps1
```

You can also ask Codex:

> Run the `get_Sources_codex` task.

When using this prompt outside the project, include the contents of `get_Sources_codex.prompt.md`.

Every run removes previously generated `.js` files from `Sources_codex`, copies the latest source files, and generates `Sources_codex/SOURCES_MAP.md`.

No original source file is deleted or modified.

## Naming convention

The generated name consists of the project or activity name, followed by an underscore and the original JavaScript filename.

The `_26` suffix is removed from the generated display name only. The complete original path remains available in the source map.

Examples:

| Generated filename | Original source |
|---|---|
| `buzzTime_main.js` | `buzzTime/js/main.js` |
| `buzzTime_primary_main.js` | `buzzTime_primary/js/main.js` |
| `digital-screen_choose_zoki.js` | `digital-screen_26/choose/js/zoki.js` |
| `digital-screen-input_zoki_video.js` | `digital-screen_26/digital-screen-input/js/zoki_video.js` |
| `penguin-input_main_.js` | `penguin_26/penguin-input/js/main_.js` |
| `storyline-q_choose.js` | `storyline-q/assets/js/choose.js` |
| `shared_scorm.js` | `../js/scorm.js` |
| `shared_finalProgress_26.js` | `../js/finalProgress_26.js` |
| `implementation-specification.md` | `../../implementation-specification.md` |
| `PROJECT_DOCUMENTATION.md` | `../PROJECT_DOCUMENTATION.md` |
| `SCORM_IMPLEMENTATION_GUIDE.md` | `../SCORM_IMPLEMENTATION_GUIDE.md` |
| `AI_RULES.md` | `../AI_RULES.md` |

The complete source map is regenerated on every run at `Sources_codex/SOURCES_MAP.md`. Codex should use this map as the source of truth for resolving a generated filename to its original file.

## Correct editing workflow

For example, when asked to modify `digital-screen-input_zoki_video.js`:

1. Find the generated filename in `Sources_codex/SOURCES_MAP.md`.
2. Open and edit the original source file: `digital-screen_26/digital-screen-input/js/zoki_video.js`.
3. Run `get_Sources_codex` again.
4. Upload the refreshed file from `Sources_codex`.

Do not edit files inside `Sources_codex` directly. They are generated copies and will be replaced the next time the task runs.

The same rule applies to all collected documentation: edit the original documents and rerun the task to refresh their collected copies.

## Excluded files

The required JavaScript files are collected from `storyline-q/assets/js`, except for:

- `animation.js`
- `lottie-min.js`
- `vue.js`

All top-level `.js` files are automatically collected from `../js`, except for:

- `submit_sender comment.js`
- `submit_sender.js`
- `finalProgress.js`

Files from this shared directory use the `shared_` prefix in `Sources_codex`. If a new `.js` file is added to `../js`, it will be included automatically the next time the task runs unless its filename is added to `$excludedSharedFiles`.

## Updating the source list

To add or remove project-specific source files later, update the `$sources` array in `get_Sources_codex.ps1`. To change exclusions from the shared `../js` directory, update `$excludedSharedFiles`.

Every source entry must have a unique generated target name. The script stops with an error if a source file is missing or if two entries use the same generated filename.
