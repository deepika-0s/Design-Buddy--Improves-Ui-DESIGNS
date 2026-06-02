require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const rateLimit = require('express-rate-limit');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { initDb } = require('./db');

const app = express();
const PORT = process.env.PORT || 3001;
const MAX_MB = parseInt(process.env.MAX_FILE_SIZE_MB || '10');
const MAX_IMGS = parseInt(process.env.MAX_IMAGES_PER_REQUEST || '5');

// Google Gemini client
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true }));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 30, message: { error: 'Too many requests.' } }));

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_MB * 1024 * 1024, files: MAX_IMGS },
  fileFilter: (_, file, cb) => {
    ['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.mimetype)
      ? cb(null, true) : cb(new Error('Only images allowed.'));
  }
});

const VIBES = {
  minimal:       'clean white space, subtle typography, monochromatic palette, breathing room',
  bold:          'dark dramatic backgrounds, high contrast, vibrant accent colors, strong visual hierarchy',
  glassmorphism: 'frosted glass panels, layered transparency, blur effects, light borders',
  neomorphism:   'soft shadows, extruded surfaces, muted backgrounds, tactile depth',
  brutalist:     'raw bold typography, stark contrast, asymmetric grids, minimal decoration',
  soft:          'pastel palettes, rounded corners, gentle gradients, friendly typography'
};

// Boot DB first then register all routes
initDb().then(queries => {

  app.get('/api/health', (_, res) => res.json({ status: 'ok' }));

  app.get('/api/stats', (_, res) => {
    try {
      const s = queries.getStats();
      res.json({
        totalAnalyses: s.total_analyses,
        avgScore: s.avg_score ? Math.round(s.avg_score) : null,
        uniqueSessions: s.unique_sessions
      });
    } catch { res.status(500).json({ error: 'Failed to fetch stats.' }); }
  });

  app.post('/api/analyze', upload.array('images', MAX_IMGS), async (req, res) => {
    try {
      const { prompt = '', vibe = 'bold', session_id } = req.body;
      const files = req.files || [];
      const sessionId = session_id || uuidv4();

      if (!prompt.trim() && files.length === 0)
        return res.status(400).json({ error: 'Please provide a prompt or upload at least one image.' });
      if (!VIBES[vibe])
        return res.status(400).json({ error: 'Invalid vibe.' });

      // Build prompt for Gemini
      const systemPrompt = `You are DesignBuddy, an elite UI/UX design critic. Give brutally honest, specific, actionable feedback aligned with the "${vibe}" aesthetic: ${VIBES[vibe]}.
${files.length > 0 ? `Analyze the uploaded screenshot(s) visually — comment on actual elements you can see.` : 'No images uploaded — give feedback based on the description.'}

Respond ONLY with valid JSON (absolutely no markdown, no backticks, no extra text before or after):
{
  "score": <integer 0-100, be honest — most designs score 40-70>,
  "summary": "<2-3 sentence honest overall assessment>",
  "issues": [
    {"priority": "high", "text": "<specific issue with exact actionable fix>"},
    {"priority": "high", "text": "<specific issue with exact actionable fix>"},
    {"priority": "med", "text": "<medium priority issue with fix>"},
    {"priority": "low", "text": "<minor polish issue with fix>"}
  ],
  "suggestions": [
    "<concrete quick win e.g. Increase CTA padding to 16px 32px>",
    "<concrete quick win>",
    "<concrete quick win>",
    "<concrete quick win>"
  ],
  "codeSnippet": "<a practical CSS snippet showing one key improvement, or empty string>"
}`;

      // Build parts array for Gemini (images + text)
      const parts = [];

      // Add images
      for (const file of files) {
        parts.push({
          inlineData: {
            mimeType: file.mimetype,
            data: file.buffer.toString('base64')
          }
        });
      }

      // Add text prompt
      parts.push({ text: systemPrompt + '\n\nUser request: ' + (prompt.trim() || 'Analyze this design and give detailed feedback.') });

      // Call Gemini
      const result = await model.generateContent(parts);
      const rawText = result.response.text();

      // Parse JSON response
      let parsed;
      try {
        const cleaned = rawText.replace(/```json|```/g, '').trim();
        parsed = JSON.parse(cleaned);
      } catch {
        return res.status(500).json({ error: 'AI returned unexpected format. Please try again.' });
      }

      // Save to DB
      const id = uuidv4();
      queries.insertAnalysis({
        id,
        session_id: sessionId,
        vibe,
        prompt: prompt.trim(),
        score: parsed.score ?? null,
        summary: parsed.summary ?? '',
        issues: JSON.stringify(parsed.issues ?? []),
        suggestions: JSON.stringify(parsed.suggestions ?? []),
        code_snippet: parsed.codeSnippet ?? '',
        image_count: files.length
      });

      res.json({
        id, session_id: sessionId, vibe, prompt,
        score: parsed.score, summary: parsed.summary,
        issues: parsed.issues, suggestions: parsed.suggestions,
        codeSnippet: parsed.codeSnippet,
        image_count: files.length,
        created_at: new Date().toISOString()
      });

    } catch (err) {
      console.error('Analyze error:', err);
      if (err.message?.includes('API_KEY')) return res.status(401).json({ error: 'Invalid Google API key. Check your .env file.' });
      if (err.message?.includes('quota') || err.message?.includes('429')) return res.status(429).json({ error: 'Rate limit hit. Please wait a moment.' });
      res.status(500).json({ error: err.message || 'Analysis failed. Please try again.' });
    }
  });

  app.get('/api/history', (req, res) => {
    try {
      const rows = req.query.session_id
        ? queries.getAnalysisBySession(req.query.session_id)
        : queries.getAllAnalyses();
      res.json({
        analyses: rows.map(r => ({
          ...r,
          issues: JSON.parse(r.issues || '[]'),
          suggestions: JSON.parse(r.suggestions || '[]')
        }))
      });
    } catch { res.status(500).json({ error: 'Failed to fetch history.' }); }
  });

  app.get('/api/history/:id', (req, res) => {
    try {
      const row = queries.getAnalysisById(req.params.id);
      if (!row) return res.status(404).json({ error: 'Not found.' });
      res.json({ ...row, issues: JSON.parse(row.issues || '[]'), suggestions: JSON.parse(row.suggestions || '[]') });
    } catch { res.status(500).json({ error: 'Failed.' }); }
  });

  app.delete('/api/history/:id', (req, res) => {
    try { queries.deleteAnalysis(req.params.id); res.json({ success: true }); }
    catch { res.status(500).json({ error: 'Failed.' }); }
  });

  // Serve built frontend in production
  const clientDist = path.join(__dirname, '../client/dist');
  if (fs.existsSync(clientDist)) {
    app.use(express.static(clientDist));
    app.get('*', (_, res) => res.sendFile(path.join(clientDist, 'index.html')));
  }

  app.use((err, _, res, __) => res.status(500).json({ error: err.message || 'Error.' }));

  app.listen(PORT, () => {
    console.log(`\n✦ DesignBuddy running → http://localhost:${PORT}`);
    console.log(`   Powered by Google Gemini 1.5 Flash (Free!)\n`);
  });

}).catch(err => {
  console.error('DB init failed:', err);
  process.exit(1);
});
