import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import HeroSection from './components/HeroSection';
import FeatureCard from './components/FeatureCard';
import StudyMaterialLibrary from './components/StudyMaterialLibrary';
import AuthForm from './components/AuthForm';
import Footer from './components/Footer';

const CORE_FEATURES = [
  {
    id: 'feat-simplification',
    title: 'AI Text Simplification',
    description:
      'Transforms dense academic journal paragraphs into structured, plain-language bullet points and tiered reading levels powered by Google Gemini.',
    badge: 'Cognitive Load Reduction',
    icon: '/images/text-simplification-diagram.svg',
    ctaLabel: 'Explore Text Simplification',
    targetPage: 'simplification'
  },
  {
    id: 'feat-audio',
    title: 'Synchronized Audio Explanations',
    description:
      'Combines natural text-to-speech narration with real-time word-by-word highlighting and conversational AI concept breakdowns.',
    badge: 'Dual-Coding Modality',
    icon: '/images/audio-learning-headset.svg',
    ctaLabel: 'Explore Audio Tutor',
    targetPage: 'audio'
  },
  {
    id: 'feat-visual',
    title: 'Dyslexia Visual Comfort Tools',
    description:
      'Customizable warm paper tints, expanded letter tracking, generous 1.75 line spacing, and reading focus rulers that prevent visual crowding.',
    badge: 'Visual Ergonomics',
    icon: '/images/visual-typography-guide.svg',
    ctaLabel: 'Try Visual Tools',
    targetPage: 'visual'
  },
  {
    id: 'feat-library',
    title: 'Interactive Study Library (CRUD)',
    description:
      'Search, filter, create, edit, and delete adapted university study packs with live React state management and safe localStorage persistence.',
    badge: 'React Dynamic State',
    icon: '/images/library-study-cards.svg',
    ctaLabel: 'Open Study Library',
    targetPage: 'library'
  }
];

const SIMPLIFICATION_TIERS = {
  original: {
    label: 'Original Academic Text (High Lexical Density)',
    readingEase: 'Flesch-Kincaid Grade 16 (Graduate)',
    text: 'Phonological processing deficits in neurodivergent populations frequently manifest as attenuated orthographic-to-phonological mapping efficiency, thereby escalating extraneous working memory taxation during timed comprehension assessments.',
    takeaways: [
      'Uses complex multi-syllabic clinical terminology.',
      'Long subordinate clauses increase eye-tracking regressions.',
      'High cognitive load leaves less working memory for core concepts.'
    ]
  },
  intermediate: {
    label: 'Tier 2: Guided University Summary (Balanced)',
    readingEase: 'Flesch-Kincaid Grade 10 (Standard Undergrad)',
    text: 'Students with dyslexia often spend extra mental energy connecting written letters to speech sounds. During timed exams, this extra decoding effort can overload working memory and slow down reading comprehension.',
    takeaways: [
      'Preserves academic accuracy while splitting dense clauses.',
      'Highlights the cause-and-effect link between decoding and working memory.',
      'Ideal for lecture preparation and seminar discussion.'
    ]
  },
  essential: {
    label: 'Tier 1: Plain-Language Core Concept (Fast Scan)',
    readingEase: 'Flesch-Kincaid Grade 7 (Quick Overview)',
    text: 'Matching letters to sounds takes extra brainpower for readers with dyslexia. When text is clearer and shorter, students can focus on understanding the big ideas instead of getting stuck on long words.',
    takeaways: [
      'Short, direct sentences with familiar everyday vocabulary.',
      'Eliminates passive voice and nested clauses.',
      'Best for quick pre-reading before diving into technical chapters.'
    ]
  }
};

