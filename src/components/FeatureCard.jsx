import React from 'react';

export default function FeatureCard({ title, description, badge, icon, ctaLabel, onAction }) {
  return (
    <div className="card">
      <div>
        {badge && <span className="badge">{badge}</span>}
        <div className="card-header">
          <span className="card-icon" aria-label={`${title} icon`}>
            {icon}
          </span>
          <h3>{title}</h3>
        </div>
        <p>{description}</p>
      </div>
      <div className="card-footer">
        <button
          type="button"
          className="icon-btn"
          onClick={onAction}
          aria-label={ctaLabel || `Explore ${title}`}
        >
          {ctaLabel || `Explore ${title}`} &rarr;
        </button>
      </div>
    </div>
  );
}
