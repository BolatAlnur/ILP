import React, { useState } from 'react';
import StudyMaterialCard from './StudyMaterialCard';

const STORAGE_KEY = 'lexilearn_materials';

const DEFAULT_MATERIALS = [
  {
    id: 'mat-101',
    title: 'Cellular Respiration & ATP Synthesis',
    subject: 'Biology 101',
    readingLevel: 'Beginner',
    estimatedMinutes: 12,
    isSimplified: true,
    audioAvailable: true
  },
  {
    id: 'mat-102',
    title: 'Keynesian Macroeconomics & Fiscal Policy',
    subject: 'Economics 204',
    readingLevel: 'Intermediate',
    estimatedMinutes: 18,
    isSimplified: true,
    audioAvailable: false
  },
  {
    id: 'mat-103',
    title: 'Algorithmic Complexity & Big-O Notation',
    subject: 'Computer Science',
    readingLevel: 'Intermediate',
    estimatedMinutes: 15,
    isSimplified: false,
    audioAvailable: true
  },
  {
    id: 'mat-104',
    title: 'Cognitive Load Theory in Neurodivergent Learning',
    subject: 'Psychology 102',
    readingLevel: 'Advanced',
    estimatedMinutes: 22,
    isSimplified: true,
    audioAvailable: true
  }
];

function loadInitialMaterials() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_MATERIALS));
      return DEFAULT_MATERIALS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return DEFAULT_MATERIALS;
  } catch (err) {
    console.warn('Could not read lexilearn_materials from localStorage:', err);
    return DEFAULT_MATERIALS;
  }
}

function saveMaterialsToStorage(list) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch (err) {
    console.error('Could not save lexilearn_materials to localStorage:', err);
  }
}

