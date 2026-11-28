require('dotenv').config();

const express = require('express');
const cors = require('cors');
const { initialMaterials } = require('./data');
const { validateMaterialPayload } = require('./validators');
const { fetchTopicSummary } = require('./externalApi');
const { simplifyStudyText } = require('./aiService');

const app = express();
const PORT = process.env.PORT || 3000;

// In-memory store initialized from custom CommonJS module
let materials = initialMaterials.map((item) => ({ ...item }));

// Middleware: Enable CORS for Vite frontend (http://localhost:5173) and parse JSON
app.use(
  cors({
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173']
  })
);
app.use(express.json());

// Logging middleware: logs HTTP method and path on every request
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// ==================== PART 1: REST API ENDPOINTS ====================

// Health / Status endpoint
app.get('/api/status', (req, res) => {
  res.json({
    status: 'ok',
    aiModel: process.env.AI_MODEL || 'Xenova/t5-small'
  });
});

// Hello endpoint
app.get('/api/hello', (req, res) => {
  res.json({ message: 'Hello from LexiLearn API' });
});

// List materials with optional ?search=... query filtering by title, subject, or level
function handleGetMaterials(req, res) {
  const search = typeof req.query.search === 'string' ? req.query.search.trim().toLowerCase() : '';

  if (!search) {
    return res.json(materials);
  }

  const filtered = materials.filter(
    (item) =>
      item.title.toLowerCase().includes(search) ||
      item.subject.toLowerCase().includes(search) ||
      item.readingLevel.toLowerCase().includes(search)
  );

  return res.json(filtered);
}

app.get('/api/materials', handleGetMaterials);
app.get('/api/items', handleGetMaterials);

// Get single material by ID using .find()
app.get('/api/materials/:id', (req, res) => {
  const targetId = req.params.id;
  const found = materials.find((item) => String(item.id) === String(targetId));

  if (!found) {
    return res.status(404).json({ error: `Study material with id "${targetId}" not found.` });
  }

  return res.json(found);
});

// Create new material with validation and unique Date.now() ID
app.post('/api/materials', (req, res) => {
  const validation = validateMaterialPayload(req.body);

  if (!validation.valid) {
    return res.status(400).json({
      error: validation.errors[0],
      details: validation.errors
    });
  }

  const newMaterial = {
    id: Date.now(),
    ...validation.sanitized
  };

  materials = [newMaterial, ...materials];
  return res.status(201).json(newMaterial);
});

// Update existing material by ID
app.put('/api/materials/:id', (req, res) => {
  const targetId = req.params.id;
  const existing = materials.find((item) => String(item.id) === String(targetId));

  if (!existing) {
    return res.status(404).json({ error: `Study material with id "${targetId}" not found.` });
  }

  const validation = validateMaterialPayload(req.body);
  if (!validation.valid) {
    return res.status(400).json({
      error: validation.errors[0],
      details: validation.errors
    });
  }

  const updatedMaterial = {
    ...existing,
    ...validation.sanitized
  };

  materials = materials.map((item) =>
    String(item.id) === String(targetId) ? updatedMaterial : item
  );

  return res.json(updatedMaterial);
});

// Partial update (PATCH) for toggling accessibility flags (isSimplified / audioAvailable)
app.patch('/api/materials/:id/flags', (req, res) => {
  const targetId = req.params.id;
  const existing = materials.find((item) => String(item.id) === String(targetId));

  if (!existing) {
    return res.status(404).json({ error: `Study material with id "${targetId}" not found.` });
  }

  const { isSimplified, audioAvailable } = req.body || {};
  if (typeof isSimplified !== 'boolean' && typeof audioAvailable !== 'boolean') {
    return res.status(400).json({
      error: 'Provide at least one boolean flag ("isSimplified" or "audioAvailable") to update.'
    });
  }

  const updated = {
    ...existing,
    isSimplified: typeof isSimplified === 'boolean' ? isSimplified : existing.isSimplified,
    audioAvailable: typeof audioAvailable === 'boolean' ? audioAvailable : existing.audioAvailable
  };

  materials = materials.map((item) =>
    String(item.id) === String(targetId) ? updated : item
  );

  return res.json(updated);
});

// Delete material by ID using .filter()
app.delete('/api/materials/:id', (req, res) => {
  const targetId = req.params.id;
  const exists = materials.some((item) => String(item.id) === String(targetId));

  if (!exists) {
    return res.status(404).json({ error: `Study material with id "${targetId}" not found.` });
  }

  materials = materials.filter((item) => String(item.id) !== String(targetId));
  return res.json({ message: 'Study material deleted.', id: targetId });
});

// ==================== PART 2: EXTERNAL PUBLIC API ====================

// GET /api/external/topic?q=Cellular+respiration
app.get('/api/external/topic', async (req, res) => {
  const topic = typeof req.query.q === 'string' ? req.query.q.trim() : '';

  if (topic.length < 2) {
    return res.status(400).json({
      error: 'Query parameter "q" must be at least 2 characters long.'
    });
  }

  try {
    const summaryData = await fetchTopicSummary(topic);
    return res.json(summaryData);
  } catch (err) {
    const status = err.statusCode || 502;
    return res.status(status).json({
      error: err.message || 'Failed to fetch data from external Wikipedia API.'
    });
  }
});

// ==================== PART 3: AI SIMPLIFICATION ENDPOINT ====================

// POST /api/ai/simplify
app.post('/api/ai/simplify', async (req, res) => {
  const { text, topic, readingLevel } = req.body || {};
  const cleanText = typeof text === 'string' ? text.trim() : '';

  if (cleanText.length < 30) {
    return res.status(400).json({
      error: 'Please provide at least 30 characters of study text to simplify with AI.'
    });
  }

  try {
    const aiResult = await simplifyStudyText({
      text: cleanText,
      topic: typeof topic === 'string' ? topic.trim() : 'Study Passage',
      readingLevel: typeof readingLevel === 'string' ? readingLevel.trim() : 'Beginner'
    });
    return res.json(aiResult);
  } catch (err) {
    console.error('AI simplification error:', err);
    const status = err.statusCode || 500;
    return res.status(status).json({
      error: err.message || 'AI simplification failed on the server.'
    });
  }
});

app.listen(PORT, () => {
  console.log(`LexiLearn Express API server running on http://localhost:${PORT}`);
});
