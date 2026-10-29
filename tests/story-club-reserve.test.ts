import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { STORY_CLUB_NEXT_GROUP, STORY_CLUB_SAMPLE_URL } from '../src/config/storyClubReserve';
import { createStoryClubTransferMemo, validateStoryClubReserve } from '../src/lib/storyClubReserve';
import { getExpectedPublicIndexableRoutes, resolveRouteMetadata } from '../src/lib/routeMetadata';
import { resolveLocalizedRoute, getLocalizedPathname } from '../src/i18n/routing';

test('Story Club reserve validates name, Vietnam Zalo, age and configured group', () => {
  const valid = { name: 'Synthetic Parent', phone: '0396 085 076', childAge: '7', group: 'sat-0900' };
  assert.equal(validateStoryClubReserve(valid), null);
  assert.equal(validateStoryClubReserve({ ...valid, phone: '12345' }), 'phone');
  assert.equal(validateStoryClubReserve({ ...valid, childAge: '9' }), 'age');
  assert.equal(validateStoryClubReserve({ ...valid, group: 'unlisted' }), 'group');
  assert.equal(validateStoryClubReserve({ ...valid, name: ' ' }), 'name');
});

test('payment memo is a bounded SC-prefixed short ID', () => {
  assert.equal(createStoryClubTransferMemo('test-ab12cd'), 'SC-TESTAB12');
  assert.throws(() => createStoryClubTransferMemo('???'), /at least four/);
  assert.equal(STORY_CLUB_NEXT_GROUP, 'Sat 9:00');
});

test('reserve routes use campaign URLs and have indexable localized metadata', () => {
  assert.equal(resolveLocalizedRoute('/story-club/reserve').locale, 'vi');
  assert.equal(resolveLocalizedRoute('/en/story-club/reserve').locale, 'en');
  assert.equal(getLocalizedPathname('/story-club/reserve', 'vi'), '/story-club/reserve');
  assert.equal(getLocalizedPathname('/story-club/reserve', 'en'), '/en/story-club/reserve');
  for (const path of ['/story-club/reserve', '/en/story-club/reserve']) {
    assert.ok(getExpectedPublicIndexableRoutes().includes(path));
    assert.equal(resolveRouteMetadata(path).robots, 'index, follow');
  }
  assert.match(STORY_CLUB_SAMPLE_URL, /mina-and-the-midnight-drum#mina-and-the-midnight-drum$/);
});

test('anonymous event migration adds only the three reserve funnel event types', () => {
  const sql = readFileSync('supabase/migrations/20261029000001_story_club_reserve_events.sql', 'utf8');
  for (const event of ['reserve_view', 'reserve_submit', 'pay_instructions_shown']) assert.match(sql, new RegExp(`'${event}'`));
  assert.match(sql, /drop constraint je_events_event_check/);
  assert.match(sql, /add constraint je_events_event_check check/);
  assert.doesNotMatch(sql, /create policy|enable row level security|grant execute/i);
});
