import { expect, test } from '@playwright/test';

for (const item of [
  { locale: 'en', path: '/en/story-club/reserve', submit: 'Reserve a seat', received: 'Payment received ✓ Mr. Jay will add you to the Saturday group on Zalo' },
  { locale: 'vi', path: '/story-club/reserve', submit: 'Đặt chỗ', received: 'Đã nhận thanh toán ✓ Thầy Jay sẽ thêm bạn vào nhóm Thứ Bảy trên Zalo' },
]) {
  test(`shows paid confirmation in ${item.locale} after mocked status polling`, async ({ page }) => {
    let statusRequests = 0;
    await page.addInitScript(() => {
      const originalSetInterval = window.setInterval.bind(window);
      window.setInterval = ((handler: TimerHandler, timeout?: number, ...args: unknown[]) =>
        originalSetInterval(handler, timeout === 20_000 ? 50 : timeout, ...args)) as typeof window.setInterval;
    });
    await page.route('**/api/event', route => route.fulfill({ status: 200, contentType: 'application/json', body: '{"ok":true}' }));
    await page.route('**/api/sample-pack', route => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true, submissionId: 'JE-SC-11111111-1111-4111-8111-111111111111', memo: 'SC-AB12CD' }) }));
    await page.route('**/api/story-club/status**', route => {
      expect(route.request().url()).toContain('memo=SC-AB12CD');
      statusRequests += 1;
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ paid: statusRequests > 1 }) });
    });

    await page.goto(item.path);
    const reject = page.getByRole('button', { name: /reject analytics|từ chối phân tích/i });
    if (await reject.isVisible().catch(() => false)) await reject.click();
    await page.locator('[name="name"]').fill('Synthetic Parent');
    await page.locator('[name="phone"]').fill('0396 085 076');
    await page.locator('[name="childAge"]').selectOption('7');
    await page.locator('[name="consent"]').check();
    await page.getByRole('button', { name: item.submit }).click();
    await expect(page.locator('[data-payment-status]')).toContainText(/checking your payment|đang kiểm tra thanh toán/i);
    await expect.poll(() => statusRequests, { timeout: 3_000, intervals: [50, 100, 250] }).toBe(2);
    await expect(page.locator('[data-payment-status]')).toHaveText(item.received);
    expect(statusRequests).toBe(2);
  });
}
