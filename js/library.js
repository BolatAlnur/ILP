/**
 * LexiLearn - Adapted Study Materials Library CRUD Module (Lab 3)
 * Authors: Nurbol Halyk, Bolat Alnur, Usser Aidana
 * Implements full persistent CRUD in localStorage ('lexilearn_materials')
 * using modular functions: loadItems(), saveItems(), validateItem(),
 * renderItems(), addItem(), editItem(), updateItem(), and deleteItem().
 */

const STORAGE_KEY_MATERIALS = 'lexilearn_materials';

/**
 * Default seed study materials if localStorage is empty or corrupted
 */
const DEFAULT_MATERIALS = [
    {
        id: 1001,
        title: 'Cellular Respiration & Photosynthesis',
        subject: 'Biology',
        readingLevel: 'Beginner',
        estimatedMinutes: 12,
        audioAvailable: true,
        isSimplified: true
    },
    {
        id: 1002,
        title: 'Sorting Algorithms & Big-O Complexity',
        subject: 'Computer Science',
        readingLevel: 'Intermediate',
        estimatedMinutes: 15,
        audioAvailable: true,
        isSimplified: true
    },
    {
        id: 1003,
        title: 'Trade Networks of the Ancient Silk Road',
        subject: 'History',
        readingLevel: 'Beginner',
        estimatedMinutes: 10,
        audioAvailable: true,
        isSimplified: false
    },
    {
        id: 1004,
        title: 'Monetary Policy, Inflation & Central Banks',
        subject: 'Macroeconomics',
        readingLevel: 'Advanced',
        estimatedMinutes: 14,
        audioAvailable: false,
        isSimplified: true
    }
];

let studyMaterials = [];
let editingItemId = null;

/**
 * 1. loadItems() - Safely load and parse items from localStorage with try/catch
 */
function loadItems() {
    try {
        const rawJson = localStorage.getItem(STORAGE_KEY_MATERIALS);
        if (!rawJson) {
            studyMaterials = DEFAULT_MATERIALS.map(function (item) {
                return Object.assign({}, item);
            });
            saveItems();
            return studyMaterials;
        }

        const parsed = JSON.parse(rawJson);
        if (!Array.isArray(parsed) || parsed.length === 0) {
            studyMaterials = DEFAULT_MATERIALS.map(function (item) {
                return Object.assign({}, item);
            });
            saveItems();
            return studyMaterials;
        }

        // Normalize data types on every loaded object
        studyMaterials = [];
        for (let i = 0; i < parsed.length; i++) {
            const entry = parsed[i];
            if (entry && typeof entry === 'object' && entry.title) {
                studyMaterials.push({
                    id: entry.id !== undefined ? entry.id : Date.now() + i,
                    title: String(entry.title),
                    subject: String(entry.subject || 'General Studies'),
                    readingLevel: String(entry.readingLevel || 'Intermediate'),
                    estimatedMinutes: Number(entry.estimatedMinutes) > 0 ? Number(entry.estimatedMinutes) : 10,
                    audioAvailable: Boolean(entry.audioAvailable),
                    isSimplified: Boolean(entry.isSimplified)
                });
            }
        }
        return studyMaterials;
    } catch (error) {
        console.warn('Corrupted or inaccessible localStorage detected; falling back to default study materials.', error);
        studyMaterials = DEFAULT_MATERIALS.map(function (item) {
            return Object.assign({}, item);
        });
        return studyMaterials;
    }
}

/**
 * 2. saveItems() - Safely serialize and persist studyMaterials array in localStorage
 */
function saveItems() {
    try {
        const serialized = JSON.stringify(studyMaterials);
        localStorage.setItem(STORAGE_KEY_MATERIALS, serialized);
        return true;
    } catch (error) {
        console.warn('Failed to save study materials to localStorage:', error);
        return false;
    }
}

/**
 * Helper to show or clear inline form validation messages
 */
function setCrudFieldError(inputEl, errorElId, message) {
    const errEl = document.getElementById(errorElId);
    if (!inputEl || !errEl) {
        return;
    }
    if (message && message.length > 0) {
        inputEl.classList.add('input-error');
        inputEl.classList.remove('input-valid');
        errEl.textContent = message;
    } else {
        inputEl.classList.remove('input-error');
        inputEl.classList.add('input-valid');
        errEl.textContent = '';
    }
}

/**
 * 3. validateItem() - Validate form inputs before creating or updating an item
 */
