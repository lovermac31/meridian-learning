// Structural tests for Phase 4A observability taxonomy.
// Validates the helper's envelope shape, severity routing, PII stripping,
// and canonical event coverage. Stubs console.* so the test assertions
// can inspect emitted payloads.

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  logEvent,
  withTiming,
  CANONICAL_EVENTS,
  type EventSeverity,
} from '../api/_lib/observability.js';

type Captured = {
  method: 'info' | 'warn' | 'error';
  tag: string;
  payload: Record<string, unknown>;
};

function captureConsole(): { events: Captured[]; restore: () => void } {
  const events: Captured[] = [];
  const origInfo = console.info;
  const origWarn = console.warn;
  const origError = console.error;

  console.info = (tag: string, payload?: Record<string, unknown>) => {
    events.push({ method: 'info', tag, payload: payload ?? {} });
  };
  console.warn = (tag: string, payload?: Record<string, unknown>) => {
    events.push({ method: 'warn', tag, payload: payload ?? {} });
  };
  console.error = (tag: string, payload?: Record<string, unknown>) => {
    events.push({ method: 'error', tag, payload: payload ?? {} });
  };

  return {
    events,
    restore: () => {
      console.info = origInfo;
      console.warn = origWarn;
      console.error = origError;
    },
  };
}

test('logEvent emits canonical envelope with [obs] tag', () => {
  const cap = captureConsole();
  try {
    logEvent({
      event: 'submission_accepted',
      route: '/api/get-started',
      status: 200,
      clientHash: 'abc123def456',
    });
    assert.equal(cap.events.length, 1);
    assert.equal(cap.events[0].tag, '[obs] submission_accepted');
    assert.equal(cap.events[0].payload.event, 'submission_accepted');
    assert.equal(cap.events[0].payload.severity, 'info');
    assert.equal(cap.events[0].payload.route, '/api/get-started');
    assert.equal(cap.events[0].payload.status, 200);
    assert.equal(cap.events[0].payload.clientHash, 'abc123def456');
  } finally {
    cap.restore();
  }
});

test('default severity by event maps to correct console method', () => {
  const mapping: Array<[string, EventSeverity, 'info' | 'warn' | 'error']> = [
    ['submission_accepted', 'info', 'info'],
    ['supabase_write_succeeded', 'info', 'info'],
    ['notion_write_succeeded', 'info', 'info'],
    ['email_sent', 'info', 'info'],
    ['rate_limited', 'warn', 'warn'],
    ['rate_limit_store_error', 'warn', 'warn'],
    ['cors_origin_denied', 'warn', 'warn'],
    ['validation_failed', 'warn', 'warn'],
    ['spam_rejected', 'warn', 'warn'],
    ['operator_unauthorized', 'warn', 'warn'],
    ['operator_ip_denied', 'warn', 'warn'],
    ['supabase_write_failed', 'error', 'error'],
    ['notion_write_failed', 'error', 'error'],
    ['email_failed', 'error', 'error'],
  ];

  for (const [event, expectedSeverity, expectedMethod] of mapping) {
    const cap = captureConsole();
    try {
      logEvent({ event, route: '/test' });
      assert.equal(cap.events.length, 1, `${event} should emit exactly one event`);
      assert.equal(cap.events[0].method, expectedMethod, `${event} → ${expectedMethod}`);
      assert.equal(cap.events[0].payload.severity, expectedSeverity);
    } finally {
      cap.restore();
    }
  }
});

test('explicit severity override beats default', () => {
  const cap = captureConsole();
  try {
    logEvent({ event: 'submission_accepted', severity: 'warn', route: '/api/x' });
    assert.equal(cap.events[0].method, 'warn');
    assert.equal(cap.events[0].payload.severity, 'warn');
  } finally {
    cap.restore();
  }
});

test('unknown event name defaults to info severity (forward-compat)', () => {
  const cap = captureConsole();
  try {
    logEvent({ event: 'future_event_not_yet_defined', route: '/test' });
    assert.equal(cap.events.length, 1);
    assert.equal(cap.events[0].method, 'info');
    assert.equal(cap.events[0].payload.severity, 'info');
  } finally {
    cap.restore();
  }
});

