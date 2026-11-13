// Custom CommonJS module for validating study material API payloads

function validateMaterialPayload(body) {
  const errors = [];

  if (!body || typeof body !== 'object') {
    return {
      valid: false,
      errors: ['Request body must be a valid JSON object.']
    };
  }

  const title = typeof body.title === 'string' ? body.title.trim() : '';
  const subject = typeof body.subject === 'string' ? body.subject.trim() : '';
  const readingLevel =
    typeof body.readingLevel === 'string' && body.readingLevel.trim()
      ? body.readingLevel.trim()
      : 'Beginner';
  const estimatedMinutes =
    body.estimatedMinutes !== undefined && body.estimatedMinutes !== ''
      ? Number(body.estimatedMinutes)
      : 15;

  if (!title) {
    errors.push('Field "title" is required and cannot be empty.');
  } else if (title.length < 3) {
    errors.push('Field "title" must be at least 3 characters long.');
  }

  if (!subject) {
    errors.push('Field "subject" is required and cannot be empty.');
  }

  if (Number.isNaN(estimatedMinutes) || estimatedMinutes < 1 || estimatedMinutes > 300) {
    errors.push('Field "estimatedMinutes" must be a number between 1 and 300.');
  }

  return {
    valid: errors.length === 0,
    errors,
    sanitized: {
      title,
      subject,
      readingLevel,
      estimatedMinutes,
      isSimplified: Boolean(body.isSimplified),
      audioAvailable: Boolean(body.audioAvailable)
    }
  };
}

module.exports = {
  validateMaterialPayload
};