function validateItem(candidate) {
    const titleInput = document.getElementById('mat-title');
    const subjectInput = document.getElementById('mat-subject');
    const levelSelect = document.getElementById('mat-level');
    const minutesInput = document.getElementById('mat-minutes');

    let isValid = true;

    const cleanTitle = candidate.title ? candidate.title.trim() : '';
    if (cleanTitle.length === 0) {
        setCrudFieldError(titleInput, 'err-mat-title', 'Module title is required.');
        isValid = false;
    } else if (cleanTitle.length < 3) {
        setCrudFieldError(titleInput, 'err-mat-title', 'Title must be at least 3 characters long.');
        isValid = false;
    } else {
        setCrudFieldError(titleInput, 'err-mat-title', '');
    }

    const cleanSubject = candidate.subject ? candidate.subject.trim() : '';
    if (cleanSubject.length === 0) {
        setCrudFieldError(subjectInput, 'err-mat-subject', 'Academic subject is required.');
        isValid = false;
    } else if (cleanSubject.length < 2) {
        setCrudFieldError(subjectInput, 'err-mat-subject', 'Subject must be at least 2 characters long.');
        isValid = false;
    } else {
        setCrudFieldError(subjectInput, 'err-mat-subject', '');
    }

    const allowedLevels = ['Beginner', 'Intermediate', 'Advanced'];
    if (allowedLevels.indexOf(candidate.readingLevel) === -1) {
        setCrudFieldError(levelSelect, 'err-mat-level', 'Please choose Beginner, Intermediate, or Advanced.');
        isValid = false;
    } else {
        setCrudFieldError(levelSelect, 'err-mat-level', '');
    }

    const parsedMinutes = Number(candidate.estimatedMinutes);
    if (candidate.estimatedMinutes === '' || Number.isNaN(parsedMinutes) || parsedMinutes <= 0 || parsedMinutes > 240) {
        setCrudFieldError(minutesInput, 'err-mat-minutes', 'Enter a positive study time between 1 and 240 minutes.');
        isValid = false;
    } else {
        setCrudFieldError(minutesInput, 'err-mat-minutes', '');
    }

    return isValid;
}

/**
 * Escape HTML special characters to prevent XSS when rendering user strings
 */
