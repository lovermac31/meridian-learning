import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import {
  checkRateLimit,
  createThrottleLogContext,
  getEmailDomain,
} from './api/_lib/requestSecurity.js';
import { sendGetStartedNotification } from './lib/getStartedNotification';
import { sendPricingRegistrationNotification } from './api/_lib/pricingRegistrationNotification';
import {
  coerceGetStartedFormValues,
  normalizeGetStartedPayload,
  validateGetStartedPayload,
} from './src/lib/getStartedSchema';
import {
  coercePricingRegistrationValues,
  normalizePricingRegistration,
  validatePricingRegistration,
} from './src/lib/pricingRegistrationSchema';

// Load environment variables from .env.local (local dev) or .env (production fallback)
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

const app = express();
const PORT = parseInt(process.env.PORT || '3001', 10);
const __dirname = path.dirname(fileURLToPath(import.meta.url));

app.use(express.json({ limit: '1mb' }));

const MIN_SUBMISSION_DELAY_MS = 1500;
const MAX_SUBMISSION_AGE_MS = 1000 * 60 * 60 * 8;

function isSpamSubmission(startedAt: string, website: string) {
  if (website.trim().length > 0) return true;
  if (!startedAt) return true;

  const startedTime = new Date(startedAt).getTime();
  if (Number.isNaN(startedTime)) return true;

  const elapsed = Date.now() - startedTime;
  return elapsed < MIN_SUBMISSION_DELAY_MS || elapsed > MAX_SUBMISSION_AGE_MS;
}

function createGetStartedLogContext(submission: ReturnType<typeof normalizeGetStartedPayload>) {
  return {
    submissionId: submission.submissionId,
    submittedAt: submission.submittedAt,
    primaryInterest: submission.primaryInterest,
    organizationType: submission.organizationType,
    hasRoleTitle: Boolean(submission.roleTitle),
    hasCountryRegion: Boolean(submission.countryRegion),
    hasAgeRange: Boolean(submission.ageRange),
    hasLearnerCount: Boolean(submission.learnerCount),
    hasStandardsContext: Boolean(submission.standardsContext),
    hasTimeline: Boolean(submission.timeline),
    hasDecisionStage: Boolean(submission.decisionStage),
    hasSuccessDefinition: Boolean(submission.successDefinition),
    hasNotes: Boolean(submission.notes),
    newsletterOptIn: submission.newsletterOptIn,
    emailDomain: getEmailDomain(submission.workEmail),
  };
}

function createPricingLogContext(registration: ReturnType<typeof normalizePricingRegistration>) {
  return {
    submissionId: registration.submissionId,
    submittedAt: registration.submittedAt,
    buyerType: registration.buyerType,
    interestArea: registration.interestArea,
    hasOrganizationSize: Boolean(registration.organizationSize),
    hasPhoneWhatsapp: Boolean(registration.phoneWhatsapp),
    hasPreferredContactMethod: Boolean(registration.preferredContactMethod),
    hasTimeline: Boolean(registration.timeline),
    hasMessage: Boolean(registration.message),
    emailDomain: getEmailDomain(registration.workEmail),
  };
}

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
  const rateLimit = checkRateLimit(req, {
    key: 'generate-image',
    windowMs: 60 * 1000,
    max: 5,
  });

  if (!rateLimit.allowed) {
    console.warn('[API] Image generation throttled', createThrottleLogContext(
      req,
      '/api/generate-image',
      rateLimit.retryAfterSeconds,
    ));
    res.setHeader('Retry-After', String(rateLimit.retryAfterSeconds));
    return res.status(429).json({
      error: 'Too many image requests. Please wait a moment and try again.',
    });
  }

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

app.post('/api/get-started', async (req, res) => {
  const rateLimit = checkRateLimit(req, {
    key: 'get-started',
    windowMs: 10 * 60 * 1000,
    max: 5,
  });

  if (!rateLimit.allowed) {
    console.warn('[API] Get Started request throttled', createThrottleLogContext(
      req,
      '/api/get-started',
      rateLimit.retryAfterSeconds,
    ));
    res.setHeader('Retry-After', String(rateLimit.retryAfterSeconds));
    return res.status(429).json({
      ok: false,
      error: 'Too many submissions were received from this connection. Please wait a few minutes and try again.',
    });
  }

  const values = coerceGetStartedFormValues(req.body);

  if (isSpamSubmission(values.startedAt, values.website)) {
    return res.status(400).json({ ok: false, error: 'Submission could not be accepted.' });
  }

  const errors = validateGetStartedPayload(values);
  if (Object.keys(errors).length > 0) {
    return res.status(400).json({
      ok: false,
      error: 'Please review the required fields and try again.',
      fieldErrors: errors,
    });
  }

  const submission = normalizeGetStartedPayload(values);
  const notification = await sendGetStartedNotification(submission);

  console.info('[API] Get Started submission received:', {
    ...createGetStartedLogContext(submission),
    notificationStatus: notification.status,
  });

  if (notification.status !== 'sent') {
    console.warn('[API] Get Started notification fallback:', {
      submissionId: submission.submissionId,
      notification,
    });
  }

  return res.status(200).json({
    ok: true,
    submissionId: submission.submissionId,
  });
});

app.post('/api/pricing-registration', async (req, res) => {
  const rateLimit = checkRateLimit(req, {
    key: 'pricing-registration',
    windowMs: 10 * 60 * 1000,
    max: 5,
  });

  if (!rateLimit.allowed) {
    console.warn('[API] Pricing registration throttled', createThrottleLogContext(
      req,
      '/api/pricing-registration',
      rateLimit.retryAfterSeconds,
    ));
    res.setHeader('Retry-After', String(rateLimit.retryAfterSeconds));
    return res.status(429).json({
      ok: false,
      error: 'Too many submissions were received from this connection. Please wait a few minutes and try again.',
    });
  }

  const values = coercePricingRegistrationValues(req.body);

  if (isSpamSubmission(values.startedAt, values.website)) {
    return res.status(400).json({ ok: false, error: 'Submission could not be accepted.' });
  }

  const errors = validatePricingRegistration(values);
  if (Object.keys(errors).length > 0) {
    return res.status(400).json({
      ok: false,
      error: 'Please review the required fields and try again.',
      fieldErrors: errors,
    });
  }

  const registration = normalizePricingRegistration(values);
  const notification = await sendPricingRegistrationNotification(registration);

  console.info('[API] Pricing registration received:', {
    ...createPricingLogContext(registration),
    notificationStatus: notification.status,
  });

  if (notification.status !== 'sent') {
    console.warn('[API] Pricing registration notification fallback:', {
      submissionId: registration.submissionId,
      notification,
    });
  }

  if (notification.status === 'skipped') {
    return res.status(503).json({
      ok: false,
      error:
        'Plans & Pricing registration is temporarily unavailable. Please email info@jurassicenglish.com directly.',
    });
  }

  if (notification.status === 'failed') {
    return res.status(502).json({
      ok: false,
      error:
        'We could not deliver your registration just now. Please try again shortly or email info@jurassicenglish.com directly.',
    });
  }

  return res.status(200).json({
    ok: true,
    submissionId: registration.submissionId,
  });
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