export default function App() {
  const [activePage, setActivePage] = useState('home');
  const [paperTint, setPaperTint] = useState('cream');
  const [selectedTier, setSelectedTier] = useState('intermediate');
  const [playbackSpeed, setPlaybackSpeed] = useState('1.0x');
  const [activeHighlightIndex, setActiveHighlightIndex] = useState(2);
  const [lineSpacingDemo, setLineSpacingDemo] = useState('1.8');

  // Homepage quick feedback form state
  const [feedback, setFeedback] = useState({ name: '', role: 'Student', message: '' });
  const [feedbackSent, setFeedbackSent] = useState(false);

  // Subtle live Express backend status check
  const [backendStatus, setBackendStatus] = useState('checking');

  useEffect(() => {
    let isMounted = true;
    async function checkBackendStatus() {
      try {
        const res = await fetch('http://localhost:3000/api/status');
        if (!res.ok) throw new Error('Status check failed');
        const data = await res.json();
        if (isMounted) {
          setBackendStatus(data.status === 'ok' ? 'online' : 'offline');
        }
      } catch {
        if (isMounted) {
          setBackendStatus('offline');
        }
      }
    }
    checkBackendStatus();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleNavigate = (pageId) => {
    setActivePage(pageId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFeedbackSubmit = (e) => {
    e.preventDefault();
    if (!feedback.name.trim() || !feedback.message.trim()) return;
    setFeedbackSent(true);
    setFeedback({ name: '', role: 'Student', message: '' });
  };

  const sampleWords = [
    'Cellular',
    'respiration',
    'converts',
    'glucose',
    'into',
    'usable',
    'ATP',
    'energy',
    'inside',
    'the',
    'mitochondria.'
  ];

  return (
    <div className={`app-shell theme-${paperTint}`}>
      <Header
        activePage={activePage}
        onNavigate={handleNavigate}
        paperTint={paperTint}
        onChangePaperTint={setPaperTint}
      />

      <main className="container" id="main-content">
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            marginTop: '0.75rem',
            marginBottom: '-0.25rem'
          }}
        >
          <span
            className={`badge ${
              backendStatus === 'online'
                ? 'badge-success'
                : backendStatus === 'offline'
                ? 'badge-warning'
                : 'badge-neutral'
            }`}
            title="Live status from GET http://localhost:3000/api/status"
          >
            {backendStatus === 'online'
              ? 'Backend API: Online (Port 3000)'
              : backendStatus === 'offline'
              ? 'Backend API: Offline (Start /server)'
              : 'Backend API: Checking...'}
          </span>
        </div>
        {/* ==================== 1. HOME VIEW ==================== */}
        {activePage === 'home' && (
          <div>
            <HeroSection
              badgeText="Inclusive University Learning Platform &bull; Lab 4 React Edition"
              title="Accessible Study Materials for Learners with Dyslexia"
              subtitle="LexiLearn reduces visual crowding and cognitive overload by combining warm dyslexia-friendly typography, AI-powered text simplification, and synchronized audio explanations."
              onNavigate={handleNavigate}
            />

            {/* Core Pillars Grid using reusable FeatureCard component */}
            <section className="section-block">
              <div className="section-header">
                <div>
                  <span className="section-tag">Modular React Components &amp; Props</span>
                  <h2>Core Dyslexia Support Features</h2>
                </div>
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  onClick={() => handleNavigate('library')}
                >
                  View All Study Packs &rarr;
                </button>
              </div>

              <div className="card-grid two-col">
                {CORE_FEATURES.map((feature) => (
                  <FeatureCard
                    key={feature.id}
                    title={feature.title}
                    description={feature.description}
                    badge={feature.badge}
                    icon={feature.icon}
                    ctaLabel={feature.ctaLabel}
                    onAction={() => handleNavigate(feature.targetPage)}
                  />
                ))}
              </div>
            </section>

            {/* Quick Accessibility Comparison Table */}
            <section className="section-block">
              <div className="section-header">
                <div>
                  <span className="section-tag">Evidence-Based Accessible Design</span>
                  <h2>How LexiLearn Improves Reading Comfort</h2>
                </div>
              </div>

              <div className="table-wrapper">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Reading Barrier</th>
                      <th>Traditional Textbook Layout</th>
                      <th>LexiLearn Dyslexia-Friendly Solution</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>
                        <strong>Visual Stress &amp; Glare</strong>
                      </td>
                      <td>Stark pure white (#FFFFFF) background with harsh black contrast</td>
                      <td>Warm cream (#FDFBF7), pastel yellow, sky blue, and sage paper tints</td>
                    </tr>
                    <tr>
                      <td>
                        <strong>Letter Crowding</strong>
                      </td>
                      <td>Cramped serif fonts, tight line height (1.2), justified ragged spacing</td>
                      <td>Left-aligned sans-serif typography, 1.75 line height, 68ch measure</td>
                    </tr>
                    <tr>
                      <td>
                        <strong>Lexical Overload</strong>
                      </td>
                      <td>Unbroken walls of dense academic jargon</td>
                      <td>Three-tier AI Text Simplification with key terminology callouts</td>
                    </tr>
                    <tr>
                      <td>
                        <strong>Decoding Fatigue</strong>
                      </td>
                      <td>Silent reading only with no multimodal pacing</td>
                      <td>Synchronized Audio Narration with word-by-word visual tracking</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            {/* Quick Learner Feedback Form */}
            <section className="section-block">
              <div className="form-panel">
                <span className="section-tag">Community Co-Design</span>
                <h2>Share Your Accessibility Feedback</h2>
                <p className="text-muted">
                  Help Bolat Alnur, Usser Aidana, and Nurbol Halyk refine LexiLearn for university courses.
                </p>

                {feedbackSent && (
                  <div className="status-banner success" role="status">
                    Thank you for your feedback! Your note has been recorded for the LexiLearn accessibility team.
                  </div>
                )}

                <form onSubmit={handleFeedbackSubmit}>
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="fb-name">Your Name *</label>
                      <input
                        id="fb-name"
                        type="text"
                        className="form-control"
                        placeholder="Enter your name"
                        value={feedback.name}
                        onChange={(e) => setFeedback({ ...feedback, name: e.target.value })}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="fb-role">Academic Role</label>
                      <select
                        id="fb-role"
                        className="form-control"
                        value={feedback.role}
                        onChange={(e) => setFeedback({ ...feedback, role: e.target.value })}
                      >
                        <option value="Student">University Student</option>
                        <option value="Instructor">Course Instructor</option>
                        <option value="Accessibility Specialist">Accessibility Specialist</option>
                      </select>
                    </div>
                  </div>
                  <div className="form-group">
                    <label htmlFor="fb-msg">Suggested Improvement or Course Topic *</label>
                    <textarea
                      id="fb-msg"
                      rows="3"
                      className="form-control"
                      placeholder="Tell us which textbook or feature would help your study workflow..."
                      value={feedback.message}
                      onChange={(e) => setFeedback({ ...feedback, message: e.target.value })}
                      required
                    />
                  </div>
                  <button type="submit" className="btn btn-primary">
                    Send Accessibility Feedback
                  </button>
                </form>
              </div>
            </section>
          </div>
        )}

        {/* ==================== 2. AI SIMPLIFICATION VIEW ==================== */}
        {activePage === 'simplification' && (
          <div>
            <section className="hero-section">
              <div className="hero-grid">
                <div className="hero-content">
                  <span className="hero-badge">Lead Author: Usser Aidana &bull; Powered by Google Gemini</span>
                  <h1>AI Text Simplification Engine</h1>
                  <p className="hero-lead">
                    Switch between three reading complexity tiers in real time. Our Gemini-powered
                    prompt pipeline restructures dense academic prose into digestible sentences while
                    preserving technical definitions required for university exams.
                  </p>
                </div>
                <div className="hero-visual">
                  <img
                    src="/images/text-simplification-diagram.svg"
                    alt="Diagram showing dense academic text converted into structured simplified tiers"
                    width="480"
                    height="340"
                  />
                </div>
              </div>
            </section>

            <section className="section-block">
              <div className="section-header">
                <div>
                  <span className="section-tag">Interactive React State Preview</span>
                  <h2>Compare Reading Complexity Tiers</h2>
                </div>
                <div className="cta-group" style={{ marginTop: 0 }}>
                  <button
                    type="button"
                    className={`btn btn-sm ${
                      selectedTier === 'original' ? 'btn-primary' : 'btn-outline'
                    }`}
                    onClick={() => setSelectedTier('original')}
                  >
                    Original Academic
                  </button>
                  <button
                    type="button"
                    className={`btn btn-sm ${
                      selectedTier === 'intermediate' ? 'btn-primary' : 'btn-outline'
                    }`}
                    onClick={() => setSelectedTier('intermediate')}
                  >
                    Tier 2: Guided Summary
                  </button>
                  <button
                    type="button"
                    className={`btn btn-sm ${
                      selectedTier === 'essential' ? 'btn-primary' : 'btn-outline'
                    }`}
                    onClick={() => setSelectedTier('essential')}
                  >
                    Tier 1: Plain Language
                  </button>
                </div>
              </div>

              <div className="form-panel">
                <div className="card-badges">
                  <span className="badge badge-primary">
                    {SIMPLIFICATION_TIERS[selectedTier].label}
                  </span>
                  <span className="badge badge-secondary">
                    {SIMPLIFICATION_TIERS[selectedTier].readingEase}
                  </span>
                </div>
                <blockquote
                  style={{
                    fontSize: '1.18rem',
                    lineHeight: '1.85',
                    padding: '1.25rem',
                    background: 'var(--bg-elevated)',
                    borderLeft: '5px solid var(--brand-primary)',
                    borderRadius: 'var(--radius-sm)',
                    margin: '1rem 0'
                  }}
                >
                  {SIMPLIFICATION_TIERS[selectedTier].text}
                </blockquote>

                <h3>Why This Tier Works:</h3>
                <ul className="feature-list">
                  {SIMPLIFICATION_TIERS[selectedTier].takeaways.map((point, idx) => (
                    <li key={idx}>{point}</li>
                  ))}
                </ul>
              </div>
            </section>
          </div>
        )}

        {/* ==================== 3. AUDIO SUPPORT VIEW ==================== */}
        {activePage === 'audio' && (
          <div>
            <section className="hero-section">
              <div className="hero-grid">
                <div className="hero-content">
                  <span className="hero-badge">Lead Author: Nurbol Halyk &bull; Dual-Coding Audio</span>
                  <h1>AI Audio Explanations &amp; Read-Aloud Sync</h1>
                  <p className="hero-lead">
                    Listening while following highlighted text engages both visual and auditory
                    pathways simultaneously. Click any word below or step through the sentence to
                    preview synchronized word tracking.
                  </p>
                </div>
                <div className="hero-visual">
                  <img
                    src="/images/audio-learning-headset.svg"
                    alt="Illustration of headphones and synchronized audio soundwaves"
                    width="480"
                    height="340"
                  />
                </div>
              </div>
            </section>

            <section className="section-block">
              <div className="form-panel">
                <div className="section-header">
                  <div>
                    <span className="section-tag">Interactive Word-Sync Simulator</span>
                    <h2>Synchronized Read-Aloud Preview</h2>
                  </div>
                  <div className="cta-group" style={{ marginTop: 0 }}>
                    {['0.75x', '1.0x', '1.25x'].map((speed) => (
                      <button
                        key={speed}
                        type="button"
                        className={`btn btn-sm ${
                          playbackSpeed === speed ? 'btn-primary' : 'btn-outline'
                        }`}
                        onClick={() => setPlaybackSpeed(speed)}
                      >
                        Speed: {speed}
                      </button>
                    ))}
                  </div>
                </div>

                <p className="text-muted">
                  Click on any word below or use the step buttons to simulate real-time TTS word
                  highlighting at <strong>{playbackSpeed}</strong> cadence:
                </p>

                <div
                  style={{
                    padding: '1.5rem',
                    background: 'var(--bg-elevated)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-color)',
                    fontSize: '1.3rem',
                    lineHeight: '2',
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '0.55rem'
                  }}
                >
                  {sampleWords.map((word, index) => {
                    const isCurrent = index === activeHighlightIndex;
                    return (
                      <button
                        key={word + index}
                        type="button"
                        onClick={() => setActiveHighlightIndex(index)}
                        style={{
                          padding: '0.2rem 0.6rem',
                          borderRadius: '6px',
                          border: isCurrent
                            ? '2px solid var(--brand-primary)'
                            : '1px solid transparent',
                          background: isCurrent ? 'var(--brand-accent-light)' : 'transparent',
                          color: 'var(--text-primary)',
                          fontWeight: isCurrent ? 800 : 500,
                          fontSize: 'inherit',
                          cursor: 'pointer'
                        }}
                      >
                        {word}
                      </button>
                    );
                  })}
                </div>

                <div className="cta-group" style={{ marginTop: '1.25rem' }}>
                  <button
                    type="button"
                    className="btn btn-outline btn-sm"
                    onClick={() =>
                      setActiveHighlightIndex((prev) =>
                        prev > 0 ? prev - 1 : sampleWords.length - 1
                      )
                    }
                  >
                    &larr; Previous Word
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    onClick={() =>
                      setActiveHighlightIndex((prev) => (prev + 1) % sampleWords.length)
                    }
                  >
                    Next Word &rarr;
                  </button>
                </div>
              </div>
            </section>
          </div>
        )}

        {/* ==================== 4. VISUAL TOOLS VIEW ==================== */}
        {activePage === 'visual' && (
          <div>
            <section className="hero-section">
              <div className="hero-grid">
                <div className="hero-content">
                  <span className="hero-badge">Visual Ergonomics &bull; Paper Overlay Controls</span>
                  <h1>Dyslexia-Friendly Typography &amp; Visual Tools</h1>
                  <p className="hero-lead">
                    Customize paper background tints and line spacing below to reduce Scotopic
                    Sensitivity (visual stress) and prevent line-skipping during long study sessions.
                  </p>
                </div>
                <div className="hero-visual">
                  <img
                    src="/images/visual-typography-guide.svg"
                    alt="Typography spacing and color tint guide for dyslexia accessibility"
                    width="480"
                    height="340"
                  />
                </div>
              </div>
            </section>

            <section className="section-block">
              <div className="form-panel">
                <h2>Interactive Typography &amp; Paper Tint Sandbox</h2>
                <p className="text-muted">
                  Test how paper tint overlays and expanded line height improve paragraph readability:
                </p>

                <div className="form-row" style={{ marginBottom: '1.25rem' }}>
                  <div className="form-group">
                    <label htmlFor="tint-select">Paper Tint Overlay</label>
                    <select
                      id="tint-select"
                      className="form-control"
                      value={paperTint}
                      onChange={(e) => setPaperTint(e.target.value)}
                    >
                      <option value="cream">Warm Cream (#FDFBF7 - Default)</option>
                      <option value="yellow">Soft Yellow (#FBF6D9 - High Comfort)</option>
                      <option value="blue">Calm Sky Blue (#EBF4FA - Reduced Glare)</option>
                      <option value="green">Gentle Sage (#EDF6EE - Soothing Contrast)</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="spacing-select">Line Spacing (Line-Height)</label>
                    <select
                      id="spacing-select"
                      className="form-control"
                      value={lineSpacingDemo}
                      onChange={(e) => setLineSpacingDemo(e.target.value)}
                    >
                      <option value="1.5">1.5x (Standard Accessible)</option>
                      <option value="1.8">1.8x (Recommended Dyslexia Comfort)</option>
                      <option value="2.1">2.1x (Extra Wide Line Separation)</option>
                    </select>
                  </div>
                </div>

                <div
                  style={{
                    padding: '1.5rem',
                    background: 'var(--bg-primary)',
                    border: '2px solid var(--brand-primary)',
                    borderRadius: 'var(--radius-md)',
                    lineHeight: lineSpacingDemo,
                    letterSpacing: '0.03em'
                  }}
                >
                  <h3 style={{ marginBottom: '0.5rem' }}>Sample Adapted Biology Passage</h3>
                  <p style={{ marginBottom: 0 }}>
                    Mitochondria act as the power stations of eukaryotic cells. By breaking down
                    glucose molecules through cellular respiration, they synthesize adenosine
                    triphosphate (ATP)—the chemical energy currency that fuels muscle contraction,
                    active transport, and neural signaling.
                  </p>
                </div>
              </div>
            </section>
          </div>
        )}

        {/* ==================== 5. STUDY LIBRARY (CRUD) VIEW ==================== */}
        {activePage === 'library' && <StudyMaterialLibrary onNavigate={handleNavigate} />}

        {/* ==================== 6. ABOUT & TEAM VIEW ==================== */}
        {activePage === 'about' && (
          <div>
            <section className="hero-section">
              <div className="hero-grid">
                <div className="hero-content">
                  <span className="hero-badge">Project Mission &amp; React Architecture</span>
                  <h1>About LexiLearn &amp; Team Contributions</h1>
                  <p className="hero-lead">
                    LexiLearn was created by <strong>Bolat Alnur</strong>,{' '}
                    <strong>Usser Aidana</strong>, and <strong>Nurbol Halyk</strong> to bridge the
                    accessibility gap in higher education through humane typography and AI study
                    scaffolding.
                  </p>
                </div>
                <div className="hero-visual">
                  <img
                    src="/images/team-architecture-map.svg"
                    alt="Architecture map of the LexiLearn React component hierarchy"
                    width="480"
                    height="340"
                  />
                </div>
              </div>
            </section>

            <section className="section-block">
              <h2>Team Member Responsibilities (Lab 1 &rarr; Lab 4 React)</h2>
              <div className="card-grid">
                <article className="card">
                  <div className="card-badges">
                    <span className="badge badge-primary">Team Lead &amp; UI Architecture</span>
                  </div>
                  <h3>Bolat Alnur</h3>
                  <p>
                    Designed the dyslexia-friendly CSS design system, reading comfort bar,{' '}
                    <code>Header.jsx</code>, <code>HeroSection.jsx</code>, and interactive Visual
                    Reading Tools.
                  </p>
                </article>

                <article className="card">
                  <div className="card-badges">
                    <span className="badge badge-secondary">AI Simplification &amp; Auth</span>
                  </div>
                  <h3>Usser Aidana</h3>
                  <p>
                    Architected the three-tier AI Text Simplification preview, reusable{' '}
                    <code>FeatureCard.jsx</code>, and <code>AuthForm.jsx</code> with live regex,
                    age &ge; 13, and password validation.
                  </p>
                </article>

                <article className="card">
                  <div className="card-badges">
                    <span className="badge badge-accent">Audio Sync &amp; CRUD Library</span>
                  </div>
                  <h3>Nurbol Halyk</h3>
                  <p>
                    Built the synchronized Audio Read-Aloud simulator,{' '}
                    <code>StudyMaterialCard.jsx</code>, and <code>StudyMaterialLibrary.jsx</code>{' '}
                    with full React CRUD and <code>localStorage</code> persistence.
                  </p>
                </article>
              </div>
            </section>
          </div>
        )}

        {/* ==================== 7. AUTHENTICATION VIEW ==================== */}
        {activePage === 'auth' && <AuthForm onNavigate={handleNavigate} />}
      </main>

      <Footer onNavigate={handleNavigate} />
    </div>
  );
}
