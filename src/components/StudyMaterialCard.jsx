import React from 'react';

export default function StudyMaterialCard({ item, isEditing, onEdit, onDelete, onNavigate }) {
  const cardClasses = ['card'];
  if (item.isSimplified) {
    cardClasses.push('card-simplified-accent');
  }
  if (item.audioAvailable) {
    cardClasses.push('card-audio-accent');
  }
  if (isEditing) {
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

  return (
    <article className={cardClasses.join(' ')} data-id={item.id}>
      <div>
        <div className="badge-row">
          <span className={levelBadgeClass}>{item.readingLevel}</span>
          {item.isSimplified ? (
            <span className="badge">Gemini Simplified</span>
          ) : (
            <span className="badge badge-neutral">Standard Text</span>
          )}
          {item.audioAvailable ? (
            <span className="badge badge-success">Audio Tutor Ready</span>
          ) : (
            <span className="badge badge-neutral">No Audio Track</span>
          )}
        </div>
        <h3>{item.title}</h3>
        <p>
          <strong>Subject:</strong> {item.subject} &bull;{' '}
          <strong>Est. Study Time:</strong> {Number(item.estimatedMinutes)} mins
        </p>
        <ul>
          <li>
            {item.isSimplified
              ? 'Active-voice bullet points & key-term glossary included'
              : 'Original course text awaiting AI simplification'}
          </li>
          <li>
            {item.audioAvailable
              ? 'Synchronized 0.9x conversational audio walkthrough available'
              : 'Written reading guide only (audio narration pending)'}
          </li>
        </ul>
      </div>

      <div className="card-footer">
        <div className="a11y-controls">
          <button
            type="button"
            className="icon-btn"
            onClick={() => onNavigate('simplification')}
            aria-label={`Open ${item.title} in Simplifier`}
          >
            Read
          </button>
          {item.audioAvailable && (
            <button
              type="button"
              className="icon-btn"
              onClick={() => onNavigate('audio')}
              aria-label={`Listen to ${item.title}`}
            >
              Audio
            </button>
          )}
        </div>
        <div className="a11y-controls">
          <button
            type="button"
            className="icon-btn"
            onClick={() => onEdit(item)}
            aria-label={`Edit ${item.title}`}
          >
            Edit
          </button>
          <button
            type="button"
            className="icon-btn btn-danger-outline"
            onClick={() => onDelete(item.id)}
            aria-label={`Delete ${item.title}`}
          >
            Delete
          </button>
        </div>
      </div>
    </article>
  );
}
