// External Public API integration: Wikipedia REST Summary API
// Called strictly from the backend so headers/config stay server-side and only useful fields are returned.

async function fetchTopicSummary(topic) {
  const cleanTopic = String(topic || '').trim();
  const slug = cleanTopic.replace(/\s+/g, '_');
  const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(slug)}`;

  const userAgent =
    process.env.EXTERNAL_API_USER_AGENT || 'LexiLearnApp/1.0 (inclusive-learning-project)';

  const response = await fetch(url, {
    headers: {
      'User-Agent': userAgent,
      Accept: 'application/json'
    }
  });

  if (response.status === 404) {
    const err = new Error(`No Wikipedia summary found for topic "${cleanTopic}".`);
    err.statusCode = 404;
    throw err;
  }

  if (!response.ok) {
    const err = new Error(`External Wikipedia API failed with status ${response.status}.`);
    err.statusCode = 502;
    throw err;
  }

  const raw = await response.json();

  // Return ONLY useful fields to the frontend
  return {
    title: raw.title || cleanTopic,
    description: raw.description || 'Academic reference topic',
    extract: raw.extract || '',
    thumbnailUrl: raw.thumbnail?.source || null,
    sourceUrl: raw.content_urls?.desktop?.page || `https://en.wikipedia.org/wiki/${encodeURIComponent(slug)}`
  };
}

module.exports = {
  fetchTopicSummary
};
