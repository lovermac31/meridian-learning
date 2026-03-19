import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

// Load environment variables from .env.local (local dev) or .env (production fallback)
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

const app = express();
const PORT = parseInt(process.env.PORT || '3001', 10);
const __dirname = path.dirname(fileURLToPath(import.meta.url));

app.use(express.json({ limit: '1mb' }));

// --- API Routes ---

/**
 * POST /api/generate-image
 * Accepts: { prompt: string }
 * Returns: { image: string (base64 data URI) } or { error: string }
 *
 * The Gemini API key is read from process.env on the server.
 * It is NEVER sent to or accessible from the client.
 */
app.post('/api/generate-image', async (req, res) => {
  const { prompt } = req.body;

  if (!prompt || typeof prompt !== 'string') {
    return res.status(400).json({ error: 'A valid prompt string is required.' });
  }

  if (prompt.length > 500) {
    return res.status(400).json({ error: 'Prompt must be 500 characters or fewer.' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return res.status(503).json({
      error: 'Gemini API key is not configured on the server. Contact the administrator.',
    });
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash-preview-image-generation',
      contents: {
        parts: [
          {
            text: `A professional, high-quality educational illustration for the Jurassic English framework. Theme: ${prompt}. Style: Cinematic, evocative, detailed, academic yet imaginative.`,
          },
        ],
      },
      config: {
        responseModalities: ['Text', 'Image'],
        imageConfig: {
          aspectRatio: '16:9',
        },
      },
    });

    let imageData: string | null = null;
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        imageData = part.inlineData.data ?? null;
        break;
      }
    }

    if (!imageData) {
      return res.status(422).json({ error: 'No image was generated. Try a different prompt.' });
    }

    return res.json({ image: `data:image/png;base64,${imageData}` });
  } catch (err: any) {
    console.error('[API] Image generation error:', err.message || err);
    return res.status(500).json({
      error: 'Image generation failed. Please try again shortly.',
    });
  }
});

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// --- Static file serving (production only) ---
if (process.env.NODE_ENV === 'production') {
  const distPath = path.resolve(__dirname, 'dist');
  app.use(express.static(distPath));

  // SPA fallback: serve index.html for all non-API routes
  app.get('*', (_req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`[Server] Running on http://localhost:${PORT}`);
  console.log(`[Server] Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`[Server] Gemini key configured: ${!!process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY'}`);
});
