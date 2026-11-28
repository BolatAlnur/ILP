// AI Simplification Service using Transformers.js (or optional Hugging Face Hosted Inference via .env)

let summarizerPromise = null;

async function getTransformersSummarizer() {
  if (!summarizerPromise) {
    const modelName = process.env.AI_MODEL || 'Xenova/t5-small';
    console.log(`[AI] Loading Transformers.js summarization model: ${modelName}...`);
    summarizerPromise = import('@huggingface/transformers').then(({ pipeline }) =>
      pipeline('summarization', modelName, { dtype: 'q8' })
    );
  }
  return summarizerPromise;
}

function splitIntoDyslexiaBullets(summaryText) {
  return String(summaryText || '')
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

async function simplifyStudyText({ text, topic, readingLevel }) {
  const cleanText = String(text || '').trim();
  const modelName = process.env.AI_MODEL || 'Xenova/t5-small';
  const provider = (process.env.AI_PROVIDER || 'transformers').toLowerCase();
  const hfToken = process.env.HF_API_TOKEN;

  // Optional Hugging Face Hosted Inference path if explicitly configured with a backend token in .env
  if (provider === 'huggingface' && hfToken) {
    const response = await fetch(
      `https://router.huggingface.co/hf-inference/models/${modelName}`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${hfToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          inputs: cleanText,
          parameters: {
            max_new_tokens: readingLevel === 'Beginner' ? 60 : 95,
            min_new_tokens: 20
          }
        })
      }
    );

    if (!response.ok) {
      const err = new Error(`Hugging Face Inference API responded with status ${response.status}.`);
      err.statusCode = 502;
      throw err;
    }

    const result = await response.json();
    const summaryText = Array.isArray(result) && result[0]?.summary_text
      ? result[0].summary_text.trim()
      : cleanText;

    return {
      topic: topic || 'Study Passage',
      readingLevel: readingLevel || 'Beginner',
      simplifiedSummary: summaryText,
      keyTakeaways: splitIntoDyslexiaBullets(summaryText),
      modelUsed: modelName,
      provider: 'Hugging Face Hosted Inference'
    };
  }

  // Default: Local Transformers.js pipeline (zero external token required)
  const summarizer = await getTransformersSummarizer();
  const maxNewTokens = readingLevel === 'Beginner' ? 60 : 95;
  const output = await summarizer(cleanText, {
    max_new_tokens: maxNewTokens,
    min_new_tokens: 18
  });

  const summaryText =
    Array.isArray(output) && output[0]?.summary_text ? output[0].summary_text.trim() : cleanText;

  return {
    topic: topic || 'Study Passage',
    readingLevel: readingLevel || 'Beginner',
    simplifiedSummary: summaryText,
    keyTakeaways: splitIntoDyslexiaBullets(summaryText),
    modelUsed: modelName,
    provider: 'Transformers.js (Local Node)'
  };
}

module.exports = {
  simplifyStudyText
};
