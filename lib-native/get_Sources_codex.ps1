[CmdletBinding()]
param()

$ErrorActionPreference = 'Stop'
$projectRoot = $PSScriptRoot
$outputDirectory = Join-Path $projectRoot 'Sources_codex'

# Each entry maps one source file to its unique upload name.
$sources = @(
    @{ Source = 'buzzTime\js\main.js'; Target = 'buzzTime_main.js' }
    @{ Source = 'buzzTime_primary\js\main.js'; Target = 'buzzTime_primary_main.js' }

    @{ Source = 'digital-screen_26\choose\js\zoki.js'; Target = 'digital-screen_choose_zoki.js' }
    @{ Source = 'digital-screen_26\digital-screen-input\js\zoki.js'; Target = 'digital-screen-input_zoki.js' }
    @{ Source = 'digital-screen_26\digital-screen-input\js\zoki_.js'; Target = 'digital-screen-input_zoki_.js' }
    @{ Source = 'digital-screen_26\digital-screen-input\js\zoki_video.js'; Target = 'digital-screen-input_zoki_video.js' }
    @{ Source = 'digital-screen_26\digital-screen-input\js\zoki_with_animation.js'; Target = 'digital-screen-input_zoki_with_animation.js' }
    @{ Source = 'digital-screen_26\digital-screen-tworound-input-choose\js\zoki_.js'; Target = 'digital-screen-tworound-input-choose_zoki_.js' }
    @{ Source = 'digital-screen_26\digital-screen-tworound-input-choose\js\zoki_choose_input.js'; Target = 'digital-screen-tworound-input-choose_zoki_choose_input.js' }
    @{ Source = 'digital-screen_26\digital-screen-tworound-input-choose\js\zoki.js'; Target = 'digital-screen-tworound-input-choose_zoki.js' }

    @{ Source = 'glossary_26\assets\js\main.js'; Target = 'glossary_main.js' }

    @{ Source = 'penguin_26\penguin-choose\js\main.js'; Target = 'penguin-choose_main.js' }
    @{ Source = 'penguin_26\penguin-input\js\main_.js'; Target = 'penguin-input_main_.js' }
    @{ Source = 'penguin_26\penguin-input\js\main.js'; Target = 'penguin-input_main.js' }
    @{ Source = 'penguin_26\penguin-tworound-input-choose\js\main.js'; Target = 'penguin-tworound-input-choose_main.js' }
    @{ Source = 'penguin_26\penguin-tworound-inputs\js\main_.js'; Target = 'penguin-tworound-inputs_main_.js' }
    @{ Source = 'penguin_26\penguin-tworound-inputs\js\main.js'; Target = 'penguin-tworound-inputs_main.js' }

    @{ Source = 'slideshow\js\main.js'; Target = 'slideshow_main.js' }
    @{ Source = 'slideshow-tabs\js\main.js'; Target = 'slideshow-tabs_main.js' }
    @{ Source = 'space_26\space-input\js\main_.js'; Target = 'space-input_main_.js' }

    @{ Source = 'storyline-q\assets\js\choose.js'; Target = 'storyline-q_choose.js' }
    @{ Source = 'storyline-q\assets\js\correct.js'; Target = 'storyline-q_correct.js' }
    @{ Source = 'storyline-q\assets\js\drag.js'; Target = 'storyline-q_drag.js' }
    @{ Source = 'storyline-q\assets\js\input.js'; Target = 'storyline-q_input.js' }
    @{ Source = 'storyline-q\assets\js\main.js'; Target = 'storyline-q_main.js' }
    @{ Source = 'storyline-q\assets\js\match.js'; Target = 'storyline-q_match.js' }
    @{ Source = 'storyline-q\assets\js\slide-show.js'; Target = 'storyline-q_slide-show.js' }
)

