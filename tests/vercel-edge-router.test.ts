import assert from 'node:assert/strict';
import test from 'node:test';
import { compileVercelSource, expandVercelDestination, matchVercelSource } from '../src/server/vercelEdgeRouter.js';

test('Vercel wildcard path parameters match both the base path and nested routes', () => {
  const { regex } = compileVercelSource('/ai-speaking/:path*');
  assert.equal(regex.exec('/ai-speaking')?.groups?.path, undefined);
  assert.equal(regex.exec('/ai-speaking/pricing')?.groups?.path, 'pricing');
  assert.equal(regex.exec('/ai-speaking/samples/basic')?.groups?.path, 'samples/basic');
});

test('wildcard destination expansion does not leave Vercel parameter syntax behind', () => {
  const base = matchVercelSource('/student-academy/:path*', '/student-academy');
  const nested = matchVercelSource('/student-academy/:path*', '/student-academy/pricing');
  assert.ok(base);
  assert.ok(nested);
  assert.equal(expandVercelDestination('https://upstream.example/student-academy/:path*', base), 'https://upstream.example/student-academy/');
  assert.equal(expandVercelDestination('https://upstream.example/student-academy/:path*', nested), 'https://upstream.example/student-academy/pricing');
});

test('Vercel constrained parameters preserve the route path and reject empty matches', () => {
  const { regex } = compileVercelSource('/ai-speaking/:path(.+)/');
  assert.equal(regex.test('/ai-speaking/samples/'), true);
  assert.equal(regex.test('/ai-speaking/'), false);
});

test('Vercel negative-lookahead headers can exclude AI Speaking routes', () => {
  const { regex } = compileVercelSource('/((?!ai-speaking).*)');
  assert.equal(regex.test('/'), true);
  assert.equal(regex.test('/student-academy'), true);
  assert.equal(regex.test('/ai-speaking'), false);
});