export default function StudyMaterialLibrary({ onNavigate }) {
  const [items, setItems] = useState(loadInitialMaterials);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [levelFilter, setLevelFilter] = useState('all');
  const [editingItem, setEditingItem] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    subject: '',
    readingLevel: '',
    estimatedMinutes: '',
    isSimplified: true,
    audioAvailable: true
  });

  const [errors, setErrors] = useState({});
  const [statusBanner, setStatusBanner] = useState(null);

  const validateField = (name, value) => {
    if (name === 'title') {
      const trimmed = String(value).trim();
      if (!trimmed) return 'Module title is required.';
      if (trimmed.length < 3) return 'Title must be at least 3 characters.';
      return '';
    }
    if (name === 'subject') {
      return String(value).trim() ? '' : 'Please select an academic subject.';
    }
    if (name === 'readingLevel') {
      return String(value).trim() ? '' : 'Please choose a reading difficulty tier.';
    }
    if (name === 'estimatedMinutes') {
      const mins = Number(value);
      if (!value || Number.isNaN(mins) || mins < 1 || mins > 300) {
        return 'Enter a valid reading time between 1 and 300 minutes.';
      }
      return '';
    }
    return '';
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const nextValue = type === 'checkbox' ? checked : value;

    setFormData((prev) => ({
      ...prev,
      [name]: nextValue
    }));

    if (type !== 'checkbox') {
      const fieldError = validateField(name, nextValue);
      setErrors((prev) => ({
        ...prev,
        [name]: fieldError
      }));
    }
  };

  const resetForm = () => {
    setEditingItem(null);
    setFormData({
      title: '',
      subject: '',
      readingLevel: '',
      estimatedMinutes: '',
      isSimplified: true,
      audioAvailable: true
    });
    setErrors({});
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const newErrors = {
      title: validateField('title', formData.title),
      subject: validateField('subject', formData.subject),
      readingLevel: validateField('readingLevel', formData.readingLevel),
      estimatedMinutes: validateField('estimatedMinutes', formData.estimatedMinutes)
    };

    setErrors(newErrors);

    const hasError = Object.values(newErrors).some((msg) => msg !== '');
    if (hasError) {
      setStatusBanner({
        type: 'error',
        message: 'Please fix the highlighted validation errors before saving the study module.'
      });
      return;
    }

    if (editingItem) {
      const updatedList = items.map((item) =>
        item.id === editingItem.id
          ? {
              ...item,
              title: formData.title.trim(),
              subject: formData.subject,
              readingLevel: formData.readingLevel,
              estimatedMinutes: Number(formData.estimatedMinutes),
              isSimplified: Boolean(formData.isSimplified),
              audioAvailable: Boolean(formData.audioAvailable)
            }
          : item
      );
      setItems(updatedList);
      saveMaterialsToStorage(updatedList);
      setStatusBanner({
        type: 'success',
        message: `Updated study module "${formData.title.trim()}" in the catalog.`
      });
    } else {
      const newItem = {
        id: 'mat-' + Date.now(),
        title: formData.title.trim(),
        subject: formData.subject,
        readingLevel: formData.readingLevel,
        estimatedMinutes: Number(formData.estimatedMinutes),
        isSimplified: Boolean(formData.isSimplified),
        audioAvailable: Boolean(formData.audioAvailable)
      };
      const updatedList = [newItem, ...items];
      setItems(updatedList);
      saveMaterialsToStorage(updatedList);
      setStatusBanner({
        type: 'success',
        message: `Added new study module "${newItem.title}" to the catalog.`
      });
    }

    resetForm();
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({
      title: item.title,
      subject: item.subject,
      readingLevel: item.readingLevel,
      estimatedMinutes: String(item.estimatedMinutes),
      isSimplified: Boolean(item.isSimplified),
      audioAvailable: Boolean(item.audioAvailable)
    });
    setErrors({});
    setStatusBanner({
      type: 'info',
      message: `Editing "${item.title}" — update the fields below and click "Update Study Module".`
    });
  };

  const handleDelete = (id) => {
    const target = items.find((item) => item.id === id);
    if (!target) return;

    const updatedList = items.filter((item) => item.id !== id);
    setItems(updatedList);
    saveMaterialsToStorage(updatedList);

    if (editingItem && editingItem.id === id) {
      resetForm();
    }

    setStatusBanner({
      type: 'success',
      message: `Deleted "${target.title}" from the study materials library.`
    });
  };

  const handleResetCatalog = () => {
    setItems(DEFAULT_MATERIALS);
    saveMaterialsToStorage(DEFAULT_MATERIALS);
    resetForm();
    setSearchQuery('');
    setCategoryFilter('all');
    setLevelFilter('all');
    setStatusBanner({
      type: 'info',
      message: 'Restored default university study modules in localStorage.'
    });
  };

  const filteredItems = items.filter((item) => {
    const query = searchQuery.trim().toLowerCase();
    const matchesSearch =
      !query ||
      item.title.toLowerCase().includes(query) ||
      item.subject.toLowerCase().includes(query) ||
      item.readingLevel.toLowerCase().includes(query);

    const matchesCategory =
      categoryFilter === 'all' ||
      (categoryFilter === 'simplified' && item.isSimplified) ||
      (categoryFilter === 'audio' && item.audioAvailable) ||
      (categoryFilter === 'multimodal' && item.isSimplified && item.audioAvailable);

    const matchesLevel = levelFilter === 'all' || item.readingLevel === levelFilter;

    return matchesSearch && matchesCategory && matchesLevel;
  });

  const simplifiedCount = items.filter((i) => i.isSimplified).length;
  const audioCount = items.filter((i) => i.audioAvailable).length;

  return (
    <div>
      {/* Page Hero */}
      <section className="hero-section">
        <div className="hero-grid">
          <div className="hero-content">
            <span className="hero-badge">Interactive React CRUD &bull; LocalStorage Persistence</span>
            <h1>Adapted Study Materials Library</h1>
            <p className="hero-lead">
              Browse, filter, create, edit, and delete dyslexia-adapted university study packs.
              Every module is dynamically rendered via React <code>.map()</code> with a unique{' '}
              <code>key=&#123;item.id&#125;</code> prop and persisted in <code>localStorage</code>.
            </p>
            <div className="stats-strip" style={{ marginTop: '1rem' }}>
              <div className="stat-item">
                <span className="stat-number">{items.length}</span>
                <span className="stat-label">Total Study Packs</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">{simplifiedCount}</span>
                <span className="stat-label">AI Simplified</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">{audioCount}</span>
                <span className="stat-label">Audio Enabled</span>
              </div>
            </div>
          </div>
          <div className="hero-visual">
            <img
              src="/images/library-study-cards.svg"
              alt="Illustration of organized dyslexia-friendly study cards with simplification and audio badges"
              width="480"
              height="340"
            />
          </div>
        </div>
      </section>

      {/* Interactive CRUD Form + Live Search & Filter */}
      <section className="section-block">
        <div className="section-header">
          <div>
            <span className="section-tag">React State &amp; Controlled Forms</span>
            <h2>Manage &amp; Filter Study Materials (CRUD)</h2>
          </div>
          <button type="button" className="btn btn-outline btn-sm" onClick={handleResetCatalog}>
            Restore Default Modules
          </button>
        </div>

        {statusBanner && (
          <div
            className={`status-banner ${
              statusBanner.type === 'error'
                ? 'error'
                : statusBanner.type === 'info'
                ? 'info'
                : 'success'
            }`}
            role="status"
          >
            {statusBanner.message}
          </div>
        )}

        <div className="crud-layout">
          {/* Left Panel: Create / Update Form */}
          <div className="form-panel">
            <h3>{editingItem ? `Edit Module: ${editingItem.title}` : 'Add New Study Material'}</h3>
            <p className="text-muted">
              {editingItem
                ? 'Modify any field below and submit to update this item in state and localStorage.'
                : 'Create a custom dyslexia-friendly study pack with AI text and audio tags.'}
            </p>

            <form onSubmit={handleSubmit} noValidate>
              <div className="form-group">
                <label htmlFor="crud-title">Module Title *</label>
                <input
                  type="text"
                  id="crud-title"
                  name="title"
                  className={`form-control ${
                    errors.title ? 'input-error' : formData.title.trim().length >= 3 ? 'input-valid' : ''
                  }`}
                  placeholder="e.g., Mitosis & Cell Division Overview"
                  value={formData.title}
                  onChange={handleInputChange}
                />
                {errors.title && <span className="field-error">{errors.title}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="crud-subject">Academic Subject *</label>
                <select
                  id="crud-subject"
                  name="subject"
                  className={`form-control ${
                    errors.subject ? 'input-error' : formData.subject ? 'input-valid' : ''
                  }`}
                  value={formData.subject}
                  onChange={handleInputChange}
                >
                  <option value="">Select subject...</option>
                  <option value="Biology 101">Biology 101</option>
                  <option value="Economics 204">Economics 204</option>
                  <option value="Computer Science">Computer Science</option>
                  <option value="Psychology 102">Psychology 102</option>
                  <option value="World History">World History</option>
                  <option value="Literature & Composition">Literature &amp; Composition</option>
                </select>
                {errors.subject && <span className="field-error">{errors.subject}</span>}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="crud-level">Reading Level *</label>
                  <select
                    id="crud-level"
                    name="readingLevel"
                    className={`form-control ${
                      errors.readingLevel ? 'input-error' : formData.readingLevel ? 'input-valid' : ''
                    }`}
                    value={formData.readingLevel}
                    onChange={handleInputChange}
                  >
                    <option value="">Select tier...</option>
                    <option value="Beginner">Beginner (Tier 1)</option>
                    <option value="Intermediate">Intermediate (Tier 2)</option>
                    <option value="Advanced">Advanced (Tier 3)</option>
                  </select>
                  {errors.readingLevel && <span className="field-error">{errors.readingLevel}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="crud-minutes">Est. Minutes *</label>
                  <input
                    type="number"
                    id="crud-minutes"
                    name="estimatedMinutes"
                    min="1"
                    max="300"
                    className={`form-control ${
                      errors.estimatedMinutes
                        ? 'input-error'
                        : formData.estimatedMinutes
                        ? 'input-valid'
                        : ''
                    }`}
                    placeholder="15"
                    value={formData.estimatedMinutes}
                    onChange={handleInputChange}
                  />
                  {errors.estimatedMinutes && (
                    <span className="field-error">{errors.estimatedMinutes}</span>
                  )}
                </div>
              </div>

              <div className="form-group">
                <label className="checkbox-group" htmlFor="crud-simplified">
                  <input
                    type="checkbox"
                    id="crud-simplified"
                    name="isSimplified"
                    checked={formData.isSimplified}
                    onChange={handleInputChange}
                  />
                  <span>Includes AI Text Simplification (Tiered Summary)</span>
                </label>

                <label
                  className="checkbox-group"
                  htmlFor="crud-audio"
                  style={{ marginTop: '0.5rem' }}
                >
                  <input
                    type="checkbox"
                    id="crud-audio"
                    name="audioAvailable"
                    checked={formData.audioAvailable}
                    onChange={handleInputChange}
                  />
                  <span>Includes AI Audio Narration &amp; Word Sync</span>
                </label>
              </div>

              <div className="cta-group">
                <button type="submit" className="btn btn-primary">
                  {editingItem ? 'Update Study Module' : 'Add Study Module'}
                </button>
                {editingItem && (
                  <button type="button" className="btn btn-outline" onClick={resetForm}>
                    Cancel Edit
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Right Panel: Live Search, Filter & Dynamic List */}
          <div>
            <div className="filter-bar" role="search" aria-label="Filter study materials">
              <div className="form-group">
                <label htmlFor="search-input">Live Keyword Search</label>
                <input
                  type="search"
                  id="search-input"
                  className="form-control"
                  placeholder="Search by title, subject, or level..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label htmlFor="category-filter">Support Modality</label>
                <select
                  id="category-filter"
                  className="form-control"
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                >
                  <option value="all">All Modalities ({items.length})</option>
                  <option value="simplified">AI Simplified Only</option>
                  <option value="audio">Audio Narration Only</option>
                  <option value="multimodal">Full Dual-Coding (Text + Audio)</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="level-filter">Reading Level</label>
                <select
                  id="level-filter"
                  className="form-control"
                  value={levelFilter}
                  onChange={(e) => setLevelFilter(e.target.value)}
                >
                  <option value="all">All Levels</option>
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>
            </div>

            {filteredItems.length === 0 ? (
              <div className="info-banner" style={{ textAlign: 'center', padding: '2rem' }}>
                <h3>No matching study modules found</h3>
                <p style={{ margin: '0.5rem auto 1rem' }}>
                  Try clearing your search query or switching the category filter back to &ldquo;All
                  Modalities&rdquo;.
                </p>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => {
                    setSearchQuery('');
                    setCategoryFilter('all');
                    setLevelFilter('all');
                  }}
                >
                  Clear All Filters
                </button>
              </div>
            ) : (
              <div className="card-grid two-col">
                {filteredItems.map((item) => (
                  <StudyMaterialCard
                    key={item.id}
                    item={item}
                    isEditing={Boolean(editingItem && editingItem.id === item.id)}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onNavigate={onNavigate}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
