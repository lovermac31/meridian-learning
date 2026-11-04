// Focus regression: WebKit's native Tab order may skip buttons. Run against a built local preview.
import { createRequire } from 'node:module';
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
const require = createRequire(import.meta.url);
const tools = process.env.BROWSER_TOOLS;
const { chromium, webkit, firefox } = require(tools ? `${tools}/playwright` : 'playwright');
const base = process.env.BASE_URL || 'http://127.0.0.1:5202';
const dir = process.env.EVIDENCE_DIR || '.regen/runs/sample-keyboard';
await fs.mkdir(dir, { recursive: true });
const results = [];
for (const [engine, api] of Object.entries({ chromium, webkit, firefox })) {
  if (process.env.BROWSER_ENGINES && !process.env.BROWSER_ENGINES.split(',').includes(engine)) continue;
  const browser = await api.launch({ headless: true, args: engine === 'chromium' ? ['--mute-audio'] : [],
    ...(engine === 'firefox' ? { firefoxUserPrefs: { 'media.volume_scale': '0.0' } } : {}) });
  try {
    for (const width of [390, 1440]) for (const locale of ['en', 'vi']) {
      const context = await browser.newContext({ viewport: { width, height: 900 }, reducedMotion: 'reduce' });
      await context.addInitScript(() => { HTMLMediaElement.prototype.play = function () { this.muted = true; return Promise.resolve(); }; });
      const page = await context.newPage();
      await page.goto(`${base}/${locale === 'vi' ? 'vi/' : ''}products/`, { waitUntil: 'networkidle' });
      const opener = page.locator('[data-sample-open="story-club"]');
      await opener.focus();
      await page.keyboard.press('Enter');
      const dialog = page.locator('[data-sample-viewer="story-club"]');
      await dialog.waitFor();
      assert.equal(await dialog.evaluate(e => e === document.activeElement), true);
      const buttons = dialog.locator('button:not([disabled]), a[href]');
      const count = await buttons.count();
      assert.ok(count >= 2);
      // Entering from the dialog, all intermediate steps, and wrapping must remain inside.
      for (let index = 0; index < count * 2; index++) {
        await page.keyboard.press('Tab');
        assert.equal(await buttons.nth(index % count).evaluate(e => e === document.activeElement), true, `${engine}/${locale}/${width}: forward ${index}`);
      }
      await page.keyboard.press('Shift+Tab');
      assert.equal(await buttons.nth((count * 2 - 2) % count).evaluate(e => e === document.activeElement), true);
      // Shift+Tab from the dialog goes to the last enabled control.
      await dialog.focus();
      await page.keyboard.press('Shift+Tab');
      assert.equal(await buttons.last().evaluate(e => e === document.activeElement), true);
      await page.keyboard.press('Escape');
      assert.equal(await dialog.count(), 0);
      assert.equal(await opener.evaluate(e => e === document.activeElement), true);
      results.push({ engine, version: browser.version(), width, locale, controls: count, forwardCycle: true, reverseEntry: true, escapeAndKeyboardOpenerRestored: true });
      await context.close();
    }
  } finally { await browser.close(); }
}
await fs.writeFile(`${dir}/sample-keyboard.json`, JSON.stringify(results, null, 2));
console.log(JSON.stringify(results));
