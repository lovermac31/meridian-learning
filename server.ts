import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import {
  checkRateLimit,
  createThrottleLogContext,
  getEmailDomain,
} from './api/_lib/requestSecurity.js';
import { applyCors, handlePreflight } from './api/_lib/corsSecurity.js';
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

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.options('/api/get-started', (req, res) => { handlePreflight(req, res); });
app.post('/api/get-started', async (req, res) => {
  applyCors(req, res);
  const rateLimit = await checkRateLimit(req, {
    key: 'get-started',
    windowMs: 10 * 60 * 1000,
    max: 5,
    failMode: 'closed',
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

app.options('/api/pricing-registration', (req, res) => { handlePreflight(req, res); });
app.post('/api/pricing-registration', async (req, res) => {
  applyCors(req, res);
  const rateLimit = await checkRateLimit(req, {
    key: 'pricing-registration',
    windowMs: 10 * 60 * 1000,
    max: 5,
    failMode: 'closed',
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
});
