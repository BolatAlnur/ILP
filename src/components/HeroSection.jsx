import React from 'react';

export default function HeroSection({ title, subtitle, badgeText, onNavigate }) {
  return (
    <section className="hero-section" aria-labelledby="hero-heading">
      <div className="hero-grid">
        <div className="hero-content">
          <span className="badge">
            {badgeText || 'Powered by Google Gemini AI & Universal Design'}
          </span>
          <h1 id="hero-heading">{title}</h1>
          <p>{subtitle}</p>
          <p>
            Explore our evidence-based literacy tools built around the research of the{' '}
            <a
              href="https://dyslexiaida.org/"
              target="_blank"
              rel="noopener noreferrer"
            >
              International Dyslexia Association (IDA)
            </a>
            .
          </p>
          <div className="cta-group">
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => onNavigate('simplification')}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                role="img"
                aria-label="Sparkles AI icon"
              >
                <path d="M12 3l1.912 5.813a2 2 0 001.275 1.275L21 12l-5.813 1.912a2 2 0 00-1.275 1.275L12 21l-1.912-5.813a2 2 0 00-1.275-1.275L3 12l5.813-1.912a2 2 0 001.275-1.275L12 3z" />
              </svg>
              Try AI Text Simplifier Preview
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => onNavigate('library')}
            >
              Manage Study Library (CRUD)
            </button>
            <button
              type="button"
              className="btn btn-accent"
              onClick={() => onNavigate('auth')}
            >
              Learner Register / Sign In
            </button>
          </div>
        </div>
        <div className="hero-visual">
          <img
            src="/images/dyslexia-reading.svg"
            alt="Illustration of the LexiLearn dyslexia-friendly workspace showing a warm cream reading pane alongside Gemini AI bullet summaries and audio tutor controls"
          />
        </div>
      </div>
    </section>
  );
}
