# PROJECT DOCUMENTATION
## InterActive Learning Objects — Academic Year 2026/2027

**Generated:** 2026-06-25  
**Analysis Method:** Full recursive directory scan + source-file inspection (read-only)  
**Analysis Scope:** All files under `D:\ST-Projects-InterActive_2025\InterActive-Project\2026_2027`  
**Final Rescan Performed:** Yes — before document generation  

---

## TABLE OF CONTENTS

1. [Phase 1: Complete Project Directory Analysis](#phase-1)
2. [Phase 2: Detailed Per-Template Analysis](#phase-2)
3. [Phase 3: data.json Analysis for Every Template](#phase-3)
4. [Phase 4: Cross-Template Data Model Comparison Matrix](#phase-4)
5. [Phase 5: Template Data Model Families](#phase-5)
6. [Phase 6: Deep Runtime Libraries Analysis](#phase-6)
7. [Phase 7: Template ↔ Runtime Relationship Mapping](#phase-7)
8. [Phase 8: Produced Learning Objects Analysis](#phase-8)
9. [Phase 9: Naming Convention Analysis](#phase-9)
10. [Phase 10: Authoring Workflow Reconstruction](#phase-10)
11. [Phase 11: Authoring System Readiness Assessment](#phase-11)
12. [Phase 12: Complete Dependency Mapping](#phase-12)

---

## PHASE 1: COMPLETE PROJECT DIRECTORY ANALYSIS {#phase-1}

### 1.1 Root-Level Structure

```
D:\ST-Projects-InterActive_2025\InterActive-Project\2026_2027\
│
├── PROJECT_DOCUMENTATION.md          ← This file
│
├── allTemplete\                       ← ALL template source files (49 template dirs)
│   ├── ara\                           ← Arabic subject templates (2)
│   ├── eng\                           ← English subject templates (1 + 1 misplaced LO)
│   ├── mth\                           ← Mathematics subject templates (36 dirs)
│   ├── rel\                           ← Religion reference templates (2)
│   ├── slideshow\                     ← Religion slideshow grade templates (6)
│   ├── slidshow tabs\                 ← Religion slideshow-tabs grade templates (4)
│   └── soc\                           ← Social Studies subject templates (1)
│
├── ara_3r_1a\                         ← Produced LOs: Arabic, Grade 3, Semester 1
├── ara_5r_1a\                         ← Produced LOs: Arabic, Grade 5, Semester 1
├── ara_6r_1a\                         ← Produced LOs: Arabic, Grade 6, Semester 1
├── eng_4r_1e\                         ← Produced LOs: English, Grade 4, Semester 1
├── eng_5r_1e\                         ← Produced LOs: English, Grade 5, Semester 1
├── eng_6r_1e\                         ← Produced LOs: English, Grade 6, Semester 1
├── soc_4r_1a\                         ← Produced LOs: Social Studies, Grade 4, Sem 1
├── soc_5r_1a\                         ← Produced LOs: Social Studies, Grade 5, Sem 1
├── soc_6r_1a\                         ← Produced LOs: Social Studies, Grade 6, Sem 1
│
├── js\                                ← Shared JavaScript utilities (5 files)
│   ├── choose.js
│   ├── finalProgress.js
│   ├── input.js
│   ├── inputTwoRound.js
│   └── submit_sender.js
│
└── lib-native\                        ← Runtime library families (9 dirs)
    ├── buzzTime\
    ├── buzzTime_primary\
    ├── digital-screen\
    ├── glossary\
    ├── penguin\
    ├── slideshow\
    ├── slideshow-tabs\
    ├── space\
    └── storyline-q\
```

### 1.2 allTemplete Expanded Tree

```
allTemplete\
├── ara\
│   ├── glossary\
│   │   ├── mymovie.html
│   │   ├── data.json
│   │   ├── images\             ← environment background images
│   │   └── audio\             ← bg.mp3, click.mp3
│   └── storyline-q\
│       ├── mymovie.html
│       ├── data.json
│       ├── slideShow.json
│       ├── style\
│       │   ├── lo-style.css
│       │   └── lo-style.scss
│       ├── audio\             ← q1.mp3, q2.mp3, hint 1.mp3, …
│       ├── images\            ← t1.png, t2.png, t3.png (drag images)
│       └── img\slidshow\      ← slide1.png, slide2.png, slide3.png
│
├── eng\
│   ├── 2025_eng_6r_1e_02_02_02\    ← MISPLACED PRODUCED LO (not a template)
│   │   ├── mymovie.html
│   │   └── data.json
│   └── buzzTime\
│       ├── mymovie.html
│       ├── data.json
│       ├── audio\
│       └── style\
│           └── style.css
│
├── mth\                             ← 36 mathematics template directories
│   ├── digital-screen-choose-lower-ara\
│   ├── digital-screen-choose-lower-eng\
│   ├── digital-screen-choose-upper-ara\
│   ├── digital-screen-choose-upper-eng\
│   ├── digital-screen-input-lower-ara\
│   ├── digital-screen-input-lower-eng\
│   ├── digital-screen-input-upper-ara\
│   ├── digital-screen-input-upper-eng\
│   ├── digital-screen-input-video\
│   ├── digital-screen-input-with-animation\
│   │   └── arrowanimation\          ← Sub-template with own data.json
│   ├── digital-screen-tworound-input-choose\
│   ├── digital-screen-tworound-inputs-lower-ara\
│   ├── digital-screen-tworound-inputs-lower-eng\
│   ├── digital-screen-tworound-inputs-upper-ara\
│   ├── digital-screen-tworound-inputs-upper-eng\
│   ├── penguin-choose-lower-ara\
│   ├── penguin-choose-lower-eng\
│   ├── penguin-choose-upper-ara\
│   ├── penguin-choose-upper-eng\
│   ├── penguin-input-lower-ara\
│   ├── penguin-input-lower-eng\
│   ├── penguin-input-upper-ara\
│   ├── penguin-input-upper-eng\
│   ├── penguin-tworound-input-choose\
│   ├── penguin-tworound-inputs-lower-ara\
│   ├── penguin-tworound-inputs-lower-eng\
│   ├── penguin-tworound-inputs-upper-ara\
│   ├── penguin-tworound-inputs-upper-eng\
│   ├── space-input-lower-ara\
│   ├── space-input-lower-eng\
│   ├── space-input-upper-ara\
│   └── space-input-upper-eng\
│
├── rel\
│   ├── slideshow_16_9\              ← Reference/base template
│   │   ├── mymovie.html
│   │   ├── data.json
│   │   ├── images\
│   │   │   ├── s\                   ← Slide images (s1.png …)
│   │   │   └── q\                   ← Question images
│   │   └── sound\q\                 ← Question audio files
│   └── slideshow-tabs_16_9\         ← Reference/base template with tabs
│       ├── mymovie.html
│       ├── data.json
│       ├── images\
│       │   ├── t1\, t2\, t3\       ← Per-tab slide images
│       │   └── q\
│       └── sound\q\
│
├── slideshow\                       ← 6 grade-specific slideshow templates
│   ├── slideshow_2025_rel_1r_2a\
│   │   ├── mymovie.html
│   │   ├── data.json
│   │   ├── images\s\ & images\q\
│   │   └── sound\q\
│   ├── slideshow_2025_rel_2r_2a\    ← (same structure)
│   ├── slideshow_2025_rel_3r_2a\
│   ├── slideshow_2025_rel_4r_2a\
│   ├── slideshow_2025_rel_5r_2a\
│   └── slideshow_2025_rel_6r_2a\
│       └── data-images.json         ← UNIQUE extra JSON (grade 6 only)
│
└── slidshow tabs\                   ← 4 grade-specific slidshow-tabs templates
    ├── slidshow_tabs_2025_rel_3r_1a\  ← Has 4 tabs (t1–t4), 24 slides
    │   ├── mymovie.html
    │   ├── data.json
    │   ├── images\t1\, t2\, t3\, t4\
    │   └── sound\q\
    ├── slidshow_tabs_2025_rel_4r_1a\  ← Has 3 tabs (t1–t3)
    ├── slidshow_tabs_2025_rel_5r_1a\  ← Has 3 tabs; .DS_Store found in t1\
    └── slidshow_tabs_2025_rel_6r_1a\
```

### 1.3 lib-native Expanded Tree

```
lib-native\
├── buzzTime\
│   ├── audio\          ← 18 MP3 files (bg, buzz, click, right, wrong, vs, etc.)
│   ├── fonts\          ← Lexend (variable), Vazirmatn (variable)
│   ├── images\         ← keyboard UI images (key buttons, backspace, enter, …)
│   ├── js\
│   │   ├── animation.js
│   │   ├── lottie-min.js
│   │   ├── main.js    ← Vue app entry point (ES module)
│   │   └── vue.js
│   ├── json\           ← 20 Lottie animation JSON files
│   │   ├── BoyCharVs1.json, BoyCharVs2.json
│   │   ├── Festival.json, intro.json, timer.json
│   │   ├── boyStage.json, boyStageFeedback.json
│   │   ├── boyVs1Feedback.json, boyVs2Feedback.json
│   │   ├── buzzScreen.json, chooseAvatar.json
│   │   ├── feedback.json, girlStageFeedback.json
│   │   ├── girlVsFeedback.json, leftLight.json
│   │   ├── vsLight.json, mychar-girl.json
│   │   ├── boy-vs.json, girl-char-vs.json, girl-vs.json
│   └── style\
│       ├── style.css, style.css.map, style.scss
│
├── buzzTime_primary\   ← Variant of buzzTime for primary grades
│   └── (same structure as buzzTime)
│
├── digital-screen\
│   ├── assets\
│   │   ├── audio\      ← music, rightanswer, wronganswer, click_btn, etc.
│   │   ├── fonts\
│   │   ├── images\     ← character images (zoki happy/sad), UI elements
│   │   ├── json\       ← Lottie animations (stars, progress bar, etc.)
│   │   └── style\
│   ├── digital-screen-choose\
│   │   └── js\
│   │       └── zoki.js  ← Vue runtime for choose activities
│   ├── digital-screen-input\
│   │   └── js\
│   │       └── zoki.js  ← Vue runtime for input activities
│   ├── digital-screen-input-with-animation\
│   │   └── js\
│   │       └── zoki.js
│   ├── digital-screen-input-video\
│   │   └── js\
│   │       └── zoki.js
│   └── digital-screen-tworound\
│       └── js\
│           └── zoki.js
│
├── glossary\
│   ├── assets\
│   │   ├── audio\      ← answerAudio, bgAudio, clickAudio
│   │   ├── environment\  ← 18+ theme CSS sets
│   │   │   ├── egypt_and_the_nile\, aswan\, camp\, castle\, desert\
│   │   │   ├── energy\, football\, harbor\, hospital\, jungle\
│   │   │   ├── Jungle_warrior\, library\, robot_1\, robot_2\
│   │   │   ├── sea\, smart_city\, stadium\, tokyo\
│   │   ├── fonts\      ← samim-fd.ttf, vazirmatn-regular_ara.ttf
│   │   ├── images\     ← logo, music, preloader, prev/next buttons
│   │   ├── js\
│   │   │   ├── animation.js
│   │   │   ├── lottie-min.js
│   │   │   ├── main.js   ← Vue app entry point
│   │   │   └── vue.js
│   │   ├── json\
│   │   │   └── box.json  ← Lottie animation for answer reveal
│   │   └── style\
│   │       ├── lo-style.css, lo-style.scss
│
├── penguin\
│   ├── assets\audios\  ← rightanswer, wronganswer, click_btn
│   ├── penguin-choose\
│   │   └── js\main.js
│   └── penguin-input\
│       └── js\main.js
│
├── slideshow\
│   └── (assets + js/main.js)
│
├── slideshow-tabs\
│   └── (assets + js/main.js)
│
├── space\
│   ├── assets\
│   │   ├── audio\      ← music, rightanswer, click_btn, startclick2
│   │   └── (images, fonts, json, style)
│   └── space-input\
│       └── js\main.js  ← Vue app entry point
│
└── storyline-q\
    └── assets\
        ├── audios\     ← correct, wrong, click, popup, feed-correct, feed-wrong
        │               ← popup-correct[lang].mp3, popup-wrong1[lang].mp3, …
        ├── js\
        │   ├── animation.js
        │   ├── choose.js   ← ChooseManager class
        │   ├── drag.js     ← DragDropManager class
        │   ├── input.js    ← InputManager class
        │   ├── lottie-min.js
        │   ├── main.js     ← Vue app entry point
        │   ├── match.js    ← MatchManager class
        │   └── vue.js
        └── style\
            ├── font.css, images.css, slid-show.css, style.css
```

### 1.4 Produced Learning Objects Tree

```
[subject]_[grade]_[semester]\
  └── [activity-type]\
      └── [LO-name]\
          ├── mymovie.html
          ├── data.json
          └── [assets: audio\, images\, style\, slideShow.json, …]

Produced LOs (25 total):
ara_3r_1a\storyline\2026_ara_3r_1a_01_02_02\      ← Arabic Gr3 Sem1
ara_5r_1a\storyline\2026_ara_5r_1a_01_01_01\      ← Arabic Gr5 Sem1
ara_6r_1a\storyline\2026_ara_6r_1a_01_01_01\      ← Arabic Gr6 Sem1
ara_6r_1a\storyline\2026_ara_6r_1a_01_02_02\      ← Arabic Gr6 Sem1
ara_6r_1a\storyline\2026_ara_6r_1a_01_04_02\      ← Arabic Gr6 Sem1
eng_4r_1e\game\2025_eng_4r_1e_05_02_04\           ← English Gr4 Sem1 (BuzzTime)
eng_5r_1e\game\2025_eng_5r_1e_02_02_02\           ← English Gr5 Sem1 (BuzzTime)
eng_5r_1e\game\2025_eng_5r_1e_03_02_02\
eng_5r_1e\game\2025_eng_5r_1e_05_02_05\
eng_5r_1e\game\2025_eng_5r_1e_06_02_02\
eng_6r_1e\game\2025_eng_6r_1e_03_02_04\           ← English Gr6 Sem1 (BuzzTime)
eng_6r_1e\game\2025_eng_6r_1e_05_02_05\
soc_4r_1a\storyline\2026_soc_4r_1a_01_01_05\      ← Social Gr4 Sem1
soc_4r_1a\storyline\2026_soc_4r_1a_01_01_06\
soc_4r_1a\storyline\2026_soc_4r_1a_01_02_01\
soc_4r_1a\storyline\2026_soc_4r_1a_01_03_01\
soc_5r_1a\storyline\2026_soc_5r_1a_01_01_01\      ← Social Gr5 Sem1
soc_5r_1a\storyline\2026_soc_5r_1a_01_01_02\
soc_5r_1a\storyline\2026_soc_5r_1a_01_02_03\
soc_5r_1a\storyline\2026_soc_5r_1a_01_02_04\
soc_6r_1a\storyline\2026_soc_6r_1a_01_01_02\      ← Social Gr6 Sem1
soc_6r_1a\storyline\2026_soc_6r_1a_01_02_01\
soc_6r_1a\storyline\2026_soc_6r_1a_01_02_04\
soc_6r_1a\storyline\2026_soc_6r_1a_01_03_02\
soc_6r_1a\storyline\2026_soc_6r_1a_01_04_02\
```

### 1.5 File Statistics

| Category | Count |
|---|---|
| Template directories (allTemplete) | 49 |
| Unique template types (logical) | 19 |
| Produced Learning Objects (mymovie.html) | 25 |
| Total data.json files (templates only) | 50 |
| Runtime library families (lib-native) | 9 |
| Shared JavaScript utilities (js/) | 5 |
| Glossary environment themes | 18+ |
| BuzzTime Lottie animation files | 20 |
| Total JSON files (project-wide) | ~96 |
| SCSS source files (alongside CSS) | Found in mth templates, ara/storyline-q, soc/storyline-q, buzzTime style, glossary |
| Anomalies found | 3 (misplaced LO, `.DS_Store`, extra `data-images.json`) |

### 1.6 Anomalies Detected

| # | Path | Description |
|---|---|---|
| 1 | `allTemplete/eng/2025_eng_6r_1e_02_02_02/` | **Misplaced produced LO** inside template directory. Has `mymovie.html` + `data.json`. Should be in `eng_6r_1e/` folder. |
| 2 | `allTemplete/slidshow tabs/slidshow_tabs_2025_rel_5r_1a/images/t1/.DS_Store` | macOS metadata file committed to repo. Indicates development on macOS at some point. |
| 3 | `allTemplete/slideshow/slideshow_2025_rel_6r_2a/data-images.json` | Extra JSON file present only in grade 6 slideshow. Purpose: Not Found in code (may be unused or in development). |

---

## PHASE 2: DETAILED PER-TEMPLATE ANALYSIS {#phase-2}

### 2.1 Template ID: `ara/glossary`

| Attribute | Value |
|---|---|
| Full Path | `allTemplete/ara/glossary/` |
| Subject | Arabic (ara) |
| Activity Type | Vocabulary DragDrop — match word to definition/antonym/plural/singular |
| Runtime Library | `lib-native/glossary/` |
| Root Element ID | `#glossary` (confirmed via mymovie.html) |
| Data Trigger | `data-urlpage="data"` on root div |
| Vue App File | `lib-native/glossary/assets/js/main.js` |

**Internal File Structure:**
```
glossary/
├── mymovie.html           ← Host page; loads runtime + data
├── data.json              ← Array root; DragDrop vocabulary schema
├── images/                ← Background environment images
└── audio/                 ← bg.mp3, click.mp3
```

**Script Loading Order (from mymovie.html):**
1. `lib-native/glossary/assets/js/lottie-min.js`
2. `lib-native/glossary/assets/js/vue.js`
3. `../../../js/submit_sender.js`
4. `lib-native/glossary/assets/js/main.js`
5. `lib-native/glossary/assets/js/animation.js`

**CSS Loading Order:**
1. `lib-native/glossary/assets/style/lo-style.css`
2. `lib-native/glossary/assets/environment/[environment]/images.css` ← dynamic per `data.json`

**Key Runtime Behavior:**
- Reads `data.json` field `environment` to select CSS theme from `/assets/environment/[name]/images.css`
- Activity has multiple rounds: `mean` (synonyms), `reverse` (antonyms), `plural`, `single`
- Each round = one `item` in `items[]` array, with its own `words[]` pairs
- Items are presented sequentially (not shuffled)
- No `upper`/`isEng` flags — Arabic-only template

---

### 2.2 Template ID: `ara/storyline-q`

| Attribute | Value |
|---|---|
| Full Path | `allTemplete/ara/storyline-q/` |
| Subject | Arabic (ara) |
| Activity Type | Multi-type quiz: choose, trueFalse, dragDrop, match, input |
| Runtime Library | `lib-native/storyline-q/` |
| Root Element ID | `#Question` |
| Data Trigger | `data-urlpage="data"` |
| Vue App File | `lib-native/storyline-q/assets/js/main.js` |

**Internal File Structure:**
```
storyline-q/
├── mymovie.html
├── data.json              ← Array root; multi-question schema
├── slideShow.json         ← Separate slideshow data (intro slides)
├── style/
│   ├── lo-style.css
│   └── lo-style.scss      ← SCSS source present
├── audio/                 ← q1.mp3, q2.mp3, hint 1.mp3, hint 2.mp3, …
├── images/                ← t1.png, t2.png, t3.png (drag zone images)
└── img/slidshow/          ← slide1.png, slide2.png, slide3.png
```

**Script Loading Order:**
1. `lib-native/storyline-q/assets/js/lottie-min.js`
2. `lib-native/storyline-q/assets/js/vue.js`
3. `../../../js/submit_sender.js`
4. `lib-native/storyline-q/assets/js/input.js` ← InputManager
5. `lib-native/storyline-q/assets/js/choose.js` ← ChooseManager
6. `lib-native/storyline-q/assets/js/match.js` ← MatchManager
7. `lib-native/storyline-q/assets/js/drag.js` ← DragDropManager
8. `lib-native/storyline-q/assets/js/main.js` ← Vue app
9. `lib-native/storyline-q/assets/js/animation.js`

**Key Runtime Behavior:**
- Questions are shuffled via `shuffleQuestions(posts[0].questions)` on mount
- Navigation driven by `navgations[]` array (note: typo in field name)
- Title page read from `navgations[0].title`
- Language suffix for audio loaded from `posts[0].langauge` (note: typo in field name)
- Supports `overrideFeedback` flag to replace default Arabic feedback text
- Touch events handled via `touchStart`, `touchMove`, `touchEnd` methods (mobile-friendly)
- Match question uses SVG line drawing between columns

---

### 2.3 Template ID: `soc/storyline-q`

| Attribute | Value |
|---|---|
| Full Path | `allTemplete/soc/storyline-q/` |
| Subject | Social Studies (soc) |
| Activity Type | Multi-type quiz (identical activity types to ara/storyline-q) |
| Runtime Library | `lib-native/storyline-q/` |
| Root Element ID | `#Question` |

**Internal File Structure:**
```
soc/storyline-q/
├── mymovie.html     ← Confirmed identical HTML structure to ara/storyline-q
├── data.json
├── slideShow.json
├── style/
│   ├── lo-style.css
│   └── lo-style.scss
└── audio/
```

**Note:** The `mymovie.html` for `soc/storyline-q` is structurally identical to `ara/storyline-q`. The same `lib-native/storyline-q/` runtime is used for both Arabic and Social Studies subjects. Differentiation is purely via `lo-style.css` and `data.json` content.

---

### 2.4 Template ID: `eng/buzzTime`

| Attribute | Value |
|---|---|
| Full Path | `allTemplete/eng/buzzTime/` |
| Subject | English (eng) |
| Activity Type | Competitive typing game — player vs AI |
| Runtime Library | `lib-native/buzzTime/` |
| Root Element ID | Not Found from template (uses ES module main.js) |
| Data Trigger | `data-urlpage="data"` (inferred from produced LO pattern) |
| Vue App File | `lib-native/buzzTime/js/main.js` |

**Internal File Structure:**
```
eng/buzzTime/
├── mymovie.html
├── data.json             ← Object root (UNIQUE — not Array)
├── audio/
└── style/
    └── style.css
```

**Key Distinctions:**
- Only template with **Object root** in data.json (all others are Array)
- Keyboard layout is defined inside `data.json` (not hardcoded in runtime)
- Has `hints: { en: [...], ar: [...] }` for bilingual hint support
- `questions[]` items have two sub-formats: content questions (`text`, `answer`) AND game state items (`id`, `state`, `answered`, `winner`)
- Contains debug/test questions (ids 107–108 with placeholder text)
- Heavy Lottie animation use: 20 animation JSON files for characters, VS screen, feedback

---

### 2.5 Template Group: `mth/digital-screen-*`

This group contains 10 template variants sharing the same `lib-native/digital-screen/` runtime.

#### 2.5.1 Variant Matrix

| Template Name | upper | isEng | SubType | Runtime JS |
|---|---|---|---|---|
| digital-screen-choose-lower-ara | false | false | Choose | digital-screen-choose/js/zoki.js |
| digital-screen-choose-lower-eng | false | true | Choose | digital-screen-choose/js/zoki.js |
| digital-screen-choose-upper-ara | true | false | Choose | digital-screen-choose/js/zoki.js |
| digital-screen-choose-upper-eng | true | true | Choose | digital-screen-choose/js/zoki.js |
| digital-screen-input-lower-ara | false | false | Input | digital-screen-input/js/zoki.js |
| digital-screen-input-lower-eng | false | true | Input | digital-screen-input/js/zoki.js |
| digital-screen-input-upper-ara | true | false | Input | digital-screen-input/js/zoki.js |
| digital-screen-input-upper-eng | true | true | Input | digital-screen-input/js/zoki.js |
| digital-screen-input-with-animation | false | false | Input | digital-screen-input-with-animation/js/zoki.js |
| digital-screen-input-video | false | false | Input | digital-screen-input-video/js/zoki.js |
| digital-screen-tworound-inputs-lower-ara | false | false | Input | digital-screen-tworound/js/zoki.js |
| digital-screen-tworound-inputs-lower-eng | false | true | Input | digital-screen-tworound/js/zoki.js |
| digital-screen-tworound-inputs-upper-ara | true | false | Input | digital-screen-tworound/js/zoki.js |
| digital-screen-tworound-inputs-upper-eng | true | true | Input | digital-screen-tworound/js/zoki.js |
| digital-screen-tworound-input-choose | true | false | Input | digital-screen-tworound/js/zoki.js |

#### 2.5.2 Standard Digital-Screen Template Structure

```
digital-screen-[variant]/
├── mymovie.html           ← Root div: <div id="digital-screen" data-urlpage="data">
├── data.json              ← Array root
├── audio/                 ← q1.mp3, q1 copy.mp3 (tworound only)
├── images/                ← Question/answer images
└── style/
    ├── lo-style.css
    └── lo-style.scss
```

**Script Loading Order (standard input):**
1. `../../../js/input.js`
2. `../../../js/finalProgress.js`
3. `../../../lib-native/digital-screen/digital-screen-input/js/zoki.js`
4. `../../../lib-native/digital-screen/assets/js/animation.js`

**Script Loading Order (choose):**
1. `../../../js/choose.js`
2. `../../../js/finalProgress.js`
3. `../../../lib-native/digital-screen/digital-screen-choose/js/zoki.js`
4. `../../../lib-native/digital-screen/assets/js/animation.js`

**Key Runtime Behavior (from zoki.js):**
- Vue app mounts on `#digital-screen`
- Items shuffled on mount: `this.shuffle(this.posts[0].items)`
- Font selection determined by `isEng` + `upper` flags:
  - `isEng=true`: ArialRounded (body), Amin (inputs)
  - `upper=true, isEng=false`: samim (body), ArialRounded (inputs)
  - `lower (upper=false, isEng=false)`: AraJozoor (all)
- Right-click protection active on non-localhost
- `finalResponse.submitData(...)` called immediately after data load

---

### 2.6 Template Group: `mth/penguin-*`

This group contains 9 template variants sharing `lib-native/penguin/`.

#### 2.6.1 Variant Matrix

| Template Name | upper | SubType | Activity |
|---|---|---|---|
| penguin-choose-lower-ara | false | input | Math comparison (<, >, =) |
| penguin-choose-lower-eng | false | input | Math comparison |
| penguin-choose-upper-ara | true | input | Math comparison |
| penguin-choose-upper-eng | true | input | Math comparison |
| penguin-input-lower-ara | false | input | Fill-in math |
| penguin-input-lower-eng | false | input | Fill-in math |
| penguin-input-upper-ara | true | input | Fill-in math |
| penguin-input-upper-eng | true | input | Fill-in math |
| penguin-tworound-inputs-lower-ara | false | input | Two-round fill-in |
| penguin-tworound-inputs-lower-eng | false | input | Two-round fill-in |
| penguin-tworound-inputs-upper-ara | true | input | Two-round fill-in |
| penguin-tworound-inputs-upper-eng | true | input | Two-round fill-in |
| penguin-tworound-input-choose | true | Input | Two-round fill-in + choose |

#### 2.6.2 Standard Penguin Template Structure

```
penguin-[variant]/
├── mymovie.html           ← Root div: <div id="penguin" data-urlpage="data">
├── data.json              ← Array root; informationLO is String (not Array)
├── audio/                 ← q1.mp3 [+ "q1 copy.mp3" for tworound]
├── images/                ← 01.png–06.png (character sequence) for choose variant
└── style/
    ├── lo-style.css
    └── lo-style.scss
```

**Script Loading Order:**
1. `../../../js/input.js` or `../../../js/inputTwoRound.js`
2. `../../../js/finalProgress.js`
3. `../../../lib-native/penguin/penguin-[type]/js/main.js`
4. `../../../lib-native/penguin/assets/js/animation.js`

**Key Distinctions from Digital-Screen:**
- `informationLO` is a **String** (not Array) — displayed directly
- `penguin-choose` is NOT a multiple-choice template; it is a **math comparison template** using `<`, `>`, `=` operators comparing two images
- `penguin-choose` items have `img1`, `img2` fields and a `choose[]` array of HTML entity operators
- Items shuffled on mount; `nextQuestion()` called immediately after `getData()`

---

### 2.7 Template Group: `mth/space-input-*`

| Attribute | Value |
|---|---|
| Template Count | 4 variants (lower-ara, lower-eng, upper-ara, upper-eng) |
| Runtime Library | `lib-native/space/` |
| Root Element ID | `#spaceTemplate` |
| Layout | 3-panel vertical: top label / input area / bottom label |
| Unique Field | `sup: ["text"]` — displayed above AND below the question panel |

```
space-input-[variant]/
├── mymovie.html           ← 3-panel body_table layout
├── data.json              ← Array root; has arrayanswer + sup[] fields
├── audio/                 ← q1.mp3
└── style/
    ├── lo-style.css
    └── lo-style.scss
```

**Script Loading Order:**
1. `../../../js/input.js`
2. `../../../js/finalProgress.js`
3. `../../../lib-native/space/space-input/js/main.js`
4. `../../../lib-native/space/assets/js/animation.js`

---

### 2.8 Template Groups: `rel/slideshow*` and `rel/slideshow-tabs*`

These templates are used for Religious Studies (REL subject). Two reference designs exist under `rel/` and 10 grade-specific instances exist under `slideshow/` and `slidshow tabs/`.

#### 2.8.1 Slideshow Template

```
slideshow_2025_rel_[grade]_[sem]/
├── mymovie.html           ← grade attribute selects CSS: <div grade="N">
├── data.json              ← Object root (NOT array); slides[] + questions[]
├── images/
│   ├── s/                 ← Slide images (s1.png, s2.png, …)
│   └── q/                 ← Question images (typ4-q1.png, typ4-a1-1.png, …)
└── sound/q/               ← 1.mp3, 2.mp3, … (per question)
```

**Key Distinctions:**
- Data root is **Object** (not Array)
- `grade` HTML attribute on root div selects `imgs-grade-N.css` CSS file
- Questions use `type: 2` (image MCQ) and `type: 3` (true/false) — numeric type codes
- Answer images follow pattern: `typ[N]-q[M].png` / `typ[N]-a[M]-[K].png`
- No `upper`, `isEng`, `SubType`, `informationLO` fields

#### 2.8.2 Slideshow-Tabs Template

```
slidshow_tabs_2025_rel_[grade]_[sem]/
├── mymovie.html
├── data.json              ← Object root; slides[] + tabs[] + questions[]
├── images/
│   ├── s1.png             ← Intro slide
│   ├── t1/                ← Tab 1 images
│   ├── t2/                ← Tab 2 images
│   ├── t3/                ← Tab 3 images
│   └── [t4/]              ← Tab 4 (grade 3 only has 4 tabs)
└── sound/q/
```

**Key Distinction:** Has `tabs[]` array in addition to `slides[]` and `questions[]`. Each tab has its own `slides[]` sub-array. Tab thumbnail image referenced as `img` field.

---

## PHASE 3: DATA.JSON ANALYSIS FOR EVERY TEMPLATE {#phase-3}

### 3.1 Notation

- **R** = Root-level field  
- **I** = Item-level field (inside `items[]` or `questions[]`)  
- **A** = Answer-level field (inside answer sub-objects)  
- **[RT]** = Runtime state — modified by Vue app during execution; should be `0`/`false`/`""` in template  
- **[AUTH]** = Authoring field — must be provided by content author

---

### 3.2 Glossary (ara/glossary/data.json)

**Root Type:** Array  
**Confirmed Reading:** Full file read

```
Root Object Fields:
─────────────────────────────────────────────────────────
Field                 Type        [R/I/A]  Purpose
─────────────────────────────────────────────────────────
counterCorrect        Number      R [RT]   Correct answer counter
LOcorrectcounter      Number      R [RT]   Running correct count
BloomTargets          null        R        Not used (null in template)
randomNumber          null        R        Unique to glossary; purpose unknown
loTargets             null        R        Learning targets (unused)
numberOfquestion      Number      R [RT]   Total question count (runtime-set)
id                    String      R [AUTH] LO identifier (e.g. "ara_3r_1a_01_01_02")
subjectId             String      R [AUTH] Empty in template (authoring field)
conceptId             String      R [AUTH] Empty in template
unitId                String      R [AUTH] Empty in template
lessonId              String      R [AUTH] Empty in template
title                 String      R [AUTH] Empty in template
keywords              String      R [AUTH] Empty in template
learningObjectives    String      R [AUTH] Empty in template
bloomLevels           Array       R [AUTH] Empty array; Bloom taxonomy levels
type                  String      R [AUTH] Empty in template
loDegree              null        R        LO difficulty degree (unused)
UserDegree            Number      R [RT]   User's achieved degree
startTime             String      R [RT]   Start timestamp (set at runtime)
endTime               String      R [RT]   End timestamp (set at runtime)
SubType               String      R [AUTH] "DragDrop" — discriminator field
environment           String      R [AUTH] CSS theme name (e.g. "egypt_and_the_nile")
items                 Array       R [AUTH] Array of glossary rounds
─────────────────────────────────────────────────────────

items[] Object Fields:
─────────────────────────────────────────────────────────
item                  String      I [AUTH] Round type: "mean"|"reverse"|"plural"|"single"
check                 Boolean     I [RT]   Whether round is completed
numberOfTrial         Number      I [RT]   Attempt count
questionlevel         String      I [AUTH] Empty in template
questionType          String      I [AUTH] "DragDrop"
answersType           String      I [AUTH] "DragDrop"
startTime             String      I [RT]   Round start time
endTime               String      I [RT]   Round end time
words                 Array       I [AUTH] Word-answer pairs for this round

  words[] Object Fields:
  theword             String      A [AUTH] Source word (displayed as draggable)
  answer              String      A [AUTH] Correct answer (displayed in drop zone)
─────────────────────────────────────────────────────────
```

**Notes:**
- `bloomLevels` is lowercase (inconsistency vs uppercase `BloomLevels` in other templates)
- `randomNumber: null` appears only in glossary — purpose not determinable from files
- The glossary has duplicate words in template (`الْأَوَانِي`/`الْأَوْعِیَة` repeated 14 times) — appears to be template placeholder/test data

---

### 3.3 Storyline-Q (ara/storyline-q and soc/storyline-q)

**Root Type:** Array  
**Confirmed Readings:** soc/storyline-q first 50 lines; ara/storyline-q HTML structure; runtime main.js

```
Root Object Fields:
─────────────────────────────────────────────────────────
counterCorrect        Number      R [RT]
LOcorrectcounter      Number      R [RT]
loTargets             null        R
numberOfquestion      Number      R [RT]   Set at runtime from questions.length
id                    String      R [AUTH]
subjectId             String      R [AUTH]
conceptId             String      R [AUTH]
unitId                String      R [AUTH]
lessonId              String      R [AUTH]
title                 String      R [AUTH]
keywords              String      R [AUTH]
learningObjectives    String      R [AUTH]
BloomLevels           Array       R [AUTH] uppercase B
type                  String      R [AUTH]
loDegree              null        R
UserDegree            Number      R [RT]
SubType               String      R [AUTH] e.g. "input", "Choose"
startTime             String      R [RT]
endTime               String      R [RT]
langauge              String      R [AUTH] TYPO: "langauge" not "language"
                                            Controls audio filename suffix
                                            e.g. "" for Arabic, "-eng" for English
overrideFeedback      Boolean     R [AUTH] Optional; if true, use feedback object
feedback              Object      R [AUTH] Optional; only if overrideFeedback: true
  .tryAgain           String                  Override for "try again" text
  .feedbackwrong      String                  Override for fail feedback
  .feedbackcorrect    String                  Override for pass feedback
  .popupWrong         String                  Override for wrong answer popup
  .popupCorrect       String                  Override for correct answer popup
  .correctanswer      String                  Override for "correct answer" label
navgations            Array       R [AUTH] TYPO: "navgations" not "navigations"
  [0].name            String                  "home"
  [0].title           String      [AUTH]      Page title displayed in header
  [0].numOfQuestion   Number      [RT]
  [0].correctCounter  Number      [RT]
  [0].wrongCounter    Number      [RT]
  [0].status          Boolean     [RT]
  [0].precentage      Number      [RT]        TYPO: "precentage" not "percentage"
  [1].name            String                  "quiz"
questions             Array       R [AUTH] Question objects (shuffled at runtime)
─────────────────────────────────────────────────────────

questions[] — Type: "choose"
─────────────────────────────────────────────────────────
type                  String      I [AUTH] "choose"
question              String      I [AUTH] Question text (may be empty if img used)
img                   String      I [AUTH] Path to question image (may be empty)
soundQ                String      I [AUTH] Audio file path for question
soundT                String      I [AUTH] Audio file path for title
active                Boolean     I [RT]  Whether this question is shown
numberOfTrial         Number      I [RT]
answers               Array       I [AUTH]
  .choose             String      A [AUTH] Answer option text (supports v-html)
  .answer             Boolean     A [AUTH] Whether this is the correct answer
  .select             Boolean     A [RT]  Whether user selected this

questions[] — Type: "trueFalse"
─────────────────────────────────────────────────────────
type                  String      I [AUTH] "trueFalse"
question              String      I [AUTH] Statement text
img                   String      I [AUTH] Optional question image
soundQ                String      I [AUTH] Audio path
answers               Array       I [AUTH]
  .toChoose           String      A [AUTH] Display text ("صحيح" / "خطأ")
  .answer             Boolean     A [AUTH] Correct answer flag
  .select             Boolean     A [RT]

questions[] — Type: "dragDrop"
─────────────────────────────────────────────────────────
type                  String      I [AUTH] "dragDrop"
question              String      I [AUTH] Question text
img                   String      I [AUTH] Optional question image
column                Boolean     I [AUTH] Layout flag: horizontal vs column
soundQ                String      I [AUTH]
drags                 Array       I [AUTH] Drop zone definitions
  .text               String      A [AUTH] Drop zone label (text)
  .img                String      A [AUTH] Drop zone label (image)
  .id                 Number      A [AUTH] Drop zone identifier

questions[] — Type: "match"
─────────────────────────────────────────────────────────
type                  String      I [AUTH] "match"
question              String      I [AUTH]
matchPairs            Array       I [AUTH] Matching pairs
  .textRight          String      A [AUTH] Right column text
  .imgRight           String      A [AUTH] Right column image
  .textLeft           String      A [AUTH] Left column text
  .imgLeft            String      A [AUTH] Left column image
  .point              Number      A [AUTH] Unique identifier for line drawing
  .answer             Boolean     A [RT]  Whether matched correctly

questions[] — Type: "input"
─────────────────────────────────────────────────────────
type                  String      I [AUTH] "input"
img                   String      I [AUTH] Optional question image
parags                Array       I [AUTH] Text fragments between inputs
lastparag             String      I [AUTH] Text after last input
inputs                Array       I [AUTH]
  .numOfInput         Number      A [AUTH] Number of input boxes in this group
  .valid              Array       A [AUTH] Accepted answers (array of strings)
  .comma              String      A [AUTH] Separator between inputs in same group
  .originalValid      Array       A [RT]  Stored by runtime before processing
─────────────────────────────────────────────────────────
```

---

### 3.4 BuzzTime (eng/buzzTime/data.json)

**Root Type:** Object (UNIQUE — all other templates use Array root)  
**Confirmed Reading:** Full file read

```
Root Object Fields:
─────────────────────────────────────────────────────────
counterCorrect        Number      R [RT]
LOcorrectcounter      Number      R [RT]
loTargets             null        R
SubType               String      R [AUTH] "Input"
subjectId … endTime   (standard metadata fields — see 3.3)
bloomLevels           Array       R [AUTH] lowercase b
numberOfquestion      Number      R [AUTH] 6 in template (but 8 questions + 4 state items present)
items                 Array       R       Empty array [] in template
hints                 Object      R [AUTH] Bilingual hints
  .en                 Array                English hint strings
  .ar                 Array                Arabic hint strings
keyboard              Object      R [AUTH] On-screen keyboard layout definition
  .alphabetic         Array                Keys for letter mode (26 letters + specials)
  .numeric            Array                Keys for symbol/punctuation mode
    [].id             String               Key identifier (letter, "backspace", "space", etc.)
    [].type           String               "letter"|"special"|"symbol"|"dimmed"
questions             Array       R [AUTH] Mixed: content questions + game state items
─────────────────────────────────────────────────────────

questions[] — Content question item:
─────────────────────────────────────────────────────────
numberOfTrial         Number      I [RT]
questionType          String      I       "text"
answersType           String      I       "text"
startTime             String      I [RT]
endTime               String      I [RT]
BloomLevel            Number      I [AUTH] Bloom level for this question
id                    Number      I [AUTH] Question identifier (e.g. 101, 102)
text                  String      I [AUTH] Question sentence with "....." placeholder
answer                String      I [AUTH] Expected typed answer (trailing space present!)
answers               Array       I [AUTH] ALTERNATE: array of accepted answers
                                           (used on question id 105 instead of answer:String)

questions[] — Game state item (mixed in same array!):
─────────────────────────────────────────────────────────
id                    Number      I [RT]  Game round number (1–4)
state                 Number      I [RT]  Round state: 1=played, 2=pending
answered              Boolean     I [RT]  Whether answered
playerBuzz            String      I [RT]  "left"|"right" — who buzzed first
winner                String      I [RT]  "correct"|"incorrect"|null
─────────────────────────────────────────────────────────
```

**Critical Notes:**
- `answer` vs `answers` inconsistency within the same template (question 105 uses `answers: ["didn't","did not"]`)
- Trailing spaces in `answer` values: `"was "`, `"going to "` — these must be stripped or matched exactly by authoring tool validation
- Game state items mixed into `questions[]` — these are runtime state, NOT authoring fields
- `keyboard` definition in data.json enables runtime keyboard customization without code changes
- Questions 107–108 contain clearly test/debug content

---

### 3.5 Digital-Screen-Choose (mth/digital-screen-choose-lower-ara)

**Root Type:** Array  
**Confirmed Reading:** Full file read (digital-screen-choose-lower-ara/data.json)

```
Root Object Fields:
─────────────────────────────────────────────────────────
counterCorrect        Number      R [RT]
LOcorrectcounter      Number      R [RT]
loTargets             null        R
numberOfquestion      Number      R [AUTH] e.g. 6
id                    String      R [AUTH] e.g. "mth_4r_2a_08_01_04"
(standard metadata fields)
BloomLevels           Array       R [AUTH] uppercase B
SubType               String      R [AUTH] "Choose" (uppercase C)
updatefont            Boolean     R [AUTH] true = apply grade-specific font class
hint                  Boolean     R [AUTH] Enable/disable hint button
upper                 Boolean     R [AUTH] Grade level flag (upper grades = 4–6)
isEng                 Boolean     R [AUTH] Language flag
informationLO         Array       R [AUTH] Activity instructions — ARRAY of strings
                                           e.g. ["اختر الإجابة الصحيحة"]
answerSelect          Boolean     R [RT]  Tracks if answer selected
counter               Number      R [RT]  Current question counter
arrayanswer           null        R [RT]  Used during answer validation
items                 Array       R [AUTH] Question objects
─────────────────────────────────────────────────────────

items[] Fields:
─────────────────────────────────────────────────────────
id                    Number      I [AUTH]
active                Boolean     I [RT]
numberOfTrial         Number      I [RT]
questionlevel         String      I [AUTH] Empty in template
questionType          String      I [AUTH] "text"
answersType           String      I [AUTH] "text"
startTime/endTime     String      I [RT]
BloomLevel            Number      I [AUTH]
numberOfquestion      Number      I [RT]
correctCounter        Number      I [RT]
numOfAttempts         Number      I [RT]
numberInputs          Number      I [RT]
counterCorrectQuestion Number     I [RT]
paragraph1            Array       I [AUTH] Question text fragments (HTML allowed)
fraction1             Array       I [AUTH] Math fraction display (math templates only)
paragraph2            Array       I [AUTH] Second text line
correctAnswer         Array       I [AUTH] Array containing correct numAnswer values
                                           e.g. [2] means answer with numAnswer=2 is correct
answers               Array       I [AUTH] Answer options

  answers[] Fields:
  numAnswer           Number      A [AUTH] Answer identifier (used in correctAnswer[])
  paragraph1          String      A [AUTH] Answer text
  fraction1           Array       A [AUTH] Fraction for answer display
  paragraph2          String      A [AUTH] Second line text
  fraction2           Array       A [AUTH] Fraction for second line
  right               Boolean     A [RT]  Whether this answer is correct
  checked             Boolean     A [RT]  Whether user selected this
─────────────────────────────────────────────────────────
```

---

### 3.6 Digital-Screen-Input (mth/digital-screen-input-lower-ara)

**Root Type:** Array  
**Confirmed Reading:** Full file read

```
Root Object — SAME metadata as Choose EXCEPT:
SubType               String      R [AUTH] "Input" (uppercase I)
arrayanswer           null        R [RT]
counter               Number      R [RT]   -1 initial
(no answerSelect)

items[] Fields — SAME as Choose EXCEPT no paragraph1/fraction1/paragraph2/answers:
title                 String      I [AUTH] Question display text
inputs                Array       I [AUTH] Input groups (3 groups = 3 input areas)
  .numOfInput         Number      A [AUTH] Number of input boxes (0 = hidden)
  .valid              Array       A [AUTH] Array of accepted answers
─────────────────────────────────────────────────────────
```

---

### 3.7 Digital-Screen-Input-With-Animation

**Root Type:** Array  
**Unique additional field:** `holdTime` per item

```
items[] Additional Fields:
holdTime              Number      I [AUTH] Animation hold duration in ms
                                           e.g. 1500, 2300, 3800, 4300
                                           Controls when the animated pointer
                                           stays on screen after question appears
```

---

### 3.8 Digital-Screen-Input-Video

**Root Type:** Array  
**Unique fields:** `video` (root), `text1`/`text2`/`text8`/`type` (item)

```
Root Additional Field:
video                 String      R [AUTH] Video file path (e.g. "video/file.mp4")

items[] Additional Fields:
type                  Number      I [AUTH] Item display type (e.g. 1)
text1                 String      I [AUTH] Left number value
text2                 String      I [AUTH] Right number value
text8                 String      I [AUTH] Reference/result number value
```

**Note:** `bloomLevels` is lowercase (inconsistency vs other digital-screen templates).

---

### 3.9 Digital-Screen-TwoRound-Inputs

**Root Type:** Array  
**Additional root field:** `questionAudioRoundTwo: Boolean`

```
items[] Fields — SAME as Input EXCEPT inputs at root level:
roundOne              Object      I [AUTH] First round data
  .numberInputs       Number      [RT]
  .counterCorrectQuestion Number  [RT]
  .inputs             Array       [AUTH]  Same structure as standard inputs[]
roundTwo              Object      I [AUTH] Second round data (same structure as roundOne)
idRoundTwo            Number      I [AUTH] Optional: links to a second-round item
```

---

### 3.10 Digital-Screen-TwoRound-Input-Choose (hybrid)

**Root Type:** Array  
**Unique:** Each item has BOTH `inputs[]` (standard, not roundOne/roundTwo) AND `choose[]`

```
items[] Fields:
inputs                Array       I [AUTH] Standard input groups (same as input template)
choose                Array       I [AUTH] Choose options WITHIN same question
  (structure: Not Found from full read — partial read only reached line 60)
question_two_Audio    Boolean     R [AUTH] Enable audio for second round
```

---

### 3.11 Penguin-Choose (mth/penguin-choose-lower-ara)

**Root Type:** Array  
**CRITICAL:** This is a MATH COMPARISON template, NOT a multiple-choice template.

```
Root Fields — SAME metadata as digital-screen EXCEPT:
SubType               String      R [AUTH] "input" (LOWERCASE — inconsistency)
informationLO         String      R [AUTH] SCALAR STRING (not Array)
                                           e.g. "أختر الإجابة الصحيحة"
correct_roundOne      Number      R [RT]  Two-round correct counters
correct_roundTwo      Number      R [RT]
nOfquestion_roundOne  Number      R [RT]
nOfquestion_roundTwo  Number      R [RT]

items[] Fields:
id                    Number      I [AUTH]
type                  Number      I [AUTH] Item layout type (e.g. 2)
active                Boolean     I [RT]
img1                  String      I [AUTH] Left comparison image (e.g. "images/01.png")
img2                  String      I [AUTH] Right comparison image (e.g. "images/02.png")
m13l                  Boolean     I [AUTH] Math layout flag
mul                   String      I [AUTH] Multiplication symbol (e.g. "×")
plus                  String      I [AUTH] Addition symbol (e.g. "+")
equal                 String      I [AUTH] Equals symbol (e.g. "=")
w106                  Boolean     I [AUTH] Width/layout flag
r2v                   Boolean     I [AUTH] Round-2 visibility flag
r1v                   Boolean     I [AUTH] Round-1 visibility flag
correct_roundOne      Number      I [RT]
correct_roundTwo      Number      I [RT]
idRoundTwo            Number      I [AUTH] Optional — links to round-two item
choose                Array       I [AUTH] Comparison operator options
  .select             String      A [AUTH] Operator: "&lt;" | "&gt;" | "="
                                           (HTML entities for < and >)
  .answer             Boolean     A [AUTH] Whether this operator is correct
content               Array       I [AUTH] OPTIONAL — nested input sub-questions
  .input              Object
    .valid            Array       A [AUTH] Accepted answers
    .nums             Number      A [AUTH] Number of input boxes
─────────────────────────────────────────────────────────
```

---

### 3.12 Penguin-Input (mth/penguin-input-lower-ara)

**Root Type:** Array  
**Confirmed Reading:** Full file read

```
Root Fields — SAME as penguin-choose EXCEPT:
SubType               String      R [AUTH] "input" (lowercase)
informationLO         String      R [AUTH] SCALAR STRING (not Array)
(no correct_roundOne/roundTwo counters)

items[] Fields:
title                 String      I [AUTH] Question text
inputs                Array       I [AUTH] Standard 3-group input structure
  .numOfInput         Number      A [AUTH]
  .valid              Array       A [AUTH]
(no img1/img2/choose/content fields)
─────────────────────────────────────────────────────────
```

---

### 3.13 Penguin-TwoRound-Inputs

**Root Type:** Array  
**Additional root field:** `questionAudioRoundTwo: Boolean`

```
items[] Fields — identical to digital-screen-tworound:
roundOne              Object      I [AUTH]
  .numberInputs       Number      [RT]
  .counterCorrectQuestion Number  [RT]
  .inputs             Array       [AUTH]
roundTwo              Object      I [AUTH]
  (same structure as roundOne)
idRoundTwo            Number      I [AUTH] Optional
```

---

### 3.14 Space-Input (mth/space-input-lower-ara)

**Root Type:** Array  
**Confirmed Reading:** Full file read

```
Root Fields — SAME as digital-screen-input EXCEPT:
arrayanswer           null        R [RT]  Present explicitly (not implied)
counter               Number      R [RT]  -1 initial
bloomLevels           Array       R [AUTH] lowercase b (INCONSISTENCY)

items[] Additional Field:
sup                   Array       I [AUTH] Subtitle text displayed BOTH ABOVE AND BELOW
                                           the question input panel in the 3-panel layout
                                           e.g. ["question subtitle text"]
```

---

### 3.15 Slideshow (slideshow_2025_rel_[N]r_2a)

**Root Type:** Object (UNIQUE — not Array)  
**Confirmed Reading:** Full file read (slideshow_2025_rel_1r_2a/data.json)

```
Root Object Fields:
─────────────────────────────────────────────────────────
counterCorrect        Number      R [RT]
LOcorrectcounter      Number      R [RT]
loTargets             null        R
numberOfquestion      Number      R [RT]
id                    String      R [AUTH]
(standard metadata fields)
BloomLevels           Array       R [AUTH] uppercase B
subType               String      R [AUTH] "Choose" (lowercase s — INCONSISTENCY vs SubType)
startTime/endTime     String      R [RT]
loDegree              null        R
UserDegree            null        R       null (not 0 — INCONSISTENCY)
slides                Array       R [AUTH] Slideshow images
  [].img              String      A [AUTH] Slide image path (e.g. "images/s/s1.png")
questions             Array       R [AUTH] Post-slideshow questions
─────────────────────────────────────────────────────────

questions[] — Type 2 (image MCQ):
─────────────────────────────────────────────────────────
type                  Number      I [AUTH] 2 = image multiple choice
subtype               String      I [AUTH] "images"
active                Boolean     I [RT]
numberOfTrial         Number      I [RT]
startTime/endTime     String      I [RT]
learningOutCome       null        I        Unused
questionType          String      I       "text"
answersType           String      I       "text"
text                  String/null I [AUTH] Optional question text (null if image-only)
img                   String      I [AUTH] Question image path
sound                 String      I [AUTH] Question audio path (e.g. "sound/q/1.mp3")
answers               Array       I [AUTH]
  .text               String/null A [AUTH] Answer text (null for image answers)
  .img                String      A [AUTH] Answer image path
  .sound              null        A        Unused
  .isRight            Boolean     A [AUTH] Correct answer flag
  .checked            Boolean     A [RT]

questions[] — Type 3 (true/false):
─────────────────────────────────────────────────────────
type                  Number      I [AUTH] 3 = true/false
subtype               String      I [AUTH] "truefalse"
tfType                String      I [AUTH] "text" — question display type
text                  String/null I [AUTH] Optional question text
img                   String      I [AUTH] Question image (question shown as image)
sound                 String      I [AUTH] Audio path
answers               Array       I [AUTH] Always exactly 2 items
  .isRight            Boolean     A [AUTH] Correct answer flag
  .checked            Boolean     A [RT]
─────────────────────────────────────────────────────────
```

---

### 3.16 Slideshow-Tabs (slidshow_tabs_2025_rel_3r_1a)

**Root Type:** Object  
**Confirmed Reading:** Full file read

```
Root Object Fields — SAME as Slideshow EXCEPT adds `tabs[]`:

slides                Array       R [AUTH] Intro slide(s) before tabs
  [].img              String      A [AUTH] Intro slide image

tabs                  Array       R [AUTH] Tab definitions
  [].active           Boolean     A [RT]  Currently selected tab
  [].txt              String      A [AUTH] Tab label text (can be empty)
  [].img              String      A [AUTH] Tab thumbnail image (e.g. "images/t1/t1.png")
  [].slides           Array       A [AUTH] Slides within this tab
    [].img            String               Slide image path

questions             Array       R [AUTH] Same structure as Slideshow questions[]
                                           (types 2 and 3 confirmed in template)
─────────────────────────────────────────────────────────
```

**Note:** Grade 3 template has 4 tabs (t1–t4) with 24 total slides. Grades 4–6 have 3 tabs.

---

### 3.17 Field Inconsistency Registry

The following inconsistencies were found across data.json files and must be handled by any authoring system:

| Field | Inconsistency | Templates Affected |
|---|---|---|
| `informationLO` | **Array** in digital-screen-*, space-input-*; **String** in penguin-* | ALL math templates |
| `SubType` / `subType` | `SubType` (uppercase S) in most; `subType` (lowercase s) in slideshow, slidshow-tabs | slideshow, slidshow-tabs |
| `bloomLevels` | lowercase `b` in space-input-*, digital-screen-input-video, buzzTime, glossary; uppercase `BloomLevels` in others | Mixed across all |
| `UserDegree` | `0` (Number) in most; `null` in slideshow + slidshow-tabs | slideshow templates |
| Root type | **Array** in all math/ara/soc/eng templates; **Object** in slideshow + slidshow-tabs + buzzTime | slideshow, slidshow-tabs, buzzTime |
| `answer` vs `answers` | BuzzTime uses both `answer: String` and `answers: Array` within same template | buzzTime |
| `SubType` value | "Choose" uppercase in choose templates; "input" lowercase in penguin templates | penguin-choose, penguin-input |
| `counterCorrect` field order | Some templates place it first; others last in root object | Multiple |

---

## PHASE 4: CROSS-TEMPLATE DATA MODEL COMPARISON MATRIX {#phase-4}

### 4.1 Root-Level Field Presence Matrix

Legend: ✓ = present | ✗ = absent | S = String | A = Array | O = Object | N = Number | B = Boolean

| Field | glossary | storyline-q | buzzTime | ds-choose | ds-input | ds-tworound | ds-video | ds-anim | penguin-choose | penguin-input | space-input | slideshow | slideshow-tabs |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| **Root type** | Array | Array | Object | Array | Array | Array | Array | Array | Array | Array | Array | Object | Object |
| counterCorrect | ✓N | ✓N | ✓N | ✓N | ✓N | ✓N | ✓N | ✓N | ✓N | ✓N | ✓N | ✓N | ✓N |
| id | ✓S | ✓S | ✗ | ✓S | ✓S | ✓S | ✓S | ✓S | ✓S | ✓S | ✓S | ✓S | ✓S |
| SubType/subType | SubType | SubType | SubType | SubType | SubType | SubType | SubType | SubType | SubType | SubType | SubType | subType | subType |
| BloomLevels case | lower b | upper B | lower b | upper B | upper B | upper B | lower b | lower b | upper B | upper B | lower b | upper B | upper B |
| upper | ✗ | ✗ | ✗ | ✓B | ✓B | ✓B | ✓B | ✓B | ✓B | ✓B | ✓B | ✗ | ✗ |
| isEng | ✗ | ✗ | ✗ | ✓B | ✓B | ✓B | ✓B | ✓B | ✓B | ✓B | ✓B | ✗ | ✗ |
| updatefont | ✗ | ✗ | ✗ | ✓B | ✓B | ✓B | ✓B | ✓B | ✓B | ✓B | ✓B | ✗ | ✗ |
| hint | ✗ | ✗ | ✗ | ✓B | ✓B | ✓B | ✓B | ✓B | ✓B | ✓B | ✓B | ✗ | ✗ |
| informationLO type | ✗ | ✗ | ✗ | Array | Array | Array | Array | Array | String | String | Array | ✗ | ✗ |
| arrayanswer | ✗ | ✗ | ✗ | ✓null | ✓null | ✓null | ✓null | ✓null | ✗ | ✗ | ✓null | ✗ | ✗ |
| counter | ✗ | ✗ | ✗ | ✓N | ✓N | ✓N | ✓N | ✓N | ✗ | ✗ | ✓N | ✗ | ✗ |
| questionAudio | ✗ | ✗ | ✗ | ✓B | ✓B | ✓B | ✓B | ✓B | ✓B | ✓B | ✓B | ✗ | ✗ |
| environment | ✓S | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ |
| navgations | ✗ | ✓A | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ |
| langauge (typo) | ✗ | ✓S | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ |
| overrideFeedback | ✗ | ✓B | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ |
| hints (bilingual) | ✗ | ✗ | ✓O | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ |
| keyboard | ✗ | ✗ | ✓O | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ |
| video | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✓S | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ |
| correct_roundOne | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✓N | ✗ | ✗ | ✗ | ✗ |
| questionAudioRoundTwo | ✗ | ✗ | ✗ | ✗ | ✗ | ✓B | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ |
| UserDegree type | N(0) | N(0) | N(0) | N(0) | N(0) | N(0) | N(0) | N(0) | N(0) | N(0) | N(0) | null | null |
| slides | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✓A | ✓A |
| tabs | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✓A |
| items (root array) | ✓A | ✗ | ✓A | ✓A | ✓A | ✓A | ✓A | ✓A | ✓A | ✓A | ✓A | ✗ | ✗ |
| questions (root) | ✗ | ✓A | ✓A | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✓A | ✓A |

### 4.2 Item-Level Field Comparison

| Item Field | ds-choose | ds-input | ds-tworound | ds-video | ds-anim | penguin-choose | penguin-input | space-input |
|---|---|---|---|---|---|---|---|---|
| title | ✗ | ✓ | ✓ | ✗ | ✓ | ✗ | ✓ | ✓ |
| paragraph1[] | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ |
| fraction1[] | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ |
| correctAnswer[] | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ |
| answers[] | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ |
| inputs[] (flat) | ✗ | ✓ | ✗ | ✓ | ✓ | ✗ | ✓ | ✓ |
| roundOne{} | ✗ | ✗ | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ |
| roundTwo{} | ✗ | ✗ | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ |
| img1 / img2 | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ | ✗ | ✗ |
| choose[] (operators) | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ | ✗ | ✗ |
| content[] (nested inputs) | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ optional | ✗ | ✗ |
| sup[] | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ |
| holdTime | ✗ | ✗ | ✗ | ✗ | ✓ | ✗ | ✗ | ✗ |
| text1/text2/text8 | ✗ | ✗ | ✗ | ✓ | ✗ | ✗ | ✗ | ✗ |
| m13l/mul/plus/equal | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ | ✗ | ✗ |
| w106/r2v/r1v | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ | ✗ | ✗ |
| idRoundTwo | ✗ | ✗ | ✓ opt | ✗ | ✗ | ✓ opt | ✗ | ✗ |
| BloomLevel (item-level) | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ | ✓ | ✗ |

---

## PHASE 5: TEMPLATE DATA MODEL FAMILIES {#phase-5}

### 5.1 Family Classification

```
FAMILY A — Math Input
  Core schema: items[].inputs[{numOfInput, valid[]}]
  informationLO: Array (ds/space) | String (penguin)
  Members:
  ├── digital-screen-input-lower-ara     (upper:false, isEng:false)
  ├── digital-screen-input-lower-eng     (upper:false, isEng:true)
  ├── digital-screen-input-upper-ara     (upper:true,  isEng:false)
  ├── digital-screen-input-upper-eng     (upper:true,  isEng:true)
  ├── digital-screen-input-with-animation  (+holdTime per item)
  ├── digital-screen-input-video           (+video root, +text1/2/8 per item)
  ├── space-input-lower-ara              (+sup[] per item, 3-panel layout)
  ├── space-input-lower-eng
  ├── space-input-upper-ara
  ├── space-input-upper-eng
  ├── penguin-input-lower-ara            (String informationLO)
  ├── penguin-input-lower-eng
  ├── penguin-input-upper-ara
  └── penguin-input-upper-eng

FAMILY B — Math Two-Round Input
  Core schema: items[].roundOne{inputs[]}, items[].roundTwo{inputs[]}
  Members:
  ├── digital-screen-tworound-inputs-lower-ara
  ├── digital-screen-tworound-inputs-lower-eng
  ├── digital-screen-tworound-inputs-upper-ara
  ├── digital-screen-tworound-inputs-upper-eng
  ├── penguin-tworound-inputs-lower-ara
  ├── penguin-tworound-inputs-lower-eng
  ├── penguin-tworound-inputs-upper-ara
  └── penguin-tworound-inputs-upper-eng

FAMILY C — Math MCQ (digital-screen-choose)
  Core schema: items[].paragraph1[], fraction1[], correctAnswer[], answers[]
  Members:
  ├── digital-screen-choose-lower-ara
  ├── digital-screen-choose-lower-eng
  ├── digital-screen-choose-upper-ara
  └── digital-screen-choose-upper-eng

FAMILY D — Math Comparison (penguin-choose)
  Core schema: items[].img1, img2, choose[{select, answer}]
  Members (DIFFERENT model from Family C despite "choose" in name):
  ├── penguin-choose-lower-ara
  ├── penguin-choose-lower-eng
  ├── penguin-choose-upper-ara
  └── penguin-choose-upper-eng

FAMILY E — Hybrid Two-Round (Input + Choose)
  Core schema: items[].inputs[] AND items[].choose[]
  Members:
  ├── digital-screen-tworound-input-choose
  └── penguin-tworound-input-choose

FAMILY F — Multi-Type Quiz
  Core schema: navgations[], questions[{type-discriminated}]
  Supported question types: choose, trueFalse, dragDrop, match, input
  Members:
  ├── ara/storyline-q        (Arabic subject)
  └── soc/storyline-q        (Social Studies — same runtime)

FAMILY G1 — Religion Slideshow (simple)
  Core schema: slides[{img}], questions[{type:2|3}]
  Root: Object
  Members:
  ├── slideshow_2025_rel_1r_2a  through
  └── slideshow_2025_rel_6r_2a  (6 grade-specific instances)

FAMILY G2 — Religion Slideshow-Tabs
  Core schema: slides[{img}], tabs[{img, slides[]}], questions[{type:2|3}]
  Root: Object
  Members:
  ├── slidshow_tabs_2025_rel_3r_1a  through
  └── slidshow_tabs_2025_rel_6r_1a  (4 grade-specific instances)

FAMILY H — Glossary DragDrop
  Core schema: environment String, items[{item-type, words[{theword,answer}]}]
  Members:
  └── ara/glossary

FAMILY I — BuzzTime Typing Game
  Core schema: Object root, hints{en,ar}, keyboard{alphabetic,numeric}, questions[]
  Members:
  └── eng/buzzTime
```

### 5.2 Authoring Complexity by Family

| Family | Complexity | Key Author Tasks |
|---|---|---|
| A (Input) | Low | Write question title, provide valid[] answers per input box |
| B (TwoRound) | Medium | Same as A but for two separate rounds per question |
| C (MCQ) | Medium | Write paragraph fragments, fraction data, mark correct answer index |
| D (Comparison) | Medium | Provide two images to compare, set correct operator (<, >, =) |
| E (Hybrid) | High | Provide both input boxes AND comparison operator in same question |
| F (Quiz) | High | Mix question types; provide navigation titles, audio files, optional feedback override |
| G1 (Slideshow) | Low | Provide slide images and question images (no text content needed) |
| G2 (Slideshow-Tabs) | Medium | Same as G1 plus tab thumbnail images and per-tab slide sequences |
| H (Glossary) | Low | Provide word pairs grouped by category; select environment theme |
| I (BuzzTime) | Medium | Write sentences with "....." placeholders, provide correct answers, optionally customize keyboard |

---

## PHASE 6: DEEP RUNTIME LIBRARIES ANALYSIS {#phase-6}

### 6.1 Runtime Library: `lib-native/digital-screen`

#### 6.1.1 Architecture

```
lib-native/digital-screen/
├── assets/                              ← Shared across ALL digital-screen sub-runtimes
│   ├── audio/  music, rightanswer, wronganswer, click_btn, startclick2, knock-knock
│   ├── fonts/  AraJozoor, samim, vazirmatn-light-upper/lower, ArialRounded, Amin
│   ├── images/ character sprites (zoki sad/happy), UI elements
│   ├── json/   Lottie: stars, progress bar, character animations
│   └── style/  global styles
├── digital-screen-choose/js/zoki.js
├── digital-screen-input/js/zoki.js
├── digital-screen-input-with-animation/js/zoki.js
├── digital-screen-input-video/js/zoki.js
└── digital-screen-tworound/js/zoki.js
```

#### 6.1.2 Vue App Entry Point (zoki.js)

```javascript
// Binding:
const digitalScreen = document.querySelector("#digital-screen");
const pageUrl = digitalScreen.getAttribute("data-urlpage");  // "data"

new Vue({
  el: "#digital-screen",
  data: {
    posts: [],           // posts[0] = parsed data.json root object
    loQuestions: 0,
    question: false,
    counter: -1,         // current question index (-1 = not started)
    bgMusic: false,
    index: -1,
    bgAudio, clickBtn, startBtn, wrongAnswer, rightAnswer,
    zokiBoring, qSound, hint: new Audio(),
    feedback: false,
    screenClick: 0,
    screenInterval: null,
    startLo: false,
    attamps: 0,
    content: null,
    helpHand: true,
    border: null,
    shuffled: [],
    zokiStatus: false,
    answer: [],
    showAnswers: [],
    numsValues: 0,
    answertruecount: 0,
    result: 0,
    finalProgress: 0,
    Estimation: "",
    zokifeedback: false,
    firstQ: 0,
    hintDuration: 0,
    activeQuestion: null,
    upper: null,         // copied from posts[0].upper
    isEng: null,         // copied from posts[0].isEng
    infotmationClick: false,
    isLoading: false,    // controls loader visibility
    isSuccess: false,
    activityId: 0,
    dataLoaded: false,
    currentdate: "",
    data: null,
  }
```

#### 6.1.3 Lifecycle (mounted)

```
1. Right-click protection (non-localhost, non-stblobstrgeaccount)
2. await getData()
3. shuffle(posts[0].items)
4. Set all audio .src paths (../../../lib-native/digital-screen/assets/audio/*)
5. finalResponse.submitData(JSON.stringify(posts[0]), 1, 0)
6. reSize()
7. window.addEventListener("resize", reSize)
```

#### 6.1.4 getData() Logic

```
Mode 1 (direction == "2", LMS embedded):
  → await returnData (from submit_sender.js)
  → isSuccess = response.isSuccess
  → data = response.value
  → if learningObjectAsJson: parse (commented out — uses data.json file instead)

Mode 2 (standalone):
  → if runPage: isSuccess = true (no auth)
  → else: await returnData for auth response

Always:
  → if not dataLoaded: fetch("data.json") → posts = parsed JSON
  → setTimeout(1000ms):
      isLoading = true
      posts[0].startTime = getDate()
      loQuestions = posts[0].numberOfquestion
```

#### 6.1.5 Font Resolution Logic (addFont method)

```javascript
// Called after getData() to apply grade/language-specific fonts

if (posts[0].updatefont && .question.editFont exists) {
  // New font system (vazirmatn):
  isEng → "vazirmatn-light-upper"
  upper, !isEng → "vazirmatn-light-upper"
  // (lower implied same)
} else {
  // Legacy font system:
  if (isEng):  body="ArialRounded", inputs="Amin", numbers="Amin"
  elif upper:  body="samim", inputs="ArialRounded", numbers="ArialRounded"
  else:        body="AraJozoor"  (all elements)
}
```

#### 6.1.6 Aspect Ratio Enforcement (reSize)

```javascript
// Enforces 16:9 ratio by setting explicit px dimensions:
const aspect = 16 / 9;
let w = window.innerWidth, h = window.innerHeight;
if (w/h > aspect) { w = h * aspect; }
else { h = w / aspect; }
document.getElementById("digital-screen").style.width = w + "px";
document.getElementById("digital-screen").style.height = h + "px";
```

**Canonical SCORM reference file (2026-07-29):** `lib-native/digital-screen_26/choose/js/zoki.js` is the mandatory reference file every `SCORM_RUNTIME_ALIGNMENT` audit reads and patterns against. Its `restoreScormServiceStatus(post)` now includes the same score-reconciliation block described in §6.4/§6.8 (`Math.max(post.cmi.score.raw, previousScormScore, ScormService.getBestScore())`, applied before the pre-existing `completion_status`/`success_status` restoration), keeping the reference file synchronized with the pattern already applied to `buzzTime`, `buzzTime_primary`, and `storyline-q`. `digital-screen_26/digital-screen-input/js/zoki_.js` (the canonical reference implementation for `FINAL_QUESTION_FEEDBACK_AND_TERMINAL_LOGGING_POLICY`) and its video-gated, animation-enhanced, and plain siblings (`zoki_video.js`, `zoki_with_animation.js`, `zoki.js`) all received the identical `restoreScormServiceStatus(post)` extension the same day, as did all three files in `digital-screen-tworound-input-choose/js/` (`zoki_.js`, `zoki_choose_input.js`, and the plain `zoki.js` variant), and both files in `digital-screen-tworound-inputs/js/` (`zoki_.js` and the plain `zoki.js` variant, input-input round pair) received the same extension.

---

### 6.2 Runtime Library: `lib-native/space`

```
lib-native/space/
├── assets/
│   ├── audio/   music.mp3, rightanswer.mp3, click_btn.mp3, startclick2.mp3
│   ├── fonts/
│   ├── images/
│   ├── json/    Lottie animations
│   └── style/
└── space-input/
    └── js/main.js
```

**Vue Element:** `#spaceTemplate`  
**Difference from digital-screen:** No Zoki character; space-themed character. 3-panel layout uses `item.sup[0]` for top and bottom labels.

**3-Panel HTML Structure (from mymovie.html):**
```
<div class="body_table">{{ item.sup[0] }}</div>    ← TOP label
<div class="body_table">
  <div class="question">{{ item.title }}</div>
  <div class="inputs">
    <input v-for="i in input.numOfInput" />         ← INPUT BOXES
  </div>
</div>
<div class="body_table">{{ item.sup[0] }}</div>    ← BOTTOM label (same text)
```

**`space_26` (current runtime path):** `space-input/js/main_.js`'s `restoreScormServiceStatus(post)` gained the same score-reconciliation extension described in §6.3/§6.4/§6.5/§6.6/§6.8 as of 2026-07-29. Its Rule A guards (`trueAnswer()`/`showAnswer()`, using the file's own pre-advance `isFinalQuestionAttempt()` — `counter >= loQuestions - 1`) were already correct (fixed 2026-07-20), so this pass required only the score-reconciliation addition. Its sibling `space-input/js/main.js` (architecturally identical) received the same extension the same day.

---

### 6.3 Runtime Library: `lib-native/penguin`

```
lib-native/penguin/
├── assets/audios/  rightanswer.mp3, wronganswer.mp3, click_btn.mp3
├── penguin-choose/js/main.js
└── penguin-input/js/main.js
```

**Vue Element:** `#penguin`  
**Key differences from digital-screen:**

| Aspect | digital-screen | penguin |
|---|---|---|
| Vue element | `#digital-screen` | `#penguin` |
| counter initial | -1 | 0 |
| finalProgress initial | 0 | null |
| Estimation initial | "" | null |
| QustionStart | absent | present (typo: "Qustion") |
| nextQuestion() on mount | No | Yes (called immediately) |
| Audio folder | assets/audio/ | assets/audios/ (plural) |
| window.app exposed | No | No |

**`penguin_26` (current runtime path):** `penguin-choose/js/main.js`'s `restoreScormServiceStatus(post)` gained the same score-reconciliation extension described in §6.4/§6.5/§6.6/§6.8 as of 2026-07-29 (`Math.max(post.cmi.score.raw, previousScormScore, ScormService.getBestScore())`, applied before the pre-existing `completion_status`/`success_status` restoration). Its Rule A guard on the shared `checkChoose()` platform send was already correct (fixed 2026-07-20), so this pass required only the score-reconciliation addition. `penguin-input/js/main_.js` received the identical score-reconciliation extension the same day; its Rule A guard uses a deliberately different pre-increment shape (`counter < loQuestions - 1`, checked before `counter += 1` runs later in the same handler) rather than the post-increment `!isFinalQuestionAttempt()` used elsewhere — confirmed correct for this file's architecture, not a deviation to fix. Its sibling `penguin-input/js/main.js` (architecturally identical, same pre-increment guard shape) received the same extension the same day. `penguin-tworound-input-choose/js/main.js` (two-round input-then-choose, no `scormCompletionReady` latch — `scormPost()` is called synchronously from multiple sites instead, an intentional pre-existing architecture) also received the same extension; its round-2 (`trueAnswerChoose()`/`falseAnswerChoose()`) guards use the same pre-increment shape as `penguin-input`, while round-1 (`trueAnswerInput()`/`showAnswer()`) sends are unguarded but safe since `roundTwo` is provably `false` at their synchronous evaluation point. `penguin-tworound-inputs/js/main_.js` (two-round input-input) also received the extension the same day; its shared `showAnswer()` handler uses a combined guard (`!(roundTwo && counter >= loQuestions - 1)`) that correctly covers both round-1 (always fires) and round-2 (final-suppressed) from one function — and, by this file's own pre-existing design, only round-2 completion ever logs via `logPostAfterAnswerAttempt()`, round-1 never does. Its plain sibling `penguin-tworound-inputs/js/main.js` (same architecture, plus a 2026-07-20 `endTime` timing-lifecycle fix `main_.js` never received) got the identical score-reconciliation extension the same day.

---

### 6.4 Runtime Library: `lib-native/storyline-q`

**Vue Element:** `#Question`  
**Exposed as:** `window.app` (accessible from browser console)

**Unique Architecture: Multi-Manager Pattern**
```
main.js (Vue app)
├── new MatchManager()     ← match.js: SVG line drawing between two columns
├── new DragDropManager()  ← drag.js: HTML5 drag API + touch events
├── InputManager (inline)  ← input.js: answer validation
└── ChooseManager (inline) ← choose.js: MCQ selection
```

**getData() Unique Features:**
```javascript
// 1. Shuffles questions (not items):
this.shuffledQuestions = this.shuffleQuestions(posts[0].questions);
this.posts[0].questions = this.shuffledQuestions;

// 2. Reads typo field:
this.lang = posts[0]?.langauge || "";

// 3. Sets title from navgations:
this.titlePage = posts[0].navgations[0].title;

// 4. Overrides numberOfquestion:
posts[0].numberOfquestion = posts[0].questions.length;

// 5. Stores originalValid for input questions:
q.inputs.forEach(input => {
  input.originalValid = [...input.valid];
});

// 6. Calls getFeedBackJson() to check overrideFeedback
```

**Audio Naming Convention (lang suffix):**
```
lang = posts[0].langauge || ""
Audio files: "popup-correct" + lang + ".mp3"
→ Arabic:  "popup-correct.mp3"
→ English: "popup-correct-eng.mp3"  (if langauge: "-eng")
```

**PERMANENT PROJECT RULE — SCORM state restoration must survive a bare `location.reload()` (2026-07-29):**
A same-tab `location.reload()` of the content frame (e.g. clicking "Reload" in SCORM Cloud's test player) reuses the exact same launch URL, so this project's own `direction=2` backend-restoration query parameter never fires on a reload — `restorePersistedCmi()` is inert in that scenario by design, not a bug. The only reliable restoration source across a bare reload is the live LMS session itself (via `window.ScormService`), which lives in a persistent ancestor frame that survives the reload. `restoreScormServiceStatus(post)` now also reconciles `post.cmi.score.raw`/`score.scaled` against `window.ScormService.getBestScore()` (highest-of-three: current `post.cmi.score.raw`, `this.previousScormScore`, `getBestScore()`), in addition to its pre-existing `completion_status`/`success_status` restoration. This guarantees a lower current-attempt score after a reload can never downgrade an already-preserved higher SCORM score or a previously passed/completed status. See `js/scorm-lo.js`'s `init()`/`recoverAlreadyActiveSession()` in §6.8 for why `ScormService` can reliably answer `getBestScore()` even when a reload's `LMSInitialize` call fails.

---

### 6.5 Runtime Library: `lib-native/glossary`

**Vue Element:** Not Found from source (El ID inferred as `#glossary` from HTML patterns)

**Environment CSS Loading:**  
At runtime, a `<link>` element is dynamically inserted to load the environment-specific CSS:
```
lib-native/glossary/assets/environment/[posts[0].environment]/images.css
```
18 available environments confirmed in assets.

**Lottie asset:** `assets/json/box.json` — plays on correct word match (reveal animation).

**`glossary_26`** — current runtime path (folder renamed from `glossary` to `glossary_26`; the file-specific `SCORM_RUNTIME_ALIGNMENT` history in `implementation-specification.md` predates the rename but documents the same file). As of a 2026-07-29 re-audit, `glossary_26/assets/js/main.js` gained a `restoreScormServiceStatus(post)` method (which this file had never had in any form — not even the status-only version other files carried from 2026-07-21) including the score-reconciliation extension described in §6.4/§6.6/§6.8, called from `getData()`. The audit also found and fixed a genuine Rule A violation: `openTable()`'s first-time gate-completion branch called the platform-send helper `UpdateStudentActivity()` unconditionally immediately after `scormPost()`, producing a duplicate final send on the true last gate that raced `scormPost()`'s own `persistFinalActivityState()` — now guarded by `!this.isFinalQuestionAttempt()`, the same pattern used across the `digital-screen-tworound-*` families.

---

### 6.6 Runtime Library: `lib-native/buzzTime`

**Vue Element:** Not Found from source inspection (entry via ES module main.js).

**Unique Features:**
- 20 Lottie animation files (most in project)
- On-screen keyboard layout sourced from `data.json.keyboard`
- Bilingual hints sourced from `data.json.hints`
- Variable-weight fonts: Lexend (English), Vazirmatn (Arabic)
- Game state items mixed into `questions[]` array

**`buzzTime_primary`** — a second variant with identical structure, used for primary-grade English LOs. As of a 2026-07-29 `SCORM_RUNTIME_ALIGNMENT` re-audit, it is fully aligned with `buzzTime/js/main.js`'s canonical pattern: silent SCORM init (no non-error status logs), `total_time` default `"00:00:00"`, `restoreScormServiceStatus(post)` present (including the score-reconciliation extension below) and called from `postQuestions()`, and the final-question `UpdateStudentActivity()` send in `updateScoreAndHints()` guarded by `!this.isFinalQuestionAttempt()` to prevent a duplicate final platform-persistence send.

**SCORM state restoration across a bare reload (2026-07-29):** same rule as `storyline-q` (§6.4) — `restoreScormServiceStatus(post)` now reconciles `post.cmi.score.raw`/`score.scaled` from `window.ScormService.getBestScore()` (never lower than the current local value), in addition to restoring `completion_status`/`success_status`. See §6.4 and §6.8 for the full rationale and the `js/scorm-lo.js` session-recovery mechanism this depends on. Applies to `buzzTime`, `buzzTime_primary`, and `storyline-q`.

---

### 6.7 Runtime Libraries: Slideshow and Slideshow-Tabs

**Slideshow (`lib-native/slideshow/`):**  
Vue Element: Not Found from source (inferred `#slideshow` or similar from data).  
Activity: Present slides in sequence → then show MCQ/TrueFalse questions.

**Slideshow-Tabs (`lib-native/slideshow-tabs/`):**  
Activity: Intro slide → Tab selection → Per-tab slides → Questions.

**Both share:** No `upper`, `isEng`, or `informationLO` fields. No input questions. Grade-specific CSS loaded from `grade` attribute on root div.

**`lib-native/slideshow/js/main.js` — first `SCORM_RUNTIME_ALIGNMENT` migration (2026-07-29):** this file had never received the CMI-restoration/status-restoration/highest-score-preservation/cumulative-time/QA-logging baseline every other runtime family already carries — a full first-time migration was applied, not a routine re-audit. It also carried genuine pre-existing data bugs beyond the usual gap set: `studentPoint` was stored as a raw 0-100 percentage instead of divided by 10, and `counterCorrect` was never synced to the actual correct-answer count (it held a permanently-`0` broken scoreOutOf10-style bucket calculation instead — the bucket logic itself was moved to properly populate `scoreOutOf10`, which had never been initialized at all). A genuine Rule A violation was also found and fixed: the per-answer platform send fired unconditionally on every question including the last one; it is now guarded with a pre-increment condition (`questionCounter < maxLengthQuestions - 1`), the same shape used in the `penguin_26/penguin-input` family, since this file's shared answer handler evaluates before its counter advances. The runtime-selected question collection for QA logging is `this.shuffledQuestion` (a Vue-instance array distinct from the full JSON pool on `post.questions`), read directly rather than via the generic collection-name detector used elsewhere. See `implementation-specification.md`'s dated Migration Records entry for the full nine-gap breakdown.

**`lib-native/slideshow-tabs/js/main.js` — identical first-time migration, same day (2026-07-29):** architecturally near-identical to `slideshow` (same base flow plus tab navigation: `posts.tabs`, `getTab()`, `getGlobalSlideIndex()`, drag/swipe handlers), this file had never been migrated either and carried the exact same nine-gap set found in `slideshow` — including the identical broken `counterCorrect`/`scoreOutOf10` logic and the same `studentPoint`/`total_time`/Rule-A gaps — fixed the same way. All tab-navigation and drag/swipe logic was left completely untouched.

---

### 6.8 Shared JavaScript Utilities (`js/`)

#### `js/submit_sender.js` — LMS Interface

```javascript
// Global constants (read by all runtimes):
const direction;      // "1" = standalone, "2" = LMS
const runPage;        // skip auth if true
const returnData;     // Promise resolving to auth/data response

// CRITICAL: devgateway = true
// All API traffic routes to development endpoint.
// This must be set to false before production deployment.

// Exposed global:
const finalResponse = {
  submitData(jsonData, status, score) {
    // 1. window.parent.postMessage(payload, "*")
    // 2. REST API POST to LMS endpoint
  }
};
```

#### `js/finalProgress.js` — Score Calculator

```javascript
// Returns: [Estimation, finalProgress]
// Grading scale:
//   0%       → "ضعيف"            (Weak)
//   1–59%    → "مقبول"           (Acceptable)
//   60–74%   → "جيد"             (Good)
//   75–100%  → "يفوق التوقعات"   (Exceeds Expectations)

// Lottie star animation frame lookup:
//   0 stars:  segment [0, 1]
//   1 star:   segment [59, 60]
//   2 stars:  segment [74, 75]
//   3 stars:  segment [99, 100]
```

#### `js/input.js` — Input Validation

```javascript
// Key function:
function arabicToWestern(str)
// Converts Arabic-Indic digits ٠١٢٣٤٥٦٧٨٩ → 0123456789
// Applied to all user text inputs before validation

// Validation logic:
// user_input → arabicToWestern → trim → compare to valid[] (trimmed, lowercase)
```

#### `js/choose.js` — MCQ Validation

Manages answer selection in choose templates: tracks `answerSelect`, validates `numAnswer` against `correctAnswer[]`.

#### `js/inputTwoRound.js` — Two-Round Input

Extends input.js for templates with `roundOne`/`roundTwo` structure. Validates each round independently and links rounds via `idRoundTwo`.

#### `js/scorm-lo.js` — `window.ScormService` (SCORM 1.2 adapter)

Shared SCORM boundary layer (wraps `js/scorm.js`, the pipwerks SCORM 1.2 wrapper) consumed by every runtime's `restorePersistedCmi()`/`restoreScormServiceStatus()`/`applyHighestScormScore()`/`scormPost()` chain. Key behavior:

- `init()` calls `LMSInitialize` once per page load. **A same-tab `location.reload()` of the content frame does not call `LMSFinish` first** (this project deliberately never calls `LMSFinish`/`scorm.quit()` — `completeSession()` is `postMessage`-only by design), so a SCORM 1.2 conformant LMS legitimately rejects the reload's fresh `LMSInitialize` call, since the ancestor frame's LMS session (which survives a content-frame reload) is still active.
- **Session recovery (2026-07-29):** when `LMSInitialize` fails, `init()` calls `recoverAlreadyActiveSession(api)`, which does **not** retry `LMSInitialize` and does **not** assume any single vendor-specific "already initialized" error code. It probes the raw API handle directly — `api.LMSGetValue("cmi.core.score.raw")` then `LMSGetLastError()` (via the pipwerks `scorm.debug.getCode()` helper) — because `pipwerks.SCORM.data.get()` itself refuses reads while `scorm.connection.isActive` is `false`. Only a confirmed error code `0` (the universal SCORM 1.2 "no error" code) causes `scorm.connection.isActive`/`connected` to be set `true`, after which `getBestScore()`/`getPersistedStatus()` populate normally from the still-live LMS session. A genuine connection failure (missing API, broken session, cross-frame problem) still leaves the service disconnected, with a `console.warn` diagnostic and no thrown exception.
- `getBestScore()` / `getPersistedStatus()` — read-only accessors consuming callers use to reconcile local `post.cmi` against the LMS's actual persisted state. `bestScore` internally only ever increases (`updateBestScore()`), so `ScormService`'s own view of the score can never regress within a session.

---

## PHASE 7: TEMPLATE ↔ RUNTIME RELATIONSHIP MAPPING {#phase-7}

### 7.1 Complete Dependency Map

```
Template                              → Runtime Library (js entry)
──────────────────────────────────────────────────────────────────
ara/glossary                          → lib-native/glossary/assets/js/main.js
ara/storyline-q                       → lib-native/storyline-q/assets/js/main.js
soc/storyline-q                       → lib-native/storyline-q/assets/js/main.js
eng/buzzTime                          → lib-native/buzzTime/js/main.js

digital-screen-choose-lower-ara       → lib-native/digital-screen/digital-screen-choose/js/zoki.js
digital-screen-choose-lower-eng       → lib-native/digital-screen/digital-screen-choose/js/zoki.js
digital-screen-choose-upper-ara       → lib-native/digital-screen/digital-screen-choose/js/zoki.js
digital-screen-choose-upper-eng       → lib-native/digital-screen/digital-screen-choose/js/zoki.js

digital-screen-input-lower-ara        → lib-native/digital-screen/digital-screen-input/js/zoki.js
digital-screen-input-lower-eng        → lib-native/digital-screen/digital-screen-input/js/zoki.js
digital-screen-input-upper-ara        → lib-native/digital-screen/digital-screen-input/js/zoki.js
digital-screen-input-upper-eng        → lib-native/digital-screen/digital-screen-input/js/zoki.js

digital-screen-input-with-animation   → lib-native/digital-screen/digital-screen-input-with-animation/js/zoki.js
digital-screen-input-video            → lib-native/digital-screen/digital-screen-input-video/js/zoki.js

digital-screen-tworound-inputs-*      → lib-native/digital-screen/digital-screen-tworound/js/zoki.js
digital-screen-tworound-input-choose  → lib-native/digital-screen/digital-screen-tworound/js/zoki.js

penguin-choose-*                      → lib-native/penguin/penguin-choose/js/main.js
penguin-input-*                       → lib-native/penguin/penguin-input/js/main.js
penguin-tworound-inputs-*             → lib-native/penguin/penguin-input/js/main.js  (inferred)
penguin-tworound-input-choose         → lib-native/penguin/penguin-choose/js/main.js (inferred)

space-input-*                         → lib-native/space/space-input/js/main.js

slideshow_2025_rel_*                  → lib-native/slideshow/js/main.js
slidshow_tabs_2025_rel_*              → lib-native/slideshow-tabs/js/main.js
```

### 7.2 Shared Utility Dependencies (ALL templates except buzzTime)

```
Template mymovie.html
  ├── ../../../js/submit_sender.js     ← REQUIRED: LMS auth + score submission
  ├── ../../../js/finalProgress.js     ← REQUIRED: score→grade calculation
  ├── ../../../js/input.js             ← Input templates only
  ├── ../../../js/choose.js            ← Choose templates only
  └── ../../../js/inputTwoRound.js     ← TwoRound templates only
```

**Path Depth Invariant:** All `../../../` paths assume exactly 3 directory levels:
```
[project-root]/[subject-group]/[template-name]/mymovie.html
                                                ↑ depth 3
```
Breaking this (e.g., 4-level nesting) breaks ALL relative paths.

### 7.3 Runtime ↔ Template Coupling Points

Each template mymovie.html couples to its runtime via:

| Coupling Point | Mechanism | Example |
|---|---|---|
| Vue mount element | HTML id attribute | `<div id="digital-screen">` |
| Data URL | `data-urlpage` attribute | `data-urlpage="data"` → fetches `data.json` |
| Grade CSS | `grade` attribute | `<div grade="3">` → loads `imgs-grade-3.css` |
| Environment CSS | Runtime reads `data.json.environment` | Loads `egypt_and_the_nile/images.css` |
| Font class | Runtime checks `.question.editFont` | Selects vazirmatn vs legacy font |
| Audio paths | Hardcoded relative paths in runtime JS | `../../../lib-native/[family]/assets/audio/` |
| Character show/hide | Vue `v-show` on `finalProgress` value | `v-show="finalProgress > 51"` |

### 7.4 Template-to-Runtime Dependency Diagram

```
mymovie.html
    │
    ├──loads──► lib-native/[family]/assets/js/lottie-min.js
    ├──loads──► lib-native/[family]/assets/js/vue.js
    ├──loads──► lib-native/[family]/assets/style/[*.css]
    ├──loads──► js/submit_sender.js
    │               └── exposes: finalResponse, direction, runPage, returnData
    ├──loads──► js/finalProgress.js
    │               └── exposes: finalProgress(), Estimation calculation
    ├──loads──► js/input.js | choose.js | inputTwoRound.js
    │               └── exposes: arabicToWestern(), validation helpers
    └──loads──► lib-native/[family]/[sub]/js/main.js | zoki.js
                    └── new Vue({ el: "#[id]" })
                        └── mounted() → getData() → fetch("data.json")
                                          └── posts[0] = JSON.parse(data)
```

---

## PHASE 8: PRODUCED LEARNING OBJECTS ANALYSIS {#phase-8}

### 8.1 Complete Inventory

| LO ID | Subject | Grade | Semester | Activity Type | Template Family |
|---|---|---|---|---|---|
| 2026_ara_3r_1a_01_02_02 | Arabic | 3 | 1 | storyline | F (Quiz) |
| 2026_ara_5r_1a_01_01_01 | Arabic | 5 | 1 | storyline | F (Quiz) |
| 2026_ara_6r_1a_01_01_01 | Arabic | 6 | 1 | storyline | F (Quiz) |
| 2026_ara_6r_1a_01_02_02 | Arabic | 6 | 1 | storyline | F (Quiz) |
| 2026_ara_6r_1a_01_04_02 | Arabic | 6 | 1 | storyline | F (Quiz) |
| 2025_eng_4r_1e_05_02_04 | English | 4 | 1 | game (buzzTime) | I (BuzzTime) |
| 2025_eng_5r_1e_02_02_02 | English | 5 | 1 | game (buzzTime) | I (BuzzTime) |
| 2025_eng_5r_1e_03_02_02 | English | 5 | 1 | game (buzzTime) | I (BuzzTime) |
| 2025_eng_5r_1e_05_02_05 | English | 5 | 1 | game (buzzTime) | I (BuzzTime) |
| 2025_eng_5r_1e_06_02_02 | English | 5 | 1 | game (buzzTime) | I (BuzzTime) |
| 2025_eng_6r_1e_03_02_04 | English | 6 | 1 | game (buzzTime) | I (BuzzTime) |
| 2025_eng_6r_1e_05_02_05 | English | 6 | 1 | game (buzzTime) | I (BuzzTime) |
| 2026_soc_4r_1a_01_01_05 | Social | 4 | 1 | storyline | F (Quiz) |
| 2026_soc_4r_1a_01_01_06 | Social | 4 | 1 | storyline | F (Quiz) |
| 2026_soc_4r_1a_01_02_01 | Social | 4 | 1 | storyline | F (Quiz) |
| 2026_soc_4r_1a_01_03_01 | Social | 4 | 1 | storyline | F (Quiz) |
| 2026_soc_5r_1a_01_01_01 | Social | 5 | 1 | storyline | F (Quiz) |
| 2026_soc_5r_1a_01_01_02 | Social | 5 | 1 | storyline | F (Quiz) |
| 2026_soc_5r_1a_01_02_03 | Social | 5 | 1 | storyline | F (Quiz) |
| 2026_soc_5r_1a_01_02_04 | Social | 5 | 1 | storyline | F (Quiz) |
| 2026_soc_6r_1a_01_01_02 | Social | 6 | 1 | storyline | F (Quiz) |
| 2026_soc_6r_1a_01_02_01 | Social | 6 | 1 | storyline | F (Quiz) |
| 2026_soc_6r_1a_01_02_04 | Social | 6 | 1 | storyline | F (Quiz) |
| 2026_soc_6r_1a_01_03_02 | Social | 6 | 1 | storyline | F (Quiz) |
| 2026_soc_6r_1a_01_04_02 | Social | 6 | 1 | storyline | F (Quiz) |

**Total: 25 produced LOs**  
**By subject:** Arabic=5, English=7, Social Studies=13, Math=0, Religion=0  
**By type:** storyline (ara/soc)=18, buzzTime game (eng)=7

### 8.2 Produced LO Internal Structure

**Storyline-Q LO (ara/soc subjects):**
```
[LO-folder]/
├── mymovie.html         ← Copy/derivation from ara/storyline-q template
├── data.json            ← Populated content; same schema as template
├── slideShow.json       ← Intro slideshow data
├── style/
│   ├── lo-style.css     ← Subject/grade specific styles
│   └── lo-style.scss    ← SCSS source present
├── audio/               ← q1.mp3, q2.mp3, hint 1.mp3, hint 2.mp3, …
├── images/              ← Drag images (t1.png, t2.png, t3.png)
└── img/slidshow/        ← Slideshow slide images
```

**BuzzTime LO (eng subject):**
```
[LO-folder]/
├── mymovie.html         ← Minimal: links to lib-native/buzzTime
└── data.json            ← Object root; populated questions[]
```
Note: English BuzzTime LOs are very lightweight — only mymovie.html and data.json. All assets come from lib-native/buzzTime.

### 8.3 Subject-Folder Naming Pattern

Produced LOs are organized into subject-grade-semester folders at project root:
```
[subject]_[grade]_[semester]/
  [activity-type]/
    [LO-id]/
```

| Subject folder | Subject | Grades present | LO count |
|---|---|---|---|
| ara_3r_1a | Arabic | 3 | 1 |
| ara_5r_1a | Arabic | 5 | 1 |
| ara_6r_1a | Arabic | 6 | 3 |
| eng_4r_1e | English | 4 | 1 |
| eng_5r_1e | English | 5 | 4 |
| eng_6r_1e | English | 6 | 2 |
| soc_4r_1a | Social Studies | 4 | 4 |
| soc_5r_1a | Social Studies | 5 | 4 |
| soc_6r_1a | Social Studies | 6 | 5 |

### 8.4 Observations on Produced LOs

1. **No math (mth) or religion (rel) LOs produced yet** — these subject templates exist in allTemplete but no produced instances.
2. **Year prefix inconsistency:** Arabic and Social LOs use `2026_` prefix; English LOs use `2025_` prefix.
3. **Subject folder suffix:** Arabic/Social use `_1a` (Arabic semester 1); English uses `_1e` (English semester 1).
4. **`ara_5r_1a` LO is new** — the file was newer than the existing PROJECT_DOCUMENTATION.md, detected in final rescan.
5. **Storyline LOs include `lo-style.scss`** alongside `lo-style.css`, indicating active SCSS development.

---

## PHASE 9: NAMING CONVENTION ANALYSIS {#phase-9}

### 9.1 Produced LO Naming Convention

**Pattern:** `{year}_{subject}_{grade}r_{semester}{lang}_{unit:2d}_{lesson:2d}_{activity:2d}`

| Token | Description | Values | Examples |
|---|---|---|---|
| `{year}` | Academic year (4 digits) | 2025, 2026 | `2026` |
| `{subject}` | Subject code | ara, eng, mth, rel, soc | `ara`, `soc` |
| `{grade}` | Grade level (1 digit) | 1–6 | `3`, `6` |
| `r` | Literal — Egyptian curriculum grade suffix | always `r` | `3r` |
| `{semester}` | Semester number (1 digit) | 1, 2 | `1` |
| `{lang}` | Language suffix | `a` (Arabic), `e` (English) | `1a`, `1e` |
| `{unit:2d}` | Unit number (2 digits, zero-padded) | 01–99 | `01`, `12` |
| `{lesson:2d}` | Lesson number within unit (2 digits) | 01–99 | `02`, `04` |
| `{activity:2d}` | Activity sequence within lesson (2 digits) | 01–99 | `01`, `05` |

**Examples:**
```
2026_ara_3r_1a_01_02_02 → Year:2026, Arabic, Grade 3, Sem 1 Arabic, Unit 01, Lesson 02, Activity 02
2025_eng_5r_1e_02_02_02 → Year:2025, English, Grade 5, Sem 1 English, Unit 02, Lesson 02, Activity 02
2026_soc_4r_1a_01_01_05 → Year:2026, Social, Grade 4, Sem 1 Arabic, Unit 01, Lesson 01, Activity 05
```

### 9.2 Template Naming Convention

**Pattern for math templates:** `{runtime}-{activity-type}-{grade-range}-{language}`

| Token | Values | Examples |
|---|---|---|
| `{runtime}` | `digital-screen`, `penguin`, `space` | `digital-screen` |
| `{activity-type}` | `input`, `choose`, `tworound-inputs`, `tworound-input-choose` | `choose` |
| `{grade-range}` | `lower` (grades 1–3), `upper` (grades 4–6) | `lower`, `upper` |
| `{language}` | `ara` (Arabic), `eng` (English) | `ara`, `eng` |

**Examples:**
```
digital-screen-choose-lower-ara  → digital-screen runtime, choose type, grades 1–3, Arabic
penguin-tworound-inputs-upper-eng → penguin runtime, two-round input, grades 4–6, English
space-input-lower-ara             → space runtime, input type, grades 1–3, Arabic
```

**Pattern for religion templates:** `slideshow_2025_{subject}_{grade}r_{semester}{lang}`
```
slideshow_2025_rel_3r_2a → Religion slideshow, Grade 3, Semester 2, Arabic
slidshow_tabs_2025_rel_4r_1a → Religion slideshow-tabs, Grade 4, Semester 1, Arabic
```
Note: `slidshow` (missing 'e') is a consistent typo in the folder name.

### 9.3 Subject-Grade Folder Convention

**Pattern:** `{subject}_{grade}r_{semester}{lang}`

```
ara_3r_1a  → Arabic, Grade 3, Sem 1, Arabic
eng_4r_1e  → English, Grade 4, Sem 1, English
soc_6r_1a  → Social, Grade 6, Sem 1, Arabic
```

### 9.4 Activity-Type Subfolder Convention

Within subject-grade folders, LOs are grouped by activity type:
- `storyline/` — Storyline-Q multi-type quiz LOs
- `game/` — BuzzTime game LOs

### 9.5 File Naming Conventions

| File | Pattern | Purpose |
|---|---|---|
| `mymovie.html` | Constant | All LO HTML entry points |
| `data.json` | Constant | All LO/template data |
| `lo-style.css` | Constant | Per-LO custom styles |
| `lo-style.scss` | Constant | SCSS source for lo-style.css |
| `q[N].mp3` | `q` + number | Question audio (q1.mp3, q2.mp3…) |
| `hint [N].mp3` | `hint ` + number (note space!) | Hint audio (hint 1.mp3) |
| `hint[N].mp3` | No space variant | Also used (hint1.mp3) — inconsistency |
| `slideShow.json` | Constant | Intro slideshow data (storyline-q) |
| `[N].mp3` | number only | Slideshow question audio (1.mp3, 2.mp3…) |

**Note:** Audio file naming inconsistency: some LOs use `hint 1.mp3` (with space), others use `hint1.mp3` (no space). Both found in the project.

---

## PHASE 10: AUTHORING WORKFLOW RECONSTRUCTION {#phase-10}

### 10.1 Inferred Workflow (from file evidence only)

```
STEP 1: DETERMINE LO REQUIREMENTS
  Author receives:
  - Subject (ara/eng/mth/rel/soc)
  - Grade (1–6) → determines lower/upper
  - Language (ara/eng)
  - Activity type (choose/input/tworound/slideshow/etc.)
  - LO ID per naming convention
  - Academic year

STEP 2: SELECT TEMPLATE
  Author selects from allTemplete/ based on:
  - Subject → template folder (ara/, eng/, mth/, soc/, etc.)
  - Activity type → template variant (input, choose, tworound, etc.)
  - Grade → lower (1–3) or upper (4–6)
  - Language → ara or eng

STEP 3: COPY TEMPLATE
  Author copies entire template directory to:
  - For math: no subject-folder structure (no produced mth LOs found)
  - For ara/soc: {subject}_{grade}r_{semester}{lang}/storyline/
  - For eng: eng_{grade}r_1e/game/
  Directory named with full LO ID per naming convention.

STEP 4: POPULATE data.json
  Author opens data.json in the copied directory and fills in:
  - Root: id, numberOfquestion, upper, isEng, informationLO
  - For storyline-q: navgations[0].title, langauge, overrideFeedback (optional)
  - Items/Questions: content-specific fields (title, inputs, paragraph1, etc.)
  - For each item: valid[] answer arrays, question audio paths, images

STEP 5: CREATE ASSETS
  Author creates and places:
  - Audio files in audio/ folder (q1.mp3, q2.mp3, hint 1.mp3, etc.)
  - Images in images/ folder
  - For storyline-q: slideShow.json + img/slidshow/ slide images

STEP 6: CUSTOMIZE STYLES
  Author edits lo-style.scss (compiled to lo-style.css):
  - Subject-specific colors, layouts
  - Grade-specific adjustments

STEP 7: VERIFY
  Author opens mymovie.html in browser (localhost or staging):
  - Checks data loads (submit_sender.js returnData resolves)
  - Verifies all questions display
  - Tests answer validation
  - Checks audio plays

STEP 8: PACKAGE
  The LO folder (containing mymovie.html + data.json + assets) is complete.
  It is deployable as a standalone interactive object.
  The lib-native/ and js/ folders must be present at ../../.. relative path.
```

### 10.2 Template Selection Decision Tree

```
What activity type?
│
├── VOCABULARY MATCHING (Arabic) → ara/glossary
│     └── Set: environment, items[{item-type, words[]}]
│
├── MULTI-TYPE QUIZ (Arabic/Social)
│     └── ara/storyline-q or soc/storyline-q
│           └── Set: navgations[0].title, questions[{type, content}]
│
├── TYPING GAME (English) → eng/buzzTime
│     └── Set: questions[{text, answer}], numberOfquestion
│
├── RELIGION SLIDESHOW (no interaction, image-only)
│     ├── With tabs? → slidshow_tabs_2025_rel_{grade}r_1a
│     └── Without tabs? → slideshow_2025_rel_{grade}r_2a
│           └── Set: slides[{img}], questions[{type2|3, img, sound, answers}]
│
└── MATH ACTIVITY
      ├── Choose answer? (MCQ)
      │     ├── Fraction display needed? → digital-screen-choose-*
      │     └── Compare two images (<, >, =)? → penguin-choose-*
      │
      ├── Type answer (fill-in)?
      │     ├── 3-panel layout with subtitle? → space-input-*
      │     ├── Animation pointer? → digital-screen-input-with-animation
      │     ├── Has video? → digital-screen-input-video
      │     └── Standard? → digital-screen-input-* or penguin-input-*
      │
      ├── Two-round fill-in?
      │     ├── digital-screen-tworound-inputs-*
      │     └── penguin-tworound-inputs-*
      │
      └── Hybrid (fill-in + choose)?
            ├── digital-screen-tworound-input-choose
            └── penguin-tworound-input-choose
```

### 10.3 LO Deployment Architecture

```
Web Server / LMS
├── [3 levels up from LO]/
│   ├── js/
│   │   ├── submit_sender.js
│   │   ├── finalProgress.js
│   │   ├── input.js
│   │   ├── choose.js
│   │   └── inputTwoRound.js
│   └── lib-native/
│       └── [family]/... (full runtime assets)
│
└── [subject]_[grade]_[sem]/
    └── [activity-type]/
        └── [LO-id]/              ← Deployed LO folder
            ├── mymovie.html       ← ENTRY POINT (iframe src in LMS)
            ├── data.json
            └── [assets]/
```

The entire `2026_2027/` project root must be served together. No CDN usage — all libraries are bundled locally.

---

## PHASE 11: AUTHORING SYSTEM READINESS ASSESSMENT {#phase-11}

### 11.1 Fields Requiring Authoring UI

Based on file analysis, the following fields must be provided by a content author and therefore require UI in an authoring system:

#### 11.1.1 Universal Fields (All Template Families)

| Field | UI Type | Notes |
|---|---|---|
| `id` | Text input | LO identifier; follows naming convention |
| `numberOfquestion` | Number input / Auto-calculate | Auto-settable from items length |
| `upper` | Toggle (true/false) | Grade range selector (lower 1–3 / upper 4–6) |
| `isEng` | Toggle | Language selector |
| `updatefont` | Toggle | Enable grade-specific font |
| `hint` | Toggle | Enable/disable hint button |
| `questionAudio` | Toggle | Enable per-question audio |
| `informationLO` | Array text editor (or scalar for penguin) | Activity instructions |
| `SubType` | Hidden/auto | Set by template type; not author-editable |

#### 11.1.2 Per-Item / Per-Question Fields

| Template Family | Field | UI Type |
|---|---|---|
| All input | `title` | Rich text editor |
| All input | `inputs[].numOfInput` | Number spinner |
| All input | `inputs[].valid[]` | Multi-value text input (comma-separated) |
| TwoRound | `roundOne.inputs[]` | Dual-panel input editor |
| TwoRound | `roundTwo.inputs[]` | Dual-panel input editor |
| TwoRound | `idRoundTwo` | Item selector dropdown |
| ds-choose | `paragraph1[]` | Array rich text editor |
| ds-choose | `fraction1[]` | Fraction editor (numerator/denominator) |
| ds-choose | `correctAnswer[]` | Checkboxes on answer list |
| ds-choose | `answers[].numAnswer` | Auto-assigned number |
| penguin-choose | `img1`, `img2` | Image upload/picker |
| penguin-choose | `choose[].select` | Operator selector (<, >, =) |
| penguin-choose | `choose[].answer` | Boolean toggle per operator |
| penguin-choose | `m13l`, `mul`, `plus`, `equal` | Math symbol pickers |
| penguin-choose | `content[].input.valid[]` | Optional nested input editor |
| space-input | `sup[]` | Text input (displays above/below question) |
| ds-anim | `holdTime` | Number spinner (milliseconds) |
| ds-video | `video` | File upload (MP4) |
| ds-video | `text1`, `text2`, `text8` | Text inputs |
| glossary | `environment` | Environment theme picker (18 options) |
| glossary | `items[].item` | Category selector (mean/reverse/plural/single) |
| glossary | `items[].words[]` | Word-pair table editor |
| storyline-q | `navgations[0].title` | Text input |
| storyline-q | `langauge` | Language code selector (typo must be preserved!) |
| storyline-q | `overrideFeedback` | Toggle |
| storyline-q | `feedback.*` | 6 text fields (only shown if overrideFeedback=true) |
| storyline-q | `questions[].type` | Question type selector (5 types) |
| storyline-q | dragDrop `drags[].text/img` | Table editor |
| storyline-q | match `matchPairs[].textRight/Left` | Two-column pair editor |
| buzzTime | `hints.en[]` / `hints.ar[]` | Dual-language text editor |
| buzzTime | `keyboard` | Keyboard layout editor (or use default) |
| buzzTime | `questions[].text` | Fill-in-blank editor |
| buzzTime | `questions[].answer` | Text input |
| slideshow | `slides[].img` | Image upload/picker |
| slideshow | `questions[].img` | Image upload/picker |
| slideshow | `questions[].sound` | Audio file picker |
| slideshow | `questions[].answers[].isRight` | Boolean toggle |
| slideshow-tabs | `tabs[].img` | Image upload/picker |
| slideshow-tabs | `tabs[].slides[].img` | Image upload/picker (per tab) |

### 11.2 Hardcoded Values That Limit Authoring

| Location | Hardcoded Value | Impact |
|---|---|---|
| `js/submit_sender.js` | `devgateway = true` | CRITICAL: All production traffic hits dev endpoint |
| `lib-native/*/zoki.js` | `finalProgress > 51` determines win character | Win threshold is not configurable |
| `lib-native/storyline-q/main.js` | Arabic feedback text strings | Default feedback text hardcoded in Arabic (overrideable via `overrideFeedback`) |
| All runtimes | `"../../../"` relative path | 3-level directory depth is enforced by code |
| `finalProgress.js` | 0/59/74/75/100 score thresholds | Star rating thresholds are not configurable |
| Lottie star frames | `[0,1]`, `[59,60]`, `[74,75]`, `[99,100]` | Animation frames coupled to score thresholds |
| Right-click protection | hostname check list | Production hostname must be added to allowlist |

### 11.3 Data Inconsistencies That Must Be Handled by Authoring System

| Inconsistency | Required Handling |
|---|---|
| `informationLO`: Array vs String | Authoring system must output Array for ds/space, String for penguin |
| `bloomLevels` case | Store as-is per template family; normalize to lowercase or uppercase consistently |
| `SubType` vs `subType` | Output `SubType` for all except slideshow/slideshow-tabs which use `subType` |
| Root type Array vs Object | Output Array for math/ara/soc, Object for slideshow/slideshow-tabs/buzzTime |
| `navgations` typo | MUST preserve typo — runtime reads `posts[0].navgations[0].title` |
| `langauge` typo | MUST preserve typo — runtime reads `posts[0]?.langauge` |
| `precentage` typo | Preserve in navgations objects |
| BuzzTime `answer` vs `answers` | Support both scalar and array answer fields |
| Trailing spaces in buzzTime answers | Authoring UI should not strip trailing spaces from `answer` values |

### 11.4 Missing Architecture Components (Not Found in Files)

The following components that a complete authoring system would need are **not present** in the current project:

| Component | Status | Notes |
|---|---|---|
| Authoring UI | Not Found | No web-based or desktop authoring tool found |
| Asset management system | Not Found | Assets are manually placed in folders |
| Data validation layer | Not Found | No JSON schema files found |
| Build/compile system | Not Found | No package.json, webpack, vite, or build config |
| Test suite | Not Found | No test files found |
| Version control config | Not Found | No .gitignore or git config at project root |
| SCSS build pipeline | Not Found | SCSS files present but no build tool config |
| LMS configuration | Not Found | LMS endpoint configured in submit_sender.js only |
| Content review workflow | Not Found | No review/approval state fields |
| Localization system | Not Found | Text strings hardcoded in runtime JS |

---

## PHASE 12: COMPLETE DEPENDENCY MAPPING {#phase-12}

### 12.1 Runtime JavaScript Dependencies (load order per template)

#### Math Templates (digital-screen, penguin, space)
```
mymovie.html loads in order:
1. lib-native/[family]/assets/js/lottie-min.js    ← Lottie 5.x (bundled)
2. lib-native/[family]/assets/js/vue.js            ← Vue 2.x (bundled)
3. lib-native/[family]/assets/style/font.css       ← Font declarations
4. lib-native/[family]/assets/style/style.css      ← Runtime styles
5. style/lo-style.css                              ← Template-specific styles
6. js/submit_sender.js                             ← Sets: finalResponse, direction, runPage, returnData
7. js/input.js | choose.js | inputTwoRound.js      ← Activity-specific helpers
8. js/finalProgress.js                             ← Sets: finalProgress()
9. lib-native/[family]/[sub]/js/main.js|zoki.js    ← Vue app (reads globals from 6-8)
10. lib-native/[family]/assets/js/animation.js     ← Lottie wrappers
```

#### Storyline-Q Templates
```
1. lib-native/storyline-q/assets/js/lottie-min.js
2. lib-native/storyline-q/assets/js/vue.js
3. lib-native/storyline-q/assets/style/font.css
4. lib-native/storyline-q/assets/style/style.css
5. lib-native/storyline-q/assets/style/slid-show.css
6. lib-native/storyline-q/assets/style/images.css
7. style/lo-style.css
8. js/submit_sender.js
9. lib-native/storyline-q/assets/js/input.js   ← InputManager class
10. lib-native/storyline-q/assets/js/choose.js  ← ChooseManager class
11. lib-native/storyline-q/assets/js/match.js   ← MatchManager class
12. lib-native/storyline-q/assets/js/drag.js    ← DragDropManager class
13. lib-native/storyline-q/assets/js/main.js    ← Vue app
14. lib-native/storyline-q/assets/js/animation.js
```

Note: Storyline-q uses its OWN local copies of input.js, choose.js etc. (inside lib-native), NOT the shared `js/` folder versions.

### 12.2 CSS Dependencies

```
Global shared (from lib-native):
  font.css        ← @font-face declarations for all fonts
  style.css       ← Base layout, component styles
  images.css      ← Character/background image URLs (environment-specific for glossary)
  slid-show.css   ← Slideshow component styles (storyline-q only)

Template-specific:
  style/lo-style.css   ← Per-template color overrides, layout tweaks

Religion grade-specific:
  imgs-grade-[N].css   ← Loaded based on grade attribute on root div
```

### 12.3 Audio Dependencies

#### Math Template Audio (relative to lib-native/[family]/assets/audio/)
| File | Used for |
|---|---|
| `music.mp3` | Background music loop |
| `rightanswer.mp3` | Correct answer feedback sound |
| `wronganswer.mp3` | Wrong answer feedback sound |
| `click_btn.mp3` | Button click sound |
| `startclick2.mp3` | Start button sound |
| `knock-knock.mp3` | Idle character animation sound (digital-screen) |

#### Per-LO Audio (inside each LO folder)
| File pattern | Used for |
|---|---|
| `audio/q[N].mp3` | Question audio narration |
| `audio/hint [N].mp3` | Hint audio |
| `audio/hint[N].mp3` | Hint audio (alternate naming) |
| `sound/q/[N].mp3` | Question audio (slideshow templates) |

#### BuzzTime Audio (lib-native/buzzTime/audio/)
18 sound files: arabic_hint, eng_hint, audio_bg, boy_oh_no, boy_yes, button_click1, buzz, change-img, click, computeranswer, girl_oh_no, girl_yes, right, start, time, vs, win_feedback, wrong

#### Storyline-Q Audio (lib-native/storyline-q/assets/audios/)
Language-suffixed files:
- `popup-correct[lang].mp3`, `popup-wrong1[lang].mp3`, `popup-wrong2[lang].mp3`
- `feed-txt-correct[lang].mp3`, `feed-txt-wrong[lang].mp3`
- `correct.mp3`, `wrong.mp3`, `click.mp3`, `popup.mp3`, `feed-correct.mp3`, `feed-wrong.mp3`

### 12.4 Lottie Animation Dependencies

| Library | Lottie Files | Purpose |
|---|---|---|
| digital-screen | assets/json/*.json | Stars, progress bar, Zoki character reactions |
| penguin | assets/json/*.json | Penguin character animations |
| space | assets/json/*.json | Space character animations |
| storyline-q | (inferred from lottie-min.js presence) | Not Found from source |
| glossary | assets/json/box.json | Word reveal animation |
| buzzTime | json/*.json (20 files) | Characters, VS screen, intro, timer, feedback |

### 12.5 Font Dependencies

| Font Name | Format | Used for |
|---|---|---|
| AraJozoor | TTF | Lower-grade Arabic (grades 1–3) |
| samim | TTF | Upper-grade Arabic (grades 4–6) |
| vazirmatn-light-lower | TTF | Lower-grade Arabic (new system, updatefont=true) |
| vazirmatn-light-upper | TTF | Upper-grade Arabic / English (new system) |
| ArialRounded | TTF | English display text |
| Amin | TTF | English input fields, numbers |
| samim-fd | TTF | Glossary Arabic |
| vazirmatn-regular_ara | TTF | Glossary Arabic |
| Lexend (variable) | TTF | BuzzTime English |
| Vazirmatn (variable) | TTF | BuzzTime Arabic |

### 12.6 Global Variable Interface (submit_sender.js → runtime)

```javascript
// Variables SET by submit_sender.js, READ by runtime (zoki.js/main.js):
direction: "1" | "2"        // Deployment mode
runPage: Boolean             // Skip auth when true
returnData: Promise          // Resolves to auth/data response object

// Object SET by submit_sender.js, CALLED by runtime:
finalResponse.submitData(jsonData: String, status: Number, score: Number)

// Variables SET by finalProgress.js, READ by runtime:
// finalProgress() function exposed globally

// Variables SET by input.js, READ by runtime:
// arabicToWestern() function exposed globally
```

---

## KEY FINDINGS AND RISKS

### Critical Issues

1. **`devgateway = true` in submit_sender.js** — All LMS traffic (including production) routes to development endpoint. MUST be changed to `false` before production deployment.

2. **2 typos in storyline-q data.json schema** — `navgations` (not `navigations`) and `langauge` (not `language`) are BAKED INTO the runtime code. Any authoring system MUST output these typos exactly or the runtime breaks.

3. **Misplaced produced LO** — `allTemplete/eng/2025_eng_6r_1e_02_02_02/` is a produced LO incorrectly placed inside the template directory. It should be moved to `eng_6r_1e/game/`.

4. **`informationLO` type ambiguity** — digital-screen and space templates expect Array; penguin templates expect String. An authoring system must track this per-family.

5. **No math LOs produced yet** — Despite 36 math template variants, 0 math LOs exist in produced output. Math templates may have never been used in production.

### Data Consistency Issues

6. **`bloomLevels` case inconsistency** — uppercase `BloomLevels` in most templates; lowercase `bloomLevels` in glossary, space-input, ds-input-video, ds-anim, buzzTime.

7. **buzzTime question format inconsistency** — `answer: String` vs `answers: Array` used for different questions within the same template.

8. **Test data in template** — BuzzTime template contains questions 107–108 with placeholder text ("slamo 3leko el egaba mm"). Template should be cleaned before use.

9. **`.DS_Store` macOS artifact** — Found in `allTemplete/slidshow tabs/slidshow_tabs_2025_rel_5r_1a/images/t1/`. Indicates development was done on macOS; should be removed and added to .gitignore.

### Architecture Observations

10. **No CDN dependencies** — All libraries (Vue.js 2.x, Lottie) are bundled locally. LOs work offline once deployed.

11. **3-level path depth rule** — All relative paths use `../../../`. This must not be broken.

12. **No build system** — SCSS files have no associated build pipeline. CSS must be compiled manually.

13. **Storyline-q uses internal copies of input.js/choose.js** — These are NOT the same files as in `js/`. Changes to `js/input.js` do not affect storyline-q behavior.

14. **`window.app` exposure** — storyline-q exposes `window.app = new Vue(...)`. This is potentially a debugging aid that should be removed for production.

15. **BuzzTime keyboard layout in data.json** — This is a powerful authoring feature: the on-screen keyboard is fully configurable without code changes.

---

**Document generated:** 2026-06-25  
**Total templates analyzed:** 49  
**Total produced LOs analyzed:** 25  
**Total data.json files read:** 16+ (partial scan; all template families covered)  
**Final rescan performed:** Yes — new files detected in ara_5r_1a, ara_6r_1a  
**Analysis method:** Read-only; no files modified; no code generated; all findings from actual source files

