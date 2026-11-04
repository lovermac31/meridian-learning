import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';

// Execute the exact shipped bootstrap against a small event/DOM harness.
function replay(replacements: number) {
  const source = readFileSync('scripts/prerender-route-metadata.mjs', 'utf8');
  const expression = source.match(/const bootstrap =([\s\S]*?);\n  return html/)![1];
  const html = runInNewContext(expression, { src: '/assets/main-test.js' }) as string;
  const listeners: Record<string, (event?: unknown) => void> = {};
  const timers: Array<{ fn: () => void; ms: number }> = [];
  let intendedClicks = 0;
  let wrongClicks = 0;
  const button = (text: string, click: () => void, connected: boolean) => ({
    id: '', textContent: text, getAttribute: () => null, isConnected: connected, click,
  });
  const original = button('Reject analytics', () => intendedClicks++, false);
  const facebook = button('Facebook', () => wrongClicks++, true);
  const intended = Array.from({ length: replacements }, () => button('Reject analytics', () => intendedClicks++, true));
  let current = [original];
  const document = {
    readyState: 'loading', head: { appendChild() {} }, createElement: () => ({}),
    querySelectorAll: () => current, querySelector: () => null,
    addEventListener: (name: string, fn: () => void) => { listeners[name] = fn; }, removeEventListener() {},
  };
  runInNewContext(html.slice('<script>'.length, -'</script>'.length), {
    document, window: {}, setTimeout: (fn: () => void, ms: number) => timers.push({ fn, ms }),
    addEventListener: (name: string, fn: () => void) => { listeners[name] = fn; }, requestAnimationFrame() {},
  });
  listeners.click({ target: { closest: () => original }, stopPropagation() {} });
  current = [facebook, ...intended];
  listeners['je:hydrated']();
  for (const timer of timers.filter(timer => timer.ms === 0)) timer.fn();
  return { intendedClicks, wrongClicks };
}

test('pre-hydration consent tap follows its intended control after reordered DOM replacement', () => {
  assert.deepEqual(replay(1), { intendedClicks: 1, wrongClicks: 0 });
});
test('pre-hydration tap is safely dropped when the intended control disappears or becomes ambiguous', () => {
  assert.deepEqual(replay(0), { intendedClicks: 0, wrongClicks: 0 });
  assert.deepEqual(replay(2), { intendedClicks: 0, wrongClicks: 0 });
});
