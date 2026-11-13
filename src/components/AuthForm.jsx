import React, { useState } from 'react';

const PROFILE_STORAGE_KEY = 'lexilearn_user_profile';

function loadSavedProfile() {
  try {
    const raw = localStorage.getItem(PROFILE_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (err) {
    console.warn('Could not read lexilearn_user_profile from localStorage:', err);
    return null;
  }
}

function calculateExactAge(birthdayStr) {
  if (!birthdayStr) return -1;
  const birthDate = new Date(birthdayStr);
  if (Number.isNaN(birthDate.getTime())) return -1;

  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age -= 1;
  }
  return age;
}

export default function AuthForm({ onNavigate }) {
  const [savedProfile, setSavedProfile] = useState(loadSavedProfile);

  // Registration form state (7 required fields)
  const [regData, setRegData] = useState({
    fullName: '',
    email: '',
    birthday: '',
    preferredMode: '',
    password: '',
    confirmPassword: '',
    consent: false
  });
  const [regErrors, setRegErrors] = useState({});
  const [regTouched, setRegTouched] = useState({});
  const [regStatus, setRegStatus] = useState(null);

  // Login form state
  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  });
  const [loginErrors, setLoginErrors] = useState({});
  const [loginStatus, setLoginStatus] = useState(null);

  const validateRegField = (name, value, currentForm = regData) => {
    switch (name) {
      case 'fullName': {
        const trimmed = String(value).trim();
        if (!trimmed) return 'Full name is required.';
        if (trimmed.length < 2) return 'Full name must be at least 2 characters.';
        return '';
      }
      case 'email': {
        const trimmed = String(value).trim();
        if (!trimmed) return 'University or personal email is required.';
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(trimmed)) return 'Please enter a valid email address (e.g., name@university.edu).';
        return '';
      }
      case 'birthday': {
        if (!value) return 'Date of birth is required.';
        const age = calculateExactAge(value);
        if (age < 0 || age > 120) return 'Please enter a valid past date of birth.';
        if (age < 13) return `Learners must be at least 13 years old to register (calculated age: ${age}).`;
        return '';
      }
      case 'preferredMode': {
        if (!value) return 'Please choose your preferred dyslexia reading support mode.';
        return '';
      }
      case 'password': {
        const str = String(value);
        if (!str) return 'Password is required.';
        if (str.length < 8) return 'Password must be at least 8 characters long.';
        if (!/[A-Z]/.test(str)) return 'Password must include at least 1 uppercase letter (A-Z).';
        if (!/[a-z]/.test(str)) return 'Password must include at least 1 lowercase letter (a-z).';
        if (!/\d/.test(str)) return 'Password must include at least 1 digit (0-9).';
        return '';
      }
      case 'confirmPassword': {
        const str = String(value);
        if (!str) return 'Please confirm your password.';
        if (str !== currentForm.password) return 'Passwords do not match.';
        return '';
      }
      case 'consent': {
        if (!value) return 'You must agree to the Accessibility Privacy & Terms policy.';
        return '';
      }
      default:
        return '';
    }
  };

  const handleRegChange = (e) => {
    const { name, value, type, checked } = e.target;
    const nextValue = type === 'checkbox' ? checked : value;
    const updatedForm = { ...regData, [name]: nextValue };

    setRegData(updatedForm);
    setRegTouched((prev) => ({ ...prev, [name]: true }));

    const err = validateRegField(name, nextValue, updatedForm);
    const nextErrors = { ...regErrors, [name]: err };

    // Re-validate confirmPassword live if password changes
    if (name === 'password' && regTouched.confirmPassword) {
      nextErrors.confirmPassword = validateRegField(
        'confirmPassword',
        updatedForm.confirmPassword,
        updatedForm
      );
    }

    setRegErrors(nextErrors);
  };

  const handleRegBlur = (e) => {
    const { name, value, type, checked } = e.target;
    const currentVal = type === 'checkbox' ? checked : value;
    setRegTouched((prev) => ({ ...prev, [name]: true }));
    const err = validateRegField(name, currentVal, regData);
    setRegErrors((prev) => ({ ...prev, [name]: err }));
  };

  const handleRegSubmit = (e) => {
    e.preventDefault();

    const allFields = [
      'fullName',
      'email',
      'birthday',
      'preferredMode',
      'password',
      'confirmPassword',
      'consent'
    ];

    const newErrors = {};
    const newTouched = {};
    allFields.forEach((field) => {
      newTouched[field] = true;
      newErrors[field] = validateRegField(field, regData[field], regData);
    });

    setRegTouched(newTouched);
    setRegErrors(newErrors);

    const hasError = Object.values(newErrors).some((msg) => msg !== '');
    if (hasError) {
      setRegStatus({
        type: 'error',
        message: 'Registration could not be completed. Please fix the highlighted fields below.'
      });
      return;
    }

    // Security Rule: NEVER store plain-text password in localStorage
    const safeMetadata = {
      fullName: regData.fullName.trim(),
      email: regData.email.trim().toLowerCase(),
      birthday: regData.birthday,
      age: calculateExactAge(regData.birthday),
      preferredMode: regData.preferredMode,
      registeredAt: new Date().toISOString()
    };

    try {
      localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(safeMetadata));
      setSavedProfile(safeMetadata);
      setRegStatus({
        type: 'success',
        message: `Welcome, ${safeMetadata.fullName}! Your learner profile was saved safely in localStorage (without storing your password).`
      });
      setRegData({
        fullName: '',
        email: '',
        birthday: '',
        preferredMode: '',
        password: '',
        confirmPassword: '',
        consent: false
      });
      setRegTouched({});
      setRegErrors({});
    } catch (err) {
      console.error('Failed to save profile metadata:', err);
      setRegStatus({
        type: 'error',
        message: 'Could not save profile to localStorage.'
      });
    }
  };

  const handleLoginChange = (e) => {
    const { name, value } = e.target;
    setLoginData((prev) => ({ ...prev, [name]: value }));
    setLoginErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    const nextErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!loginData.email.trim()) {
      nextErrors.email = 'Please enter your registered email address.';
    } else if (!emailRegex.test(loginData.email.trim())) {
      nextErrors.email = 'Please enter a valid email address format.';
    }

    if (!loginData.password) {
      nextErrors.password = 'Please enter your password.';
    } else if (loginData.password.length < 8) {
      nextErrors.password = 'Password must be at least 8 characters.';
    }

    setLoginErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      setLoginStatus({
        type: 'error',
        message: 'Please provide a valid email and password to sign in.'
      });
      return;
    }

    const enteredEmail = loginData.email.trim().toLowerCase();
    if (savedProfile && savedProfile.email.toLowerCase() === enteredEmail) {
      setLoginStatus({
        type: 'success',
        message: `Signed in as ${savedProfile.fullName} (${savedProfile.preferredMode} mode active).`
      });
    } else if (enteredEmail === 'student@lexilearn.edu') {
      setLoginStatus({
        type: 'success',
        message: 'Signed in with demo student account (student@lexilearn.edu).'
      });
    } else {
      setLoginStatus({
        type: 'info',
        message: `Authenticated session for ${enteredEmail}. Tip: Register on the left to customize your dyslexia support profile!`
      });
    }

    setLoginData({ email: '', password: '' });
  };

  const handleClearProfile = () => {
    try {
      localStorage.removeItem(PROFILE_STORAGE_KEY);
      setSavedProfile(null);
      setRegStatus({
        type: 'info',
        message: 'Cleared saved learner profile metadata from localStorage.'
      });
    } catch (err) {
      console.error('Error clearing profile:', err);
    }
  };

  const getFieldClass = (field) => {
    if (!regTouched[field]) return 'form-control';
    return regErrors[field] ? 'form-control input-error' : 'form-control input-valid';
  };

  return (
    <div>
      {/* Hero Banner */}
      <section className="hero-section">
        <div className="hero-grid">
          <div className="hero-content">
            <span className="hero-badge">React Controlled Forms &bull; Live Validation</span>
            <h1>Learner Registration &amp; Account Access</h1>
            <p className="hero-lead">
              Personalize your dyslexia reading profile with live field-level validation. In strict
              compliance with web security best practices, LexiLearn <strong>never</strong> stores
              plain-text passwords in <code>localStorage</code>—only non-sensitive profile metadata
              is persisted.
            </p>
          </div>
          <div className="hero-visual">
            <img
              src="/images/dyslexia-reading.svg"
              alt="Learner profile and dyslexia reading preferences illustration"
              width="460"
              height="320"
            />
          </div>
        </div>
      </section>

      {/* Saved Profile Banner (if present) */}
      {savedProfile && (
        <section className="section-block">
          <div className="info-banner" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h3>Active Learner Profile (Loaded from localStorage)</h3>
              <p>
                <strong>Name:</strong> {savedProfile.fullName} &bull;{' '}
                <strong>Email:</strong> {savedProfile.email} &bull;{' '}
                <strong>Age:</strong> {savedProfile.age} &bull;{' '}
                <strong>Preferred Support Mode:</strong> {savedProfile.preferredMode}
              </p>
            </div>
            <div className="cta-group" style={{ marginTop: 0 }}>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => onNavigate('library')}
              >
                Go to Study Library
              </button>
              <button
                type="button"
                className="btn btn-danger btn-sm"
                onClick={handleClearProfile}
              >
                Clear Saved Profile
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Dual Registration + Login Grid */}
      <section className="section-block">
        <div className="auth-grid">
          {/* Registration Form */}
          <div className="form-panel">
            <h2>Create Learner Profile</h2>
            <p className="text-muted">
              All 7 fields validate live as you type or change selection. Learners must be 13+ years old.
            </p>

            {regStatus && (
              <div className={`status-banner ${regStatus.type}`} role="status">
                {regStatus.message}
              </div>
            )}

            <form onSubmit={handleRegSubmit} noValidate>
              {/* 1. Full Name */}
              <div className="form-group">
                <label htmlFor="reg-fullname">1. Full Name *</label>
                <input
                  type="text"
                  id="reg-fullname"
                  name="fullName"
                  className={getFieldClass('fullName')}
                  placeholder="e.g., Bolat Alnur"
                  value={regData.fullName}
                  onChange={handleRegChange}
                  onBlur={handleRegBlur}
                />
                {regTouched.fullName && regErrors.fullName && (
                  <span className="field-error">{regErrors.fullName}</span>
                )}
              </div>

              {/* 2. Email */}
              <div className="form-group">
                <label htmlFor="reg-email">2. University or Personal Email *</label>
                <input
                  type="email"
                  id="reg-email"
                  name="email"
                  className={getFieldClass('email')}
                  placeholder="student@lexilearn.edu"
                  value={regData.email}
                  onChange={handleRegChange}
                  onBlur={handleRegBlur}
                />
                {regTouched.email && regErrors.email && (
                  <span className="field-error">{regErrors.email}</span>
                )}
              </div>

              {/* 3. Birthday & 4. Preferred Reading Mode */}
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="reg-birthday">3. Birthday (Age &ge; 13) *</label>
                  <input
                    type="date"
                    id="reg-birthday"
                    name="birthday"
                    className={getFieldClass('birthday')}
                    value={regData.birthday}
                    onChange={handleRegChange}
                    onBlur={handleRegBlur}
                  />
                  {regTouched.birthday && regErrors.birthday && (
                    <span className="field-error">{regErrors.birthday}</span>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="reg-mode">4. Preferred Reading Mode *</label>
                  <select
                    id="reg-mode"
                    name="preferredMode"
                    className={getFieldClass('preferredMode')}
                    value={regData.preferredMode}
                    onChange={handleRegChange}
                    onBlur={handleRegBlur}
                  >
                    <option value="">Choose support mode...</option>
                    <option value="Text Simplification">AI Text Simplification</option>
                    <option value="Audio Explanations">AI Audio Explanations</option>
                    <option value="Both (Dual-Coding)">Both (Text + Audio Dual-Coding)</option>
                  </select>
                  {regTouched.preferredMode && regErrors.preferredMode && (
                    <span className="field-error">{regErrors.preferredMode}</span>
                  )}
                </div>
              </div>

              {/* 5. Password */}
              <div className="form-group">
                <label htmlFor="reg-password">5. Password *</label>
                <input
                  type="password"
                  id="reg-password"
                  name="password"
                  className={getFieldClass('password')}
                  placeholder="8+ chars, 1 uppercase, 1 lowercase, 1 digit"
                  value={regData.password}
                  onChange={handleRegChange}
                  onBlur={handleRegBlur}
                />
                <span className="field-hint">
                  Must contain 8+ characters, at least 1 uppercase, 1 lowercase, and 1 number.
                </span>
                {regTouched.password && regErrors.password && (
                  <span className="field-error">{regErrors.password}</span>
                )}
              </div>

              {/* 6. Confirm Password */}
              <div className="form-group">
                <label htmlFor="reg-confirm">6. Confirm Password *</label>
                <input
                  type="password"
                  id="reg-confirm"
                  name="confirmPassword"
                  className={getFieldClass('confirmPassword')}
                  placeholder="Re-enter your password"
                  value={regData.confirmPassword}
                  onChange={handleRegChange}
                  onBlur={handleRegBlur}
                />
                {regTouched.confirmPassword && regErrors.confirmPassword && (
                  <span className="field-error">{regErrors.confirmPassword}</span>
                )}
              </div>

              {/* 7. Terms & Privacy Consent */}
              <div className="form-group">
                <label className="checkbox-group" htmlFor="reg-consent">
                  <input
                    type="checkbox"
                    id="reg-consent"
                    name="consent"
                    checked={regData.consent}
                    onChange={handleRegChange}
                    onBlur={handleRegBlur}
                  />
                  <span>
                    7. I agree to the LexiLearn Accessibility Terms &amp; Privacy Policy (only
                    non-sensitive profile metadata is stored locally). *
                  </span>
                </label>
                {regTouched.consent && regErrors.consent && (
                  <span className="field-error">{regErrors.consent}</span>
                )}
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                Register Learner Account
              </button>
            </form>
          </div>

          {/* Login Form */}
          <div className="form-panel">
            <h2>Returning Learner Sign-In</h2>
            <p className="text-muted">
              Sign in with your registered email or test with{' '}
              <code>student@lexilearn.edu</code> and any 8+ character password.
            </p>

            {loginStatus && (
              <div className={`status-banner ${loginStatus.type}`} role="status">
                {loginStatus.message}
              </div>
            )}

            <form onSubmit={handleLoginSubmit} noValidate>
              <div className="form-group">
                <label htmlFor="login-email">Email Address *</label>
                <input
                  type="email"
                  id="login-email"
                  name="email"
                  className={`form-control ${loginErrors.email ? 'input-error' : ''}`}
                  placeholder="student@lexilearn.edu"
                  value={loginData.email}
                  onChange={handleLoginChange}
                />
                {loginErrors.email && <span className="field-error">{loginErrors.email}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="login-password">Password *</label>
                <input
                  type="password"
                  id="login-password"
                  name="password"
                  className={`form-control ${loginErrors.password ? 'input-error' : ''}`}
                  placeholder="Enter your password"
                  value={loginData.password}
                  onChange={handleLoginChange}
                />
                {loginErrors.password && (
                  <span className="field-error">{loginErrors.password}</span>
                )}
              </div>

              <button type="submit" className="btn btn-secondary" style={{ width: '100%' }}>
                Sign In to Workspace
              </button>
            </form>

            <div className="info-banner" style={{ marginTop: '1.75rem' }}>
              <h3>Security &amp; Validation Architecture</h3>
              <ul className="feature-list">
                <li>
                  <strong>Regex Email Check:</strong> Validates proper <code>user@domain.tld</code>{' '}
                  syntax on input and blur.
                </li>
                <li>
                  <strong>Exact Age Calculation:</strong> Computes exact age from{' '}
                  <code>birthday</code> accounting for month and day offsets (requires age &ge; 13).
                </li>
                <li>
                  <strong>Zero Plain-Text Passwords:</strong> Passwords are validated in memory and
                  never written to <code>localStorage</code>.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
