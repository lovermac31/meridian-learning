import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI } from '@google/genai';
import { checkRateLimit, createThrottleLogContext } from './_lib/requestSecurity.js';

const GEMINI_TIMEOUT_MS = 20_000;

/**
 * Vercel Serverless Function: POST /api/generate-image
 * Proxies image generation requests to Google Gemini.
 * The GEMINI_API_KEY is read from Vercel environment variables (server-side only).
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  const rateLimit = checkRateLimit(req, {
    key: 'generate-image',
    windowMs: 60 * 1000,
    max: 5,
  });

  if (!rateLimit.allowed) {
    console.warn('[generate-image] request throttled', createThrottleLogContext(
      req,
      '/api/generate-image',
      rateLimit.retryAfterSeconds,
    ));
    res.setHeader('Retry-After', String(rateLimit.retryAfterSeconds));
    return res.status(429).json({
      error: 'Too many image requests. Please wait a moment and try again.',
    });
  }

  const { prompt } = req.body || {};

  if (!prompt || typeof prompt !== 'string') {
    return res.status(400).json({ error: 'A valid prompt string is required.' });
  }

  if (prompt.length > 500) {
    return res.status(400).json({ error: 'Prompt must be 500 characters or fewer.' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(503).json({
      error: 'Gemini API key is not configured. Contact the administrator.',
    });
  }

  try {
    const ai = new GoogleGenAI({ apiKey });

    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('gemini_timeout')), GEMINI_TIMEOUT_MS),
    );

    const response = await Promise.race([
      ai.models.generateContent({
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
      }),
      timeoutPromise,
    ]);

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

    return res.status(200).json({ image: `data:image/png;base64,${imageData}` });
  } catch (err: any) {
    const isTimeout = err?.message === 'gemini_timeout';
    console.error('[API] Image generation error:', err.message || err);
    return res.status(isTimeout ? 504 : 500).json({
      error: isTimeout
        ? 'Image generation timed out. Please try again shortly.'
        : 'Image generation failed. Please try again shortly.',
    });
  }
}