# Include every top-level JavaScript file from the shared ../js folder, except
# files that are intentionally excluded. New files added there are picked up
# automatically on the next run.
$sharedJsDirectory = Join-Path $projectRoot '..\js'
$excludedSharedFiles = @(
    'submit_sender comment.js'
    'submit_sender.js'
    'finalProgress.js'
)

if (-not (Test-Path -LiteralPath $sharedJsDirectory -PathType Container)) {
    throw "Shared JavaScript directory not found: $sharedJsDirectory"
}

$sharedSources = Get-ChildItem -LiteralPath $sharedJsDirectory -File -Filter '*.js' |
    Where-Object { $_.Name -notin $excludedSharedFiles } |
    Sort-Object Name |
    ForEach-Object {
        @{
            Source = "..\js\$($_.Name)"
            Target = "shared_$($_.Name)"
        }
    }

$sources += @($sharedSources)

# Documentation supplied to Codex alongside the collected source files.
$documentationSources = @(
    @{
        Source = '..\..\implementation-specification.md'
        Target = 'implementation-specification.md'
    }
    @{
        Source = '..\PROJECT_DOCUMENTATION.md'
        Target = 'PROJECT_DOCUMENTATION.md'
    }
    @{
        Source = '..\SCORM_IMPLEMENTATION_GUIDE.md'
        Target = 'SCORM_IMPLEMENTATION_GUIDE.md'
    }
    @{
        Source = '..\AI_RULES.md'
        Target = 'AI_RULES.md'
    }
)

$sources += $documentationSources

$duplicateTargets = @($sources | Group-Object { $_.Target } | Where-Object { $_.Count -gt 1 })
if ($duplicateTargets.Count -gt 0) {
    throw "Duplicate target names: $($duplicateTargets.Name -join ', ')"
}

$missingSources = @()
foreach ($item in $sources) {
    $sourcePath = Join-Path $projectRoot $item.Source
    if (-not (Test-Path -LiteralPath $sourcePath -PathType Leaf)) {
        $missingSources += $item.Source
    }
}

if ($missingSources.Count -gt 0) {
    throw "Source files not found:`n- $($missingSources -join "`n- ")"
}

if (-not (Test-Path -LiteralPath $outputDirectory)) {
    New-Item -ItemType Directory -Path $outputDirectory | Out-Null
}

# Only remove generated JavaScript and map files from this dedicated folder.
Get-ChildItem -LiteralPath $outputDirectory -File -ErrorAction SilentlyContinue |
    Where-Object {
        $_.Extension -eq '.js' -or
        $_.Name -eq 'SOURCES_MAP.md' -or
        $_.Name -eq 'implementation-specification.md' -or
        $_.Name -eq 'PROJECT_DOCUMENTATION.md' -or
        $_.Name -eq 'SCORM_IMPLEMENTATION_GUIDE.md' -or
        $_.Name -eq 'AI_RULES.md'
    } |
    Remove-Item -Force

foreach ($item in $sources) {
    Copy-Item -LiteralPath (Join-Path $projectRoot $item.Source) `
        -Destination (Join-Path $outputDirectory $item.Target)
}

$mapLines = @(
    '# Sources map'
    ''
    'Generated by `get_Sources_codex.ps1`. Do not edit generated JavaScript files here; edit their original source and run the task again.'
    ''
    '| Generated file | Original source |'
    '|---|---|'
)

foreach ($item in $sources) {
    $sourceForMarkdown = $item.Source -replace '\\', '/'
    $mapLines += "| ``$($item.Target)`` | ``$sourceForMarkdown`` |"
}

Set-Content -LiteralPath (Join-Path $outputDirectory 'SOURCES_MAP.md') `
    -Value $mapLines -Encoding utf8

$javaScriptCount = @($sources | Where-Object { $_.Target -like '*.js' }).Count
$documentationCount = @($sources | Where-Object { $_.Target -like '*.md' }).Count
Write-Host "get_Sources_codex completed: $javaScriptCount JavaScript files and $documentationCount documentation files copied to:"
Write-Host $outputDirectory
