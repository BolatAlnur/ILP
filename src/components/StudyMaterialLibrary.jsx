import React, { useState, useEffect, useCallback } from 'react';
import StudyMaterialCard from './StudyMaterialCard';

const API_BASE_URL = 'http://localhost:3000/api';

export default function StudyMaterialLibrary({ onNavigate }) {
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [apiError, setApiError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const fetchMaterials = useCallback(async () => {
    setIsLoading(true);
    setApiError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/materials`);
      if (!response.ok) {
        throw new Error(`Server responded with status ${response.status}`);
      }
      const data = await response.json();
      setItems(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch study materials:', err);
      setApiError('Load failed: could not connect to backend server');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMaterials();
  }, [fetchMaterials]);

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

  const handleSubmit = async (e) => {
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

    const payload = {
      title: formData.title.trim(),
      subject: formData.subject,
      readingLevel: formData.readingLevel,
      estimatedMinutes: Number(formData.estimatedMinutes),
      isSimplified: Boolean(formData.isSimplified),
      audioAvailable: Boolean(formData.audioAvailable)
    };

    setIsSubmitting(true);
    try {
      if (editingItem) {
        const response = await fetch(`${API_BASE_URL}/materials/${editingItem.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || 'Failed to update study module.');
        }

        setItems((prev) =>
          prev.map((item) => (String(item.id) === String(editingItem.id) ? data : item))
        );
        setStatusBanner({
          type: 'success',
          message: `Updated study module "${data.title}" on the Express API.`
        });
      } else {
        const response = await fetch(`${API_BASE_URL}/materials`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || 'Failed to create study module.');
        }

        setItems((prev) => [data, ...prev]);
        setStatusBanner({
          type: 'success',
          message: `Created new study module "${data.title}" via POST /api/materials.`
        });
      }

      setApiError(null);
      resetForm();
    } catch (err) {
      console.error('Error saving study module:', err);
      setStatusBanner({
        type: 'error',
        message: `Save failed: ${err.message || 'could not connect to backend server'}`
      });
    } finally {
      setIsSubmitting(false);
    }
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

  const handleDelete = async (id) => {
    const target = items.find((item) => String(item.id) === String(id));
    if (!target) return;

    try {
      const response = await fetch(`${API_BASE_URL}/materials/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `Delete failed with status ${response.status}`);
      }

      setItems((prev) => prev.filter((item) => String(item.id) !== String(id)));

      if (editingItem && String(editingItem.id) === String(id)) {
        resetForm();
      }

      setStatusBanner({
        type: 'success',
        message: `Deleted "${target.title}" via DELETE /api/materials/${id}.`
      });
    } catch (err) {
      console.error('Error deleting study module:', err);
      setStatusBanner({
        type: 'error',
        message: `Delete failed: ${err.message || 'could not connect to backend server'}`
      });
    }
  };

  const handleReloadFromServer = () => {
    resetForm();
    setSearchQuery('');
    setCategoryFilter('all');
    setLevelFilter('all');
    setStatusBanner(null);
    fetchMaterials();
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
            <span className="hero-badge">Express REST API &bull; React Fetch Integration</span>
            <h1>Adapted Study Materials Library</h1>
            <p className="hero-lead">
              Browse, filter, create, edit, and delete dyslexia-adapted university study packs
              connected to our Node.js + Express backend (<code>http://localhost:3000/api/materials</code>).
              Every module is dynamically rendered via React <code>.map()</code> with a unique{' '}
              <code>key=&#123;item.id&#125;</code> prop.
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
          <button type="button" className="btn btn-outline btn-sm" onClick={handleReloadFromServer}>
            Refresh from Server
          </button>
        </div>

        {apiError && (
          <div
            className="status-banner error"
            role="alert"
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '0.75rem'
            }}
          >
            <span>
              <strong>{apiError}</strong> &mdash; Make sure the Express server is running on{' '}
              <code>http://localhost:3000</code> (<code>cd server &amp;&amp; npm start</code>).
            </span>
            <button type="button" className="btn btn-outline btn-sm" onClick={fetchMaterials}>
              Retry Connection
            </button>
          </div>
        )}

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
                <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                  {isSubmitting
                    ? 'Saving...'
                    : editingItem
                    ? 'Update Study Module'
                    : 'Add Study Module'}
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

            {isLoading ? (
              <div className="info-banner" role="status" style={{ textAlign: 'center', padding: '2rem' }}>
                <h3>Loading study materials...</h3>
                <p style={{ margin: '0.5rem auto 0' }}>
                  Fetching dyslexia-friendly modules from <code>http://localhost:3000/api/materials</code>.
                </p>
              </div>
            ) : apiError && items.length === 0 ? (
              <div className="info-banner" role="alert" style={{ textAlign: 'center', padding: '2rem' }}>
                <h3>Unable to load study modules</h3>
                <p style={{ margin: '0.5rem auto 1rem' }}>
                  {apiError}. Start the backend server with <code>cd server &amp;&amp; npm start</code>{' '}
                  and click Retry.
                </p>
                <button type="button" className="btn btn-primary btn-sm" onClick={fetchMaterials}>
                  Retry API Request
                </button>
              </div>
            ) : filteredItems.length === 0 ? (
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
