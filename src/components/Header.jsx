import React from 'react';

const NAV_ITEMS = [
  { id: 'home', label: 'Home' },
  { id: 'simplification', label: 'AI Simplification' },
  { id: 'audio', label: 'Audio Support' },
  { id: 'visual', label: 'Visual Tools' },
  { id: 'library', label: 'Study Library (CRUD)' },
  { id: 'about', label: 'About & Team' },
  { id: 'auth', label: 'Account / Sign In' },
];

const PAPER_TINTS = [
  { id: 'cream', label: 'Warm Cream (#FDFBF7)' },
  { id: 'yellow', label: 'Soft Amber (#FFF9DB)' },
  { id: 'blue', label: 'Calm Sky (#EBF5FB)' },
  { id: 'green', label: 'Mint Sage (#EAFAF1)' },
];

export default function Header({ activePage, onNavigate, paperTint, onChangePaperTint }) {
  const currentTintLabel =
    PAPER_TINTS.find((t) => t.id === paperTint)?.label || 'Warm Cream (#FDFBF7)';

  return (
    <>
      <div className="a11y-bar" role="region" aria-label="Reading Comfort Bar">
        <div className="container a11y-bar-inner">
          <span>
            <strong>Reading Mode:</strong> {currentTintLabel} &bull; High-Readability Sans-Serif &bull; 1.75x Line Spacing
          </span>
          <div className="a11y-controls">
            {PAPER_TINTS.map((tint) => (
              <button
                key={tint.id}
                type="button"
                className={`icon-btn ${paperTint === tint.id ? 'icon-btn-active' : ''}`}
                onClick={() => onChangePaperTint(tint.id)}
                aria-label={`Switch paper background tint to ${tint.label}`}
              >
                {tint.id.charAt(0).toUpperCase() + tint.id.slice(1)}
              </button>
            ))}
            <button
              type="button"
              className="icon-btn"
              onClick={() => onNavigate('visual')}
              aria-label="Customize typography and color overlays"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" role="img" aria-label="Typography settings icon">
                <path d="M4 7V4h16v3M9 20h6M12 4v16" />
              </svg>
              <span>Visual Tools</span>
            </button>
          </div>
        </div>
      </div>

      <header className="site-header">
        <div className="container header-inner">
          <button
            type="button"
            className="brand-logo"
            onClick={() => onNavigate('home')}
            aria-label="LexiLearn Homepage"
          >
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none" role="img" aria-label="LexiLearn Open Book Emblem">
              <rect width="40" height="40" rx="8" fill="#1B5E7B" />
              <path d="M10 13C10 11.8954 10.8954 11 12 11H18C19.1046 11 20 11.8954 20 13V29C20 27.8954 19.1046 27 18 27H12C10.8954 27 10 26.1046 10 25V13Z" fill="#FFF9DB" />
              <path d="M30 13C30 11.8954 29.1046 11 28 11H22C20.8954 11 20 11.8954 20 13V29C20 27.8954 20.8954 27 22 27H28C29.1046 27 30 26.1046 30 25V13Z" fill="#D96B27" />
            </svg>
            <div>
              <span className="brand-title">LexiLearn</span>
              <span className="brand-tagline">Inclusive Dyslexia-Friendly Learning</span>
            </div>
          </button>

          <nav className="main-nav" aria-label="Primary Navigation">
            <ul>
              {NAV_ITEMS.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    className={`nav-btn ${activePage === item.id ? 'nav-btn-active' : ''}`}
                    aria-current={activePage === item.id ? 'page' : undefined}
                    onClick={() => onNavigate(item.id)}
                  >
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </header>
    </>
  );
}
