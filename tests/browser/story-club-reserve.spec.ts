import { mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { expect, test } from '@playwright/test';

const cases = [
  { locale: 'vi', path: '/story-club/reserve', width: 375, sample: 'Đọc thử Truyện 1 miễn phí trước', price: '590.000₫' },
  { locale: 'en', path: '/en/story-club/reserve', width: 375, sample: 'Read a free Story 1 first', price: '590,000₫' },
  { locale: 'vi', path: '/story-club/reserve', width: 1440, sample: 'Đọc thử Truyện 1 miễn phí trước', price: '590.000₫' },
  { locale: 'en', path: '/en/story-club/reserve', width: 1440, sample: 'Read a free Story 1 first', price: '590,000₫' },
] as const;

test('reserve funnel is localized, validates Zalo, submits to the existing endpoint and shows fallback payment instructions', async ({ page }) => {
  const shots = resolve('docs/qa/story-club-reserve');
  await mkdir(shots, { recursive: true });
  const events: string[] = [];
  let leadRequests = 0;
  await page.route('**/api/event', async route => {
    try { events.push(String(JSON.parse(route.request().postData() ?? '{}').event)); } catch { /* malformed telemetry remains ignored */ }
    await route.fulfill({ status: 200, contentType: 'application/json', body: '{"ok":true}' });
  });
  await page.route('**/api/sample-pack', async route => {
    leadRequests += 1;
    const body = JSON.parse(route.request().postData() ?? '{}') as Record<string, unknown>;
    expect(body.product).toBe('story-club');
    expect(body.submissionKey).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
    expect(body.group).toBe(cases[leadRequests - 1].width === 375 ? 'sat-0900' : 'flexible');
    expect(body.utm_source).toBe('reserve');
    expect(body.utm_content).toBe('story-club-reserve');
    expect(body.utm_medium).toBe('social');
    expect(body.utm_campaign).toBe('autumn');
    expect(body.utm_term).toBe('story time');
    expect(body.phone).toBe('+84396085076');
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true, submissionId: 'JE-SP-TEST-AB12CD', memo: 'SC-AB12CD' }) });
  });

  for (const item of cases) {
    const viewsBefore = events.filter(event => event === 'reserve_view').length;
    const submitsBefore = events.filter(event => event === 'reserve_submit').length;
    const paymentBefore = events.filter(event => event === 'pay_instructions_shown').length;
    await page.setViewportSize({ width: item.width, height: 900 });
    await page.goto(`${item.path}?utm_source=reserve&utm_content=story-club-reserve&utm_medium=social&utm_campaign=autumn&utm_term=story%20time`);
    await expect.poll(() => events.filter(event => event === 'reserve_view').length).toBe(viewsBefore + 1);
    const rejectAnalytics = page.getByRole('button', { name: item.locale === 'vi' ? 'Từ chối phân tích' : 'Reject analytics' });
    if (await rejectAnalytics.isVisible().catch(() => false)) await rejectAnalytics.click();
    await expect(page.locator('[data-story-club-reserve]')).toHaveAttribute('lang', item.locale);
    const nextGroup = item.locale === 'vi' ? 'Thứ Bảy 9:00' : 'Sat 9:00';
    const flexibleGroup = item.locale === 'vi' ? 'Thời gian khác / vui lòng liên hệ' : 'Another time / please ask me';
    await expect(page.getByText(`${item.locale === 'vi' ? 'Nhóm tiếp theo:' : 'Next group:'} ${nextGroup}`, { exact: true })).toBeVisible();
    const group = page.locator('[name="group"]');
    await expect(group.locator('option')).toHaveText([nextGroup, flexibleGroup]);
    await expect(group.locator('option').nth(0)).toHaveAttribute('value', 'sat-0900');
    await expect(group.locator('option').nth(1)).toHaveAttribute('value', 'flexible');
    await expect(group).toHaveValue('sat-0900');
    if (item.width === 1440) await group.selectOption('flexible');
    const sample = page.locator('[data-reserve-sample]');
    const price = page.locator('[data-reserve-price]');
    await expect(sample).toContainText(item.sample);
    expect((await sample.boundingBox())!.y).toBeLessThan((await price.boundingBox())!.y);
    expect(await sample.getAttribute('href')).toContain('mina-and-the-midnight-drum#mina-and-the-midnight-drum');
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.screenshot({ path: resolve(shots, `${item.width}-${item.locale}-first.png`), fullPage: true });

    await page.locator('[name="name"]').fill('Synthetic Parent');
    await page.locator('[name="phone"]').fill('12345');
    await page.locator('[name="childAge"]').selectOption('7');
    await page.locator('[name="consent"]').check();
    await page.getByRole('button', { name: item.locale === 'vi' ? 'Đặt chỗ' : 'Reserve a seat' }).click();
    await expect(page.getByRole('alert')).toBeVisible();
    expect(leadRequests).toBe(cases.indexOf(item));

    await page.locator('[name="phone"]').fill('0396 085 076');
    await page.getByRole('button', { name: item.locale === 'vi' ? 'Đặt chỗ' : 'Reserve a seat' }).click();
    await expect(page.locator('[data-payment-instructions]')).toBeVisible();
    await expect.poll(() => events.filter(event => event === 'reserve_submit').length).toBe(submitsBefore + 1);
    await expect.poll(() => events.filter(event => event === 'pay_instructions_shown').length).toBe(paymentBefore + 1);
    await expect(page.locator('[data-transfer-memo]')).toHaveText('SC-AB12CD');
    await expect(page.locator('#reserve-qr-fallback')).toBeVisible();
    await expect(page.locator('[data-after-submit-zalo]')).toHaveAttribute('href', '/go/zalo?utm_source=reserve&utm_content=after-submit');
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.screenshot({ path: resolve(shots, `${item.width}-${item.locale}-payment.png`), fullPage: true });
  }
  expect(leadRequests).toBe(4);
  expect(events.filter(event => event === 'reserve_view')).toHaveLength(4);
  expect(events.filter(event => event === 'reserve_submit')).toHaveLength(4);
  expect(events.filter(event => event === 'pay_instructions_shown')).toHaveLength(4);
});
