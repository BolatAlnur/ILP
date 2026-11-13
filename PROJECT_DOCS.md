# LexiLearn (`ILP-0.03`) — Project Documentation, Lab 3 JS Modules & AI Architecture Plan

**Course:** Web Development (Lab 3 Upgrade — Vanilla JavaScript Interactivity, Form Validation & Persistent LocalStorage CRUD)  
**Project Title:** LexiLearn: Inclusive Dyslexia-Friendly University Learning Platform  
**Team Members:**
1. **Bolat Alnur** — `index.html`, `about.html`, `auth.html`, `js/auth.js` (Live Form Validation & Age Calculation)
2. **Usser Aidana** — `simplification.html`, `visual-tools.html`, `js/auth.js` (Password Policy & Safe Profile Persistence), `css/style.css`
3. **Nurbol Halyk** — `library.html`, `audio-support.html`, `js/library.js` (Full Persistent LocalStorage CRUD, Search/Filter & Conditional UI)

---

## 1. Sitemap & Wireframe Sketches (All 7 Interconnected Pages)

### 1.1 High-Level Site Architecture (Sitemap)

```text
                             +------------------------------+
                             |     index.html (Homepage)    |
                             |   Hero + 4 Pillars + Form    |
                             +--------------+---------------+
                                            |
     +------------+------------+------------+------------+------------+------------+
     |            |            |            |            |            |            |
     v            v            v            v            v            v            v
+----------+ +----------+ +----------+ +----------+ +----------+ +----------+ +----------+
|simplifi- | |  audio-  | | visual-  | | library  | |  about   | |   auth   | |PROJECT_  |
|cation.htm| |support.ht| |tools.html| |  .html   | |  .html   | |  .html   | | DOCS.md  |
|Gemini AI | |AudioTutr | |Tints/Fnts| |CRUD JS   | |Team/Docs | |Auth JS   | |Spec Docs |
+----------+ +----------+ +----------+ +----------+ +----------+ +----------+ +----------+
```

All 7 HTML pages share a unified top **Reading Comfort Bar** (`.a11y-bar`), a responsive Flexbox **Header & 7-Link Navigation Bar** (`<header class="site-header">` with `<nav class="main-nav">`), and a 3-column CSS Grid **Footer** (`<footer class="site-footer">`).

---

## 2. Lab 3 Vanilla JavaScript Architecture (`js/auth.js` & `js/library.js`)

### 2.1 Authentication & Registration Module (`auth.html` + `js/auth.js`)
- **7 Validated Registration Fields:**
  1. `reg-fullname` (`text`, required, minimum 2 characters)
  2. `reg-email` (`email`, required, regex format check `/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/`)
  3. `reg-birthday` (`date`, required, exact calendar age calculated in JS via `calculateExactAge()`, enforcing `age >= 13`)
  4. `reg-mode` (`select`, required: `"Text Simplification"`, `"Audio Explanations"`, or `"Both Multimodal"`)
  5. `reg-password` (`password`, required: 8+ characters, at least 1 uppercase `[A-Z]`, 1 lowercase `[a-z]`, and 1 digit `[0-9]`)
  6. `reg-confirm-password` (`password`, required: must match `reg-password` exactly)
  7. `reg-consent` (`checkbox`, required: must be checked)
- **Live Event Listeners:** Uses `addEventListener` on `input`, `change`, `blur`, and `submit` to immediately show or clear field-specific inline error spans (`.field-error`) and red/green input borders (`.input-error` / `.input-valid`).
- **Security Rule:** Plain-text passwords are **never** written to `localStorage`. Only non-sensitive profile metadata (`fullName`, `email`, `birthday`, `age`, `preferredMode`, `registeredAt`) is serialized inside a `try/catch` block under `lexilearn_user_profile`.
- **Login Verification:** Validates email format and password length on submit, checks against the saved user email in `localStorage` (or the demo account `student@lexilearn.edu`), and displays an accessible status banner.

### 2.2 Adapted Study Materials CRUD Module (`library.html` + `js/library.js`)
- **LocalStorage Key:** `lexilearn_materials` (initialized with 4 realistic university modules if storage is empty or corrupted).
- **Object Schema:**
  ```json
  {
    "id": 1001,
    "title": "Cellular Respiration & Photosynthesis",
    "subject": "Biology",
    "readingLevel": "Beginner",
    "estimatedMinutes": 12,
    "audioAvailable": true,
    "isSimplified": true
  }
  ```
- **8 Modular Functions in `js/library.js`:**
  1. `loadItems()` — Reads and parses `lexilearn_materials` from `localStorage` inside `try/catch`, normalizing types (`Number`, `Boolean`, `String`).
  2. `saveItems()` — Serializes `studyMaterials` via `JSON.stringify()` inside `try/catch`.
  3. `validateItem(candidate)` — Validates non-empty title (3+ chars), subject (2+ chars), reading level enum, and positive study minutes (`1–240`) with inline error messages.
  4. `renderItems()` — Dynamically filters and renders cards into `#materials-grid` with conditional CSS borders (`.card-simplified-accent`, `.card-audio-accent`, `.card-editing-active`) and level/status badges.
  5. `addItem(formData)` — Validates and prepends a new object with `id: Date.now()`, saves, and re-renders.
  6. `editItem(id)` — Populates the form with the selected card's properties and switches the form into Edit mode.
  7. `updateItem(id, updatedData)` — Validates and updates the matching object in `studyMaterials`, saves, and exits Edit mode.
  8. `deleteItem(id)` — Removes the item by `id` using `.filter()`, updates `localStorage`, and re-renders.

---

## 3. AI Feature Plan: Google Gemini API Text Simplification

- **Selected Model:** **Google Gemini API (`gemini-2.5-flash`)** via a client-to-backend proxy architecture (`/api/simplify`) so the `GEMINI_API_KEY` remains protected on the server.
- **Purpose:** Transform dense passive academic paragraphs into 1 core takeaway sentence, 3–5 active-voice bullet points, and an extracted key-term glossary.
- **Known Limitations:** Rate limits on free-tier API quotas, potential compression of academic hedging nuances (mitigated by side-by-side original text comparison), and rare symbol/formula misinterpretations.

---

## 4. Team Contribution Log (`ILP-0.03`)

| Team Member | Primary Files Authored | Summary of Completed Work |
| :--- | :--- | :--- |
| **Bolat Alnur** | `index.html`, `about.html`, `auth.html`, `js/auth.js` | Built `auth.html`, implemented live field-level validation (`input`, `change`, `blur`, `submit`), exact birthday age >= 13 calculation, and updated the 7-page navigation system. |
| **Usser Aidana** | `simplification.html`, `visual-tools.html`, `js/auth.js`, `css/style.css` | Implemented regex email & password strength checks, enforced zero plain-text password storage in `localStorage` with `try/catch`, and added validation/conditional card styles to `css/style.css`. |
| **Nurbol Halyk** | `library.html`, `audio-support.html`, `js/library.js`, `PROJECT_DOCS.md` | Built the persistent Study Library CRUD system (`loadItems`, `saveItems`, `validateItem`, `renderItems`, `addItem`, `editItem`, `updateItem`, `deleteItem`), live search/filter controls, and conditional UI badges. |
