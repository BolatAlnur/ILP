import React from 'react';

export default function Footer({ onNavigate }) {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-col">
            <h3>LexiLearn Inclusive Platform</h3>
            <p>
              Designed with dyslexia-accessible warm cream paper contrast, generous line spacing,
              AI text simplification concepts, and synchronized audio explanations for university
              learners.
            </p>
          </div>

          <div className="footer-col">
            <h3>Quick Navigation</h3>
            <ul className="footer-links">
              <li>
                <button type="button" onClick={() => onNavigate('home')}>
                  Home &amp; Overview
                </button>
              </li>
              <li>
                <button type="button" onClick={() => onNavigate('simplification')}>
                  AI Text Simplification
                </button>
              </li>
              <li>
                <button type="button" onClick={() => onNavigate('audio')}>
                  AI Audio Explanations
                </button>
              </li>
              <li>
                <button type="button" onClick={() => onNavigate('visual')}>
                  Visual Reading Tools
                </button>
              </li>
              <li>
                <button type="button" onClick={() => onNavigate('library')}>
                  Study Materials Library (CRUD)
                </button>
              </li>
              <li>
                <button type="button" onClick={() => onNavigate('auth')}>
                  Learner Registration &amp; Login
                </button>
              </li>
            </ul>
          </div>

          <div className="footer-col">
            <h3>Project Authors (Lab 4 React)</h3>
            <ul className="footer-links">
              <li>
                <strong>Bolat Alnur</strong> &mdash; Homepage, Hero &amp; Visual Reading Tools
              </li>
              <li>
                <strong>Usser Aidana</strong> &mdash; AI Simplification &amp; Auth Validation
              </li>
              <li>
                <strong>Nurbol Halyk</strong> &mdash; Audio Support &amp; Study Library CRUD
              </li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <span>&copy; 2026 LexiLearn University Web Development Project (Lab 4: Vite + React)</span>
          <span>Authors: Bolat Alnur &bull; Usser Aidana &bull; Nurbol Halyk</span>
        </div>
      </div>
    </footer>
  );
}