test('PII denylist strips raw email / phone / name and tags piiStripped', () => {
  const cap = captureConsole();
  try {
    logEvent({
      event: 'submission_accepted',
      route: '/api/get-started',
      status: 200,
      submissionId: 'sub_abc123',
      // These should ALL be stripped
      email: 'bob@example.com',
      workEmail: 'bob@school.edu',
      parentEmail: 'parent@example.com',
      phone: '+1-555-1234',
      parentFullName: 'Bob Smith',
      studentFirstName: 'Alice',
      childName: 'Alice S.',
      message: 'free text user input',
      notes: 'free text notes',
      rawIp: '203.0.113.1',
      ip: '203.0.113.1',
      userAgent: 'Mozilla/5.0',
    });
    const payload = cap.events[0].payload;
    // Safe fields preserved
    assert.equal(payload.event, 'submission_accepted');
    assert.equal(payload.route, '/api/get-started');
    assert.equal(payload.status, 200);
    assert.equal(payload.submissionId, 'sub_abc123');
    // PII fields absent
    for (const k of ['email', 'workEmail', 'parentEmail', 'phone', 'parentFullName',
                     'studentFirstName', 'childName', 'message', 'notes', 'rawIp',
                     'ip', 'userAgent']) {
      assert.equal(payload[k], undefined, `${k} must be stripped`);
    }
    // piiStripped tag emitted
    assert.ok(Array.isArray(payload.piiStripped));
    const stripped = payload.piiStripped as string[];
    assert.ok(stripped.includes('email'));
    assert.ok(stripped.includes('workEmail'));
    assert.ok(stripped.includes('phone'));
    assert.ok(stripped.includes('parentFullName'));
    assert.ok(stripped.includes('childName'));
  } finally {
    cap.restore();
  }
});

test('emailDomain is allowed (not PII per project policy)', () => {
  const cap = captureConsole();
  try {
    logEvent({
      event: 'submission_accepted',
      emailDomain: 'jurassicenglish.com',
    });
    assert.equal(cap.events[0].payload.emailDomain, 'jurassicenglish.com');
    assert.equal(cap.events[0].payload.piiStripped, undefined);
  } finally {
    cap.restore();
  }
});

test('CANONICAL_EVENTS list covers all 14 documented events', () => {
  // Phase 2.1A
  assert.ok(CANONICAL_EVENTS.includes('rate_limited'));
  assert.ok(CANONICAL_EVENTS.includes('rate_limit_store_error'));
  // Phase 2.2A
  assert.ok(CANONICAL_EVENTS.includes('cors_origin_denied'));
  // Phase 4A submission lifecycle
  assert.ok(CANONICAL_EVENTS.includes('submission_accepted'));
  assert.ok(CANONICAL_EVENTS.includes('validation_failed'));
  assert.ok(CANONICAL_EVENTS.includes('spam_rejected'));
  // Phase 4A Supabase
  assert.ok(CANONICAL_EVENTS.includes('supabase_write_succeeded'));
  assert.ok(CANONICAL_EVENTS.includes('supabase_write_failed'));
  // Phase 4A Notion
  assert.ok(CANONICAL_EVENTS.includes('notion_write_succeeded'));
  assert.ok(CANONICAL_EVENTS.includes('notion_write_failed'));
  // Phase 4A email
  assert.ok(CANONICAL_EVENTS.includes('email_sent'));
  assert.ok(CANONICAL_EVENTS.includes('email_failed'));
  // Phase 4A operator boundary
  assert.ok(CANONICAL_EVENTS.includes('operator_unauthorized'));
  assert.ok(CANONICAL_EVENTS.includes('operator_ip_denied'));
  assert.equal(CANONICAL_EVENTS.length, 14);
});

test('withTiming reports ok=true and a non-negative durationMs on success', async () => {
  const cap = captureConsole();
  try {
    let observedMs = -1;
    let observedOk = false;
    const result = await withTiming(
      async () => 'done',
      (ms, ok) => {
        observedMs = ms;
        observedOk = ok;
      },
    );
    assert.equal(result, 'done');
    assert.equal(observedOk, true);
    assert.ok(observedMs >= 0);
  } finally {
    cap.restore();
  }
});

test('withTiming reports ok=false and rethrows on error', async () => {
  const cap = captureConsole();
  try {
    let observedOk: boolean | null = null;
    let thrown = false;
    try {
      await withTiming(
        async () => {
          throw new Error('boom');
        },
        (_ms, ok) => {
          observedOk = ok;
        },
      );
    } catch (err) {
      thrown = true;
      assert.equal((err as Error).message, 'boom');
    }
    assert.equal(thrown, true);
    assert.equal(observedOk, false);
  } finally {
    cap.restore();
  }
});

test('extra fields beyond the documented shape are preserved (open-ended whitelist)', () => {
  const cap = captureConsole();
  try {
    logEvent({
      event: 'supabase_write_succeeded',
      table: 'je_leads',
      reason: 'created',
      submissionId: 'sub_xyz',
      // Open-ended extension fields
      retryCount: 0,
      cacheHit: true,
    });
    const p = cap.events[0].payload;
    assert.equal(p.table, 'je_leads');
    assert.equal(p.reason, 'created');
    assert.equal(p.submissionId, 'sub_xyz');
    assert.equal(p.retryCount, 0);
    assert.equal(p.cacheHit, true);
  } finally {
    cap.restore();
  }
});