function escapeSafeHtml(text) {
    return String(text)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

/**
 * 4. renderItems() - Dynamically render study material cards with search/filter & conditional UI states
 */
function renderItems() {
    const gridContainer = document.getElementById('materials-grid');
    const statsSummary = document.getElementById('materials-stats');
    const searchInput = document.getElementById('search-materials');
    const statusFilter = document.getElementById('filter-status');
    const levelFilter = document.getElementById('filter-level');

    if (!gridContainer) {
        return;
    }

    const query = searchInput ? searchInput.value.trim().toLowerCase() : '';
    const selectedStatus = statusFilter ? statusFilter.value : 'all';
    const selectedLevel = levelFilter ? levelFilter.value : 'all';

    // Filter items using .filter() and clear conditional if/else logic
    const filteredList = studyMaterials.filter(function (item) {
        const matchesSearch =
            query.length === 0 ||
            item.title.toLowerCase().indexOf(query) !== -1 ||
            item.subject.toLowerCase().indexOf(query) !== -1;

        let matchesStatus = true;
        if (selectedStatus === 'simplified') {
            matchesStatus = item.isSimplified === true;
        } else if (selectedStatus === 'audio') {
            matchesStatus = item.audioAvailable === true;
        } else if (selectedStatus === 'multimodal') {
            matchesStatus = item.isSimplified === true && item.audioAvailable === true;
        }

        let matchesLevel = true;
        if (selectedLevel !== 'all') {
            matchesLevel = item.readingLevel === selectedLevel;
        }

        return matchesSearch && matchesStatus && matchesLevel;
    });

    // Update statistics counter
    if (statsSummary) {
        let simplifiedCount = 0;
        let audioCount = 0;
        for (let i = 0; i < studyMaterials.length; i++) {
            if (studyMaterials[i].isSimplified) { simplifiedCount++; }
            if (studyMaterials[i].audioAvailable) { audioCount++; }
        }
        statsSummary.innerHTML =
            '<span>Showing <strong>' + filteredList.length + '</strong> of <strong>' + studyMaterials.length + '</strong> adapted modules</span>' +
            '<span>Gemini Simplified: <strong>' + simplifiedCount + '</strong> &bull; Audio Tutor Ready: <strong>' + audioCount + '</strong></span>';
    }

    if (filteredList.length === 0) {
        gridContainer.innerHTML =
            '<div class="empty-state form-group-full">' +
            '<h3>No Study Modules Match Your Current Filter</h3>' +
            '<p>Try clearing the search box or switching the filter dropdown to "All Modules".</p>' +
            '</div>';
        return;
    }

    let cardsHtml = '';
    filteredList.forEach(function (item) {
        // Conditional UI classes & badges based on boolean and enum properties
        const cardClasses = ['card'];
        if (item.isSimplified === true) {
            cardClasses.push('card-simplified-accent');
        }
        if (item.audioAvailable === true) {
            cardClasses.push('card-audio-accent');
        }
        if (editingItemId !== null && String(editingItemId) === String(item.id)) {
            cardClasses.push('card-editing-active');
        }

        let levelBadgeClass = 'badge badge-neutral';
        if (item.readingLevel === 'Beginner') {
            levelBadgeClass = 'badge badge-success';
        } else if (item.readingLevel === 'Intermediate') {
            levelBadgeClass = 'badge';
        } else if (item.readingLevel === 'Advanced') {
            levelBadgeClass = 'badge badge-warning';
        }

        const simplifiedBadge = item.isSimplified
            ? '<span class="badge">Gemini Simplified</span>'
            : '<span class="badge badge-neutral">Standard Text</span>';

        const audioBadge = item.audioAvailable
            ? '<span class="badge badge-success">Audio Tutor Ready</span>'
            : '<span class="badge badge-neutral">No Audio Track</span>';

        cardsHtml +=
            '<article class="' + cardClasses.join(' ') + '" data-id="' + escapeSafeHtml(item.id) + '">' +
            '  <div>' +
            '    <div class="badge-row">' +
            '      <span class="' + levelBadgeClass + '">' + escapeSafeHtml(item.readingLevel) + '</span>' +
            '      ' + simplifiedBadge +
            '      ' + audioBadge +
            '    </div>' +
            '    <h3>' + escapeSafeHtml(item.title) + '</h3>' +
            '    <p><strong>Subject:</strong> ' + escapeSafeHtml(item.subject) + ' &bull; <strong>Est. Study Time:</strong> ' + Number(item.estimatedMinutes) + ' mins</p>' +
            '    <ul>' +
            '      <li>' + (item.isSimplified ? 'Active-voice bullet points &amp; key-term glossary included' : 'Original course text awaiting AI simplification') + '</li>' +
            '      <li>' + (item.audioAvailable ? 'Synchronized 0.9x conversational audio walkthrough available' : 'Written reading guide only (audio narration pending)') + '</li>' +
            '    </ul>' +
            '  </div>' +
            '  <div class="card-footer">' +
            '    <div class="a11y-controls">' +
            '      <a href="simplification.html" class="icon-btn" aria-label="Open ' + escapeSafeHtml(item.title) + ' in Simplifier">Read</a>' +
            (item.audioAvailable ? '      <a href="audio-support.html" class="icon-btn" aria-label="Listen to ' + escapeSafeHtml(item.title) + '">Audio</a>' : '') +
            '    </div>' +
            '    <div class="a11y-controls">' +
            '      <button type="button" class="icon-btn js-edit-btn" data-id="' + escapeSafeHtml(item.id) + '" aria-label="Edit ' + escapeSafeHtml(item.title) + '">Edit</button>' +
            '      <button type="button" class="icon-btn btn-danger-outline js-delete-btn" data-id="' + escapeSafeHtml(item.id) + '" aria-label="Delete ' + escapeSafeHtml(item.title) + '">Delete</button>' +
            '    </div>' +
            '  </div>' +
            '</article>';
    });

    gridContainer.innerHTML = cardsHtml;
}

/**
 * 5. addItem() - Create a new study material object, save to localStorage, and re-render
 */
function addItem(formData) {
    if (!validateItem(formData)) {
        return false;
    }

    const newItem = {
        id: Date.now(),
        title: formData.title.trim(),
        subject: formData.subject.trim(),
        readingLevel: formData.readingLevel,
        estimatedMinutes: Math.round(Number(formData.estimatedMinutes)),
        audioAvailable: Boolean(formData.audioAvailable),
        isSimplified: Boolean(formData.isSimplified)
    };

    studyMaterials.unshift(newItem);
    saveItems();
    renderItems();
    return true;
}

/**
 * 6. editItem() - Populate the form with an existing item's values to enter Edit mode
 */
function editItem(id) {
    let target = null;
    for (let i = 0; i < studyMaterials.length; i++) {
        if (String(studyMaterials[i].id) === String(id)) {
            target = studyMaterials[i];
            break;
        }
    }

    if (!target) {
        return;
    }

    editingItemId = target.id;

    const titleInput = document.getElementById('mat-title');
    const subjectInput = document.getElementById('mat-subject');
    const levelSelect = document.getElementById('mat-level');
    const minutesInput = document.getElementById('mat-minutes');
    const simplifiedCheck = document.getElementById('mat-simplified');
    const audioCheck = document.getElementById('mat-audio');
    const submitBtn = document.getElementById('crud-submit-btn');
    const cancelBtn = document.getElementById('crud-cancel-btn');
    const formHeading = document.getElementById('crud-form-heading');

    if (titleInput) { titleInput.value = target.title; }
    if (subjectInput) { subjectInput.value = target.subject; }
    if (levelSelect) { levelSelect.value = target.readingLevel; }
    if (minutesInput) { minutesInput.value = String(target.estimatedMinutes); }
    if (simplifiedCheck) { simplifiedCheck.checked = target.isSimplified === true; }
    if (audioCheck) { audioCheck.checked = target.audioAvailable === true; }

    if (formHeading) {
        formHeading.textContent = 'Edit Study Module: ' + target.title;
    }
    if (submitBtn) {
        submitBtn.textContent = 'Save Updated Module';
        submitBtn.classList.remove('btn-primary');
        submitBtn.classList.add('btn-accent');
    }
    if (cancelBtn) {
        cancelBtn.hidden = false;
    }

    renderItems();
    const formSection = document.getElementById('crud-form-section');
    if (formSection && typeof formSection.scrollIntoView === 'function') {
        formSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

/**
 * 7. updateItem() - Save changes to the currently edited item, persist, and exit Edit mode
 */
function updateItem(id, updatedData) {
    if (!validateItem(updatedData)) {
        return false;
    }

    let updated = false;
    for (let i = 0; i < studyMaterials.length; i++) {
        if (String(studyMaterials[i].id) === String(id)) {
            studyMaterials[i] = {
                id: studyMaterials[i].id,
                title: updatedData.title.trim(),
                subject: updatedData.subject.trim(),
                readingLevel: updatedData.readingLevel,
                estimatedMinutes: Math.round(Number(updatedData.estimatedMinutes)),
                audioAvailable: Boolean(updatedData.audioAvailable),
                isSimplified: Boolean(updatedData.isSimplified)
            };
            updated = true;
            break;
        }
    }

    if (updated) {
        editingItemId = null;
        saveItems();
        renderItems();
    }
    return updated;
}

/**
 * 8. deleteItem() - Remove an item by id from studyMaterials, update localStorage, and re-render
 */
function deleteItem(id) {
    const initialLength = studyMaterials.length;
    studyMaterials = studyMaterials.filter(function (item) {
        return String(item.id) !== String(id);
    });

    if (studyMaterials.length !== initialLength) {
        if (editingItemId !== null && String(editingItemId) === String(id)) {
            resetCrudFormUI();
        }
        saveItems();
        renderItems();
        return true;
    }
    return false;
}

/**
 * Reset form back to "Create New Study Module" state
 */
function resetCrudFormUI() {
    editingItemId = null;
    const form = document.getElementById('material-crud-form');
    const submitBtn = document.getElementById('crud-submit-btn');
    const cancelBtn = document.getElementById('crud-cancel-btn');
    const formHeading = document.getElementById('crud-form-heading');

    if (form) {
        form.reset();
    }

    const inputs = ['mat-title', 'mat-subject', 'mat-level', 'mat-minutes'];
    const errors = ['err-mat-title', 'err-mat-subject', 'err-mat-level', 'err-mat-minutes'];
    for (let i = 0; i < inputs.length; i++) {
        const el = document.getElementById(inputs[i]);
        const err = document.getElementById(errors[i]);
        if (el) {
            el.classList.remove('input-error', 'input-valid');
        }
        if (err) {
            err.textContent = '';
        }
    }

    if (formHeading) {
        formHeading.textContent = 'Add New Adapted Study Module';
    }
    if (submitBtn) {
        submitBtn.textContent = 'Add Module to Library';
        submitBtn.classList.add('btn-primary');
        submitBtn.classList.remove('btn-accent');
    }
    if (cancelBtn) {
        cancelBtn.hidden = true;
    }
    renderItems();
}

/**
 * Initialize DOM event listeners on page load
 */
document.addEventListener('DOMContentLoaded', function () {
    loadItems();
    renderItems();

    const crudForm = document.getElementById('material-crud-form');
    const cancelBtn = document.getElementById('crud-cancel-btn');
    const resetDefaultsBtn = document.getElementById('reset-defaults-btn');
    const statusBanner = document.getElementById('crud-status-banner');
    const gridContainer = document.getElementById('materials-grid');

    const searchInput = document.getElementById('search-materials');
    const statusFilter = document.getElementById('filter-status');
    const levelFilter = document.getElementById('filter-level');

    function showCrudBanner(message, isError) {
        if (!statusBanner) { return; }
        statusBanner.hidden = false;
        statusBanner.className = isError ? 'status-banner status-error' : 'status-banner status-success';
        statusBanner.textContent = message;
    }

    // Live field validation on input/change
    const liveIds = ['mat-title', 'mat-subject', 'mat-level', 'mat-minutes'];
    liveIds.forEach(function (fieldId) {
        const el = document.getElementById(fieldId);
        if (el) {
            el.addEventListener('input', function () {
                if (el.classList.contains('input-error')) {
                    validateItem(readFormCandidate());
                }
            });
        }
    });

    function readFormCandidate() {
        return {
            title: document.getElementById('mat-title').value,
            subject: document.getElementById('mat-subject').value,
            readingLevel: document.getElementById('mat-level').value,
            estimatedMinutes: document.getElementById('mat-minutes').value,
            isSimplified: document.getElementById('mat-simplified').checked,
            audioAvailable: document.getElementById('mat-audio').checked
        };
    }

    if (crudForm) {
        crudForm.addEventListener('submit', function (e) {
            e.preventDefault();
            const candidate = readFormCandidate();

            if (editingItemId !== null) {
                const updatedOk = updateItem(editingItemId, candidate);
                if (updatedOk) {
                    resetCrudFormUI();
                    showCrudBanner('Study module "' + candidate.title.trim() + '" updated and saved to localStorage.', false);
                } else {
                    showCrudBanner('Please fix the highlighted validation errors before saving changes.', true);
                }
            } else {
                const addedOk = addItem(candidate);
                if (addedOk) {
                    resetCrudFormUI();
                    showCrudBanner('New study module "' + candidate.title.trim() + '" added to the library!', false);
                } else {
                    showCrudBanner('Please fix the highlighted validation errors before adding the module.', true);
                }
            }
        });
    }

    if (cancelBtn) {
        cancelBtn.addEventListener('click', function () {
            resetCrudFormUI();
            showCrudBanner('Edit cancelled. Form reset to Add mode.', false);
        });
    }

    if (resetDefaultsBtn) {
        resetDefaultsBtn.addEventListener('click', function () {
            studyMaterials = DEFAULT_MATERIALS.map(function (item) {
                return Object.assign({}, item);
            });
            saveItems();
            resetCrudFormUI();
            if (searchInput) { searchInput.value = ''; }
            if (statusFilter) { statusFilter.value = 'all'; }
            if (levelFilter) { levelFilter.value = 'all'; }
            renderItems();
            showCrudBanner('Library reset to the 4 default university study modules.', false);
        });
    }

    // Event delegation for Edit and Delete buttons inside the dynamic card grid
    if (gridContainer) {
        gridContainer.addEventListener('click', function (e) {
            const editBtn = e.target.closest('.js-edit-btn');
            if (editBtn) {
                const id = editBtn.getAttribute('data-id');
                editItem(id);
                showCrudBanner('Editing module #' + id + '. Update the fields below and click "Save Updated Module".', false);
                return;
            }

            const deleteBtn = e.target.closest('.js-delete-btn');
            if (deleteBtn) {
                const id = deleteBtn.getAttribute('data-id');
                const removed = deleteItem(id);
                if (removed) {
                    showCrudBanner('Study module removed from the library and localStorage.', false);
                }
            }
        });
    }

    // Live Search & Filter listeners
    if (searchInput) {
        searchInput.addEventListener('input', renderItems);
    }
    if (statusFilter) {
        statusFilter.addEventListener('change', renderItems);
    }
    if (levelFilter) {
        levelFilter.addEventListener('change', renderItems);
    }
});
