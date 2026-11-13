const express = require('express');
const cors = require('cors');
const { initialMaterials } = require('./data');
const { validateMaterialPayload } = require('./validators');

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

// 1. Health / Status endpoint
app.get('/api/status', (req, res) => {
  res.json({ status: 'ok' });
});

// 2. Hello endpoint
app.get('/api/hello', (req, res) => {
  res.json({ message: 'Hello from LexiLearn API' });
});

// 3. List materials with optional ?search=... query filtering by title or subject/topic
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

// 4. Get single material by ID using .find()
app.get('/api/materials/:id', (req, res) => {
  const targetId = req.params.id;
  const found = materials.find((item) => String(item.id) === String(targetId));

  if (!found) {
    return res.status(404).json({ error: `Study material with id "${targetId}" not found.` });
  }

  return res.json(found);
});

// 5. Create new material with validation and unique Date.now() ID
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

// 6. Update existing material by ID
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

// 7. Delete material by ID using .filter()
app.delete('/api/materials/:id', (req, res) => {
  const targetId = req.params.id;
  const exists = materials.some((item) => String(item.id) === String(targetId));

  if (!exists) {
    return res.status(404).json({ error: `Study material with id "${targetId}" not found.` });
  }

  materials = materials.filter((item) => String(item.id) !== String(targetId));
  return res.json({ message: 'Study material deleted.', id: targetId });
});

app.listen(PORT, () => {
  console.log(`LexiLearn Express API server running on http://localhost:${PORT}`);
});
