# LexiLearn — Inclusive Learning Platform for Dyslexia (Lab 4: Vite + React)

**Authors:**
- **Bolat Alnur** — Homepage Architecture, `Header.jsx`, `HeroSection.jsx`, & Dyslexia Visual Comfort Tools
- **Usser Aidana** — AI Text Simplification Engine, `FeatureCard.jsx`, & `AuthForm.jsx` (Registration/Login Validation)
- **Nurbol Halyk** — AI Audio Explanations, `StudyMaterialCard.jsx`, `StudyMaterialLibrary.jsx` (CRUD + Search/Filter), & `Footer.jsx`

---

## 1. How to Install & Run the Project

Make sure you have **Node.js** installed, then run the following commands inside the `ILP-0.04` folder:

```bash
# 1. Install dependencies
npm install

# 2. Start the Vite development server
npm run dev

# 3. Create a production build (verifies zero compile/bundle errors)
npm run build

# 4. Preview the production build locally
npm run preview
```

---

## 2. Project Folder Structure (`ILP-0.04`)

```text
ILP-0.04/
├── index.html                        # Vite entry HTML mounting #root
├── package.json                      # React 18 + Vite scripts & dependencies
├── vite.config.js                    # Vite React plugin configuration
├── README.md                         # Setup guide & Lab 4 defense cheat-sheet
├── public/
│   └── images/                       # 6 custom dyslexia-accessible SVG illustrations
└── src/
    ├── main.jsx                      # ReactDOM.createRoot entry point
    ├── App.jsx                       # Root state container, view router & interactive tools
    ├── index.css                     # Dyslexia-accessible stylesheet & @media (max-width: 860px)
    └── components/
        ├── Header.jsx                # Brand header, 7-tab nav & paper tint switcher
        ├── HeroSection.jsx           # Reusable hero banner accepting props
        ├── FeatureCard.jsx           # Reusable feature card accepting props
        ├── StudyMaterialCard.jsx     # Reusable CRUD item card accepting item, onEdit, onDelete
        ├── StudyMaterialLibrary.jsx  # Full React CRUD + live search/filter + localStorage
        ├── AuthForm.jsx              # 7-field Registration & Login with live validation
        └── Footer.jsx                # Shared 3-column team attribution footer
```

---

## 3. Lab 4 Defense Cheat-Sheet (Components, Props, `useState`, Events)

### A. Modular Components & Props (`src/components/`)
1. **`Header.jsx`**
   - **Props received:** `activePage`, `onNavigate`, `paperTint`, `onTintChange`
   - **Purpose:** Renders the top Reading Comfort Bar (switching between Warm Cream, Soft Yellow, Sky Blue, and Gentle Sage paper tints) and the 7 navigation tabs.
2. **`HeroSection.jsx`**
   - **Props received:** `title`, `subtitle`, `badgeText`, `onNavigate`
   - **Purpose:** Displays the homepage hero banner and CTA buttons that trigger `onNavigate('library')` and `onNavigate('simplification')`.
3. **`FeatureCard.jsx`**
   - **Props received:** `title`, `description`, `badge`, `icon`, `ctaLabel`, `onAction`
   - **Purpose:** Reusable card used on the homepage to showcase AI Simplification, Audio Explanations, Visual Tools, and the Study Library.
4. **`StudyMaterialCard.jsx`**
   - **Props received:** `item`, `isEditing`, `onEdit`, `onDelete`, `onNavigate`
   - **Purpose:** Renders an individual study pack with conditional badges (`AI Simplified`, `Audio Narration`), an `.is-editing` highlight border when selected for editing, and **Edit** / **Delete** action buttons.
5. **`StudyMaterialLibrary.jsx`**
   - **Props received:** `onNavigate`
   - **Purpose:** Complete CRUD module (Create, Read, Update, Delete) + live keyword search + modality/level filters. Dynamically renders `<StudyMaterialCard key={item.id} ... />` using `.map()`.
6. **`AuthForm.jsx`**
   - **Props received:** `onNavigate`
   - **Purpose:** Controlled Registration Form (7 required fields) and Login Form with live field-level validation (`onChange`, `onBlur`, `onSubmit`).
7. **`Footer.jsx`**
   - **Props received:** `onNavigate`
   - **Purpose:** Credits **Bolat Alnur**, **Usser Aidana**, and **Nurbol Halyk** and provides quick navigation links.

---

### B. Where `useState` is Used
- **`src/App.jsx`**:
  - `activePage`: Tracks the active view (`'home'`, `'simplification'`, `'audio'`, `'visual'`, `'library'`, `'about'`, `'auth'`).
  - `paperTint`: Controls the dyslexia paper overlay class (`'cream'`, `'yellow'`, `'blue'`, `'green'`).
  - `selectedTier`: Switches between Original Academic, Tier 2 Guided Summary, and Tier 1 Plain Language in the AI Simplification view.
  - `activeHighlightIndex` & `playbackSpeed`: Controls the synchronized word-by-word read-aloud simulator.
- **`src/components/StudyMaterialLibrary.jsx`**:
  - `items`: Array of study material objects initialized from `localStorage` (`lexilearn_materials`) inside a `try/catch` block.
  - `searchQuery`, `categoryFilter`, `levelFilter`: Live search and filtering state.
  - `editingItem`: Holds the item currently being edited (`null` when creating a new item).
  - `formData` & `errors`: Controlled form inputs and inline validation messages.
- **`src/components/AuthForm.jsx`**:
  - `regData`, `regErrors`, `regTouched`: Tracks all 7 registration fields (`fullName`, `email`, `birthday`, `preferredMode`, `password`, `confirmPassword`, `consent`) and their live inline validation state.
  - `savedProfile`: Loaded/saved in `localStorage` (`lexilearn_user_profile`) using `try/catch` and `JSON.stringify`/`JSON.parse`. **Security rule:** Plain-text passwords are never stored in `localStorage`.
