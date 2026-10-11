# Prompt: get_Sources_codex

Run the `get_Sources_codex` task from the project root using:

```powershell
.\get_Sources_codex.ps1
```

After running the task:

1. Confirm that the command completed without errors.
2. Confirm that `Sources_codex` contains the collected JavaScript files.
3. Read `Sources_codex/SOURCES_MAP.md` to resolve every generated filename to its original source path.
4. When asked to modify a file using its generated name, do not edit the copy inside `Sources_codex`. Use the source map, edit the original source file, and run `get_Sources_codex` again to refresh the generated copy.
5. Do not include `storyline-q/assets/js/animation.js`, `lottie-min.js`, or `vue.js`.
6. Include all top-level `.js` files from `../js` using the generated `shared_` prefix, except for `submit_sender comment.js`, `submit_sender.js`, and `finalProgress.js`.
7. Include `../../implementation-specification.md` as `Sources_codex/implementation-specification.md`, and use the original project-level document whenever an edit is requested.
8. Include `../PROJECT_DOCUMENTATION.md` as `Sources_codex/PROJECT_DOCUMENTATION.md`, and use the original document whenever an edit is requested.
9. Include `../SCORM_IMPLEMENTATION_GUIDE.md` as `Sources_codex/SCORM_IMPLEMENTATION_GUIDE.md`, and use the original document whenever an edit is requested.
10. Include `../AI_RULES.md` as `Sources_codex/AI_RULES.md`, and use the original document whenever an edit is requested.

If a source file is missing or generated filenames conflict, stop and report the error instead of producing an incomplete collection.
