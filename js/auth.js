/**
 * LexiLearn - Authentication & Registration Module (Lab 3)
 * Authors: Bolat Alnur, Usser Aidana, Nurbol Halyk
 * Handles live field-level validation, exact age >= 13 calculation,
 * password policy checks, and safe non-sensitive localStorage persistence.
 */

(function () {
    'use strict';

    const STORAGE_KEY_USER = 'lexilearn_user_profile';
    const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

    // Registration Form Elements
    const regForm = document.getElementById('register-form');
    const regNameInput = document.getElementById('reg-fullname');
    const regEmailInput = document.getElementById('reg-email');
    const regBirthdayInput = document.getElementById('reg-birthday');
    const regModeSelect = document.getElementById('reg-mode');
    const regPasswordInput = document.getElementById('reg-password');
    const regConfirmInput = document.getElementById('reg-confirm-password');
    const regConsentCheckbox = document.getElementById('reg-consent');
    const regStatusBanner = document.getElementById('register-status');

    // Login Form Elements
    const loginForm = document.getElementById('login-form');
    const loginEmailInput = document.getElementById('login-email');
    const loginPasswordInput = document.getElementById('login-password');
    const loginStatusBanner = document.getElementById('login-status');

    // Saved Profile Preview Box
    const profileSummaryBox = document.getElementById('saved-profile-summary');

    /**
     * Helper to display or clear inline field error messages and input border classes
     */
    function setFieldValidationState(inputEl, errorElId, errorMessage) {
        const errorEl = document.getElementById(errorElId);
        if (!inputEl || !errorEl) {
            return false;
        }

        if (errorMessage && errorMessage.length > 0) {
            inputEl.classList.add('input-error');
            inputEl.classList.remove('input-valid');
            inputEl.setAttribute('aria-invalid', 'true');
            errorEl.textContent = errorMessage;
            return false;
        } else {
            inputEl.classList.remove('input-error');
            inputEl.classList.add('input-valid');
            inputEl.setAttribute('aria-invalid', 'false');
            errorEl.textContent = '';
            return true;
        }
    }

    /**
     * Calculate exact age in years from a YYYY-MM-DD birthday string
     */
    function calculateExactAge(birthdayString) {
        const parts = birthdayString.split('-');
        if (parts.length !== 3) {
            return -1;
        }
        const birthYear = Number(parts[0]);
        const birthMonth = Number(parts[1]) - 1;
        const birthDay = Number(parts[2]);

        const birthDate = new Date(birthYear, birthMonth, birthDay);
        if (Number.isNaN(birthDate.getTime())) {
            return -1;
        }

        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();

        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age = age - 1;
        }
        return age;
    }

    // Individual Field Validators
    function validateFullName() {
        const value = regNameInput.value.trim();
        if (value.length === 0) {
            return setFieldValidationState(regNameInput, 'err-reg-fullname', 'Full name is required.');
        } else if (value.length < 2) {
            return setFieldValidationState(regNameInput, 'err-reg-fullname', 'Please enter at least 2 characters for your full name.');
        } else {
            return setFieldValidationState(regNameInput, 'err-reg-fullname', '');
        }
    }

    function validateRegEmail() {
        const value = regEmailInput.value.trim();
        if (value.length === 0) {
            return setFieldValidationState(regEmailInput, 'err-reg-email', 'Email address is required.');
        } else if (!EMAIL_REGEX.test(value)) {
            return setFieldValidationState(regEmailInput, 'err-reg-email', 'Please enter a valid email address (e.g., student@university.edu).');
        } else {
            return setFieldValidationState(regEmailInput, 'err-reg-email', '');
        }
    }

    function validateBirthday() {
        const value = regBirthdayInput.value.trim();
        if (value.length === 0) {
            return setFieldValidationState(regBirthdayInput, 'err-reg-birthday', 'Birthday is required to verify age eligibility.');
        }

        const age = calculateExactAge(value);
        if (age < 0 || age > 120) {
            return setFieldValidationState(regBirthdayInput, 'err-reg-birthday', 'Please enter a valid calendar birth date.');
        } else if (age < 13) {
            return setFieldValidationState(regBirthdayInput, 'err-reg-birthday', 'You must be at least 13 years old to register (calculated age: ' + age + ').');
        } else {
            return setFieldValidationState(regBirthdayInput, 'err-reg-birthday', '');
        }
    }

    function validatePreferredMode() {
        const value = regModeSelect.value;
        if (!value || value.trim().length === 0) {
            return setFieldValidationState(regModeSelect, 'err-reg-mode', 'Please select your preferred dyslexia reading support mode.');
        } else {
            return setFieldValidationState(regModeSelect, 'err-reg-mode', '');
        }
    }

    function validatePassword() {
        const value = regPasswordInput.value;
        const hasMinLength = value.length >= 8;
        const hasUpper = /[A-Z]/.test(value);
        const hasLower = /[a-z]/.test(value);
        const hasDigit = /[0-9]/.test(value);

        if (value.length === 0) {
            return setFieldValidationState(regPasswordInput, 'err-reg-password', 'Password is required.');
        } else if (!hasMinLength || !hasUpper || !hasLower || !hasDigit) {
            const missingRules = [];
            if (!hasMinLength) { missingRules.push('8+ characters'); }
            if (!hasUpper) { missingRules.push('1 uppercase letter'); }
            if (!hasLower) { missingRules.push('1 lowercase letter'); }
            if (!hasDigit) { missingRules.push('1 digit'); }
            return setFieldValidationState(
                regPasswordInput,
                'err-reg-password',
                'Password requires: ' + missingRules.join(', ') + '.'
            );
        } else {
            // Also re-validate confirm password if user already typed in it
            if (regConfirmInput.value.length > 0) {
                validateConfirmPassword();
            }
            return setFieldValidationState(regPasswordInput, 'err-reg-password', '');
        }
    }

    function validateConfirmPassword() {
        const passwordVal = regPasswordInput.value;
        const confirmVal = regConfirmInput.value;

        if (confirmVal.length === 0) {
            return setFieldValidationState(regConfirmInput, 'err-reg-confirm', 'Please confirm your password.');
        } else if (confirmVal !== passwordVal) {
            return setFieldValidationState(regConfirmInput, 'err-reg-confirm', 'Passwords do not match.');
        } else {
            return setFieldValidationState(regConfirmInput, 'err-reg-confirm', '');
        }
    }

    function validateConsent() {
        const isChecked = regConsentCheckbox.checked === true;
        if (!isChecked) {
            return setFieldValidationState(regConsentCheckbox, 'err-reg-consent', 'You must accept the accessibility terms and privacy policy.');
        } else {
            return setFieldValidationState(regConsentCheckbox, 'err-reg-consent', '');
        }
    }

    /**
     * Safely load non-sensitive user profile from localStorage
     */
    function loadSavedProfile() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY_USER);
            if (!raw) {
                return null;
            }
            const parsed = JSON.parse(raw);
            if (parsed && typeof parsed === 'object' && typeof parsed.email === 'string') {
                return parsed;
            }
            return null;
        } catch (err) {
            console.warn('Could not read user profile from localStorage:', err);
            return null;
        }
    }

    /**
     * Safely save ONLY non-sensitive profile metadata (NEVER plain-text password)
     */
    function saveUserProfile(profileData) {
        try {
            const safeRecord = {
                fullName: String(profileData.fullName),
                email: String(profileData.email).toLowerCase(),
                birthday: String(profileData.birthday),
                age: Number(profileData.age),
                preferredMode: String(profileData.preferredMode),
                registeredAt: new Date().toISOString()
            };
            localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(safeRecord));
            return true;
        } catch (err) {
            console.warn('Could not save user profile to localStorage:', err);
            return false;
        }
    }

    /**
     * Render the currently saved non-sensitive user profile summary
     */
    function renderProfileSummary() {
        if (!profileSummaryBox) {
            return;
        }
        const profile = loadSavedProfile();
        if (!profile) {
            profileSummaryBox.innerHTML = '<p>No local learner profile saved yet. Complete the registration form to create your dyslexia preferences profile.</p>';
            return;
        }

        profileSummaryBox.innerHTML =
            '<div class="pane pane-simplified">' +
            '<h3>Active Learner Profile (Stored Safely in LocalStorage)</h3>' +
            '<p><strong>Name:</strong> ' + escapeHtml(profile.fullName) + ' &bull; <strong>Email:</strong> ' + escapeHtml(profile.email) + '</p>' +
            '<p><strong>Verified Age:</strong> ' + Number(profile.age) + ' years &bull; <strong>Preferred Support Mode:</strong> ' + escapeHtml(profile.preferredMode) + '</p>' +
            '<p class="field-hint">Security Notice: Your password is never stored in localStorage.</p>' +
            '</div>';
    }

    function escapeHtml(str) {
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    // Login Field Validators
    function validateLoginEmail() {
        const value = loginEmailInput.value.trim();
        if (value.length === 0) {
            return setFieldValidationState(loginEmailInput, 'err-login-email', 'Please enter your email address.');
        } else if (!EMAIL_REGEX.test(value)) {
            return setFieldValidationState(loginEmailInput, 'err-login-email', 'Please enter a valid email format.');
        } else {
            return setFieldValidationState(loginEmailInput, 'err-login-email', '');
        }
    }

    function validateLoginPassword() {
        const value = loginPasswordInput.value;
        if (value.length === 0) {
            return setFieldValidationState(loginPasswordInput, 'err-login-password', 'Please enter your password.');
        } else if (value.length < 8) {
            return setFieldValidationState(loginPasswordInput, 'err-login-password', 'Password must be at least 8 characters long.');
        } else {
            return setFieldValidationState(loginPasswordInput, 'err-login-password', '');
        }
    }

    // Attach Live Event Listeners if Registration Form Exists
    if (regForm) {
        const fieldBindings = [
            { el: regNameInput, fn: validateFullName, events: ['input', 'blur'] },
            { el: regEmailInput, fn: validateRegEmail, events: ['input', 'blur'] },
            { el: regBirthdayInput, fn: validateBirthday, events: ['change', 'blur', 'input'] },
            { el: regModeSelect, fn: validatePreferredMode, events: ['change', 'blur'] },
            { el: regPasswordInput, fn: validatePassword, events: ['input', 'blur'] },
            { el: regConfirmInput, fn: validateConfirmPassword, events: ['input', 'blur'] },
            { el: regConsentCheckbox, fn: validateConsent, events: ['change'] }
        ];

        for (let i = 0; i < fieldBindings.length; i++) {
            const binding = fieldBindings[i];
            if (binding.el) {
                binding.events.forEach(function (evtName) {
                    binding.el.addEventListener(evtName, binding.fn);
                });
            }
        }

        regForm.addEventListener('submit', function (e) {
            e.preventDefault();

            const v1 = validateFullName();
            const v2 = validateRegEmail();
            const v3 = validateBirthday();
            const v4 = validatePreferredMode();
            const v5 = validatePassword();
            const v6 = validateConfirmPassword();
            const v7 = validateConsent();

            const isAllValid = v1 && v2 && v3 && v4 && v5 && v6 && v7;

            if (!isAllValid) {
                regStatusBanner.hidden = false;
                regStatusBanner.className = 'status-banner status-error';
                regStatusBanner.textContent = 'Please fix the highlighted errors above before submitting your registration.';
                return;
            }

            const calculatedAge = calculateExactAge(regBirthdayInput.value.trim());
            const savedOk = saveUserProfile({
                fullName: regNameInput.value.trim(),
                email: regEmailInput.value.trim(),
                birthday: regBirthdayInput.value.trim(),
                age: calculatedAge,
                preferredMode: regModeSelect.value
            });

            regStatusBanner.hidden = false;
            if (savedOk) {
                regStatusBanner.className = 'status-banner status-success';
                regStatusBanner.textContent = 'Registration successful! Welcome, ' + regNameInput.value.trim() + '. Your reading preferences have been saved (password excluded from storage).';
                if (loginEmailInput) {
                    loginEmailInput.value = regEmailInput.value.trim();
                }
                regPasswordInput.value = '';
                regConfirmInput.value = '';
                regPasswordInput.classList.remove('input-valid');
                regConfirmInput.classList.remove('input-valid');
                renderProfileSummary();
            } else {
                regStatusBanner.className = 'status-banner status-error';
                regStatusBanner.textContent = 'Validation passed, but localStorage is unavailable in this browser mode.';
            }
        });
    }

    // Attach Live Event Listeners if Login Form Exists
    if (loginForm) {
        loginEmailInput.addEventListener('input', validateLoginEmail);
        loginEmailInput.addEventListener('blur', validateLoginEmail);
        loginPasswordInput.addEventListener('input', validateLoginPassword);
        loginPasswordInput.addEventListener('blur', validateLoginPassword);

        loginForm.addEventListener('submit', function (e) {
            e.preventDefault();

            const validEmail = validateLoginEmail();
            const validPass = validateLoginPassword();

            if (!validEmail || !validPass) {
                loginStatusBanner.hidden = false;
                loginStatusBanner.className = 'status-banner status-error';
                loginStatusBanner.textContent = 'Please enter a valid email address and password (8+ characters).';
                return;
            }

            const enteredEmail = loginEmailInput.value.trim().toLowerCase();
            const savedProfile = loadSavedProfile();

            loginStatusBanner.hidden = false;
            if (savedProfile && savedProfile.email.toLowerCase() === enteredEmail) {
                loginStatusBanner.className = 'status-banner status-success';
                loginStatusBanner.textContent = 'Sign-in verified for ' + savedProfile.fullName + ' (' + savedProfile.preferredMode + ' mode active).';
                loginPasswordInput.value = '';
            } else if (enteredEmail === 'student@lexilearn.edu') {
                loginStatusBanner.className = 'status-banner status-success';
                loginStatusBanner.textContent = 'Demo student account signed in successfully! Default Warm Cream reading preferences loaded.';
                loginPasswordInput.value = '';
            } else {
                loginStatusBanner.className = 'status-banner status-error';
                loginStatusBanner.textContent = 'No registered learner found with "' + enteredEmail + '". Register on the left first or use demo email student@lexilearn.edu.';
            }
        });
    }

    renderProfileSummary();
})();
